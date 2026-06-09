'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  Bot,
  Upload,
  PlusCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Video,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { sessionsApi, coursesApi, paymentsApi } from '@/lib/api';
import { formatPrice } from '@mentora/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PayoutsSection } from '@/components/features/PayoutsSection';

function SessionCard({ session }: { session: import('@/lib/api').ClassSession }) {
  const router = useRouter();
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';
  const startDate = new Date(session.startsAt);
  const isPast = startDate < new Date();

  return (
    <Card padding="md" className="card-lift flex gap-4 items-center">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          isLive ? 'bg-red-50' : 'bg-brand-50'
        }`}
      >
        <Video size={22} className={isLive ? 'text-red-500' : 'text-brand-500'} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 truncate">{session.title}</p>
        <p className="text-sm text-ink-700">
          {startDate.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
          {' · '}{session.durationMinutes} min
        </p>
      </div>
      {isLive ? (
        <Button size="sm" variant="danger" onClick={() => router.push(`/room/${session.id}`)}>
          Join live
        </Button>
      ) : isScheduled && !isPast ? (
        <Badge variant="teal" size="sm">Upcoming</Badge>
      ) : (
        <Badge variant="stone" size="sm">Completed</Badge>
      )}
    </Card>
  );
}

function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['my-sessions', 'upcoming'],
    queryFn: () => sessionsApi.list({ mine: true, upcoming: true }),
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => coursesApi.list(),
  });

  void coursesLoading; // referenced for completeness

  return (
    <div className="space-y-10">
      {/* ── Welcome hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-surface-50 to-accent-50 border border-surface-200 p-8 md:p-10 shadow-soft">
        <span className="blob w-64 h-64 bg-teal-200/30 -top-20 -right-20" aria-hidden="true" />
        <span className="blob w-48 h-48 bg-accent-200/20 bottom-0 left-0" aria-hidden="true" />
        <div className="relative">
          <p className="eyebrow mb-3">Welcome back</p>
          <h1 className="text-ink-900 mb-2 animate-fade-up">
            Hello, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-lg text-ink-700 mb-6">Ready to learn something amazing today?</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/teachers" className="no-underline">
              <Button iconEnd={<ArrowRight size={18} />}>Find a teacher</Button>
            </Link>
            <Link href="/tutor" className="no-underline">
              <Button variant="outline" icon={<Bot size={18} />}>Ask AI tutor</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="eyebrow mb-5">Quick access</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: '/teachers',
              icon: <BookOpen size={28} className="text-brand-500" />,
              label: 'Find a teacher',
              desc: 'Browse 2,400+ mentors',
              bg: 'bg-brand-50',
            },
            {
              href: '/courses',
              icon: <Calendar size={28} className="text-teal-500" />,
              label: 'My courses',
              desc: 'Continue learning',
              bg: 'bg-teal-50',
            },
            {
              href: '/tutor',
              icon: <Bot size={28} className="text-accent-500" />,
              label: 'AI Tutor',
              desc: 'Get instant homework help',
              bg: 'bg-accent-50',
            },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="no-underline group">
              <Card hover padding="md" className="card-lift h-full flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center`}>
                  {a.icon}
                </div>
                <div>
                  <p className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {a.label}
                  </p>
                  <p className="text-sm text-ink-700">{a.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Upcoming sessions ── */}
      <div>
        <h2 className="text-2xl mb-5">Upcoming sessions</h2>
        {sessionsLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-surface-100 rounded-xl animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : Array.isArray(sessions) && sessions.length === 0 ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="No upcoming sessions"
            description="Browse teachers to book your first session."
            action={{ label: 'Find a teacher', href: '/teachers' }}
          />
        ) : (
          <div className="space-y-3">
            {Array.isArray(sessions) && sessions.slice(0, 5).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: sessions } = useQuery({
    queryKey: ['teacher-sessions', 'upcoming'],
    queryFn: () => sessionsApi.list({ mine: true, upcoming: true }),
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => paymentsApi.earnings(),
  });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => coursesApi.list(),
  });

  const myCourses = courses?.items ?? [];
  const upcomingSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="space-y-10">
      {/* ── Welcome hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-700 p-8 md:p-10 text-white shadow-lift">
        <span className="blob w-72 h-72 bg-brand-400/20 -top-20 -right-20" aria-hidden="true" />
        <span className="blob w-48 h-48 bg-teal-400/20 bottom-0 left-0" aria-hidden="true" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white mb-3">
            Teacher dashboard
          </p>
          <h1 className="text-white mb-2 animate-fade-up">
            Good to see you, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-brand-200 text-lg mb-6">
            Your students are ready to learn from you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/teach/upload" className="no-underline">
              <Button variant="secondary" icon={<Upload size={18} />}>Upload material</Button>
            </Link>
            <Link href="/teach/courses/new" className="no-underline">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                icon={<PlusCircle size={18} />}
              >
                New course
              </Button>
            </Link>
            <Link href="/teach/sessions/new" className="no-underline">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                icon={<Calendar size={18} />}
              >
                Schedule session
              </Button>
            </Link>
            <Link href="/teach/research" className="no-underline">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                icon={<Globe size={18} />}
              >
                Research a topic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Earnings snapshot ── */}
      {earnings && (
        <div>
          <p className="eyebrow mb-5"><TrendingUp size={14} /> Earnings overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="md" className="card-lift text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={24} className="text-teal-500" aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-ink-900">
                {formatPrice(earnings.totalPayoutCents)}
              </p>
              <p className="text-sm text-ink-700 mt-1">
                Your earnings (you keep {100 - earnings.commissionPct}%)
              </p>
            </Card>
            <Card padding="md" className="card-lift text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                <Clock size={24} className="text-accent-500" aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-ink-900">
                {formatPrice(earnings.totalGrossCents)}
              </p>
              <p className="text-sm text-ink-700 mt-1">Total billed to students</p>
            </Card>
            <Card padding="md" className="card-lift text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-brand-500" aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-ink-900">{myCourses.length}</p>
              <p className="text-sm text-ink-700 mt-1">Active courses</p>
            </Card>
          </div>
        </div>
      )}

      {/* ── Payout status ── */}
      <Card padding="md">
        <Suspense fallback={<Spinner size="sm" label="Loading payout status…" />}>
          <PayoutsSection compact />
        </Suspense>
      </Card>

      {/* ── Upcoming sessions ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl">Upcoming sessions</h2>
          <Link href="/teach/sessions/new" className="no-underline">
            <Button size="sm" variant="outline" icon={<PlusCircle size={16} />}>Schedule</Button>
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="No sessions scheduled"
            description="Create a group class or 1:1 coaching slot."
            action={{ label: 'Schedule a session', href: '/teach/sessions/new' }}
          />
        ) : (
          <div className="space-y-3">
            {upcomingSessions.slice(0, 5).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>

      {/* ── My courses ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl">My courses</h2>
          <Link href="/teach/courses/new" className="no-underline">
            <Button size="sm" variant="outline" icon={<PlusCircle size={16} />}>New course</Button>
          </Link>
        </div>

        {myCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No courses yet"
            description="Create your first course in minutes."
            action={{ label: 'Create a course', href: '/teach/courses/new' }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.slice(0, 6).map((course) => (
              <Link key={course.id} href={`/teach/courses/${course.id}`} className="no-underline group">
                <Card hover padding="md" className="card-lift h-full">
                  <h3 className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors mb-2 text-xl">
                    {course.title}
                  </h3>
                  <p className="text-sm text-ink-700 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        course.status === 'published'
                          ? 'green'
                          : course.status === 'draft'
                          ? 'amber'
                          : 'stone'
                      }
                      size="sm"
                    >
                      {course.status}
                    </Badge>
                    {course.enrolledCount != null && (
                      <span className="text-sm text-ink-700">{course.enrolledCount} students</span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isTeacher } = useAuth();
  const router = useRouter();

  void user; // used in child components

  // Redirect unauthenticated users after mount (avoids render-time side effects)
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <PageSpinner />;

  return (
    <div className="section">
      <div className="page-container">
        {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
}
