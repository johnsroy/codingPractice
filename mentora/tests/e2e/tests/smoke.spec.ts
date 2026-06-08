/**
 * Thorough UI audit — every primary route, as guest / teacher / student.
 * For each page we assert:
 *   - no uncaught client-side exception (pageerror)
 *   - a visible top-level heading (no blank screen)
 *   - no leaked placeholder values ($NaN, undefined, [object Object], NaN)
 *   - that buttons/links are present and not disabled-by-default
 */
import { test, expect, Page } from '@playwright/test';

const PASSWORD = 'Password123!';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel(/Email address/i).fill(email);
  await page.getByLabel(/Password/i).fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

/** Visit a page and run the shared health assertions. */
async function audit(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // give client components a moment to fetch + render
  await page.waitForTimeout(1200);

  // No client-side crash.
  expect(errors, `client exceptions on ${path}: ${errors.join('; ')}`).toHaveLength(0);

  // Something is rendered (a heading is visible).
  await expect(
    page.locator('h1, h2').first(),
    `no visible heading on ${path}`,
  ).toBeVisible();

  // No leaked placeholder / serialization artifacts in the visible text.
  const body = (await page.locator('body').innerText()).toLowerCase();
  for (const bad of ['$nan', 'undefined', '[object object]', 'nan ']) {
    expect(body.includes(bad), `"${bad}" visible on ${path}`).toBe(false);
  }
}

const GUEST_ROUTES = ['/', '/pricing', '/teachers', '/courses', '/login', '/signup'];
const STUDENT_ROUTES = ['/dashboard', '/tutor', '/account', '/teachers', '/courses'];
const TEACHER_ROUTES = [
  '/dashboard',
  '/teach/upload',
  '/teach/research',
  '/teach/courses/new',
  '/teach/sessions/new',
  '/account',
];

test.describe('Guest pages render cleanly', () => {
  for (const path of GUEST_ROUTES) {
    test(`guest: ${path}`, async ({ page }) => {
      await audit(page, path);
    });
  }
});

test.describe('Student pages render cleanly', () => {
  test.beforeEach(async ({ page }) => login(page, 'student@mentora.app'));
  for (const path of STUDENT_ROUTES) {
    test(`student: ${path}`, async ({ page }) => {
      await audit(page, path);
    });
  }
});

test.describe('Teacher pages render cleanly', () => {
  test.beforeEach(async ({ page }) => login(page, 'margaret.chen@mentora.app'));
  for (const path of TEACHER_ROUTES) {
    test(`teacher: ${path}`, async ({ page }) => {
      await audit(page, path);
    });
  }
});

test.describe('Primary buttons are operable', () => {
  test('landing CTAs navigate', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Find a Teacher/i }).first().click();
    await expect(page).toHaveURL(/\/teachers/);
  });

  test('every visible button on the dashboard is enabled', async ({ page }) => {
    await login(page, 'margaret.chen@mentora.app');
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const buttons = page.getByRole('button');
    const n = await buttons.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const b = buttons.nth(i);
      if (await b.isVisible()) {
        // No primary control should be left permanently disabled on load.
        await expect(b).toBeEnabled();
      }
    }
  });
});
