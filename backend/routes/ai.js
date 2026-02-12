import express from 'express';
import { processWithGroq } from '../utils/groqClient.js';

const router = express.Router();

router.post('/process', async (req, res) => {
  try {
    const { transcript, type } = req.body;
    
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم نص للمعالجة'
      });
    }

    const validTypes = ['summary', 'steps', 'resources', 'all'];
    const processingType = validTypes.includes(type) ? type : 'all';

    const result = await processWithGroq(transcript, processingType);

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
