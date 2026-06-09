'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Star, GraduationCap, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { coursesApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import Image from 'next/image';
import clsx from 'clsx';

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses', { query, subject, grade, page }],
    queryFn: () =>
      coursesApi.list({
        q: query || undefined,
        subject: subject || undefined,
        grade: grade || undefined,
        page,
      }),
  });

  const subjectOptions = [
    { value: '', label: 'All subjects' },
    ...SUBJECTS.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` })),
  ];

  const gradeOptions = [
    { value: '', label: 'All grades' },
    ...GRADES.map((g) => ({ value: g.id, label: g.label })),
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
        <div className="grid-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="blob w-[450px] h-[450px] bg-teal-200/25 -top-32 -right-32 animate-float" aria-hidden="true" />
        <div className="blob w-[350px] h-[350px] bg-brand-200/20 bottom-0 -left-16 animate-float-slow" aria-hidden="true" />

        <div className="page-container relative">
          <div className="max-w-2xl animate-fade-up">
            <span className="eyebrow mb-5">
              <GraduationCap size={14} aria-hidden="true" />
              Expert-led curriculum
            </span>
            <h1 className="text-ink-900 mb-5 text-balance">
              Structured courses by{' '}
              <span className="text-gradient-warm">real professionals</span>
            </h1>
            <p className="text-xl text-ink-700 leading-relaxed">
              Every course is crafted by a seasoned expert — structured learning paths that
              build genuine mastery, not just exam scores.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="section py-8 lg:py-12">
        <div className="page-container">
          {/* Filters */}
          <div className="card p-6 shadow-card mb-10 animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                icon={<Search size={18} />}
                placeholder="Course title or topic…"
              />
              <Select
                label="Subject"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setPage(1); }}
                options={subjectOptions}
              />
              <Select
                label="Grade"
                value={grade}
                onChange={(e) => { setGrade(e.target.value); setPage(1); }}
                options={gradeOptions}
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" label="Loading courses..." />
            </div>
          )}

          {isError && (
            <div className="card p-8 text-center text-red-700 border-red-200 bg-red-50">
              Could not load courses. Please try again later.
            </div>
          )}

          {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
            <EmptyState
              icon={<BookOpen size={32} />}
              title="No courses found"
              description="Try a different search or clear your filters."
              action={{
                label: 'Clear filters',
                onClick: () => { setQuery(''); setSubject(''); setGrade(''); },
              }}
            />
          )}

          {!isLoading && !isError && (data?.items?.length ?? 0) > 0 && (
            <>
              <p className="text-sm text-ink-700 font-medium mb-6">
                Showing {data!.items.length} of {data!.total} courses
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {data!.items.map((course, idx) => {
                  const subjectInfo = SUBJECTS.find((s) => s.id === course.subjectId);
                  const gradeLabel = GRADES.find((g) => g.id === course.gradeId)?.label;

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="no-underline group"
                    >
                      <article
                        className={clsx(
                          'card card-lift h-full flex flex-col overflow-hidden animate-fade-up',
                        )}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        aria-label={course.title}
                      >
                        {/* Cover image */}
                        <div className="relative h-44 bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center overflow-hidden">
                          {course.coverImageUrl ? (
                            <Image
                              src={course.coverImageUrl}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                              {subjectInfo?.emoji ?? '📚'}
                            </span>
                          )}
                          {/* Price badge overlay */}
                          <div className="absolute top-3 right-3">
                            {course.priceCents > 0 ? (
                              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-teal-700 shadow-soft">
                                {formatPrice(course.priceCents)}
                              </span>
                            ) : (
                              <Badge variant="green" size="sm">Free</Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3 flex-1">
                          <div className="flex flex-wrap gap-1.5">
                            {subjectInfo && (
                              <Badge variant="brand" size="sm">{subjectInfo.label}</Badge>
                            )}
                            {gradeLabel && (
                              <Badge variant="teal" size="sm">{gradeLabel}</Badge>
                            )}
                          </div>

                          <h2 className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                            {course.title}
                          </h2>

                          <p className="text-sm text-ink-700 line-clamp-2 flex-1 leading-relaxed">
                            {course.description}
                          </p>

                          {course.teacher && (
                            <div className="flex items-center gap-2 pt-3 border-t border-surface-200">
                              <Avatar src={course.teacher.avatarUrl} name={course.teacher.name} size="sm" />
                              <span className="text-sm text-ink-700 font-medium">{course.teacher.name}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {course.rating != null ? (
                              <span className="flex items-center gap-1 text-sm font-semibold text-ink-800">
                                <Star size={14} className="text-accent-400 fill-accent-400" aria-hidden="true" />
                                {course.rating.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-ink-700">
                                {course.lessonCount ?? 0} lessons
                              </span>
                            )}
                            <ChevronRight
                              size={16}
                              className="text-brand-400 group-hover:translate-x-0.5 transition-transform"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {data!.total > data!.pageSize && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-3 rounded-full border-2 border-surface-200 font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] transition-all duration-150"
                  >
                    Previous
                  </button>
                  <span className="text-ink-700 text-sm font-medium px-2">
                    Page {page} of {Math.ceil(data!.total / data!.pageSize)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(data!.total / data!.pageSize)}
                    className="px-6 py-3 rounded-full border-2 border-surface-200 font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] transition-all duration-150"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
