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

/* ---------------- Olimpiýadalar ---------------- */

/*
 * An olympiad is not a contest the app runs.
 *
 * It is sat in a hall with paper, organised by the school, the district or the
 * ministry, and by the time it reaches a phone the only thing left of it is the
 * result. So there is nothing here to enter, no question bank, no points and no
 * timer — the record is a date, a stage, and what each pupil scored.
 *
 * The score is a **percentage**, because that is the one number that means the
 * same thing across two olympiads with different papers. And a place is a place
 * *within a grade*: an 8th-year and an 11th-year sat different papers, so
 * ranking them against each other would invent a competition that never
 * happened. Places are computed from the percentages, never stored — a stored
 * rank is a second copy of the result, free to disagree with it.
 */

export type OlympiadStage = 'mekdep' | 'etrap' | 'welayat' | 'dowlet';

export const OLYMPIAD_STAGE: Record<OlympiadStage, { label: string; short: string; color: string; tint: string }> = {
  mekdep: { label: 'Mekdep tapgyry', short: 'Mekdep', color: tokens.blueText, tint: tokens.blueTint },
  etrap: { label: 'Etrap tapgyry', short: 'Etrap', color: tokens.tealText, tint: tokens.tealTint },
  welayat: { label: 'Welaýat tapgyry', short: 'Welaýat', color: tokens.purpleText, tint: tokens.purpleTint },
  dowlet: { label: 'Döwlet tapgyry', short: 'Döwlet', color: tokens.orangeText, tint: tokens.orangeTint },
};

export type OlympiadResult = { name: string; school: string; percent: number; self?: boolean };

export type Olympiad = {
  id: string; subject: string; stage: OlympiadStage;
  /** the day it was sat */
  date: string;
  about: string;
  /** one board per grade, because a place only means something inside one */
  grades: { grade: number; students: OlympiadResult[] }[];
};

/** What the list and the page both call it — one subject, one title. */
export const olympiadTitle = (o: Olympiad) => `${o.subject} olimpiadasy`;

/** Everyone who sat it, across every grade. */
export const olympiadEntrants = (o: Olympiad) =>
  o.grades.reduce((n, g) => n + g.students.length, 0);

/** The reader\'s own percentage, if they sat it. */
export const olympiadSelf = (o: Olympiad) =>
  o.grades.flatMap((g) => g.students).find((s) => s.self);

