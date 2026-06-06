/**
 * AI Shopping Assistant — Conversational Logic Engine
 * 
 * Client-side rule-based chatbot that searches against the
 * product catalog from ShopContext. No external API required.
 */

// ============================================
// Intent Definitions
// ============================================

const INTENTS = {
  GREETING: {
    keywords: ['hi', 'hello', 'hey', 'hola', 'sup', 'good morning', 'good evening', 'good afternoon', 'howdy'],
    priority: 1,
  },
  FAREWELL: {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'thanks', 'thank you', 'thx', 'cheers'],
    priority: 1,
  },
  BEST_SELLERS: {
    keywords: ['best', 'bestseller', 'best seller', 'popular', 'trending', 'top rated', 'most popular', 'hot', 'trending now'],
    priority: 3,
  },
  NEW_ARRIVALS: {
    keywords: ['new', 'latest', 'arrival', 'recent', 'just in', 'fresh', 'new arrivals', 'new collection'],
    priority: 3,
  },
  WOMEN_COLLECTION: {
    keywords: ["women", "women's", "woman", "ladies", "female", "her", "girls collection", "women's collection"],
    priority: 4,
  },
  MEN_COLLECTION: {
    keywords: ["men", "men's", "man", "male", "guys", "him", "men's collection", "gents"],
    priority: 4,
  },
  KIDS_COLLECTION: {
    keywords: ['kids', 'children', 'child', 'boy', 'girl', 'junior', 'baby', 'toddler'],
    priority: 4,
  },
  TOPWEAR: {
    keywords: ['top', 'tops', 'shirt', 'shirts', 't-shirt', 'tshirt', 'tee', 'blouse', 'topwear', 'cotton top', 'hoodie', 'hoodies', 'sweatshirt'],
    priority: 5,
  },
  BOTTOMWEAR: {
    keywords: ['bottom', 'bottoms', 'trouser', 'trousers', 'pant', 'pants', 'jeans', 'bottomwear', 'palazzo', 'shorts', 'leggings'],
    priority: 5,
  },
  WINTERWEAR: {
    keywords: ['winter', 'jacket', 'jackets', 'coat', 'coats', 'winterwear', 'warm', 'sweater', 'denim jacket'],
    priority: 5,
  },
  FOOTWEAR: {
    keywords: ['shoe', 'shoes', 'footwear', 'sneaker', 'sneakers', 'boot', 'boots', 'sandal', 'sandals', 'heels', 'loafer'],
    priority: 5,
  },
  SIZE_GUIDE: {
    keywords: ['size', 'sizing', 'fit', 'measurement', 'size guide', 'size chart', 'what size', 'which size', 'small', 'medium', 'large', 'xl', 'xxl'],
    priority: 6,
  },
  ORDER_TRACKING: {
    keywords: ['track', 'tracking', 'order', 'where is my', 'delivery', 'shipping', 'dispatch', 'track order', 'order status'],
    priority: 6,
  },
  RETURNS: {
    keywords: ['return', 'returns', 'exchange', 'refund', 'replace', 'replacement', 'return policy', 'cancel', 'cancellation'],
    priority: 6,
  },
  PROMOTIONS: {
    keywords: ['sale', 'discount', 'offer', 'offers', 'coupon', 'deal', 'deals', 'promo', 'promotion', 'clearance', 'price drop'],
    priority: 6,
  },
  BUDGET: {
    keywords: ['under', 'below', 'cheap', 'affordable', 'budget', 'inexpensive', 'low price', 'less than'],
    priority: 7,
  },
  PRODUCT_SEARCH: {
    keywords: ['show', 'find', 'looking', 'want', 'need', 'search', 'get', 'suggest', 'recommend', 'outfit', 'summer', 'casual', 'formal', 'party', 'oversized', 'black', 'white', 'blue', 'red', 'pink', 'green', 'cotton', 'denim', 'slim', 'relaxed'],
    priority: 8,
  },
};

// ============================================
// Response Templates
// ============================================

