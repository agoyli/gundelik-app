import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BookmarkIcon, BooksIcon, CardsIcon, CheckIcon, ChevronIcon, GameIcon, GlobeIcon, LockIcon,
  UsersIcon,
} from '../components/Icons';
import { TeaserCard } from '../components/Paywall';
import {
  ChipRow, EmptyState, IconBadge, RowChevron, SectionHeading, Segmented, SubPage,
  SubjectRow, SubjectTile, SurfaceRow, TagPill, ViewToggle,
} from '../components/Ui';
import { KIND_LABEL, KIND_ORDER, useBookmarks } from '../state/bookmarks';
import { useGrade } from '../state/children';
import type { Bookmark } from '../state/bookmarks';
import { setPref, tierFor, useCan, usePrefs } from '../state/prefs';
import { useAllowance } from '../state/allowance';
import {
  BOOKS, BOOK_CATS, CONTEST_LEVEL, INTL_OLYMPIADS, OLYMPIADS, OLYMPIAD_STAGE, PRIZE_CONTESTS,
  olympiadEntrants, olympiadSelf, olympiadTitle,
} from '../data/guides';
import type {
  Book, Deck, IntlOlympiad, Olympiad, PrizeContest, PrizePhase,
} from '../data/guides';
import {
  bankTotal, deckById, deckGroups, loadDeckCards, playById, playGroups, subjectBank,
} from '../data/library';
import {
  curriculum, pathLength, subjectLook, subjectsForGrade,
} from '../data/curriculum';
import { chipGrade, chipValue, gradeChips } from '../lib/gradeFilter';
import { absDate, fmtWhen } from '../lib/date';
import { ordinal } from '../lib/tm';
import type { DeckMeta, DeckSubject } from '../data/library';
import {
  BookDetailScreen, DeckDetailScreen, DeckSubjectScreen, IntlOlympiadScreen, OlympiadDetailScreen,
  PrizeContestScreen, prizePhase,
} from './DetailScreens';
import { PlayerScreen } from './PlayScreens';
import { tokens } from '../theme';

/*
 * The five Gollanmalar sections. Every page follows the same shape: capsule
 * SubPage header (its explanation behind the header "?"), then the list. Rows
 * open their detail page in `DetailScreens.tsx` where the commitment (join,
 * read, study, play) is made. Colored text always uses the *Text token grade.
 * Oýunlar is no longer a section of its own — the games hang off Sapaklar,
 * beside the topics they drill.
 */

type Toast = (m: string) => void;

/* ---------------- shared bits ---------------- */

const ProgressLine = ({ value, left, right }: { value: number; left: string; right: string }) => (
  <Box sx={{ mt: '10px' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }}>{left}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink2, fontVariantNumeric: 'tabular-nums' }}>
        {right}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate" value={value}
      sx={{
        height: 7, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft,
        '& .MuiLinearProgress-bar': { borderRadius: `${tokens.rPill}px`, bgcolor: tokens.blue },
      }}
    />
  </Box>
);

/* No section leads with a "featured" banner any more.
   Every page opened with a tinted card repeating the first row of the list
   under it in a louder voice — "most played", "continue", "12 cards waiting" —
   which is a promotion, not navigation. The list is the page. */

/* ---------------- Sapaklar ---------------- */

/* How many subject rows the Interaktiw strip shows before "Ählisi" takes over —
   this is a pointer into the section, not the section. */
const PLAY_PREVIEW = 4;

/* What a subject holds in the chosen grade — or in all of them — beside the
   lesson count the progress bar already states. One shape for every row: a
   subject with nothing written says so, rather than printing "0 test · 0 kart". */
const bankLine = (slug: string, grade?: number) => {
  const b = subjectBank(slug, grade);
  const parts = [];
  if (b.lessons) parts.push(`${b.lessons} sapak taýýar`);
  if (b.tests) parts.push(`${b.tests} test`);
  if (b.cards) parts.push(`${b.cards} kart`);
  return parts.length ? parts.join(' · ') : 'Material taýýarlanýar';
};

