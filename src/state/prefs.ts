import { useSyncExternalStore } from 'react';
import { absDate } from '../lib/date';
import {
  childDaysLeft, childEndingSoon, childId, childLeftLabel, childOf, setChildTier,
  subscribeChildren,
} from './children';

/*
 * One app-wide preference store.
 *
 * It lives outside the screens because half the app now asks the same two
 * questions — "is this user premium?" and "are beta features on?" — and a
 * setting that forgets itself the moment you navigate back reads as a bug.
 * Swap the backing object for a real profile/entitlement call later; the
 * `usePrefs()` contract stays the same.
 */

export type LangId = 'tk' | 'ru' | 'en';

/*
 * Entitlement is a tier, not a boolean.
 *
 * With one paid plan `premium: true/false` was the whole model. There are two
 * now, and a boolean cannot answer "may this account see Analitika?" when one
 * paying account may and the other may not. So the store holds a **tier**, the
 * feature table below names the lowest tier that unlocks each feature, and
 * screens ask `useCan('analytics')` rather than testing a flag and hoping the
 * two paid plans happen to agree.
 */
export type TierId = 'free' | 'gorelde' | 'zehin';

/*
 * How the subject list is read. Two of these are layouts of the same list —
 * rows for deciding, cards for finding — and the third turns it on its side:
 * the programme by year rather than by subject, which is how a reader looking
 * ahead or back thinks about it. They live behind one control (`VariantSheet`)
 * because they answer one question: "show me this page another way".
 */
export type ViewId = 'list' | 'grid' | 'grades';

export type Prefs = {
  beta: boolean;
  /* notifications */
  notify: boolean; nGrades: boolean; nHw: boolean; nLessons: boolean; nContests: boolean; nNews: boolean;
  quiet: boolean; sound: boolean; haptics: boolean;
  /* security */
  biometry: boolean; twoFactor: boolean;
  lang: LangId;
  /* How the subject list is drawn. Remembered rather than held in the screen's
     own state: the reader chooses a way of looking, not a way of looking *this
     once*, and the screen unmounts every time they step back to the tile grid. */
  subjectView: ViewId;
};

const store: Prefs = {
  beta: false,
  notify: true, nGrades: true, nHw: true, nLessons: false, nContests: true, nNews: false,
  quiet: true, sound: true, haptics: true,
  biometry: true, twoFactor: false,
  lang: 'tk',
  subjectView: 'list',
};

/* every pref except the language and the view is a switch */
export type BoolPref = Exclude<keyof Prefs, 'lang' | 'subjectView'>;

/*
 * The tier is **not** a preference — it is the selected child's subscription,
 * read from `state/children.ts` every time this snapshot is built. Screens
 * still ask `usePrefs().tier` and `useCan(...)`, so nothing below them had to
 * learn that an account can hold five different plans at once; what changed is
 * that the answer follows whoever is selected.
 *
 * `premium` stays derived — "is this child paying at all?" is a question about
 * the tier, and a second copy of it would be free to disagree.
 */
type Snapshot = Prefs & { tier: TierId; premium: boolean };
const derive = (p: Prefs): Snapshot => {
  const tier = childOf(childId()).tier;
  return { ...p, tier, premium: tier !== 'free' };
};

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
let snapshot: Snapshot = derive(store);

const publish = () => {
  snapshot = derive(store);
  listeners.forEach((fn) => fn());
};

export const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
  store[key] = value;
  publish();
};

/**
 * Move the selected child onto a plan. `days` is how long the term they just
 * bought runs for — a month or a year — so the badge that counts down is
 * counting the thing that was actually paid for.
 */
export const setTier = (id: TierId, days = 30) => {
  setChildTier(childId(), id, days);
  publish();
};

/* A change of child is a change of tier, so the prefs snapshot has to be
   rebuilt for it — otherwise a screen holding `usePrefs()` would keep the
   previous child's entitlement until something else happened to publish. */
subscribeChildren(publish);

export const usePrefs = () => useSyncExternalStore(subscribe, () => snapshot);

/** Read-only shortcut for components that only care about the entitlement. */
export const usePremium = () => usePrefs().premium;

export const LANGS: { id: LangId; label: string; native: string }[] = [
  { id: 'tk', label: 'Türkmen dili', native: 'Türkmençe' },
  { id: 'ru', label: 'Rus dili', native: 'Русский' },
  { id: 'en', label: 'Iňlis dili', native: 'English' },
];

export const langLabel = (id: LangId) => LANGS.find((l) => l.id === id)?.label ?? '—';

/*
 * The two plans on offer — one definition, so Profil, Sazlamalar, every teaser
 * and the tariff page can never quote different prices.
 *
 * Both are named after the student they are bought for rather than after their
 * price or a metal: "Göreldeli" (exemplary) is the parent who wants to know how
 * the week went, "Zehinli" (gifted) is the student who wants the whole toolkit.
 * A tier a family can name is one they can choose between.
 *
 * The list price of a year is always twelve months — it is derived, so the
 * saving printed beside it can never contradict the monthly figure above it.
 */
export type Tier = {
  id: Exclude<TierId, 'free'>;
  name: string;
  monthly: number;
  yearly: number;
  blurb: string;
};

export const TIERS: Tier[] = [
  {
    id: 'gorelde',
    name: 'Göreldeli',
    monthly: 5,
    yearly: 40,
    blurb: 'Bildirişler, ýyldyzlar, testler we bäsleşikler',
  },
  {
    id: 'zehin',
    name: 'Zehinli',
    monthly: 50,
    yearly: 400,
    blurb: 'Ähli aýratynlyklar — seljerme, gollanmalar, Akylly mugallym',
  },
];

