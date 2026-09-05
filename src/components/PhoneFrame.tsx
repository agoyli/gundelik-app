/*
 * The surface the product lives on.
 *
 * Edge-to-edge on a phone; a 393×852 handset with a bezel radius and a drop
 * shadow from 480px up, centred in the page. It is a component rather than a
 * few lines inside the shell because it stopped being only the shell's: the
 * onboarding renders *before* the tabs exist, and while the frame lived in
 * `Shell` those three screens spread across a 1440px desktop as full-bleed
 * white — the one screen a new family sees first was the one screen that did
 * not look like the app.
 *
 * Anything that owns the whole screen mounts inside this.
 */

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { tokens } from '../theme';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', bgcolor: tokens.pageBg }}>
      <Box sx={{
        width: '100%', maxWidth: 393, height: '100%', position: 'relative',
        bgcolor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        '@media (min-width:480px)': {
          my: '24px', height: 'min(852px, calc(100dvh - 48px))',
          /* a handset bezel, not a UI radius — deliberately off the ladder */
          borderRadius: '44px', boxShadow: '0 10px 40px rgba(17,18,19,.14)',
        },
      }}>
        {children}
      </Box>
    </Box>
  );
}
