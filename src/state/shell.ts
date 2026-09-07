import { useSyncExternalStore } from 'react';

/*
 * Which tab the shell is showing.
 *
 * The four tabs are all mounted at once — they are panels on one scroll-snap
 * track — so a screen keeps its state while the reader is looking at another
 * one. That is what makes swiping between them cheap, and it is also how a
 * bottom sheet opened in the diary ended up floating over Gollanmalar: MUI
 * portals a drawer to `body`, which belongs to no tab at all.
 *
 * So the shell publishes the tab it is on, and `SheetDrawer` closes anything
 * that was opened somewhere else. One subscription, in one component, rather
 * than every screen remembering to tidy up after itself.
 */
let tab = '';

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

export const setShellTab = (id: string) => {
  if (id === tab) return;
  tab = id;
  listeners.forEach((fn) => fn());
};

export const useShellTab = () => useSyncExternalStore(subscribe, () => tab);
