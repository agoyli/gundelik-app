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

/** The reader counts too — 23 classmates plus the one holding the phone. */
export const CLASS_SIZE = CLASSMATES.length + 1;

/* A small stable hash: same pupil, same lesson, same answer — every session. */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
};

export const mateDidHw = (mate: Classmate, lessonId: string) =>
  hash(`${mate.id}:${lessonId}`) < mate.rate;

/** How many of a pupil's tasks for the day are in. */
export const mateDoneCount = (mate: Classmate, lessonIds: string[]) =>
  lessonIds.filter((id) => mateDidHw(mate, id)).length;

/** Classmates who have finished everything set for the day. */
export const classDoneCount = (lessonIds: string[]) =>
  lessonIds.length === 0
    ? CLASSMATES.length
    : CLASSMATES.filter((m) => mateDoneCount(m, lessonIds) === lessonIds.length).length;
