import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  BooksIcon, CalendarDotIcon, CardsIcon, ClockIcon, GameIcon, HistoryIcon, ListIcon,
  PlayCircleIcon, QuizIcon, TrophyIcon, UsersIcon,
} from '../components/Icons';
import {
  BookmarkButton, DoneBadge, EmptyState, IconBadge, PointsPill, RankRow, RowChevron,
  SectionLabel, StatTile, StickyFooter, SubPage, SurfaceRow,
} from '../components/Ui';
import { fmtDate } from '../lib/date';
import { CONTEST_STATE } from '../data/guides';
import type { Book, Contest, Deck, Game, TestItem, TestSubject } from '../data/guides';
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

const RankList = ({ rows }: { rows: { rank: number; name: string; sub: string; points: number; self?: boolean }[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {rows.map((r) => <RankRow key={r.rank} {...r} />)}
  </Box>
);

/* ---------------- Bäsleşik ---------------- */

export function ContestDetailScreen({ contest, onBack, toast }: {
  contest: Contest; onBack: () => void; toast: Toast;
}) {
  const st = CONTEST_STATE[contest.state];
  const [joined, setJoined] = useState(false);

  const cta = () => {
    if (contest.state === 'done') { toast('Jogaplaryň seljermesi tiz wagtda'); return; }
    setJoined(true);
    toast(contest.state === 'live' ? 'Bäsleşige goşulyň — test açylýar' : 'Ýazyldyň, başlanda habar bereris');
  };

  return (
    <SubPage
      title="Bäsleşik"
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'contest', id: contest.id, title: contest.title, sub: `${contest.subject} · ${contest.when}` }} />}
    >
      <Hero
        tint={st.tint} accent={st.color}
        icon={<TrophyIcon size={28} />}
        badge={<StatePill label={st.label} color={st.color} />}
        title={contest.title}
        meta={`${contest.subject} · ${contest.when}`}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={`${contest.questions}`} label="Sowal" color={tokens.ink} />
        <StatTile value={`${contest.minutes} min`} label="Wagt" color={tokens.ink} />
        <StatTile value={`${contest.players}`} label="Gatnaşyjy" color={tokens.blueText} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
        <Card title="Bäsleşik barada"><Prose>{contest.about}</Prose></Card>
        <Card title="Düzgünler"><Steps items={contest.rules} accent={st.color} /></Card>
        <Card title="Baýrak gaznasy">
          {contest.prizes.map((p, i) => (
            <Box key={p.place} sx={{
              display: 'flex', alignItems: 'center', gap: '12px', minHeight: 44,
              borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none', pt: i > 0 ? '10px' : 0,
            }}>
              <Box aria-hidden sx={{
                width: 26, height: 26, borderRadius: '50%', flex: 'none',
                bgcolor: [tokens.gold, tokens.silver, tokens.bronze][i] ?? tokens.surfacePress,
                color: tokens.ink, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>{i + 1}</Box>
              <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{p.place}</Typography>
              <PointsPill value={p.points} unit="bal" />
            </Box>
          ))}
        </Card>
      </Box>

      <SectionLabel>{contest.state === 'done' ? 'Netijeler' : 'Häzirki reýting'}</SectionLabel>
      <RankList rows={contest.leaders} />

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          disabled={joined && contest.state !== 'done'}
          onClick={cta}
          sx={contest.state === 'done'
            ? { bgcolor: tokens.blueTint, color: tokens.blueText, '&:hover': { bgcolor: tokens.blueSoft } }
            : undefined}
        >
          {joined && contest.state !== 'done' ? 'Ýazyldyň' : contest.state === 'done' ? 'Jogaplarymy gör' : st.cta}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Oýun ---------------- */

export function GameDetailScreen({ game, onBack, toast }: {
  game: Game; onBack: () => void; toast: Toast;
}) {
  const fresh = game.played === 0;
  return (
    <SubPage
      title="Oýun"
      onBack={onBack}
      action={<BookmarkButton item={{ kind: 'game', id: game.id, title: game.label, sub: `${game.subject} · ${game.minutes} minut` }} />}
    >
      <Hero
        tint={game.tint} accent={game.accent}
        icon={<GameIcon size={28} />}
        title={game.label}
        meta={`${game.subject} · ${game.minutes} minut`}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={fresh ? '—' : `${game.best}`} label="Iň gowy netije" color={game.accent} />
        <StatTile value={`${game.played}`} label="Oýnalan" color={tokens.ink} />
        <StatTile value={fresh ? '—' : `${game.avg}`} label="Ortaça" color={tokens.ink} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
        <Card title="Oýun barada"><Prose>{game.about}</Prose></Card>
        <Card title="Nähili oýnalýar"><Steps items={game.how} accent={game.accent} /></Card>
      </Box>

      <SectionLabel>Iň gowy netijeler</SectionLabel>
      <RankList rows={game.leaders} />

      <Box sx={{ height: '8px' }} />
      <StickyFooter>
        <Button
          fullWidth variant="contained" disableElevation
          onClick={() => toast('Oýun tiz wagtda elýeterli bolar')}
        >
          {fresh ? 'Ilkinji gezek oýna' : 'Oýna'}
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

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
              {deck.studiedAt ? `Soňky gaýtalama: ${fmtDate(deck.studiedAt)}` : 'Entek öwrenilmedik'}
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

export function TestDetailScreen({ test, accent, tint, onBack, toast }: {
  test: TestItem; accent: string; tint: string; onBack: () => void; toast: Toast;
}) {
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
          onClick={() => toast('Test tiz wagtda açylar')}
        >
          {test.best === null ? 'Testi başla' : 'Gaýtadan tabşyr'}
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
