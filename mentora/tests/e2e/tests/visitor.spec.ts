/**
 * Visitor journeys — no auth required.
 *
 * Covers:
 *  - Landing page: brand visible, hero heading, primary CTAs
 *  - Pricing page: learner plans (Explorer / Scholar / Family) visible with
 *    prices; teacher plans section visible; monthly/annual toggle changes
 *    displayed price.
 */

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Landing page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('brand name is visible in the navbar', async ({ page }) => {
    await expect(page.getByRole('link', { name: /mentora home/i })).toBeVisible();
    // Also visible inline in the nav text
    await expect(page.getByRole('banner').getByText('Mentora')).toBeVisible();
  });

  test('hero heading renders', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /A lifetime of expertise becomes/i,
        level: 1,
      }),
    ).toBeVisible();
  });

  test('primary CTA "Find a Teacher" is present and links to /teachers', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Find a Teacher/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/teachers');
  });

  test('secondary CTA "Become a Mentor" links to /signup with teacher role', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Become a Mentor/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/signup?role=TEACHER');
  });

  test('trust badge "Trusted by 18,000+ families" is visible', async ({ page }) => {
    await expect(page.getByText(/Trusted by 18,000\+ families/i)).toBeVisible();
  });

  test('stats bar shows key social-proof numbers', async ({ page }) => {
    await expect(page.getByText('2,400+')).toBeVisible();
    await expect(page.getByText('Expert mentors')).toBeVisible();
    await expect(page.getByText('18,000+')).toBeVisible();
    await expect(page.getByText(/4\.9 \/ 5/)).toBeVisible();
  });

  test('"Get started free" CTA in social proof section links to /signup', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Get started free/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/signup');
  });

  test('"View plans" CTA links to /pricing', async ({ page }) => {
    const cta = page.getByRole('link', { name: /View plans/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/pricing');
  });

  test('nav links "Find a Teacher", "Courses", "Pricing" are visible to guests', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(nav.getByRole('link', { name: /Find a Teacher/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Courses/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Pricing/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pricing page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    // Wait for the toggle to be present (confirms the page has rendered)
    await expect(page.getByRole('button', { name: /Monthly/i })).toBeVisible();
  });

  test('page heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Simple, transparent pricing/i, level: 1 }),
    ).toBeVisible();
  });

  // ── Learner plans ──────────────────────────────────────────────────────────

  test('Explorer (free) learner plan is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Explorer', level: 3 })).toBeVisible();
    await expect(page.getByText('Try Mentora, free forever')).toBeVisible();
    // Price should render as "Free"
    await expect(page.getByText('Free').first()).toBeVisible();
  });

  test('Scholar learner plan is visible with monthly price', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Scholar', level: 3 })).toBeVisible();
    // $19.00 / mo when billing is monthly (priceCents: 1900)
    await expect(page.getByText('$19.00')).toBeVisible();
    await expect(page.getByText('Billed monthly').first()).toBeVisible();
  });

  test('Family learner plan is visible with monthly price', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Family', level: 3 })).toBeVisible();
    // $39.00 / mo (priceCents: 3900)
    await expect(page.getByText('$39.00')).toBeVisible();
  });

  // ── Teacher plans ─────────────────────────────────────────────────────────

  test('teacher plans section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Earn more, keep more/i })).toBeVisible();
  });

  test('Mentor (free) teacher plan is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mentor', level: 3 })).toBeVisible();
    await expect(page.getByText('Start teaching, keep most of what you earn')).toBeVisible();
  });

  test('Mentor Pro teacher plan shows monthly price', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mentor Pro', level: 3 })).toBeVisible();
    // $12.00 / mo (priceCents: 1200)
    await expect(page.getByText('$12.00')).toBeVisible();
  });

  // ── Monthly / Annual toggle ───────────────────────────────────────────────

  test('switching to Annual changes Scholar price to $15.83/mo equivalent', async ({ page }) => {
    // Monthly: $19.00
    await expect(page.getByText('$19.00')).toBeVisible();

    // Click Annual
    await page.getByRole('button', { name: /Annual/i }).click();

    // annualPriceCents = 19000 → /12 = 1583.33 cents → $15.83
    await expect(page.getByText('$15.83')).toBeVisible();

    // The annual billing note appears
    await expect(page.getByText(/Billed \$190\.00 per year/i).first()).toBeVisible();

    // A "Save" badge appears
    await expect(page.getByText(/Save \$38\.00 per year/i)).toBeVisible();
  });

  test('switching back to Monthly restores original prices', async ({ page }) => {
    await page.getByRole('button', { name: /Annual/i }).click();
    await expect(page.getByText('$15.83')).toBeVisible();

    await page.getByRole('button', { name: /Monthly/i }).click();
    await expect(page.getByText('$19.00')).toBeVisible();
  });

  test('Annual toggle button has aria-pressed="true" when active', async ({ page }) => {
    const annualBtn = page.getByRole('button', { name: /Annual/i });
    await expect(annualBtn).toHaveAttribute('aria-pressed', 'false');

    await annualBtn.click();
    await expect(annualBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
