/*
 * The lesson pages, fetched one subject-grade at a time.
 *
 * `lessons/<grade>-<slug>.json` holds the written lesson for every theme in one
 * subject and grade that has one: the hook, the summary, the steps, the
 * formulas, the self-check, the test bank. Together they are 1.2 MB — far too
 * much to hand every reader up front — so a lesson page asks the content source
 * for the one file it needs, the first time a theme in that subject-grade is
 * opened. `source.ts` remembers the answer for the session.
 *
 * Nothing here knows a filename ahead of time: which files exist is whatever
 * the source is serving. A theme with no file is not broken — 3597 of the 4051
 * themes in the programme have no material written yet, the request answers
 * 404, and the lesson screen says so.
 */

import { getJsonOptional, sourceUrl } from './source';

export type LessonContent = {
  /** 1-based position of the theme in its grade — how the path addresses it */
  no: number;
  /** filename of the interactive mini-app, empty when the theme has none */
  app: string;
  title: string;
  minutes: number;
  hook: string;
  summary: string;
  steps: string[];
  concepts: string[];
  formulas: string[];
  examples: string[];
  mustKnow: string[];
  examPoints: string[];
  selfCheck: { q: string; a: string }[];
  test: { q: string; options: string[]; correct: number }[];
  /** the question this lesson's author would put to the AI helper first */
  aiStarter: string;
};

export const loadLessons = (grade: number, slug: string) =>
  getJsonOptional<LessonContent[]>(`lessons/${grade}-${slug}.json`);

export const loadLesson = async (
  grade: number,
  slug: string,
  no: number,
): Promise<LessonContent | null> => {
  const themes = await loadLessons(grade, slug);
  return themes?.find((t) => t.no === no) ?? null;
};

/*
 * A checkpoint's questions: the test banks of the themes it closes, in the
 * order the programme teaches them, each question still carrying the theme it
 * came from so a wrong answer can point back at the lesson to re-read.
 */
export type ExamQuestion = LessonContent['test'][number] & { theme: string };

export const loadExam = async (
  grade: number,
  slug: string,
  nos: number[],
): Promise<ExamQuestion[]> => {
  const themes = await Promise.all(nos.map((no) => loadLesson(grade, slug, no)));
  return themes.flatMap((t) => (t ? t.test.map((q) => ({ ...q, theme: t.title })) : []));
};

/** Where the theme's mini-app is served from — the same source, `apps/…`. */
export const appUrl = (grade: number, slug: string, file: string) =>
  sourceUrl(`apps/${grade}/${slug}/${file}`);
