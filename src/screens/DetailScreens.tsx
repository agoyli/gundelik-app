import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BooksIcon, BuildingIcon, CalendarDotIcon, CardsIcon, CheckIcon, ClockIcon, CoinIcon, GlobeIcon,
  HistoryIcon, ListIcon, LockIcon, MedalIcon, PhoneIcon, PlayCircleIcon, QuizIcon, TrophyIcon,
  UsersIcon,
} from '../components/Icons';
import { PrizeArt } from '../components/PrizeArt';
import {
  BookmarkButton, ChipRow, DoneBadge, EmptyState, IconBadge, RankRow, RowChevron,
  SectionHeading, SectionLabel, StatTile, StickyFooter, SubPage, SurfaceRow,
} from '../components/Ui';
import type { Chip } from '../components/Ui';
import {
  CONTEST_LEVEL, OLYMPIAD_STAGE, PACKS_PER_CONTEST, POINTS_PER_ANSWER,
  olympiadEntrants, olympiadSelf, olympiadTitle,
} from '../data/guides';
import type {
  Book, Deck, IntlOlympiad, Olympiad, OlympiadResult, PrizeContest, PrizePhase,
} from '../data/guides';
import { contestPacks } from '../data/library';
import type { ContestPack, DeckMeta, DeckSubject, TestItem, TestSubject } from '../data/library';
import { loadLesson } from '../data/lessons';
import { contestTotals, fmtDuration, savePackRun, useContestRuns } from '../state/contest';
import { absDate, dayMonth, fmtWhen, untilParts } from '../lib/date';
import { ordinal } from '../lib/tm';
import { QuizQuestions, QuizResult, useQuiz } from '../components/Quiz';
import type { QuizQuestion } from '../components/Quiz';
import { tokens } from '../theme';

/*
 * The third level of Gollanmalar. Every section list now opens a detail page
 * before anything commits: what it is, how it is scored, how you did last time.
 * All five share one skeleton — Hero → stat strip → prose → list(s) → sticky CTA —
 * so the sections stay recognisably one family.
 */

type Toast = (m: string) => void;

/* ---------------- shared detail furniture ---------------- */

/* Tinted introduction panel: icon, optional state pill, title, meta line */
function Hero({ tint, accent, icon, badge, title, meta }: {
  tint: string; accent: string; icon: ReactNode; badge?: ReactNode; title: string; meta: string;
}) {
  return (
    <Box sx={{
      mt: '14px', bgcolor: tint, borderRadius: `${tokens.rCard}px`, p: '18px',
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <IconBadge bg="#fff" color={accent} size={56} radius={18}>{icon}</IconBadge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {badge}
        <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', mt: badge ? '6px' : 0 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px' }}>{meta}</Typography>
      </Box>
    </Box>
  );
}

const StatePill = ({ label, color }: { label: string; color: string }) => (
  <Box sx={{
    display: 'inline-grid', placeItems: 'center', px: '10px', height: 24,
    borderRadius: `${tokens.rPill}px`, bgcolor: '#fff', color,
    fontSize: 12, fontWeight: 700,
  }}>{label}</Box>
);

const Card = ({ title, children }: { title?: string; children: ReactNode }) => (
  <Box sx={{
    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  }}>
    {title && <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Typography>}
    {children}
  </Box>
);

const Prose = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.55 }}>{children}</Typography>
);

/* Numbered steps — rules, how-to-play, anything ordered */
const Steps = ({ items, accent }: { items: string[]; accent: string }) => (
  <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {items.map((s, i) => (
      <Box component="li" key={s} sx={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
        <Box aria-hidden sx={{
          width: 22, height: 22, borderRadius: '50%', flex: 'none', mt: '1px',
          bgcolor: '#fff', color: accent, display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        }}>{i + 1}</Box>
        <Typography sx={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5 }}>{s}</Typography>
      </Box>
    ))}
  </Box>
);

/* Medal palette, shared with RankRow — 1st gold, 2nd silver, 3rd bronze, rest grey */
const MEDAL = [tokens.gold, tokens.silver, tokens.bronze];

const RankList = ({ rows }: { rows: { rank: number; name: string; sub: string; points: number; self?: boolean }[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {rows.map((r) => <RankRow key={r.rank} {...r} />)}
  </Box>
);

/* ---------------- Olimpiada ---------------- */

/*
 * A place inside a grade, from the percentages alone.
 *
 * Standard competition ranking: equal scores share a place and the next one
 * skips, because two pupils who wrote the same paper equally well did not come
 * 2nd and 3rd — the alternative is a tie broken by array order, which is a
 * ranking invented by whoever typed the list.
 */
const placed = (students: OlympiadResult[]) => {
  const sorted = [...students].sort((a, b) => b.percent - a.percent);
  let place = 0;
  return sorted.map((s, i) => {
    if (i === 0 || s.percent !== sorted[i - 1].percent) place = i + 1;
    return { ...s, place };
  });
};

/*
 * A result row: place, who, and the percentage.
 *
 * It is RankRow's shape on purpose — same medal, same two lines, same height —
 * because a reader who has seen the contest rating should not have to learn a
 * second table. What changes is the figure on the right: a percentage is out of
 * a known 100, so it carries a meter and the colour that says whether it is
 * good, where a points pill would imply a prize nobody is handing out.
 */
function ResultRow({ place, name, school, percent, self }: {
  place: number; name: string; school: string; percent: number; self?: boolean;
}) {
  const color = scoreColor(percent);
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '13px', minHeight: 64,
      bgcolor: self ? tokens.blueTint : tokens.surface,
      border: `1.5px solid ${self ? tokens.blue : 'transparent'}`,
      borderRadius: `${tokens.rRow}px`, px: '13px', py: '10px',
    }}>
      <Box sx={{ color: MEDAL[place - 1] ?? tokens.inkDisabled, display: 'flex', flex: 'none' }}
        aria-label={`${ordinal(place)} orun`}>
        <MedalIcon n={place} size={30} />
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
        <Typography sx={{ fontSize: 13, color: tokens.inkMuted, mt: '1px' }} noWrap>{school}</Typography>
      </Box>
      <Box sx={{ flex: 'none', width: 62 }}>
        <Typography sx={{
          fontSize: 17, fontWeight: 700, color, textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}>{percent}%</Typography>
        <Box aria-hidden sx={{
          mt: '5px', height: 4, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.surfacePress, overflow: 'hidden',
        }}>
          <Box sx={{ height: '100%', width: `${percent}%`, borderRadius: `${tokens.rPill}px`, bgcolor: color }} />
        </Box>
      </Box>
    </Box>
  );
}

