'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, Star, PlayCircle, FileText, Download, Check } from 'lucide-react';
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
    return <FileText size={18} className="text-stone-400" />;
  };

  return (
    <div className="section">
      <div className="page-container">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-600 no-underline mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          All courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {subjectInfo && <Badge variant="brand" size="md">{subjectInfo.emoji} {subjectInfo.label}</Badge>}
                {gradeLabel && <Badge variant="teal" size="md">{gradeLabel}</Badge>}
                {course.status === 'published' && <Badge variant="green" size="md">Published</Badge>}
              </div>

              <h1 className="text-stone-900 mb-4">{course.title}</h1>
              <p className="text-xl text-stone-600 leading-relaxed">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6 text-sm text-stone-500">
                {course.lessonCount != null && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={16} className="text-brand-400" />
                    {course.lessonCount} lessons
                  </span>
                )}
                {course.enrolledCount != null && (
                  <span className="flex items-center gap-1.5">
                    <Users size={16} className="text-teal-400" />
                    {course.enrolledCount} students enrolled
                  </span>
                )}
                {course.rating != null && (
                  <span className="flex items-center gap-1.5">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    {course.rating.toFixed(1)} rating
                  </span>
                )}
              </div>
            </div>

            {/* Cover image */}
            {course.coverImageUrl && (
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <Image
                  src={course.coverImageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Teacher */}
            {course.teacher && (
              <Card padding="md">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Your instructor</h2>
                <Link href={`/teachers/${course.teacher.id}`} className="no-underline flex items-center gap-4 group">
                  <Avatar src={course.teacher.avatarUrl} name={course.teacher.name} size="lg" />
                  <div>
                    <p className="font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                      {course.teacher.name}
                    </p>
                    {course.teacher.headline && (
                      <p className="text-sm text-stone-500">{course.teacher.headline}</p>
                    )}
                  </div>
                </Link>
              </Card>
            )}

            {/* Lessons */}
            {(lessons?.length ?? 0) > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-5">Lessons</h2>
                <div className="space-y-3">
                  {lessons!.map((lesson, idx) => (
                    <Card key={lesson.id} padding="md" className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 font-bold text-brand-500 text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800">{lesson.title}</p>
                        {lesson.summary && (
                          <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">{lesson.summary}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {(materials?.length ?? 0) > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-5">Course materials</h2>
                <div className="space-y-3">
                  {materials!.map((m) => (
                    <Card key={m.id} padding="sm" className="flex items-center gap-3">
                      {kindIcon(m.kind)}
                      <span className="flex-1 text-stone-700 font-medium">{m.title}</span>
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-surface-100 text-stone-400 hover:text-brand-600 transition-colors"
                        aria-label={`Download ${m.title}`}
                      >
                        <Download size={18} />
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Enroll */}
          <div>
            <div className="sticky top-24 space-y-4">
              <Card padding="lg" className="bg-gradient-to-br from-brand-50 to-teal-50 border-brand-100">
                <div className="mb-5">
                  {course.priceCents > 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-brand-600">
                        {formatPrice(course.priceCents)}
                      </span>
                      <p className="text-sm text-stone-500 mt-1">One-time access</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-teal-600">Free</span>
                      <p className="text-sm text-stone-500 mt-1">Included with any plan</p>
                    </div>
                  )}
                </div>

                {enrolled ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <Check size={22} className="text-green-500 shrink-0" />
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
                  >
                    {course.priceCents > 0 ? 'Enroll now' : 'Enroll for free'}
                  </Button>
                )}

                {/* What you get */}
                <ul className="mt-6 space-y-2.5 text-sm text-stone-600">
                  {course.lessonCount != null && (
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-500" />
                      {course.lessonCount} video lessons
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal-500" />
                    Downloadable materials
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal-500" />
                    AI tutor support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal-500" />
                    Certificate on completion
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