export const OLYMPIADS: Olympiad[] = [
  {
    id: 'mat-welayat',
    subject: 'Matematika',
    stage: 'welayat',
    date: '2026-02-07',
    about: 'Welaýat tapgyry Aşgabadyň 16-njy mekdebinde geçirildi. Her synp öz işini işledi: dört mesele, dört sagat. Netijeler işleriň umumy balyndan göterim hökmünde berilýär.',
    grades: [
      {
        grade: 7,
        students: [
          { name: 'G. Aýna', school: '3-nji mekdep', percent: 94 },
          { name: 'D. Nurjan', school: '16-njy mekdep', percent: 88 },
          { name: 'S. Merdan', school: '16-njy mekdep', percent: 81 },
          { name: 'B. Şirin', school: '7-nji mekdep', percent: 76 },
          { name: 'O. Jemal', school: '12-nji mekdep', percent: 64 },
        ],
      },
      {
        grade: 8,
        students: [
          { name: 'M. Leýli', school: '16-njy mekdep', percent: 96 },
          { name: 'Muhammet M.', school: '16-njy mekdep', percent: 89, self: true },
          { name: 'A. Kerim', school: '7-nji mekdep', percent: 84 },
          { name: 'Ç. Bahar', school: '9-njy mekdep', percent: 78 },
          { name: 'H. Arslan', school: '5-nji mekdep', percent: 71 },
          { name: 'N. Maýa', school: '7-nji mekdep', percent: 62 },
        ],
      },
      {
        grade: 9,
        students: [
          { name: 'R. Serdar', school: '16-njy mekdep', percent: 91 },
          { name: 'K. Oguljan', school: '3-nji mekdep', percent: 87 },
          { name: 'T. Begenç', school: '12-nji mekdep', percent: 79 },
          { name: 'Ý. Gözel', school: '9-njy mekdep', percent: 68 },
        ],
      },
    ],
  },
  {
    id: 'fiz-etrap',
    subject: 'Fizika',
    stage: 'etrap',
    date: '2026-01-24',
    about: 'Etrap tapgyryna her mekdepden iki okuwçy goýberildi. Iş üç bölümden ybarat: gysga sowallar, meseleler we tejribe seljermesi.',
    grades: [
      {
        grade: 8,
        students: [
          { name: 'Muhammet M.', school: '16-njy mekdep', percent: 74, self: true },
          { name: 'A. Kerim', school: '7-nji mekdep', percent: 90 },
          { name: 'M. Leýli', school: '16-njy mekdep', percent: 83 },
          { name: 'H. Arslan', school: '5-nji mekdep', percent: 66 },
        ],
      },
      {
        grade: 9,
        students: [
          { name: 'R. Serdar', school: '16-njy mekdep', percent: 88 },
          { name: 'T. Begenç', school: '12-nji mekdep', percent: 81 },
          { name: 'K. Oguljan', school: '3-nji mekdep', percent: 73 },
        ],
      },
    ],
  },
  {
    id: 'inlis-mekdep',
    subject: 'Iňlis dili',
    stage: 'mekdep',
    date: '2026-02-02',
    about: 'Mekdep tapgyry ähli isleg bildiren okuwçylara açyk boldy. Iş diňlemek, okamak we ýazmak böleklerinden ybarat.',
    grades: [
      {
        grade: 7,
        students: [
          { name: 'O. Jemal', school: '16-njy mekdep', percent: 92 },
          { name: 'G. Aýna', school: '16-njy mekdep', percent: 85 },
          { name: 'B. Şirin', school: '16-njy mekdep', percent: 77 },
        ],
      },
      {
        grade: 8,
        students: [
          { name: 'Ç. Bahar', school: '16-njy mekdep', percent: 95 },
          { name: 'Muhammet M.', school: '16-njy mekdep', percent: 82, self: true },
          { name: 'M. Leýli', school: '16-njy mekdep', percent: 80 },
          { name: 'N. Maýa', school: '16-njy mekdep', percent: 69 },
        ],
      },
    ],
  },
  {
    id: 'himiya-dowlet',
    subject: 'Himiýa',
    stage: 'dowlet',
    date: '2025-12-20',
    about: 'Döwlet tapgyryna welaýat tapgyrynyň ýeňijileri gatnaşdy. Ýokary netije görkezen okuwçylar halkara saýlaw tapgyryna çagyrylýar.',
    grades: [
      {
        grade: 9,
        students: [
          { name: 'K. Oguljan', school: '3-nji mekdep', percent: 93 },
          { name: 'R. Serdar', school: '16-njy mekdep', percent: 86 },
          { name: 'T. Begenç', school: '12-nji mekdep', percent: 72 },
        ],
      },
      {
        grade: 10,
        students: [
          { name: 'S. Merdan', school: '16-njy mekdep', percent: 97 },
          { name: 'D. Nurjan', school: '16-njy mekdep', percent: 90 },
          { name: 'Ý. Gözel', school: '9-njy mekdep', percent: 84 },
        ],
      },
      {
        grade: 11,
        students: [
          { name: 'A. Kerim', school: '7-nji mekdep', percent: 89 },
          { name: 'M. Leýli', school: '16-njy mekdep', percent: 83 },
        ],
      },
    ],
  },
];

/* ---------------- Halkara olimpiadalar ----------------
 *
 * The one part of this section that is not a result: the olympiads a pupil can
 * still be selected for, and what to do about it. A page about applying is
 * useless without the two facts a family actually needs — which stage they have
 * to win first, and a number to ring — so both are part of the record rather
 * than a paragraph somebody has to read to the end of.
 *
 * The numbers are placeholders in the shape of Aşgabat landlines. Replace them
 * with the ministry\'s own before this ships; nothing else here has to change.
 */

export type IntlOlympiad = {
  id: string; name: string; short: string; subject: string;
  /** the stage a pupil must come through before selection opens */
  through: OlympiadStage;
  /** when it is held, and when the national selection closes */
  when: string;
  deadline: string;
  about: string;
  who: string;
  apply: string[];
  contacts: { label: string; phone: string }[];
};