export function SapaklarScreen({ onBack, toast, onOpenSubject, onOpenPlay, onUpgrade }: {
  onBack: () => void; toast: Toast;
  onOpenSubject: (id: string, grade?: number) => void;
  /** the Interaktiw sapaklar section, at the grade looked at and optionally a subject */
  onOpenPlay: (grade?: number, groupId?: string) => void;
  onUpgrade: () => void;
}) {
  /*
   * Which grade's subjects are listed.
   *
   * A student's own grade is where they start, but the programme is twelve of
   * them and the reasons to look at another are ordinary: revising last year
   * before an exam, reading ahead, an older sibling's homework. It is also the
   * honest way to find the lessons that are written — the material lands grade
   * by grade, so the filter says which of them has something in it.
   *
   * `undefined` is "Ählisi": every subject the programme has, counted over all
   * of its grades.
   */
  /* "My grade" is whichever child is selected, so switching child re-opens
     this list on *their* year rather than leaving the last child's. */
  const myGrade = useGrade();
  const [grade, setGrade] = useState<number | undefined>(myGrade);
  useEffect(() => { setGrade(myGrade); }, [myGrade]);
  const subjects = useMemo(() => (grade === undefined ? curriculum() : subjectsForGrade(grade))
    .map((s) => ({
      id: s.slug,
      label: s.name,
      ...subjectLook(s.slug),
      done: 0,
      total: pathLength(s, grade),
    })), [grade]);
  /* the interactives of the same grade — the strip below the subjects */
  const play = useMemo(() => playGroups(grade).slice(0, PLAY_PREVIEW), [grade]);
  const can = useCan('roadmap');
  const canGames = useCan('games');
  const plan = tierFor('roadmap');
  /* the reader's own way of looking at a subject list, kept between visits */
  const view = usePrefs().subjectView;

  /* Whether a subject is behind the lock, and what happens when it is tapped —
     one answer for both views, so the row and the card can never disagree about
     which subjects are open. The free tier keeps the first subject whole: one
     subject you can actually finish is an argument; a list you can only look at
     is a wall. */
  const isLocked = (i: number) => !can && i > 0;
  const open = (id: string, i: number) => (isLocked(i) ? onUpgrade() : onOpenSubject(id, grade));

  return (
    <SubPage
      title="Sapaklar"
      onBack={onBack}
      action={<ViewToggle value={view} onChange={(v) => setPref('subjectView', v)} />}
      help="Her dersiň temalary yzygiderli sapaklar görnüşinde — 1-nji synpdan 12-nji synpa çenli. Sapaklary geçip, indiki synpa açylýarsyň. Her dersiň aşagynda oýun görnüşinde gaýtalama bar."
    >

      {/* Grade filter — the same chip row the lesson path filters with */}
      <Box sx={{ pt: '4px', pb: '2px' }}>
        <ChipRow
          label="Synp"
          value={chipValue(grade)}
          onChange={(id) => setGrade(chipGrade(id))}
          chips={gradeChips}
        />
      </Box>

      <SectionHeading
        title={grade === undefined ? 'Ähli dersler' : 'Dersler'}
        action={grade === myGrade
          ? <TagPill label="Meniň synpym" onClick={() => toast('Öz synpyňyzyň dersleri')} />
          : <TagPill label={`${ordinal(myGrade)} synpa dolan`} onClick={() => setGrade(myGrade)} />}
      />
      {/*
        * Two ways of reading the same list, and the switch above chooses.
        *
        * The row is the *considered* view: it has the width for what the bank
        * holds ("128 sapak taýýar · 12 test · 96 kart") and for progress, which
        * is what you want when you are deciding what to study next. The card is
        * the *scanning* view: seventeen subjects on two screens instead of
        * five, each one its own colour, which is what you want when you already
        * know the subject and are looking for it by sight. Neither is a
        * decoration of the other, so each carries the line it has room for —
        * the card states the path's length, the number its progress bar would
        * otherwise measure against.
        */}
      {view === 'grid' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {subjects.map((s, i) => (
            <SubjectTile
              key={s.id}
              icon={s.icon}
              tint={s.tint}
              accent={s.accent}
              label={s.label}
              sub={`${s.total} sapak`}
              locked={isLocked(i)}
              onClick={() => open(s.id, i)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {subjects.map((s, i) => (
            <SubjectRow
              key={s.id}
              icon={s.icon}
              tint={s.tint}
              accent={s.accent}
              label={s.label}
              sub={bankLine(s.id, grade)}
              /* `total` is every stop on this subject's path in this grade —
                 reading, interactive and checkpoint alike — so the row and the
                 page behind it count the same thing */
              progress={{ done: s.done, total: s.total }}
              locked={isLocked(i)}
              lockNote={`${plan?.name} bilen açylýar`}
              /* every subject has a path now — the "only Matematika opens, the
                 rest are coming soon" guard was scaffolding from the mock data */
              onClick={() => open(s.id, i)}
            />
          ))}
        </Box>
      )}

      {!can && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title={`${subjects.length - 1} ders ýapyk`}
            note={`Ähli dersleriň 1–12-nji synp sapaklary, ${bankTotal().tests} test we ${bankTotal().cards} kart — ${plan?.name} bilen açylýar.`}
            feature="roadmap"
            onUpgrade={onUpgrade}
          />
        </Box>
      )}

      {/* Interaktiw — the games, where the topics are.
          They used to be a sixth tile on the Gollanmalar grid with a page and
          a "most played" banner of their own, which made a two-minute drill
          look like a section of the product. A game practises a topic, so it
          belongs under the topics: same rows as the subjects above, labelled
          by the subject each one drills.

          They are also no longer four invented arcade games with invented
          leaderboards. Every row is the real interactives the source published
          for this grade, the same ones the subject's path stops at, and the
          last row opens the lot. */}
      {play.length > 0 && (
        <>
          <SectionHeading
            title="Interaktiw sapaklar"
            action={<TagPill label="Ählisi" onClick={() => onOpenPlay(grade)} />}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {play.map((g, i) => (
              <SurfaceRow
                key={g.id}
                icon={canGames || i === 0
                  ? <IconBadge bg={g.tint} color={g.accent} size={44}><GameIcon size={22} /></IconBadge>
                  : <IconBadge bg={tokens.lockTile} color={tokens.lockInk} size={44}><LockIcon size={20} /></IconBadge>}
                label={g.subject}
                sub={canGames || i === 0
                  ? `${g.items.length} gönükme${grade === undefined ? ` · ${ordinal(g.grade)} synp` : ''}`
                  : `${g.items.length} gönükme · ${tierFor('games')?.name} bilen açylýar`}
                end={<RowChevron />}
                onClick={() => (canGames || i === 0 ? onOpenPlay(grade, g.id) : onUpgrade())}
              />
            ))}
          </Box>
        </>
      )}
    </SubPage>
  );
}

/* ---------------- Öwrediji kartlar ---------------- */

function DeckStudy({ deck, onBack, toast }: { deck: Deck; onBack: () => void; toast: Toast }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const card = deck.cards[i];
  const last = i === deck.cards.length - 1;

  const advance = (isKnown: boolean) => {
    setKnown((k) => ({ ...k, [i]: isKnown }));
    if (last) {
      toast(`${deck.label}: ${Object.values({ ...known, [i]: isKnown }).filter(Boolean).length}/${deck.cards.length} bilýärsiň`);
      onBack();
      return;
    }
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <SubPage title={deck.subject} onBack={onBack}>
      <Box sx={{ pt: '12px' }}>
        <ProgressLine value={((i + 1) / deck.cards.length) * 100} left={deck.label} right={`${i + 1}/${deck.cards.length}`} />
      </Box>

      {/* the card itself — tap to flip */}
      <ButtonBase
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? `Jogap: ${card.back}. Sowala dolan` : `${card.front}. Jogaby gör`}
        sx={{
          mt: '16px', width: '100%', height: 260, borderRadius: `${tokens.rCard}px`,
          bgcolor: flipped ? '#fff' : deck.tint,
          border: `1.5px solid ${flipped ? tokens.divider : 'transparent'}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px',
          px: '26px', textAlign: 'center',
          boxShadow: flipped ? tokens.shadowFloat : 'none',
          transition: `background .2s ${tokens.ease}, box-shadow .2s ${tokens.ease}`,
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.7px', color: flipped ? tokens.ink3 : deck.accent }}>
          {flipped ? 'JOGAP' : 'SOWAL'}
        </Typography>
        <Typography sx={{ fontSize: flipped ? 20 : 24, fontWeight: 700, letterSpacing: '-.3px', lineHeight: 1.3 }}>
          {flipped ? card.back : card.front}
        </Typography>
        {!flipped && (
          <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '4px' }}>Jogaby görmek üçin bas</Typography>
        )}
      </ButtonBase>

      {/* grading only makes sense once the answer is visible */}
      <Box sx={{ display: 'flex', gap: '10px', mt: '16px' }}>
        <Button
          fullWidth disabled={!flipped} onClick={() => advance(false)}
          sx={{ bgcolor: tokens.surface, color: tokens.ink, '&:active': { bgcolor: tokens.surfacePress } }}
        >
          Ýene gaýtala
        </Button>
        <Button
          fullWidth variant="contained" disableElevation disabled={!flipped} onClick={() => advance(true)}
        >
          {last ? 'Gutar' : 'Bilýärin'}
        </Button>
      </Box>
      {!flipped && (
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, textAlign: 'center', mt: '10px' }}>
          Ilki jogaby gör, soňra özüňi bahalandyr.
        </Typography>
      )}
    </SubPage>
  );
}

/*
 * Where a card session starts: which subject.
 *
 * It used to be 46 rows, one per subject-grade, each labelled "Informatika ·
 * 3-nji synp kartlary" — the word *kartlary* on all 46 of them, under a page
 * already titled Öwrediji kartlar, and Informatika twelve times. What the
 * reader picks first is the subject, so that is what the page holds: one tile
 * per subject, under the shelf the school files it on, with the grades one
 * level down.
 *
 * Each tile's second line is the two numbers a reader cannot count for
 * themselves — how many cards the subject holds, which grades they cover — and
 * not a sentence saying "cards to learn", which is what the page title says.
 */
export function KartlarScreen({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: Toast; onUpgrade: () => void;
}) {
  /* subject → its decks → the deck's overview page → the study session */
  const [subject, setSubject] = useState<DeckSubject | null>(null);
  const [open, setOpen] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);
  const can = useCan('cards');
  /* the free tier's daily go — one deck a day, spent when a deck is opened */
  const allow = useAllowance('cards');
  const plan = tierFor('cards');
  const groups = deckGroups();
  const bank = bankTotal();

  /* The list knows how many cards a deck holds — the catalogue says so — but
     the cards themselves are a lesson file, fetched when one is opened. */
  const openDeck = async (d: DeckMeta) => {
    /* A free account may open one deck a day. The go is spent on *this* deck,
       so re-opening it later today is free and a second deck is not — a limit
       that punished going back to the same cards would teach people to hoard
       the one they picked. */
    if (!can && !allow.canOpen(d.id)) {
      toast(`Şu günki mugt toplum ulanyldy — ${plan?.name} bilen çäk aýrylýar`);
      onUpgrade();
      return;
    }
    if (!can) allow.take(d.id);
    setLoading(d.id);
    try {
      const cards = await loadDeckCards(d.grade, d.slug);
      setOpen({
        id: d.id, label: d.label, subject: d.subject, accent: d.accent, tint: d.tint,
        cards, known: 0, due: cards.length,
      });
      setStudying(false);
    } catch {
      toast('Kartlar alynmady — birikmäňizi barlaň');
    } finally {
      setLoading(null);
    }
  };

  if (open && studying) {
    return <DeckStudy deck={open} onBack={() => setStudying(false)} toast={toast} />;
  }
  if (open) {
    return (
      <DeckDetailScreen
        deck={open}
        onBack={() => setOpen(null)}
        onStudy={() => setStudying(true)}
      />
    );
  }
  if (subject) {
    return (
      <DeckSubjectScreen
        subject={subject}
        loading={loading}
        onBack={() => setSubject(null)}
        onOpenDeck={(d) => void openDeck(d)}
      />
    );
  }

  return (
    <SubPage title="Öwrediji kartlar" onBack={onBack} help="Bir tarapynda sowal, beýleki tarapynda jogap. Kartlary gaýtalap, formulalary we sözleri ýatda saklaýarsyň.">

      {/* The bank is stated before the lock: how much there is to study is a
          fact about the product, and it is the reason the lock is worth
          opening. The free tier no longer gets a session a week — a weekly
          allowance taught people to ration the thing instead of using it. */}
      {/* Not a wall: an allowance. "You have today's go" is a truer sentence
          than "this is locked", and it is the one that gets a pupil to open a
          deck at all — which is the only thing that ever sells the rest. */}
      {!can && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title={allow.left > 0 ? 'Şu gün bir toplum mugt' : 'Şu günki mugt toplum ulanyldy'}
            note={allow.left > 0
              ? `${bank.decks} toplumyň birini şu gün mugt aç. Ählisi — ${bank.cards} kart — ${plan?.name} bilen.`
              : `Ertir ýene bir toplum açylýar. Ähli ${bank.decks} toplum — ${plan?.name} bilen.`}
            feature="cards"
            onUpgrade={onUpgrade}
          />
        </Box>
      )}

      {groups.map((g) => (
        <Box key={g.id}>
          {/* the shelf's own size, so the heading is a fact and not a divider */}
          <SectionHeading
            title={g.title}
            action={(
              <Typography sx={{ fontSize: 13, color: tokens.ink3, fontVariantNumeric: 'tabular-nums' }}>
                {g.subjects.length} ders
              </Typography>
            )}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* An odd shelf ends on a half-width tile with a gap beside it. The
                Gollanmalar grid spans its last tile instead, but that grid is
                the whole page; here the next heading follows immediately, so the
                gap reads as the end of the shelf — and widening a tile would
                give the *smallest* subject in it the largest card. */}
            {g.subjects.map((s) => (
              <SubjectTile
                key={s.slug}
                icon={subjectLook(s.slug).icon}
                tint={s.tint}
                accent={s.accent}
                label={s.subject}
                sub={`${s.cards} kart · ${gradeSpan(s.grades)}`}
                /* the subject list stays open on the free tier — the meter is
                   on opening a deck, and a grid of grey tiles hides the very
                   catalogue that is the argument for paying */
                locked={false}
                onClick={() => setSubject(s)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </SubPage>
  );
}

/* "7-nji synp" for one grade, "1–6 synp" for a run of them — the tile is 165px
   wide and cannot spell out six ordinals. */
const gradeSpan = (grades: number[]) => {
  const first = grades[0];
  const last = grades[grades.length - 1];
  return first === last ? `${ordinal(first)} synp` : `${first}–${last} synp`;
};

/* ---------------- Bäsleşikler ---------------- */

/*
 * One card for both kinds of contest.
 *
 * A test contest and a prize contest are the same decision in the list — which
 * one am I entering — and differ only in what they hand out, so they are one
 * card with one footer strip and one thing swapped in it: the points on offer,
 * or the object on offer. Two card designs for two tabs of the same section
 * would make a tab switch look like a page change.
 */
function ContestCard({ title, meta, state, players, end, onClick }: {
  title: string; meta: string;
  state: { label: string; color: string; tint: string };
  players: number; end: ReactNode; onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${title}, ${state.label}`}
      sx={{
        display: 'block', width: '100%', textAlign: 'left',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '15px 15px 13px',
        transition: 'background .15s ease', '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px' }}>{title}</Typography>
          <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px' }}>{meta}</Typography>
        </Box>
        <Box sx={{
          flex: 'none', px: '10px', height: 26, borderRadius: `${tokens.rPill}px`,
          bgcolor: state.tint, color: state.color, fontSize: 12, fontWeight: 700,
          display: 'grid', placeItems: 'center',
        }}>{state.label}</Box>
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '14px', mt: '12px',
        pt: '12px', borderTop: `1px solid ${tokens.dividerSoft}`,
      }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: tokens.ink3, fontSize: 13 }}>
          <UsersIcon size={16} />{players}
        </Box>
        {end}
        <Box aria-hidden sx={{ ml: 'auto', color: tokens.inkDisabled, display: 'flex' }}>
          <ChevronIcon />
        </Box>
      </Box>
    </ButtonBase>
  );
}

