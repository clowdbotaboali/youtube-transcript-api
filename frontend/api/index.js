import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from 'ytdl-core';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

async function fetchTranscriptWithYtdl(videoId) {
  try {
    const info = await ytdl.getInfo(videoId);
    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) return null;
    
    let selectedTrack = captionTracks.find(track => 
      track.languageCode === 'ar' || track.languageCode === 'ar-SA'
    ) || captionTracks.find(track => 
      track.languageCode === 'en' || track.languageCode === 'en-US'
    ) || captionTracks[0];

    const captionUrl = selectedTrack.baseUrl;
    const response = await fetch(captionUrl);
    const xmlText = await response.text();
    
    const textMatches = xmlText.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
    const transcript = Array.from(textMatches)
      .map(match => match[1])
      .join(' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'");
    
    return transcript;
  } catch (error) {
    return null;
  }
}

app.post('/api/transcript/extract', async (req, res) => {
  try {
    const { url } = req.body;
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'رابط YouTube غير صالح' });
    }

    let transcript = null;
    transcript = await fetchTranscriptWithYtdl(videoId);
    
    if (!transcript) {
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptData && transcriptData.length > 0) {
          transcript = transcriptData.map(item => item.text).join(' ');
        }
      } catch (e) {}
    }

    if (!transcript) {
      return res.status(404).json({ 
        success: false, 
        error: 'لا يوجد نص مكتوب متاح لهذا الفيديو' 
      });
    }

    res.json({ success: true, videoId, transcript: transcript.trim(), wordCount: transcript.trim().split(/\s+/).length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/process', async (req, res) => {
  try {
    const { transcript, type } = req.body;
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
        { role: 'user', content: transcript }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    res.json({ success: true, result: completion.choices[0].message.content, type });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat/chat', async (req, res) => {
  try {
    const { message, transcript } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي تساعد في فهم نصوص فيديوهات YouTube. أجب بالعربية.' },
        { role: 'user', content: `النص: ${transcript}\n\nالسؤال: ${message}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    res.json({ success: true, response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/settings/keys', (req, res) => {
  res.json({ success: true });
});

export default app;
