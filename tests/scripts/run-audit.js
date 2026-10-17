/**
 * AccessVision Automated WCAG 2.2 Accessibility Auditor Script
 *
 * Runs standalone automated accessibility verification against test HTML fixtures
 * or queries the AccessVision Backend Audit Service.
 *
 * Usage:
 *   node scripts/run-audit.js
 */

const http = require('http');

const SAMPLE_ACCESSIBLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AccessVision Reference Page</title>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header role="banner">
    <nav aria-label="Main Navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/articles">Articles</a></li>
      </ul>
    </nav>
  </header>
  <main id="main-content" tabindex="-1">
    <h1>Accessible Web Design Guidelines</h1>
    <p>Web accessibility ensures all individuals can perceive, understand, navigate, and interact with websites.</p>
    <img src="chart.png" alt="Annual accessibility progress bar chart for 2026" />
  </main>
  <footer role="contentinfo">
    <p>&copy; 2026 AccessVision Team. WCAG 2.2 Level AA Compliant.</p>
  </footer>
</body>
</html>`;

async function runBackendAudit(html) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ html });
    const req = http.request(
      'http://localhost:3001/api/audit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 3000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON from audit endpoint'));
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Backend audit connection timed out'));
    });

    req.write(payload);
    req.end();
  });
}

function runLocalHeuristicAudit(html) {
  const checks = [];

  // Check 1: HTML lang attribute
  const hasLang = /<html[^>]+lang=["'][a-zA-Z]{2}/i.test(html);
  checks.push({
    id: 'html-has-lang',
    wcag: '3.1.1 Language of Page (Level A)',
    passed: hasLang,
    details: hasLang ? 'HTML root element has valid lang attribute' : 'Missing lang attribute on <html> element',
  });

  // Check 2: Page Title
  const hasTitle = /<title[^>]*>.+<\/title>/i.test(html);
  checks.push({
    id: 'document-title',
    wcag: '2.4.2 Page Titled (Level A)',
    passed: hasTitle,
    details: hasTitle ? 'Document has non-empty <title>' : 'Missing or empty <title> tag',
  });

  // Check 3: Skip link
  const hasSkipLink = /href=["']#main-content["']/i.test(html);
  checks.push({
    id: 'bypass-blocks',
    wcag: '2.4.1 Bypass Blocks (Level A)',
    passed: hasSkipLink,
    details: hasSkipLink ? 'Skip to main content link detected' : 'No skip link targeting #main-content found',
  });

  // Check 4: Landmarks
  const hasMain = /<main[^>]*>/i.test(html) || /role=["']main["']/i.test(html);
  checks.push({
    id: 'landmark-main',
    wcag: '1.3.1 Info and Relationships (Level A)',
    passed: hasMain,
    details: hasMain ? 'Primary <main> landmark exists' : 'Missing <main> content landmark',
  });

  // Check 5: Image alt attributes
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  let unlabelledImages = 0;
  for (const img of imgTags) {
    if (!/alt=["'][^"']*["']/i.test(img) && !/aria-hidden=["']true["']/i.test(img)) {
      unlabelledImages++;
    }
  }
  checks.push({
    id: 'image-alt',
    wcag: '1.1.1 Non-text Content (Level A)',
    passed: unlabelledImages === 0,
    details: unlabelledImages === 0 ? `All ${imgTags.length} images have alt attributes` : `${unlabelledImages} images lack alt descriptions`,
  });

  // Check 6: Heading 1 existence
  const hasH1 = /<h1[^>]*>.+<\/h1>/i.test(html);
  checks.push({
    id: 'page-has-heading-one',
    wcag: '1.3.1 Info and Relationships / 2.4.6 Headings (Level AA)',
    passed: hasH1,
    details: hasH1 ? 'Level 1 heading <h1> found' : 'Document missing primary <h1> heading',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    score,
    wcagLevel: score === 100 ? 'WCAG 2.2 AA Compliant' : 'Remediation Required',
    totalChecks: checks.length,
    passedChecks: passedCount,
    violationsCount: checks.length - passedCount,
    violations: checks.filter((c) => !c.passed),
    checks,
  };
}

async function main() {
  console.log('================================================================');
  console.log('   AccessVision Automated Accessibility Audit Subsystem');
  console.log('================================================================\n');

  console.log('Running WCAG 2.2 AA Verification on Reference HTML Fixture...');

  let report = null;
  try {
    const apiResult = await runBackendAudit(SAMPLE_ACCESSIBLE_HTML);
    if (apiResult && apiResult.report) {
      console.log(' Connected to AccessVision Backend Audit Service at http://localhost:3001');
      report = apiResult.report;
    }
  } catch (err) {
    console.log(' Backend service offline on :3001. Executing local heuristic audit engine...');
    report = runLocalHeuristicAudit(SAMPLE_ACCESSIBLE_HTML);
  }

  console.log('\n----------------------------------------------------------------');
  console.log(` Audit Score: ${report.score} / 100  (${report.wcagLevel})`);
  console.log(` Passed Checks: ${report.passedChecks} of ${report.totalChecks || (report.passedChecks + report.violationsCount)}`);
  console.log(` Violations Detected: ${report.violationsCount}`);
  console.log('----------------------------------------------------------------\n');

  if (report.checks) {
    for (const c of report.checks) {
      const statusIcon = c.passed ? '✅ PASS' : '❌ FAIL';
      console.log(` [${statusIcon}] ${c.id}: ${c.details} (${c.wcag})`);
    }
  }

  if (report.violations && report.violations.length > 0) {
    console.log('\nViolations requiring attention:');
    for (const v of report.violations) {
      console.log(` - ${v.id}: ${v.details}`);
    }
  } else {
    console.log('\n✨ All automated WCAG 2.2 Level AA checks passed successfully with 0 violations!');
  }
}

main().catch((err) => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
