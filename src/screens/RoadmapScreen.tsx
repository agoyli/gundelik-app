import { Box, Button, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BooksIcon, CheckIcon, ChevronIcon, GameIcon, LockIcon, QuizIcon, SearchIcon,
  SparkleIcon, TrendUpIcon, VideoIcon,
} from '../components/Icons';
import { BookmarkButton, DoneBadge, PillHeader, SheetDrawer, SheetSection } from '../components/Ui';
import { usePrefs } from '../state/prefs';
import { LessonScreen } from './LessonScreen';
import { TEST_LENGTH } from './LessonScreen';
import type { LessonKind } from './LessonScreen';
import { tokens } from '../theme';

/* ---------------- Activity kinds ---------------- */
type Kind = LessonKind;

/* `color` fills tiles and icons; `ink` is the same accent at text contrast */
const KIND_META: Record<Kind, {
  label: string; color: string; ink: string; tint: string; icon: (size: number) => React.ReactNode;
}> = {
  text: { label: 'Tekst', color: tokens.blue, ink: tokens.blueText, tint: tokens.blueTint, icon: (s) => <BooksIcon size={s} /> },
  video: { label: 'Wideo', color: tokens.purple, ink: tokens.purpleText, tint: tokens.purpleTint, icon: (s) => <VideoIcon size={s} /> },
  interactive: { label: 'Interaktiw', color: tokens.teal, ink: tokens.tealText, tint: tokens.tealTint, icon: (s) => <GameIcon size={s} /> },
  test: { label: 'Test', color: tokens.orange, ink: tokens.orangeText, tint: tokens.orangeTint, icon: (s) => <QuizIcon size={s} /> },
};
const KINDS = Object.keys(KIND_META) as Kind[];

/* ---------------- Mock data (grades 1–12) ---------------- */
type RoadLesson = { id: string; title: string; done: boolean; kind: Kind; extent: string };
type GradeSection = { grade: number; lessons: RoadLesson[] };

const USER_GRADE = 8;

const TITLES = [
  'Köpeldijilere dagytmak', 'Horner shemasy ýa-da bölmek', 'Kwadrat kökli deňlemeler',
  'Diskriminant we kökler', 'Wiýeta teoremasy', 'Funksiýanyň grafigi',
  'Deňsizlikler ulgamy', 'Progressiýalar',
];
/* every 6th activity is a test, the rest rotate text → video → interactive */
const KIND_CYCLE: Kind[] = ['text', 'video', 'interactive', 'text', 'video', 'test'];

const GRADES: GradeSection[] = Array.from({ length: 12 }, (_, gi) => {
  const grade = gi + 1;
  const count = grade === USER_GRADE ? 20 : 8;
  return {
    grade,
    lessons: Array.from({ length: count }, (_, i) => {
      const kind = KIND_CYCLE[(i + grade) % KIND_CYCLE.length];
      return {
        id: `g${grade}-${i}`,
        title: TITLES[(i + grade) % TITLES.length],
        done: grade < USER_GRADE || (grade === USER_GRADE && i < 5),
        kind,
        /* tests advertise the count the test page actually asks (TEST_LENGTH) */
        extent: kind === 'test' ? `${TEST_LENGTH} sorag` : `${4 + ((i * 3 + grade) % 8)} min`,
      };
    }),
  };
});

const gradeLabel = (n: number) => `${n}-${[6, 9, 10].includes(n) ? 'njy' : 'nji'} synp`;

/* capsule header height — grade bands stick right below it */
const HEADER_H = 84;

/* ---------------- Winding lesson path ---------------- */
const ROW = 118;
const TILE = 68;
const OFF = 54;
const GAP = 12;

