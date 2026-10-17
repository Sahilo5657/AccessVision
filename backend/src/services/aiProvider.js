/**
 * AccessVision Backend – Production AI Provider Integration
 *
 * Integrates live cloud AI models (Hugging Face Inference API & OpenAI API)
 * with an offline-capable fallback pipeline using local TextRank NLP.
 */

const { summarizeText } = require('./summarizer');
const { generateAltText: heuristicAltText } = require('./imageDescriber');

/**
 * Summarize text using live AI or local fallback
 * @param {string} text - Raw content
 * @param {number} maxSentences - Max sentences
 * @returns {Promise<object>} Summary result
 */
async function generateSummary(text, maxSentences = 3) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try OpenAI API if key is present
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an assistive technology assistant for visually impaired users. Provide a concise, highly readable summary of the provided text in exactly ${maxSentences} key sentences. Focus on primary facts, action items, and context.`
            },
            {
              role: 'user',
              content: text.slice(0, 8000)
            }
          ],
          temperature: 0.3,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        const summaryText = data.choices[0]?.message?.content?.trim();
        if (summaryText) {
          const sentences = summaryText.split(/(?<=[.?!])\s+/).filter(Boolean);
          return {
            summary: summaryText,
            keyPoints: sentences,
            originalWordCount: text.split(/\s+/).length,
            summaryWordCount: summaryText.split(/\s+/).length,
            compressionRatio: `${Math.round((1 - (summaryText.split(/\s+/).length / Math.max(1, text.split(/\s+/).length))) * 100)}% reduction`,
            provider: 'OpenAI (gpt-4o-mini)',
            isLiveAI: true
          };
        }
      } else {
        console.warn(`[AI Provider] OpenAI API returned status ${response.status}. Falling back.`);
      }
    } catch (err) {
      console.warn('[AI Provider] OpenAI request failed:', err.message);
    }
  }

  // 2. Try Hugging Face Inference API (facebook/bart-large-cnn)
  if (hfKey) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfKey}`
        },
        body: JSON.stringify({
          inputs: text.slice(0, 4000),
          parameters: {
            max_length: 140,
            min_length: 40,
            do_sample: false
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const summaryText = Array.isArray(data) ? data[0]?.summary_text : data?.summary_text;
        if (summaryText) {
          const sentences = summaryText.split(/(?<=[.?!])\s+/).filter(Boolean);
          return {
            summary: summaryText,
            keyPoints: sentences,
            originalWordCount: text.split(/\s+/).length,
            summaryWordCount: summaryText.split(/\s+/).length,
            compressionRatio: `${Math.round((1 - (summaryText.split(/\s+/).length / Math.max(1, text.split(/\s+/).length))) * 100)}% reduction`,
            provider: 'Hugging Face (bart-large-cnn)',
            isLiveAI: true
          };
        }
      } else {
        console.warn(`[AI Provider] Hugging Face API returned status ${response.status}. Falling back.`);
      }
    } catch (err) {
      console.warn('[AI Provider] Hugging Face request failed:', err.message);
    }
  }

  // 3. Fallback: Local Extractive TextRank Engine
  const localResult = summarizeText(text, maxSentences);
  return {
    ...localResult,
    provider: 'AccessVision Local TextRank NLP Engine',
    isLiveAI: false
  };
}

/**
 * Generate alt-text using live AI vision model or contextual heuristics
 * @param {object} imageInfo
 * @returns {Promise<object>}
 */
async function generateImageDescription(imageInfo) {
  const { src, context = '', caption = '', width, height } = imageInfo;
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // If decorative or tiny, return immediately
  if ((width && width <= 16 && height && height <= 16) || (width && height && width * height < 256)) {
    return {
      altText: '',
      confidence: 0.95,
      type: 'decorative',
      provider: 'AccessVision Heuristic Engine',
      isDecorative: true
    };
  }

  // 1. Try OpenAI Vision API if valid key and absolute HTTP image
  if (openaiKey && src && src.startsWith('http')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Provide a concise, accessible alt text (under 120 characters) for this image for a screen reader user. ${context ? 'Page context: ' + context.slice(0, 200) : ''} Do not start with "image of" or "photo of".`
                },
                {
                  type: 'image_url',
                  image_url: { url: src }
                }
              ]
            }
          ],
          max_tokens: 60
        })
      });

      if (response.ok) {
        const data = await response.json();
        const altText = data.choices[0]?.message?.content?.trim();
        if (altText) {
          return {
            altText,
            confidence: 0.95,
            type: 'ai_vision_caption',
            provider: 'OpenAI Vision (gpt-4o-mini)',
            isLiveAI: true,
            isDecorative: false
          };
        }
      }
    } catch (err) {
      console.warn('[AI Provider] OpenAI Vision failed:', err.message);
    }
  }

  // 2. Try Hugging Face Vision (Salesforce/blip-image-captioning-large)
  if (hfKey && src && src.startsWith('http')) {
    try {
      const imgRes = await fetch(src);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfKey}`
          },
          body: imgBuffer
        });

        if (response.ok) {
          const data = await response.json();
          const generatedCaption = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
          if (generatedCaption) {
            const capitalized = generatedCaption.charAt(0).toUpperCase() + generatedCaption.slice(1);
            return {
              altText: capitalized,
              confidence: 0.92,
              type: 'ai_blip_caption',
              provider: 'Hugging Face (BLIP-Large)',
              isLiveAI: true,
              isDecorative: false
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Provider] Hugging Face Vision failed:', err.message);
    }
  }

  // 3. Fallback: Contextual Heuristic Analyzer
  const fallback = heuristicAltText(imageInfo);
  return {
    ...fallback,
    provider: 'AccessVision Contextual Heuristic Analyzer',
    isLiveAI: false
  };
}

module.exports = {
  generateSummary,
  generateImageDescription
};
