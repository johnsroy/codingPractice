'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { sessionsApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import clsx from 'clsx';

type SessionKind = 'classroom' | 'one_on_one';

export default function NewSessionPage() {
  const { isAuthenticated, isLoading, isTeacher } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [kind, setKind] = useState<SessionKind>('classroom');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('0');
  const [capacity, setCapacity] = useState('20');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/teach/sessions/new');
    if (!isLoading && isAuthenticated && !isTeacher) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isTeacher, router]);

  if (isLoading || !isAuthenticated || !isTeacher) return <PageSpinner />;

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes (recommended)' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '2 hours' },
  ];

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2)
      e.title = 'Title must be at least 2 characters.';
    if (!startsAt) e.startsAt = 'Please choose a start time.';
    else if (new Date(startsAt) < new Date()) e.startsAt = 'Start time must be in the future.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await sessionsApi.create({
        kind,
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes: parseInt(duration, 10),
        priceCents: Math.round((parseFloat(price) || 0) * 100),
        capacity: kind === 'one_on_one' ? 1 : parseInt(capacity, 10) || 20,
      });
      success('Session scheduled!');
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        toastError(err.message);
      } else {
        toastError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <div className="page-container max-w-2xl">
        {/* ── Header ── */}
        <div className="animate-fade-up mb-8">
          <p className="eyebrow mb-3"><Calendar size={14} /> Session scheduler</p>
          <h1 className="text-ink-900 mb-2">Schedule a session</h1>
          <p className="text-xl text-ink-700">
            Create a group classroom or a private 1:1 coaching slot.
          </p>
        </div>

        <Card padding="lg" className="card-lift">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ── Session type selector ── */}
            <div>
              <p className="text-sm font-semibold text-ink-900 mb-3">Session type</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    kind: 'classroom',
                    icon: <Users size={24} />,
                    title: 'Group classroom',
                    desc: 'Teach multiple students at once',
                  },
                  {
                    kind: 'one_on_one',
                    icon: <User size={24} />,
                    title: '1:1 Coaching',
                    desc: 'Private personal session',
                  },
                ].map((opt) => (
                  <button
                    key={opt.kind}
                    type="button"
                    onClick={() => setKind(opt.kind as SessionKind)}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      kind === opt.kind
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-200 hover:border-brand-300 hover:bg-surface-50',
                    )}
                    aria-pressed={kind === opt.kind}
                  >
                    <span
                      className={kind === opt.kind ? 'text-brand-500' : 'text-stone-400'}
                      aria-hidden="true"
                    >
                      {opt.icon}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        kind === opt.kind ? 'text-brand-700' : 'text-ink-900'
                      }`}
                    >
                      {opt.title}
                    </span>
                    <span className="text-xs text-ink-700 text-center">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Session title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="e.g. Live Q&A: Fractions & Decimals"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start date & time"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                error={errors.startsAt}
              />
              <Select
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={durationOptions}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                  Price per student (USD) — 0 = free
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-ink-700 font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1 bg-white border-2 border-surface-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[48px]"
                  />
                </div>
              </div>

              {kind === 'classroom' && (
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                    Max students
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={500}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-white border-2 border-surface-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[48px]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                icon={<Calendar size={18} />}
                iconEnd={<ArrowRight size={18} />}
              >
                Schedule session
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
