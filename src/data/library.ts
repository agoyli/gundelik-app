import {
  GROUP_LABEL, GROUP_ORDER, curriculum, look, subjectGroup, subjectLook,
} from './curriculum';
import type { SubjectGroup } from './curriculum';
import { loadLessons } from './lessons';
import { ordinal } from '../lib/tm';
import { getJson } from './source';

/*
 * The catalogue: what the content source holds, and what can be built from it.
 *
 * The test bank and the flashcard decks used to be nine hand-written records in
 * `guides.tsx` — four Algebra tests that did not exist, three decks of a dozen
 * cards. Both are now the real material, counted and cut from the lessons the
 * source serves:
 *
 *   a test  is one theme's own `test_bank`
 *   a card  is one self-check pair, or one formula (both are already two-sided)
 *
 * `index.json` — five kilobytes — says how much of each every subject-grade
 * holds, so a list can be drawn without fetching a megabyte of lessons to count
 * them. The lesson file itself is fetched only when a deck is actually opened.
 */

export type IndexRow = {
  grade: number;
  slug: string;
  subject: string;
  themes: number;
  /** themes whose bank can be sat as a test */
  tests: number;
  questions: number;
  cards: number;
  minutes: number;
};

let INDEX: IndexRow[] = [];

export const loadIndex = async () => {
  INDEX = await getJson<IndexRow[]>('index.json');
  return INDEX;
};

export const catalogue = () => INDEX;

/** What one subject holds — across every grade, or in one of them. */
export const subjectBank = (slug: string, grade?: number) => {
  const rows = INDEX.filter((r) => r.slug === slug && (grade === undefined || r.grade === grade));
  return {
    tests: rows.reduce((n, r) => n + r.tests, 0),
    questions: rows.reduce((n, r) => n + r.questions, 0),
    cards: rows.reduce((n, r) => n + r.cards, 0),
    lessons: rows.reduce((n, r) => n + r.themes, 0),
  };
};

/** The whole bank, for the lines that state what a plan opens. */
export const bankTotal = () => ({
  tests: INDEX.reduce((n, r) => n + r.tests, 0),
  questions: INDEX.reduce((n, r) => n + r.questions, 0),
  decks: INDEX.filter((r) => r.cards > 0).length,
  cards: INDEX.reduce((n, r) => n + r.cards, 0),
});

/* ---------------- Testler ---------------- */

export type TestItem = {
  id: string; title: string; tema: string; questions: number; minutes: number;
  best: number | null; attempts: { date: string; score: number }[];
  /* where its questions live, for when the test is actually sat */
  grade: number; slug: string; no: number;
};

export type TestSubject = {
  id: string; label: string; icon: React.ReactNode; tint: string; accent: string;
  tests: TestItem[];
};

/*
 * One test per theme that has a bank, under the subject it belongs to.
 *
 * The theme names, the grades and the question counts are the programme's, so
 * this list grows the moment the source publishes another lesson — and no
 * result is invented: a test nobody has sat reports no best score.
 */
export const testSubjects = (): TestSubject[] => curriculum()
  .map((s) => ({
    id: s.slug,
    label: s.name,
    ...subjectLook(s.slug),
    tests: s.grades.flatMap((g) => g.themes.flatMap((t, i) => (t.questions > 0 ? [{
      id: `${g.grade}-${s.slug}-${i + 1}`,
      title: t.name,
      tema: `${s.name} · ${ordinal(g.grade)} synp`,
      questions: t.questions,
      /* a minute and a half a question, floored at five — the same rule for
         every test rather than a number typed per row */
      minutes: Math.max(5, Math.round(t.questions * 1.5)),
      best: null,
      attempts: [],
      grade: g.grade,
      slug: s.slug,
      no: i + 1,
    }] : []))),
  }))
  .filter((s) => s.tests.length > 0);

/*
 * The ten packs a prize contest is played with.
 *
 * A contest does not get a question bank of its own: the app already has 766
 * of them, one per theme with material, and inventing a parallel set would be
 * a second body of questions to keep true to the programme. So a pack *is* a
 * theme's test bank.
 *
 * They are taken one subject at a time rather than by striding the catalogue.
 * Striding looks spread and is not: the catalogue is ordered by subject, and a
 * subject with 150 banks in it swallows most of a ten-wide stride — the first
 * build of this handed out eight Informatika packs out of ten. Round-robin over
 * the subjects gives ten packs from ten subjects while the subjects last. The
 * offsets come from the contest's id, so the pack a reader half-finished is the
 * same pack when they come back.
 */
