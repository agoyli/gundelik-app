/*
 * Who else has handed it in.
 *
 * A pupil's own to-do list answers "have I done it". The question they ask
 * next, every evening, is "has anyone else" — and the honest answer changes
 * what they do about it. So the class is shown in exactly the shape their own
 * list is shown in: the same tick box, the same strike-through, the same
 * progress bar over the top. Read-only, because ticking someone else's
 * homework is not a thing a diary lets you do.
 *
 * The count is free and the names are not. A free reader sees "6/24 tabşyrdy"
 * on the row — the fact is theirs — and the list behind it is the paid part,
 * which is the only kind of teaser worth showing: the number is real, and so
 * is what it is hiding.
 */

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  ChipRow, IconBadge, RowEnd, SheetDrawer, SurfaceRow, TodoList, TodoRow,
} from '../components/Ui';
import { TeaserCard } from '../components/Paywall';
import { UsersIcon } from '../components/Icons';
import { classDoneCount, classOf, classSize, mateDidHw, mateDoneCount } from '../data/classmates';
import { tierFor, useCan } from '../state/prefs';
import { useChild } from '../state/children';
import { tokens } from '../theme';
import type { Lesson } from '../types';

/** Lessons that actually set homework — the only ones this sheet is about. */
export const hwLessons = (lessons: Lesson[]) => lessons.filter((l) => l.hw);

const ALL = 'all';

/**
 * The row that opens it. `self` is the reader's own answer, counted into the
 * total so the number on the row is the whole class, not the class minus one.
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
      sub={total === 0 ? 'Bu gün tabşyryk ýok' : 'Kim ýerine ýetirdi'}
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
  const { id: child } = useChild();
  const mates = classOf(child);
  const size = classSize(child);
  const tasks = hwLessons(lessons);
  /* null means "not chosen yet" — only then does the opening lesson decide,
     so picking «Ählisi» is not overruled by where the sheet was opened from. */
  const [pick, setPick] = useState<string | null>(null);
  const want = pick ?? focus ?? ALL;
  const chosen = want === ALL || tasks.some((l) => l.id === want) ? want : ALL;
  const ids = chosen === ALL ? tasks.map((l) => l.id) : [chosen];

  /* One task: done or not. All of them: done means all of them. */
  const isDone = (mateIndex: number) =>
    mateDoneCount(mates[mateIndex], ids) === ids.length;
  const done = mates.filter((_, i) => isDone(i)).length
    + (ids.length > 0 && ids.every((id) => lessons.find((l) => l.id === id)?.hwDone) ? 1 : 0);

  const roster = (limit?: number) => (
    <TodoList done={done} total={size}>
      {mates.slice(0, limit).map((m, i) => (
        <TodoRow
          key={m.id}
          label={m.name}
          sub={chosen === ALL
            ? `${mateDoneCount(m, ids)}/${ids.length} tabşyryk`
            : mateDidHw(m, chosen) ? 'Tabşyrdy' : 'Tabşyrmady'}
          done={isDone(i)}
          strike={false}
        />
      ))}
    </TodoList>
  );

  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Synpdaşlar</Typography>
      <Typography variant="caption">
        {tasks.length === 0
          ? 'Bu gün synpa tabşyryk berilmedi'
          : chosen === ALL
            ? `${size} okuwçydan ${done}-si ähli tabşyrygy ýerine ýetirdi`
            : `${size} okuwçydan ${done}-si ýerine ýetirdi`}
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

      <Box sx={{ mt: '14px' }}>
        {tasks.length === 0
          ? <Typography variant="body2">Tabşyryk ýok — sanamaga zat ýok 🎉</Typography>
          : can
            ? roster()
            : (
              <TeaserCard
                title="Synpdaşlaryň ady"
                note={`Kimiň ýerine ýetirendigini at-at görmek üçin ${tierFor('classmates')?.name} gerek. Sany hemişe açyk.`}
                feature="classmates"
                icon={<UsersIcon size={22} />}
                preview={roster(4)}
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
