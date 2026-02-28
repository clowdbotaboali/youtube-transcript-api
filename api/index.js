import { Groq } from 'groq-sdk';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@supabase/supabase-js';
import ytdl from '@distube/ytdl-core';
import crypto from 'crypto';

let groqClient = null;

let supabaseClient = null;
const FREE_PLAN_CREDITS = 5;
const CREDIT_COST_PER_SUCCESS = 1;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const YTDL_AGENT = ytdl.createAgent();
const EXTRACTION_TIMEOUT_MS = 20000;
const AI_TRANSCRIPT_CHAR_LIMIT = 8500;
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
const ADMIN_DEFAULT_USERNAME = 'admin';
const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || 'admin@transcriptai-eg.com';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'Aa01015415601@@@@@';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'transcript-ai-admin-secret';
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const LINKS_MAX_ITEMS = 500;
const PAYMENT_PROOF_BUCKET = process.env.PAYMENT_PROOF_BUCKET || 'payment-proofs';
const MAX_PAYMENT_PROOF_BYTES = 3 * 1024 * 1024;

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
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = String(url || '').match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

async function getAuthedUser(req) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
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

  const { data, error } = await supabase
    .from('users')
    .select('id, email, credits')
    .eq('id', authUser.id)
    .single();

  if (error || !data) {
    throw new Error('User account not found');
  }

  let credits = Number(data.credits || 0);

  // Enforce free-plan cap for non-paying users (legacy accounts may carry old higher values).
  if (credits > FREE_PLAN_CREDITS) {
    const { data: approvedPayments, error: approvedPaymentsError } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('status', 'approved')
      .limit(1);

    if (approvedPaymentsError) {
      throw new Error('Failed to validate payment plan');
    }

    const hasApprovedPayment = Array.isArray(approvedPayments) && approvedPayments.length > 0;
    if (!hasApprovedPayment) {
      const { error: capError } = await supabase
        .from('users')
        .update({ credits: FREE_PLAN_CREDITS })
        .eq('id', authUser.id);
      if (capError) {
        throw new Error('Failed to normalize free plan credits');
      }
      credits = FREE_PLAN_CREDITS;
    }
  }

  return {
    ...data,
    credits
  };
}

async function consumeCredits(supabase, userId, currentCredits, cost = CREDIT_COST_PER_SUCCESS) {
  const nextCredits = Number(currentCredits || 0) - cost;
  const { error } = await supabase
    .from('users')
    .update({ credits: nextCredits })
    .eq('id', userId);
  if (error) {
    throw new Error('Failed to update credits');
  }
  return nextCredits;
}

async function hasQuotaMarkerForVideo(supabase, userId, videoId) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .eq('processing_type', QUOTA_MARKER_TYPE)
    .limit(1);

  if (error) {
    throw new Error('Failed to check extraction usage');
  }

  return Array.isArray(data) && data.length > 0;
}

async function addQuotaMarkerForVideo(supabase, userId, videoId) {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: `[quota:${videoId}]`,
        transcript: '__quota_marker__',
        ai_result: null,
        processing_type: QUOTA_MARKER_TYPE
      }
    ]);

  if (error) {
    throw new Error('Failed to record extraction usage');
  }
}

async function getFreeLinksUsage(supabase, userId) {
  const { data, error } = await supabase
    .from('transcripts_history')
    .select('video_id')
    .eq('user_id', userId)
    .eq('processing_type', QUOTA_MARKER_TYPE)
    .limit(10000);

  if (error) {
    throw new Error('Failed to load free plan usage');
  }

  const uniqueVideoIds = new Set(
    (Array.isArray(data) ? data : [])
      .map((row) => String(row?.video_id || '').trim())
      .filter(Boolean)
  );

  const used = Math.min(uniqueVideoIds.size, FREE_PLAN_CREDITS);
  const remaining = Math.max(FREE_PLAN_CREDITS - used, 0);
  return {
    freePlanLimit: FREE_PLAN_CREDITS,
    freeLinksUsed: used,
    freeLinksRemaining: remaining
  };
}

