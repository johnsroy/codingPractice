/**
 * Learner journeys — authenticated as student@mentora.app
 *
 * Covers:
 *  - Log in as the seeded student
 *  - Navigate to /tutor and verify the AI Tutor page renders
 *  - Send a free-text question and wait for an assistant reply to appear
 *  - Use the "Make a quiz" quick-action and verify quiz question markup renders
 */

import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student@mentora.app';
const STUDENT_PASSWORD = 'Password123!';

// ─────────────────────────────────────────────────────────────────────────────
// Shared login helper
// ─────────────────────────────────────────────────────────────────────────────

async function loginAsStudent(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/Email address/i).fill(STUDENT_EMAIL);
  await page.getByLabel(/Password/i).fill(STUDENT_PASSWORD);
  await page.locator('form').getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('AI Tutor — learner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/tutor');

    // Confirm the page has loaded — the welcome message is always present
    await expect(
      page.getByRole('heading', { name: /AI Tutor/i }),
    ).toBeVisible();
  });

  test('welcome message from the assistant is shown on first load', async ({ page }) => {
    await expect(
      page.getByText(/Hello! I'm your Mentora AI tutor/i),
    ).toBeVisible();
  });

  test('quick-action buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Make a quiz/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Explain simply/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Summarise for me/i })).toBeVisible();
  });

  test('message input and Send button are rendered', async ({ page }) => {
    await expect(page.getByLabel(/Type your question/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send message/i })).toBeVisible();
  });

  test('learner can type a question and receive an AI answer', async ({ page }) => {
    const textarea = page.getByLabel(/Type your question/i);
    await textarea.fill('What is photosynthesis?');

    await page.getByRole('button', { name: /Send message/i }).click();

    // The user bubble should appear immediately
    await expect(page.getByText('What is photosynthesis?')).toBeVisible({ timeout: 5_000 });

    // Wait for the assistant response — the loading spinner disappears and a
    // non-empty assistant bubble appears (AI latency can be up to 30 s in CI)
    await expect(
      page.locator('.bg-surface-50').last(),
    ).not.toBeEmpty({ timeout: 30_000 });
  });

  test('"Make a quiz" quick action triggers quiz rendering', async ({ page }) => {
    const quizBtn = page.getByRole('button', { name: /Make a quiz/i });
    await quizBtn.click();

    // The user bubble for the quiz prompt should appear
    await expect(
      page.getByText(/Please create a short quiz for me on this topic/i),
    ).toBeVisible({ timeout: 5_000 });

    // Wait for the AI response; a quiz renders option buttons labelled "A.", "B.", etc.
    // or at minimum the assistant bubble text appears (not loading)
    await expect(
      // Option buttons use aria-label "Option N: …"; one per question, so take first.
      page.getByRole('button', { name: /^Option 1:/i })
        .or(page.getByRole('button', { name: /^Option A:/i }))
        // Fallback: any quiz answer button rendered inside .bg-brand-50
        .or(page.locator('.bg-brand-50 button'))
        .first(),
    ).toBeVisible({ timeout: 45_000 });
  });
});
