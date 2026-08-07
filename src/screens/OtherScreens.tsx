import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useState } from 'react';
import {
  BigCheckIcon, BooksIcon, BuildingIcon, CardsIcon, ChevronIcon, ComputerIcon,
  GameIcon, GearIcon, MathIcon, PinIcon, QuestionIcon, SocietyIcon, TrophyIcon, VideoIcon,
} from '../components/Icons';
import {
  DeltaLine, GradeBadge, GridTile, HeaderIconButton, HeroStat, IconBadge, PeriodNav,
  PillHeader, PointsPill, RankRow, SectionHeading, SheetDrawer, SurfaceRow, TagPill,
} from '../components/Ui';
import { RoadmapScreen } from './RoadmapScreen';
import { tokens } from '../theme';
import type { Grade } from '../types';

const TopBar = ({ title }: { title: string }) => (
  <Box sx={{
    position: 'sticky', top: 0, zIndex: 10,
    bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
    boxShadow: tokens.shadowHeader,
    px: '13.5px', pb: '10px', pt: 'calc(14px + env(safe-area-inset-top))',
  }}>
    <Typography variant="h1">{title}</Typography>
  </Box>
);

const SectionTitle = ({ children }: { children: string }) => (
  <Typography sx={{
    fontSize: 13, fontWeight: 600, color: tokens.inkMuted, textTransform: 'uppercase',
    letterSpacing: '.6px', px: '17px', pt: '20px', pb: '8px',
  }}>{children}</Typography>
);

const Stat = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '14px 10px', textAlign: 'center' }}>
    <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', color }}>{value}</Typography>
    <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>{label}</Typography>
  </Box>
);

/* One student everywhere: Muhammedow Muhammet, 8-nji «B», 16-njy mekdep */
export const STUDENT = {
  name: 'Muhammedow Muhammet',
  initials: 'MM',
  cls: '8-nji «B» synp',
  school: '16-njy mekdep',
  schoolLong: '16-njy orta mekdep',
};

