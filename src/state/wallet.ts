import { useSyncExternalStore } from 'react';
import { TODAY } from '../lib/date';
import { childId } from './children';

/*
 * The account's balance, and where it came from.
 *
 * A family here does not always pay a subscription the way a card-on-file app
 * assumes. Money arrives in irregular lumps — a parent transfers from their
 * phone, a grandparent hands over a kiosk gift card, an older sibling tops the
 * account up before the term starts — and the subscription is then paid *out*
 * of that. So the account holds a balance, and paying is spending from it
 * rather than a fresh card transaction every month.
 *
 * The second source is the app's own: `bal` earned by solving contest packs.
 * Points that only ever bought a place in a rating are a scoreboard; points
 * that can become a fortnight of Zehinli are a reason to open the app on a
 * Tuesday. The rate is deliberately unglamorous — a pupil cannot grind their
 * way to a free year, but a term's worth of contests takes a real bite out of
 * one month.
 *
 * Every movement is an entry, and the balance is the sum of them. A stored
 * total beside a stored history is two numbers free to disagree; there is one
 * number here and it is derived.
 */

export type EntryKind = 'topup' | 'spend' | 'convert';

export type Entry = {
  id: string;
  kind: EntryKind;
  /** TMT, signed: what the balance did */
  amount: number;
  note: string;
  /** ISO date — the app's own day, not the device's */
  at: string;
  /** for a conversion, the bal it came from */
  points?: number;
};

/** 100 bal = 1 TMT. Round numbers, so a pupil can do the sum in their head. */
export const POINTS_PER_TMT = 100;

/** What `n` bal is worth, in whole TMT — the app never pays out kopeks. */
export const pointsToTmt = (points: number) => Math.floor(points / POINTS_PER_TMT);

/** The bal left over after a conversion, which stay on the account. */
export const pointsRemainder = (points: number) => points % POINTS_PER_TMT;

let entries: Entry[] = [
  { id: 'w3', kind: 'topup', amount: 100, note: 'TM CELL — telefon geçirimi', at: '2026-02-09' },
  { id: 'w2', kind: 'spend', amount: -40, note: 'Göreldeli — bir aý', at: '2026-01-12' },
  { id: 'w1', kind: 'topup', amount: 50, note: 'Sowgat kart', at: '2026-01-12' },
];

/* How many bal have already been turned into money, **per child**. The bal
   themselves are counted where they are earned (`state/contest.ts`,
   `state/earn.ts`) and where the child started (`state/children.ts`); this is
   the only thing the wallet needs to remember about them, because "what is
   left to convert" is earned minus converted and never a third stored number.
   It is keyed by child because the pot belongs to the pupil who earned it,
   while the money it becomes belongs to the family account. */
let converted: Record<string, number> = {};

let seq = entries.length;

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

type Snapshot = { balance: number; entries: Entry[]; converted: Record<string, number> };

const derive = (): Snapshot => ({
  balance: entries.reduce((n, e) => n + e.amount, 0),
  entries,
  converted,
});

let snapshot: Snapshot = derive();
const publish = () => { snapshot = derive(); listeners.forEach((fn) => fn()); };

const add = (e: Omit<Entry, 'id' | 'at'> & { at?: string }) => {
  seq += 1;
  entries = [{ id: `w${seq}`, at: e.at ?? TODAY, ...e }, ...entries];
  publish();
};

export const useWallet = () => useSyncExternalStore(subscribe, () => snapshot);

/** Read the balance without subscribing — for the one-shot check inside a buy. */
export const balanceNow = () => snapshot.balance;

export const topUp = (amount: number, note: string) => add({ kind: 'topup', amount, note });

/** Spend, if there is enough. Returns whether it happened, so a caller can
    fall back to a card rather than quietly leaving the account unpaid. */
export const spend = (amount: number, note: string) => {
  if (amount > snapshot.balance) return false;
  add({ kind: 'spend', amount: -amount, note });
  return true;
};

/** Turn earned bal into balance. Only whole TMT convert; the remainder stays. */
export const convertPoints = (points: number) => {
  const tmt = pointsToTmt(points);
  if (tmt <= 0) return 0;
  const id = childId();
  converted = { ...converted, [id]: (converted[id] ?? 0) + tmt * POINTS_PER_TMT };
  add({ kind: 'convert', amount: tmt, note: `${tmt * POINTS_PER_TMT} bal öwrüldi`, points: tmt * POINTS_PER_TMT });
  return tmt;
};

/** The top-up amounts the sheet offers — a term, a year, and two round numbers. */
export const TOP_UPS = [40, 100, 400];
