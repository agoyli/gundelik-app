import { Box, Button, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  CheckIcon, LockIcon, SearchIcon, SparkleIcon, TrendUpIcon,
} from '../components/Icons';
import { BookmarkButton, ChipRow, DoneBadge, PillHeader, SheetDrawer, SheetSection } from '../components/Ui';
import { tierFor, useCan } from '../state/prefs';
import type { CurriculumSubject, PathNode } from '../data/curriculum';
import { pathFor } from '../data/curriculum';
import type { Kind } from '../data/kinds';
import { KINDS, KIND_META } from '../data/kinds';
import { LessonScreen } from './LessonScreen';
import { tokens } from '../theme';

/* ---------------- The path (grades 1–12) ---------------- */
/* The path itself is the curriculum's — which grades, which themes, in which
   order, and which of them are a reading, an interactive or a checkpoint. All
   this screen adds is what the reader has finished. */
type RoadLesson = PathNode & { done: boolean };
type GradeSection = { grade: number; lessons: RoadLesson[] };

const gradeLabel = (n: number) => `${n}-${[6, 9, 10].includes(n) ? 'njy' : 'nji'} synp`;

/* the plan that opens the grades past the free one — named, never "Premium" */
const planName = tierFor('roadmap')?.name ?? '';

/* capsule header height — grade bands stick right below it */
const HEADER_H = 84;

/* ---------------- Winding lesson path ---------------- */
const ROW = 118;
const TILE = 68;
/* how far the current lesson's flag floats above its tile (plus its bob) */
const LABEL_LIFT = 30;
const OFF = 54;
const GAP = 12;

/* the exact height a grade's path occupies — the placeholder below stands in
   for it, so scrolling past an unmounted grade costs the same as scrolling
   through it and nothing jumps when it mounts */
const pathHeight = (n: number) => n * ROW + LABEL_LIFT + 24;

/*
 * A grade draws itself when you come near it.
 *
 * Iňlis dili has 811 themes across twelve grades; mounting all of them is 800
 * absolutely-positioned rows and a page that stutters while it scrolls. Each
 * grade instead reserves its full height and only mounts its path when it is
 * within about a screen of the viewport — the scroll bar, the jump button and
 * the grade bands all behave as if the whole path were there, because as far as
 * layout is concerned it is.
 */
