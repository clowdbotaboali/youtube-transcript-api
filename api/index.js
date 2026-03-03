import { Groq } from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import ytdl from '@distube/ytdl-core';
import crypto from 'crypto';

let groqClient = null;

let supabaseClient = null;
const FREE_PLAN_CREDITS = 0;
const CREDIT_COST_PER_SUCCESS = 1;
const MONTHLY_FREE_QUOTA = 5;
const QUOTA_RESET_WINDOW_DAYS = 30;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const YTDL_AGENT = ytdl.createAgent();
const EXTRACTION_TIMEOUT_MS = 20000;
const AI_TRANSCRIPT_CHAR_LIMIT = 12000;
const CHAT_TRANSCRIPT_CHAR_LIMIT = 6500;
const CHAT_QUESTION_CHAR_LIMIT = 1200;
const QUOTA_MARKER_TYPE = 'quota_extract_marker';
const EXTRACT_TYPE = 'extract';
const CHAT_TYPE_PREFIX = 'chat:';
const ADMIN_CONFIG_TYPE = 'admin_config';
const ADMIN_CONFIG_VIDEO_ID = 'admin_credentials';
const BILLING_CONFIG_TYPE = 'billing_config';
const BILLING_CONFIG_VIDEO_ID = 'payment_receivers';
const USER_ACCESS_CONFIG_TYPE = 'user_access_config';
const USER_ACCESS_CONFIG_VIDEO_ID = 'users_access';
const AI_CONFIG_TYPE = 'ai_provider_config';
const AI_CONFIG_VIDEO_ID = 'ai_providers';
const TRANSCRIPT_API_CONFIG_TYPE = 'transcript_api_config';
const TRANSCRIPT_API_VIDEO_ID = 'transcript_api_keys';
const RATE_LIMIT_MARKER_TYPE = 'rate_limit_marker';
const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED';
const OAUTH_REDIRECT_DEFAULT_PATH = '/auth/callback?next=/dashboard';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ADMIN_DEFAULT_USERNAME = 'admin';
const ADMIN_DEFAULT_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@localhost.local').trim().toLowerCase();
const ADMIN_PASSWORD_FROM_ENV = Boolean(String(process.env.ADMIN_PASSWORD || '').trim());
const ADMIN_PASSWORD_FALLBACK_SOURCE = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
const ADMIN_DEFAULT_PASSWORD = ADMIN_PASSWORD_FROM_ENV
  ? String(process.env.ADMIN_PASSWORD || '').trim()
  : crypto
      .createHash('sha256')
      .update(ADMIN_PASSWORD_FALLBACK_SOURCE || crypto.randomBytes(32).toString('base64url'))
      .digest('base64url')
      .slice(0, 24);
const ADMIN_TOKEN_SECRET_FROM_ENV = Boolean(String(process.env.ADMIN_TOKEN_SECRET || '').trim());
const ADMIN_TOKEN_SECRET = String(process.env.ADMIN_TOKEN_SECRET || '').trim()
  || crypto
    .createHash('sha256')
    .update(ADMIN_PASSWORD_FALLBACK_SOURCE || crypto.randomBytes(48).toString('base64url'))
    .digest('base64url');
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const LINKS_MAX_ITEMS = 500;
const PAYMENT_PROOF_BUCKET = process.env.PAYMENT_PROOF_BUCKET || 'payment-proofs';
const MAX_PAYMENT_PROOF_BYTES = 3 * 1024 * 1024;
const TRANSCRIPT_GLOBAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TRANSCRIPT_MEMORY_CACHE_MAX_ITEMS = 300;
const GUEST_EXTRACT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const GUEST_EXTRACT_LIMIT_PER_TOKEN = 1;
const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const PRO_SUBSCRIPTION_DAYS = 30;
const RATE_LIMIT_OWNER_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_OUTPUT_LANG = 'ar';
const OUTPUT_LANG_CONFIG = {
  ar: { label: 'Arabic', instruction: 'Write the final output in clear Modern Standard Arabic with natural phrasing (not literal translation).' },
  en: { label: 'English', instruction: 'Write the final output in clear professional English with natural phrasing.' },
  fr: { label: 'French', instruction: 'Write the final output in clear professional French with natural phrasing.' },
  es: { label: 'Spanish', instruction: 'Write the final output in clear professional Spanish with natural phrasing.' },
  de: { label: 'German', instruction: 'Write the final output in clear professional German with natural phrasing.' },
  it: { label: 'Italian', instruction: 'Write the final output in clear professional Italian with natural phrasing.' },
  pt: { label: 'Portuguese', instruction: 'Write the final output in clear professional Portuguese with natural phrasing.' },
  tr: { label: 'Turkish', instruction: 'Write the final output in clear professional Turkish with natural phrasing.' },
  ru: { label: 'Russian', instruction: 'Write the final output in clear professional Russian with natural phrasing.' },
  hi: { label: 'Hindi', instruction: 'Write the final output in clear professional Hindi with natural phrasing.' },
  id: { label: 'Indonesian', instruction: 'Write the final output in clear professional Indonesian with natural phrasing.' },
  ur: { label: 'Urdu', instruction: 'Write the final output in clear professional Urdu with natural phrasing.' },
  zh: { label: 'Chinese', instruction: 'Write the final output in clear professional Simplified Chinese with natural phrasing.' },
  ja: { label: 'Japanese', instruction: 'Write the final output in clear professional Japanese with natural phrasing.' },
  ko: { label: 'Korean', instruction: 'Write the final output in clear professional Korean with natural phrasing.' }
};
const DAILY_EXTRACT_LIMITS = {
  free: 5,
  pro: 500,
  admin: 5000
};
const FEATURE_ACCESS_BY_TIER = {
  free: { extract: true, ai: true, chat: true },
  pro: { extract: true, ai: true, chat: true },
  admin: { extract: true, ai: true, chat: true, admin: true }
};
const RATE_LIMIT_RULES = {
  ipGlobal: { limit: 240, windowMs: 60 * 1000 },
  adminLoginIp: { limit: 12, windowMs: 10 * 60 * 1000, storage: 'durable' },
  authSignupIp: { limit: 12, windowMs: 24 * 60 * 60 * 1000, storage: 'durable' },
  authLoginIp: { limit: 10, windowMs: 10 * 60 * 1000, storage: 'durable' },
  authResendIp: { limit: 6, windowMs: 10 * 60 * 1000, storage: 'durable' },
  guestExtractIp: { limit: 6, windowMs: 10 * 60 * 1000, storage: 'durable' },
  transcriptByUser: { limit: 40, windowMs: 60 * 1000 },
  aiByUser: { limit: 45, windowMs: 60 * 1000 },
  chatByUser: { limit: 80, windowMs: 60 * 1000 },
  genericByUser: { limit: 120, windowMs: 60 * 1000 }
};
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://transcripta.tech',
  'https://www.transcripta.tech',
];
const STATUS_DEFAULT_ERROR_CODE = {
  400: 'INVALID_INPUT',
  401: 'UNAUTHENTICATED',
  403: 'LIMIT_EXCEEDED',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR'
};
const RESERVED_PROCESSING_TYPES = new Set([
  QUOTA_MARKER_TYPE,
  RATE_LIMIT_MARKER_TYPE,
  EXTRACT_TYPE,
  ADMIN_CONFIG_TYPE,
  BILLING_CONFIG_TYPE,
  USER_ACCESS_CONFIG_TYPE,
  AI_CONFIG_TYPE,
  TRANSCRIPT_API_CONFIG_TYPE
]);
const PASSWORD_HASH_PREFIX = 'pbkdf2-sha256';
const PASSWORD_HASH_DEFAULT_ITERATIONS = 210000;
const PASSWORD_HASH_BYTES = 32;
const SUPABASE_URL_ENV_KEYS = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY_ENV_KEYS = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'];
const SUPABASE_PUBLIC_KEY_ENV_KEYS = [
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY'
];
const ENV_VALIDATION = validateEnvironment();

const rateLimitStore = {
  ipGlobal: new Map(),
  adminLoginIp: new Map(),
  authSignupIp: new Map(),
  authLoginIp: new Map(),
  authResendIp: new Map(),
  guestExtractIp: new Map(),
  transcriptByUser: new Map(),
  aiByUser: new Map(),
  chatByUser: new Map(),
  genericByUser: new Map()
};
const transcriptMemoryCache = new Map();
const guestExtractUsage = new Map();
const apiKeyRuntimeState = {
  ai: new Map(),
  transcript: new Map()
};
let rateLimitOwnerUserIdCache = {
  value: '',
  expiresAt: 0
};

function validateEnvironment() {
  const missingRequired = [];
  const missingRecommended = [];

  if (!getSupabaseBaseUrl()) missingRequired.push('SUPABASE_URL');
  if (!getSupabaseServiceKey()) missingRequired.push('SUPABASE_SERVICE_ROLE_KEY');

  if (!getSupabasePublicKey()) missingRecommended.push('SUPABASE_ANON_KEY');
  if (!String(process.env.TURNSTILE_SECRET_KEY || '').trim()) missingRecommended.push('TURNSTILE_SECRET_KEY');
  if (!ADMIN_TOKEN_SECRET_FROM_ENV) missingRecommended.push('ADMIN_TOKEN_SECRET');
  if (!ADMIN_PASSWORD_FROM_ENV) missingRecommended.push('ADMIN_PASSWORD');
  if (!String(process.env.ADMIN_EMAIL || '').trim()) missingRecommended.push('ADMIN_EMAIL');

  if (missingRequired.length > 0) {
    console.error(`[env] Missing required environment variables: ${missingRequired.join(', ')}`);
  }
  if (missingRecommended.length > 0) {
    console.warn(`[env] Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }
  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingRecommended
  };
}

function readEnvFirst(keys = []) {
  for (const key of keys) {
    const value = String(process.env[key] || '').trim();
    if (value) return value;
  }
  return '';
}

function getSupabaseBaseUrl() {
  return readEnvFirst(SUPABASE_URL_ENV_KEYS).replace(/\/+$/, '');
}

function getSupabaseServiceKey() {
  return readEnvFirst(SUPABASE_SERVICE_KEY_ENV_KEYS);
}

function getSupabasePublicKey() {
  return readEnvFirst(SUPABASE_PUBLIC_KEY_ENV_KEYS);
}

function withTimeout(promise, ms, label = 'Operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000, label = 'Fetch') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`${label} timeout`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = getSupabaseBaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) return null;
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Server not configured: GROQ_API_KEY missing');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Server not configured: GROQ_API_KEY missing');
  }
  return apiKey;
}

function getSupabaseAnonKey() {
  return getSupabasePublicKey();
}

async function requestSupabaseAuth(path, { method = 'POST', body, accessToken } = {}) {
  const baseUrl = getSupabaseBaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!baseUrl || !anonKey) {
    throw new Error('Server not configured: SUPABASE_URL / SUPABASE_ANON_KEY missing');
  }
  const headers = {
    apikey: anonKey,
    'Content-Type': 'application/json'
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${String(accessToken).trim()}`;
  }
  const response = await fetchWithTimeout(
    `${baseUrl}${path}`,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    },
    12000,
    'Supabase auth request'
  );
  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    data: payload
  };
}

function extractSupabaseAuthErrorMessage(payload, fallback = 'Authentication failed') {
  return String(payload?.msg || payload?.error_description || payload?.error || payload?.message || fallback);
}

async function validateTurnstileToken(token, remoteIp = '') {
  const configuredSecret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
  if (!configuredSecret) {
    return { ok: false, code: 'ANTI_BOT_UNAVAILABLE', message: 'Anti-bot protection is not configured on the server' };
  }
  const responseToken = String(token || '').trim();
  if (!responseToken) {
    return { ok: false, code: 'ANTI_BOT_REQUIRED', message: 'Anti-bot validation is required' };
  }
  const secret = configuredSecret;

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', responseToken);
  if (remoteIp) form.set('remoteip', String(remoteIp));

  try {
    const response = await fetchWithTimeout(
      TURNSTILE_VERIFY_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form.toString()
      },
      10000,
      'Turnstile verification'
    );
    const payload = await response.json().catch(() => ({}));
    const success = Boolean(payload?.success);
    if (!success) {
      return {
        ok: false,
        code: 'ANTI_BOT_INVALID',
        message: 'Anti-bot verification failed',
        details: {
          turnstileCodes: Array.isArray(payload?.['error-codes']) ? payload['error-codes'] : []
        }
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      code: 'ANTI_BOT_UNAVAILABLE',
      message: 'Anti-bot verification service is unavailable',
      details: { reason: String(error?.message || 'unknown') }
    };
  }
}

function isProtectedUserApiPath(pathname) {
  const value = String(pathname || '');
  if (!value.startsWith('/api/')) return false;
  if (value === '/api/settings/status') return false;
  if (value.startsWith('/api/admin/')) return false;
  if (value.startsWith('/api/auth/')) return false;
  const protectedPrefixes = ['/api/me', '/api/transcript/', '/api/transcripts/', '/api/ai/', '/api/history', '/api/links', '/api/billing', '/api/chat/'];
  return protectedPrefixes.some((prefix) => value === prefix || value.startsWith(prefix));
}

function normalizeUsageRow(row) {
  const monthlyQuota = Math.max(Number(row?.monthly_quota || MONTHLY_FREE_QUOTA), 0);
  const usedThisMonth = Math.max(Number(row?.used_this_month || 0), 0);
  const remaining = Math.max(monthlyQuota - usedThisMonth, 0);
  return {
    monthlyQuota,
    usedThisMonth,
    remaining,
    lastResetAt: row?.last_reset_at || null,
    nextResetAt: row?.last_reset_at
      ? new Date(new Date(row.last_reset_at).getTime() + QUOTA_RESET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : null
  };
}

async function ensureUserUsageRow(supabase, userId) {
  const payload = {
    user_id: userId,
    monthly_quota: MONTHLY_FREE_QUOTA
  };
  const { error } = await supabase.from('user_usage').upsert([payload], { onConflict: 'user_id' });
  if (error && !isMissingRelationError(error)) {
    throw new Error('Failed to initialize user usage');
  }
}

async function getUserUsageSummary(supabase, userId) {
  await ensureUserUsageRow(supabase, userId);
  const { data, error } = await supabase.rpc('refresh_user_quota_if_due', { p_user_id: userId });
  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error('Quota system migration is missing');
    }
    throw new Error('Failed to load user quota usage');
  }
  const row = Array.isArray(data) ? data[0] : data;
  return normalizeUsageRow(row || {});
}

async function consumeUserMonthlyQuota(supabase, userId) {
  await ensureUserUsageRow(supabase, userId);
  const { data, error } = await supabase.rpc('consume_user_quota', { p_user_id: userId });
  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error('Quota system migration is missing');
    }
    throw new Error('Failed to consume user quota');
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    throw new Error('Invalid quota response from database');
  }
  return {
    allowed: Boolean(row.allowed),
    ...normalizeUsageRow(row)
  };
}

async function createGroqChatCompletion({ messages, model = 'llama-3.3-70b-versatile', temperature = 0.4, maxTokens }) {
  const apiKey = getGroqApiKey();
  const payload = {
    messages,
    model,
    temperature
  };
  if (typeof maxTokens === 'number') {
    payload.max_tokens = maxTokens;
  }

  try {
    const groq = getGroqClient();
    return await groq.chat.completions.create(payload);
  } catch (sdkError) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      const apiError = data?.error?.message;
      throw new Error(apiError || sdkError?.message || `Groq request failed (${response.status})`);
    }
    return data;
  }
}

function isValidVideoId(value) {
  return VIDEO_ID_REGEX.test(String(value || '').trim());
}

function parseYouTubeInput(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) {
    return {
      ok: false,
      code: 'EMPTY_INPUT',
      message: 'YouTube URL or video ID is required'
    };
  }

  if (isValidVideoId(raw)) {
    return {
      ok: true,
      videoId: raw,
      canonicalUrl: `https://www.youtube.com/watch?v=${raw}`
    };
  }

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      ok: false,
      code: 'INVALID_URL',
      message: 'Malformed YouTube URL'
    };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isYoutubeHost =
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtu.be' ||
    host.endsWith('.youtu.be');

  if (!isYoutubeHost) {
    return {
      ok: false,
      code: 'INVALID_YOUTUBE_URL',
      message: 'URL must be a valid YouTube link'
    };
  }

  let videoId = '';
  if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
    videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
  } else if (parsed.pathname === '/watch') {
    videoId = parsed.searchParams.get('v') || '';
  } else {
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed' || parts[0] === 'v' || parts[0] === 'shorts' || parts[0] === 'live') {
      videoId = parts[1] || '';
    }
  }

  if (!isValidVideoId(videoId)) {
    return {
      ok: false,
      code: 'INVALID_VIDEO_ID',
      message: 'Invalid YouTube video ID format'
    };
  }

  return {
    ok: true,
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
}

function extractVideoId(value) {
  const parsed = parseYouTubeInput(value);
  return parsed.ok ? parsed.videoId : null;
}

async function getAuthedUser(req) {
  if (Object.prototype.hasOwnProperty.call(req, '__authedUser')) {
    return req.__authedUser;
  }
  const supabase = getSupabase();
  if (!supabase) {
    req.__authedUser = null;
    return null;
  }
  const token = getAuthTokenFromRequest(req);
  if (!token) {
    req.__authedUser = null;
    return null;
  }
  const { data, error } = await supabase.auth.getUser(token);
  req.__authedUser = error || !data?.user ? null : data.user;
  return req.__authedUser;
}

function parseCookieHeader(cookieHeader = '') {
  const raw = String(cookieHeader || '');
  if (!raw) return {};
  const out = {};
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.split('=');
    const key = String(k || '').trim();
    if (!key) continue;
    const value = rest.join('=').trim();
    out[key] = decodeURIComponent(value || '');
  }
  return out;
}

function getAuthTokenFromRequest(req) {
  const authHeader = req.headers?.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookieHeader(req.headers?.cookie || '');
  return String(cookies.sb_access_token || cookies['sb-access-token'] || '').trim();
}

function isUserEmailVerified(user) {
  if (!user || typeof user !== 'object') return false;
  const confirmedAt = user.email_confirmed_at || user.confirmed_at;
  return Boolean(confirmedAt);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeRedirectUrl(input, req, fallbackPath = OAUTH_REDIRECT_DEFAULT_PATH) {
  const requested = String(input || '').trim();
  if (requested) {
    try {
      const parsed = new URL(requested);
      const origin = `${parsed.protocol}//${parsed.host}`;
      if (isOriginAllowed(origin)) return parsed.toString();
    } catch {
      // Ignore malformed redirect input.
    }
  }

  const originHeader = String(req.headers?.origin || '').trim();
  if (originHeader && isOriginAllowed(originHeader)) {
    return `${originHeader}${fallbackPath}`;
  }

  const bestDefault = ALLOWED_ORIGINS.find((origin) => /^https?:\/\//i.test(origin));
  if (bestDefault) return `${bestDefault}${fallbackPath}`;
  return '';
}

async function loadUserRow(supabase, userId) {
  const preferredSelect = 'id, email, credits, subscription_tier, subscription_expires_at, created_at';
  const { data, error } = await supabase
    .from('users')
    .select(preferredSelect)
    .eq('id', userId)
    .single();

  if (!error && data) {
    return {
      ...data,
      subscription_tier: normalizeTier(data.subscription_tier),
      subscription_expires_at: data.subscription_expires_at || null
    };
  }

  // Backward compatibility for projects where subscription columns are not migrated yet.
  const legacy = await supabase
    .from('users')
    .select('id, email, credits, created_at')
    .eq('id', userId)
    .single();
  if (legacy.error || !legacy.data) {
    throw new Error('User account not found');
  }
  return {
    ...legacy.data,
    subscription_tier: 'free',
    subscription_expires_at: null
  };
}

async function hasApprovedPayments(supabase, userId) {
  const { count, error } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error) {
    const rawMessage = `${error.message || ''} ${error.details || ''}`.toLowerCase();
    const tableMissing =
      rawMessage.includes("relation 'payments' does not exist") ||
      rawMessage.includes('relation "payments" does not exist') ||
      rawMessage.includes('could not find the table');
    if (tableMissing) return false;
    throw new Error('Failed to verify payment history');
  }

  return Number(count || 0) > 0;
}

async function ensureUserAccountRow(supabase, authUser) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: authUser.id,
        email: authUser.email || null,
        credits: FREE_PLAN_CREDITS
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (upsertError) {
    throw new Error('Failed to prepare user account');
  }

  const data = await loadUserRow(supabase, authUser.id);
  const tier = normalizeTier(data.subscription_tier);
  let credits = Number(data.credits || 0);

  // Backward-compatibility fix:
  // Keep paid users untouched, but normalize legacy free accounts to current free quota.
  if (tier === 'free' && credits > FREE_PLAN_CREDITS) {
    const paidBefore = await hasApprovedPayments(supabase, authUser.id);
    if (!paidBefore) {
      const normalizedCredits = FREE_PLAN_CREDITS;
      const { error: normalizeError } = await supabase
        .from('users')
        .update({ credits: normalizedCredits })
        .eq('id', authUser.id);
      if (normalizeError) {
        throw new Error('Failed to normalize free plan credits');
      }
      credits = normalizedCredits;
    }
  }

  return {
    ...data,
    credits,
    subscription_tier: tier,
    subscription_expires_at: data.subscription_expires_at || null
  };
}

async function consumeCredits(supabase, userId, currentCredits, cost = CREDIT_COST_PER_SUCCESS) {
  const amount = Math.max(Number(cost || 0), 0);
  const current = Math.max(Number(currentCredits || 0), 0);
  if (amount <= 0) return current;
  if (current < amount) {
    throw new Error('Insufficient credits');
  }

  const nextCredits = current - amount;
  const { data: optimisticData, error: optimisticError } = await supabase
    .from('users')
    .update({ credits: nextCredits })
    .eq('id', userId)
    .eq('credits', current)
    .select('credits')
    .maybeSingle();

  if (optimisticError) {
    throw new Error('Failed to update credits');
  }
  if (optimisticData) {
    return Math.max(Number(optimisticData.credits || nextCredits), 0);
  }

  const { data: freshRow, error: freshError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .maybeSingle();
  if (freshError || !freshRow) {
    throw new Error('Failed to reload user credits');
  }

  const freshCredits = Math.max(Number(freshRow.credits || 0), 0);
  if (freshCredits < amount) {
    throw new Error('Insufficient credits');
  }

  const freshNextCredits = freshCredits - amount;
  const { data: committedData, error: commitError } = await supabase
    .from('users')
    .update({ credits: freshNextCredits })
    .eq('id', userId)
    .eq('credits', freshCredits)
    .select('credits')
    .maybeSingle();
  if (commitError || !committedData) {
    throw new Error('Failed to update credits');
  }
  return Math.max(Number(committedData.credits || freshNextCredits), 0);
}

async function countDailyExtractUsage(supabase, userId, sinceIso) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id')
    .eq('user_id', userId)
    .eq('processing_type', EXTRACT_TYPE)
    .gte('created_at', sinceIso)
    .limit(10000);

  if (error) {
    throw new Error('Failed to load daily extraction usage');
  }
  return Array.isArray(data) ? data.length : 0;
}

