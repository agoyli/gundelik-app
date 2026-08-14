import { GameIcon } from '../components/Icons';
import { tokens } from '../theme';

/*
 * One source of truth for every Gollanmalar section: the list rows and the
 * detail page behind them read the same record, so a card can never advertise
 * a number its own page contradicts.
 */

/* ---------------- Sapaklar ----------------
 * Nothing left. The subject list is the real curriculum, built by the screen
 * itself for whichever grade the filter is on and counted with `pathLength`;
 * `SUBJECT_LOOK` moved to `curriculum.tsx` with the subjects themselves — see
 * `look()` there, which the decks and tests below still read so one subject
 * keeps one colour. A copy fixed to USER_GRADE could only be a staler second
 * answer to the same question.
 */

/* ---------------- Öwrediji kartlar ----------------
 * The decks are the real material now — see `library.ts`, which cuts them from
 * the lessons the content source serves. What stays here is the shape a study
 * session needs once its cards have been fetched.
 */

export type Deck = {
  id: string; label: string; subject: string; accent: string; tint: string;
  cards: { front: string; back: string }[];
  known: number; due: number;
};

/* ---------------- Bäsleşikler ---------------- */

export type ContestState = 'live' | 'soon' | 'done';

export type Contest = {
  id: string; title: string; subject: string; when: string; state: ContestState;
  prize: number; players: number; questions: number; minutes: number;
  about: string;
  rules: string[];
  prizes: { place: string; points: number }[];
  leaders: { rank: number; name: string; sub: string; points: number; self?: boolean }[];
};

export const CONTEST_STATE = {
  live: { label: 'Dowam edýär', color: tokens.redText, tint: tokens.redTint, cta: 'Goşul' },
  soon: { label: 'Ýakynda', color: tokens.blueText, tint: tokens.blueTint, cta: 'Ýazyl' },
  done: { label: 'Tamamlandy', color: tokens.ink3, tint: tokens.surface, cta: 'Netije' },
};

export const CONTESTS: Contest[] = [
  {
    id: 'matolimp', title: 'Matematika olimpiadasy', subject: 'Matematika', when: 'Şu gün · 18:00',
    state: 'live', prize: 500, players: 128, questions: 20, minutes: 45,
    about: 'Welaýat derejesindäki açyk olimpiada. Sowallar 8-nji synpyň algebra we geometriýa temalaryndan düzülen.',
    rules: [
      'Test başlanandan soň 45 minut wagt berilýär — sagat duruzylmaýar.',
      'Her sowal bir gezek jogaplanýar, yza gaýdyp bolmaýar.',
      'Kalkulýator we kagyz ulanmaga rugsat edilýär.',
      'Baglanyşyk kesilse, 5 minudyň dowamynda dowam edip bolýar.',
    ],
    prizes: [
      { place: '1-nji orun', points: 500 },
      { place: '2-nji orun', points: 300 },
      { place: '3-nji orun', points: 150 },
    ],
    leaders: [
      { rank: 1, name: 'M. Leýli', sub: '16-njy mekdep, 8A', points: 1311 },
      { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 1251, self: true },
      { rank: 3, name: 'A. Kerim', sub: '7-nji mekdep, 8A', points: 1198 },
    ],
  },
  {
    id: 'dil', title: 'Iňlis dili marafony', subject: 'Iňlis dili', when: '2026-02-12 · 16:00',
    state: 'soon', prize: 300, players: 64, questions: 30, minutes: 30,
    about: 'Söz baýlygy we grammatika boýunça tizlik marafony. Her dogry jogap wagt goşýar.',
    rules: [
      'Sowallar ýeňilden kynlaşyp barýar.',
      'Ýalňyş jogap 10 sekunt aýyrýar.',
      'Iň köp dogry jogap toplan ýeňiji bolýar.',
    ],
    prizes: [
      { place: '1-nji orun', points: 300 },
      { place: '2-nji orun', points: 180 },
      { place: '3-nji orun', points: 90 },
    ],
    leaders: [
      { rank: 1, name: 'G. Aýna', sub: '3-nji mekdep, 8B', points: 940 },
      { rank: 2, name: 'S. Merdan', sub: '16-njy mekdep, 8A', points: 880 },
      { rank: 3, name: 'O. Jemal', sub: '12-nji mekdep, 8W', points: 815 },
    ],
  },
  {
    id: 'himiya', title: 'Himiýa boýunça kwiz', subject: 'Himiýa', when: '2026-02-19 · 15:00',
    state: 'soon', prize: 250, players: 41, questions: 15, minutes: 20,
    about: 'Elementler tablisasy we ýönekeý reaksiýalar boýunça gysga kwiz.',
    rules: [
      'Her sowal üçin 80 sekunt.',
      'Tablisa test wagtynda elýeterli.',
      'Netije test gutaran badyna görkezilýär.',
    ],
    prizes: [
      { place: '1-nji orun', points: 250 },
      { place: '2-nji orun', points: 150 },
      { place: '3-nji orun', points: 75 },
    ],
    leaders: [
      { rank: 1, name: 'B. Şirin', sub: '16-njy mekdep, 8B', points: 610 },
      { rank: 2, name: 'H. Arslan', sub: '5-nji mekdep, 8A', points: 540 },
      { rank: 3, name: 'N. Maýa', sub: '7-nji mekdep, 8B', points: 505 },
    ],
  },
  {
    id: 'taryh', title: 'Watan taryhy bäsleşigi', subject: 'Taryh', when: 'Tamamlandy · 2-nji orun',
    state: 'done', prize: 200, players: 96, questions: 25, minutes: 40,
    about: 'Türkmenistanyň taryhy boýunça mekdepara bäsleşik. Sen 25 sowaldan 22-sine dogry jogap berdiň.',
    rules: [
      'Netije 22/25 — 2-nji orun.',
      'Gazanylan bal: 200.',
      'Jogaplaryňy aşakdaky düwme arkaly gaýtadan görüp bolýar.',
    ],
    prizes: [
      { place: '1-nji orun', points: 400 },
      { place: '2-nji orun', points: 200 },
      { place: '3-nji orun', points: 100 },
    ],
    leaders: [
      { rank: 1, name: 'D. Nurjan', sub: '16-njy mekdep, 8A', points: 24 },
      { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 22, self: true },
      { rank: 3, name: 'Ç. Bahar', sub: '9-njy mekdep, 8B', points: 21 },
    ],
  },
];

