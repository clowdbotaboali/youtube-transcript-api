const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'api', 'index.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Constants
const constMarker = "const ADMIN_DEFAULT_USERNAME = 'admin';";
const paymobConstants = `
// Paymob Integration Constants
const PAYMOB_API_KEY = String(process.env.PAYMOB_API_KEY || '').trim();
const PAYMOB_HMAC_SECRET = String(process.env.PAYMOB_HMAC_SECRET || '').trim();
const PAYMOB_INTEGRATION_ID = String(process.env.PAYMOB_INTEGRATION_ID || '4876023').trim();
const PAYMOB_IFRAME_ID = String(process.env.PAYMOB_IFRAME_ID || '881194').trim();
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
`;

if (!content.includes('PAYMOB_API_KEY =')) {
  content = content.replace(constMarker, constMarker + '\n' + paymobConstants);
}

// 2. Add Endpoints
const routeMarker = "if (pathname === '/api/chat/clear' && req.method === 'POST') {";
const paymobRoutes = `
    if (pathname === '/api/paymob/create-checkout' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) return res.status(500).json({ success: false, error: 'Database not configured' });
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);

      const packs = Number(body.packCount || 0);
      if (!Number.isFinite(packs) || packs < 1 || !Number.isInteger(packs)) {
        return sendError(res, 400, 'INVALID_INPUT', 'Invalid pack count');
      }

      const amountCents = packs * TOPUP_PACK_PRICE_CENTS;
      const baseVideos = packs * TOPUP_PACK_VIDEOS;
      const bonusRate = TOPUP_BONUS_PACKS.has(packs) ? TOPUP_BONUS_RATE : 0;
      const bonusVideos = Math.round(baseVideos * bonusRate);
      const creditsAdded = baseVideos + bonusVideos;

      // 1. Create pending payment
      const { data: paymentRecord, error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount_cents: amountCents,
          credits_added: creditsAdded,
          status: 'pending',
          payment_method: 'paymob_card',
          notes: \`Paymob Checkout for \${packs} packs\`
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      const merchantOrderId = paymentRecord.id;

      // 2. Auth with Paymob
      const authRes = await fetch(\`\${PAYMOB_BASE_URL}/auth/tokens\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: PAYMOB_API_KEY })
      });
      const authData = await authRes.json();
      if (!authData.token) return sendError(res, 500, 'PAYMOB_ERROR', 'Failed to authenticate with Paymob');

      // 3. Register Order
      const orderRes = await fetch(\`\${PAYMOB_BASE_URL}/ecommerce/orders\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authData.token,
          delivery_needed: 'false',
          amount_cents: amountCents.toString(),
          currency: 'EGP',
          merchant_order_id: merchantOrderId,
          items: [{
            name: \`\${creditsAdded} Videos Pack\`,
            amount_cents: amountCents.toString(),
            description: \`Transcripta AI - \${packs} Packs\`,
            quantity: '1'
          }]
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.id) return sendError(res, 500, 'PAYMOB_ERROR', 'Failed to register order with Paymob');

      // 4. Generate Payment Key
      const keyRes = await fetch(\`\${PAYMOB_BASE_URL}/acceptance/payment_keys\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authData.token,
          amount_cents: amountCents.toString(),
          expiration: 3600,
          order_id: orderData.id,
          billing_data: {
            apartment: "NA", email: user.email || "user@transcripta.tech", floor: "NA", first_name: "Transcripta",
            street: "NA", building: "NA", phone_number: "+201000000000", shipping_method: "NA", postal_code: "NA",
            city: "NA", country: "EG", last_name: "Customer", state: "NA"
          },
          currency: 'EGP',
          integration_id: PAYMOB_INTEGRATION_ID,
          lock_order_when_paid: "false"
        })
      });
      const keyData = await keyRes.json();
      if (!keyData.token) return sendError(res, 500, 'PAYMOB_ERROR', 'Failed to generate payment key');

      // 5. Return Iframe URL
      const iframeUrl = \`\${PAYMOB_BASE_URL}/acceptance/iframes/\${PAYMOB_IFRAME_ID}?payment_token=\${keyData.token}\`;
      return res.json({ success: true, url: iframeUrl });
    }

    if (pathname === '/api/paymob/webhook' && req.method === 'POST') {
      const hmacSecret = PAYMOB_HMAC_SECRET;
      
      // Paymob might send HMAC in header or query
      const hmacQuery = Array.isArray(req.query?.hmac) ? req.query.hmac[0] : req.query?.hmac;
      const hmacHeader = req.headers['hmac'];
      
      const obj = body?.obj || {};
      const components = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order?.id,
        obj.owner,
        obj.pending,
        obj.source_data?.pan,
        obj.source_data?.sub_type,
        obj.source_data?.type,
        obj.success
      ];
      
      const concatenatedString = components.map(v => {
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        if (v === undefined || v === null) return '';
        return String(v);
      }).join('');
      
      const calculatedHmac = crypto.createHmac('sha512', hmacSecret).update(concatenatedString).digest('hex');
      
      if (calculatedHmac !== hmacQuery && calculatedHmac !== hmacHeader) {
        console.error('Invalid HMAC signature', { providedHmac: hmacQuery || hmacHeader, generated: calculatedHmac });
        return sendError(res, 403, 'UNAUTHORIZED', 'Invalid HMAC signature');
      }

      if (body?.type === 'TRANSACTION') {
        const merchantOrderId = obj.order?.merchant_order_id;
        
        // Prevent duplicate processing
        if (merchantOrderId && obj.success === true) {
          const supabaseAdmin = createClient(
            String(process.env.SUPABASE_URL || '').trim(),
            String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
          );
          
          const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('id', merchantOrderId).single();
          if (payment && payment.status === 'pending') {
            const { error: updateError } = await supabaseAdmin.from('payments')
              .update({ status: 'completed', transfer_reference: String(obj.id) }).eq('id', payment.id);
            if (!updateError) {
               const { data: userRaw } = await supabaseAdmin.from('users').select('credits').eq('id', payment.user_id).single();
               if (userRaw) {
                 await supabaseAdmin.from('users').update({ credits: (userRaw.credits || 0) + payment.credits_added }).eq('id', payment.user_id);
               }
            }
          }
        } else if (merchantOrderId && obj.success === false) {
           const supabaseAdmin = createClient(
            String(process.env.SUPABASE_URL || '').trim(),
            String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
          );
          // Update status to failed
          await supabaseAdmin.from('payments').update({ status: 'failed', transfer_reference: String(obj.id) }).eq('id', merchantOrderId).eq('status', 'pending');
        }
      }
      return res.json({ success: true });
    }

`;

if (!content.includes('/api/paymob/create-checkout')) {
  // Use regex split/join to safely inject code
  const parts = content.split(routeMarker);
  if (parts.length === 2) {
    fs.writeFileSync(targetPath, parts[0] + paymobRoutes + routeMarker + parts[1]);
    console.log('Successfully patched api/index.js with Paymob endpoints');
  } else {
    console.error('Marker not found strictly once');
    process.exit(1);
  }
} else {
  console.log('Endpoints already exist');
}
