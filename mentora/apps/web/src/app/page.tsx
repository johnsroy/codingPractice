/**
 * Mentora Landing Page — premium & warm.
 * Server component; all motion is CSS-only so it renders without client JS.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Star, Users, BookOpen, GraduationCap, Bot, CheckCircle2,
  Sparkles, ShieldCheck, Globe, Video,
} from 'lucide-react';
import { BRAND, SUBJECTS } from '@mentora/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeaturedTeachers } from '@/components/features/FeaturedTeachers';

export const metadata = {
  title: `${BRAND.name} — ${BRAND.shortTagline}`,
};

const howItWorksLearner = [
  { step: '1', title: 'Browse real experts', desc: 'Find retired doctors, engineers, authors and professors who love teaching children.', icon: <Users size={26} className="text-brand-600" /> },
  { step: '2', title: 'Join a class or book 1:1', desc: 'Hop into a live group classroom or book a personal coaching session — your schedule, your pace.', icon: <BookOpen size={26} className="text-teal-600" /> },
  { step: '3', title: 'Learn & grow', desc: 'Practice with the AI tutor, download materials and track progress — all in one place.', icon: <Bot size={26} className="text-accent-600" /> },
];

const howItWorksTeacher = [
  { step: '1', title: 'Create your profile', desc: 'Share your career story, subjects and teaching style. It takes less than 10 minutes.', icon: <GraduationCap size={26} className="text-white" /> },
  { step: '2', title: 'Upload your materials', desc: 'Drop in your PDFs and notes. Our AI scans them and builds a ready-to-use course.', icon: <BookOpen size={26} className="text-white" /> },
  { step: '3', title: 'Earn while you inspire', desc: 'Schedule sessions, set your price, and keep up to 90% of what you earn. No tech skills needed.', icon: <CheckCircle2 size={26} className="text-white" /> },
];

const stats = [
  { value: '2,400+', label: 'Expert mentors' },
  { value: '18,000+', label: 'Students learning' },
  { value: '4.9 / 5', label: 'Average teacher rating' },
  { value: '140+', label: 'Subjects covered' },
];

const trustChips = [
  { icon: <ShieldCheck size={16} className="text-teal-600" />, label: 'Verified mentors' },
  { icon: <Globe size={16} className="text-brand-600" />, label: 'हिन्दी · ਪੰਜਾਬੀ · বাংলা · English' },
  { icon: <Sparkles size={16} className="text-accent-600" />, label: 'AI built in' },
];

export default function HomePage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        {/* backdrop */}
        <div className="absolute inset-0 mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 grid-dots opacity-60" aria-hidden="true" />
        <div className="blob bg-brand-300/40 w-[34rem] h-[34rem] -top-40 -left-40 animate-float-slow" aria-hidden="true" />
        <div className="blob bg-accent-200/50 w-[26rem] h-[26rem] top-20 -right-32 animate-float" aria-hidden="true" />

        <div className="page-container relative py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
            {/* Copy */}
            <div className="max-w-xl">
              <span className="eyebrow animate-fade-up">
                <Star size={14} className="fill-accent-400 text-accent-400" aria-hidden="true" />
                Trusted by 18,000+ families
              </span>

              <h1 className="mt-6 text-5xl lg:text-6xl font-semibold leading-[1.05] text-balance animate-fade-up delay-75">
                A lifetime of expertise becomes the{' '}
                <span className="text-gradient-warm">next generation&apos;s</span> head start.
              </h1>

              <p className="mt-6 text-xl text-ink-700 text-balance animate-fade-up delay-150">
                {BRAND.shortTagline} — connect your child with retired doctors, engineers,
                authors and professors who bring real-world depth to every lesson.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
                <Link href="/teachers" className="no-underline">
                  <Button size="xl" className="btn-sheen" iconEnd={<ArrowRight size={22} />}>
                    Find a Teacher
                  </Button>
                </Link>
                <Link href="/signup?role=TEACHER" className="no-underline">
                  <Button size="xl" variant="outline">Become a Mentor</Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 animate-fade-up delay-500">
                {trustChips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-2 text-sm font-medium text-ink-700">
                    {c.icon}{c.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-700/70">
                Free to browse · No credit card needed · Cancel any time
              </p>
            </div>

            {/* Composed hero visual (no raster image needed) */}
            <div className="relative h-[30rem] hidden lg:block animate-scale-in" aria-hidden="true">
              {/* rotating dashed ring */}
              <div className="absolute right-6 top-10 w-[24rem] h-[24rem] rounded-full border-2 border-dashed border-brand-200 animate-spin-slow" />
              <div className="absolute right-20 top-24 w-[16rem] h-[16rem] rounded-full border border-dashed border-teal-200 animate-spin-slow-rev" />

              {/* main mentor card */}
              <div className="absolute left-2 top-14 w-[20rem] card p-6 shadow-lift animate-float-slow">
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xl font-bold shadow-glow">MC</span>
                  <div>
                    <p className="font-display font-semibold text-lg text-ink-900 leading-tight">Margaret Chen</p>
                    <p className="text-sm text-ink-700">Mathematics · 35 yrs at MIT</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-accent-500">
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-accent-400 text-accent-400" />)}
                  <span className="ml-2 text-sm font-semibold text-ink-800">4.9</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5">Algebra</span>
                  <span className="rounded-full bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5">Exam prep</span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gradient text-white text-sm font-semibold px-4 py-2.5 shadow-glow">
                  Book a 1:1 <ArrowRight size={16} />
                </div>
              </div>

              {/* floating AI tutor chip */}
              <div className="absolute right-2 top-2 w-[15rem] card p-4 shadow-lift animate-float">
                <div className="flex items-center gap-2 text-brand-700 font-semibold text-sm">
                  <Bot size={18} /> AI Tutor
                </div>
                <p className="mt-2 text-sm text-ink-700">“Explain photosynthesis like I’m 10.”</p>
                <div className="mt-2 h-2 w-2/3 rounded-full bg-gradient-to-r from-brand-300 to-teal-300 animate-shimmer bg-[length:200%_100%]" />
              </div>

              {/* floating live-class chip */}
              <div className="absolute right-6 bottom-6 w-[16rem] card p-4 shadow-lift animate-float-slow">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-500" />
                  </span>
                  Live classroom
                  <Video size={16} className="ml-auto text-teal-600" />
                </div>
                <p className="mt-1.5 text-sm text-ink-700">Science · 12 learners online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-y border-surface-200">
        <div className="page-container">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-surface-200">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-10 px-4">
                <dt className="font-display text-4xl font-semibold text-gradient mb-1">{s.value}</dt>
                <dd className="text-sm text-ink-700 font-medium">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── How it works: Learners ── */}
      <section className="section">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow"><Users size={14} /> For families</span>
            <h2 className="mt-5">Learning that actually makes sense</h2>
            <p className="mt-3 text-lg text-ink-700">Three simple steps from curious child to confident learner.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksLearner.map((item, i) => (
              <Card key={item.step} className="card-lift relative" padding="lg">
                <span className="absolute top-6 right-6 font-display text-5xl font-semibold text-surface-200 select-none">{item.step}</span>
                <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-5">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-ink-700">{item.desc}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/teachers" className="no-underline">
              <Button size="lg" iconEnd={<ArrowRight size={20} />}>Browse Teachers</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Teachers ── */}
      <section className="section bg-surface-100/60">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <span className="eyebrow"><Sparkles size={14} className="text-accent-500" /> Featured mentors</span>
              <h2 className="mt-4">Meet some of our experts</h2>
            </div>
            <Link href="/teachers" className="no-underline shrink-0">
              <Button variant="outline" iconEnd={<ArrowRight size={18} />}>See all teachers</Button>
            </Link>
          </div>
          <FeaturedTeachers />
        </div>
      </section>

      {/* ── Subject grid ── */}
      <section className="section">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2>Every subject your child needs</h2>
            <p className="mt-3 text-lg text-ink-700">From Maths to Life Skills — taught by people who&apos;ve lived it.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((sub) => (
              <Link key={sub.id} href={`/courses?subject=${sub.id}`} className="no-underline group" aria-label={`Browse ${sub.label} courses`}>
                <div className="card card-lift flex items-center gap-4 p-5">
                  <span className="text-3xl shrink-0" aria-hidden="true">{sub.emoji}</span>
                  <span className="font-semibold text-ink-800 group-hover:text-brand-700 transition-colors">{sub.label}</span>
                  <ArrowRight size={16} className="ml-auto text-surface-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── For teachers (dark, premium) ── */}
      <section className="section relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-mesh-warm" aria-hidden="true" />
        <div className="blob bg-brand-600/30 w-[30rem] h-[30rem] -bottom-40 -left-20" aria-hidden="true" />
        <div className="page-container relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white">
              <GraduationCap size={14} /> For retired professionals
            </span>
            <h2 className="mt-5 text-white">Turn your career into income</h2>
            <p className="mt-4 text-xl text-brand-100/90">
              Your decades of experience are exactly what students are looking for. No lesson
              plans from scratch — we handle the tech, you do the teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {howItWorksTeacher.map((item) => (
              <div key={item.step} className="rounded-3xl p-8 bg-white/[0.07] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-5 shadow-glow">{item.icon}</div>
                <div className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-brand-100/80">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/signup?role=TEACHER" className="no-underline">
              <Button size="xl" variant="secondary" iconEnd={<ArrowRight size={22} />}>Start teaching today</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonial + final CTA ── */}
      <section className="section">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center border border-brand-100 bg-gradient-to-br from-brand-50 via-surface-50 to-teal-50">
            <div className="blob bg-accent-200/40 w-72 h-72 -top-20 -right-10" aria-hidden="true" />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={26} className="text-accent-400 fill-accent-400" aria-hidden="true" />)}
              </div>
              <blockquote className="font-display text-2xl md:text-3xl font-medium text-ink-900 max-w-3xl mx-auto mb-6 text-balance leading-snug">
                “My daughter went from dreading maths to asking for extra sessions. Her mentor is a
                retired engineer with 40 years of patience.”
              </blockquote>
              <p className="text-ink-700 mb-10">— Sarah M., parent of a Grade 5 student</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="no-underline">
                  <Button size="xl" className="btn-sheen" iconEnd={<ArrowRight size={22} />}>Get started free</Button>
                </Link>
                <Link href="/pricing" className="no-underline">
                  <Button size="xl" variant="outline">View plans</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
