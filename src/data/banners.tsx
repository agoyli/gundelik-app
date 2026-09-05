/*
 * The advertising side of the app.
 *
 * Two readers meet this file. A pupil on the free tier sees a banner — a 2:1
 * card in a fixed slot, with the shop's own colours and one line about what it
 * is — and can either open it or pay to never see one again. A local business
 * sees the other half: which slots exist, what a day in one costs, which
 * schools it can be shown to, and which days are already sold.
 *
 * Everything the seller is told is derived from the same three tables the buyer
 * is shown, so a price quoted in the booking form and a price printed on a slot
 * cannot drift apart. `BOOKED` is the calendar's only source of "no" — an
 * availability answer is a lookup, never a guess.
 */

import { Box } from '@mui/material';
import { addDays } from '../lib/date';
import { tokens } from '../theme';

/* ---------------- the artwork ----------------
   Flat shapes rather than photographs: a prototype that ships stock photos
   makes design decisions it cannot keep, and an advertiser's own image is what
   goes here in the real product. */

export type BannerArtId = 'book' | 'device' | 'lang' | 'sport';

export function BannerArt({ art, ink }: { art: BannerArtId; ink: string }) {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, color: ink, opacity: .9 }}>
      <svg viewBox="0 0 320 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {art === 'book' && (
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
            <circle cx="262" cy="46" r="46" fill="currentColor" opacity=".12" stroke="none" />
            <path d="M236 118V58c0-4 3-7 7-7h26v67h-26c-4 0-7 3-7 7z" />
            <path d="M296 118V58c0-4-3-7-7-7h-20v67h20c4 0 7 3 7 7z" />
            <path d="M269 51v67" />
            <path d="M246 68h14M246 82h14" strokeLinecap="round" />
          </g>
        )}
        {art === 'device' && (
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="258" cy="80" r="52" fill="currentColor" opacity=".12" stroke="none" />
            <rect x="228" y="42" width="60" height="86" rx="10" />
            <path d="M248 52h20" strokeLinecap="round" />
            <path d="M240 74h36M240 90h36M240 106h22" strokeLinecap="round" opacity=".7" />
          </g>
        )}
        {art === 'lang' && (
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <circle cx="262" cy="78" r="48" fill="currentColor" opacity=".12" stroke="none" />
            <circle cx="262" cy="78" r="34" />
            <ellipse cx="262" cy="78" rx="14" ry="34" />
            <path d="M228 78h68M234 60h56M234 96h56" />
          </g>
        )}
        {art === 'sport' && (
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <circle cx="260" cy="80" r="50" fill="currentColor" opacity=".12" stroke="none" />
            <circle cx="260" cy="80" r="32" />
            <path d="M260 48v20M260 92v20M228 80h20M272 80h20" />
            <path d="M260 68l14 10-5 16h-18l-5-16z" />
          </g>
        )}
      </svg>
    </Box>
  );
}

/* ---------------- the campaigns a reader sees ---------------- */

export type BannerSlide = { title: string; note: string };

export type Banner = {
  id: string;
  /** who is paying for the slot — the line above the headline */
  brand: string;
  title: string;
  blurb: string;
  cta: string;
  art: BannerArtId;
  tint: string;
  ink: string;
  /** the description, one panel at a time */
  slides: BannerSlide[];
  phone: string;
  where: string;
};

