import { Box, Button, ButtonBase, SwipeableDrawer, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { isToday } from '../lib/date';
import { toggleBookmark, useIsBookmarked } from '../state/bookmarks';
import type { Bookmark } from '../state/bookmarks';
import { tokens } from '../theme';
import type { DayInfo, Grade, Lesson, TabId } from '../types';
import { useSwipeLock } from './SwipeLock';
import {
  BackIcon, BookmarkFilledIcon, BookmarkIcon, CheckIcon, ChevronIcon, CoinIcon,
  HouseEventIcon, HwIcon, MedalIcon, NavChevronIcon, PenEventIcon, QuestionOutlineIcon,
  TabBookIcon, TabChartIcon, TabGridIcon, TabPersonIcon, TrendUpIcon,
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
        bgcolor: grade.color === 'blue' ? tokens.blue : tokens.greenText,
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
        /* Today keeps a ring when it is not the selected day, so a reader who
           has browsed backwards can see where "now" is without counting. */
        const today = isToday(d.key);
        return (
          <ButtonBase
            key={d.key}
            disabled={d.disabled}
            onClick={() => onSelect(d.key)}
            aria-pressed={active}
            aria-label={`${d.d} ${d.full}${today ? ', şu gün' : ''}`}
            data-datecell={active ? 'active' : undefined}
            sx={{
              position: 'relative', flex: '0 0 54px', height: 70,
              borderRadius: `${tokens.rCell}px`,
              bgcolor: active ? tokens.blue : tokens.surface,
              color: active ? '#fff' : d.disabled ? tokens.inkDisabled : tokens.ink,
              boxShadow: today && !active ? `inset 0 0 0 1.5px ${tokens.blue}` : 'none',
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
export function SurfaceRow({ icon, label, labelSx, sub, end, onClick }: {
  icon?: ReactNode; label: ReactNode; labelSx?: object;
  sub?: ReactNode; end?: ReactNode; onClick?: () => void;
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
        <Typography variant="subtitle1" noWrap sx={labelSx}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 12, color: tokens.inkMuted, mt: '2px' }}>{sub}</Typography>}
      </Box>
      {end}
    </ButtonBase>
  );
}

/* Red is the app's "unread" colour and nothing else. A count that is merely a
   quantity — how many notes a day holds — takes the quiet tone, so two stacked
   rows never both shout. */
export const CountPill = ({ n, tone = 'alert', label }: {
  n: number; tone?: 'alert' | 'quiet'; label?: string;
}) => (
  <Box role="img" aria-label={label ?? `${n} täze`} sx={{
    minWidth: 23, height: 20, px: '7px', borderRadius: '10px',
    bgcolor: tone === 'alert' ? tokens.redText : tokens.surfacePress,
    color: tone === 'alert' ? '#fff' : tokens.ink2,
    fontSize: 13, fontWeight: 600, lineHeight: '20px', textAlign: 'center',
  }}>{n}</Box>
);

/* ---------------- LessonCard ---------------- */
export function LessonCard({ lesson, marks, onOpen }: {
  /* `marks` is the teacher-badge signal. It sits in the meta row, in the slot
     the classmate count used to hold — one quiet mark before the grade, rather
     than a labelled chip strip that turned every card into two stacked cards. */
  lesson: Lesson; marks?: ReactNode; onOpen: (l: Lesson) => void;
}) {
  const [start, end] = lesson.time.split('–').map((t) => t.trim());
  return (
    <ButtonBase
      onClick={() => onOpen(lesson)}
      aria-haspopup="dialog"
      aria-label={`${lesson.subject}, ${lesson.time}`
        + (lesson.grade ? `, baha ${lesson.grade.a}/${lesson.grade.b}` : '')
        + (lesson.unread > 0 ? `, ${lesson.unread} täze` : '')}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '13px', width: '100%',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        p: `13px ${tokens.padCard}`, textAlign: 'left',
        transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      {/* The time as a left rail: it is what you scan a timetable by, and one
          column of aligned digits reads faster than a clock icon on every row. */}
      <Box sx={{
        flex: 'none', width: 42, pt: '2px',
        fontVariantNumeric: 'tabular-nums', textAlign: 'left',
      }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{start}</Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, lineHeight: 1.3 }}>{end}</Typography>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography variant="h3" noWrap sx={{ flex: 1, minWidth: 0 }}>{lesson.subject}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 'none' }}>
            {/* Unread and badges are different facts — an unread note is a
                thing to open, a badge is a thing that happened — so a lesson
                that has both shows both rather than hiding one behind the
                other. */}
            {lesson.unread > 0 && (
              <Box role="img" aria-label={`${lesson.unread} täze`} sx={{
                width: 24, height: 24, borderRadius: '50%', bgcolor: tokens.redDeep, flex: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: '24px', textAlign: 'center',
              }}>{lesson.unread}</Box>
            )}
            {marks}
            {lesson.grade && <GradeBadge grade={lesson.grade} />}
          </Box>
        </Box>

        {/* The topic, not the word "Tema". A label that is identical on every
            card looks like data and carries none. */}
        {lesson.tema && (
          <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px', lineHeight: 1.4 }} noWrap>
            {lesson.tema}
          </Typography>
        )}

        {/* Homework appears only when there is homework, and says its state */}
        {lesson.hw && (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: '7px', mt: '9px',
            px: '9px', height: 26, borderRadius: `${tokens.rPill}px`,
            width: 'fit-content', maxWidth: '100%',
            bgcolor: lesson.hwDone ? tokens.greenTint : tokens.orangeTint,
            color: lesson.hwDone ? tokens.greenText : tokens.orangeText,
          }}>
            <Box aria-hidden sx={{ display: 'flex', flex: 'none' }}>
              {lesson.hwDone ? <CheckIcon size={13} /> : <HwIcon size={14} />}
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, minWidth: 0 }} noWrap>
              {lesson.hwDone ? 'Öý işi taýýar' : lesson.hw}
            </Typography>
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

