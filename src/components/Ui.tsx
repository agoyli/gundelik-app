import { Box, Button, ButtonBase, SwipeableDrawer, Typography } from '@mui/material';
import { Children, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  WEEKDAY_HEADS, dayInMonth, daysInMonth, firstWeekdayIndex, isDayOff, isToday,
  monthLabel, shiftMonth, weekdayLong,
} from '../lib/date';
import { toggleBookmark, useIsBookmarked } from '../state/bookmarks';
import type { Bookmark } from '../state/bookmarks';
import type { ViewId } from '../state/prefs';
import { PREMIUM_GRADIENT, tokens } from '../theme';
import type { DayInfo, Lesson, TabId } from '../types';
import { useSwipeLock } from './SwipeLock';
import {
  BackIcon, BookmarkFilledIcon, BookmarkIcon, CalendarIcon, CheckIcon, ChevronIcon, CoinIcon,
  GridIcon, ListIcon, LockIcon, MedalIcon, NavChevronIcon, QuestionOutlineIcon,
  TabBookIcon, TabChartIcon, TabGridIcon, TabPersonIcon, TrendUpIcon,
} from './Icons';

/* ---------------- GradeBadge ----------------
 *
 * One mark, one shape, one place. The colour comes from the digit — 5 green,
 * 4 blue, 3 orange, 2 red — and is derived rather than stored, so it can never
 * disagree with the number it tints.
 *
 * `GradeSlot` is the other half of the rule and the more important one. A
 * lesson row can carry an unread count and a badge score as well as the mark,
 * and when the lesson had no mark those slid right and landed exactly where a
 * mark goes: a red circle with a number in it, in the mark's position, which
 * reads as a 2. The mark's column is now reserved on every row whether or not
 * there is a mark in it, so nothing else can ever occupy it.
 */
const GRADE_TONE: Record<number, string> = {
  5: tokens.greenText,
  /* the Solid grade, not the brand blue: a 16px bold digit is not large text,
     so the fill it sits on has to clear 4.5:1 against white */
  4: tokens.blueSolid,
  3: tokens.orangeText,
  2: tokens.redText,
};

export function GradeBadge({ grade }: { grade: number }) {
  return (
    <Box
      role="img"
      aria-label={`Baha ${grade}`}
      sx={{
        display: 'grid', placeItems: 'center', flex: 'none',
        width: 30, height: 28, borderRadius: `${tokens.rCell}px`,
        bgcolor: GRADE_TONE[grade] ?? tokens.ink2,
        color: '#fff', fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      }}
    >{grade}</Box>
  );
}

/* The mark's column, held open. Empty is a state worth drawing: "no mark yet"
   is what most of a school day looks like. */
export const GradeSlot = ({ grade }: { grade: number | null }) => (
  grade ? <GradeBadge grade={grade} /> : (
    <Box role="img" aria-label="Baha goýulmadyk" sx={{
      display: 'grid', placeItems: 'center', flex: 'none',
      width: 30, height: 28, borderRadius: `${tokens.rCell}px`, bgcolor: tokens.surfacePress,
    }}>
      <Box aria-hidden sx={{ width: 9, height: 2, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.inkDisabled }} />
    </Box>
  )
);

/* ---------------- DateStrip ----------------
   `onPick` puts the calendar next to the dates it changes. It used to sit in
   the app header between "share" and "notifications" — three unrelated icons
   in a row, one of which only ever acts on the strip 60px below it. Pinned to
   the end of the strip it is out of the header, still always reachable, and
   its meaning is given by what it sits beside. */
