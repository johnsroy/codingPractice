/**
 * VerificationSection — component test
 *
 * Exercises the four verification states visible to a teacher:
 *   (a) unverified   → "Not started" banner; upload rows; Submit disabled; Verify instantly button
 *   (b) pending      → "In review" amber banner; Submit disabled
 *   (c) verified     → "Verified ✓" green banner; no document upload rows
 *   (d) rejected     → "Action needed" coral/red banner; admin note shown
 *
 * Also tests:
 *   - Uploading a document enables the Submit button
 *   - Submit calls verificationApi.submit
 *   - "Verify my identity instantly" calls verificationApi.start; redirects if URL returned
 *   - start() with no URL shows toast
 *   - Load error shows error UI with Try again button
 *
 * Mocks:
 *   - @/lib/api          → verificationApi.*
 *   - @/components/ui/Toast → useToast (avoids needing ToastProvider in tree)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { VerificationSummary, VerificationDocument } from '@/lib/api';
import { VERIFICATION_DOC_KINDS } from '@mentora/shared';

// ---------------------------------------------------------------------------
// Mock @/components/ui/Toast
// ---------------------------------------------------------------------------
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    toast: vi.fn(),
    info: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock @/lib/api — controllable verificationApi stubs
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    verificationApi: {
      status: vi.fn(),
      uploadDocument: vi.fn(),
      submit: vi.fn(),
      start: vi.fn(),
      adminList: vi.fn(),
      adminReview: vi.fn(),
    },
  };
});

import { verificationApi } from '@/lib/api';
import { VerificationSection } from '../VerificationSection';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeSummary(overrides: Partial<VerificationSummary> = {}): VerificationSummary {
  return {
    userId: 'user-1',
    status: 'unverified',
    note: null,
    submittedAt: null,
    reviewedAt: null,
    documents: [],
    provider: 'manual',
    ...overrides,
  };
}

function makeDoc(overrides: Partial<VerificationDocument> = {}): VerificationDocument {
  return {
    id: 'doc-1',
    userId: 'user-1',
    kind: 'government_id',
    fileUrl: 'https://example.com/doc.pdf',
    fileName: 'passport.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 102400,
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VerificationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence window.location.href assignment in jsdom
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' },
    });
  });

  // -------------------------------------------------------------------------
  // State (a): unverified — not started
  // -------------------------------------------------------------------------

  describe('unverified teacher (not started)', () => {
    beforeEach(() => {
      vi.mocked(verificationApi.status).mockResolvedValue(makeSummary({ status: 'unverified' }));
    });

    it('shows the "Not started" status banner', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/not started/i)).toBeInTheDocument(),
      );
    });

    it('shows the "Get verified" heading in the banner', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/get verified/i)).toBeInTheDocument(),
      );
    });

    it('renders all document upload rows', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(VERIFICATION_DOC_KINDS[0].label)).toBeInTheDocument(),
      );
      // All 6 doc kinds should appear
      for (const kind of VERIFICATION_DOC_KINDS) {
        expect(screen.getByText(kind.label)).toBeInTheDocument();
      }
    });

    it('"Submit for review" button is disabled when no docs are uploaded', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit documents for review/i }),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByRole('button', { name: /submit documents for review/i }),
      ).toBeDisabled();
    });

    it('shows the "Verify my identity instantly" button', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /verify my identity instantly/i }),
        ).toBeInTheDocument(),
      );
    });

    it('shows the helper note when no docs are uploaded', async () => {
      render(<VerificationSection />);
      await waitFor(() => {
        const notes = screen.getAllByText(/upload at least one document/i);
        expect(notes.length).toBeGreaterThan(0);
      });
    });
  });

  // -------------------------------------------------------------------------
  // State (a) + docs uploaded — Submit becomes enabled
  // -------------------------------------------------------------------------

  describe('unverified teacher with uploaded documents', () => {
    it('"Submit for review" is enabled once a doc exists in the summary', async () => {
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'unverified',
          documents: [makeDoc()],
        }),
      );

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit documents for review/i }),
        ).not.toBeDisabled(),
      );
    });

    it('clicking "Submit for review" calls verificationApi.submit', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'unverified',
          documents: [makeDoc()],
        }),
      );
      vi.mocked(verificationApi.submit).mockResolvedValue(
        makeSummary({ status: 'pending', submittedAt: new Date().toISOString() }),
      );

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit documents for review/i }),
        ).not.toBeDisabled(),
      );
      await user.click(screen.getByRole('button', { name: /submit documents for review/i }));

      expect(vi.mocked(verificationApi.submit)).toHaveBeenCalledOnce();
    });

    it('clicking Submit shows success toast', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'unverified',
          documents: [makeDoc()],
        }),
      );
      vi.mocked(verificationApi.submit).mockResolvedValue(
        makeSummary({ status: 'pending', submittedAt: new Date().toISOString() }),
      );

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit documents for review/i }),
        ).not.toBeDisabled(),
      );
      await user.click(screen.getByRole('button', { name: /submit documents for review/i }));

      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          expect.stringContaining('submitted for review'),
        ),
      );
    });
  });

  // -------------------------------------------------------------------------
  // "Verify my identity instantly" button
  // -------------------------------------------------------------------------

  describe('"Verify my identity instantly" button', () => {
    beforeEach(() => {
      vi.mocked(verificationApi.status).mockResolvedValue(makeSummary({ status: 'unverified' }));
    });

    it('redirects to the provider URL when start() returns a URL', async () => {
      const user = userEvent.setup();
      const url = 'https://identity.provider.com/verify/abc123';
      vi.mocked(verificationApi.start).mockResolvedValue({ url, provider: 'stripe_identity' });

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /verify my identity instantly/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /verify my identity instantly/i }));

      await waitFor(() => {
        expect(window.location.href).toBe(url);
      });
    });

    it('shows a toast when start() returns no URL (manual review path)', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.start).mockResolvedValue({ url: null, provider: 'manual' });

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /verify my identity instantly/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /verify my identity instantly/i }));

      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          expect.stringContaining('reviewed by our team'),
        ),
      );
    });

    it('shows an error toast when start() fails', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.start).mockRejectedValue(new Error('Network error'));

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /verify my identity instantly/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /verify my identity instantly/i }));

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('Could not start identity verification'),
        ),
      );
    });
  });

  // -------------------------------------------------------------------------
  // State (b): pending — in review
  // -------------------------------------------------------------------------

  describe('pending teacher (in review)', () => {
    beforeEach(() => {
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'pending',
          submittedAt: '2024-06-01T10:00:00Z',
        }),
      );
    });

    it('shows the "In review" amber banner', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/in review/i)).toBeInTheDocument(),
      );
    });

    it('shows the "under review" title in the banner', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/documents submitted.*under review/i)).toBeInTheDocument(),
      );
    });

    it('"Submit for review" button is disabled when status is pending', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit documents for review/i }),
        ).toBeDisabled(),
      );
    });

    it('shows the submission-pending helper note', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByText(/submission is under review/i),
        ).toBeInTheDocument(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // State (c): verified
  // -------------------------------------------------------------------------

  describe('verified teacher', () => {
    beforeEach(() => {
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'verified',
          submittedAt: '2024-05-01T10:00:00Z',
          reviewedAt: '2024-05-02T10:00:00Z',
        }),
      );
    });

    it('shows "Verified ✓" banner', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText('Verified ✓')).toBeInTheDocument(),
      );
    });

    it('shows "Identity verified" title', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/identity verified/i)).toBeInTheDocument(),
      );
    });

    it('does NOT show the document upload rows', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/identity verified/i)).toBeInTheDocument(),
      );
      // Upload rows should not be present for verified users
      expect(screen.queryByText(VERIFICATION_DOC_KINDS[0].label)).not.toBeInTheDocument();
    });

    it('does NOT show the Submit button', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/identity verified/i)).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole('button', { name: /submit documents for review/i }),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // State (d): rejected — action needed
  // -------------------------------------------------------------------------

  describe('rejected teacher (action needed)', () => {
    const adminNote = 'Please upload a clearer copy of your ID.';

    beforeEach(() => {
      vi.mocked(verificationApi.status).mockResolvedValue(
        makeSummary({
          status: 'rejected',
          note: adminNote,
          reviewedAt: '2024-05-03T10:00:00Z',
        }),
      );
    });

    it('shows "Action needed" badge', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/action needed/i)).toBeInTheDocument(),
      );
    });

    it('shows the admin note when provided', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(adminNote)).toBeInTheDocument(),
      );
    });

    it('shows "Admin note" label above the note', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(/admin note/i)).toBeInTheDocument(),
      );
    });

    it('shows the document upload section so teacher can re-upload', async () => {
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(VERIFICATION_DOC_KINDS[0].label)).toBeInTheDocument(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Load error state
  // -------------------------------------------------------------------------

  describe('API load error', () => {
    it('shows an accessible error message when status fetch fails', async () => {
      vi.mocked(verificationApi.status).mockRejectedValue(new Error('Network error'));
      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument(),
      );
      const matches = screen.getAllByText(/could not load verification status/i);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('shows a "Try again" button on fetch failure', async () => {
      vi.mocked(verificationApi.status).mockRejectedValue(new Error('Server offline'));
      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /try again/i }),
        ).toBeInTheDocument(),
      );
    });

    it('"Try again" button re-calls verificationApi.status', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status)
        .mockRejectedValueOnce(new Error('Server offline'))
        .mockResolvedValue(makeSummary({ status: 'unverified' }));

      render(<VerificationSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /try again/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() =>
        expect(vi.mocked(verificationApi.status)).toHaveBeenCalledTimes(2),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Upload document row
  // -------------------------------------------------------------------------

  describe('document upload', () => {
    it('calls verificationApi.uploadDocument when a file is selected', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status).mockResolvedValue(makeSummary({ status: 'unverified' }));
      vi.mocked(verificationApi.uploadDocument).mockResolvedValue(makeDoc());

      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(VERIFICATION_DOC_KINDS[0].label)).toBeInTheDocument(),
      );

      const fileInput = document.getElementById(
        `doc-upload-${VERIFICATION_DOC_KINDS[0].id}`,
      ) as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      const file = new File(['dummy content'], 'passport.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);

      await waitFor(() =>
        expect(vi.mocked(verificationApi.uploadDocument)).toHaveBeenCalledWith(
          VERIFICATION_DOC_KINDS[0].id,
          file,
        ),
      );
    });

    it('shows a success toast after uploading a document', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status).mockResolvedValue(makeSummary({ status: 'unverified' }));
      vi.mocked(verificationApi.uploadDocument).mockResolvedValue(makeDoc());

      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(VERIFICATION_DOC_KINDS[0].label)).toBeInTheDocument(),
      );

      const fileInput = document.getElementById(
        `doc-upload-${VERIFICATION_DOC_KINDS[0].id}`,
      ) as HTMLInputElement;
      const file = new File(['dummy content'], 'passport.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);

      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          expect.stringContaining('uploaded successfully'),
        ),
      );
    });

    it('shows an error toast when upload fails', async () => {
      const user = userEvent.setup();
      vi.mocked(verificationApi.status).mockResolvedValue(makeSummary({ status: 'unverified' }));
      vi.mocked(verificationApi.uploadDocument).mockRejectedValue(new Error('Upload failed'));

      render(<VerificationSection />);
      await waitFor(() =>
        expect(screen.getByText(VERIFICATION_DOC_KINDS[0].label)).toBeInTheDocument(),
      );

      const fileInput = document.getElementById(
        `doc-upload-${VERIFICATION_DOC_KINDS[0].id}`,
      ) as HTMLInputElement;
      const file = new File(['dummy content'], 'bad.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('Could not upload'),
        ),
      );
    });
  });
});
