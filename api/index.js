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
const ADMIN_DEFAULT_USERNAME = 'admin';
const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || 'admin@transcriptai-eg.com';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'Aa01015415601@@@@@';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'transcript-ai-admin-secret';
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const LINKS_MAX_ITEMS = 500;

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

async function fetchWithTranscriptApi(videoUrl) {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) return null;
  const encodedUrl = encodeURIComponent(videoUrl);
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
  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  if (!data?.transcript || !Array.isArray(data.transcript)) return null;
  return data.transcript.map((item) => item.text || '').join(' ').trim();
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
      const usage = await getFreeLinksUsage(supabase, user.id);
      return res.json({
        success: true,
        data: {
          id: userRow.id,
          email: userRow.email,
          credits: Number(userRow.credits || 0),
          freePlanLimit: usage.freePlanLimit,
          freeLinksUsed: usage.freeLinksUsed,
          freeLinksRemaining: usage.freeLinksRemaining
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
      const usersCountResponse = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (usersCountResponse.error) throw usersCountResponse.error;

      return res.json({
        success: true,
        data: rows,
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

      return res.json({
        success: true,
        data: Array.isArray(data) ? data : [],
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

      const auditLine = [
        new Date().toISOString(),
        `admin:${adminSession.config.username}`,
        `decision:${decision}`,
        note ? `note:${note}` : null
      ]
        .filter(Boolean)
        .join(' | ');
      const mergedNotes = [payment.notes || null, auditLine].filter(Boolean).join('\n');

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
        payment: updatedPayment,
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
        transcript = await withTimeout(fetchWithTranscriptApi(videoUrl), EXTRACTION_TIMEOUT_MS, 'TranscriptAPI pipeline');
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

      const completion = await createGroqChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: transcriptTruncated
              ? `Transcript was truncated from ${transcriptOriginalLength} to ${transcriptForModel.length} characters to fit model limits.\n\n${transcriptForModel}`
              : transcriptForModel
          }
        ],
        model: 'llama-3.3-70b-versatile',
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
      const id = pathname.split('/').pop();

      const { data, error } = await supabase
        .from('transcripts_history')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .neq('processing_type', QUOTA_MARKER_TYPE)
        .neq('processing_type', ADMIN_CONFIG_TYPE)
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
      const { data, error } = await supabase
        .from('transcripts_history')
        .select('*')
        .eq('user_id', user.id)
        .neq('processing_type', QUOTA_MARKER_TYPE)
        .neq('processing_type', ADMIN_CONFIG_TYPE)
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

    if (pathname === '/api/billing/create-topup-request' && req.method === 'POST') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await ensureUserAccountRow(supabase, user);

      const { amountCents, method, payerContact, transferReference, notes } = body;
      if (!['instapay', 'vodafone_cash'].includes(method)) {
        return res.status(400).json({ success: false, error: 'Invalid payment method' });
      }
      const quote = calculateTopupQuote(amountCents);

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
            notes:
              notes ||
              `packs=${quote.packs}; base=${quote.baseCredits}; bonusRate=${Math.round(quote.bonusRate * 100)}%`
          }
        ])
        .select()
        .single();
      if (error) throw error;
      return res.json({
        success: true,
        request: data,
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
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data });
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

      const completion = await createGroqChatCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful Arabic assistant for transcript Q&A.' },
          { role: 'user', content: `Transcript: ${transcriptForContext}\n\nQuestion: ${questionForModel}` }
        ],
        model: 'llama-3.3-70b-versatile',
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
    if (message.toLowerCase().includes('request too large') || message.toLowerCase().includes('rate limit')) {
      return res.status(413).json({
        success: false,
        error: 'Input is too large for current AI limits. Please retry; the system now trims long transcripts automatically.'
      });
    }
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}
