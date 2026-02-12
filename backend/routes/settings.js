import express from 'express';

const router = express.Router();

let apiKeys = {
  groqApiKey: process.env.GROQ_API_KEY || '',
  transcriptApiKey: process.env.TRANSCRIPT_API_KEY || ''
};

router.post('/update', (req, res) => {
  try {
    const { groqApiKey, transcriptApiKey } = req.body;
    
    if (groqApiKey) apiKeys.groqApiKey = groqApiKey;
    if (transcriptApiKey) apiKeys.transcriptApiKey = transcriptApiKey;

    console.log('✅ API Keys updated');
    
    res.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تحديث الإعدادات'
    });
  }
});

router.get('/keys', (req, res) => {
  res.json({
    success: true,
    groqApiKey: apiKeys.groqApiKey,
    transcriptApiKey: apiKeys.transcriptApiKey
  });
});

export { apiKeys };
export default router;
