'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowLeft, ArrowRight, KeyRound, MailCheck } from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Forgot-password page — a calm, single-purpose reset card.
 *
 * There is no email backend yet, so submitting always shows the same friendly
 * confirmation. This is intentional (and the honest, enumeration-safe pattern):
 * we never reveal whether an account exists for a given address.
 */
function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('That doesn’t look like a valid email address.');
      return;
    }

    setLoading(true);
    // TODO: wire to a real password-reset endpoint
    // Simulate a short round-trip so the button state feels real.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Warm mesh backdrop — same treatment as the login page */}
      <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
      <div className="grid-dots absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />

      {/* Decorative blobs */}
      <div className="blob w-[500px] h-[500px] bg-brand-200/30 -top-32 -left-32 animate-float" aria-hidden="true" />
      <div className="blob w-[400px] h-[400px] bg-teal-200/25 -bottom-20 -right-20 animate-float-slow" aria-hidden="true" />
      <div className="blob w-64 h-64 bg-accent-200/20 top-1/3 right-1/4 animate-float" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo mark */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 no-underline mb-7 group"
            aria-label="Mentora home"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow group-hover:shadow-lift transition-all duration-300 group-hover:-translate-y-0.5">
              <GraduationCap size={28} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-ink-900">{BRAND.name}</span>
          </Link>

          <span className="eyebrow mb-5">
            <KeyRound size={14} aria-hidden="true" />
            Account recovery
          </span>

          <h1 className="text-4xl font-semibold text-ink-900 mt-5 mb-2 text-balance">
            Reset your password
          </h1>
          <p className="text-ink-700 text-lg">
            Enter your email and we&apos;ll send you a link to choose a new one.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8 shadow-lift animate-fade-up delay-75">
          {sent ? (
            <div role="status" className="text-center py-2">
              <div
                className="mx-auto mb-5 w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center"
                aria-hidden="true"
              >
                <MailCheck size={28} className="text-teal-600" />
              </div>
              <h2 className="text-2xl font-semibold text-ink-900 mb-2">Check your inbox</h2>
              <p className="text-ink-700">
                If an account exists for that email, we&apos;ve sent a reset link.
              </p>
              <p className="mt-3 text-sm text-ink-700/70">
                Didn&apos;t get it? Check your spam folder, or try again in a few minutes.
              </p>
              <Link href="/login" className="no-underline block mt-7">
                <Button fullWidth size="lg" variant="outline" icon={<ArrowLeft size={20} />}>
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <Input
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                icon={<Mail size={18} />}
                placeholder="you@example.com"
                hint="We'll email a secure link that expires after one hour."
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                iconEnd={<ArrowRight size={20} />}
                className="mt-1 btn-sheen"
              >
                Send reset link
              </Button>

              <p className="text-center text-sm text-ink-700">
                Remembered it after all?{' '}
                <Link href="/login" className="font-semibold text-brand-600 no-underline hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Trust note */}
        <p className="text-center mt-6 text-xs text-ink-700 opacity-60">
          For your security, we never confirm whether an email is registered.
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
