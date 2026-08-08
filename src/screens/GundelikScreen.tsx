import {
  Box, Button, ButtonBase, CircularProgress, Skeleton, Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DateStrip, GradeBadge, HeaderIconButton, LessonCard, SheetDrawer, SheetSection,
} from '../components/Ui';
import {
  BellIcon, CalendarIcon, CheckIcon, ClockIcon, HelpIcon, HwIcon, LockIcon,
  NotesIcon, ShareIcon, TemaIcon, TrophyIcon,
} from '../components/Icons';
import { AdSlot, TeaserCard } from '../components/Paywall';
import { BadgeChip, BadgeScore, BadgeStatsScreen } from './BadgeScreens';
import { InboxScreen } from './InboxScreens';
import { UpgradeScreen } from './UpgradeScreen';
import { TONE, awardsForLesson, badgeType, toneOf } from '../data/badges';
import type { Award } from '../data/badges';
import { absDate, fmtDate, relDate } from '../lib/date';
import { inboxUnread } from '../data/inbox';
import { useSchedule } from '../hooks/useSchedule';
import { tierFor, useCan, usePrefs } from '../state/prefs';
import { tokens } from '../theme';
import type { Lesson } from '../types';

type SheetState =
  | { type: 'lesson'; lesson: Lesson }
  | { type: 'notes' }
  | { type: 'hw' }
  | { type: 'picker' }
  | { type: 'help' }
  | null;

/* the teacher notes the free tier is allowed to read in full */
const FREE_NOTES = 1;

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
        fontSize: 19, fontWeight: 700, letterSpacing: '-.2px', color: color ?? tokens.ink,
        fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', minHeight: 24,
      }}>{value}</Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{label}</Typography>
    </ButtonBase>
  );
}

/*
 * A badge, for an account that has not paid for badges.
 *
 * The emoji and the date stay — that a badge happened, and when, is a fact
 * about the reader's own day. Who gave it and what they wrote is the value,
 * and it stays behind a real blur rather than a grey placeholder: the point is
 * that there is a sentence there, unread. Same line the badge history draws —
 * how much there is is free, what it says is paid.
 */
function LockedAward({ award, onUpgrade }: { award: Award; onUpgrade: () => void }) {
  const t = badgeType(award.typeId);
  const tone = TONE[toneOf(award)];
  const plan = tierFor('badges');
  return (
    <ButtonBase
      onClick={onUpgrade}
      aria-label={`Nyşan, ${fmtDate(award.date)} — mugallym we teswir ${plan?.name} bilen açylýar`}
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
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: tone.ink }}>
          {fmtDate(award.date)}
        </Typography>
        {/* the teacher's name and words, present but unreadable */}
        <Box aria-hidden sx={{ display: 'flex', flexDirection: 'column', gap: '4px', mt: '6px' }}>
          <Box sx={{ height: 8, width: '52%', borderRadius: 4, bgcolor: '#fff', opacity: .9 }} />
          <Box sx={{ height: 8, width: '78%', borderRadius: 4, bgcolor: '#fff', opacity: .6 }} />
        </Box>
      </Box>

      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 'none',
        px: '9px', height: 24, borderRadius: `${tokens.rPill}px`,
        bgcolor: '#fff', color: tone.ink, fontSize: 11.5, fontWeight: 700,
      }}>
        <LockIcon size={12} />{plan?.name}
      </Box>
    </ButtonBase>
  );
}

