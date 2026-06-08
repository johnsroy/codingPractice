import { describe, it, expect } from 'vitest';
import {
  LEARNER_PLANS,
  TEACHER_PLANS,
  ALL_PLANS,
  getPlan,
  COMMISSION,
  splitEarnings,
  formatPrice,
} from '../pricing';

// ---------------------------------------------------------------------------
// COMMISSION constants
// ---------------------------------------------------------------------------
describe('COMMISSION', () => {
  it('standard tier is 15%', () => {
    expect(COMMISSION.standard).toBe(15);
  });

  it('pro tier is 10%', () => {
    expect(COMMISSION.pro).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// splitEarnings
// ---------------------------------------------------------------------------
describe('splitEarnings', () => {
  describe('standard tier (15%)', () => {
    it('returns correct split for a round amount ($10.00 = 1000 cents)', () => {
      const result = splitEarnings(1000, 'standard');
      expect(result.grossCents).toBe(1000);
      expect(result.commissionPct).toBe(15);
      expect(result.platformFeeCents).toBe(150);
      expect(result.payoutCents).toBe(850);
    });

    it('payout + fee always equals gross (round amount)', () => {
      const result = splitEarnings(1000, 'standard');
      expect(result.payoutCents + result.platformFeeCents).toBe(result.grossCents);
    });

    it('handles $0 gross', () => {
      const result = splitEarnings(0, 'standard');
      expect(result.platformFeeCents).toBe(0);
      expect(result.payoutCents).toBe(0);
    });

    it('handles large amounts ($500.00)', () => {
      const result = splitEarnings(50000, 'standard');
      expect(result.platformFeeCents).toBe(7500);
      expect(result.payoutCents).toBe(42500);
      expect(result.payoutCents + result.platformFeeCents).toBe(50000);
    });

    it('defaults to standard tier when no tier arg given', () => {
      const explicit = splitEarnings(1000, 'standard');
      const implicit = splitEarnings(1000);
      expect(implicit).toEqual(explicit);
    });

    // Odd-cents rounding: 1 cent * 15% = 0.15 → rounds to 0
    it('rounding edge case: 1 cent gross', () => {
      const result = splitEarnings(1, 'standard');
      expect(result.platformFeeCents).toBe(0); // Math.round(0.15) = 0
      expect(result.payoutCents).toBe(1);
      expect(result.payoutCents + result.platformFeeCents).toBe(1);
    });

    // 3 cents * 15% = 0.45 → rounds to 0
    it('rounding edge case: 3 cents gross', () => {
      const result = splitEarnings(3, 'standard');
      expect(result.platformFeeCents).toBe(0); // Math.round(0.45) = 0
      expect(result.payoutCents).toBe(3);
      expect(result.payoutCents + result.platformFeeCents).toBe(3);
    });

    // 7 cents * 15% = 1.05 → rounds to 1
    it('rounding edge case: 7 cents gross', () => {
      const result = splitEarnings(7, 'standard');
      expect(result.platformFeeCents).toBe(1); // Math.round(1.05) = 1
      expect(result.payoutCents).toBe(6);
      expect(result.payoutCents + result.platformFeeCents).toBe(7);
    });
  });

  describe('pro tier (10%)', () => {
    it('returns correct split for a round amount ($10.00 = 1000 cents)', () => {
      const result = splitEarnings(1000, 'pro');
      expect(result.grossCents).toBe(1000);
      expect(result.commissionPct).toBe(10);
      expect(result.platformFeeCents).toBe(100);
      expect(result.payoutCents).toBe(900);
    });

    it('payout + fee always equals gross (round amount)', () => {
      const result = splitEarnings(1000, 'pro');
      expect(result.payoutCents + result.platformFeeCents).toBe(result.grossCents);
    });

    it('payout + fee always equals gross ($19.99 session price)', () => {
      const result = splitEarnings(1999, 'pro');
      expect(result.payoutCents + result.platformFeeCents).toBe(1999);
    });

    // 1 cent * 10% = 0.10 → rounds to 0
    it('rounding edge case: 1 cent gross', () => {
      const result = splitEarnings(1, 'pro');
      expect(result.platformFeeCents).toBe(0); // Math.round(0.10) = 0
      expect(result.payoutCents).toBe(1);
      expect(result.payoutCents + result.platformFeeCents).toBe(1);
    });

    // 5 cents * 10% = 0.5 → Math.round rounds half-up → 1
    it('rounding edge case: 5 cents gross', () => {
      const result = splitEarnings(5, 'pro');
      expect(result.platformFeeCents).toBe(1); // Math.round(0.5) = 1
      expect(result.payoutCents).toBe(4);
      expect(result.payoutCents + result.platformFeeCents).toBe(5);
    });

    it('handles $0 gross', () => {
      const result = splitEarnings(0, 'pro');
      expect(result.platformFeeCents).toBe(0);
      expect(result.payoutCents).toBe(0);
    });
  });

  describe('invariant: payout + fee === gross for many values', () => {
    const testValues = [1, 3, 7, 100, 199, 999, 1000, 1234, 9999, 50000];
    for (const cents of testValues) {
      it(`holds for ${cents} cents (standard)`, () => {
        const r = splitEarnings(cents, 'standard');
        expect(r.payoutCents + r.platformFeeCents).toBe(r.grossCents);
      });
      it(`holds for ${cents} cents (pro)`, () => {
        const r = splitEarnings(cents, 'pro');
        expect(r.payoutCents + r.platformFeeCents).toBe(r.grossCents);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// getPlan
// ---------------------------------------------------------------------------
describe('getPlan', () => {
  it('finds "explorer" plan', () => {
    const plan = getPlan('explorer');
    expect(plan).toBeDefined();
    expect(plan!.id).toBe('explorer');
  });

  it('finds "scholar" plan', () => {
    const plan = getPlan('scholar');
    expect(plan).toBeDefined();
    expect(plan!.id).toBe('scholar');
  });

  it('finds "family" plan', () => {
    const plan = getPlan('family');
    expect(plan).toBeDefined();
    expect(plan!.id).toBe('family');
  });

  it('finds "mentor-free" plan', () => {
    const plan = getPlan('mentor-free');
    expect(plan).toBeDefined();
    expect(plan!.id).toBe('mentor-free');
  });

  it('finds "mentor-pro" plan', () => {
    const plan = getPlan('mentor-pro');
    expect(plan).toBeDefined();
    expect(plan!.id).toBe('mentor-pro');
  });

  it('returns undefined for unknown id', () => {
    expect(getPlan('nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getPlan('')).toBeUndefined();
  });

  it('is case-sensitive (uppercase fails)', () => {
    expect(getPlan('EXPLORER')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------
describe('formatPrice', () => {
  it('formats 0 cents as $0.00', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats 1000 cents as $10.00', () => {
    expect(formatPrice(1000)).toBe('$10.00');
  });

  it('formats 1900 cents as $19.00', () => {
    expect(formatPrice(1900)).toBe('$19.00');
  });

  it('formats 3900 cents as $39.00', () => {
    expect(formatPrice(3900)).toBe('$39.00');
  });

  it('formats 1200 cents as $12.00', () => {
    expect(formatPrice(1200)).toBe('$12.00');
  });

  it('formats 199 cents as $1.99', () => {
    expect(formatPrice(199)).toBe('$1.99');
  });

  it('formats 1 cent as $0.01', () => {
    expect(formatPrice(1)).toBe('$0.01');
  });

  it('uses default USD currency', () => {
    // Both calls should produce the same output
    expect(formatPrice(1000)).toBe(formatPrice(1000, 'USD'));
  });
});

// ---------------------------------------------------------------------------
// Plan collections – structural invariants
// ---------------------------------------------------------------------------
describe('LEARNER_PLANS', () => {
  it('has exactly 3 plans', () => {
    expect(LEARNER_PLANS).toHaveLength(3);
  });

  it('all plans have required fields', () => {
    for (const plan of LEARNER_PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.audience).toBe('learner');
    }
  });

  it('every feature has a label and boolean included', () => {
    for (const plan of LEARNER_PLANS) {
      for (const feature of plan.features) {
        expect(typeof feature.label).toBe('string');
        expect(feature.label.length).toBeGreaterThan(0);
        expect(typeof feature.included).toBe('boolean');
      }
    }
  });

  it('exactly one plan is marked popular', () => {
    const popular = LEARNER_PLANS.filter((p) => p.popular === true);
    expect(popular).toHaveLength(1);
    expect(popular[0].id).toBe('scholar');
  });

  it('explorer plan is free (0 cents)', () => {
    const explorer = LEARNER_PLANS.find((p) => p.id === 'explorer');
    expect(explorer!.priceCents).toBe(0);
  });

  it('plan ids are unique', () => {
    const ids = LEARNER_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TEACHER_PLANS', () => {
  it('has exactly 2 plans', () => {
    expect(TEACHER_PLANS).toHaveLength(2);
  });

  it('all plans have required fields', () => {
    for (const plan of TEACHER_PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.audience).toBe('teacher');
    }
  });

  it('every feature has a label and boolean included', () => {
    for (const plan of TEACHER_PLANS) {
      for (const feature of plan.features) {
        expect(typeof feature.label).toBe('string');
        expect(feature.label.length).toBeGreaterThan(0);
        expect(typeof feature.included).toBe('boolean');
      }
    }
  });

  it('exactly one plan is marked popular', () => {
    const popular = TEACHER_PLANS.filter((p) => p.popular === true);
    expect(popular).toHaveLength(1);
    expect(popular[0].id).toBe('mentor-pro');
  });

  it('mentor-free plan is free (0 cents)', () => {
    const free = TEACHER_PLANS.find((p) => p.id === 'mentor-free');
    expect(free!.priceCents).toBe(0);
  });

  it('plan ids are unique', () => {
    const ids = TEACHER_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ALL_PLANS', () => {
  it('is the union of LEARNER_PLANS and TEACHER_PLANS', () => {
    expect(ALL_PLANS).toHaveLength(LEARNER_PLANS.length + TEACHER_PLANS.length);
  });

  it('contains all learner plan ids', () => {
    const allIds = ALL_PLANS.map((p) => p.id);
    for (const plan of LEARNER_PLANS) {
      expect(allIds).toContain(plan.id);
    }
  });

  it('contains all teacher plan ids', () => {
    const allIds = ALL_PLANS.map((p) => p.id);
    for (const plan of TEACHER_PLANS) {
      expect(allIds).toContain(plan.id);
    }
  });

  it('all plan ids are globally unique', () => {
    const ids = ALL_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
