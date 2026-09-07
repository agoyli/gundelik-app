import type { ReactNode } from 'react';
import {
  BellIcon, BigCheckIcon, CardsIcon, GameIcon, LayersIcon, NotesIcon, SparkleIcon, StarIcon,
  TabChartIcon, TrophyIcon,
} from '../components/Icons';
import { bankTotal } from './library';
import type { FeatureId } from '../state/prefs';
import { tokens } from '../theme';

/* the catalogue's own totals — an ad that quotes a number the app cannot show
   is the first thing a reader checks and the first thing to go stale */
const BANK = bankTotal();

/*
 * The advertisement's copy — and only the copy.
 *
 * Colour included: a row wears the accent its feature already wears in the app
 * — blue for a reading, orange for a test or a star, teal for an interactive —
 * as the same `IconBadge` tint-and-accent pair every other list uses, and
 * everything the app draws in plain blue stays plain blue here. An
 * ad is the one screen where a second colour system gets invented, and then the
 * product has two.
 *
 * Every entry is keyed by a `FeatureId`, so what the ad promises and what the
 * app actually unlocks are the same list read twice: the tier badge on a row
 * comes from `FEATURES`, never from a number typed here. Write a row for a
 * feature that does not exist and there is no id to key it by.
 *
 * A row carries one line, because a list is for choosing what to look at. The
 * `points` are what the row opens onto — three to five concrete things, each a
 * fact rather than an adjective ("4 GB", "1–12 synp", "24/7"), which is the
 * difference between a feature list and a poster.
 */
export type AdPoint = { title: string; note: string };

export type PremiumAd = {
  id: FeatureId;
  /** the headline the feature gets when it has a page to itself */
  title: string;
  /** the one line it gets in the list */
  blurb: string;
  /** one glyph, drawn at whatever size the row or the page asks for */
  icon: (size: number) => ReactNode;
  /** the app's own badge pair for this feature: tint behind, accent on top */
  tint: string;
  ink: string;
  points: AdPoint[];
};

