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
