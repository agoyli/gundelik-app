/*
 * Whose diary is open — the control for it.
 *
 * It was a `Segmented`, which is the right shape for two children and the
 * wrong one for five: a segmented track divides the width by the number of
 * options, so the fifth child arrives as three clipped letters, and the
 * control that says which diary you are reading stops being readable exactly
 * when it matters. It then became a full-width card, which read as *content* —
 * a row about the child rather than a way to change them.
 *
 * What it is now: a **pill and a sheet**. The pill is small, obviously a
 * control, and says one thing — the name on screen. The sheet is the choosing,
 * and it carries the one fact that makes the choice informed: how much of
 * today's homework each child has in. A parent of five opens it to find who
 * needs them tonight, not to read a list of names they already know.
 *
 * The pill lives **in the diary's header**, where the notification bell used
 * to be. Which child you are reading is asked far more often than "what is
 * new", and a root screen holds one control: the bell moved *inside* the
 * sheet, as a row with its own unread count, and the pill carries a dot when
 * something is waiting — so nothing was lost except a second icon competing
 * for the same corner. Analitika has no switcher at all: it is one tab away
 * from the diary, and a control repeated on every screen is a control the eye
 * stops reading. Profil keeps `ChildPickerRow` in its account list, because
 * the identity card above it already shows who this is.
 *
 * One child means no control at all: nothing here renders rather than offering
 * a choice of one.
 */

import { useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import {
  Avatar, CountPill, DoneBadge, IconBadge, RowChevron, RowEnd, SheetDrawer, SurfaceRow,
} from '../components/Ui';
import { BellIcon, ChevronIcon, UsersIcon } from '../components/Icons';
import { PlanBadge } from '../components/Paywall';
import { hwGlance } from '../api/mockApi';
import { inboxUnread } from '../data/inbox';
import { useChild } from '../state/children';
import type { Child } from '../state/children';
import { TODAY } from '../lib/date';
import { tokens } from '../theme';

/* What each row says under the name: their class, and tonight's homework. */
const glanceOf = (c: Child) => {
  const hw = hwGlance(c.id, TODAY);
  if (hw.total === 0) return `${c.cls} · bu gün öý işi ýok`;
  return `${c.cls} · öý işi ${hw.done}/${hw.total}`;
};

/* ---------------- the sheet, shared by every entry point ---------------- */

export function ChildSheet({ open, onClose, onInbox }: {
  open: boolean; onClose: () => void;
  /** where the bell went: a row in here, with its own count */
  onInbox?: () => void;
}) {
  const { id, children, select } = useChild();
  const unread = inboxUnread();
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Çagalarym</Typography>

      {/* Habarlar is the first thing in the sheet, not the last. It used to be
          a bell in the header and it has to stay as reachable as it was: the
          bottom of a five-row list is a place people scroll past, and an
          unread count nobody meets is a notification that did not happen. */}
      {onInbox && (
        <Box sx={{ mt: '12px' }}>
          <SurfaceRow
            icon={<IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={44}><BellIcon size={20} /></IconBadge>}
            label="Habarlar we çatlar"
            labelSx={{ fontSize: 15, fontWeight: 500 }}
            end={(
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unread > 0 && <CountPill n={unread} label="okalmadyk habar" />}
                <RowChevron />
              </Box>
            )}
            onClick={() => { onClose(); onInbox(); }}
          />
        </Box>
      )}

      <Typography variant="caption" sx={{ display: 'block', mt: '16px' }}>
        {`${children.length} çaga · saýlanan çaganyň maglumatlary görkezilýär`}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '10px' }}>
        {children.map((c) => (
          <SurfaceRow
            key={c.id}
            /* no ring on the selected child: the ring is the subscription's
               mark, and one mark cannot mean two things. The check says it. */
            icon={<Avatar initials={c.initials} size={40} />}
            label={c.short}
            labelSx={{ fontSize: 16, fontWeight: 700 }}
            /* Each child is on their own plan, so the plan is a fact about the
               row and not about the account — a family can pay for the one
               sitting exams and leave the second-year on Adaty. */
            labelEnd={<PlanBadge child={c} show="plan" />}
            sub={glanceOf(c)}
            end={c.id === id ? <DoneBadge size={22} /> : undefined}
            onClick={() => { select(c.id); onClose(); }}
          />
        ))}
      </Box>

    </SheetDrawer>
  );
}

/* ---------------- the pill in the diary's header ---------------- */

export function ChildHeaderPill({ onInbox }: { onInbox?: () => void }) {
  const { child, children } = useChild();
  const [open, setOpen] = useState(false);
  const unread = inboxUnread();
  /* A single-child account has nothing to switch, but the sheet is also where
     Habarlar lives now — so the control stays, and it is the bell's dot that
     justifies it. */
  const only = children.length < 2;

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={only
          ? `Habarlar${unread ? `, ${unread} okalmadyk` : ''}`
          : `${child.name} — çagany çalyşmak${unread ? `, ${unread} okalmadyk habar` : ''}`}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: '7px', flex: 'none', maxWidth: 172,
          height: 40, pl: '5px', pr: only ? '5px' : '9px', borderRadius: `${tokens.rPill}px`,
          bgcolor: tokens.surface, '&:active': { bgcolor: tokens.surfacePress },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', flex: 'none' }}>
          <Avatar initials={child.initials} size={30} />
          {/* what is left of the bell on the surface: a dot, in the same red
              every unread count in the app uses */}
          {unread > 0 && (
            <Box aria-hidden sx={{
              position: 'absolute', top: -1, right: -1, width: 11, height: 11,
              borderRadius: '50%', bgcolor: tokens.red, border: '2px solid #fff',
            }} />
          )}
        </Box>
        {!only && (
          <>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.2px', minWidth: 0 }}>
              {child.short}
            </Typography>
            <Box aria-hidden sx={{
              color: tokens.inkMuted, display: 'flex', flex: 'none', transform: 'rotate(90deg)',
            }}><ChevronIcon /></Box>
          </>
        )}
      </ButtonBase>

      <ChildSheet open={open} onClose={() => setOpen(false)} onInbox={onInbox} />
    </>
  );
}

/* ---------------- the row in Profil's account list ---------------- */

export function ChildPickerRow() {
  const { child, children } = useChild();
  const [open, setOpen] = useState(false);
  if (children.length < 2) return null;
  return (
    <>
      <SurfaceRow
        icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={44}><UsersIcon size={20} /></IconBadge>}
        label="Çagalarym"
        labelSx={{ fontSize: 15, fontWeight: 500 }}
        end={<RowEnd value={`${children.length} çaga · ${child.short}`} />}
        onClick={() => setOpen(true)}
      />
      <ChildSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
