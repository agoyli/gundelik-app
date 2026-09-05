import { useSyncExternalStore } from 'react';
import { POINTS_PER_ANSWER } from '../data/guides';

/*
 * What a reader has earned in a prize contest.
 *
 * A prize contest is not a sitting with a single score — it is ten packs solved
 * over days, and the standing that comes out of them is the sum. So a run is
 * kept per pack rather than per contest: the total, the time and the number of
 * packs finished are all derived from those runs, and a pack solved twice keeps
 * its better result rather than its latest, because a second attempt is
 * practice and nobody should be punished for it.
 *
 * It lives in memory, like every other piece of state in this app — the store
 * that would persist it is the server this front end does not have yet. The
 * shape is what a server would be asked for, one row per (contest, pack).
 */

export type PackRun = {
  /** answers right, out of the pack's questions */
  correct: number;
  total: number;
  /** seconds from opening the first question to reaching the result */
  seconds: number;
};

export type PackRunWithPoints = PackRun & { points: number };

const pointsOf = (run: PackRun) => run.correct * POINTS_PER_ANSWER;

const key = (contestId: string, packId: string) => `${contestId}:${packId}`;

const runs = new Map<string, PackRun>();

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/* One snapshot object per publish: `useSyncExternalStore` compares by identity,
   so handing back a fresh Map on every read would re-render forever. */
let snapshot: ReadonlyMap<string, PackRun> = new Map();
const publish = () => {
  snapshot = new Map(runs);
  listeners.forEach((fn) => fn());
};

/** Record a finished pack, keeping the better of the two if it was solved before. */
export const savePackRun = (contestId: string, packId: string, run: PackRun) => {
  const k = key(contestId, packId);
  const old = runs.get(k);
  const better = !old || run.correct > old.correct
    /* same score, quicker: the faster run is the one worth keeping */
    || (run.correct === old.correct && run.seconds < old.seconds);
  if (better) runs.set(k, run);
  publish();
};

const useRuns = () => useSyncExternalStore(subscribe, () => snapshot);

/** Every pack this reader has finished in one contest, by pack id. */
export const useContestRuns = (contestId: string): Record<string, PackRunWithPoints> => {
  const all = useRuns();
  const out: Record<string, PackRunWithPoints> = {};
  for (const [k, run] of all) {
    if (!k.startsWith(`${contestId}:`)) continue;
    out[k.slice(contestId.length + 1)] = { ...run, points: pointsOf(run) };
  }
  return out;
};

/** The three figures the contest page states, summed from the runs themselves. */
export const contestTotals = (byPack: Record<string, PackRunWithPoints>) => {
  const list = Object.values(byPack);
  return {
    points: list.reduce((n, r) => n + r.points, 0),
    seconds: list.reduce((n, r) => n + r.seconds, 0),
    packs: list.length,
    correct: list.reduce((n, r) => n + r.correct, 0),
  };
};

/** `4:07`, or `1:02:30` once an hour has gone by. Always two digits after a colon. */
export const fmtDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

/*
 * Every bal the account has earned, across every contest.
 *
 * The wallet needs one number — what is there to convert — and the honest
 * source of it is the runs themselves, summed. Anything else would be a second
 * copy of a total the contest pages already compute from these same rows.
 */
export const useAllPoints = () => {
  const map = useSyncExternalStore(subscribe, () => snapshot);
  let n = 0;
  map.forEach((run) => { n += pointsOf(run); });
  return n;
};
