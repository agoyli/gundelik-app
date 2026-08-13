import {
  BooksIcon, ComputerIcon, FlameIcon, GameIcon, GlobeIcon, LayersIcon, MathIcon, PeopleIcon,
  PencilIcon, PinIcon, SocietyIcon, SoundIcon,
} from '../components/Icons';
import type { ReactNode } from 'react';
import { ordinal } from '../lib/tm';
import { tokens } from '../theme';
import raw from './curriculum.json';

/*
 * The real Turkmen school programme, grades 1–12.
 *
 * `curriculum.json` is imported from the meyilnamalar repo by
 * `scripts/import-curriculum.mjs` — 39 subjects, 4051 themes, straight from the
 * ministry curriculum. Do not hand-edit it; re-run the script.
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

export const CURRICULUM: CurriculumSubject[] = (raw as RawSubject[]).map((s) => ({
  slug: s.slug,
  name: s.name,
  grades: s.grades.map((g) => ({ grade: g.grade, themes: g.themes.map(theme) })),
}));

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

/** How many stops the whole path has — what a subject row counts down from. */
export const pathLength = (s: CurriculumSubject) =>
  pathFor(s).reduce((n, g) => n + g.lessons.length, 0);

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
const BY_NAME = new Map(CURRICULUM.map((s) => [s.name, s.slug]));
export const look = (subjectName: string) => {
  const l = subjectLook(BY_NAME.get(subjectName) ?? '');
  return { accent: l.accent, tint: l.tint };
};
