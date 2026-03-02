const edgeRateLimitStore = globalThis.__edgeRateLimitStore || new Map();
globalThis.__edgeRateLimitStore = edgeRateLimitStore;

const EDGE_RULES = {
  signup: { limit: 3, windowMs: 30 * 24 * 60 * 60 * 1000 },
  login: { limit: 10, windowMs: 10 * 60 * 1000 }
};

export const config = {
  matcher: ['/dashboard/:path*', '/api/transcript/:path*', '/api/transcripts/:path*', '/api/auth/signup', '/api/auth/login']
};

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function consumeRateLimit(ruleName, identity) {
  const rule = EDGE_RULES[ruleName];
  if (!rule) return { allowed: true, remaining: Infinity, resetAt: Date.now() };
  const key = `${ruleName}:${String(identity || '').trim()}`;
  const now = Date.now();
  const entry = edgeRateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    edgeRateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(rule.limit - 1, 0), resetAt };
  }

  if (entry.count >= rule.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  edgeRateLimitStore.set(key, entry);
  return { allowed: true, remaining: Math.max(rule.limit - entry.count, 0), resetAt: entry.resetAt };
}

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

function parseCookies(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (!cookieHeader) return {};
  const out = {};
  for (const chunk of cookieHeader.split(';')) {
    const [rawKey, ...rawValue] = chunk.split('=');
    const key = String(rawKey || '').trim();
    if (!key) continue;
    out[key] = decodeURIComponent(rawValue.join('=').trim());
  }
  return out;
}

function getAccessTokenFromRequest(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const bearer = auth.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(request);
  return String(cookies.sb_access_token || cookies['sb-access-token'] || '').trim();
}

async function verifySupabaseToken(accessToken) {
  const token = String(accessToken || '').trim();
  if (!token) return { ok: false, reason: 'missing_token' };

  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  if (!supabaseUrl || !anonKey) return { ok: false, reason: 'server_misconfigured' };

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!response.ok) return { ok: false, reason: 'invalid_token' };
    const user = await response.json().catch(() => null);
    if (!user?.id) return { ok: false, reason: 'invalid_user' };
    const verified = Boolean(user.email_confirmed_at || user.confirmed_at);
    if (!verified) return { ok: false, reason: 'email_not_verified' };
    return { ok: true, user };
  } catch {
    return { ok: false, reason: 'verification_failed' };
  }
}

function rateLimitedResponse(check) {
  const retryAfter = Math.max(Math.ceil((Number(check.resetAt || Date.now()) - Date.now()) / 1000), 1);
  return json(
    429,
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests from this IP. Please try again later.'
      }
    },
    {
      'x-ratelimit-remaining': String(Math.max(Number(check.remaining || 0), 0)),
      'retry-after': String(retryAfter)
    }
  );
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  const method = String(request.method || 'GET').toUpperCase();
  const ip = getClientIp(request);

  if (pathname === '/api/auth/signup' && method === 'POST') {
    const check = consumeRateLimit('signup', ip);
    if (!check.allowed) return rateLimitedResponse(check);
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const check = consumeRateLimit('login', ip);
    if (!check.allowed) return rateLimitedResponse(check);
  }

  const isProtectedDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isProtectedTranscriptApi =
    pathname.startsWith('/api/transcript/') || pathname.startsWith('/api/transcripts/');

  if (!isProtectedDashboard && !isProtectedTranscriptApi) {
    return fetch(request);
  }

  const token = getAccessTokenFromRequest(request);
  const verified = await verifySupabaseToken(token);

  if (!verified.ok) {
    if (isProtectedDashboard) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('auth', verified.reason === 'email_not_verified' ? 'verify-email' : 'required');
      return Response.redirect(loginUrl, 307);
    }
    return json(
      verified.reason === 'email_not_verified' ? 403 : 401,
      {
        success: false,
        error: {
          code: verified.reason === 'email_not_verified' ? 'EMAIL_NOT_VERIFIED' : 'UNAUTHENTICATED',
          message:
            verified.reason === 'email_not_verified'
              ? 'Email is not verified. Please verify your email before using this endpoint.'
              : 'Authentication required'
        }
      }
    );
  }

  return fetch(request);
}
