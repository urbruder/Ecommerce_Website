// ============================================
// Gemini Service — HTTP-Only API Integration
// ============================================
// NO Gemini SDK. Uses native fetch() to call
// the Gemini REST API directly via HTTPS.
// Features fast response optimization and fallback.
// ============================================

// Primary model: gemini-1.5-flash is Google's fast, high-rate-limit production model
// Fallback model: gemini-1.5-flash-8b acts as secondary backup if primary times out or is busy
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash-8b';

/**
 * Build the system prompt with FAQ context and conversation history.
 * 
 * @param {string} userQuestion - Current user question
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @param {Array} relevantFAQs - Top matching FAQ entries [{faq: {question, answer}, score}]
 * @returns {string} Complete prompt
 */
const buildPrompt = (userQuestion, conversationHistory = [], relevantFAQs = []) => {
  let prompt = `You are a friendly and knowledgeable AI shopping assistant for Shopkart, a clothing e-commerce website.

Your responsibilities:
- Help customers find products, recommend outfits, and provide styling advice
- Answer questions about orders, returns, exchanges, and shipping
- Provide size guidance and color coordination help
- Be concise, helpful, and professional
- If you don't know something specific about the store, say so honestly
- Never make up order numbers, tracking IDs, or specific product availability
- Keep responses under 150 words unless the user asks for detail

`;

  // Inject relevant FAQ knowledge
  if (relevantFAQs.length > 0) {
    prompt += `Company Knowledge Base (use this information when relevant):\n`;
    relevantFAQs.forEach((entry, index) => {
      prompt += `${index + 1}. Q: ${entry.faq.question}\n   A: ${entry.faq.answer}\n\n`;
    });
    prompt += '\n';
  }

  // Inject conversation history
  if (conversationHistory.length > 0) {
    prompt += `Conversation History:\n`;
    conversationHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Customer' : 'Assistant';
      prompt += `${role}: ${msg.content}\n`;
    });
    prompt += '\n';
  }

  prompt += `Current Customer Question:\n${userQuestion}\n\nProvide a helpful and accurate answer:`;

  return prompt;
};

/**
 * Helper to call Gemini REST endpoint with timeout
 */
const sendGeminiRequest = async (modelName, requestBody, apiKey, timeoutMs = 12000) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned an empty response');
  }

  return text.trim();
};

/**
 * Send a request to Gemini API via HTTPS and return the response text.
 * 
 * @param {string} userQuestion - Current user question
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @param {Array} relevantFAQs - Top matching FAQ entries [{faq, score}]
 * @returns {Promise<string>} Gemini's response text
 */
const getGeminiResponse = async (userQuestion, conversationHistory = [], relevantFAQs = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const prompt = buildPrompt(userQuestion, conversationHistory, relevantFAQs);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 256,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };

  const startTime = Date.now();

  try {
    const text = await sendGeminiRequest(PRIMARY_MODEL, requestBody, apiKey, 12000);
    const elapsed = Date.now() - startTime;
    console.log(`[Gemini Service] Response received from ${PRIMARY_MODEL} in ${elapsed}ms (${text.length} chars)`);
    return text;
  } catch (primaryErr) {
    console.warn(`[Gemini Service] Primary model (${PRIMARY_MODEL}) failed or timed out: ${primaryErr.message}`);

    if (PRIMARY_MODEL !== FALLBACK_MODEL) {
      console.log(`[Gemini Service] Falling back to fast model: ${FALLBACK_MODEL}...`);
      const fallbackStart = Date.now();
      const text = await sendGeminiRequest(FALLBACK_MODEL, requestBody, apiKey, 10000);
      const elapsed = Date.now() - fallbackStart;
      console.log(`[Gemini Service] Fallback response received from ${FALLBACK_MODEL} in ${elapsed}ms (${text.length} chars)`);
      return text;
    }

    throw primaryErr;
  }
};

export { getGeminiResponse, buildPrompt };
