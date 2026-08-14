import {
  BooksIcon, ComputerIcon, FlameIcon, GameIcon, GlobeIcon, LayersIcon, MathIcon, PeopleIcon,
  PencilIcon, PinIcon, SocietyIcon, SoundIcon,
} from '../components/Icons';
import type { ReactNode } from 'react';
import { ordinal } from '../lib/tm';
import { getJson } from './source';
import { tokens } from '../theme';

/*
 * The real Turkmen school programme, grades 1–12.
 *
 * The programme is *fetched* — `curriculum.json` from whichever content source
 * the app is pointed at (see `source.ts`), once, before the first screen is
 * mounted. 39 subjects and 4051 themes, straight from the ministry curriculum
 * by way of `scripts/import-curriculum.mjs`. Nothing here is written by hand,
 * and nothing here is compiled in: publishing a corrected theme list is a file
 * on a server, not a new build of the app.
 *
 * The app used to carry eight invented lesson titles cycled with a modulo, which
 * looked like a curriculum from a distance and fell apart the moment anyone read
 * two grades in a row. Everything the lesson path shows now — which subjects a
 * grade has, how many themes each holds, what they are called, how many hours
 * each takes — is that file. Nothing here invents a topic.
 */

/*
 * What material a theme has.
 *
 * 454 of the 4051 themes have some written for them: a lesson text with a
 * reading time, a test bank, and an interactive mini-app. The remaining themes
 * are on the path with their curriculum hours and no promise of anything else;
 * they are `ready: false`, and the lesson page says so rather than pretending
 * a lesson is waiting there.
 */
export type LessonKind = 'text' | 'interactive' | 'test';
export type Theme = {
  name: string;
  hours: number;
  /** reading time in minutes, 0 when nothing is written yet */
  minutes: number;
  /** questions in the theme's test bank */
  questions: number;
  /** an interactive mini-app was written for this theme */
  hasApp: boolean;
  /** has material prepared — a lesson to open, not just a line in the programme */
  ready: boolean;
};
export type SubjectGrade = { grade: number; themes: Theme[] };
export type CurriculumSubject = { slug: string; name: string; grades: SubjectGrade[] };

/* The JSON stores a theme as [name, hours] — one array beats 4051 copies of two
   key names — and as [name, hours, minutes, questions, hasApp] where material
   exists. */
type RawTheme = [string, number] | [string, number, number, number, number];
type RawSubject = { slug: string; name: string; grades: { grade: number; themes: RawTheme[] }[] };

const theme = ([name, hours, minutes = 0, questions = 0, hasApp = 0]: RawTheme): Theme => ({
  name,
  hours,
  minutes,
  questions,
  hasApp: hasApp > 0,
  ready: minutes > 0 || questions > 0 || hasApp > 0,
});

/*
 * The programme, once it has arrived.
 *
 * `main.tsx` awaits `loadCurriculum()` and only then imports the app, so every
 * screen and every module below can read this as the plain list it is — no
 * screen has to hold a "still loading" branch for data that is in memory before
 * it is ever rendered.
 */
let CURRICULUM: CurriculumSubject[] = [];

const parse = (raw: RawSubject[]): CurriculumSubject[] => raw.map((s) => ({
  slug: s.slug,
  name: s.name,
  grades: s.grades.map((g) => ({ grade: g.grade, themes: g.themes.map(theme) })),
}));

/*
 * The last programme that arrived, kept for the next launch.
 *
 * The whole app waits on this one document, so a cold network would be a cold
 * app: the launch after the first serves the copy in hand at once and asks the
 * source for a fresh one in the background, for the launch after that. It is
 * the same file every time — a school programme changes once a year, not once
 * a session — so this is a start-up that works on a bad connection and on none.
 */
const CACHE_KEY = 'gundelik.curriculum.v1';

const cached = (): RawSubject[] | null => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? (JSON.parse(stored) as RawSubject[]) : null;
  } catch { return null; }
};

const keep = (raw: RawSubject[]) => {
  /* private mode and full quotas both throw — a cache that cannot be written is
     not a failure to boot */
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch { /* ignore */ }
};

