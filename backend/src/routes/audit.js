const express = require('express');
const router = express.Router();

/**
 * Perform static accessibility rule analysis on HTML markup
 * @param {string} html
 * @returns {object} Audit report with violations and score
 */
function auditHtmlMarkup(html) {
  const issues = [];
  let passedCount = 0;

  // 1. Check for <html> lang attribute
  if (/<html[^>]*\blang=["'][a-zA-Z-]+["']/i.test(html)) {
    passedCount++;
  } else {
    issues.push({
      rule: 'html-has-lang',
      wcag: '3.1.1 Language of Page (Level A)',
      impact: 'serious',
      description: 'The <html> element does not specify a valid lang attribute.'
    });
  }

  // 2. Check for missing alt tags on <img>
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  let missingAlt = 0;
  imgTags.forEach(tag => {
    if (!/\balt\s*=/i.test(tag)) {
      missingAlt++;
    }
  });

  if (missingAlt > 0) {
    issues.push({
      rule: 'image-alt',
      wcag: '1.1.1 Non-text Content (Level A)',
      impact: 'critical',
      description: `Found ${missingAlt} image(s) lacking an alt attribute.`
    });
  } else if (imgTags.length > 0) {
    passedCount++;
  }

  // 3. Check for form inputs lacking labels
  const inputTags = html.match(/<input\b(?![^>]*type=["'](?:hidden|submit|button|reset)["'])[^>]*>/gi) || [];
  let missingLabels = 0;
  inputTags.forEach(tag => {
    if (!/\baria-label\s*=/i.test(tag) && !/\baria-labelledby\s*=/i.test(tag) && !/\bid\s*=/i.test(tag)) {
      missingLabels++;
    }
  });

  if (missingLabels > 0) {
    issues.push({
      rule: 'label',
      wcag: '1.3.1 Info and Relationships / 4.1.2 Name, Role, Value (Level A)',
      impact: 'critical',
      description: `Found ${missingLabels} form input(s) without identifiable labels or ARIA descriptions.`
    });
  } else if (inputTags.length > 0) {
    passedCount++;
  }

  // 4. Check for landmark presence
  const hasMain = /<(?:main\b|div\b[^>]*role=["']main["'])/i.test(html);
  const hasNav = /<(?:nav\b|div\b[^>]*role=["']navigation["'])/i.test(html);
  if (hasMain) passedCount++;
  else {
    issues.push({
      rule: 'landmark-main-is-top-level',
      wcag: '1.3.1 Info and Relationships (Level A)',
      impact: 'moderate',
      description: 'Document lacks a main landmark (<main> or role="main").'
    });
  }

  if (hasNav) passedCount++;
  else {
    issues.push({
      rule: 'landmark-navigation',
      wcag: '1.3.1 Info and Relationships (Level A)',
      impact: 'moderate',
      description: 'Document lacks a navigation landmark (<nav> or role="navigation").'
    });
  }

  // 5. Check for Skip Link
  const hasSkipLink = /href=["']#main(?:-content)?["']/i.test(html);
  if (hasSkipLink) passedCount++;
  else {
    issues.push({
      rule: 'bypass-blocks',
      wcag: '2.4.1 Bypass Blocks (Level A)',
      impact: 'serious',
      description: 'No skip navigation link found to bypass repeating header/nav blocks.'
    });
  }

  // Calculate score (0 to 100)
  const totalChecks = passedCount + issues.length;
  const score = totalChecks > 0 ? Math.round((passedCount / totalChecks) * 100) : 100;

  return {
    score,
    wcagLevel: score >= 90 ? 'WCAG 2.2 AA Compliant' : score >= 70 ? 'Partially Compliant' : 'Non-Compliant',
    passedChecks: passedCount,
    violationsCount: issues.length,
    violations: issues
  };
}

/**
 * POST /api/audit
 * Body: { html: string }
 */
router.post('/', (req, res) => {
  try {
    const { html } = req.body;
    if (!html || typeof html !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "html" string in request body.'
      });
    }

    const report = auditHtmlMarkup(html);
    return res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error('[Audit Route Error]', err);
    return res.status(500).json({
      error: 'An internal error occurred during accessibility audit.'
    });
  }
});

module.exports = router;
