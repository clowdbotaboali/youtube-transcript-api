import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

function normalizeApiKey(rawKey = '') {
  return String(rawKey)
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^['"]|['"]$/g, '');
}

// Store conversation history per session
const conversations = new Map();

router.post('/chat', async (req, res) => {
  try {
    const { message, transcript, conversationId } = req.body;
    const groqApiKey = normalizeApiKey(req.headers['x-groq-api-key'] || process.env.GROQ_API_KEY);

    if (!groqApiKey) {
      return res.status(400).json({
        success: false,
        error: 'GROQ API key is missing'
      });
    }

    const groq = new Groq({ apiKey: groqApiKey });

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'يرجى كتابة رسالة'
      });
    }

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد نص للدردشة معه'
      });
    }

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}`;
    const history = conversations.get(convId) || [];

    // Add system message with transcript context (only once at the start)
    if (history.length === 0) {
      history.push({
        role: 'system',
        content: `أنت مساعد ذكي متخصص في تحليل فيديوهات يوتيوب. مهمتك الإجابة على أسئلة المستخدم حول النص التالي:

${transcript}

القواعد:
1. أجب دائماً باللغة العربية
2. استخدم السياق من النص للإجابة
3. إذا لم تجد الإجابة في النص، أخبر المستخدم بذلك بوضوح
4. كن مفصلاً ودقيقاً في إجاباتك
5. إذا سألك المستخدم عن خطوة محددة، اشرحها بالتفصيل`
      });
    }

    // Add user message
    history.push({
      role: 'user',
      content: message
    });

    // Get AI response
    const completion = await groq.chat.completions.create({
      messages: history,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0]?.message?.content || 'عذراً، لم أفهم سؤالك';

    // Add AI response to history
    history.push({
      role: 'assistant',
      content: aiResponse
    });

    // Save conversation
    conversations.set(convId, history);

    res.json({
      success: true,
      response: aiResponse,
      conversationId: convId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء الدردشة'
    });
  }
});

// Clear conversation history
router.post('/chat/clear', (req, res) => {
  const { conversationId } = req.body;
  if (conversationId && conversations.has(conversationId)) {
    conversations.delete(conversationId);
  }
  res.json({ success: true });
});

export default router;
