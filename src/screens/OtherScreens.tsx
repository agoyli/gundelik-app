import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  BigCheckIcon, BookmarkIcon, BooksIcon, CardIcon, CardsIcon, CheckIcon, GameIcon,
  GearIcon, HistoryIcon, LayersIcon, LockIcon, PencilIcon, QuestionIcon, QuestionOutlineIcon,
  StarIcon, TargetIcon, TrophyIcon, WalletIcon,
} from '../components/Icons';
import {
  DeltaLine, GridTile, HeaderIconButton, HeroStat, IconBadge, PeriodNav, PillHeader,
  PointsPill, RankRow, RowChevron, RowEnd, SectionHeading, SectionLabel, Segmented, SheetDrawer,
  StatTile, SurfaceRow, TagPill,
} from '../components/Ui';
import { AdSlot, FreeLimitBar, LockedPreview, TeaserCard } from '../components/Paywall';
import { RATING, TEST_SUBJECTS } from '../data/guides';
import { fmtRange } from '../lib/date';
import type { TestItem, TestSubject } from '../data/guides';
import { PLAN, tierFor, tierName, useCan, usePrefs } from '../state/prefs';
import { TestDetailScreen, TestSubjectScreen } from './DetailScreens';
import { ReferralRow, ReferralScreen } from './ReferralScreen';
import { RoadmapScreen } from './RoadmapScreen';
import { UpgradeScreen } from './UpgradeScreen';
import {
  BaslesiklerScreen, BookmarksScreen, KartlarScreen, KitaphanaScreen, OyunlarScreen, TemalarScreen,
} from './SectionScreens';
import {
  CardsScreen, PaySheet, PaymentsScreen, ProfileEditScreen, SettingsScreen,
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

/* One student everywhere: Muhammedow Muhammet, 8-nji «B», 16-njy mekdep */
export const STUDENT = {
  name: 'Muhammedow Muhammet',
  initials: 'MM',
  cls: '8-nji «B» synp',
  school: '16-njy mekdep',
  schoolLong: '16-njy orta mekdep',
  points: 1251,
  avg: '4.6',
  rank: '2-nji',
};

/* ---------------- Çagam ---------------- */
export function CagamScreen({ toast }: { toast: (msg: string) => void }) {
  return (
    <>
      <TopBar title="Çagam" />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          mt: '4px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `22px ${tokens.padCard}`, display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', bgcolor: tokens.blueSoft, color: tokens.blue,
            display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700, flex: 'none',
          }}>{STUDENT.initials}</Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }}>{STUDENT.name}</Typography>
            <Typography variant="caption">{STUDENT.cls} · {STUDENT.schoolLong}</Typography>
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
   was showing February, which put two different autumns on one screen. */
const WEEKS = [
  { label: fmtRange('2026-01-26', '2026-02-01'), place: '3-nji ýerde', delta: 'geçen hepde 4-nji' },
  { label: fmtRange('2026-02-02', '2026-02-08'), place: '2-nji ýerde', delta: 'geçen hepde 3-nji' },
  { label: fmtRange('2026-02-09', '2026-02-15'), place: '1-nji ýerde', delta: 'geçen hepde 2-nji' },
];

/* Mock quarter history — the quarter card navigates like the weekly one.
   February is the third quarter, which is also what the school's announcement
   about closing dates says. */
const QUARTER_HISTORY = [
  { label: '2-nji çärýek', avg: '4.3', delta: 'geçen çärýek 4.1' },
  { label: '3-nji çärýek', avg: '4.5', delta: 'geçen çärýek 4.3' },
];

/* weekly completion per subject — distinct from quarter averages */
const SUBJECT_WEEK: [string, number][] = [
  ['Iňlis dili', 96], ['Türkmen dili', 94], ['Taryh', 90], ['Geografiýa', 88],
  ['Matematika', 82], ['Himiýa', 76], ['Fizika', 71],
];

/*
 * What the free tier sees instead of the reports.
 *
 * Not an empty wall: every card is the real one, blurred, and every line under
 * it is true. The line is the same one the badge history draws — **how much**
 * there is to read is free, **what it says** is paid. "3 hepdelik taryh" is a
 * fact the reader can check; it creates a specific gap where "Premium gerek"
 * creates only a refusal. Nothing here invents urgency or a deadline.
 */
