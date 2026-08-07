import { Box, ButtonBase, Divider, SwipeableDrawer, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { tokens } from '../theme';
import type { DayInfo, Grade, Lesson, TabId } from '../types';
import {
  BackIcon, CheckIcon, ClockIcon, CoinIcon, HouseEventIcon, HwIcon, MedalIcon,
  NavChevronIcon, PenEventIcon, PeopleIcon, TabBookIcon, TabChartIcon, TabFaceIcon,
  TabGridIcon, TabPersonIcon, TemaIcon, TrendUpIcon,
} from './Icons';

/* ---------------- GradeBadge (geometry matched to mock: 46.5×28, r14, slash) ---------------- */
export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <Box
      role="img"
      aria-label={`Baha ${grade.a}/${grade.b}`}
      sx={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 46.5, height: 28, borderRadius: '14px', overflow: 'hidden', flex: 'none',
        bgcolor: grade.color === 'blue' ? tokens.blue : tokens.green,
        color: '#fff', fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
        '&::after': {
          content: '""', position: 'absolute', left: '50%', top: -5, bottom: -5,
          width: 2, bgcolor: '#fff', transform: 'rotate(31deg)',
        },
      }}
    >
      <Box component="span" sx={{ width: '50%', textAlign: 'center' }}>{grade.a}</Box>
      <Box component="span" sx={{ width: '50%', textAlign: 'center' }}>{grade.b}</Box>
    </Box>
  );
}

