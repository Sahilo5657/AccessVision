const express = require('express');
const router = express.Router();
const { generateImageDescription } = require('../services/aiProvider');

/**
 * POST /api/alt-text
 * Body: { src: string, context?: string, caption?: string, parentLink?: string, width?: number, height?: number }
 */
router.post('/', async (req, res) => {
  try {
    const { src, context, caption, parentLink, width, height } = req.body;

    if (!src || typeof src !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "src" attribute for image.'
      });
    }

    const result = await generateImageDescription({
      src,
      context,
      caption,
      parentLink,
      width: Number(width) || undefined,
      height: Number(height) || undefined
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[Alt-Text Route Error]', err);
    return res.status(500).json({
      error: 'An internal error occurred while generating alt-text.'
    });
  }
});

/**
 * POST /api/alt-text/batch
 * Body: { images: Array<{ src: string, context?: string, ... }> }
 */
router.post('/batch', async (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({
        error: '"images" must be an array of image objects.'
      });
    }

    const results = await Promise.all(
      images.map(async (img) => {
        const desc = await generateImageDescription(img);
        return {
          src: img.src,
          ...desc
        };
      })
    );

    return res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('[Batch Alt-Text Error]', err);
    return res.status(500).json({
      error: 'An internal error occurred during batch processing.'
    });
  }
});

module.exports = router;
