/*
 * The one moment the app celebrates.
 *
 * Earning `bal` is the only thing a pupil does here that pays them back, and
 * until now it was announced the same way an error is: a grey toast at the
 * bottom of the screen. A reward that reads like a system message is not a
 * reward. So the number leaves the toast and becomes the event — a coin token
 * that pops, rises and fades, with a ring and a few sparks behind it.
 *
 * Rules it keeps:
 *
 * - **It never blocks anything.** `pointerEvents: none`, no backdrop, no
 *   dismissal: the thumb can carry on ticking the next task while the last
 *   one is still in the air, and each award gets its own token.
 * - **It states the real number.** `award()` is idempotent, so a re-tick pays
 *   nothing and nothing flies — a celebration for points that were not
 *   credited would be the app lying to a child about money.
 * - **It is fixed, above the sheets.** Most ticking happens inside the
 *   homework drawer, and MUI portals that to `body`; an overlay parked inside
 *   the phone frame would celebrate underneath it.
 * - **Reduced motion turns it into a still frame**, via the app-wide
 *   `prefers-reduced-motion` rule that collapses every duration — the toast is
 *   still there, so nothing is lost but the movement.
 */

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CoinIcon } from './Icons';
import { tokens } from '../theme';

type Fly = { id: number; points: number };

let seq = 0;
const listeners = new Set<(f: Fly) => void>();

/** Throw `+N bal` up the screen. Called wherever points are actually banked. */
export const celebrate = (points: number) => {
  if (points <= 0) return;
  const fly = { id: ++seq, points };
  listeners.forEach((l) => l(fly));
};

/* Where the sparks go — fixed angles rather than random ones, so the burst
   looks drawn rather than sprayed, and two awards in a row look alike. */
const SPARKS = [
  { x: -46, y: -18, d: 0 },
  { x: 44, y: -24, d: 40 },
  { x: -34, y: 22, d: 80 },
  { x: 38, y: 20, d: 20 },
  { x: -8, y: -44, d: 60 },
  { x: 12, y: 40, d: 100 },
];

const LIFE = 1400;

function Token({ points }: { points: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      {/* the ring: one push outward, gone before the token is */}
      <Box aria-hidden sx={{
        position: 'absolute', width: 96, height: 96, borderRadius: '50%',
        border: `2px solid ${tokens.orangeText}`, opacity: 0,
        '@keyframes ring': {
          '0%': { transform: 'scale(.5)', opacity: .55 },
          '70%': { opacity: 0 },
          '100%': { transform: 'scale(1.9)', opacity: 0 },
        },
        animation: 'ring .75s cubic-bezier(.2,.7,.3,1) forwards',
      }} />

      {SPARKS.map((s, i) => (
        <Box key={i} aria-hidden sx={{
          position: 'absolute', width: 7, height: 7, borderRadius: '50%',
          bgcolor: i % 2 ? tokens.orangeText : tokens.gold,
          '@keyframes spark': {
            '0%': { transform: 'translate(0,0) scale(.4)', opacity: 0 },
            '25%': { opacity: 1 },
            '100%': { transform: `translate(${s.x}px, ${s.y}px) scale(.9)`, opacity: 0 },
          },
          animation: `spark .8s ${s.d}ms cubic-bezier(.15,.7,.3,1) forwards`,
        }} />
      ))}

      {/* the number itself: a pop with a little overshoot, then it drifts up
          and out — the same coin pill the rest of the app uses for `bal` */}
      <Box sx={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px',
        height: 44, px: '18px', borderRadius: `${tokens.rPill}px`,
        bgcolor: tokens.orangeTint, color: tokens.orangeText,
        boxShadow: tokens.shadowFab,
        '@keyframes earn': {
          '0%': { transform: 'translateY(10px) scale(.7)', opacity: 0 },
          '22%': { transform: 'translateY(0) scale(1.12)', opacity: 1 },
          '34%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '62%': { transform: 'translateY(-10px) scale(1)', opacity: 1 },
          '100%': { transform: 'translateY(-64px) scale(.94)', opacity: 0 },
        },
        animation: `earn ${LIFE}ms cubic-bezier(.2,.8,.3,1) forwards`,
      }}>
        <CoinIcon size={22} />
        <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px' }}>
          +{points} bal
        </Typography>
      </Box>
    </Box>
  );
}

export function PointsFx() {
  const [flies, setFlies] = useState<Fly[]>([]);

  useEffect(() => {
    const on = (f: Fly) => {
      setFlies((all) => [...all, f]);
      window.setTimeout(() => setFlies((all) => all.filter((x) => x.id !== f.id)), LIFE);
    };
    listeners.add(on);
    return () => { listeners.delete(on); };
  }, []);

  if (flies.length === 0) return null;

  return (
    <Box aria-live="polite" sx={{
      position: 'fixed', left: 0, right: 0, top: '46%', zIndex: 1600,
      display: 'grid', placeItems: 'center', pointerEvents: 'none',
    }}>
      {flies.map((f) => <Token key={f.id} points={f.points} />)}
    </Box>
  );
}
