/** User roles across Mentora. */
export const ROLES = {
  /** A retired/seasoned professional who teaches. */
  TEACHER: 'TEACHER',
  /** A learner (often a child); account may be operated by a guardian. */
  STUDENT: 'STUDENT',
  /** A parent/guardian managing one or more student accounts. */
  GUARDIAN: 'GUARDIAN',
  /** Platform administrator. */
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);