/* ---------------- Çagam ---------------- */
export function CagamScreen({ toast }: { toast: (msg: string) => void }) {
  return (
    <>
      <TopBar title="Çagam" />
      <Box sx={{
        m: `4px ${tokens.gutter} 0`, bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
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
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', m: `12px ${tokens.gutter} 0` }}>
        <Stat value="4.6" label="Ortaça baha" color={tokens.blue} />
        <Stat value="96%" label="Gatnaşyk" color={tokens.green} />
        <Stat value="2" label="Gijä galma" color={tokens.red} />
      </Box>
      <SectionTitle>Maglumat</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', px: tokens.gutter }}>
        {[
          ['Synp ýolbaşçysy', 'J. Orazowa'],
          ['Çalşyk', 'I çalşyk · 8:00'],
          ['Okuw ýyly', '2025 – 2026'],
        ].map(([a, b]) => (
          <SurfaceRow key={a} label={a}
            end={<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Typography sx={{ fontSize: 14, color: tokens.inkMuted }}>{b}</Typography>
              <Box sx={{ color: tokens.inkDisabled, display: 'flex' }}><ChevronIcon /></Box>
            </Box>}
            onClick={() => toast('Tiz wagtda elýeterli bolar')}
          />
        ))}
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
  { label: 'Takyk', pct: 27, color: tokens.purple, tint: tokens.purpleTint },
  { label: 'Ynsanperwer', pct: 10, color: tokens.red, tint: tokens.redTint },
];

/* Overlapping-bubbles chart from the original (63 / 27 / 10) */
function KindBubbles() {
  return (
    <Box component="svg" viewBox="0 0 190 150" role="img"
      aria-label="Sapaklaryň görnüşleri: Tebigy 63%, Takyk 27%, Ynsanperwer 10%"
      sx={{ width: 190, maxWidth: '100%', flex: 'none' }}>
      <circle cx="72" cy="72" r="62" fill={tokens.blueSoft} fillOpacity=".55" stroke={tokens.blue} strokeWidth="1.5" />
      <circle cx="148" cy="46" r="41" fill={tokens.purpleTint} fillOpacity=".8" stroke={tokens.purple} strokeWidth="1.5" />
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

const CardTitle = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px', textAlign: 'center' }}>
    {children}
  </Typography>
);

/* mock week history so the period arrows actually navigate */
const WEEKS = [
  { label: '09.09 – 16.09', place: '3-nji ýerde', delta: 'geçen hepde 4-nji' },
  { label: '16.09 – 23.09', place: '2-nji ýerde', delta: 'geçen hepde 3-nji' },
  { label: '23.09 – 30.09', place: '1-nji ýerde', delta: 'geçen hepde 2-nji' },
];

/* weekly completion per subject — distinct from quarter averages */
const SUBJECT_WEEK: [string, number][] = [
  ['Iňlis dili', 96], ['Türkmen dili', 94], ['Taryh', 90], ['Geografiýa', 88],
  ['Matematika', 82], ['Himiýa', 76], ['Fizika', 71],
];

export function AnalitikaScreen() {
  const [sheet, setSheet] = useState<'yetisik' | 'baha' | null>(null);
  const [week, setWeek] = useState(WEEKS.length - 1);
  return (
    <>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 10,
        bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
        boxShadow: tokens.shadowHeader,
        px: '13.5px', pb: '10px', pt: 'calc(14px + env(safe-area-inset-top))',
        display: 'flex', alignItems: 'baseline', gap: '8px',
      }}>
        <Typography variant="h1">Analitika</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: tokens.inkDisabled }}>/hepdelik</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', px: tokens.gutter, pt: '4px' }}>
        {/* Streak banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          bgcolor: tokens.blueTint, borderRadius: `${tokens.rRow}px`, minHeight: 60, px: '16px',
        }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Yzygider bäşlik alan gün sany</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: tokens.blue, fontVariantNumeric: 'tabular-nums' }}>
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
          <Button fullWidth variant="contained" disableElevation onClick={() => setSheet('yetisik')}>
            Dersler boýunça ýetişigi
          </Button>
        </StatCard>

        {/* Quarter average */}
        <StatCard>
          <CardTitle>Çärýegiň ortaça bahasy</CardTitle>
          <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>2-nji çärýek</Typography>
          <Box>
            <HeroStat>Baha: 4.5</HeroStat>
            <DeltaLine>geçen çärýek 4.3</DeltaLine>
          </Box>
          <Button fullWidth variant="contained" disableElevation onClick={() => setSheet('baha')}>
            Ders boýunça bahasy
          </Button>
        </StatCard>
      </Box>

      <SheetDrawer open={sheet !== null} onClose={() => setSheet(null)}>
        <Typography variant="h2">
          {sheet === 'yetisik' ? 'Dersler boýunça ýetişigi' : 'Ders boýunça bahasy'}
        </Typography>
        <Typography variant="caption">
          {sheet === 'yetisik' ? `${WEEKS[week].label} · ýerine ýetiriliş` : '2-nji çärýek · ortaça baha'}
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
const GUIDE_TILES: { label: string; icon: React.ReactNode; id: string }[] = [
  { id: 'kitaphana', label: 'Kitaphana', icon: <BooksIcon size={26} /> },
  { id: 'wideo', label: 'Wideo sapaklar', icon: <VideoIcon size={26} /> },
  { id: 'testler', label: 'Testler', icon: <BigCheckIcon size={26} /> },
  { id: 'kartlar', label: 'Öwrediji kartlar', icon: <CardsIcon size={26} /> },
  { id: 'oyunlar', label: 'Okuw oýunlary', icon: <GameIcon size={26} /> },
  { id: 'basleshik', label: 'Bäsleşikler', icon: <TrophyIcon size={26} /> },
  { id: 'mekdepler', label: 'Mekdepler', icon: <PinIcon size={26} /> },
  { id: 'merkezler', label: 'Okuw merkezler', icon: <BuildingIcon size={26} /> },
];

const TEST_SUBJECTS = [
  { label: 'Matematika', icon: <MathIcon size={26} />, tint: tokens.blueTint, color: tokens.blue },
  { label: 'Informatika', icon: <ComputerIcon size={26} />, tint: tokens.surface, color: tokens.ink2 },
  { label: 'Jemgyýet', icon: <SocietyIcon size={26} />, tint: tokens.tealTint, color: tokens.teal },
];

const RATING = [
  { rank: 1, name: 'M. Leýli', sub: '16-njy mekdep, 8A', points: 1311 },
  { rank: 2, name: 'M. Muhammet', sub: '16-njy mekdep, 8B', points: 1251 },
  { rank: 3, name: 'A. Kerim', sub: '7-nji mekdep, 8A', points: 1198 },
];

function TestlerSubScreen({ onBack, toast, onOpenSubject }: {
  onBack: () => void; toast: (m: string) => void; onOpenSubject: (subject: string) => void;
}) {
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
            <PointsPill value={1251} unit="bal" />
            <Box
              component="button"
              aria-label="Ballar barada"
              onClick={() => toast('Ballar test netijeleri boýunça hasaplanýar')}
              sx={{ border: 0, p: 0, bgcolor: 'transparent', color: tokens.inkMuted, display: 'flex', cursor: 'pointer' }}
            >
              <QuestionIcon size={22} />
            </Box>
          </Box>
        </Box>

        {/* Subject cards */}
        <SectionHeading title="Testler" action={<TagPill label="Ähli" onClick={() => toast('Ähli dersler tiz wagtda')} />} />
        <Box sx={{
          display: 'flex', gap: '12px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
        }}>
          {TEST_SUBJECTS.map((s) => (
            <ButtonBase key={s.label} aria-label={s.label} onClick={() => onOpenSubject(s.label)} sx={{
              flex: '0 0 148px', height: 148, borderRadius: `${tokens.rCard}px`, bgcolor: s.tint,
              display: 'flex', flexDirection: 'column', alignItems: 'stretch',
              justifyContent: 'space-between', p: '16px', textAlign: 'left',
              transition: 'transform .12s ease', '&:active': { transform: 'scale(.97)' },
            }}>
              <Box sx={{ alignSelf: 'flex-end' }}>
                <IconBadge bg="#fff" color={s.color} size={52} radius={26}>{s.icon}</IconBadge>
              </Box>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: s.color, letterSpacing: '-.2px' }}>
                {s.label}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
        <Box sx={{ mt: '16px' }}>
          <Button fullWidth variant="contained" disableElevation
            onClick={() => toast('Test tiz wagtda açylar')}>
            Test saýlamak
          </Button>
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

export function GollanmalarScreen({ toast }: { toast: (msg: string) => void }) {
  const [view, setView] = useState<'grid' | 'testler' | 'roadmap'>('grid');
  if (view === 'roadmap') return <RoadmapScreen onBack={() => setView('testler')} toast={toast} />;
  if (view === 'testler') {
    return (
      <TestlerSubScreen
        onBack={() => setView('grid')}
        toast={toast}
        onOpenSubject={(subject) => (subject === 'Matematika' ? setView('roadmap') : toast('Tiz wagtda elýeterli bolar'))}
      />
    );
  }
  return (
    <>
      <PillHeader title="Gollanmalar" />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', px: tokens.gutter, pt: '6px' }}>
        {GUIDE_TILES.map((t) => (
          <GridTile
            key={t.id}
            icon={t.icon}
            label={t.label}
            onClick={t.id === 'testler' ? () => setView('testler') : () => toast('Tiz wagtda elýeterli bolar')}
          />
        ))}
      </Box>
    </>
  );
}

/* ---------------- Profil (original: Profil screen with grade heatmap) ---------------- */
const HEAT_MONTHS = ['Ýan', 'Few', 'Mar', 'Apr', 'Maý'];
const HEAT_COLS = 17;
const HEAT_ROWS = 6;
/* deterministic sprinkle of grades: 0 none · 1 one · 2 a few · 3 many */
const heatLevel = (r: number, c: number) => {
  if (c > 11) return 0; /* the school year fades out in spring */
  const h = (r * 31 + c * 17 + 7) % 19;
  return h === 0 ? 3 : h === 1 ? 3 : h === 2 ? 2 : h <= 4 ? 1 : 0;
};
const HEAT_COLORS = [tokens.heatBase, tokens.heat1, tokens.heat2, tokens.greenDeep];
const TODAY_CELL = { r: 4, c: 12 };

const RECENT_GRADES: [string, string, Grade][] = [
  ['Iňlis dili', 'Şu gün', { a: 5, b: 4, color: 'blue' }],
  ['Türkmenistanyň taryhy', 'Şu gün', { a: 5, b: 5, color: 'green' }],
  ['Geografiýa', 'Şu gün', { a: 5, b: 5, color: 'green' }],
  ['Matematika', 'Düýn', { a: 5, b: 4, color: 'blue' }],
  ['Informatika', '3-nji few.', { a: 5, b: 5, color: 'green' }],
];

const QUARTERS = ['I-II', 'III-IV'];

export function ProfilScreen({ toast }: { toast: (msg: string) => void }) {
  const [highOnly, setHighOnly] = useState(false);
  const [quarter, setQuarter] = useState(1);

  const cell = (r: number, c: number) => {
    const raw = heatLevel(r, c);
    return highOnly && raw < 3 ? 0 : raw;
  };

  return (
    <>
      <PillHeader
        title="Profil"
        action={(
          <HeaderIconButton label="Sazlamalar" onClick={() => toast('Sazlamalar tiz wagtda elýeterli bolar')}>
            <GearIcon size={21} />
          </HeaderIconButton>
        )}
      />

      {/* Identity */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '10px', gap: '12px' }}>
        <Box aria-hidden sx={{
          width: 120, height: 120, borderRadius: '50%', bgcolor: tokens.blue,
          color: '#fff', display: 'grid', placeItems: 'center', fontSize: 38, fontWeight: 700,
        }}>{STUDENT.initials}</Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px' }}>{STUDENT.name}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: '3px', fontSize: 15 }}>
            {STUDENT.school} · {STUDENT.cls}
          </Typography>
        </Box>
      </Box>

      {/* Ýetişik heatmap card */}
      <Box sx={{
        m: `16px ${tokens.gutter} 0`, bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        p: `18px ${tokens.padCard}`, display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h2" component="h2">Ýetişik</Typography>
          <ButtonBase
            role="switch"
            aria-checked={highOnly}
            aria-label="Diňe köp bahaly günler"
            onClick={() => setHighOnly(!highOnly)}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: `${tokens.rPill}px`, px: '4px' }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.inkMuted }}>GM</Typography>
            <Box sx={{
              width: 42, height: 25, borderRadius: `${tokens.rPill}px`, p: '3px',
              bgcolor: highOnly ? tokens.blue : tokens.inkDisabled,
              transition: 'background .18s ease',
            }}>
              <Box sx={{
                width: 19, height: 19, borderRadius: '50%', bgcolor: '#fff',
                transform: highOnly ? 'translateX(17px)' : 'none',
                transition: 'transform .18s ease',
                boxShadow: '0 1px 2px rgba(17,18,19,.2)',
              }} />
            </Box>
          </ButtonBase>
        </Box>

        {/* Month labels + grid */}
        <Box role="img" aria-label="Bahalar kartasy, ýanwar–maý">
          <Box sx={{ display: 'flex', pl: '26px', mb: '6px' }}>
            {HEAT_MONTHS.map((m) => (
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
                  const today = r === TODAY_CELL.r && c === TODAY_CELL.c;
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

        {/* Quarter selector + legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <ButtonBase
            onClick={() => setQuarter((quarter + 1) % QUARTERS.length)}
            aria-label={`Çärýek: ${QUARTERS[quarter]}`}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', height: 40, px: '16px',
              borderRadius: `${tokens.rPill}px`, bgcolor: tokens.blueTint, color: tokens.blue,
              fontSize: 17, fontWeight: 700,
            }}
          >
            {QUARTERS[quarter]}
            <Box sx={{ display: 'flex', transform: 'rotate(90deg)' }}><ChevronIcon size={10} /></Box>
          </ButtonBase>
          <Box sx={{ display: 'flex', gap: '6px' }}>
            {[['1 baha', 1], ['3 baha', 2], ['Köp baha', 3]].map(([label, lvl]) => (
              <Box key={label as string} sx={{
                height: 30, px: '10px', borderRadius: `${tokens.rTile}px`, display: 'inline-flex',
                alignItems: 'center', fontSize: 13, fontWeight: 600,
                bgcolor: HEAT_COLORS[lvl as number],
                color: (lvl as number) >= 3 ? '#fff' : tokens.greenDeep,
              }}>{label}</Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Recent grades */}
      <SectionTitle>Soňky bahalar</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', px: tokens.gutter }}>
        {RECENT_GRADES.map(([subject, when, grade]) => (
          <SurfaceRow key={subject + when}
            label={<Typography sx={{ fontSize: 15, fontWeight: 500 }}>{subject}</Typography>}
            sub={when}
            end={<GradeBadge grade={grade} />}
          />
        ))}
      </Box>
    </>
  );
}
