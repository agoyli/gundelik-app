/*
 * Who has handed it in.
 *
 * A pupil's own to-do list answers "have I done it". The question they ask
 * next, every evening, is "has anyone else" — and the shape of the answer
 * matters more than the answer. This page shows **only the pupils who did
 * it**: a class list under the heading "has not done their homework" is a wall
 * of shame, it is the one screen a parent would show a child as a threat, and
 * it tells the reader nothing they can act on.
 *
 * It is an order, not a roster. Three names with the time they finished, and
 * then a number — naming the fourteenth pupil to hand in is data, not
 * information — and above them the line the reader actually came for: where
 * *they* came in. Ticking the task is what fills that line, so the reward for
 * doing the work is the first thing the screen says.
 *
 * The reader's own place is free, on every tier: it is a fact about them. The
 * three names are what the subscription buys.
 */

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  ChipRow, DoneBadge, EmptyState, IconBadge, RankRow, RowEnd, SheetDrawer, SurfaceRow,
} from '../components/Ui';
import { TeaserCard } from '../components/Paywall';
import { HwIcon, TrophyIcon, UsersIcon } from '../components/Icons';
import {
  classDoneCount, classSize, doersOf, fmtHandIn, selfHandIn, selfPlace,
} from '../data/classmates';
import { tierFor, useCan } from '../state/prefs';
import { useChild } from '../state/children';
import { tokens } from '../theme';
import type { Lesson } from '../types';

/** Lessons that actually set homework — the only ones this sheet is about. */
export const hwLessons = (lessons: Lesson[]) => lessons.filter((l) => l.hw);

const ALL = 'all';

/* Three names, then numbers. */
const TOP = 3;

/**
 * The row that opens it. `selfDone` is the reader's own answer, counted into
 * the total so the number on the row is the whole class, not the class minus
 * one.
 */
export function ClassHwRow({ lessons, selfDone, onOpen }: {
  lessons: Lesson[]; selfDone: number; onOpen: () => void;
}) {
  const { id: child } = useChild();
  const ids = hwLessons(lessons).map((l) => l.id);
  const total = ids.length;
  const done = classDoneCount(child, ids) + (total > 0 && selfDone === total ? 1 : 0);
  return (
    <SurfaceRow
      icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={38}><UsersIcon size={19} /></IconBadge>}
      label="Synpdaşlar"
      sub={total === 0 ? 'Bu gün tabşyryk ýok' : 'Kim öý iş etdi — we näçinji'}
      end={<RowEnd value={`${done}/${classSize(child)}`} />}
      onClick={onOpen}
    />
  );
}

