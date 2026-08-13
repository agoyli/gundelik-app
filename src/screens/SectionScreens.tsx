import { Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import { useState } from 'react';
import {
  BookmarkIcon, BooksIcon, CardsIcon, CheckIcon, ChevronIcon, GameIcon, LockIcon, UsersIcon,
} from '../components/Icons';
import { TeaserCard } from '../components/Paywall';
import {
  EmptyState, IconBadge, PointsPill, RowChevron, SectionHeading, SubPage, SubjectRow, SurfaceRow,
  TagPill,
} from '../components/Ui';
import { KIND_LABEL, KIND_ORDER, useBookmarks } from '../state/bookmarks';
import type { Bookmark } from '../state/bookmarks';
import { tierFor, useCan } from '../state/prefs';
import {
  BANK_TOTAL, BOOKS, BOOK_CATS, CONTESTS, CONTEST_STATE, DECKS, GAMES, SAPAK_SUBJECTS, subjectBank,
} from '../data/guides';
import type { Book, Contest, Deck, Game } from '../data/guides';
import {
  BookDetailScreen, ContestDetailScreen, DeckDetailScreen, GameDetailScreen,
} from './DetailScreens';
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

/* What the bank holds for a subject, beside the lesson count the progress bar
   already states. One shape for every row: a subject whose tests and cards are
   not written yet says so, rather than printing "0 test · 0 kart". */
const bankLine = (label: string) => {
  const b = subjectBank(label);
  const parts = [];
  if (b.tests) parts.push(`${b.tests} test`);
  if (b.cards) parts.push(`${b.cards} kart`);
  return parts.length ? parts.join(' · ') : 'Test we kartlar taýýarlanýar';
};

export function SapaklarScreen({ onBack, toast, onOpenSubject, onUpgrade }: {
  onBack: () => void; toast: Toast; onOpenSubject: (id: string) => void; onUpgrade: () => void;
}) {
  const [game, setGame] = useState<Game | null>(null);
  const can = useCan('roadmap');
  const canGames = useCan('games');
  const plan = tierFor('roadmap');
  const onOpenGame = (g: Game) => setGame(g);
  if (game) return <GameDetailScreen game={game} onBack={() => setGame(null)} toast={toast} />;

  return (
    <SubPage title="Sapaklar" onBack={onBack} help="Her dersiň temalary yzygiderli sapaklar görnüşinde — 1-nji synpdan 12-nji synpa çenli. Sapaklary geçip, indiki synpa açylýarsyň. Her dersiň aşagynda oýun görnüşinde gaýtalama bar.">

      <SectionHeading title="Dersler" action={<TagPill label="Ähli" onClick={() => toast('Ähli dersler tiz wagtda')} />} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SAPAK_SUBJECTS.map((s, i) => (
          <SubjectRow
            key={s.id}
            icon={s.icon}
            tint={s.tint}
            accent={s.accent}
            label={s.label}
            sub={bankLine(s.label)}
            /* `total` is the subject's own theme count, straight from the
               curriculum — see SAPAK_SUBJECTS */
            progress={{ done: s.done, total: s.total }}
            /* the free tier keeps the first subject whole — one subject you can
               actually finish is an argument; a list you can only look at is a wall */
            locked={!can && i > 0}
            lockNote={`${plan?.name} bilen açylýar`}
            /* every subject has a path now — the "only Matematika opens, the
               rest are coming soon" guard was scaffolding from the mock data */
            onClick={() => (!can && i > 0 ? onUpgrade() : onOpenSubject(s.id))}
          />
        ))}
      </Box>

      {!can && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title={`${SAPAK_SUBJECTS.length - 1} ders ýapyk`}
            note={`Ähli dersleriň 1–12-nji synp sapaklary, ${BANK_TOTAL.tests} test we ${BANK_TOTAL.cards} kart — ${plan?.name} bilen açylýar.`}
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
          by the subject each one drills. */}
      <SectionHeading title="Interaktiw" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {GAMES.map((g) => (
          <SurfaceRow
            key={g.id}
            icon={canGames
              ? <IconBadge bg={g.tint} color={g.accent} size={44}><GameIcon size={22} /></IconBadge>
              : <IconBadge bg={tokens.lockTile} color={tokens.lockInk} size={44}><LockIcon size={20} /></IconBadge>}
            label={g.label}
            sub={canGames ? `${g.sub}${g.best ? ` · iň gowy ${g.best} bal` : ''}` : `${g.sub} · ${tierFor('games')?.name} bilen açylýar`}
            end={<RowChevron />}
            onClick={() => (canGames ? onOpenGame(g) : onUpgrade())}
          />
        ))}
      </Box>
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

export function KartlarScreen({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: Toast; onUpgrade: () => void;
}) {
  /* deck → its overview page → the study session */
  const [open, setOpen] = useState<Deck | null>(null);
  const [studying, setStudying] = useState(false);
  const can = useCan('cards');
  const plan = tierFor('cards');

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

  return (
    <SubPage title="Öwrediji kartlar" onBack={onBack} help="Bir tarapynda sowal, beýleki tarapynda jogap. Kartlary gaýtalap, formulalary we sözleri ýatda saklaýarsyň.">

      {/* The bank is stated before the lock: how much there is to study is a
          fact about the product, and it is the reason the lock is worth
          opening. The free tier no longer gets a session a week — a weekly
          allowance taught people to ration the thing instead of using it. */}
      {!can && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title="Öwrediji kartlar ýapyk"
            note={`${BANK_TOTAL.decks} toplum, ${BANK_TOTAL.cards} kart taýýar — ${plan?.name} bilen açylýar.`}
            feature="cards"
            onUpgrade={onUpgrade}
          />
        </Box>
      )}

      <SectionHeading title="Toplumlar" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DECKS.map((d) => (
          <SurfaceRow
            key={d.id}
            icon={can
              ? <IconBadge bg={d.tint} color={d.accent} size={44}><CardsIcon size={22} /></IconBadge>
              : <IconBadge bg={tokens.lockTile} color={tokens.lockInk} size={44}><LockIcon size={20} /></IconBadge>}
            label={d.label}
            sub={can
              ? `${d.subject} · ${d.cards.length} kart · ${d.due} gaýtalamaly`
              : `${d.subject} · ${d.cards.length} kart`}
            end={<RowChevron />}
            onClick={() => { if (!can) { onUpgrade(); return; } setOpen(d); setStudying(false); }}
          />
        ))}
      </Box>
    </SubPage>
  );
}