export type ContestPack = {
  id: string;
  subject: string;
  grade: number;
  /** the theme banks the pack asks, in order */
  tests: TestItem[];
  questions: number;
};

export const contestPacks = (contestId: string, count = 10, per = 3): ContestPack[] => {
  /* A single theme's bank is four questions — that is what the programme
     publishes — which is a quiz, not a pack. Three consecutive banks of one
     subject make a pack of about a dozen, and consecutive banks share a grade,
     so the pack can say which year it is asking about. */
  const bySubject = testSubjects().filter((s) => s.tests.length >= per);
  if (bySubject.length === 0) return [];
  const seed = [...contestId].reduce((n, c) => n + c.charCodeAt(0), 0);

  const packs: ContestPack[] = [];
  const taken = new Set<string>();
  for (let pass = 0; packs.length < count && pass < count; pass++) {
    for (let i = 0; i < bySubject.length && packs.length < count; i++) {
      const s = bySubject[(seed + i) % bySubject.length];
      const start = (seed + pass * per + i * 5) % Math.max(1, s.tests.length - per + 1);
      const tests = s.tests.slice(start, start + per);
      if (tests.length < per) continue;
      const id = `p${tests[0].id}`;
      if (taken.has(id)) continue;
      taken.add(id);
      packs.push({
        id,
        subject: s.label,
        grade: tests[0].grade,
        tests,
        questions: tests.reduce((n, t) => n + t.questions, 0),
      });
    }
  }
  return packs;
};

/* ---------------- Interaktiw sapaklar (the interactives, on their own) ---------------- */

/*
 * The same 766 interactives the paths already carry, listed by activity instead
 * of by subject.
 *
 * A path answers "where am I in Algebra?". This answers a different question —
 * "I have ten minutes, what can I practise?" — and the two want opposite
 * orders: the path is strictly sequential and the practice list is a menu. So
 * this is an index, not a second copy: an item here is a stop on some subject's
 * path, opened by the same lesson page, and finishing it there is finishing it
 * everywhere.
 *
 * Which themes have a mini-app is already in the programme (`hasApp`), so the
 * whole list is built in memory, with no request. Only the descriptions — each
 * lesson's own opening line — are fetched, one subject-grade at a time, when a
 * group is actually opened.
 */

export type PlayItem = {
  id: string; grade: number; slug: string; subject: string; no: number; title: string;
};

export type PlayGroup = {
  id: string; grade: number; slug: string; subject: string;
  accent: string; tint: string;
  items: PlayItem[];
};

const playAll = (): PlayGroup[] => curriculum().flatMap((s) => s.grades.flatMap((g) => {
  const items = g.themes.flatMap((t, i) => (t.hasApp ? [{
    id: `${g.grade}-${s.slug}-${i + 1}`,
    grade: g.grade,
    slug: s.slug,
    subject: s.name,
    no: i + 1,
    title: t.name,
  }] : []));
  return items.length ? [{
    id: `${g.grade}-${s.slug}`,
    grade: g.grade,
    slug: s.slug,
    subject: s.name,
    ...subjectLook(s.slug),
    items,
  }] : [];
}));

/** The interactives of one grade, or of the whole programme, subject by subject. */
export const playGroups = (grade?: number): PlayGroup[] => playAll()
  .filter((p) => grade === undefined || p.grade === grade)
  .sort((a, b) => b.items.length - a.items.length
    || a.subject.localeCompare(b.subject, 'tk')
    || a.grade - b.grade);

export const playCount = (grade?: number) =>
  playGroups(grade).reduce((n, p) => n + p.items.length, 0);

/** One interactive by the id a bookmark keeps. */
export const playById = (id: string): PlayItem | undefined =>
  playAll().flatMap((p) => p.items).find((it) => it.id === id);

