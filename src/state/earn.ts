import { useSyncExternalStore } from 'react';
import { usePrefs } from './prefs';

/*
 * Points for doing the work.
 *
 * The app already pays `bal` for contest packs, which are the fun part. The
 * things a school actually wants a pupil to do — finish the homework, sit the
 * test — paid nothing, so the reward system was pointed away from the work.
 * This pays for both, and the points land in the same pot the contests fill,
 * convertible to balance at the wallet's rate.
 *
 * It is a **paid** feature, and the free tier is told so rather than shown
 * nothing: every place that would award points still prints what the tick was
 * worth, greyed, with the plan that would have collected it. A locked reward
 * you can see is an argument; a reward you never knew existed is not.
 *
 * Awards are idempotent by id. Homework unticked and reticked, a test sat
 * three times — each pays once, because a counter that rewards toggling is a
 * counter that will be toggled.
 */

export type EarnKind = 'hw' | 'test';

/** What each piece of work is worth. A week of homework ≈ one test. */
export const EARN_POINTS: Record<EarnKind, number> = { hw: 5, test: 20 };

export const EARN_LABEL: Record<EarnKind, string> = {
  hw: 'Öý işi ýerine ýetirildi',
  test: 'Test tabşyryldy',
};

/* one entry per awarded id, so re-doing something cannot be farmed */
const awarded = new Map<string, { kind: EarnKind; points: number }>();

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
let snapshot: ReadonlyMap<string, { kind: EarnKind; points: number }> = new Map();
const publish = () => { snapshot = new Map(awarded); listeners.forEach((fn) => fn()); };

/**
 * Award the points for one piece of work, once. Returns what was actually
 * awarded — 0 when it was already paid for, so the caller can stay quiet
 * instead of announcing a reward that did not happen.
 */
export const award = (kind: EarnKind, id: string) => {
  const key = `${kind}:${id}`;
  if (awarded.has(key)) return 0;
  const points = EARN_POINTS[kind];
  awarded.set(key, { kind, points });
  publish();
  return points;
};

export const useEarn = () => useSyncExternalStore(subscribe, () => snapshot);

/** Everything earned from schoolwork, and the split behind it. */
export const useWorkPoints = () => {
  const map = useEarn();
  let total = 0; let hw = 0; let tests = 0;
  map.forEach((e) => {
    total += e.points;
    if (e.kind === 'hw') hw += 1; else tests += 1;
  });
  return { total, hw, tests };
};

/**
 * Whether this account collects points at all.
 *
 * Earning is part of the subscription, so the free tier sees the figure and
 * not the credit. One hook for every screen that pays, so the rule cannot be
 * applied in one place and forgotten in another.
 */
export const useEarns = () => usePrefs().premium;
