/*
 * The lesson pages, fetched one subject-grade at a time.
 *
 * `scripts/import-curriculum.mjs` writes `lessons/<grade>-<slug>.json` — the
 * written lesson for every theme that has one: the hook, the summary, the
 * steps, the formulas, the self-check, the test bank. Together they are 1.2 MB,
 * so they are deliberately *not* imported into the bundle: `import.meta.glob`
 * without `eager` leaves each file its own chunk, and a lesson page fetches the
 * one file it needs the first time a reader opens a theme in that subject and
 * grade. Everything after that is served from the promise cache below.
 *
 * A theme with no file here is not broken — 3597 of the 4051 themes in the
 * programme have no material written yet, and the lesson screen says so.
 */

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

const FILES = import.meta.glob('./lessons/*.json') as Record<
  string,
  () => Promise<{ default: LessonContent[] }>
>;

const path = (grade: number, slug: string) => `./lessons/${grade}-${slug}.json`;

/** Is anything written for this subject-grade? Answers without fetching. */
export const hasLessons = (grade: number, slug: string) => path(grade, slug) in FILES;

const cache = new Map<string, Promise<LessonContent[]>>();

export const loadLesson = async (
  grade: number,
  slug: string,
  no: number,
): Promise<LessonContent | null> => {
  const key = path(grade, slug);
  const file = FILES[key];
  if (!file) return null;
  if (!cache.has(key)) cache.set(key, file().then((m) => m.default));
  const themes = await cache.get(key)!;
  return themes.find((t) => t.no === no) ?? null;
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

/** Where the mini-app is served from — `public/`, copied across as it is. */
export const appUrl = (grade: number, slug: string, file: string) =>
  `${import.meta.env.BASE_URL}lesson-apps/${grade}/${slug}/${file}`;
