'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Star, Shield, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { usersApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

export default function TeachersPage() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  const { data: teachers, isLoading, isError } = useQuery({
    queryKey: ['teachers', { query, subject, grade }],
    queryFn: () =>
      usersApi.teachers({
        q: query || undefined,
        subject: subject || undefined,
        grade: grade || undefined,
      }),
  });

  const subjectOptions = [
    { value: '', label: 'All subjects' },
    ...SUBJECTS.map((s) => ({ value: s.id, label: s.label })),
  ];

  const gradeOptions = [
    { value: '', label: 'All grades' },
    ...GRADES.map((g) => ({ value: g.id, label: g.label })),
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero section ── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
        <div className="grid-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="blob w-[500px] h-[500px] bg-brand-200/25 -top-40 -right-40 animate-float" aria-hidden="true" />
        <div className="blob w-[400px] h-[400px] bg-teal-200/20 -bottom-20 -left-20 animate-float-slow" aria-hidden="true" />

        <div className="page-container relative">
          <div className="max-w-2xl animate-fade-up">
            <span className="eyebrow mb-5">
              <Shield size={14} aria-hidden="true" />
              Vetted professionals only
            </span>
            <h1 className="text-ink-900 mb-5 text-balance">
              Learn from those who&apos;ve{' '}
              <span className="text-gradient">lived it</span>
            </h1>
            <p className="text-xl text-ink-700 leading-relaxed mb-8 max-w-xl">
              Every teacher on Mentora is a retired or seasoned professional — doctors, engineers,
              lawyers, scientists — bringing decades of real-world expertise to your child&apos;s education.
            </p>
            {/* Quick stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { icon: Users, value: '500+', label: 'Expert mentors' },
                { icon: Star, value: '4.9', label: 'Avg. rating' },
                { icon: Briefcase, value: '20+ yrs', label: 'Avg. experience' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                    <Icon size={18} className="text-brand-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-ink-900 leading-tight">{value}</p>
                    <p className="text-sm text-ink-700">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="section py-8 lg:py-12">
        <div className="page-container">
          <div className="card p-6 shadow-card mb-10 animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<Search size={18} />}
                placeholder="Name, subject, expertise…"
                aria-label="Search teachers"
              />
              <Select
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                options={subjectOptions}
                aria-label="Filter by subject"
              />
              <Select
                label="Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                options={gradeOptions}
                aria-label="Filter by grade"
              />
            </div>
          </div>

          {/* ── Results ── */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" label="Loading teachers..." />
            </div>
          )}

          {isError && (
            <div className="card p-8 text-center text-red-700 border-red-200 bg-red-50">
              Could not load teachers. Please try again later.
            </div>
          )}

          {!isLoading && !isError && teachers?.length === 0 && (
            <EmptyState
              icon={<Search size={32} />}
              title="No teachers found"
              description="Try a different search or clear your filters."
              action={{
                label: 'Clear filters',
                onClick: () => { setQuery(''); setSubject(''); setGrade(''); },
              }}
            />
          )}

          {!isLoading && !isError && (teachers?.length ?? 0) > 0 && (
            <>
              <p className="text-sm text-ink-700 mb-6 font-medium">
                Showing {teachers!.length} teacher{teachers!.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers!.map((teacher, idx) => {
                  const subjectLabels = (teacher.subjects ?? [])
                    .map((sid) => SUBJECTS.find((s) => s.id === sid)?.label ?? sid)
                    .slice(0, 3);

                  return (
                    <Link
                      key={teacher.id}
                      href={`/teachers/${teacher.id}`}
                      className="no-underline group"
                    >
                      <article
                        className={clsx(
                          'card card-lift h-full flex flex-col gap-0 overflow-hidden',
                          'animate-fade-up',
                        )}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        aria-label={teacher.name}
                      >
                        {/* Top accent strip */}
                        <div className="h-1.5 w-full bg-brand-gradient" aria-hidden="true" />

                        <div className="p-6 flex flex-col gap-4 flex-1">
                          {/* Avatar + name row */}
                          <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                              <Avatar src={teacher.avatarUrl} name={teacher.name} size="lg" />
                              {teacher.verified && (
                                <div
                                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center"
                                  title="Verified teacher"
                                >
                                  <Shield size={10} className="text-white" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-lg font-bold text-ink-900 truncate group-hover:text-brand-600 transition-colors">
                                {teacher.name}
                              </h2>
                              {teacher.headline && (
                                <p className="text-sm text-ink-700 mt-0.5 line-clamp-2 leading-snug">
                                  {teacher.headline}
                                </p>
                              )}
                              {teacher.yearsExperience != null && (
                                <p className="text-xs text-ink-700 mt-1.5 flex items-center gap-1">
                                  <Briefcase size={11} className="text-teal-500" aria-hidden="true" />
                                  {teacher.yearsExperience} yrs experience
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Subjects */}
                          {subjectLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {subjectLabels.map((label) => (
                                <Badge key={label} variant="brand" size="sm">{label}</Badge>
                              ))}
                              {(teacher.subjects?.length ?? 0) > 3 && (
                                <Badge variant="stone" size="sm">
                                  +{(teacher.subjects?.length ?? 0) - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Footer row */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-200">
                            <div className="flex items-center gap-3">
                              {teacher.rating != null ? (
                                <span className="flex items-center gap-1 text-sm font-semibold text-ink-800">
                                  <Star size={14} className="text-accent-400 fill-accent-400" aria-hidden="true" />
                                  {teacher.rating.toFixed(1)}
                                </span>
                              ) : (
                                <Badge variant="teal" size="sm">New</Badge>
                              )}
                              {teacher.verified && (
                                <Badge variant="green" size="sm">Verified</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 && (
                                <span className="text-sm font-bold text-teal-600">
                                  {formatPrice(teacher.hourlyRateCents)}/hr
                                </span>
                              )}
                              <ChevronRight
                                size={16}
                                className="text-brand-400 group-hover:translate-x-0.5 transition-transform"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
