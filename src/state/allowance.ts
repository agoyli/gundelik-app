import { useSyncExternalStore } from 'react';
import { TODAY } from '../lib/date';
import { usePrefs } from './prefs';

/*
 * One free go a day.
 *
 * The free tier used to see the whole catalogue and be able to open exactly
 * one subject of it, forever — which teaches a pupil that the app is a
 * brochure. A daily allowance says something different: the material is real,
 * here is a piece of it today, and it will still be here tomorrow. It costs
 * the business almost nothing (a pupil who works through a deck a day is a
 * pupil who will want the other nineteen) and it gives the paywall an honest
 * line — not "you cannot", but "you have used today's".
 *
 * One deck and one test, counted per app-day. A paying account never consumes
 * an allowance; the hooks below simply say yes.
 */

export type AllowanceId = 'cards' | 'tests';

/** How many free goes a day, per kind. */
export const DAILY_FREE: Record<AllowanceId, number> = { cards: 1, tests: 1 };

export const ALLOWANCE_LABEL: Record<AllowanceId, string> = {
  cards: 'Günde bir toplum mugt',
  tests: 'Günde bir test mugt',
};

/* what was opened today, per kind — the ids, so re-opening the same deck or
   the same test does not spend a second go */
type Used = Record<AllowanceId, string[]>;
let day = TODAY;
let used: Used = { cards: [], tests: [] };

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
let snapshot: Used = used;
const publish = () => { snapshot = { cards: [...used.cards], tests: [...used.tests] }; listeners.forEach((fn) => fn()); };

/* The app's day is fixed while it runs, but a real one rolls over — so the
   reset lives here rather than in whatever screen happens to render first. */
const roll = () => {
  if (day === TODAY) return;
  day = TODAY;
  used = { cards: [], tests: [] };
  publish();
};

const useUsed = () => {
  roll();
  return useSyncExternalStore(subscribe, () => snapshot);
};

/**
 * What this account may do with `id` today.
 *
 * `open(itemId)` is the question a screen asks before unlocking something:
 * true when the account pays, when today's go is still there, or when this is
 * the very item that used it. `take(itemId)` spends it.
 */
export const useAllowance = (id: AllowanceId) => {
  const premium = usePrefs().premium;
  const today = useUsed()[id];
  const left = Math.max(0, DAILY_FREE[id] - today.length);

  return {
    /** paying accounts are not metered at all */
    unlimited: premium,
    left,
    used: today,
    /** may this particular item be opened? */
    canOpen: (itemId: string) => premium || today.includes(itemId) || left > 0,
    /** spend today's go on this item, if it is not already spent on it */
    take: (itemId: string) => {
      if (premium || today.includes(itemId)) return;
      if (left <= 0) return;
      used[id] = [...used[id], itemId];
      publish();
    },
  };
};
