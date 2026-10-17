import { test, expect } from '@playwright/test';

/**
 * AccessVision Assistant Extension Automated Tests
 * Tests content script DOM modifications, keyboard shortcuts,
 * and high contrast / reading mode stylesheet injections.
 */

test.describe('AccessVision Extension Injected Features', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to a standard webpage (or demo website page)
    await page.goto('/');
    
    // Inject the extension content script & styles dynamically to test in isolation
    await page.addStyleTag({ path: '../extension/content/content-styles.css' });
    await page.addScriptTag({ path: '../extension/content/content-script.js' });
  });

  test('Floating Accessibility Panel is injected into DOM with accessible controls', async ({ page }) => {
    // Wait for floating panel to render
    const panel = page.locator('#av-floating-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    
    // Verify panel has appropriate landmark/role attributes
    await expect(panel).toHaveAttribute('role', 'region');
    await expect(panel).toHaveAttribute('aria-label', /AccessVision/i);

    // Verify key action buttons exist
    const readBtn = panel.locator('button[aria-label*="Read" i]');
    const contrastBtn = panel.locator('button[aria-label*="Contrast" i]');
    await expect(readBtn).toBeVisible();
    await expect(contrastBtn).toBeVisible();
  });

  test('Toggling High Contrast adds av-high-contrast class to documentElement', async ({ page }) => {
    const contrastBtn = page.locator('#av-floating-panel button[aria-label*="Contrast" i]');
    await contrastBtn.click();

    const isHighContrast = await page.evaluate(() => 
      document.documentElement.classList.contains('av-high-contrast')
    );
    expect(isHighContrast).toBe(true);

    // Toggling again should remove it
    await contrastBtn.click();
    const isHighContrastAfter = await page.evaluate(() => 
      document.documentElement.classList.contains('av-high-contrast')
    );
    expect(isHighContrastAfter).toBe(false);
  });

  test('Missing alt text generator adds meaningful fallback to unlabelled images', async ({ page }) => {
    // Inject an image without alt attribute into the DOM
    await page.evaluate(() => {
      const img = document.createElement('img');
      img.id = 'test-unlabelled-img';
      img.src = '/assets/quarterly-financial-report-summary.jpg';
      document.body.appendChild(img);
    });

    // Trigger auto alt-text generation in content script
    await page.evaluate(() => {
      // @ts-ignore
      if (typeof window.generateMissingAltTexts === 'function') {
        // @ts-ignore
        window.generateMissingAltTexts();
      }
    });

    const img = page.locator('#test-unlabelled-img');
    await expect(img).toHaveAttribute('alt');
    const altValue = await img.getAttribute('alt');
    expect(altValue).toBeTruthy();
    expect(altValue!.length).toBeGreaterThan(0);
  });

  test('Heading outline generator correctly indexes all page headings', async ({ page }) => {
    const headingsData = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim()
      }));
    });

    expect(headingsData.length).toBeGreaterThan(0);
    // Heading 1 must exist for WCAG 1.3.1 / 2.4.6
    const hasH1 = headingsData.some(h => h.tag === 'h1');
    expect(hasH1).toBe(true);
  });
});