export const PREMIUM_ADS: PremiumAd[] = [
  {
    id: 'roadmap',
    title: 'Ähli sapaklar',
    blurb: '1–12-nji synplaryň ähli dersleri, tema-tema yzygiderli ýol bilen.',
    icon: (n) => <LayersIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: '12 synpyň programmasy', note: 'Her dersiň temalary birinji synpdan on ikinjä çenli.' },
      { title: 'Yzygiderli ýol', note: 'Indiki tema öňkini geçeniňde açylýar — nireden dowam etmelidigi elmydama belli.' },
      { title: 'Wideo we tekst', note: 'Her tema düşündiriş, mysallar we gysga wideo bilen.' },
      { title: 'Öňe geçmek', note: 'Öz synpyňdan öňe okap ýa-da geçen ýyly gaýtalap bilersiň.' },
    ],
  },
  {
    id: 'tests',
    title: 'Test bankasy',
    blurb: `Ähli dersler boýunça ${BANK.tests} test, jogaplaryň seljermesi bilen.`,
    icon: (n) => <BigCheckIcon size={n} />,
    tint: tokens.orangeTint,
    ink: tokens.orangeText,
    points: [
      { title: `${BANK.tests} test`, note: 'Her temanyň öz testi — okanyňy şol ýerde barlaýarsyň.' },
      { title: 'Ýalňyşlaryň seljermesi', note: 'Her sowalyň dogry jogaby we näme üçin dogrudygy.' },
      { title: 'Gaýtadan işlemek', note: 'Testi näçe gezek işleseň-de, iň gowy netijäň saklanýar.' },
      { title: 'Netijeleriň taryhy', note: 'Haýsy dersde öňe gidýändigiňi wagtyň dowamynda görýärsiň.' },
    ],
  },
  {
    id: 'cards',
    title: 'Öwrediji kartlar',
    blurb: `${BANK.cards} kart — ýat tutmagyň iň çalt usuly, gaýtalama tertibi bilen.`,
    icon: (n) => <CardsIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: `${BANK.decks} toplum`, note: 'Sözlükden formulalara çenli — her ders öz toplumy bilen.' },
      { title: 'Aralyk gaýtalama', note: 'Bilmedik kartlaryň has ýygy, bilenleriň seýrek gaýtalanýar.' },
      { title: 'Bellik goýmak', note: 'Kyn karty belläp, soň diňe şolary işläp bilersiň.' },
    ],
  },
  {
    id: 'ai',
    title: 'Akylly mugallym',
    blurb: 'Islendik sowala 24/7 jogap — düşündiriş, mysal, öý işine kömek.',
    icon: (n) => <SparkleIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: 'Gije-gündiz elýeterli', note: 'Sagat üçde çykan sowal ertire çenli garaşmaly däl.' },
      { title: 'Ädimme-ädim düşündiriş', note: 'Taýýar jogap däl — meseläniň nähili çözülýändigi.' },
      { title: 'Dersiň dilinde', note: 'Türkmen dilinde, programmanyň öz temalaryna görä.' },
      { title: 'Çatlar saklanýar', note: 'Öň soralan sowala islendik wagt dolanyp bolýar.' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analitika',
    blurb: 'Bahalaryň, gatnaşygyň we öý işiniň hepdelik, çärýeklik seljermesi.',
    icon: (n) => <TabChartIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: 'Ders boýunça ortaça', note: 'Haýsy ders ösýär, haýsysy yza galýar — bir seredişde.' },
      { title: 'Synpdaky orun', note: 'Hepdeden hepdä ornuň nähili üýtgeýändigi.' },
      { title: 'Gatnaşyk kartasy', note: 'Ýylyň her güni — geldi, gijä galdy, gelmedi.' },
      { title: 'Çärýekleriň deňeşdirmesi', note: 'Geçen çärýek bilen tapawut, göterimde.' },
    ],
  },
  {
    id: 'games',
    title: 'Sapak oýunlary',
    blurb: 'Temany oýun görnüşinde gaýtalamak — ýazgy, deňeşdirme, ýat oýunlary.',
    icon: (n) => <GameIcon size={n} />,
    tint: tokens.tealTint,
    ink: tokens.tealText,
    points: [
      { title: 'Temanyň ýanynda', note: 'Oýun aýratyn bölüm däl — geçen temaňyň aşagynda durýar.' },
      { title: 'Dürli görnüşler', note: 'Sözleri baglaşdyrmak, ýat oýny, wagt garşysyna sowallar.' },
      { title: 'Gysga tapgyrlar', note: 'Iki minutda bir tapgyr — arakesmede-de ýetişýär.' },
    ],
  },
  {
    id: 'notes',
    title: 'Mugallymyň bellikleri',
    blurb: 'Sapakda ýazylan ähli bellikler — diňe bahalar däl, sebäbi hem.',
    icon: (n) => <NotesIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: 'Doly ýazgy', note: 'Mugt hasapda diňe soňky iki bellik görünýär.' },
      { title: 'Ders boýunça', note: 'Bir mugallymyň ähli bellikleri bir ýerde.' },
      { title: 'Ene-ata jogaby', note: 'Bellige şol ýerde jogap ýazyp bolýar.' },
    ],
  },
  {
    id: 'badges',
    title: 'Ýyldyzlaryň seljermesi',
    blurb: 'Her ýyldyzyň nireden gelendigi we nämä ýetmeýändigi.',
    icon: (n) => <StarIcon size={n} />,
    tint: tokens.orangeTint,
    ink: tokens.orangeText,
    points: [
      { title: 'Ýyldyzyň taryhy', note: 'Haýsy sapakda, haýsy iş üçin berlendigi.' },
      { title: 'Indiki nyşana', note: 'Nobatdaky nyşana çenli näçe galdy.' },
      { title: 'Ýylyň jemi', note: 'Ýygnalan ýyldyzlar aý-aý.' },
    ],
  },
  {
    id: 'contests',
    title: 'Premium bäsleşikler',
    blurb: 'Baýrakly onlaýn bäsleşiklere gatnaşmak we reýtingde görünmek.',
    icon: (n) => <TrophyIcon size={n} />,
    tint: tokens.orangeTint,
    ink: tokens.orangeText,
    points: [
      { title: 'Baýrakly bäsleşikler', note: 'Hemaýatkärleriň goýan baýraklary — planşetden noutbuga çenli.' },
      { title: 'Test toplumlary', note: 'On toplum, her dogry jogap üçin bal.' },
      { title: 'Umumy reýting', note: 'Toplan ballaryň bilen beýleki okuwçylaryň arasynda ornuň.' },
    ],
  },
  {
    id: 'sms',
    title: 'SMS habarnamalar',
    blurb: 'Baha, gijä galma we bildiriş barada ene-ata SMS — internetsiz hem.',
    icon: (n) => <BellIcon size={n} />,
    tint: tokens.blueSoft,
    ink: tokens.blue,
    points: [
      { title: 'Internetsiz hem gelýär', note: 'Telefonda internet ýok bolsa-da habar ýetýär.' },
      { title: 'Nämä habar geljegi saýlanýar', note: 'Diňe bahalar, diňe gatnaşyk ýa-da ählisi.' },
      { title: 'Iki nomere çenli', note: 'Ene we ata aýratyn habar alyp bilýär.' },
    ],
  },
];
