/**
 * Mentora Landing Page
 * Hero + how it works + featured teachers + subject grid + social proof + dual CTAs
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Users, BookOpen, GraduationCap, Bot, CheckCircle2 } from 'lucide-react';
import { BRAND, SUBJECTS } from '@mentora/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FeaturedTeachers } from '@/components/features/FeaturedTeachers';

export const metadata = {
  title: `${BRAND.name} — ${BRAND.shortTagline}`,
};

const howItWorksLearner = [
  {
    step: '1',
    title: 'Browse real experts',
    desc: 'Find retired doctors, engineers, authors and professors who love teaching children.',
    icon: <Users size={28} className="text-brand-500" />,
  },
  {
    step: '2',
    title: 'Join a class or book 1:1',
    desc: 'Hop into a live group classroom or book a personal coaching session — your schedule, your pace.',
    icon: <BookOpen size={28} className="text-teal-500" />,
  },
  {
    step: '3',
    title: 'Learn & grow',
    desc: 'Practice with the AI tutor, download materials and track progress — all in one place.',
    icon: <Bot size={28} className="text-accent-500" />,
  },
];

const howItWorksTeacher = [
  {
    step: '1',
    title: 'Create your profile',
    desc: 'Share your career story, subjects and teaching style. It takes less than 10 minutes.',
    icon: <GraduationCap size={28} className="text-brand-500" />,
  },
  {
    step: '2',
    title: 'Upload your materials',
    desc: 'Drop in your PDFs and notes. Our AI scans them and creates a ready-to-use course.',
    icon: <BookOpen size={28} className="text-teal-500" />,
  },
  {
    step: '3',
    title: 'Earn while you inspire',
    desc: 'Schedule sessions, set your price, and keep up to 90% of what you earn. No tech skills needed.',
    icon: <CheckCircle2 size={28} className="text-accent-500" />,
  },
];

const stats = [
  { value: '2,400+', label: 'Expert mentors' },
  { value: '18,000+', label: 'Students learning' },
  { value: '4.9 / 5', label: 'Average teacher rating' },
  { value: '140+', label: 'Subjects covered' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient section">
        <div className="page-container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="amber" size="md" className="mb-6">
              <Star size={14} className="fill-amber-500" aria-hidden="true" />
              Trusted by 18,000+ families
            </Badge>

            <h1 className="text-balance mb-6 text-stone-900">
              A lifetime of expertise becomes<br className="hidden sm:block" />
              the next generation&apos;s head start.
            </h1>

            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-10 text-balance">
              {BRAND.shortTagline} — connect your child with retired doctors, engineers,
              authors and professors who bring real-world depth to every lesson.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/teachers" className="no-underline">
                <Button size="xl" iconEnd={<ArrowRight size={22} />}>
                  Find a Teacher
                </Button>
              </Link>
              <Link href="/signup?role=TEACHER" className="no-underline">
                <Button size="xl" variant="outline">
                  Become a Mentor
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <p className="mt-8 text-sm text-stone-500">
              Free to browse · No credit card needed · Cancel any time
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-y border-surface-200 py-10">
        <div className="page-container">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-bold text-brand-600 mb-1">{s.value}</dt>
                <dd className="text-sm text-stone-500 font-medium">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── How it works: Learners ── */}
      <section className="section">
        <div className="page-container">
          <div className="text-center mb-12">
            <Badge variant="teal" size="md" className="mb-4">For Families</Badge>
            <h2 className="text-stone-900">Learning that actually makes sense</h2>
            <p className="mt-3 text-lg text-stone-500 max-w-xl mx-auto">
              Three simple steps from curious child to confident learner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksLearner.map((item) => (
              <Card key={item.step} className="text-center" padding="lg">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                <p className="text-stone-600">{item.desc}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/teachers" className="no-underline">
              <Button size="lg" iconEnd={<ArrowRight size={20} />}>
                Browse Teachers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Teachers ── */}
      <section className="section bg-surface-50">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <Badge variant="brand" size="md" className="mb-3">Featured Mentors</Badge>
              <h2 className="text-stone-900">Meet some of our experts</h2>
            </div>
            <Link href="/teachers" className="no-underline shrink-0">
              <Button variant="outline" iconEnd={<ArrowRight size={18} />}>
                See all teachers
              </Button>
            </Link>
          </div>
          <FeaturedTeachers />
        </div>
      </section>

      {/* ── Subject grid ── */}
      <section className="section">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-stone-900">Every subject your child needs</h2>
            <p className="mt-3 text-lg text-stone-500">
              From Maths to Life Skills — taught by people who&apos;ve lived it.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((sub) => (
              <Link
                key={sub.id}
                href={`/courses?subject=${sub.id}`}
                className="no-underline group"
                aria-label={`Browse ${sub.label} courses`}
              >
                <Card
                  hover
                  className="text-center flex flex-col items-center gap-3 py-6 px-4"
                  padding="none"
                >
                  <span className="text-4xl" aria-hidden="true">{sub.emoji}</span>
                  <span className="text-sm font-semibold text-stone-700 group-hover:text-brand-600 transition-colors">
                    {sub.label}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works: Teachers ── */}
      <section className="section bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-brand-600 text-brand-100 border-brand-500">For Retired Professionals</Badge>
            <h2 className="text-white">Turn your career into income</h2>
            <p className="mt-3 text-xl text-brand-200 max-w-2xl mx-auto">
              Your decades of experience are exactly what students are looking for.
              No lesson plans from scratch — we handle the tech, you do the teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {howItWorksTeacher.map((item) => (
              <div key={item.step} className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-brand-200">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/signup?role=TEACHER" className="no-underline">
              <Button size="xl" variant="secondary" iconEnd={<ArrowRight size={22} />}>
                Start teaching today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social proof / final CTA ── */}
      <section className="section">
        <div className="page-container">
          <div className="bg-gradient-to-r from-brand-50 to-teal-50 rounded-3xl p-10 md:p-16 text-center border border-brand-100">
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={28} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="text-2xl font-semibold text-stone-800 max-w-3xl mx-auto mb-6 text-balance">
              &ldquo;My daughter went from dreading maths to asking for extra sessions.
              Her mentor is a retired engineer with 40 years of patience.&rdquo;
            </blockquote>
            <p className="text-stone-500 mb-10 text-base">— Sarah M., parent of a Grade 5 student</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="no-underline">
                <Button size="xl" iconEnd={<ArrowRight size={22} />}>
                  Get started free
                </Button>
              </Link>
              <Link href="/pricing" className="no-underline">
                <Button size="xl" variant="outline">
                  View plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
