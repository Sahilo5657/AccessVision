/**
 * AccessVision Backend – Context-Aware Alt-Text Generator
 *
 * Infers descriptive, accessible alternative text for images lacking alt attributes
 * by examining URL slugs, DOM container hierarchy, nearby captions, and parent links.
 */

/**
 * Clean slug into natural language words
 * @param {string} slug
 * @returns {string}
 */
function cleanSlug(slug) {
  return slug
    .replace(/\.[a-zA-Z0-9]+$/, '') // strip extension (.jpg, .png, etc.)
    .replace(/[-_]+/g, ' ')          // dashes and underscores to spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to words
    .replace(/\b(image|img|photo|picture|pic|graphic|asset|thumbnail|banner|hero)\b/gi, '') // strip generic words
    .replace(/[0-9]{4,}/g, '')       // strip long timestamps/IDs
    .trim();
}

/**
 * Generate intelligent alt-text for an image
 * @param {object} imageInfo
 * @param {string} imageInfo.src
 * @param {string} [imageInfo.context] - Nearby text or parent container text
 * @param {string} [imageInfo.caption] - Figure caption or aria-label
 * @param {string} [imageInfo.parentLink] - Destination URL or label if inside an <a> tag
 * @param {number} [imageInfo.width]
 * @param {number} [imageInfo.height]
 * @returns {object} Suggested alt text and reasoning
 */
function generateAltText(imageInfo) {
  const { src = '', context = '', caption = '', parentLink = '', width, height } = imageInfo;

  // 1. If explicit caption is provided
  if (caption && caption.trim().length > 0) {
    return {
      altText: caption.trim(),
      confidence: 0.95,
      type: 'caption_based',
      isDecorative: false
    };
  }

  // 2. Decorative image heuristic (tiny tracking pixels, spacers, icons with no action)
  if ((width && width <= 16 && height && height <= 16) || (width && height && width * height < 256)) {
    return {
      altText: '',
      confidence: 0.9,
      type: 'decorative',
      isDecorative: true,
      recommendation: 'Use alt="" (decorative spacer/icon)'
    };
  }

  // 3. Parent link heuristic (e.g. logo linking to home or article link)
  if (parentLink) {
    if (parentLink.includes('facebook') || parentLink.includes('twitter') || parentLink.includes('linkedin') || parentLink.includes('github')) {
      const platform = parentLink.split('.').slice(-2, -1)[0] || 'Social media';
      return {
        altText: `Visit our ${platform.charAt(0).toUpperCase() + platform.slice(1)} page`,
        confidence: 0.88,
        type: 'social_link',
        isDecorative: false
      };
    }
  }

  // 4. Filename slug extraction
  let filename = '';
  try {
    const urlObj = new URL(src, 'http://dummy.base');
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    filename = pathSegments.pop() || '';
  } catch (e) {
    filename = src.split('/').pop() || '';
  }

  const cleanedFilename = cleanSlug(filename);

  // 5. Context fusion
  let description = '';
  if (cleanedFilename.length > 3) {
    description = cleanedFilename;
  }

  if (context && context.trim().length > 5) {
    const snippet = context.trim().slice(0, 120);
    if (!description) {
      description = `Illustration relating to: ${snippet}`;
    } else {
      description = `${description} (${snippet})`;
    }
  }

  if (!description) {
    description = 'Image illustration';
  }

  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    altText: description,
    confidence: cleanedFilename.length > 5 ? 0.78 : 0.60,
    type: 'heuristic_contextual',
    isDecorative: false
  };
}

module.exports = {
  generateAltText,
  cleanSlug
};
