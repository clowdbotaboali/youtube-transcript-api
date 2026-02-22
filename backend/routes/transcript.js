import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const YTDL_AGENT = ytdl.createAgent();

function analyzeTranscriptQuality(rawText = '') {
  const text = String(rawText).trim();
  const words = text.split(/\s+/).filter(Boolean);
  const cleaned = text
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const meaningfulWords = cleaned.split(/\s+/).filter(Boolean);
  const uniqueMeaningfulWords = new Set(
    meaningfulWords.map((w) => w.toLowerCase())
  ).size;

  return {
    wordsCount: words.length,
    meaningfulWordsCount: meaningfulWords.length,
    uniqueMeaningfulWords,
  };
}

function isUsableTranscript(rawText = '') {
  const stats = analyzeTranscriptQuality(rawText);
  if (stats.meaningfulWordsCount < 20) return false;
  if (stats.uniqueMeaningfulWords < 10) return false;
  return true;
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

async function fetchWithTranscriptAPI(videoUrl, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ TranscriptAPI key not provided');
    return null;
  }

  try {
    console.log('🔄 Trying TranscriptAPI.com...');

    const encodedUrl = encodeURIComponent(videoUrl);
    const response = await fetch(`https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodedUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ TranscriptAPI error:', response.status, errorData);
      return null;
    }

    const data = await response.json();

    if (data.transcript && Array.isArray(data.transcript)) {
      const transcript = data.transcript.map(item => item.text || '').join(' ');
      console.log('✅ Success with TranscriptAPI.com');
      return transcript;
    }

    return null;
  } catch (error) {
    console.error('TranscriptAPI error:', error.message);
    return null;
  }
}

async function fetchTranscriptWithYtdl(videoId) {
  try {
    const info = await ytdl.getInfo(videoId, { agent: YTDL_AGENT });

    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      return null;
    }

    const preferredTracks = [
      ...captionTracks.filter(track => track.languageCode === 'ar' || track.languageCode === 'ar-SA'),
      ...captionTracks.filter(track => track.languageCode === 'en' || track.languageCode === 'en-US'),
      ...captionTracks
    ];

    const uniqueTracks = Array.from(
      new Map(preferredTracks.map((track) => [track.baseUrl, track])).values()
    );

    let bestTranscript = null;
    let bestScore = -1;

    for (const track of uniqueTracks) {
      const response = await fetch(track.baseUrl, {
        dispatcher: YTDL_AGENT.dispatcher,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (!response.ok) {
        continue;
      }
      const xmlText = await response.text();
      if (!xmlText) {
        continue;
      }
      const textMatches = xmlText.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
      const transcript = Array.from(textMatches)
        .map(match => match[1])
        .join(' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const stats = analyzeTranscriptQuality(transcript);
      const score = (stats.meaningfulWordsCount * 2) + stats.uniqueMeaningfulWords;

      if (score > bestScore) {
        bestScore = score;
        bestTranscript = transcript;
      }
    }

    return bestTranscript;
  } catch (error) {
    console.error('ytdl-core error:', error.message);
    return null;
  }
}

router.post('/extract', async (req, res) => {
  try {
    const { url } = req.body;
    const transcriptApiKey = process.env.TRANSCRIPT_API_KEY || '';

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم رابط فيديو YouTube'
      });
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'رابط YouTube غير صالح'
      });
    }

    console.log(`\n🎬 Attempting to fetch transcript for video: ${videoId}`);
    console.log(`🔑 TranscriptAPI Key provided: ${transcriptApiKey ? 'Yes' : 'No'}`);

    let transcript = null;
    let method = 'unknown';

    if (transcriptApiKey) {
      try {
        console.log('Method 1: Trying TranscriptAPI.com...');
        transcript = await fetchWithTranscriptAPI(url, transcriptApiKey);
        if (transcript) {
          if (isUsableTranscript(transcript)) {
            method = 'TranscriptAPI.com';
            console.log('✅ Success with TranscriptAPI.com');
          } else {
            console.log('❌ TranscriptAPI returned low-quality transcript, trying fallback...');
            transcript = null;
          }
        }
      } catch (error) {
        console.log('❌ TranscriptAPI failed:', error.message);
      }
    }

    if (!transcript) {
      console.log('Method 2: Trying ytdl-core...');
      try {
        transcript = await fetchTranscriptWithYtdl(videoId);
        if (transcript) {
          if (isUsableTranscript(transcript)) {
            method = 'ytdl-core';
            console.log('✅ Success with ytdl-core');
          } else {
            console.log('❌ ytdl-core returned low-quality transcript, trying fallback...');
            transcript = null;
          }
        }
      } catch (error) {
        console.log('❌ ytdl-core failed:', error.message);
      }
    }

    if (!transcript) {
      console.log('Method 3: Trying youtube-transcript (default)...');
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptData && transcriptData.length > 0) {
          transcript = transcriptData.map(item => item.text).join(' ');
          if (isUsableTranscript(transcript)) {
            method = 'youtube-transcript-default';
            console.log('✅ Success with youtube-transcript (default)');
          } else {
            console.log('❌ youtube-transcript (default) low-quality transcript, trying fallback...');
            transcript = null;
          }
        }
      } catch (error) {
        console.log('❌ youtube-transcript (default) failed:', error.message);
      }
    }

    if (!transcript) {
      console.log('Method 4: Trying youtube-transcript (ar)...');
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ar' });
        if (transcriptData && transcriptData.length > 0) {
          transcript = transcriptData.map(item => item.text).join(' ');
          if (isUsableTranscript(transcript)) {
            method = 'youtube-transcript-ar';
            console.log('✅ Success with youtube-transcript (ar)');
          } else {
            console.log('❌ youtube-transcript (ar) low-quality transcript, trying fallback...');
            transcript = null;
          }
        }
      } catch (error) {
        console.log('❌ youtube-transcript (ar) failed:', error.message);
      }
    }

    if (!transcript) {
      console.log('Method 5: Trying youtube-transcript (en)...');
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        if (transcriptData && transcriptData.length > 0) {
          transcript = transcriptData.map(item => item.text).join(' ');
          if (isUsableTranscript(transcript)) {
            method = 'youtube-transcript-en';
            console.log('✅ Success with youtube-transcript (en)');
          } else {
            console.log('❌ youtube-transcript (en) low-quality transcript.');
            transcript = null;
          }
        }
      } catch (error) {
        console.log('❌ youtube-transcript (en) failed:', error.message);
      }
    }

    if (!transcript || transcript.trim().length === 0) {
      console.log('❌ All methods failed\n');
      return res.status(404).json({
        success: false,
        error: 'لا يوجد نص مكتوب متاح لهذا الفيديو. تأكد من أن الفيديو يحتوي على Subtitles/CC'
      });
    }

    console.log(`✅ Transcript extracted successfully using: ${method}\n`);

    res.json({
      success: true,
      videoId,
      transcript: transcript.trim(),
      wordCount: transcript.trim().split(/\s+/).length,
      method
    });

  } catch (error) {
    console.error('Transcript extraction error:', error);

    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء استخراج النص: ' + error.message
    });
  }
});

export default router;