/*
 * Bäsleşikler, in two kinds.
 *
 * The section holds two things that are both "competition" in Turkmen and
 * nothing alike in use. An olimpiada happens on paper, in a hall, run by the
 * school or the ministry: by the time it reaches a phone it is a *record* — a
 * date, a stage, and what each pupil scored. An onlaýn bäsleşik happens in the
 * app: it opens on a date, runs on the work you do, and hands out objects that
 * sponsors put up. One list mixing "Welaýat tapgyry, 89%" with "Macbook Air,
 * 23 gün galdy" makes the reader sort them by eye on every scroll, so the tab
 * sorts them once — and the two tabs then answer two different questions, "how
 * did we do" and "what can I enter".
 */
type ContestTab = 'olimpiada' | 'bayrak';

/* The state pill's three readings, so the card and the page it opens agree. */
const PRIZE_STATE: Record<PrizePhase, { label: string; color: string; tint: string }> = {
  soon: { label: 'Ýakynda', color: tokens.blueText, tint: tokens.blueTint },
  live: { label: 'Dowam edýär', color: tokens.orangeText, tint: tokens.orangeTint },
  done: { label: 'Tamamlandy', color: tokens.ink3, tint: tokens.surfacePress },
};

/** `7–9-njy synp` — the grades an olympiad's boards cover, in one phrase. */
const olympiadGradeSpan = (o: Olympiad) => {
  const gs = o.grades.map((g) => g.grade).sort((a, b) => a - b);
  const [first, last] = [gs[0], gs[gs.length - 1]];
  return first === last ? `${ordinal(first)} synp` : `${first}–${ordinal(last)} synp`;
};