async function resolveUserSubscriptionState(supabase, userRow, { isAdminUser = false } = {}) {
  let tier = normalizeTier(userRow?.subscription_tier);
  let expiresAt = userRow?.subscription_expires_at || null;

  if (isAdminUser && tier !== 'admin') {
    tier = 'admin';
    expiresAt = null;
    await supabase
      .from('users')
      .update({
        subscription_tier: 'admin',
        subscription_expires_at: null
      })
      .eq('id', userRow.id);
  }

  if (tier === 'pro' && expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    if (Number.isFinite(expiryTime) && expiryTime <= Date.now()) {
      tier = 'free';
      expiresAt = null;
      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_expires_at: null
        })
        .eq('id', userRow.id);
    }
  }

  const dailyLimit = getTierDailyLimit(tier);
  const dailyExtractUsed = await countDailyExtractUsage(supabase, userRow.id, startOfUtcDay().toISOString());
  const dailyExtractRemaining = Math.max(dailyLimit - dailyExtractUsed, 0);

  return {
    tier,
    expiresAt,
    dailyLimit,
    dailyExtractUsed,
    dailyExtractRemaining,
    features: FEATURE_ACCESS_BY_TIER[tier] || FEATURE_ACCESS_BY_TIER.free
  };
}

function makeHash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function safeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');
  if (leftBuffer.length !== rightBuffer.length) return false;
  if (leftBuffer.length === 0) return true;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function hashPassword(password) {
  const normalized = String(password || '');
  const salt = crypto.randomBytes(16).toString('base64url');
  const derived = crypto
    .pbkdf2Sync(normalized, salt, PASSWORD_HASH_DEFAULT_ITERATIONS, PASSWORD_HASH_BYTES, 'sha256')
    .toString('base64url');
  return `${PASSWORD_HASH_PREFIX}$${PASSWORD_HASH_DEFAULT_ITERATIONS}$${salt}$${derived}`;
}

function isLegacyPasswordHash(passwordHash) {
  return !String(passwordHash || '').startsWith(`${PASSWORD_HASH_PREFIX}$`);
}

function verifyPassword(password, passwordHash) {
  const normalizedPassword = String(password || '');
  const stored = String(passwordHash || '').trim();
  if (!stored) return false;

  if (stored.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    const parts = stored.split('$');
    if (parts.length !== 4) return false;
    const iterations = Number.parseInt(parts[1], 10);
    const salt = String(parts[2] || '');
    const storedDigest = String(parts[3] || '');
    if (!Number.isFinite(iterations) || iterations < 100000 || !salt || !storedDigest) return false;
    const computed = crypto
      .pbkdf2Sync(normalizedPassword, salt, iterations, PASSWORD_HASH_BYTES, 'sha256')
      .toString('base64url');
    return safeEqualText(computed, storedDigest);
  }

  // Legacy fallback for previously stored unsalted SHA-256 hashes.
  return safeEqualText(makeHash(normalizedPassword), stored);
}

function isReservedProcessingType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith(CHAT_TYPE_PREFIX)) return true;
  return RESERVED_PROCESSING_TYPES.has(normalized);
}

function buildScopedProcessingType(baseType, scopeToken = '') {
  const normalizedBase = String(baseType || '').trim();
  if (!normalizedBase) return '';
  const normalizedToken = String(scopeToken || '').trim();
  if (!normalizedToken) return normalizedBase;
  return `${normalizedBase}|cfg:${normalizedToken}`;
}

function makeChatKey(message, { outputLang = DEFAULT_OUTPUT_LANG, scopeToken = '' } = {}) {
  const normalizedMessage = normalizeTextInput(message).toLowerCase();
  const normalizedLang = normalizeOutputLang(outputLang);
  const payload = `${normalizedMessage}|lang:${normalizedLang}|cfg:${String(scopeToken || '').trim()}`;
  return `${CHAT_TYPE_PREFIX}${makeHash(payload)}`;
}

function normalizeTier(value) {
  const tier = String(value || '').trim().toLowerCase();
  if (tier === 'admin' || tier === 'pro') return tier;
  return 'free';
}

function startOfUtcDay(date = new Date()) {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

function getTierDailyLimit(tier) {
  return DAILY_EXTRACT_LIMITS[normalizeTier(tier)] || DAILY_EXTRACT_LIMITS.free;
}

function getPathname(url) {
  try {
    return new URL(url || '', 'http://localhost').pathname;
  } catch {
    return String(url || '').split('?')[0];
  }
}

function getSupabaseEnv() {
  const url = getSupabaseBaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) {
    throw new Error('Server not configured: SUPABASE env vars missing');
  }
  return { url, key };
}

async function authAdminRequest(path, options = {}) {
  const { url, key } = getSupabaseEnv();
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = data?.msg || data?.error_description || data?.error || `Auth admin request failed (${response.status})`;
    throw new Error(msg);
  }
  return data;
}

async function findAuthUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;

  for (let page = 1; page <= 5; page += 1) {
    const data = await authAdminRequest(`/auth/v1/admin/users?page=${page}&per_page=200`, { method: 'GET' });
    const users = Array.isArray(data?.users) ? data.users : [];
    const match = users.find((item) => String(item?.email || '').toLowerCase() === normalized);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

async function ensureAdminOwnerUser(supabase, email = ADMIN_DEFAULT_EMAIL, password = ADMIN_DEFAULT_PASSWORD) {
  let adminAuthUser = await findAuthUserByEmail(email);
  if (!adminAuthUser) {
    adminAuthUser = await authAdminRequest('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { is_admin: true, username: ADMIN_DEFAULT_USERNAME }
      })
    });
  }

  const ownerId = adminAuthUser?.id;
  if (!ownerId) {
    throw new Error('Failed to prepare admin owner user');
  }

  const { error: ownerError } = await supabase.from('users').upsert(
    {
      id: ownerId,
      email: adminAuthUser.email || email,
      credits: 0
    },
    { onConflict: 'id' }
  );
  if (ownerError) {
    throw new Error('Failed to link admin owner user');
  }

  // Best effort: persist admin subscription tier once migration is applied.
  try {
    await supabase
      .from('users')
      .update({
        subscription_tier: 'admin',
        subscription_expires_at: null
      })
      .eq('id', ownerId);
  } catch {
    // Ignore when subscription columns are not available yet.
  }

  return { id: ownerId, email: adminAuthUser.email || email };
}

function buildAdminConfigSignature(config) {
  return makeHash(`${config.username}:${config.email}:${config.passwordHash}`);
}

function signAdminToken(config) {
  const payload = {
    username: config.username,
    email: config.email,
    sig: buildAdminConfigSignature(config),
    exp: Date.now() + ADMIN_TOKEN_TTL_MS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(encodedPayload).digest('base64url');
  if (!safeEqualText(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function loadOrBootstrapAdminConfig(supabase) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, user_id, ai_result')
    .eq('processing_type', ADMIN_CONFIG_TYPE)
    .eq('video_id', ADMIN_CONFIG_VIDEO_ID)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to load admin configuration');
  }

  const latest = Array.isArray(data) ? data[0] : null;
  if (latest) {
    let parsed = {};
    try {
      parsed = JSON.parse(latest.ai_result || '{}');
    } catch {
      parsed = {};
    }
    return {
      userId: latest.user_id,
      username: parsed.username || ADMIN_DEFAULT_USERNAME,
      email: parsed.email || ADMIN_DEFAULT_EMAIL,
      passwordHash: parsed.passwordHash || hashPassword(ADMIN_DEFAULT_PASSWORD)
    };
  }

  const owner = await ensureAdminOwnerUser(supabase, ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD);
  const config = {
    userId: owner.id,
    username: ADMIN_DEFAULT_USERNAME,
    email: owner.email || ADMIN_DEFAULT_EMAIL,
    passwordHash: hashPassword(ADMIN_DEFAULT_PASSWORD)
  };

  const { error: insertError } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: owner.id,
        video_id: ADMIN_CONFIG_VIDEO_ID,
        video_title: 'Admin Config',
        transcript: ADMIN_DEFAULT_USERNAME,
        ai_result: JSON.stringify({
          username: config.username,
          email: config.email,
          passwordHash: config.passwordHash
        }),
        processing_type: ADMIN_CONFIG_TYPE
      }
    ]);

  if (insertError) {
    throw new Error('Failed to initialize admin configuration');
  }

  return config;
}

async function saveAdminConfig(supabase, config) {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: config.userId,
        video_id: ADMIN_CONFIG_VIDEO_ID,
        video_title: 'Admin Config',
        transcript: config.username,
        ai_result: JSON.stringify({
          username: config.username,
          email: config.email,
          passwordHash: config.passwordHash
        }),
        processing_type: ADMIN_CONFIG_TYPE
      }
    ]);
  if (error) {
    throw new Error('Failed to save admin configuration');
  }
}

async function requireAdmin(req, supabase) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  const payload = verifyAdminToken(token);
  if (!payload) return null;

  const config = await loadOrBootstrapAdminConfig(supabase);
  if (payload.sig !== buildAdminConfigSignature(config)) return null;
  return { payload, config };
}

function parseJsonSafe(value, fallback = {}) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

function maskApiKey(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.length <= 8) return '********';
  return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
}

function normalizeApiKeys(rawKeys) {
  const source = Array.isArray(rawKeys) ? rawKeys : String(rawKeys || '').split(/\r?\n/);
  const unique = new Set();
  for (const item of source) {
    const value = String(item || '').trim();
    if (!value) continue;
    unique.add(value);
  }
  return Array.from(unique);
}

function normalizeBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(text)) return true;
    if (['0', 'false', 'no', 'off'].includes(text)) return false;
  }
  return fallback;
}

function buildApiKeyEntryId(apiKey, prefix = 'key') {
  const key = String(apiKey || '').trim();
  const seed = key || `${Date.now()}:${Math.random()}`;
  return `${prefix}_${makeHash(seed).slice(0, 16)}`;
}

function normalizeApiKeyEntries(rawEntries, { labelPrefix = 'Key', idPrefix = 'key' } = {}) {
  const source = Array.isArray(rawEntries) ? rawEntries : normalizeApiKeys(rawEntries);
  const dedupe = new Map();

  for (const item of source) {
    if (!item) continue;
    let apiKey = '';
    let label = '';
    let id = '';
    let enabled = true;

    if (typeof item === 'string') {
      apiKey = String(item || '').trim();
    } else if (typeof item === 'object') {
      apiKey = String(item.apiKey || item.key || item.secret || '').trim();
      label = String(item.label || item.title || item.name || '').trim();
      id = String(item.id || '').trim();
      enabled = normalizeBoolean(item.enabled, true);
    }

    if (!apiKey) continue;
    const uniqueKey = apiKey.toLowerCase();
    if (dedupe.has(uniqueKey)) {
      const existing = dedupe.get(uniqueKey);
      if (!existing.label && label) existing.label = label;
      if (enabled === false) existing.enabled = false;
      continue;
    }

    dedupe.set(uniqueKey, {
      id: id || buildApiKeyEntryId(apiKey, idPrefix),
      label: label || `${labelPrefix} ${dedupe.size + 1}`,
      apiKey,
      enabled
    });
  }

  return Array.from(dedupe.values());
}

function ensureActiveKeyId(entries, activeKeyId = '') {
  const list = Array.isArray(entries) ? entries : [];
  const active = String(activeKeyId || '').trim();
  const byId = new Map(list.map((item) => [String(item.id || '').trim(), item]));
  if (active && byId.has(active) && byId.get(active)?.enabled !== false) return active;
  const firstEnabled = list.find((item) => item.enabled !== false);
  if (firstEnabled?.id) return String(firstEnabled.id);
  return list[0]?.id ? String(list[0].id) : '';
}

function resolveActiveKeyEntry(entries, activeKeyId = '') {
  const list = Array.isArray(entries) ? entries : [];
  const active = ensureActiveKeyId(list, activeKeyId);
  if (!active) return null;
  return list.find((item) => String(item.id || '').trim() === active) || null;
}

function orderKeyCandidates(entries, activeKeyId = '') {
  const list = (Array.isArray(entries) ? entries : []).filter((item) => item?.enabled !== false && String(item.apiKey || '').trim());
  if (!list.length) return [];
  const active = ensureActiveKeyId(list, activeKeyId);
  const primary = list.find((item) => String(item.id || '').trim() === active);
  const fallback = list.filter((item) => String(item.id || '').trim() !== active);
  return primary ? [primary, ...fallback] : fallback;
}

function keepOnlyActiveKeyEntry(entries, activeKeyId = '') {
  const list = Array.isArray(entries) ? entries : [];
  const activeEntry = resolveActiveKeyEntry(list, activeKeyId);
  if (!activeEntry) {
    return {
      keys: [],
      activeKeyId: ''
    };
  }
  return {
    keys: [{ ...activeEntry }],
    activeKeyId: String(activeEntry.id || '').trim()
  };
}

function runtimeStateKey(scope, provider, keyId) {
  const normalizedScope = scope === 'transcript' ? 'transcript' : 'ai';
  const providerPart = normalizedScope === 'transcript' ? 'transcript' : String(provider || 'unknown').trim().toLowerCase();
  const idPart = String(keyId || '').trim();
  return `${providerPart}:${idPart}`;
}

function getRuntimeState(scope, provider, keyId) {
  const bucket = scope === 'transcript' ? apiKeyRuntimeState.transcript : apiKeyRuntimeState.ai;
  const key = runtimeStateKey(scope, provider, keyId);
  return bucket.get(key) || null;
}

function recordRuntimeState(scope, provider, keyId, { success, errorMessage = '' } = {}) {
  const bucket = scope === 'transcript' ? apiKeyRuntimeState.transcript : apiKeyRuntimeState.ai;
  const key = runtimeStateKey(scope, provider, keyId);
  const prev = bucket.get(key) || {
    successCount: 0,
    failureCount: 0,
    lastStatus: 'idle',
    lastUsedAt: null,
    lastError: ''
  };
  const next = {
    successCount: Number(prev.successCount || 0),
    failureCount: Number(prev.failureCount || 0),
    lastStatus: prev.lastStatus || 'idle',
    lastUsedAt: new Date().toISOString(),
    lastError: prev.lastError || ''
  };

  if (success) {
    next.successCount += 1;
    next.lastStatus = 'success';
    next.lastError = '';
  } else {
    next.failureCount += 1;
    next.lastStatus = 'failure';
    next.lastError = String(errorMessage || '').trim();
  }

  bucket.set(key, next);
  return next;
}

function sanitizeKeyEntriesForAdmin(entries, { scope, provider, activeKeyId } = {}) {
  const list = Array.isArray(entries) ? entries : [];
  const active = ensureActiveKeyId(list, activeKeyId);

  return list.map((item) => {
    const runtime = getRuntimeState(scope, provider, item.id) || {};
    return {
      id: String(item.id || ''),
      label: String(item.label || ''),
      enabled: item.enabled !== false,
      maskedKey: maskApiKey(item.apiKey),
      isActive: String(item.id || '') === active,
      runtimeStatus: runtime.lastStatus || 'idle',
      lastUsedAt: runtime.lastUsedAt || null,
      lastError: runtime.lastError || '',
      successCount: Number(runtime.successCount || 0),
      failureCount: Number(runtime.failureCount || 0)
    };
  });
}

function applyApiKeyAction(entries, activeKeyId, keyAction, { labelPrefix = 'Key', idPrefix = 'key' } = {}) {
  const current = normalizeApiKeyEntries(entries, { labelPrefix, idPrefix });
  let list = current.map((item) => ({ ...item }));
  let nextActive = ensureActiveKeyId(list, activeKeyId);
  const action = keyAction && typeof keyAction === 'object' ? keyAction : null;
  if (!action) {
    return { keys: list, activeKeyId: nextActive };
  }

  const actionType = String(action.type || '').trim().toLowerCase();
  const targetId = String(action.keyId || action.id || '').trim();

  if (actionType === 'clear-all') {
    return { keys: [], activeKeyId: '' };
  }

  if (actionType === 'add') {
    const apiKey = String(action.apiKey || action.key || '').trim();
    if (!apiKey) {
      throw new Error('API key is required');
    }
    const keyId = String(action.id || '').trim() || buildApiKeyEntryId(apiKey, idPrefix);
    const label = String(action.label || action.title || '').trim() || `${labelPrefix} ${list.length + 1}`;
    const enabled = normalizeBoolean(action.enabled, true);

    const byKeyIndex = list.findIndex((item) => String(item.apiKey || '') === apiKey);
    const byIdIndex = list.findIndex((item) => String(item.id || '') === keyId);
    const targetIndex = byKeyIndex >= 0 ? byKeyIndex : byIdIndex;
    if (targetIndex >= 0) {
      list[targetIndex] = {
        ...list[targetIndex],
        id: keyId,
        label,
        apiKey,
        enabled
      };
    } else {
      list.push({ id: keyId, label, apiKey, enabled });
    }

    if (action.setActive === true || !nextActive) {
      nextActive = keyId;
    }
  } else if (actionType === 'delete') {
    if (!targetId) throw new Error('keyId is required');
    list = list.filter((item) => String(item.id || '') !== targetId);
    if (nextActive === targetId) {
      nextActive = '';
    }
  } else if (actionType === 'set-active') {
    if (!targetId) throw new Error('keyId is required');
    const target = list.find((item) => String(item.id || '') === targetId);
    if (!target) throw new Error('Key not found');
    if (target.enabled === false) throw new Error('Cannot activate a disabled key');
    nextActive = targetId;
  } else if (actionType === 'set-enabled') {
    if (!targetId) throw new Error('keyId is required');
    const enabled = normalizeBoolean(action.enabled, true);
    let found = false;
    list = list.map((item) => {
      if (String(item.id || '') !== targetId) return item;
      found = true;
      return { ...item, enabled };
    });
    if (!found) throw new Error('Key not found');
  } else if (actionType === 'replace') {
    const replacement = normalizeApiKeyEntries(action.keys || [], { labelPrefix, idPrefix });
    list = replacement;
    nextActive = String(action.activeKeyId || '').trim() || '';
  }

  nextActive = ensureActiveKeyId(list, nextActive);
  return { keys: list, activeKeyId: nextActive };
}

async function getConfigOwnerId(supabase) {
  const admin = await loadOrBootstrapAdminConfig(supabase);
  return admin.userId;
}

async function loadConfigPayload(supabase, processingType, videoId) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, user_id, ai_result, created_at')
    .eq('processing_type', processingType)
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(`Failed to load ${processingType}`);
  }

  const latest = Array.isArray(data) ? data[0] : null;
  return {
    row: latest,
    payload: latest ? parseJsonSafe(latest.ai_result, {}) : null
  };
}

async function saveConfigPayload(supabase, { processingType, videoId, videoTitle, transcript, payload }) {
  const ownerId = await getConfigOwnerId(supabase);
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: ownerId,
        video_id: videoId,
        video_title: videoTitle,
        transcript,
        ai_result: JSON.stringify(payload || {}),
        processing_type: processingType
      }
    ]);

  if (error) {
    throw new Error(`Failed to save ${processingType}`);
  }
  return payload;
}

function buildDefaultBillingConfig() {
  return {
    accountName: '',
    instapayHandle: '',
    vodafoneCashNumber: '',
    supportContact: '',
    instructionsAr:
      '\u062d\u0648\u0651\u0644 \u0627\u0644\u0645\u0628\u0644\u063a \u062b\u0645 \u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0648\u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062c\u0639 \u0648\u0633\u064a\u062a\u0645 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u062e\u0644\u0627\u0644 \u0648\u0642\u062a \u0642\u0635\u064a\u0631.',
    instructionsEn: 'Transfer the amount, upload transfer proof, and add the reference number for manual review.',
    instructionsFr: 'Effectuez le virement, telechargez la preuve et ajoutez la reference pour verification.',
    updatedAt: new Date().toISOString()
  };
}

async function loadOrBootstrapBillingConfig(supabase) {
  const defaults = buildDefaultBillingConfig();
  const { payload } = await loadConfigPayload(supabase, BILLING_CONFIG_TYPE, BILLING_CONFIG_VIDEO_ID);
  if (payload) {
    return {
      ...defaults,
      ...payload
    };
  }
  await saveConfigPayload(supabase, {
    processingType: BILLING_CONFIG_TYPE,
    videoId: BILLING_CONFIG_VIDEO_ID,
    videoTitle: 'Billing Receiver Config',
    transcript: 'billing',
    payload: defaults
  });
  return defaults;
}

function buildDefaultUserAccessConfig() {
  return {
    blockedUsers: {},
    suspendedUsers: {},
    updatedAt: new Date().toISOString()
  };
}

function normalizeUserAccessConfig(payload) {
  const config = payload && typeof payload === 'object' ? payload : {};
  return {
    blockedUsers: config.blockedUsers && typeof config.blockedUsers === 'object' ? config.blockedUsers : {},
    suspendedUsers: config.suspendedUsers && typeof config.suspendedUsers === 'object' ? config.suspendedUsers : {},
    updatedAt: config.updatedAt || new Date().toISOString()
  };
}

async function loadOrBootstrapUserAccessConfig(supabase) {
  const { payload } = await loadConfigPayload(supabase, USER_ACCESS_CONFIG_TYPE, USER_ACCESS_CONFIG_VIDEO_ID);
  if (payload) {
    return normalizeUserAccessConfig(payload);
  }

  const defaults = buildDefaultUserAccessConfig();
  await saveConfigPayload(supabase, {
    processingType: USER_ACCESS_CONFIG_TYPE,
    videoId: USER_ACCESS_CONFIG_VIDEO_ID,
    videoTitle: 'User Access Control',
    transcript: 'access',
    payload: defaults
  });
  return defaults;
}

async function saveUserAccessConfig(supabase, config) {
  const normalized = normalizeUserAccessConfig(config);
  normalized.updatedAt = new Date().toISOString();
  await saveConfigPayload(supabase, {
    processingType: USER_ACCESS_CONFIG_TYPE,
    videoId: USER_ACCESS_CONFIG_VIDEO_ID,
    videoTitle: 'User Access Control',
    transcript: 'access',
    payload: normalized
  });
  return normalized;
}

function getUserAccessStateFromConfig(config, userId) {
  const blocked = config.blockedUsers?.[userId] || null;
  if (blocked) {
    return {
      status: 'blocked',
      reason: blocked.reason || 'Blocked by admin',
      updatedAt: blocked.updatedAt || null,
      message: 'Your account is blocked. Please contact support.'
    };
  }

  const suspended = config.suspendedUsers?.[userId] || null;
  if (suspended) {
    return {
      status: 'suspended',
      reason: suspended.reason || 'Suspended by admin',
      updatedAt: suspended.updatedAt || null,
      message: 'Your account is suspended. Please contact support.'
    };
  }

  return {
    status: 'active',
    reason: null,
    updatedAt: null,
    message: null
  };
}

