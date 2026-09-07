import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  BigCheckIcon, BookmarkIcon, BooksIcon, CardsIcon, CheckIcon, CoinIcon, GearIcon,
  LayersIcon, LockIcon, QuestionOutlineIcon, QuizIcon,
  SparkleIcon, StarIcon, TargetIcon, TrophyIcon, WalletIcon,
} from '../components/Icons';
import {
  Avatar, BalancePots, DeltaLine, GridTile, HeaderIconButton, HeroStat, IconBadge, PeriodNav,
  PillHeader, MeterTile, RankRow, RowChevron, RowEnd, SectionHeading, SectionLabel, Segmented,
  SheetDrawer, StatTile, SubjectRow, SurfaceRow, TagPill, VariantSheet,
} from '../components/Ui';
import type { Variant } from '../components/Ui';
import { PlanWidget, TeaserCard } from '../components/Paywall';
import { OLYMPIADS, PRIZE_CONTESTS, RATING } from '../data/guides';
import { bankTotal, playCount, testSubjects } from '../data/library';
import { pathTotal, subjectBySlug } from '../data/curriculum';
import type { CurriculumSubject } from '../data/curriculum';
import { fmtDate, fmtRange } from '../lib/date';
import { ordinal } from '../lib/tm';
import type { TestItem, TestSubject } from '../data/library';
import { PLAN, tierFor, useCan, usePrefs } from '../state/prefs';
import { useAllowance } from '../state/allowance';
import { AiChatScreen } from './AiChatScreen';
import { TestDetailScreen, TestSubjectScreen, prizePhase } from './DetailScreens';
import { ReferralScreen } from './ReferralScreen';
import { CareerTestScreen, careerDreamHint, careerDreamLabel, careerRowValue } from './CareerTestScreen';
import { SPECIALITIES } from '../data/career';
import { useCareerResult } from '../state/career';
import { PlayScreen } from './PlayScreens';
import { RoadmapScreen } from './RoadmapScreen';
import { UpgradeScreen } from './UpgradeScreen';
import { ShopScreen, WalletScreen } from './WalletScreens';
import type { PotId } from './WalletScreens';
import { childClassShort, childListName, useStudent } from '../state/children';
import { usePointsBalance } from '../state/points';
import { useWallet } from '../state/wallet';
import { EARN_POINTS, useEarns } from '../state/earn';
import { ChildPickerRow } from './ChildScreens';
import { BannerSlot, MyBannersScreen } from './BannerScreens';
import {
  BaslesiklerScreen, BookmarksScreen, KartlarScreen, KitaphanaScreen, SapaklarScreen,
} from './SectionScreens';
import {
  PaySheet, PaymentsScreen, PayMethodsScreen, ProfileEditScreen, SettingsScreen,
} from './SettingsScreens';
import { tokens } from '../theme';

/*
 * The one root-tab header: large left title, optional trailing action.
 * Sub-pages reached via a back button use the capsule `PillHeader` instead —
 * the header shape is how you tell "tab" from "drilled in".
 */
const TopBar = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <Box sx={{
    position: 'sticky', top: 0, zIndex: 10,
    bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
    boxShadow: tokens.shadowHeader,
    px: '13.5px', pb: '10px', pt: 'calc(14px + env(safe-area-inset-top))',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: 52,
  }}>
    <Typography variant="h1">{title}</Typography>
    {action}
  </Box>
);

/* There is no "the student" any more — an account can hold five of them — so
   every screen below asks `useStudent()` who is selected rather than reading a
   constant. See `state/children.ts`. */

/* ---------------- Çagam ---------------- */
export function CagamScreen({ toast }: { toast: (msg: string) => void }) {
  /* the ring is the subscription's, so it is read from the subscription */
  const { premium } = usePrefs();
  const student = useStudent();
  return (
    <>
      <TopBar title="Çagam" />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          mt: '4px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `22px ${tokens.padCard}`, display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <Avatar initials={student.initials} size={56} premium={premium} />
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }}>{student.name}</Typography>
            <Typography variant="caption">{student.cls} · {student.schoolLong}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
          <StatTile value="4.6" label="Ortaça baha" color={tokens.blueText} />
          <StatTile value="96%" label="Gatnaşyk" color={tokens.greenText} />
          <StatTile value="2" label="Gijä galma" color={tokens.redText} />
        </Box>
        <SectionLabel>Maglumat</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            ['Synp ýolbaşçysy', 'J. Orazowa'],
            ['Çalşyk', 'I çalşyk · 8:00'],
            ['Okuw ýyly', '2025 – 2026'],
          ].map(([a, b]) => (
            <SurfaceRow key={a} label={a} end={<RowEnd value={b} />}
              onClick={() => toast('Tiz wagtda elýeterli bolar')}
            />
          ))}
        </Box>
      </Box>
    </>
  );
}

/* ---------------- Analitika ---------------- */
const SUBJECTS: [string, number][] = [
  ['Iňlis dili', 4.8], ['Türkmen dili', 4.7], ['Taryh', 4.7], ['Geografiýa', 4.6],
  ['Matematika', 4.3], ['Himiýa', 4.1], ['Fizika', 3.9],
];

const LESSON_KINDS = [
  { label: 'Tebigy', pct: 63, color: tokens.blue, tint: tokens.blueSoft },
  { label: 'Takyk', pct: 27, color: tokens.purpleText, tint: tokens.purpleTint },
  { label: 'Ynsanperwer', pct: 10, color: tokens.red, tint: tokens.redTint },
];

/* Overlapping-bubbles chart from the original (63 / 27 / 10) */
function KindBubbles() {
  return (
    <Box component="svg" viewBox="0 0 190 150" role="img"
      aria-label="Sapaklaryň görnüşleri: Tebigy 63%, Takyk 27%, Ynsanperwer 10%"
      sx={{ width: 190, maxWidth: '100%', flex: 'none' }}>
      <circle cx="72" cy="72" r="62" fill={tokens.blueSoft} fillOpacity=".55" stroke={tokens.blue} strokeWidth="1.5" />
      <circle cx="148" cy="46" r="41" fill={tokens.purpleTint} fillOpacity=".8" stroke={tokens.purpleText} strokeWidth="1.5" />
      <circle cx="138" cy="112" r="30" fill={tokens.redTint} fillOpacity=".9" stroke={tokens.red} strokeWidth="1.5" />
      <text x="72" y="80" textAnchor="middle" fontSize="26" fontWeight="700" fill={tokens.ink}>63%</text>
      <text x="150" y="52" textAnchor="middle" fontSize="17" fontWeight="600" fill={tokens.ink}>27%</text>
      <text x="138" y="117" textAnchor="middle" fontSize="15" fontWeight="600" fill={tokens.ink}>10%</text>
    </Box>
  );
}

const StatCard = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{
    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
    p: `20px ${tokens.padCard}`, display: 'flex', flexDirection: 'column', gap: '12px',
  }}>{children}</Box>
);

/* Drill-down into a card's detail sheet — tonal, so solid blue stays reserved for primaries */
const DrillButton = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <Button
    fullWidth disableElevation onClick={onClick}
    sx={{
      bgcolor: tokens.blueTint, color: tokens.blueText,
      '&:hover': { bgcolor: tokens.blueSoft },
      '&:active': { bgcolor: tokens.blueSoft },
    }}
  >{children}</Button>
);

const CardTitle = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px', textAlign: 'center' }}>
    {children}
  </Typography>
);