/*
 * What each interactive is about.
 *
 * The path can only say "Interaktiw · Gönükme", because it has nothing else in
 * hand at that point. Here the group's lesson file is fetched once and every
 * card gets the lesson's own opening line — written for that theme, not a blurb
 * about mini-apps in general.
 *
 * No play time is printed. The lesson file times the *reading*, and printing
 * that under a mini-app would be a number about the wrong thing; the theme's
 * place in the programme is what the card says instead.
 */
export type PlayCard = PlayItem & { note: string };

export const loadPlayCards = async (group: PlayGroup): Promise<PlayCard[]> => {
  const themes = (await loadLessons(group.grade, group.slug)) ?? [];
  const byNo = new Map(themes.map((t) => [t.no, t]));
  return group.items.map((it) => ({
    ...it,
    note: byNo.get(it.no)?.hook || byNo.get(it.no)?.summary || '',
  }));
};

/* ---------------- Öwrediji kartlar ---------------- */

export type Card = { front: string; back: string };

export type DeckMeta = {
  id: string; label: string; subject: string; grade: number; slug: string;
  accent: string; tint: string;
  /** cards in the deck, from the catalogue — known before a single one is fetched */
  total: number;
};

export const deckList = (): DeckMeta[] => INDEX
  .filter((r) => r.cards > 0)
  .map((r) => ({
    id: `${r.grade}-${r.slug}`,
    label: `${ordinal(r.grade)} synp kartlary`,
    subject: r.subject,
    grade: r.grade,
    slug: r.slug,
    ...look(r.subject),
    total: r.cards,
  }))
  .sort((a, b) => a.subject.localeCompare(b.subject, 'tk') || a.grade - b.grade);

export const deckById = (id: string) => deckList().find((d) => d.id === id);

/*
 * The decks, by the subject they belong to.
 *
 * 46 decks is 46 rows of "Informatika · 3-nji synp kartlary", and twelve of
 * those say Informatika. A subject is what a reader picks first — the grade is
 * *which* deck, not *what* it is about — so the list is folded one level: one
 * card per subject, its grades under it. What each card states is what the
 * catalogue knows and the reader cannot count for themselves: how many cards
 * the subject holds and which grades they cover.
 */
export type DeckSubject = {
  slug: string; subject: string; accent: string; tint: string;
  group: SubjectGroup;
  decks: DeckMeta[];
  /** cards across every grade of this subject */
  cards: number;
  grades: number[];
};

export const deckSubjects = (): DeckSubject[] => {
  const by = new Map<string, DeckSubject>();
  /* deckList is already sorted by subject then grade, so the decks and grades
     collected here come out in grade order without a second sort */
  for (const d of deckList()) {
    const s = by.get(d.slug) ?? {
      slug: d.slug, subject: d.subject, accent: d.accent, tint: d.tint,
      group: subjectGroup(d.slug), decks: [], cards: 0, grades: [],
    };
    s.decks.push(d);
    s.cards += d.total;
    s.grades.push(d.grade);
    by.set(d.slug, s);
  }
  return [...by.values()]
    .sort((a, b) => b.cards - a.cards || a.subject.localeCompare(b.subject, 'tk'));
};

/** The same subjects under the school's own shelves, empty shelves dropped. */
export const deckGroups = (): { id: SubjectGroup; title: string; subjects: DeckSubject[] }[] => {
  const subjects = deckSubjects();
  return GROUP_ORDER
    .map((id) => ({ id, title: GROUP_LABEL[id], subjects: subjects.filter((s) => s.group === id) }))
    .filter((g) => g.subjects.length > 0);
};

/*
 * The cards themselves, cut from the lessons when a deck is opened.
 *
 * A self-check is already a question and its answer. A formula line reads
 * "Goşmagyň orun çalyşma häsiýeti: a + b = b + a" — the name of the rule and
 * the rule — so the colon is the fold.
 */
export const loadDeckCards = async (grade: number, slug: string): Promise<Card[]> => {
  const themes = (await loadLessons(grade, slug)) ?? [];
  const cards: Card[] = [];
  for (const t of themes) {
    for (const q of t.selfCheck) cards.push({ front: q.q, back: q.a });
    for (const f of t.formulas) {
      const fold = f.indexOf(':');
      cards.push(fold > 0
        ? { front: f.slice(0, fold).trim(), back: f.slice(fold + 1).trim() }
        : { front: t.title, back: f });
    }
  }
  return cards;
};
