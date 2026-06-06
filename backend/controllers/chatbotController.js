import { findBestMatch, getTopMatches } from '../services/similarityService.js';
import { getGeminiResponse } from '../services/geminiService.js';

// ============================================
// Chatbot Controller — Orchestrates the
// Knowledge Base → Similarity → AI pipeline
// ============================================

// Configurable threshold from environment
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.45;

/**
 * POST /api/chat
 * 
 * Main chat endpoint. Receives a user message and optional
 * conversation history. Returns an answer from either the
 * FAQ knowledge base or Gemini AI fallback.
 * 
 * Request body:
 * {
 *   "message": "How do I return a product?",
 *   "conversationHistory": []
 * }
 * 
 * Response:
 * {
 *   "source": "faq" | "gemini",
 *   "confidence": number,
 *   "answer": string
 * }
 */
const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // ─── Validation ───
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    const userQuery = message.trim();

    console.log(`\n[Chatbot] ─── New Query ───`);
    console.log(`[Chatbot] User: "${userQuery}"`);

    // ─── Step 1: Similarity Matching ───
    const { bestMatch, confidence } = findBestMatch(userQuery);

    console.log(`[Chatbot] Best match: "${bestMatch?.question || 'None'}"`);
    console.log(`[Chatbot] Confidence: ${confidence}`);
    console.log(`[Chatbot] Threshold: ${SIMILARITY_THRESHOLD}`);

    // ─── Step 2: Check threshold ───
    if (bestMatch && confidence >= SIMILARITY_THRESHOLD) {
      console.log(`[Chatbot] ✅ FAQ answer selected (confidence ${confidence} >= ${SIMILARITY_THRESHOLD})`);

      return res.json({
        source: 'faq',
        confidence,
        answer: bestMatch.answer
      });
    }

    // ─── Step 3: Gemini AI Fallback ───
    console.log(`[Chatbot] ⚡ Confidence ${confidence} < ${SIMILARITY_THRESHOLD} — triggering Gemini fallback`);

    // Get top 3 relevant FAQs for context injection
    const topMatches = getTopMatches(userQuery, 3);

    console.log(`[Chatbot] Injecting ${topMatches.length} FAQ entries into Gemini context`);
    topMatches.forEach((m, i) => {
      console.log(`  ${i + 1}. (${m.score.toFixed(3)}) "${m.faq.question}"`);
    });

    const startTime = Date.now();

    const geminiAnswer = await getGeminiResponse(
      userQuery,
      conversationHistory,
      topMatches
    );

    const elapsed = Date.now() - startTime;
    console.log(`[Chatbot] Gemini responded in ${elapsed}ms`);

    return res.json({
      source: 'gemini',
      confidence,
      answer: geminiAnswer
    });

  } catch (error) {
    console.error(`[Chatbot] Error:`, error.message);

    // Specific error handling
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please contact support.'
      });
    }

    if (error.message.includes('Gemini API request failed')) {
      return res.status(502).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.'
      });
    }

    if (error.message.includes('FAQ data not loaded')) {
      return res.status(503).json({
        success: false,
        message: 'Knowledge base is still loading. Please try again in a moment.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

export { handleChatMessage };
