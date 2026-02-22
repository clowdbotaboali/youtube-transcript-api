import express from 'express';
import { supabase } from '../utils/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const ALLOWED_METHODS = new Set(['instapay', 'vodafone_cash']);

router.post('/create-topup-request', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { credits, amountCents, method, payerContact, transferReference, notes } = req.body || {};

    if (!ALLOWED_METHODS.has(method)) {
      return res.status(400).json({ success: false, error: 'Invalid payment method' });
    }

    if (!Number.isInteger(credits) || credits < 1) {
      return res.status(400).json({ success: false, error: 'Invalid credits value' });
    }

    if (!Number.isInteger(amountCents) || amountCents < 1) {
      return res.status(400).json({ success: false, error: 'Invalid amount value' });
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          amount_cents: amountCents,
          credits_added: credits,
          status: 'pending',
          payment_method: method,
          payer_contact: payerContact || null,
          transfer_reference: transferReference || null,
          notes: notes || null
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      request: data
    });
  } catch (error) {
    console.error('create-topup-request error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create top-up request' });
  }
});

router.get('/my-requests', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('my-requests error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load payment requests' });
  }
});

export default router;
