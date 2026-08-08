import { absDate, dayOfMonth, TODAY, weekdayLong, weekdayShort } from '../lib/date';
import type { DayEvent, DayInfo, DaySchedule, Lesson } from '../types';

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

/*
 * The week is keyed by ISO date, and the key IS the date — so a day can be
 * compared, sorted and formatted like any other date in the app. The week used
 * to run 2–9 Feb under opaque `d2`…`d9` keys while `lastChecked` claimed it was
 * the 12th: two timelines in one screen, and no day the formatter would ever
 * call "Şu gün". Number and weekday are derived, never typed twice.
 */
const WEEK: { date: string; events: DayEvent[]; disabled?: boolean }[] = [
  { date: '2026-02-09', events: [] },
  { date: '2026-02-10', events: ['house'] },
  { date: '2026-02-11', events: ['dot', 'pen'] },
  { date: '2026-02-12', events: [] }, // TODAY
  { date: '2026-02-13', events: [] },
  { date: '2026-02-14', events: [], disabled: true },
];

const week: DayInfo[] = WEEK.map(({ date, events, disabled }) => ({
  key: date,
  d: dayOfMonth(date),
  w: weekdayShort(date),
  full: weekdayLong(date),
  events,
  disabled,
}));

const store: Record<string, DaySchedule> = {
  '2026-02-12': {
    key: '2026-02-12',
    notes: 12,
    lessons: [
      L('0212-1', 'Iňlis dili', '8:00 – 8:45', {
        teacher: 'A. Gurbanowa', people: 3, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Present Perfect: ulanylyşy we mysallar. 84-nji sahypa.',
        hw: 'Workbook: 5-nji gönükme, 1–8 sözlemler. Sözlügi ýat tutmaly.',
      }),
      L('0212-2', 'Rus dili', '8:55 – 9:40', {
        teacher: 'W. Iwanowa',
        tema: 'Причастный оборот. Sah. 112–114.',
        hw: '113-nji sah., 245-nji gönükme.',
      }),
      L('0212-3', 'Himiýa', '9:50 – 10:35', {
        teacher: 'M. Ataýew', unread: 2,
        tema: 'Kislotalar we esaslar. Neýtrallaşma reaksiýasy.',
        hw: 'Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.',
      }),
      L('0212-4', 'Türkmenistanyň taryhy', '10:45 – 11:30', {
        teacher: 'O. Saparow', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Garaşsyzlyk ýyllarynda Türkmenistan.',
        hw: '§21 okamaly, gysga konspekt ýazmaly.',
      }),
      L('0212-5', 'Geografiýa', '11:40 – 12:25', {
        teacher: 'G. Meredowa', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Merkezi Aziýanyň tebigy zolaklary.',
        hw: 'Kontur kartada derýalary bellemeli.',
      }),
      L('0212-6', 'Bedenterbiýe', '12:35 – 13:20', {
        teacher: 'B. Çaryýew',
        tema: 'Woleýbol: topy kabul etmek we pas bermek.',
      }),
    ],
  },
  '2026-02-11': {
    key: '2026-02-11',
    notes: 4,
    lessons: [
      L('0211-1', 'Matematika', '8:00 – 8:45', {
        teacher: 'S. Rejepowa', people: 2, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Kwadrat deňlemeler. Diskriminant.', hw: '№312–318 çözmeli.',
      }),
      L('0211-2', 'Fizika', '8:55 – 9:40', {
        teacher: 'K. Hojaýew', unread: 1,
        tema: 'Om kanuny. Zynjyryň bölegi üçin.', hw: '§9, meseleler 4–6.',
      }),
      L('0211-3', 'Iňlis dili', '9:50 – 10:35', {
        teacher: 'A. Gurbanowa',
        tema: 'Reading: "The Great Barrier Reef".', hw: 'Teksti terjime etmeli.',
      }),
      L('0211-4', 'Türkmen dili', '10:45 – 11:30', {
        teacher: 'J. Orazowa', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Işligiň şekilleri.', hw: '96-njy gönükme.',
      }),
    ],
  },
  '2026-02-10': {
    key: '2026-02-10',
    notes: 7,
    lessons: [
      L('0210-1', 'Biologiýa', '8:00 – 8:45', {
        teacher: 'N. Berdiýewa', people: 1, grade: { a: 4, b: 4, color: 'blue' },
        tema: 'Öýjügiň gurluşy: organoidler.', hw: '§7, surat çekmeli.',
      }),
      L('0210-2', 'Himiýa', '8:55 – 9:40', {
        teacher: 'M. Ataýew', tema: 'Duzlaryň häsiýetleri.', hw: '§15, 1–4 soraglar.',
      }),
      L('0210-3', 'Informatika', '9:50 – 10:35', {
        teacher: 'D. Amanow', people: 3, grade: { a: 5, b: 5, color: 'green' }, hwDone: true,
        tema: 'Algoritmler: şahalanma.', hw: 'Blok-shema düzmeli.',
      }),
      L('0210-4', 'Matematika', '10:45 – 11:30', {
        teacher: 'S. Rejepowa', unread: 3, tema: 'Wieta teoremasy.', hw: '№320–326.',
      }),
      L('0210-5', 'Aýdym-saz', '11:40 – 12:25', {
        teacher: 'L. Söýünowa', tema: 'Milli saz gurallary.',
      }),
    ],
  },
  '2026-02-09': {
    key: '2026-02-09',
    notes: 2,
    lessons: [
      L('0209-1', 'Iňlis dili', '8:00 – 8:45', {
        teacher: 'A. Gurbanowa', people: 3, hwDone: true,
        tema: 'Grammar revision: tenses.', hw: 'Test taýýarlyk.',
      }),
      L('0209-2', 'Fizika', '8:55 – 9:40', {
        teacher: 'K. Hojaýew', tema: 'Elektrik togunyň işi we kuwwaty.', hw: '§10 okamaly.',
      }),
      L('0209-3', 'Taryh', '9:50 – 10:35', {
        teacher: 'O. Saparow', people: 2, grade: { a: 5, b: 4, color: 'blue' }, hwDone: true,
        tema: 'Beýik Ýüpek ýoly.', hw: 'Referat: 1 sahypa.',
      }),
    ],
  },
  '2026-02-13': { key: '2026-02-13', notes: 0, lessons: [] },
  '2026-02-14': { key: '2026-02-14', notes: 0, lessons: [] },
};

let lastChecked = absDate(TODAY);

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
  lastChecked = absDate(TODAY);
  return new Promise((res) => setTimeout(() => res(lastChecked), 900));
};