/* ---------------- TabBar ---------------- */
const TABS: { id: TabId; label: string; icon: (active: boolean) => ReactNode }[] = [
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
        sx={{ display: 'flex', justifyContent: 'space-around', px: '12px', pt: '9px' }}>
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
                color: active ? tokens.blueText : tokens.ink3, fontSize: 11, fontWeight: 500,
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
  /*
   * The capsule header IS the definition of "inner page", so the swipe lock
   * lives here rather than being re-declared by each page that happens to
   * remember. That also gives the shell one reliable signal for hiding the tab
   * bar: a page with a back button owns the screen, and a bottom nav under it
   * offers a second, competing way out of somewhere you got to by drilling in.
   */
  useSwipeLock();
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
/*
 * The one "save this" control, in the header of every resource's detail page.
 *
 * It lives on the *detail* page rather than on list rows because saving is a
 * decision, and the detail page is where the reader has enough to make it — a
 * bookmark on every row of six lists is six ways to save something you have
 * not read yet. Filled means saved: a stateful control has to look different
 * in its two states, not just change a tooltip.
 */
export function BookmarkButton({ item }: { item: Bookmark }) {
  const on = useIsBookmarked(item.kind, item.id);
  return (
    <ButtonBase
      onClick={() => toggleBookmark(item)}
      role="switch"
      aria-checked={on}
      aria-label={on ? `${item.title} — bellikden aýyr` : `${item.title} — bellige goş`}
      sx={{
        width: 44, height: 44, borderRadius: `${tokens.rRow}px`, bgcolor: '#fff',
        display: 'grid', placeItems: 'center', flex: 'none',
        color: on ? tokens.blue : tokens.ink2,
        boxShadow: tokens.shadowCtl,
        transition: 'color .15s ease',
      }}
    >
      {on ? <BookmarkFilledIcon size={20} /> : <BookmarkIcon size={20} />}
    </ButtonBase>
  );
}

export function HeaderIconButton({ label, onClick, pressed, count, children }: {
  label: string; onClick: () => void; pressed?: boolean; count?: number; children: ReactNode;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={count ? `${label}, ${count} täze` : label}
      {...(pressed !== undefined ? { 'aria-pressed': pressed } : {})}
      sx={{
        width: 44, height: 44, borderRadius: `${tokens.rRow}px`, bgcolor: '#fff',
        display: 'grid', placeItems: 'center', position: 'relative', flex: 'none',
        color: pressed ? tokens.blue : tokens.ink,
        boxShadow: tokens.shadowCtl,
      }}
    >
      {children}
      {/* unread rides the button rather than taking a row of its own.
          It clings to the corner: pulled outside the button box so it clips the
          glyph's corner instead of sitting on top of it. */}
      {!!count && (
        <Box aria-hidden sx={{
          position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, px: '4px',
          borderRadius: '9px', bgcolor: tokens.redText, color: '#fff',
          fontSize: 11, fontWeight: 700, lineHeight: '18px', textAlign: 'center',
          border: '2px solid #fff', boxSizing: 'content-box',
        }}>{count > 99 ? '99+' : count}</Box>
      )}
    </ButtonBase>
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
export function GridTile({ icon, label, sub, onClick }: {
  icon: ReactNode; label: string; sub?: string; onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={sub ? `${label}, ${sub}` : label}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '18px 16px 20px',
        textAlign: 'left', transition: 'background .15s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <IconBadge>{icon}</IconBadge>
      <Box sx={{ minWidth: 0, width: '100%' }}>
        <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }} noWrap>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '3px' }} noWrap>{sub}</Typography>}
      </Box>
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
        bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5, fontWeight: 600,
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
      <Box sx={{ color: tokens.orangeText, display: 'flex' }} aria-hidden><CoinIcon size={18} /></Box>
      {value}{unit ? ` ${unit}` : ''}
    </Box>
  );
}

