import { getAllFAQs } from './faqService.js';
import { calculateSimilarity } from '../utils/scoreCalculator.js';

// ============================================
// Similarity Service — FAQ Matching Engine
// ============================================
// Abstracted similarity layer. Currently uses
// text-based scoring (Jaccard + overlap + substring).
//
// FUTURE: Replace the findBestMatch() implementation
// with embedding-based search (OpenAI, Gemini Embeddings,
// Pinecone, ChromaDB, etc.) without changing the
// function signature or the controller layer.
// ============================================

/**
 * Find the best matching FAQ entry for a user query.
 * 
 * @param {string} userQuery - The user's input message
 * @returns {{ bestMatch: Object|null, confidence: number }}
 */
const findBestMatch = (userQuery) => {
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
    return { bestMatch: null, confidence: 0 };
  }

  const faqs = getAllFAQs();
  let bestMatch = null;
  let highestScore = 0;

  for (const faq of faqs) {
    const score = calculateSimilarity(userQuery, faq.question);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return {
    bestMatch,
    confidence: parseFloat(highestScore.toFixed(4))
  };
};

/**
 * Get the top N most relevant FAQ entries for context injection.
 * Used to provide Gemini with relevant company knowledge
 * even when confidence is below threshold.
 * 
 * @param {string} userQuery - The user's input message
 * @param {number} topN - Number of top matches to return (default 3)
 * @returns {Array<{ faq: Object, score: number }>}
 */
const getTopMatches = (userQuery, topN = 3) => {
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
    return [];
  }

  const faqs = getAllFAQs();
  const scored = faqs.map(faq => ({
    faq,
    score: calculateSimilarity(userQuery, faq.question)
  }));

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
};

export { findBestMatch, getTopMatches };