function makeHash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function makeChatKey(message) {
  return `${CHAT_TYPE_PREFIX}${makeHash(normalizeTextInput(message).toLowerCase())}`;
}

function getPathname(url) {
  try {
    return new URL(url || '', 'http://localhost').pathname;
  } catch {
    return String(url || '').split('?')[0];
  }
}

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
  if (signature !== expectedSignature) return null;

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
      passwordHash: parsed.passwordHash || makeHash(ADMIN_DEFAULT_PASSWORD)
    };
  }

  const owner = await ensureAdminOwnerUser(supabase, ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD);
  const config = {
    userId: owner.id,
    username: ADMIN_DEFAULT_USERNAME,
    email: owner.email || ADMIN_DEFAULT_EMAIL,
    passwordHash: makeHash(ADMIN_DEFAULT_PASSWORD)
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
    instructionsAr: 'حوّل المبلغ ثم ارفع صورة التحويل ورقم المرجع وسيتم المراجعة خلال وقت قصير.',
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
        apiKey: ''
      },
      openrouter: {
        apiKey: ''
      },
      openai: {
        apiKey: ''
      },
      google: {
        apiKey: ''
      },
      anthropic: {
        apiKey: ''
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

function normalizeAiConfigPayload(raw) {
  const defaults = defaultAiProviderConfig();
  const payload = raw && typeof raw === 'object' ? raw : {};
  const providers = payload.providers && typeof payload.providers === 'object' ? payload.providers : {};
  const mergedProviders = {};

  for (const provider of Object.keys(defaults.providers)) {
    const current = providers[provider] && typeof providers[provider] === 'object' ? providers[provider] : {};
    mergedProviders[provider] = {
      apiKey: String(current.apiKey || defaults.providers[provider].apiKey || '').trim()
    };
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
    const key = String(value?.apiKey || '').trim();
    providers[provider] = {
      hasKey: Boolean(key),
      maskedKey: key ? maskApiKey(key) : ''
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
    return normalizeAiConfigPayload(payload);
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

function defaultTranscriptApiConfig() {
  return {
    keys: [],
    updatedAt: new Date().toISOString()
  };
}

function normalizeTranscriptApiConfig(payload) {
  const defaults = defaultTranscriptApiConfig();
  const data = payload && typeof payload === 'object' ? payload : {};
  return {
    keys: normalizeApiKeys(data.keys || defaults.keys),
    updatedAt: data.updatedAt || defaults.updatedAt
  };
}

async function loadOrBootstrapTranscriptApiConfig(supabase) {
  const { payload } = await loadConfigPayload(supabase, TRANSCRIPT_API_CONFIG_TYPE, TRANSCRIPT_API_VIDEO_ID);
  if (payload) {
    return normalizeTranscriptApiConfig(payload);
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
              'HTTP-Referer': 'https://youtube-transcript-api-lilac.vercel.app',
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
  const key = String(config.providers?.[provider]?.apiKey || '').trim();

  const selectedKey = key;
  if (!selectedKey) {
    throw new Error(`AI provider "${provider}" is not configured with an API key`);
  }

  if (provider === 'google') {
    return requestGoogleCompletion({
      apiKey: selectedKey,
      model,
      messages,
      temperature,
      maxTokens
    });
  }

  if (provider === 'anthropic') {
    return requestAnthropicCompletion({
      apiKey: selectedKey,
      model,
      messages,
      temperature,
      maxTokens
    });
  }

  const endpointByProvider = {
    groq: 'https://api.groq.com/openai/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    openai: 'https://api.openai.com/v1'
  };

  return requestOpenAiCompatibleCompletion({
    baseUrl: endpointByProvider[provider] || endpointByProvider.groq,
    apiKey: selectedKey,
    model,
    messages,
    temperature,
    maxTokens,
    extraHeaders:
      provider === 'openrouter'
        ? {
            'HTTP-Referer': 'https://youtube-transcript-api-lilac.vercel.app',
            'X-Title': 'Transcript AI'
          }
        : {}
  });
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

async function saveExtractionRecord(supabase, userId, videoId, transcript, method) {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: videoId,
        transcript,
        ai_result: JSON.stringify({ method }),
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

async function saveAiRecord(supabase, userId, videoId, processingType, transcript, result) {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: videoId,
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

async function saveChatRecord(supabase, userId, videoId, chatKey, question, response) {
  const { error } = await supabase
    .from('transcripts_history')
    .insert([
      {
        user_id: userId,
        video_id: videoId,
        video_title: videoId,
        transcript: question,
        ai_result: response,
        processing_type: chatKey
      }
    ]);
  if (error) {
    throw new Error('Failed to save chat history');
  }
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
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, credits, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;

  const rows = Array.isArray(users) ? users : [];
  if (rows.length === 0) return [];

  const ids = rows.map((item) => item.id);
  const { data: paymentRows, error: paymentError } = await supabase
    .from('payments')
    .select('user_id, amount_cents, credits_added, status, created_at')
    .in('user_id', ids)
    .order('created_at', { ascending: false });
  if (paymentError) throw paymentError;

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

  return rows.map((item) => ({
    ...item,
    credits: toInteger(item.credits, 0),
    stats: paymentMap.get(item.id) || {
      totalPayments: 0,
      approvedPayments: 0,
      pendingPayments: 0,
      rejectedPayments: 0,
      paidCredits: 0,
      paidAmountCents: 0,
      lastPaymentAt: null
    }
  }));
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

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

async function fetchWithTranscriptApi(videoUrl, supabase) {
  const config = supabase ? await loadOrBootstrapTranscriptApiConfig(supabase) : { keys: [] };
  const keys = normalizeApiKeys(config?.keys || []);
  if (keys.length === 0) return null;

  const encodedUrl = encodeURIComponent(videoUrl);
  let lastError = null;

  for (const apiKey of keys) {
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
        continue;
      }

      const data = await response.json().catch(() => null);
      if (!data?.transcript || !Array.isArray(data.transcript)) {
        lastError = new Error('TranscriptAPI response did not include transcript');
        continue;
      }

      const transcript = data.transcript.map((item) => item.text || '').join(' ').trim();
      if (transcript) return transcript;
      lastError = new Error('TranscriptAPI returned empty transcript');
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    return null;
  }
  return null;
}

async function fetchWithYtdl(videoId) {
  const info = await withTimeout(ytdl.getInfo(videoId, { agent: YTDL_AGENT }), 10000, 'ytdl info');
  const captionTracks = info?.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captionTracks || captionTracks.length === 0) return null;

  const preferredTracks = [
    ...captionTracks.filter((track) => track.languageCode === 'ar' || track.languageCode === 'ar-SA'),
    ...captionTracks.filter((track) => track.languageCode === 'en' || track.languageCode === 'en-US'),
    ...captionTracks
  ];
  const uniqueTracks = Array.from(new Map(preferredTracks.map((track) => [track.baseUrl, track])).values());

  let bestTranscript = null;
  let bestScore = -1;

  for (const track of uniqueTracks) {
    const response = await fetchWithTimeout(
      track.baseUrl,
      {
        dispatcher: YTDL_AGENT.dispatcher,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Language': 'en-US,en;q=0.9'
        }
      },
      8000,
      'Caption track request'
    );
    if (!response.ok) continue;
    const xmlText = await withTimeout(response.text(), 8000, 'Caption track read');
    if (!xmlText) continue;
    const textMatches = xmlText.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g);
    const transcript = Array.from(textMatches)
      .map((match) => decodeXmlEntities(match[1]))
      .join(' ')
      .trim();
    if (!transcript) continue;
    const stats = getTranscriptStats(transcript);
    const score = stats.wordsCount * 2 + stats.uniqueWords;
    if (score > bestScore) {
      bestScore = score;
      bestTranscript = transcript;
    }
  }

  return bestTranscript;
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const pathname = getPathname(url);
  const body = readBody(req);

  try {
    if (pathname === '/api/settings/status') {
      return res.json({ success: true, managedInBackend: true });
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
      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);
      const access = await getUserAccessState(supabase, user.id);
      const usage = await getFreeLinksUsage(supabase, user.id);
      return res.json({
        success: true,
        data: {
          id: userRow.id,
          email: userRow.email,
          credits: Number(userRow.credits || 0),
          freePlanLimit: usage.freePlanLimit,
          freeLinksUsed: usage.freeLinksUsed,
          freeLinksRemaining: usage.freeLinksRemaining,
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

      const config = await loadOrBootstrapAdminConfig(supabase);
      const identifierRaw = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const validIdentifier =
        identifierRaw &&
        (identifierRaw === String(config.username || '').toLowerCase() ||
          identifierRaw === String(config.email || '').toLowerCase());
      const validPassword = makeHash(password) === config.passwordHash;

      if (!validIdentifier || !validPassword) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
      }

      const token = signAdminToken(config);
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
      const changedToApproved = payment.status !== 'approved' && decision === 'approved';
      if (changedToApproved) {
        userCreditsAfter = await addCreditsToUser(supabase, payment.user_id, payment.credits_added);
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
        userCreditsAfter
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
        passwordHash: nextPassword ? makeHash(nextPassword) : current.passwordHash
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
      const currentProviders = current.providers || {};
      const incomingProviders = body.providers && typeof body.providers === 'object' ? body.providers : {};
      const clearProviders = new Set(
        Array.isArray(body.clearProviders)
          ? body.clearProviders.map((item) => normalizeProviderName(item))
          : []
      );
      const mergedProviders = {};
      for (const provider of Object.keys(currentProviders)) {
        const currentKey = String(currentProviders[provider]?.apiKey || '').trim();
        const incomingKey = String(incomingProviders?.[provider]?.apiKey || '').trim();
        mergedProviders[provider] = {
          apiKey: clearProviders.has(provider)
            ? ''
            : (incomingKey || currentKey)
        };
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
      const key = keyFromBody || String(config.providers?.[provider]?.apiKey || '').trim();
      const models = await fetchProviderModels(provider, key);

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
        data: {
          keysCount: config.keys.length,
          keysMasked: config.keys.map((key) => maskApiKey(key)),
          updatedAt: config.updatedAt
        }
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
      const keys = normalizeApiKeys(body.keys || []);
      const saved = await saveTranscriptApiConfig(supabase, {
        keys,
        updatedBy: adminSession.config.username,
        updatedAt: new Date().toISOString()
      });
      return res.json({
        success: true,
        data: {
          keysCount: saved.keys.length,
          keysMasked: saved.keys.map((key) => maskApiKey(key)),
          updatedAt: saved.updatedAt
        }
      });
    }

    if (pathname === '/api/transcript/extract') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);

      const { url: videoUrl } = body;
      if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'Please provide YouTube URL' });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
      }

      const cachedExtract = await getCachedExtractRecord(supabase, user.id, videoId);
      if (cachedExtract?.transcript) {
        return res.json({
          success: true,
          videoId,
          transcript: cachedExtract.transcript,
          wordCount: cachedExtract.transcript.trim().split(/\s+/).length,
          method: 'cached',
          creditsLeft: Number(userRow.credits || 0),
          chargedForNewVideo: false,
          cached: true
        });
      }

      const alreadyUnlockedForUser = await hasQuotaMarkerForVideo(supabase, user.id, videoId);
      if (!alreadyUnlockedForUser && Number(userRow.credits || 0) < CREDIT_COST_PER_SUCCESS) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient credits for a new video link'
        });
      }

      let transcript = null;
      let method = 'unknown';

      try {
        transcript = await withTimeout(fetchWithTranscriptApi(videoUrl, supabase), EXTRACTION_TIMEOUT_MS, 'TranscriptAPI pipeline');
        if (transcript && isUsableTranscript(transcript)) {
          method = 'transcriptapi';
        } else {
          transcript = null;
        }
      } catch {}

      if (!transcript) {
        try {
          transcript = await withTimeout(fetchWithYtdl(videoId), EXTRACTION_TIMEOUT_MS, 'ytdl pipeline');
          if (transcript && isUsableTranscript(transcript)) {
            method = 'ytdl-core';
          } else {
            transcript = null;
          }
        } catch {}
      }

      try {
        if (!transcript) {
          const data = await withTimeout(
            YoutubeTranscript.fetchTranscript(videoId, { lang: 'ar' }),
            EXTRACTION_TIMEOUT_MS,
            'youtube-transcript ar'
          );
          if (data?.length) {
            const candidate = data.map((item) => item.text).join(' ').trim();
            if (isUsableTranscript(candidate)) {
              transcript = candidate;
              method = 'youtube-transcript-ar';
            }
          }
        }
      } catch {}

      if (!transcript) {
        try {
          const data = await withTimeout(
            YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }),
            EXTRACTION_TIMEOUT_MS,
            'youtube-transcript en'
          );
          if (data?.length) {
            const candidate = data.map((item) => item.text).join(' ').trim();
            if (isUsableTranscript(candidate)) {
              transcript = candidate;
              method = 'youtube-transcript-en';
            }
          }
        } catch {}
      }

      if (!transcript) {
        try {
          const data = await withTimeout(
            YoutubeTranscript.fetchTranscript(videoId),
            EXTRACTION_TIMEOUT_MS,
            'youtube-transcript default'
          );
          if (data?.length) {
            const candidate = data.map((item) => item.text).join(' ').trim();
            if (isUsableTranscript(candidate)) {
              transcript = candidate;
              method = 'youtube-transcript-default';
            }
          }
        } catch {}
      }

      if (!transcript) {
        return res.status(404).json({ success: false, error: 'No transcript available for this video' });
      }

      await saveExtractionRecord(supabase, user.id, videoId, transcript.trim(), method);

      let nextCredits = Number(userRow.credits || 0);
      const chargedForNewVideo = !alreadyUnlockedForUser;
      if (chargedForNewVideo) {
        await addQuotaMarkerForVideo(supabase, user.id, videoId);
        nextCredits = await consumeCredits(supabase, user.id, userRow.credits, CREDIT_COST_PER_SUCCESS);
      }

      return res.json({
        success: true,
        videoId,
        transcript: transcript.trim(),
        wordCount: transcript.trim().split(/\s+/).length,
        method,
        creditsLeft: nextCredits,
        chargedForNewVideo,
        cached: false
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
      const { transcript, type, videoId: providedVideoId } = body;
      if (!transcript) {
        return res.status(400).json({ success: false, error: 'Please provide transcript text' });
      }

      const videoId = extractVideoId(providedVideoId || '') || String(providedVideoId || '').trim();
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Please provide videoId for caching' });
      }

      const userRow = await ensureUserAccountRow(supabase, user);

      const {
        text: transcriptForModel,
        truncated: transcriptTruncated,
        originalLength: transcriptOriginalLength
      } = trimForModel(transcript, AI_TRANSCRIPT_CHAR_LIMIT);

      if (!transcriptForModel) {
        return res.status(400).json({ success: false, error: 'Transcript text is empty after normalization' });
      }

      let systemPrompt = '';
      let processingType = 'all';
      switch (type) {
        case 'summary':
          systemPrompt = 'Summarize this transcript in Arabic clearly and accurately.';
          processingType = 'summary';
          break;
        case 'steps':
          systemPrompt = 'Extract actionable steps in Arabic with clear numbering.';
          processingType = 'steps';
          break;
        case 'resources':
          systemPrompt = 'Extract resources, tools, links, and references mentioned in transcript.';
          processingType = 'resources';
          break;
        default:
          systemPrompt = 'Provide comprehensive Arabic analysis with summary, steps, and resources.';
          processingType = 'all';
      }

      const cachedAi = await getCachedAiRecord(supabase, user.id, videoId, processingType);
      if (cachedAi?.ai_result) {
        return res.json({
          success: true,
          type: processingType,
          result: cachedAi.ai_result,
          creditsLeft: Number(userRow.credits || 0),
          inputTrimmed: transcriptTruncated,
          cached: true
        });
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
        maxTokens: type === 'all' ? 900 : 700
      });

      const result = completion.choices?.[0]?.message?.content || '';
      await saveAiRecord(supabase, user.id, videoId, processingType, transcriptForModel, result);

      return res.json({
        success: true,
        type: processingType,
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

      const normalizedType = String(processingType || 'manual').trim();
      const finalAi = result ?? aiResult ?? null;
      const { data: existingRows, error: existingError } = await supabase
        .from('transcripts_history')
        .select('id, user_id, video_id, processing_type, ai_result, transcript, created_at')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
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
            video_id: videoId,
            video_title: videoTitle || videoId,
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
        .select('*')
        .eq('user_id', user.id)
        .neq('processing_type', QUOTA_MARKER_TYPE)
        .neq('processing_type', ADMIN_CONFIG_TYPE)
        .neq('processing_type', BILLING_CONFIG_TYPE)
        .neq('processing_type', USER_ACCESS_CONFIG_TYPE)
        .neq('processing_type', AI_CONFIG_TYPE)
        .neq('processing_type', TRANSCRIPT_API_CONFIG_TYPE)
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
        .select('video_id, video_title, created_at')
        .eq('user_id', user.id)
        .eq('processing_type', EXTRACT_TYPE)
        .order('created_at', { ascending: false })
        .limit(LINKS_MAX_ITEMS);

      if (error) throw error;

      const unique = new Map();
      for (const row of data || []) {
        const key = row.video_id;
        if (!key || unique.has(key)) continue;
        unique.set(key, {
          videoId: row.video_id,
          title: row.video_title || row.video_id,
          url: `https://www.youtube.com/watch?v=${row.video_id}`,
          createdAt: row.created_at
        });
      }

      return res.json({ success: true, data: Array.from(unique.values()) });
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
      const userRow = await ensureUserAccountRow(supabase, user);
      await assertUserIsActive(supabase, user.id);

      const { message, transcript, videoId: providedVideoId } = body;
      if (!message || !transcript) {
        return res.status(400).json({ success: false, error: 'Missing message or transcript' });
      }

      const videoId = extractVideoId(providedVideoId || '') || String(providedVideoId || '').trim();
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Please provide videoId for chat caching' });
      }

      const { text: transcriptForContext } = trimForModel(transcript, CHAT_TRANSCRIPT_CHAR_LIMIT);
      const { text: questionForModel } = trimForModel(message, CHAT_QUESTION_CHAR_LIMIT);
      const chatKey = makeChatKey(questionForModel);

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
          { role: 'system', content: 'You are a helpful Arabic assistant for transcript Q&A.' },
          { role: 'user', content: `Transcript: ${transcriptForContext}\n\nQuestion: ${questionForModel}` }
        ],
        temperature: 0.6,
        maxTokens: 600
      });
      const chatResponse = completion.choices?.[0]?.message?.content || '';
      await saveChatRecord(supabase, user.id, videoId, chatKey, questionForModel, chatResponse);
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

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    const message = String(error?.message || 'Internal error');
    if (error?.code === 'USER_ACCESS_RESTRICTED') {
      return res.status(403).json({
        success: false,
        error: message,
        access: error?.access || null
      });
    }
    if (message.toLowerCase().includes('request too large') || message.toLowerCase().includes('rate limit')) {
      return res.status(413).json({
        success: false,
        error: 'Input is too large for current AI limits. Please retry; the system now trims long transcripts automatically.'
      });
    }
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}
