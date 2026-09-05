/*
 * Whose diary is open.
 *
 * A parent with two children at school had to read one diary and imagine the
 * other. The account holds a list of children, the diary reads one of them, and
 * every screen that says "the pupil" means whichever one is selected here.
 *
 * The selection is deliberately not a URL, a prop drilled through the shell or
 * a copy inside `useSchedule`: it is one value the whole app subscribes to, the
 * same way `prefs` holds the tier — so the day, the summary and the profile
 * cannot end up describing two different children.
 *
 * A single-child account never sees any of this: the switcher only exists when
 * there is something to switch between.
 */

import { useSyncExternalStore } from 'react';

export type Child = {
  id: string;
  name: string;
  /** what the switcher calls them — a class of 24 has three Muhammets */
  short: string;
  initials: string;
  grade: number;
  cls: string;
  school: string;
};

export const CHILDREN: Child[] = [
  {
    id: 'm', name: 'Muhammedow Muhammet', short: 'Muhammet', initials: 'MM',
    grade: 8, cls: '8-nji «B» synp', school: '16-njy mekdep',
  },
  {
    id: 'a', name: 'Muhammedowa Aýlar', short: 'Aýlar', initials: 'MA',
    grade: 4, cls: '4-nji «A» synp', school: '16-njy mekdep',
  },
];

let current = CHILDREN[0].id;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const childId = () => current;
export const childOf = (id: string) => CHILDREN.find((c) => c.id === id) ?? CHILDREN[0];

export const selectChild = (id: string) => {
  if (id === current || !CHILDREN.some((c) => c.id === id)) return;
  current = id;
  emit();
};

export function useChild() {
  const id = useSyncExternalStore(subscribe, childId, childId);
  return { id, child: childOf(id), children: CHILDREN, select: selectChild };
}
