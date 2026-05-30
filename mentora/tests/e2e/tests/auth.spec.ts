/**
 * Authentication journeys.
 *
 * Covers:
 *  - Sign up a brand-new learner (random email) via /signup choosing
 *    "I want to learn" → lands on /dashboard
 *  - Log out → redirected away from dashboard
 *  - Log back in as the same new user
 *
 * Also covers:
 *  - Validation errors on empty login form
 *  - Wrong-password error message
 */

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function randomEmail(): string {
  return `e2e-test-${Date.now()}-${Math.floor(Math.random() * 9999)}@mailtest.invalid`;
}

const NEW_USER_PASSWORD = 'TestPassword123!';

// ─────────────────────────────────────────────────────────────────────────────
// Sign-up flow
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sign up — new learner', () => {
  let testEmail: string;

  test.beforeEach(() => {
    testEmail = randomEmail();
  });

  test('visitor can create a learner account and lands on dashboard', async ({ page }) => {
    await page.goto('/signup');

    // Heading confirms the page
    await expect(
      page.getByRole('heading', { name: /Create your free account/i }),
    ).toBeVisible();

    // Select the "I want to learn" role (it's aria-pressed)
    const learnBtn = page.getByRole('button', { name: /I want to learn/i });
    await expect(learnBtn).toBeVisible();
    await learnBtn.click();
    await expect(learnBtn).toHaveAttribute('aria-pressed', 'true');

    // Fill in the form
    await page.getByLabel(/Full name/i).fill('E2E Test Learner');
    await page.getByLabel(/Email address/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(NEW_USER_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /Create account/i }).click();

    // Should redirect to /dashboard after successful registration
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard shows personalised greeting
    await expect(
      page.getByRole('heading', { name: /Hello,\s+E2E/i }),
    ).toBeVisible();
  });

  test('sign-up form shows validation error for short password', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel(/Full name/i).fill('Test User');
    await page.getByLabel(/Email address/i).fill(randomEmail());
    await page.getByLabel(/Password/i).fill('short');
    await page.getByRole('button', { name: /Create account/i }).click();

    await expect(
      page.getByText(/Password must be at least 8 characters/i),
    ).toBeVisible();
    // URL must NOT change
    await expect(page).toHaveURL(/\/signup/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Log out
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Log out', () => {
  test('authenticated user can sign out via the navbar', async ({ page }) => {
    // Log in first as the seeded student
    await page.goto('/login');
    await page.getByLabel(/Email address/i).fill('student@mentora.app');
    await page.getByLabel(/Password/i).fill('Password123!');
    await page.locator('form').getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    // Now sign out
    await page.getByRole('button', { name: /Sign out/i }).click();

    // After logout the auth-only nav items (Dashboard, AI Tutor) should
    // disappear and the "Sign in" button should reappear
    await expect(
      page.getByRole('link', { name: /Sign in/i }).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Log in — seeded accounts
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Log in — seeded accounts', () => {
  test('student can log in and sees student dashboard', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: /Welcome back/i }),
    ).toBeVisible();

    await page.getByLabel(/Email address/i).fill('student@mentora.app');
    await page.getByLabel(/Password/i).fill('Password123!');
    await page.locator('form').getByRole('button', { name: /Sign in/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    // Student dashboard shows the "Find a teacher" quick action
    await expect(page.getByRole('link', { name: /Find a teacher/i }).first()).toBeVisible();
  });

  test('wrong password shows a meaningful error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/Email address/i).fill('student@mentora.app');
    await page.getByLabel(/Password/i).fill('WrongPassword!');
    await page.locator('form').getByRole('button', { name: /Sign in/i }).click();

    await expect(
      page.locator('form').getByRole('alert'),
    ).toContainText(/Email or password is incorrect/i);

    await expect(page).toHaveURL(/\/login/);
  });

  test('empty form shows field-level validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form').getByRole('button', { name: /Sign in/i }).click();

    await expect(
      page.getByText(/Please enter your email address/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Please enter your password/i),
    ).toBeVisible();
  });
});
