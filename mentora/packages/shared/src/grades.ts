/** Grade levels supported by Mentora: Class 1 through Class 12. */
export interface GradeLevel {
  id: string; // e.g. "grade-1"
  label: string; // e.g. "Class 1"
  order: number;
  stage: 'primary' | 'middle' | 'secondary';
}

export const GRADES: GradeLevel[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const stage: GradeLevel['stage'] =
    n <= 5 ? 'primary' : n <= 8 ? 'middle' : 'secondary';
  return { id: `grade-${n}`, label: `Class ${n}`, order: n, stage };
});

/** Core subjects offered. Teachers can also propose custom subjects. */
export const SUBJECTS = [
  { id: 'math', label: 'Mathematics', emoji: '🔢' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'english', label: 'English', emoji: '📖' },
  { id: 'social-studies', label: 'Social Studies', emoji: '🌍' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'geography', label: 'Geography', emoji: '🗺️' },
  { id: 'computer-science', label: 'Computer Science', emoji: '💻' },
  { id: 'languages', label: 'Languages', emoji: '🗣️' },
  { id: 'art', label: 'Art & Music', emoji: '🎨' },
  { id: 'life-skills', label: 'Life Skills', emoji: '🌱' },
  { id: 'exam-prep', label: 'Exam Preparation', emoji: '🎯' },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]['id'];
