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
  schoolLong: string;
  /* The figures every screen states about "the pupil". They live here rather
     than in each screen because a profile, an analytics header and a share
     card that each keep their own copy would disagree the moment the reader
     switches child. */
  points: number;
  avg: string;
  rank: string;
  hwRate: number;
};

export const CHILDREN: Child[] = [
  {
    id: 'm', name: 'Muhammedow Muhammet', short: 'Muhammet', initials: 'MM',
    grade: 8, cls: '8-nji «B» synp', school: '16-njy mekdep', schoolLong: '16-njy orta mekdep',
    points: 1251, avg: '4.6', rank: '2-nji', hwRate: 92,
  },
  {
    id: 'a', name: 'Muhammedowa Aýlar', short: 'Aýlar', initials: 'MA',
    grade: 4, cls: '4-nji «A» synp', school: '16-njy mekdep', schoolLong: '16-njy orta mekdep',
    points: 640, avg: '4.9', rank: '1-nji', hwRate: 98,
  },
  {
    id: 's', name: 'Muhammedow Serdar', short: 'Serdar', initials: 'MS',
    grade: 11, cls: '11-nji «A» synp', school: '7-nji mekdep', schoolLong: '7-nji orta mekdep',
    points: 2180, avg: '4.2', rank: '6-njy', hwRate: 78,
  },
  {
    id: 'g', name: 'Muhammedowa Gözel', short: 'Gözel', initials: 'MG',
    grade: 2, cls: '2-nji «B» synp', school: '16-njy mekdep', schoolLong: '16-njy orta mekdep',
    points: 310, avg: '5.0', rank: '1-nji', hwRate: 100,
  },
  {
    id: 'n', name: 'Muhammedow Nurmuhammet', short: 'Nurmuhammet', initials: 'MN',
    grade: 6, cls: '6-njy «A» synp', school: '16-njy mekdep', schoolLong: '16-njy orta mekdep',
    points: 880, avg: '3.9', rank: '11-nji', hwRate: 64,
  },
];

/** Primary school reads a different timetable to secondary. */
export const isJunior = (c: Child) => c.grade <= 4;

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

/**
 * "The pupil" — for every screen that used to read one hard-coded student.
 * There is no such thing as *the* pupil on this account any more; there is
 * whichever child is selected, and this is the one way to ask who that is.
 */
export const useStudent = () => useChild().child;

/** The grade the app is read against: the selected child's, not a constant. */
export const useGrade = () => useChild().child.grade;
