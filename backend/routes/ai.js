import express from 'express';
import { processWithGroq } from '../utils/groqClient.js';
import { supabase } from '../utils/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

async function ensureUserAccountRow(userId, email = null) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email
      },
      { onConflict: 'id' }
    );

  if (upsertError) {
    throw new Error('Failed to prepare user account');
  }

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (userError || !userRow) {
    throw new Error('User account not found');
  }

  return userRow;
}

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

    const user = await ensureUserAccountRow(userId, req.user.email || null);

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
