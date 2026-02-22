import express from 'express';
import { processWithGroq } from '../utils/groqClient.js';
import { supabase } from '../utils/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/process', requireAuth, async (req, res) => {
  try {
    const { transcript, type } = req.body;
    const userId = req.user.id;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Please provide transcript text'
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    if (Number(user.credits || 0) < 1) {
      return res.status(403).json({ success: false, error: 'Insufficient credits' });
    }

    const validTypes = ['summary', 'steps', 'resources', 'all'];
    const processingType = validTypes.includes(type) ? type : 'all';

    const result = await processWithGroq(transcript, processingType);

    const nextCredits = Number(user.credits || 0) - 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: nextCredits })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to update user credits' });
    }

    res.json({
      success: true,
      type: processingType,
      result,
      creditsLeft: nextCredits
    });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI processing failed'
    });
  }
});

export default router;
