'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SUBJECTS, GRADES } from '@mentora/shared';
import { coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';

export default function NewCoursePage() {
  const { isAuthenticated, isLoading, isTeacher } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [priceInput, setPriceInput] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/teach/courses/new');
    if (!isLoading && isAuthenticated && !isTeacher) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isTeacher, router]);

  if (isLoading || !isAuthenticated || !isTeacher) return <PageSpinner />;

  const subjectOptions = SUBJECTS.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }));
  const gradeOptions = GRADES.map((g) => ({ value: g.id, label: g.label }));

  function validate() {
    const e: Record<string, string> = {};
    if (!title || title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    if (!description || description.trim().length < 10) e.description = 'Description must be at least 10 characters.';
    if (!subjectId) e.subjectId = 'Please choose a subject.';
    if (!gradeId) e.gradeId = 'Please choose a grade level.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const course = await coursesApi.create({
        title: title.trim(),
        description: description.trim(),
        subjectId,
        gradeId,
        priceCents,
      });
      success('Course created! Add lessons and materials.');
      router.push(`/teach/courses/${course.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toastError(err.message);
      } else {
        toastError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <div className="page-container max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <BookOpen size={26} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-stone-900">Create a new course</h1>
            <p className="text-stone-500">Share your knowledge with students worldwide.</p>
          </div>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              label="Course title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="e.g. Introduction to Algebra for Grade 7"
            />

            <Textarea
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Tell students what they'll learn and why it matters…"
              rows={5}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Subject"
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={subjectOptions}
                placeholder="Choose a subject"
                error={errors.subjectId}
              />
              <Select
                label="Grade level"
                required
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                options={gradeOptions}
                placeholder="Choose a grade"
                error={errors.gradeId}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Price per student (USD)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-stone-500">$</span>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value);
                    const dollars = parseFloat(e.target.value) || 0;
                    setPriceCents(Math.round(dollars * 100));
                  }}
                  className="w-32 bg-white border-2 border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 min-h-[48px]"
                />
                {priceCents === 0 && (
                  <span className="text-sm text-teal-600 font-semibold">Free (recommended to start)</span>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" size="lg" loading={submitting} iconEnd={<ArrowRight size={20} />}>
                Create course
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
