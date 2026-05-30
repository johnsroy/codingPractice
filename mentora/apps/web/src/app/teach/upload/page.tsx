'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, AlertCircle, Clock, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { materialsApi } from '@/lib/api';
import type { Material } from '@/lib/api';
import type { OcrStatus } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

const ACCEPTED = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mp3,.txt';
const MAX_SIZE_MB = 50;

interface UploadedFile {
  id: string;
  name: string;
  material?: Material;
  ocrStatus?: OcrStatus;
  extractedText?: string | null;
  aiSummary?: string | null;
  polling?: boolean;
  error?: string;
}

function OcrStatusBadge({ status }: { status?: OcrStatus }) {
  if (!status || status === 'skipped') return null;
  const configs: Record<OcrStatus, { label: string; variant: 'amber' | 'teal' | 'brand' | 'red' | 'stone' }> = {
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
          f.id === tempId
            ? { ...f, material, ocrStatus: material.ocrStatus }
            : f,
        ),
      );
      success(`${file.name} uploaded!`);
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? { ...f, error: 'Upload failed. Please try again.' }
            : f,
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

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [],
  );

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) { router.push('/login?redirect=/teach/upload'); return null; }
  if (!isTeacher) { router.push('/dashboard'); return null; }

  return (
    <div className="section">
      <div className="page-container max-w-3xl">
        <h1 className="text-stone-900 mb-3">Upload course materials</h1>
        <p className="text-xl text-stone-500 mb-10">
          Drop your PDFs, images, or docs here. Our AI will read them and create a summary — no typing required.
        </p>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files — click or drag and drop"
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
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
          <p className="text-xl font-bold text-stone-700 mb-2">
            {dragOver ? 'Drop your files here' : 'Drag & drop, or click to browse'}
          </p>
          <p className="text-stone-400">
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

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-stone-800">Your uploads</h2>
            {files.map((f) => (
              <Card key={f.id} padding="md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {f.error ? (
                      <AlertCircle size={20} className="text-red-400" />
                    ) : f.ocrStatus === 'done' ? (
                      <CheckCircle2 size={20} className="text-teal-500" />
                    ) : (
                      <FileText size={20} className="text-brand-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-stone-800 truncate">{f.name}</p>
                      {f.error ? (
                        <Badge variant="red" size="sm">Failed</Badge>
                      ) : !f.material ? (
                        <Badge variant="amber" size="sm">Uploading…</Badge>
                      ) : (
                        <OcrStatusBadge status={f.ocrStatus} />
                      )}
                    </div>

                    {f.error && (
                      <p className="text-sm text-red-600 mt-1">{f.error}</p>
                    )}

                    {/* AI Summary */}
                    {f.aiSummary && (
                      <div className="mt-4 bg-brand-50 rounded-xl p-4 border border-brand-100">
                        <p className="text-sm font-semibold text-brand-700 flex items-center gap-2 mb-2">
                          <Sparkles size={16} aria-hidden="true" />
                          AI Summary
                        </p>
                        <p className="text-sm text-stone-700 leading-relaxed">{f.aiSummary}</p>
                      </div>
                    )}

                    {/* Extracted text preview */}
                    {f.extractedText && !f.aiSummary && (
                      <details className="mt-3">
                        <summary className="text-sm text-brand-600 cursor-pointer hover:underline font-medium">
                          View extracted text
                        </summary>
                        <pre className="mt-2 text-xs bg-surface-100 rounded-xl p-4 whitespace-pre-wrap text-stone-700 max-h-48 overflow-y-auto">
                          {f.extractedText}
                        </pre>
                      </details>
                    )}

                    {/* Processing spinner */}
                    {(f.ocrStatus === 'pending' || f.ocrStatus === 'processing') && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                        <Clock size={16} className="animate-spin text-amber-500" />
                        Extracting text and generating summary…
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setFiles((prev) => prev.filter((p) => p.id !== f.id))}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-surface-100 transition-colors"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </Card>
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
      </div>
    </div>
  );
}
