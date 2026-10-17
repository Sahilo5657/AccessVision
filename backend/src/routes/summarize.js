const express = require('express');
const router = express.Router();
const { generateSummary } = require('../services/aiProvider');

/**
 * POST /api/summarize
 * Body: { text: string, maxSentences?: number }
 */
router.post('/', async (req, res) => {
  try {
    const { text, maxSentences = 3 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "text" field in request body.'
      });
    }

    const result = await generateSummary(text, Number(maxSentences) || 3);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[Summarize Route Error]', err);
    return res.status(500).json({
      error: 'An internal error occurred while generating summary.'
    });
  }
});

module.exports = router;
