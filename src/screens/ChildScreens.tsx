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
 * The choice is app-wide, so the pill appears on every tab whose content is
 * about one child — Gündelik and Analitika — and Profil gets `ChildPickerRow`
 * in its account list instead, because the identity card above it already
 * shows who this is and a second portrait would be noise. All three open the
 * same sheet and write the same store: one selection, not one per screen.
 *
 * One child means no control at all: nothing here renders rather than offering
 * a choice of one.
 */

import { useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { Avatar, DoneBadge, IconBadge, RowEnd, SheetDrawer, SurfaceRow } from '../components/Ui';
import { ChevronIcon, UsersIcon } from '../components/Icons';
import { PlanBadge } from '../components/Paywall';
import { hwGlance } from '../api/mockApi';
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

export function ChildSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { id, children, select } = useChild();
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Çagalarym</Typography>
      <Typography variant="caption">
        {`${children.length} çaga · saýlanan çaganyň maglumatlary görkezilýär`}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '14px' }}>
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

/* ---------------- the pill over a child's own screens ---------------- */

export function ChildBar() {
  const { child, children } = useChild();
  const [open, setOpen] = useState(false);
  if (children.length < 2) return null;

  return (
    <>
      <Box sx={{ px: tokens.gutter, pt: '10px' }}>
        <ButtonBase
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${child.name} — çagany çalyşmak`}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', maxWidth: '100%',
            height: 40, pl: '5px', pr: '10px', borderRadius: `${tokens.rPill}px`,
            bgcolor: tokens.surface, '&:active': { bgcolor: tokens.surfacePress },
          }}
        >
          <Avatar initials={child.initials} size={30} />
          <Typography noWrap sx={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.2px', minWidth: 0 }}>
            {child.short}
          </Typography>
          {/* points down, because it opens a list rather than a page */}
          <Box aria-hidden sx={{
            color: tokens.inkMuted, display: 'flex', flex: 'none', transform: 'rotate(90deg)',
          }}><ChevronIcon /></Box>
        </ButtonBase>
      </Box>

      <ChildSheet open={open} onClose={() => setOpen(false)} />
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
