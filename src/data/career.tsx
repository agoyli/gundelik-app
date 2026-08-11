import { tokens } from '../theme';

/*
 * Hünär synagy — the career-orientation test, its questions and its scoring.
 *
 * "Arzuwymdaky hünär" was a picker of five jobs. For a student who already
 * knows, that is exactly right; for the many who do not, a list of five words
 * is not a decision aid — it asks the question it was supposed to help answer.
 * This is the other half: twelve statements, six traits, and a ranking of the
 * same specialities the picker offers.
 *
 * Three deliberate constraints:
 *
 * 1. **The result is derived, never stored.** The store keeps the *answers*;
 *    the matches are computed from them every time. A stored ranking would be
 *    free to disagree with the answers that produced it, and it could not be
 *    recomputed when the speciality list grows.
 * 2. **One trait per question.** Splitting a statement across two traits makes
 *    the arithmetic opaque and the result unexplainable — and the result page
 *    has to be able to say *why*.
 * 3. **It is advice, not a verdict.** Every speciality shows the school
 *    subjects it rests on, so a match is something a student can act on this
 *    term rather than a label to accept or reject.
 */

export type TraitId = 'tehniki' | 'tebigat' | 'sanly' | 'adamlar' | 'dil' | 'dolandyrys';

export const TRAITS: { id: TraitId; label: string; note: string; color: string }[] = [
  { id: 'tehniki', label: 'Tehnika', note: 'Enjamlar, gurluşlar, öz eliň bilen ýasamak', color: tokens.orangeText },
  { id: 'tebigat', label: 'Tebigat', note: 'Janly tebigat, saglyk, barlaghana işi', color: tokens.greenText },
  { id: 'sanly', label: 'Sanly pikir', note: 'Matematika, logika, programmirleme', color: tokens.blueText },
  { id: 'adamlar', label: 'Adamlar', note: 'Öwretmek, kömek etmek, bilelikde işlemek', color: tokens.tealText },
  { id: 'dil', label: 'Dil we söz', note: 'Diller, ýazmak, köpçüligiň öňünde çykyş', color: tokens.purpleText },
  { id: 'dolandyrys', label: 'Guramaçylyk', note: 'Meýilnama, hasap, topary ugrukdyrmak', color: tokens.redText },
];

export const traitOf = (id: TraitId) => TRAITS.find((t) => t.id === id)!;

/* Two statements per trait, alternating, so a student never answers six
   questions in a row that all feel like the same question. */
export const QUESTIONS: { id: string; text: string; trait: TraitId }[] = [
  { id: 'q1', text: 'Enjamlaryň içiniň nähili işleýändigini bilesim gelýär.', trait: 'tehniki' },
  { id: 'q2', text: 'Ösümlikler we janly-jandarlar hakda okamak maňa gyzykly.', trait: 'tebigat' },
  { id: 'q3', text: 'Kynrak matematika meselesini çözmek maňa lezzet berýär.', trait: 'sanly' },
  { id: 'q4', text: 'Synpdaşlaryma düşünmedik sapagyny düşündirmek maňa ýaraýar.', trait: 'adamlar' },
  { id: 'q5', text: 'Daşary ýurt dillerini öwrenmek maňa aňsat düşýär.', trait: 'dil' },
  { id: 'q6', text: 'Topar işini meýilleşdirmek köplenç maňa ynanylýar.', trait: 'dolandyrys' },
  { id: 'q7', text: 'Döwlen zady taşlamazdan öň özüm bejermäge synanyşýaryn.', trait: 'tehniki' },
  { id: 'q8', text: 'Adamlara saglygy bilen bagly kömek etmek isleýärin.', trait: 'tebigat' },
  { id: 'q9', text: 'Kompýuterde bir zat döretmek — programma, oýun, sahypa — gyzykly.', trait: 'sanly' },
  { id: 'q10', text: 'Kimdir biriniň meselesini diňläp, çözgüt tapmaga kömek edýärin.', trait: 'adamlar' },
  { id: 'q11', text: 'Köpçüligiň öňünde çykyş etmek meni gorkuzmaýar.', trait: 'dil' },
  { id: 'q12', text: 'Pul, hasap we möhletler bilen işlemek maňa düşnükli.', trait: 'dolandyrys' },
];

/* Three steps, not five. A school student answering twelve statements needs a
   scale they can decide on without weighing it — "hemişe" and "köplenç" are a
   distinction nobody makes honestly at the eleventh question. */
