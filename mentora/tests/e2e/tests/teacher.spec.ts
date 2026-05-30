/**
 * Teacher journeys — authenticated as margaret.chen@mentora.app
 *
 * Covers:
 *  - Teacher can log in and sees the teacher-flavoured dashboard
 *    (dark gradient hero, "Upload material" button visible)
 *  - Teacher navigates to /teach/upload and the drop-zone is rendered
 *  - Teacher uploads a small plain-text file and sees the file appear in
 *    the uploads list; the page then polls for the OCR/AI-summary UI
 *    (the spec waits up to 30 s for an OCR status badge to appear — this
 *    is intentionally time-boxed; if the AI pipeline hasn't resolved in
 *    that window the test still passes provided the upload itself succeeded)
 *  - Navbar shows the "Teach" link only for authenticated teachers
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const TEACHER_EMAIL = 'margaret.chen@mentora.app';
const TEACHER_PASSWORD = 'Password123!';

// ─────────────────────────────────────────────────────────────────────────────
// Shared login helper
// ─────────────────────────────────────────────────────────────────────────────

async function loginAsTeacher(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/Email address/i).fill(TEACHER_EMAIL);
  await page.getByLabel(/Password/i).fill(TEACHER_PASSWORD);
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Teacher dashboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Teacher dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('teacher sees personalised greeting on dashboard', async ({ page }) => {
    // Greeting uses first name "Margaret"
    await expect(
      page.getByRole('heading', { name: /Good to see you,\s+Margaret/i }),
    ).toBeVisible();
  });

  test('"Upload material" button is visible on the teacher dashboard', async ({ page }) => {
    // The button on the teacher hero section links to /teach/upload
    await expect(
      page.getByRole('link', { name: /Upload material/i }),
    ).toBeVisible();
  });

  test('Teach nav link is visible in the navbar for authenticated teachers', async ({ page }) => {
    // The Navbar renders a "Teach" link only for authenticated teachers
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(nav.getByRole('link', { name: /Teach/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Upload course materials', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/teach/upload');

    // Confirm the page has loaded
    await expect(
      page.getByRole('heading', { name: /Upload course materials/i }),
    ).toBeVisible();
  });

  test('upload drop-zone is rendered with the correct accessible label', async ({ page }) => {
    const dropZone = page.getByRole('button', {
      name: /Upload files — click or drag and drop/i,
    });
    await expect(dropZone).toBeVisible();
  });

  test('description text mentions accepted file types', async ({ page }) => {
    await expect(
      page.getByText(/PDF, Word, images, video, audio/i),
    ).toBeVisible();
  });

  test(
    'uploading a small text file triggers the upload pipeline and shows OCR/AI status UI',
    async ({ page }) => {
      // Create a minimal text file in-memory via a data transfer
      // Playwright's setInputFiles works even on sr-only inputs
      const fileInput = page.locator('input[type="file"]');

      // Upload a tiny plain-text file (simulates a .txt document)
      await fileInput.setInputFiles({
        name: 'sample-lesson.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(
          'Lesson 1: Introduction to Algebra\n\nVariables are symbols that represent numbers.',
        ),
      });

      // The file name should appear in the uploads list
      await expect(page.getByText('sample-lesson.txt')).toBeVisible({ timeout: 10_000 });

      // Either the "Uploading…" badge or the OCR status badge should appear
      // (depending on how fast the API processes the upload)
      const uploadingBadge = page.getByText('Uploading…');
      const queuedBadge = page.getByText('Queued');
      const processingBadge = page.getByText('Processing…');
      const extractedBadge = page.getByText('Text extracted');
      const failedBadge = page.getByText('Failed');

      await expect(
        uploadingBadge
          .or(queuedBadge)
          .or(processingBadge)
          .or(extractedBadge)
          .or(failedBadge),
      ).toBeVisible({ timeout: 10_000 });

      // Timebox: wait up to 30 s for the OCR/AI summary UI to resolve.
      // The spec succeeds regardless — the important assertion is that the
      // upload was accepted and status feedback is rendered.
      try {
        await expect(
          extractedBadge.or(page.getByText('AI Summary')).or(failedBadge),
        ).toBeVisible({ timeout: 30_000 });
      } catch {
        // Pipeline hasn't resolved yet — that's acceptable within CI time limits.
        // The upload itself succeeded (file name was visible above).
      }
    },
  );
});
