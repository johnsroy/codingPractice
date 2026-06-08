'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { coursesApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import Image from 'next/image';

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
    <div className="section">
      <div className="page-container">
        <div className="mb-10">
          <h1 className="text-stone-900 mb-3">Browse courses</h1>
          <p className="text-xl text-stone-500">
            Structured learning paths taught by experienced professionals.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-soft p-6 mb-10">
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
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading courses..." />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
            Could not load courses. Please try again later.
          </div>
        )}

        {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No courses found"
            description="Try a different search or clear your filters."
            action={{ label: 'Clear filters', onClick: () => { setQuery(''); setSubject(''); setGrade(''); } }}
          />
        )}

        {!isLoading && !isError && (data?.items?.length ?? 0) > 0 && (
          <>
            <p className="text-sm text-stone-500 mb-6">
              Showing {data!.items.length} of {data!.total} courses
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {data!.items.map((course) => {
                const subjectInfo = SUBJECTS.find((s) => s.id === course.subjectId);
                const gradeLabel = GRADES.find((g) => g.id === course.gradeId)?.label;

                return (
                  <Link key={course.id} href={`/courses/${course.id}`} className="no-underline group">
                    <Card hover padding="none" className="h-full flex flex-col overflow-hidden">
                      {/* Cover image or placeholder */}
                      <div className="relative h-44 bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center">
                        {course.coverImageUrl ? (
                          <Image
                            src={course.coverImageUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-5xl" aria-hidden="true">
                            {subjectInfo?.emoji ?? '📚'}
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex flex-wrap gap-2">
                          {subjectInfo && (
                            <Badge variant="brand" size="sm">
                              {subjectInfo.label}
                            </Badge>
                          )}
                          {gradeLabel && (
                            <Badge variant="teal" size="sm">{gradeLabel}</Badge>
                          )}
                        </div>

                        <h2 className="font-bold text-stone-900 group-hover:text-brand-600 transition-colors leading-snug">
                          {course.title}
                        </h2>

                        <p className="text-sm text-stone-500 line-clamp-2 flex-1">
                          {course.description}
                        </p>

                        {course.teacher && (
                          <div className="flex items-center gap-2 pt-2 border-t border-surface-100">
                            <Avatar src={course.teacher.avatarUrl} name={course.teacher.name} size="sm" />
                            <span className="text-sm text-stone-600">{course.teacher.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          {course.rating != null ? (
                            <span className="flex items-center gap-1 text-sm font-semibold text-stone-700">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              {course.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-sm text-stone-400">
                              {course.lessonCount ?? 0} lessons
                            </span>
                          )}

                          {course.priceCents > 0 ? (
                            <span className="font-bold text-teal-600">
                              {formatPrice(course.priceCents)}
                            </span>
                          ) : (
                            <Badge variant="green" size="sm">Free</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {data!.total > data!.pageSize && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 rounded-xl border-2 border-surface-200 font-semibold text-stone-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] transition-colors"
                >
                  Previous
                </button>
                <span className="flex items-center text-stone-500 text-sm">
                  Page {page} of {Math.ceil(data!.total / data!.pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data!.total / data!.pageSize)}
                  className="px-6 py-3 rounded-xl border-2 border-surface-200 font-semibold text-stone-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
