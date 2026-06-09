/**
 * Custom 404 — polished, warm, and helpful.
 * Server component; all motion is CSS-only.
 */

import React from 'react';
import Link from 'next/link';
import { Home, Search, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Page not found — Mentora',
};

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Warm mesh backdrop */}
      <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
      <div className="grid-dots absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />

      {/* Floating blobs */}
      <div className="blob w-[480px] h-[480px] bg-brand-200/35 -top-32 -left-32 animate-float" aria-hidden="true" />
      <div className="blob w-80 h-80 bg-accent-200/30 bottom-0 -right-16 animate-float-slow" aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto text-center animate-fade-up">
        <span className="eyebrow">
          <Compass size={14} aria-hidden="true" />
          Error 404
        </span>

        <p
          className="mt-8 font-display text-8xl lg:text-9xl font-semibold leading-none text-gradient-warm select-none"
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="mt-6 text-4xl lg:text-5xl font-semibold text-ink-900 text-balance">
          This page seems to have skipped class.
        </h1>

        <p className="mt-5 text-xl text-ink-700 text-balance max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has moved. No worries —
          there&apos;s plenty of great learning waiting for you back on the main path.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-150">
          <Link href="/" className="no-underline">
            <Button size="lg" className="btn-sheen" icon={<Home size={20} />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/teachers" className="no-underline">
            <Button size="lg" variant="outline" icon={<Search size={20} />} iconEnd={<ArrowRight size={18} />}>
              Find a Teacher
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-ink-700/70 animate-fade-up delay-300">
          Think something is broken? Tell us at support@mentora.example.
        </p>
      </div>
    </div>
  );
}
