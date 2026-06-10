'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles, Star } from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const redirect = params.get('redirect') ?? '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Please enter your email address.';
    if (!password) newErrors.password = 'Please enter your password.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await login({ email, password });
      success('Welcome back!');
      router.push(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrors({ form: 'Email or password is incorrect. Please try again.' });
        } else if (err.status === 0) {
          setErrors({ form: 'Cannot reach the server. Please check your connection.' });
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Warm mesh backdrop */}
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
            <Sparkles size={14} aria-hidden="true" />
            Seasoned expertise, next-gen learning
          </span>

          <h1 className="text-4xl font-semibold text-ink-900 mt-5 mb-2 text-balance">
            Welcome back
          </h1>
          <p className="text-ink-700 text-lg">
            Continue your learning journey.
          </p>
        </div>

        {/* Social proof strip */}
        <div className="flex items-center justify-center gap-1.5 mb-7 text-sm text-ink-700">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-accent-400 fill-accent-400" aria-hidden="true" />
          ))}
          <span className="ml-1 font-medium">Trusted by 12,000+ learners worldwide</span>
        </div>

        {/* Form card */}
        <div className="card p-8 shadow-lift animate-fade-up delay-75">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {errors.form && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm font-medium flex items-start gap-2"
              >
                <span aria-hidden="true" className="mt-0.5">⚠</span>
                {errors.form}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={18} />}
              placeholder="you@example.com"
            />

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={18} />}
                placeholder="Your password"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-600 no-underline hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              iconEnd={<ArrowRight size={20} />}
              className="mt-2 btn-sheen"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-ink-700 font-medium px-1">or</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          <p className="text-center text-sm text-ink-700">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-brand-600 no-underline hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust note */}
        <p className="text-center mt-6 text-xs text-ink-700 opacity-60">
          Protected by industry-standard encryption. We never sell your data.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