export function DateStrip({ days, selected, onSelect, onPick }: {
  days: DayInfo[]; selected: string; onSelect: (key: string) => void; onPick?: () => void;
}) {
  return (
    <Box sx={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: '7px', pt: '14px',
      pl: tokens.gutter, pr: onPick ? '7px' : tokens.gutter,
    }}>
    <Box
      component="nav"
      aria-label="Senäni saýlaň"
      sx={{
        flex: 1, minWidth: 0,
        display: 'flex', gap: '7px', overflowX: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        scrollBehavior: 'smooth',
        /* The strip is wider than the screen and there was nothing to say so —
           a scrollbar it never shows, and cells that happen to end at the
           edge. Fading the last one to white is the standard way to say "this
           continues", and it costs no height. */
        maskImage: 'linear-gradient(90deg,#000 calc(100% - 26px),transparent)',
        WebkitMaskImage: 'linear-gradient(90deg,#000 calc(100% - 26px),transparent)',
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
            aria-label={`${d.d} ${d.full}${today ? ', şu gün' : ''}${d.checked ? ', barlanan' : ''}`}
            data-datecell={active ? 'active' : undefined}
            sx={{
              position: 'relative', flex: '0 0 54px', height: 70,
              borderRadius: `${tokens.rCell}px`,
              bgcolor: active ? tokens.blueSolid : tokens.surface,
              color: active ? '#fff' : d.disabled ? tokens.inkDisabled : tokens.ink,
              boxShadow: today && !active ? `inset 0 0 0 1.5px ${tokens.blue}` : 'none',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background .18s ease,color .18s ease',
            }}
          >
            <Box sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1 }}>{d.d}</Box>
            <Box sx={{ fontSize: 14, lineHeight: 1 }}>{d.w}</Box>
            {/* one marker, one meaning: this day has been checked */}
            {d.checked && (
              <Box aria-hidden sx={{
                position: 'absolute', top: 6, right: 6, width: 7, height: 7,
                borderRadius: '50%', bgcolor: active ? '#fff' : tokens.dot,
                opacity: active ? .9 : 1,
              }} />
            )}
          </ButtonBase>
        );
      })}
    </Box>

      {onPick && (
        <ButtonBase
          onClick={onPick}
          aria-label="Senäni saýla"
          sx={{
            flex: 'none', width: 46, height: 70, mr: '4px',
            borderRadius: `${tokens.rCell}px`,
            bgcolor: tokens.surface, color: tokens.ink2,
            display: 'grid', placeItems: 'center',
            '&:active': { bgcolor: tokens.surfacePress },
          }}
        >
          <CalendarIcon size={21} />
        </ButtonBase>
      )}
    </Box>
  );
}

/* ---------------- SurfaceRow (quick rows, list rows) ---------------- */
export function SurfaceRow({ icon, label, labelSx, labelEnd, sub, end, onClick }: {
  icon?: ReactNode; label: ReactNode; labelSx?: object;
  /* A badge that belongs *to the label* rather than to the row: a plan on a
     child, a status on a subscription. It sits beside the title, where the
     label truncates first and the badge keeps its width — the opposite of
     `end`, which is the row's own trailing control. */
  labelEnd?: ReactNode;
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
        {labelEnd ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={labelSx}>{label}</Typography>
            {labelEnd}
          </Box>
        ) : (
          <Typography variant="subtitle1" noWrap sx={labelSx}>{label}</Typography>
        )}
        {/* One line, like the label above it: a row's second line is a value,
            not a paragraph. Wrapping it made rows grow to two and three lines
            beside a trailing figure and read as a collision. */}
        {sub && (
          <Typography noWrap sx={{ fontSize: 12, color: tokens.inkMuted, mt: '2px' }}>{sub}</Typography>
        )}
      </Box>
      {end}
    </ButtonBase>
  );
}

/*
 * Choosing a subject — the one shape for it.
 *
 * Subjects were picked three different ways: a row with a progress bar under
 * Sapaklar, a horizontally scrolled tinted card under Testler, and a deck row
 * under Kartlar. Three pickers for one decision, and the carousel clipped its
 * last subject besides. This is that decision, once: the subject's own colour
 * in the badge, what the bank holds for it on the second line, and progress
 * only where progress is real.
 */
export function SubjectRow({
  icon, tint, accent, label, sub, progress, locked, lockNote, onClick,
}: {
  icon: ReactNode; tint: string; accent: string; label: string; sub: string;
  progress?: { done: number; total: number };
  locked?: boolean; lockNote?: string; onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={locked
        ? `${label}, ${lockNote}`
        : `${label}, ${sub}${progress ? `, ${progress.done}/${progress.total} sapak tamamlandy` : ''}`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px 13px',
        transition: 'background .15s ease', '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <IconBadge
        bg={locked ? tokens.lockTile : tint}
        color={locked ? tokens.lockInk : accent}
      >{locked ? <LockIcon size={22} /> : icon}</IconBadge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.2px' }} noWrap>{label}</Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '3px' }} noWrap>
          {locked ? lockNote : sub}
        </Typography>
        {/* progress belongs to subjects that have a path to walk, and only
            when it is not behind a lock */}
        {!locked && progress && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '8px' }}>
            <Box sx={{
              flex: 1, height: 6, borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.dividerSoft, overflow: 'hidden',
            }}>
              <Box sx={{
                width: `${Math.round((progress.done / progress.total) * 100)}%`, height: '100%',
                borderRadius: `${tokens.rPill}px`, bgcolor: accent,
              }} />
            </Box>
            <Typography sx={{
              fontSize: 12, fontWeight: 600, color: tokens.ink3, flex: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}>{progress.done}/{progress.total}</Typography>
          </Box>
        )}
      </Box>
      <RowChevron />
    </ButtonBase>
  );
}

