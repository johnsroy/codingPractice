'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, CreditCard, Type, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// SUBJECTS/GRADES/formatPrice available from @mentora/shared if needed for extensions
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
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
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
  }, [user?.id]);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => paymentsApi.subscription(),
    enabled: isAuthenticated,
  });

  if (authLoading) return <PageSpinner />;
  if (!isAuthenticated) { router.push('/login?redirect=/account'); return null; }

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
    { id: 'accessibility', label: 'Accessibility', icon: <Type size={16} /> },
  ];

  return (
    <div className="section">
      <div className="page-container max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
          <div>
            <h1 className="text-stone-900">{user?.name}</h1>
            <p className="text-stone-500">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="brand" size="sm">{user?.role}</Badge>
              {user?.verified && <Badge variant="green" size="sm">Verified</Badge>}
              {user?.proTier && <Badge variant="teal" size="sm">Mentor Pro</Badge>}
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} defaultTab="profile">
          {(activeTab) => (
            <>
              {/* Profile tab */}
              {activeTab === 'profile' && (
                <Card padding="lg">
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

              {/* Subscription tab */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  {subscription ? (
                    <Card padding="lg">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h2 className="text-xl font-bold text-stone-900">Current plan</h2>
                          <Badge variant="brand" size="md" className="mt-2">{subscription.planId}</Badge>
                        </div>
                        <Badge
                          variant={subscription.status === 'active' ? 'green' : 'amber'}
                          size="md"
                        >
                          {subscription.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-stone-600">
                        <div className="flex justify-between">
                          <span>Billing provider</span>
                          <span className="font-semibold text-stone-800 capitalize">
                            {subscription.provider}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Renews</span>
                          <span className="font-semibold text-stone-800">
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
                    <Card padding="lg" className="text-center">
                      <CreditCard size={48} className="text-stone-300 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-stone-900 mb-2">No active plan</h2>
                      <p className="text-stone-500 mb-6">
                        Upgrade to unlock unlimited classrooms, AI tutoring and more.
                      </p>
                      <Button onClick={() => router.push('/pricing')}>
                        View plans
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {/* Accessibility tab */}
              {activeTab === 'accessibility' && (
                <Card padding="lg">
                  <h2 className="text-xl font-bold text-stone-900 mb-6">Accessibility settings</h2>

                  <div className="space-y-6">
                    {/* Text size */}
                    <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-surface-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                          <Type size={24} className="text-brand-500" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">Larger text</p>
                          <p className="text-sm text-stone-500">
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
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <CheckCircle2 size={18} className="text-teal-500" />
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

