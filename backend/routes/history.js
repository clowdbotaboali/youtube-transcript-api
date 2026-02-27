import express from 'express';
import { supabase } from '../utils/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const QUOTA_MARKER_TYPE = 'quota_extract_marker';

router.use(requireAuth);

router.post('/save', async (req, res) => {
  try {
    const { videoId, videoTitle, transcript, processingType, result, aiResult } = req.body;
    const userId = req.user.id;
    const finalResult = result ?? aiResult ?? null;

    if (!videoId || !transcript) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('transcripts_history')
      .insert([
        {
          user_id: userId,
          video_id: videoId,
          video_title: videoTitle || videoId,
          transcript,
          ai_result: finalResult,
          processing_type: processingType
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ success: false, error: 'Failed to save history' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('transcripts_history')
      .select('*')
      .eq('user_id', userId)
      .neq('processing_type', QUOTA_MARKER_TYPE)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ success: false, error: 'Failed to load history' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('transcripts_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .neq('processing_type', QUOTA_MARKER_TYPE)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'History item not found' });
    }

    res.json({ success: true, item: data });
  } catch (error) {
    console.error('Error loading history item:', error);
    res.status(500).json({ success: false, error: 'Failed to load history item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('transcripts_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ success: false, error: 'Failed to delete history item' });
  }
});

export default router;
