'use client';

import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  FileText, Bot, Users, AlertTriangle,
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
    <div className="h-screen bg-stone-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-stone-900 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Badge variant="red" size="md" className="animate-pulse bg-red-500 text-white border-0">
            MOCK ROOM
          </Badge>
          <h1 className="text-white font-semibold text-lg">{sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Users size={18} className="text-stone-400" />
          <span className="text-stone-400 text-sm">1 participant</span>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-amber-900/40 border-b border-amber-800 px-6 py-2 flex items-center gap-2 text-amber-300 text-sm">
        <AlertTriangle size={16} />
        Development mode: real video activates when LiveKit keys are configured.
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main video area */}
        <div className="flex-1 flex items-center justify-center p-4 bg-stone-950">
          {camOn ? (
            <div className="relative rounded-2xl overflow-hidden max-w-xl w-full aspect-video bg-stone-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-stone-800/80 text-white border-0 text-xs">You</Badge>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-900 aspect-video max-w-xl w-full flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center">
                <span className="text-3xl text-white font-bold">You</span>
              </div>
              <p className="text-stone-400 text-sm">Camera is off</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {(chatOpen || materialsOpen) && (
          <div className="w-80 bg-stone-900 border-l border-stone-800 flex flex-col">
            <div className="flex border-b border-stone-800">
              <button
                onClick={() => { setChatOpen(true); setMaterialsOpen(false); }}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold transition-colors',
                  chatOpen ? 'text-white border-b-2 border-brand-400' : 'text-stone-400 hover:text-stone-200',
                )}
              >
                Chat
              </button>
              <button
                onClick={() => { setMaterialsOpen(true); setChatOpen(false); }}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold transition-colors',
                  materialsOpen ? 'text-white border-b-2 border-brand-400' : 'text-stone-400 hover:text-stone-200',
                )}
              >
                Materials & AI
              </button>
            </div>

            {chatOpen && (
              <div className="flex flex-col flex-1">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'px-3 py-2 rounded-xl text-sm max-w-[85%]',
                        msg.me
                          ? 'bg-brand-600 text-white ml-auto'
                          : 'bg-stone-800 text-stone-200',
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-stone-800 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Send a message…"
                    className="flex-1 bg-stone-800 text-white text-sm rounded-xl px-3 py-2 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[40px]"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors"
                    aria-label="Send message"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            )}

            {materialsOpen && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <p className="text-stone-400 text-sm">Session materials and AI tutor</p>
                <a
                  href="/tutor"
                  className="flex items-center gap-3 bg-brand-900/60 rounded-xl p-4 text-white hover:bg-brand-900 transition-colors no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Bot size={24} className="text-brand-300 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Open AI Tutor</p>
                    <p className="text-xs text-stone-400">Ask questions about today&apos;s lesson</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-stone-800 rounded-xl p-4">
                  <FileText size={24} className="text-stone-400" />
                  <p className="text-stone-400 text-sm">Materials load when attached to a lesson</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-stone-900 border-t border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMicOn((v) => !v)}
            className={clsx(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              micOn ? 'bg-stone-700 text-white hover:bg-stone-600' : 'bg-red-600 text-white hover:bg-red-500',
            )}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            aria-pressed={!micOn}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button
            onClick={() => setCamOn((v) => !v)}
            className={clsx(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              camOn ? 'bg-stone-700 text-white hover:bg-stone-600' : 'bg-red-600 text-white hover:bg-red-500',
            )}
            aria-label={camOn ? 'Turn off camera' : 'Turn on camera'}
            aria-pressed={!camOn}
          >
            {camOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setChatOpen((v) => !v)}
            className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              chatOpen ? 'bg-brand-600 text-white' : 'bg-stone-700 text-stone-300 hover:text-white',
            )}
            aria-label="Toggle chat"
            aria-pressed={chatOpen}
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setMaterialsOpen((v) => !v)}
            className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              materialsOpen ? 'bg-brand-600 text-white' : 'bg-stone-700 text-stone-300 hover:text-white',
            )}
            aria-label="Toggle materials"
            aria-pressed={materialsOpen}
          >
            <Bot size={20} />
          </button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
          aria-label="Leave session"
        >
          <Phone size={22} className="rotate-[135deg]" />
        </button>
      </div>
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
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card padding="lg" className="max-w-md text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Could not join session</h2>
          <p className="text-stone-500 mb-6">{joinError}</p>
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