export const loadCurriculum = async () => {
  const stored = cached();
  if (stored?.length) {
    CURRICULUM = parse(stored);
    /* revalidate for next time; this launch is already running */
    getJson<RawSubject[]>('curriculum.json').then(keep).catch(() => { /* offline is fine */ });
    return CURRICULUM;
  }
  const raw = await getJson<RawSubject[]>('curriculum.json');
  CURRICULUM = parse(raw);
  keep(raw);
  return CURRICULUM;
};

/** Every subject in the programme, in name order. */
export const curriculum = () => CURRICULUM;

/** The grade this account is in. The diary, the profile and the path read it. */
export const USER_GRADE = 8;

export const subjectBySlug = (slug: string) => CURRICULUM.find((s) => s.slug === slug);

/** Every theme in the subject's programme. */
export const themeCount = (s: CurriculumSubject) =>
  s.grades.reduce((n, g) => n + g.themes.length, 0);

/*
 * The path a subject is walked along.
 *
 * A theme is not one block. Reading it and playing with it are two different
 * things to sit down to, so they are two stops: the written lesson, and — when
 * a mini-app was made for the theme — the interactive one immediately after it.
 * They carry the same title on purpose; the second is the first, in your hands.
 *
 * Every third theme is followed by a checkpoint that asks the test banks of the
 * three themes it closes, together. Nothing is generated for it: if those three
 * themes have no questions written, there is no checkpoint.
 */
export type PathNode = {
  id: string;
  grade: number;
  kind: LessonKind;
  title: string;
  extent: string;
  /** the themes whose material this stop uses — one, or the three of a checkpoint */
  nos: number[];
  /** there is material to fetch — the lesson page asks for nothing when there is not */
  ready: boolean;
};
export type PathGrade = { grade: number; lessons: PathNode[] };

const EXAM_EVERY = 3;

export const pathFor = (subject: CurriculumSubject): PathGrade[] =>
  subject.grades.map((g) => {
    const out: PathNode[] = [];
    let batch: { no: number; questions: number }[] = [];

    const checkpoint = () => {
      const questions = batch.reduce((n, t) => n + t.questions, 0);
      if (questions > 0) {
        const from = batch[0].no;
        const to = batch[batch.length - 1].no;
        out.push({
          id: `g${g.grade}-b${to}`,
          grade: g.grade,
          kind: 'test',
          ready: true,
          title: from === to
            ? `${ordinal(to)} tema boýunça barlag`
            : `${from}–${ordinal(to)} temalar boýunça barlag`,
          extent: `${questions} sorag`,
          nos: batch.map((t) => t.no),
        });
      }
      batch = [];
    };

    g.themes.forEach((t, i) => {
      const no = i + 1;
      out.push({
        id: `g${g.grade}-${no}`,
        grade: g.grade,
        kind: 'text',
        ready: t.ready,
        title: t.name,
        /* minutes once a lesson is written, otherwise the hours the programme
           gives the theme */
        extent: t.minutes > 0 ? `${t.minutes} min` : `${t.hours} sagat`,
        nos: [no],
      });
      if (t.hasApp) {
        out.push({
          id: `g${g.grade}-${no}i`,
          grade: g.grade,
          kind: 'interactive',
          ready: true,
          title: t.name,
          extent: 'Gönükme',
          nos: [no],
        });
      }
      batch.push({ no, questions: t.questions });
      if (batch.length === EXAM_EVERY) checkpoint();
    });
    checkpoint(); // the tail — three themes short of a checkpoint still get one

    return { grade: g.grade, lessons: out };
  });

/*
 * How many stops the path has — what a subject row counts down from.
 *
 * With a grade, only that grade's stops: the subject list is filtered by grade,
 * and a row that says "0/56" while the page behind it is one grade of ten
 * lessons is counting something the reader is not looking at.
 */
export const pathLength = (s: CurriculumSubject, grade?: number) =>
  pathFor(s)
    .filter((g) => grade === undefined || g.grade === grade)
    .reduce((n, g) => n + g.lessons.length, 0);

/*
 * Every stop in the programme — what the Sapaklar section actually holds.
 *
 * The tile used to count subjects ("17 ders"), which is the shape of the list
 * and not its size: a section that opens onto 5090 lessons was announcing the
 * seventeen rows you see first. This counts what the rows count, by the same
 * function they count it with — a reading, an interactive and a checkpoint are
 * each one stop — so the tile and the row totals can never disagree.
 */