export const INTL_OLYMPIADS: IntlOlympiad[] = [
  {
    id: 'imo',
    name: 'Halkara matematika olimpiadasy',
    short: 'IMO',
    subject: 'Matematika',
    through: 'dowlet',
    when: '2026-07-10',
    deadline: '2026-03-15',
    about: 'Dünýäniň 110-dan gowrak ýurdunyň okuwçylary gatnaşýan iň iri mekdep olimpiadasy. Iki gün, her günde üç mesele, her mesele 7 bal.',
    who: '20 ýaşa çenli, orta mekdebi tamamlamadyk okuwçylar. Bir ýurtdan alty okuwçy.',
    apply: [
      'Mekdep we etrap tapgyrlaryndan geçip, welaýat tapgyryna gatnaşmaly.',
      'Döwlet tapgyrynda ilkinji onluga girmeli — saýlaw diňe şondan soň açylýar.',
      'Saýlaw tapgyryna Bilim ministrliginiň sanawy boýunça çagyrylýar; mekdebiň müdiri arza berýär.',
      'Üç aýlyk taýýarlyk toparyna gatnaşyp, jemleýji synagdan geçmeli.',
    ],
    contacts: [
      { label: 'Bilim ministrligi — olimpiada bölümi', phone: '+993 12 94-05-17' },
      { label: 'Milli taýýarlyk merkezi', phone: '+993 12 94-11-08' },
    ],
  },
  {
    id: 'ipho',
    name: 'Halkara fizika olimpiadasy',
    short: 'IPhO',
    subject: 'Fizika',
    through: 'dowlet',
    when: '2026-07-18',
    deadline: '2026-03-28',
    about: 'Nazary we tejribe böleklerinden ybarat bäş sagatlyk iki synag. Her ýurtdan bäş okuwçy gatnaşýar.',
    who: '20 ýaşa çenli okuwçylar; laboratoriýa işi bilen tanyş bolmaly.',
    apply: [
      'Welaýat tapgyryndan geçip, döwlet tapgyrynda ilkinji bäşlige girmeli.',
      'Saýlaw synagy iki tapgyrda geçirilýär: nazaryýet we laboratoriýa.',
      'Arzany mekdep üsti bilen bermeli — şahsy arza kabul edilmeýär.',
    ],
    contacts: [
      { label: 'Bilim ministrligi — olimpiada bölümi', phone: '+993 12 94-05-17' },
      { label: 'Fizika-matematika mekdebi', phone: '+993 12 48-32-60' },
    ],
  },
  {
    id: 'ioi',
    name: 'Halkara informatika olimpiadasy',
    short: 'IOI',
    subject: 'Informatika',
    through: 'welayat',
    when: '2026-08-02',
    deadline: '2026-04-10',
    about: 'Algoritmler we programmirleme boýunça iki günlük ýaryş. Her günde üç mesele, kompýuterde çözülýär.',
    who: '20 ýaşa çenli okuwçylar. C++ ýa-da Python bilmek hökmany.',
    apply: [
      'Welaýat tapgyryndan geçmeli — bu olimpiada üçin döwlet tapgyry talap edilmeýär.',
      'Onlaýn saýlaw ýaryşyna hasaba durmaly (mart aýynda açylýar).',
      'Iň gowy dört netije milli topara girýär.',
    ],
    contacts: [
      { label: 'Bilim ministrligi — olimpiada bölümi', phone: '+993 12 94-05-17' },
      { label: 'Sanly tehnologiýalar merkezi', phone: '+993 12 92-77-41' },
    ],
  },
];

/*
 * How hard the contest is, and it is the list's business.
 *
 * The card used to print the top prize ("Macbook Air"), which is the loudest
 * thing a row can say and the least useful for choosing: every reader wants the
 * laptop, so a column of prizes sorts nothing. What actually decides whether to
 * enter is whether the questions are within reach — so the row carries the
 * level, and the prizes stay on the page that has room to show them.
 */
export type ContestLevel = 'easy' | 'medium' | 'hard';

export const CONTEST_LEVEL: Record<ContestLevel, { label: string; color: string; tint: string }> = {
  easy: { label: 'Aňsat', color: tokens.greenText, tint: tokens.greenTint },
  medium: { label: 'Orta', color: tokens.orangeText, tint: tokens.orangeTint },
  hard: { label: 'Kyn', color: tokens.redText, tint: tokens.redTint },
};