/* Leaderboard row — medal, name, school, points (original: Reýting) */
const MEDAL = [tokens.gold, tokens.silver, tokens.bronze];
export function RankRow({ rank, name, sub, points, self }: {
  rank: number; name: string; sub: string; points: number; self?: boolean;
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '13px', minHeight: 64,
      bgcolor: self ? tokens.blueTint : tokens.surface,
      border: `1.5px solid ${self ? tokens.blue : 'transparent'}`,
      borderRadius: `${tokens.rRow}px`, px: '13px',
    }}>
      <Box sx={{ color: MEDAL[rank - 1] ?? tokens.inkDisabled, display: 'flex' }} aria-label={`${rank}-nji orun`}>
        <MedalIcon n={rank} size={30} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.2px' }} noWrap>{name}</Typography>
          {self && (
            <Box sx={{
              flex: 'none', px: '7px', height: 19, borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.blue, color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>Siz</Box>
          )}
        </Box>
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
      color: tokens.greenText, fontSize: 14, fontWeight: 500, mt: '8px',
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
      sx={{ width: 44, height: 44, borderRadius: '50%', color: fn ? tokens.inkMuted : tokens.inkDisabled }}
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

/* ---------------- Sub-page frame ----------------
   Every page reached by a back button has the same three parts: the capsule
   header, a swipe lock (a sideways swipe inside must not slide to another tab)
   and a gutter-padded column. Owning them in one place keeps the back-stack
   behaviour identical on all ~20 sub-pages. */
export function SubPage({ title, onBack, action, help, children }: {
  title: string; onBack: () => void; action?: ReactNode;
  /* An explanatory sentence is worth having and not worth a permanent line at
     the top of the page: everyone reads it once, then scrolls past it forever.
     Pass it as `help` and it becomes a "?" in the header, on demand. */
  help?: string;
  children: ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  /* A sub-page swaps its content into the tab's own scroller, so without this
     it opens at whatever offset the previous page was left at — the header
     says one thing and the body starts mid-page. */
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let el = top.current?.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 4) { el.scrollTop = 0; break; }
      el = el.parentElement;
    }
  }, []);
  return (
    <>
      <Box ref={top} aria-hidden sx={{ display: 'none' }} />
      <PillHeader
        title={title}
        onBack={onBack}
        action={action ?? (help ? (
          <ButtonBase
            onClick={() => setHelpOpen(true)}
            aria-label="Bu sahypa barada"
            sx={{
              width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff',
              color: tokens.ink2, display: 'grid', placeItems: 'center', boxShadow: tokens.shadowCtl,
            }}
          >
            <QuestionOutlineIcon size={20} />
          </ButtonBase>
        ) : undefined)}
      />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      {help && (
        <SheetDrawer open={helpOpen} onClose={() => setHelpOpen(false)}>
          <Typography variant="h2">{title}</Typography>
          <Typography sx={{ fontSize: 14.5, color: tokens.ink2, lineHeight: 1.55, mt: '10px' }}>
            {help}
          </Typography>
          <Button
            fullWidth disableElevation onClick={() => setHelpOpen(false)}
            sx={{ mt: '18px', bgcolor: tokens.surface, color: tokens.ink }}
          >
            Düşnükli
          </Button>
        </SheetDrawer>
      )}
    </>
  );
}

