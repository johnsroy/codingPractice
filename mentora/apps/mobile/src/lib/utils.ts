/**
 * Shared utility helpers used across screens.
 */

import { SUBJECTS, GRADES, formatPrice } from '@mentora/shared';

/** Format an ISO date string into a human-readable date + time. */
export function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Format a cents value into a display price; returns "Free" for 0. */
export function displayPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return formatPrice(cents);
}

/** Look up a subject label by its id. */
export function subjectLabel(id: string): string {
  return SUBJECTS.find((s) => s.id === id)?.label ?? id;
}

/** Look up a grade label by its id. */
export function gradeLabel(id: string): string {
  return GRADES.find((g) => g.id === id)?.label ?? id;
}

/** Truncate a string to maxLen characters with an ellipsis. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