/*
 * The same decision, in a grid.
 *
 * Where a section holds twenty subjects and nothing to say about any of them
 * beyond its size, a full-width row spends a whole line on a name and 200px of
 * whitespace, and twenty of them are two screens of scrolling before the first
 * shelf ends. The tile is the row folded in half: the same subject colour in
 * the badge, the same second line — a *value*, never a sentence explaining that
 * this is a subject — and the same lock. It carries no progress bar: a
 * two-column tile is too narrow to read one, which is exactly why the sections
 * that *have* progress keep the row.
 */
export function SubjectTile({ icon, tint, accent, label, sub, locked, onClick }: {
  icon: ReactNode; tint: string; accent: string; label: string; sub: string;
  locked?: boolean; onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${label}, ${sub}${locked ? ', ýapyk' : ''}`}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        width: '100%', height: '100%', minHeight: 140,
        bgcolor: locked ? tokens.lockTile : tint, borderRadius: `${tokens.rCard}px`,
        p: '15px 15px 16px', textAlign: 'left',
        transition: 'filter .15s ease', '&:active': { filter: 'brightness(.96)' },
      }}
    >
      <IconBadge
        bg="#fff"
        color={locked ? tokens.lockInk : accent}
        size={44}
      >{locked ? <LockIcon size={20} /> : icon}</IconBadge>
      {/* the name sits at the bottom of the tile, so two tiles side by side
          align on their labels however long the names are */}
      <Box sx={{ mt: 'auto', pt: '16px', width: '100%', minWidth: 0 }}>
        <Typography sx={{
          fontSize: 16, fontWeight: 700, letterSpacing: '-.2px', lineHeight: 1.25,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{label}</Typography>
        {/* A locked tile keeps its count rather than swapping in "opens with
            Zehin": the badge and the grey already say it is locked, twenty
            tiles saying it in words is one sentence printed twenty times, and
            the size of what is behind the lock is the reason to open it. */}
        <Typography sx={{
          fontSize: 12.5, color: locked ? tokens.inkMuted : tokens.ink3, mt: '4px',
        }} noWrap>{sub}</Typography>
      </Box>
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
    minWidth: 23, height: 20, px: '7px', borderRadius: `${tokens.rPill}px`,
    bgcolor: tone === 'alert' ? tokens.redText : tokens.surfacePress,
    color: tone === 'alert' ? '#fff' : tokens.ink2,
    fontSize: 13, fontWeight: 600, lineHeight: '20px', textAlign: 'center',
  }}>{n}</Box>
);

/* ---------------- LessonCard ----------------
   The card is a Box holding two controls rather than one big button, because
   the homework chip is now a control of its own: ticking homework off is the
   thing a student does most on this screen, and it used to cost opening a
   sheet and finding a button. A button inside a button is not valid, so the
   card surface carries the press states and the two live side by side. */
export function LessonCard({ lesson, marks, onOpen, onToggleHw }: {
  /* `marks` is the teacher-badge signal. It sits in the meta row, in the slot
     the classmate count used to hold — one quiet mark before the grade, rather
     than a labelled chip strip that turned every card into two stacked cards. */
  lesson: Lesson; marks?: ReactNode; onOpen: (l: Lesson) => void;
  onToggleHw?: (l: Lesson) => void;
}) {
  const [start, end] = lesson.time.split('–').map((t) => t.trim());
  const done = lesson.hwDone;
  return (
    <Box sx={{
      bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
      p: `13px ${tokens.padCard}`,
    }}>
      <ButtonBase
        onClick={() => onOpen(lesson)}
        aria-haspopup="dialog"
        aria-label={`${lesson.subject}, ${lesson.time}`
          + (lesson.grade ? `, baha ${lesson.grade}` : '')}
        sx={{
          display: 'flex', alignItems: 'flex-start', gap: '13px',
          textAlign: 'left', borderRadius: `${tokens.rTile}px`,
          width: 'calc(100% + 8px)', m: '-4px', p: '4px',
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
              {/* A row ends with what the teacher recorded: a badge, then the
                  mark. It used to also carry a red disc counting unread notes —
                  a red circle with a digit in it, one slot from the mark, which
                  every reader tried to read as a mark. The count still exists
                  and has a better home: the day's "Bellik" tile, where it is
                  labelled and opens the notes themselves. */}
              {marks}
              <GradeSlot grade={lesson.grade} />
            </Box>
          </Box>

          {/* The topic, not the word "Tema". A label that is identical on every
              card looks like data and carries none. */}
          {lesson.tema && (
            <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px', lineHeight: 1.4 }} noWrap>
              {lesson.tema}
            </Typography>
          )}
        </Box>
      </ButtonBase>

      {/* The homework, and its state.
          Done homework used to replace the assignment with the words "Öý işi
          taýýar" — which throws away the one thing the row is for and makes
          the two states look like two different rows. The text never changes;
          the tick and the colour carry the state, and the chip is the switch. */}
      {lesson.hw && (
        <Box sx={{ display: 'flex', pl: '55px', mt: '9px' }}>
          <ButtonBase
            onClick={() => onToggleHw?.(lesson)}
            disabled={!onToggleHw}
            role="switch"
            aria-checked={done}
            aria-label={`Öý işi: ${lesson.hw}`}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              px: '9px', minHeight: 30, borderRadius: `${tokens.rPill}px`,
              maxWidth: '100%', textAlign: 'left',
              bgcolor: done ? tokens.greenTint : tokens.orangeTint,
              color: done ? tokens.greenText : tokens.orangeText,
              transition: 'background .15s ease,color .15s ease',
              '&:active': { filter: 'brightness(.96)' },
            }}
          >
            <Box aria-hidden sx={{
              display: 'grid', placeItems: 'center', flex: 'none',
              width: 17, height: 17, borderRadius: '50%',
              bgcolor: done ? tokens.greenDeep : 'transparent',
              border: done ? 'none' : `1.5px solid ${tokens.orangeText}`,
              color: '#fff', opacity: done ? 1 : .55,
            }}>{done && <CheckIcon size={11} />}</Box>
            <Typography sx={{
              fontSize: 12.5, fontWeight: 600, minWidth: 0,
              textDecoration: done ? 'line-through' : 'none',
              opacity: done ? .75 : 1,
            }} noWrap>{lesson.hw}</Typography>
          </ButtonBase>
        </Box>
      )}
    </Box>
  );
}

/* ---------------- TodoRow / TodoList ----------------
 *
 * Homework, as the thing it actually is: a list of tasks you tick off.
 *
 * It used to be read-only prose in two places — a paragraph under "Öý işi" in
 * the day sheet and another in the lesson sheet — with the ticking done by a
 * separate button at the bottom of the sheet. Three shapes for one job, and
 * the only place a pupil could see all of the day's tasks at once showed them
 * as sections of a document rather than as a list they could work through.
 *
 * So there is one row: a box you can tap, the task, and what it belongs to. It
 * is the same row in the day's list and on the lesson's own page, because a
 * task is the same task wherever it is read — and it **unticks**, since a
 * checkbox that only goes one way is a trap you learn not to touch.
 *
 * `role="checkbox"` and not a switch: this is one item in a list of items,
 * which is what a checkbox is for, and screen readers announce the list's
 * progress from it.
 */
export function TodoRow({ label, sub, done, onToggle, end, strike = true }: {
  label: string; sub?: string; done: boolean; onToggle?: () => void; end?: ReactNode;
  /* A task that is done gets struck through; a *person* who is done does not —
     the same row lists classmates, and crossing out someone's name says
     something about them rather than about their homework. */
  strike?: boolean;
}) {
  return (
    <ButtonBase
      onClick={onToggle}
      disabled={!onToggle}
      role="checkbox"
      aria-checked={done}
      aria-label={sub ? `${label} — ${sub}` : label}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%',
        minHeight: 52, px: '4px', py: '11px', textAlign: 'left', justifyContent: 'flex-start',
        borderRadius: `${tokens.rTile}px`,
        '&:active': { bgcolor: tokens.surfacePress },
        '&.Mui-disabled': { opacity: 1 },
      }}
    >
      {/* The box, at the size a thumb expects and the colour the app gives
          every other completed thing. */}
      <Box aria-hidden sx={{
        width: 22, height: 22, borderRadius: `${tokens.rCell}px`, flex: 'none', mt: '1px',
        display: 'grid', placeItems: 'center', color: '#fff',
        bgcolor: done ? tokens.greenDeep : 'transparent',
        border: done ? 'none' : `1.8px solid ${tokens.inkDisabled}`,
        transition: 'background .15s ease, border-color .15s ease',
      }}>{done && <CheckIcon size={13} />}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 15, fontWeight: 500, lineHeight: 1.4,
          color: done && strike ? tokens.inkMuted : tokens.ink,
          textDecoration: done && strike ? 'line-through' : 'none',
        }}>{label}</Typography>
        {sub && (
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '2px' }} noWrap>{sub}</Typography>
        )}
      </Box>
      {end && <Box sx={{ flex: 'none', mt: '2px' }}>{end}</Box>}
    </ButtonBase>
  );
}

/* The list the rows sit in: one surface, hairlines between tasks, and the
   count at the top — a to-do list's own progress, stated once. */
export function TodoList({ done, total, children }: {
  done?: number; total?: number; children: ReactNode;
}) {
  const rows = Children.toArray(children);
  const all = total !== undefined && done === total && total > 0;
  return (
    <Box>
      {total !== undefined && done !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '10px', px: '4px' }}>
          <Box sx={{
            flex: 1, height: 6, borderRadius: `${tokens.rPill}px`,
            bgcolor: tokens.dividerSoft, overflow: 'hidden',
          }}>
            <Box sx={{
              height: '100%', borderRadius: `${tokens.rPill}px`,
              width: `${total ? (done / total) * 100 : 0}%`,
              bgcolor: all ? tokens.greenDeep : tokens.blue,
              transition: 'width .2s ease',
            }} />
          </Box>
          <Typography sx={{
            fontSize: 12.5, fontWeight: 600, flex: 'none',
            color: all ? tokens.greenText : tokens.ink3, fontVariantNumeric: 'tabular-nums',
          }}>{done}/{total}</Typography>
        </Box>
      )}
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, px: '11px', py: '2px' }}>
        {rows.map((row, i) => (
          <Box key={i}>
            {i > 0 && <Box aria-hidden sx={{ height: '1px', bgcolor: tokens.dividerSoft, ml: '34px' }} />}
            {row}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ---------------- SnapSlides ----------------
 *
 * A row of full-width panels the thumb flicks through, with the dots under it.
 *
 * Three screens had grown their own copy of this — onboarding, the premium
 * page's promises, and now a banner's description — and each copy scrolled a
 * different way. The dots are also buttons here, because a dot that shows
 * where you are and refuses to take you there is a control pretending to be a
 * decoration.
 *
 * The track scrolls itself by `scrollLeft` on its own ref. `scrollIntoView`
 * would drag every scroller between the panel and the document, and one of
 * those is the four-pane swipe strip the whole app lives in.
 */
export function SnapSlides({ children, labels, sx, onChange, footer }: {
  children: ReactNode;
  labels?: string[];
  sx?: SxProps<Theme>;
  onChange?: (at: number) => void;
  /** anything below the dots that needs to move the track — a "next" button */
  footer?: (ctx: { at: number; last: boolean; go: (i: number) => void }) => ReactNode;
}) {
  const track = useRef<HTMLDivElement | null>(null);
  const [at, setAt] = useState(0);
  const slides = Children.toArray(children);
  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box
        ref={track}
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth));
          if (i === at) return;
          setAt(i);
          onChange?.(i);
        }}
        sx={{
          flex: 1, minHeight: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {slides.map((slide, i) => (
          <Box key={i} sx={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start', display: 'flex' }}>
            <Box sx={{ width: '100%', minWidth: 0 }}>{slide}</Box>
          </Box>
        ))}
      </Box>
      {slides.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '7px', py: '12px' }}>
          {slides.map((_, i) => (
            <ButtonBase
              key={i}
              onClick={() => go(i)}
              aria-label={labels?.[i] ?? `${i + 1}-nji sahypa`}
              aria-current={i === at}
              sx={{ width: 22, height: 22, borderRadius: '50%' }}
            >
              <Box aria-hidden sx={{
                width: i === at ? 9 : 7, height: i === at ? 9 : 7, borderRadius: '50%',
                bgcolor: i === at ? tokens.blue : tokens.inkDisabled,
                transition: 'width .15s ease, height .15s ease, background .15s ease',
              }} />
            </ButtonBase>
          ))}
        </Box>
      )}
      {footer?.({ at, last: at === slides.length - 1, go })}
    </Box>
  );
}

/* ---------------- VariantSheet ----------------
 *
 * "Show me this page another way."
 *
 * Two places now hold several designs of one screen — the payment pages and
 * Ýyldyzlar — because the right answer is a question for the numbers rather
 * than for taste. They use the same control: a ✦ in the header, and this
 * sheet, which lists every version with what it is betting on and marks the
 * one you are looking at. A chooser that hid the current page would make the
 * reader count rows to work out where they are.
 */
export type Variant<T extends string> = { id: T; name: string; note: string };

export function VariantSheet<T extends string>({ open, title, lede, variants, current, onClose, onPick }: {
  open: boolean; title: string; lede: string;
  variants: Variant<T>[]; current: T;
  onClose: () => void; onPick: (id: T) => void;
}) {
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">{title}</Typography>
      <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5, mt: '8px', mb: '14px' }}>
        {lede}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {variants.map((v) => (
          <SurfaceRow
            key={v.id}
            label={v.name}
            sub={v.note}
            end={v.id === current
              ? (
                <Box sx={{
                  px: '9px', height: 22, borderRadius: `${tokens.rPill}px`, flex: 'none',
                  bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 11, fontWeight: 700,
                  display: 'grid', placeItems: 'center',
                }}>Açyk</Box>
              )
              : <RowChevron />}
            onClick={() => { onClose(); onPick(v.id); }}
          />
        ))}
      </Box>
    </SheetDrawer>
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
        width: 139, height: 5, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.ink,
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
        <Box sx={{ width: 38, height: 5, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.divider }} />
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
          borderRadius: `${tokens.rCell}px`, bgcolor: tokens.redText, color: '#fff',
          fontSize: 11, fontWeight: 700, lineHeight: '18px', textAlign: 'center',
          border: '2px solid #fff', boxSizing: 'content-box',
        }}>{count > 99 ? '99+' : count}</Box>
      )}
    </ButtonBase>
  );
}

/*
 * How the list is drawn — a header control, not a setting.
 *
 * It was first built as a two-glyph segmented switch, which is the clearer
 * control in the abstract: both views stay on screen and the lit one says where
 * you are. It does not fit. A 375px capsule header holds a 44px back button, a
 * centred title and about 96px of controls before the title starts being
 * clipped, and a switch (85) beside the "?" (44) is 135. Given the choice
 * between a control that reads perfectly and a page title that reads at all,
 * the title wins.
 *
 * So it is the app's one 44px header button, and it carries the view you would
 * get, not the one you are in — which is why it is never drawn `pressed`: a lit
 * button would claim to be a state, and this is an action. The label says the
 * action in words, and the list redrawing under it is the confirmation.
 */
export function ViewToggle({ value, onChange }: {
  value: ViewId; onChange: (v: ViewId) => void;
}) {
  const next: ViewId = value === 'list' ? 'grid' : 'list';
  return (
    <HeaderIconButton
      label={next === 'grid' ? 'Kart görnüşine geçir' : 'Sanaw görnüşine geçir'}
      onClick={() => onChange(next)}
    >
      {next === 'grid' ? <GridIcon size={20} /> : <ListIcon size={20} />}
    </HeaderIconButton>
  );
}

/* The one "?" in the app. It was two: a 40px circle in SubPage's header and a
   bare 44px glyph on the diary's signature panel — the same affordance drawn
   two ways, so neither read as a control the reader had met before. It is a
   HeaderIconButton like every other icon button, and nothing else. */
export const HelpButton = ({ onClick, label = 'Bu sahypa barada' }: {
  onClick: () => void; label?: string;
}) => (
  <HeaderIconButton label={label} onClick={onClick}>
    <QuestionOutlineIcon size={20} />
  </HeaderIconButton>
);

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
/*
 * A row of filter chips.
 *
 * The lesson path filters by activity, the subject list filters by grade, and
 * both are the same control: one row, scrolled sideways, one chip lit. A chip
 * may carry its own colour — the path's do, because an activity's colour means
 * something everywhere else on that page — and otherwise wears the brand's.
 */
export type Chip = { id: string; label: string; icon?: ReactNode; accent?: string; tint?: string };

export function ChipRow({ chips, value, onChange, label }: {
  chips: Chip[]; value: string; onChange: (id: string) => void; label: string;
}) {
  const active = useRef<HTMLButtonElement | null>(null);
  const row = useRef<HTMLDivElement | null>(null);
  const settled = useRef(false);

  /*
   * Twelve grades do not fit on a phone, and the one you are in is the eighth:
   * the lit chip is brought into view rather than left off the right edge for
   * the reader to discover by scrolling.
   *
   * This row scrolls itself, by hand. `scrollIntoView` was the obvious way to
   * write it and the wrong one: it scrolls *every* scroller between the chip
   * and the document, and one of those is the four-panel swipe strip the whole
   * app lives in — so tapping "12-nji synp" slid the app sideways and parked it
   * between two tabs. Setting this row's own `scrollLeft` touches nothing else.
   */
  useEffect(() => {
    const el = active.current;
    const box = row.current;
    if (!el || !box) return;
    const chip = el.getBoundingClientRect();
    const frame = box.getBoundingClientRect();
    const left = box.scrollLeft + (chip.left - frame.left) - (frame.width - chip.width) / 2;
    /* the first pass is the row arriving already scrolled; a later one is the
       reader's own tap, which is worth animating */
    box.scrollTo({ left, behavior: settled.current ? 'smooth' : 'auto' });
    settled.current = true;
  }, [value]);

  return (
    <Box ref={row} role="group" aria-label={label} sx={{
      display: 'flex', gap: '8px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter,
      scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      /* the last chip fades rather than being cut, so the row reads as scrollable */
      maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
    }}>
      {chips.map((c) => {
        const on = c.id === value;
        const ink = c.accent ?? tokens.ink2;
        return (
          <ButtonBase
            key={c.id}
            ref={on ? active : undefined}
            onClick={() => onChange(c.id)}
            aria-pressed={on}
            sx={{
              height: 32, px: c.icon ? '12px' : '14px', borderRadius: `${tokens.rPill}px`, flex: 'none',
              display: 'inline-flex', gap: '6px', fontSize: 13.5, fontWeight: 600,
              transition: 'background .15s ease,color .15s ease',
              bgcolor: on ? (c.accent ?? tokens.blueSolid) : (c.tint ?? tokens.surface),
              color: on ? '#fff' : ink,
            }}
          >
            {c.icon}{c.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

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
              bgcolor: tokens.blueSolid, color: '#fff', fontSize: 11, fontWeight: 700,
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

/* ---------------- Avatar ----------------
 *
 * One student, drawn the same way everywhere — and one place that knows what a
 * *subscriber's* avatar looks like.
 *
 * The profile, Çagam and Testler each drew their own circle before this, which
 * is how the same person ended up with three different faces (a soft blue
 * disc, a gradient disc, a disc inside a 5px blue ring). They are the same
 * object at three sizes.
 *
 * The premium ring is the one thing the app shows a paying account that costs
 * it nothing to show: the subscription gradient, drawn as a ring with a gap of
 * the page's own colour so the ring reads as *around* the avatar rather than as
 * a thick coloured border on it. The gap has to be told what it is sitting on
 * (`gap`) — a ring gap the colour of the wrong ground is a grey halo.
 *
 * It is presentation, not entitlement: pass `premium` from `usePrefs()`, so the
 * ring appears and disappears with the subscription rather than being drawn by
 * whoever remembered.
 */
export function Avatar({ initials, size = 56, fill = 'soft', premium, gap = '#fff', sx }: {
  initials: string;
  size?: number;
  /** `soft` is the tinted disc, `gradient` the brand-blue one the profile uses */
  fill?: 'soft' | 'gradient';
  premium?: boolean;
  /** the colour behind the ring, so its gap disappears into the page */
  gap?: string;
  sx?: SxProps<Theme>;
}) {
  /* the ring and its gap eat into the box, so the face keeps its size */
  const band = size >= 90 ? 4 : 3;
  const face = (
    <Box aria-hidden sx={{
      width: '100%', height: '100%', borderRadius: '50%',
      display: 'grid', placeItems: 'center',
      /* The initials have to fit the disc they sit in. A flat 20px was fine on
         a 56px face and 3px wider than the 30px one in the child pill, where
         two capitals spilled over the circle's edge. Discrete steps, so the
         type stays on the scale. */
      fontSize: size >= 90 ? 30 : size >= 60 ? 22 : size >= 48 ? 20 : size >= 36 ? 15 : 13,
      fontWeight: 700, letterSpacing: '-.3px',
      ...(fill === 'gradient'
        ? { background: `linear-gradient(150deg, ${tokens.blue} 0%, ${tokens.bluePress} 70%)`, color: '#fff' }
        : { bgcolor: tokens.blueSoft, color: tokens.blueText }),
    }}>{initials}</Box>
  );

  if (!premium) {
    return <Box sx={{ width: size, height: size, flex: 'none', ...sx }}>{face}</Box>;
  }
  return (
    <Box sx={{
      width: size, height: size, flex: 'none', borderRadius: '50%', p: `${band}px`,
      background: PREMIUM_GRADIENT, ...sx,
    }}>
      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', p: `${band - 1}px`, bgcolor: gap }}>
        {face}
      </Box>
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
        /* A page's own control and its "?" are not alternatives — a page that
           has something to switch still has something to explain — so when both
           are given they share the slot, the "?" last and nearest the edge
           where every other page keeps it. */
        action={action || help ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {action}
            {help && <HelpButton onClick={() => setHelpOpen(true)} />}
          </Box>
        ) : undefined}
      />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      {help && (
        <SheetDrawer open={helpOpen} onClose={() => setHelpOpen(false)}>
          <Typography variant="h2">{title}</Typography>
          <Typography sx={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.55, mt: '10px' }}>
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

/* ---------------- MeterTile ----------------
   A StatTile for a figure that has a known maximum. Three bare numbers make
   the reader supply the scale — is 92 good? out of what? — and a 4.6 next to a
   96% next to a 1251 share nothing but a font size. A meter answers "out of
   what" in 3px of height, and three of them read as one instrument panel. */
export const MeterTile = ({ value, label, pct, color }: {
  value: string; label: string; pct: number; color: string;
}) => (
  <Box
    role="img"
    aria-label={`${label}: ${value}`}
    sx={{
      bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '13px 11px 12px',
      display: 'flex', flexDirection: 'column', gap: '7px',
    }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{
        fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', color,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
      }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: tokens.inkMuted, mt: '1px' }} noWrap>{label}</Typography>
    </Box>
    <Box aria-hidden sx={{
      height: 4, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.surfacePress, overflow: 'hidden',
    }}>
      <Box sx={{
        height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`,
        borderRadius: `${tokens.rPill}px`, bgcolor: color,
      }} />
    </Box>
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