export function GundelikScreen({ toast }: { toast: (msg: string) => void }) {
  const s = useSchedule();
  const { premium } = usePrefs();
  const canBadges = useCan('badges');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [page, setPage] = useState<Page>('diary');
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

  const share = async () => {
    const text = `Gündelik — ${absDate(s.dateKey)}: ${s.day?.lessons.length ?? 0} sapak`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Gündelik', text });
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return; /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Bufere göçürildi');
    } catch {
      toast(text); /* clipboard unavailable — at least show what would be shared */
    }
  };

  const markDone = async (lesson: Lesson) => {
    await s.markHwDone(lesson.id);
    close();
    toast('Öý işi bellendi ✓');
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
        {/* Three icon-only actions. Labelled pills pushed the title into two
            lines on a 375 screen, and notifications get the header instead of a
            full-width row of their own. */}
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <HeaderIconButton label="Senäni saýla" onClick={() => setSheet({ type: 'picker' })}>
            <CalendarIcon size={21} />
          </HeaderIconButton>
          <HeaderIconButton label="Paýlaş" onClick={() => void share()}>
            <ShareIcon size={21} />
          </HeaderIconButton>
          <HeaderIconButton label="Habarlar we söhbetler" count={inboxUnread()} onClick={() => setPage('inbox')}>
            <BellIcon size={21} />
          </HeaderIconButton>
        </Box>
      </Box>

      <DateStrip days={s.days} selected={s.dateKey} onSelect={s.selectDate} />

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
            label="Nyşan"
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
            />
          );
        })}
      </Box>

      {/* free tier sees one ad, and it only ever sells Premium */}
      <Box sx={{ px: tokens.gutter, pt: '12px' }}>
        <AdSlot onUpgrade={() => setPage('upgrade')} />
      </Box>

      {/* Sync panel */}
      <Box sx={{
        m: `12px ${tokens.gutter} 0`, bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        height: 77, pl: '16.5px', pr: '18px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <Typography variant="caption" sx={{ color: tokens.ink3 }}>Soňky barlanan senesi:</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: '.2px', fontVariantNumeric: 'tabular-nums' }}>
            {s.lastChecked || '—'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          disabled={!s.needsCheck || s.checking}
          onClick={() => void s.runCheck().then(() => toast('Maglumatlar täzelendi'))}
          sx={{ width: 72, height: 45, borderRadius: `${tokens.rTile}px`, minWidth: 0 }}
        >
          {s.checking ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Barla'}
        </Button>
        <ButtonBase aria-label="Kömek" onClick={() => setSheet({ type: 'help' })}
          sx={{ width: 44, height: 44, mr: '-10px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
          <HelpIcon />
        </ButtonBase>
      </Box>

      {/* ---------------- Sheets ---------------- */}
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
            <SheetSection
              title={<><HwIcon />Öý işi</>}
              end={sheet.lesson.hwDone ? <Box sx={{ color: tokens.greenDeep, display: 'flex' }}><CheckIcon size={15} /></Box> : undefined}
            >
              <Typography variant="body2">{sheet.lesson.hw ?? 'Öý işi girizilmedi.'}</Typography>
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
              <SheetSection title={<><TrophyIcon size={15} />Mugallymyň nyşanlary</>}>
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
            <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
              <Button fullWidth onClick={close} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
              <Button fullWidth variant="contained" disableElevation
                disabled={sheet.lesson.hwDone}
                onClick={() => void markDone(sheet.lesson)}>
                {sheet.lesson.hwDone ? 'Ýerine ýetirildi ✓' : 'Ýerine ýetirildi diý'}
              </Button>
            </Box>
          </>
        )}
      </SheetDrawer>

      <SheetDrawer open={sheet?.type === 'notes'} onClose={close}>
        <Typography variant="h2">Mugallymdan bellikler</Typography>
        <Typography variant="caption">{s.day?.notes ?? 0} täze belligiňiz bar</Typography>
        {s.day && s.day.notes > 0
          ? (
            <>
              {/* the free tier reads the first note in full — enough to know a
                  real comment is there, and never a wall in front of nothing */}
              {s.day.lessons.slice(0, premium ? 3 : FREE_NOTES).map((l, i) => (
                <SheetSection key={l.id} title={<>{l.subject} · {l.teacher}</>}>
                  <Typography variant="body2">{NOTE_TEXTS[i % NOTE_TEXTS.length]}</Typography>
                </SheetSection>
              ))}
              {!premium && (
                <Box sx={{ mt: '14px' }}>
                  <TeaserCard
                    compact
                    title={`Ýene ${Math.max(0, (s.day.notes ?? 0) - FREE_NOTES)} bellik ýapyk`}
                    note="Mugallymlaryň ähli belliklerini we olaryň taryhyny Premium bilen oka."
                    icon={<NotesIcon />}
                    onUpgrade={() => { close(); setPage('upgrade'); }}
                    preview={(
                      <Box sx={{ p: '14px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {s.day.lessons.slice(1, 3).map((l, i) => (
                          <Box key={l.id}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.ink2 }}>
                              {l.subject} · {l.teacher}
                            </Typography>
                            <Typography variant="body2">{NOTE_TEXTS[(i + 1) % NOTE_TEXTS.length]}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
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

      <SheetDrawer open={sheet?.type === 'hw'} onClose={close}>
        <Typography variant="h2">Şu günki öý işler</Typography>
        <Typography variant="caption">{s.hwStats.done}/{s.hwStats.total} ýerine ýetirildi</Typography>
        {s.day && s.day.lessons.filter((l) => l.hw).length > 0
          ? s.day.lessons.filter((l) => l.hw).map((l) => (
            <SheetSection key={l.id} title={<>{l.subject}</>}
              end={l.hwDone ? <Box sx={{ color: tokens.greenDeep, display: 'flex' }}><CheckIcon size={15} /></Box> : undefined}>
              <Typography variant="body2">{l.hw}</Typography>
            </SheetSection>
          ))
          : <SheetSection><Typography variant="body2">Bu gün öý işi ýok 🎉</Typography></SheetSection>}
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth onClick={close} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        </Box>
      </SheetDrawer>

      <SheetDrawer open={sheet?.type === 'picker'} onClose={close}>
        <Typography variant="h2">Senäni saýlaň</Typography>
        <Typography variant="caption">Fewral 2026</Typography>
        <Box sx={{ mt: '10px' }}>
          {s.days.map((d) => (
            <ButtonBase
              key={d.key}
              disabled={d.disabled}
              onClick={() => { close(); s.selectDate(d.key); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', minHeight: 52,
                px: '4px', fontSize: 16, textAlign: 'left', justifyContent: 'flex-start',
                borderBottom: `0.5px solid ${tokens.dividerSoft}`,
                color: d.disabled ? tokens.inkDisabled : tokens.ink,
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <Box sx={{ width: 34, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.d}</Box>
              <Box sx={{ flex: 1, color: d.disabled ? tokens.inkDisabled : tokens.ink2 }}>{d.full}</Box>
              {/* the three days a reader names instead of numbering */}
              {relDate(d.key) && (
                <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mr: '6px' }}>
                  {relDate(d.key)}
                </Typography>
              )}
              {d.key === s.dateKey && <Box sx={{ color: tokens.blue, display: 'flex' }}><CheckIcon /></Box>}
            </ButtonBase>
          ))}
        </Box>
      </SheetDrawer>

      <SheetDrawer open={sheet?.type === 'help'} onClose={close}>
        <Typography variant="h2">Kömek</Typography>
        <SheetSection>
          <Typography variant="body2">
            «Barla» düwmesi mekdep ulgamyndan iň soňky maglumatlary alýar.
            Senäni çalşanyňyzda düwme işjeň bolýar.
          </Typography>
        </SheetSection>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth variant="contained" disableElevation onClick={close}>Düşnükli</Button>
        </Box>
      </SheetDrawer>
    </>
  );
}