export function ClassHwSheet({ open, onClose, lessons, focus, onUpgrade }: {
  open: boolean;
  onClose: () => void;
  lessons: Lesson[];
  /** lesson id to open on, when the sheet was opened from one lesson */
  focus?: string;
  onUpgrade: () => void;
}) {
  const can = useCan('classmates');
  const { id: child, child: me } = useChild();
  const size = classSize(child);
  const tasks = hwLessons(lessons);
  /* null means "not chosen yet" — only then does the opening lesson decide,
     so picking «Ählisi» is not overruled by where the sheet was opened from. */
  const [pick, setPick] = useState<string | null>(null);
  const want = pick ?? focus ?? ALL;
  const chosen = want === ALL || tasks.some((l) => l.id === want) ? want : ALL;
  const ids = chosen === ALL ? tasks.map((l) => l.id) : [chosen];

  const doers = doersOf(child, ids);
  /* the reader counts as a doer only when their own ticks say so */
  const mineDone = ids.length > 0 && ids.every((id) => lessons.find((l) => l.id === id)?.hwDone);
  const place = selfPlace(child, ids);
  const done = doers.length + (mineDone ? 1 : 0);
  const top = doers.slice(0, TOP);
  const rest = doers.length - top.length;

  /* Where the reader sits in the order — as a row only when they are not
     already one of the three above, which would be the same fact twice. The
     name is the child's own: the row already wears a "Siz" badge, and a row
     that says Siz twice reads as two people. */
  const selfRow = mineDone && place > TOP ? (
    <RankRow
      key="self"
      rank={place}
      name={me.short}
      sub={`${fmtHandIn(selfHandIn(child, ids))} tabşyrdyňyz`}
      end={<DoneBadge size={22} />}
      self
    />
  ) : null;

  const board = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {top.map((d, i) => (
        <RankRow
          key={d.mate.id}
          rank={i + 1}
          name={d.mate.name}
          sub={`${fmtHandIn(d.at)} tabşyrdy`}
          end={<DoneBadge size={22} />}
        />
      ))}
      {/* the reader's own row sits in its place in the order, not after the
          people who came in behind them */}
      {selfRow}
      {rest > 0 && (
        /* Everyone after the third is a number. A class list is not a
           leaderboard past the podium, and naming the fourteenth pupil to
           hand in tells the reader nothing they can use. */
        <Typography sx={{ fontSize: 13, color: tokens.ink3, px: '6px', pt: '2px' }}>
          {`we ýene ${rest} okuwçy tabşyrdy`}
        </Typography>
      )}
    </Box>
  );

  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Kim öý iş etdi</Typography>
      <Typography variant="caption">
        {tasks.length === 0
          ? 'Bu gün synpa tabşyryk berilmedi'
          : chosen === ALL
            ? `${size} okuwçydan ${done}-si ähli tabşyrygy tabşyrdy`
            : `${size} okuwçydan ${done}-si tabşyrdy`}
      </Typography>

      {tasks.length > 1 && (
        <Box sx={{ mt: '12px' }}>
          <ChipRow
            label="Tabşyryk"
            value={chosen}
            onChange={setPick}
            chips={[{ id: ALL, label: 'Ählisi' }, ...tasks.map((l) => ({ id: l.id, label: l.subject }))]}
          />
        </Box>
      )}

      {/* The reader's own standing, first and free: it is their fact, and it
          is the one line they came for. Ticking the task is what fills it. */}
      {tasks.length > 0 && (
        <Box sx={{
          mt: '14px', bgcolor: mineDone ? tokens.blueTint : tokens.surface,
          borderRadius: `${tokens.rRow}px`, p: '13px 15px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <IconBadge
            bg={mineDone ? '#fff' : tokens.surfacePress}
            color={mineDone ? tokens.blueText : tokens.ink3}
            size={38}
          >{mineDone ? <TrophyIcon size={19} /> : <HwIcon size={19} />}</IconBadge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {mineDone ? `Siz ${place}-nji bolup tabşyrdyňyz` : 'Siz entek tabşyrmadyňyz'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }} noWrap>
              {mineDone
                ? `${done} okuwçydan ${place}-nji · ${fmtHandIn(selfHandIn(child, ids))}`
                : `Synpdan ${doers.length} okuwçy eýýäm tabşyrdy`}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: '14px' }}>
        {tasks.length === 0
          ? <Typography variant="body2">Tabşyryk ýok — sanamaga zat ýok 🎉</Typography>
          : doers.length === 0
            ? (
              <EmptyState
                icon={<UsersIcon size={26} />}
                title="Entek hiç kim tabşyrmady"
                note="Bu tabşyrygy synpdan ilkinji bolup tabşyryp bilersiň."
              />
            )
            : can
              ? board
              : (
                <TeaserCard
                  title="Ilkinji üçlügiň atlary"
                  note={`Kimiň birinji tabşyrandygyny at-at görmek üçin ${tierFor('classmates')?.name} gerek. Sany we öz oruny hemişe açyk.`}
                  feature="classmates"
                  icon={<UsersIcon size={22} />}
                  preview={board}
                  onUpgrade={onUpgrade}
                  compact
                />
              )}
      </Box>

      <Box sx={{ mt: '18px' }}>
        <Button fullWidth onClick={onClose} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
      </Box>
    </SheetDrawer>
  );
}
