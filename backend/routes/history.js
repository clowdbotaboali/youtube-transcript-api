import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/save', (req, res) => {
  try {
    const { videoId, videoTitle, transcript, processingType, result } = req.body;
    
    if (!videoId || !transcript || !processingType || !result) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير كاملة'
      });
    }

    const id = db.insert({
      video_id: videoId,
      video_title: videoTitle,
      transcript,
      processing_type: processingType,
      result
    });

    res.json({
      success: true,
      id
    });

  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حفظ البيانات'
    });
  }
});

router.get('/list', (req, res) => {
  try {
    const history = db.getAll();

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء استرجاع السجل'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const item = db.getById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'العنصر غير موجود'
      });
    }

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Get history item error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء استرجاع البيانات'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = db.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'العنصر غير موجود'
      });
    }

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حذف البيانات'
    });
  }
});

export default router;
