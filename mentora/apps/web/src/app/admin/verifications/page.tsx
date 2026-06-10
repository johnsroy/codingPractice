'use client';

/**
 * Admin verification queue — /admin/verifications
 *
 * Admin-only page. Lists all pending teacher verification submissions.
 * Each card shows:
 *   - Teacher name + email
 *   - Uploaded documents as links (open in new tab)
 *   - An optional note textarea
 *   - Approve / Reject buttons (calls adminReview, then refreshes + toasts)
 *
 * Redirects to /dashboard if the current user is not an admin.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { verificationApi, ApiError } from '@/lib/api';
import type { VerificationSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Textarea } from '@/components/ui/Textarea';

// ---------------------------------------------------------------------------
// Single teacher review card
// ---------------------------------------------------------------------------

interface ReviewCardProps {
  summary: VerificationSummary;
  onDecision: (userId: string, decision: 'approve' | 'reject', note: string) => Promise<void>;
}

function ReviewCard({ summary, onDecision }: ReviewCardProps) {
  const [note, setNote] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      await onDecision(summary.userId, 'approve', note);
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await onDecision(summary.userId, 'reject', note);
    } finally {
      setRejecting(false);
    }
  }

  const submittedDate = summary.submittedAt
    ? new Date(summary.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Card padding="lg" className="card-lift">
      {/* Teacher info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
          <User size={22} className="text-brand-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-ink-900">
              {summary.teacherName ?? 'Unknown teacher'}
            </h3>
            <Badge variant="amber" size="sm">Pending review</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink-700">
            <Mail size={14} aria-hidden="true" />
            {summary.teacherEmail ?? '—'}
          </div>
          {submittedDate && (
            <p className="text-xs text-ink-700 mt-1">Submitted {submittedDate}</p>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-ink-900 mb-3 flex items-center gap-1.5">
          <FileText size={15} aria-hidden="true" />
          Uploaded documents ({summary.documents.length})
        </p>
        {summary.documents.length === 0 ? (
          <p className="text-sm text-ink-700 italic">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2" role="list">
            {summary.documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  {doc.fileName}
                  <span className="text-xs text-ink-700 font-normal">({doc.kind.replace(/_/g, ' ')})</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Note textarea */}
      <div className="mb-5">
        <Textarea
          label="Review note (optional — shown to the teacher if rejected)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Please upload a clearer copy of your government ID."
          rows={2}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="md"
          onClick={handleApprove}
          loading={approving}
          disabled={rejecting}
          icon={<CheckCircle2 size={18} />}
          className="bg-green-600 hover:bg-green-700 text-white shadow-soft"
        >
          Approve
        </Button>
        <Button
          size="md"
          variant="danger"
          onClick={handleReject}
          loading={rejecting}
          disabled={approving}
          icon={<XCircle size={18} />}
        >
          Reject
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminVerificationsPage() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [submissions, setSubmissions] = useState<VerificationSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/verifications');
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await verificationApi.adminList();
      // Only show pending submissions in the queue
      setSubmissions(list.filter((s) => s.status === 'pending'));
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Could not load the verification queue. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      fetchSubmissions();
    }
  }, [authLoading, isAuthenticated, isAdmin, fetchSubmissions]);

  const handleDecision = useCallback(
    async (userId: string, decision: 'approve' | 'reject', note: string) => {
      try {
        await verificationApi.adminReview(userId, decision, note || undefined);
        toastSuccess(
          decision === 'approve'
            ? 'Teacher approved — they will receive a Verified badge.'
            : 'Submission rejected — the teacher has been notified.',
        );
        // Remove from local list immediately
        setSubmissions((prev) => prev.filter((s) => s.userId !== userId));
      } catch (err) {
        toastError(
          err instanceof ApiError
            ? err.message
            : `Could not ${decision} this submission. Please try again.`,
        );
      }
    },
    [toastSuccess, toastError],
  );

  if (authLoading || !isAuthenticated) return <PageSpinner />;

  // While redirecting non-admins, show spinner
  if (!isAdmin) return <PageSpinner />;

  return (
    <div className="section">
      <div className="page-container max-w-3xl">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-700 p-8 mb-10 text-white shadow-lift">
          <span className="blob w-64 h-64 bg-brand-400/20 -top-20 -right-20" aria-hidden="true" />
          <span className="blob w-40 h-40 bg-teal-400/20 bottom-0 left-0" aria-hidden="true" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={30} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white mb-2">
                Admin panel
              </p>
              <h1 className="text-white text-3xl">Verification queue</h1>
              <p className="text-brand-200 mt-1">
                Review and action teacher identity submissions.
              </p>
            </div>
          </div>
        </div>

        {/* ── Load error ── */}
        {loadError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-5 rounded-2xl border-2 border-red-200 bg-red-50 mb-8"
          >
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Could not load verification queue</p>
              <p className="text-sm text-red-700 mb-3">{loadError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                icon={<RefreshCw size={15} />}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !loadError && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading verification queue">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-surface-100 rounded-2xl animate-pulse" aria-hidden="true" />
            ))}
          </div>
        )}

        {/* ── Submission list ── */}
        {!loading && !loadError && (
          <>
            {/* Refresh + count row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <p className="eyebrow">
                  <ShieldCheck size={14} /> Pending submissions
                </p>
                {submissions.length > 0 && (
                  <Badge variant="amber" size="sm">{submissions.length}</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                icon={<RefreshCw size={15} />}
              >
                Refresh
              </Button>
            </div>

            {submissions.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={32} />}
                title="All clear — no pending submissions"
                description="When teachers submit their documents for review, they will appear here."
              />
            ) : (
              <div className="space-y-6" aria-label="Verification submissions">
                {submissions.map((s) => (
                  <ReviewCard key={s.userId} summary={s} onDecision={handleDecision} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
