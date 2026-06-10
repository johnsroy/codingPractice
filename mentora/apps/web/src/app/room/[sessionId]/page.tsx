'use client';

import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  FileText, Bot, Users, AlertTriangle, GraduationCap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';
import type { VideoJoinTicket } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/*  LiveKit room — lazily imported so the build works without keys     */
/* ------------------------------------------------------------------ */

const LiveKitRoom = lazy(() =>
  import('@livekit/components-react').then((m) => ({ default: m.LiveKitRoom })),
);
const VideoConference = lazy(() =>
  import('@livekit/components-react').then((m) => ({ default: m.VideoConference })),
);

/* ------------------------------------------------------------------ */
/*  Control button helper                                              */
/* ------------------------------------------------------------------ */

function ControlBtn({
  active,
  danger,
  size = 'md',
  onClick,
  label,
  children,
}: {
  active?: boolean;
  danger?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const dim = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-14 h-14';
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        dim,
        'rounded-full flex items-center justify-center transition-all duration-150 shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900',
        danger
          ? 'bg-red-600 text-white hover:bg-red-500 shadow-soft'
          : active
          ? 'bg-brand-600 text-white hover:bg-brand-500'
          : 'bg-ink-800 text-surface-300 hover:bg-ink-700 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock room — local camera preview for development                   */
/* ------------------------------------------------------------------ */

function MockRoom({ ticket, sessionTitle }: { ticket: VideoJoinTicket; sessionTitle: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; me: boolean }[]>([
    { text: 'Welcome to the classroom! 👋', me: false },
  ]);
  const router = useRouter();

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: micOn })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => {
          // Camera/mic not available — graceful fallback
        });
    } else {
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [camOn, micOn]);

  function sendMessage() {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { text: message.trim(), me: true }]);
    setMessage('');
  }

  return (
    <div className="h-screen bg-ink-900 flex flex-col" role="main" aria-label="Live classroom">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-ink-900 border-b border-ink-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
              <GraduationCap size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-white font-bold text-sm">Mentora</span>
          </div>
          <div className="h-4 w-px bg-ink-700" aria-hidden="true" />
          <Badge variant="red" size="md" className="animate-pulse bg-red-500 text-white border-0 text-xs font-bold">
            MOCK ROOM
          </Badge>
          <h1 className="text-white font-semibold text-base leading-tight max-w-xs truncate">
            {sessionTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-surface-300 text-sm">
          <Users size={16} aria-hidden="true" />
          <span>1 participant</span>
        </div>
      </header>

      {/* ── Dev notice ── */}
      <div
        className="bg-amber-900/30 border-b border-amber-800/50 px-6 py-2 flex items-center gap-2 text-amber-300 text-xs"
        role="status"
      >
        <AlertTriangle size={14} aria-hidden="true" />
        Development mode: real video activates when LiveKit keys are configured.
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video */}
        <div className="flex-1 flex items-center justify-center p-6 bg-ink-900">
          {camOn ? (
            <div className="relative rounded-3xl overflow-hidden max-w-2xl w-full aspect-video bg-ink-800 shadow-modal">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                aria-label="Your camera preview"
              />
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-ink-800/80 text-white border-0 text-xs backdrop-blur-sm">You</Badge>
              </div>
              {/* Mic indicator */}
              <div className="absolute top-4 right-4">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center',
                  micOn ? 'bg-teal-500/80' : 'bg-red-500/80',
                )}>
                  {micOn
                    ? <Mic size={14} className="text-white" aria-hidden="true" />
                    : <MicOff size={14} className="text-white" aria-hidden="true" />
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-ink-800 aspect-video max-w-2xl w-full flex flex-col items-center justify-center gap-4 shadow-modal">
              <div className="w-20 h-20 rounded-full bg-ink-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-surface-200">You</span>
              </div>
              <p className="text-surface-300 text-sm">Camera is off</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {(chatOpen || materialsOpen) && (
          <aside className="w-80 bg-ink-900 border-l border-ink-800 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-ink-800">
              <button
                onClick={() => { setChatOpen(true); setMaterialsOpen(false); }}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold transition-colors',
                  chatOpen
                    ? 'text-white border-b-2 border-brand-400'
                    : 'text-surface-300 hover:text-surface-100',
                )}
                aria-pressed={chatOpen}
              >
                Chat
              </button>
              <button
                onClick={() => { setMaterialsOpen(true); setChatOpen(false); }}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold transition-colors',
                  materialsOpen
                    ? 'text-white border-b-2 border-brand-400'
                    : 'text-surface-300 hover:text-surface-100',
                )}
                aria-pressed={materialsOpen}
              >
                Materials &amp; AI
              </button>
            </div>

            {chatOpen && (
              <div className="flex flex-col flex-1">
                <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-label="Chat messages">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'px-3 py-2 rounded-2xl text-sm max-w-[85%] leading-snug',
                        msg.me
                          ? 'bg-brand-600 text-white ml-auto'
                          : 'bg-ink-800 text-surface-200',
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-ink-800 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Send a message…"
                    aria-label="Type a chat message"
                    className="flex-1 bg-ink-800 text-white text-sm rounded-2xl px-3 py-2 placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[40px] border border-ink-700"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            )}

            {materialsOpen && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <p className="text-surface-300 text-sm font-medium">Session materials &amp; AI tutor</p>
                <a
                  href="/tutor"
                  className="flex items-center gap-3 bg-brand-900/50 border border-brand-800/50 rounded-2xl p-4 text-white hover:bg-brand-900 transition-colors no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Bot size={22} className="text-brand-300 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm">Open AI Tutor</p>
                    <p className="text-xs text-surface-300">Ask questions about today&apos;s lesson</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-ink-800 rounded-2xl p-4 border border-ink-700">
                  <FileText size={22} className="text-surface-300 shrink-0" aria-hidden="true" />
                  <p className="text-surface-300 text-sm">Materials load when attached to a lesson</p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── Controls bar ── */}
      <footer className="bg-ink-900 border-t border-ink-800 px-6 py-4 flex items-center justify-between">
        {/* Primary controls */}
        <div className="flex items-center gap-3">
          <ControlBtn
            active={!micOn}
            danger={!micOn}
            onClick={() => setMicOn((v) => !v)}
            label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </ControlBtn>
          <ControlBtn
            active={!camOn}
            danger={!camOn}
            onClick={() => setCamOn((v) => !v)}
            label={camOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {camOn ? <Video size={22} /> : <VideoOff size={22} />}
          </ControlBtn>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-3">
          <ControlBtn
            active={chatOpen}
            onClick={() => { setChatOpen((v) => !v); setMaterialsOpen(false); }}
            size="sm"
            label="Toggle chat"
          >
            <MessageSquare size={18} />
          </ControlBtn>
          <ControlBtn
            active={materialsOpen}
            onClick={() => { setMaterialsOpen((v) => !v); setChatOpen(false); }}
            size="sm"
            label="Toggle materials"
          >
            <Bot size={18} />
          </ControlBtn>
        </div>

        {/* Leave */}
        <ControlBtn
          danger
          size="lg"
          onClick={() => router.push('/dashboard')}
          label="Leave session"
        >
          <Phone size={22} className="rotate-[135deg]" />
        </ControlBtn>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function RoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();

  const [ticket, setTicket] = useState<VideoJoinTicket | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.byId(sessionId),
    enabled: !!sessionId && isAuthenticated,
  });

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/room/' + sessionId);
  }, [authLoading, isAuthenticated, router, sessionId]);

  useEffect(() => {
    if (authLoading || sessionLoading || !isAuthenticated || !session) return;
    setJoining(true);
    sessionsApi
      .join(sessionId)
      .then((t) => setTicket(t))
      .catch((err) => setJoinError(err.message ?? 'Could not join. Please try again.'))
      .finally(() => setJoining(false));
  }, [authLoading, sessionLoading, isAuthenticated, session, sessionId]);

  if (authLoading || sessionLoading || joining || !isAuthenticated) return <PageSpinner />;

  if (joinError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-surface-50">
        <Card padding="lg" className="max-w-md text-center shadow-lift">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={32} className="text-red-400" aria-hidden="true" />
          </div>
          <h2 className="text-ink-900 mb-2">Could not join session</h2>
          <p className="text-ink-700 mb-6">{joinError}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  if (!ticket) return <PageSpinner />;

  // Route to appropriate room component
  if (ticket.provider === 'livekit' && ticket.url && ticket.token) {
    return (
      <Suspense fallback={<PageSpinner />}>
        <LiveKitRoom
          serverUrl={ticket.url}
          token={ticket.token}
          video
          audio
          style={{ height: '100vh' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </Suspense>
    );
  }

  // Mock room (default for development)
  return <MockRoom ticket={ticket} sessionTitle={session?.title ?? 'Live Session'} />;
}
