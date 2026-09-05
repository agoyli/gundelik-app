import { absDate, dayOfMonth, TODAY, weekdayLong, weekdayShort } from '../lib/date';
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
/* Şenbe is a school day here, so it is not greyed out — a disabled Saturday
   said the week ends on Friday, which is not the week these students have. */
const WEEK: { date: string; checked?: boolean }[] = [
  { date: '2026-02-09', checked: true },
  { date: '2026-02-10', checked: true },
  { date: '2026-02-11', checked: true },
  { date: '2026-02-12' }, // TODAY
  { date: '2026-02-13' },
  { date: '2026-02-14' },
];

const week: DayInfo[] = WEEK.map(({ date, checked }) => ({
  key: date,
  d: dayOfMonth(date),
  w: weekdayShort(date),
  full: weekdayLong(date),
  checked,
}));

/*
 * One timetable per child. The elder's week is the app's reference week; the
 * younger one is a real primary-school week rather than the same lessons under
 * a different name — switching child has to look like switching child.
 */
const store8b: Record<string, DaySchedule> = {
  '2026-02-12': {
    key: '2026-02-12',
    notes: 12,
    lessons: [
      L('0212-1', 'Iňlis dili', '8:00 – 8:45', {
        teacher: 'A. Gurbanowa', people: 3, grade: 5, hwDone: true,
        tema: 'Present Perfect: ulanylyşy we mysallar. 84-nji sahypa.',
        hw: 'Workbook: 5-nji gönükme, 1–8 sözlemler. Sözlügi ýat tutmaly.',
      }),
      L('0212-2', 'Rus dili', '8:55 – 9:40', {
        teacher: 'W. Iwanowa',
        tema: 'Причастный оборот. Sah. 112–114.',
        hw: '113-nji sah., 245-nji gönükme.',
      }),
      L('0212-3', 'Himiýa', '9:50 – 10:35', {
        teacher: 'M. Ataýew',
        tema: 'Kislotalar we esaslar. Neýtrallaşma reaksiýasy.',
        hw: 'Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.',
      }),
      L('0212-4', 'Türkmenistanyň taryhy', '10:45 – 11:30', {
        teacher: 'O. Saparow', people: 3, grade: 4, hwDone: true,
        tema: 'Garaşsyzlyk ýyllarynda Türkmenistan.',
        hw: '§21 okamaly, gysga konspekt ýazmaly.',
      }),
      L('0212-5', 'Geografiýa', '11:40 – 12:25', {
        teacher: 'G. Meredowa', people: 3, grade: 5, hwDone: true,
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
        teacher: 'S. Rejepowa', people: 2, grade: 4, hwDone: true,
        tema: 'Kwadrat deňlemeler. Diskriminant.', hw: '№312–318 çözmeli.',
      }),
      L('0211-2', 'Fizika', '8:55 – 9:40', {
        teacher: 'K. Hojaýew',
        tema: 'Om kanuny. Zynjyryň bölegi üçin.', hw: '§9, meseleler 4–6.',
      }),
      L('0211-3', 'Iňlis dili', '9:50 – 10:35', {
        teacher: 'A. Gurbanowa',
        tema: 'Reading: "The Great Barrier Reef".', hw: 'Teksti terjime etmeli.',
      }),
      L('0211-4', 'Türkmen dili', '10:45 – 11:30', {
        teacher: 'J. Orazowa', people: 3, grade: 5, hwDone: true,
        tema: 'Işligiň şekilleri.', hw: '96-njy gönükme.',
      }),
    ],
  },
  '2026-02-10': {
    key: '2026-02-10',
    notes: 7,
    lessons: [
      L('0210-1', 'Biologiýa', '8:00 – 8:45', {
        teacher: 'N. Berdiýewa', people: 1, grade: 4,
        tema: 'Öýjügiň gurluşy: organoidler.', hw: '§7, surat çekmeli.',
      }),
      L('0210-2', 'Himiýa', '8:55 – 9:40', {
        teacher: 'M. Ataýew', tema: 'Duzlaryň häsiýetleri.', hw: '§15, 1–4 soraglar.',
      }),
      L('0210-3', 'Informatika', '9:50 – 10:35', {
        teacher: 'D. Amanow', people: 3, grade: 3, hwDone: true,
        tema: 'Algoritmler: şahalanma.', hw: 'Blok-shema düzmeli.',
      }),
      L('0210-4', 'Matematika', '10:45 – 11:30', {
        teacher: 'S. Rejepowa', tema: 'Wieta teoremasy.', hw: '№320–326.',
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
        teacher: 'O. Saparow', people: 2, grade: 5, hwDone: true,
        tema: 'Beýik Ýüpek ýoly.', hw: 'Referat: 1 sahypa.',
      }),
    ],
  },
  '2026-02-13': { key: '2026-02-13', notes: 0, lessons: [] },
  '2026-02-14': { key: '2026-02-14', notes: 0, lessons: [] },
};

