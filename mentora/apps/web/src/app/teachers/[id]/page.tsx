'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, BookOpen, Clock, Users, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';
import { usersApi, coursesApi, sessionsApi } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => usersApi.byId(id),
    enabled: !!id,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses', { teacherId: id }],
    queryFn: () => coursesApi.list(),
    enabled: !!id,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', { teacherId: id, upcoming: true }],
    queryFn: () => sessionsApi.list({ upcoming: true }),
    enabled: !!id,
  });

  if (teacherLoading) return <PageSpinner />;

  if (!teacher) {
    return (
      <div className="section">
        <div className="page-container">
          <EmptyState
            title="Teacher not found"
            description="This profile doesn't exist or has been removed."
            action={{ label: 'Back to teachers', href: '/teachers' }}
          />
        </div>
      </div>
    );
  }

  const subjectLabels = (teacher.subjects ?? []).map(
    (sid) => SUBJECTS.find((s) => s.id === sid) ?? { id: sid, label: sid, emoji: '📚' },
  );
  const gradeLabels = (teacher.grades ?? []).map(
    (gid) => GRADES.find((g) => g.id === gid)?.label ?? gid,
  );

  // Filter courses by this teacher
  const teacherCourses = coursesData?.items?.filter(
    (c) => c.teacherId === id && c.status === 'published',
  ) ?? [];

  const upcomingSessions = (sessions ?? []).filter(
    (s) => s.teacherId === id && s.status === 'scheduled',
  ).slice(0, 3);

  async function handleBookSession(sessionId: string) {
    if (!isAuthenticated) { router.push('/login?redirect=/teachers/' + id); return; }
    setBookingLoading(sessionId);
    try {
      await sessionsApi.book(sessionId);
      success('Session booked! Check your dashboard.');
    } catch {
      toastError('Could not book this session. Please try again.');
    } finally {
      setBookingLoading(null);
    }
  }

  return (
    <div className="section">
      <div className="page-container">
        {/* Back */}
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-600 no-underline mb-8 font-medium"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          All teachers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Profile */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero card */}
            <Card padding="lg">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar src={teacher.avatarUrl} name={teacher.name} size="xl" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-stone-900">{teacher.name}</h1>
                    {teacher.verified && (
                      <Badge variant="green" size="md" className="mt-1">
                        <CheckCircle2 size={14} /> Verified
                      </Badge>
                    )}
                    {teacher.proTier && (
                      <Badge variant="brand" size="md" className="mt-1">
                        Mentor Pro
                      </Badge>
                    )}
                  </div>

                  {teacher.headline && (
                    <p className="text-lg text-stone-600 mb-4">{teacher.headline}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                    {teacher.rating != null && (
                      <span className="flex items-center gap-1 font-semibold text-stone-700">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        {teacher.rating.toFixed(1)} rating
                      </span>
                    )}
                    {teacher.yearsExperience != null && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {teacher.yearsExperience} years experience
                      </span>
                    )}
                    {teacherCourses.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {teacherCourses.length} course{teacherCourses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {teacher.bio && (
                <div className="mt-6 pt-6 border-t border-surface-100">
                  <h2 className="text-lg font-semibold text-stone-800 mb-3">About</h2>
                  <p className="text-stone-600 whitespace-pre-wrap leading-relaxed">{teacher.bio}</p>
                </div>
              )}
            </Card>

            {/* Subjects & Grades */}
            {(subjectLabels.length > 0 || gradeLabels.length > 0) && (
              <Card padding="md">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Subjects & Grade levels</h2>
                <div className="space-y-4">
                  {subjectLabels.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-stone-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {subjectLabels.map((s) => (
                          <Badge key={s.id} variant="brand" size="md">
                            {s.emoji} {s.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {gradeLabels.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-stone-500 mb-2">Grade levels</p>
                      <div className="flex flex-wrap gap-2">
                        {gradeLabels.map((g) => (
                          <Badge key={g} variant="teal" size="md">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Courses */}
            {teacherCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-5">Courses by {teacher.name}</h2>
                <div className="space-y-4">
                  {teacherCourses.map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`} className="no-underline group">
                      <Card hover padding="md" className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                          <BookOpen size={24} className="text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-stone-500 line-clamp-1 mt-0.5">
                            {course.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {course.priceCents > 0 ? (
                            <span className="font-bold text-teal-600">
                              {formatPrice(course.priceCents)}
                            </span>
                          ) : (
                            <Badge variant="green" size="sm">Free</Badge>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking sidebar */}
          <div className="space-y-6">
            {/* 1:1 rate card */}
            <Card padding="lg" className="bg-gradient-to-br from-brand-50 to-teal-50 border-brand-100">
              <h2 className="text-xl font-bold text-stone-900 mb-4">Book a session</h2>

              {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 && (
                <div className="mb-5">
                  <span className="text-4xl font-bold text-brand-600">
                    {formatPrice(teacher.hourlyRateCents)}
                  </span>
                  <span className="text-stone-500 ml-1">/ hour</span>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) router.push('/login?redirect=/teachers/' + id);
                  else router.push('/teach/sessions/new?teacher=' + id);
                }}
              >
                Book 1:1 coaching
              </Button>

              <Button
                fullWidth
                size="lg"
                variant="outline"
                className="mt-3"
                icon={<MessageCircle size={18} />}
                onClick={() => {
                  if (!isAuthenticated) router.push('/login');
                }}
              >
                Send message
              </Button>
            </Card>

            {/* Upcoming sessions */}
            {upcomingSessions.length > 0 && (
              <Card padding="md">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-teal-500" />
                  Upcoming group sessions
                </h3>
                <div className="space-y-3">
                  {upcomingSessions.map((s) => (
                    <div key={s.id} className="border border-surface-200 rounded-xl p-4">
                      <p className="font-semibold text-stone-800 text-sm">{s.title}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(s.startsAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}{s.durationMinutes} min
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        fullWidth
                        className="mt-3"
                        loading={bookingLoading === s.id}
                        onClick={() => handleBookSession(s.id)}
                      >
                        {s.priceCents > 0 ? `Join — ${formatPrice(s.priceCents)}` : 'Join free'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