/* Oýunlar — deleted, not moved.

   Four arcade drills with invented scores and invented leaderboards ("Çalt
   hasap", 320 bal, A. Kerim in 8A) stood in for practice material the app did
   not have. It has 766 interactives now, one per theme with material, written
   against the programme — they are indexed in `library.ts` (`playGroups`) and
   played on the lesson page. Nothing here needed keeping. */


/* ---------------- Kitaphana ---------------- */

export type Book = {
  id: string; title: string; author: string; pages: number; read: number; cat: string;
  accent: string; tint: string; about: string;
  chapters: { id: string; title: string; pages: string; done: boolean }[];
};

export const BOOK_CATS = ['Ähli', 'Okuw kitaplary', 'Çeper edebiýat', 'Ensiklopediýa'];

export const BOOKS: Book[] = [
  {
    id: 'algebra8', title: 'Algebra — 8-nji synp', author: 'Okuw kitaby', pages: 224, read: 68,
    cat: 'Okuw kitaplary', accent: tokens.blueText, tint: tokens.blueTint,
    about: 'Mekdebiň esasy okuw kitaby. Her bapyň soňunda gaýtalama sowallary we özüňi barlamak üçin mysallar bar.',
    chapters: [
      { id: 'c1', title: 'Natural sanlar', pages: '5 – 38', done: true },
      { id: 'c2', title: 'Rasional aňlatmalar', pages: '39 – 84', done: true },
      { id: 'c3', title: 'Kwadrat kökler', pages: '85 – 128', done: true },
      { id: 'c4', title: 'Kwadrat deňlemeler', pages: '129 – 176', done: false },
      { id: 'c5', title: 'Funksiýanyň grafigi', pages: '177 – 224', done: false },
    ],
  },
  {
    id: 'himiya8', title: 'Himiýa — 8-nji synp', author: 'Okuw kitaby', pages: 196, read: 24,
    cat: 'Okuw kitaplary', accent: tokens.tealText, tint: tokens.tealTint,
    about: 'Maddalar, olaryň gurluşy we özgerişi. Tejribe işleriniň beýany suratlar bilen berlen.',
    chapters: [
      { id: 'c1', title: 'Maddalar we hadysalar', pages: '5 – 46', done: true },
      { id: 'c2', title: 'Atom gurluşy', pages: '47 – 96', done: false },
      { id: 'c3', title: 'Himiki baglanyşyk', pages: '97 – 146', done: false },
      { id: 'c4', title: 'Oksidler we kislotalar', pages: '147 – 196', done: false },
    ],
  },
  {
    id: 'gorogly', title: 'Görogly', author: 'Halk dessany', pages: 412, read: 100,
    cat: 'Çeper edebiýat', accent: tokens.orangeText, tint: tokens.orangeTint,
    about: 'Türkmen halk dessany. Göroglynyň we onuň ýigitleriniň şöhratly ýollary barada söhbet açýar.',
    chapters: [
      { id: 'c1', title: 'Göroglynyň dörediliş şahasy', pages: '5 – 96', done: true },
      { id: 'c2', title: 'Harmandäli şahasy', pages: '97 – 204', done: true },
      { id: 'c3', title: 'Öwez şahasy', pages: '205 – 318', done: true },
      { id: 'c4', title: 'Soňky şahalar', pages: '319 – 412', done: true },
    ],
  },
  {
    id: 'kosmos', title: 'Kosmos barada', author: 'Ensiklopediýa', pages: 148, read: 0,
    cat: 'Ensiklopediýa', accent: tokens.purpleText, tint: tokens.purpleTint,
    about: 'Gün ulgamyndan başlap, alysdaky galaktikalara çenli — suratly ensiklopediýa.',
    chapters: [
      { id: 'c1', title: 'Gün ulgamy', pages: '5 – 44', done: false },
      { id: 'c2', title: 'Ýyldyzlar', pages: '45 – 88', done: false },
      { id: 'c3', title: 'Galaktikalar', pages: '89 – 120', done: false },
      { id: 'c4', title: 'Kosmosa uçuşlar', pages: '121 – 148', done: false },
    ],
  },
];

/* ---------------- Testler ----------------
 * The tests are the themes' own banks — `testSubjects()` in `library.ts`.
 */

/* the leaderboard shown on the Testler landing page */
export const RATING = [
  { rank: 1, name: 'M. Leýli', sub: '16-njy mekdep, 8A', points: 1311 },
  { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 1251, self: true },
  { rank: 3, name: 'A. Kerim', sub: '7-nji mekdep, 8A', points: 1198 },
];

export const GAME_ICON = <GameIcon size={24} />;

/* What the bank holds is counted from the catalogue — see `bankTotal()` and
   `subjectBank()` in `library.ts`. Nothing about it is written down twice. */
