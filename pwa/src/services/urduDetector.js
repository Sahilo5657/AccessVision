/**
 * AccessVision PWA – Urdu Language & Text Analysis Subsystem
 *
 * Provides:
 * - Robust Urdu/Arabic script Unicode detection
 * - Urdu & English sentence segmentation (handles '۔', '؟', '!', '.', '?', ';')
 * - Automatic language identification & ratio scoring
 * - Word & reading time estimation
 */

// Comprehensive Unicode range covering Arabic, Urdu, Persian characters & presentation forms
export const URDU_UNICODE_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Checks if a string contains any Urdu or Arabic script characters.
 * @param {string} text
 * @returns {boolean}
 */
export function containsUrdu(text) {
  if (!text || typeof text !== 'string') return false;
  return URDU_UNICODE_REGEX.test(text);
}

/**
 * Computes whether text is predominantly Urdu.
 * Analyzes non-whitespace characters to determine script proportion.
 * @param {string} text
 * @param {number} [threshold=0.25]
 * @returns {boolean}
 */
export function isUrduDominant(text, threshold = 0.25) {
  if (!text) return false;
  const clean = text.replace(/\s+/g, '');
  if (clean.length === 0) return false;

  let urduChars = 0;
  for (let i = 0; i < clean.length; i++) {
    if (URDU_UNICODE_REGEX.test(clean[i])) {
      urduChars++;
    }
  }

  return urduChars / clean.length >= threshold;
}

/**
 * Detects language code ('ur' or 'en')
 * @param {string} text
 * @returns {'ur' | 'en'}
 */
export function detectLanguage(text) {
  return isUrduDominant(text) ? 'ur' : 'en';
}

/**
 * Splits article or text into individual sentences for speech synthesis and live highlighting.
 * Handles both English sentence delimiters (. ! ?) and Urdu delimiters (۔ ؟ !).
 *
 * @param {string} text
 * @returns {Array<{text: string, lang: 'ur'|'en', index: number}>}
 */
export function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];

  // Split on newlines, standard punctuation (. ? !), and Urdu punctuation (۔ ؟)
  // Preserves natural phrasing without cutting abbreviations abruptly
  const rawParts = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.?!;۔؟])\s+|\n+/);

  const sentences = [];
  let currentIndex = 0;

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      sentences.push({
        text: trimmed,
        lang: detectLanguage(trimmed),
        index: currentIndex++
      });
    }
  }

  return sentences;
}

/**
 * Calculates word count and estimated reading time in minutes.
 * @param {string} text
 * @returns {{wordCount: number, readingTimeMinutes: number}}
 */
export function calculateTextStats(text) {
  if (!text) return { wordCount: 0, readingTimeMinutes: 0 };
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Average reading speed: 160 words per minute for synthesized audio
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 160));
  return { wordCount, readingTimeMinutes };
}
