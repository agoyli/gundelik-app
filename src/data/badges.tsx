import { byDateDesc } from '../lib/date';
import { tokens } from '../theme';

/*
 * Mugallymyň nyşanlary — the marks a teacher gives during a lesson.
 *
 * Grades say what a student produced; badges say how they behaved, which is
 * the part parents and students otherwise only hear at the end of a term.
 * Two tones only — positive and negative — because a third would turn a quick
 * teacher tap into a decision.
 */

export type BadgeTone = 'good' | 'bad';

export type BadgeType = {
  id: string; label: string; tone: BadgeTone; emoji: string; note: string;
};

export const BADGE_TYPES: BadgeType[] = [
  { id: 'active', label: 'Işjeňlik', tone: 'good', emoji: '✋', note: 'Sapakda işjeň gatnaşdy' },
  { id: 'hw', label: 'Öý işi wagtynda', tone: 'good', emoji: '📘', note: 'Öý işini doly we wagtynda tabşyrdy' },
  { id: 'help', label: 'Kömekçi', tone: 'good', emoji: '🤝', note: 'Synpdaşyna kömek etdi' },
  { id: 'progress', label: 'Öňegidişlik', tone: 'good', emoji: '📈', note: 'Öňki netijesinden gowulandy' },
  { id: 'order', label: 'Tertip-düzgün', tone: 'good', emoji: '⭐', note: 'Görelde bolarlyk özüni alyp barşy' },
  { id: 'late', label: 'Giç galdy', tone: 'bad', emoji: '⏰', note: 'Sapaga giç geldi' },
  { id: 'nohw', label: 'Öý işi ýok', tone: 'bad', emoji: '📕', note: 'Öý işi ýerine ýetirilmedi' },
  { id: 'talk', label: 'Sapakda gürledi', tone: 'bad', emoji: '💬', note: 'Sapagyň dowamynda ünsi bozdy' },
  { id: 'kit', label: 'Esbap ýok', tone: 'bad', emoji: '🎒', note: 'Depder ýa-da kitap getirmedi' },
];

export const badgeType = (id: string) => BADGE_TYPES.find((b) => b.id === id);

export const TONE = {
  good: { tint: tokens.greenTint, ink: tokens.greenText, solid: tokens.greenDeep, label: 'Ýagşy' },
  bad: { tint: tokens.redTint, ink: tokens.redText, solid: tokens.redDeep, label: 'Üns bermeli' },
};

/* ---------------- awards ---------------- */

export type Award = {
  id: string; typeId: string; subject: string; teacher: string;
  date: string; week: number; comment?: string;
};

/* One term of history — the stats screen aggregates this, nothing is hardcoded.
   Sorted newest-first by the date itself rather than by the order the rows
   happen to be written in, so a feed reading straight down stays chronological
   even after a row is edited. */
export const AWARDS: Award[] = ([
  { id: 'w1', typeId: 'active', subject: 'Matematika', teacher: 'S. Rejepowa', date: '2026-02-11', week: 6, comment: 'Tagtada meseläni özbaşdak çözdi.' },
  { id: 'w2', typeId: 'hw', subject: 'Iňlis dili', teacher: 'A. Gurbanowa', date: '2026-02-12', week: 6 },
  { id: 'w3', typeId: 'talk', subject: 'Himiýa', teacher: 'M. Ataýew', date: '2026-02-12', week: 6, comment: 'Tejribe wagtynda ünsi bozdy.' },
  { id: 'w4', typeId: 'help', subject: 'Informatika', teacher: 'D. Amanow', date: '2026-02-10', week: 6 },
  { id: 'w5', typeId: 'active', subject: 'Taryh', teacher: 'O. Saparow', date: '2026-02-09', week: 5 },
  { id: 'w6', typeId: 'progress', subject: 'Matematika', teacher: 'S. Rejepowa', date: '2026-02-10', week: 5, comment: 'Geçen testden 20% gowy netije.' },
  { id: 'w7', typeId: 'late', subject: 'Bedenterbiýe', teacher: 'B. Çaryýew', date: '2026-02-08', week: 5 },
  { id: 'w8', typeId: 'hw', subject: 'Geografiýa', teacher: 'G. Meredowa', date: '2026-02-07', week: 5 },
  { id: 'w9', typeId: 'order', subject: 'Türkmen dili', teacher: 'J. Orazowa', date: '2026-02-05', week: 4 },
  { id: 'w10', typeId: 'active', subject: 'Iňlis dili', teacher: 'A. Gurbanowa', date: '2026-02-04', week: 4 },
  { id: 'w11', typeId: 'nohw', subject: 'Fizika', teacher: 'K. Hojaýew', date: '2026-02-03', week: 4 },
  { id: 'w12', typeId: 'hw', subject: 'Matematika', teacher: 'S. Rejepowa', date: '2026-02-02', week: 4 },
  { id: 'w13', typeId: 'active', subject: 'Himiýa', teacher: 'M. Ataýew', date: '2026-01-30', week: 3 },
  { id: 'w14', typeId: 'help', subject: 'Matematika', teacher: 'S. Rejepowa', date: '2026-01-29', week: 3 },
  { id: 'w15', typeId: 'kit', subject: 'Biologiýa', teacher: 'N. Berdiýewa', date: '2026-01-28', week: 3 },
  { id: 'w16', typeId: 'progress', subject: 'Iňlis dili', teacher: 'A. Gurbanowa', date: '2026-01-27', week: 3 },
  { id: 'w17', typeId: 'active', subject: 'Informatika', teacher: 'D. Amanow', date: '2026-01-23', week: 2 },
  { id: 'w18', typeId: 'order', subject: 'Taryh', teacher: 'O. Saparow', date: '2026-01-22', week: 2 },
  { id: 'w19', typeId: 'late', subject: 'Matematika', teacher: 'S. Rejepowa', date: '2026-01-21', week: 2 },
  { id: 'w20', typeId: 'hw', subject: 'Himiýa', teacher: 'M. Ataýew', date: '2026-01-16', week: 1 },
  { id: 'w21', typeId: 'active', subject: 'Geografiýa', teacher: 'G. Meredowa', date: '2026-01-15', week: 1 },
  { id: 'w22', typeId: 'help', subject: 'Türkmen dili', teacher: 'J. Orazowa', date: '2026-01-14', week: 1 },
] as Award[]).sort((a, b) => byDateDesc(a.date, b.date));

export const toneOf = (a: Award): BadgeTone => badgeType(a.typeId)?.tone ?? 'good';

/* which badges were given in a given lesson — the diary reads this.
   Keyed by ISO date, so it works for any day the strip can select rather
   than only the two days that had a hand-written label. */
export const awardsForLesson = (subject: string, isoDate: string) =>
  AWARDS.filter((a) => a.subject === subject && a.date === isoDate);

export const WEEK_LABELS = ['1-hep.', '2-hep.', '3-hep.', '4-hep.', '5-hep.', '6-hep.'];
