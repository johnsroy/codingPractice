/**
 * Agentic research journey — teacher researches a brand-new topic and gets an
 * AI briefing (summary, key points, suggested lesson, cited sources).
 */
import { test, expect } from '@playwright/test';

const TEACHER_EMAIL = 'margaret.chen@mentora.app';
const PASSWORD = 'Password123!';

async function loginAsTeacher(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/Email address/i).fill(TEACHER_EMAIL);
  await page.getByLabel(/Password/i).fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

test.describe('Teacher topic research (agentic AI)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('the Research link is reachable from the navbar', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(nav.getByRole('link', { name: 'Research', exact: true })).toBeVisible();
  });

  test('researching a topic returns a full AI briefing with cited sources', async ({ page }) => {
    await page.goto('/teach/research');
    await expect(page.getByRole('heading', { name: /Research a topic/i })).toBeVisible();

    // Enter a brand-new topic and run the research.
    await page.getByLabel(/What topic would you like to research/i).fill('The Water Cycle');
    await page.getByRole('button', { name: /Research this topic/i }).click();

    // The synthesized briefing renders: key points, lesson plan, and sources.
    await expect(page.getByRole('heading', { name: /Key points/i })).toBeVisible({ timeout: 45_000 });
    await expect(page.getByRole('heading', { name: /Suggested lesson plan/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Sources$/i })).toBeVisible();

    // At least one cited source opens in a new tab safely.
    const sourceLink = page.locator('a[target="_blank"][rel*="noopener"]').first();
    await expect(sourceLink).toBeVisible();
    await expect(sourceLink).toHaveAttribute('href', /^https?:\/\//);

    // The "turn this into a course" call-to-action is present.
    await expect(page.getByRole('button', { name: /Turn this into a course/i })).toBeVisible();
  });
});