async function getUserAccessState(supabase, userId) {
  const config = await loadOrBootstrapUserAccessConfig(supabase);
  return getUserAccessStateFromConfig(config, userId);
}

async function assertUserIsActive(supabase, userId) {
  const state = await getUserAccessState(supabase, userId);
  if (state.status !== 'active') {
    const error = new Error(state.message || 'Access denied');
    error.code = 'USER_ACCESS_RESTRICTED';
    error.access = state;
    throw error;
  }
  return state;
}

function defaultModelForProvider(provider) {
  if (provider === 'openai') return 'gpt-4o-mini';
  if (provider === 'openrouter') return 'openai/gpt-4o-mini';
  if (provider === 'google') return 'gemini-2.0-flash';
  if (provider === 'anthropic') return 'claude-3-5-sonnet-latest';
  return 'llama-3.3-70b-versatile';
}

function defaultAiProviderConfig() {
  return {
    selectedProvider: 'groq',
    selectedModel: 'llama-3.3-70b-versatile',
    providers: {
      groq: {
        keys: [],
        activeKeyId: ''
      },
      openrouter: {
        keys: [],
        activeKeyId: ''
      },
      openai: {
        keys: [],
        activeKeyId: ''
      },
      google: {
        keys: [],
        activeKeyId: ''
      },
      anthropic: {
        keys: [],
        activeKeyId: ''
      }
    },
    modelCatalog: {},
    updatedAt: new Date().toISOString()
  };
}

function normalizeProviderName(value) {
  const provider = String(value || '').trim().toLowerCase();
  if (['groq', 'openrouter', 'openai', 'google', 'anthropic'].includes(provider)) {
    return provider;
  }
  return 'groq';
}

function normalizeAiProviderEntry(providerName, rawValue) {
  const value = rawValue && typeof rawValue === 'object' ? rawValue : {};
  const normalizedKeys = normalizeApiKeyEntries(value.keys || [], {
    labelPrefix: `${providerName.toUpperCase()} key`,
    idPrefix: `ai_${providerName}`
  });
  const activeKeyId = ensureActiveKeyId(normalizedKeys, value.activeKeyId);
  const activeEntry = resolveActiveKeyEntry(normalizedKeys, activeKeyId);
  return {
    keys: normalizedKeys,
    activeKeyId,
    apiKey: String(activeEntry?.apiKey || '').trim()
  };
}

function normalizeAiConfigPayload(raw) {
  const defaults = defaultAiProviderConfig();
  const payload = raw && typeof raw === 'object' ? raw : {};
  const providers = payload.providers && typeof payload.providers === 'object' ? payload.providers : {};
  const mergedProviders = {};

  for (const provider of Object.keys(defaults.providers)) {
    const current = providers[provider] && typeof providers[provider] === 'object' ? providers[provider] : defaults.providers[provider];
    mergedProviders[provider] = normalizeAiProviderEntry(provider, current);
  }

  const selectedProvider = normalizeProviderName(payload.selectedProvider || defaults.selectedProvider);
  const selectedModel = String(payload.selectedModel || defaultModelForProvider(selectedProvider) || '').trim();
  const modelCatalog = payload.modelCatalog && typeof payload.modelCatalog === 'object' ? payload.modelCatalog : {};

  return {
    selectedProvider,
    selectedModel: selectedModel || defaultModelForProvider(selectedProvider),
    providers: mergedProviders,
    modelCatalog,
    updatedAt: payload.updatedAt || defaults.updatedAt
  };
}

function sanitizeAiConfigForAdmin(config) {
  const providers = {};
  for (const [provider, value] of Object.entries(config.providers || {})) {
    const keys = normalizeApiKeyEntries(value?.keys || [], {
      labelPrefix: `${provider.toUpperCase()} key`,
      idPrefix: `ai_${provider}`
    });
    const activeKeyId = ensureActiveKeyId(keys, value?.activeKeyId);
    providers[provider] = {
      hasKey: keys.length > 0,
      keysCount: keys.length,
      activeKeyId,
      keys: sanitizeKeyEntriesForAdmin(keys, {
        scope: 'ai',
        provider,
        activeKeyId
      })
    };
  }

  return {
    selectedProvider: config.selectedProvider,
    selectedModel: config.selectedModel,
    providers,
    modelCatalog: config.modelCatalog || {},
    updatedAt: config.updatedAt || null
  };
}

async function loadOrBootstrapAiProviderConfig(supabase) {
  const { payload } = await loadConfigPayload(supabase, AI_CONFIG_TYPE, AI_CONFIG_VIDEO_ID);
  if (payload) {
    const normalized = normalizeAiConfigPayload(payload);
    // One-time cleanup for legacy payload shapes/extra keys so only active admin key remains persisted.
    if (JSON.stringify(payload) !== JSON.stringify(normalized)) {
      await saveConfigPayload(supabase, {
        processingType: AI_CONFIG_TYPE,
        videoId: AI_CONFIG_VIDEO_ID,
        videoTitle: 'AI Providers Config',
        transcript: 'ai-providers',
        payload: normalized
      });
    }
    return normalized;
  }

  const defaults = normalizeAiConfigPayload(defaultAiProviderConfig());
  await saveConfigPayload(supabase, {
    processingType: AI_CONFIG_TYPE,
    videoId: AI_CONFIG_VIDEO_ID,
    videoTitle: 'AI Providers Config',
    transcript: 'ai-providers',
    payload: defaults
  });
  return defaults;
}

async function saveAiProviderConfig(supabase, config) {
  const normalized = normalizeAiConfigPayload(config);
  normalized.updatedAt = new Date().toISOString();
  await saveConfigPayload(supabase, {
    processingType: AI_CONFIG_TYPE,
    videoId: AI_CONFIG_VIDEO_ID,
    videoTitle: 'AI Providers Config',
    transcript: 'ai-providers',
    payload: normalized
  });
  return normalized;
}

function getAiProviderKeyCandidates(config, provider) {
  const normalizedProvider = normalizeProviderName(provider);
  const providerConfig = config?.providers?.[normalizedProvider] || {};
  const keys = normalizeApiKeyEntries(providerConfig.keys || [], {
    labelPrefix: `${normalizedProvider.toUpperCase()} key`,
    idPrefix: `ai_${normalizedProvider}`
  });
  const activeKeyId = ensureActiveKeyId(keys, providerConfig.activeKeyId);
  return orderKeyCandidates(keys, activeKeyId);
}

function getActiveAiProviderKey(config, provider) {
  const normalizedProvider = normalizeProviderName(provider);
  const providerConfig = config?.providers?.[normalizedProvider] || {};
  const keys = normalizeApiKeyEntries(providerConfig.keys || [], {
    labelPrefix: `${normalizedProvider.toUpperCase()} key`,
    idPrefix: `ai_${normalizedProvider}`
  });
  const activeEntry = resolveActiveKeyEntry(keys, providerConfig.activeKeyId);
  if (!activeEntry) return null;
  if (activeEntry.enabled === false) return null;
  if (!String(activeEntry.apiKey || '').trim()) return null;
  return activeEntry;
}

function buildAiExecutionToken(config) {
  const provider = normalizeProviderName(config?.selectedProvider);
  const model = String(config?.selectedModel || defaultModelForProvider(provider)).trim() || defaultModelForProvider(provider);
  const activeKey = getActiveAiProviderKey(config, provider);
  const activeKeyId = String(activeKey?.id || 'none').trim() || 'none';
  return `${provider}:${model}:${activeKeyId}`;
}

async function getCurrentAiExecutionToken(supabase) {
  const config = await loadOrBootstrapAiProviderConfig(supabase);
  return buildAiExecutionToken(config);
}

function defaultTranscriptApiConfig() {
  return {
    keys: [],
    activeKeyId: '',
    updatedAt: new Date().toISOString()
  };
}

function normalizeTranscriptApiConfig(payload) {
  const defaults = defaultTranscriptApiConfig();
  const data = payload && typeof payload === 'object' ? payload : {};
  const normalizedKeys = normalizeApiKeyEntries(data.keys || defaults.keys, {
    labelPrefix: 'Transcript key',
    idPrefix: 'tap'
  });
  const activeKeyId = ensureActiveKeyId(normalizedKeys, data.activeKeyId);
  return {
    keys: normalizedKeys,
    activeKeyId,
    updatedAt: data.updatedAt || defaults.updatedAt
  };
}

async function loadOrBootstrapTranscriptApiConfig(supabase) {
  const { payload } = await loadConfigPayload(supabase, TRANSCRIPT_API_CONFIG_TYPE, TRANSCRIPT_API_VIDEO_ID);
  if (payload) {
    const normalized = normalizeTranscriptApiConfig(payload);
    // One-time cleanup for legacy transcript key payloads.
    if (JSON.stringify(payload) !== JSON.stringify(normalized)) {
      await saveConfigPayload(supabase, {
        processingType: TRANSCRIPT_API_CONFIG_TYPE,
        videoId: TRANSCRIPT_API_VIDEO_ID,
        videoTitle: 'Transcript API Keys Config',
        transcript: 'transcript-api-keys',
        payload: normalized
      });
    }
    return normalized;
  }

  const defaults = normalizeTranscriptApiConfig(defaultTranscriptApiConfig());
  await saveConfigPayload(supabase, {
    processingType: TRANSCRIPT_API_CONFIG_TYPE,
    videoId: TRANSCRIPT_API_VIDEO_ID,
    videoTitle: 'Transcript API Keys Config',
    transcript: 'transcript-api-keys',
    payload: defaults
  });
  return defaults;
}

async function saveTranscriptApiConfig(supabase, config) {
  const normalized = normalizeTranscriptApiConfig(config);
  normalized.updatedAt = new Date().toISOString();
  await saveConfigPayload(supabase, {
    processingType: TRANSCRIPT_API_CONFIG_TYPE,
    videoId: TRANSCRIPT_API_VIDEO_ID,
    videoTitle: 'Transcript API Keys Config',
    transcript: 'transcript-api-keys',
    payload: normalized
  });
  return normalized;
}

function sanitizeTranscriptApiConfigForAdmin(config) {
  const keys = normalizeApiKeyEntries(config?.keys || [], {
    labelPrefix: 'Transcript key',
    idPrefix: 'tap'
  });
  const activeKeyId = ensureActiveKeyId(keys, config?.activeKeyId);
  return {
    keysCount: keys.length,
    activeKeyId,
    keys: sanitizeKeyEntriesForAdmin(keys, {
      scope: 'transcript',
      provider: 'transcript',
      activeKeyId
    }),
    updatedAt: config?.updatedAt || null
  };
}

function getTranscriptApiKeyCandidates(config) {
  const keys = normalizeApiKeyEntries(config?.keys || [], {
    labelPrefix: 'Transcript key',
    idPrefix: 'tap'
  });
  const activeEntry = resolveActiveKeyEntry(keys, config?.activeKeyId);
  if (!activeEntry) return [];
  if (activeEntry.enabled === false) return [];
  if (!String(activeEntry.apiKey || '').trim()) return [];
  return [activeEntry];
}

function getActiveTranscriptApiKeyId(config) {
  const active = getTranscriptApiKeyCandidates(config)[0] || null;
  return String(active?.id || '').trim();
}

async function ensurePaymentProofBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = Array.isArray(buckets) && buckets.some((bucket) => bucket.name === PAYMENT_PROOF_BUCKET);
  if (exists) return;

  await supabase.storage.createBucket(PAYMENT_PROOF_BUCKET, {
    public: false,
    fileSizeLimit: MAX_PAYMENT_PROOF_BYTES,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });
}

function parseDataUrlImage(dataUrl) {
  const raw = String(dataUrl || '').trim();
  const match = raw.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([\s\S]+)$/i);
  if (!match) {
    throw new Error('Invalid image format. Use PNG/JPEG/WEBP');
  }

  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) {
    throw new Error('Uploaded image is empty');
  }
  if (buffer.length > MAX_PAYMENT_PROOF_BYTES) {
    throw new Error('Image is too large. Max size is 3MB');
  }

  const extMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp'
  };
  const ext = extMap[mime] || 'jpg';
  return { mime, buffer, ext, sizeBytes: buffer.length };
}

async function uploadPaymentProof(supabase, userId, dataUrl) {
  const parsed = parseDataUrlImage(dataUrl);
  await ensurePaymentProofBucket(supabase);

  const hash = makeHash(`${userId}:${Date.now()}:${Math.random()}`).slice(0, 16);
  const objectPath = `${userId}/${Date.now()}-${hash}.${parsed.ext}`;
  const { error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(objectPath, parsed.buffer, {
      contentType: parsed.mime,
      upsert: false
    });
  if (error) {
    throw new Error('Failed to upload payment proof');
  }

  return {
    bucket: PAYMENT_PROOF_BUCKET,
    path: objectPath,
    mime: parsed.mime,
    sizeBytes: parsed.sizeBytes
  };
}

async function createSignedProofUrl(supabase, path, expiresIn = 60 * 60 * 24) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(PAYMENT_PROOF_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

function parsePaymentNotes(notes) {
  const text = String(notes || '').trim();
  if (!text) {
    return {
      quote: null,
      receiverSnapshot: null,
      proof: null,
      userNote: '',
      audit: [],
      legacyNote: ''
    };
  }

  const parsed = parseJsonSafe(text, null);
  if (parsed && typeof parsed === 'object') {
    return {
      quote: parsed.quote || null,
      receiverSnapshot: parsed.receiverSnapshot || null,
      proof: parsed.proof || null,
      userNote: parsed.userNote || '',
      audit: Array.isArray(parsed.audit) ? parsed.audit : [],
      legacyNote: parsed.legacyNote || ''
    };
  }

  return {
    quote: null,
    receiverSnapshot: null,
    proof: null,
    userNote: '',
    audit: [],
    legacyNote: text
  };
}

function stringifyPaymentNotes(notes) {
  return JSON.stringify({
    quote: notes.quote || null,
    receiverSnapshot: notes.receiverSnapshot || null,
    proof: notes.proof || null,
    userNote: notes.userNote || '',
    audit: Array.isArray(notes.audit) ? notes.audit : [],
    legacyNote: notes.legacyNote || ''
  });
}

function appendPaymentAudit(existingNotes, auditEntry) {
  const notes = parsePaymentNotes(existingNotes);
  const nextAudit = Array.isArray(notes.audit) ? notes.audit : [];
  nextAudit.push({
    at: new Date().toISOString(),
    ...auditEntry
  });
  return stringifyPaymentNotes({
    ...notes,
    audit: nextAudit
  });
}

async function enrichPaymentForResponse(supabase, payment, { includeAudit = false } = {}) {
  const notes = parsePaymentNotes(payment?.notes);
  const proofPath = notes?.proof?.path || null;
  const proofUrl = proofPath ? await createSignedProofUrl(supabase, proofPath, 60 * 60 * 6) : null;

  return {
    ...payment,
    proof_url: proofUrl,
    note_meta: {
      userNote: notes.userNote || '',
      quote: notes.quote || null,
      receiverSnapshot: notes.receiverSnapshot || null,
      proof: notes.proof || null,
      legacyNote: notes.legacyNote || ''
    },
    ...(includeAudit ? { note_audit: notes.audit || [] } : {})
  };
}

async function fetchProviderModels(provider, apiKey) {
  const target = normalizeProviderName(provider);
  const key = String(apiKey || '').trim();

  if (target === 'anthropic') {
    return [
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', tier: 'paid' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku', tier: 'paid' },
      { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', tier: 'paid' }
    ];
  }

  if (!key) {
    throw new Error('API key is required for this provider');
  }

  if (target === 'google') {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
      12000,
      'Google models'
    );
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      throw new Error(data?.error?.message || `Google models request failed (${response.status})`);
    }
    return (Array.isArray(data.models) ? data.models : [])
      .filter((item) => Array.isArray(item.supportedGenerationMethods) && item.supportedGenerationMethods.includes('generateContent'))
      .map((item) => ({
        id: String(item.name || '').replace(/^models\//, ''),
        name: item.displayName || item.name || 'Gemini model',
        tier: 'mixed'
      }))
      .filter((item) => item.id);
  }

  const urlMap = {
    groq: 'https://api.groq.com/openai/v1/models',
    openai: 'https://api.openai.com/v1/models',
    openrouter: 'https://openrouter.ai/api/v1/models'
  };
  const response = await fetchWithTimeout(
    urlMap[target],
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(target === 'openrouter'
          ? {
              'X-Title': 'Transcript AI'
            }
          : {})
      }
    },
    12000,
    `${target} models`
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const apiError = data?.error?.message || data?.error;
    throw new Error(apiError || `${target} models request failed (${response.status})`);
  }

  const models = Array.isArray(data.data) ? data.data : [];
  return models
    .map((item) => {
      const promptPrice = Number(item?.pricing?.prompt ?? item?.pricing?.input ?? NaN);
      const completionPrice = Number(item?.pricing?.completion ?? item?.pricing?.output ?? NaN);
      let tier = 'paid';
      if (Number.isFinite(promptPrice) && Number.isFinite(completionPrice)) {
        tier = promptPrice === 0 && completionPrice === 0 ? 'free' : 'paid';
      } else if (target === 'groq') {
        tier = 'mixed';
      }
      return {
        id: item?.id || '',
        name: item?.id || item?.name || 'model',
        tier
      };
    })
    .filter((item) => item.id);
}

async function requestOpenAiCompatibleCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature = 0.4,
  maxTokens,
  extraHeaders = {}
}) {
  const payload = {
    model,
    messages,
    temperature
  };
  if (typeof maxTokens === 'number') payload.max_tokens = maxTokens;

  const response = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...extraHeaders
      },
      body: JSON.stringify(payload)
    },
    30000,
    'AI completion'
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const apiError = data?.error?.message || data?.error;
    throw new Error(apiError || `AI request failed (${response.status})`);
  }
  return data;
}

function toSimpleTextFromMessages(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const parts = [];
  for (const item of list) {
    const role = String(item?.role || 'user');
    const content = String(item?.content || '').trim();
    if (!content) continue;
    if (role === 'system') continue;
    parts.push(`${role.toUpperCase()}: ${content}`);
  }
  return parts.join('\n\n');
}

async function requestGoogleCompletion({ apiKey, model, messages, temperature = 0.4, maxTokens }) {
  const systemText = (Array.isArray(messages) ? messages : [])
    .filter((item) => item?.role === 'system')
    .map((item) => String(item?.content || '').trim())
    .filter(Boolean)
    .join('\n');
  const prompt = toSimpleTextFromMessages(messages);

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(typeof maxTokens === 'number' ? { maxOutputTokens: maxTokens } : {})
    },
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {})
  };

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    30000,
    'Google completion'
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error?.message || `Google request failed (${response.status})`);
  }

  const content = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => String(part?.text || '').trim())
    .filter(Boolean)
    .join('\n');

  return {
    choices: [{ message: { content } }]
  };
}

async function requestAnthropicCompletion({ apiKey, model, messages, temperature = 0.4, maxTokens }) {
  const list = Array.isArray(messages) ? messages : [];
  const system = list
    .filter((item) => item?.role === 'system')
    .map((item) => String(item?.content || '').trim())
    .filter(Boolean)
    .join('\n');

  const anthropicMessages = list
    .filter((item) => item?.role !== 'system')
    .map((item) => ({
      role: item?.role === 'assistant' ? 'assistant' : 'user',
      content: String(item?.content || '')
    }))
    .filter((item) => item.content.trim().length > 0);

  if (anthropicMessages.length === 0) {
    anthropicMessages.push({ role: 'user', content: 'Hello' });
  }

  const payload = {
    model,
    max_tokens: typeof maxTokens === 'number' ? maxTokens : 900,
    temperature,
    messages: anthropicMessages,
    ...(system ? { system } : {})
  };

  const response = await fetchWithTimeout(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    },
    30000,
    'Anthropic completion'
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const errorMessage = data?.error?.message || data?.error?.type;
    throw new Error(errorMessage || `Anthropic request failed (${response.status})`);
  }

  const content = (Array.isArray(data.content) ? data.content : [])
    .map((part) => (part?.type === 'text' ? String(part?.text || '') : ''))
    .join('\n')
    .trim();

  return {
    choices: [{ message: { content } }]
  };
}

async function createMultiProviderChatCompletion({ supabase, messages, temperature = 0.4, maxTokens }) {
  const config = await loadOrBootstrapAiProviderConfig(supabase);
  const provider = normalizeProviderName(config.selectedProvider);
  const model = String(config.selectedModel || defaultModelForProvider(provider)).trim() || defaultModelForProvider(provider);
  const activeKeyEntry = getActiveAiProviderKey(config, provider);
  if (!activeKeyEntry) {
    throw new Error(`AI provider "${provider}" active API key is missing or disabled`);
  }

  const endpointByProvider = {
    groq: 'https://api.groq.com/openai/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    openai: 'https://api.openai.com/v1'
  };
  const selectedKey = String(activeKeyEntry.apiKey || '').trim();

  try {
    let completion = null;
    if (provider === 'google') {
      completion = await requestGoogleCompletion({
        apiKey: selectedKey,
        model,
        messages,
        temperature,
        maxTokens
      });
    } else if (provider === 'anthropic') {
      completion = await requestAnthropicCompletion({
        apiKey: selectedKey,
        model,
        messages,
        temperature,
        maxTokens
      });
    } else {
      completion = await requestOpenAiCompatibleCompletion({
        baseUrl: endpointByProvider[provider] || endpointByProvider.groq,
        apiKey: selectedKey,
        model,
        messages,
        temperature,
        maxTokens,
        extraHeaders:
          provider === 'openrouter'
            ? {
                'X-Title': 'Transcript AI'
              }
            : {}
      });
    }

    recordRuntimeState('ai', provider, activeKeyEntry.id, { success: true });
    return completion;
  } catch (error) {
    recordRuntimeState('ai', provider, activeKeyEntry.id, {
      success: false,
      errorMessage: error?.message || 'AI key failed'
    });
    throw new Error(error?.message || `Active API key failed for provider "${provider}"`);
  }
}

