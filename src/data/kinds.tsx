import type { ReactNode } from 'react';
import { BooksIcon, GameIcon, QuizIcon } from '../components/Icons';
import type { LessonKind } from './curriculum';
import { tokens } from '../theme';

/*
 * What a stop on the path is, and how it looks wherever it is shown.
 *
 * A theme becomes two or three stops — the reading, the interactive, the
 * checkpoint — and each of them is drawn in three places now: on the path, in
 * the lesson page's own header, and in the Interaktiw sapaklar list that indexes the
 * interactives on their own. One record, so an interactive is teal with the
 * same icon and the same word in all of them.
 */
export type Kind = LessonKind;

/* `color` fills tiles and icons; `ink` is the same accent at text contrast */
export const KIND_META: Record<Kind, {
  label: string; color: string; ink: string; tint: string; icon: (size: number) => ReactNode;
}> = {
  text: { label: 'Tekst', color: tokens.blue, ink: tokens.blueText, tint: tokens.blueTint, icon: (s) => <BooksIcon size={s} /> },
  interactive: { label: 'Interaktiw', color: tokens.teal, ink: tokens.tealText, tint: tokens.tealTint, icon: (s) => <GameIcon size={s} /> },
  test: { label: 'Test', color: tokens.orange, ink: tokens.orangeText, tint: tokens.orangeTint, icon: (s) => <QuizIcon size={s} /> },
};

export const KINDS = Object.keys(KIND_META) as Kind[];
