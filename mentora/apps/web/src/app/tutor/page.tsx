'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Send,
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check,
  Mic,
  MicOff,
  Paperclip,
  X,
  GraduationCap,
  Globe,
  MessageSquare,
  Menu,
} from 'lucide-react';
import clsx from 'clsx';
import { aiApi, materialsApi } from '@/lib/api';
import type { AiQuizQuestion, Material } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ChatMessage } from '@/components/features/ChatMessage';
import type { ChatMessageData } from '@/components/features/ChatMessage';
import { SUBJECTS, GRADES } from '@mentora/shared';

// ---------------------------------------------------------------------------
// Speech Recognition — use a minimal duck-type to stay portable across
// TypeScript lib versions that may or may not include the full SR types.
// ---------------------------------------------------------------------------

interface SrInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SrEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
interface SrResult {
  readonly length: number;
  [index: number]: { readonly transcript: string };
}
interface SrEvent extends Event {
  readonly results: { readonly length: number; [index: number]: SrResult };
}
type SrConstructor = new () => SrInstance;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  questions?: AiQuizQuestion[];
  loading?: boolean;
  timestamp?: string; // ISO string for serialisation
}

interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

type AiTask = 'tutor_chat' | 'generate_quiz' | 'explain_simply' | 'summarize_material';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'mentora_tutor_chats';
const ACTIVE_KEY = 'mentora_tutor_active';
const HISTORY_LIMIT = 12;

const WELCOME_MESSAGE =
  "Hello! I'm your Mentora AI tutor. I can help you understand any topic, create practice quizzes, or explain things in a simple way. What would you like to learn today?";

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  pa: 'ਪੰਜਾਬੀ',
  bn: 'বাংলা',
};

const FOLLOW_UP_CHIPS = [
  { label: 'Explain differently', prompt: 'Please explain that in a different way.' },
  { label: 'Give an example', prompt: 'Can you give me a concrete example of that?' },
  { label: 'Quiz me on this', prompt: 'Please create a short quiz to test my understanding of what we just covered.' },
  { label: 'Show the steps', prompt: 'Can you show me the step-by-step process for this?' },
];

const STARTER_PROMPTS = [
  { icon: '🔢', text: 'Explain the Pythagorean theorem', subject: 'Mathematics' },
  { icon: '🔬', text: 'How does photosynthesis work?', subject: 'Science' },
  { icon: '📖', text: 'Help me improve my essay writing', subject: 'English' },
  { icon: '🌍', text: 'Tell me about the French Revolution', subject: 'History' },
  { icon: '💻', text: 'Explain how loops work in programming', subject: 'Computer Science' },
  { icon: '🎯', text: 'Help me prepare for my upcoming exam', subject: 'Exam Prep' },
];

const quickActions = [
  {
    id: 'quiz',
    icon: <HelpCircle size={18} />,
    label: 'Make a quiz',
    prompt: 'Please create a short quiz for me on this topic.',
    task: 'generate_quiz' as AiTask,
  },
  {
    id: 'explain',
    icon: <Sparkles size={18} />,
    label: 'Explain simply',
    prompt: 'Please explain this concept in simple words, like I am 10 years old.',
    task: 'explain_simply' as AiTask,
  },
  {
    id: 'summarize',
    icon: <BookOpen size={18} />,
    label: 'Summarise for me',
    prompt: 'Please give me a clear summary of what we have covered.',
    task: 'summarize_material' as AiTask,
  },
];

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

function loadActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}

function saveActiveId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_KEY, id);
}

function makeWelcomeMessage(): StoredMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: WELCOME_MESSAGE,
    timestamp: new Date().toISOString(),
  };
}

