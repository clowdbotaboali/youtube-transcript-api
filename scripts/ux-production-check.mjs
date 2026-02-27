import fs from 'node:fs';

function readEnv(filePath) {
  const out = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
  }
  return out;
}

async function jsonOrEmpty(response) {
  return response.json().catch(() => ({}));
}

const env = readEnv('frontend/.env');
const appBase = process.env.APP_BASE_URL || 'https://youtube-transcript-api-lilac.vercel.app';
const supabaseUrl = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase config. Provide SUPABASE_URL and SUPABASE_ANON_KEY or set them in frontend/.env');
  process.exit(1);
}

const results = [];
const add = (name, ok, details) => results.push({ name, ok, details });

try {
  const home = await fetch(appBase);
  add('home_load', home.status === 200, `status=${home.status}`);
} catch (error) {
  add('home_load', false, error.message);
}

try {
  const extract = await fetch(`${appBase}/api/transcript/extract`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=uOZPwzY4VmU' })
  });
  const body = await jsonOrEmpty(extract);
  add('extract_transcript', extract.ok && body.success, `status=${extract.status}; method=${body.method || 'n/a'}`);
} catch (error) {
  add('extract_transcript', false, error.message);
}

try {
  const chat = await fetch(`${appBase}/api/chat/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ transcript: 'هذا نص قصير للتجربة', message: 'لخص' })
  });
  const body = await jsonOrEmpty(chat);
  add('chat', chat.ok && body.success && typeof body.response === 'string', `status=${chat.status}`);
} catch (error) {
  add('chat', false, error.message);
}

try {
  const ai = await fetch(`${appBase}/api/ai/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ transcript: 'test', type: 'summary' })
  });
  add('ai_process_unauth', ai.status === 401, `status=${ai.status}`);
} catch (error) {
  add('ai_process_unauth', false, error.message);
}

try {
  const topup = await fetch(`${appBase}/api/billing/create-topup-request`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ credits: 50, amountCents: 500, method: 'instapay' })
  });
  add('topup_unauth', topup.status === 401, `status=${topup.status}`);
} catch (error) {
  add('topup_unauth', false, error.message);
}

const suffix = Date.now();
const testEmail = `ux.${suffix}@mailinator.com`;
const testPassword = `UxCheck!${String(suffix).slice(-6)}`;

try {
  const signup = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  const body = await jsonOrEmpty(signup);
  const hasUser = !!(body.user?.id || body.id);
  const rateLimited = body.error_code === 'over_email_send_rate_limit';
  add(
    'signup',
    (signup.ok && hasUser) || rateLimited,
    `status=${signup.status}; code=${body.error_code || 'none'}; session=${body.session ? 'present' : 'none'}`
  );
} catch (error) {
  add('signup', false, error.message);
}

try {
  const signin = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  const body = await jsonOrEmpty(signin);
  const message = String(body.msg || body.error_description || '');
  const lower = message.toLowerCase();
  const expectedGate = lower.includes('email not confirmed') || lower.includes('invalid login credentials');
  add('signin_behavior', signin.ok || expectedGate, `status=${signin.status}; message=${message || 'n/a'}`);
} catch (error) {
  add('signin_behavior', false, error.message);
}

try {
  const recover = await fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ email: testEmail, redirect_to: appBase })
  });
  const body = await jsonOrEmpty(recover);
  const rateLimited = body.error_code === 'over_email_send_rate_limit';
  add('forgot_password', recover.ok || rateLimited, `status=${recover.status}; code=${body.error_code || 'none'}`);
} catch (error) {
  add('forgot_password', false, error.message);
}

const output = {
  testedAt: new Date().toISOString(),
  appBase,
  testEmail,
  passed: results.filter((item) => item.ok).length,
  total: results.length,
  results
};

console.log(JSON.stringify(output, null, 2));