const store4a: Record<string, DaySchedule> = {
  '2026-02-12': {
    key: '2026-02-12',
    notes: 5,
    lessons: [
      L('a0212-1', 'Türkmen dili', '8:00 – 8:45', {
        teacher: 'G. Nazarowa', people: 2, grade: 5, hwDone: true,
        tema: 'At we onuň düşümleri.', hw: '42-nji gönükme, sözlemleri göçürmeli.',
      }),
      L('a0212-2', 'Matematika', '8:55 – 9:40', {
        teacher: 'G. Nazarowa', people: 1, grade: 4,
        tema: 'Köp belgili sanlary goşmak.', hw: '№118–121.',
      }),
      L('a0212-3', 'Tebigaty öwreniş', '9:50 – 10:35', {
        teacher: 'S. Ýazowa',
        tema: 'Suwuň tebigatdaky aýlanyşy.', hw: 'Surat çekmeli: suwuň ýoly.',
      }),
      L('a0212-4', 'Şekillendiriş sungaty', '10:45 – 11:30', {
        teacher: 'A. Hommadowa', people: 1, grade: 5,
        tema: 'Gyş görnüşi: reňkler.',
      }),
    ],
  },
  '2026-02-11': {
    key: '2026-02-11',
    notes: 3,
    lessons: [
      L('a0211-1', 'Matematika', '8:00 – 8:45', {
        teacher: 'G. Nazarowa', people: 2, grade: 5, hwDone: true,
        tema: 'Aňsat we çylşyrymly meseleler.', hw: '№104–108.',
      }),
      L('a0211-2', 'Iňlis dili', '8:55 – 9:40', {
        teacher: 'A. Gurbanowa',
        tema: 'My family: täze sözler.', hw: '10 sözi ýat tutmaly.',
      }),
      L('a0211-3', 'Beden terbiýesi', '9:50 – 10:35', {
        teacher: 'R. Öwezow', people: 1, grade: 5,
        tema: 'Ýeňil atletika: ylgaw.',
      }),
      L('a0211-4', 'Türkmen dili', '10:45 – 11:30', {
        teacher: 'G. Nazarowa',
        tema: 'Nakyllar we atalar sözi.', hw: '5 nakyl ýazmaly.',
      }),
    ],
  },
  '2026-02-10': {
    key: '2026-02-10',
    notes: 2,
    lessons: [
      L('a0210-1', 'Okuw', '8:00 – 8:45', {
        teacher: 'G. Nazarowa', people: 2, grade: 5, hwDone: true,
        tema: 'Ertekiler: «Ýartygulak».', hw: 'Ertekini okamaly, gürrüň bermeli.',
      }),
      L('a0210-2', 'Matematika', '8:55 – 9:40', {
        teacher: 'G. Nazarowa',
        tema: 'Kwadrat we gönüburçluk.', hw: '№96–99.',
      }),
      L('a0210-3', 'Aýdym-saz', '9:50 – 10:35', {
        teacher: 'L. Söýünowa',
        tema: 'Çagalar aýdymlary.',
      }),
    ],
  },
  '2026-02-09': {
    key: '2026-02-09',
    notes: 1,
    lessons: [
      L('a0209-1', 'Türkmen dili', '8:00 – 8:45', {
        teacher: 'G. Nazarowa', people: 1, grade: 4,
        tema: 'Sözlemiň agzalary.', hw: '38-nji gönükme.',
      }),
      L('a0209-2', 'Zähmet', '8:55 – 9:40', {
        teacher: 'A. Hommadowa', people: 2, grade: 5, hwDone: true,
        tema: 'Kagyzdan ýasamak.',
      }),
    ],
  },
  '2026-02-13': { key: '2026-02-13', notes: 0, lessons: [] },
  '2026-02-14': { key: '2026-02-14', notes: 0, lessons: [] },
};

/* Keyed by the child ids in `state/children.ts` — the diary asks for a child
   and a date, never for "the" day. */
const books: Record<string, Record<string, DaySchedule>> = { m: store8b, a: store4a };
const book = (child: string) => books[child] ?? store8b;

let lastChecked = absDate(TODAY);

/* ---------------- Public API ---------------- */

export const fetchWeek = (): Promise<DayInfo[]> => delay(week);

/* Any date is reachable now that the picker is a calendar, so a day with no
   schedule is an ordinary answer rather than an error — the screen has an
   empty state for it and does not need an exception. */
export const fetchDay = (key: string, child = 'm'): Promise<DaySchedule> =>
  delay(book(child)[key] ?? { key, notes: 0, lessons: [] });

/* Homework is a checkbox, so it unticks. Marking one done by mistake and
   having no way back is the kind of small trap that teaches people not to
   touch the control at all. */
export const setHomeworkDone = (
  dayKey: string, lessonId: string, done: boolean, child = 'm',
): Promise<DaySchedule> => {
  const lesson = book(child)[dayKey]?.lessons.find((l) => l.id === lessonId);
  if (lesson) lesson.hwDone = done;
  return delay(book(child)[dayKey]);
};

export const fetchLastChecked = (): Promise<string> => delay(lastChecked);

/* Barla is the parent signing off on a day — "I have seen this" — not a data
   refresh. So it is per-day and it leaves a mark: the day's cell keeps a dot,
   in the strip and in the calendar, and the panel stops asking. */
export const signDay = (key: string): Promise<DayInfo[]> => {
  const day = week.find((d) => d.key === key);
  if (day) day.checked = true;
  /* the mock lives in Feb 2026 — stamping the real date would mix timelines */
  lastChecked = absDate(TODAY);
  return new Promise((res) => setTimeout(() => res([...week]), 700));
};