export const BANNERS: Banner[] = [
  {
    id: 'kitap',
    brand: 'Bilim Market',
    title: 'Okuw esbaplary — 20% arzanladyş',
    blurb: 'Depderler, ruçkalar, atlaslar. Mekdebe eltip bermek mugt.',
    cta: 'Dükana gitmek',
    art: 'book', tint: tokens.blueTint, ink: tokens.blueText,
    slides: [
      { title: '20% arzanladyş', note: 'Fewral aýynyň dowamynda ähli okuw esbaplaryna — depderden atlasa çenli.' },
      { title: 'Mekdebe eltip bermek', note: '16-njy, 7-nji we 27-nji mekdeplere sargydy ertesi güni synpa getirýäris.' },
      { title: 'Synp sanawy boýunça', note: 'Mugallymyň beren sanawyny suratda iberiň — ähli esbaby ýygnap bereris.' },
    ],
    phone: '+993 65 12 34 56',
    where: 'Aşgabat, Görogly köç. 48',
  },
  {
    id: 'kompyuter',
    brand: 'Tehno Öý',
    title: 'Okuwçy noutbuklary — bölekleýin töleg',
    blurb: '12 aýa çenli göterimsiz. Programma üpjünçiligi ýüklenen görnüşde.',
    cta: 'Şertler bilen tanyşmak',
    art: 'device', tint: tokens.purpleTint, ink: tokens.purpleText,
    slides: [
      { title: '12 aý göterimsiz', note: 'Ilkinji töleg 30% — galanyny deň bölekler bilen aýma-aý.' },
      { title: 'Okuw üçin taýýar', note: 'Ofis programmalary we elektron kitaphana öňünden gurnalan.' },
      { title: '2 ýyl kepillik', note: 'Serwis merkezi Aşgabatda — abatlaýyş wagtynda çalyşmaça enjam berilýär.' },
    ],
    phone: '+993 65 77 88 99',
    where: 'Aşgabat, Berkararlyk söwda merkezi',
  },
  {
    id: 'dil',
    brand: 'Söz Dil Merkezi',
    title: 'Iňlis dili — mekdep sagatlaryndan soň',
    blurb: 'Kiçi toparlar, 8 adam. Ilkinji sapak synag üçin mugt.',
    cta: 'Synag sapaga ýazylmak',
    art: 'lang', tint: tokens.tealTint, ink: tokens.tealText,
    slides: [
      { title: 'Toparda 8 okuwçy', note: 'Her sapakda her okuwçy gepleýär — köp adamly synpda bolmaýan zat.' },
      { title: 'Mekdebe golaý', note: 'Sapaklar 14:00-dan soň, 16-njy mekdebiň ýanyndaky binada.' },
      { title: 'Ilkinji sapak mugt', note: 'Derejäňi kesgitleýäris we haýsy topara girjegiňi bilelikde saýlaýarys.' },
    ],
    phone: '+993 62 45 67 89',
    where: 'Aşgabat, Atamyrat Nyýazow şaýoly 12',
  },
  {
    id: 'sport',
    brand: 'Galkynyş Sport',
    title: 'Ýüzmek we küşt bölümlerine ýazylyş',
    blurb: 'Fewralda ýazylanlara birinji aý ýarym baha.',
    cta: 'Bölümi saýlamak',
    art: 'sport', tint: tokens.orangeTint, ink: tokens.orangeText,
    slides: [
      { title: 'Ýaş boýunça toparlar', note: '7–10 we 11–15 ýaş — her toparyň öz tälimçisi we öz sagady.' },
      { title: 'Fewral — ýarym baha', note: 'Şu aý ýazylanlar üçin birinji aýyň tölegi 50%.' },
      { title: 'Mekdep bäsleşiklerine', note: 'Bölümiň okuwçylary etrap we welaýat ýaryşlaryna topar bolup gidýär.' },
    ],
    phone: '+993 63 21 43 65',
    where: 'Aşgabat, 10 ýyl abadanlyk köç. 5',
  },
];

/* A slot always shows the same campaign for the same reader on the same day:
   an ad that reshuffles on every re-render reads as a broken screen. */
export const bannerFor = (placement: string) =>
  BANNERS[[...placement].reduce((n, c) => n + c.charCodeAt(0), 0) % BANNERS.length];

/* ---------------- what a business can buy ---------------- */

export type PlacementId = 'diary' | 'sections' | 'inbox' | 'profile';

