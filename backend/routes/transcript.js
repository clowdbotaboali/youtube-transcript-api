import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from 'ytdl-core';
import { apiKeys } from './settings.js';

const router = express.Router();

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

async function fetchWithTranscriptAPI(videoId, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ TranscriptAPI key not provided');
    return null;
  }

  try {
    console.log('🔄 Trying TranscriptAPI.com...');
    
    const response = await fetch(`https://transcriptapi.com/api/v2/youtube/transcript?video_url=${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
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
    const info = await ytdl.getInfo(videoId);
    
    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      return null;
    }

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
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    return transcript;
  } catch (error) {
    console.error('ytdl-core error:', error.message);
    return null;
  }
}

router.post('/extract', async (req, res) => {
  try {
    const { url } = req.body;
    const transcriptApiKey = req.headers['x-transcript-api-key'] || '';
    
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
        transcript = await fetchWithTranscriptAPI(videoId, transcriptApiKey);
        if (transcript) {
          method = 'TranscriptAPI.com';
          console.log('✅ Success with TranscriptAPI.com');
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
          method = 'ytdl-core';
          console.log('✅ Success with ytdl-core');
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
          method = 'youtube-transcript-default';
          console.log('✅ Success with youtube-transcript (default)');
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
          method = 'youtube-transcript-ar';
          console.log('✅ Success with youtube-transcript (ar)');
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
          method = 'youtube-transcript-en';
          console.log('✅ Success with youtube-transcript (en)');
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
