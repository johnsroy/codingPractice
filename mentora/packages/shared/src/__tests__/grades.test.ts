import { describe, it, expect } from 'vitest';
import { GRADES, SUBJECTS } from '../grades';

// ---------------------------------------------------------------------------
// GRADES
// ---------------------------------------------------------------------------
describe('GRADES', () => {
  it('has exactly 12 entries', () => {
    expect(GRADES).toHaveLength(12);
  });

  it('has correct labels "Class 1" through "Class 12"', () => {
    for (let n = 1; n <= 12; n++) {
      expect(GRADES[n - 1].label).toBe(`Class ${n}`);
    }
  });

  it('has correct ids "grade-1" through "grade-12"', () => {
    for (let n = 1; n <= 12; n++) {
      expect(GRADES[n - 1].id).toBe(`grade-${n}`);
    }
  });

  it('order matches the 1-based index', () => {
    for (let i = 0; i < GRADES.length; i++) {
      expect(GRADES[i].order).toBe(i + 1);
    }
  });

  it('orders are unique', () => {
    const orders = GRADES.map((g) => g.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('ids are unique', () => {
    const ids = GRADES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Stage boundaries: primary 1-5, middle 6-8, secondary 9-12
  describe('stage boundaries', () => {
    it('grades 1-5 are "primary"', () => {
      for (let n = 1; n <= 5; n++) {
        const grade = GRADES[n - 1];
        expect(grade.stage).toBe('primary');
      }
    });

    it('grades 6-8 are "middle"', () => {
      for (let n = 6; n <= 8; n++) {
        const grade = GRADES[n - 1];
        expect(grade.stage).toBe('middle');
      }
    });

    it('grades 9-12 are "secondary"', () => {
      for (let n = 9; n <= 12; n++) {
        const grade = GRADES[n - 1];
        expect(grade.stage).toBe('secondary');
      }
    });

    it('exactly 5 primary grades', () => {
      expect(GRADES.filter((g) => g.stage === 'primary')).toHaveLength(5);
    });

    it('exactly 3 middle grades', () => {
      expect(GRADES.filter((g) => g.stage === 'middle')).toHaveLength(3);
    });

    it('exactly 4 secondary grades', () => {
      expect(GRADES.filter((g) => g.stage === 'secondary')).toHaveLength(4);
    });

    it('stage values are only the three allowed values', () => {
      const validStages = new Set(['primary', 'middle', 'secondary']);
      for (const grade of GRADES) {
        expect(validStages.has(grade.stage)).toBe(true);
      }
    });
  });

  describe('boundary grades', () => {
    it('grade 5 is primary (last primary)', () => {
      expect(GRADES[4].stage).toBe('primary');
    });

    it('grade 6 is middle (first middle)', () => {
      expect(GRADES[5].stage).toBe('middle');
    });

    it('grade 8 is middle (last middle)', () => {
      expect(GRADES[7].stage).toBe('middle');
    });

    it('grade 9 is secondary (first secondary)', () => {
      expect(GRADES[8].stage).toBe('secondary');
    });

    it('grade 12 is secondary (last secondary)', () => {
      expect(GRADES[11].stage).toBe('secondary');
    });
  });
});

// ---------------------------------------------------------------------------
// SUBJECTS
// ---------------------------------------------------------------------------
describe('SUBJECTS', () => {
  it('is non-empty', () => {
    expect(SUBJECTS.length).toBeGreaterThan(0);
  });

  it('all subjects have a non-empty id', () => {
    for (const subject of SUBJECTS) {
      expect(typeof subject.id).toBe('string');
      expect(subject.id.length).toBeGreaterThan(0);
    }
  });

  it('all subjects have a non-empty label', () => {
    for (const subject of SUBJECTS) {
      expect(typeof subject.label).toBe('string');
      expect(subject.label.length).toBeGreaterThan(0);
    }
  });

  it('subject ids are unique', () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('contains expected core subject ids', () => {
    const ids = SUBJECTS.map((s) => s.id);
    const expected = [
      'math',
      'science',
      'english',
      'social-studies',
      'history',
      'geography',
      'computer-science',
      'languages',
      'art',
      'life-skills',
      'exam-prep',
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it('has exactly 11 subjects', () => {
    expect(SUBJECTS).toHaveLength(11);
  });
});