/** The cheapest way in — what an ad or a teaser should quote. */
export const ENTRY = TIERS[0];

export const tierOf = (id: TierId) => TIERS.find((t) => t.id === id);
/* The free plan has a name like the other two — a family choosing between
   plans is choosing between Adaty, Göreldeli and Zehinli, and "Mugt" (free of
   charge) is a price, not a plan. The word still appears in copy where it
   means the price. */
export const FREE_NAME = 'Adaty';

/** What the free plan actually includes — the counterpart of a tier's `blurb`,
    so the plan widget can describe all three plans the same way. */
export const FREE_BLURB = 'Gündelik, bildirişler we söhbet — mahabat bilen';
export const tierName = (id: TierId) => tierOf(id)?.name ?? FREE_NAME;

/** A year at the monthly rate — what the yearly price is discounted *from*. */
export const listYearly = (t: Tier) => t.monthly * 12;
export const savePct = (t: Tier) => Math.round((1 - t.yearly / listYearly(t)) * 100);

/*
 * What a year costs *per month* — the figure that makes two terms comparable.
 * Derived from the yearly price rather than typed beside it, so the headline
 * price and the per-month reading of it can never disagree. One decimal, and
 * only when there is one: "3,3" is a price, "3,33" is an invoice.
 */
export const perMonth = (t: Tier) => {
  const v = Math.round((t.yearly / 12) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');
};

/*
 * What each tier unlocks. One table, read by the comparison page *and* by the
 * screens themselves, so a row that promises a feature and the screen that
 * gates it can never drift apart.
 */
export type FeatureId =
  | 'diary' | 'notices' | 'chat'
  | 'sms' | 'badges' | 'tests' | 'contests' | 'classmates' | 'noads'
  | 'notes' | 'analytics' | 'roadmap' | 'cards' | 'games' | 'ai';

export const FEATURES: { id: FeatureId; label: string; tier: TierId }[] = [
  { id: 'diary', label: 'Gündelik, bahalar, rasporýaniýe', tier: 'free' },
  { id: 'notices', label: 'Mekdep bildirişleri', tier: 'free' },
  { id: 'chat', label: 'Mugallymlar bilen söhbet', tier: 'free' },
  { id: 'sms', label: 'Wakalar barada SMS', tier: 'gorelde' },
  { id: 'badges', label: 'Ýyldyzlaryň doly seljermesi', tier: 'gorelde' },
  { id: 'tests', label: 'Test bankasy — ähli testler', tier: 'gorelde' },
  { id: 'contests', label: 'Premium bäsleşikler', tier: 'gorelde' },
  { id: 'classmates', label: 'Synpdaşlaryň öý işi — at-at', tier: 'gorelde' },
  { id: 'noads', label: 'Mahabatsyz programma', tier: 'gorelde' },
  { id: 'notes', label: 'Mugallymyň ähli bellikleri', tier: 'zehin' },
  { id: 'analytics', label: 'Analitika we hasabatlar', tier: 'zehin' },
  { id: 'roadmap', label: 'Ähli dersleriň sapaklary 1–12', tier: 'zehin' },
  { id: 'cards', label: 'Öwrediji kartlaryň ählisi', tier: 'zehin' },
  { id: 'games', label: 'Sapak oýunlary', tier: 'zehin' },
  { id: 'ai', label: 'Akylly mugallym 24/7', tier: 'zehin' },
];

const RANK: Record<TierId, number> = { free: 0, gorelde: 1, zehin: 2 };

/** Does `have` reach `need`? Tiers are ordered, so this is one comparison. */
export const meets = (have: TierId, need: TierId) => RANK[have] >= RANK[need];

export const featureTier = (id: FeatureId): TierId =>
  FEATURES.find((f) => f.id === id)?.tier ?? 'zehin';

/** The question every gated screen actually asks. */
export const useCan = (id: FeatureId) => meets(usePrefs().tier, featureTier(id));

/** The cheapest plan that unlocks a feature — what a teaser should offer. */
export const tierFor = (id: FeatureId) => tierOf(featureTier(id));

/*
 * Subscription state, separate from which plan is on offer.
 *
 * The term belongs to a child, so everything here reads the selected one: the
 * printed date, the days left, and whether the end is close enough to say so.
 * Every one of them is derived from that child's `untilIso` — two screens used
 * to print "28 gün galdy" as a literal beside a date they did not count from,
 * a number that was wrong the day after it was typed.
 */
export const PLAN = {
  status: 'Işjeň',
  get untilIso() { return childOf(childId()).untilIso; },
  get until() {
    const iso = childOf(childId()).untilIso;
    return iso ? absDate(iso) : '—';
  },
  /* what the referral programme pays for each friend who subscribes */
  referralReward: 5,
};

/** Days left on the selected child's term; `null` on the free plan. */
export const planDaysLeft = () => childDaysLeft(childOf(childId()));

/** "28 gün galdy" / "Şu gün gutarýar", or `null` on a plan that does not end. */
export const planLeftLabel = () => childLeftLabel(childOf(childId()));

/** Under a fortnight is where "renew" stops being a setting and starts being
    news, so the badge changes colour rather than only its wording. */
export const planEndingSoon = () => childEndingSoon(childOf(childId()));

/* Social proof shown on ads and the tariff page. Kept here so the same
   numbers appear everywhere they are claimed. */
export const PROOF = {
  teachers: '10 000',
  students: '84 000',
  schools: '312',
  lessons: '1 200',
};
