import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { IconBadge } from '../components/Ui';
import { tokens } from '../theme';

/*
 * The few shapes the settings tree and the help centre both build rows from.
 *
 * They used to live in SettingsScreens.tsx, which is also where the help pages
 * lived. Splitting help into its own file needed these in a third place: if
 * HelpScreens imported them from SettingsScreens while SettingsScreens imports
 * the help pages, the two files would import each other.
 */

export type Toast = (m: string) => void;

export const rowIcon = (icon: ReactNode, tint: string, color: string) => (
  <IconBadge bg={tint} color={color} size={44}>{icon}</IconBadge>
);

/* The badge for rows with no accent of their own. It must NOT be `surface` —
   that is the SurfaceRow's own fill, so the squircle disappears and the row
   shows a bare floating icon next to neighbours that have a container. */
export const NEUTRAL = { tint: tokens.surfacePress, ink: tokens.ink2 };

export const LABEL_SX = { fontSize: 15, fontWeight: 500 };

export const RowGroup = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</Box>
);
