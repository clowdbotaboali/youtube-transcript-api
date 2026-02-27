import { Groq } from 'groq-sdk';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@supabase/supabase-js';
import ytdl from '@distube/ytdl-core';

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

  return data;
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
  const body = readBody(req);

  try {
    if (url.includes('/api/settings/status')) {
      return res.json({ success: true, managedInBackend: true });
    }

    if (url.includes('/api/me')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      const userRow = await ensureUserAccountRow(supabase, user);
      return res.json({
        success: true,
        data: {
          id: userRow.id,
          email: userRow.email,
          credits: Number(userRow.credits || 0)
        }
      });
    }

    if (url.includes('/api/transcript/extract')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      const userRow = await ensureUserAccountRow(supabase, user);
      if (Number(userRow.credits || 0) < CREDIT_COST_PER_SUCCESS) {
        return res.status(403).json({ success: false, error: 'Insufficient credits' });
      }

      const { url: videoUrl } = body;
      if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'Please provide YouTube URL' });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
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

      const nextCredits = await consumeCredits(supabase, user.id, userRow.credits, CREDIT_COST_PER_SUCCESS);

      return res.json({
        success: true,
        videoId,
        transcript: transcript.trim(),
        wordCount: transcript.trim().split(/\s+/).length,
        method,
        creditsLeft: nextCredits
      });
    }

    if (url.includes('/api/ai/process')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      const { transcript, type } = body;
      if (!transcript) {
        return res.status(400).json({ success: false, error: 'Please provide transcript text' });
      }

      const userRow = await ensureUserAccountRow(supabase, user);
      if (Number(userRow.credits || 0) < CREDIT_COST_PER_SUCCESS) {
        return res.status(403).json({ success: false, error: 'Insufficient credits' });
      }

      const {
        text: transcriptForModel,
        truncated: transcriptTruncated,
        originalLength: transcriptOriginalLength
      } = trimForModel(transcript, AI_TRANSCRIPT_CHAR_LIMIT);

      if (!transcriptForModel) {
        return res.status(400).json({ success: false, error: 'Transcript text is empty after normalization' });
      }

      let systemPrompt = '';
      switch (type) {
        case 'summary':
          systemPrompt = 'Summarize this transcript in Arabic clearly and accurately.';
          break;
        case 'steps':
          systemPrompt = 'Extract actionable steps in Arabic with clear numbering.';
          break;
        case 'resources':
          systemPrompt = 'Extract resources, tools, links, and references mentioned in transcript.';
          break;
        default:
          systemPrompt = 'Provide comprehensive Arabic analysis with summary, steps, and resources.';
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
      const nextCredits = await consumeCredits(supabase, user.id, userRow.credits, CREDIT_COST_PER_SUCCESS);

      return res.json({
        success: true,
        type: type || 'all',
        result,
        creditsLeft: nextCredits,
        inputTrimmed: transcriptTruncated
      });
    }

    if (url.includes('/api/history/save')) {
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

      const { data, error } = await supabase
        .from('transcripts_history')
        .insert([
          {
            user_id: user.id,
            video_id: videoId,
            video_title: videoTitle || videoId,
            transcript,
            ai_result: result ?? aiResult ?? null,
            processing_type: processingType
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (url.match(/\/api\/history\/[^/]+$/) && req.method === 'GET') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      const id = url.split('/').pop();

      const { data, error } = await supabase
        .from('transcripts_history')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error || !data) return res.status(404).json({ success: false, error: 'History item not found' });
      return res.json({ success: true, item: data });
    }

    if (url.match(/\/api\/history\/[^/]+$/) && req.method === 'DELETE') {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      const id = url.split('/').pop();
      const { error } = await supabase.from('transcripts_history').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (url.includes('/api/history') && req.method === 'GET') {
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (url.includes('/api/billing/create-topup-request')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
      await ensureUserAccountRow(supabase, user);

      const { credits, amountCents, method, payerContact, transferReference, notes } = body;
      if (!['instapay', 'vodafone_cash'].includes(method)) {
        return res.status(400).json({ success: false, error: 'Invalid payment method' });
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            user_id: user.id,
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
      if (error) throw error;
      return res.json({ success: true, request: data });
    }

    if (url.includes('/api/billing/my-requests')) {
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

    if (url.includes('/api/chat/chat')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      const userRow = await ensureUserAccountRow(supabase, user);
      if (Number(userRow.credits || 0) < CREDIT_COST_PER_SUCCESS) {
        return res.status(403).json({ success: false, error: 'Insufficient credits' });
      }

      const { message, transcript } = body;
      if (!message || !transcript) {
        return res.status(400).json({ success: false, error: 'Missing message or transcript' });
      }
      const { text: transcriptForContext } = trimForModel(transcript, CHAT_TRANSCRIPT_CHAR_LIMIT);
      const { text: questionForModel } = trimForModel(message, CHAT_QUESTION_CHAR_LIMIT);

      const completion = await createGroqChatCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful Arabic assistant for transcript Q&A.' },
          { role: 'user', content: `Transcript: ${transcriptForContext}\n\nQuestion: ${questionForModel}` }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        maxTokens: 600
      });
      const nextCredits = await consumeCredits(supabase, user.id, userRow.credits, CREDIT_COST_PER_SUCCESS);
      return res.json({
        success: true,
        response: completion.choices?.[0]?.message?.content || '',
        creditsLeft: nextCredits
      });
    }

    if (url.includes('/api/chat/clear')) {
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
