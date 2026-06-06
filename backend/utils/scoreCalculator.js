// ============================================
// Score Calculator — Text Similarity Utilities
// ============================================
// This module provides the core text processing
// and similarity scoring functions. It is designed
// to be replaceable with embedding-based solutions
// (OpenAI, Gemini Embeddings, Pinecone, ChromaDB)
// without modifying the controller layer.
// ============================================

/**
 * Normalize text for comparison.
 * - Lowercase
 * - Remove punctuation
 * - Collapse whitespace
 * - Trim
 * @param {string} text 
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .trim();
};

/**
 * Tokenize text into an array of words.
 * Filters out very short words (length <= 1).
 * @param {string} text 
 * @returns {string[]}
 */
const tokenize = (text) => {
  const normalized = normalizeText(text);
  return normalized.split(' ').filter(word => word.length > 1);
};

/**
 * Common stop words to optionally filter out for better matching.
 */
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
  'they', 'them', 'this', 'that', 'is', 'am', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might',
  'a', 'an', 'the', 'and', 'but', 'or', 'if', 'of', 'at', 'by',
  'for', 'to', 'in', 'on', 'with', 'as', 'from', 'up', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'also', 'what', 'which', 'who', 'whom'
]);

/**
 * Remove stop words from a token array.
 * @param {string[]} tokens 
 * @returns {string[]}
 */
const removeStopWords = (tokens) => {
  const filtered = tokens.filter(word => !STOP_WORDS.has(word));
  // If all words were stop words, return original to avoid empty result
  return filtered.length > 0 ? filtered : tokens;
};

/**
 * Calculate Jaccard similarity between two sets of tokens.
 * Jaccard = |Intersection| / |Union|
 * @param {string[]} tokensA 
 * @param {string[]} tokensB 
 * @returns {number} 0.0 to 1.0
 */
const jaccardSimilarity = (tokensA, tokensB) => {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

/**
 * Calculate word overlap ratio — how many query words appear in the target.
 * This is asymmetric: it measures how much of the query is covered.
 * @param {string[]} queryTokens 
 * @param {string[]} targetTokens 
 * @returns {number} 0.0 to 1.0
 */
const overlapScore = (queryTokens, targetTokens) => {
  if (queryTokens.length === 0) return 0;
  const targetSet = new Set(targetTokens);
  const matches = queryTokens.filter(word => targetSet.has(word));
  return matches.length / queryTokens.length;
};

/**
 * Calculate substring containment score.
 * Checks if query words appear as substrings in the target text.
 * Helps with partial matches like "return" matching "returns".
 * @param {string[]} queryTokens 
 * @param {string} targetNormalized 
 * @returns {number} 0.0 to 1.0
 */
const substringScore = (queryTokens, targetNormalized) => {
  if (queryTokens.length === 0) return 0;
  let matches = 0;
  for (const word of queryTokens) {
    if (targetNormalized.includes(word)) {
      matches++;
    }
  }
  return matches / queryTokens.length;
};

/**
 * Calculate combined similarity score between a query and a target text.
 * Uses a weighted combination of:
 * - Jaccard similarity (set overlap)
 * - Word overlap ratio (query coverage)
 * - Substring matching (partial word support)
 * 
 * @param {string} query - User's input text
 * @param {string} target - FAQ question text
 * @returns {number} Combined score between 0.0 and 1.0
 */
const calculateSimilarity = (query, target) => {
  const queryNormalized = normalizeText(query);
  const targetNormalized = normalizeText(target);

  // Exact match
  if (queryNormalized === targetNormalized) return 1.0;

  // Containment check — if query is fully contained in target or vice versa
  if (targetNormalized.includes(queryNormalized) || queryNormalized.includes(targetNormalized)) {
    return 0.9;
  }

  // Tokenize and remove stop words
  const queryTokens = removeStopWords(tokenize(query));
  const targetTokens = removeStopWords(tokenize(target));

  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  // Calculate individual scores
  const jaccard = jaccardSimilarity(queryTokens, targetTokens);
  const overlap = overlapScore(queryTokens, targetTokens);
  const substring = substringScore(queryTokens, targetNormalized);

  // Weighted combination
  // Overlap and substring are weighted higher because they handle
  // cases where the user asks a shorter/rephrased version of the FAQ
  const combinedScore = (jaccard * 0.3) + (overlap * 0.35) + (substring * 0.35);

  // Clamp to [0, 1]
  return Math.min(1.0, Math.max(0.0, combinedScore));
};

export {
  normalizeText,
  tokenize,
  removeStopWords,
  jaccardSimilarity,
  overlapScore,
  substringScore,
  calculateSimilarity
};