/* Uppercase group label above a list of rows */
export const SectionLabel = ({ children }: { children: string }) => (
  <Typography sx={{
    fontSize: 13, fontWeight: 600, color: tokens.inkMuted, textTransform: 'uppercase',
    letterSpacing: '.6px', px: '6px', pt: '20px', pb: '8px',
  }}>{children}</Typography>
);

/* One sentence under a page header on what the page is for */
export const Lede = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '10px' }}>
    {children}
  </Typography>
);

/* Trailing "this row opens something" chevron */
export const RowChevron = () => (
  <Box aria-hidden sx={{ color: tokens.inkDisabled, display: 'flex', flex: 'none' }}><ChevronIcon /></Box>
);

/*
 * Trailing value + chevron. A row's **second line is for a value it cannot show
 * any other way — never to explain what the row does**; the label already does
 * that. Putting the value here instead keeps list rows single-line, so a menu
 * reads as a list of destinations rather than a wall of prose.
 */
export const RowEnd = ({ value }: { value?: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 'none', minWidth: 0 }}>
    {value && (
      <Typography noWrap sx={{ fontSize: 14, color: tokens.inkMuted, maxWidth: 150 }}>{value}</Typography>
    )}
    <RowChevron />
  </Box>
);

/* The one switch visual. Purely presentational — the parent row carries
   role="switch"/aria-checked, so the knob is never a second tab stop. */
export function ToggleSwitch({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <Box component="span" aria-hidden sx={{
      width: 42, height: 25, borderRadius: `${tokens.rPill}px`, p: '3px', flex: 'none',
      bgcolor: on ? tokens.blue : tokens.inkDisabled,
      opacity: disabled ? 0.45 : 1,
      transition: 'background .18s ease,opacity .18s ease',
    }}>
      <Box sx={{
        width: 19, height: 19, borderRadius: '50%', bgcolor: '#fff',
        transform: on ? 'translateX(17px)' : 'none',
        transition: 'transform .18s ease', boxShadow: '0 1px 2px rgba(17,18,19,.2)',
      }} />
    </Box>
  );
}

