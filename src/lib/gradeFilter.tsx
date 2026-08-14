import type { Chip } from '../components/Ui';
import { ordinal } from './tm';

/*
 * The grade filter's chips, shared by every list that is cut by grade.
 *
 * Two lists use it — the subjects in Sapaklar and the interactives in
 * Interaktiw sapaklar — and they must offer the same twelve choices in the same
 * words,
 * because they are the same question asked twice: which year's material am I
 * looking at?
 *
 * Each chip says the noun: "7-nji synp", not "7-nji". A bare ordinal beside a
 * list of subjects can be read as an order or a level; the row scrolls, so the
 * word costs a swipe rather than a meaning.
 *
 * `ALL` is the twelve-grade view — the whole programme of every subject, which
 * is what a reader who does not know which year a topic falls in starts from.
 */
export const ALL = 'all';

export const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export const gradeChips: Chip[] = [
  { id: ALL, label: 'Ählisi' },
  ...GRADES.map((g) => ({ id: String(g), label: `${ordinal(g)} synp` })),
];

/** The chip row's value for a grade, and back — `undefined` is "Ählisi". */
export const chipValue = (grade?: number) => (grade === undefined ? ALL : String(grade));
export const chipGrade = (id: string) => (id === ALL ? undefined : Number(id));