/* ---------------- DateStrip ---------------- */
export function DateStrip({ days, selected, onSelect }: {
  days: DayInfo[]; selected: string; onSelect: (key: string) => void;
}) {
  return (
    <Box
      component="nav"
      aria-label="Senäni saýlaň"
      sx={{
        display: 'flex', gap: '7px', overflowX: 'auto', px: tokens.gutter, pt: '14px',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        scrollBehavior: 'smooth',
      }}
    >
      {days.map((d) => {
        const active = d.key === selected;
        return (
          <ButtonBase
            key={d.key}
            disabled={d.disabled}
            onClick={() => onSelect(d.key)}
            aria-pressed={active}
            aria-label={`${d.d} ${d.full}`}
            data-datecell={active ? 'active' : undefined}
            sx={{
              position: 'relative', flex: '0 0 54px', height: 70,
              borderRadius: `${tokens.rCell}px`,
              bgcolor: active ? tokens.blue : tokens.surface,
              color: active ? '#fff' : d.disabled ? tokens.inkDisabled : tokens.ink,
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background .18s ease,color .18s ease',
            }}
          >
            <Box sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}>{d.d}</Box>
            <Box sx={{ fontSize: 14, lineHeight: 1 }}>{d.w}</Box>
            {d.events.includes('house') && (
              <Box sx={{ position: 'absolute', top: -4, right: -4, pointerEvents: 'none' }}>
                <HouseEventIcon />
              </Box>
            )}
            {d.events.includes('pen') && (
              <Box sx={{ position: 'absolute', top: -5, right: -4, pointerEvents: 'none' }}>
                <PenEventIcon />
              </Box>
            )}
            {d.events.includes('dot') && (
              <Box sx={{
                position: 'absolute', top: 5, left: 5, width: 8, height: 8,
                borderRadius: '50%', bgcolor: tokens.dot,
              }} />
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/* ---------------- SurfaceRow (quick rows, list rows) ---------------- */
export function SurfaceRow({ icon, label, sub, end, onClick }: {
  icon?: ReactNode; label: ReactNode; sub?: ReactNode; end?: ReactNode; onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={!onClick}
      aria-label={typeof label === 'string' ? label : undefined}
      sx={{
        display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: 48,
        bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`,
        px: '15px', pr: '12px', textAlign: 'left', justifyContent: 'flex-start',
        transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      {icon}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 12, color: tokens.inkMuted, mt: '2px' }}>{sub}</Typography>}
      </Box>
      {end}
    </ButtonBase>
  );
}

export const CountPill = ({ n }: { n: number }) => (
  <Box role="img" aria-label={`${n} täze`} sx={{
    minWidth: 23, height: 20, px: '7px', borderRadius: '10px', bgcolor: tokens.red,
    color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: '20px', textAlign: 'center',
  }}>{n}</Box>
);

/* ---------------- LessonCard ---------------- */
export function LessonCard({ lesson, onOpen }: { lesson: Lesson; onOpen: (l: Lesson) => void }) {
  return (
    <ButtonBase
      onClick={() => onOpen(lesson)}
      aria-haspopup="dialog"
      aria-label={`${lesson.subject}, ${lesson.time}`
        + (lesson.grade ? `, baha ${lesson.grade.a}/${lesson.grade.b}` : '')
        + (lesson.unread > 0 ? `, ${lesson.unread} täze` : '')}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, minHeight: 108,
        pl: tokens.padCard, pr: '16px', textAlign: 'left',
        transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <Box sx={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <Typography variant="h3" noWrap>{lesson.subject}</Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: '7px', flex: 'none',
          color: tokens.inkMuted, fontSize: 15, fontVariantNumeric: 'tabular-nums',
        }}>
          <ClockIcon />{lesson.time}
        </Box>
      </Box>
      <Divider sx={{ borderColor: tokens.divider }} />
      <Box sx={{ flex: 1, minHeight: 57, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: tokens.ink2, fontSize: 13, fontWeight: 500 }}>
          <TemaIcon />Tema
        </Box>
        <Box sx={{ width: '1px', height: 18.5, bgcolor: tokens.dividerSoft, mx: '17px' }} />
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: tokens.ink2, fontSize: 13, fontWeight: 500 }}>
          <HwIcon />Öý işi
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {lesson.unread > 0 ? (
            <Box role="img" aria-label={`${lesson.unread} täze`} sx={{
              width: 26, height: 26, borderRadius: '50%', bgcolor: tokens.redDeep,
              color: '#fff', fontSize: 14, fontWeight: 600, lineHeight: '26px', textAlign: 'center',
            }}>{lesson.unread}</Box>
          ) : (
            <>
              {lesson.people > 0 && (
                <>
                  <PeopleIcon />
                  <Box component="span" sx={{ mx: '10px 0', ml: '5px', mr: '10px', fontSize: 13, color: tokens.inkMuted }}>
                    +{lesson.people}
                  </Box>
                </>
              )}
              {lesson.grade
                ? <GradeBadge grade={lesson.grade} />
                : lesson.hwDone && <Box sx={{ color: tokens.green, display: 'flex' }}><CheckIcon size={18} /></Box>}
            </>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
}

/* ---------------- TabBar ---------------- */
const TABS: { id: TabId; label: string; icon: (active: boolean) => ReactNode }[] = [
  { id: 'cagam', label: 'Çagam', icon: () => <TabFaceIcon /> },
  { id: 'gundelik', label: 'Gündelik', icon: () => <TabBookIcon /> },
  { id: 'analitika', label: 'Analitika', icon: () => <TabChartIcon /> },
  { id: 'gollanmalar', label: 'Gollanmalar', icon: () => <TabGridIcon /> },
  { id: 'yetisik', label: 'Profil', icon: () => <TabPersonIcon /> },
];

export function TabBar({ value, onChange }: { value: TabId; onChange: (t: TabId) => void }) {
  return (
    <Box sx={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      bgcolor: tokens.blurBgSoft, backdropFilter: tokens.blur,
      borderTop: `1px solid ${tokens.dividerSoft}`,
    }}>
      <Box component="nav" role="tablist" aria-label="Esasy nawigasiýa"
        sx={{ display: 'flex', justifyContent: 'space-between', px: '25.7px', pt: '9px' }}>
        {TABS.map((t) => {
          const active = t.id === value;
          return (
            <ButtonBase
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              sx={{
                display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 52,
                color: active ? tokens.blue : tokens.ink3, fontSize: 11, fontWeight: 500,
                borderRadius: `${tokens.rTile}px`,
              }}
            >
              <Box sx={{
                width: 40, height: 40, borderRadius: `${tokens.rTile}px`,
                bgcolor: active ? tokens.blue : tokens.surface,
                display: 'grid', placeItems: 'center',
                color: active ? '#fff' : tokens.inkMuted,
                transition: 'background .18s ease,color .18s ease',
              }}>
                {t.icon(active)}
              </Box>
              {t.label}
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{
        width: 139, height: 5, borderRadius: '2.5px', bgcolor: tokens.ink,
        m: '12px auto', mb: 'calc(7px + env(safe-area-inset-bottom))',
      }} />
    </Box>
  );
}

/* ---------------- SheetDrawer (MUI SwipeableDrawer, bottom-sheet styled) ---------------- */
export function SheetDrawer({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: ReactNode;
}) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => undefined}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            px: tokens.padCard,
            pb: 'calc(20px + env(safe-area-inset-bottom))',
            maxHeight: '82dvh',
          },
        },
      }}
    >
      <Box sx={{ py: '10px', display: 'grid', placeItems: 'center' }} aria-hidden>
        <Box sx={{ width: 38, height: 5, borderRadius: '2.5px', bgcolor: tokens.divider }} />
      </Box>
      <Box sx={{ overflowY: 'auto' }}>{children}</Box>
    </SwipeableDrawer>
  );
}

/* ================ Design-system primitives (shared across screens) ================ */

/* Capsule page header — centred title, optional round back button and trailing action
   (the one sub-page header: Gollanmalar, Testler, Roadmap, Profil) */
export function PillHeader({ title, onBack, action }: {
  title: string; onBack?: () => void; action?: ReactNode;
}) {
  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 10,
      pt: 'calc(10px + env(safe-area-inset-top))', pb: '10px', px: tokens.gutter,
      bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
      boxShadow: tokens.shadowHeader,
    }}>
      <Box sx={{
        position: 'relative', height: 64, borderRadius: `${tokens.rCard}px`,
        bgcolor: tokens.surface, display: 'grid', placeItems: 'center',
      }}>
        {onBack && (
          <ButtonBase
            onClick={onBack}
            aria-label="Yza"
            sx={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: `${tokens.rRow}px`, bgcolor: '#fff',
              display: 'grid', placeItems: 'center', color: tokens.ink,
              boxShadow: tokens.shadowCtl,
            }}
          >
            <BackIcon size={18} />
          </ButtonBase>
        )}
        <Typography variant="h2" component="h1">{title}</Typography>
        {action && (
          <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* Raised white 44px header button — pair with PillHeader `action` */
export function HeaderIconButton({ label, onClick, pressed, children }: {
  label: string; onClick: () => void; pressed?: boolean; children: ReactNode;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      {...(pressed !== undefined ? { 'aria-pressed': pressed } : {})}
      sx={{
        width: 44, height: 44, borderRadius: `${tokens.rRow}px`, bgcolor: '#fff',
        display: 'grid', placeItems: 'center',
        color: pressed ? tokens.blue : tokens.ink,
        boxShadow: tokens.shadowCtl,
      }}
    >{children}</ButtonBase>
  );
}

/* One "completed" badge everywhere — dark green, white check, white ring */
export function DoneBadge({ size = 22 }: { size?: number }) {
  return (
    <Box aria-hidden sx={{
      width: size, height: size, borderRadius: '50%', bgcolor: tokens.greenDeep,
      color: '#fff', display: 'grid', placeItems: 'center', flex: 'none',
      border: '2.5px solid #fff',
    }}>
      <CheckIcon size={Math.round(size * 0.48)} />
    </Box>
  );
}

/* Squircle icon container (grid tiles, promo rows) */
export function IconBadge({ children, bg = tokens.blueSoft, color = tokens.blue, size = 48, radius = tokens.rRow }: {
  children: ReactNode; bg?: string; color?: string; size?: number; radius?: number;
}) {
  return (
    <Box aria-hidden sx={{
      width: size, height: size, borderRadius: `${radius}px`, bgcolor: bg, color,
      display: 'grid', placeItems: 'center', flex: 'none',
    }}>{children}</Box>
  );
}

/* White grid tile — icon badge + label (original: Gollanmalar grid) */
export function GridTile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '18px 16px 20px',
        textAlign: 'left', transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <IconBadge>{icon}</IconBadge>
      <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }}>{label}</Typography>
    </ButtonBase>
  );
}

/* Small tinted tag pill ("Ähli", "TOP-50", header actions) — the one pill spec: 32px */
export function TagPill({ label, icon, onClick }: {
  label: string; icon?: ReactNode; onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={!onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        height: 32, px: '12px', borderRadius: `${tokens.rPill}px`,
        bgcolor: tokens.blueTint, color: tokens.blue, fontSize: 13.5, fontWeight: 600,
        transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.blueSoft },
      }}
    >{icon}{label}</ButtonBase>
  );
}

/* Section heading row — h2 + trailing pill */
export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: '6px', pt: '22px', pb: '12px',
    }}>
      <Typography variant="h2" component="h2">{title}</Typography>
      {action}
    </Box>
  );
}

/* Orange points pill — coin + "N bal" (original: Testler) */
export function PointsPill({ value, unit }: { value: number; unit?: string }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '8px', height: 36,
      px: '13px', borderRadius: `${tokens.rPill}px`, bgcolor: tokens.orangeTint,
      color: tokens.ink, fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
    }}>
      <Box sx={{ color: tokens.orange, display: 'flex' }} aria-hidden><CoinIcon size={18} /></Box>
      {value}{unit ? ` ${unit}` : ''}
    </Box>
  );
}

/* Leaderboard row — medal, name, school, points (original: Reýting) */
const MEDAL = [tokens.gold, tokens.silver, tokens.bronze];
export function RankRow({ rank, name, sub, points }: {
  rank: number; name: string; sub: string; points: number;
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '13px', minHeight: 64,
      bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, px: '13px',
    }}>
      <Box sx={{ color: MEDAL[rank - 1] ?? tokens.inkDisabled, display: 'flex' }} aria-label={`${rank}-nji orun`}>
        <MedalIcon n={rank} size={30} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.2px' }} noWrap>{name}</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.inkMuted, mt: '1px' }} noWrap>{sub}</Typography>
      </Box>
      <PointsPill value={points} />
    </Box>
  );
}

/* Big hero figure inside stat cards ("1-nji ýerde", "Baha: 4.5") */
export function HeroStat({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{
      fontSize: 34, fontWeight: 700, letterSpacing: '-.5px', color: tokens.blue,
      textAlign: 'center', lineHeight: 1.15,
    }}>{children}</Typography>
  );
}

/* Green improvement line — up arrow + caption */
export function DeltaLine({ children }: { children: ReactNode }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      color: tokens.greenDeep, fontSize: 14, fontWeight: 500, mt: '8px',
    }}>
      <TrendUpIcon size={14} />{children}
    </Box>
  );
}

/* Period navigation — ‹ label › (original: weekly card) */
export function PeriodNav({ label, onPrev, onNext }: {
  label: string; onPrev?: () => void; onNext?: () => void;
}) {
  const arrow = (dir: 'left' | 'right', fn?: () => void) => (
    <ButtonBase
      onClick={fn}
      disabled={!fn}
      aria-label={dir === 'left' ? 'Öňki' : 'Indiki'}
      sx={{ width: 40, height: 40, borderRadius: '50%', color: fn ? tokens.inkMuted : tokens.inkDisabled }}
    >
      <NavChevronIcon dir={dir} size={13} />
    </ButtonBase>
  );
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {arrow('left', onPrev)}
      <Typography sx={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{label}</Typography>
      {arrow('right', onNext)}
    </Box>
  );
}

export function SheetSection({ title, end, children }: {
  title?: ReactNode; end?: ReactNode; children: ReactNode;
}) {
  return (
    <Box sx={{ mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '14px 15px' }}>
      {title && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: 13, fontWeight: 600, color: tokens.ink2, mb: '6px',
        }}>
          {title}
          {end && <Box sx={{ ml: 'auto', display: 'inline-flex' }}>{end}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
}