/* Row whose whole surface toggles a switch */
export function SwitchRow({ icon, label, sub, on, disabled, onToggle }: {
  icon?: ReactNode; label: string; sub?: string;
  on: boolean; disabled?: boolean; onToggle: () => void;
}) {
  return (
    <ButtonBase
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      sx={{
        display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: 48,
        bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`,
        px: '15px', pr: '12px', textAlign: 'left', justifyContent: 'flex-start',
        opacity: disabled ? 0.5 : 1,
        transition: 'background .15s ease,opacity .18s ease',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      {icon}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500 }} noWrap>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 12, color: tokens.inkMuted, mt: '2px' }}>{sub}</Typography>}
      </Box>
      <ToggleSwitch on={on} disabled={disabled} />
    </ButtonBase>
  );
}

/* Small figure + label tile (Çagam stats, Profil identity strip, detail pages) */
export const StatTile = ({ value, label, color = tokens.ink }: {
  value: string; label: string; color?: string;
}) => (
  <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '14px 10px', textAlign: 'center' }}>
    <Typography sx={{
      fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', color,
      fontVariantNumeric: 'tabular-nums',
    }}>{value}</Typography>
    <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>{label}</Typography>
  </Box>
);

/* Segmented switch — 2–3 mutually exclusive options on one track.
   Use when the options must stay visible; a cycling pill hides them. */
export function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T; options: { id: T; label: string }[]; onChange: (id: T) => void; label: string;
}) {
  return (
    /* the track is a shade darker than `surface` so it still reads as a track
       when the control sits on a surface card */
    <Box role="group" aria-label={label} sx={{
      display: 'flex', gap: '3px', p: '3px', bgcolor: tokens.surfacePress,
      borderRadius: `${tokens.rPill}px`,
    }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <ButtonBase
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={on}
            sx={{
              flex: 1, height: 32, px: '12px', borderRadius: `${tokens.rPill}px`,
              fontSize: 13.5, fontWeight: 600,
              bgcolor: on ? '#fff' : 'transparent',
              color: on ? tokens.ink : tokens.ink3,
              boxShadow: on ? tokens.shadowCtl : 'none',
              transition: 'background .15s ease,color .15s ease',
            }}
          >{o.label}</ButtonBase>
        );
      })}
    </Box>
  );
}

/* Labelled text input — rTile is the input radius in the token set.
   `note` explains a read-only field instead of leaving it mysteriously dead. */
export function Field({ label, value, onChange, placeholder, note, type = 'text' }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; note?: string; type?: string;
}) {
  const readOnly = !onChange;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Typography component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.ink2, px: '4px' }}>
        {label}
      </Typography>
      <Box
        component="input"
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
        sx={{
          height: 48, px: '15px', width: '100%', boxSizing: 'border-box',
          border: `1.5px solid ${tokens.dividerSoft}`, borderRadius: `${tokens.rTile}px`,
          bgcolor: readOnly ? tokens.surface : '#fff',
          color: readOnly ? tokens.ink3 : tokens.ink,
          font: 'inherit', fontSize: 15,
          '&:focus': { outline: 'none', borderColor: tokens.blue, bgcolor: '#fff' },
          '&::placeholder': { color: tokens.inkDisabled },
        }}
      />
      {note && <Typography sx={{ fontSize: 12, color: tokens.ink3, px: '4px' }}>{note}</Typography>}
    </Box>
  );
}

/* Sticky footer for a page whose primary action must always be reachable */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <Box sx={{
      position: 'sticky', bottom: 0, zIndex: 5, mx: `-${tokens.gutter}`,
      px: tokens.gutter, pt: '12px', pb: 'calc(12px + env(safe-area-inset-bottom))',
      bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
      borderTop: `1px solid ${tokens.dividerSoft}`,
    }}>{children}</Box>
  );
}

/* Empty / "nothing here yet" state — one shape for every list that can run dry */
export function EmptyState({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      py: '40px', px: '24px', textAlign: 'center',
    }}>
      <IconBadge bg={tokens.surface} color={tokens.inkMuted} size={56} radius={28}>{icon}</IconBadge>
      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5 }}>{note}</Typography>
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