export const pathTotal = () => CURRICULUM.reduce((n, s) => n + pathLength(s), 0);

/** The subjects a given grade is actually taught. */
export const subjectsForGrade = (grade: number) =>
  CURRICULUM.filter((s) => s.grades.some((g) => g.grade === grade));

/*
 * One subject, one look — wherever it turns up.
 *
 * The lists each carried their own tint, so Informatika was orange in the lesson
 * menu and grey in the test menu, and nothing but care kept the rest in step. A
 * subject is the same subject in every section, so its icon and colour are
 * looked up here, once. Families share a look: every language reads as one kind
 * of thing, every science as another. Six accent families cover thirty-nine
 * subjects, so a hue repeats — that is a family resemblance, not a collision.
 */
type Look = { icon: ReactNode; accent: string; tint: string };

const FAMILY = {
  maths: { icon: <MathIcon size={24} />, accent: tokens.blueText, tint: tokens.blueTint },
  physics: { icon: <LayersIcon size={24} />, accent: tokens.purpleText, tint: tokens.purpleTint },
  chemistry: { icon: <FlameIcon size={24} />, accent: tokens.tealText, tint: tokens.tealTint },
  nature: { icon: <GlobeIcon size={24} />, accent: tokens.greenText, tint: tokens.greenTint },
  geography: { icon: <PinIcon size={24} />, accent: tokens.greenText, tint: tokens.greenTint },
  tech: { icon: <ComputerIcon size={24} />, accent: tokens.orangeText, tint: tokens.orangeTint },
  society: { icon: <SocietyIcon size={24} />, accent: tokens.redText, tint: tokens.redTint },
  language: { icon: <BooksIcon size={24} />, accent: tokens.purpleText, tint: tokens.purpleTint },
  craft: { icon: <PencilIcon size={24} />, accent: tokens.orangeText, tint: tokens.orangeTint },
  sport: { icon: <GameIcon size={24} />, accent: tokens.blueText, tint: tokens.blueTint },
  music: { icon: <SoundIcon size={24} />, accent: tokens.purpleText, tint: tokens.purpleTint },
  life: { icon: <PeopleIcon size={24} />, accent: tokens.tealText, tint: tokens.tealTint },
} satisfies Record<string, Look>;

const SUBJECT_FAMILY: Record<string, keyof typeof FAMILY> = {
  algebra: 'maths', geometriya: 'maths', matematika: 'maths',
  fizika: 'physics', astronomiya: 'physics',
  himiya: 'chemistry',
  biologiya: 'nature', 'tebigaty-owrenis': 'nature', ekologiya: 'nature',
  geografiya: 'geography',
  informatika: 'tech', 'ik-we-it': 'tech', 'dowrebap-tehn-e': 'tech',
  't-nyn-taryhy': 'society', 'dunya-taryhy': 'society', jemgyyet: 'society',
  'hukuk-esaslary': 'society', 't-nyn-medeni-m': 'society', 'dunya-medeniyeti': 'society',
  'ykdysadyyetin-esasl': 'society',
  'turkmen-dili': 'language', 'ene-dili': 'language', 'rus-dili': 'language',
  'inlis-dili': 'language', 'fransuz-dili': 'language', edebiyat: 'language',
  'turkmen-edebiyaty': 'language', okuw: 'language', yazuw: 'language',
  surat: 'craft', 'sekillendiris-sungaty': 'craft', 'cepercilik-zahmeti': 'craft',
  zahmet: 'craft', 'durmus-zahmeti': 'craft', 'proyektirlemegin-e': 'craft',
  bedenterbiye: 'sport',
  'aydym-saz': 'music',
  'synp-sagady': 'life', 'yasayys-d-e': 'life',
};

/** Icon + colour for a subject slug; unknown slugs read as a language subject. */
export const subjectLook = (slug: string): Look => FAMILY[SUBJECT_FAMILY[slug] ?? 'language'];

/** The same, by the name a deck or a test prints — those store the label, not the slug. */
const byName = () => new Map(CURRICULUM.map((s) => [s.name, s.slug]));
export const look = (subjectName: string) => {
  const l = subjectLook(byName().get(subjectName) ?? '');
  return { accent: l.accent, tint: l.tint };
};