/*
 * An olympiad, which is a results page and nothing else.
 *
 * There is no CTA down here. The paper was sat weeks ago in a hall; the only
 * honest button would be one that does nothing, and a page that ends with a
 * disabled "Goşul" reads as a broken contest rather than a finished olympiad.
 *
 * The grades are a chip row rather than four boards stacked, because places are
 * only comparable inside one grade — showing three at once invites exactly the
 * comparison the ranking refuses to make. The row opens on the reader's own
 * grade when they sat it, which is the board they came for.
 */
export function OlympiadDetailScreen({ olympiad, onBack }: {
  olympiad: Olympiad; onBack: () => void;
}) {
  const st = OLYMPIAD_STAGE[olympiad.stage];
  const self = olympiadSelf(olympiad);
  const selfGrade = olympiad.grades.find((g) => g.students.some((s) => s.self))?.grade;
  const [grade, setGrade] = useState<number>(selfGrade ?? olympiad.grades[0].grade);

  const board = olympiad.grades.find((g) => g.grade === grade) ?? olympiad.grades[0];
  const rows = placed(board.students);
  const selfPlace = selfGrade === undefined ? undefined
    : placed(olympiad.grades.find((g) => g.grade === selfGrade)!.students).find((r) => r.self)?.place;

  const chips: Chip[] = olympiad.grades.map((g) => ({ id: String(g.grade), label: `${ordinal(g.grade)} synp` }));

  return (
    <SubPage
      title="Olimpiada"
      onBack={onBack}
      action={<BookmarkButton item={{
        kind: 'contest', id: olympiad.id, title: olympiadTitle(olympiad),
        sub: `${st.label} · ${absDate(olympiad.date)}`,
      }} />}
    >
      <Hero
        tint={st.tint} accent={st.color}
        icon={<TrophyIcon size={28} />}
        badge={<StatePill label={st.label} color={st.color} />}
        title={olympiadTitle(olympiad)}
        meta={`${absDate(olympiad.date)} · ${olympiadEntrants(olympiad)} gatnaşyjy`}
      />

      {/* Three figures, and which three depends on whether the reader sat it:
          their own result first when there is one, the field's shape when not. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        {self && selfPlace !== undefined ? (
          <>
            <StatTile value={`${self.percent}%`} label="Netijäň" color={scoreColor(self.percent)} />
            <StatTile value={ordinal(selfPlace)} label={`Orun · ${ordinal(selfGrade!)} synp`} color={tokens.ink} />
            <StatTile value={`${olympiadEntrants(olympiad)}`} label="Gatnaşyjy" color={tokens.blueText} />
          </>
        ) : (
          <>
            <StatTile value={`${olympiadEntrants(olympiad)}`} label="Gatnaşyjy" color={tokens.ink} />
            <StatTile value={`${olympiad.grades.length}`} label="Synp" color={tokens.ink} />
            <StatTile
              value={`${Math.max(...olympiad.grades.flatMap((g) => g.students.map((s) => s.percent)))}%`}
              label="Iň ýokary" color={tokens.greenText}
            />
          </>
        )}
      </Box>

      <Box sx={{ mt: '14px' }}>
        <Card title="Olimpiada barada"><Prose>{olympiad.about}</Prose></Card>
      </Box>

      <SectionLabel>Netijeler</SectionLabel>
      <ChipRow label="Synp" chips={chips} value={String(board.grade)} onChange={(id) => setGrade(Number(id))} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '12px' }}>
        {rows.map((r) => (
          <ResultRow key={r.name} place={r.place} name={r.name} school={r.school} percent={r.percent} self={r.self} />
        ))}
      </Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '12px', px: '4px' }}>
        Netijeler işiň umumy balyndan göterim hökmünde berilýär. Orunlar her synpda aýratyn kesgitlenýär.
      </Typography>
    </SubPage>
  );
}

/* ---------------- Halkara olimpiada ---------------- */

/*
 * The one page in this section that is about something that has not happened
 * yet — and so the one with a button.
 *
 * A family reading this wants three facts and usually gives up before finding
 * them: which stage has to be won first, when the application closes, and who
 * to ring. So those are the stat strip, above the prose, and the number is a
 * real `tel:` link in the footer rather than a string to copy out by hand.
 */
export function IntlOlympiadScreen({ item, onBack }: { item: IntlOlympiad; onBack: () => void }) {
  const st = OLYMPIAD_STAGE[item.through];
  const closed = untilParts(`${item.deadline}T23:59`).past;

  return (
    <SubPage
      title={item.short}
      onBack={onBack}
      action={<BookmarkButton item={{
        kind: 'contest', id: item.id, title: item.name, sub: `${item.subject} · ${item.short}`,
      }} />}
    >
      <Hero
        tint={tokens.purpleTint} accent={tokens.purpleText}
        icon={<GlobeIcon size={28} />}
        badge={<StatePill label="Halkara" color={tokens.purpleText} />}
        title={item.name}
        meta={`${item.subject} · ${item.short}`}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        {/* one accent in the strip, and it goes to the date that runs out —
            the stage is a fact, the deadline is the thing you can still miss */}
        <StatTile value={st.short} label="Saýlaw derejesi" color={tokens.ink} />
        <StatTile
          value={dayMonth(item.deadline)} label={closed ? 'Möhlet geçdi' : 'Arza möhleti'}
          color={closed ? tokens.ink3 : tokens.orangeText}
        />
        <StatTile value={dayMonth(item.when)} label="Geçirilýär" color={tokens.ink} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
        <Card title="Olimpiada barada"><Prose>{item.about}</Prose></Card>
        <Card title="Kim gatnaşyp bilýär"><Prose>{item.who}</Prose></Card>
        <Card title="Nädip gatnaşmaly"><Steps items={item.apply} accent={tokens.purpleText} /></Card>
        <Card title="Habarlaşmak üçin">
          {item.contacts.map((c, i) => (
            <Box
              key={c.phone}
              component="a"
              href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}
              aria-label={`${c.label}: ${c.phone}`}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', minHeight: 48,
                textDecoration: 'none', color: 'inherit',
                borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none', pt: i > 0 ? '10px' : 0,
              }}
            >
              <IconBadge bg="#fff" color={tokens.blueText} size={36} radius={tokens.rTile}>
                <PhoneIcon size={18} />
              </IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.blueText }} noWrap>{c.phone}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{c.label}</Typography>
              </Box>
              <RowChevron />
            </Box>
          ))}
        </Card>
      </Box>

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          href={`tel:${item.contacts[0].phone.replace(/[^+\d]/g, '')}`}
        >
          Jaň etmek
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Baýrakly bäsleşik ---------------- */