export function BaslesiklerScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [tab, setTab] = useState<ContestTab>('olimpiada');
  const [open, setOpen] = useState<Olympiad | null>(null);
  const [openIntl, setOpenIntl] = useState<IntlOlympiad | null>(null);
  const [openPrize, setOpenPrize] = useState<PrizeContest | null>(null);

  if (open) return <OlympiadDetailScreen olympiad={open} onBack={() => setOpen(null)} />;
  if (openIntl) return <IntlOlympiadScreen item={openIntl} onBack={() => setOpenIntl(null)} />;
  if (openPrize) {
    return <PrizeContestScreen contest={openPrize} onBack={() => setOpenPrize(null)} toast={toast} />;
  }

  return (
    <SubPage
      title="Bäsleşikler"
      onBack={onBack}
      /* The points pill belongs to the tab that pays points. Above the
         olympiads it would promise a score for a paper that is marked in
         percent and hands out no bal at all. */
      action={tab === 'bayrak'
        ? <TagPill label="1251 bal" onClick={() => toast('Onlaýn bäsleşiklerde toplan ballaryň jemi. Ballar umumy reýtingiňi kesgitleýär.')} />
        : undefined}
    >
      <Box sx={{ pt: '14px', pb: '16px' }}>
        <Segmented
          label="Bäsleşigiň görnüşi"
          value={tab}
          onChange={setTab}
          options={[
            { id: 'olimpiada', label: 'Olimpiýadalar' },
            { id: 'bayrak', label: 'Onlaýn bäsleşikler' },
          ]}
        />
      </Box>

      {tab === 'olimpiada' ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {OLYMPIADS.map((o) => {
              const st = OLYMPIAD_STAGE[o.stage];
              const self = olympiadSelf(o);
              return (
                <ContestCard
                  key={o.id}
                  title={olympiadTitle(o)}
                  meta={absDate(o.date)}
                  state={{ label: st.short, color: st.color, tint: st.tint }}
                  players={olympiadEntrants(o)}
                  /* Nothing to win here, so the slot the prize tab gives to a
                     level carries the one thing that decides whether to open a
                     finished olympiad: your own result, or whose results are
                     inside when you did not sit it. */
                  end={self ? (
                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', height: 26, px: '10px',
                      borderRadius: `${tokens.rPill}px`, bgcolor: tokens.blueTint, color: tokens.blueText,
                      fontSize: 12, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
                    }}>Netijäň {self.percent}%</Box>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: tokens.ink3 }}>{olympiadGradeSpan(o)}</Typography>
                  )}
                  onClick={() => setOpen(o)}
                />
              );
            })}
          </Box>

          {/*
            * The other half of an olympiad section: the ones still ahead.
            *
            * Everything above is a result — closed, marked, nothing to do about
            * it. A pupil who scored 96% in the welaýat tapgyry is exactly the
            * reader who needs to know that a selection exists, what it takes to
            * reach it, and who to ring, and that reader is on this screen with
            * no other route to that page. So it sits under the results rather
            * than in a section of its own.
            */}
          <SectionHeading title="Halkara olimpiadalar" />
          <Typography sx={{ fontSize: 13, color: tokens.ink3, px: '6px', mb: '12px', lineHeight: 1.5 }}>
            Milli tapgyrlardan geçen okuwçylar üçin. Her biriniň derejesi, arza möhleti we habarlaşmak
            üçin belgisi içinde.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {INTL_OLYMPIADS.map((it) => (
              <SurfaceRow
                key={it.id}
                icon={(
                  <IconBadge bg={tokens.purpleTint} color={tokens.purpleText} size={44}>
                    <GlobeIcon size={20} />
                  </IconBadge>
                )}
                label={it.name}
                sub={`${it.short} · ${OLYMPIAD_STAGE[it.through].label} arkaly`}
                end={<RowChevron />}
                onClick={() => setOpenIntl(it)}
              />
            ))}
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PRIZE_CONTESTS.map((c) => {
            /* the phase is the dates', not a stored field — the card and the
               countdown on the page behind it read the same clock */
            const phase = prizePhase(c);
            const lvl = CONTEST_LEVEL[c.level];
            return (
              <ContestCard
                key={c.id}
                title={c.title}
                meta={fmtWhen(c.startsAt)}
                state={PRIZE_STATE[phase]}
                players={c.players}
                /* Not the top prize. Every one of these cards would print a
                   laptop or a tablet, and a column of prizes sorts nothing —
                   every reader wants all of them. What decides whether to enter
                   is whether the questions are within reach, so the slot the
                   points pill has in the other tab carries the level here. */
                end={(
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', height: 26, px: '10px',
                    borderRadius: `${tokens.rPill}px`, bgcolor: lvl.tint, color: lvl.color,
                    fontSize: 12, fontWeight: 700, flex: 'none',
                  }}>{lvl.label}</Box>
                )}
                onClick={() => setOpenPrize(c)}
              />
            );
          })}
        </Box>
      )}
    </SubPage>
  );
}

