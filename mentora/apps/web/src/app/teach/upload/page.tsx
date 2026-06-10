'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { materialsApi } from '@/lib/api';
import type { Material, StudyKit } from '@/lib/api';
import type { OcrStatus } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { StudyKitView } from '@/components/features/StudyKitView';

const ACCEPTED = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mp3,.txt';
const MAX_SIZE_MB = 50;

interface UploadedFile {
  id: string;
  name: string;
  material?: Material;
  ocrStatus?: OcrStatus;
  extractedText?: string | null;
  aiSummary?: string | null;
  studyKit?: StudyKit | null;
  studyKitLoading?: boolean;
  polling?: boolean;
  error?: string;
}

function OcrStatusBadge({ status }: { status?: OcrStatus }) {
  if (!status || status === 'skipped') return null;
  const configs: Record<
    OcrStatus,
    { label: string; variant: 'amber' | 'teal' | 'brand' | 'red' | 'stone' }
  > = {
    pending: { label: 'Queued', variant: 'stone' },
    processing: { label: 'Processing…', variant: 'amber' },
    done: { label: 'Text extracted', variant: 'teal' },
    failed: { label: 'Extraction failed', variant: 'red' },
    skipped: { label: 'Skipped', variant: 'stone' },
  };
  const c = configs[status];
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
}