async function getCachedExtractRecord(supabase, userId, videoId) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, video_id, video_title, transcript, ai_result, processing_type, created_at')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .eq('processing_type', EXTRACT_TYPE)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to load cached extraction');
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function getRecentGlobalExtractRecord(supabase, videoId, ttlMs = TRANSCRIPT_GLOBAL_CACHE_TTL_MS) {
  const cutoffIso = new Date(Date.now() - ttlMs).toISOString();
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, video_id, video_title, transcript, created_at, ai_result')
    .eq('video_id', videoId)
    .eq('processing_type', EXTRACT_TYPE)
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to load global cached extraction');
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function getPreferredVideoTitleForUser(supabase, userId, videoId, fallbackTitle = '') {
  const fallback = sanitizeVideoTitle(fallbackTitle, videoId || '');
  try {
    const { data, error } = await supabase
      .from('transcripts_history')
      .select('video_title, created_at')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .not('video_title', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return fallback;
    const candidate = Array.isArray(data) && data[0] ? sanitizeVideoTitle(data[0].video_title) : '';
    return candidate || fallback;
  } catch {
    return fallback;
  }
}

function buildYouTubeThumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function extractUrlsFromText(value) {
  const text = String(value || '');
  if (!text) return [];
  const protocolMatches = text.match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  const domainMatches = text.match(/\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>"')\]]*)?/gi) || [];
  const candidates = [...protocolMatches, ...domainMatches];

  const decodeRedirectTarget = (candidateUrl) => {
    try {
      let parsed = new URL(candidateUrl);
      const host = String(parsed.hostname || '').toLowerCase();
      const isYouTubeRedirectHost = host === 'youtube.com' || host.endsWith('.youtube.com');
      const isRedirectPath = String(parsed.pathname || '').toLowerCase() === '/redirect';
      if (!isYouTubeRedirectHost || !isRedirectPath) return candidateUrl;

      let target = parsed.searchParams.get('q') || parsed.searchParams.get('url') || '';
      if (!target) return candidateUrl;
      for (let i = 0; i < 2; i += 1) {
        try {
          const decoded = decodeURIComponent(target);
          if (decoded === target) break;
          target = decoded;
        } catch {
          break;
        }
      }
      parsed = new URL(target);
      return parsed.toString();
    } catch {
      return candidateUrl;
    }
  };

  const isInternalPlatformHost = (hostname) => {
    const host = String(hostname || '').toLowerCase();
    if (!host) return true;
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) return true;
    if (host === 'youtu.be') return true;
    if (host === 'google.com' || host.endsWith('.google.com')) return true;
    if (host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com')) return true;
    if (host === 'gstatic.com' || host.endsWith('.gstatic.com')) return true;
    return false;
  };

  const unique = new Map();
  const external = [];
  for (const raw of candidates) {
    let url = String(raw || '').trim();
    if (!url) continue;
    url = url.replace(/^[("'\[]+/, '').replace(/[),.;:\]]+$/, '').trim();
    if (!url) continue;

    if (!/^https?:\/\//i.test(url)) {
      if (/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+/i.test(url)) {
        url = `https://${url}`;
      } else {
        continue;
      }
    }

    url = decodeRedirectTarget(url);

    try {
      const parsed = new URL(url);
      if (!parsed.hostname || !parsed.hostname.includes('.')) continue;
      const normalized = parsed.toString();
      const dedupeKey = normalized.toLowerCase();
      if (!unique.has(dedupeKey)) {
        unique.set(dedupeKey, normalized);
        if (!isInternalPlatformHost(parsed.hostname)) {
          external.push(normalized);
        }
      }
    } catch {
      // Skip malformed URL candidates.
    }
  }
  if (external.length > 0) {
    return Array.from(new Set(external)).slice(0, 20);
  }
  return Array.from(unique.values()).slice(0, 20);
}

function extractInstructionLines(value) {
  const text = String(value || '');
  if (!text) return [];

  const splitInlineSteps = (line) => {
    const raw = String(line || '');
    if (!raw) return [];
    const parts = raw.split(/\s+(?=(?:\d{1,2}[.)-]\s+|step\s+\d+[:.\-]?))/gi);
    return parts.length > 1 ? parts : [raw];
  };

  const normalizeLine = (rawLine) => {
    let line = decodeXmlEntities(String(rawLine || '').trim());
    if (!line) return '';
    line = line.replace(/https?:\/\/[^\s)]+/gi, ' ');
    line = line.replace(/^\s*\d{1,2}:\d{2}(?::\d{2})?\s+/, '');
    line = line.replace(/^\s*(?:\d+[.)-]|[-*]|\u2022)\s+/, '');
    line = line.replace(/\s*(?:[\u2014\u2013-]|\.)\s*\d+\s*$/, '');
    line = line.replace(/\s+/g, ' ').trim();
    if (line.length < 8 || line.length > 220) return '';
    return line;
  };

  const lines = text
    .split(/\r?\n/)
    .flatMap(splitInlineSteps)
    .map(normalizeLine)
    .filter(Boolean);

  if (lines.length === 0) return [];

  const actionHints =
    /(step|install|open|create|set|run|configure|copy|paste|enable|disable|use|visit|click|download|upload|guide|tutorial|setup|command|issue|solution|\u0642\u0645|\u0627\u0641\u062a\u062d|\u062b\u0628\u062a|\u0634\u063a\u0644|\u0627\u0646\u0633\u062e|\u0627\u0644\u0635\u0642|\u0627\u0633\u062a\u062e\u062f\u0645|\u062a\u0623\u0643\u062f|\u0641\u0639\u0644|\u0639\u0637\u0644|\u0627\u0636\u0628\u0637|\u0627\u062e\u062a\u0631|\u0631\u0627\u062c\u0639|\u062e\u0637\u0648\u0629|\u0634\u0631\u062d|\u062f\u0644\u064a\u0644|\u0637\u0631\u064a\u0642\u0629)/i;
  const ranked = lines
    .map((line) => ({
      line,
      score:
        (actionHints.test(line) ? 2 : 0) +
        (/^\d+[.)-]\s*/.test(line) || /^[-*]\s+/.test(line) ? 2 : 0) +
        (line.includes(':') ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score);

  const picked = [];
  const seen = new Set();
  for (const item of ranked) {
    const normalized = item.line
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    picked.push(item.line);
    if (picked.length >= 12) break;
  }
  return picked;
}

function parseExtractMeta(rawMeta, videoId) {
  const parsed = parseJsonSafe(rawMeta, {});
  const links = Array.isArray(parsed.descriptionLinks)
    ? parsed.descriptionLinks.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 20)
    : [];
  const instructions = Array.isArray(parsed.descriptionInstructions)
    ? parsed.descriptionInstructions.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 10)
    : [];

  return {
    method: String(parsed.method || '').trim() || null,
    transcriptKeyId: String(parsed.transcriptKeyId || '').trim() || null,
    thumbnailUrl: String(parsed.thumbnailUrl || '').trim() || buildYouTubeThumbnailUrl(videoId),
    descriptionLinks: links,
    descriptionInstructions: instructions
  };
}

function shouldHydrateExtractMeta(meta = {}) {
  const links = Array.isArray(meta.descriptionLinks) ? meta.descriptionLinks : [];
  const instructions = Array.isArray(meta.descriptionInstructions) ? meta.descriptionInstructions : [];
  const thumbnail = String(meta.thumbnailUrl || '').trim();
  return links.length === 0 || instructions.length === 0 || !thumbnail;
}

function normalizeExtractMetaForSave(meta = {}, videoId, methodFallback = 'cached') {
  return {
    method: String(meta.method || '').trim() || methodFallback,
    transcriptKeyId: String(meta.transcriptKeyId || '').trim() || null,
    thumbnailUrl: String(meta.thumbnailUrl || '').trim() || buildYouTubeThumbnailUrl(videoId),
    descriptionLinks: Array.isArray(meta.descriptionLinks)
      ? meta.descriptionLinks.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 20)
      : [],
    descriptionInstructions: Array.isArray(meta.descriptionInstructions)
      ? meta.descriptionInstructions.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 10)
      : []
  };
}

function isTranscriptCacheCompatible(meta = {}, activeTranscriptKeyId = '') {
  const method = String(meta.method || '').trim().toLowerCase();
  if (method !== 'transcriptapi') return false;
  const activeKeyId = String(activeTranscriptKeyId || '').trim();
  if (!activeKeyId) return true;
  const cachedKeyId = String(meta.transcriptKeyId || '').trim();
  return Boolean(cachedKeyId) && cachedKeyId === activeKeyId;
}

async function hydrateExtractMetaIfNeeded(videoId, currentMeta = {}, fallbackTitle = '') {
  const normalizedCurrent = normalizeExtractMetaForSave(currentMeta, videoId, currentMeta.method || 'cached');
  if (!shouldHydrateExtractMeta(normalizedCurrent)) {
    return normalizedCurrent;
  }
  const fetched = await fetchYouTubeVideoMetadata(videoId, fallbackTitle);
  const merged = {
    ...normalizedCurrent,
    thumbnailUrl: fetched.thumbnailUrl || normalizedCurrent.thumbnailUrl,
    descriptionLinks: fetched.descriptionLinks?.length ? fetched.descriptionLinks : normalizedCurrent.descriptionLinks,
    descriptionInstructions: fetched.descriptionInstructions?.length
      ? fetched.descriptionInstructions
      : normalizedCurrent.descriptionInstructions
  };
  return normalizeExtractMetaForSave(merged, videoId, normalizedCurrent.method || 'cached');
}

async function fetchYouTubeVideoTitle(videoId) {
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;
  try {
    const response = await fetchWithTimeout(
      oEmbedUrl,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      },
      4500,
      'YouTube title lookup'
    );
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    const title = sanitizeVideoTitle(payload?.title || '');
    return title || null;
  } catch {
    return null;
  }
}

function decodeJsonEscapedString(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  try {
    return String(JSON.parse(`"${value}"`) || '');
  } catch {
    return '';
  }
}

function extractJsonObjectAfterMarker(text, marker) {
  const source = String(text || '');
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const objectStart = source.indexOf('{', start + marker.length);
  if (objectStart < 0) return '';

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = objectStart; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') {
      depth += 1;
      continue;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(objectStart, i + 1);
      }
    }
  }
  return '';
}

async function fetchYouTubeWatchDescription(videoId) {
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`;
  try {
    const response = await fetchWithTimeout(
      canonicalUrl,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      },
      5000,
      'YouTube watch page'
    );
    if (!response.ok) return '';

    const html = await response.text();
    if (!html) return '';

    const candidates = [];

    const escapedPatterns = [
      /"shortDescription":"((?:\\.|[^"\\])*)"/g,
      /"attributedDescriptionBodyText":\{"content":"((?:\\.|[^"\\])*)"/g,
      /"description":\{"simpleText":"((?:\\.|[^"\\])*)"/g
    ];
    for (const regex of escapedPatterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
          const decoded = decodeJsonEscapedString(match[1]);
          if (decoded) candidates.push(decodeXmlEntities(decoded));
        }
        if (candidates.length >= 4) break;
      }
      if (candidates.length >= 4) break;
    }

    if (candidates.length === 0) {
      const playerJsonText = extractJsonObjectAfterMarker(html, 'ytInitialPlayerResponse =');
      if (playerJsonText) {
        const playerJson = parseJsonSafe(playerJsonText, null);
        const shortDescription = String(playerJson?.videoDetails?.shortDescription || '').trim();
        if (shortDescription) {
          candidates.push(decodeXmlEntities(shortDescription));
        }
      }
    }

    if (candidates.length === 0) {
      const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      if (metaMatch?.[1]) {
        const decodedMeta = decodeXmlEntities(metaMatch[1]);
        if (decodedMeta) candidates.push(decodedMeta);
      }
    }

    const bestDirect = candidates.find((item) => item.length >= 20) || '';
    if (bestDirect) return bestDirect;

    // Fallback for bot-check / restricted watch pages on some hosts.
    const jinaResponse = await fetchWithTimeout(
      `https://r.jina.ai/http://www.youtube.com/watch?v=${videoId}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/plain,text/markdown'
        }
      },
      7000,
      'Jina watch fallback'
    );
    if (!jinaResponse.ok) return '';
    const jinaText = await jinaResponse.text();
    if (!jinaText) return '';

    const blocks = jinaText
      .split(/\r?\n\r?\n+/)
      .map((line) => String(line || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (!blocks.length) return '';

    let candidate =
      blocks.find((block) => /video_description/i.test(block)) ||
      blocks.find((block) => /\.\.\.more|…more/i.test(block)) ||
      '';

    if (!candidate) {
      const chaptersIndex = blocks.findIndex((block) => /^chapters$/i.test(block));
      if (chaptersIndex > 0) {
        for (let i = chaptersIndex - 1; i >= Math.max(0, chaptersIndex - 5); i -= 1) {
          const block = blocks[i];
          if (!block) continue;
          if (/^(?:\d[\d,.]*\s+views|subscribe|share|save|download)$/i.test(block)) continue;
          if (block.length >= 20) {
            candidate = block;
            break;
          }
        }
      }
    }

    if (!candidate) {
      candidate = blocks.find((block) => block.length >= 20 && /https?:\/\/|www\./i.test(block)) || '';
    }
    if (!candidate) return '';

    const chapterSnippets = blocks
      .filter((block) => /####/.test(block) && /\b\d{1,2}:\d{2}(?::\d{2})?\b/.test(block))
      .slice(0, 8)
      .map((block) => block.replace(/#+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const merged = chapterSnippets.length ? `${candidate}\n${chapterSnippets.join('\n')}` : candidate;

    return merged
      .replace(/\[\s*([^\]]+?)\s*\]\((https?:\/\/[^\s)]+)\)/g, '$1 $2')
      .replace(/\.\.\.more|…more/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

async function fetchYouTubeVideoMetadata(videoId, fallbackTitle = '') {
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const metadata = {
    title: sanitizeVideoTitle(fallbackTitle, videoId),
    thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
    descriptionLinks: [],
    descriptionInstructions: []
  };

  try {
    const oEmbedResponse = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      },
      4500,
      'YouTube metadata oEmbed'
    );
    if (oEmbedResponse.ok) {
      const payload = await oEmbedResponse.json().catch(() => null);
      const title = sanitizeVideoTitle(payload?.title || '', metadata.title || videoId);
      const thumbnail = String(payload?.thumbnail_url || '').trim();
      if (title) metadata.title = title;
      if (thumbnail) metadata.thumbnailUrl = thumbnail;
    }
  } catch {
    // Best-effort only.
  }

  try {
    const watchDescription = await fetchYouTubeWatchDescription(videoId);
    if (watchDescription) {
      metadata.descriptionLinks = extractUrlsFromText(watchDescription);
      metadata.descriptionInstructions = extractInstructionLines(watchDescription);
    }
  } catch {
    // Keep previously collected metadata.
  }

  try {
    const info = await withTimeout(ytdl.getInfo(videoId, { agent: YTDL_AGENT }), 8000, 'YouTube metadata ytdl');
    const details = info?.videoDetails || {};
    const detailTitle = sanitizeVideoTitle(details.title || '', metadata.title || videoId);
    if (detailTitle) metadata.title = detailTitle;

    const thumbList = Array.isArray(details.thumbnails) ? details.thumbnails : [];
    const bestThumb = thumbList
      .filter((item) => item?.url)
      .sort((a, b) => Number(b.width || 0) - Number(a.width || 0))[0];
    if (bestThumb?.url) metadata.thumbnailUrl = String(bestThumb.url);

    const description = String(details.description || details.shortDescription || '').trim();
    if (description) {
      if (!metadata.descriptionLinks.length) {
        metadata.descriptionLinks = extractUrlsFromText(description);
      }
      if (!metadata.descriptionInstructions.length) {
        metadata.descriptionInstructions = extractInstructionLines(description);
      }
    }
  } catch {
    // Keep oEmbed/default values.
  }

  return metadata;
}

async function saveExtractionRecord(supabase, userId, videoId, transcript, method, videoTitle = '', meta = {}) {
  const normalizedMeta = {
    method,
    transcriptKeyId: String(meta.transcriptKeyId || '').trim() || null,
    thumbnailUrl: String(meta.thumbnailUrl || '').trim() || buildYouTubeThumbnailUrl(videoId),
    descriptionLinks: Array.isArray(meta.descriptionLinks) ? meta.descriptionLinks.slice(0, 20) : [],
    descriptionInstructions: Array.isArray(meta.descriptionInstructions) ? meta.descriptionInstructions.slice(0, 10) : []
  };

  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: sanitizeVideoTitle(videoTitle, videoId),
        transcript,
        ai_result: JSON.stringify(normalizedMeta),
        processing_type: EXTRACT_TYPE
      }
    ]);
  if (error) {
    throw new Error('Failed to save extraction history');
  }
}

async function getCachedAiRecord(supabase, userId, videoId, processingType) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, ai_result, created_at')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .eq('processing_type', processingType)
    .not('ai_result', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) {
    throw new Error('Failed to load cached AI result');
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function saveAiRecord(supabase, userId, videoId, processingType, transcript, result, videoTitle = '') {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: sanitizeVideoTitle(videoTitle, videoId),
        transcript,
        ai_result: result,
        processing_type: processingType
      }
    ]);
  if (error) {
    throw new Error('Failed to save AI history');
  }
}

async function getCachedChatRecord(supabase, userId, videoId, chatKey) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id, ai_result, created_at')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .eq('processing_type', chatKey)
    .not('ai_result', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) {
    throw new Error('Failed to load cached chat response');
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function saveChatRecord(supabase, userId, videoId, chatKey, question, response, videoTitle = '') {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: sanitizeVideoTitle(videoTitle, videoId),
        transcript: question,
        ai_result: response,
        processing_type: chatKey
      }
    ]);
  if (error) {
    throw new Error('Failed to save chat history');
  }
}

async function renameVideoTitleForUser(supabase, userId, videoId, title) {
  const normalizedTitle = sanitizeVideoTitle(title);
  if (!normalizedTitle) {
    throw new Error('Title is required');
  }

  const { data, error } = await supabase
    .from('transcripts_history')
    .update({ video_title: normalizedTitle })
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .select('id, video_id, video_title');

  if (error) {
    throw new Error('Failed to rename video title');
  }

  return {
    videoId,
    title: normalizedTitle,
    updatedCount: Array.isArray(data) ? data.length : 0
  };
}

function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
}

function parsePaginationFromUrl(url, defaults = { limit: 50, maxLimit: 200 }) {
  const parsedUrl = new URL(String(url || ''), 'http://localhost');
  const limit = Math.min(Math.max(toInteger(parsedUrl.searchParams.get('limit'), defaults.limit), 1), defaults.maxLimit);
  const page = Math.max(toInteger(parsedUrl.searchParams.get('page'), 1), 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset, searchParams: parsedUrl.searchParams };
}

async function addCreditsToUser(supabase, userId, creditsToAdd) {
  const amount = toInteger(creditsToAdd, 0);
  if (amount <= 0) {
    throw new Error('Credits to add must be greater than zero');
  }

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, credits')
    .eq('id', userId)
    .single();
  if (userError || !userRow) {
    throw new Error('Target user not found');
  }

  const nextCredits = toInteger(userRow.credits, 0) + amount;
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: nextCredits })
    .eq('id', userId);
  if (updateError) {
    throw new Error('Failed to update user credits');
  }
  return nextCredits;
}

async function listAdminUsersWithStats(supabase, { limit, offset }) {
  const from = offset;
  const to = offset + limit - 1;
  let users = null;
  const preferredUsersResponse = await supabase
    .from('users')
    .select('id, email, credits, subscription_tier, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (preferredUsersResponse.error) {
    if (!isMissingRelationError(preferredUsersResponse.error)) throw preferredUsersResponse.error;
    const fallbackUsersResponse = await supabase
      .from('users')
      .select('id, email, credits, created_at')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (fallbackUsersResponse.error) throw fallbackUsersResponse.error;
    users = fallbackUsersResponse.data;
  } else {
    users = preferredUsersResponse.data;
  }

  const rows = Array.isArray(users) ? users : [];
  if (rows.length === 0) return [];

  const ids = rows.map((item) => item.id);
  const { data: paymentRows, error: paymentError } = await supabase
    .from('payments')
    .select('user_id, amount_cents, credits_added, status, created_at')
    .in('user_id', ids)
    .order('created_at', { ascending: false });
  if (paymentError && !isMissingRelationError(paymentError)) throw paymentError;

  const { data: usageRows, error: usageError } = await supabase
    .from('user_usage')
    .select('user_id, monthly_quota, used_this_month, last_reset_at')
    .in('user_id', ids);
  if (usageError && !isMissingRelationError(usageError)) throw usageError;

  const paymentMap = new Map();
  for (const row of paymentRows || []) {
    const key = row.user_id;
    if (!paymentMap.has(key)) {
      paymentMap.set(key, {
        totalPayments: 0,
        approvedPayments: 0,
        pendingPayments: 0,
        rejectedPayments: 0,
        paidCredits: 0,
        paidAmountCents: 0,
        lastPaymentAt: null
      });
    }
    const stats = paymentMap.get(key);
    stats.totalPayments += 1;
    if (!stats.lastPaymentAt || new Date(row.created_at).getTime() > new Date(stats.lastPaymentAt).getTime()) {
      stats.lastPaymentAt = row.created_at;
    }
    if (row.status === 'approved') {
      stats.approvedPayments += 1;
      stats.paidCredits += toInteger(row.credits_added, 0);
      stats.paidAmountCents += toInteger(row.amount_cents, 0);
    } else if (row.status === 'rejected') {
      stats.rejectedPayments += 1;
    } else {
      stats.pendingPayments += 1;
    }
  }

  const usageMap = new Map();
  for (const row of usageRows || []) {
    const key = String(row?.user_id || '').trim();
    if (!key) continue;
    usageMap.set(key, normalizeUsageRow(row));
  }

  return rows.map((item) => {
    const stats = paymentMap.get(item.id) || {
      totalPayments: 0,
      approvedPayments: 0,
      pendingPayments: 0,
      rejectedPayments: 0,
      paidCredits: 0,
      paidAmountCents: 0,
      lastPaymentAt: null
    };
    const usage = usageMap.get(item.id) || normalizeUsageRow({});
    const tier = normalizeTier(item.subscription_tier);
    const monthlyQuotaEligible = tier === 'free' && Number(stats.approvedPayments || 0) === 0;
    return {
      ...item,
      credits: toInteger(item.credits, 0),
      subscription_tier: tier,
      monthlyQuotaEligible,
      monthlyQuota: monthlyQuotaEligible ? usage.monthlyQuota : 0,
      usedThisMonth: monthlyQuotaEligible ? usage.usedThisMonth : 0,
      monthlyQuotaRemaining: monthlyQuotaEligible ? usage.remaining : 0,
      quotaLastResetAt: monthlyQuotaEligible ? usage.lastResetAt : null,
      quotaNextResetAt: monthlyQuotaEligible ? usage.nextResetAt : null,
      stats
    };
  });
}

