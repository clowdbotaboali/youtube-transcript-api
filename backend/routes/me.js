import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';

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

async function ensureUserAccountRow(user) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email || null,
        credits: FREE_PLAN_CREDITS
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (upsertError) {
    throw new Error('Failed to prepare user account');
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, credits')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    throw new Error('User account not found');
  }

  let credits = Number(data.credits || 0);
  if (credits === 10) {
    const paidBefore = await hasApprovedPayments(user.id);
    if (!paidBefore) {
      const { error: normalizeError } = await supabase
        .from('users')
        .update({ credits: FREE_PLAN_CREDITS })
        .eq('id', user.id);
      if (normalizeError) {
        throw new Error('Failed to normalize free plan credits');
      }
      credits = FREE_PLAN_CREDITS;
    }
  }

  return {
    ...data,
    credits
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await ensureUserAccountRow(req.user);
    return res.json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        credits: Number(data.credits || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to load account data'
    });
  }
});

export default router;
