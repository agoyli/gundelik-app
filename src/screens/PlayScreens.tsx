import { Box, ButtonBase, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { CheckIcon, GameIcon, LockIcon } from '../components/Icons';
import { TeaserCard } from '../components/Paywall';
import {
  ChipRow, EmptyState, IconBadge, RowChevron, SectionHeading, SubPage, SurfaceRow,
} from '../components/Ui';
import { tierFor, useCan } from '../state/prefs';
import { USER_GRADE } from '../data/curriculum';
import { KIND_META } from '../data/kinds';
import { loadPlayCards, playCount, playGroups } from '../data/library';
import type { PlayCard, PlayGroup, PlayItem } from '../data/library';
import { chipGrade, chipValue, gradeChips } from '../lib/gradeFilter';
import { ordinal } from '../lib/tm';
import { LessonScreen } from './LessonScreen';
import { tokens } from '../theme';

/*
 * Interaktiw sapaklar — the interactives, on their own.
 *
 * Every one of these is already a stop on some subject's path, so this section
 * adds no material: it is the same 766 mini-apps indexed by activity instead of
 * by subject, for the reader who has twenty minutes and no particular chapter
 * in mind. Opening one opens the same lesson page the path opens, which is why
 * nothing here has to be kept in step with anything — there is one player.
 *
 * The path could never say more than "Interaktiw · Gönükme" about a stop,
 * because at that point in the screen nothing has been fetched. A list that
 * exists to be browsed has to say what each one is, so a group fetches its
 * subject-grade's lesson file once and every card carries the lesson's own
 * opening line.
 */

const meta = KIND_META.interactive;

/* ---------------- The player ---------------- */

/*
 * One interactive, opened by the same page the path opens it with.
 *
 * The mini-app gets the whole screen there, the file it needs is fetched there,
 * the AI helper and the paywall behave there — so this is a call, not a second
 * implementation. It is what a card here opens and what a bookmark re-opens.
 */
export function PlayerScreen({ item, done, onBack, onDone, onUpgrade }: {
  item: PlayItem; done?: boolean;
  onBack: () => void; onDone?: () => void; onUpgrade: () => void;
}) {
  return (
    <LessonScreen
      lesson={{
        id: item.id,
        title: item.title,
        kind: 'interactive',
        extent: 'Gönükme',
        done: !!done,
        grade: item.grade,
        nos: [item.no],
        ready: true,
      }}
      subjectSlug={item.slug}
      meta={meta}
      onClose={onBack}
      onComplete={() => (onDone ?? onBack)()}
      onUpgrade={onUpgrade}
    />
  );
}

const groupSub = (g: PlayGroup, withGrade: boolean) =>
  [withGrade ? `${ordinal(g.grade)} synp` : null, `${g.items.length} gönükme`]
    .filter(Boolean).join(' · ');

/* ---------------- One group: the cards, with what each is about ---------------- */

function PlayGroupScreen({ group, onBack, onUpgrade }: {
  group: PlayGroup; onBack: () => void; onUpgrade: () => void;
}) {
  /* undefined while the subject-grade's lesson file is in flight */
  const [cards, setCards] = useState<PlayCard[] | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState<PlayItem | null>(null);
  /* finished in this session — the same session state the path keeps */
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    setCards(undefined);
    setFailed(false);
    loadPlayCards(group)
      .then((c) => { if (live) setCards(c); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [group]);

  if (playing) {
    return (
      <PlayerScreen
        item={playing}
        done={done.includes(playing.id)}
        onBack={() => setPlaying(null)}
        onDone={() => {
          setDone((d) => (d.includes(playing.id) ? d : [...d, playing.id]));
          setPlaying(null);
        }}
        onUpgrade={onUpgrade}
      />
    );
  }

  /* The titles are the programme's, so a card is as tall as its theme name is
     long; the note is the lesson's hook, clamped to two lines. */
  return (
    <SubPage
      title={group.subject}
      onBack={onBack}
      help="Bu gönükmeler dersiň sapak ýolundakylar bilen birmeňzeş. Nirede tamamlasaň, ikisinde-de tamamlanan bolýar."
    >
      <SectionHeading title={`${ordinal(group.grade)} synp`} />
      {failed && (
        <EmptyState
          icon={<GameIcon size={26} />}
          title="Açyp bolmady"
          note="Baglanyşygy barlap, sahypany täzeden aç."
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(cards ?? group.items.map((it) => ({ ...it, note: '' }))).map((c, i) => (
          <ButtonBase
            key={c.id}
            onClick={() => setPlaying(c)}
            sx={{
              display: 'block', textAlign: 'start', width: '100%',
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px',
            }}
          >
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <IconBadge bg={meta.tint} color={meta.ink} size={44}>
                {done.includes(c.id) ? <CheckIcon size={22} /> : <GameIcon size={22} />}
              </IconBadge>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: meta.ink }}>
                  {ordinal(i + 1)} gönükme
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: tokens.ink, mt: '2px' }}>
                  {c.title}
                </Typography>
                {c.note && (
                  <Typography sx={{
                    fontSize: 13.5, color: tokens.ink2, mt: '4px', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {c.note}
                  </Typography>
                )}
              </Box>
              <Box sx={{ pt: '10px' }}><RowChevron /></Box>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </SubPage>
  );
}

/* ---------------- The section: every interactive, cut by grade ---------------- */

export function PlayScreen({ startGrade, startGroupId, onBack, onUpgrade }: {
  /** the grade the reader was filtered to when they came here — `null` is every
      grade, `undefined` is "they came in cold", which opens on their own */
  startGrade?: number | null;
  /** a subject's own interactives, when they arrived by tapping that subject */
  startGroupId?: string;
  onBack: () => void; onUpgrade: () => void;
}) {
  const opening = startGrade === null ? undefined : startGrade ?? USER_GRADE;
  const [grade, setGrade] = useState<number | undefined>(opening);
  const [group, setGroup] = useState<PlayGroup | null>(
    () => playGroups(opening).find((g) => g.id === startGroupId) ?? null,
  );
  const can = useCan('games');
  const plan = tierFor('games');

  const groups = useMemo(() => playGroups(grade), [grade]);
  const total = useMemo(() => playCount(grade), [grade]);

  if (group) {
    return <PlayGroupScreen group={group} onBack={() => setGroup(null)} onUpgrade={onUpgrade} />;
  }

  return (
    <SubPage
      title="Interaktiw sapaklar"
      onBack={onBack}
      help="Her temanyň interaktiw gönükmesi — sapagy okanyňdan soň şol temany elleriň bilen synap görmek üçin. Sapak ýolundakylar bilen birmeňzeş: nirede tamamlasaň, ikisinde-de tamamlanan bolýar."
    >
      <Box sx={{ pt: '4px', pb: '2px' }}>
        <ChipRow
          label="Synp"
          value={chipValue(grade)}
          onChange={(id) => setGrade(chipGrade(id))}
          chips={gradeChips}
        />
      </Box>

      <SectionHeading
        title={grade === undefined ? 'Ähli synplar' : `${ordinal(grade)} synp`}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={<GameIcon size={26} />}
          title="Bu synpda gönükme ýok"
          note="Interaktiw gönükmeler materialy taýýar bolan temalar bilen bilelikde çykýar. Başga synpy saýlap gör."
        />
      ) : (
        <>
          <Typography sx={{ fontSize: 13.5, color: tokens.ink2, pb: '10px' }}>
            {total} gönükme · {groups.length} ders
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map((g, i) => (
              <SurfaceRow
                key={g.id}
                icon={can || i === 0
                  ? <IconBadge bg={g.tint} color={g.accent} size={44}><GameIcon size={22} /></IconBadge>
                  : <IconBadge bg={tokens.lockTile} color={tokens.lockInk} size={44}><LockIcon size={20} /></IconBadge>}
                label={g.subject}
                /* the grade is on every row only in the all-grades view, where
                   the same subject appears once per year it is taught */
                sub={can || i === 0
                  ? groupSub(g, grade === undefined)
                  : `${groupSub(g, grade === undefined)} · ${plan?.name} bilen açylýar`}
                end={<RowChevron />}
                onClick={() => (can || i === 0 ? setGroup(g) : onUpgrade())}
              />
            ))}
          </Box>
        </>
      )}

      {!can && groups.length > 1 && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title={`${playCount()} gönükme`}
            note={`Ähli synplaryň interaktiw gönükmeleri — ${plan?.name} bilen açylýar.`}
            feature="games"
            onUpgrade={onUpgrade}
          />
        </Box>
      )}
    </SubPage>
  );
}