async function getAdminUsageSummary(supabase, { days = 7 } = {}) {
  const safeDays = Math.min(Math.max(toInteger(days, 7), 1), 30);
  const sinceIso = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('api_request_logs')
    .select('route, user_id, ip, video_id, status_code, success, response_time_ms, error_code, created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(8000);
  if (error) {
    if (isMissingRelationError(error)) {
      return {
        days: safeDays,
        totalRequests: 0,
        successCount: 0,
        failedCount: 0,
        successRate: 0,
        avgResponseMs: 0,
        byRoute: [],
        topAbusiveIps: [],
        topActiveUsers: [],
        generatedAt: new Date().toISOString(),
        schemaReady: false
      };
    }
    throw new Error('Failed to load usage analytics');
  }

  const rows = Array.isArray(data) ? data : [];
  const byRoute = new Map();
  const ipFailures = new Map();
  const byUser = new Map();
  let successCount = 0;
  let failedCount = 0;
  let responseTotal = 0;

  for (const row of rows) {
    const route = String(row.route || 'unknown');
    const routeStats = byRoute.get(route) || {
      route,
      total: 0,
      success: 0,
      failed: 0,
      avgResponseMs: 0
    };
    routeStats.total += 1;
    if (row.success) {
      routeStats.success += 1;
      successCount += 1;
    } else {
      routeStats.failed += 1;
      failedCount += 1;
      const ipKey = String(row.ip || 'unknown');
      ipFailures.set(ipKey, (ipFailures.get(ipKey) || 0) + 1);
    }
    const responseTime = toInteger(row.response_time_ms, 0);
    responseTotal += responseTime;
    routeStats.avgResponseMs = Math.round((routeStats.avgResponseMs * (routeStats.total - 1) + responseTime) / routeStats.total);
    byRoute.set(route, routeStats);

    const userKey = String(row.user_id || '');
    if (userKey) {
      byUser.set(userKey, (byUser.get(userKey) || 0) + 1);
    }
  }

  const topAbusiveIps = Array.from(ipFailures.entries())
    .map(([ip, failedRequests]) => ({ ip, failedRequests }))
    .sort((a, b) => b.failedRequests - a.failedRequests)
    .slice(0, 10);

  const topActiveUsers = Array.from(byUser.entries())
    .map(([userId, requests]) => ({ userId, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  return {
    days: safeDays,
    totalRequests: rows.length,
    successCount,
    failedCount,
    successRate: rows.length > 0 ? Number(((successCount / rows.length) * 100).toFixed(2)) : 0,
    avgResponseMs: rows.length > 0 ? Math.round(responseTotal / rows.length) : 0,
    byRoute: Array.from(byRoute.values()).sort((a, b) => b.total - a.total),
    topAbusiveIps,
    topActiveUsers,
    generatedAt: new Date().toISOString()
  };
}

function calculateTopupQuote(amountCents) {
  const amount = Number(amountCents || 0);
  if (!Number.isInteger(amount) || amount < 500 || amount % 500 !== 0) {
    throw new Error('Amount must be a multiple of $5 (500 cents)');
  }
  const packs = amount / 500;
  const baseCredits = packs * 200;

  let bonusRate = 0;
  if (packs >= 20) bonusRate = 0.25;
  else if (packs >= 10) bonusRate = 0.18;
  else if (packs >= 4) bonusRate = 0.1;
  else if (packs >= 2) bonusRate = 0.05;

  const credits = Math.round(baseCredits * (1 + bonusRate));
  return {
    amountCents: amount,
    packs,
    baseCredits,
    bonusRate,
    credits
  };
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function parseAllowedOrigins() {
  const fromEnv = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv]));
}

const ALLOWED_ORIGINS = parseAllowedOrigins();

function isLocalhostOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(origin || '').trim());
}

function isVercelPreviewOrigin(origin) {
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(String(origin || '').trim());
}

function isOriginAllowed(origin) {
  const value = String(origin || '').trim();
  if (!value) return true;
  if (isLocalhostOrigin(value)) return true;
  if (isVercelPreviewOrigin(value)) return true;
  return ALLOWED_ORIGINS.includes(value);
}

function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const direct = req.headers?.['x-real-ip'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }
  if (typeof req.socket?.remoteAddress === 'string' && req.socket.remoteAddress.trim()) {
    return req.socket.remoteAddress.trim();
  }
  return 'unknown';
}

function applySecurityHeaders(res) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  res.setHeader('Cache-Control', 'no-store');
}

function applyCors(req, res) {
  const origin = String(req.headers?.origin || '').trim();
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function makeErrorPayload(status, code, message, details) {
  return {
    success: false,
    error: {
      code: String(code || STATUS_DEFAULT_ERROR_CODE[status] || STATUS_DEFAULT_ERROR_CODE[500]),
      message: String(message || 'Internal error'),
      ...(details && typeof details === 'object' ? { details } : {})
    }
  };
}

function normalizeErrorPayload(payload, statusCode = 500) {
  if (!payload || typeof payload !== 'object') {
    return makeErrorPayload(statusCode, STATUS_DEFAULT_ERROR_CODE[statusCode], 'Internal error');
  }
  if (payload.success !== false) return payload;

  const output = { ...payload };
  if (typeof output.error === 'string') {
    output.error = {
      code: STATUS_DEFAULT_ERROR_CODE[statusCode] || STATUS_DEFAULT_ERROR_CODE[500],
      message: output.error
    };
    return output;
  }
  if (!output.error || typeof output.error !== 'object') {
    output.error = {
      code: STATUS_DEFAULT_ERROR_CODE[statusCode] || STATUS_DEFAULT_ERROR_CODE[500],
      message: 'Internal error'
    };
    return output;
  }
  output.error = {
    code: String(output.error.code || STATUS_DEFAULT_ERROR_CODE[statusCode] || STATUS_DEFAULT_ERROR_CODE[500]),
    message: String(output.error.message || output.error.error || 'Internal error'),
    ...(output.error.details && typeof output.error.details === 'object' ? { details: output.error.details } : {})
  };
  return output;
}

function sendError(res, status, code, message, details) {
  return res.status(status).json(makeErrorPayload(status, code, message, details));
}

function isDurableRateLimitRule(ruleName) {
  const rule = RATE_LIMIT_RULES[ruleName];
  return rule?.storage === 'durable';
}

function hashRateLimitIdentity(ruleName, identity) {
  const normalizedIdentity = String(identity || '').trim().toLowerCase();
  return crypto
    .createHash('sha256')
    .update(`${ruleName}:${normalizedIdentity}`)
    .digest('base64url')
    .slice(0, 32);
}

function buildRateLimitMarkerVideoId(ruleName, identityHash) {
  return `rate_limit:${ruleName}:${identityHash}`;
}

function toTimestampMs(value, fallback = Date.now()) {
  const parsed = new Date(value || '').getTime();
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getRateLimitOwnerUserId(supabase) {
  const forced = String(process.env.RATE_LIMIT_OWNER_USER_ID || '').trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(forced)) {
    return forced;
  }

  if (!supabase) return '';
  if (rateLimitOwnerUserIdCache.value && rateLimitOwnerUserIdCache.expiresAt > Date.now()) {
    return rateLimitOwnerUserIdCache.value;
  }

  const adminConfig = await loadOrBootstrapAdminConfig(supabase);
  const ownerUserId = String(adminConfig?.userId || '').trim();
  if (!ownerUserId) return '';
  rateLimitOwnerUserIdCache = {
    value: ownerUserId,
    expiresAt: Date.now() + RATE_LIMIT_OWNER_CACHE_TTL_MS
  };
  return ownerUserId;
}

async function pruneDurableRateLimitMarkers(supabase, ownerUserId, markerVideoId, cutoffIso) {
  await supabase
    .from('transcripts_history')
    .delete()
    .eq('user_id', ownerUserId)
    .eq('processing_type', RATE_LIMIT_MARKER_TYPE)
    .eq('video_id', markerVideoId)
    .lt('created_at', cutoffIso);
}

async function consumeDurableRateLimit(supabase, ruleName, identity) {
  const rule = RATE_LIMIT_RULES[ruleName];
  const key = String(identity || '').trim();
  if (!rule || !key) {
    return { allowed: true, remaining: Infinity, resetAt: Date.now() };
  }

  const ownerUserId = await getRateLimitOwnerUserId(supabase);
  if (!ownerUserId) {
    throw new Error('Rate limit owner user is not configured');
  }

  const now = Date.now();
  const windowStartIso = new Date(now - rule.windowMs).toISOString();
  const identityHash = hashRateLimitIdentity(ruleName, key);
  const markerVideoId = buildRateLimitMarkerVideoId(ruleName, identityHash);

  const { data: recentRows, error: recentError } = await supabase
    .from('transcripts_history')
    .select('created_at')
    .eq('user_id', ownerUserId)
    .eq('processing_type', RATE_LIMIT_MARKER_TYPE)
    .eq('video_id', markerVideoId)
    .gte('created_at', windowStartIso)
    .order('created_at', { ascending: true })
    .limit(rule.limit);

  if (recentError) {
    throw new Error('Failed to load durable rate-limit state');
  }

  const rows = Array.isArray(recentRows) ? recentRows : [];
  const firstSeenMs = rows.length > 0 ? toTimestampMs(rows[0]?.created_at, now) : now;
  const resetAt = firstSeenMs + rule.windowMs;

  if (rows.length >= rule.limit) {
    if (Math.random() < 0.05) {
      await pruneDurableRateLimitMarkers(supabase, ownerUserId, markerVideoId, windowStartIso);
    }
    return {
      allowed: false,
      remaining: 0,
      resetAt
    };
  }

  const { error: insertError } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: ownerUserId,
        video_id: markerVideoId,
        video_title: `[rate-limit:${ruleName}]`,
        transcript: identityHash,
        ai_result: null,
        processing_type: RATE_LIMIT_MARKER_TYPE
      }
    ]);

  if (insertError) {
    throw new Error('Failed to persist durable rate-limit state');
  }

  if (Math.random() < 0.05) {
    await pruneDurableRateLimitMarkers(supabase, ownerUserId, markerVideoId, windowStartIso);
  }

  const nextResetAt = rows.length > 0 ? resetAt : now + rule.windowMs;
  return {
    allowed: true,
    remaining: Math.max(rule.limit - (rows.length + 1), 0),
    resetAt: nextResetAt
  };
}

function pruneRateLimitBucket(bucket, now = Date.now()) {
  for (const [key, entry] of bucket.entries()) {
    if (!entry || typeof entry !== 'object' || entry.resetAt <= now) {
      bucket.delete(key);
    }
  }
}

function consumeMemoryRateLimit(ruleName, identity) {
  const rule = RATE_LIMIT_RULES[ruleName];
  const key = String(identity || '').trim();
  if (!rule || !key) {
    return { allowed: true, remaining: Infinity, resetAt: Date.now() };
  }
  const bucket = rateLimitStore[ruleName];
  const now = Date.now();
  if (bucket.size > 5000) {
    pruneRateLimitBucket(bucket, now);
  }

  const entry = bucket.get(key);
  if (!entry || entry.resetAt <= now) {
    bucket.set(key, {
      count: 1,
      resetAt: now + rule.windowMs
    });
    return {
      allowed: true,
      remaining: rule.limit - 1,
      resetAt: now + rule.windowMs
    };
  }

  if (entry.count >= rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  bucket.set(key, entry);
  return {
    allowed: true,
    remaining: Math.max(rule.limit - entry.count, 0),
    resetAt: entry.resetAt
  };
}

async function consumeRateLimit(ruleName, identity, { supabase = null } = {}) {
  const rule = RATE_LIMIT_RULES[ruleName];
  const key = String(identity || '').trim();
  if (!rule || !key) {
    return { allowed: true, remaining: Infinity, resetAt: Date.now() };
  }

  if (isDurableRateLimitRule(ruleName) && supabase) {
    try {
      return await consumeDurableRateLimit(supabase, ruleName, key);
    } catch (error) {
      console.warn(`[rate-limit] durable limiter fallback for ${ruleName}: ${error?.message || 'unknown error'}`);
    }
  }

  return consumeMemoryRateLimit(ruleName, key);
}

function setRateLimitHeaders(res, check, ruleName) {
  const rule = RATE_LIMIT_RULES[ruleName];
  if (!rule) return;
  res.setHeader('X-RateLimit-Limit', String(rule.limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(Number(check?.remaining || 0), 0)));
  const retrySeconds = Math.max(Math.ceil((Number(check?.resetAt || Date.now()) - Date.now()) / 1000), 0);
  res.setHeader('X-RateLimit-Reset', String(Math.floor(Number(check?.resetAt || Date.now()) / 1000)));
  if (!check?.allowed && retrySeconds > 0) {
    res.setHeader('Retry-After', String(retrySeconds));
  }
}

async function enforceRateLimit(res, ruleName, identity, message = 'Too many requests', { supabase = null } = {}) {
  const check = await consumeRateLimit(ruleName, identity, { supabase });
  setRateLimitHeaders(res, check, ruleName);
  if (check.allowed) return true;
  sendError(res, 429, 'RATE_LIMITED', message, {
    rule: ruleName,
    retryAfterSeconds: Math.max(Math.ceil((check.resetAt - Date.now()) / 1000), 0)
  });
  return false;
}

function getCachedTranscriptFromMemory(videoId) {
  const key = String(videoId || '').trim();
  if (!key) return null;
  const entry = transcriptMemoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    transcriptMemoryCache.delete(key);
    return null;
  }
  return entry;
}

function setCachedTranscriptInMemory(videoId, transcript, method, transcriptKeyId = '') {
  const key = String(videoId || '').trim();
  const text = String(transcript || '').trim();
  if (!key || !text) return;
  transcriptMemoryCache.set(key, {
    transcript: text,
    method: String(method || 'unknown'),
    transcriptKeyId: String(transcriptKeyId || '').trim() || null,
    expiresAt: Date.now() + TRANSCRIPT_GLOBAL_CACHE_TTL_MS
  });
  if (transcriptMemoryCache.size > TRANSCRIPT_MEMORY_CACHE_MAX_ITEMS) {
    const firstKey = transcriptMemoryCache.keys().next().value;
    if (firstKey) transcriptMemoryCache.delete(firstKey);
  }
}

function normalizeGuestToken(value) {
  const token = String(value || '').trim();
  if (!token) return '';
  if (!/^[A-Za-z0-9_-]{24,120}$/.test(token)) return '';
  return token;
}

function pruneGuestExtractUsage(now = Date.now()) {
  for (const [token, record] of guestExtractUsage.entries()) {
    if (!record || typeof record !== 'object') {
      guestExtractUsage.delete(token);
      continue;
    }
    if (Number(record.lastUsedAt || 0) + GUEST_EXTRACT_TOKEN_TTL_MS <= now) {
      guestExtractUsage.delete(token);
    }
  }
}

function getGuestExtractStatus(rawToken) {
  const token = normalizeGuestToken(rawToken);
  if (!token) {
    return {
      token: '',
      allowed: false,
      used: 0,
      remaining: 0
    };
  }

  const now = Date.now();
  if (guestExtractUsage.size > 10000) {
    pruneGuestExtractUsage(now);
  }

  const record = guestExtractUsage.get(token);
  const used = Math.max(Number(record?.used || 0), 0);
  return {
    token,
    allowed: used < GUEST_EXTRACT_LIMIT_PER_TOKEN,
    used,
    remaining: Math.max(GUEST_EXTRACT_LIMIT_PER_TOKEN - used, 0)
  };
}

function markGuestExtractUsed(rawToken) {
  const token = normalizeGuestToken(rawToken);
  if (!token) return;
  const now = Date.now();
  const current = guestExtractUsage.get(token);
  const nextUsed = Math.max(Number(current?.used || 0), 0) + 1;
  guestExtractUsage.set(token, {
    used: nextUsed,
    lastUsedAt: now
  });
}

function isMissingRelationError(error) {
  if (!error || typeof error !== 'object') return false;
  const code = String(error.code || '').trim();
  const message = String(error.message || '').toLowerCase();
  if (code === '42P01' || code === '42703' || code === 'PGRST205' || code === 'PGRST204') return true;
  return (
    message.includes('does not exist') ||
    message.includes('relation') ||
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('could not find the') && message.includes('column')
  );
}

async function logApiRequestSafe(supabase, payload) {
  if (!supabase || !payload || typeof payload !== 'object') return;
  try {
    await supabase.from('api_request_logs').insert([payload]);
  } catch {
    // Non-blocking analytics path.
  }
}

function decodeXmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeTextInput(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeVideoTitle(value, fallback = '') {
  const normalized = normalizeTextInput(value);
  if (!normalized) return String(fallback || '').trim();
  return normalized.slice(0, 140).trim();
}

function normalizeOutputLang(value) {
  const lang = String(value || '').trim().toLowerCase();
  return OUTPUT_LANG_CONFIG[lang] ? lang : DEFAULT_OUTPUT_LANG;
}

function outputLanguageInstruction(langCode) {
  const normalized = normalizeOutputLang(langCode);
  return OUTPUT_LANG_CONFIG[normalized]?.instruction || OUTPUT_LANG_CONFIG[DEFAULT_OUTPUT_LANG].instruction;
}

function outputFormattingInstruction() {
  return (
    'Return clean Markdown only. ' +
    'Use clear section headings, and keep each bullet point on its own line. ' +
    'Do not return JSON, code blocks, HTML tags, or escaped characters like <br> or \\n. ' +
    'Always finish with a complete final sentence and never cut off mid-sentence.'
  );
}

function scriptRatio(value, regex) {
  const text = String(value || '').trim();
  if (!text) return 0;
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length === 0) return 0;
  const scriptChars = text.match(regex) || [];
  return scriptChars.length / letters.length;
}

