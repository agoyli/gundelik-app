import { useSyncExternalStore } from 'react';

/*
 * Saved resources, across every Gollanmalar section.
 *
 * Six sections hold six kinds of thing — a deck, a contest, a game, a book, a
 * test subject, a topic — and each already has its own list screen. What they
 * did not have was a way to say "this one, later": the only way back to a book
 * you were halfway through was to remember which of the six tiles it lived
 * under and scroll for it.
 *
 * So bookmarks are one store, not six. A saved item keeps its `kind` alongside
 * its id, which is what lets a single collection page group them and route a
 * tap back to the right detail screen. The key is `kind:id` — ids are only
 * unique within a section, and "g1" is a game *and* a grade band.
 */

export type BookmarkKind = 'deck' | 'contest' | 'game' | 'book' | 'test' | 'tema';

export type Bookmark = {
  kind: BookmarkKind;
  id: string;
  /* Denormalised on purpose: the collection page must be able to draw a row
     without importing all six data modules and re-finding the record. */
  title: string;
  sub: string;
};

const key = (kind: BookmarkKind, id: string) => `${kind}:${id}`;

/* insertion order is newest-last; the collection reverses it so the most
   recently saved thing is the first thing you see */
const saved = new Map<string, Bookmark>();

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

let snapshot: Bookmark[] = [];
const publish = () => {
  snapshot = [...saved.values()].reverse();
  listeners.forEach((fn) => fn());
};

/** Toggle, returning what the item's state *became* — callers use it for the toast. */
export const toggleBookmark = (b: Bookmark): boolean => {
  const k = key(b.kind, b.id);
  const on = saved.has(k);
  if (on) saved.delete(k); else saved.set(k, b);
  publish();
  return !on;
};

export const useBookmarks = () => useSyncExternalStore(subscribe, () => snapshot);

export const useIsBookmarked = (kind: BookmarkKind, id: string) =>
  useBookmarks().some((b) => b.kind === kind && b.id === id);

/* Section labels for the collection page, so a group heading and the tile that
   owns the section can never disagree. */
export const KIND_LABEL: Record<BookmarkKind, string> = {
  tema: 'Temalar',
  deck: 'Öwrediji kartlar',
  test: 'Testler',
  contest: 'Bäsleşikler',
  game: 'Oýunlar',
  book: 'Kitaphana',
};

export const KIND_ORDER: BookmarkKind[] = ['tema', 'deck', 'test', 'contest', 'game', 'book'];
