'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BadgeCheck, Briefcase, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SUBJECTS, formatPrice } from '@mentora/shared';

const MAX_TEACHERS = 6;
const SKELETON_COUNT = 3;

/** A single shimmering placeholder card shown while teachers load. */
function TeacherCardSkeleton() {
  return (
    <Card padding="md" className="h-full flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-200 shrink-0" />
        <div className="flex-1 min-w-0 pt-1">
          <div className="h-4 w-2/3 rounded-full bg-surface-200" />
          <div className="mt-2.5 h-3 w-full rounded-full bg-surface-100" />
          <div className="mt-1.5 h-3 w-4/5 rounded-full bg-surface-100" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-surface-100" />
        <div className="h-6 w-24 rounded-full bg-surface-100" />
      </div>
      <div className="mt-auto pt-3 border-t border-surface-100 flex items-center justify-between">
        <div className="h-4 w-16 rounded-full bg-surface-100" />
        <div className="h-4 w-14 rounded-full bg-surface-100" />
      </div>
    </Card>
  );
}

/**
 * Fetches and displays featured teachers from the API.
 * Shown on the landing page; gracefully handles loading, errors and empty data.
 */
export function FeaturedTeachers() {
  const { data: teachers, isLoading, isError } = useQuery({
    queryKey: ['teachers', 'featured'],
    queryFn: () => usersApi.teachers(),
  });

  if (isLoading || isError) {
    // While loading (or if the API hiccups) show calm skeleton cards so the
    // landing page never looks broken to a visitor.
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-label="Loading teachers"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <TeacherCardSkeleton key={i} />
        ))}
        <span className="sr-only">Loading teachers…</span>
      </div>
    );
  }

  if (!teachers?.length) {
    return (
      <EmptyState
        icon={<GraduationCap size={28} aria-hidden="true" />}
        title="Our mentors are getting ready"
        description="New expert teachers join Mentora every week. Browse the full directory to see who's available."
        action={{ label: 'Browse all teachers', href: '/teachers' }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.slice(0, MAX_TEACHERS).map((teacher) => {
        const subjectLabels = (teacher.subjects ?? [])
          .map((sid) => SUBJECTS.find((s) => s.id === sid)?.label ?? sid)
          .slice(0, 2);
        const extraSubjects = (teacher.subjects?.length ?? 0) - subjectLabels.length;

        return (
          <Link
            key={teacher.id}
            href={`/teachers/${teacher.id}`}
            className="no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-2xl"
            aria-label={`View ${teacher.name}'s profile`}
          >
            <Card hover padding="md" className="h-full flex flex-col gap-4 card-lift">
              {/* Identity */}
              <div className="flex items-start gap-4">
                <Avatar src={teacher.avatarUrl} name={teacher.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-ink-900 truncate group-hover:text-brand-600 transition-colors">
                      {teacher.name}
                    </h3>
                    {teacher.verified && (
                      <Badge variant="green" size="sm" className="shrink-0">
                        <BadgeCheck size={12} aria-hidden="true" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {teacher.headline && (
                    <p className="text-sm text-ink-700 mt-0.5 line-clamp-2">
                      {teacher.headline}
                    </p>
                  )}
                </div>
              </div>

              {/* Subjects */}
              {subjectLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subjectLabels.map((label) => (
                    <Badge key={label} variant="brand" size="sm">
                      {label}
                    </Badge>
                  ))}
                  {extraSubjects > 0 && (
                    <Badge variant="stone" size="sm">
                      +{extraSubjects} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Rating + experience */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                {teacher.rating != null ? (
                  <span className="flex items-center gap-1 font-semibold text-ink-800">
                    <Star size={14} className="text-accent-400 fill-accent-400" aria-hidden="true" />
                    {teacher.rating.toFixed(1)}
                    <span className="sr-only">out of 5 stars</span>
                  </span>
                ) : (
                  <span className="text-ink-700/60">New teacher</span>
                )}

                {teacher.yearsExperience != null && teacher.yearsExperience > 0 && (
                  <span className="flex items-center gap-1.5 font-medium text-ink-700">
                    <Briefcase size={14} className="text-teal-600" aria-hidden="true" />
                    {teacher.yearsExperience} yrs experience
                  </span>
                )}
              </div>

              {/* Footer: rate + nudge */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
                {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 ? (
                  <span className="text-sm font-semibold text-teal-600">
                    {formatPrice(teacher.hourlyRateCents)}/hr
                  </span>
                ) : (
                  <span className="text-sm text-ink-700/60">Rates on profile</span>
                )}
                <span className="text-sm font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View profile →
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
