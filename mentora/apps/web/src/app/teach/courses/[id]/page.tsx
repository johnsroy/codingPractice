'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Send, BookOpen, FileText, GripVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SUBJECTS, GRADES } from '@mentora/shared';
import { coursesApi, lessonsApi, materialsApi, ApiError } from '@/lib/api';
import type { CreateLessonInput } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

export default function ManageCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isTeacher } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.byId(id),
    enabled: !!id,
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => coursesApi.lessons(id),
    enabled: !!id,
  });

  const { data: materials } = useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialsApi.list(id),
    enabled: !!id,
  });

  const addLessonMutation = useMutation({
    mutationFn: (data: CreateLessonInput) => lessonsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', id] });
      setAddLessonOpen(false);
      setLessonTitle('');
      setLessonSummary('');
      success('Lesson added!');
    },
    onError: () => toastError('Could not add lesson. Please try again.'),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/teach/courses/' + id);
    if (!authLoading && isAuthenticated && !isTeacher) router.push('/dashboard');
  }, [authLoading, isAuthenticated, isTeacher, router, id]);

  if (authLoading || courseLoading || !isAuthenticated || !isTeacher) return <PageSpinner />;

  if (!course) {
    return (
      <div className="section page-container">
        <EmptyState title="Course not found" action={{ label: 'My courses', href: '/dashboard' }} />
      </div>
    );
  }

  const subjectLabel = SUBJECTS.find((s) => s.id === course.subjectId)?.label;
  const gradeLabel = GRADES.find((g) => g.id === course.gradeId)?.label;

  async function handlePublish() {
    setPublishLoading(true);
    try {
      await coursesApi.publish(id);
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      success('Course is now live!');
    } catch {
      toastError('Could not publish. Please try again.');
    } finally {
      setPublishLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="page-container">
        {/* ── Back link ── */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-600 no-underline mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        {/* ── Course header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-teal-50 border border-surface-200 p-8 mb-10 shadow-soft">
          <span className="blob w-48 h-48 bg-brand-200/30 -top-12 -right-12" aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {subjectLabel && <Badge variant="brand">{subjectLabel}</Badge>}
                {gradeLabel && <Badge variant="teal">{gradeLabel}</Badge>}
                <Badge
                  variant={
                    course.status === 'published'
                      ? 'green'
                      : course.status === 'draft'
                      ? 'amber'
                      : 'stone'
                  }
                >
                  {course.status}
                </Badge>
              </div>
              <h1 className="text-ink-900">{course.title}</h1>
              <p className="text-ink-700 mt-2">{course.description}</p>
            </div>

            <div className="flex gap-3 shrink-0">
              {course.status === 'draft' && (
                <Button onClick={handlePublish} loading={publishLoading} icon={<Send size={18} />}>
                  Publish course
                </Button>
              )}
              {course.status === 'published' && (
                <Link href={`/courses/${id}`} className="no-underline">
                  <Button variant="outline">View live</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Lessons column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl">Lessons ({lessons?.length ?? 0})</h2>
              <Button
                size="sm"
                icon={<PlusCircle size={16} />}
                onClick={() => setAddLessonOpen(true)}
              >
                Add lesson
              </Button>
            </div>

            {(lessons?.length ?? 0) === 0 ? (
              <EmptyState
                icon={<BookOpen size={28} />}
                title="No lessons yet"
                description="Add your first lesson to get started."
                action={{ label: 'Add a lesson', onClick: () => setAddLessonOpen(true) }}
              />
            ) : (
              <div className="space-y-3">
                {lessons!.map((lesson, idx) => (
                  <Card key={lesson.id} padding="md" className="card-lift flex items-center gap-4">
                    <GripVertical
                      size={20}
                      className="text-stone-300 cursor-grab shrink-0"
                      aria-hidden="true"
                    />
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 font-bold text-brand-500 text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900">{lesson.title}</p>
                      {lesson.summary && (
                        <p className="text-sm text-ink-700 mt-0.5 line-clamp-1">{lesson.summary}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Materials column */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl">Materials</h2>
              <Link href="/teach/upload" className="no-underline">
                <Button size="sm" variant="outline" icon={<PlusCircle size={16} />}>
                  Upload
                </Button>
              </Link>
            </div>

            {(materials?.length ?? 0) === 0 ? (
              <EmptyState
                icon={<FileText size={24} />}
                title="No materials"
                description="Upload PDFs, slides or videos."
                action={{ label: 'Upload', href: '/teach/upload' }}
              />
            ) : (
              <div className="space-y-3">
                {materials!.map((m) => (
                  <Card key={m.id} padding="sm" className="flex items-center gap-3">
                    <FileText size={18} className="text-brand-400 shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{m.title}</p>
                      <Badge
                        variant={
                          m.ocrStatus === 'done'
                            ? 'teal'
                            : m.ocrStatus === 'processing'
                            ? 'amber'
                            : 'stone'
                        }
                        size="sm"
                      >
                        {m.ocrStatus}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add lesson modal ── */}
      <Modal open={addLessonOpen} onClose={() => setAddLessonOpen(false)} title="Add a lesson">
        <div className="space-y-4">
          <Input
            label="Lesson title"
            required
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Introduction to fractions"
          />
          <Textarea
            label="Summary (optional)"
            value={lessonSummary}
            onChange={(e) => setLessonSummary(e.target.value)}
            placeholder="What will students learn in this lesson?"
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button
              loading={addLessonMutation.isPending}
              onClick={() => {
                if (!lessonTitle.trim()) return;
                addLessonMutation.mutate({
                  courseId: id,
                  title: lessonTitle.trim(),
                  order: lessons?.length ?? 0,
                  summary: lessonSummary || undefined,
                });
              }}
            >
              Add lesson
            </Button>
            <Button variant="ghost" onClick={() => setAddLessonOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