function isLikelyTextForOutputLang(value, langCode) {
  const text = String(value || '').trim();
  if (!text) return false;
  const lang = normalizeOutputLang(langCode);

  const latinRatio = scriptRatio(text, /[A-Za-z\u00C0-\u024F]/g);
  const arabicRatio = scriptRatio(text, /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
  const cyrillicRatio = scriptRatio(text, /[\u0400-\u04FF]/g);
  const devanagariRatio = scriptRatio(text, /[\u0900-\u097F]/g);
  const hanRatio = scriptRatio(text, /[\u4E00-\u9FFF]/g);
  const hiraKataRatio = scriptRatio(text, /[\u3040-\u30FF]/g);
  const hangulRatio = scriptRatio(text, /[\uAC00-\uD7AF]/g);

  if (lang === 'ar' || lang === 'ur') return arabicRatio >= 0.22;
  if (lang === 'ru') return cyrillicRatio >= 0.22;
  if (lang === 'hi') return devanagariRatio >= 0.22;
  if (lang === 'zh') return hanRatio >= 0.22;
  if (lang === 'ja') return hiraKataRatio >= 0.12 || hanRatio >= 0.18;
  if (lang === 'ko') return hangulRatio >= 0.22;

  // Latin-script output languages: en/fr/es/de/it/pt/tr/id
  return (
    latinRatio >= 0.4 &&
    arabicRatio < 0.2 &&
    cyrillicRatio < 0.2 &&
    devanagariRatio < 0.2 &&
    hanRatio < 0.2 &&
    hiraKataRatio < 0.2 &&
    hangulRatio < 0.2
  );
}

async function enforceOutputLanguageIfNeeded({ supabase, text, outputLang, maxTokens = 700 }) {
  const content = String(text || '').trim();
  if (!content) return '';

  const lang = normalizeOutputLang(outputLang);
  if (isLikelyTextForOutputLang(content, lang)) return content;

  try {
    const completion = await createMultiProviderChatCompletion({
      supabase,
      messages: [
        {
          role: 'system',
          content:
            `${outputLanguageInstruction(lang)}\n${outputFormattingInstruction()}\n` +
            'Rewrite the user text strictly in the requested output language only. Preserve meaning, section order, numbering, and bullet structure.'
        },
        { role: 'user', content }
      ],
      temperature: 0.2,
      maxTokens: Math.max(180, Math.min(Number(maxTokens || 700) + 200, 1800))
    });
    const translated = String(completion?.choices?.[0]?.message?.content || '').trim();
    if (translated && isLikelyTextForOutputLang(translated, lang)) {
      return translated;
    }
    if (translated) return translated;
  } catch {
    // Fallback to original content if localization retry fails.
  }

  return content;
}

function resolveAiProcessingProfile(type, outputLang = DEFAULT_OUTPUT_LANG) {
  const normalizedType = String(type || '').trim().toLowerCase();
  const langInstruction = outputLanguageInstruction(outputLang);
  const formattingInstruction = outputFormattingInstruction();
  const langSuffix = normalizeOutputLang(outputLang);

  const profiles = {
    summary: {
      baseType: 'summary',
      clientType: 'summary:lecture',
      processingType: `summary:lecture:${langSuffix}`,
      maxTokens: 1300,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        [
          'You are in LECTURE SUMMARY mode.',
          'Reconstruct the teaching flow exactly as explained in the video, in chronological order.',
          'Required structure:',
          '1) Chronological explanation timeline (ordered sections that follow the lecture sequence).',
          '2) Instructor examples exactly as presented in the lecture.',
          '3) Repeated/emphasized points and why they were emphasized.',
          '4) Warnings and common mistakes mentioned (if any).',
          '5) Final concise takeaway that reflects the actual lecture close.',
          'Strict rules:',
          '- Do NOT convert content into learning objectives.',
          '- Do NOT create concept maps.',
          '- Do NOT add quiz questions.',
          '- Do NOT use generic educational templates.',
          '- Stay faithful to what was actually said.'
        ].join('\n')
    },
    'summary:lecture': {
      baseType: 'summary',
      clientType: 'summary:lecture',
      processingType: `summary:lecture:${langSuffix}`,
      maxTokens: 1300,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        [
          'You are in LECTURE SUMMARY mode.',
          'Reconstruct the teaching flow exactly as explained in the video, in chronological order.',
          'Required structure:',
          '1) Chronological explanation timeline (ordered sections that follow the lecture sequence).',
          '2) Instructor examples exactly as presented in the lecture.',
          '3) Repeated/emphasized points and why they were emphasized.',
          '4) Warnings and common mistakes mentioned (if any).',
          '5) Final concise takeaway that reflects the actual lecture close.',
          'Strict rules:',
          '- Do NOT convert content into learning objectives.',
          '- Do NOT create concept maps.',
          '- Do NOT add quiz questions.',
          '- Do NOT use generic educational templates.',
          '- Stay faithful to what was actually said.'
        ].join('\n')
    },
    'summary:study-review': {
      baseType: 'summary',
      clientType: 'summary:study-review',
      processingType: `summary:study-review:${langSuffix}`,
      maxTokens: 1300,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        [
          'You are in STUDY REVIEW mode.',
          'Transform the content into a fast revision sheet, not a lecture replay.',
          'Required structure:',
          '1) Learning objectives (4-7 clear objectives).',
          '2) Concept map (hierarchical bullets showing relationships).',
          '3) Quick revision points (high-density bullets for last-minute review).',
          '4) Short quiz (5 questions) with concise model answers.',
          'Focus on exam/review readiness and compact structure.'
        ].join('\n')
    },
    'summary:study': {
      baseType: 'summary',
      clientType: 'summary:study-review',
      processingType: `summary:study-review:${langSuffix}`,
      maxTokens: 1300,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        [
          'You are in STUDY REVIEW mode.',
          'Transform the content into a fast revision sheet, not a lecture replay.',
          'Required structure:',
          '1) Learning objectives (4-7 clear objectives).',
          '2) Concept map (hierarchical bullets showing relationships).',
          '3) Quick revision points (high-density bullets for last-minute review).',
          '4) Short quiz (5 questions) with concise model answers.',
          'Focus on exam/review readiness and compact structure.'
        ].join('\n')
    },
    'summary:review': {
      baseType: 'summary',
      clientType: 'summary:study-review',
      processingType: `summary:study-review:${langSuffix}`,
      maxTokens: 1300,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        [
          'You are in STUDY REVIEW mode.',
          'Transform the content into a fast revision sheet, not a lecture replay.',
          'Required structure:',
          '1) Learning objectives (4-7 clear objectives).',
          '2) Concept map (hierarchical bullets showing relationships).',
          '3) Quick revision points (high-density bullets for last-minute review).',
          '4) Short quiz (5 questions) with concise model answers.',
          'Focus on exam/review readiness and compact structure.'
        ].join('\n')
    },
    'key-insights': {
      baseType: 'key-insights',
      processingType: `key-insights:${langSuffix}`,
      maxTokens: 1100,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Extract 7-12 key insights. For each insight provide: the insight, why it matters, and an actionable implication.'
    },
    'clean-transcript': {
      baseType: 'clean-transcript',
      processingType: `clean-transcript:${langSuffix}`,
      maxTokens: 1000,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Rewrite this transcript into a clean readable script by removing filler words, repetitions, and noise while preserving meaning and sequence.'
    },
    'proper-notes': {
      baseType: 'proper-notes',
      processingType: `proper-notes:${langSuffix}`,
      maxTokens: 1200,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Generate structured notes with headings, concise bullet points, definitions, and important examples from the transcript.'
    },
    steps: {
      baseType: 'steps',
      processingType: `steps:${langSuffix}`,
      maxTokens: 1100,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Extract an actionable step-by-step plan with ordered numbering, prerequisites, and expected result for each step.'
    },
    resources: {
      baseType: 'resources',
      processingType: `resources:${langSuffix}`,
      maxTokens: 1000,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Extract all tools, links, platforms, references, and resources mentioned. Group them by type and explain each item briefly.'
    },
    'study-kit': {
      baseType: 'study-kit',
      processingType: `study-kit:${langSuffix}`,
      maxTokens: 1400,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Build a study pack: learning objectives, concept map, quick revision notes, and 8 quiz questions with short answers.'
    },
    'content-kit': {
      baseType: 'content-kit',
      processingType: `content-kit:${langSuffix}`,
      maxTokens: 1400,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Build a content creator pack: 5 post hooks, 3 short-form script ideas, blog outline, and 10 SEO keywords from the transcript.'
    },
    all: {
      baseType: 'all',
      processingType: `all:${langSuffix}`,
      maxTokens: 1800,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Provide a comprehensive analysis package with sections: Summary, Key Insights, Steps, Resources, and final action checklist.'
    },
    'description-instructions': {
      baseType: 'description-instructions',
      processingType: `description-instructions:${langSuffix}`,
      maxTokens: 550,
      saveHistory: false,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Convert the provided description lines into a clean, concise numbered list of actionable steps only. Keep it faithful and do not add unrelated points.'
    },
    'video-brief': {
      baseType: 'video-brief',
      processingType: `video-brief:${langSuffix}`,
      maxTokens: 120,
      saveHistory: false,
      prompt:
        `${langInstruction}\n${formattingInstruction}\n` +
        'Generate one short subtitle line (max 14 words) that summarizes the video value in a natural, marketing-friendly style. Use only the requested output language.'
    }
  };

  return profiles[normalizedType] || profiles.all;
}
function trimForModel(value, maxChars) {
  const text = normalizeTextInput(value);
  if (!text) {
    return { text: '', truncated: false, originalLength: 0 };
  }
  if (text.length <= maxChars) {
    return { text, truncated: false, originalLength: text.length };
  }

  const clipped = text.slice(0, maxChars);
  const lastWordBreak = clipped.lastIndexOf(' ');
  const safeText = lastWordBreak > Math.floor(maxChars * 0.7) ? clipped.slice(0, lastWordBreak) : clipped;

  return {
    text: safeText.trim(),
    truncated: true,
    originalLength: text.length
  };
}

function getTranscriptStats(rawText = '') {
  const text = String(rawText).trim();
  const cleaned = text
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  return {
    wordsCount: words.length,
    uniqueWords
  };
}

function isUsableTranscript(text = '') {
  const stats = getTranscriptStats(text);
  return stats.wordsCount >= 3 && stats.uniqueWords >= 2;
}

async function fetchWithTranscriptApi(videoUrl, supabase, transcriptConfig = null) {
  const config = transcriptConfig || (supabase ? await loadOrBootstrapTranscriptApiConfig(supabase) : { keys: [], activeKeyId: '' });
  const candidates = getTranscriptApiKeyCandidates(config);
  if (candidates.length === 0) return null;

  const encodedUrl = encodeURIComponent(videoUrl);
  let lastError = null;

  for (const keyEntry of candidates) {
    const apiKey = String(keyEntry.apiKey || '').trim();
    if (!apiKey) continue;
    try {
      const response = await fetchWithTimeout(
        `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodedUrl}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'User-Agent': USER_AGENT,
            Accept: 'application/json'
          }
        },
        12000,
        'TranscriptAPI request'
      );

      if (!response.ok) {
        lastError = new Error(`TranscriptAPI failed with status ${response.status}`);
        recordRuntimeState('transcript', 'transcript', keyEntry.id, {
          success: false,
          errorMessage: lastError.message
        });
        continue;
      }

      const data = await response.json().catch(() => null);
      if (!data?.transcript || !Array.isArray(data.transcript)) {
        lastError = new Error('TranscriptAPI response did not include transcript');
        recordRuntimeState('transcript', 'transcript', keyEntry.id, {
          success: false,
          errorMessage: lastError.message
        });
        continue;
      }

      const transcript = data.transcript.map((item) => item.text || '').join(' ').trim();
      if (transcript) {
        recordRuntimeState('transcript', 'transcript', keyEntry.id, { success: true });
        return {
          transcript,
          keyId: String(keyEntry.id || '').trim() || null
        };
      }
      lastError = new Error('TranscriptAPI returned empty transcript');
      recordRuntimeState('transcript', 'transcript', keyEntry.id, {
        success: false,
        errorMessage: lastError.message
      });
    } catch (error) {
      lastError = error;
      recordRuntimeState('transcript', 'transcript', keyEntry.id, {
        success: false,
        errorMessage: error?.message || 'Transcript key failed'
      });
    }
  }

  if (lastError) {
    return null;
  }
  return null;
}

export default async function handler(req, res) {
  const requestStartedAt = Date.now();
  const url = req.url || '';
  const pathname = getPathname(url);
  const body = readBody(req);
  const requestIp = getClientIp(req);

  const audit = {
    ip: requestIp,
    route: pathname,
    method: String(req.method || 'GET').toUpperCase(),
    userId: null,
    videoId: null,
    tier: 'anonymous',
    errorCode: null
  };

  applySecurityHeaders(res);
  applyCors(req, res);

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const statusCode = Number(res.statusCode || 200);
    const normalizedPayload = normalizeErrorPayload(payload, statusCode);
    const success = normalizedPayload?.success !== false && statusCode < 400;
    if (!success) {
      audit.errorCode = normalizedPayload?.error?.code || STATUS_DEFAULT_ERROR_CODE[statusCode] || STATUS_DEFAULT_ERROR_CODE[500];
    }
    const responseTimeMs = Date.now() - requestStartedAt;
    const supabase = getSupabase();
    void logApiRequestSafe(supabase, {
      user_id: audit.userId,
      ip: audit.ip,
      route: audit.route,
      method: audit.method,
      video_id: audit.videoId,
      tier: audit.tier,
      status_code: statusCode,
      success,
      response_time_ms: responseTimeMs,
      error_code: audit.errorCode,
      created_at: new Date().toISOString()
    });
    return originalJson(normalizedPayload);
  };

  const requestOrigin = String(req.headers?.origin || '').trim();
  if (requestOrigin && !isOriginAllowed(requestOrigin)) {
    return sendError(res, 403, 'CORS_FORBIDDEN', 'Request origin is not allowed');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (pathname.startsWith('/api/') && !(await enforceRateLimit(res, 'ipGlobal', requestIp, 'Too many requests from this IP'))) {
    return;
  }

  if (!ENV_VALIDATION.valid && pathname.startsWith('/api/') && pathname !== '/api/settings/status') {
    return sendError(res, 500, 'SERVER_MISCONFIGURED', 'Server environment is not configured correctly', {
      missing: ENV_VALIDATION.missingRequired
    });
  }

  if (isProtectedUserApiPath(pathname)) {
    const user = await getAuthedUser(req);
    if (!user) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Authentication required');
    }
    if (!isUserEmailVerified(user)) {
      return sendError(
        res,
        403,
        EMAIL_NOT_VERIFIED_CODE,
        'Email is not verified. Please verify your email before accessing protected resources.'
      );
    }
  }

  try {
    if (pathname === '/api/settings/status') {
      return res.json({ success: true, managedInBackend: true });
    }

    if (pathname === '/api/public/transcript/extract' && req.method === 'POST') {
      const guestSupabase = getSupabase();
      if (!(await enforceRateLimit(res, 'guestExtractIp', requestIp, 'Too many guest extraction attempts from this IP', { supabase: guestSupabase }))) return;

      const guestStatus = getGuestExtractStatus(body.guestToken || body.guest_token);
      if (!guestStatus.token) {
        return sendError(res, 400, 'INVALID_GUEST_TOKEN', 'Guest token is required');
      }
      if (!guestStatus.allowed) {
        return sendError(res, 403, 'GUEST_LIMIT_REACHED', 'Guest free extraction limit reached. Please create a free account to continue.');
      }

      const supabase = guestSupabase;
      const { url: videoUrl } = body;
      const parsedVideo = parseYouTubeInput(videoUrl);
      if (!parsedVideo.ok) {
        return sendError(
          res,
          400,
          parsedVideo.code === 'INVALID_VIDEO_ID' ? 'INVALID_VIDEO_ID' : 'INVALID_INPUT',
          parsedVideo.message
        );
      }

      const videoId = parsedVideo.videoId;
      audit.tier = 'guest';
      audit.videoId = videoId;
      const transcriptConfig = supabase ? await loadOrBootstrapTranscriptApiConfig(supabase) : { keys: [], activeKeyId: '' };
      const activeTranscriptKeyId = getActiveTranscriptApiKeyId(transcriptConfig);
      if (!activeTranscriptKeyId) {
        return sendError(
          res,
          503,
          'TRANSCRIPT_API_NOT_CONFIGURED',
          'Transcript API active key is missing or disabled. Configure it in admin first.'
        );
      }
      let transcript = null;
      let method = 'unknown';
      let extractMeta = parseExtractMeta(null, videoId);

      const memoryCache = getCachedTranscriptFromMemory(videoId);
      if (!transcript && memoryCache?.transcript) {
        const memoryMeta = {
          method: memoryCache.method || 'memory-cache',
          transcriptKeyId: memoryCache.transcriptKeyId || null
        };
        if (isTranscriptCacheCompatible(memoryMeta, activeTranscriptKeyId)) {
          transcript = memoryCache.transcript;
          method = memoryMeta.method;
          extractMeta = {
            ...extractMeta,
            ...memoryMeta
          };
        }
      }

      if (!transcript && supabase) {
        const globalCache = await getRecentGlobalExtractRecord(supabase, videoId, TRANSCRIPT_GLOBAL_CACHE_TTL_MS);
        if (globalCache?.transcript) {
          const globalMeta = parseExtractMeta(globalCache.ai_result, videoId);
          if (isTranscriptCacheCompatible(globalMeta, activeTranscriptKeyId)) {
            transcript = String(globalCache.transcript || '').trim();
            method = globalMeta.method || 'global-db-cache';
            extractMeta = {
              ...extractMeta,
              ...globalMeta
            };
            if (transcript) {
              setCachedTranscriptInMemory(videoId, transcript, method, globalMeta.transcriptKeyId || activeTranscriptKeyId);
            }
          }
        }
      }

      if (!transcript) {
        try {
          const transcriptResult = await withTimeout(
            fetchWithTranscriptApi(parsedVideo.canonicalUrl, supabase, transcriptConfig),
            EXTRACTION_TIMEOUT_MS,
            'Guest TranscriptAPI pipeline'
          );
          if (transcriptResult?.transcript && isUsableTranscript(transcriptResult.transcript)) {
            transcript = transcriptResult.transcript;
            method = 'transcriptapi';
            extractMeta = {
              ...extractMeta,
              method,
              transcriptKeyId: transcriptResult.keyId || activeTranscriptKeyId
            };
          } else {
            transcript = null;
          }
        } catch {}
      }

      if (!transcript) {
        return sendError(
          res,
          400,
          'TRANSCRIPT_UNAVAILABLE',
          'No transcript is available for this video (captions unavailable or unsupported).'
        );
      }

      transcript = String(transcript || '').trim();
      setCachedTranscriptInMemory(videoId, transcript, method, extractMeta.transcriptKeyId || activeTranscriptKeyId);

      const metadata = await fetchYouTubeVideoMetadata(videoId, extractMeta.videoTitle || videoId);
      extractMeta = {
        ...extractMeta,
        ...metadata,
        method
      };

      markGuestExtractUsed(guestStatus.token);

      return res.json({
        success: true,
        guest: true,
        videoId,
        videoTitle: sanitizeVideoTitle(extractMeta.title || extractMeta.videoTitle || '', videoId),
        transcript,
        wordCount: transcript.split(/\s+/).length,
        method,
        thumbnailUrl: extractMeta.thumbnailUrl || buildYouTubeThumbnailUrl(videoId),
        descriptionLinks: Array.isArray(extractMeta.descriptionLinks) ? extractMeta.descriptionLinks.slice(0, 20) : [],
        descriptionInstructions: Array.isArray(extractMeta.descriptionInstructions) ? extractMeta.descriptionInstructions.slice(0, 10) : [],
        guestRemaining: Math.max(guestStatus.remaining - 1, 0)
      });
    }

    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const signupSupabase = getSupabase();
      if (!(await enforceRateLimit(res, 'authSignupIp', requestIp, 'Too many registration attempts from this IP', { supabase: signupSupabase }))) return;

      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const turnstileToken = String(body.turnstileToken || body.antiBotToken || '').trim();
      const emailRedirectTo = normalizeRedirectUrl(body.emailRedirectTo || body.redirectTo, req);

      if (!email || !email.includes('@')) {
        return sendError(res, 400, 'INVALID_INPUT', 'Valid email is required');
      }
      if (password.length < 8) {
        return sendError(res, 400, 'INVALID_INPUT', 'Password must be at least 8 characters');
      }

      const antiBot = await validateTurnstileToken(turnstileToken, requestIp);
      if (!antiBot.ok) {
        return sendError(res, 400, antiBot.code || 'ANTI_BOT_INVALID', antiBot.message || 'Anti-bot verification failed', antiBot.details);
      }

      const signupResponse = await requestSupabaseAuth('/auth/v1/signup', {
        method: 'POST',
        body: {
          email,
          password,
          options: emailRedirectTo ? { emailRedirectTo } : {}
        }
      });

      if (!signupResponse.ok) {
        const message = extractSupabaseAuthErrorMessage(signupResponse.data, 'Signup failed');
        const status = signupResponse.status === 429 ? 429 : 400;
        const code = signupResponse.status === 429 ? 'RATE_LIMITED' : 'AUTH_SIGNUP_FAILED';
        return sendError(res, status, code, message);
      }

      const authUser = signupResponse.data?.user || null;
      const supabase = getSupabase();
      if (supabase && authUser?.id) {
        try {
          await ensureUserAccountRow(supabase, authUser);
          await ensureUserUsageRow(supabase, authUser.id);
        } catch {
          // Non-blocking bootstrap fallback; auth account is already created.
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          requiresEmailVerification: true,
          message: 'Account created. Please verify your email before logging in.',
          email
        }
      });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const loginSupabase = getSupabase();
      if (!(await enforceRateLimit(res, 'authLoginIp', requestIp, 'Too many login attempts from this IP', { supabase: loginSupabase }))) return;

      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      if (!email || !password) {
        return sendError(res, 400, 'INVALID_INPUT', 'Email and password are required');
      }

      const loginResponse = await requestSupabaseAuth('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email, password }
      });

      if (!loginResponse.ok) {
        const message = extractSupabaseAuthErrorMessage(loginResponse.data, 'Invalid email or password');
        const status = loginResponse.status === 429 ? 429 : 401;
        const code = loginResponse.status === 429 ? 'RATE_LIMITED' : 'AUTH_INVALID_CREDENTIALS';
        return sendError(res, status, code, message);
      }

      const session = loginResponse.data || {};
      const authUser = session.user || null;
      if (!isUserEmailVerified(authUser)) {
        return sendError(
          res,
          403,
          EMAIL_NOT_VERIFIED_CODE,
          'Email is not verified. Please verify your email before logging in.'
        );
      }

      const supabase = getSupabase();
      if (supabase && authUser?.id) {
        try {
          await ensureUserAccountRow(supabase, authUser);
          await ensureUserUsageRow(supabase, authUser.id);
        } catch {
          // Keep login flow resilient even if bootstrap update fails.
        }
      }

      const maxAge = Math.max(Number(session.expires_in || 3600), 60);
      const proto = String(req.headers?.['x-forwarded-proto'] || '').toLowerCase();
      const secureAttr = proto === 'https' || String(req.headers?.origin || '').startsWith('https://') ? 'Secure; ' : '';
      if (session.access_token) {
        res.setHeader(
          'Set-Cookie',
          [
            `sb_access_token=${encodeURIComponent(String(session.access_token))}; Path=/; HttpOnly; ${secureAttr}SameSite=Lax; Max-Age=${maxAge}`,
            session.refresh_token
              ? `sb_refresh_token=${encodeURIComponent(String(session.refresh_token))}; Path=/; HttpOnly; ${secureAttr}SameSite=Lax; Max-Age=${maxAge * 2}`
              : `sb_refresh_token=; Path=/; HttpOnly; ${secureAttr}SameSite=Lax; Max-Age=0`
          ]
        );
      }

      return res.json({
        success: true,
        data: {
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
            token_type: session.token_type,
            user: authUser
          }
        }
      });
    }

    if (pathname === '/api/auth/resend-verification' && req.method === 'POST') {
      const resendSupabase = getSupabase();
      if (!(await enforceRateLimit(res, 'authResendIp', requestIp, 'Too many verification email requests', { supabase: resendSupabase }))) return;

      const email = normalizeEmail(body.email);
      if (!email || !email.includes('@')) {
        return sendError(res, 400, 'INVALID_INPUT', 'Valid email is required');
      }

      const emailRedirectTo = normalizeRedirectUrl(body.emailRedirectTo || body.redirectTo, req);
      const resendResponse = await requestSupabaseAuth('/auth/v1/resend', {
        method: 'POST',
        body: {
          type: 'signup',
          email,
          options: emailRedirectTo ? { emailRedirectTo } : {}
        }
      });

      if (!resendResponse.ok && resendResponse.status !== 429) {
        // Keep response generic to avoid account enumeration.
        return res.json({
          success: true,
          data: {
            message: 'If this email is registered, a verification message has been sent.'
          }
        });
      }

      if (resendResponse.status === 429) {
        return sendError(res, 429, 'RATE_LIMITED', 'Too many resend attempts. Please try again later.');
      }

      return res.json({
        success: true,
        data: {
          message: 'If this email is registered, a verification message has been sent.'
        }
      });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const proto = String(req.headers?.['x-forwarded-proto'] || '').toLowerCase();
      const secureAttr = proto === 'https' || String(req.headers?.origin || '').startsWith('https://') ? 'Secure; ' : '';
      res.setHeader('Set-Cookie', [
        `sb_access_token=; Path=/; HttpOnly; ${secureAttr}SameSite=Lax; Max-Age=0`,
        `sb_refresh_token=; Path=/; HttpOnly; ${secureAttr}SameSite=Lax; Max-Age=0`
      ]);
      return res.json({ success: true });
    }

    if (pathname === '/api/me') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!(await enforceRateLimit(res, 'genericByUser', user.id, 'Too many profile requests', { supabase }))) return;

      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);
      const adminConfig = await loadOrBootstrapAdminConfig(supabase);
      const subscription = await resolveUserSubscriptionState(supabase, userRow, {
        isAdminUser: user.id === adminConfig.userId
      });
      const access = await getUserAccessState(supabase, user.id);
      const monthlyUsage = await getUserUsageSummary(supabase, user.id);
      const paidBefore = subscription.tier === 'admin' ? true : await hasApprovedPayments(supabase, user.id);
      const monthlyQuotaEligible = subscription.tier === 'free' && !paidBefore;
      const effectiveMonthlyQuota = monthlyQuotaEligible ? monthlyUsage.monthlyQuota : 0;
      const effectiveUsedThisMonth = monthlyQuotaEligible ? monthlyUsage.usedThisMonth : 0;
      const effectiveMonthlyRemaining = monthlyQuotaEligible ? monthlyUsage.remaining : 0;
      audit.userId = user.id;
      audit.tier = subscription.tier;

      return res.json({
        success: true,
        data: {
          id: userRow.id,
          email: userRow.email,
          credits: Number(userRow.credits || 0),
          subscriptionTier: subscription.tier,
          subscriptionExpiresAt: subscription.expiresAt,
          dailyExtractLimit: subscription.dailyLimit,
          dailyExtractUsed: subscription.dailyExtractUsed,
          dailyExtractRemaining: subscription.dailyExtractRemaining,
          featureAccess: subscription.features,
          monthlyQuotaEligible,
          freePlanLimit: effectiveMonthlyQuota,
          freeLinksUsed: effectiveUsedThisMonth,
          freeLinksRemaining: effectiveMonthlyRemaining,
          monthlyQuota: effectiveMonthlyQuota,
          usedThisMonth: effectiveUsedThisMonth,
          monthlyQuotaRemaining: effectiveMonthlyRemaining,
          quotaLastResetAt: monthlyQuotaEligible ? monthlyUsage.lastResetAt : null,
          quotaNextResetAt: monthlyQuotaEligible ? monthlyUsage.nextResetAt : null,
          accessStatus: access.status,
          accessReason: access.reason
        }
      });
    }

    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      if (!(await enforceRateLimit(res, 'adminLoginIp', requestIp, 'Too many admin login attempts', { supabase }))) return;

      let config = await loadOrBootstrapAdminConfig(supabase);
      const identifierRaw = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const validIdentifier =
        identifierRaw &&
        (identifierRaw === String(config.username || '').toLowerCase() ||
          identifierRaw === String(config.email || '').toLowerCase());
      const validPassword = verifyPassword(password, config.passwordHash);

      if (!validIdentifier || !validPassword) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
      }

      if (isLegacyPasswordHash(config.passwordHash)) {
        try {
          const migratedConfig = {
            ...config,
            passwordHash: hashPassword(password)
          };
          await saveAdminConfig(supabase, migratedConfig);
          config = migratedConfig;
        } catch {
          // Non-blocking migration fallback.
        }
      }

      const token = signAdminToken(config);
      audit.tier = 'admin';
      return res.json({
        success: true,
        token,
        admin: {
          username: config.username,
          email: config.email,
          userId: config.userId
        }
      });
    }

    if (pathname === '/api/admin/overview' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      audit.userId = adminSession.config.userId || null;
      audit.tier = 'admin';

      const usersCountResponse = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (usersCountResponse.error) throw usersCountResponse.error;
      const usersCount = toInteger(usersCountResponse.count, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount_cents, credits_added, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);
      if (paymentsError) throw paymentsError;

      const { data: extracts, error: extractsError } = await supabase
        .from('transcripts_history')
        .select('video_id, user_id, created_at')
        .eq('processing_type', EXTRACT_TYPE)
        .order('created_at', { ascending: false })
        .limit(5000);
      if (extractsError) throw extractsError;

      const paymentsStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        approvedAmountCents: 0,
        approvedCredits: 0
      };
      for (const row of payments || []) {
        paymentsStats.total += 1;
        if (row.status === 'approved') {
          paymentsStats.approved += 1;
          paymentsStats.approvedAmountCents += toInteger(row.amount_cents, 0);
          paymentsStats.approvedCredits += toInteger(row.credits_added, 0);
        } else if (row.status === 'rejected') {
          paymentsStats.rejected += 1;
        } else {
          paymentsStats.pending += 1;
        }
      }

      const uniqueUserLinks = new Set();
      for (const item of extracts || []) {
        if (item?.user_id && item?.video_id) {
          uniqueUserLinks.add(`${item.user_id}::${item.video_id}`);
        }
      }
      const accessConfig = await loadOrBootstrapUserAccessConfig(supabase);
      const blockedUsersCount = Object.keys(accessConfig.blockedUsers || {}).length;
      const suspendedUsersCount = Object.keys(accessConfig.suspendedUsers || {}).length;

      return res.json({
        success: true,
        data: {
          admin: {
            username: adminSession.config.username,
            email: adminSession.config.email
          },
          usersCount,
          payments: paymentsStats,
          usage: {
            extractRecords: Array.isArray(extracts) ? extracts.length : 0,
            uniqueExtractedLinks: uniqueUserLinks.size
          },
          usersAccess: {
            blocked: blockedUsersCount,
            suspended: suspendedUsersCount
          },
          generatedAt: new Date().toISOString()
        }
      });
    }

    if (pathname === '/api/admin/usage' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      const { searchParams } = parsePaginationFromUrl(url, { limit: 1, maxLimit: 1 });
      const days = toInteger(searchParams.get('days'), 7);
      const usage = await getAdminUsageSummary(supabase, { days });
      audit.userId = adminSession.config.userId || null;
      audit.tier = 'admin';
      return res.json({ success: true, data: usage });
    }

    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const { limit, page, offset } = parsePaginationFromUrl(url, { limit: 25, maxLimit: 200 });
      const rows = await listAdminUsersWithStats(supabase, { limit, offset });
      const accessConfig = await loadOrBootstrapUserAccessConfig(supabase);
      const enrichedRows = rows.map((item) => {
        const access = getUserAccessStateFromConfig(accessConfig, item.id);
        return {
          ...item,
          access
        };
      });
      const usersCountResponse = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (usersCountResponse.error) throw usersCountResponse.error;

      return res.json({
        success: true,
        data: enrichedRows,
        pagination: {
          page,
          limit,
          total: toInteger(usersCountResponse.count, 0)
        }
      });
    }

    if (pathname === '/api/admin/payments' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const { limit, page, offset, searchParams } = parsePaginationFromUrl(url, { limit: 40, maxLimit: 200 });
      const statusFilter = String(searchParams.get('status') || '').trim().toLowerCase();
      const userIdFilter = String(searchParams.get('userId') || '').trim();

      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (userIdFilter) query = query.eq('user_id', userIdFilter);

      const { data, error } = await query;
      if (error) throw error;
      const items = await Promise.all(
        (Array.isArray(data) ? data : []).map((item) =>
          enrichPaymentForResponse(supabase, item, { includeAudit: true })
        )
      );

      return res.json({
        success: true,
        data: items,
        pagination: { page, limit }
      });
    }

    const adminPaymentReviewMatch = pathname.match(/^\/api\/admin\/payments\/([^/]+)\/review$/);
    if (adminPaymentReviewMatch && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const paymentId = adminPaymentReviewMatch[1];
      const decision = String(body.status || '').trim().toLowerCase();
      const note = String(body.note || '').trim();
      if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({ success: false, error: 'status must be approved or rejected' });
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      if (paymentError || !payment) {
        return res.status(404).json({ success: false, error: 'Payment request not found' });
      }

      if (payment.status === 'approved' && decision !== 'approved') {
        return res.status(400).json({ success: false, error: 'Approved payments cannot be downgraded' });
      }

      let userCreditsAfter = null;
      let subscriptionExpiresAt = null;
      const changedToApproved = payment.status !== 'approved' && decision === 'approved';
      if (changedToApproved) {
        userCreditsAfter = await addCreditsToUser(supabase, payment.user_id, payment.credits_added);
        subscriptionExpiresAt = new Date(Date.now() + PRO_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('users')
          .update({
            subscription_tier: 'pro',
            subscription_expires_at: subscriptionExpiresAt
          })
          .eq('id', payment.user_id);
      }

      const mergedNotes = appendPaymentAudit(payment.notes, {
        admin: adminSession.config.username,
        decision,
        note
      });

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: decision,
          notes: mergedNotes
        })
        .eq('id', payment.id)
        .select('*')
        .single();
      if (updateError) throw updateError;

      return res.json({
        success: true,
        payment: await enrichPaymentForResponse(supabase, updatedPayment, { includeAudit: true }),
        userCreditsAfter,
        subscriptionExpiresAt
      });
    }

    if (pathname === '/api/admin/settings' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      return res.json({
        success: true,
        data: {
          username: adminSession.config.username,
          email: adminSession.config.email,
          userId: adminSession.config.userId
        }
      });
    }

    if (pathname === '/api/admin/settings' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const current = adminSession.config;
      const nextUsername = String(body.username || current.username).trim();
      const nextEmail = String(body.email || current.email).trim().toLowerCase();
      const nextPassword = String(body.password || '').trim();
      if (!nextUsername || !nextEmail) {
        return res.status(400).json({ success: false, error: 'username and email are required' });
      }

      try {
        await authAdminRequest(`/auth/v1/admin/users/${current.userId}`, {
          method: 'PUT',
          body: JSON.stringify({
            email: nextEmail,
            ...(nextPassword ? { password: nextPassword } : {}),
            user_metadata: {
              is_admin: true,
              username: nextUsername
            }
          })
        });
      } catch (authError) {
        return res.status(400).json({ success: false, error: authError.message || 'Failed to update auth admin user' });
      }

      const nextConfig = {
        userId: current.userId,
        username: nextUsername,
        email: nextEmail,
        passwordHash: nextPassword ? hashPassword(nextPassword) : current.passwordHash
      };
      await saveAdminConfig(supabase, nextConfig);

      const { error: userUpdateError } = await supabase.from('users').update({ email: nextEmail }).eq('id', current.userId);
      if (userUpdateError) throw userUpdateError;

      const token = signAdminToken(nextConfig);
      return res.json({
        success: true,
        token,
        data: {
          username: nextConfig.username,
          email: nextConfig.email,
          userId: nextConfig.userId
        }
      });
    }

    if (pathname === '/api/admin/billing-config' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      const config = await loadOrBootstrapBillingConfig(supabase);
      return res.json({ success: true, data: config });
    }

    if (pathname === '/api/admin/billing-config' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const current = await loadOrBootstrapBillingConfig(supabase);
      const next = {
        ...current,
        accountName: String(body.accountName ?? current.accountName).trim(),
        instapayHandle: String(body.instapayHandle ?? current.instapayHandle).trim(),
        vodafoneCashNumber: String(body.vodafoneCashNumber ?? current.vodafoneCashNumber).trim(),
        supportContact: String(body.supportContact ?? current.supportContact).trim(),
        instructionsAr: String(body.instructionsAr ?? current.instructionsAr).trim(),
        instructionsEn: String(body.instructionsEn ?? current.instructionsEn).trim(),
        instructionsFr: String(body.instructionsFr ?? current.instructionsFr).trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: adminSession.config.username
      };
      await saveConfigPayload(supabase, {
        processingType: BILLING_CONFIG_TYPE,
        videoId: BILLING_CONFIG_VIDEO_ID,
        videoTitle: 'Billing Receiver Config',
        transcript: 'billing',
        payload: next
      });

      return res.json({ success: true, data: next });
    }

    const adminUserStatusMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
    if (adminUserStatusMatch && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const targetUserId = adminUserStatusMatch[1];
      const action = String(body.action || '').trim().toLowerCase();
      const reason = String(body.reason || '').trim();
      if (!['active', 'suspended', 'blocked'].includes(action)) {
        return res.status(400).json({ success: false, error: 'action must be active, suspended, or blocked' });
      }

      if (targetUserId === adminSession.config.userId) {
        return res.status(400).json({ success: false, error: 'Admin account cannot be modified here' });
      }

      const accessConfig = await loadOrBootstrapUserAccessConfig(supabase);
      delete accessConfig.blockedUsers[targetUserId];
      delete accessConfig.suspendedUsers[targetUserId];

      if (action === 'blocked') {
        accessConfig.blockedUsers[targetUserId] = {
          reason: reason || 'Blocked by admin',
          updatedAt: new Date().toISOString(),
          updatedBy: adminSession.config.username
        };
      } else if (action === 'suspended') {
        accessConfig.suspendedUsers[targetUserId] = {
          reason: reason || 'Suspended by admin',
          updatedAt: new Date().toISOString(),
          updatedBy: adminSession.config.username
        };
      }

      const saved = await saveUserAccessConfig(supabase, accessConfig);
      return res.json({
        success: true,
        data: {
          userId: targetUserId,
          access: getUserAccessStateFromConfig(saved, targetUserId)
        }
      });
    }

    const adminUserDeleteMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (adminUserDeleteMatch && req.method === 'DELETE') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const targetUserId = adminUserDeleteMatch[1];
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: 'Missing target user id' });
      }
      if (targetUserId === adminSession.config.userId) {
        return res.status(400).json({ success: false, error: 'Admin account cannot be deleted here' });
      }

      await supabase.from('payments').delete().eq('user_id', targetUserId);
      await supabase.from('transcripts_history').delete().eq('user_id', targetUserId);
      await supabase.from('users').delete().eq('id', targetUserId);

      try {
        await authAdminRequest(`/auth/v1/admin/users/${targetUserId}`, { method: 'DELETE' });
      } catch {
        // Ignore not-found or already-deleted cases.
      }

      const accessConfig = await loadOrBootstrapUserAccessConfig(supabase);
      delete accessConfig.blockedUsers[targetUserId];
      delete accessConfig.suspendedUsers[targetUserId];
      await saveUserAccessConfig(supabase, accessConfig);

      return res.json({ success: true });
    }

    if (pathname === '/api/admin/ai/config' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      const config = await loadOrBootstrapAiProviderConfig(supabase);
      return res.json({
        success: true,
        data: sanitizeAiConfigForAdmin(config)
      });
    }

    if (pathname === '/api/admin/ai/config' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const current = await loadOrBootstrapAiProviderConfig(supabase);
      const currentProviders = current.providers && typeof current.providers === 'object' ? current.providers : {};
      const incomingProviders = body.providers && typeof body.providers === 'object' ? body.providers : {};
      const clearProviders = new Set(Array.isArray(body.clearProviders) ? body.clearProviders.map((item) => normalizeProviderName(item)) : []);

      const mergedProviders = {};
      for (const provider of Object.keys(defaultAiProviderConfig().providers)) {
        const baseProvider = normalizeAiProviderEntry(provider, currentProviders[provider] || {});
        let nextKeys = baseProvider.keys;
        let nextActiveKeyId = baseProvider.activeKeyId;
        const incoming = incomingProviders[provider] && typeof incomingProviders[provider] === 'object'
          ? incomingProviders[provider]
          : {};

        if (clearProviders.has(provider)) {
          nextKeys = [];
          nextActiveKeyId = '';
        } else {
          if (Array.isArray(incoming.keys)) {
            nextKeys = normalizeApiKeyEntries(incoming.keys, {
              labelPrefix: `${provider.toUpperCase()} key`,
              idPrefix: `ai_${provider}`
            });
            nextActiveKeyId = String(incoming.activeKeyId || nextActiveKeyId || '').trim();
          }

          const incomingSingleKey = String(incoming.apiKey || '').trim();
          if (incomingSingleKey) {
            const applied = applyApiKeyAction(nextKeys, nextActiveKeyId, {
              type: 'add',
              label: String(incoming.label || '').trim() || `${provider.toUpperCase()} manual`,
              apiKey: incomingSingleKey,
              enabled: true,
              setActive: true
            }, {
              labelPrefix: `${provider.toUpperCase()} key`,
              idPrefix: `ai_${provider}`
            });
            nextKeys = applied.keys;
            nextActiveKeyId = applied.activeKeyId;
          }

          if (incoming.keyAction && typeof incoming.keyAction === 'object') {
            const applied = applyApiKeyAction(nextKeys, nextActiveKeyId, incoming.keyAction, {
              labelPrefix: `${provider.toUpperCase()} key`,
              idPrefix: `ai_${provider}`
            });
            nextKeys = applied.keys;
            nextActiveKeyId = applied.activeKeyId;
          }

          if (incoming.activeKeyId) {
            nextActiveKeyId = String(incoming.activeKeyId || '').trim();
          }
        }

        nextActiveKeyId = ensureActiveKeyId(nextKeys, nextActiveKeyId);
        mergedProviders[provider] = normalizeAiProviderEntry(provider, {
          keys: nextKeys,
          activeKeyId: nextActiveKeyId
        });
      }

      if (body.keyAction && typeof body.keyAction === 'object') {
        const keyAction = body.keyAction;
        const provider = normalizeProviderName(keyAction.provider || body.selectedProvider || current.selectedProvider);
        const providerBase = mergedProviders[provider] || normalizeAiProviderEntry(provider, {});
        const applied = applyApiKeyAction(
          providerBase.keys,
          providerBase.activeKeyId,
          keyAction,
          {
            labelPrefix: `${provider.toUpperCase()} key`,
            idPrefix: `ai_${provider}`
          }
        );
        mergedProviders[provider] = normalizeAiProviderEntry(provider, {
          ...providerBase,
          keys: applied.keys,
          activeKeyId: applied.activeKeyId
        });
      }

      const next = normalizeAiConfigPayload({
        ...current,
        selectedProvider: body.selectedProvider || current.selectedProvider,
        selectedModel: body.selectedModel || current.selectedModel,
        providers: mergedProviders,
        modelCatalog: body.modelCatalog && typeof body.modelCatalog === 'object'
          ? {
              ...(current.modelCatalog || {}),
              ...body.modelCatalog
            }
          : current.modelCatalog,
        updatedAt: new Date().toISOString(),
        updatedBy: adminSession.config.username
      });
      const saved = await saveAiProviderConfig(supabase, next);

      return res.json({
        success: true,
        data: sanitizeAiConfigForAdmin(saved)
      });
    }

    if (pathname === '/api/admin/ai/models' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const provider = normalizeProviderName(body.provider);
      const config = await loadOrBootstrapAiProviderConfig(supabase);
      const keyFromBody = String(body.apiKey || '').trim();
      const preferredKeyId = String(body.keyId || '').trim();
      const providerConfig = normalizeAiProviderEntry(provider, config.providers?.[provider] || {});
      const candidates = keyFromBody
        ? [{ id: 'manual', apiKey: keyFromBody, enabled: true }]
        : orderKeyCandidates(providerConfig.keys, preferredKeyId || providerConfig.activeKeyId);
      if (candidates.length === 0) {
        return res.status(400).json({ success: false, error: `No configured API keys for provider "${provider}"` });
      }

      let models = [];
      let lastError = null;
      for (const keyEntry of candidates) {
        try {
          models = await fetchProviderModels(provider, String(keyEntry.apiKey || '').trim());
          if (keyEntry.id !== 'manual') {
            recordRuntimeState('ai', provider, keyEntry.id, { success: true });
          }
          break;
        } catch (error) {
          lastError = error;
          if (keyEntry.id !== 'manual') {
            recordRuntimeState('ai', provider, keyEntry.id, {
              success: false,
              errorMessage: error?.message || 'Model fetch failed'
            });
          }
        }
      }
      if (!Array.isArray(models) || models.length === 0) {
        throw new Error(lastError?.message || `Failed to load models for provider "${provider}"`);
      }

      const modelCatalog = {
        ...(config.modelCatalog || {}),
        [provider]: models
      };
      const nextConfig = await saveAiProviderConfig(supabase, {
        ...config,
        modelCatalog
      });

      return res.json({
        success: true,
        data: {
          provider,
          models,
          config: sanitizeAiConfigForAdmin(nextConfig)
        }
      });
    }

    if (pathname === '/api/admin/transcript-api/config' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      const config = await loadOrBootstrapTranscriptApiConfig(supabase);
      return res.json({
        success: true,
        data: sanitizeTranscriptApiConfigForAdmin(config)
      });
    }

    if (pathname === '/api/admin/transcript-api/config' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const adminSession = await requireAdmin(req, supabase);
      if (!adminSession) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }

      const current = await loadOrBootstrapTranscriptApiConfig(supabase);
      let nextKeys = current.keys;
      let nextActiveKeyId = current.activeKeyId;

      if (body.keyAction && typeof body.keyAction === 'object') {
        const applied = applyApiKeyAction(nextKeys, nextActiveKeyId, body.keyAction, {
          labelPrefix: 'Transcript key',
          idPrefix: 'tap'
        });
        nextKeys = applied.keys;
        nextActiveKeyId = applied.activeKeyId;
      } else if (Object.prototype.hasOwnProperty.call(body, 'keys')) {
        nextKeys = normalizeApiKeyEntries(body.keys || [], {
          labelPrefix: 'Transcript key',
          idPrefix: 'tap'
        });
        nextActiveKeyId = ensureActiveKeyId(nextKeys, body.activeKeyId || current.activeKeyId || '');
      }

      const saved = await saveTranscriptApiConfig(supabase, {
        ...current,
        keys: nextKeys,
        activeKeyId: nextActiveKeyId,
        updatedBy: adminSession.config.username,
        updatedAt: new Date().toISOString()
      });
      return res.json({
        success: true,
        data: sanitizeTranscriptApiConfigForAdmin(saved)
      });
    }

    if ((pathname === '/api/transcript/extract' || pathname === '/api/transcripts/extract') && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!(await enforceRateLimit(res, 'transcriptByUser', user.id, 'Too many transcript extraction requests', { supabase }))) return;

      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);
      const adminConfig = await loadOrBootstrapAdminConfig(supabase);
      const subscription = await resolveUserSubscriptionState(supabase, userRow, {
        isAdminUser: user.id === adminConfig.userId
      });
      audit.userId = user.id;
      audit.tier = subscription.tier;
      let creditsLeft = Math.max(Number(userRow.credits || 0), 0);
      const buildAdminQuotaSnapshot = () => ({
        allowed: true,
        monthlyQuota: MONTHLY_FREE_QUOTA,
        usedThisMonth: 0,
        remaining: MONTHLY_FREE_QUOTA,
        lastResetAt: new Date().toISOString(),
        nextResetAt: new Date(Date.now() + QUOTA_RESET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
      });
      const buildDisabledQuotaSnapshot = () => ({
        allowed: false,
        monthlyQuota: 0,
        usedThisMonth: 0,
        remaining: 0,
        lastResetAt: null,
        nextResetAt: null
      });
      let allowMonthlyQuotaFallback = subscription.tier === 'free';
      if (allowMonthlyQuotaFallback) {
        const paidBefore = await hasApprovedPayments(supabase, user.id);
        allowMonthlyQuotaFallback = !paidBefore;
      }
      const getQuotaSnapshot = async () => {
        if (subscription.tier === 'admin') {
          return buildAdminQuotaSnapshot();
        }
        if (!allowMonthlyQuotaFallback) {
          return buildDisabledQuotaSnapshot();
        }
        return getUserUsageSummary(supabase, user.id);
      };

      const { url: videoUrl } = body;
      const parsedVideo = parseYouTubeInput(videoUrl);
      if (!parsedVideo.ok) {
        return sendError(
          res,
          400,
          parsedVideo.code === 'INVALID_VIDEO_ID' ? 'INVALID_VIDEO_ID' : 'INVALID_INPUT',
          parsedVideo.message
        );
      }
      const videoId = parsedVideo.videoId;
      audit.videoId = videoId;
      const defaultExtractMeta = parseExtractMeta(null, videoId);
      const transcriptConfig = await loadOrBootstrapTranscriptApiConfig(supabase);
      const activeTranscriptKeyId = getActiveTranscriptApiKeyId(transcriptConfig);
      if (!activeTranscriptKeyId) {
        return sendError(
          res,
          503,
          'TRANSCRIPT_API_NOT_CONFIGURED',
          'Transcript API active key is missing or disabled. Configure it in admin first.'
        );
      }

      const cachedExtract = await getCachedExtractRecord(supabase, user.id, videoId);
      if (cachedExtract?.transcript) {
        const cachedMeta = parseExtractMeta(cachedExtract.ai_result, videoId);
        if (isTranscriptCacheCompatible(cachedMeta, activeTranscriptKeyId)) {
          const hydratedMeta = await hydrateExtractMetaIfNeeded(
            videoId,
            cachedMeta,
            sanitizeVideoTitle(cachedExtract.video_title, videoId)
          );
          const normalizedCached = normalizeExtractMetaForSave(cachedMeta, videoId, cachedMeta.method || 'cached');
          if (JSON.stringify(normalizedCached) !== JSON.stringify(hydratedMeta)) {
            await supabase
              .from('transcripts_history')
              .update({
                ai_result: JSON.stringify(hydratedMeta)
              })
              .eq('id', cachedExtract.id)
              .eq('user_id', user.id);
          }
          console.info(`[cache] transcript user-hit video=${videoId} user=${user.id}`);
          const quota = await getQuotaSnapshot();
          return res.json({
            success: true,
            videoId,
            videoTitle: sanitizeVideoTitle(cachedExtract.video_title, videoId),
            transcript: cachedExtract.transcript,
            wordCount: cachedExtract.transcript.trim().split(/\s+/).length,
            method: hydratedMeta.method || cachedMeta.method || 'cached',
            thumbnailUrl: hydratedMeta.thumbnailUrl || defaultExtractMeta.thumbnailUrl,
            descriptionLinks: hydratedMeta.descriptionLinks || [],
            descriptionInstructions: hydratedMeta.descriptionInstructions || [],
            creditsLeft,
            chargedForNewVideo: false,
            monthlyQuota: quota.monthlyQuota,
            usedThisMonth: quota.usedThisMonth,
            monthlyQuotaRemaining: quota.remaining,
            monthlyQuotaEligible: subscription.tier === 'admin' || allowMonthlyQuotaFallback,
            quotaLastResetAt: quota.lastResetAt,
            quotaNextResetAt: quota.nextResetAt,
            cached: true
          });
        }
      }

      let transcript = null;
      let method = 'unknown';
      let fetchedFromCache = false;
      let extractMeta = { ...defaultExtractMeta };

      const memoryCache = getCachedTranscriptFromMemory(videoId);
      if (!transcript && memoryCache?.transcript) {
        const memoryMeta = {
          method: memoryCache.method || 'memory-cache',
          transcriptKeyId: memoryCache.transcriptKeyId || null
        };
        if (isTranscriptCacheCompatible(memoryMeta, activeTranscriptKeyId)) {
          transcript = memoryCache.transcript;
          method = memoryMeta.method;
          extractMeta = {
            ...extractMeta,
            ...memoryMeta
          };
          fetchedFromCache = true;
          console.info(`[cache] transcript memory-hit video=${videoId}`);
        }
      }

      if (!transcript) {
        const globalCache = await getRecentGlobalExtractRecord(supabase, videoId, TRANSCRIPT_GLOBAL_CACHE_TTL_MS);
        if (globalCache?.transcript) {
          const globalMeta = parseExtractMeta(globalCache.ai_result, videoId);
          if (isTranscriptCacheCompatible(globalMeta, activeTranscriptKeyId)) {
            transcript = String(globalCache.transcript || '').trim();
            method = globalMeta.method || 'global-db-cache';
            extractMeta = {
              ...extractMeta,
              ...globalMeta
            };
            fetchedFromCache = true;
            setCachedTranscriptInMemory(videoId, transcript, method, globalMeta.transcriptKeyId || activeTranscriptKeyId);
            console.info(`[cache] transcript db-hit video=${videoId}`);
          }
        } else {
          console.info(`[cache] transcript miss video=${videoId}`);
        }
      }

      if (!transcript) {
        try {
          const transcriptResult = await withTimeout(
            fetchWithTranscriptApi(parsedVideo.canonicalUrl, supabase, transcriptConfig),
            EXTRACTION_TIMEOUT_MS,
            'TranscriptAPI pipeline'
          );
          if (transcriptResult?.transcript && isUsableTranscript(transcriptResult.transcript)) {
            transcript = transcriptResult.transcript;
            method = 'transcriptapi';
            extractMeta = {
              ...extractMeta,
              method,
              transcriptKeyId: transcriptResult.keyId || activeTranscriptKeyId
            };
          } else {
            transcript = null;
          }
        } catch {}
      }

      if (!transcript) {
        return sendError(
          res,
          404,
          'TRANSCRIPT_UNAVAILABLE',
          'No transcript is available for this video (captions unavailable or unsupported).'
        );
      }

      let resolvedVideoTitle = await getPreferredVideoTitleForUser(
        supabase,
        user.id,
        videoId,
        sanitizeVideoTitle(cachedExtract?.video_title || '')
      );
      if (!fetchedFromCache) {
        const videoMeta = await fetchYouTubeVideoMetadata(videoId, resolvedVideoTitle);
        resolvedVideoTitle = sanitizeVideoTitle(videoMeta.title, resolvedVideoTitle || videoId);
        extractMeta = {
          ...extractMeta,
          method,
          thumbnailUrl: videoMeta.thumbnailUrl || buildYouTubeThumbnailUrl(videoId),
          descriptionLinks: videoMeta.descriptionLinks || [],
          descriptionInstructions: videoMeta.descriptionInstructions || []
        };
      } else {
        extractMeta = await hydrateExtractMetaIfNeeded(videoId, extractMeta, resolvedVideoTitle || videoId);
        if (!resolvedVideoTitle || resolvedVideoTitle === videoId) {
          const fetchedTitle = await fetchYouTubeVideoTitle(videoId);
          if (fetchedTitle) resolvedVideoTitle = fetchedTitle;
        }
      }
      resolvedVideoTitle = sanitizeVideoTitle(resolvedVideoTitle, videoId);

      let chargedForNewVideo = false;
      let quota = await getQuotaSnapshot();
      if (subscription.tier !== 'admin') {
        if (creditsLeft >= CREDIT_COST_PER_SUCCESS) {
          creditsLeft = await consumeCredits(supabase, user.id, creditsLeft, CREDIT_COST_PER_SUCCESS);
          chargedForNewVideo = true;
          quota = await getQuotaSnapshot();
        } else if (allowMonthlyQuotaFallback) {
          const quotaConsumption = await consumeUserMonthlyQuota(supabase, user.id);
          quota = quotaConsumption;
          if (!quotaConsumption.allowed) {
            return sendError(
              res,
              403,
              'QUOTA_EXCEEDED',
              'Monthly transcript quota reached and no credits are available. Please wait for reset or top up your balance.',
              {
                creditsLeft,
                requiredCredits: CREDIT_COST_PER_SUCCESS,
                monthlyQuota: quotaConsumption.monthlyQuota,
                usedThisMonth: quotaConsumption.usedThisMonth,
                remaining: quotaConsumption.remaining,
                nextResetAt: quotaConsumption.nextResetAt
              }
            );
          }
          chargedForNewVideo = true;
        } else {
          return sendError(
            res,
            403,
            'LIMIT_EXCEEDED',
            'Insufficient credits. Please top up to continue.',
            {
              creditsLeft,
              requiredCredits: CREDIT_COST_PER_SUCCESS,
              monthlyQuota: quota.monthlyQuota,
              usedThisMonth: quota.usedThisMonth,
              remaining: quota.remaining,
              monthlyQuotaEligible: false
            }
          );
        }
      }

      await saveExtractionRecord(supabase, user.id, videoId, transcript.trim(), method, resolvedVideoTitle, extractMeta);
      setCachedTranscriptInMemory(videoId, transcript.trim(), method, extractMeta.transcriptKeyId || activeTranscriptKeyId);

      return res.json({
        success: true,
        videoId,
        videoTitle: resolvedVideoTitle,
        transcript: transcript.trim(),
        wordCount: transcript.trim().split(/\s+/).length,
        method,
        thumbnailUrl: extractMeta.thumbnailUrl || buildYouTubeThumbnailUrl(videoId),
        descriptionLinks: extractMeta.descriptionLinks || [],
        descriptionInstructions: extractMeta.descriptionInstructions || [],
        creditsLeft,
        chargedForNewVideo,
        subscriptionTier: subscription.tier,
        monthlyQuota: quota.monthlyQuota,
        usedThisMonth: quota.usedThisMonth,
        monthlyQuotaRemaining: quota.remaining,
        monthlyQuotaEligible: subscription.tier === 'admin' || allowMonthlyQuotaFallback,
        quotaLastResetAt: quota.lastResetAt,
        quotaNextResetAt: quota.nextResetAt,
        cached: fetchedFromCache
      });
    }

    if (pathname === '/api/ai/process' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!(await enforceRateLimit(res, 'aiByUser', user.id, 'Too many AI processing requests', { supabase }))) return;
      const { transcript, type, videoId: providedVideoId, lang: requestedLang } = body;
      if (!transcript) {
        return sendError(res, 400, 'INVALID_INPUT', 'Please provide transcript text');
      }

      const parsedVideo = parseYouTubeInput(providedVideoId || '');
      if (!parsedVideo.ok) {
        return sendError(res, 400, 'INVALID_VIDEO_ID', 'Invalid YouTube video ID format');
      }
      const videoId = parsedVideo.videoId;

      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);
      const adminConfig = await loadOrBootstrapAdminConfig(supabase);
      const subscription = await resolveUserSubscriptionState(supabase, userRow, {
        isAdminUser: user.id === adminConfig.userId
      });
      if (!subscription.features.ai) {
        return sendError(res, 403, 'FEATURE_NOT_AVAILABLE', 'AI processing is not available for your current subscription tier');
      }
      audit.userId = user.id;
      audit.videoId = videoId;
      audit.tier = subscription.tier;

      const {
        text: transcriptForModel,
        truncated: transcriptTruncated,
        originalLength: transcriptOriginalLength
      } = trimForModel(transcript, AI_TRANSCRIPT_CHAR_LIMIT);

      if (!transcriptForModel) {
        return sendError(res, 400, 'INVALID_INPUT', 'Transcript text is empty after normalization');
      }

      const outputLang = normalizeOutputLang(requestedLang);
      const profile = resolveAiProcessingProfile(type, outputLang);
      const systemPrompt = profile.prompt;
      const processingType = profile.processingType;
      const shouldPersistResult = profile.saveHistory !== false;
      const aiExecutionToken = await getCurrentAiExecutionToken(supabase);
      const scopedProcessingType = buildScopedProcessingType(processingType, aiExecutionToken);

      if (shouldPersistResult) {
        const cachedAi = await getCachedAiRecord(supabase, user.id, videoId, scopedProcessingType);
        if (cachedAi?.ai_result) {
          return res.json({
            success: true,
            type: profile.clientType || profile.baseType || processingType,
            result: cachedAi.ai_result,
            creditsLeft: Number(userRow.credits || 0),
            inputTrimmed: transcriptTruncated,
            cached: true
          });
        }
      }

      const completion = await createMultiProviderChatCompletion({
        supabase,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: transcriptTruncated
              ? `Transcript was truncated from ${transcriptOriginalLength} to ${transcriptForModel.length} characters to fit model limits.\n\n${transcriptForModel}`
              : transcriptForModel
          }
        ],
        temperature: 0.4,
        maxTokens: profile.maxTokens
      });

      const rawResult = completion.choices?.[0]?.message?.content || '';
      const result = await enforceOutputLanguageIfNeeded({
        supabase,
        text: rawResult,
        outputLang,
        maxTokens: profile.maxTokens
      });
      const resolvedVideoTitle = await getPreferredVideoTitleForUser(supabase, user.id, videoId, videoId);
      if (shouldPersistResult) {
        await saveAiRecord(supabase, user.id, videoId, scopedProcessingType, transcriptForModel, result, resolvedVideoTitle);
      }

      return res.json({
        success: true,
        type: profile.clientType || profile.baseType || processingType,
        result,
        creditsLeft: Number(userRow.credits || 0),
        inputTrimmed: transcriptTruncated,
        cached: false
      });
    }

    if (pathname === '/api/history/save' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);

      const { videoId, videoTitle, transcript, processingType, result, aiResult } = body;
      if (!videoId || !transcript) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const normalizedType = String(processingType || 'manual').trim() || 'manual';
      if (isReservedProcessingType(normalizedType)) {
        return sendError(res, 400, 'INVALID_INPUT', 'Processing type is reserved');
      }
      const parsedHistoryVideo = parseYouTubeInput(videoId);
      if (!parsedHistoryVideo.ok) {
        return sendError(res, 400, 'INVALID_VIDEO_ID', 'Invalid YouTube video ID format');
      }
      const canonicalVideoId = parsedHistoryVideo.videoId;
      const preferredTitle = sanitizeVideoTitle(
        videoTitle,
        await getPreferredVideoTitleForUser(supabase, user.id, canonicalVideoId, canonicalVideoId)
      );
      const finalAi = result ?? aiResult ?? null;
      const { data: existingRows, error: existingError } = await supabase
        .from('transcripts_history')
        .select('id, user_id, video_id, processing_type, ai_result, transcript, created_at')
        .eq('user_id', user.id)
        .eq('video_id', canonicalVideoId)
        .eq('processing_type', normalizedType)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingError) throw existingError;
      const existing = Array.isArray(existingRows) ? existingRows[0] : null;
      if (existing && String(existing.ai_result || '') === String(finalAi || '')) {
        return res.json({ success: true, data: existing, deduplicated: true });
      }

      const { data, error } = await supabase
        .from('transcripts_history')
        .insert([
          {
            user_id: user.id,
            video_id: canonicalVideoId,
            video_title: preferredTitle,
            transcript,
            ai_result: finalAi,
            processing_type: normalizedType
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (pathname.match(/^\/api\/history\/[^/]+\/title$/) && req.method === 'PATCH') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);

      const parts = pathname.split('/');
      const id = parts[3];
      const title = sanitizeVideoTitle(body.title || body.videoTitle || '');
      if (!title) {
        return sendError(res, 400, 'INVALID_INPUT', 'Title is required');
      }

      const { data: targetRow, error: targetError } = await supabase
        .from('transcripts_history')
        .select('id, video_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (targetError || !targetRow?.video_id) {
        return sendError(res, 404, 'NOT_FOUND', 'History item not found');
      }

      const renameResult = await renameVideoTitleForUser(supabase, user.id, targetRow.video_id, title);
      return res.json({
        success: true,
        data: renameResult
      });
    }

    if (pathname.match(/^\/api\/history\/[^/]+$/) && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);
      const id = pathname.split('/').pop();

      const { data, error } = await supabase
        .from('transcripts_history')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .neq('processing_type', QUOTA_MARKER_TYPE)
        .neq('processing_type', ADMIN_CONFIG_TYPE)
        .neq('processing_type', BILLING_CONFIG_TYPE)
        .neq('processing_type', USER_ACCESS_CONFIG_TYPE)
        .neq('processing_type', AI_CONFIG_TYPE)
        .neq('processing_type', TRANSCRIPT_API_CONFIG_TYPE)
        .neq('processing_type', RATE_LIMIT_MARKER_TYPE)
        .single();
      if (error || !data) return res.status(404).json({ success: false, error: 'History item not found' });
      return res.json({ success: true, item: data });
    }

    if (pathname.match(/^\/api\/history\/[^/]+$/) && req.method === 'DELETE') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);
      const id = pathname.split('/').pop();
      const { error } = await supabase.from('transcripts_history').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (pathname === '/api/history' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);
      const { data, error } = await supabase
        .from('transcripts_history')
        .select('id, video_id, video_title, processing_type, created_at')
        .eq('user_id', user.id)
        .neq('processing_type', QUOTA_MARKER_TYPE)
        .neq('processing_type', ADMIN_CONFIG_TYPE)
        .neq('processing_type', BILLING_CONFIG_TYPE)
        .neq('processing_type', USER_ACCESS_CONFIG_TYPE)
        .neq('processing_type', AI_CONFIG_TYPE)
        .neq('processing_type', TRANSCRIPT_API_CONFIG_TYPE)
        .neq('processing_type', RATE_LIMIT_MARKER_TYPE)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (pathname === '/api/links' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);

      const { data, error } = await supabase
        .from('transcripts_history')
        .select('video_id, video_title, created_at, ai_result')
        .eq('user_id', user.id)
        .eq('processing_type', EXTRACT_TYPE)
        .order('created_at', { ascending: false })
        .limit(LINKS_MAX_ITEMS);

      if (error) throw error;

      const unique = new Map();
      for (const row of data || []) {
        const key = row.video_id;
        if (!key || unique.has(key)) continue;
        const meta = parseExtractMeta(row.ai_result, row.video_id);
        unique.set(key, {
          videoId: row.video_id,
          title: row.video_title || row.video_id,
          url: `https://www.youtube.com/watch?v=${row.video_id}`,
          createdAt: row.created_at,
          thumbnailUrl: meta.thumbnailUrl || buildYouTubeThumbnailUrl(row.video_id)
        });
      }

      return res.json({ success: true, data: Array.from(unique.values()) });
    }

    if (pathname.match(/^\/api\/links\/[^/]+\/title$/) && req.method === 'PATCH') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);

      const parts = pathname.split('/');
      const rawVideoId = decodeURIComponent(parts[3] || '');
      const parsedVideo = parseYouTubeInput(rawVideoId);
      if (!parsedVideo.ok) {
        return sendError(res, 400, 'INVALID_VIDEO_ID', 'Invalid YouTube video ID format');
      }

      const title = sanitizeVideoTitle(body.title || body.videoTitle || '');
      if (!title) {
        return sendError(res, 400, 'INVALID_INPUT', 'Title is required');
      }

      const renameResult = await renameVideoTitleForUser(supabase, user.id, parsedVideo.videoId, title);
      if (renameResult.updatedCount <= 0) {
        return sendError(res, 404, 'NOT_FOUND', 'Link not found');
      }
      return res.json({
        success: true,
        data: renameResult
      });
    }

    if (pathname === '/api/billing/config' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);

      const config = await loadOrBootstrapBillingConfig(supabase);
      return res.json({
        success: true,
        data: config
      });
    }

    if (pathname === '/api/billing/create-topup-request' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);

      const { amountCents, method, payerContact, transferReference, notes, userNote, proofImageDataUrl } = body;
      if (!['instapay', 'vodafone_cash'].includes(method)) {
        return res.status(400).json({ success: false, error: 'Invalid payment method' });
      }
      if (!proofImageDataUrl) {
        return res.status(400).json({ success: false, error: 'Transfer proof image is required' });
      }
      const quote = calculateTopupQuote(amountCents);
      const billingConfig = await loadOrBootstrapBillingConfig(supabase);

      const proof = await uploadPaymentProof(supabase, user.id, proofImageDataUrl);

      const paymentNotes = stringifyPaymentNotes({
        quote: {
          packs: quote.packs,
          baseCredits: quote.baseCredits,
          bonusRate: quote.bonusRate,
          credits: quote.credits,
          amountCents: quote.amountCents
        },
        receiverSnapshot: {
          accountName: billingConfig.accountName,
          instapayHandle: billingConfig.instapayHandle,
          vodafoneCashNumber: billingConfig.vodafoneCashNumber,
          supportContact: billingConfig.supportContact
        },
        proof,
        userNote: String(userNote || notes || '').trim(),
        audit: [
          {
            at: new Date().toISOString(),
            event: 'created_by_user',
            userId: user.id
          }
        ]
      });

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            user_id: user.id,
            amount_cents: quote.amountCents,
            credits_added: quote.credits,
            status: 'pending',
            payment_method: method,
            payer_contact: payerContact || null,
            transfer_reference: transferReference || null,
            notes: paymentNotes
          }
        ])
        .select()
        .single();
      if (error) throw error;
      const request = await enrichPaymentForResponse(supabase, data, { includeAudit: false });
      return res.json({
        success: true,
        request,
        billing: billingConfig,
        quote: {
          packs: quote.packs,
          baseCredits: quote.baseCredits,
          bonusRate: quote.bonusRate,
          credits: quote.credits
        }
      });
    }

    if (pathname === '/api/billing/my-requests' && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await assertUserIsActive(supabase, user.id);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const items = await Promise.all((Array.isArray(data) ? data : []).map((item) => enrichPaymentForResponse(supabase, item)));
      return res.json({ success: true, data: items });
    }

    if (pathname === '/api/chat/chat' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!(await enforceRateLimit(res, 'chatByUser', user.id, 'Too many chat requests', { supabase }))) return;
      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);
      const adminConfig = await loadOrBootstrapAdminConfig(supabase);
      const subscription = await resolveUserSubscriptionState(supabase, userRow, {
        isAdminUser: user.id === adminConfig.userId
      });
      if (!subscription.features.chat) {
        return sendError(res, 403, 'FEATURE_NOT_AVAILABLE', 'Chat is not available for your current subscription tier');
      }
      audit.userId = user.id;
      audit.tier = subscription.tier;

      const { message, transcript, videoId: providedVideoId, lang: requestedLang } = body;
      if (!message || !transcript) {
        return sendError(res, 400, 'INVALID_INPUT', 'Missing message or transcript');
      }

      const parsedVideo = parseYouTubeInput(providedVideoId || '');
      if (!parsedVideo.ok) {
        return sendError(res, 400, 'INVALID_VIDEO_ID', 'Invalid YouTube video ID format');
      }
      const videoId = parsedVideo.videoId;
      audit.videoId = videoId;

      const { text: transcriptForContext } = trimForModel(transcript, CHAT_TRANSCRIPT_CHAR_LIMIT);
      const { text: questionForModel } = trimForModel(message, CHAT_QUESTION_CHAR_LIMIT);
      const outputLang = normalizeOutputLang(requestedLang);
      const aiExecutionToken = await getCurrentAiExecutionToken(supabase);
      const chatKey = makeChatKey(questionForModel, {
        outputLang,
        scopeToken: aiExecutionToken
      });

      const cachedChat = await getCachedChatRecord(supabase, user.id, videoId, chatKey);
      if (cachedChat?.ai_result) {
        return res.json({
          success: true,
          response: cachedChat.ai_result,
          creditsLeft: Number(userRow.credits || 0),
          cached: true
        });
      }

      const completion = await createMultiProviderChatCompletion({
        supabase,
        messages: [
          {
            role: 'system',
            content:
              `${outputLanguageInstruction(outputLang)} ` +
              'You are a helpful assistant for transcript Q&A. Keep answers grounded in transcript context and be concise.'
          },
          { role: 'user', content: `Transcript: ${transcriptForContext}\n\nQuestion: ${questionForModel}` }
        ],
        temperature: 0.6,
        maxTokens: 600
      });
      const chatResponse = completion.choices?.[0]?.message?.content || '';
      const resolvedVideoTitle = await getPreferredVideoTitleForUser(supabase, user.id, videoId, videoId);
      await saveChatRecord(supabase, user.id, videoId, chatKey, questionForModel, chatResponse, resolvedVideoTitle);
      return res.json({
        success: true,
        response: chatResponse,
        creditsLeft: Number(userRow.credits || 0),
        cached: false
      });
    }

    if (pathname === '/api/chat/clear' && req.method === 'POST') {
      return res.json({ success: true });
    }

    return sendError(res, 404, 'NOT_FOUND', 'Not found');
  } catch (error) {
    const message = String(error?.message || 'Internal error');
    if (error?.code === 'USER_ACCESS_RESTRICTED') {
      return sendError(res, 403, 'LIMIT_EXCEEDED', message, {
        access: error?.access || null
      });
    }
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('rate limit')) {
      return sendError(res, 429, 'RATE_LIMITED', 'Rate limit exceeded. Please retry later.');
    }
    if (lowerMessage.includes('insufficient credits')) {
      return sendError(res, 403, 'LIMIT_EXCEEDED', 'Insufficient credits. Please top up to continue.');
    }
    if (lowerMessage.includes('request too large') || lowerMessage.includes('input is too large')) {
      return sendError(res, 400, 'INVALID_INPUT', 'Input is too large for current limits.');
    }
    if (lowerMessage.includes('no transcript available')) {
      return sendError(
        res,
        404,
        'TRANSCRIPT_UNAVAILABLE',
        'No transcript is available for this video (captions unavailable or unsupported).'
      );
    }
    return sendError(res, 500, 'INTERNAL_ERROR', error.message || 'Internal error');
  }
}
