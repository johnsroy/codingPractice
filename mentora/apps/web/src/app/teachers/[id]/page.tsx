'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, BookOpen, Clock, Users, MessageCircle, ArrowLeft,
  CheckCircle2, Shield, Briefcase, Award, ChevronRight,
} from 'lucide-react';
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
    <div className="relative">
      {/* ── Profile hero ── */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
        <div className="grid-dots absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />
        <div className="blob w-[400px] h-[400px] bg-brand-200/20 -top-20 -right-20 animate-float" aria-hidden="true" />

        <div className="page-container relative">
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-600 no-underline mb-8 font-medium transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            All teachers
          </Link>

          {/* Hero card */}
          <div className="card p-8 shadow-lift animate-fade-up overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-gradient" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row gap-8 mt-2">
              {/* Avatar */}
              <div className="relative shrink-0 self-start">
                <Avatar src={teacher.avatarUrl} name={teacher.name} size="xl" />
                {teacher.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-500 border-3 border-white flex items-center justify-center shadow-soft">
                    <Shield size={14} className="text-white" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h1 className="text-ink-900">{teacher.name}</h1>
                  {teacher.verified && (
                    <Badge variant="green" size="md" className="mt-1">
                      <CheckCircle2 size={13} aria-hidden="true" /> Verified
                    </Badge>
                  )}
                  {teacher.proTier && (
                    <Badge variant="brand" size="md" className="mt-1">
                      <Award size={13} aria-hidden="true" /> Mentor Pro
                    </Badge>
                  )}
                </div>

                {teacher.headline && (
                  <p className="text-xl text-ink-700 mb-5 leading-relaxed">{teacher.headline}</p>
                )}

                <div className="flex flex-wrap gap-6 text-sm text-ink-700">
                  {teacher.rating != null && (
                    <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                      <Star size={16} className="text-accent-400 fill-accent-400" aria-hidden="true" />
                      {teacher.rating.toFixed(1)} rating
                    </span>
                  )}
                  {teacher.yearsExperience != null && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={16} className="text-teal-500" aria-hidden="true" />
                      {teacher.yearsExperience} years experience
                    </span>
                  )}
                  {teacherCourses.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={16} className="text-brand-400" aria-hidden="true" />
                      {teacherCourses.length} course{teacherCourses.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {teacher.bio && (
              <div className="mt-7 pt-7 border-t border-surface-200">
                <h2 className="text-xl font-semibold text-ink-800 mb-3">About</h2>
                <p className="text-ink-700 whitespace-pre-wrap leading-relaxed">{teacher.bio}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section py-8 lg:py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subjects & Grades */}
              {(subjectLabels.length > 0 || gradeLabels.length > 0) && (
                <div className="card p-6 shadow-card animate-fade-up delay-75">
                  <h2 className="text-xl font-semibold text-ink-800 mb-5">Subjects &amp; Grade levels</h2>
                  <div className="space-y-5">
                    {subjectLabels.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink-700 mb-2.5 uppercase tracking-wide">Subjects</p>
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
                        <p className="text-sm font-semibold text-ink-700 mb-2.5 uppercase tracking-wide">Grade levels</p>
                        <div className="flex flex-wrap gap-2">
                          {gradeLabels.map((g) => (
                            <Badge key={g} variant="teal" size="md">{g}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Courses */}
              {teacherCourses.length > 0 && (
                <div className="animate-fade-up delay-150">
                  <h2 className="text-2xl font-semibold text-ink-900 mb-5">
                    Courses by {teacher.name}
                  </h2>
                  <div className="space-y-3">
                    {teacherCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="no-underline group"
                      >
                        <div className="card card-lift p-5 flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                            <BookOpen size={22} className="text-brand-500" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-ink-700 line-clamp-1 mt-0.5">
                              {course.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {course.priceCents > 0 ? (
                              <span className="font-bold text-teal-600">
                                {formatPrice(course.priceCents)}
                              </span>
                            ) : (
                              <Badge variant="green" size="sm">Free</Badge>
                            )}
                            <ChevronRight size={16} className="text-brand-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking sidebar */}
            <div className="space-y-6">
              {/* 1:1 rate card */}
              <div className="card p-6 shadow-lift bg-gradient-to-br from-brand-50 to-teal-50 border-brand-100 animate-fade-up delay-75 sticky top-24">
                <h2 className="text-xl font-bold text-ink-900 mb-5">Book a session</h2>

                {teacher.hourlyRateCents != null && teacher.hourlyRateCents > 0 && (
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-brand-600">
                      {formatPrice(teacher.hourlyRateCents)}
                    </span>
                    <span className="text-ink-700 ml-1.5">/ hour</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    fullWidth
                    size="lg"
                    className="btn-sheen"
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
                    icon={<MessageCircle size={18} aria-hidden="true" />}
                    onClick={() => {
                      if (!isAuthenticated) router.push('/login');
                    }}
                  >
                    Send message
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-5 pt-5 border-t border-brand-100 space-y-2">
                  {[
                    { icon: Shield, text: 'Identity verified' },
                    { icon: Star, text: 'Top-rated mentor' },
                    { icon: Clock, text: 'Flexible scheduling' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-ink-700">
                      <Icon size={14} className="text-teal-500 shrink-0" aria-hidden="true" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming sessions */}
              {upcomingSessions.length > 0 && (
                <div className="card p-5 shadow-card animate-fade-up delay-150">
                  <h3 className="font-bold text-ink-800 mb-4 flex items-center gap-2 text-lg">
                    <Users size={18} className="text-teal-500" aria-hidden="true" />
                    Upcoming group sessions
                  </h3>
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <div key={s.id} className="border border-surface-200 rounded-2xl p-4 bg-surface-50">
                        <p className="font-semibold text-ink-800 text-sm">{s.title}</p>
                        <p className="text-xs text-ink-700 mt-1">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
