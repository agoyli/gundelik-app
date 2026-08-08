import {
  BooksIcon, ComputerIcon, GameIcon, MathIcon, SocietyIcon,
} from '../components/Icons';
import { tokens } from '../theme';

/*
 * One source of truth for every Gollanmalar section: the list rows and the
 * detail page behind them read the same record, so a card can never advertise
 * a number its own page contradicts.
 */

/* ---------------- Temalar ---------------- */

export type Subject = {
  id: string; label: string; icon: React.ReactNode;
  accent: string; tint: string; done: number; total: number;
};

export const TEMA_SUBJECTS: Subject[] = [
  { id: 'matematika', label: 'Matematika', icon: <MathIcon size={24} />, accent: tokens.blueText, tint: tokens.blueTint, done: 5, total: 20 },
  { id: 'fizika', label: 'Fizika', icon: <BooksIcon size={24} />, accent: tokens.purpleText, tint: tokens.purpleTint, done: 12, total: 18 },
  { id: 'himiya', label: 'Himiýa', icon: <BooksIcon size={24} />, accent: tokens.tealText, tint: tokens.tealTint, done: 3, total: 16 },
  { id: 'informatika', label: 'Informatika', icon: <ComputerIcon size={24} />, accent: tokens.orangeText, tint: tokens.orangeTint, done: 9, total: 14 },
  { id: 'taryh', label: 'Türkmenistanyň taryhy', icon: <SocietyIcon size={24} />, accent: tokens.redText, tint: tokens.redTint, done: 7, total: 15 },
];

/* ---------------- Öwrediji kartlar ---------------- */

export type Deck = {
  id: string; label: string; subject: string; accent: string; tint: string;
  cards: { front: string; back: string }[];
  known: number; due: number;
  /* ISO date of the last review; absent means the deck was never opened */
  studiedAt?: string;
};

export const DECKS: Deck[] = [
  {
    id: 'formulalar', label: 'Algebra formulalary', subject: 'Matematika',
    accent: tokens.blueText, tint: tokens.blueTint, known: 2, due: 2, studiedAt: '2026-02-11',
    cards: [
      { front: 'Diskriminant', back: 'D = b² − 4ac' },
      { front: 'Wiýeta teoremasy', back: 'x₁ + x₂ = −b/a,  x₁·x₂ = c/a' },
      { front: 'Kwadratlaryň tapawudy', back: 'a² − b² = (a − b)(a + b)' },
      { front: 'Jemiň kwadraty', back: '(a + b)² = a² + 2ab + b²' },
    ],
  },
  {
    id: 'himiya', label: 'Himiki elementler', subject: 'Himiýa',
    accent: tokens.tealText, tint: tokens.tealTint, known: 1, due: 2, studiedAt: '2026-02-09',
    cards: [
      { front: 'Fe', back: 'Demir — 26-njy element' },
      { front: 'Au', back: 'Altyn — 79-njy element' },
      { front: 'H₂O', back: 'Suw — wodorodyň oksidi' },
    ],
  },
  {
    id: 'inlis', label: 'Iňlis dili — 100 söz', subject: 'Iňlis dili',
    accent: tokens.purpleText, tint: tokens.purpleTint, known: 0, due: 3,
    cards: [
      { front: 'achievement', back: 'üstünlik, gazanylan netije' },
      { front: 'knowledge', back: 'bilim' },
      { front: 'curious', back: 'bilesigeliji' },
    ],
  },
];

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

/* ---------------- Oýunlar ---------------- */

export type Game = {
  id: string; label: string; sub: string; subject: string; minutes: number;
  best: number; played: number; avg: number; accent: string; tint: string;
  about: string; how: string[];
  leaders: { rank: number; name: string; sub: string; points: number; self?: boolean }[];
};