/* ---------------- MonthCalendar ----------------
   The date picker used to be the same six days the strip already showed,
   listed vertically — which is not a picker, it is the strip again. A calendar
   is the one control everybody already knows how to read, and it is the only
   way to reach a date that is not in this week. Sundays are drawn as days off
   rather than hidden, because a month with holes in it is harder to count
   across than one with quiet cells. */
export function MonthCalendar({ month, selected, marked, onSelect }: {
  month: string;
  selected: string;
  marked?: (iso: string) => boolean;
  onSelect: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(month);
  const lead = firstWeekdayIndex(cursor);
  const total = daysInMonth(cursor);

  const Nav = ({ by, label }: { by: number; label: string }) => (
    <ButtonBase
      onClick={() => setCursor(shiftMonth(cursor, by))}
      aria-label={label}
      sx={{
        width: 36, height: 36, borderRadius: '50%', flex: 'none', color: tokens.ink2,
        display: 'grid', placeItems: 'center',
        '&:active': { bgcolor: tokens.surfacePress },
        transform: by < 0 ? 'rotate(180deg)' : 'none',
      }}
    ><NavChevronIcon /></ButtonBase>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '10px' }}>
        <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{monthLabel(cursor)}</Typography>
        <Nav by={-1} label="Öňki aý" />
        <Nav by={1} label="Indiki aý" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {WEEKDAY_HEADS.map((w) => (
          <Typography key={w} aria-hidden sx={{
            fontSize: 11, fontWeight: 600, color: tokens.inkMuted, textAlign: 'center', pb: '2px',
          }}>{w}</Typography>
        ))}
        {Array.from({ length: lead }, (_, i) => <Box key={`lead${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const iso = dayInMonth(cursor, i + 1);
          const active = iso === selected;
          const today = isToday(iso);
          const off = isDayOff(iso);
          return (
            <ButtonBase
              key={iso}
              onClick={() => onSelect(iso)}
              aria-pressed={active}
              aria-label={`${i + 1} ${weekdayLong(iso)}${today ? ', şu gün' : ''}`}
              sx={{
                position: 'relative', aspectRatio: '1', borderRadius: `${tokens.rCell}px`,
                fontSize: 15, fontWeight: active || today ? 700 : 500,
                bgcolor: active ? tokens.blueSolid : 'transparent',
                color: active ? '#fff' : off ? tokens.inkDisabled : tokens.ink,
                boxShadow: today && !active ? `inset 0 0 0 1.5px ${tokens.blue}` : 'none',
                '&:active': { bgcolor: active ? tokens.blueSolid : tokens.surfacePress },
              }}
            >
              {i + 1}
              {marked?.(iso) && (
                <Box aria-hidden sx={{
                  position: 'absolute', bottom: 5, left: '50%', ml: '-2.5px',
                  width: 5, height: 5, borderRadius: '50%',
                  bgcolor: active ? '#fff' : tokens.dot,
                }} />
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
