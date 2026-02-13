import express from 'express';
import { processWithGroq } from '../utils/groqClient.js';

const router = express.Router();

function normalizeApiKey(rawKey = '') {
  return String(rawKey)
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^['"]|['"]$/g, '');
}

router.post('/process', async (req, res) => {
  try {
    const { transcript, type } = req.body;
    const groqApiKey = normalizeApiKey(req.headers['x-groq-api-key'] || '');
    
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم نص للمعالجة'
      });
    }

    const validTypes = ['summary', 'steps', 'resources', 'all'];
    const processingType = validTypes.includes(type) ? type : 'all';

    const result = await processWithGroq(transcript, processingType, groqApiKey);

    res.json({
      success: true,
      type: processingType,
      result
    });

  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء معالجة النص'
    });
  }
});

export default router;
