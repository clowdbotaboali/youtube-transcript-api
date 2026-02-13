import { Groq } from 'groq-sdk';
import { YoutubeTranscript } from 'youtube-transcript';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function parseQuery(url) {
  const query = {};
  const urlObj = new URL(url, 'https://example.com');
  urlObj.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const queryParams = parseQuery(url);
  let body = {};
  
  // Try to get body from request body
  if (req.body) {
    try {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (typeof req.body === 'object') {
        body = req.body;
      }
    } catch (e) {}
  }
  
  const videoUrl = body.url || queryParams.url;
  
  try {
    // Extract transcript
    if (url.includes('/api/transcript/extract')) {
      if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'يرجى تقديم رابط فيديو YouTube' });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'رابط YouTube غير صالح' });
      }

      let transcript = null;
      let method = 'unknown';

      // Try Arabic first
      try {
        const data = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ar' });
        if (data && data.length > 0) {
          transcript = data.map(item => item.text).join(' ');
          method = 'youtube-transcript-ar';
        }
      } catch (e) {}

      // Try English
      if (!transcript) {
        try {
          const data = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
          if (data && data.length > 0) {
            transcript = data.map(item => item.text).join(' ');
            method = 'youtube-transcript-en';
          }
        } catch (e) {}
      }

      // Try default
      if (!transcript) {
        try {
          const data = await YoutubeTranscript.fetchTranscript(videoId);
          if (data && data.length > 0) {
            transcript = data.map(item => item.text).join(' ');
            method = 'youtube-transcript-default';
          }
        } catch (e) {}
      }

      if (!transcript) {
        return res.status(404).json({ 
          success: false, 
          error: 'لا يوجد نص مكتوب متاح لهذا الفيديو' 
        });
      }

      return res.json({ 
        success: true, 
        videoId, 
        transcript: transcript.trim(), 
        wordCount: transcript.trim().split(/\s+/).length,
        method
      });
    }

    // AI Process
    if (url.includes('/api/ai/process')) {
      const { transcript: transcriptText, type } = body || queryParams;
      
      if (!transcriptText) {
        return res.status(400).json({ success: false, error: 'يرجى تقديم نص' });
      }

      let systemPrompt = '';
      switch (type) {
        case 'summary':
          systemPrompt = 'لخص هذا النص بشكل شامل ومفصل:';
          break;
        case 'steps':
          systemPrompt = 'استخرج الخطوات من هذا النص مع شرح مفصل لكل خطوة:';
          break;
        case 'resources':
          systemPrompt = 'استخرج جميع الروابط والبرامج والموارد المذكورة في هذا النص:';
          break;
        default:
          systemPrompt = 'قدم تقرير شامل يتضمن:\n1. ملخص المحتوى\n2. الخطوات الرئيسية\n3. البرامج والروابط المذكورة\n4. أي معلومات مفيدة أخرى';
      }

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcriptText }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });

      return res.json({ 
        success: true, 
        result: completion.choices[0].message.content, 
        type 
      });
    }

    // Chat
    if (url.includes('/api/chat/chat')) {
      const { message, transcript: transcriptText } = body || queryParams;
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي تساعد في فهم نصوص فيديوهات YouTube. أجب بالعربية.' },
          { role: 'user', content: `النص: ${transcriptText}\n\nالسؤال: ${message}` }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });

      return res.json({ success: true, response: completion.choices[0].message.content });
    }

    // Settings keys
    if (url.includes('/api/settings/keys')) {
      return res.json({ success: true });
    }

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
