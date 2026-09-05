import {
  Box, Button, ButtonBase, CircularProgress, Skeleton, Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DateStrip, GradeBadge, HeaderIconButton, HelpButton, LessonCard, MonthCalendar,
  SheetDrawer, SheetSection, TodoList, TodoRow,
} from '../components/Ui';
import {
  BellIcon, CalendarIcon, CheckIcon, ClockIcon, HwIcon, LockIcon,
  NotesIcon, ShareIcon, TemaIcon, TrophyIcon,
} from '../components/Icons';
import { TeaserCard } from '../components/Paywall';
import { BadgeChip, BadgeScore, BadgeStatsScreen } from './BadgeScreens';
import { InboxScreen } from './InboxScreens';
import { UpgradeScreen } from './UpgradeScreen';
import { TONE, awardsForLesson, badgeType, toneOf } from '../data/badges';
import type { Award } from '../data/badges';
import { fmtDate } from '../lib/date';
import { inboxUnread } from '../data/inbox';
import { useSchedule } from '../hooks/useSchedule';
import { tierFor, useCan } from '../state/prefs';
import { ShareSheet } from './ShareScreens';
import { ClassHwRow, ClassHwSheet } from './ClassScreens';
import { BannerSlot } from './BannerScreens';
import { ChildBar } from './ChildScreens';
import { useChild } from '../state/children';
import { EARN_POINTS, award, useEarns } from '../state/earn';
import { tokens } from '../theme';
import type { Lesson } from '../types';

type SheetState =
  | { type: 'lesson'; lesson: Lesson }
  | { type: 'notes' }
  | { type: 'hw' }
  | { type: 'class'; focus?: string }
  | { type: 'picker' }
  | { type: 'help' }
  | null;

/* What a note says. The free tier never reaches these — it sees who wrote,
   not what they wrote — so they exist only behind `canNotes`. */
const NOTE_TEXTS = [
  'Okuwçynyň işjeňligi gowulandy, sapaga taýýarlykly geldi.',
  'Öý işini wagtynda we doly ýerine ýetirdi.',
  'Sapakda has ünsli bolmagy maslahat berilýär.',
];

type Page = 'diary' | 'inbox' | 'badges' | 'upgrade';

/* One third of the day-summary card: the figure is the headline, the word under
   it is the caption. No icon badge — three of them side by side turned a
   summary into a toolbar. */
function SummaryCell({ value, label, color, last, onClick }: {
  value: ReactNode; label: string; color?: string; last?: boolean; onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      sx={{
        flex: 1, minWidth: 0, minHeight: 68, px: '6px',
        display: 'flex', flexDirection: 'column', gap: '3px',
        borderRight: last ? 0 : `1px solid ${tokens.dividerSoft}`,
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <Box sx={{
        fontSize: 20, fontWeight: 700, letterSpacing: '-.2px', color: color ?? tokens.ink,
        fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', minHeight: 24,
      }}>{value}</Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{label}</Typography>
    </ButtonBase>
  );
}

/*
 * A badge, for an account that has not paid for badges.
 *
 * The emoji, the date and the teacher's name stay — that a star happened, when,
 * and from whom are facts about the reader's own day. What the teacher *wrote*
 * is the value, and it stays behind a blur rather than a grey placeholder: the
 * point is that there is a sentence there, unread. Same line the star history
 * draws — how much there is is free, what it says is paid.
 */
function LockedAward({ award, onUpgrade }: { award: Award; onUpgrade: () => void }) {
  const t = badgeType(award.typeId);
  const tone = TONE[toneOf(award)];
  const plan = tierFor('badges');
  return (
    <ButtonBase
      onClick={onUpgrade}
      aria-label={`Ýyldyz, ${fmtDate(award.date)}, ${award.teacher} — teswir ${plan?.name} bilen açylýar`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '11px', width: '100%', textAlign: 'left',
        p: '9px 11px', borderRadius: `${tokens.rRow}px`, bgcolor: tone.tint,
        '&:active': { filter: 'brightness(.97)' },
      }}
    >
      <Box aria-hidden sx={{
        width: 34, height: 34, borderRadius: '50%', flex: 'none', bgcolor: '#fff',
        display: 'grid', placeItems: 'center', fontSize: 17,
      }}>{t?.emoji}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: tone.ink }}>
          {award.teacher} · {fmtDate(award.date)}
        </Typography>
        {/* the teacher's words, present but unreadable */}
        <Box aria-hidden sx={{ display: 'flex', flexDirection: 'column', gap: '4px', mt: '6px' }}>
          <Box sx={{ height: 8, width: '78%', borderRadius: `${tokens.rPill}px`, bgcolor: '#fff', opacity: .9 }} />
          <Box sx={{ height: 8, width: '52%', borderRadius: `${tokens.rPill}px`, bgcolor: '#fff', opacity: .6 }} />
        </Box>
      </Box>

      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 'none',
        px: '9px', height: 24, borderRadius: `${tokens.rPill}px`,
        bgcolor: '#fff', color: tone.ink, fontSize: 12, fontWeight: 700,
      }}>
        <LockIcon size={12} />{plan?.name}
      </Box>
    </ButtonBase>
  );
}