export const ANSWERS: { value: number; label: string }[] = [
  { value: 0, label: 'Ýok' },
  { value: 1, label: 'Käwagt' },
  { value: 2, label: 'Hawa' },
];

export type Speciality = {
  id: string;
  label: string;
  /** the school subjects it rests on — shown in the picker and the result */
  hint: string;
  what: string;
  weights: Partial<Record<TraitId, number>>;
};

/* The one speciality list: the Profil picker and the test result read it, so a
   job can never be offered in one place and missing from the other. */
export const SPECIALITIES: Speciality[] = [
  {
    id: 'programmist',
    label: 'Programmist',
    hint: 'Informatika · Matematika',
    what: 'Programma we sahypa ýazýar, meseläni algoritme öwürýär.',
    weights: { sanly: 2, tehniki: 1 },
  },
  {
    id: 'lukman',
    label: 'Lukman',
    hint: 'Biologiýa · Himiýa',
    what: 'Adamyň saglygyny bejerýär, kesgitleýär we goraýar.',
    weights: { tebigat: 2, adamlar: 1 },
  },
  {
    id: 'injener',
    label: 'Inžener',
    hint: 'Fizika · Matematika',
    what: 'Enjamlary we desgalary taslaýar, gurýar we synag edýär.',
    weights: { tehniki: 2, sanly: 1 },
  },
  {
    id: 'mugallym',
    label: 'Mugallym',
    hint: 'Söýgüli dersiň · Pedagogika',
    what: 'Bilýän zadyny başgalara öwredýär, synpy alyp barýar.',
    weights: { adamlar: 2, dil: 1 },
  },
  {
    id: 'diplomat',
    label: 'Diplomat',
    hint: 'Taryh · Daşary ýurt dilleri',
    what: 'Ýurdy daşary ýurtda wekilçilik edýär, gepleşik geçirýär.',
    weights: { dil: 2, adamlar: 1 },
  },
  {
    id: 'ykdysadyy',
    label: 'Ykdysadyýetçi',
    hint: 'Matematika · Jemgyýeti öwreniş',
    what: 'Hasabat, býujet we maliýe meýilnamasy bilen işleýär.',
    weights: { dolandyrys: 2, sanly: 1 },
  },
  {
    id: 'agronom',
    label: 'Agronom',
    hint: 'Biologiýa · Himiýa',
    what: 'Ekin ösdürmegiň tehnologiýasyny alyp barýar.',
    weights: { tebigat: 2, tehniki: 1 },
  },
  {
    id: 'arhitektor',
    label: 'Arhitektor',
    hint: 'Matematika · Çyzuw',
    what: 'Jaýlary we şäher giňişligini taslaýar.',
    weights: { tehniki: 2, dolandyrys: 1 },
  },
];

export const specialityOf = (id: string) => SPECIALITIES.find((s) => s.id === id);

/* ---------------- scoring ----------------
   Answers are `{questionId: 0|1|2}`. A trait's score is what was scored out of
   what could have been, as a percentage — so traits stay comparable even if one
   of them ever gets a third question. A speciality's match is its weighted
   average of those trait scores, which means the number on the result page can
   always be explained by pointing at the two bars under it. */

export type Answers = Record<string, number>;

export const traitScores = (answers: Answers): Record<TraitId, number> => {
  const got = {} as Record<TraitId, number>;
  const max = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => { got[t.id] = 0; max[t.id] = 0; });
  QUESTIONS.forEach((q) => {
    max[q.trait] += 2;
    got[q.trait] += answers[q.id] ?? 0;
  });
  const out = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => { out[t.id] = max[t.id] ? Math.round((got[t.id] / max[t.id]) * 100) : 0; });
  return out;
};

export const matches = (answers: Answers) => {
  const scores = traitScores(answers);
  return SPECIALITIES
    .map((s) => {
      const entries = Object.entries(s.weights) as [TraitId, number][];
      const total = entries.reduce((n, [, w]) => n + w, 0);
      const sum = entries.reduce((n, [t, w]) => n + scores[t] * w, 0);
      return { ...s, match: Math.round(sum / total) };
    })
    .sort((a, b) => b.match - a.match);
};

/* The traits that actually earned the top match, in the order they carried it —
   what the result page points at when it says why. */
export const drivers = (id: string, answers: Answers) => {
  const s = specialityOf(id);
  if (!s) return [];
  const scores = traitScores(answers);
  return (Object.keys(s.weights) as TraitId[])
    .sort((a, b) => (s.weights[b] ?? 0) - (s.weights[a] ?? 0))
    .map((t) => ({ trait: traitOf(t), score: scores[t] }));
};
