import { describe, it, expect } from 'vitest';
import { ROLES, ALL_ROLES } from '../roles';

describe('ROLES', () => {
  it('defines TEACHER role', () => {
    expect(ROLES.TEACHER).toBe('TEACHER');
  });

  it('defines STUDENT role', () => {
    expect(ROLES.STUDENT).toBe('STUDENT');
  });

  it('defines GUARDIAN role', () => {
    expect(ROLES.GUARDIAN).toBe('GUARDIAN');
  });

  it('defines ADMIN role', () => {
    expect(ROLES.ADMIN).toBe('ADMIN');
  });
});

describe('ALL_ROLES', () => {
  it('contains exactly 4 roles', () => {
    expect(ALL_ROLES).toHaveLength(4);
  });

  it('contains TEACHER', () => {
    expect(ALL_ROLES).toContain('TEACHER');
  });

  it('contains STUDENT', () => {
    expect(ALL_ROLES).toContain('STUDENT');
  });

  it('contains GUARDIAN', () => {
    expect(ALL_ROLES).toContain('GUARDIAN');
  });

  it('contains ADMIN', () => {
    expect(ALL_ROLES).toContain('ADMIN');
  });

  it('has no duplicate entries', () => {
    expect(new Set(ALL_ROLES).size).toBe(ALL_ROLES.length);
  });

  it('matches the values of the ROLES object', () => {
    const roleValues = Object.values(ROLES);
    expect(ALL_ROLES).toEqual(expect.arrayContaining(roleValues));
    expect(roleValues).toEqual(expect.arrayContaining(ALL_ROLES));
  });
});
