'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, BookOpen, Users, Star, PlayCircle, FileText, Download, Check,
  GraduationCap, Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { coursesApi, materialsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.byId(id),
    enabled: !!id,
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => coursesApi.lessons(id),
    enabled: !!id,
  });

  const { data: materials } = useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialsApi.list(id),
    enabled: !!id,
  });

  if (isLoading) return <PageSpinner />;

  if (!course) {
    return (
      <div className="section">
        <div className="page-container">
          <EmptyState
            title="Course not found"
            description="This course doesn't exist or has been removed."
            action={{ label: 'Browse courses', href: '/courses' }}
          />
        </div>
      </div>
    );
  }

  const subjectInfo = SUBJECTS.find((s) => s.id === course.subjectId);
  const gradeLabel = GRADES.find((g) => g.id === course.gradeId)?.label;

  async function handleEnroll() {
    if (!isAuthenticated) { router.push('/login?redirect=/courses/' + id); return; }
    setEnrollLoading(true);
    try {
      await coursesApi.enroll(id);
      setEnrolled(true);
      success('Enrolled successfully! Check your dashboard.');
    } catch {
      toastError('Could not enroll. Please try again.');
    } finally {
      setEnrollLoading(false);
    }
  }

  const kindIcon = (kind: string) => {
    if (kind === 'pdf' || kind === 'doc') return <FileText size={18} className="text-brand-400" />;
    if (kind === 'video') return <PlayCircle size={18} className="text-teal-400" />;
    return <FileText size={18} className="text-ink-700" />;
  };

  return (
    <div className="relative overflow-hidden">
      {/* ── Header ── */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
        <div className="grid-dots absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />
        <div className="blob w-[400px] h-[400px] bg-teal-200/20 -top-24 -right-24 animate-float" aria-hidden="true" />

        <div className="page-container relative">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-600 no-underline mb-8 font-medium transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            All courses
          </Link>

          <div className="max-w-3xl animate-fade-up">
            <div className="flex flex-wrap gap-2 mb-4">
              {subjectInfo && (
                <Badge variant="brand" size="md">
                  {subjectInfo.emoji} {subjectInfo.label}
                </Badge>
              )}
              {gradeLabel && <Badge variant="teal" size="md">{gradeLabel}</Badge>}
              {course.status === 'published' && <Badge variant="green" size="md">Published</Badge>}
            </div>

            <h1 className="text-ink-900 mb-4 text-balance">{course.title}</h1>
            <p className="text-xl text-ink-700 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap gap-6 mt-6 text-sm text-ink-700">
              {course.lessonCount != null && (
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-brand-400" aria-hidden="true" />
                  {course.lessonCount} lessons
                </span>
              )}
              {course.enrolledCount != null && (
                <span className="flex items-center gap-1.5">
                  <Users size={16} className="text-teal-500" aria-hidden="true" />
                  {course.enrolledCount} students enrolled
                </span>
              )}
              {course.rating != null && (
                <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                  <Star size={16} className="text-accent-400 fill-accent-400" aria-hidden="true" />
                  {course.rating.toFixed(1)} rating
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section py-8 lg:py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Cover image */}
              {course.coverImageUrl && (
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-card animate-fade-up">
                  <Image
                    src={course.coverImageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Instructor */}
              {course.teacher && (
                <div className="card p-6 shadow-card animate-fade-up delay-75">
                  <h2 className="text-xl font-semibold text-ink-800 mb-4 flex items-center gap-2">
                    <GraduationCap size={20} className="text-brand-400" aria-hidden="true" />
                    Your instructor
                  </h2>
                  <Link
                    href={`/teachers/${course.teacher.id}`}
                    className="no-underline flex items-center gap-4 group"
                  >
                    <Avatar src={course.teacher.avatarUrl} name={course.teacher.name} size="lg" />
                    <div>
                      <p className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors text-lg">
                        {course.teacher.name}
                      </p>
                      {course.teacher.headline && (
                        <p className="text-sm text-ink-700 mt-0.5">{course.teacher.headline}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Lessons */}
              {(lessons?.length ?? 0) > 0 && (
                <div className="animate-fade-up delay-150">
                  <h2 className="text-2xl font-semibold text-ink-900 mb-5">Lessons</h2>
                  <div className="space-y-3">
                    {lessons!.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="card p-4 flex items-center gap-4 shadow-soft"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 font-bold text-brand-500 text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-ink-800">{lesson.title}</p>
                          {lesson.summary && (
                            <p className="text-sm text-ink-700 mt-0.5 line-clamp-1">{lesson.summary}</p>
                          )}
                        </div>
                        <Clock size={16} className="text-ink-700 shrink-0" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {(materials?.length ?? 0) > 0 && (
                <div className="animate-fade-up delay-300">
                  <h2 className="text-2xl font-semibold text-ink-900 mb-5">Course materials</h2>
                  <div className="space-y-3">
                    {materials!.map((m) => (
                      <div key={m.id} className="card p-4 flex items-center gap-3 shadow-soft">
                        {kindIcon(m.kind)}
                        <span className="flex-1 text-ink-700 font-medium">{m.title}</span>
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-surface-100 text-ink-700 hover:text-brand-600 transition-colors"
                          aria-label={`Download ${m.title}`}
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Enroll sidebar */}
            <div>
              <div className="sticky top-24 space-y-4 animate-fade-up delay-75">
                <div className="card p-6 shadow-lift bg-gradient-to-br from-brand-50 to-teal-50 border-brand-100">
                  {/* Price */}
                  <div className="mb-6">
                    {course.priceCents > 0 ? (
                      <div>
                        <span className="text-4xl font-bold text-brand-600">
                          {formatPrice(course.priceCents)}
                        </span>
                        <p className="text-sm text-ink-700 mt-1">One-time access</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-teal-600">Free</span>
                        <p className="text-sm text-ink-700 mt-1">Included with any plan</p>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {enrolled ? (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
                      <Check size={22} className="text-green-500 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-bold text-green-700">You&apos;re enrolled!</p>
                        <Link href="/dashboard" className="text-sm text-green-600 no-underline hover:underline">
                          Go to dashboard
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      loading={enrollLoading}
                      onClick={handleEnroll}
                      className="btn-sheen"
                    >
                      {course.priceCents > 0 ? 'Enroll now' : 'Enroll for free'}
                    </Button>
                  )}

                  {/* Included items */}
                  <ul className="mt-6 space-y-3 text-sm text-ink-700">
                    {course.lessonCount != null && (
                      <li className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-teal-600" aria-hidden="true" />
                        </div>
                        {course.lessonCount} video lessons
                      </li>
                    )}
                    {[
                      'Downloadable materials',
                      'AI tutor support',
                      'Certificate on completion',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-teal-600" aria-hidden="true" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
