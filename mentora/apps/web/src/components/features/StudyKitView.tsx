'use client';

/**
 * StudyKitView — renders a complete AI Study Kit.
 *
 * Sections:
 *  1. Summary card
 *  2. Key Terms list (term + definition)
 *  3. Flashcards (click/keyboard to flip front↔back, counter)
 *  4. Practice Quiz (multiple-choice with reveal)
 *
 * Design: on-brand Mentora style (card, card-lift, eyebrow, gradients,
 * text-ink-700/900, brand/teal/accent/coral, animate-fade-up).
 * Fully accessible: ARIA labels, keyboard navigation, focus management.
 * Supports RTL via the `dir` attribute on the container.
 */

import React, { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';
import {
  BookOpen,
  List,
  Layers,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import type { StudyKit, AiQuizQuestion } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StudyKitViewProps {
  kit: StudyKit;
  /** BCP-47 language/direction hint; affects dir attribute. */
  lang?: string;
  className?: string;
}

// ─── Section header helper ────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeVariant?: 'brand' | 'teal' | 'amber' | 'green';
}

function SectionHeader({ icon, title, badge, badgeVariant = 'brand' }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
        <span className="text-brand-500" aria-hidden="true">{icon}</span>
      </div>
      <h2 className="text-xl font-semibold text-ink-900 flex-1">{title}</h2>
      {badge && (
        <Badge variant={badgeVariant} size="sm">{badge}</Badge>
      )}
    </div>
  );
}

// ─── 1. Summary Card ──────────────────────────────────────────────────────────

interface SummaryCardProps {
  summary: string;
  gradeId?: string | null;
  generatedAt?: string;
}

