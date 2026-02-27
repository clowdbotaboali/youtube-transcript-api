import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

async function ensureUserAccountRow(user) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email || null
      },
      { onConflict: 'id' }
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

  return data;
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