const RESPONSES = {
  GREETING: [
    "Hey there! 👋 Welcome to Shopkart! How can I help you find your perfect outfit today?",
    "Hi! 😊 I'm your Style Advisor. Looking for something specific or just browsing?",
    "Hello! 🛍️ Great to see you! I can help you discover amazing fashion. What are you looking for?",
  ],
  FAREWELL: [
    "Thanks for shopping with us! 🛍️ Come back anytime for style advice!",
    "Bye! 👋 Hope you found something you love. Happy shopping!",
    "See you soon! 😊 Don't forget to check out our latest collection!",
  ],
  SIZE_GUIDE: [
    "📏 **Size Guide**\n\nHere's our general sizing:\n\n• **S** — Chest: 36\", Waist: 28-30\"\n• **M** — Chest: 38-40\", Waist: 30-32\"\n• **L** — Chest: 42\", Waist: 34\"\n• **XL** — Chest: 44\", Waist: 36\"\n• **XXL** — Chest: 46-48\", Waist: 38-40\"\n\n💡 **Tip:** When in doubt, go one size up for a relaxed fit! You can always check individual product pages for specific measurements.",
  ],
  ORDER_TRACKING: [
    "📦 Let me help you track your order! Please go to your **Orders** page to see the latest status of all your orders. Would you like me to take you there?",
  ],
  RETURNS: [
    "↩️ **Returns & Exchange Policy**\n\n• Easy return within **7 days** of delivery\n• Free exchange for different size/color\n• Cash on delivery available on most items\n• Refund processed within 5-7 business days\n\nNeed to initiate a return? Head over to your **Orders** page and select the item you'd like to return.",
  ],
  PROMOTIONS: [
    "🎁 **Current Offers**\n\n• 🔥 Check out our **Best Sellers** — most loved by our customers!\n• 🆕 **New Arrivals** dropping weekly\n• 💰 Free delivery on orders above $50\n• ↩️ Easy 7-day returns on all items\n\nWould you like me to show you our best sellers or latest arrivals?",
  ],
  FOOTWEAR: [
    "👟 We're expanding our footwear collection soon! In the meantime, let me show you our trending clothing items that'll pair perfectly with any shoes. Want to see our latest picks?",
  ],
  NO_RESULTS: [
    "I couldn't find exact matches for that, but here are some items you might like! 😊",
    "Hmm, nothing specific matched, but check out these popular picks! 🔥",
  ],
  FALLBACK: [
    "I'm not sure I understood that. 🤔 I can help you with:\n\n• 🛍️ Finding products\n• 👗 Style recommendations\n• 📏 Size guidance\n• 📦 Order tracking\n• ↩️ Returns & exchanges\n\nTry asking something like *\"Show me men's t-shirts\"* or *\"What's trending?\"*",
    "Sorry, I didn't catch that! 😅 Try asking me about specific products, collections, or use the quick actions below to get started.",
  ],
};

// ============================================
// Helper Functions
// ============================================

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(input) {
  const lower = input.toLowerCase().trim();
  let matchedIntents = [];

  for (const [intentName, intentDef] of Object.entries(INTENTS)) {
    for (const keyword of intentDef.keywords) {
      if (lower.includes(keyword)) {
        matchedIntents.push({ intent: intentName, priority: intentDef.priority, keyword });
        break;
      }
    }
  }

  // Sort by priority (lower number = higher priority for simple intents, but we want
  // more specific intents to win, so higher priority number = more specific)
  matchedIntents.sort((a, b) => b.priority - a.priority);

  return matchedIntents;
}

function extractPriceLimit(input) {
  const match = input.match(/(?:under|below|less than|max|upto|up to)\s*\$?\s*(\d+)/i);
  if (match) return parseInt(match[1]);
  
  const match2 = input.match(/\$?\s*(\d+)\s*(?:or less|max|budget)/i);
  if (match2) return parseInt(match2[1]);
  
  return null;
}