/** What a prize looks like — drawn, not photographed; see `PrizeArt`. */
export type PrizeArtId = 'laptop' | 'earbuds' | 'watch' | 'tablet' | 'ereader' | 'books';

export type PrizeContest = {
  id: string; title: string; about: string;
  level: ContestLevel;
  /* The two dates the whole page is derived from: before the first it is
     upcoming and the countdown runs to it, between them it is open and the
     countdown runs to the second, after it the contest is history. No `state`
     field — a stored one would be free to disagree with its own timer. */
  startsAt: string;
  endsAt: string;
  players: number;
  /* the prize is a thing, not a number of points: "Macbook Air", not 500 */
  prizes: { place: string; item: string; note: string; art: PrizeArtId; by: string }[];
  sponsors: { name: string; note: string }[];
  leaders: { rank: number; name: string; sub: string; points: number; self?: boolean }[];
};

/** Every prize contest is played the same way: ten packs, ten points a question. */
export const PACKS_PER_CONTEST = 10;
export const POINTS_PER_ANSWER = 10;

/** Where a contest is in its own life — read from its dates, never stored. */
export type PrizePhase = 'soon' | 'live' | 'done';

export const PRIZE_CONTESTS: PrizeContest[] = [
  {
    id: 'kimbirinji',
    title: '«Kim birinji» bäsleşigi',
    about: 'Gollanmalar bölümindäki testlere girip, ähli berlen testleri dogry we doly çözüp ýokary bal gazanan okuwçylara has gowy baýraklar berilýär.',
    level: 'medium',
    startsAt: '2026-02-10T18:00',
    endsAt: '2026-03-07T18:00',
    players: 1240,
    prizes: [
      { place: '1-nji ýer', item: 'Macbook Air', note: '13 dýuým · M3 prosessor', art: 'laptop', by: 'Gujurly Bookstore' },
      { place: '2-nji ýer', item: 'AirPods', note: '2-nji nesil · zarýad gutusy bilen', art: 'earbuds', by: 'Okuwçy' },
      { place: '3-nji ýer', item: 'Smartwatch', note: 'Amazfit · ädim we ukyny ölçeýär', art: 'watch', by: 'Dana' },
    ],
    sponsors: [
      { name: 'Gujurly Bookstore', note: 'Kitap dükany' },
      { name: 'Okuwçy', note: 'Mekdep harytlary' },
      { name: 'Dana', note: 'Neşirýat' },
    ],
    leaders: [
      { rank: 1, name: 'Muhammet M.', sub: '16-njy mekdep, 10A', points: 1000, self: true },
      { rank: 2, name: 'Mekan G.', sub: '16-njy mekdep, 10A', points: 900 },
      { rank: 3, name: 'Menli M.', sub: '16-njy mekdep, 10A', points: 700 },
      { rank: 4, name: 'Aman G.', sub: '16-njy mekdep, 10A', points: 645 },
    ],
  },
  {
    id: 'zehinli',
    title: '«Zehinli okuwçy» bäsleşigi',
    about: 'Ýanwar aýynyň dowamynda iň köp sapak tamamlan we iň ýokary orta baha saklan okuwçylar. Netijeler jemlenip, baýraklar mekdepde gowşuryldy.',
    level: 'easy',
    startsAt: '2026-01-10T18:00',
    endsAt: '2026-02-01T18:00',
    players: 860,
    prizes: [
      { place: '1-nji ýer', item: 'Planşet', note: 'Galaxy Tab · 10 dýuým', art: 'tablet', by: 'Gujurly Bookstore' },
      { place: '2-nji ýer', item: 'Elektron okaýjy', note: 'E-ink ekran · 8 GB', art: 'ereader', by: 'Dana' },
      { place: '3-nji ýer', item: 'Kitap toplumy', note: '10 kitap · çeper edebiýat', art: 'books', by: 'Dana' },
    ],
    sponsors: [
      { name: 'Gujurly Bookstore', note: 'Kitap dükany' },
      { name: 'Dana', note: 'Neşirýat' },
    ],
    leaders: [
      { rank: 1, name: 'D. Nurjan', sub: '16-njy mekdep, 8A', points: 1420 },
      { rank: 2, name: 'G. Aýna', sub: '3-nji mekdep, 8B', points: 1310 },
      { rank: 3, name: 'Muhammet M.', sub: '16-njy mekdep, 8B', points: 1251, self: true },
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