export default function UploadMaterialPage() {
  const { isAuthenticated, isLoading, isTeacher } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard — redirect after mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/teach/upload');
    if (!isLoading && isAuthenticated && !isTeacher) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isTeacher, router]);

  // Poll OCR status for pending/processing uploads
  useEffect(() => {
    const pending = files.filter(
      (f) => f.material && (f.ocrStatus === 'pending' || f.ocrStatus === 'processing'),
    );
    if (pending.length === 0) return;

    const interval = setInterval(async () => {
      for (const f of pending) {
        try {
          const status = await materialsApi.ocrStatus(f.material!.id);
          setFiles((prev) =>
            prev.map((pf) =>
              pf.id === f.id
                ? {
                    ...pf,
                    ocrStatus: status.ocrStatus,
                    extractedText: status.extractedText,
                    aiSummary: status.aiSummary,
                  }
                : pf,
            ),
          );

          // When OCR completes, try to fetch an auto-generated study kit
          if (status.ocrStatus === 'done' && f.material) {
            try {
              const kit = await materialsApi.getStudyKit(f.material.id);
              setFiles((prev) =>
                prev.map((pf) =>
                  pf.id === f.id ? { ...pf, studyKit: kit } : pf,
                ),
              );
            } catch {
              // 404 = not yet auto-generated, that's fine
            }
          }
        } catch {
          // Silently ignore poll errors
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [files]);

  async function uploadFile(file: File) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toastError(`${file.name} is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    const tempId = Math.random().toString(36).slice(2);
    const uploadedFile: UploadedFile = { id: tempId, name: file.name };
    setFiles((prev) => [...prev, uploadedFile]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));

    try {
      const material = await materialsApi.upload(formData);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, material, ocrStatus: material.ocrStatus } : f,
        ),
      );
      success(`${file.name} uploaded!`);
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, error: 'Upload failed. Please try again.' } : f,
        ),
      );
    }
  }

  async function handleFiles(fileList: FileList) {
    setUploading(true);
    const arr = Array.from(fileList);
    await Promise.all(arr.map(uploadFile));
    setUploading(false);
  }

  async function handleGenerateStudyKit(fileId: string, materialId: string) {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, studyKitLoading: true } : f)),
    );
    try {
      const kit = await materialsApi.generateStudyKit(materialId);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, studyKit: kit, studyKitLoading: false } : f,
        ),
      );
      success('Study kit generated!');
    } catch {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, studyKitLoading: false } : f)),
      );
      toastError('Could not generate study kit. Please try again.');
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (isLoading || !isAuthenticated || !isTeacher) return <PageSpinner />;

  return (
    <div className="section">
      <div className="page-container max-w-3xl">
        {/* ── Header ── */}
        <div className="animate-fade-up mb-10">
          <p className="eyebrow mb-3"><Upload size={14} /> Material library</p>
          <h1 className="text-ink-900 mb-3">Upload course materials</h1>
          <p className="text-xl text-ink-700">
            Drop your PDFs, images, or docs here. Our AI will read them and create a
            summary — no typing required.
          </p>
        </div>

        {/* ── Drop zone ── */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files — click or drag and drop"
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          className={clsx(
            'border-4 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            dragOver
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-surface-200 bg-white hover:border-brand-400 hover:bg-brand-50',
          )}
        >
          <Upload
            size={52}
            className={clsx(
              'mx-auto mb-5 transition-colors',
              dragOver ? 'text-brand-500' : 'text-stone-300',
            )}
            aria-hidden="true"
          />
          <p className="text-xl font-bold text-ink-900 mb-2">
            {dragOver ? 'Drop your files here' : 'Drag & drop, or click to browse'}
          </p>
          <p className="text-ink-700">
            PDF, Word, images, video, audio · Up to {MAX_SIZE_MB}MB each
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            aria-label="File input"
          />
        </div>

        {/* ── Uploaded files list ── */}
        {files.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-ink-900">Your uploads</h2>
            {files.map((f) => (
              <div key={f.id} className="space-y-4">
                <Card padding="md" className="card-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      {f.error ? (
                        <AlertCircle size={20} className="text-red-400" aria-hidden="true" />
                      ) : f.ocrStatus === 'done' ? (
                        <CheckCircle2 size={20} className="text-teal-500" aria-hidden="true" />
                      ) : (
                        <FileText size={20} className="text-brand-400" aria-hidden="true" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-ink-900 truncate">{f.name}</p>
                        {f.error ? (
                          <Badge variant="red" size="sm">Failed</Badge>
                        ) : !f.material ? (
                          <Badge variant="amber" size="sm">Uploading…</Badge>
                        ) : (
                          <OcrStatusBadge status={f.ocrStatus} />
                        )}
                      </div>

                      {f.error && (
                        <p className="text-sm text-red-600 mt-1" role="alert">{f.error}</p>
                      )}

                      {/* AI Summary */}
                      {f.aiSummary && (
                        <div className="mt-4 bg-brand-50 rounded-xl p-4 border border-brand-100">
                          <p className="text-sm font-semibold text-brand-700 flex items-center gap-2 mb-2">
                            <Sparkles size={16} aria-hidden="true" />
                            AI Summary
                          </p>
                          <p className="text-sm text-ink-700 leading-relaxed">{f.aiSummary}</p>
                        </div>
                      )}

                      {/* Extracted text preview */}
                      {f.extractedText && !f.aiSummary && (
                        <details className="mt-3">
                          <summary className="text-sm text-brand-600 cursor-pointer hover:underline font-medium">
                            View extracted text
                          </summary>
                          <pre className="mt-2 text-xs bg-surface-100 rounded-xl p-4 whitespace-pre-wrap text-ink-700 max-h-48 overflow-y-auto">
                            {f.extractedText}
                          </pre>
                        </details>
                      )}

                      {/* Processing spinner */}
                      {(f.ocrStatus === 'pending' || f.ocrStatus === 'processing') && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-ink-700">
                          <Clock
                            size={16}
                            className="animate-spin text-amber-500"
                            aria-hidden="true"
                          />
                          Extracting text and generating summary…
                        </div>
                      )}

                      {/* ── Generate Study Kit button ── */}
                      {f.ocrStatus === 'done' && f.material && !f.studyKit && (
                        <div className="mt-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={f.studyKitLoading}
                            icon={<Sparkles size={15} />}
                            onClick={() => handleGenerateStudyKit(f.id, f.material!.id)}
                            aria-label={`Generate Study Kit for ${f.name}`}
                          >
                            ✨ Generate Study Kit
                          </Button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setFiles((prev) => prev.filter((p) => p.id !== f.id))}
                      className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-surface-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </Card>

                {/* ── Study Kit View ── */}
                {f.studyKitLoading && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 rounded-xl border border-brand-100">
                    <Spinner size="sm" label="Generating study kit…" />
                    <p className="text-sm text-brand-700">Generating your study kit…</p>
                  </div>
                )}

                {f.studyKit && (
                  <div className="animate-fade-up">
                    <StudyKitView kit={f.studyKit} />
                  </div>
                )}
              </div>
            ))}

            {files.some((f) => f.material) && (
              <div className="pt-4">
                <Button
                  onClick={() => router.push('/teach/courses/new')}
                  iconEnd={<CheckCircle2 size={18} />}
                >
                  Use these in a course
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Tips ── */}
        {files.length === 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <FileText size={20} className="text-brand-400" />,
                tip: 'Upload PDFs, Word docs, or images. Our AI extracts text automatically.',
              },
              {
                icon: <Sparkles size={20} className="text-teal-400" />,
                tip: 'Each upload gets an AI summary you can use as lesson notes.',
              },
              {
                icon: <CheckCircle2 size={20} className="text-accent-500" />,
                tip: 'Attach materials to any lesson so students have everything in one place.',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="flex gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200"
              >
                <span className="shrink-0 mt-0.5" aria-hidden="true">{t.icon}</span>
                <p className="text-sm text-ink-700">{t.tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
