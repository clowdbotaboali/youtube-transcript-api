import express from 'express';
import { processWithGroq } from '../utils/groqClient.js';
import { supabase } from '../utils/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const FREE_PLAN_CREDITS = 5;

async function hasApprovedPayments(userId) {
  const { count, error } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error) {
    const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();
    if (
      message.includes("relation 'payments' does not exist") ||
      message.includes('relation "payments" does not exist') ||
      message.includes('could not find the table')
    ) {
      return false;
    }
    throw new Error('Failed to verify payment history');
  }

  return Number(count || 0) > 0;
}

async function ensureUserAccountRow(userId, email = null) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email,
        credits: FREE_PLAN_CREDITS
      },
      { onConflict: 'id', ignoreDuplicates: true }
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

  let credits = Number(userRow.credits || 0);
  if (credits === 10) {
    const paidBefore = await hasApprovedPayments(userId);
    if (!paidBefore) {
      const { error: normalizeError } = await supabase
        .from('users')
        .update({ credits: FREE_PLAN_CREDITS })
        .eq('id', userId);
      if (normalizeError) {
        throw new Error('Failed to normalize free plan credits');
      }
      credits = FREE_PLAN_CREDITS;
    }
  }

  return {
    ...userRow,
    credits
  };
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

    const validTypes = ['summary', 'steps', 'resources', 'all'];
    const processingType = validTypes.includes(type) ? type : 'all';

    const result = await processWithGroq(transcript, processingType);

    res.json({
      success: true,
      type: processingType,
      result,
      creditsLeft: Number(user.credits || 0)
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
