/**
 * StudyKitView — unit tests (Vitest + RTL).
 *
 * What we test:
 * 1. Summary is rendered.
 * 2. Key terms are listed (term + definition).
 * 3. Flashcards: front shown by default; click/keyboard to flip; counter shows 1 of N.
 * 4. Quiz: renders questions; selecting an option shows explanation; score shown on completion.
 * 5. RTL: dir="rtl" when language is Arabic; dir="ltr" for default.
 * 6. Accessibility: ARIA roles and labels present.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudyKitView } from '../StudyKitView';
import type { StudyKit } from '@/lib/api';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const SAMPLE_KIT: StudyKit = {
  summary: 'Photosynthesis is how plants make food from sunlight, water, and CO2.',
  keyTerms: [
    { term: 'Photosynthesis', definition: 'The process by which plants use sunlight to synthesize nutrients.' },
    { term: 'Chlorophyll', definition: 'The green pigment in plants that captures light energy.' },
    { term: 'Glucose', definition: 'The sugar produced by photosynthesis as stored energy.' },
  ],
  flashcards: [
    { front: 'What is photosynthesis?', back: 'The process plants use to convert sunlight into food.' },
    { front: 'Where does photosynthesis occur?', back: 'In the chloroplasts of plant cells.' },
    { front: 'What gas do plants release?', back: 'Oxygen (O2) is released as a by-product.' },
  ],
  quiz: [
    {
      question: 'Which molecule is produced during photosynthesis?',
      options: ['Glucose', 'Protein', 'Lipid', 'DNA'],
      answerIndex: 0,
      explanation: 'Glucose (C6H12O6) is the primary product of the Calvin cycle.',
    },
    {
      question: 'What absorbs light in plant cells?',
      options: ['Mitochondria', 'Nucleus', 'Chlorophyll', 'Ribosome'],
      answerIndex: 2,
      explanation: 'Chlorophyll in the chloroplast absorbs light energy for photosynthesis.',
    },
  ],
  gradeId: 'grade-7',
  generatedAt: '2026-06-10T12:00:00.000Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StudyKitView — summary', () => {
  it('renders the summary text', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByText(SAMPLE_KIT.summary)).toBeInTheDocument();
  });

  it('renders the grade badge from gradeId', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // gradeId = "grade-7" → "Grade 7"
    expect(screen.getAllByText(/Grade 7/i).length).toBeGreaterThan(0);
  });

  it('renders the study-kit section landmark', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByRole('region', { name: /AI Study Kit/i })).toBeInTheDocument();
  });
});

describe('StudyKitView — key terms', () => {
  it('renders all key terms', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    for (const { term } of SAMPLE_KIT.keyTerms) {
      // A term may also appear as a quiz option, so assert it appears at least once.
      expect(screen.getAllByText(term).length).toBeGreaterThan(0);
    }
  });

  it('renders term definitions', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    for (const { definition } of SAMPLE_KIT.keyTerms) {
      expect(screen.getByText(definition)).toBeInTheDocument();
    }
  });
});

describe('StudyKitView — flashcards', () => {
  it('shows flashcard counter "Card 1 of 3"', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
  });

  it('shows the front of the first flashcard by default', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByText(SAMPLE_KIT.flashcards[0].front)).toBeInTheDocument();
  });

  it('flips to show back when card is clicked', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const card = screen.getByRole('button', { name: /Front:/i });
    fireEvent.click(card);
    expect(screen.getByText(SAMPLE_KIT.flashcards[0].back)).toBeInTheDocument();
  });

  it('flips back to front when clicked again', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const card = screen.getByRole('button', { name: /Front:/i });
    fireEvent.click(card);
    const flippedCard = screen.getByRole('button', { name: /Back:/i });
    fireEvent.click(flippedCard);
    expect(screen.getByText(SAMPLE_KIT.flashcards[0].front)).toBeInTheDocument();
  });

  it('navigates to next card and resets flip state', async () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // Flip the first card
    const card = screen.getByRole('button', { name: /Front:/i });
    fireEvent.click(card);
    // Navigate to next
    const nextBtn = screen.getByRole('button', { name: /Next flashcard/i });
    fireEvent.click(nextBtn);
    // Should show card 2 front (not flipped)
    expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_KIT.flashcards[1].front)).toBeInTheDocument();
  });

  it('previous button is disabled on first card', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const prevBtn = screen.getByRole('button', { name: /Previous flashcard/i });
    expect(prevBtn).toBeDisabled();
  });

  it('flips card on Space key', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const card = screen.getByRole('button', { name: /Front:/i });
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(screen.getByText(SAMPLE_KIT.flashcards[0].back)).toBeInTheDocument();
  });

  it('navigates with arrow keys', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const card = screen.getByRole('button', { name: /Front:/i });
    fireEvent.keyDown(card, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
  });
});

describe('StudyKitView — quiz', () => {
  it('renders all quiz questions', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByText(SAMPLE_KIT.quiz[0].question)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_KIT.quiz[1].question)).toBeInTheDocument();
  });

  it('renders all options for a question', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    for (const option of SAMPLE_KIT.quiz[0].options) {
      // An option may also be a key term, so assert it appears at least once.
      expect(screen.getAllByText(option).length).toBeGreaterThan(0);
    }
  });

  it('selecting the correct answer shows "Correct!" feedback', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // Q1 correct answer is index 0 → "Glucose"
    const glucoseBtn = screen.getByRole('radio', { name: /Glucose/i });
    fireEvent.click(glucoseBtn);
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_KIT.quiz[0].explanation)).toBeInTheDocument();
  });

  it('selecting the wrong answer shows "Not quite." feedback', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // Q1 wrong answer — "Protein" (index 1)
    const proteinBtn = screen.getByRole('radio', { name: /Protein/i });
    fireEvent.click(proteinBtn);
    expect(screen.getByText(/Not quite\./i)).toBeInTheDocument();
  });

  it('shows score when all questions are answered', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // Answer Q1 correctly
    fireEvent.click(screen.getByRole('radio', { name: /Glucose/i }));
    // Answer Q2 correctly (Chlorophyll — index 2, radio name "Chlorophyll")
    const radios = screen.getAllByRole('radio', { name: /Chlorophyll/i });
    fireEvent.click(radios[radios.length - 1]);
    // Score should appear
    expect(screen.getByText(/Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/2\/2/)).toBeInTheDocument();
  });
});

describe('StudyKitView — RTL', () => {
  it('applies dir="rtl" when lang is "ar"', () => {
    render(<StudyKitView kit={SAMPLE_KIT} lang="ar" />);
    const section = screen.getByTestId('study-kit-view');
    expect(section).toHaveAttribute('dir', 'rtl');
  });

  it('applies dir="ltr" by default', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    const section = screen.getByTestId('study-kit-view');
    expect(section).toHaveAttribute('dir', 'ltr');
  });

  it('applies dir="ltr" when lang is "en"', () => {
    render(<StudyKitView kit={SAMPLE_KIT} lang="en" />);
    const section = screen.getByTestId('study-kit-view');
    expect(section).toHaveAttribute('dir', 'ltr');
  });

  it('applies dir="rtl" when lang is "ur" (Urdu)', () => {
    render(<StudyKitView kit={SAMPLE_KIT} lang="ur" />);
    const section = screen.getByTestId('study-kit-view');
    expect(section).toHaveAttribute('dir', 'rtl');
  });
});

describe('StudyKitView — accessibility', () => {
  it('has a region landmark with label "AI Study Kit"', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    expect(screen.getByRole('region', { name: /AI Study Kit/i })).toBeInTheDocument();
  });

  it('progress bar has correct ARIA attributes', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // Answer one question to trigger progress bar
    fireEvent.click(screen.getByRole('radio', { name: /Glucose/i }));
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(progress).toHaveAttribute('aria-valuemax', '2');
  });

  it('flashcard counter uses aria-live', () => {
    render(<StudyKitView kit={SAMPLE_KIT} />);
    // The counter element has aria-live="polite"
    const counter = screen.getByText('Card 1 of 3');
    expect(counter).toHaveAttribute('aria-live', 'polite');
  });

  it('renders nothing when flashcards array is empty', () => {
    const kit = { ...SAMPLE_KIT, flashcards: [] };
    render(<StudyKitView kit={kit} />);
    expect(screen.queryByText(/Flashcards/i)).not.toBeInTheDocument();
  });

  it('renders nothing when quiz array is empty', () => {
    const kit = { ...SAMPLE_KIT, quiz: [] };
    render(<StudyKitView kit={kit} />);
    expect(screen.queryByText(/Practice Quiz/i)).not.toBeInTheDocument();
  });
});
