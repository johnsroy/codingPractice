'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Star, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { usersApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

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
    <div className="section">
      <div className="page-container">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-stone-900 mb-3">Find your perfect teacher</h1>
          <p className="text-xl text-stone-500">
            Browse retired professionals who bring decades of real-world expertise to every lesson.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-soft p-6 mb-10">
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

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading teachers..." />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
            Could not load teachers. Please try again later.
          </div>
        )}

        {!isLoading && !isError && teachers?.length === 0 && (
          <EmptyState
            icon={<Search size={32} />}
            title="No teachers found"
            description="Try a different search or clear your filters."
            action={{ label: 'Clear filters', onClick: () => { setQuery(''); setSubject(''); setGrade(''); } }}
          />
        )}

        {!isLoading && !isError && (teachers?.length ?? 0) > 0 && (
          <>
            <p className="text-sm text-stone-500 mb-6">
              Showing {teachers!.length} teacher{teachers!.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers!.map((teacher) => {
                const subjectLabels = (teacher.subjects ?? [])
                  .map((sid) => SUBJECTS.find((s) => s.id === sid)?.label ?? sid)
                  .slice(0, 3);

                return (
                  <Link key={teacher.id} href={`/teachers/${teacher.id}`} className="no-underline group">
                    <Card hover padding="md" className="h-full flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar src={teacher.avatarUrl} name={teacher.name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-stone-900 truncate group-hover:text-brand-600 transition-colors">
                            {teacher.name}
                          </h2>
                          {teacher.headline && (
                            <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
                              {teacher.headline}
                            </p>
                          )}
                          {teacher.yearsExperience != null && (
                            <p className="text-xs text-stone-400 mt-1">
                              {teacher.yearsExperience} years experience
                            </p>
                          )}
                        </div>
                      </div>

                      {subjectLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
                        {teacher.rating != null ? (
                          <span className="flex items-center gap-1 text-sm font-semibold text-stone-700">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            {teacher.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-stone-400">New</span>
                        )}

                        <div className="flex items-center gap-2">
                          {teacher.verified && (
                            <Badge variant="green" size="sm">Verified</Badge>
                          )}
                          {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 && (
                            <span className="text-sm font-semibold text-teal-600">
                              {formatPrice(teacher.hourlyRateCents)}/hr
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
