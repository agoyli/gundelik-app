import type { DayInfo, DaySchedule, Lesson } from '../types';

/* ------------------------------------------------------------------ */
/*  Mock API — replace each exported fn with a real fetch() later.     */
/*  Responses are deep-cloned so the UI can never mutate the "server". */
/* ------------------------------------------------------------------ */

const LATENCY = () => 250 + Math.random() * 300;
const delay = <T,>(v: T): Promise<T> =>
  new Promise((res) => setTimeout(() => res(structuredClone(v)), LATENCY()));

const L = (id: string, subject: string, time: string, p: Partial<Lesson> = {}): Lesson => ({
  id,
  subject,
  time,
  teacher: '—',
  people: 0,
  grade: null,
  unread: 0,
  hwDone: false,
  tema: 'Täze tema: mugallym tarapyndan giriziler.',
  hw: null,
  ...p,
});

const week: DayInfo[] = [
  { key: 'd2', d: 2, w: 'Siş', full: 'Sişenbe', events: [] },
  { key: 'd3', d: 3, w: 'Çar', full: 'Çarşenbe', events: ['house'] },
  { key: 'd4', d: 4, w: 'Pen', full: 'Penşenbe', events: ['dot', 'pen'] },
  { key: 'd5', d: 5, w: 'Ann', full: 'Anna', events: [] },
  { key: 'd6', d: 6, w: 'Şen', full: 'Şenbe', events: [] },
  { key: 'd8', d: 8, w: 'Duş', full: 'Duşenbe', events: [], disabled: true },
  { key: 'd9', d: 9, w: 'Siş', full: 'Sişenbe', events: [], disabled: true },
];

const store: Record<string, DaySchedule> = {
  d2: {
    key: 'd2',
    notes: 12,
    lessons: [
      L('d2-1', 'Iňlis dili', '8:00 – 8:45', {
        teacher: 'A. Gurbanowa', people: 3, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Present Perfect: ulanylyşy we mysallar. 84-nji sahypa.',
        hw: 'Workbook: 5-nji gönükme, 1–8 sözlemler. Sözlügi ýat tutmaly.',
      }),
      L('d2-2', 'Rus dili', '8:55 – 9:40', {
        teacher: 'W. Iwanowa',
        tema: 'Причастный оборот. Sah. 112–114.',
        hw: '113-nji sah., 245-nji gönükme.',
      }),
      L('d2-3', 'Himiýa', '9:50 – 10:35', {
        teacher: 'M. Ataýew', unread: 2,
        tema: 'Kislotalar we esaslar. Neýtrallaşma reaksiýasy.',
        hw: 'Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.',
      }),
      L('d2-4', 'Türkmenistanyň taryhy', '10:45 – 11:30', {
        teacher: 'O. Saparow', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Garaşsyzlyk ýyllarynda Türkmenistan.',
        hw: '§21 okamaly, gysga konspekt ýazmaly.',
      }),
      L('d2-5', 'Geografiýa', '11:40 – 12:25', {
        teacher: 'G. Meredowa', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Merkezi Aziýanyň tebigy zolaklary.',
        hw: 'Kontur kartada derýalary bellemeli.',
      }),
      L('d2-6', 'Bedenterbiýe', '12:35 – 13:20', {
        teacher: 'B. Çaryýew',
        tema: 'Woleýbol: topy kabul etmek we pas bermek.',
      }),
    ],
  },
  d3: {
    key: 'd3',
    notes: 4,
    lessons: [
      L('d3-1', 'Matematika', '8:00 – 8:45', {
        teacher: 'S. Rejepowa', people: 2, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Kwadrat deňlemeler. Diskriminant.', hw: '№312–318 çözmeli.',
      }),
      L('d3-2', 'Fizika', '8:55 – 9:40', {
        teacher: 'K. Hojaýew', unread: 1,
        tema: 'Om kanuny. Zynjyryň bölegi üçin.', hw: '§9, meseleler 4–6.',
      }),
      L('d3-3', 'Iňlis dili', '9:50 – 10:35', {
        teacher: 'A. Gurbanowa',
        tema: 'Reading: "The Great Barrier Reef".', hw: 'Teksti terjime etmeli.',
      }),
      L('d3-4', 'Türkmen dili', '10:45 – 11:30', {
        teacher: 'J. Orazowa', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Işligiň şekilleri.', hw: '96-njy gönükme.',
      }),
    ],
  },
  d4: {
    key: 'd4',
    notes: 7,
    lessons: [
      L('d4-1', 'Biologiýa', '8:00 – 8:45', {
        teacher: 'N. Berdiýewa', people: 1, grade: { a: 4, b: 4, color: 'blue' },
        tema: 'Öýjügiň gurluşy: organoidler.', hw: '§7, surat çekmeli.',
      }),
      L('d4-2', 'Himiýa', '8:55 – 9:40', {
        teacher: 'M. Ataýew', tema: 'Duzlaryň häsiýetleri.', hw: '§15, 1–4 soraglar.',
      }),
      L('d4-3', 'Informatika', '9:50 – 10:35', {
        teacher: 'D. Amanow', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Algoritmler: şahalanma.', hw: 'Blok-shema düzmeli.',
      }),
      L('d4-4', 'Matematika', '10:45 – 11:30', {
        teacher: 'S. Rejepowa', unread: 3, tema: 'Wieta teoremasy.', hw: '№320–326.',
      }),
      L('d4-5', 'Aýdym-saz', '11:40 – 12:25', {
        teacher: 'L. Söýünowa', tema: 'Milli saz gurallary.',
      }),
    ],
  },
  d5: {
    key: 'd5',
    notes: 2,
    lessons: [
      L('d5-1', 'Iňlis dili', '8:00 – 8:45', {
        teacher: 'A. Gurbanowa', people: 3, hwDone: true,
        tema: 'Grammar revision: tenses.', hw: 'Test taýýarlyk.',
      }),
      L('d5-2', 'Fizika', '8:55 – 9:40', {
        teacher: 'K. Hojaýew', tema: 'Elektrik togunyň işi we kuwwaty.', hw: '§10 okamaly.',
      }),
      L('d5-3', 'Taryh', '9:50 – 10:35', {
        teacher: 'O. Saparow', people: 2, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Beýik Ýüpek ýoly.', hw: 'Referat: 1 sahypa.',
      }),
    ],
  },
  d6: { key: 'd6', notes: 0, lessons: [] },
  d8: { key: 'd8', notes: 0, lessons: [] },
  d9: { key: 'd9', notes: 0, lessons: [] },
};

let lastChecked = '12.02.2026';

/* ---------------- Public API ---------------- */

export const fetchWeek = (): Promise<DayInfo[]> => delay(week);

export const fetchDay = (key: string): Promise<DaySchedule> => {
  const day = store[key];
  if (!day) return Promise.reject(new Error(`Unknown day: ${key}`));
  return delay(day);
};

export const markHomeworkDone = (dayKey: string, lessonId: string): Promise<DaySchedule> => {
  const lesson = store[dayKey]?.lessons.find((l) => l.id === lessonId);
  if (lesson) lesson.hwDone = true;
  return delay(store[dayKey]);
};

export const fetchLastChecked = (): Promise<string> => delay(lastChecked);

export const runSyncCheck = (): Promise<string> => {
  /* the mock lives in Feb 2026 — stamping the real date would mix timelines */
  lastChecked = '12.02.2026';
  return new Promise((res) => setTimeout(() => res(lastChecked), 900));
};