export const GAMES: Game[] = [
  {
    id: 'hasap', label: 'Çalt hasap', sub: 'Matematika · 2 min', subject: 'Matematika', minutes: 2,
    best: 320, played: 14, avg: 245, accent: tokens.blueText, tint: tokens.blueTint,
    about: 'Iki minutda näçe mysal çözüp bilersiň? Her dogry jogap bal, her ýalňyş bolsa wagt aýyrýar.',
    how: [
      'Ekranda goşmak, aýyrmak we köpeltmek mysallary çykýar.',
      'Dogry jogaby üç warianty arasyndan saýla.',
      'Yzygider dogry jogaplar bal köpeldijisini ösdürýär.',
    ],
    leaders: [
      { rank: 1, name: 'A. Kerim', sub: '7-nji mekdep, 8A', points: 410 },
      { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 320, self: true },
      { rank: 3, name: 'G. Aýna', sub: '3-nji mekdep, 8B', points: 295 },
    ],
  },
  {
    id: 'sozluk', label: 'Söz tapmaça', sub: 'Iňlis dili · 3 min', subject: 'Iňlis dili', minutes: 3,
    best: 210, played: 6, avg: 160, accent: tokens.purpleText, tint: tokens.purpleTint,
    about: 'Garyşyk harplardan iňlis sözüni ýygna. Sözler «100 söz» kart toplumyndan alynýar.',
    how: [
      'Harplar garyşyk görnüşde berilýär.',
      'Dogry sözi ýygnasaň, indiki sözüge geçýärsiň.',
      'Kynçylyk çekseň, bir harp maslahat alyp bolýar — bal azalýar.',
    ],
    leaders: [
      { rank: 1, name: 'O. Jemal', sub: '12-nji mekdep, 8W', points: 340 },
      { rank: 2, name: 'B. Şirin', sub: '16-njy mekdep, 8B', points: 260 },
      { rank: 3, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 210, self: true },
    ],
  },
  {
    id: 'element', label: 'Element ýygna', sub: 'Himiýa · 4 min', subject: 'Himiýa', minutes: 4,
    best: 0, played: 0, avg: 0, accent: tokens.tealText, tint: tokens.tealTint,
    about: 'Elementiň belgisini onuň ady bilen jübütle. Tablisany ýatda saklamagyň iň çalt ýoly.',
    how: [
      'Ekranyň bir tarapynda belgiler, beýlekisinde atlar.',
      'Dogry jübütleri birleşdir.',
      'Wagt gutarýança näçe köp jübüt tapsaň, şonça köp bal.',
    ],
    leaders: [
      { rank: 1, name: 'H. Arslan', sub: '5-nji mekdep, 8A', points: 380 },
      { rank: 2, name: 'N. Maýa', sub: '7-nji mekdep, 8B', points: 355 },
      { rank: 3, name: 'D. Nurjan', sub: '16-njy mekdep, 8A', points: 300 },
    ],
  },
  {
    id: 'karta', label: 'Karta boýunça', sub: 'Geografiýa · 5 min', subject: 'Geografiýa', minutes: 5,
    best: 145, played: 3, avg: 120, accent: tokens.orangeText, tint: tokens.orangeTint,
    about: 'Welaýatlary, şäherleri we derýalary kartada tap. Her dogry görkezme bal getirýär.',
    how: [
      'Sorag berilýär: «Lebap welaýaty nirede?»',
      'Kartadan dogry ýeri saýla.',
      'Ilkinji synanyşykda tapsaň, iki esse bal.',
    ],
    leaders: [
      { rank: 1, name: 'Ç. Bahar', sub: '9-njy mekdep, 8B', points: 290 },
      { rank: 2, name: 'S. Merdan', sub: '16-njy mekdep, 8A', points: 220 },
      { rank: 3, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 145, self: true },
    ],
  },
];

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

/* ---------------- Testler ---------------- */

export type TestItem = {
  id: string; title: string; tema: string; questions: number; minutes: number;
  best: number | null; attempts: { date: string; score: number }[];
};

export type TestSubject = {
  id: string; label: string; icon: React.ReactNode; tint: string; color: string;
  tests: TestItem[];
};

export const TEST_SUBJECTS: TestSubject[] = [
  {
    id: 'matematika', label: 'Matematika', icon: <MathIcon size={26} />,
    tint: tokens.blueTint, color: tokens.blueText,
    tests: [
      {
        id: 'm1', title: 'Kwadrat deňlemeler', tema: 'Algebra · 8-nji synp', questions: 12, minutes: 15,
        best: 92, attempts: [{ date: '2026-02-02', score: 92 }, { date: '2026-01-28', score: 75 }],
      },
      {
        id: 'm2', title: 'Diskriminant', tema: 'Algebra · 8-nji synp', questions: 8, minutes: 10,
        best: 88, attempts: [{ date: '2026-01-30', score: 88 }],
      },
      {
        id: 'm3', title: 'Funksiýanyň grafigi', tema: 'Algebra · 8-nji synp', questions: 10, minutes: 12,
        best: null, attempts: [],
      },
      {
        id: 'm4', title: 'Üçburçlugyň meýdany', tema: 'Geometriýa · 8-nji synp', questions: 10, minutes: 12,
        best: 70, attempts: [{ date: '2026-01-18', score: 70 }],
      },
    ],
  },
  {
    id: 'informatika', label: 'Informatika', icon: <ComputerIcon size={26} />,
    tint: tokens.surface, color: tokens.ink2,
    tests: [
      {
        id: 'i1', title: 'Algoritmler', tema: 'Informatika · 8-nji synp', questions: 10, minutes: 12,
        best: 100, attempts: [{ date: '2026-02-03', score: 100 }],
      },
      {
        id: 'i2', title: 'Sanlaryň ulgamlary', tema: 'Informatika · 8-nji synp', questions: 12, minutes: 15,
        best: null, attempts: [],
      },
    ],
  },
  {
    id: 'jemgyyet', label: 'Jemgyýet', icon: <SocietyIcon size={26} />,
    tint: tokens.tealTint, color: tokens.tealText,
    tests: [
      {
        id: 'j1', title: 'Raýatyň hukuklary', tema: 'Jemgyýeti öwreniş', questions: 15, minutes: 18,
        best: 80, attempts: [{ date: '2026-01-25', score: 80 }],
      },
      {
        id: 'j2', title: 'Döwlet gurluşy', tema: 'Jemgyýeti öwreniş', questions: 12, minutes: 15,
        best: null, attempts: [],
      },
    ],
  },
];

/* the leaderboard shown on the Testler landing page */
export const RATING = [
  { rank: 1, name: 'M. Leýli', sub: '16-njy mekdep, 8A', points: 1311 },
  { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 1251, self: true },
  { rank: 3, name: 'A. Kerim', sub: '7-nji mekdep, 8A', points: 1198 },
];

export const GAME_ICON = <GameIcon size={24} />;
