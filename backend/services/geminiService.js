// ============================================
// Gemini Service — HTTP-Only API Integration
// ============================================
// NO Gemini SDK. Uses native fetch() to call
// the Gemini REST API directly via HTTPS.
// ============================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
      maxOutputTokens: 512,
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

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const startTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Gemini Service] API error (${response.status}) after ${elapsed}ms:`, errorBody);
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('[Gemini Service] Empty response from Gemini API');
    throw new Error('Gemini API returned an empty response');
  }

  console.log(`[Gemini Service] Response received in ${elapsed}ms (${text.length} chars)`);

  return text.trim();
};

export { getGeminiResponse, buildPrompt };
