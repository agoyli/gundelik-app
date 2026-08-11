import { useSyncExternalStore } from 'react';
import { TODAY } from '../lib/date';
import type { Answers } from '../data/career';

/*
 * The last time the career test was taken.
 *
 * It stores the **answers and the date**, not the ranking. The ranking is
 * computed from the answers wherever it is shown, so it can never contradict
 * them — and when the speciality list grows, an old result re-ranks against the
 * new list instead of quietly pointing at a shorter one.
 *
 * A module store rather than component state because two screens read it: the
 * test itself, and the Profil row that says whether it has been taken.
 */

export type CareerResult = { at: string; answers: Answers };

let result: CareerResult | null = null;

let listeners: (() => void)[] = [];
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
};

export const useCareerResult = () => useSyncExternalStore(subscribe, () => result);

export const saveCareerResult = (answers: Answers) => {
  result = { at: TODAY, answers };
  emit();
};

export const clearCareerResult = () => {
  result = null;
  emit();
};
