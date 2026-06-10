'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  User,
  Mail,
  CreditCard,
  Type,
  CheckCircle2,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersApi, paymentsApi, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAccessibility } from '@/lib/accessibility';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs } from '@/components/ui/Tabs';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PayoutsSection } from '@/components/features/PayoutsSection';
import { VerificationSection } from '@/components/features/VerificationSection';
import clsx from 'clsx';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, isTeacher, refreshUser } = useAuth();
  const { fontSize, toggleFontSize } = useAccessibility();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [saving, setSaving] = useState(false);

  // Hydrate form when user loads
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setBio(user.bio ?? '');
    setHeadline(user.headline ?? '');
    setHourlyRate(
      user.hourlyRateCents != null ? (user.hourlyRateCents / 100).toFixed(0) : '',
    );
    setYearsExp(user.yearsExperience?.toString() ?? '');
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/account');
  }, [authLoading, isAuthenticated, router]);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => paymentsApi.subscription(),
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) return <PageSpinner />;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.update({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        headline: headline.trim() || undefined,
        hourlyRateCents: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : undefined,
        yearsExperience: yearsExp ? parseInt(yearsExp, 10) : undefined,
      });
      await refreshUser();
      success('Profile saved!');
    } catch (err) {
      if (err instanceof ApiError) {
        toastError(err.message);
      } else {
        toastError('Could not save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
    ...(isTeacher
      ? [
          { id: 'payouts', label: 'Payouts', icon: <Banknote size={16} /> },
          { id: 'verification', label: 'Verification', icon: <ShieldCheck size={16} /> },
        ]
      : []),
    { id: 'accessibility', label: 'Accessibility', icon: <Type size={16} /> },
  ];

  return (
    <div className="section">
      <div className="page-container max-w-3xl">

        {/* ── Hero header ── */}
        {/* p-5 on mobile → p-8 on sm+ keeps the card from feeling cramped on 360px screens */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-teal-800 p-5 sm:p-8 mb-8 sm:mb-10 text-white shadow-lift">
          {/* Decorative blobs */}
          <span className="blob w-56 h-56 bg-brand-400/20 -top-16 -right-16" aria-hidden="true" />
          <span className="blob w-40 h-40 bg-teal-400/20 bottom-0 left-0" aria-hidden="true" />

          <div className="relative flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar shrinks slightly on mobile */}
            <Avatar src={user?.avatarUrl} name={user?.name} size="xl" className="ring-4 ring-white/30 shrink-0" />
            {/* min-w-0 prevents the flex child from overflowing the card */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-2xl sm:text-3xl mb-0.5 truncate">{user?.name}</h1>
              {/* Truncate long emails on narrow screens — the full address is still
                  accessible via title attribute for sighted users and is read by
                  screen readers from the element text. */}
              <p className="text-brand-200 text-sm truncate" title={user?.email}>
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" size="sm" className="border-white/40 text-white bg-white/10">
                  {user?.role}
                </Badge>
                {user?.verified && (
                  <Badge variant="green" size="sm">
                    <CheckCircle2 size={11} /> Verified
                  </Badge>
                )}
                {user?.proTier && <Badge variant="teal" size="sm">Mentor Pro</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <Tabs tabs={tabs} defaultTab="profile">
          {(activeTab) => (
            <>
              {/* ── Profile tab ── */}
              {activeTab === 'profile' && (
                <Card padding="lg" className="card-lift">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="eyebrow"><User size={14} aria-hidden="true" /> Your details</span>
                  </div>
                  <form onSubmit={handleSave} className="space-y-5">
                    <Input
                      label="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />

                    <Input
                      label="Email address"
                      value={user?.email ?? ''}
                      disabled
                      icon={<Mail size={18} />}
                      hint="Contact support to change your email."
                    />

                    <Textarea
                      label="Bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your background and what you love about teaching…"
                      rows={4}
                    />

                    {isTeacher && (
                      <>
                        <Input
                          label="Professional headline"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="e.g. Retired NASA engineer with 35 years in aerospace"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Hourly rate (USD)"
                            type="number"
                            min={0}
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="e.g. 50"
                          />
                          <Input
                            label="Years experience"
                            type="number"
                            min={0}
                            max={70}
                            value={yearsExp}
                            onChange={(e) => setYearsExp(e.target.value)}
                            placeholder="e.g. 35"
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" loading={saving} icon={<Save size={18} />}>
                      Save changes
                    </Button>
                  </form>
                </Card>
              )}

              {/* ── Subscription tab ── */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  {subscription ? (
                    <Card padding="lg" className="card-lift">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="eyebrow"><CreditCard size={14} aria-hidden="true" /> Billing</span>
                      </div>
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h2 className="text-2xl mb-2">Current plan</h2>
                          <Badge variant="brand" size="md" className="mt-1">{subscription.planId}</Badge>
                        </div>
                        <Badge
                          variant={subscription.status === 'active' ? 'green' : 'amber'}
                          size="md"
                        >
                          {subscription.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-ink-700">
                        <div className="flex justify-between py-2 border-b border-surface-100">
                          <span>Billing provider</span>
                          <span className="font-semibold text-ink-900 capitalize">
                            {subscription.provider}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>Renews</span>
                          <span className="font-semibold text-ink-900">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-surface-100">
                        <Button variant="outline" size="sm">
                          Manage billing
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card padding="lg" className="card-lift text-center">
                      <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                        <CreditCard size={28} className="text-brand-400" aria-hidden="true" />
                      </div>
                      <h2 className="text-2xl mb-2">No active plan</h2>
                      <p className="text-ink-700 mb-6">
                        Upgrade to unlock unlimited classrooms, AI tutoring and more.
                      </p>
                      <Button onClick={() => router.push('/pricing')}>
                        View plans
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {/* ── Payouts tab (teachers only) ── */}
              {activeTab === 'payouts' && isTeacher && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="eyebrow"><Banknote size={14} aria-hidden="true" /> Earnings & payouts</span>
                  </div>
                  <h2 className="text-2xl mb-1">Get paid</h2>
                  <p className="text-ink-700 mb-6">
                    Connect your bank account so Mentora can send your earnings straight to you.
                  </p>
                  <Suspense fallback={<Spinner size="sm" label="Loading payout status…" />}>
                    <PayoutsSection />
                  </Suspense>
                </div>
              )}

              {/* ── Verification tab (teachers only) ── */}
              {activeTab === 'verification' && isTeacher && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="eyebrow"><ShieldCheck size={14} aria-hidden="true" /> Identity verification</span>
                  </div>
                  <h2 className="text-2xl mb-1">Verify your identity</h2>
                  <p className="text-ink-700 mb-6">
                    A verified badge builds trust with families and unlocks priority placement in search.
                  </p>
                  <VerificationSection />
                </div>
              )}

              {/* ── Accessibility tab ── */}
              {activeTab === 'accessibility' && (
                <Card padding="lg" className="card-lift">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="eyebrow"><Type size={14} aria-hidden="true" /> Display preferences</span>
                  </div>
                  <h2 className="text-2xl mb-6">Accessibility settings</h2>

                  <div className="space-y-6">
                    {/* Text size */}
                    <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-surface-200 bg-surface-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                          <Type size={24} className="text-brand-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-bold text-ink-900">Larger text</p>
                          <p className="text-sm text-ink-700">
                            Increases all text by 25% for easier reading.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={toggleFontSize}
                        className={clsx(
                          'relative w-16 h-8 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                          fontSize === 'large' ? 'bg-brand-500' : 'bg-stone-200',
                        )}
                        role="switch"
                        aria-checked={fontSize === 'large'}
                        aria-label="Toggle larger text"
                      >
                        <span
                          className={clsx(
                            'absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200',
                            fontSize === 'large' ? 'translate-x-9' : 'translate-x-1',
                          )}
                        />
                      </button>
                    </div>

                    {/* Current status */}
                    <div className="flex items-center gap-3 text-sm text-ink-700">
                      <CheckCircle2 size={18} className="text-teal-500" aria-hidden="true" />
                      Text size is currently{' '}
                      <strong>{fontSize === 'large' ? 'large (22.5px base)' : 'normal (18px base)'}</strong>.
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
