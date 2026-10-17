/**
 * AccessVision Backend – Extractive Summarization Engine
 *
 * Implements frequency-weighted sentence ranking to extract concise,
 * coherent summaries of long web articles without requiring external AI APIs.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in',
  'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should',
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s',
  'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you',
  'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Clean and tokenize raw text into sentences
 * @param {string} text
 * @returns {string[]}
 */
function splitIntoSentences(text) {
  if (!text) return [];
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length > 20 && s.split(' ').length >= 4);
}

/**
 * Tokenize sentence into significant words
 * @param {string} sentence
 * @returns {string[]}
 */
function tokenizeWords(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Summarize input text
 * @param {string} text - Raw page content
 * @param {number} maxSentences - Target number of sentences
 * @returns {object} Summary metadata and extracted text
 */
function summarizeText(text, maxSentences = 3) {
  if (!text || text.trim().length === 0) {
    return {
      summary: '',
      keyPoints: [],
      originalLength: 0,
      summaryLength: 0,
      compressionRatio: '0%',
      readingTimeMinutes: 0
    };
  }

  const sentences = splitIntoSentences(text);
  if (sentences.length <= maxSentences) {
    return {
      summary: sentences.join(' '),
      keyPoints: sentences,
      originalLength: text.length,
      summaryLength: text.length,
      compressionRatio: '100%',
      readingTimeMinutes: Math.max(1, Math.round(sentences.join(' ').split(' ').length / 200))
    };
  }

  // Calculate word frequencies
  const wordFreq = {};
  sentences.forEach(s => {
    const words = tokenizeWords(s);
    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });

  // Score sentences
  const scored = sentences.map((sentence, index) => {
    const words = tokenizeWords(sentence);
    let score = 0;
    words.forEach(w => {
      score += (wordFreq[w] || 0);
    });

    // Normalize by length to prevent bias towards run-on sentences
    if (words.length > 0) {
      score = score / words.length;
    }

    // Position bonus: earlier sentences in a document or article often hold key thesis points
    if (index === 0) score *= 1.35;
    else if (index === 1) score *= 1.2;

    return { sentence, score, originalIndex: index };
  });

  // Pick top sentences and sort them back to original chronological order
  scored.sort((a, b) => b.score - a.score);
  const topSelection = scored.slice(0, maxSentences);
  topSelection.sort((a, b) => a.originalIndex - b.originalIndex);

  const summarySentences = topSelection.map(s => s.sentence);
  const summaryText = summarySentences.join(' ');

  const origWords = text.split(/\s+/).length;
  const summWords = summaryText.split(/\s+/).length;
  const reduction = Math.round((1 - (summWords / Math.max(1, origWords))) * 100);

  return {
    summary: summaryText,
    keyPoints: summarySentences,
    originalWordCount: origWords,
    summaryWordCount: summWords,
    compressionRatio: `${reduction}% reduction`,
    readingTimeMinutes: Math.max(1, Math.round(summWords / 200))
  };
}

module.exports = {
  summarizeText,
  splitIntoSentences
};