function filterProducts(products, { category, subCategory, bestseller, priceLimit, sortByDate, searchTerms, limit = 6 }) {
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (subCategory) {
    filtered = filtered.filter(p => p.subCategory.toLowerCase() === subCategory.toLowerCase());
  }

  if (bestseller) {
    filtered = filtered.filter(p => p.bestseller);
  }

  if (priceLimit) {
    filtered = filtered.filter(p => p.price <= priceLimit);
  }

  if (searchTerms && searchTerms.length > 0) {
    filtered = filtered.filter(p => {
      const productText = `${p.name} ${p.category} ${p.subCategory} ${p.description}`.toLowerCase();
      return searchTerms.some(term => productText.includes(term.toLowerCase()));
    });
  }

  if (sortByDate) {
    filtered.sort((a, b) => b.date - a.date);
  }

  return filtered.slice(0, limit);
}

// ============================================
// Main Processing Function
// ============================================

/**
 * Process a user message and return a bot response.
 * 
 * @param {string} userMessage - The user's input text
 * @param {Array} products - Products array from ShopContext
 * @param {Function} navigate - React Router navigate function
 * @returns {{ text: string, products?: Array, action?: string }}
 */
export function processMessage(userMessage, products, navigate) {
  const intents = detectIntent(userMessage);
  const priceLimit = extractPriceLimit(userMessage);

  // No intents matched
  if (intents.length === 0 && !priceLimit) {
    // Try a general product name search
    const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const searchResults = filterProducts(products, { searchTerms: words });
      if (searchResults.length > 0) {
        return {
          text: `Here's what I found for "${userMessage}" 🔍`,
          products: searchResults,
        };
      }
    }
    return { text: randomFrom(RESPONSES.FALLBACK) };
  }

  const primaryIntent = intents.length > 0 ? intents[0].intent : null;

  // Handle simple text responses
  if (primaryIntent === 'GREETING') {
    return { text: randomFrom(RESPONSES.GREETING) };
  }

  if (primaryIntent === 'FAREWELL') {
    return { text: randomFrom(RESPONSES.FAREWELL) };
  }

  if (primaryIntent === 'SIZE_GUIDE') {
    return { text: RESPONSES.SIZE_GUIDE[0] };
  }

  if (primaryIntent === 'ORDER_TRACKING') {
    return { text: RESPONSES.ORDER_TRACKING[0], action: 'navigate_orders' };
  }

  if (primaryIntent === 'RETURNS') {
    return { text: RESPONSES.RETURNS[0] };
  }

  if (primaryIntent === 'PROMOTIONS') {
    return { text: RESPONSES.PROMOTIONS[0] };
  }

  if (primaryIntent === 'FOOTWEAR') {
    const trending = filterProducts(products, { bestseller: true, limit: 4 });
    return { 
      text: RESPONSES.FOOTWEAR[0], 
      products: trending.length > 0 ? trending : undefined 
    };
  }

  // Product-related intents
  let filterOpts = { limit: 6 };
  let responsePrefix = '';

  // Determine category
  if (primaryIntent === 'WOMEN_COLLECTION' || intents.some(i => i.intent === 'WOMEN_COLLECTION')) {
    filterOpts.category = 'Women';
    responsePrefix = "👗 Here's our Women's collection";
  } else if (primaryIntent === 'MEN_COLLECTION' || intents.some(i => i.intent === 'MEN_COLLECTION')) {
    filterOpts.category = 'Men';
    responsePrefix = "👔 Here's our Men's collection";
  } else if (primaryIntent === 'KIDS_COLLECTION' || intents.some(i => i.intent === 'KIDS_COLLECTION')) {
    filterOpts.category = 'Kids';
    responsePrefix = "🧒 Here's our Kids' collection";
  }

  // Determine subcategory
  if (intents.some(i => i.intent === 'TOPWEAR')) {
    filterOpts.subCategory = 'Topwear';
    responsePrefix = responsePrefix ? `${responsePrefix} — Topwear` : "👕 Check out our Topwear";
  } else if (intents.some(i => i.intent === 'BOTTOMWEAR')) {
    filterOpts.subCategory = 'Bottomwear';
    responsePrefix = responsePrefix ? `${responsePrefix} — Bottomwear` : "👖 Check out our Bottomwear";
  } else if (intents.some(i => i.intent === 'WINTERWEAR')) {
    filterOpts.subCategory = 'Winterwear';
    responsePrefix = responsePrefix ? `${responsePrefix} — Winterwear` : "🧥 Check out our Winterwear";
  }

  // Best sellers
  if (primaryIntent === 'BEST_SELLERS' || intents.some(i => i.intent === 'BEST_SELLERS')) {
    filterOpts.bestseller = true;
    responsePrefix = responsePrefix || "🎯 Our Best Sellers — loved by everyone";
  }

  // New arrivals
  if (primaryIntent === 'NEW_ARRIVALS' || intents.some(i => i.intent === 'NEW_ARRIVALS')) {
    filterOpts.sortByDate = true;
    responsePrefix = responsePrefix || "🆕 Just arrived — hot off the rack";
  }

  // Budget filter
  if (priceLimit) {
    filterOpts.priceLimit = priceLimit;
    responsePrefix = responsePrefix 
      ? `${responsePrefix} (under $${priceLimit})` 
      : `💰 Products under $${priceLimit}`;
  }

  // General product search — extract search terms from the message
  if (primaryIntent === 'PRODUCT_SEARCH' && !filterOpts.category && !filterOpts.subCategory && !filterOpts.bestseller) {
    const stopWords = ['show', 'me', 'find', 'looking', 'for', 'want', 'need', 'search', 'get', 'suggest', 'recommend', 'some', 'the', 'a', 'an', 'i', 'my', 'please', 'can', 'you', 'do', 'have', 'any'];
    const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w));
    if (words.length > 0) {
      filterOpts.searchTerms = words;
      responsePrefix = `🔍 Here's what I found for "${userMessage}"`;
    }
  }

  // Execute search
  const results = filterProducts(products, filterOpts);

  if (results.length === 0) {
    // Fallback: show some bestsellers or recent items
    const fallbackProducts = filterProducts(products, { bestseller: true, limit: 4 });
    if (fallbackProducts.length > 0) {
      return {
        text: `${randomFrom(RESPONSES.NO_RESULTS)}`,
        products: fallbackProducts,
      };
    }
    // Show random products
    const randomProducts = products.slice(0, 4);
    return {
      text: randomFrom(RESPONSES.NO_RESULTS),
      products: randomProducts,
    };
  }

  return {
    text: `${responsePrefix || "Here are some picks for you"} ✨`,
    products: results,
  };
}

/**
 * Map quick action chip text to a user-friendly query.
 */
export function getQuickActionQuery(chipText) {
  const mapping = {
    '🛍️ New Arrivals': 'Show me new arrivals',
    '👗 Women\'s Collection': 'Show me women\'s collection',
    '👔 Men\'s Collection': 'Show me men\'s collection',
    '👟 Footwear': 'Show me footwear',
    '🎯 Best Sellers': 'Show me best sellers',
    '🔥 Trending Now': 'What\'s trending right now?',
    '🎁 Offers & Discounts': 'Are there any offers or discounts?',
    '📦 Track Order': 'I want to track my order',
    '↩️ Returns & Exchanges': 'What\'s the return policy?',
    '📏 Size Guide': 'Show me the size guide',
  };
  return mapping[chipText] || chipText;
}

/**
 * List of quick action chips to display.
 */
export const QUICK_ACTIONS = [
  '🛍️ New Arrivals',
  '👗 Women\'s Collection',
  '👔 Men\'s Collection',
  '👟 Footwear',
  '🎯 Best Sellers',
  '🔥 Trending Now',
  '🎁 Offers & Discounts',
  '📦 Track Order',
  '↩️ Returns & Exchanges',
  '📏 Size Guide',
];