function PathSection({ lessons, currentId, onPick }: {
  lessons: RoadLesson[]; currentId?: string; onPick: (l: RoadLesson) => void;
}) {
  const pts = lessons.map((_, i) => ({ x: i % 2 === 0 ? OFF : -OFF, y: i * ROW + TILE / 2 }));
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${a.x} ${a.y + ROW * 0.55}, ${b.x} ${b.y - ROW * 0.55}, ${b.x} ${b.y}`;

  return (
    <Box sx={{ position: 'relative', height: lessons.length * ROW, my: '10px' }}>
      <Box component="svg" aria-hidden
        sx={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', overflow: 'visible' }}>
        {pts.slice(1).map((p, i) => {
          const reached = lessons[i + 1].done || lessons[i + 1].id === currentId;
          return (
            <path key={lessons[i + 1].id} d={seg(pts[i], p)} fill="none"
              stroke={reached ? tokens.blue : tokens.divider}
              strokeWidth={3.5} strokeLinecap="round"
              strokeDasharray={reached ? undefined : '1 9'} />
          );
        })}
      </Box>
      {lessons.map((l, i) => {
        const meta = KIND_META[l.kind];
        const current = l.id === currentId;
        const locked = !l.done && !current;
        const right = pts[i].x > 0;
        return (
          /* whole row (label + tile) is one tap target */
          <ButtonBase
            key={l.id}
            onClick={() => onPick(l)}
            data-current={current ? 'true' : undefined}
            aria-label={`${l.title} — ${meta.label}${l.done ? ', tamamlandy' : locked ? ', gulply' : ''}`}
            disableRipple
            sx={{
              position: 'absolute', top: i * ROW, left: 0, right: 0, height: TILE,
              display: 'block', textAlign: 'inherit',
              '&:active .road-tile': { transform: 'scale(.94)' },
            }}
          >
            <Box className="road-tile" aria-hidden sx={{
              position: 'absolute', top: 0, left: `calc(50% + ${pts[i].x - TILE / 2}px)`,
              width: TILE, height: TILE, borderRadius: `${tokens.rCard}px`,
              display: 'grid', placeItems: 'center',
              transition: 'transform .12s ease',
              ...(l.done && {
                bgcolor: meta.color, color: '#fff',
                boxShadow: `0 5px 14px ${meta.color}55`,
              }),
              ...(current && {
                bgcolor: '#fff', color: meta.color, border: `3px solid ${meta.color}`,
                animation: 'roadPulse 1.8s ease-out infinite',
                '@keyframes roadPulse': {
                  '0%': { boxShadow: `0 0 0 0 ${meta.color}59` },
                  '70%': { boxShadow: `0 0 0 13px ${meta.color}00` },
                  '100%': { boxShadow: `0 0 0 0 ${meta.color}00` },
                },
              }),
              ...(locked && { bgcolor: tokens.lockTile, color: tokens.lockInk }),
            }}>
              {meta.icon(30)}
              {l.done && (
                <Box sx={{ position: 'absolute', top: -5, right: -5 }}><DoneBadge /></Box>
              )}
              {locked && (
                <Box sx={{
                  position: 'absolute', bottom: -5, right: -5, width: 22, height: 22,
                  borderRadius: '50%', bgcolor: tokens.lockBadge, color: '#fff',
                  display: 'grid', placeItems: 'center', border: '2.5px solid #fff',
                }}><LockIcon size={12} /></Box>
              )}
              {current && (
                <Box sx={{
                  position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
                  bgcolor: meta.ink, color: '#fff', fontSize: 11, fontWeight: 700,
                  letterSpacing: '.8px', px: '9px', height: 20, lineHeight: '20px',
                  borderRadius: `${tokens.rPill}px`, whiteSpace: 'nowrap',
                  animation: 'roadBob 1.4s ease-in-out infinite',
                  '@keyframes roadBob': {
                    '0%,100%': { transform: 'translateX(-50%) translateY(0)' },
                    '50%': { transform: 'translateX(-50%) translateY(-4px)' },
                  },
                }}>BAŞLA</Box>
              )}
            </Box>
            <Box sx={{
              position: 'absolute', top: 0, height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              ...(right
                ? { left: '16px', right: `calc(50% - ${OFF - TILE / 2 - GAP}px)`, alignItems: 'flex-end', textAlign: 'right' }
                : { right: '16px', left: `calc(50% - ${OFF - TILE / 2 - GAP}px)`, textAlign: 'left' }),
            }}>
              <Typography sx={{
                fontSize: 15, fontWeight: 600, lineHeight: 1.25,
                color: locked ? tokens.ink3 : tokens.ink,
              }}>{l.title}</Typography>
              <Typography sx={{ fontSize: 12.5, mt: '3px', color: locked ? tokens.inkMuted : meta.ink, fontWeight: 600 }}>
                {meta.label} · {l.extent}
              </Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/* the grade the free tier gets in full — enough to finish a real topic before
   being asked for anything */
const FREE_GRADE = 1;

/* ---------------- Screen ---------------- */
export function RoadmapScreen({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: (m: string) => void; onUpgrade: () => void;
}) {
  const { premium } = usePrefs();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<Kind | null>(null);
  const [activeGrade, setActiveGrade] = useState(USER_GRADE);
  const [sheet, setSheet] = useState<RoadLesson | null>(null);
  const [lessonOpen, setLessonOpen] = useState<RoadLesson | null>(null);
  /* lessons completed in this session — the path advances live */
  const [doneIds, setDoneIds] = useState<string[]>([]);
  /* fully-completed grades collapse to summary rows; user can expand them */
  const [expandedDone, setExpandedDone] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const filterActive = !!kindFilter || !!query.trim();

  const resolved = useMemo(() => GRADES.map((g) => ({
    ...g,
    lessons: g.lessons.map((l) => (doneIds.includes(l.id) ? { ...l, done: true } : l)),
  })), [doneIds]);

  const me = resolved[USER_GRADE - 1];
  const currentId = me.lessons.find((l) => !l.done)?.id;
  const currentLesson = me.lessons.find((l) => l.id === currentId);
  const doneCount = me.lessons.filter((l) => l.done).length;
  const pct = Math.round((doneCount / me.lessons.length) * 100);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resolved
      .map((g) => ({
        ...g,
        lessons: g.lessons
          .filter((l) => !kindFilter || l.kind === kindFilter)
          .filter((l) => !q
            || l.title.toLowerCase().includes(q)
            || KIND_META[l.kind].label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.lessons.length > 0);
  }, [query, kindFilter, resolved]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const probe = el.scrollTop + el.clientHeight * 0.35;
    let current = sections[0]?.grade ?? 1;
    for (const g of sections) {
      const node = sectionRefs.current[g.grade];
      if (node && node.offsetTop <= probe) current = g.grade;
    }
    setActiveGrade(current);
  };
  useEffect(onScroll, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  /* land on the lesson to take next, not on grade 1 */
  useEffect(() => {
    scrollRef.current?.querySelector('[data-current="true"]')?.scrollIntoView({ block: 'center' });
  }, []);

  const isGradeCollapsed = (grade: number) =>
    resolved[grade - 1].lessons.every((l) => l.done) && !filterActive && !expandedDone[grade];

  /* One button at a time; collapsed grades are skipped so the jump always lands on a visible path */
  const navGrades = sections.map((s) => s.grade).filter((g) => !isGradeCollapsed(g));
  const nextG = navGrades.find((g) => g > activeGrade);
  const prevG = [...navGrades].reverse().find((g) => g < activeGrade);
  const up = activeGrade > USER_GRADE || nextG === undefined;
  const target = up ? prevG : nextG;

  const jump = () => {
    if (target === undefined) return;
    sectionRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLesson = (l: RoadLesson) => { setSheet(null); setLessonOpen(l); };

  const completeLesson = () => {
    if (!lessonOpen) return;
    const wasDone = lessonOpen.done;
    if (!wasDone) setDoneIds((ids) => (ids.includes(lessonOpen.id) ? ids : [...ids, lessonOpen.id]));
    setLessonOpen(null);
    toast(wasDone ? 'Sapak gaýtadan geçildi ✓' : 'Sapak tamamlandy ✓');
  };

  const sheetMeta = sheet ? KIND_META[sheet.kind] : null;
  const sheetLocked = !!sheet && !sheet.done && sheet.id !== currentId;
  /* free users own the first grade outright; beyond it the path is a preview */
  const sheetGrade = sheet ? Number(sheet.id.slice(1).split('-')[0]) : 0;
  const sheetPaid = !premium && sheetGrade > FREE_GRADE;

  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fff' }}>
      <Box ref={scrollRef} onScroll={onScroll}
        sx={{
          position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
        <PillHeader
          title="Algebra"
          onBack={onBack}
          /* the shared bookmark, not a second private one: this page used to
             keep its own `saved` flag, which meant the star here and the
             collection under Gollanmalar knew nothing about each other */
          action={<BookmarkButton item={{ kind: 'tema', id: 'algebra', title: 'Algebra', sub: 'Matematika · 1–12 synp' }} />}
        />

        <Box sx={{ px: tokens.gutter, pt: '2px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '9px', height: 46,
            bgcolor: tokens.surface, borderRadius: `${tokens.rTile}px`, px: '13px',
            color: tokens.inkMuted,
          }}>
            <SearchIcon size={17} />
            <InputBase
              placeholder="Gözleg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ flex: 1, fontSize: 15 }}
              inputProps={{ 'aria-label': 'Sapak gözlegi' }}
            />
          </Box>

          {/* Activity-type filter chips */}
          <Box sx={{
            display: 'flex', gap: '8px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter,
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
          }}>
            <ButtonBase onClick={() => setKindFilter(null)} aria-pressed={kindFilter === null}
              sx={{
                height: 32, px: '14px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                fontSize: 13.5, fontWeight: 600,
                transition: 'background .15s ease,color .15s ease',
                bgcolor: kindFilter === null ? tokens.blue : tokens.surface,
                color: kindFilter === null ? '#fff' : tokens.ink2,
              }}>Ähli</ButtonBase>
            {KINDS.map((k) => {
              const m = KIND_META[k];
              const on = kindFilter === k;
              return (
                <ButtonBase key={k} onClick={() => setKindFilter(on ? null : k)} aria-pressed={on}
                  sx={{
                    height: 32, px: '12px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                    display: 'inline-flex', gap: '6px', fontSize: 13.5, fontWeight: 600,
                    bgcolor: on ? m.ink : m.tint, color: on ? '#fff' : m.ink,
                    transition: 'background .15s ease,color .15s ease',
                  }}>
                  {m.icon(15)}{m.label}
                </ButtonBase>
              );
            })}
          </Box>

          {/* Continue card — next lesson front and centre, level folded in below */}
          <ButtonBase
            onClick={() => currentLesson && setSheet(currentLesson)}
            disabled={!currentLesson}
            aria-label={currentLesson ? `Indiki sapak: ${currentLesson.title}` : undefined}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '14px',
              background: `linear-gradient(155deg, ${tokens.blue} 0%, ${tokens.bluePress} 100%)`,
              borderRadius: `${tokens.rCard}px`, color: '#fff',
              p: '16px 18px', textAlign: 'left',
              boxShadow: '0 10px 24px rgba(63,124,242,.28)',
              transition: 'transform .12s ease', '&:active': { transform: 'scale(.985)' },
            }}
          >
            {currentLesson ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                <Box aria-hidden sx={{
                  width: 46, height: 46, borderRadius: `${tokens.rRow}px`, flex: 'none',
                  bgcolor: '#fff', color: KIND_META[currentLesson.kind].color,
                  display: 'grid', placeItems: 'center',
                }}>{KIND_META[currentLesson.kind].icon(24)}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', opacity: .75 }}>
                    INDIKI SAPAK
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px', mt: '1px' }}>
                    {currentLesson.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, opacity: .8, mt: '1px' }}>
                    {KIND_META[currentLesson.kind].label} · {currentLesson.extent}
                  </Typography>
                </Box>
                <Box aria-hidden sx={{
                  height: 36, px: '16px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                  bgcolor: '#fff', color: tokens.blue, fontSize: 14, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center',
                }}>Başla</Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Ähli sapaklar tamamlandy 🎉</Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
                <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 4, bgcolor: tokens.gold, transition: 'width .4s ease' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, opacity: .85 }}>
                  {doneCount}/{me.lessons.length} sapak tamamlandy
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{gradeLabel(USER_GRADE)}</Typography>
              </Box>
            </Box>
          </ButtonBase>
        </Box>

        {/* Grade sections */}
        {sections.length === 0 && (
          <Box sx={{
            p: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '10px', textAlign: 'center', color: tokens.inkMuted,
          }}>
            <SearchIcon size={30} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: tokens.ink }}>Hiç zat tapylmady</Typography>
            <Typography variant="caption">Gözlegi ýa-da görnüş filtrini üýtgedip görüň.</Typography>
            <Button variant="contained" disableElevation sx={{ mt: '8px', px: '28px' }}
              onClick={() => { setQuery(''); setKindFilter(null); }}>
              Arassala
            </Button>
          </Box>
        )}
        {sections.map((g) => {
          const all = resolved[g.grade - 1].lessons;
          const total = all.length;
          const doneN = all.filter((l) => l.done).length;
          const complete = doneN === total;
          const toggleable = complete && !filterActive;
          const collapsed = toggleable && !expandedDone[g.grade];
          /* Free tier keeps the first grade; the rest say so in the band
             rather than only when a lesson sheet opens. */
          const paidGrade = !premium && g.grade > FREE_GRADE;
          const caption = filterActive
            ? `${g.lessons.length} sapak tapyldy`
            : paidGrade ? `Premium · ${total} sapak`
              : complete ? `${total} sapak tamamlandy`
                : doneN > 0 ? `${doneN}/${total} tamamlandy`
                  : `gulply · ${total} sapak`;
          const toggle = () => {
            setExpandedDone((s) => ({ ...s, [g.grade]: collapsed }));
            /* collapsing shrinks the page — keep the band in view */
            if (!collapsed) requestAnimationFrame(() =>
              sectionRefs.current[g.grade]?.scrollIntoView({ block: 'center' }));
          };
          return (
            <Box key={g.grade} ref={(el: HTMLDivElement | null) => { sectionRefs.current[g.grade] = el; }}>
              {/* One band for every grade & state: sticky below the header while its path scrolls;
                  the chevron flip is the only visual difference between open/closed */}
              <Box
                component={toggleable ? ButtonBase : 'div'}
                onClick={toggleable ? toggle : undefined}
                {...(toggleable
                  ? { 'aria-expanded': !collapsed, 'aria-label': `${gradeLabel(g.grade)}, ${collapsed ? 'aç' : 'ýygna'}` }
                  : {})}
                sx={{
                  position: 'sticky', top: `calc(${HEADER_H}px + env(safe-area-inset-top))`, zIndex: 3,
                  width: '100%', py: '11px', mt: '10px',
                  bgcolor: tokens.blurTintBg, backdropFilter: tokens.blur,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  {complete && <DoneBadge />}
                  <Typography variant="h2" component="span" sx={{ color: tokens.blueText }}>
                    {gradeLabel(g.grade)}
                  </Typography>
                  {toggleable && (
                    <Box sx={{
                      color: tokens.blueText, display: 'flex', opacity: .7,
                      transform: collapsed ? 'rotate(90deg)' : 'rotate(-90deg)',
                      transition: 'transform .18s ease',
                    }}>
                      <ChevronIcon size={11} />
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.blueText }}>
                  {caption}
                </Typography>
              </Box>
              {!collapsed && <PathSection lessons={g.lessons} currentId={currentId} onPick={setSheet} />}
            </Box>
          );
        })}
        <Box sx={{ height: 'calc(110px + env(safe-area-inset-bottom))' }} />

        {/* Floating jump-to-grade button — frosted, riding above the glass tab bar */}
        {target !== undefined && (
          <ButtonBase
            onClick={jump}
            aria-label={`${gradeLabel(target)} geç`}
            sx={{
              position: 'sticky', bottom: 'calc(104px + env(safe-area-inset-bottom))',
              ml: 'auto', mr: '14px',
              display: 'flex', flexDirection: 'column', gap: '2px',
              width: 54, height: 70, borderRadius: `${tokens.rRow}px`,
              bgcolor: tokens.blurBgSoft, backdropFilter: tokens.blur,
              border: `2px solid ${tokens.greenText}`, color: tokens.greenText,
              fontSize: 17, fontWeight: 700, boxShadow: tokens.shadowFloat,
              zIndex: 5,
            }}
          >
            {up
              ? <>{target}<Box sx={{ display: 'flex' }}><TrendUpIcon size={16} /></Box></>
              : <><Box sx={{ display: 'flex', transform: 'rotate(180deg)' }}><TrendUpIcon size={16} /></Box>{target}</>}
          </ButtonBase>
        )}
      </Box>

      {/* Lesson sheet */}
      <SheetDrawer open={sheet !== null} onClose={() => setSheet(null)}>
        {sheet && sheetMeta && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: `${tokens.rRow}px`, flex: 'none',
                bgcolor: sheetMeta.tint, color: sheetMeta.ink, display: 'grid', placeItems: 'center',
              }}>{sheetMeta.icon(28)}</Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h2">{sheet.title}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: sheetMeta.ink, mt: '2px' }}>
                  {sheetMeta.label} · {sheet.extent}
                </Typography>
              </Box>
            </Box>
            <SheetSection>
              {sheetPaid ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.blueText, fontSize: 14, fontWeight: 600 }}>
                  <SparkleIcon size={16} />{gradeLabel(FREE_GRADE)} mugt — galan synplar Premium bilen
                </Box>
              ) : sheet.done ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.greenText, fontSize: 14, fontWeight: 600 }}>
                  <CheckIcon size={15} />Tamamlandy — gaýtadan geçip bilersiňiz
                </Box>
              ) : sheetLocked ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.inkMuted, fontSize: 14, fontWeight: 600 }}>
                  <LockIcon size={16} />Açmak üçin öňki sapaklary tamamlaň
                </Box>
              ) : (
                <Typography variant="body2">Indiki sapagyňyz — başlamaga taýyn!</Typography>
              )}
            </SheetSection>
            <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
              <Button fullWidth onClick={() => setSheet(null)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
                Ýap
              </Button>
              <Button
                fullWidth variant="contained" disableElevation
                disabled={sheetLocked && !sheetPaid}
                onClick={() => {
                  if (!sheet) return;
                  if (sheetPaid) { setSheet(null); onUpgrade(); return; }
                  openLesson(sheet);
                }}
              >
                {sheetPaid ? 'Premium al' : sheet.done ? 'Gaýtadan gör' : sheetLocked ? 'Gulply' : 'Başla'}
              </Button>
            </Box>
          </>
        )}
      </SheetDrawer>

      {/* Full-screen lesson page */}
      {lessonOpen && (
        <LessonScreen
          lesson={lessonOpen}
          meta={KIND_META[lessonOpen.kind]}
          onClose={() => setLessonOpen(null)}
          onComplete={completeLesson}
          onUpgrade={() => { setLessonOpen(null); onUpgrade(); }}
        />
      )}
    </Box>
  );
}
