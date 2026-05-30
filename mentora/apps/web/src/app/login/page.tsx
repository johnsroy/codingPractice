'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
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

    // Client-side validation
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-soft">
              <GraduationCap size={26} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-900">{BRAND.name}</span>
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome back</h1>
          <p className="text-stone-500">Sign in to your account to continue learning.</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {errors.form && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium"
              >
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
                <Link href="/forgot-password" className="text-sm text-brand-600 no-underline hover:underline">
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
              className="mt-2"
            >
              Sign in
            </Button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-stone-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-brand-600 no-underline hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