/* Mock week history so the period arrows actually navigate. The last entry is
   the week that contains TODAY — these read "23.09 – 30.09" while the diary
   was showing February, which put two different autumns on one screen.

   Only the rank is stored. Everything a reader sees about it — "2-nji ýerde",
   "1 orun ýokary galdy" — is written from that one number, so the paid card and
   the free teaser cannot end up telling different stories about the same week. */
const WEEKS = [
  { label: fmtRange('2026-01-19', '2026-01-25'), place: 4 },
  { label: fmtRange('2026-01-26', '2026-02-01'), place: 3 },
  { label: fmtRange('2026-02-02', '2026-02-08'), place: 2 },
  { label: fmtRange('2026-02-09', '2026-02-15'), place: 1 },
];

const placeLabel = (n: number) => `${ordinal(n)} ýerde`;

/* Movement against the previous week. A smaller number is a better place, so
   the sign is flipped on the way out — the reader is told "went up", not "−1". */
const weekMove = (i: number) => {
  const prev = WEEKS[i - 1];
  if (!prev) return null;
  const d = prev.place - WEEKS[i].place;
  if (d === 0) return 'geçen hepdedäki ýaly';
  return `geçen hepdä garanyňda ${Math.abs(d)} orun ${d > 0 ? 'ýokary galdy' : 'aşak düşdi'}`;
};

/* Mock quarter history — the quarter card navigates like the weekly one.
   February is the third quarter, which is also what the school's announcement
   about closing dates says. */
const QUARTER_HISTORY = [
  { label: '1-nji çärýek', avg: 4.1 },
  { label: '2-nji çärýek', avg: 4.3 },
  { label: '3-nji çärýek', avg: 4.5 },
];

const qtrMove = (i: number) => {
  const prev = QUARTER_HISTORY[i - 1];
  if (!prev) return null;
  const pct = ((QUARTER_HISTORY[i].avg - prev.avg) / prev.avg) * 100;
  if (Math.round(pct * 10) === 0) return 'geçen çärýekdäki ýaly';
  return `geçen çärýek bilen deňeşdirende ${Math.abs(pct).toFixed(1)}% ${pct > 0 ? 'ösdi' : 'peseldi'}`;
};

/* weekly completion per subject — distinct from quarter averages */
const SUBJECT_WEEK: [string, number][] = [
  ['Iňlis dili', 96], ['Türkmen dili', 94], ['Taryh', 90], ['Geografiýa', 88],
  ['Matematika', 82], ['Himiýa', 76], ['Fizika', 71],
];


/*
 * What the free tier sees instead of the reports.
 *
 * Not a wall, and no longer a blur either. A blurred chart says "there is
 * something here" and nothing else — the reader cannot tell whether it is
 * worth 400 TMT, and a smear of colour is the same smear whatever the numbers
 * behind it are.
 *
 * So the free tier gets **part of the real report**: this week's figure, the
 * top two subjects, the current average — the *latest* value, which is the one
 * they can already work out from the diary anyway. What the plan buys is the
 * rest and the history: the other five subjects, the term's trend, the
 * comparison over time. The lock line then names exactly what is missing, as a
 * count, so the gap is specific and checkable rather than mysterious.
 *
 * The rule this follows everywhere in the app: **how much there is, is free;
 * what it says over time, is paid.**
 */
function PartialReport({ title, note, shown, hidden, onUpgrade }: {
  title: string; note: string;
  /** the real, unblurred part — the newest figure or the first rows */
  shown: React.ReactNode;
  /** what stays behind the plan, counted rather than described */
  hidden: string;
  onUpgrade: () => void;
}) {
  const plan = tierFor('analytics');
  return (
    <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
      <Box sx={{ p: `15px ${tokens.padCard} 0` }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.2px' }}>{title}</Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px', lineHeight: 1.4 }}>{note}</Typography>
      </Box>

      {shown}

      {/* The lock, stated as an amount. It sits under real data rather than
          over it, so nothing the reader can already see is being taken away. */}
      <ButtonBase
        onClick={onUpgrade}
        aria-label={`${title}: ${hidden}, ${plan?.name} bilen açylýar`}
        sx={{
          display: 'flex', alignItems: 'center', gap: '11px', width: '100%',
          textAlign: 'left', justifyContent: 'flex-start',
          p: `12px ${tokens.padCard}`, borderTop: `1px solid ${tokens.dividerSoft}`,
          '&:active': { bgcolor: tokens.surfacePress },
        }}
      >
        <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={32} radius={tokens.rTile}>
          <LockIcon size={16} />
        </IconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{hidden}</Typography>
          <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>{plan?.name} bilen açylýar</Typography>
        </Box>
        <RowChevron />
      </ButtonBase>
    </Box>
  );
}

/* The streak, which every tier sees.
   It is counted from grades the diary already shows in full, so hiding it
   would be hiding the reader's own data back from them — and it is the reason
   to open the tab tomorrow. */
function StreakBanner() {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      bgcolor: tokens.blueTint, borderRadius: `${tokens.rRow}px`, minHeight: 60, px: '16px',
    }}>
      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Yzygider bäşlik alan gün sany</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: tokens.blueText, fontVariantNumeric: 'tabular-nums' }}>
        12
      </Typography>
    </Box>
  );
}

const ANALITIKA_HELP = 'Analitika gündelikdäki bahalaryňdan hasaplanýar — hiç bir san elde girizilmeýär. '
  + 'Hepdelik ýetişik synpdaky orny, çärýek ortaçasy bolsa ähli dersleriň ortaça bahasyny görkezýär. '
  + 'Ýanýoldaky ‹ › düwmeleri bilen öňki hepdelere we çärýeklere geçip bolýar.';