/* ---------------- Bäsleşikler ---------------- */

export function BaslesiklerScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [open, setOpen] = useState<Contest | null>(null);
  if (open) return <ContestDetailScreen contest={open} onBack={() => setOpen(null)} toast={toast} />;

  return (
    <SubPage
      title="Bäsleşikler"
      onBack={onBack}
      action={<TagPill label="1251 bal" onClick={() => toast('Beýleki okuwçylar bilen ýaryş. Her bäsleşik ballar getirýär — ballar umumy reýtingiňi kesgitleýär.')} />}
    >

      <SectionHeading title="Ähli bäsleşikler" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CONTESTS.map((c) => {
          const st = CONTEST_STATE[c.state];
          return (
            <ButtonBase
              key={c.id}
              onClick={() => setOpen(c)}
              aria-label={`${c.title}, ${st.label}`}
              sx={{
                display: 'block', width: '100%', textAlign: 'left',
                bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '15px 15px 13px',
                transition: 'background .15s ease', '&:active': { bgcolor: tokens.surfacePress },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px' }}>{c.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px' }}>{c.subject} · {c.when}</Typography>
                </Box>
                <Box sx={{
                  flex: 'none', px: '10px', height: 26, borderRadius: `${tokens.rPill}px`,
                  bgcolor: st.tint, color: st.color, fontSize: 12, fontWeight: 700,
                  display: 'grid', placeItems: 'center',
                }}>{st.label}</Box>
              </Box>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: '14px', mt: '12px',
                pt: '12px', borderTop: `1px solid ${tokens.dividerSoft}`,
              }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: tokens.ink3, fontSize: 13 }}>
                  <UsersIcon size={16} />{c.players}
                </Box>
                <PointsPill value={c.prize} unit="bal" />
                <Box aria-hidden sx={{ ml: 'auto', color: tokens.inkDisabled, display: 'flex' }}>
                  <ChevronIcon />
                </Box>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
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
      const deck = canCards ? DECKS.find((d) => d.id === open.id) : undefined;
      if (deck) return <DeckDetailScreen deck={deck} onBack={back} onStudy={() => toast('Gaýtalama Kartlar bölüminde başlaýar')} />;
    }
    if (open.kind === 'contest') {
      const c = CONTESTS.find((x) => x.id === open.id);
      if (c) return <ContestDetailScreen contest={c} onBack={back} toast={toast} />;
    }
    if (open.kind === 'game') {
      const g = GAMES.find((x) => x.id === open.id);
      if (g) return <GameDetailScreen game={g} onBack={back} toast={toast} />;
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
