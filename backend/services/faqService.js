import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// FAQ Service — In-memory cached FAQ data
// ============================================

let faqCache = null;
let isLoaded = false;

/**
 * Load FAQ data from JSON file into memory.
 * Called once at server startup. Subsequent calls return cached data.
 */
const loadFAQData = async () => {
  if (isLoaded && faqCache) {
    return faqCache;
  }

  try {
    const faqPath = join(__dirname, '..', 'data', 'faq.json');
    const rawData = await readFile(faqPath, 'utf-8');
    faqCache = JSON.parse(rawData);
    isLoaded = true;
    console.log(`[FAQ Service] Loaded ${faqCache.length} FAQ entries into memory`);
    return faqCache;
  } catch (error) {
    console.error('[FAQ Service] Failed to load FAQ data:', error.message);
    throw new Error('Failed to load FAQ knowledge base');
  }
};

/**
 * Get all cached FAQ entries.
 * @returns {Array} Array of FAQ objects
 */
const getAllFAQs = () => {
  if (!isLoaded || !faqCache) {
    throw new Error('FAQ data not loaded. Call loadFAQData() first.');
  }
  return faqCache;
};

/**
 * Get a single FAQ entry by ID.
 * @param {number} id 
 * @returns {Object|null}
 */
const getFAQById = (id) => {
  if (!faqCache) return null;
  return faqCache.find(faq => faq.id === id) || null;
};

export { loadFAQData, getAllFAQs, getFAQById };
