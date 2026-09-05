/*
 * The class list — 8 «B», the same class the profile says the reader is in.
 *
 * Who has handed a piece of homework in is not stored per pupil per task: 24
 * pupils across a week of six lessons is 800 booleans nobody would keep
 * truthful by hand, and a prototype that invents them at render time would show
 * a different class every time the sheet opened. Instead each pupil carries one
 * honest number — `rate`, how often they actually hand work in — and the answer
 * for a given task is drawn from a hash of (pupil, lesson): stable for the life
 * of the app, different for every task, and distributed the way the class is.
 *
 * The reader is not in this list. Their own answer is the diary's `hwDone`, the
 * tick they control, and no derived guess is allowed to contradict it.
 */

export type Classmate = { id: string; name: string; initials: string; rate: number };

export const CLASSMATES: Classmate[] = [
  { id: 'c1', name: 'Amanowa Leýli', initials: 'AL', rate: 96 },
  { id: 'c2', name: 'Ataýew Kerim', initials: 'AK', rate: 88 },
  { id: 'c3', name: 'Baýramowa Aýna', initials: 'BA', rate: 92 },
  { id: 'c4', name: 'Berdiýew Şirmuhammet', initials: 'BŞ', rate: 61 },
  { id: 'c5', name: 'Çaryýewa Maýa', initials: 'ÇM', rate: 84 },
  { id: 'c6', name: 'Durdyýew Serdar', initials: 'DS', rate: 47 },
  { id: 'c7', name: 'Esenowa Gülnar', initials: 'EG', rate: 90 },
  { id: 'c8', name: 'Gurbanow Aman', initials: 'GA', rate: 72 },
  { id: 'c9', name: 'Hojaýewa Jemal', initials: 'HJ', rate: 98 },
  { id: 'c10', name: 'Ilýasow Batyr', initials: 'IB', rate: 55 },
  { id: 'c11', name: 'Jumaýewa Sona', initials: 'JS', rate: 80 },
  { id: 'c12', name: 'Kakabaýew Yhlas', initials: 'KY', rate: 66 },
  { id: 'c13', name: 'Meredowa Bahar', initials: 'MB', rate: 94 },
  { id: 'c14', name: 'Nazarow Döwlet', initials: 'ND', rate: 38 },
  { id: 'c15', name: 'Orazowa Mähri', initials: 'OM', rate: 87 },
  { id: 'c16', name: 'Öwezow Kemal', initials: 'ÖK', rate: 74 },
  { id: 'c17', name: 'Rejepowa Enejan', initials: 'RE', rate: 91 },
  { id: 'c18', name: 'Saparow Merdan', initials: 'SM', rate: 58 },
  { id: 'c19', name: 'Şyhyýewa Oguljan', initials: 'ŞO', rate: 83 },
  { id: 'c20', name: 'Taganow Nurmuhammet', initials: 'TN', rate: 69 },
  { id: 'c21', name: 'Weliýewa Aýjemal', initials: 'WA', rate: 95 },
  { id: 'c22', name: 'Ýazmyradow Guwanç', initials: 'ÝG', rate: 63 },
  { id: 'c23', name: 'Ýollyýewa Sähra', initials: 'ÝS', rate: 89 },
];

/*
 * The account holds five children in five different classes, so the roster is
 * a pool rather than a class: each child gets a stable slice of it, rotated
 * and sized by their own id. Handing every child the same 23 names would make
 * the switcher look broken — the one thing a class list must do is look like
 * *that* class.
 */
const CLASS_SIZES = [19, 21, 23, 20, 22];

const seed = (id: string) => [...id].reduce((n, c) => n + c.charCodeAt(0), 0);

export const classOf = (childId: string): Classmate[] => {
  const n = seed(childId);
  const size = CLASS_SIZES[n % CLASS_SIZES.length];
  const start = n % CLASSMATES.length;
  return Array.from({ length: Math.min(size, CLASSMATES.length) },
    (_, i) => CLASSMATES[(start + i) % CLASSMATES.length]);
};

/** The reader counts too — the classmates plus the one holding the phone. */
export const classSize = (childId: string) => classOf(childId).length + 1;

/* A small stable hash: same pupil, same lesson, same answer — every session. */
const hash32 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const hash = (s: string) => hash32(s) % 100;

export const mateDidHw = (mate: Classmate, lessonId: string) =>
  hash(`${mate.id}:${lessonId}`) < mate.rate;

/** How many of a pupil's tasks for the day are in. */
export const mateDoneCount = (mate: Classmate, lessonIds: string[]) =>
  lessonIds.filter((id) => mateDidHw(mate, id)).length;

/* ---------------- when it was handed in ----------------
 *
 * The page shows who *did* it, in the order they did it — so every doer needs
 * a time. It is the same trick as the answer itself: a hash of (pupil, task),
 * spread across the evening between 15:00 and 22:00, stable for the life of
 * the app. Nobody's homework arrives at a different hour on a second look.
 */
const EVENING_START = 15 * 60;
const EVENING_LENGTH = 7 * 60;

const minutesFor = (key: string) => EVENING_START + (hash32(`${key}:t`) % EVENING_LENGTH);

export const fmtHandIn = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** When a pupil finished the last of the tasks in question. */
const handInOf = (key: string, lessonIds: string[]) =>
  Math.max(...lessonIds.map((id) => minutesFor(`${key}:${id}`)));

export type Doer = { mate: Classmate; at: number };

/**
 * Everyone in the class who has finished *all* of the given tasks, earliest
 * first. Whoever has not is deliberately absent: a list of names under
 * "has not done their homework" is a wall of shame a diary has no business
 * printing, and the ones who did it are the only ones the reader can learn
 * anything useful from.
 */
export const doersOf = (childId: string, lessonIds: string[]): Doer[] => {
  if (lessonIds.length === 0) return [];
  return classOf(childId)
    .filter((m) => mateDoneCount(m, lessonIds) === lessonIds.length)
    .map((mate) => ({ mate, at: handInOf(mate.id, lessonIds) }))
    .sort((a, b) => a.at - b.at);
};

/** The reader's own hand-in time — their place is read against the doers. */
export const selfHandIn = (childId: string, lessonIds: string[]) =>
  lessonIds.length === 0 ? 0 : handInOf(`self:${childId}`, lessonIds);

/**
 * Where the reader came in: 1 + however many classmates were ahead of them.
 * Their own place is *their* fact, so it is shown on every tier — the names of
 * the others are what the subscription buys.
 */
export const selfPlace = (childId: string, lessonIds: string[]) => {
  const mine = selfHandIn(childId, lessonIds);
  return doersOf(childId, lessonIds).filter((d) => d.at < mine).length + 1;
};

/** Classmates who have finished everything set for the day. */
export const classDoneCount = (childId: string, lessonIds: string[]) => {
  const mates = classOf(childId);
  return lessonIds.length === 0
    ? mates.length
    : mates.filter((m) => mateDoneCount(m, lessonIds) === lessonIds.length).length;
};