export function AnalitikaScreen({ toast }: { toast: (m: string) => void }) {
  const [sheet, setSheet] = useState<'yetisik' | 'baha' | null>(null);
  const [help, setHelp] = useState(false);
  const [view, setView] = useState<'root' | 'upgrade'>('root');
  const [week, setWeek] = useState(WEEKS.length - 1);
  const [qtr, setQtr] = useState(QUARTER_HISTORY.length - 1);
  const can = useCan('analytics');
  const upgrade = () => setView('upgrade');

  if (view === 'upgrade') return <UpgradeScreen onBack={() => setView('root')} toast={toast} />;

  return (
    <>
      {/* Explanation on demand: a tab full of derived numbers invites "where
          does this come from?", and that answer is worth one tap — not a
          paragraph every visitor reads once and then scrolls past forever. */}
      <TopBar
        title="Analitika"
        action={(
          <HeaderIconButton label="Kömek" onClick={() => setHelp(true)}>
            <QuestionOutlineIcon size={20} />
          </HeaderIconButton>
        )}
      />

      {/*
        One page, one order, both tiers.

        The free tier used to get a different tab: the same reports in a
        different sequence, one extra card of its own, and a teaser under them
        all — so a reader who subscribed found the page they had learned
        rearranged, and a reader who had not was asked to buy four times on one
        screen. The three reports are the same three, in the same places now.
        What the plan changes is inside each card: free sees the newest figure
        (the one they could work out from their own diary anyway) and a line
        naming exactly what the history would add; paid gets the ‹ › through
        that history and the drill-down behind it.
      */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', px: tokens.gutter, pt: '4px' }}>
        <StreakBanner />

        {/* 1 — where the pupil stands this week, the page's headline */}
        {can ? (
          <StatCard>
            <CardTitle>Synpda hepdelik ýetişigi</CardTitle>
            <PeriodNav
              label={WEEKS[week].label}
              onPrev={week > 0 ? () => setWeek(week - 1) : undefined}
              onNext={week < WEEKS.length - 1 ? () => setWeek(week + 1) : undefined}
            />
            <Box sx={{ borderTop: `0.5px solid ${tokens.dividerSoft}`, pt: '16px' }}>
              <HeroStat>{placeLabel(WEEKS[week].place)}</HeroStat>
              <DeltaLine>{weekMove(week) ?? 'çärýegiň başy'}</DeltaLine>
            </Box>
            <DrillButton onClick={() => setSheet('yetisik')}>Dersler boýunça ýetişigi</DrillButton>
          </StatCard>
        ) : (
          <PartialReport
            title="Synpda hepdelik ýetişigi"
            note="Şu hepdäniň orny — açyk. Öňki hepdeler we dersler boýunça bölünişik ýapyk."
            onUpgrade={upgrade}
            shown={(
              <Box sx={{ p: '14px 15px 16px', textAlign: 'center' }}>
                <HeroStat>{placeLabel(WEEKS[WEEKS.length - 1].place)}</HeroStat>
                <DeltaLine>{weekMove(WEEKS.length - 1)}</DeltaLine>
              </Box>
            )}
            hidden={`${WEEKS.length - 1} hepdelik taryh · ${SUBJECT_WEEK.length} dersiň bölünişigi`}
          />
        )}

        {/* 2 — the same question over a term */}
        {can ? (
          <StatCard>
            <CardTitle>Çärýegiň ortaça bahasy</CardTitle>
            <PeriodNav
              label={QUARTER_HISTORY[qtr].label}
              onPrev={qtr > 0 ? () => setQtr(qtr - 1) : undefined}
              onNext={qtr < QUARTER_HISTORY.length - 1 ? () => setQtr(qtr + 1) : undefined}
            />
            <Box sx={{ borderTop: `0.5px solid ${tokens.dividerSoft}`, pt: '16px' }}>
              <HeroStat>Baha: {QUARTER_HISTORY[qtr].avg.toFixed(1)}</HeroStat>
              <DeltaLine>{qtrMove(qtr) ?? 'ilkinji çärýek'}</DeltaLine>
            </Box>
            <DrillButton onClick={() => setSheet('baha')}>Ders boýunça bahasy</DrillButton>
          </StatCard>
        ) : (
          <PartialReport
            title="Çärýegiň ortaça bahasy"
            note="Şu çärýegiň ortaçasy — açyk. Öňki çärýekler bilen deňeşdirme ýapyk."
            onUpgrade={upgrade}
            shown={(
              <Box sx={{ p: '14px 15px 16px', textAlign: 'center' }}>
                <HeroStat>Baha: {QUARTER_HISTORY[QUARTER_HISTORY.length - 1].avg.toFixed(1)}</HeroStat>
                <DeltaLine>{qtrMove(QUARTER_HISTORY.length - 1)}</DeltaLine>
              </Box>
            )}
            hidden={`${QUARTER_HISTORY.length - 1} çärýegiň taryhy · ders-ders bölünişi`}
          />
        )}

        {/* 3 — what the week was made of */}
        {can ? (
          <StatCard>
            <CardTitle>Sapaklaryň görnüşleri boýunça</CardTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {LESSON_KINDS.map((k) => (
                  <Box key={k.label} sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <Box aria-hidden sx={{
                      width: 16, height: 16, borderRadius: '50%', flex: 'none',
                      border: `4.5px solid ${k.color}`,
                    }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{k.label}</Typography>
                  </Box>
                ))}
              </Box>
              <KindBubbles />
            </Box>
          </StatCard>
        ) : (
          <PartialReport
            title="Sapaklaryň görnüşleri boýunça"
            note="Bölünişik açyk. Hepde-hepde üýtgeýşi ýapyk."
            onUpgrade={upgrade}
            shown={<Box sx={{ display: 'grid', placeItems: 'center', pt: '6px', pb: '10px' }}><KindBubbles /></Box>}
            hidden="Hepdelik dinamika we sagat hasaby"
          />
        )}
      </Box>

      <SheetDrawer open={help} onClose={() => setHelp(false)}>
        <Typography variant="h2">Analitika näme görkezýär?</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.ink3, lineHeight: 1.55, mt: '10px' }}>
          {ANALITIKA_HELP}
        </Typography>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth variant="contained" disableElevation onClick={() => setHelp(false)}>
            Düşnükli
          </Button>
        </Box>
      </SheetDrawer>

      <SheetDrawer open={sheet !== null} onClose={() => setSheet(null)}>
        <Typography variant="h2">
          {sheet === 'yetisik' ? 'Dersler boýunça ýetişigi' : 'Ders boýunça bahasy'}
        </Typography>
        <Typography variant="caption">
          {sheet === 'yetisik' ? `${WEEKS[week].label} · ýerine ýetiriliş` : `${QUARTER_HISTORY[qtr].label} · ortaça baha`}
        </Typography>
        <Box sx={{
          mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`,
          p: '18px 15px', display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {(sheet === 'yetisik' ? SUBJECT_WEEK : SUBJECTS).map(([name, val]) => (
            <Box key={name} sx={{
              display: 'grid', gridTemplateColumns: '110px 1fr 36px', alignItems: 'center', gap: '10px',
            }}>
              <Typography noWrap sx={{ fontSize: 13, color: tokens.ink2 }}>{name}</Typography>
              <LinearProgress
                variant="determinate"
                value={sheet === 'yetisik' ? val : (val / 5) * 100}
                sx={{
                  height: 8, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: `${tokens.rPill}px`,
                    bgcolor: sheet === 'yetisik' ? tokens.greenDeep : tokens.blue,
                  },
                }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {sheet === 'yetisik' ? `${val}%` : val.toFixed(1)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth onClick={() => setSheet(null)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
            Ýap
          </Button>
        </Box>
      </SheetDrawer>
    </>
  );
}

/* ---------------- Gollanmalar (tile grid + Testler sub-screen) ----------------
 *
 * Six tiles, in three pairs, and the pairs are the reader's own three
 * questions: **learn** (Sapaklar · Öwrediji kartlar), **prove** (Testler ·
 * Bäsleşikler), **the rest** (Akylly mugallym · Kitaphana).
 *
 * It was seven, and the seventh was *Interaktiw sapaklar* — which is not a
 * seventh thing, it is the lesson path's own interactives listed a second way.
 * It already has a home under Sapaklar, beside the topics it drills, and a
 * grid whose tiles are not parallel makes the reader work out the relationship
 * on every visit. One route to one body of material.
 *
 * A tile's second line is a count from the catalogue, never a slogan: how much
 * there is, is the reason to open it.
 */
const GUIDE_TILES: { id: SectionId; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'sapaklar', label: 'Sapaklar', sub: `${pathTotal()} sapak · ${playCount()} interaktiw`, icon: <LayersIcon size={26} /> },
  { id: 'kartlar', label: 'Öwrediji kartlar', sub: `${bankTotal().cards} kart`, icon: <CardsIcon size={26} /> },
  { id: 'testler', label: 'Testler', sub: `${bankTotal().tests} test`, icon: <BigCheckIcon size={26} /> },
  /* The tile counts what is open, not what exists: the olympiads behind it are
     finished results, and only a running contest is something to go and do. */
  {
    id: 'basleshikler', label: 'Bäsleşikler', icon: <TrophyIcon size={26} />,
    sub: (() => {
      const live = PRIZE_CONTESTS.filter((c) => prizePhase(c) === 'live').length;
      return live ? `${live} dowam edýär` : `${OLYMPIADS.length} olimpiada`;
    })(),
  },
  /* The helper belongs with the other ways of studying, not only inside a
     lesson: a question comes up over homework, away from the page that raised
     it, and this is where a student comes looking. */
  { id: 'ai', label: 'Akylly mugallym', sub: 'Islendik sorag — 24/7', icon: <SparkleIcon size={26} /> },
  { id: 'kitaphana', label: 'Kitaphana', sub: '4 kitap', icon: <BooksIcon size={26} /> },
];

/*
 * Three readings of the same six sections.
 *
 * The grid is deliberately six tiles in three pairs — learn, prove, the rest —
 * but a grid can only *imply* that grouping, and a reader who is looking for
 * "somewhere to practise" has to know the pairing to use it. So the pairing is
 * a reading of its own, and the counts the tiles hold in one line each are a
 * third. Same six destinations, same order within them; nothing is duplicated
 * and nothing is hidden in one view that exists in another.
 */
/* One section as a row — the shape both non-grid readings are built from, so
   a section can never say one thing in a list and another in a group. */
function GuideRow({ tile, onOpen }: {
  tile: { id: SectionId; label: string; sub: string; icon: React.ReactNode }; onOpen: () => void;
}) {
  return (
    <SurfaceRow
      icon={<IconBadge size={44}>{tile.icon}</IconBadge>}
      label={tile.label}
      sub={tile.sub}
      end={<RowChevron />}
      onClick={onOpen}
    />
  );
}

export type GuideRead = 'grid' | 'list' | 'groups';

export const GUIDE_READS: Variant<GuideRead>[] = [
  { id: 'grid', name: 'Gözenek', note: 'Alty bölüm, üç jübüt — reňki we ýeri boýunça' },
  { id: 'list', name: 'Sanaw', note: 'Setir-setir, näçe zat barlygy bilen' },
  { id: 'groups', name: 'Maksat boýunça', note: 'Öwrenmek, barlamak we galanlary' },
];

/* what each pair is for — the grid's own grouping, said out loud */
const GUIDE_GROUPS: { label: string; ids: SectionId[] }[] = [
  { label: 'Öwrenmek', ids: ['sapaklar', 'kartlar'] },
  { label: 'Barlamak', ids: ['testler', 'basleshikler'] },
  { label: 'Galanlary', ids: ['ai', 'kitaphana'] },
];

function TestlerSubScreen({ onBack, toast, onOpenSubject, onUpgrade }: {
  onBack: () => void; toast: (m: string) => void;
  onOpenSubject: (s: TestSubject) => void; onUpgrade: () => void;
}) {
  const can = useCan('tests');
  /* one test a day on the free tier — the meter is on sitting a test, not on
     seeing that tests exist */
  const allow = useAllowance('tests');
  const plan = tierFor('tests');
  const student = useStudent();
  /* the same pot the wallet converts, in the section that fills it */
  const pot = usePointsBalance();
  /* whether sitting a test actually credits this child */
  const earns = useEarns();

  /* Two named rivals plus whoever is reading, ordered by the balance above —
     one board, no second total. */
  const rating = [
    ...RATING.filter((r) => !r.self).map(({ name, sub, points }) => ({ name, sub, points })),
    {
      name: childListName(student),
      sub: `${student.school}, ${childClassShort(student)}`,
      points: pot.balance,
      self: true,
    },
  ]
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <>
      <PillHeader title="Testler" onBack={onBack} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* What a test pays, and nothing else about the balance: bal is money
            the account holds, so it is counted beside the manats on Balans —
            a section page is not where a balance lives. */}
        <Box sx={{
          mt: '14px', display: 'flex', alignItems: 'center', gap: '11px',
          bgcolor: earns ? tokens.orangeTint : tokens.surface,
          borderRadius: `${tokens.rCard}px`, p: '13px 15px',
        }}>
          <IconBadge
            bg="#fff" color={earns ? tokens.orangeText : tokens.inkMuted}
            size={40} radius={tokens.rTile}
          >{earns ? <CoinIcon size={19} /> : <LockIcon size={18} />}</IconBadge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {`Her tabşyrylan test — +${EARN_POINTS.test} bal`}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
              {earns ? 'Ballar balansda ýygnalýar' : `${plan?.name} bilen ýygnalýar`}
            </Typography>
          </Box>
        </Box>

        {/* The lock is stated here, where tests are chosen — not only inside
            the test that refuses to start. What the bank holds is stated with
            it: the size of the thing is the reason to open it. */}
        {!can && (
          <Box sx={{ pt: '16px' }}>
            <TeaserCard
              title={allow.left > 0 ? 'Şu gün bir test mugt' : 'Şu günki mugt test ulanyldy'}
              note={allow.left > 0
                ? `${bankTotal().tests} testiň birini şu gün mugt işläp bilersiň. Ählisi — ${plan?.name} bilen.`
                : `Ertir ýene bir test açylýar. ${bankTotal().tests} testiň ählisi — ${plan?.name} bilen.`}
              feature="tests"
              onUpgrade={onUpgrade}
            />
          </Box>
        )}

        {/* Choosing a subject reads the same here as it does under Sapaklar:
            the tinted 148px carousel was a second picker for the same decision,
            and it clipped its last subject off the right edge besides. */}
        <SectionHeading title="Dersler" action={<TagPill label="Ähli" onClick={() => toast('Ähli dersler tiz wagtda')} />} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {testSubjects().map((s) => {
            /* what the bank holds for this subject, counted from the tests */
            const questions = s.tests.reduce((n, t) => n + t.questions, 0);
            return (
              <SubjectRow
                key={s.id}
                icon={s.icon}
                tint={s.tint}
                accent={s.accent}
                label={s.label}
                sub={`${s.tests.length} test · ${questions} sowal`}
                /* the catalogue stays visible: the allowance is spent on
                   opening a test, and a list of grey rows hides the argument */
                locked={false}
                onClick={() => onOpenSubject(s)}
              />
            );
          })}
        </Box>

        {/* The reader's own row is built from the child who is selected, and
            placed by their own balance — the board used to name Muhammet as
            "Siz" whichever of the five children the account was reading. */}
        <SectionHeading title="Reýting" action={<TagPill label="TOP-50" onClick={() => toast('Doly sanaw tiz wagtda')} />} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rating.map((r) => <RankRow key={r.name} {...r} />)}
        </Box>
      </Box>
    </>
  );
}

/* Testler owns three levels: landing → ders → test */
function TestlerFlow({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: (m: string) => void; onUpgrade: () => void;
}) {
  const [subject, setSubject] = useState<TestSubject | null>(null);
  const [test, setTest] = useState<TestItem | null>(null);
  const can = useCan('tests');
  const allow = useAllowance('tests');
  const plan = tierFor('tests');

  /* The meter sits on the last door, not the first: browse the subjects, open
     a subject's list, and the day's go is spent when a test is actually
     opened — and spent on *that* test, so coming back to finish it is free. */
  const openTest = (t: TestItem) => {
    if (!can && !allow.canOpen(t.id)) {
      toast(`Şu günki mugt test ulanyldy — ${plan?.name} bilen çäk aýrylýar`);
      onUpgrade();
      return;
    }
    if (!can) allow.take(t.id);
    setTest(t);
  };

  if (subject && test) {
    return (
      <TestDetailScreen
        test={test} accent={subject.accent} tint={subject.tint}
        onBack={() => setTest(null)} toast={toast}
      />
    );
  }
  if (subject) {
    return <TestSubjectScreen subject={subject} onBack={() => setSubject(null)} onOpenTest={openTest} />;
  }
  return <TestlerSubScreen onBack={onBack} toast={toast} onOpenSubject={setSubject} onUpgrade={onUpgrade} />;
}

/* The invented "Oýunlar" — four arcade drills with invented leaderboards — is
   gone. What took its place, Interaktiw sapaklar, is the curriculum's own
   interactives,
   and it is reachable from both ends: its own tile here, and the strip under
   the subjects in Sapaklar, where the topic it drills is. */
type SectionId = 'sapaklar' | 'gonukmeler' | 'ai' | 'kartlar' | 'testler' | 'basleshikler' | 'kitaphana';
type GuideView = 'grid' | SectionId | 'roadmap' | 'upgrade' | 'bellikler' | 'mahabat';

export function GollanmalarScreen({ toast }: { toast: (msg: string) => void }) {
  const [view, setView] = useState<GuideView>('grid');
  /* how the six sections are drawn — the reader's choice, not the page's */
  const [read, setRead] = useState<GuideRead>('grid');
  const [picker, setPicker] = useState(false);
  /* which subject's path is open — every subject has one now, so the roadmap is
     no longer the Algebra page with a general name */
  const [subject, setSubject] = useState<CurriculumSubject | null>(null);
  /* the grade the subject list was filtered to when the path was opened */
  const [openGrade, setOpenGrade] = useState<number | undefined>(undefined);
  /* where Interaktiw sapaklar should open: the grade the reader was filtered to (null is
     "Ählisi", undefined is "they came in by the tile"), and the subject they
     tapped, if any */
  const [play, setPlay] = useState<{ grade: number | null; groupId?: string } | null>(null);
  const back = () => setView('grid');
  /* where the paywall sends people from anywhere inside this tab */
  const upgrade = () => setView('upgrade');

  if (view === 'upgrade') return <UpgradeScreen onBack={back} toast={toast} />;
  if (view === 'roadmap' && subject) {
    return (
      <RoadmapScreen
        subject={subject}
        /* opened from a grade filter — the path starts where the reader was
           looking, not at the subject's first year */
        openAt={openGrade}
        onBack={() => setView('sapaklar')} toast={toast} onUpgrade={upgrade}
      />
    );
  }
  if (view === 'gonukmeler') {
    return (
      <PlayScreen
        startGrade={play?.grade}
        startGroupId={play?.groupId}
        /* back goes where you came from: the tile, or the subject list */
        onBack={() => setView(play ? 'sapaklar' : 'grid')}
        onUpgrade={upgrade}
      />
    );
  }
  if (view === 'sapaklar') {
    return (
      <SapaklarScreen
        onBack={back}
        toast={toast}
        onUpgrade={upgrade}
        onOpenPlay={(grade?: number, groupId?: string) => {
          setPlay({ grade: grade ?? null, groupId });
          setView('gonukmeler');
        }}
        onOpenSubject={(id: string, grade?: number) => {
          const s = subjectBySlug(id);
          if (!s) { toast('Bu ders tiz wagtda elýeterli bolar'); return; }
          setSubject(s);
          setOpenGrade(grade);
          setView('roadmap');
        }}
      />
    );
  }
  if (view === 'ai') return <AiChatScreen onBack={back} onUpgrade={upgrade} />;
  if (view === 'kartlar') return <KartlarScreen onBack={back} toast={toast} onUpgrade={upgrade} />;
  if (view === 'basleshikler') return <BaslesiklerScreen onBack={back} toast={toast} />;
  if (view === 'kitaphana') return <KitaphanaScreen onBack={back} toast={toast} />;
  if (view === 'testler') return <TestlerFlow onBack={back} toast={toast} onUpgrade={upgrade} />;
  if (view === 'bellikler') return <BookmarksScreen onBack={back} toast={toast} onUpgrade={upgrade} />;
  /* the banner desk, reached from the banner itself and nowhere else */
  if (view === 'mahabat') return <MyBannersScreen onBack={back} toast={toast} />;

  return (
    <>
      {/* Saved items get the header, not a seventh tile: they are not a seventh
          section but a view across the six, and the grid reads as three pairs.
          Beside it, the ✦ that every page with more than one honest layout
          carries — the same control as Ýyldyzlar's. */}
      <TopBar
        title="Gollanmalar"
        action={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HeaderIconButton label="Sahypanyň görnüşleri" onClick={() => setPicker(true)}>
              <SparkleIcon size={20} />
            </HeaderIconButton>
            <HeaderIconButton label="Bellikledim" onClick={() => setView('bellikler')}>
              <BookmarkIcon size={21} />
            </HeaderIconButton>
          </Box>
        )}
      />

      <VariantSheet
        open={picker}
        title="Gollanmalar sahypasynyň görnüşleri"
        lede="Alty bölüm — üç dürli okalyşy. Bölümler ählisinde birmeňzeş."
        variants={GUIDE_READS}
        current={read}
        onClose={() => setPicker(false)}
        onPick={setRead}
      />

      {read === 'grid' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', px: tokens.gutter, pt: '6px' }}>
          {GUIDE_TILES.map((t, i) => (
            <Box
              key={t.id}
              sx={{
                display: 'grid',
                /* an odd number of tiles would leave the last one half-width beside
                   a hole; it takes the whole row instead */
                gridColumn: i === GUIDE_TILES.length - 1 && GUIDE_TILES.length % 2 ? 'span 2' : undefined,
              }}
            >
              <GridTile icon={t.icon} label={t.label} sub={t.sub} onClick={() => setView(t.id)} />
            </Box>
          ))}
        </Box>
      )}

      {read === 'list' && (
        <Box sx={{ px: tokens.gutter, pt: '6px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
          {GUIDE_TILES.map((t) => <GuideRow key={t.id} tile={t} onOpen={() => setView(t.id)} />)}
        </Box>
      )}

      {read === 'groups' && (
        <Box sx={{ px: tokens.gutter }}>
          {GUIDE_GROUPS.map((g) => (
            <Box key={g.label}>
              <SectionLabel>{g.label}</SectionLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
                {g.ids.map((id) => {
                  const t = GUIDE_TILES.find((x) => x.id === id);
                  return t ? <GuideRow key={id} tile={t} onOpen={() => setView(id)} /> : null;
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ px: tokens.gutter, pt: '14px' }}>
        <BannerSlot
          placement="sections" onUpgrade={upgrade}
          onAdvertise={() => setView('mahabat')}
        />
      </Box>
    </>
  );
}

/* ---------------- Profil ---------------- */

/* Heatmap: one grid per school term, so the term switch actually changes data.
   Level 0 none · 1 one grade · 2 a few · 3 many. */
const HEAT_COLS = 17;
const HEAT_ROWS = 6;
const HEAT_COLORS = [tokens.heatBase, tokens.heat1, tokens.heat2, tokens.greenDeep];
const GRADES_PER_LEVEL = [0, 1, 3, 5];

type TermId = 'q12' | 'q34';
const TERMS: Record<TermId, { label: string; short: string; months: string[]; seed: number; upto: number }> = {
  /* the first term is over, so it is filled edge to edge */
  q12: { label: 'I–II çärýek', short: 'I–II', months: ['Sen', 'Okt', 'Noý', 'Dek'], seed: 3, upto: HEAT_COLS },
  /* the current term stops at today */
  q34: { label: 'III–IV çärýek', short: 'III–IV', months: ['Ýan', 'Few', 'Mar', 'Apr', 'Maý'], seed: 7, upto: 12 },
};

const heatLevel = (r: number, c: number, term: TermId) => {
  const t = TERMS[term];
  if (c >= t.upto) return 0;
  const h = (r * 31 + c * 17 + t.seed) % 19;
  return h <= 1 ? 3 : h === 2 ? 2 : h <= 4 ? 1 : 0;
};

const TODAY_CELL = { r: 4, c: 12 };

/*
 * The heat grid, drawn once and used by both maps on the profile.
 *
 * A second hand-built grid for attendance would be the same 100 lines with a
 * different palette, and the two would drift the first time a cell size or a
 * month header changed. `colorOf` is the only thing that differs — grades use a
 * sequential ramp (more grades, darker), attendance a categorical one (three
 * distinct states), which is why the colour is a function rather than a scale.
 */
function HeatGrid({ months, colorOf, todayCell, label }: {
  months: string[];
  colorOf: (r: number, c: number) => string;
  todayCell?: { r: number; c: number };
  label: string;
}) {
  return (
    <Box role="img" aria-label={label}>
      <Box sx={{ display: 'flex', pl: '23px', mb: '5px' }}>
        {months.map((m) => (
          <Typography key={m} sx={{ flex: 1, fontSize: 12, color: tokens.inkMuted }}>{m}</Typography>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '5px' }}>
        <Box sx={{
          width: 18, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', py: '1px', flex: 'none',
        }}>
          <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>Du</Typography>
          <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>An</Typography>
        </Box>
        <Box sx={{
          flex: 1, display: 'grid', gap: '3px',
          gridTemplateColumns: `repeat(${HEAT_COLS}, 1fr)`,
        }}>
          {Array.from({ length: HEAT_ROWS }, (_, r) =>
            Array.from({ length: HEAT_COLS }, (_, c) => {
              const today = todayCell && r === todayCell.r && c === todayCell.c;
              return (
                <Box key={`${r}-${c}`} sx={{
                  aspectRatio: '1', borderRadius: `${tokens.rChip}px`,
                  bgcolor: today ? 'transparent' : colorOf(r, c),
                  ...(today && { border: `2px solid ${tokens.blue}` }),
                }} />
              );
            }))}
        </Box>
      </Box>
    </Box>
  );
}

/* Passive legend — swatch + label, never styled like a control */
const HeatLegend = ({ items, label }: { items: [string, string][]; label: string }) => (
  <Box role="img" aria-label={label}
    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '9px' }}>
    {items.map(([text, color]) => (
      <Box key={text} sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: `${tokens.rChip}px`, flex: 'none', bgcolor: color }} />
        <Typography sx={{ fontSize: 11, color: tokens.ink3 }}>{text}</Typography>
      </Box>
    ))}
  </Box>
);

/*
 * Attendance, on the same grid as the grades.
 *
 * Attendance is categorical, not a quantity: a day is attended, late or
 * missed, and there is no "more attended". So it gets three distinct hues
 * rather than a ramp, and the two absent states keep the app's existing
 * meanings — orange for something to watch, red for something wrong.
 */
const ATT = {
  none: tokens.heatBase,
  present: tokens.heat2,
  late: tokens.orange,
  absent: tokens.red,
} as const;

type AttState = keyof typeof ATT;

const attState = (r: number, c: number, term: TermId): AttState => {
  const t = TERMS[term];
  if (c >= t.upto) return 'none';
  const h = (r * 23 + c * 13 + t.seed * 5) % 37;
  if (h === 0) return 'absent';
  if (h === 3 || h === 17) return 'late';
  return 'present';
};


const FAV_SUBJECTS = ['Matematika', 'Fizika', 'Himiýa', 'Informatika', 'Biologiýa', 'Taryh', 'Iňlis dili', 'Geografiýa'];

/* One picker sheet shape for both "favourite subject" and "dream speciality" */
function ChoiceSheet({ open, title, note, options, value, onPick, onClose, footer }: {
  open: boolean; title: string; note: string;
  options: { id: string; label: string; hint?: string }[];
  value: string; onPick: (id: string) => void; onClose: () => void;
  /* an escape hatch for the reader who opened the picker precisely because
     they cannot answer it */
  footer?: React.ReactNode;
}) {
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">{title}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: '4px' }}>{note}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '16px' }}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <ButtonBase
              key={o.id}
              onClick={() => { onPick(o.id); onClose(); }}
              aria-pressed={on}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 52,
                px: '15px', textAlign: 'left', justifyContent: 'flex-start',
                borderRadius: `${tokens.rRow}px`,
                bgcolor: on ? tokens.blueTint : tokens.surface,
                border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
                transition: 'background .15s ease',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: on ? tokens.blueText : tokens.ink }} noWrap>
                  {o.label}
                </Typography>
                {o.hint && (
                  <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }} noWrap>{o.hint}</Typography>
                )}
              </Box>
              {on && <Box aria-hidden sx={{ color: tokens.blue, display: 'flex', flex: 'none' }}><CheckIcon size={17} /></Box>}
            </ButtonBase>
          );
        })}
      </Box>
      {footer}
    </SheetDrawer>
  );
}

type ProfilView = 'root' | 'settings' | 'edit' | 'payments' | 'cards' | 'referral' | 'upgrade'
  | 'career' | 'wallet' | 'shop';

export function ProfilScreen({ toast }: { toast: (msg: string) => void }) {
  const { premium } = usePrefs();
  const [view, setView] = useState<ProfilView>('root');

  /* which of the two pots the balance page opens on */
  const [pot, setPot] = useState<PotId>('money');
  /* the account's two balances, stated here and read on the page they open */
  const { balance: money } = useWallet();
  const pointsPot = usePointsBalance();
  const [map, setMap] = useState<'bahalar' | 'gatnasyk'>('bahalar');
  const [term, setTerm] = useState<TermId>('q34');
  const [fav, setFav] = useState('Matematika');
  const [dream, setDream] = useState('programmist');
  const [picker, setPicker] = useState<'fav' | 'dream' | null>(null);
  const career = useCareerResult();
  const [pay, setPay] = useState(false);
  /* the profile is a child's profile — whichever child is selected */
  const student = useStudent();

  const root = () => setView('root');

  /* the caption under the heatmap is derived from the same cells it draws,
     so the summary can never contradict the picture */
  const summary = useMemo(() => {
    let days = 0;
    let grades = 0;
    for (let r = 0; r < HEAT_ROWS; r += 1) {
      for (let c = 0; c < HEAT_COLS; c += 1) {
        const lvl = heatLevel(r, c, term);
        if (lvl > 0) { days += 1; grades += GRADES_PER_LEVEL[lvl]; }
      }
    }
    return { days, grades };
  }, [term]);

  /* the caption over the attendance map counts the same cells it draws */
  const attendance = useMemo(() => {
    let school = 0;
    let late = 0;
    let absent = 0;
    for (let r = 0; r < HEAT_ROWS; r += 1) {
      for (let c = 0; c < HEAT_COLS; c += 1) {
        const st = attState(r, c, term);
        if (st === 'none') continue;
        school += 1;
        if (st === 'late') late += 1;
        if (st === 'absent') absent += 1;
      }
    }
    return { pct: school ? Math.round(((school - absent) / school) * 100) : 0, late, absent };
  }, [term]);

  const dreamLabel = dream ? careerDreamLabel(dream) : '—';

  if (view === 'settings') {
    return <SettingsScreen onBack={root} toast={toast} onUpgrade={() => setView('upgrade')} />;
  }
  if (view === 'edit') return <ProfileEditScreen onBack={root} toast={toast} />;
  if (view === 'referral') return <ReferralScreen onBack={root} toast={toast} />;
  if (view === 'upgrade') return <UpgradeScreen onBack={root} toast={toast} />;
  if (view === 'wallet') {
    return (
      <WalletScreen
        onBack={root} toast={toast} pot={pot}
        onShop={() => setView('shop')}
      />
    );
  }
  /* The shop has no menu row of its own: it is what a balance is *for*, so it
     opens from the balance page and goes back to the pot it was opened from. */
  if (view === 'shop') {
    return (
      <ShopScreen
        onBack={() => setView('wallet')} toast={toast}
        onTopUp={() => setView('wallet')}
      />
    );
  }
  /* Kartlar has one door — the payment method row inside the töleg page */
  if (view === 'cards') return <PayMethodsScreen onBack={() => setView('payments')} toast={toast} />;
  if (view === 'career') {
    return (
      <CareerTestScreen
        onBack={() => setView('root')}
        onPickDream={(id) => { setDream(id); setView('root'); }}
        toast={toast}
      />
    );
  }
  if (view === 'payments') {
    return (
      <>
        <PaymentsScreen
          onBack={root} toast={toast}
          onOpenCards={() => setView('cards')}
          onPay={() => setPay(true)}
        />
        <PaySheet open={pay} onClose={() => setPay(false)} toast={toast} />
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Profil"
        action={(
          <HeaderIconButton label="Sazlamalar" onClick={() => setView('settings')}>
            <GearIcon size={21} />
          </HeaderIconButton>
        )}
      />

      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* ---- Identity ----
             One row, not a centred stack. The 108px avatar with a name, a
             sub-line and an edit button under it spent about a third of the
             first screen telling the user who they already know they are, and
             it carried two affordances — a pencil dot and a button — for the
             same destination. The row states the same three facts in a
             quarter of the height, and the whole row is the one way in. */}
        <ButtonBase
          onClick={() => setView('edit')}
          aria-label={`${student.name} — maglumatlary üýtget`}
          sx={{
            display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
            textAlign: 'left', justifyContent: 'flex-start', mt: '6px',
            p: '8px', borderRadius: `${tokens.rCard}px`,
            '&:active': { bgcolor: tokens.surfacePress },
          }}
        >
          <Avatar initials={student.initials} size={62} fill="gradient" premium={premium} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>
              {student.name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ display: 'block', mt: '2px', fontSize: 14 }}>
              {student.school} · {student.cls}
            </Typography>
          </Box>
          <RowChevron />
        </ButtonBase>

        {/* The tariff, on every tier: which plan, what it gives, and the one
           thing to do next — open the payment page, extend it when the term is
           nearly out, or, on the free plan, see what the cheapest one costs.
           This slot used to hold two unrelated objects, a status row for a
           subscriber and a whole ad card for everyone else, so the page
           changed shape according to what the reader had paid. */}
        <SectionLabel>Nyrhnamam</SectionLabel>
        <PlanWidget
          onOpen={() => setView('payments')}
          onUpgrade={() => setView('upgrade')}
        />

        {/* Directly under the subscription, because it is the same subject:
            this is where that payment comes from. Two pots, side by side, in
            one card rather than two menu rows — `bal` is a balance, not a
            score kept somewhere else — and each half opens the page on its
            own pot. The shop and the banner desk used to sit beside them as
            rows; both are now reached from the thing they belong to. */}
        <SectionLabel>Balans</SectionLabel>
        <BalancePots
          onSelect={(id) => { setPot(id as PotId); setView('wallet'); }}
          pots={[
            {
              id: 'money', icon: <WalletIcon size={17} />,
              tint: tokens.blueTint, color: tokens.blueText,
              value: `${money} TMT`, note: 'Hasabyňdaky pul',
            },
            {
              id: 'bal', icon: <CoinIcon size={17} />,
              tint: tokens.orangeTint, color: tokens.orangeText,
              value: `${pointsPot.balance} bal`, note: `${pointsPot.worth} TMT bolýar`,
            },
          ]}
        />

        {/* ---- The year ----
             One card, and everything in it is about the same twelve months:
             the three figures the year is judged on, then the map behind them.
             The figures used to sit at the top of the page, three tiles under
             the photograph with nothing to compare them to — a number is a
             headline for something, and this card is the something. They are
             flat here: a tile with its own surface, on a surface, is a box
             drawn for no reason.

             Two maps, one grid. Two stacked cards drawing the same grid at the
             same size made the page look like it repeated itself, and flipping
             in place holds the cells still, so a thin week of grades and a run
             of missed days land on the same square.

             Both switches share one line — what is being mapped and over which
             term are one question ("show me this, for that"), and stacking two
             full-width tracks spent 88px of a phone screen on it. The terms use
             their short form for the same reason. */}
        <Box sx={{
          mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `16px ${tokens.padCard}`, display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h2" component="h2">Ýylyň netijesi</Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
              {map === 'bahalar'
                ? `${summary.grades} baha · ${summary.days} işjeň gün`
                : `${attendance.pct}% gatnaşyk · ${attendance.late} gijä galma · ${attendance.absent} sebäpsiz`}
            </Typography>
          </Box>

          {/* the same figure the attendance map counts, not a second copy of
              it — two numbers for one fact is how a screen starts lying */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: 'Gatnaşyk', value: `${attendance.pct}%`, pct: attendance.pct, color: tokens.greenDeep },
              { label: 'Öý işi', value: `${student.hwRate}%`, pct: student.hwRate, color: tokens.blue },
              { label: 'Ortaça baha', value: student.avg, pct: (Number(student.avg) / 5) * 100, color: tokens.orangeText },
            ].map((m, i) => (
              <Box key={m.label} sx={{
                borderLeft: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none',
                px: i > 0 ? '6px' : 0,
              }}>
                <MeterTile flat value={m.value} label={m.label} pct={m.pct} color={m.color} />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Segmented
              label="Karta"
              value={map}
              onChange={setMap}
              options={[
                { id: 'bahalar', label: 'Bahalar' },
                { id: 'gatnasyk', label: 'Gatnaşyk' },
              ]}
            />
            <Segmented
              label="Çärýek"
              value={term}
              onChange={setTerm}
              options={[
                { id: 'q12', label: TERMS.q12.short },
                { id: 'q34', label: TERMS.q34.short },
              ]}
            />
          </Box>

          {map === 'bahalar' ? (
            <>
              <HeatGrid
                months={TERMS[term].months}
                colorOf={(r, c) => HEAT_COLORS[heatLevel(r, c, term)]}
                todayCell={term === 'q34' ? TODAY_CELL : undefined}
                label={`Bahalar kartasy, ${TERMS[term].label}: ${summary.grades} baha`}
              />
              <HeatLegend
                label="Reňk açary: açyk — 1 baha, orta — 3 baha, goýy — köp baha"
                items={[['1 baha', HEAT_COLORS[1]], ['3 baha', HEAT_COLORS[2]], ['Köp', HEAT_COLORS[3]]]}
              />
            </>
          ) : (
            <>
              <HeatGrid
                months={TERMS[term].months}
                colorOf={(r, c) => ATT[attState(r, c, term)]}
                todayCell={term === 'q34' ? TODAY_CELL : undefined}
                label={`Gatnaşyk kartasy, ${TERMS[term].label}: ${attendance.pct}% gatnaşyk`}
              />
              <HeatLegend
                label="Reňk açary: ýaşyl — geldi, mämişi — gijä galdy, gyzyl — gelmedi"
                items={[['Geldi', ATT.present], ['Gijä galdy', ATT.late], ['Gelmedi', ATT.absent]]}
              />
            </>
          )}
        </Box>

        {/* ---- Goals, near the bottom ----
             Answered once and changed rarely, so they sit below the blocks
             that expire and need money.

             They were three equal rows — favourite subject, dream job, career
             test — which is one row too many and the wrong shape for all
             three. Two of them are *answers* and the third is the *instrument*
             that produces one of them: "what do I want to be" asked twice,
             once as a picker for a pupil who knows and once as a test for one
             who does not. So the goal is the card and the test is attached to
             it — an invitation while there is no result, the result itself
             once there is one. And a goal is not only a word: the subjects it
             rests on are printed under it, because that is the part a pupil
             can do something about this term.

             The favourite subject is not a goal at all. It stays a row, under
             the card rather than above it, and it says what it changes. */}
        <SectionLabel>Maksatlarym</SectionLabel>
        <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
          <ButtonBase
            onClick={() => setPicker('dream')}
            aria-label={`Arzuwymdaky hünär: ${dreamLabel} — üýtgetmek`}
            sx={{
              display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
              p: `15px ${tokens.padCard}`, '&:active': { bgcolor: tokens.surfacePress },
            }}
          >
            <IconBadge bg={tokens.purpleTint} color={tokens.purpleText} size={48}>
              <TargetIcon size={24} />
            </IconBadge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>Arzuwymdaky hünär</Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }} noWrap>
                {dream ? dreamLabel : 'Saýlanmadyk'}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }} noWrap>
                {dream ? careerDreamHint(dream) : 'Sekiz hünärden birini saýla'}
              </Typography>
            </Box>
            <RowChevron />
          </ButtonBase>

          <Box sx={{ borderTop: `1px solid ${tokens.dividerSoft}` }}>
            {career ? (
              <ButtonBase
                onClick={() => setView('career')}
                aria-label={`Hünär synagynyň netijesi: ${careerRowValue(career.answers)}`}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
                  p: `13px ${tokens.padCard}`, '&:active': { bgcolor: tokens.surfacePress },
                }}
              >
                <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={40} radius={tokens.rTile}>
                  <QuizIcon size={20} />
                </IconBadge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>Hünär synagynyň netijesi</Typography>
                  <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }} noWrap>
                    {careerRowValue(career.answers)} · {fmtDate(career.at)}
                  </Typography>
                </Box>
                <RowChevron />
              </ButtonBase>
            ) : (
              <Box sx={{ p: `14px ${tokens.padCard} 16px` }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Haýsy hünär maňa gelşer?</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, mt: '3px' }}>
                  12 sorag, 2 minut. Netije üç hünäri, näçe gabat gelýändigini we haýsy
                  dersleriň gerekdigini görkezýär.
                </Typography>
                <Button
                  fullWidth variant="contained" disableElevation
                  startIcon={<QuizIcon size={18} />}
                  sx={{ mt: '12px' }}
                  onClick={() => setView('career')}
                >Synagdan geç</Button>
              </Box>
            )}
          </Box>

          {/* The third answer, and the smallest: not a goal but a preference,
              so it keeps the test row's shape rather than the goal's. Its
              value leads the second line instead of sitting in a right-hand
              slot, which leaves the whole width for saying what it changes —
              a row that states a setting and not its effect is a question the
              reader has to guess the point of. */}
          <Box sx={{ borderTop: `1px solid ${tokens.dividerSoft}` }}>
            <ButtonBase
              onClick={() => setPicker('fav')}
              aria-label={`Söýgüli dersim: ${fav} — üýtgetmek`}
              sx={{
                display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
                p: `13px ${tokens.padCard}`, '&:active': { bgcolor: tokens.surfacePress },
              }}
            >
              <IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={40} radius={tokens.rTile}>
                <StarIcon size={20} />
              </IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>Söýgüli dersim</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }} noWrap>
                  {fav} · şu ders boýunça maslahat
                </Typography>
              </Box>
              <RowChevron />
            </ButtonBase>
          </Box>
        </Box>

        {/* ---- Payment / subscription ----
            Free users get the offer here instead of a subscription card; the
            slot is the same so the page structure never shifts under them. */}
        {/* ---- One way into the account tree; the rest lives inside it ----
             Dostuňy çagyr sits here rather than in a "Gazan" section of its
             own near the top. As a tinted offer card above the fold it was the
             loudest thing on a page about the student, and it needed a whole
             section heading to hold one row. Down here it is a destination
             among destinations, in the same row shape as Sazlamalar — the
             reward moves to the row's value slot, so the offer is still stated
             without the row having to shout it. */}
        <SectionLabel>Hasap</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* The identity card above already says which child this is, so the
              switch is a row with the current name as its value — not a second
              portrait of the same person. */}
          <ChildPickerRow />
          <SurfaceRow
            icon={<IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={44}><CoinIcon size={22} /></IconBadge>}
            label="Dostuňy çagyr"
            labelSx={{ fontSize: 15, fontWeight: 500 }}
            end={<RowEnd value={`+${PLAN.referralReward} TMT`} />}
            onClick={() => setView('referral')}
          />
          <SurfaceRow
            icon={<IconBadge bg={tokens.surfacePress} color={tokens.ink2} size={44}><GearIcon size={22} /></IconBadge>}
            label="Sazlamalar"
            labelSx={{ fontSize: 15, fontWeight: 500 }}
            end={<RowEnd />}
            onClick={() => setView('settings')}
          />
        </Box>
      </Box>

      <ChoiceSheet
        open={picker === 'fav'}
        title="Söýgüli dersiň"
        note="Saýlanan ders boýunça köpräk maslahat we tema hödürleris."
        options={FAV_SUBJECTS.map((s) => ({ id: s, label: s }))}
        value={fav}
        onPick={setFav}
        onClose={() => setPicker(null)}
      />
      <ChoiceSheet
        open={picker === 'dream'}
        title="Arzuwyňdaky hünär"
        note="Hünäre gerek dersleri ýol kartaňda öňe çykararys."
        options={SPECIALITIES}
        value={dream}
        onPick={setDream}
        onClose={() => setPicker(null)}
        footer={(
          <Button
            fullWidth variant="text"
            onClick={() => { setPicker(null); setView('career'); }}
            sx={{ mt: '12px', fontSize: 14, fontWeight: 700 }}
          >Bilemok — synagdan geçeýin</Button>
        )}
      />
    </>
  );
}