/* ---------------- Kitaphana ---------------- */

export function KitaphanaScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [cat, setCat] = useState('Ähli');
  const [open, setOpen] = useState<Book | null>(null);
  const shown = cat === 'Ähli' ? BOOKS : BOOKS.filter((b) => b.cat === cat);

  if (open) return <BookDetailScreen book={open} onBack={() => setOpen(null)} toast={toast} />;

  return (
    <SubPage title="Kitaphana" onBack={onBack} help="Okuw kitaplaryň we goşmaça edebiýat. Okan ýeriňi ýatda saklaýar.">

      {/* category filter — same 32px chip spec as the roadmap */}
      <Box sx={{
        display: 'flex', gap: '8px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter, pt: '14px',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
      }}>
        {BOOK_CATS.map((c) => {
          const on = c === cat;
          return (
            <ButtonBase
              key={c} onClick={() => setCat(c)} aria-pressed={on}
              sx={{
                height: 32, px: '14px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                fontSize: 13.5, fontWeight: 600,
                bgcolor: on ? tokens.blueSolid : tokens.surface,
                color: on ? '#fff' : tokens.ink2,
                transition: 'background .15s ease,color .15s ease',
              }}
            >{c}</ButtonBase>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', pt: '16px' }}>
        {shown.map((b) => (
          <ButtonBase
            key={b.id}
            onClick={() => setOpen(b)}
            aria-label={`${b.title}, ${b.author}, ${b.read}% okaldy`}
            sx={{
              display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left',
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '13px',
              transition: 'background .15s ease', '&:active': { bgcolor: tokens.surfacePress },
            }}
          >
            {/* book spine stand-in — keeps the row visual without cover art */}
            <Box aria-hidden sx={{
              width: 48, height: 64, borderRadius: `${tokens.rCell}px`, flex: 'none',
              bgcolor: b.tint, color: b.accent, display: 'grid', placeItems: 'center',
              borderLeft: `4px solid ${b.accent}`,
            }}><BooksIcon size={22} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }} noWrap>{b.title}</Typography>
              <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }} noWrap>
                {b.author} · {b.pages} sahypa
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '8px' }}>
                <Box sx={{ flex: 1, height: 5, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
                  <Box sx={{ width: `${b.read}%`, height: '100%', borderRadius: `${tokens.rPill}px`, bgcolor: b.accent }} />
                </Box>
                <Typography sx={{
                  fontSize: 12, fontWeight: 600, flex: 'none',
                  color: b.read === 100 ? tokens.greenText : tokens.ink3,
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                  {b.read === 100 ? <><CheckIcon size={13} />Okaldy</> : `${b.read}%`}
                </Typography>
              </Box>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </SubPage>
  );
}

/* ---------------- Bellikledim ---------------- */

/*
 * Everything saved, from all six sections, on one page.
 *
 * The sections stay separate because they are browsed separately — but a
 * reader's *own* shortlist crosses them: the book they are halfway through and
 * the contest they meant to enter belong on the same page, not two tiles apart.
 * Rows are grouped by section so the page still says where each thing lives,
 * and a tap opens the same detail screen the section would have opened.
 */
/* A bookmarked deck is saved as an id, and its cards live in a lesson file, so
   opening one from here is the same fetch the Kartlar list makes. */
function SavedDeck({ meta, onBack, toast }: { meta: DeckMeta; onBack: () => void; toast: Toast }) {
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    let live = true;
    loadDeckCards(meta.grade, meta.slug)
      .then((cards) => {
        if (!live) return;
        setDeck({
          id: meta.id, label: meta.label, subject: meta.subject,
          accent: meta.accent, tint: meta.tint, cards, known: 0, due: cards.length,
        });
      })
      .catch(() => toast('Kartlar alynmady — birikmäňizi barlaň'));
    return () => { live = false; };
  }, [meta, toast]);

  if (!deck) {
    return (
      <SubPage title="Toplum" onBack={onBack}>
        <EmptyState icon={<CardsIcon size={26} />} title="Açylýar…" note={`${meta.subject} · ${meta.total} kart`} />
      </SubPage>
    );
  }
  return (
    <DeckDetailScreen
      deck={deck}
      onBack={onBack}
      onStudy={() => toast('Gaýtalama Kartlar bölüminde başlaýar')}
    />
  );
}

export function BookmarksScreen({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: Toast; onUpgrade: () => void;
}) {
  const saved = useBookmarks();
  const canCards = useCan('cards');
  const [open, setOpen] = useState<Bookmark | null>(null);

  if (open) {
    const back = () => setOpen(null);
    if (open.kind === 'deck') {
      /* a bookmark is not a side door: the same lock the section draws */
      const meta = canCards ? deckById(open.id) : undefined;
      if (meta) return <SavedDeck meta={meta} onBack={back} toast={toast} />;
    }
    if (open.kind === 'contest') {
      /* one bookmark kind, two pages behind it — a saved olympiad is a result,
         a saved halkara olimpiada is a deadline, and the id says which */
      const o = OLYMPIADS.find((x) => x.id === open.id);
      if (o) return <OlympiadDetailScreen olympiad={o} onBack={back} />;
      const it = INTL_OLYMPIADS.find((x) => x.id === open.id);
      if (it) return <IntlOlympiadScreen item={it} onBack={back} />;
    }
    if (open.kind === 'game') {
      /* a saved interactive re-opens in the player, not in a page about it */
      const g = playById(open.id);
      if (g) return <PlayerScreen item={g} onBack={back} onUpgrade={onUpgrade} />;
    }
    if (open.kind === 'book') {
      const b = BOOKS.find((x) => x.id === open.id);
      if (b) return <BookDetailScreen book={b} onBack={back} toast={toast} />;
    }
    /* a saved thing whose record has gone (a finished contest, a pulled book) */
    return <EmptyStateBack onBack={back} />;
  }

  const groups = KIND_ORDER
    .map((k) => [k, saved.filter((b) => b.kind === k)] as const)
    .filter(([, items]) => items.length > 0);

  return (
    <SubPage
      title="Bellikledim"
      onBack={onBack}
      help="Islendik gollanmanyň sahypasyndaky bellik düwmesine bassaň, ol şu ýerde ýygnalýar. Bölümler boýunça toparlanýar."
    >
      {saved.length === 0 ? (
        <Box sx={{ pt: '18px' }}>
          <EmptyState
            icon={<BookmarkIcon size={26} />}
            title="Bellik ýok"
            note="Kitabyň, testiň ýa-da bäsleşigiň sahypasynda bellik düwmesine bas — şu ýerde ýygnalar."
          />
        </Box>
      ) : groups.map(([kind, items]) => (
        <Box key={kind}>
          <SectionHeading title={KIND_LABEL[kind]} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((b) => (
              <SurfaceRow
                key={`${b.kind}:${b.id}`}
                label={b.title}
                sub={b.sub}
                end={<RowChevron />}
                onClick={() => (b.kind === 'deck' && !canCards ? onUpgrade() : setOpen(b))}
              />
            ))}
          </Box>
        </Box>
      ))}
    </SubPage>
  );
}

function EmptyStateBack({ onBack }: { onBack: () => void }) {
  return (
    <SubPage title="Bellik" onBack={onBack}>
      <Box sx={{ pt: '18px' }}>
        <EmptyState
          icon={<BookmarkIcon size={26} />}
          title="Elýeterli däl"
          note="Bu gollanma indi elýeterli däl — belligi aýryp bilersiň."
        />
      </Box>
    </SubPage>
  );
}
