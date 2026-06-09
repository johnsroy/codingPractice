'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe,
  BookOpen,
  Copy,
  CheckCheck,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { SUBJECTS, GRADES } from '@mentora/shared';
import type { ResearchBriefing } from '@mentora/shared';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageSpinner } from '@/components/ui/Spinner';

// -------------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------------

function SummaryCard({ summary }: { summary: string }) {
  return (
    <Card padding="lg" className="bg-brand-50 border-brand-200 card-lift">
      <h2 className="text-xl mb-3 flex items-center gap-2">
        <Sparkles size={20} aria-hidden="true" className="text-brand-500" />
        Overview
      </h2>
      <p className="text-ink-900 leading-relaxed text-lg">{summary}</p>
    </Card>
  );
}

function KeyPointsCard({ points }: { points: string[] }) {
  return (
    <Card padding="lg" className="card-lift">
      <h2 className="text-xl mb-4">Key points</h2>
      <ul className="space-y-3" role="list">
        {points.map((point, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span
              className="mt-1 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-ink-900 leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function LessonOutlineCard({
  sections,
}: {
  sections: ResearchBriefing['suggestedLessonOutline'];
}) {
  return (
    <Card padding="lg" className="card-lift">
      <h2 className="text-xl mb-5">Suggested lesson plan</h2>
      <div className="space-y-5">
        {sections.map((section, si) => (
          <div
            key={si}
            className="rounded-2xl border border-surface-200 bg-surface-50 p-5"
          >
            <h3 className="font-bold text-ink-900 mb-3 text-base">
              <span
                className="inline-block mr-2 w-7 h-7 rounded-lg bg-teal-100 text-teal-700 text-xs font-bold text-center leading-7 shrink-0"
                aria-hidden="true"
              >
                {si + 1}
              </span>
              {section.title}
            </h3>
            <ul className="space-y-2 pl-9" role="list">
              {section.points.map((point, pi) => (
                <li
                  key={pi}
                  className="text-ink-700 leading-relaxed text-sm flex gap-2 items-start"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SourcesCard({
  sources,
  liveWeb,
  provider,
}: {
  sources: ResearchBriefing['sources'];
  liveWeb: boolean;
  provider: string;
}) {
  return (
    <Card padding="lg" className="card-lift">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="text-xl">Sources</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {liveWeb ? (
            <Badge variant="teal" size="sm">
              <Globe size={12} aria-hidden="true" />
              Live web
            </Badge>
          ) : (
            <Badge variant="amber" size="sm">
              Example sources — add a search API key for live web results
            </Badge>
          )}
          <span className="text-xs text-ink-700 font-medium">via {provider}</span>
        </div>
      </div>

      {sources.length === 0 ? (
        <p className="text-ink-700 italic">No sources available for this briefing.</p>
      ) : (
        <ul className="space-y-4" role="list">
          {sources.map((source, i) => (
            <li
              key={i}
              className="rounded-xl border border-surface-200 p-4 hover:border-brand-200 transition-colors"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1.5 mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
              >
                {source.title}
                <ExternalLink
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 text-brand-400"
                />
              </a>
              {source.siteName && (
                <p className="text-xs text-ink-700 mb-1.5">{source.siteName}</p>
              )}
              <p className="text-sm text-ink-700 leading-relaxed">{source.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// -------------------------------------------------------------------------
// Briefing result — the full rendered output
// -------------------------------------------------------------------------

function BriefingResult({
  briefing,
  onReset,
}: {
  briefing: ResearchBriefing;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function buildPlainText(b: ResearchBriefing): string {
    const lines: string[] = [];
    lines.push(`RESEARCH BRIEFING: ${b.topic}`);
    lines.push('');
    lines.push('OVERVIEW');
    lines.push(b.summary);
    lines.push('');
    lines.push('KEY POINTS');
    b.keyPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push('');
    lines.push('SUGGESTED LESSON PLAN');
    b.suggestedLessonOutline.forEach((s, si) => {
      lines.push(`${si + 1}. ${s.title}`);
      s.points.forEach((p) => lines.push(`   • ${p}`));
    });
    lines.push('');
    lines.push('SOURCES');
    b.sources.forEach((s, i) => lines.push(`${i + 1}. ${s.title} — ${s.url}`));
    return lines.join('\n');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildPlainText(briefing));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available in some environments — silently ignore
    }
  }

  return (
    <div>
      {/* Briefing header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-3"><Globe size={14} /> Research briefing</p>
          <h1 className="text-ink-900 mb-2">{briefing.topic}</h1>
          <p className="text-lg text-ink-700">Here is your teacher-ready briefing.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Research another topic
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <SummaryCard summary={briefing.summary} />
        {briefing.keyPoints.length > 0 && (
          <KeyPointsCard points={briefing.keyPoints} />
        )}
        {briefing.suggestedLessonOutline.length > 0 && (
          <LessonOutlineCard sections={briefing.suggestedLessonOutline} />
        )}
        {briefing.sources.length >= 0 && (
          <SourcesCard
            sources={briefing.sources}
            liveWeb={briefing.liveWeb}
            provider={briefing.provider}
          />
        )}
      </div>

      {/* Action row */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/teach/courses/new" className="no-underline">
          <Button icon={<BookOpen size={18} />}>Turn this into a course</Button>
        </Link>
        <Button
          variant="outline"
          icon={copied ? <CheckCheck size={18} /> : <Copy size={18} />}
          onClick={handleCopy}
          aria-label="Copy briefing to clipboard"
        >
          {copied ? 'Copied!' : 'Copy briefing'}
        </Button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Main page
// -------------------------------------------------------------------------

const SUBJECT_OPTIONS = [
  { value: '', label: 'Any subject (optional)' },
  ...SUBJECTS.map((s) => ({ value: s.id, label: s.label })),
];

const GRADE_OPTIONS = [
  { value: '', label: 'Any grade (optional)' },
  ...GRADES.map((g) => ({ value: g.id, label: g.label })),
];

export default function ResearchTopicPage() {
  const { isAuthenticated, isLoading: authLoading, isTeacher } = useAuth();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<ResearchBriefing | null>(null);

  // Auth guard — teacher only, same pattern as upload page
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/teach/research');
    }
    if (!authLoading && isAuthenticated && !isTeacher) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, isTeacher, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setError(null);
    setLoading(true);
    setBriefing(null);

    try {
      const result = await aiApi.research({
        topic: topic.trim(),
        ...(subjectId ? { subjectId } : {}),
        ...(gradeId ? { gradeId } : {}),
      });
      setBriefing(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again in a moment.',
      );
    } finally {
      setLoading(false);
    }
  }

  // Show full-page spinner while auth is resolving or redirecting
  if (authLoading || !isAuthenticated || !isTeacher) return <PageSpinner />;

  return (
    <div className="section">
      <div className="page-container max-w-3xl">
        {briefing ? (
          <BriefingResult
            briefing={briefing}
            onReset={() => {
              setBriefing(null);
              setTopic('');
            }}
          />
        ) : (
          <>
            {/* ── Page heading ── */}
            <div className="mb-10 animate-fade-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow">
                  <Globe size={26} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="eyebrow mb-1">Teacher tool</p>
                  <h1 className="text-ink-900">Research a topic</h1>
                </div>
              </div>
              <p className="text-xl text-ink-700 mt-3">
                Type any topic — Mentora researches the live web and drafts a lesson for you.
              </p>
            </div>

            {/* ── Search form ── */}
            <Card padding="lg" className="card-lift">
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">
                  {/* Topic input */}
                  <Input
                    label="What topic would you like to research?"
                    name="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. The Water Cycle, World War I, Fractions, Photosynthesis…"
                    required
                    disabled={loading}
                    autoFocus
                    hint="Be as specific as you like — the more detail, the better the briefing."
                  />

                  {/* Optional filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Subject (optional)"
                      name="subjectId"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      options={SUBJECT_OPTIONS}
                      disabled={loading}
                    />
                    <Select
                      label="Grade level (optional)"
                      name="gradeId"
                      value={gradeId}
                      onChange={(e) => setGradeId(e.target.value)}
                      options={GRADE_OPTIONS}
                      disabled={loading}
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700"
                    >
                      <AlertCircle
                        size={20}
                        className="shrink-0 mt-0.5 text-red-400"
                        aria-hidden="true"
                      />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={loading}
                    disabled={!topic.trim()}
                    icon={<Globe size={20} />}
                  >
                    {loading
                      ? 'Searching the web and writing your briefing…'
                      : 'Research this topic'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Loading state (detailed) */}
            {loading && (
              <div
                role="status"
                aria-live="polite"
                className="mt-8 flex flex-col items-center gap-4 text-center py-10"
              >
                <Spinner size="lg" label="Researching topic…" />
                <p className="text-lg text-ink-900 font-medium">
                  Searching the web and writing your briefing…
                </p>
                <p className="text-ink-700">This usually takes 10–20 seconds.</p>
              </div>
            )}

            {/* Tips */}
            {!loading && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Globe size={20} className="text-brand-400" />,
                    tip: 'Mentora searches the live web and cites every source so you can verify facts.',
                  },
                  {
                    icon: <BookOpen size={20} className="text-teal-400" />,
                    tip: 'You get a ready-to-use lesson plan you can turn into a full course in one click.',
                  },
                  {
                    icon: <Sparkles size={20} className="text-accent-500" />,
                    tip: 'Try a specific grade level for age-appropriate language and examples.',
                  },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200"
                  >
                    <span className="shrink-0 mt-0.5" aria-hidden="true">
                      {t.icon}
                    </span>
                    <p className="text-sm text-ink-700">{t.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