/*
 * The timer, and the only ticking thing in the app.
 *
 * It counts to the contest's own `startsAt` from the app's now (`appNow` — the
 * fixed day, the device's clock), and it re-renders once a second rather than
 * on a frame: nothing on it moves faster than the seconds cell. The four cells
 * are fixed-width and tabular so the row does not jitter as 9 becomes 10, and
 * the whole strip is one `role="timer"` with a written-out label, because
 * "23 : 12 : 23 : 21" read out cell by cell is not a sentence.
 */
function Countdown({ to, caption, accent, tint }: {
  to: string; caption: string; accent: string; tint: string;
}) {
  const [left, setLeft] = useState(() => untilParts(to));
  useEffect(() => {
    if (left.past) return undefined;
    const id = setInterval(() => setLeft(untilParts(to)), 1000);
    return () => clearInterval(id);
  }, [to, left.past]);

  const cells: [number, string, string][] = [
    [left.days, 'Gün', 'gün'],
    [left.hours, 'Sagat', 'sagat'],
    [left.mins, 'Min', 'minut'],
    [left.secs, 'Sek', 'sekunt'],
  ];

  return (
    <Box sx={{ bgcolor: tint, borderRadius: `${tokens.rCard}px`, p: '14px 16px 16px', mt: '12px' }}>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, textAlign: 'center' }}>
        {caption}
      </Typography>
      <Box
        role="timer"
        aria-label={`${caption}: ${cells.map(([v, , word]) => `${v} ${word}`).join(' ')}`}
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', mt: '8px' }}
      >
        {cells.map(([value, label], i) => (
          <Box key={label} sx={{ position: 'relative', textAlign: 'center' }}>
            <Typography aria-hidden sx={{
              fontSize: 26, fontWeight: 700, color: accent, letterSpacing: '-.5px',
              fontVariantNumeric: 'tabular-nums',
            }}>{String(value).padStart(2, '0')}</Typography>
            <Typography aria-hidden sx={{ fontSize: 12, color: tokens.ink3, mt: '2px' }}>{label}</Typography>
            {/* the separator belongs between cells, so the last one has none */}
            {i < cells.length - 1 && (
              <Typography aria-hidden sx={{
                position: 'absolute', right: -4, top: 0, fontSize: 20, fontWeight: 700, color: accent,
                opacity: .35,
              }}>:</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Where the contest is in its own life. Two dates, three phases, no stored flag. */
export const prizePhase = (c: PrizeContest): PrizePhase => {
  if (!untilParts(c.startsAt).past) return 'soon';
  return untilParts(c.endsAt).past ? 'done' : 'live';
};

const PHASE_META: Record<PrizePhase, { label: string; color: string; tint: string }> = {
  soon: { label: 'Ýakynda', color: tokens.blueText, tint: tokens.blueTint },
  live: { label: 'Dowam edýär', color: tokens.orangeText, tint: tokens.orangeTint },
  done: { label: 'Tamamlandy', color: tokens.ink3, tint: tokens.surface },
};

/*
 * One prize, on a page of its own.
 *
 * Three prizes on the contest page are a table — place, name, one line — and a
 * table is the right shape for comparing them and the wrong one for looking at
 * one. This is the looking-at-one page: the drawing at the size it is worth
 * drawing, the model written under it, and the sponsor who put it up, which is
 * the fact the contest page has no room for and the reader most often wants.
 */
function PrizeDetailScreen({ contest, index, onBack }: {
  contest: PrizeContest; index: number; onBack: () => void;
}) {
  const prize = contest.prizes[index];
  const medal = [tokens.gold, tokens.silver, tokens.bronze][index] ?? tokens.surfacePress;
  return (
    <SubPage title={prize.place} onBack={onBack}>
      <Box sx={{
        mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        p: '24px 18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
      }}>
        <PrizeArt art={prize.art} size={132} />
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', height: 30, px: '12px',
          borderRadius: `${tokens.rPill}px`, bgcolor: medal, color: tokens.ink,
          fontSize: 13, fontWeight: 700,
        }}>{prize.place}</Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px' }}>{prize.item}</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.ink3, mt: '4px' }}>{prize.note}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
        <Card title="Baýragy goýan">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: 44 }}>
            <IconBadge bg="#fff" color={tokens.blueText} size={36} radius={tokens.rTile}>
              <BuildingIcon size={18} />
            </IconBadge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{prize.by}</Typography>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>
                {contest.sponsors.find((s) => s.name === prize.by)?.note ?? 'Sponsor'}
              </Typography>
            </Box>
          </Box>
        </Card>
        <Card title="Nädip gazanmaly">
          <Prose>
            {`${contest.title}: ${PACKS_PER_CONTEST} test toplumyny çöz, her dogry jogap üçin ${POINTS_PER_ANSWER} bal. Bäsleşik tamamlananda iň köp bal toplan okuwçy bu baýragy alýar.`}
          </Prose>
        </Card>
      </Box>
    </SubPage>
  );
}

/*
 * One pack, being solved.
 *
 * The questions are the programme's own — a pack *is* a theme's test bank
 * (`contestPacks`) — so this is the app's one quiz component with two things
 * added that a contest needs and a test does not: a stopwatch, because the time
 * a pack took is half of what the standing is built from, and a save on the way
 * out, because the result has to survive leaving the page.
 */
function PackRunScreen({ contest, pack, index, onBack, toast }: {
  contest: PrizeContest; pack: ContestPack; index: number; onBack: () => void; toast: Toast;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const quiz = useQuiz(questions ?? []);
  const startedAt = useRef(0);
  const saved = useRef(false);

  /* the pack's banks, fetched together when it is opened — a pack is three
     themes, and asking them one file at a time would show the reader a loading
     state between question four and question five */
  useEffect(() => {
    let alive = true;
    Promise.all(pack.tests.map((t) => loadLesson(t.grade, t.slug, t.no)))
      .then((themes) => {
        if (!alive) return;
        const qs = themes.flatMap((theme) => (theme
          ? theme.test.map((q) => ({ ...q, theme: theme.title }))
          : []));
        if (qs.length === 0) { setFailed(true); return; }
        setQuestions(qs);
        startedAt.current = Date.now();
        quiz.start();
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
    /* one fetch per pack; the quiz object is recreated on every render */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack.id]);

  /* the stopwatch runs while questions are open and stops at the result */
  useEffect(() => {
    if (!quiz.inQuestions) return undefined;
    const id = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 1000);
    return () => clearInterval(id);
  }, [quiz.inQuestions]);

  /* reaching the result is what banks the run — once, however often it renders */
  useEffect(() => {
    if (quiz.stage !== 'result' || !questions || saved.current) return;
    saved.current = true;
    const seconds = (Date.now() - startedAt.current) / 1000;
    setElapsed(seconds);
    savePackRun(contest.id, pack.id, { correct: quiz.score, total: questions.length, seconds });
    toast(`${quiz.score * POINTS_PER_ANSWER} bal gazanyldy`);
  }, [quiz.stage, quiz.score, questions, contest.id, pack.id, toast]);

  const title = `${index + 1}-nji toplum`;

  if (failed) {
    return (
      <SubPage title={title} onBack={onBack}>
        <EmptyState
          icon={<QuizIcon size={26} />}
          title="Toplum açylmady"
          note="Sowallar alynmady — birikmäňizi barlaň we gaýtadan synanyşyň."
        />
      </SubPage>
    );
  }

  if (!questions) {
    return (
      <SubPage title={title} onBack={onBack}>
        <EmptyState
          icon={<QuizIcon size={26} />}
          title="Açylýar…"
          note={`${pack.subject} · ${ordinal(pack.grade)} synp`}
        />
      </SubPage>
    );
  }

  return (
    <SubPage title={title} onBack={onBack}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '4px' }}>
        {/* the clock is stated while it runs, not only at the end: a reader
            being timed is entitled to see the time */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          color: tokens.ink3,
        }}>
          <ClockIcon />
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {fmtDuration(elapsed)}
          </Typography>
        </Box>

        {quiz.inQuestions && (
          <QuizQuestions questions={questions} quiz={quiz} accent={tokens.orangeText} onQuit={onBack} />
        )}
        {quiz.stage === 'result' && (
          <>
            <Box sx={{
              bgcolor: tokens.orangeTint, borderRadius: `${tokens.rCard}px`, p: '16px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <IconBadge bg="#fff" color={tokens.orangeText} size={44}><CoinIcon size={22} /></IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                  {quiz.score * POINTS_PER_ANSWER} bal
                </Typography>
                <Typography sx={{ fontSize: 13, color: tokens.ink3 }}>
                  {`${quiz.score}/${questions.length} dogry · ${fmtDuration(elapsed)}`}
                </Typography>
              </Box>
            </Box>
            <QuizResult
              questions={questions}
              quiz={quiz}
              extra={(
                <ButtonBase
                  onClick={onBack}
                  sx={{
                    height: 32, px: '14px', borderRadius: `${tokens.rPill}px`,
                    bgcolor: tokens.surfacePress, color: tokens.ink, fontSize: 13.5, fontWeight: 600,
                  }}
                >Bäsleşige dolan</ButtonBase>
              )}
            />
          </>
        )}
      </Box>
    </SubPage>
  );
}

/*
 * A prize contest's page.
 *
 * The same skeleton as every other detail page — Hero, stat strip, prose cards,
 * a list, one sticky commitment — carrying the four blocks this kind of contest
 * needs and no other page has: the countdown, the prizes as *objects* (each its
 * own page), the sponsors who put them up, and the packs the standing is
 * actually earned from.
 *
 * Nothing here is stored twice. The phase comes from the dates, the totals come
 * from the runs, and the reader's place in the rating is their own earned
 * points sorted in with everyone else's — not a seeded number that would go on
 * claiming 1000 bal for someone who has not answered a question.
 */
export function PrizeContestScreen({ contest, onBack, toast }: {
  contest: PrizeContest; onBack: () => void; toast: Toast;
}) {
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [packIndex, setPackIndex] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  const runs = useContestRuns(contest.id);
  const totals = contestTotals(runs);
  const packs = useMemo(() => contestPacks(contest.id, PACKS_PER_CONTEST), [contest.id]);
  const phase = prizePhase(contest);
  const meta = PHASE_META[phase];
  const level = CONTEST_LEVEL[contest.level];

  if (packIndex !== null && packs[packIndex]) {
    return (
      <PackRunScreen
        contest={contest}
        pack={packs[packIndex]}
        index={packIndex}
        onBack={() => setPackIndex(null)}
        toast={toast}
      />
    );
  }
  if (prizeIndex !== null) {
    return <PrizeDetailScreen contest={contest} index={prizeIndex} onBack={() => setPrizeIndex(null)} />;
  }

  /* The reader's own row is their own points — everyone else's are the seeded
     standing — and the whole table is re-sorted and re-ranked around it, so
     solving a pack visibly moves you rather than updating a number in place. */
  const rows = [
    ...contest.leaders.filter((l) => !l.self),
    ...(phase === 'done'
      ? contest.leaders.filter((l) => l.self)
      : [{ name: 'Muhammet M.', sub: '16-njy mekdep, 8B', points: totals.points, self: true }]),
  ]
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const self = rows.find((r) => r.self);
  const selfRank = self?.rank ?? 0;

  const openPack = (i: number) => {
    if (phase === 'soon') { toast('Bäsleşik başlanda toplumlar açylýar'); return; }
    if (phase === 'done') { toast('Bäsleşik tamamlandy — toplumlar ýapyk'); return; }
    setPackIndex(i);
  };

  return (
    <SubPage
      title="Bäsleşik"
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'contest', id: contest.id, title: contest.title, sub: `Baýrakly · ${absDate(contest.startsAt.slice(0, 10))}` }} />}
    >
      <Hero
        tint={meta.tint} accent={meta.color}
        icon={<TrophyIcon size={28} />}
        badge={<StatePill label={meta.label} color={meta.color} />}
        title={contest.title}
        meta={`${fmtWhen(contest.startsAt)} · ${contest.players} gatnaşyjy`}
      />

      {/* A finished contest reports the standing it finished on; a running one
          reports what the reader has earned so far. The same three tiles filled
          from the live runs on a closed contest would print 0 bal under a
          rating that has the reader at 1251. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={level.label} label="Derejesi" color={level.color} />
        {phase === 'done' ? (
          <>
            <StatTile value={`${self?.points ?? 0}`} label="Netijäň" color={tokens.orangeText} />
            <StatTile value={selfRank ? `${ordinal(selfRank)}` : '—'} label="Orun" color={tokens.ink} />
          </>
        ) : (
          <>
            <StatTile value={`${totals.points}`} label="Toplan balyň" color={tokens.orangeText} />
            <StatTile value={`${totals.packs}/${packs.length}`} label="Toplum" color={tokens.ink} />
          </>
        )}
      </Box>

      {phase !== 'done' && (
        <Countdown
          to={phase === 'soon' ? contest.startsAt : contest.endsAt}
          caption={phase === 'soon' ? 'Bäsleşigiň başlanmagyna galan wagt' : 'Bäsleşigiň tamamlanmagyna galan wagt'}
          accent={tokens.orangeText}
          tint={tokens.orangeTint}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
        <Card title="Bäsleşik barada"><Prose>{contest.about}</Prose></Card>

        <Card title="Baýraklar">
          {contest.prizes.map((p, i) => (
            <ButtonBase
              key={p.place}
              onClick={() => setPrizeIndex(i)}
              aria-label={`${p.place}: ${p.item}`}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left',
                minHeight: 56, borderRadius: `${tokens.rTile}px`,
                borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none', pt: i > 0 ? '10px' : 0,
              }}
            >
              <PrizeArt art={p.art} size={48} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* the prize is the row's identity; the place is the value it is
                    ranked by, so the place goes on the right like any value */}
                <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{p.item}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{p.note}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: tokens.ink3, flex: 'none' }}>{p.place}</Typography>
              <RowChevron />
            </ButtonBase>
          ))}
        </Card>

        <Card title="Sponsorlar">
          {contest.sponsors.map((s, i) => (
            <Box key={s.name} sx={{
              display: 'flex', alignItems: 'center', gap: '12px', minHeight: 44,
              borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none', pt: i > 0 ? '10px' : 0,
            }}>
              <IconBadge bg="#fff" color={tokens.blueText} size={36} radius={tokens.rTile}>
                <BuildingIcon size={18} />
              </IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{s.name}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{s.note}</Typography>
              </Box>
            </Box>
          ))}
        </Card>
      </Box>

      {/*
        * Where the points come from.
        *
        * A contest that only shows a leaderboard is a scoreboard for a game
        * nobody can see being played. These are the ten packs the standing is
        * built from: each one a theme's real question bank, each worth ten bal
        * a right answer, each keeping the time it took — which is the second
        * thing the rating is settled by when two readers land on the same score.
        */}
      {/* A closed contest does not list ten locked packs: they are not an
          invitation any more, and the results below are the whole story. */}
      {phase !== 'done' && (
        <SectionHeading
          title="Bal gazan"
          action={(
            <Typography sx={{ fontSize: 13, color: tokens.ink3, fontVariantNumeric: 'tabular-nums' }}>
              {totals.packs > 0 ? `${fmtDuration(totals.seconds)} sarp edildi` : `${POINTS_PER_ANSWER} bal · her jogap`}
            </Typography>
          )}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {phase === 'done' ? null : packs.map((p, i) => {
          const run = runs[p.id];
          const shut = phase !== 'live';
          return (
            <SurfaceRow
              key={p.id}
              icon={run
                ? <IconBadge bg={tokens.greenTint} color={tokens.greenText} size={44}><CheckIcon size={20} /></IconBadge>
                : (
                  <IconBadge bg={shut ? tokens.lockTile : tokens.orangeTint} color={shut ? tokens.lockInk : tokens.orangeText} size={44}>
                    {shut ? <LockIcon size={20} /> : (
                      <Typography sx={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</Typography>
                    )}
                  </IconBadge>
                )}
              label={`${i + 1}-nji toplum`}
              labelSx={{ fontSize: 15, fontWeight: 600 }}
              /* Solved packs report what they earned; unsolved ones report what
                 they are — the subject and grade the bank comes from, which is
                 the only thing that tells ten packs apart before you open one.
                 Printing "5 sowal · 8 min" ten times over says nothing. */
              sub={run
                ? `${run.correct}/${run.total} dogry · ${fmtDuration(run.seconds)}`
                : `${p.subject} · ${ordinal(p.grade)} synp · ${p.questions} sowal`}
              end={(
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {run
                    ? (
                      <Typography sx={{
                        fontSize: 14, fontWeight: 700, color: tokens.orangeText,
                        fontVariantNumeric: 'tabular-nums',
                      }}>{run.points}</Typography>
                    )
                    : null}
                  <RowChevron />
                </Box>
              )}
              onClick={() => openPack(i)}
            />
          );
        })}
      </Box>

      <SectionLabel>{phase === 'done' ? 'Netijeler' : 'Häzirki reýting'}</SectionLabel>
      <RankList rows={rows} />

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          disabled={joined && phase === 'soon'}
          onClick={() => {
            if (phase === 'done') { toast('Bäsleşik tamamlandy — netijeler ýokarda'); return; }
            if (phase === 'live') {
              /* the commitment on a running contest is the next unsolved pack,
                 not a registration form: entering *is* answering */
              const next = packs.findIndex((p) => !runs[p.id]);
              if (next === -1) { toast('Ähli toplumlar çözüldi — netijä garaş'); return; }
              setPackIndex(next);
              return;
            }
            setJoined(true);
            toast('Ýazyldyň — başlanda habar bereris');
          }}
          sx={phase === 'done'
            ? { bgcolor: tokens.blueTint, color: tokens.blueText, '&:hover': { bgcolor: tokens.blueSoft } }
            : undefined}
        >
          {phase === 'done' ? 'Netijeleri gör'
            : phase === 'soon' ? (joined ? 'Ýazyldyň' : 'Bäsleşige gatnaşmak')
              : totals.packs === 0 ? 'Bäsleşige gatnaşmak' : 'Indiki toplumy çöz'}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* The mock Oýun page is gone with the mock games (`data/guides.tsx`). An
   interactive is opened by the lesson page now — `PlayerScreen` in
   `PlayScreens.tsx` — because the mini-app *is* the page; a detail screen in
   front of it only described a game nobody could play.
*/

/* ---------------- Kitap ---------------- */

export function BookDetailScreen({ book, onBack, toast }: {
  book: Book; onBack: () => void; toast: Toast;
}) {
  const doneCount = book.chapters.filter((c) => c.done).length;
  /* the first unread chapter is where "dowam et" lands */
  const next = book.chapters.find((c) => !c.done);
  const page = Math.round((book.read / 100) * book.pages);

  return (
    <SubPage
      title="Kitap"
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'book', id: book.id, title: book.title, sub: `${book.author} · ${book.pages} sahypa` }} />}
    >
      <Box sx={{ display: 'flex', gap: '15px', pt: '16px' }}>
        <Box aria-hidden sx={{
          width: 92, height: 124, borderRadius: `${tokens.rTile}px`, flex: 'none',
          bgcolor: book.tint, color: book.accent, display: 'grid', placeItems: 'center',
          borderLeft: `6px solid ${book.accent}`, boxShadow: tokens.shadowCtl,
        }}><BooksIcon size={34} /></Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px', lineHeight: 1.25 }}>
            {book.title}
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '4px' }}>
            {book.author} · {book.pages} sahypa
          </Typography>
          <Box sx={{ mt: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }}>
                {book.read === 100 ? 'Okalyp gutaryldy' : `${page}-nji sahypa`}
              </Typography>
              <Typography sx={{
                fontSize: 12.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: book.read === 100 ? tokens.greenText : tokens.ink2,
              }}>{book.read}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={book.read}
              aria-label={`${book.read}% okaldy`}
              sx={{
                height: 7, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft,
                '& .MuiLinearProgress-bar': {
                  borderRadius: `${tokens.rPill}px`, bgcolor: book.read === 100 ? tokens.greenDeep : book.accent,
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: '16px' }}>
        <Card title="Kitap barada"><Prose>{book.about}</Prose></Card>
      </Box>

      <SectionLabel>{`Baplar · ${doneCount}/${book.chapters.length}`}</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {book.chapters.map((c) => {
          const current = c.id === next?.id;
          return (
            <SurfaceRow
              key={c.id}
              icon={(
                <Box sx={{ width: 28, display: 'grid', placeItems: 'center', flex: 'none' }}>
                  {c.done
                    ? <DoneBadge size={22} />
                    : (
                      <Box aria-hidden sx={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${current ? book.accent : tokens.inkDisabled}`,
                      }} />
                    )}
                </Box>
              )}
              label={c.title}
              labelSx={{
                fontSize: 15,
                fontWeight: current ? 700 : 500,
                color: c.done ? tokens.ink2 : tokens.ink,
              }}
              sub={`${c.pages} sah.${current ? ' · şu ýerde galdyň' : ''}`}
              end={<RowChevron />}
              onClick={() => toast(c.done ? 'Bap gaýtadan açylýar' : 'Okamak tiz wagtda elýeterli bolar')}
            />
          );
        })}
      </Box>

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          onClick={() => toast(book.read === 100 ? 'Kitap gaýtadan açylýar' : 'Okamak tiz wagtda elýeterli bolar')}
        >
          {book.read === 0 ? 'Okap başla' : book.read === 100 ? 'Ýene oka' : `Dowam et — ${next?.title ?? ''}`}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Kart toplumy ---------------- */

export function DeckDetailScreen({ deck, onBack, onStudy }: {
  deck: Deck; onBack: () => void; onStudy: () => void;
}) {
  const pct = Math.round((deck.known / deck.cards.length) * 100);
  return (
    <SubPage
      title="Toplum"
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'deck', id: deck.id, title: deck.label, sub: `${deck.subject} · ${deck.cards.length} kart` }} />}
    >
      <Hero
        tint={deck.tint} accent={deck.accent}
        icon={<CardsIcon size={28} />}
        title={deck.label}
        meta={`${deck.subject} · ${deck.cards.length} kart`}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={`${deck.cards.length}`} label="Jemi kart" color={tokens.ink} />
        <StatTile value={`${deck.known}`} label="Bilýärin" color={tokens.greenText} />
        <StatTile value={`${deck.due}`} label="Gaýtalamaly" color={tokens.orangeText} />
      </Box>

      <Box sx={{ mt: '14px' }}>
        <Card>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: tokens.ink3 }}>Öwrenilen</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{pct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={pct}
            aria-label={`${pct}% öwrenildi`}
            sx={{
              height: 7, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft,
              '& .MuiLinearProgress-bar': { borderRadius: `${tokens.rPill}px`, bgcolor: deck.accent },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', color: tokens.ink3, mt: '2px' }}>
            <ClockIcon />
            <Typography sx={{ fontSize: 12.5 }}>
              {deck.known > 0 ? `${deck.known} kart bilinýär` : 'Entek öwrenilmedik'}
            </Typography>
          </Box>
        </Card>
      </Box>

      <SectionLabel>Kartlar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {deck.cards.map((c, i) => (
          <Box key={c.front} sx={{
            bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '13px 15px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{c.front}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '2px' }} noWrap>{c.back}</Typography>
            </Box>
            {i < deck.known
              ? <DoneBadge size={20} />
              : (
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: tokens.orangeText, flex: 'none' }}>
                  Gaýtala
                </Typography>
              )}
          </Box>
        ))}
      </Box>

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button fullWidth variant="contained" disableElevation onClick={onStudy}>
          {deck.known === 0 ? 'Öwrenip başla' : `Gaýtala — ${deck.due} kart`}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Testler: ders → test ---------------- */

const scoreColor = (s: number) => (s >= 90 ? tokens.greenText : s >= 70 ? tokens.blueText : tokens.orangeText);

export function TestSubjectScreen({ subject, onBack, onOpenTest }: {
  subject: TestSubject; onBack: () => void; onOpenTest: (t: TestItem) => void;
}) {
  const passed = subject.tests.filter((t) => t.best !== null).length;
  return (
    <SubPage
      title={subject.label}
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'test', id: subject.id, title: subject.label, sub: `${subject.tests.length} test` }} />}
    >
      <Hero
        tint={subject.tint}
        accent={subject.accent}
        icon={<QuizIcon size={28} />}
        title={subject.label}
        meta={`${subject.tests.length} test · ${passed}-si tabşyryldy`}
      />

      <SectionLabel>Testler</SectionLabel>
      {subject.tests.length === 0 ? (
        <EmptyState
          icon={<ListIcon size={26} />}
          title="Test ýok"
          note="Bu ders boýunça testler taýýarlanýar."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {subject.tests.map((t) => (
            <SurfaceRow
              key={t.id}
              icon={<IconBadge bg={subject.tint} color={subject.accent} size={44}><QuizIcon size={22} /></IconBadge>}
              label={t.title}
              labelSx={{ fontSize: 15, fontWeight: 600 }}
              sub={`${t.questions} sowal · ${t.minutes} min`}
              end={(
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {t.best !== null ? (
                    <Typography sx={{
                      fontSize: 14, fontWeight: 700, color: scoreColor(t.best),
                      fontVariantNumeric: 'tabular-nums',
                    }}>{t.best}%</Typography>
                  ) : (
                    <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>Täze</Typography>
                  )}
                  <RowChevron />
                </Box>
              )}
              onClick={() => onOpenTest(t)}
            />
          ))}
        </Box>
      )}
    </SubPage>
  );
}

/*
 * One subject's decks — the level Kartlar gained when the flat list of 46 decks
 * became a grid of 20 subjects. It is `TestSubjectScreen`'s twin on purpose:
 * the two sections ask the same question one level down ("which of this
 * subject's?"), so they answer it in the same shape.
 *
 * A row's second line is the grade's card count and nothing else — the page
 * title already says the subject, the label already says the grade — except
 * while the deck is being fetched, when the line is the only place that can say
 * so.
 */
export function DeckSubjectScreen({ subject, loading, onBack, onOpenDeck }: {
  subject: DeckSubject; loading: string | null;
  onBack: () => void; onOpenDeck: (d: DeckMeta) => void;
}) {
  return (
    <SubPage title={subject.subject} onBack={onBack}>
      <Hero
        tint={subject.tint}
        accent={subject.accent}
        icon={<CardsIcon size={28} />}
        title={subject.subject}
        meta={`${subject.decks.length} toplum · ${subject.cards} kart`}
      />

      <SectionLabel>Toplumlar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {subject.decks.map((d) => (
          <SurfaceRow
            key={d.id}
            icon={<IconBadge bg={subject.tint} color={subject.accent} size={44}><CardsIcon size={22} /></IconBadge>}
            label={`${ordinal(d.grade)} synp`}
            labelSx={{ fontSize: 15, fontWeight: 600 }}
            sub={loading === d.id ? 'Açylýar…' : `${d.total} kart`}
            end={<RowChevron />}
            onClick={() => onOpenDeck(d)}
          />
        ))}
      </Box>
    </SubPage>
  );
}

export function TestDetailScreen({ test, accent, tint, onBack, toast }: {
  test: TestItem; accent: string; tint: string; onBack: () => void; toast: Toast;
}) {
  /* The questions are the theme's own bank, fetched when the test is started —
     the page above them is a description, and nobody needs the bank to read a
     description. */
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const quiz = useQuiz(questions ?? []);

  const start = async () => {
    setLoading(true);
    try {
      const theme = await loadLesson(test.grade, test.slug, test.no);
      if (!theme || theme.test.length === 0) { toast('Bu test entek taýýar däl'); return; }
      setQuestions(theme.test.map((q) => ({ ...q, theme: theme.title })));
      quiz.start();
    } catch {
      toast('Test alynmady — birikmäňizi barlaň');
    } finally {
      setLoading(false);
    }
  };

  if (questions && quiz.stage !== 'start') {
    return (
      <SubPage title={test.title} onBack={() => { quiz.reset(); setQuestions(null); }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '4px' }}>
          {quiz.inQuestions && (
            <QuizQuestions
              questions={questions}
              quiz={quiz}
              accent={accent}
              onQuit={() => { quiz.reset(); setQuestions(null); }}
            />
          )}
          {quiz.stage === 'result' && <QuizResult questions={questions} quiz={quiz} />}
        </Box>
      </SubPage>
    );
  }

  return (
    <SubPage title="Test" onBack={onBack}>
      <Hero
        tint={tint} accent={accent}
        icon={<QuizIcon size={28} />}
        title={test.title}
        meta={test.tema}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={`${test.questions}`} label="Sowal" color={tokens.ink} />
        <StatTile value={`${test.minutes} min`} label="Wagt" color={tokens.ink} />
        <StatTile
          value={test.best === null ? '—' : `${test.best}%`}
          label="Iň gowy netije"
          color={test.best === null ? tokens.inkMuted : scoreColor(test.best)}
        />
      </Box>

      <Box sx={{ mt: '14px' }}>
        <Card title="Test barada">
          <Prose>
            {`${test.questions} sowal, her dogry jogap üçin 10 bal. Wagt gutaranda test awtomatiki tabşyrylýar.`}
          </Prose>
          <Box sx={{ display: 'flex', gap: '16px', pt: '4px', flexWrap: 'wrap' }}>
            {[
              [<ClockIcon key="c" />, `${test.minutes} minut`],
              [<ListIcon key="l" size={16} />, `${test.questions} sowal`],
              [<UsersIcon key="u" size={16} />, 'Synp reýtingine girýär'],
            ].map(([icon, label]) => (
              <Box key={label as string} sx={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', color: tokens.ink3, fontSize: 12.5,
              }}>
                {icon as ReactNode}{label as string}
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <SectionLabel>Öňki synanyşyklar</SectionLabel>
      {test.attempts.length === 0 ? (
        <EmptyState
          icon={<CalendarDotIcon size={26} />}
          title="Entek tabşyrylmadyk"
          note="Ilkinji synanyşyk netijesi şu ýerde saklanar."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {test.attempts.map((a) => (
            <SurfaceRow
              key={a.date}
              icon={(
                /* a past attempt is a record, not a pass — a check would claim too much */
                <IconBadge bg={tokens.surfacePress} color={scoreColor(a.score)} size={44}>
                  <HistoryIcon size={20} />
                </IconBadge>
              )}
              label={a.date}
              labelSx={{ fontSize: 15, fontWeight: 500 }}
              sub={`${Math.round((a.score / 100) * test.questions)}/${test.questions} dogry jogap`}
              end={(
                <Typography sx={{
                  fontSize: 15, fontWeight: 700, color: scoreColor(a.score),
                  fontVariantNumeric: 'tabular-nums',
                }}>{a.score}%</Typography>
              )}
            />
          ))}
        </Box>
      )}

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          disabled={loading}
          onClick={() => void start()}
        >
          {loading ? 'Açylýar…' : test.best === null ? 'Testi başla' : 'Gaýtadan tabşyr'}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* Small helper the Sapaklar list uses for its "continue" row */
export const ContinueRow = ({ label, sub, onClick }: {
  label: string; sub: string; onClick: () => void;
}) => (
  <SurfaceRow
    icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={44}><PlayCircleIcon size={22} /></IconBadge>}
    label={label}
    labelSx={{ fontSize: 15, fontWeight: 600 }}
    sub={sub}
    end={<RowChevron />}
    onClick={onClick}
  />
);
