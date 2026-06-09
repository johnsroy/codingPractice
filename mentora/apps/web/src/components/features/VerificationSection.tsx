'use client';

/**
 * VerificationSection — teacher-facing identity verification UI.
 *
 * Four status states:
 *   • unverified  → "Not started" — prompt to upload docs
 *   • pending     → "In review" amber banner
 *   • verified    → "Verified" green banner
 *   • rejected    → "Action needed" coral banner with admin note
 *
 * Each VERIFICATION_DOC_KIND gets its own upload row.
 * "Submit for review" is enabled once ≥ 1 document is uploaded.
 * "Verify my identity instantly" triggers start(); if a URL is returned the
 * page redirects to the identity provider; otherwise a friendly toast is shown.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Upload,
  FileCheck2,
  Zap,
  Send,
  RefreshCw,
} from 'lucide-react';
import { VERIFICATION_DOC_KINDS } from '@mentora/shared';
import type { VerificationSummary, VerificationDocKind } from '@mentora/shared';
import { verificationApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

// ---------------------------------------------------------------------------
// Status banner
// ---------------------------------------------------------------------------

interface StatusBannerProps {
  status: VerificationSummary['status'];
  note?: string | null;
}

function StatusBanner({ status, note }: StatusBannerProps) {
  const configs = {
    verified: {
      icon: <CheckCircle2 size={22} className="text-green-600 shrink-0" aria-hidden="true" />,
      border: 'border-green-200',
      bg: 'bg-green-50',
      badge: <Badge variant="green" size="sm">Verified ✓</Badge>,
      title: 'Identity verified',
      body: 'Your profile shows a Verified badge. Families can trust you are a real, vetted professional.',
    },
    pending: {
      icon: <Clock size={22} className="text-amber-600 shrink-0" aria-hidden="true" />,
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      badge: <Badge variant="amber" size="sm">In review</Badge>,
      title: 'Documents submitted — under review',
      body: 'Our team typically reviews submissions within 1–2 business days. We\'ll email you once it\'s done.',
    },
    rejected: {
      icon: <AlertCircle size={22} className="text-coral-600 shrink-0" aria-hidden="true" />,
      border: 'border-red-200',
      bg: 'bg-red-50',
      badge: <Badge variant="red" size="sm">Action needed</Badge>,
      title: 'Verification needs attention',
      body: 'Please upload the requested documents and re-submit for review.',
    },
    unverified: {
      icon: <ShieldCheck size={22} className="text-brand-500 shrink-0" aria-hidden="true" />,
      border: 'border-brand-200',
      bg: 'bg-brand-50',
      badge: <Badge variant="brand" size="sm">Not started</Badge>,
      title: 'Get verified — families trust you more',
      body: 'Upload a few documents so families know you\'re a real, retired professional. It usually takes less than 5 minutes.',
    },
  } as const;

  const c = configs[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-4 p-5 rounded-2xl border-2 ${c.border} ${c.bg}`}
    >
      {c.icon}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="font-bold text-ink-900">{c.title}</p>
          {c.badge}
        </div>
        <p className="text-sm text-ink-700">{c.body}</p>
        {status === 'rejected' && note && (
          <div className="mt-3 p-3 bg-white/70 rounded-xl border border-red-200">
            <p className="text-sm font-semibold text-red-800 mb-0.5">Admin note</p>
            <p className="text-sm text-red-700">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single document upload row
// ---------------------------------------------------------------------------

interface DocRowProps {
  kind: { id: VerificationDocKind; label: string; hint: string };
  uploadedFiles: Array<{ kind: VerificationDocKind; fileName: string }>;
  onUpload: (kind: VerificationDocKind, file: File) => Promise<void>;
  uploading: boolean;
}

function DocRow({ kind, uploadedFiles, onUpload, uploading }: DocRowProps) {
  const existing = uploadedFiles.filter((d) => d.kind === kind.id);
  const inputId = `doc-upload-${kind.id}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-surface-200 bg-surface-50 hover:border-brand-200 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 text-sm">{kind.label}</p>
        <p className="text-xs text-ink-700 mt-0.5">{kind.hint}</p>
        {existing.length > 0 && (
          <ul className="mt-2 space-y-1" aria-label={`Uploaded files for ${kind.label}`}>
            {existing.map((d, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-teal-700">
                <FileCheck2 size={13} className="shrink-0" aria-hidden="true" />
                {d.fileName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <label
        htmlFor={inputId}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer
          border-2 border-brand-400 text-brand-700 bg-white hover:bg-brand-50
          transition-all min-h-[40px] shrink-0
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        aria-label={`Upload ${kind.label}`}
      >
        <Upload size={15} aria-hidden="true" />
        {existing.length > 0 ? 'Replace' : 'Upload'}
        <input
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(kind.id, file);
            // Reset so the same file can be re-selected
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function VerificationSection() {
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const s = await verificationApi.status();
      setSummary(s);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Could not load verification status. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleUpload = useCallback(
    async (kind: VerificationDocKind, file: File) => {
      setUploading(true);
      try {
        const doc = await verificationApi.uploadDocument(kind, file);
        setSummary((prev) => {
          if (!prev) return prev;
          // Remove any existing doc of same kind, add new one
          const filtered = prev.documents.filter((d) => d.kind !== kind);
          return { ...prev, documents: [...filtered, doc] };
        });
        toastSuccess(`${file.name} uploaded successfully.`);
      } catch (err) {
        toastError(
          err instanceof ApiError
            ? err.message
            : `Could not upload ${file.name}. Please try again.`,
        );
      } finally {
        setUploading(false);
      }
    },
    [toastSuccess, toastError],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const updated = await verificationApi.submit();
      setSummary(updated);
      toastSuccess('Documents submitted for review! We\'ll be in touch within 1–2 business days.');
    } catch (err) {
      toastError(
        err instanceof ApiError
          ? err.message
          : 'Could not submit documents. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [toastSuccess, toastError]);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      const result = await verificationApi.start();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toastSuccess('Your documents will be reviewed by our team.');
      }
    } catch (err) {
      toastError(
        err instanceof ApiError
          ? err.message
          : 'Could not start identity verification. Please try again.',
      );
    } finally {
      setStarting(false);
    }
  }, [toastSuccess, toastError]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8" aria-live="polite">
        <Spinner size="sm" label="Loading verification status…" />
        <span className="text-ink-700">Loading verification status…</span>
      </div>
    );
  }

  // --- Load error ---
  if (loadError && !summary) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 p-5 rounded-2xl border-2 border-red-200 bg-red-50"
      >
        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold text-red-800 mb-1">Could not load verification status</p>
          <p className="text-sm text-red-700 mb-3">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            icon={<RefreshCw size={15} />}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const uploadedDocs = summary.documents.map((d) => ({
    kind: d.kind,
    fileName: d.fileName,
  }));
  const hasAtLeastOneDoc = summary.documents.length > 0;
  const canSubmit = hasAtLeastOneDoc && summary.status !== 'pending' && summary.status !== 'verified';

  return (
    <div className="space-y-8">
      {/* Status banner */}
      <StatusBanner status={summary.status} note={summary.note} />

      {/* Document upload section — shown unless already verified */}
      {summary.status !== 'verified' && (
        <section aria-label="Upload documents">
          {/* Section eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="eyebrow">
              <ShieldCheck size={14} aria-hidden="true" />
              Supporting documents
            </span>
          </div>

          <p className="text-sm text-ink-700 mb-5">
            Upload at least one document below. You don&apos;t have to upload all of them — just
            the ones you have handy. Our reviewers are friendly and understand that retired
            professionals often have non-standard paperwork.
          </p>

          <div className="space-y-3">
            {VERIFICATION_DOC_KINDS.map((kind) => (
              <DocRow
                key={kind.id}
                kind={kind}
                uploadedFiles={uploadedDocs}
                onUpload={handleUpload}
                uploading={uploading}
              />
            ))}
          </div>
        </section>
      )}

      {/* Action buttons */}
      {summary.status !== 'verified' && (
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {/* Primary: Submit for review */}
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
            icon={<Send size={18} />}
            aria-label="Submit documents for review"
          >
            Submit for review
          </Button>

          {/* Secondary: Instant identity check */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleStart}
            loading={starting}
            icon={<Zap size={18} />}
            aria-label="Verify my identity instantly"
          >
            Verify my identity instantly
          </Button>
        </div>
      )}

      {/* Hint when no docs uploaded */}
      {!hasAtLeastOneDoc && summary.status !== 'verified' && (
        <p className="text-xs text-ink-700 -mt-4" role="note">
          Upload at least one document above to enable the Submit button.
        </p>
      )}

      {/* Already-submitted hint */}
      {summary.status === 'pending' && (
        <p className="text-xs text-ink-700 -mt-4" role="note">
          Your submission is under review. You can still upload additional documents while waiting.
        </p>
      )}

      {/* Submission metadata */}
      {summary.submittedAt && (
        <p className="text-xs text-ink-700">
          Submitted{' '}
          {new Date(summary.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          .
          {summary.reviewedAt && (
            <>
              {' '}Reviewed{' '}
              {new Date(summary.reviewedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              .
            </>
          )}
        </p>
      )}
    </div>
  );
}