/*
 * What a tick is worth, printed on the tick itself.
 *
 * Free accounts do not collect the bal — but they are shown the figure, in
 * grey, with the lock. A reward you can see and cannot take is the clearest
 * argument the paywall has; a reward the free tier never hears about does no
 * work at all. On a paying account it is the same pill in the app's coin
 * colours, and it goes green once the points are banked.
 */
function EarnPill({ kind, earns, done }: { kind: 'hw' | 'test'; earns: boolean; done: boolean }) {
  const n = EARN_POINTS[kind];
  const banked = earns && done;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px', height: 22, px: '8px',
      borderRadius: `${tokens.rPill}px`, fontSize: 11, fontWeight: 700,
      bgcolor: banked ? tokens.greenTint : earns ? tokens.orangeTint : tokens.surfacePress,
      color: banked ? tokens.greenText : earns ? tokens.orangeText : tokens.inkMuted,
    }}>
      {!earns && <LockIcon size={10} />}+{n} bal
    </Box>
  );
}

export function GundelikScreen({ toast }: { toast: (msg: string) => void }) {
  const s = useSchedule();
  /* the share card names whoever is selected */
  const { child } = useChild();
  const canBadges = useCan('badges');
  const canNotes = useCan('notes');
  /* whether ticks and tests actually credit bal on this account */
  const earns = useEarns();
  const [sheet, setSheet] = useState<SheetState>(null);
  const [page, setPage] = useState<Page>('diary');
  /* the share sheet: three forms, and nothing leaves until its own button */
  const [sharing, setSharing] = useState(false);
  const close = () => setSheet(null);
  /* the diary is the tab root, so every sub-page returns here */
  const home = () => setPage('diary');

  /* badges the day's lessons collected — the diary is where they are given.
     The date key is the ISO date, so it keys the award lookup directly. */
  const badgeTotals = useMemo(() => {
    const all = (s.day?.lessons ?? []).flatMap((l) => awardsForLesson(l.subject, s.dateKey));
    return {
      good: all.filter((a) => toneOf(a) === 'good').length,
      bad: all.filter((a) => toneOf(a) === 'bad').length,
    };
  }, [s.day, s.dateKey]);

  /* keep the selected date cell centred */
  useEffect(() => {
    document.querySelector('[data-datecell="active"]')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [s.dateKey]);

  /* One call for every tick in the app — the card's chip, the day's to-do list
     and the lesson's own row all land here, so the three can never disagree
     about what "done" means. It says what it did, because a control that
     changes colour under a thumb is easy to miss, and it goes both ways.
     Ticking pays, on a paying account: the toast is where the bal is announced,
     and it announces nothing when the work was already paid for. */
  const toggleHw = async (lesson: Lesson) => {
    const next = !lesson.hwDone;
    await s.setHwDone(lesson.id, next);
    if (!next) { toast('Belgi aýryldy'); return; }
    const points = earns ? award('hw', lesson.id) : 0;
    toast(points ? `Öý işi bellendi ✓ +${points} bal` : 'Öý işi bellendi ✓');
  };

  if (page === 'inbox') {
    return <InboxScreen onBack={home} toast={toast} onUpgrade={() => setPage('upgrade')} />;
  }
  if (page === 'badges') {
    return <BadgeStatsScreen onBack={home} onUpgrade={() => setPage('upgrade')} />;
  }
  if (page === 'upgrade') return <UpgradeScreen onBack={home} toast={toast} />;

  return (
    <>
      {/* Top bar */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 10,
        bgcolor: tokens.blurBg,
        backdropFilter: tokens.blur,
        boxShadow: tokens.shadowHeader,
        px: '12px', pl: '13.5px', pb: '10px',
        pt: 'calc(14px + env(safe-area-inset-top))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
      }}>
        <Typography variant="h1">Gündelik</Typography>
        {/* One action in the header now. Three icons in a row read as a
            toolbar, and only one of them was about the whole screen: the
            calendar belongs beside the dates it changes, and sharing the day
            is something you do after reading it, not before. */}
        <HeaderIconButton label="Habarlar we söhbetler" count={inboxUnread()} onClick={() => setPage('inbox')}>
          <BellIcon size={21} />
        </HeaderIconButton>
      </Box>

      {/* Whose diary this is, and the way to change it. Above the dates
          because it changes what the dates mean. */}
      <ChildBar />

      <DateStrip
        days={s.days}
        selected={s.dateKey}
        onSelect={s.selectDate}
        onPick={() => setSheet({ type: 'picker' })}
      />

      {/* Day summary — three figures, one card.
          These were three full-width rows with four coloured icon badges
          between them, ~190px of chrome above the schedule that is the actual
          point of the screen. The rows carried no information the number did
          not: each is a count with a destination, so the count *is* the row. */}
      <Box sx={{ px: tokens.gutter, pt: '14px' }}>
        <Box sx={{
          display: 'flex', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          overflow: 'hidden',
        }}>
          <SummaryCell
            value={`${s.day?.notes ?? 0}`}
            label="Bellik"
            color={tokens.ink}
            onClick={() => setSheet({ type: 'notes' })}
          />
          <SummaryCell
            value={badgeTotals.good + badgeTotals.bad === 0
              ? '—'
              : <BadgeScore good={badgeTotals.good} bad={badgeTotals.bad} plain />}
            label="Ýyldyz"
            onClick={() => setPage('badges')}
          />
          <SummaryCell
            value={`${s.hwStats.done}/${s.hwStats.total}`}
            label="Öý işi"
            color={tokens.blueText}
            last
            onClick={() => setSheet({ type: 'hw' })}
          />
        </Box>
      </Box>

      {/* Lessons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', px: tokens.gutter, pt: '12px' }} aria-live="polite">
        {s.loading &&
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={108} />)}
        {!s.loading && s.day?.lessons.length === 0 && (
          <Box sx={{
            bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
            p: '36px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}>
            <Box sx={{ color: tokens.inkDisabled, display: 'flex' }}><CalendarIcon size={28} /></Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Bu gün sapak ýok</Typography>
            <Typography variant="caption" sx={{ lineHeight: 1.45 }}>
              Dynç güni ýa-da rasporýaniýe entek girizilmedi.<br />Başga senäni saýlap görüň.
            </Typography>
          </Box>
        )}
        {!s.loading && s.day?.lessons.map((l) => {
          const awards = awardsForLesson(l.subject, s.dateKey);
          return (
            <LessonCard
              key={l.id}
              lesson={l}
              marks={awards.length > 0 ? (
                <BadgeScore
                  good={awards.filter((a) => toneOf(a) === 'good').length}
                  bad={awards.filter((a) => toneOf(a) === 'bad').length}
                />
              ) : undefined}
              onOpen={(lesson) => setSheet({ type: 'lesson', lesson })}
              onToggleHw={(lesson) => void toggleHw(lesson)}
            />
          );
        })}
      </Box>

      {/* A free account sees one paid banner here, under the lessons rather
          than over them — and the ✕ on it opens the only thing that removes
          it. The app's own Premium card stays on the pages where nobody is
          reading a task list. */}
      <Box sx={{ px: tokens.gutter, pt: '12px' }}>
        <BannerSlot placement="diary" onUpgrade={() => setPage('upgrade')} toast={toast} />
      </Box>

      {/* Parent signature.
          Barla is the parent saying "I have seen this day" — it is a
          signature, not a data refresh, so the panel is about the *selected*
          day rather than a global last-synced stamp, and signing leaves a mark
          the strip and the calendar both show. Once signed it stops asking:
          a button that stays lit after it has been pressed teaches the reader
          that pressing it did nothing. */}
      <Box sx={{
        m: `12px ${tokens.gutter} 0`, borderRadius: `${tokens.rCard}px`,
        bgcolor: s.signed ? tokens.greenTint : tokens.surface,
        minHeight: 77, pl: '16.5px', pr: '10px', py: '12px',
        display: 'flex', alignItems: 'center', gap: '12px',
        transition: 'background .2s ease',
      }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Typography sx={{
            fontSize: 15, fontWeight: 700,
            color: s.signed ? tokens.greenText : tokens.ink,
          }}>
            {s.signed ? 'Ene-ata gol çekdi' : 'Ene-ata gol çekmedi'}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.ink3 }}>
            {fmtDate(s.dateKey)} · {s.signed ? 'bu gün barlandy' : 'bu güni barlaň'}
          </Typography>
        </Box>
        {s.signed ? (
          <Box aria-hidden sx={{
            width: 45, height: 45, borderRadius: '50%', flex: 'none',
            bgcolor: '#fff', color: tokens.greenDeep, display: 'grid', placeItems: 'center',
          }}><CheckIcon size={22} /></Box>
        ) : (
          <Button
            variant="contained"
            disableElevation
            disabled={s.checking}
            onClick={() => void s.signDay().then(() => toast('Gol çekildi'))}
            sx={{ width: 72, height: 45, borderRadius: `${tokens.rTile}px`, minWidth: 0, flex: 'none' }}
          >
            {s.checking ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Barla'}
          </Button>
        )}
        <HelpButton label="Kömek" onClick={() => setSheet({ type: 'help' })} />
      </Box>

      {/* Sharing the day is the last thing you do with it, so it sits at the
          end of the day rather than in the header above it. */}
      <Box sx={{ px: tokens.gutter, pt: '12px' }}>
        <Button
          fullWidth
          disableElevation
          onClick={() => setSharing(true)}
          startIcon={<ShareIcon size={18} />}
          sx={{
            height: 46, bgcolor: tokens.surface, color: tokens.ink2, fontWeight: 600,
            '&:hover': { bgcolor: tokens.surfacePress },
            '&:active': { bgcolor: tokens.surfacePress },
          }}
        >
          Gündeligi paýlaş
        </Button>
      </Box>

      {/* ---------------- Sheets ---------------- */}
      <ShareSheet
        open={sharing}
        onClose={() => setSharing(false)}
        day={s.day}
        dateKey={s.dateKey}
        student={child.name}
        school={`${child.school} · ${child.cls}`}
        toast={toast}
      />

      <SheetDrawer open={sheet?.type === 'lesson'} onClose={close}>
        {sheet?.type === 'lesson' && (
          <>
            <Typography variant="h2">{sheet.lesson.subject}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', color: tokens.inkMuted, fontSize: 14, mt: '4px' }}>
              <ClockIcon />{sheet.lesson.time}&nbsp;·&nbsp;{sheet.lesson.teacher}
            </Box>
            <SheetSection title={<><TemaIcon />Tema</>}>
              <Typography variant="body2">{sheet.lesson.tema}</Typography>
            </SheetSection>
            {/* The same to-do row the day's list uses, so a task looks and
                behaves identically wherever it is met. It is also why the
                footer no longer carries a "Ýerine ýetirildi diý" button: one
                state, one control, and the control is the task itself. */}
            <SheetSection title={<><HwIcon />Öý işi</>}>
              {sheet.lesson.hw ? (
                <TodoList>
                  <TodoRow
                    label={sheet.lesson.hw}
                    sub={sheet.lesson.subject}
                    done={sheet.lesson.hwDone}
                    onToggle={() => void toggleHw(sheet.lesson)}
                    end={<EarnPill kind="hw" earns={earns} done={sheet.lesson.hwDone} />}
                  />
                </TodoList>
              ) : (
                <Typography variant="body2">Öý işi girizilmedi.</Typography>
              )}
              {sheet.lesson.hw && (
                <Box sx={{ mt: '10px' }}>
                  <ClassHwRow
                    lessons={[sheet.lesson]}
                    selfDone={sheet.lesson.hwDone ? 1 : 0}
                    onOpen={() => setSheet({ type: 'class', focus: sheet.lesson.id })}
                  />
                </Box>
              )}
            </SheetSection>
            {sheet.lesson.grade && (
              <SheetSection>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.ink2 }}>Baha</Typography>
                  <GradeBadge grade={sheet.lesson.grade} />
                </Box>
              </SheetSection>
            )}
            {/* what the teacher marked about behaviour, with their own words */}
            {awardsForLesson(sheet.lesson.subject, s.dateKey).length > 0 && (
              <SheetSection title={<><TrophyIcon size={15} />Mugallymyň ýyldyzlary</>}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {awardsForLesson(sheet.lesson.subject, s.dateKey).map((a) => (
                    canBadges ? (
                      <Box key={a.id}>
                        <BadgeChip typeId={a.typeId} />
                        <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '5px' }}>
                          {a.teacher} · {fmtDate(a.date)}
                        </Typography>
                        {a.comment && (
                          <Typography sx={{ fontSize: 13, color: tokens.ink2, mt: '6px', lineHeight: 1.45 }}>
                            “{a.comment}”
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <LockedAward key={a.id} award={a} onUpgrade={() => { close(); setPage('upgrade'); }} />
                    )
                  ))}
                </Box>
              </SheetSection>
            )}
            <Box sx={{ mt: '18px' }}>
              <Button fullWidth onClick={close} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
            </Box>
          </>
        )}
      </SheetDrawer>

      {/*
        * Teacher notes, and what a free account is shown of them.
        *
        * It used to hand the free tier the first note in full and lock the
        * rest. That gives away the one thing the plan is sold on and still
        * leaves the reader guessing how many they are missing. Now the free
        * tier sees the **register**: which teacher wrote, in which lesson, at
        * what time — every one of them, nothing hidden about the shape of the
        * day — and the words themselves are the paid part. You know exactly
        * what is there and exactly what is behind the wall, which is the only
        * honest way to run a paywall over someone else's writing about you.
        */}
      <SheetDrawer open={sheet?.type === 'notes'} onClose={close}>
        <Typography variant="h2">Mugallymdan bellikler</Typography>
        <Typography variant="caption">
          {canNotes
            ? `${s.day?.notes ?? 0} täze belligiňiz bar`
            : `${s.day?.notes ?? 0} mugallym bellik ýazdy — teksti ${tierFor('notes')?.name} bilen açylýar`}
        </Typography>
        {s.day && s.day.notes > 0
          ? (
            <>
              {canNotes
                ? s.day.lessons.slice(0, 3).map((l, i) => (
                  <SheetSection key={l.id} title={<>{l.subject} · {l.teacher}</>}>
                    <Typography variant="body2">{NOTE_TEXTS[i % NOTE_TEXTS.length]}</Typography>
                  </SheetSection>
                ))
                : (
                  <Box sx={{ mt: '14px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, px: '13px' }}>
                    {s.day.lessons.slice(0, s.day.notes).map((l, i) => (
                      <Box key={l.id} sx={{
                        display: 'flex', alignItems: 'center', gap: '12px', minHeight: 56,
                        borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none',
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{l.teacher}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }} noWrap>
                            {l.subject} · {l.time}
                          </Typography>
                        </Box>
                        <Box aria-label="ýapyk" sx={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 'none',
                          height: 24, px: '9px', borderRadius: `${tokens.rPill}px`,
                          bgcolor: tokens.surfacePress, color: tokens.inkMuted,
                          fontSize: 11, fontWeight: 700,
                        }}><LockIcon size={11} />Bellik</Box>
                      </Box>
                    ))}
                  </Box>
                )}
              {!canNotes && (
                <Box sx={{ mt: '14px' }}>
                  <TeaserCard
                    compact
                    title={`${s.day.notes} belligiň teksti ýapyk`}
                    note={`Mugallymlaryň ýazan sözlerini we olaryň taryhyny ${tierFor('notes')?.name} bilen oka.`}
                    feature="notes"
                    icon={<NotesIcon />}
                    onUpgrade={() => { close(); setPage('upgrade'); }}
                  />
                </Box>
              )}
            </>
          )
          : <SheetSection><Typography variant="body2">Bu gün üçin bellik ýok.</Typography></SheetSection>}
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth onClick={close} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        </Box>
      </SheetDrawer>

      {/* The day's homework, as a to-do list rather than a stack of document
          sections. This is the one place a pupil sees the whole evening at
          once, so it is the place that has to be workable: tick from the list,
          untick from the list, and a bar that fills as the pile shrinks. */}
      <SheetDrawer open={sheet?.type === 'hw'} onClose={close}>
        <Typography variant="h2">Şu günki öý işler</Typography>
        <Typography variant="caption">
          {s.hwStats.total === 0
            ? 'Bu gün tabşyryk berilmedi'
            : s.hwStats.done === s.hwStats.total
              ? 'Ählisi ýerine ýetirildi 🎉'
              : `${s.hwStats.total - s.hwStats.done} tabşyryk galdy`}
        </Typography>
        <Box sx={{ mt: '14px' }}>
          {s.day && s.day.lessons.filter((l) => l.hw).length > 0 ? (
            <TodoList done={s.hwStats.done} total={s.hwStats.total}>
              {s.day.lessons.filter((l) => l.hw).map((l) => (
                <TodoRow
                  key={l.id}
                  label={l.hw!}
                  sub={`${l.subject} · ${l.time}`}
                  done={l.hwDone}
                  onToggle={() => void toggleHw(l)}
                  end={<EarnPill kind="hw" earns={earns} done={l.hwDone} />}
                />
              ))}
            </TodoList>
          ) : (
            <SheetSection><Typography variant="body2">Bu gün öý işi ýok 🎉</Typography></SheetSection>
          )}
        </Box>
        {/* The evening's other question: is it just me? */}
        {s.hwStats.total > 0 && (
          <Box sx={{ mt: '14px' }}>
            <ClassHwRow
              lessons={s.day?.lessons ?? []}
              selfDone={s.hwStats.done}
              onOpen={() => setSheet({ type: 'class' })}
            />
          </Box>
        )}
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth onClick={close} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        </Box>
      </SheetDrawer>

      <ClassHwSheet
        open={sheet?.type === 'class'}
        onClose={close}
        lessons={s.day?.lessons ?? []}
        focus={sheet?.type === 'class' ? sheet.focus : undefined}
        onUpgrade={() => { close(); setPage('upgrade'); }}
      />

      <SheetDrawer open={sheet?.type === 'picker'} onClose={close}>
        <Typography variant="h2">Senäni saýlaň</Typography>
        <Box sx={{ mt: '14px' }}>
          <MonthCalendar
            month={s.dateKey}
            selected={s.dateKey}
            marked={(iso: string) => s.days.some((d) => d.key === iso && d.checked)}
            onSelect={(iso: string) => { close(); s.selectDate(iso); }}
          />
        </Box>
      </SheetDrawer>

      <SheetDrawer open={sheet?.type === 'help'} onClose={close}>
        <Typography variant="h2">Kömek</Typography>
        <SheetSection>
          <Typography variant="body2">
            «Barla» — ene-atanyň goly. Ony basanyňyzda saýlanan gün
            barlandy hasaplanýar we senede belgi galýar.
          </Typography>
        </SheetSection>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth variant="contained" disableElevation onClick={close}>Düşnükli</Button>
        </Box>
      </SheetDrawer>
    </>
  );
}

