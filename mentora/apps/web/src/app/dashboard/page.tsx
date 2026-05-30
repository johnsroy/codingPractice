'use client';

import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { sessionsApi, coursesApi, paymentsApi } from '@/lib/api';
import { formatPrice } from '@mentora/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

function SessionCard({ session }: { session: import('@/lib/api').ClassSession }) {
  const router = useRouter();
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';
  const startDate = new Date(session.startsAt);
  const isPast = startDate < new Date();

  return (
    <Card padding="md" className="flex gap-4 items-center">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        isLive ? 'bg-red-50' : 'bg-brand-50'
      }`}>
        <Video size={22} className={isLive ? 'text-red-500' : 'text-brand-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-stone-900 truncate">{session.title}</p>
        <p className="text-sm text-stone-500">
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

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="hero-gradient rounded-3xl p-8 md:p-10">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-lg text-stone-600 mb-6">Ready to learn something amazing today?</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/teachers" className="no-underline">
            <Button iconEnd={<ArrowRight size={18} />}>Find a teacher</Button>
          </Link>
          <Link href="/tutor" className="no-underline">
            <Button variant="outline" icon={<Bot size={18} />}>Ask AI tutor</Button>
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/teachers', icon: <BookOpen size={28} className="text-brand-500" />, label: 'Find a teacher', desc: 'Browse 2,400+ mentors' },
          { href: '/courses', icon: <Calendar size={28} className="text-teal-500" />, label: 'My courses', desc: 'Continue learning' },
          { href: '/tutor', icon: <Bot size={28} className="text-accent-500" />, label: 'AI Tutor', desc: 'Get instant homework help' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="no-underline group">
            <Card hover padding="md" className="h-full flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-50 flex items-center justify-center">
                {a.icon}
              </div>
              <div>
                <p className="font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                  {a.label}
                </p>
                <p className="text-sm text-stone-500">{a.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 mb-5">Upcoming sessions</h2>
        {sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-surface-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (sessions?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="No upcoming sessions"
            description="Browse teachers to book your first session."
            action={{ label: 'Find a teacher', href: '/teachers' }}
          />
        ) : (
          <div className="space-y-3">
            {sessions!.slice(0, 5).map((s) => (
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
      {/* Welcome */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-3xl p-8 md:p-10 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Good to see you, {user?.name?.split(' ')[0]} 🎓
        </h1>
        <p className="text-brand-200 text-lg mb-6">
          Your students are ready to learn from you.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/teach/upload" className="no-underline">
            <Button variant="secondary" icon={<Upload size={18} />}>Upload material</Button>
          </Link>
          <Link href="/teach/courses/new" className="no-underline">
            <Button variant="outline" className="border-white text-white hover:bg-white/10" icon={<PlusCircle size={18} />}>
              New course
            </Button>
          </Link>
          <Link href="/teach/sessions/new" className="no-underline">
            <Button variant="ghost" className="text-white hover:bg-white/10" icon={<Calendar size={18} />}>
              Schedule session
            </Button>
          </Link>
        </div>
      </div>

      {/* Earnings snapshot */}
      {earnings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md" className="text-center">
            <TrendingUp size={24} className="text-teal-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-stone-900">
              {formatPrice(earnings.totalPayoutCents)}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              Your earnings (you keep {100 - earnings.commissionPct}%)
            </p>
          </Card>
          <Card padding="md" className="text-center">
            <Clock size={24} className="text-accent-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-stone-900">
              {formatPrice(earnings.totalGrossCents)}
            </p>
            <p className="text-sm text-stone-500 mt-1">Total billed to students</p>
          </Card>
          <Card padding="md" className="text-center">
            <BookOpen size={24} className="text-brand-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-stone-900">{myCourses.length}</p>
            <p className="text-sm text-stone-500 mt-1">Active courses</p>
          </Card>
        </div>
      )}

      {/* Upcoming sessions */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-stone-900">Upcoming sessions</h2>
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

      {/* My courses */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-stone-900">My courses</h2>
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
                <Card hover padding="md" className="h-full">
                  <h3 className="font-bold text-stone-900 group-hover:text-brand-600 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={course.status === 'published' ? 'green' : course.status === 'draft' ? 'amber' : 'stone'}
                      size="sm"
                    >
                      {course.status}
                    </Badge>
                    {course.enrolledCount != null && (
                      <span className="text-sm text-stone-500">{course.enrolledCount} students</span>
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
