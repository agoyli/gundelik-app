import {
  Box, Button, ButtonBase, CircularProgress, Skeleton, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  CountPill, DateStrip, GradeBadge, LessonCard, SheetDrawer, SheetSection, SurfaceRow, TagPill,
} from '../components/Ui';
import {
  CalendarIcon, CheckIcon, ChevronIcon, ClockIcon, HelpIcon, HomeIcon, HwIcon,
  NotesIcon, ShareIcon, TemaIcon,
} from '../components/Icons';
import { useSchedule } from '../hooks/useSchedule';
import { tokens } from '../theme';
import type { Lesson } from '../types';

type SheetState =
  | { type: 'lesson'; lesson: Lesson }
  | { type: 'notes' }
  | { type: 'hw' }
  | { type: 'picker' }
  | { type: 'help' }
  | null;

export function GundelikScreen({ toast }: { toast: (msg: string) => void }) {
  const s = useSchedule('d2');
  const [sheet, setSheet] = useState<SheetState>(null);
  const close = () => setSheet(null);

  /* keep the selected date cell centred */
  useEffect(() => {
    document.querySelector('[data-datecell="active"]')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [s.dateKey]);

  const share = async () => {
    const d = s.days.find((x) => x.key === s.dateKey);
    const text = `Gündelik — ${d?.d} ${d?.full}: ${s.day?.lessons.length ?? 0} sapak`;
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
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <TagPill icon={<CalendarIcon />} label="Senäni saýlaň" onClick={() => setSheet({ type: 'picker' })} />
          <TagPill icon={<ShareIcon />} label="Paýlaş" onClick={() => void share()} />
        </Box>
      </Box>

      <DateStrip days={s.days} selected={s.dateKey} onSelect={s.selectDate} />

      {/* Quick rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', px: tokens.gutter, pt: '16px' }}>
        <SurfaceRow
          icon={<NotesIcon />}
          label="Mugallymdan bellikler"
          end={s.day && s.day.notes > 0
            ? <CountPill n={s.day.notes} />
            : <Box sx={{ color: tokens.inkDisabled, display: 'flex' }}><ChevronIcon /></Box>}
          onClick={() => setSheet({ type: 'notes' })}
        />
        <SurfaceRow
          icon={<HomeIcon />}
          label="Şu günki öý işler"
          end={<Box sx={{ fontSize: 18, fontWeight: 600, color: tokens.blue, letterSpacing: '.3px' }}>
            {s.hwStats.done}/{s.hwStats.total}
          </Box>}
          onClick={() => setSheet({ type: 'hw' })}
        />
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
            <CalendarIcon size={28} />
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Bu gün sapak ýok</Typography>
            <Typography variant="caption" sx={{ lineHeight: 1.45 }}>
              Dynç güni ýa-da rasporýaniýe entek girizilmedi.<br />Başga senäni saýlap görüň.
            </Typography>
          </Box>
        )}
        {!s.loading && s.day?.lessons.map((l) => (
          <LessonCard key={l.id} lesson={l} onOpen={(lesson) => setSheet({ type: 'lesson', lesson })} />
        ))}
      </Box>

      {/* Sync panel */}
      <Box sx={{
        m: `12px ${tokens.gutter} 0`, bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        height: 77, pl: '16.5px', pr: '18px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <Typography variant="caption" sx={{ color: tokens.inkDisabled }}>Soňky barlanan senesi:</Typography>
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
          sx={{ borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
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
              end={sheet.lesson.hwDone ? <Box sx={{ color: tokens.green, display: 'flex' }}><CheckIcon size={15} /></Box> : undefined}
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
          ? s.day.lessons.slice(0, 3).map((l, i) => (
            <SheetSection key={l.id} title={<>{l.subject} · {l.teacher}</>}>
              <Typography variant="body2">
                {[
                  'Okuwçynyň işjeňligi gowulandy, sapaga taýýarlykly geldi.',
                  'Öý işini wagtynda we doly ýerine ýetirdi.',
                  'Sapakda has ünsli bolmagy maslahat berilýär.',
                ][i % 3]}
              </Typography>
            </SheetSection>
          ))
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
              end={l.hwDone ? <Box sx={{ color: tokens.green, display: 'flex' }}><CheckIcon size={15} /></Box> : undefined}>
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

