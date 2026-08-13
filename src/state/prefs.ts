import { useSyncExternalStore } from 'react';

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

export type Prefs = {
  /* entitlement */
  tier: TierId;
  beta: boolean;
  /* notifications */
  notify: boolean; nGrades: boolean; nHw: boolean; nLessons: boolean; nContests: boolean; nNews: boolean;
  quiet: boolean; sound: boolean; haptics: boolean;
  /* security */
  biometry: boolean; twoFactor: boolean;
  lang: LangId;
};

const store: Prefs = {
  tier: 'zehin',
  beta: false,
  notify: true, nGrades: true, nHw: true, nLessons: false, nContests: true, nNews: false,
  quiet: true, sound: true, haptics: true,
  biometry: true, twoFactor: false,
  lang: 'tk',
};

/* every pref except the language and the tier is a switch */
export type BoolPref = Exclude<keyof Prefs, 'lang' | 'tier'>;

/* `premium` is derived, never stored — "is this account paying at all?" is a
   question about the tier, and a second copy of it would be free to disagree */
type Snapshot = Prefs & { premium: boolean };
const derive = (p: Prefs): Snapshot => ({ ...p, premium: p.tier !== 'free' });

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

export const setTier = (id: TierId) => setPref('tier', id);

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
export const tierName = (id: TierId) => tierOf(id)?.name ?? 'Mugt';

/** A year at the monthly rate — what the yearly price is discounted *from*. */
export const listYearly = (t: Tier) => t.monthly * 12;
export const savePct = (t: Tier) => Math.round((1 - t.yearly / listYearly(t)) * 100);

/*
 * What each tier unlocks. One table, read by the comparison page *and* by the
 * screens themselves, so a row that promises a feature and the screen that
 * gates it can never drift apart.
 */
export type FeatureId =
  | 'diary' | 'notices' | 'chat'
  | 'sms' | 'badges' | 'tests' | 'contests'
  | 'notes' | 'analytics' | 'roadmap' | 'cards' | 'games' | 'ai';

export const FEATURES: { id: FeatureId; label: string; tier: TierId }[] = [
  { id: 'diary', label: 'Gündelik, bahalar, rasporýaniýe', tier: 'free' },
  { id: 'notices', label: 'Mekdep bildirişleri', tier: 'free' },
  { id: 'chat', label: 'Mugallymlar bilen söhbet', tier: 'free' },
  { id: 'sms', label: 'Wakalar barada SMS', tier: 'gorelde' },
  { id: 'badges', label: 'Ýyldyzlaryň doly seljermesi', tier: 'gorelde' },
  { id: 'tests', label: 'Test bankasy — ähli testler', tier: 'gorelde' },
  { id: 'contests', label: 'Premium bäsleşikler', tier: 'gorelde' },
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

/* Subscription state, separate from which plan is on offer. */
export const PLAN = {
  status: 'Işjeň',
  until: '12.03.2026',
  /* what the referral programme pays for each friend who subscribes */
  referralReward: 5,
};

/* Social proof shown on ads and the tariff page. Kept here so the same
   numbers appear everywhere they are claimed. */
export const PROOF = {
  teachers: '10 000',
  students: '84 000',
  schools: '312',
  lessons: '1 200',
};