function makeNewConversation(): Conversation {
  return {
    id: Date.now().toString(),
    title: 'New chat',
    messages: [makeWelcomeMessage()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function storedToData(m: StoredMessage): ChatMessageData {
  return {
    ...m,
    timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
  };
}

// ---------------------------------------------------------------------------
// QuizCard (interactive multiple-choice, keep existing behaviour)
// ---------------------------------------------------------------------------

function QuizCard({ questions }: { questions: AiQuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="mt-4 space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
          <p className="font-semibold text-ink-900 mb-4">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const correct = oi === q.answerIndex;
              const show = revealed[qi];
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => {
                    if (revealed[qi]) return;
                    setAnswers((prev) => ({ ...prev, [qi]: oi }));
                    setRevealed((prev) => ({ ...prev, [qi]: true }));
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    !show && 'border-surface-200 bg-white hover:border-brand-400 hover:bg-brand-50',
                    show && correct && 'border-green-400 bg-green-50 text-green-800',
                    show && !correct && chosen && 'border-red-400 bg-red-50 text-red-800',
                    show && !correct && !chosen && 'border-surface-200 bg-white text-stone-400',
                  )}
                  aria-pressed={chosen}
                  aria-label={`Option ${oi + 1}: ${opt}`}
                >
                  <span className="mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                  {show && correct && <span className="ml-2 text-green-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
          {revealed[qi] && (
            <div className="mt-4 bg-white rounded-xl p-4 border border-brand-100">
              <p className="text-sm font-semibold text-brand-700 mb-1">Explanation</p>
              <p className="text-sm text-ink-700">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  collapsed: boolean;
  /** Mobile-only: whether the drawer is open */
  drawerOpen: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onToggle: () => void;
  /** Mobile-only: close the drawer */
  onDrawerClose: () => void;
}

function Sidebar({
  conversations,
  activeId,
  collapsed,
  drawerOpen,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onToggle,
  onDrawerClose,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const commitEdit = (id: string) => {
    if (editValue.trim()) onRename(id, editValue.trim());
    setEditingId(null);
  };

  // Shared inner content — rendered both in the desktop aside and the mobile drawer
  const innerContent = (
    <>
      {/* Toggle + New chat row */}
      <div className="flex items-center gap-2 p-3 border-b border-surface-200">
        {/* Desktop collapse toggle — hidden inside the mobile drawer */}
        <button
          type="button"
          onClick={onToggle}
          className="w-9 h-9 rounded-lg hidden lg:flex items-center justify-center text-ink-700 hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {/* Mobile close button — shown only inside the drawer */}
        <button
          type="button"
          onClick={onDrawerClose}
          className="w-9 h-9 rounded-lg flex lg:hidden items-center justify-center text-ink-700 hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
          aria-label="Close conversations drawer"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={onNew}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors min-h-[40px]"
          aria-label="Start a new conversation"
        >
          <Plus size={16} aria-hidden="true" />
          New chat
        </button>
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Previous conversations">
        {conversations.length === 0 && (
          <p className="text-xs text-ink-500 text-center py-4 px-2">
            No conversations yet.
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={clsx(
              'group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors',
              conv.id === activeId
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-700 hover:bg-surface-100',
            )}
            onClick={() => {
              if (editingId !== conv.id) {
                onSelect(conv.id);
                onDrawerClose(); // auto-close drawer on mobile after selecting
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(conv.id);
                onDrawerClose();
              }
            }}
            aria-current={conv.id === activeId ? 'page' : undefined}
          >
            <MessageSquare size={14} className="shrink-0" aria-hidden="true" />

            {editingId === conv.id ? (
              <input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(conv.id);
                  if (e.key === 'Escape') setEditingId(null);
                  e.stopPropagation();
                }}
                className="flex-1 text-xs bg-white border border-brand-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                onClick={(e) => e.stopPropagation()}
                aria-label="Rename conversation"
              />
            ) : (
              <span className="flex-1 text-xs truncate font-medium">
                {conv.title}
              </span>
            )}

            {/* Action buttons */}
            <div
              className="hidden group-hover:flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {editingId === conv.id ? (
                <button
                  type="button"
                  onClick={() => commitEdit(conv.id)}
                  className="p-1 rounded hover:bg-brand-100 text-brand-600"
                  aria-label="Save rename"
                >
                  <Check size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(conv.id, conv.title);
                  }}
                  className="p-1 rounded hover:bg-surface-200 text-ink-500"
                  aria-label={`Rename conversation "${conv.title}"`}
                >
                  <Pencil size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="p-1 rounded hover:bg-red-100 text-red-500"
                aria-label={`Delete conversation "${conv.title}"`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-white border-r border-surface-200 transition-all duration-300 shrink-0',
          collapsed ? 'w-12' : 'w-64',
        )}
        aria-label="Chat conversations sidebar"
      >
        {collapsed ? (
          /* Collapsed: just show the expand toggle */
          <div className="flex items-center justify-center p-3 border-b border-surface-200">
            <button
              type="button"
              onClick={onToggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-700 hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          innerContent
        )}
      </aside>

      {/* ── Mobile drawer (< lg) ── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onDrawerClose}
        />
      )}
      {/* Drawer panel */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] bg-white shadow-lift transition-transform duration-300 lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Chat conversations sidebar"
        aria-hidden={!drawerOpen}
      >
        {innerContent}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Context controls panel (subject, grade, material)
// ---------------------------------------------------------------------------

interface ContextControlsProps {
  subjectId: string;
  gradeId: string;
  materialId: string;
  materials: Material[];
  materialsLoading: boolean;
  onSubjectChange: (v: string) => void;
  onGradeChange: (v: string) => void;
  onMaterialChange: (v: string) => void;
  lang: string;
  /** Mobile-only: open the conversations drawer */
  onOpenDrawer: () => void;
}

function ContextControls({
  subjectId,
  gradeId,
  materialId,
  materials,
  materialsLoading,
  onSubjectChange,
  onGradeChange,
  onMaterialChange,
  lang,
  onOpenDrawer,
}: ContextControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-surface-50 border-b border-surface-200 min-w-0">
      {/* Mobile "Chats" menu button — hidden on lg+ where the sidebar is always visible */}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex lg:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors min-h-[36px] shrink-0"
        aria-label="Open chat history"
      >
        <Menu size={15} aria-hidden="true" />
        Chats
      </button>

      {/* Subject */}
      <div className="flex items-center gap-1.5">
        <GraduationCap size={15} className="text-brand-500 shrink-0" aria-hidden="true" />
        <select
          value={subjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink-800 min-h-[36px] cursor-pointer max-w-[120px]"
          aria-label="Select subject"
        >
          <option value="">Any subject</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade */}
      <div className="flex items-center gap-1.5">
        <select
          value={gradeId}
          onChange={(e) => onGradeChange(e.target.value)}
          className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink-800 min-h-[36px] cursor-pointer max-w-[100px]"
          aria-label="Select grade"
        >
          <option value="">Any grade</option>
          {GRADES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Material */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Paperclip size={15} className="text-teal-500 shrink-0" aria-hidden="true" />
        <select
          value={materialId}
          onChange={(e) => onMaterialChange(e.target.value)}
          className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink-800 min-h-[36px] cursor-pointer max-w-[120px]"
          aria-label="Attach a material"
          disabled={materialsLoading}
        >
          <option value="">No material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title ?? m.id}
            </option>
          ))}
        </select>
        {materialId && (
          <button
            type="button"
            onClick={() => onMaterialChange('')}
            className="p-1 rounded hover:bg-surface-200 text-ink-500"
            aria-label="Remove attached material"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Language indicator */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <Globe size={13} className="text-ink-500" aria-hidden="true" />
        <span className="text-xs text-ink-500 font-medium">
          {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TutorPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();

  // ── Conversation state ──────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const stored = loadConversations();
    if (stored.length === 0) {
      const first = makeNewConversation();
      return [first];
    }
    return stored;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const stored = loadActiveId();
    const convs = loadConversations();
    if (stored && convs.find((c) => c.id === stored)) return stored;
    if (convs.length > 0) return convs[0].id;
    return Date.now().toString();
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile drawer — closed by default so chat panel is full-width on phones
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hydration guard: localStorage-backed conversations + timestamps only exist on
  // the client, so we render a stable shell until mounted to avoid SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close the mobile drawer when the viewport grows past the lg breakpoint
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Context controls ────────────────────────────────────────────────────
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // ── Chat state ──────────────────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Voice input ─────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SrInstance | null>(null);
  const speechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Derived active conversation ─────────────────────────────────────────
  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  );

  const messages: ChatMessageData[] = useMemo(
    () => (activeConv?.messages ?? []).map(storedToData),
    [activeConv],
  );

  // Keep activeId pointing at a real conversation. The conversations and
  // activeId initializers run independently (different Date.now() seeds), so on
  // a fresh session activeId can miss conversations[0]; reconcile here so
  // sendMessage's appendMessages targets an existing conversation.
  useEffect(() => {
    if (conversations.length > 0 && !conversations.find((c) => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // ── Persist conversations ───────────────────────────────────────────────
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (activeId) saveActiveId(activeId);
  }, [activeId]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Load materials ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    setMaterialsLoading(true);
    materialsApi
      .list()
      .then(setMaterials)
      .catch(() => {})
      .finally(() => setMaterialsLoading(false));
  }, [isAuthenticated]);

  // ── Conversation management ─────────────────────────────────────────────
  const createNewConversation = useCallback(() => {
    const conv = makeNewConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput('');
    setShowFollowUps(false);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = makeNewConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  }, []);

  // ── Auto-title from first user message ──────────────────────────────────
  const updateTitle = useCallback(
    (convId: string, userText: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          if (c.title !== 'New chat') return c;
          const title = userText.length > 36 ? userText.slice(0, 33) + '…' : userText;
          return { ...c, title };
        }),
      );
    },
    [],
  );

  // ── Append / update messages ─────────────────────────────────────────────
  const appendMessages = useCallback(
    (convId: string, newMsgs: StoredMessage[]) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, ...newMsgs],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [],
  );

  const updateLastAiMessage = useCallback(
    (convId: string, msgId: string, patch: Partial<StoredMessage>) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? { ...m, ...patch } : m,
                ),
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [],
  );

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (
      text: string,
      task: AiTask = 'tutor_chat',
    ) => {
      if (!text.trim() || loading) return;

      // Resolve to a conversation that actually exists (activeId can briefly
      // mismatch conversations[0] right after mount), so messages always land.
      const convId = conversations.some((c) => c.id === activeId)
        ? activeId
        : conversations[0]?.id ?? activeId;
      const userMsgId = Date.now().toString();
      const aiMsgId = (Date.now() + 1).toString();
      const now = new Date().toISOString();

      const userMsg: StoredMessage = {
        id: userMsgId,
        role: 'user',
        content: text.trim(),
        timestamp: now,
      };
      const aiMsg: StoredMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        loading: true,
        timestamp: now,
      };

      appendMessages(convId, [userMsg, aiMsg]);
      updateTitle(convId, text.trim());
      setInput('');
      setLoading(true);
      setShowFollowUps(false);

      // Build history for multi-turn context
      const currentConv = conversations.find((c) => c.id === convId);
      const history = (currentConv?.messages ?? [])
        .filter((m) => !m.loading && m.content)
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }));

      const invokePayload = {
        task,
        prompt: text.trim(),
        history,
        language: lang,
        ...(subjectId ? { subjectId } : {}),
        ...(gradeId ? { gradeId } : {}),
        ...(materialId ? { materialId } : {}),
      };

      // SSE stream for plain tutor_chat (no material attached)
      if (task === 'tutor_chat' && !materialId) {
        try {
          const es = aiApi.tutorStream(text.trim());
          let accumulated = '';

          es.onmessage = (e) => {
            if (e.data === '[DONE]') {
              es.close();
              setLoading(false);
              setShowFollowUps(true);
              return;
            }
            try {
              const parsed = JSON.parse(e.data);
              const chunk: string = parsed.text ?? parsed.content ?? '';
              accumulated += chunk;
              updateLastAiMessage(convId, aiMsgId, {
                content: accumulated,
                loading: false,
              });
            } catch {
              /* ignore parse errors */
            }
          };

          es.onerror = async () => {
            es.close();
            try {
              const res = await aiApi.invoke(invokePayload);
              const reply = typeof res.result === 'string' ? res.result : '';
              updateLastAiMessage(convId, aiMsgId, {
                content: reply,
                loading: false,
              });
              setShowFollowUps(true);
            } catch {
              updateLastAiMessage(convId, aiMsgId, {
                content:
                  "I'm having trouble right now. Please try again in a moment.",
                loading: false,
              });
            } finally {
              setLoading(false);
            }
          };

          return;
        } catch {
          // fall through to invoke
        }
      }

      // Regular invoke (non-chat tasks, or material attached)
      try {
        const res = await aiApi.invoke(invokePayload);
        const questions = Array.isArray(res.result) ? res.result : res.questions;
        const content = Array.isArray(res.result)
          ? 'Here is a quick quiz to check your understanding:'
          : (typeof res.result === 'string' ? res.result : '');
        updateLastAiMessage(convId, aiMsgId, {
          content,
          questions,
          loading: false,
        });
        setShowFollowUps(task === 'tutor_chat' || task === 'explain_simply');
      } catch {
        updateLastAiMessage(convId, aiMsgId, {
          content:
            "I'm sorry, I couldn't process that request. Please try again.",
          loading: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      activeId,
      conversations,
      lang,
      subjectId,
      gradeId,
      materialId,
      appendMessages,
      updateTitle,
      updateLastAiMessage,
    ],
  );

  // ── Voice input ──────────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as typeof window & {
      SpeechRecognition?: SrConstructor;
      webkitSpeechRecognition?: SrConstructor;
    };
    const SR: SrConstructor | undefined =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : lang === 'bn' ? 'bn-IN' : 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SrEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [speechSupported, isListening, lang]);

  // ── Empty state ──────────────────────────────────────────────────────────
  const isEmptyChat = messages.length <= 1; // only welcome message

  // ── Render ──────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="section">
        <div className="page-container max-w-6xl flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" label="Loading the AI Tutor…" />
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="page-container max-w-6xl">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-5 animate-fade-up flex-wrap">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-glow shrink-0">
            <Bot size={26} className="text-white sm:hidden" aria-hidden="true" />
            <Bot size={30} className="text-white hidden sm:block" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-ink-900">AI Tutor</h1>
            <p className="text-ink-700 text-sm sm:text-base">Ask anything — I&apos;m here to help you learn.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!isAuthenticated && (
              <Badge variant="amber" size="md" className="hidden sm:inline-flex">
                Sign in for unlimited questions
              </Badge>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
          {quickActions.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant="outline"
              icon={a.icon}
              onClick={() => sendMessage(a.prompt, a.task)}
              disabled={loading}
            >
              {a.label}
            </Button>
          ))}
        </div>

        {/* ── Main layout: sidebar + chat ── */}
        {/* On mobile (< lg): only the chat panel is shown; the sidebar becomes a
            slide-in drawer toggled by the "Chats" button inside ContextControls.
            On lg+: the desktop sidebar is always rendered alongside the chat. */}
        <div
          className="overflow-hidden shadow-lift flex rounded-xl border border-surface-200 bg-white"
          style={{ minHeight: '580px', maxHeight: '80vh' }}
        >
          {/* Sidebar (desktop) + Drawer (mobile) */}
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            collapsed={sidebarCollapsed}
            drawerOpen={drawerOpen}
            onSelect={(id) => {
              setActiveId(id);
              setShowFollowUps(false);
            }}
            onNew={createNewConversation}
            onDelete={deleteConversation}
            onRename={renameConversation}
            onToggle={() => setSidebarCollapsed((v) => !v)}
            onDrawerClose={() => setDrawerOpen(false)}
          />

          {/* Chat panel — always full-width on mobile; shares space with sidebar on lg+ */}
          <div className="flex-1 flex flex-col min-w-0 w-0">
            {/* Context controls (includes mobile "Chats" toggle button) */}
            <ContextControls
              subjectId={subjectId}
              gradeId={gradeId}
              materialId={materialId}
              materials={materials}
              materialsLoading={materialsLoading}
              onSubjectChange={setSubjectId}
              onGradeChange={setGradeId}
              onMaterialChange={setMaterialId}
              lang={lang}
              onOpenDrawer={() => setDrawerOpen(true)}
            />

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 min-w-0"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {/* Empty state */}
              {isEmptyChat && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center animate-fade-up">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center mb-4">
                    <Sparkles size={32} className="text-brand-500" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold text-ink-900 mb-2">
                    What would you like to learn today?
                  </h2>
                  <p className="text-sm text-ink-700 mb-6 max-w-sm px-2">
                    Choose a topic below or type your own question to get started.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg px-1">
                    {STARTER_PROMPTS.map((sp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(sp.text)}
                        disabled={loading}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-surface-200 bg-white',
                          'text-left text-sm font-medium text-ink-800 hover:border-brand-300 hover:bg-brand-50',
                          'transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-500',
                          'min-h-[52px]',
                        )}
                      >
                        <span className="text-lg" aria-hidden="true">{sp.icon}</span>
                        <span className="flex-1">{sp.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  quizSlot={
                    msg.questions && msg.questions.length > 0 ? (
                      <QuizCard questions={msg.questions} />
                    ) : undefined
                  }
                />
              ))}

              {/* Follow-up chips */}
              {showFollowUps && !loading && messages.length > 1 && (
                <div
                  className="flex flex-wrap gap-2 pl-2 sm:pl-14 animate-fade-up"
                  aria-label="Follow-up suggestions"
                >
                  {FOLLOW_UP_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => sendMessage(chip.prompt)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-xs font-medium border-2 border-brand-200',
                        'bg-brand-50 text-brand-700 hover:bg-brand-100 hover:border-brand-300',
                        'transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-500',
                        'min-h-[36px]',
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-surface-200 p-3 sm:p-4 flex gap-2 sm:gap-3 items-end bg-surface-50">
              {/* Voice button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={loading}
                  className={clsx(
                    'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all',
                    'focus-visible:ring-2 focus-visible:ring-brand-500',
                    isListening
                      ? 'bg-red-100 text-red-500 animate-pulse border-2 border-red-300'
                      : 'bg-surface-100 text-ink-600 hover:bg-surface-200 border-2 border-surface-200',
                    loading && 'opacity-50 cursor-not-allowed',
                  )}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={isListening}
                >
                  {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
              )}

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything…"
                rows={2}
                className="flex-1 resize-none bg-white border-2 border-surface-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 placeholder:text-stone-400 min-h-[48px]"
                aria-label="Type your question"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage(input)}
                loading={loading}
                disabled={!input.trim()}
                icon={<Send size={16} />}
                size="sm"
                className="sm:hidden shrink-0 self-end"
                aria-label="Send message"
              >
                Send
              </Button>
              <Button
                onClick={() => sendMessage(input)}
                loading={loading}
                disabled={!input.trim()}
                icon={<Send size={18} />}
                size="lg"
                className="hidden sm:flex shrink-0"
                aria-label="Send message"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tips ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <MessageSquare size={20} className="text-brand-400" />,
              tip: 'Ask follow-up questions anytime — I remember our conversation.',
            },
            {
              icon: <HelpCircle size={20} className="text-teal-400" />,
              tip: 'Say "make a quiz on fractions" and I\'ll create an interactive practice test.',
            },
            {
              icon: <Sparkles size={20} className="text-accent-500" />,
              tip: 'Ask me to "explain like I\'m 8" for super-simple explanations.',
            },
          ].map((t, i) => (
            <div
              key={i}
              className="flex gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200"
            >
              <span className="shrink-0 mt-0.5" aria-hidden="true">
                {t.icon}
              </span>
              <p className="text-sm text-ink-700">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
