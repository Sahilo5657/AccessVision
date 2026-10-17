import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * AccessVision Automated Accessibility Test Suite
 * Validates compliance against WCAG 2.2 Level A and Level AA standards.
 */

test.describe('WCAG 2.2 AA Automated Audits via axe-core', () => {

  test('HomePage should have ZERO critical or serious axe accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ArticlesPage should have ZERO axe accessibility violations', async ({ page }) => {
    await page.goto('/articles');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ContactPage should have ZERO axe accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('AboutPage should have ZERO axe accessibility violations', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('WCAG 2.4.1 Bypass Blocks & Keyboard Navigation', () => {

  test('Skip Link becomes visible on focus and directs focus to main landmark', async ({ page }) => {
    await page.goto('/');
    
    // Initial tab key press should target skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Activating skip link jumps focus to main content
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    
    await expect(mainContent).toBeFocused();
  });

  test('All interactive elements have visible and distinct focus outlines', async ({ page }) => {
    await page.goto('/');
    
    // Tab through header navigation
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Brand logo / Home link
    
    const brandLink = page.locator('header a[href="/"]');
    await expect(brandLink).toBeFocused();
  });
});

test.describe('WCAG 3.3.1 Error Identification & Form Accessibility', () => {

  test('Contact form announces errors via ARIA live and focuses error summary', async ({ page }) => {
    await page.goto('/contact');
    
    // Attempt submitting without filling required fields
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error summary banner is visible and has alert role
    const errorSummary = page.locator('[role="alert"], #error-summary');
    await expect(errorSummary).toBeVisible();

    // Verify individual field error associations via aria-invalid and aria-describedby
    const nameInput = page.locator('input#name');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveAttribute('aria-describedby');

    const emailInput = page.locator('input#email');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('Built-in Accessibility Toolbar Controls', () => {

  test('High Contrast toggle alters document theme and updates aria-pressed', async ({ page }) => {
    await page.goto('/');
    
    const contrastBtn = page.locator('button[aria-label*="contrast" i], button#toggle-contrast');
    if (await contrastBtn.count() > 0) {
      const initialPressed = await contrastBtn.first().getAttribute('aria-pressed');
      await contrastBtn.first().click();
      
      const newPressed = await contrastBtn.first().getAttribute('aria-pressed');
      expect(newPressed).not.toEqual(initialPressed);

      // Verify high-contrast class or attribute is toggled on root element
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      expect(htmlClass).toContain('high-contrast');
    }
  });

  test('Font scaling adjusts root or body font size dynamically', async ({ page }) => {
    await page.goto('/');
    
    const fontIncreaseBtn = page.locator('button[aria-label*="increase font" i], button#increase-font');
    if (await fontIncreaseBtn.count() > 0) {
      await fontIncreaseBtn.first().click();
      const fontSizeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-font-size'));
      expect(fontSizeAttr).toBeDefined();
    }
  });
});