function LockedReport({ title, note, preview, onUpgrade }: {
  title: string; note: string; preview: React.ReactNode; onUpgrade: () => void;
}) {
  return (
    <ButtonBase
      onClick={onUpgrade}
      aria-label={`${title} — ${note}, Premium bilen açylýar`}
      sx={{
        display: 'block', width: '100%', textAlign: 'left', overflow: 'hidden',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <LockedPreview height={104}>{preview}</LockedPreview>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '12px',
        p: `0 ${tokens.padCard} 15px`, mt: '-10px', position: 'relative',
      }}>
        <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={40}>
          <LockIcon size={19} />
        </IconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.2px' }} noWrap>{title}</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }} noWrap>{note}</Typography>
        </Box>
        <RowChevron />
      </Box>
    </ButtonBase>
  );
}

function AnalitikaLocked({ onUpgrade }: { onUpgrade: () => void }) {
  const plan = tierFor('analytics');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', px: tokens.gutter, pt: '4px' }}>
      {/* The streak stays free: it is counted from grades the diary already
          shows in full, so hiding it would be hiding the reader's own data
          back from them — and it is the reason to come back tomorrow. */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        bgcolor: tokens.blueTint, borderRadius: `${tokens.rRow}px`, minHeight: 60, px: '16px',
      }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Yzygider bäşlik alan gün sany</Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 700, color: tokens.blueText, fontVariantNumeric: 'tabular-nums' }}>
          12
        </Typography>
      </Box>

      <SectionLabel>Hasabatlar</SectionLabel>

      <LockedReport
        title="Synpda hepdelik ýetişigi"
        note={`${WEEKS.length} hepdelik taryh`}
        onUpgrade={onUpgrade}
        preview={(
          <Box sx={{ p: '18px 15px', textAlign: 'center' }}>
            <HeroStat>{WEEKS[WEEKS.length - 1].place}</HeroStat>
            <DeltaLine>{WEEKS[WEEKS.length - 1].delta}</DeltaLine>
          </Box>
        )}
      />

      <LockedReport
        title="Dersler boýunça ýetişigi"
        note={`${SUBJECT_WEEK.length} ders`}
        onUpgrade={onUpgrade}
        preview={(
          <Box sx={{ p: '16px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SUBJECT_WEEK.slice(0, 3).map(([name, val]) => (
              <Box key={name} sx={{ display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: '10px' }}>
                <Typography noWrap sx={{ fontSize: 13, color: tokens.ink2 }}>{name}</Typography>
                <LinearProgress
                  variant="determinate" value={val}
                  sx={{
                    height: 8, borderRadius: 4, bgcolor: tokens.dividerSoft,
                    '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: tokens.greenDeep },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      />

      <LockedReport
        title="Çärýegiň ortaça bahasy"
        note={`${QUARTER_HISTORY.length} çärýek`}
        onUpgrade={onUpgrade}
        preview={(
          <Box sx={{ p: '18px 15px', textAlign: 'center' }}>
            <HeroStat>Baha: {QUARTER_HISTORY[QUARTER_HISTORY.length - 1].avg}</HeroStat>
            <DeltaLine>{QUARTER_HISTORY[QUARTER_HISTORY.length - 1].delta}</DeltaLine>
          </Box>
        )}
      />

      <LockedReport
        title="Sapaklaryň görnüşleri boýunça"
        note={`${LESSON_KINDS.length} topar`}
        onUpgrade={onUpgrade}
        preview={(
          <Box sx={{ display: 'grid', placeItems: 'center', pt: '6px' }}><KindBubbles /></Box>
        )}
      />

      <Box sx={{ pt: '4px' }}>
        <TeaserCard
          title="Analitika ýapyk"
          note={`Synpdaky ornuň, dersler boýunça ýetişigiň we çärýek ortaçaň — ${plan?.name} nyrhnamasyndan başlap açylýar.`}
          cta={`${plan?.name} al`}
          onUpgrade={onUpgrade}
        />
      </Box>
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

      {!can && <AnalitikaLocked onUpgrade={() => setView('upgrade')} />}

      {can && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', px: tokens.gutter, pt: '4px' }}>
        {/* Streak banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          bgcolor: tokens.blueTint, borderRadius: `${tokens.rRow}px`, minHeight: 60, px: '16px',
        }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Yzygider bäşlik alan gün sany</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: tokens.blueText, fontVariantNumeric: 'tabular-nums' }}>
            12
          </Typography>
        </Box>

        {/* Lesson kinds */}
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

        {/* Weekly standing */}
        <StatCard>
          <CardTitle>Synpda hepdelik ýetişigi</CardTitle>
          <PeriodNav
            label={WEEKS[week].label}
            onPrev={week > 0 ? () => setWeek(week - 1) : undefined}
            onNext={week < WEEKS.length - 1 ? () => setWeek(week + 1) : undefined}
          />
          <Box sx={{ borderTop: `0.5px solid ${tokens.dividerSoft}`, pt: '16px' }}>
            <HeroStat>{WEEKS[week].place}</HeroStat>
            <DeltaLine>{WEEKS[week].delta}</DeltaLine>
          </Box>
          <DrillButton onClick={() => setSheet('yetisik')}>Dersler boýunça ýetişigi</DrillButton>
        </StatCard>

        {/* Quarter average */}
        <StatCard>
          <CardTitle>Çärýegiň ortaça bahasy</CardTitle>
          <PeriodNav
            label={QUARTER_HISTORY[qtr].label}
            onPrev={qtr > 0 ? () => setQtr(qtr - 1) : undefined}
            onNext={qtr < QUARTER_HISTORY.length - 1 ? () => setQtr(qtr + 1) : undefined}
          />
          <Box sx={{ borderTop: `0.5px solid ${tokens.dividerSoft}`, pt: '16px' }}>
            <HeroStat>Baha: {QUARTER_HISTORY[qtr].avg}</HeroStat>
            <DeltaLine>{QUARTER_HISTORY[qtr].delta}</DeltaLine>
          </Box>
          <DrillButton onClick={() => setSheet('baha')}>Ders boýunça bahasy</DrillButton>
        </StatCard>
      </Box>
      )}

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
                  height: 8, borderRadius: 4, bgcolor: tokens.dividerSoft,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
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

/* ---------------- Gollanmalar (tile grid + Testler sub-screen) ---------------- */
/* Six sections, paired the way the user reads them:
   Temalar + Kartlar (learn) / Testler + Bäsleşikler (prove) / Oýunlar + Kitaphana (explore) */
const GUIDE_TILES: { id: SectionId; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'temalar', label: 'Temalar', sub: '5 ders', icon: <LayersIcon size={26} /> },
  { id: 'kartlar', label: 'Öwrediji kartlar', sub: '12 gaýtalama', icon: <CardsIcon size={26} /> },
  { id: 'testler', label: 'Testler', sub: '1251 bal', icon: <BigCheckIcon size={26} /> },
  { id: 'basleshikler', label: 'Bäsleşikler', sub: '1 dowam edýär', icon: <TrophyIcon size={26} /> },
  { id: 'oyunlar', label: 'Oýunlar', sub: '4 oýun', icon: <GameIcon size={26} /> },
  { id: 'kitaphana', label: 'Kitaphana', sub: '4 kitap', icon: <BooksIcon size={26} /> },
];

function TestlerSubScreen({ onBack, toast, onOpenSubject, onUpgrade }: {
  onBack: () => void; toast: (m: string) => void;
  onOpenSubject: (s: TestSubject) => void; onUpgrade: () => void;
}) {
  const { premium, usedTest } = usePrefs();
  return (
    <>
      <PillHeader title="Testler" onBack={onBack} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* Profile */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '14px', gap: '10px' }}>
          <Box aria-hidden sx={{
            width: 104, height: 104, borderRadius: '50%',
            border: `5px solid ${tokens.blue}`, p: '4px', display: 'grid', placeItems: 'center',
          }}>
            <Box sx={{
              width: '100%', height: '100%', borderRadius: '50%', bgcolor: tokens.blueSoft,
              color: tokens.blue, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 700,
            }}>{STUDENT.initials}</Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.3px' }}>
              {STUDENT.name}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: '3px', fontSize: 15 }}>
              {STUDENT.school}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PointsPill value={STUDENT.points} unit="bal" />
            <Box
              component="button"
              aria-label="Ballar barada"
              onClick={() => toast('Ballar test netijeleri boýunça hasaplanýar')}
              sx={{
                border: 0, p: 0, bgcolor: 'transparent', color: tokens.inkMuted, cursor: 'pointer',
                width: 44, height: 44, display: 'grid', placeItems: 'center',
                borderRadius: '50%', mx: '-11px',
              }}
            >
              <QuestionIcon size={22} />
            </Box>
          </Box>
        </Box>

        {/* The weekly free attempt is stated here, where tests are chosen —
            not only inside the test that spends it */}
        {!premium && (
          <Box sx={{ pt: '16px' }}>
            <FreeLimitBar
              used={usedTest}
              label={usedTest ? 'Hepdelik mugt test ulanyldy' : 'Hepdede 1 mugt test'}
              note={usedTest ? 'Indiki duşenbe täzelenýär' : 'Premium bilen çäksiz test'}
              onUpgrade={onUpgrade}
            />
          </Box>
        )}

        {/* Subject cards */}
        <SectionHeading title="Testler" action={<TagPill label="Ähli" onClick={() => toast('Ähli dersler tiz wagtda')} />} />
        <Box sx={{
          display: 'flex', gap: '12px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
        }}>
          {TEST_SUBJECTS.map((s) => (
            <ButtonBase key={s.id} aria-label={`${s.label}, ${s.tests.length} test`}
              onClick={() => onOpenSubject(s)} sx={{
                flex: '0 0 148px', height: 148, borderRadius: `${tokens.rCard}px`, bgcolor: s.tint,
                display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                justifyContent: 'space-between', p: '16px', textAlign: 'left',
                transition: 'transform .12s ease', '&:active': { transform: 'scale(.97)' },
              }}>
              <Box sx={{ alignSelf: 'flex-end' }}>
                <IconBadge bg="#fff" color={s.color} size={52} radius={26}>{s.icon}</IconBadge>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: s.color, letterSpacing: '-.2px' }}>
                  {s.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: s.color, opacity: .8, mt: '2px' }}>
                  {s.tests.length} test
                </Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>

        {/* Rating */}
        <SectionHeading title="Reýting" action={<TagPill label="TOP-50" onClick={() => toast('Doly sanaw tiz wagtda')} />} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {RATING.map((r) => <RankRow key={r.rank} {...r} />)}
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

  if (subject && test) {
    return (
      <TestDetailScreen
        test={test} accent={subject.color} tint={subject.tint}
        onBack={() => setTest(null)} toast={toast} onUpgrade={onUpgrade}
      />
    );
  }
  if (subject) {
    return <TestSubjectScreen subject={subject} onBack={() => setSubject(null)} onOpenTest={setTest} />;
  }
  return <TestlerSubScreen onBack={onBack} toast={toast} onOpenSubject={setSubject} onUpgrade={onUpgrade} />;
}

type SectionId = 'temalar' | 'kartlar' | 'testler' | 'basleshikler' | 'oyunlar' | 'kitaphana';
type GuideView = 'grid' | SectionId | 'roadmap' | 'upgrade' | 'bellikler';

export function GollanmalarScreen({ toast }: { toast: (msg: string) => void }) {
  const [view, setView] = useState<GuideView>('grid');
  const back = () => setView('grid');
  /* where the paywall sends people from anywhere inside this tab */
  const upgrade = () => setView('upgrade');

  if (view === 'upgrade') return <UpgradeScreen onBack={back} toast={toast} />;
  if (view === 'roadmap') {
    return <RoadmapScreen onBack={() => setView('temalar')} toast={toast} onUpgrade={upgrade} />;
  }
  if (view === 'temalar') {
    return (
      <TemalarScreen
        onBack={back}
        toast={toast}
        onOpenSubject={(id) => (id === 'matematika' ? setView('roadmap') : toast('Bu ders tiz wagtda elýeterli bolar'))}
      />
    );
  }
  if (view === 'kartlar') return <KartlarScreen onBack={back} toast={toast} onUpgrade={upgrade} />;
  if (view === 'basleshikler') return <BaslesiklerScreen onBack={back} toast={toast} />;
  if (view === 'oyunlar') return <OyunlarScreen onBack={back} toast={toast} />;
  if (view === 'kitaphana') return <KitaphanaScreen onBack={back} toast={toast} />;
  if (view === 'testler') return <TestlerFlow onBack={back} toast={toast} onUpgrade={upgrade} />;
  if (view === 'bellikler') return <BookmarksScreen onBack={back} toast={toast} onUpgrade={upgrade} />;

  return (
    <>
      {/* Saved items get the header, not a seventh tile: they are not a seventh
          section but a view across the six, and the grid reads as three pairs. */}
      <TopBar
        title="Gollanmalar"
        action={(
          <HeaderIconButton label="Bellikledim" onClick={() => setView('bellikler')}>
            <BookmarkIcon size={21} />
          </HeaderIconButton>
        )}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', px: tokens.gutter, pt: '6px' }}>
        {GUIDE_TILES.map((t) => (
          <GridTile key={t.id} icon={t.icon} label={t.label} sub={t.sub} onClick={() => setView(t.id)} />
        ))}
      </Box>
      <Box sx={{ px: tokens.gutter, pt: '14px' }}>
        <AdSlot onUpgrade={upgrade} />
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

const FAV_SUBJECTS = ['Matematika', 'Fizika', 'Himiýa', 'Informatika', 'Biologiýa', 'Taryh', 'Iňlis dili', 'Geografiýa'];

const SPECIALITIES = [
  { id: 'programmist', label: 'Programmist', hint: 'Informatika · Matematika' },
  { id: 'lukman', label: 'Lukman', hint: 'Biologiýa · Himiýa' },
  { id: 'injener', label: 'Inžener', hint: 'Fizika · Matematika' },
  { id: 'diplomat', label: 'Diplomat', hint: 'Taryh · Daşary ýurt dilleri' },
  { id: 'ykdysadyy', label: 'Ykdysadyýetçi', hint: 'Matematika · Jemgyýet' },
];

/* One picker sheet shape for both "favourite subject" and "dream speciality" */
function ChoiceSheet({ open, title, note, options, value, onPick, onClose }: {
  open: boolean; title: string; note: string;
  options: { id: string; label: string; hint?: string }[];
  value: string; onPick: (id: string) => void; onClose: () => void;
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
                <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: on ? tokens.blueText : tokens.ink }} noWrap>
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
    </SheetDrawer>
  );
}

/* Row that shows a chosen value and opens its picker */
const ChoiceRow = ({ icon, tint, color, label, value, onClick }: {
  icon: React.ReactNode; tint: string; color: string; label: string; value: string; onClick: () => void;
}) => (
  <SurfaceRow
    icon={<IconBadge bg={tint} color={color} size={44}>{icon}</IconBadge>}
    label={label}
    labelSx={{ fontSize: 15, fontWeight: 500 }}
    end={<RowEnd value={value} />}
    onClick={onClick}
  />
);

type ProfilView = 'root' | 'settings' | 'edit' | 'payments' | 'cards' | 'referral' | 'upgrade';

export function ProfilScreen({ toast }: { toast: (msg: string) => void }) {
  const { premium, tier } = usePrefs();
  const [view, setView] = useState<ProfilView>('root');
  /* Kartlar is reachable from Profil and from the payments page — remember which */
  const [cardsFrom, setCardsFrom] = useState<ProfilView>('root');
  const [highOnly, setHighOnly] = useState(false);
  const [term, setTerm] = useState<TermId>('q34');
  const [fav, setFav] = useState('Matematika');
  const [dream, setDream] = useState('programmist');
  const [picker, setPicker] = useState<'fav' | 'dream' | null>(null);
  const [pay, setPay] = useState(false);

  const root = () => setView('root');

  const cell = (r: number, c: number) => {
    const raw = heatLevel(r, c, term);
    return highOnly && raw < 3 ? 0 : raw;
  };

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

  const dreamLabel = SPECIALITIES.find((s) => s.id === dream)?.label ?? '—';

  if (view === 'settings') {
    return <SettingsScreen onBack={root} toast={toast} onUpgrade={() => setView('upgrade')} />;
  }
  if (view === 'edit') return <ProfileEditScreen onBack={root} toast={toast} />;
  if (view === 'referral') return <ReferralScreen onBack={root} toast={toast} />;
  if (view === 'upgrade') return <UpgradeScreen onBack={root} toast={toast} />;
  if (view === 'cards') return <CardsScreen onBack={() => setView(cardsFrom)} toast={toast} />;
  if (view === 'payments') {
    return (
      <>
        <PaymentsScreen
          onBack={root} toast={toast}
          onOpenCards={() => { setCardsFrom('payments'); setView('cards'); }}
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
        {/* ---- Identity ---- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '10px', gap: '12px' }}>
          <Box sx={{ position: 'relative' }}>
            <Box aria-hidden sx={{
              width: 108, height: 108, borderRadius: '50%',
              background: `linear-gradient(150deg, #5B93F5 0%, ${tokens.blue} 70%)`,
              color: '#fff', display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 700,
            }}>{STUDENT.initials}</Box>
            {/* the photo affordance sits on the avatar, where users look for it */}
            <ButtonBase
              onClick={() => setView('edit')}
              aria-label="Profil suratyny üýtget"
              sx={{
                /* 44px hit area, 36px visual dot */
                position: 'absolute', right: -6, bottom: -6, width: 44, height: 44,
                borderRadius: '50%', display: 'grid', placeItems: 'center',
              }}
            >
              <Box aria-hidden sx={{
                width: 36, height: 36, borderRadius: '50%', bgcolor: '#fff', color: tokens.ink,
                display: 'grid', placeItems: 'center', boxShadow: tokens.shadowFloat,
                border: '2px solid #fff',
              }}><PencilIcon size={16} /></Box>
            </ButtonBase>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px' }}>{STUDENT.name}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: '3px', fontSize: 15 }}>
              {STUDENT.school} · {STUDENT.cls}
            </Typography>
          </Box>
          <Button
            disableElevation onClick={() => setView('edit')}
            sx={{
              height: 38, px: '20px', bgcolor: tokens.surface, color: tokens.ink,
              '&:active': { bgcolor: tokens.surfacePress },
            }}
          >Maglumatlary üýtget</Button>
        </Box>

        {/* ---- Where the student stands right now ---- */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '18px' }}>
          <StatTile value={STUDENT.avg} label="Ortaça baha" color={tokens.blueText} />
          <StatTile value={`${STUDENT.points}`} label="Bal" color={tokens.orangeText} />
          <StatTile value={STUDENT.rank} label="Synpda orun" color={tokens.greenText} />
        </Box>

        {/* ---- Earn ---- */}
        <SectionLabel>Gazan</SectionLabel>
        <ReferralRow onClick={() => setView('referral')} />

        {/* ---- Payment / subscription ----
            Free users get the offer here instead of a subscription card; the
            slot is the same so the page structure never shifts under them. */}
        <SectionLabel>{premium ? 'Töleg' : 'Nyrhnamalar'}</SectionLabel>
        {!premium ? (
          <AdSlot onUpgrade={() => setView('upgrade')} />
        ) : (
        <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
          <ButtonBase
            onClick={() => setView('payments')}
            aria-label={`Abuna: ${tierName(tier)}, ${PLAN.until} çenli`}
            sx={{
              display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
              p: `16px ${tokens.padCard}`, '&:active': { bgcolor: tokens.surfacePress },
            }}
          >
            <IconBadge bg={tokens.greenTint} color={tokens.greenText} size={48}><WalletIcon size={24} /></IconBadge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-.2px' }}>{tierName(tier)}</Typography>
                <Box sx={{
                  px: '9px', height: 22, borderRadius: `${tokens.rPill}px`,
                  bgcolor: tokens.greenTint, color: tokens.greenText, fontSize: 11.5, fontWeight: 700,
                  display: 'grid', placeItems: 'center', flex: 'none',
                }}>{PLAN.status}</Box>
              </Box>
              <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px' }}>
                {PLAN.until} çenli
              </Typography>
            </Box>
            <RowChevron />
          </ButtonBase>
          {/* three payment actions, split evenly under the status */}
          <Box sx={{ display: 'flex', borderTop: `1px solid ${tokens.dividerSoft}` }}>
            {[
              { id: 'taryh', label: 'Taryh', icon: <HistoryIcon size={20} />, go: () => setView('payments') },
              { id: 'kartlar', label: 'Kartlar', icon: <CardIcon size={20} />, go: () => { setCardsFrom('root'); setView('cards'); } },
              { id: 'tole', label: 'Tölemek', icon: <WalletIcon size={20} />, go: () => setPay(true) },
            ].map((a, i) => (
              <ButtonBase
                key={a.id}
                onClick={a.go}
                aria-label={a.label}
                sx={{
                  flex: 1, minHeight: 64, display: 'flex', flexDirection: 'column', gap: '5px',
                  color: tokens.ink2, fontSize: 12.5, fontWeight: 600,
                  borderLeft: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none',
                  '&:active': { bgcolor: tokens.surfacePress },
                }}
              >
                <Box aria-hidden sx={{ color: tokens.blue, display: 'flex' }}>{a.icon}</Box>
                {a.label}
              </ButtonBase>
            ))}
          </Box>
        </Box>
        )}

        {/* ---- Ýetişik heatmap ---- */}
        <Box sx={{
          mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `18px ${tokens.padCard}`, display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h2" component="h2">Ýetişik</Typography>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
                {summary.grades} baha · {summary.days} işjeň gün
              </Typography>
            </Box>
            {/* a labelled chip beats the old unexplained "GM" switch */}
            <ButtonBase
              aria-pressed={highOnly}
              onClick={() => setHighOnly(!highOnly)}
              sx={{
                flex: 'none', height: 32, px: '12px', borderRadius: `${tokens.rPill}px`,
                fontSize: 13, fontWeight: 600,
                bgcolor: highOnly ? tokens.blue : '#fff',
                color: highOnly ? '#fff' : tokens.ink2,
                border: `1px solid ${highOnly ? tokens.blue : tokens.divider}`,
                transition: 'background .15s ease,color .15s ease',
              }}
            >
              Diňe köp bahaly
            </ButtonBase>
          </Box>

          <Segmented
            label="Çärýek"
            value={term}
            onChange={setTerm}
            options={[
              { id: 'q12', label: TERMS.q12.label },
              { id: 'q34', label: TERMS.q34.label },
            ]}
          />

          <Box role="img" aria-label={`Bahalar kartasy, ${TERMS[term].label}: ${summary.grades} baha`}>
            <Box sx={{ display: 'flex', pl: '26px', mb: '6px' }}>
              {TERMS[term].months.map((m) => (
                <Typography key={m} sx={{ flex: 1, fontSize: 13, color: tokens.inkMuted }}>{m}</Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Box sx={{
                width: 20, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', py: '2px', flex: 'none',
              }}>
                <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>Du</Typography>
                <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>An</Typography>
              </Box>
              <Box sx={{
                flex: 1, display: 'grid', gap: '4px',
                gridTemplateColumns: `repeat(${HEAT_COLS}, 1fr)`,
              }}>
                {Array.from({ length: HEAT_ROWS }, (_, r) =>
                  Array.from({ length: HEAT_COLS }, (_, c) => {
                    const today = term === 'q34' && r === TODAY_CELL.r && c === TODAY_CELL.c;
                    return (
                      <Box key={`${r}-${c}`} sx={{
                        aspectRatio: '1', borderRadius: '5px',
                        bgcolor: today ? 'transparent' : HEAT_COLORS[cell(r, c)],
                        ...(today && { border: `2px solid ${tokens.blue}` }),
                      }} />
                    );
                  }))}
              </Box>
            </Box>
          </Box>

          {/* Passive legend — swatch + label, never styled like a control */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }} role="img"
            aria-label="Reňk açary: açyk — 1 baha, orta — 3 baha, goýy — köp baha">
            {[['1 baha', 1], ['3 baha', 2], ['Köp', 3]].map(([label, lvl]) => (
              <Box key={label as string} sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Box aria-hidden sx={{
                  width: 12, height: 12, borderRadius: '3px', flex: 'none',
                  bgcolor: HEAT_COLORS[lvl as number],
                }} />
                <Typography sx={{ fontSize: 12, color: tokens.ink3 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---- Goals ---- */}
        <SectionLabel>Maksatlarym</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ChoiceRow
            icon={<StarIcon size={22} />} tint={tokens.orangeTint} color={tokens.orangeText}
            label="Söýgüli dersim" value={fav} onClick={() => setPicker('fav')}
          />
          <ChoiceRow
            icon={<TargetIcon size={22} />} tint={tokens.purpleTint} color={tokens.purpleText}
            label="Arzuwymdaky hünär" value={dreamLabel} onClick={() => setPicker('dream')}
          />
        </Box>

        {/* ---- One way into the account tree; the rest lives inside it ---- */}
        <SectionLabel>Hasap</SectionLabel>
        <SurfaceRow
          icon={<IconBadge bg={tokens.surfacePress} color={tokens.ink2} size={44}><GearIcon size={22} /></IconBadge>}
          label="Sazlamalar"
          labelSx={{ fontSize: 15, fontWeight: 500 }}
          end={<RowEnd />}
          onClick={() => setView('settings')}
        />
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
      />
      <PaySheet open={pay} onClose={() => setPay(false)} toast={toast} />
    </>
  );
}