function LazyPath({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* a screen and a half of runway either way — enough that a fast fling never
       overtakes the mount */
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '1200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <Box ref={ref} sx={{ minHeight: `${height}px` }}>{near ? children : null}</Box>;
}

function PathSection({ lessons, currentId, onPick }: {
  lessons: RoadLesson[]; currentId?: string; onPick: (l: RoadLesson) => void;
}) {
  const pts = lessons.map((_, i) => ({ x: i % 2 === 0 ? OFF : -OFF, y: i * ROW + TILE / 2 }));
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${a.x} ${a.y + ROW * 0.55}, ${b.x} ${b.y - ROW * 0.55}, ${b.x} ${b.y}`;

  return (
    /* The top margin is the BAŞLA flag's room, not decoration: the label floats
       26px above its tile and bobs 4px higher still, and the current lesson is
       now the first one in its grade — with the old 10px it sat behind the
       sticky grade band. `LABEL_LIFT` keeps the two numbers tied together. */
    <Box sx={{ position: 'relative', height: lessons.length * ROW, mt: `${LABEL_LIFT + 14}px`, mb: '10px' }}>
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
                  position: 'absolute', top: `-${LABEL_LIFT - 4}px`, left: '50%', transform: 'translateX(-50%)',
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
            {/* Centred on the tile and free to be taller than it: pinned to the
                row's own height, the flex box shrank the title instead of
                clamping it, which cut the third line through the middle of the
                letters and left no room for the ellipsis. Rows are 118px apart
                and a three-line label is ~77px, so growing past the 68px tile
                stays clear of the neighbours. */}
            <Box sx={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              ...(right
                ? { left: '16px', right: `calc(50% - ${OFF - TILE / 2 - GAP}px)`, alignItems: 'flex-end', textAlign: 'right' }
                : { right: '16px', left: `calc(50% - ${OFF - TILE / 2 - GAP}px)`, textAlign: 'left' }),
            }}>
              {/* Curriculum themes run long — one of Algebra's is a hundred
                  characters. Three lines is what fits between two tiles on the
                  winding path, and the third ends in an ellipsis so a clipped
                  title reads as clipped; the sheet behind the tile prints the
                  whole thing, so nothing is lost. `anywhere` is for the terms
                  that arrive as one unbroken 30-letter word. */}
              <Typography sx={{
                fontSize: 15, fontWeight: 600, lineHeight: 1.25,
                color: locked ? tokens.ink3 : tokens.ink,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis', overflowWrap: 'anywhere',
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

/* ---------------- Screen ---------------- */
export function RoadmapScreen({ subject, openAt, onBack, toast, onUpgrade }: {
  subject: CurriculumSubject;
  /** the grade to open on, when the reader came from a grade-filtered list */
  openAt?: number;
  onBack: () => void; toast: (m: string) => void; onUpgrade: () => void;
}) {
  const canRoadmap = useCan('roadmap');
  const GRADES = useMemo(() => pathFor(subject), [subject]);
  /* the grade the free tier gets in full — the subject's own first grade, which
     is 1 for Informatika and 7 for Algebra; "grade 1" was only ever a stand-in
     for "where this subject starts" */
  const freeGrade = GRADES[0].grade;
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<Kind | null>(null);
  const [activeGrade, setActiveGrade] = useState(openAt ?? freeGrade);
  const [sheet, setSheet] = useState<RoadLesson | null>(null);
  const [lessonOpen, setLessonOpen] = useState<RoadLesson | null>(null);
  /* lessons completed in this session — the path advances live */
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const filterActive = !!kindFilter || !!query.trim();

  const resolved: GradeSection[] = useMemo(() => GRADES.map((g) => ({
    ...g,
    lessons: g.lessons.map((l) => ({ ...l, done: doneIds.includes(l.id) })),
  })), [GRADES, doneIds]);

  /* grades are looked up by number, never by position: a subject is taught in
     the grades the programme gives it — Algebra starts at 7, Himiýa at 8 — so
     `resolved[grade - 1]` was an index into a list that no longer starts at 1 */
  const gradeOf = (grade: number) => resolved.find((g) => g.grade === grade) ?? resolved[0];

  /* Where you are is the first lesson you have not finished — anywhere in the
     path, starting at 1-nji synp. It used to be read out of the grade the
     student sits in at school, which opened the page in the middle of a road
     they had not walked yet. */
  const current = resolved
    .flatMap((g) => g.lessons.map((l) => ({ lesson: l, grade: g.grade })))
    .find((x) => !x.lesson.done);
  const currentId = current?.lesson.id;
  const currentGrade = current?.grade ?? resolved[resolved.length - 1].grade;
  const me = gradeOf(currentGrade);
  const currentLesson = current?.lesson;
  const doneCount = me.lessons.filter((l) => l.done).length;
  const pct = Math.round((doneCount / me.lessons.length) * 100);

  /* Only the kinds this subject actually has get a chip. Lesson kinds are read
     off the material now, so a subject with no interactive lesson has no
     Interaktiw filter — a chip that can only ever return "hiç zat tapylmady" is
     a promise the data cannot keep. */
  const kindsPresent = useMemo(
    () => KINDS.filter((k) => GRADES.some((g) => g.lessons.some((l) => l.kind === k))),
    [GRADES],
  );

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
    let current = sections[0]?.grade ?? freeGrade;
    for (const g of sections) {
      const node = sectionRefs.current[g.grade];
      if (node && node.offsetTop <= probe) current = g.grade;
    }
    setActiveGrade(current);
  };
  useEffect(onScroll, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  /* A search rewrites the page under you: the grades keep their order but not
     their heights, so wherever you were standing means nothing afterwards.
     Start the results from the top, next to the box you typed in. */
  useEffect(() => {
    if (filterActive) scrollRef.current?.scrollTo({ top: 0 });
  }, [query, kindFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Land where the reader was looking: the grade they filtered the subject list
     to, or else the lesson they have to take next. One frame late, because the
     grade holding either mounts when the observer above first reports it. */
  useEffect(() => {
    const t = setTimeout(() => {
      const band = openAt !== undefined ? sectionRefs.current[openAt] : null;
      if (band) { band.scrollIntoView({ block: 'start' }); return; }
      scrollRef.current?.querySelector('[data-current="true"]')?.scrollIntoView({ block: 'center' });
    }, 60);
    return () => clearTimeout(t);
  }, [openAt]);

  /* One button at a time */
  const navGrades = sections.map((s) => s.grade);
  const nextG = navGrades.find((g) => g > activeGrade);
  const prevG = [...navGrades].reverse().find((g) => g < activeGrade);
  const up = activeGrade > currentGrade || nextG === undefined;
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
  const sheetPaid = !canRoadmap && !!sheet && sheet.grade > freeGrade;

  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fff' }}>
      <Box ref={scrollRef} onScroll={onScroll}
        sx={{
          position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
        <PillHeader
          title={subject.name}
          onBack={onBack}
          /* the shared bookmark, not a second private one: this page used to
             keep its own `saved` flag, which meant the star here and the
             collection under Gollanmalar knew nothing about each other */
          action={(
            <BookmarkButton item={{
              kind: 'tema',
              id: subject.slug,
              title: subject.name,
              /* the grades this subject is actually taught, not a blanket 1–12 */
              sub: `${gradeLabel(freeGrade)} – ${gradeLabel(GRADES[GRADES.length - 1].grade)}`,
            }} />
          )}
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

          {/* Activity-type filter — the same chip row the subject list uses */}
          <ChipRow
            label="Sapak görnüşi"
            value={kindFilter ?? ''}
            onChange={(id) => setKindFilter((id || null) as Kind | null)}
            chips={[
              /* stands on its own beside the kind names, so the pronoun, not the
                 bare adjective — the same chip the subject list opens with */
              { id: '', label: 'Ählisi' },
              ...kindsPresent.map((k) => ({
                id: k,
                label: KIND_META[k].label,
                icon: KIND_META[k].icon(15),
                accent: KIND_META[k].ink,
                tint: KIND_META[k].tint,
              })),
            ]}
          />

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
                  bgcolor: '#fff', color: tokens.blueText, fontSize: 14, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center',
                }}>Başla</Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Ähli sapaklar tamamlandy 🎉</Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                sx={{ height: 8, borderRadius: `${tokens.rPill}px`, bgcolor: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
                <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: `${tokens.rPill}px`, bgcolor: tokens.gold, transition: 'width .4s ease' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, opacity: .85 }}>
                  {doneCount}/{me.lessons.length} sapak tamamlandy
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{gradeLabel(currentGrade)}</Typography>
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
          const all = gradeOf(g.grade).lessons;
          const total = all.length;
          const doneN = all.filter((l) => l.done).length;
          const complete = doneN === total;
          /* Free tier keeps the subject's first grade; the rest say so in the
             band rather than only when a lesson sheet opens. */
          const paidGrade = !canRoadmap && g.grade > freeGrade;
          const caption = filterActive
            ? `${g.lessons.length} sapak tapyldy`
            : paidGrade ? `${planName} · ${total} sapak`
              : complete ? `${total} sapak tamamlandy`
                : `${doneN}/${total} tamamlandy`;
          return (
            <Box key={g.grade} ref={(el: HTMLDivElement | null) => { sectionRefs.current[g.grade] = el; }}>
              {/* One band for every grade: sticky below the header while its path scrolls */}
              <Box
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
                </Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.blueText }}>
                  {caption}
                </Typography>
              </Box>
              <LazyPath height={pathHeight(g.lessons.length)}>
                <PathSection lessons={g.lessons} currentId={currentId} onPick={setSheet} />
              </LazyPath>
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
                  <SparkleIcon size={16} />{`${gradeLabel(freeGrade)} mugt — galan synplar ${planName} bilen`}
                </Box>
              ) : sheet.done ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.greenText, fontSize: 14, fontWeight: 600 }}>
                  <CheckIcon size={15} />Tamamlandy — gaýtadan geçip bilersiňiz
                </Box>
              ) : sheetLocked ? (
                /* The lock marks where you are on the path, it does not shut the
                   door: a student who wants to read ahead — or back — may. */
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.inkMuted, fontSize: 14, fontWeight: 600 }}>
                  <LockIcon size={16} />Nobaty entek gelmedi — isleseňiz häzir okap bilersiňiz
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
                onClick={() => {
                  if (!sheet) return;
                  if (sheetPaid) { setSheet(null); onUpgrade(); return; }
                  openLesson(sheet);
                }}
              >
                {sheetPaid ? `${planName} al` : sheet.done ? 'Gaýtadan gör' : sheetLocked ? 'Öňünden oka' : 'Başla'}
              </Button>
            </Box>
          </>
        )}
      </SheetDrawer>

      {/* Full-screen lesson page */}
      {lessonOpen && (
        <LessonScreen
          lesson={lessonOpen}
          subjectSlug={subject.slug}
          meta={KIND_META[lessonOpen.kind]}
          onClose={() => setLessonOpen(null)}
          onComplete={completeLesson}
          onUpgrade={() => { setLessonOpen(null); onUpgrade(); }}
        />
      )}
    </Box>
  );
}
