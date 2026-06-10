'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Mail, Lock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { BRAND, ROLES } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import clsx from 'clsx';

type RoleChoice = 'STUDENT' | 'TEACHER';

interface RoleOption {
  role: RoleChoice;
  emoji: string;
  title: string;
  desc: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'STUDENT',
    emoji: '📚',
    title: 'Learner',
    desc: "I'm a student or parent looking for expert tutors.",
  },
  {
    role: 'TEACHER',
    emoji: '🎓',
    title: 'Teacher',
    desc: "I'm a retired professional who wants to share my expertise.",
  },
];

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const roleFromQuery = (params.get('role') ?? '').toUpperCase() as RoleChoice;
  const initialRole: RoleChoice = roleFromQuery === 'TEACHER' ? 'TEACHER' : 'STUDENT';

  const [selectedRole, setSelectedRole] = useState<RoleChoice>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!name || name.trim().length < 2) newErrors.name = 'Please enter your full name (at least 2 characters).';
    if (!email) newErrors.email = 'Please enter your email address.';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await register({ name: name.trim(), email, password, role: selectedRole });
      success('Welcome to Mentora!');
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrors({ email: 'An account with this email already exists.' });
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
      <div className="blob w-[500px] h-[500px] bg-teal-200/25 -top-32 -right-32 animate-float-slow" aria-hidden="true" />
      <div className="blob w-[380px] h-[380px] bg-brand-200/25 -bottom-24 -left-24 animate-float" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 no-underline mb-6 group"
            aria-label="Mentora home"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow group-hover:shadow-lift transition-all duration-300 group-hover:-translate-y-0.5">
              <GraduationCap size={28} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-ink-900">{BRAND.name}</span>
          </Link>

          <span className="eyebrow mb-4">
            <Sparkles size={14} aria-hidden="true" />
            Join 12,000+ learners &amp; mentors
          </span>

          <h1 className="text-4xl font-semibold text-ink-900 mt-4 mb-2 text-balance">
            Create your free account
          </h1>
          <p className="text-ink-700">No credit card needed. Start in seconds.</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-lift animate-fade-up delay-75">
          {/* Role chooser */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-ink-800 mb-3">I am joining as a…</p>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setSelectedRole(opt.role)}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center cursor-pointer',
                    'min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                    selectedRole === opt.role
                      ? 'border-brand-500 bg-brand-50 shadow-soft'
                      : 'border-surface-200 hover:border-brand-300 bg-white hover:bg-surface-50',
                  )}
                  aria-pressed={selectedRole === opt.role}
                >
                  <span className="text-3xl" aria-hidden="true">{opt.emoji}</span>
                  <span className={clsx(
                    'text-sm font-bold',
                    selectedRole === opt.role ? 'text-brand-700' : 'text-ink-800',
                  )}>
                    {opt.title}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-ink-700 mt-3 text-center">
              {roleOptions.find((o) => o.role === selectedRole)?.desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
              label="Full name"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User size={18} />}
              placeholder="Your name"
            />

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

            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={18} />}
              placeholder="At least 8 characters"
              hint="Use at least 8 characters."
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              iconEnd={<ArrowRight size={20} />}
              className="mt-2 btn-sheen"
            >
              Create account
            </Button>

            <p className="text-xs text-ink-700 text-center mt-1 opacity-70">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-brand-500 no-underline hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-brand-500 no-underline hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>

        <p className="text-center mt-6 text-ink-700">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 no-underline hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