export const PLACEMENTS: {
  id: PlacementId; label: string; where: string; perDay: number; reach: number;
}[] = [
  { id: 'diary', label: 'Gündelik sahypasy', where: 'Sapaklaryň aşagynda, her gün açylýan ekran', perDay: 30, reach: 4200 },
  { id: 'sections', label: 'Bölümler sahypasy', where: 'Testler we kartlar bilen bir sahypada', perDay: 20, reach: 2600 },
  { id: 'inbox', label: 'Habarlar sahypasy', where: 'Mekdep bildirişleriniň arasynda', perDay: 15, reach: 1900 },
  { id: 'profile', label: 'Profil sahypasy', where: 'Ene-atalar iň köp girýän sahypa', perDay: 12, reach: 1500 },
];

export const placementOf = (id: PlacementId) =>
  PLACEMENTS.find((p) => p.id === id) ?? PLACEMENTS[0];

export const AD_SCHOOLS: { id: string; name: string; pupils: number }[] = [
  { id: 'all', name: 'Ähli mekdepler', pupils: 10200 },
  { id: 's16', name: '16-njy orta mekdep', pupils: 1240 },
  { id: 's7', name: '7-nji orta mekdep', pupils: 980 },
  { id: 's27', name: '27-nji orta mekdep', pupils: 1120 },
  { id: 's44', name: '44-nji orta mekdep', pupils: 860 },
  { id: 's68', name: '68-nji ýöriteleşdirilen mekdep', pupils: 640 },
];

export const schoolOf = (id: string) =>
  AD_SCHOOLS.find((s) => s.id === id) ?? AD_SCHOOLS[0];

/* Buying every school costs less than buying them one by one — otherwise the
   form is a maths puzzle about whether to book six times. */
const SCHOOL_FACTOR = (id: string) => (id === 'all' ? 3 : 1);

export const bannerPrice = (placement: PlacementId, school: string, days: number) =>
  placementOf(placement).perDay * days * SCHOOL_FACTOR(school);

export const bannerReach = (placement: PlacementId, school: string) =>
  Math.round(placementOf(placement).reach * (school === 'all' ? 2.4 : schoolOf(school).pupils / 1240));

/* ---------------- what is already sold ----------------
   Windows are inclusive of both ends, the way a seller says them out loud:
   "the 14th to the 20th" is seven days, not six. */

export type Booking = { placement: PlacementId; school: string; from: string; to: string; who: string };

export const BOOKED: Booking[] = [
  { placement: 'diary', school: 'all', from: '2026-02-16', to: '2026-02-22', who: 'Bilim Market' },
  { placement: 'diary', school: 's16', from: '2026-03-02', to: '2026-03-08', who: 'Tehno Öý' },
  { placement: 'sections', school: 'all', from: '2026-02-13', to: '2026-02-15', who: 'Söz Dil Merkezi' },
  { placement: 'inbox', school: 's7', from: '2026-02-20', to: '2026-03-01', who: 'Galkynyş Sport' },
  { placement: 'profile', school: 'all', from: '2026-02-25', to: '2026-02-28', who: 'Bilim Market' },
];

const overlaps = (aFrom: string, aTo: string, bFrom: string, bTo: string) =>
  aFrom <= bTo && bFrom <= aTo;

/* Booking a school collides with a booking of "every school", and the other
   way round — one slot cannot show two banners at once. */
const sameAudience = (a: string, b: string) => a === b || a === 'all' || b === 'all';

export const clashesFor = (placement: PlacementId, school: string, from: string, days: number) => {
  const to = addDays(from, days - 1);
  return BOOKED.filter((b) =>
    b.placement === placement && sameAudience(b.school, school) && overlaps(from, to, b.from, b.to));
};

/** The next window of `days` days that is actually free, starting from `from`. */
export const nextFree = (placement: PlacementId, school: string, from: string, days: number) => {
  let at = from;
  for (let i = 0; i < 120; i++) {
    if (clashesFor(placement, school, at, days).length === 0) return at;
    at = addDays(at, 1);
  }
  return null;
};

/** Is this single day sold for this slot? — what the calendar marks. */
export const isBusyDay = (placement: PlacementId, school: string, iso: string) =>
  clashesFor(placement, school, iso, 1).length > 0;
