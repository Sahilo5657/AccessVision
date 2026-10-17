const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure feedback file exists
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([]), 'utf-8');
}

/**
 * POST /api/feedback
 * Body: { name, email, subject, message, feedbackType }
 */
router.post('/', (req, res) => {
  try {
    const { name, email, subject, message, feedbackType } = req.body;

    // Server-side validation
    if (!name || !email || !subject || !message || !feedbackType) {
      return res.status(400).json({
        success: false,
        error: 'All fields (name, email, subject, message, feedbackType) are required.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address provided.'
      });
    }

    const newEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      feedbackType: feedbackType.trim(),
      receivedAt: new Date().toISOString(),
      status: 'received'
    };

    let entries = [];
    try {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      entries = JSON.parse(data);
    } catch (e) {
      entries = [];
    }

    entries.unshift(newEntry);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your accessibility feedback has been recorded securely.',
      ticketId: newEntry.id
    });
  } catch (err) {
    console.error('[Feedback Route Error]', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while recording feedback.'
    });
  }
});

/**
 * GET /api/feedback
 * Retrieve submitted feedback entries
 */
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
    const entries = JSON.parse(data);
    return res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Could not read feedback entries.'
    });
  }
});

module.exports = router;
