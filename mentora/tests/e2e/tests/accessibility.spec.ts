/**
 * Accessibility journeys
 *
 * Covers:
 *  - The "Larger text" toggle in the Navbar is reachable and labelled correctly
 *  - Clicking it adds `data-font-size="large"` to <html>
 *  - Clicking it again removes the attribute (toggle back to normal)
 *  - The preference persists across a page reload (stored in localStorage)
 *  - Skip-to-main-content link is present in the DOM
 *  - Landmark <main> has the expected id="main-content"
 *
 * These tests do NOT require a logged-in user — the Navbar (and the
 * AccessibilityProvider) are rendered on every public page.
 */

import { test, expect } from '@playwright/test';

test.describe('Larger text toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Start from a clean state — clear the persisted preference
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('mentora_font_size'));
    // Re-navigate so the app re-hydrates with a clean preference
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('toggle button is visible in the navbar with correct accessible label', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Switch to larger text size/i });
    await expect(btn).toBeVisible();
  });

  test('clicking the toggle adds data-font-size="large" to <html>', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Switch to larger text size/i });
    await btn.click();

    // The attribute is set by the AccessibilityProvider on <html>
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'large');
  });

  test('clicking the toggle again removes data-font-size from <html>', async ({ page }) => {
    // Turn on
    const turnOnBtn = page.getByRole('button', { name: /Switch to larger text size/i });
    await turnOnBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'large');

    // Turn off — the aria-label changes when large is active
    const turnOffBtn = page.getByRole('button', { name: /Switch to normal text size/i });
    await turnOffBtn.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-font-size');
  });

  test('preference survives a page reload (persisted via localStorage)', async ({ page }) => {
    // Enable large text
    await page.getByRole('button', { name: /Switch to larger text size/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'large');

    // Reload the page
    await page.reload();

    // Hydration in AccessibilityProvider restores the saved preference
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'large');
  });

  test('A+ label appears in the navbar button when large text is active', async ({ page }) => {
    await page.getByRole('button', { name: /Switch to larger text size/i }).click();

    // When isLarge=true, the Navbar renders <span>A+</span> inside the button
    await expect(page.getByRole('banner').getByText('A+')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skip link & landmark
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Skip link and main landmark', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('skip-to-main-content link exists in the DOM', async ({ page }) => {
    // The link is visually hidden until focused (class="skip-link") but
    // it must exist in the DOM for screen-reader users
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeAttached();
    // Href must point at the main landmark
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('<main> element has id="main-content"', async ({ page }) => {
    await expect(page.locator('main#main-content')).toBeAttached();
  });
});
