/*
 * One way to write a date.
 *
 * The mock data used to carry pre-formatted Turkmen strings ("4-nji fewral",
 * "8-nji few.", "30-njy ýan.") — three spellings of the same idea, none of them
 * sortable or comparable, and all of them long enough to truncate in a row. Data
 * now stores an ISO date and every screen formats it here, so a date reads the
 * same everywhere and "today" only has to be decided once.
 */

/** The app's notion of today. One anchor, so relative labels stay coherent. */
export const TODAY = '2026-02-12';

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const dayDiff = (iso: string, from = TODAY) =>
  Math.round((parse(iso).getTime() - parse(from).getTime()) / 86_400_000);

/**
 * `12.02.2026`, or a relative word for the three days a reader thinks of by
 * name. Relative beats absolute at ±1 day — "düýn" is read faster than a date
 * the reader has to subtract — and loses beyond it, where "3 gün öň" makes you
 * do arithmetic to place it in a week.
 */
export const fmtDate = (iso: string): string => {
  const diff = dayDiff(iso);
  if (diff === 0) return 'Şu gün';
  if (diff === -1) return 'Düýn';
  if (diff === 1) return 'Ertir';
  return absDate(iso);
};

/**
 * Just the relative word, or `null` when there isn't one. For places that
 * already show the date and only want to add "…and that one is today".
 */
export const relDate = (iso: string): string | null => {
  const diff = dayDiff(iso);
  return diff === 0 ? 'Şu gün' : diff === -1 ? 'Düýn' : diff === 1 ? 'Ertir' : null;
};

/** Always the numeric form — for tables and anywhere a fixed width matters. */
export const absDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

/** `12.02` — for ranges, where repeating the year twice adds nothing. */
export const dayMonth = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

/** `09.02 – 15.02`, the label over a week of stats. */
export const fmtRange = (fromIso: string, toIso: string) =>
  `${dayMonth(fromIso)} – ${dayMonth(toIso)}`;

/** Sort helper so feeds order by the date itself, not by its label. */
export const byDateDesc = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0);

/* ---------------- datetimes (messages, announcements) ----------------
   A message list answers "when" at two levels: inside today the reader wants
   the clock, outside it the day. So the row gets the coarse form and the
   message itself the precise one. */

const dateOf = (isoDateTime: string) => isoDateTime.slice(0, 10);
const timeOf = (isoDateTime: string) => isoDateTime.slice(11, 16);

/** Row form: `09:20` today, `Düýn` yesterday, `08.02.2026` before that. */
export const fmtWhenShort = (isoDateTime: string) => {
  const d = dayDiff(dateOf(isoDateTime));
  if (d === 0) return timeOf(isoDateTime);
  if (d === -1) return 'Düýn';
  return absDate(dateOf(isoDateTime));
};

/** Message form: same, but never drops the clock. */
export const fmtWhen = (isoDateTime: string) => {
  const d = dayDiff(dateOf(isoDateTime));
  if (d === 0) return timeOf(isoDateTime);
  if (d === -1) return `Düýn ${timeOf(isoDateTime)}`;
  return `${absDate(dateOf(isoDateTime))} ${timeOf(isoDateTime)}`;
};

/** Day heading over a grouped feed. */
export const dayHeading = (iso: string) => fmtDate(iso);

/* ---------------- counting down ----------------
 *
 * A countdown is the one place the app needs a *clock*, and the app's day is
 * fixed at `TODAY` — so it counts from the app's own now: the anchor's date
 * with the device's time of day. Counting from the device's date instead would
 * put every seeded date months in the past and print a dead timer; ignoring the
 * device's clock entirely would print a timer that never moves.
 */
export const appNow = () => {
  const t = new Date();
  const [y, m, d] = TODAY.split('-').map(Number);
  return new Date(y, m - 1, d, t.getHours(), t.getMinutes(), t.getSeconds());
};

const parseDateTime = (isoDateTime: string) => {
  const [y, m, d] = dateOf(isoDateTime).split('-').map(Number);
  const [hh, mm] = timeOf(isoDateTime).split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
};

/** What is left until a datetime, already split into the four cells a timer shows. */
export const untilParts = (isoDateTime: string) => {
  const ms = parseDateTime(isoDateTime).getTime() - appNow().getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    past: ms <= 0,
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
};

/* ---------------- weekdays ----------------
   The date strip used to carry `d`, `w` and `full` as three hand-written
   fields per day, which is three chances for the number and the weekday to
   disagree. They are all functions of the ISO date, so they are derived. */

const WEEKDAYS = [
  ['Ýek', 'Ýekşenbe'], ['Duş', 'Duşenbe'], ['Siş', 'Sişenbe'], ['Çar', 'Çarşenbe'],
  ['Pen', 'Penşenbe'], ['Ann', 'Anna'], ['Şen', 'Şenbe'],
] as const;

export const weekdayShort = (iso: string) => WEEKDAYS[parse(iso).getDay()][0];
export const weekdayLong = (iso: string) => WEEKDAYS[parse(iso).getDay()][1];
export const dayOfMonth = (iso: string) => Number(iso.slice(8, 10));
export const isToday = (iso: string) => iso === TODAY;

/* ---------------- months ----------------
   Everything a month grid needs, derived from an ISO date so the picker can
   never disagree with the strip it opens from. */

const MONTHS = [
  'Ýanwar', 'Fewral', 'Mart', 'Aprel', 'Maý', 'Iýun',
  'Iýul', 'Awgust', 'Sentýabr', 'Oktýabr', 'Noýabr', 'Dekabr',
] as const;

/** `Fewral 2026` — the heading over a month grid. */
export const monthLabel = (iso: string) =>
  `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

export const daysInMonth = (iso: string) =>
  new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0).getDate();

/** Where the 1st sits in a Monday-first grid, 0–6. The school week starts Duş. */
export const firstWeekdayIndex = (iso: string) =>
  (parse(`${iso.slice(0, 7)}-01`).getDay() + 6) % 7;

/** The nth day of the same month, as an ISO date. */
export const dayInMonth = (iso: string, day: number) =>
  `${iso.slice(0, 7)}-${String(day).padStart(2, '0')}`;

/** Monday-first short weekday headers for a month grid. */
export const WEEKDAY_HEADS = ['Duş', 'Siş', 'Çar', 'Pen', 'Ann', 'Şen', 'Ýek'] as const;

/** Sunday is the day off; a school calendar should say so. */
export const isDayOff = (iso: string) => parse(iso).getDay() === 0;

/** Shift a month by ±1, keeping the day at 01. */
export const shiftMonth = (iso: string, by: number) => {
  const d = new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
