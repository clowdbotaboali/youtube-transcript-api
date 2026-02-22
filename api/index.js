import { Groq } from 'groq-sdk';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseClient = createClient(url, key);
  return supabaseClient;
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

    if (url.includes('/api/transcript/extract')) {
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
        const data = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ar' });
        if (data?.length) {
          transcript = data.map((item) => item.text).join(' ');
          method = 'youtube-transcript-ar';
        }
      } catch {}

      if (!transcript) {
        try {
          const data = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
          if (data?.length) {
            transcript = data.map((item) => item.text).join(' ');
            method = 'youtube-transcript-en';
          }
        } catch {}
      }

      if (!transcript) {
        try {
          const data = await YoutubeTranscript.fetchTranscript(videoId);
          if (data?.length) {
            transcript = data.map((item) => item.text).join(' ');
            method = 'youtube-transcript-default';
          }
        } catch {}
      }

      if (!transcript) {
        return res.status(404).json({ success: false, error: 'No transcript available for this video' });
      }

      return res.json({
        success: true,
        videoId,
        transcript: transcript.trim(),
        wordCount: transcript.trim().split(/\s+/).length,
        method
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

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (userError || !userRow) {
        return res.status(404).json({ success: false, error: 'User account not found' });
      }
      if (Number(userRow.credits || 0) < 1) {
        return res.status(403).json({ success: false, error: 'Insufficient credits' });
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

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4
      });

      const result = completion.choices?.[0]?.message?.content || '';
      const nextCredits = Number(userRow.credits || 0) - 1;
      await supabase.from('users').update({ credits: nextCredits }).eq('id', user.id);

      return res.json({ success: true, type: type || 'all', result, creditsLeft: nextCredits });
    }

    if (url.includes('/api/history/save')) {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({ success: false, error: 'Server not configured: SUPABASE env vars missing' });
      }
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });

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
      const { message, transcript } = body;
      if (!message || !transcript) {
        return res.status(400).json({ success: false, error: 'Missing message or transcript' });
      }
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful Arabic assistant for transcript Q&A.' },
          { role: 'user', content: `Transcript: ${transcript}\n\nQuestion: ${message}` }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6
      });
      return res.json({ success: true, response: completion.choices?.[0]?.message?.content || '' });
    }

    if (url.includes('/api/chat/clear')) {
      return res.json({ success: true });
    }

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}
