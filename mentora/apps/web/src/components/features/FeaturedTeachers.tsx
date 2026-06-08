'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { SUBJECTS, formatPrice } from '@mentora/shared';

/**
 * Fetches and displays featured teachers from the API.
 * Shown on the landing page; gracefully handles errors and loading.
 */
export function FeaturedTeachers() {
  const { data: teachers, isLoading, isError } = useQuery({
    queryKey: ['teachers', 'featured'],
    queryFn: () => usersApi.teachers(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Loading teachers..." />
      </div>
    );
  }

  if (isError || !teachers?.length) {
    // Graceful degradation — show placeholder cards
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface-100 h-52 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.slice(0, 6).map((teacher) => {
        const subjectLabels = (teacher.subjects ?? [])
          .map((sid) => SUBJECTS.find((s) => s.id === sid)?.label ?? sid)
          .slice(0, 2);

        return (
          <Link key={teacher.id} href={`/teachers/${teacher.id}`} className="no-underline group">
            <Card hover padding="md" className="h-full flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={teacher.avatarUrl}
                  name={teacher.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 truncate group-hover:text-brand-600 transition-colors">
                    {teacher.name}
                  </h3>
                  {teacher.headline && (
                    <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
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
                  {(teacher.subjects?.length ?? 0) > 2 && (
                    <Badge variant="stone" size="sm">
                      +{(teacher.subjects?.length ?? 0) - 2} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Rating + rate */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
                {teacher.rating != null ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-stone-700">
                    <Star size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                    {teacher.rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sm text-stone-400">New teacher</span>
                )}

                {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 && (
                  <span className="text-sm font-semibold text-teal-600">
                    {formatPrice(teacher.hourlyRateCents)}/hr
                  </span>
                )}

                {teacher.verified && (
                  <Badge variant="green" size="sm">Verified</Badge>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
