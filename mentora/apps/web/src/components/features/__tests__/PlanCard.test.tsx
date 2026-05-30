/**
 * PlanCard (inline from pricing/page.tsx) — static rendering test.
 *
 * Because PlanCard is not exported, we re-implement a minimal version that
 * matches its render contract exactly. All assertions are against the
 * shared ALL_PLANS data and formatPrice — the single source of truth.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ALL_PLANS, LEARNER_PLANS, TEACHER_PLANS, formatPrice, type Plan } from '@mentora/shared';

// ---------------------------------------------------------------------------
// Minimal PlanCard — mirrors the real component's output without Next.js deps.
// ---------------------------------------------------------------------------
function PlanCard({ plan, annual = false }: { plan: Plan; annual?: boolean }) {
  const price =
    annual && plan.annualPriceCents != null
      ? plan.annualPriceCents / 12
      : plan.priceCents;
  const isFree = price === 0;

  return (
    <article aria-label={plan.name}>
      <h3>{plan.name}</h3>
      <p>{plan.tagline}</p>
      <div data-testid="price">
        {isFree ? 'Free' : formatPrice(price)}
      </div>
      {annual && plan.annualPriceCents != null && plan.priceCents > 0 && (
        <p data-testid="billed-note">
          {`Billed ${formatPrice(plan.annualPriceCents)} per year`}
        </p>
      )}
      {plan.popular && <span data-testid="popular-badge">Most popular</span>}
      <ul>
        {plan.features.map((f) => (
          <li key={f.label} data-included={f.included ? 'true' : 'false'}>
            {f.label}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlanCard with ALL_PLANS data', () => {
  it('renders all plan names from ALL_PLANS', () => {
    const { container } = render(
      <>
        {ALL_PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </>,
    );
    for (const plan of ALL_PLANS) {
      expect(screen.getByRole('article', { name: plan.name })).toBeInTheDocument();
    }
  });

  it('shows "Free" for plans with priceCents === 0', () => {
    const freePlans = ALL_PLANS.filter((p) => p.priceCents === 0);
    expect(freePlans.length).toBeGreaterThan(0);
    render(
      <>
        {freePlans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </>,
    );
    const priceEls = screen.getAllByTestId('price');
    priceEls.forEach((el) => {
      expect(el).toHaveTextContent('Free');
    });
  });

  it('formats paid plan prices with formatPrice', () => {
    const paidPlans = LEARNER_PLANS.filter((p) => p.priceCents > 0);
    render(
      <>
        {paidPlans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </>,
    );
    for (const plan of paidPlans) {
      expect(screen.getByRole('article', { name: plan.name })
        .querySelector('[data-testid="price"]')!
        .textContent,
      ).toBe(formatPrice(plan.priceCents));
    }
  });

  it('shows the annual billed note when annual=true and annualPriceCents is set', () => {
    const scholarPlan = LEARNER_PLANS.find((p) => p.id === 'scholar')!;
    render(<PlanCard plan={scholarPlan} annual />);
    const note = screen.getByTestId('billed-note');
    expect(note).toHaveTextContent(
      `Billed ${formatPrice(scholarPlan.annualPriceCents!)} per year`,
    );
  });

  it('shows the monthly-equivalent price when annual=true', () => {
    const scholarPlan = LEARNER_PLANS.find((p) => p.id === 'scholar')!;
    render(<PlanCard plan={scholarPlan} annual />);
    const expectedMonthlyEquiv = formatPrice(scholarPlan.annualPriceCents! / 12);
    expect(screen.getByTestId('price')).toHaveTextContent(expectedMonthlyEquiv);
  });

  it('marks the "popular" plan with the most-popular badge', () => {
    const popularPlan = ALL_PLANS.find((p) => p.popular)!;
    render(<PlanCard plan={popularPlan} />);
    expect(screen.getByTestId('popular-badge')).toBeInTheDocument();
  });

  it('does not show a popular badge for non-popular plans', () => {
    const nonPopular = ALL_PLANS.find((p) => !p.popular)!;
    render(<PlanCard plan={nonPopular} />);
    expect(screen.queryByTestId('popular-badge')).not.toBeInTheDocument();
  });

  it('renders all features for every plan', () => {
    render(
      <>
        {ALL_PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </>,
    );
    for (const plan of ALL_PLANS) {
      const article = screen.getByRole('article', { name: plan.name });
      const items = article.querySelectorAll('li');
      expect(items.length).toBe(plan.features.length);
    }
  });

  it('marks included features with data-included="true"', () => {
    const scholarPlan = LEARNER_PLANS.find((p) => p.id === 'scholar')!;
    render(<PlanCard plan={scholarPlan} />);
    const article = screen.getByRole('article', { name: scholarPlan.name });
    const includedItems = article.querySelectorAll('[data-included="true"]');
    const expectedCount = scholarPlan.features.filter((f) => f.included).length;
    expect(includedItems.length).toBe(expectedCount);
  });

  it('marks excluded features with data-included="false"', () => {
    const scholarPlan = LEARNER_PLANS.find((p) => p.id === 'scholar')!;
    render(<PlanCard plan={scholarPlan} />);
    const article = screen.getByRole('article', { name: scholarPlan.name });
    const excludedItems = article.querySelectorAll('[data-included="false"]');
    const expectedCount = scholarPlan.features.filter((f) => !f.included).length;
    expect(excludedItems.length).toBe(expectedCount);
  });

  it('formatPrice produces the expected "$X.XX" output for scholar plan', () => {
    const scholarPlan = LEARNER_PLANS.find((p) => p.id === 'scholar')!;
    // $19 / month
    expect(formatPrice(scholarPlan.priceCents)).toBe('$19.00');
  });

  it('formatPrice produces the expected output for the family plan', () => {
    const familyPlan = LEARNER_PLANS.find((p) => p.id === 'family')!;
    // $39 / month
    expect(formatPrice(familyPlan.priceCents)).toBe('$39.00');
  });

  it('TEACHER_PLANS includes mentor-pro as popular', () => {
    const mentorPro = TEACHER_PLANS.find((p) => p.id === 'mentor-pro')!;
    expect(mentorPro.popular).toBe(true);
  });

  it('LEARNER_PLANS has exactly 3 plans', () => {
    expect(LEARNER_PLANS).toHaveLength(3);
  });

  it('ALL_PLANS contains both learner and teacher plans', () => {
    const learnerCount = ALL_PLANS.filter((p) => p.audience === 'learner').length;
    const teacherCount = ALL_PLANS.filter((p) => p.audience === 'teacher').length;
    expect(learnerCount).toBe(LEARNER_PLANS.length);
    expect(teacherCount).toBe(TEACHER_PLANS.length);
  });
});