function SummaryCard({ summary, gradeId, generatedAt }: SummaryCardProps) {
  const grade = gradeId ? gradeId.replace('grade-', 'Grade ') : null;
  const date = generatedAt ? new Date(generatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null;

  return (
    <Card padding="lg" className="animate-fade-up">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 shadow-glow"
          aria-hidden="true"
        >
          <Sparkles size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <SectionHeader
            icon={<BookOpen size={18} />}
            title="Summary"
            badge={grade ?? undefined}
            badgeVariant="brand"
          />
          <p className="text-ink-700 leading-relaxed text-base">{summary}</p>
          {date && (
            <p className="mt-3 text-xs text-ink-500">Generated on {date}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── 2. Key Terms ─────────────────────────────────────────────────────────────

interface KeyTermsCardProps {
  keyTerms: { term: string; definition: string }[];
}

function KeyTermsCard({ keyTerms }: KeyTermsCardProps) {
  return (
    <Card padding="lg" className="animate-fade-up">
      <SectionHeader
        icon={<List size={18} />}
        title="Key Terms"
        badge={`${keyTerms.length} terms`}
        badgeVariant="teal"
      />
      <dl className="divide-y divide-surface-100">
        {keyTerms.map(({ term, definition }) => (
          <div key={term} className="py-3 first:pt-0 last:pb-0">
            <dt className="font-semibold text-ink-900 text-sm mb-1">{term}</dt>
            <dd className="text-ink-700 text-sm leading-relaxed">{definition}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

// ─── 3. Flashcards ────────────────────────────────────────────────────────────

interface FlashcardProps {
  front: string;
  back: string;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function FlashcardItem({ front, back, index, total, flipped, onFlip, onPrev, onNext }: FlashcardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onFlip(); }
    },
    [onFlip, onPrev, onNext],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Counter */}
      <p className="text-sm text-ink-500 font-medium" aria-live="polite" aria-atomic="true">
        Card {index + 1} of {total}
      </p>

      {/* Flip card */}
      <button
        ref={cardRef}
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        aria-label={flipped ? `Back: ${back}` : `Front: ${front}. Press Space to flip.`}
        aria-pressed={flipped}
        className={clsx(
          'relative w-full min-h-[160px] rounded-2xl border-2 cursor-pointer',
          'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          flipped
            ? 'bg-gradient-to-br from-teal-50 to-brand-50 border-teal-300'
            : 'bg-gradient-to-br from-brand-50 to-surface-50 border-brand-200 hover:border-brand-400',
        )}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]">
          <Badge
            variant={flipped ? 'teal' : 'brand'}
            size="sm"
            className="mb-3"
          >
            {flipped ? 'Answer' : 'Question'}
          </Badge>
          <p className={clsx(
            'text-base leading-relaxed font-medium',
            flipped ? 'text-teal-900' : 'text-ink-900',
          )}>
            {flipped ? back : front}
          </p>
        </div>
        <span className="absolute bottom-3 right-4 text-xs text-ink-400 select-none" aria-hidden="true">
          Space / click to flip
        </span>
      </button>

      {/* Nav controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Previous flashcard"
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'border border-surface-200 bg-white transition-all',
            'hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <ChevronLeft size={18} className="text-ink-700" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5" aria-hidden="true" role="presentation">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={clsx(
                'w-2 h-2 rounded-full transition-all duration-200',
                i === index ? 'bg-brand-500 scale-125' : 'bg-surface-300',
              )}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={index === total - 1}
          aria-label="Next flashcard"
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'border border-surface-200 bg-white transition-all',
            'hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <ChevronRight size={18} className="text-ink-700" />
        </button>
      </div>
    </div>
  );
}

interface FlashcardsCardProps {
  flashcards: { front: string; back: string }[];
}

function FlashcardsCard({ flashcards }: FlashcardsCardProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setFlipped(false);
  }, []);

  const prev = useCallback(() => goTo(Math.max(0, current - 1)), [current, goTo]);
  const next = useCallback(() => goTo(Math.min(flashcards.length - 1, current + 1)), [current, flashcards.length, goTo]);
  const flip = useCallback(() => setFlipped((f) => !f), []);

  const handleReset = useCallback(() => {
    setCurrent(0);
    setFlipped(false);
  }, []);

  if (flashcards.length === 0) return null;

  const card = flashcards[current];

  return (
    <Card padding="lg" className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Layers size={18} className="text-brand-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-ink-900">Flashcards</h2>
          <Badge variant="amber" size="sm">{flashcards.length} cards</Badge>
        </div>
        <button
          onClick={handleReset}
          aria-label="Reset flashcards to start"
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition-colors p-1.5 rounded-lg hover:bg-brand-50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>

      <FlashcardItem
        front={card.front}
        back={card.back}
        index={current}
        total={flashcards.length}
        flipped={flipped}
        onFlip={flip}
        onPrev={prev}
        onNext={next}
      />
    </Card>
  );
}

// ─── 4. Quiz ──────────────────────────────────────────────────────────────────

interface QuizQuestionItemProps {
  question: AiQuizQuestion;
  questionIndex: number;
  answered: number | null;
  onAnswer: (optionIndex: number) => void;
}

function QuizQuestionItem({ question, questionIndex, answered, onAnswer }: QuizQuestionItemProps) {
  const isAnswered = answered !== null;
  const isCorrect = answered === question.answerIndex;

  return (
    <div className="mb-6 last:mb-0" role="group" aria-labelledby={`quiz-q-${questionIndex}`}>
      <p
        id={`quiz-q-${questionIndex}`}
        className="font-semibold text-ink-900 mb-3 text-sm leading-relaxed"
      >
        <span className="text-brand-500 mr-1.5" aria-hidden="true">Q{questionIndex + 1}.</span>
        {question.question}
      </p>

      <div className="space-y-2" role="radiogroup" aria-labelledby={`quiz-q-${questionIndex}`}>
        {question.options.map((option, i) => {
          const isSelected = answered === i;
          const showCorrect = isAnswered && i === question.answerIndex;
          const showWrong = isAnswered && isSelected && !isCorrect;

          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              disabled={isAnswered}
              onClick={() => onAnswer(i)}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
                isAnswered ? 'cursor-default' : 'cursor-pointer hover:border-brand-300 hover:bg-brand-50',
                showCorrect
                  ? 'border-teal-400 bg-teal-50 text-teal-900'
                  : showWrong
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : isSelected
                  ? 'border-brand-400 bg-brand-50 text-brand-900'
                  : 'border-surface-200 bg-white text-ink-800',
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={clsx(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0',
                    showCorrect
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : showWrong
                      ? 'border-red-400 bg-red-400 text-white'
                      : 'border-current text-current',
                  )}
                  aria-hidden="true"
                >
                  {showCorrect ? (
                    <CheckCircle2 size={12} />
                  ) : showWrong ? (
                    <XCircle size={12} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reveal explanation */}
      {isAnswered && (
        <div
          className={clsx(
            'mt-3 rounded-xl px-4 py-3 text-sm leading-relaxed',
            isCorrect
              ? 'bg-teal-50 border border-teal-200 text-teal-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900',
          )}
          role="alert"
          aria-live="polite"
        >
          <span className="font-semibold mr-1">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

interface QuizCardProps {
  quiz: AiQuizQuestion[];
}

function QuizCard({ quiz }: QuizCardProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const answered = answers.filter((a) => a !== null).length;
  const correct = answers.filter((a, i) => a === quiz[i]?.answerIndex).length;
  const allDone = answered === quiz.length;

  const handleAnswer = useCallback((qi: number, optionIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = optionIdx;
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setAnswers(quiz.map(() => null));
  }, [quiz]);

  return (
    <Card padding="lg" className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <HelpCircle size={18} className="text-brand-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-ink-900">Practice Quiz</h2>
          <Badge variant="brand" size="sm">{quiz.length} questions</Badge>
        </div>
        {answered > 0 && (
          <button
            onClick={handleReset}
            aria-label="Restart quiz"
            className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition-colors p-1.5 rounded-lg hover:bg-brand-50"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Restart
          </button>
        )}
      </div>

      {/* Progress bar */}
      {answered > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-ink-500 mb-1.5">
            <span>{answered} of {quiz.length} answered</span>
            {allDone && (
              <span className="font-semibold text-teal-600">
                Score: {correct}/{quiz.length} ({Math.round((correct / quiz.length) * 100)}%)
              </span>
            )}
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={answered} aria-valuemax={quiz.length}>
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${(answered / quiz.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {allDone && (
        <div className={clsx(
          'mb-5 rounded-2xl px-5 py-4 text-center',
          correct === quiz.length
            ? 'bg-gradient-to-r from-teal-50 to-brand-50 border border-teal-200'
            : correct >= quiz.length / 2
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-surface-50 border border-surface-200',
        )}>
          <p className="text-lg font-semibold text-ink-900 mb-1">
            {correct === quiz.length
              ? 'Perfect score! Excellent work!'
              : correct >= quiz.length / 2
              ? 'Good effort! Keep reviewing.'
              : 'Keep studying — you\'ll get there!'}
          </p>
          <p className="text-sm text-ink-600">
            You got {correct} out of {quiz.length} questions correct.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw size={14} />}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {quiz.map((q, i) => (
        <QuizQuestionItem
          key={i}
          question={q}
          questionIndex={i}
          answered={answers[i]}
          onAnswer={(optIdx) => handleAnswer(i, optIdx)}
        />
      ))}
    </Card>
  );
}

// ─── Main StudyKitView ────────────────────────────────────────────────────────

export function StudyKitView({ kit, lang, className }: StudyKitViewProps) {
  // Detect RTL from language code
  const rtlLangs = new Set(['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd', 'dv', 'ug']);
  const langCode = lang?.split('-')[0]?.toLowerCase();
  const isRtl = langCode ? rtlLangs.has(langCode) : false;

  return (
    <section
      className={clsx('space-y-6', className)}
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label="AI Study Kit"
      data-testid="study-kit-view"
    >
      {/* Header eyebrow */}
      <div className="flex items-center gap-3 animate-fade-up">
        <p className="eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          AI Study Kit
        </p>
        {kit.gradeId && (
          <Badge variant="teal" size="sm">
            {kit.gradeId.replace('grade-', 'Grade ')}
          </Badge>
        )}
      </div>

      {/* Summary */}
      <SummaryCard
        summary={kit.summary}
        gradeId={kit.gradeId}
        generatedAt={kit.generatedAt}
      />

      {/* Key Terms */}
      {kit.keyTerms.length > 0 && (
        <KeyTermsCard keyTerms={kit.keyTerms} />
      )}

      {/* Flashcards */}
      {kit.flashcards.length > 0 && (
        <FlashcardsCard flashcards={kit.flashcards} />
      )}

      {/* Quiz */}
      {kit.quiz.length > 0 && (
        <QuizCard quiz={kit.quiz} />
      )}
    </section>
  );
}

export default StudyKitView;
