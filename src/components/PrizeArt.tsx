import { Box } from '@mui/material';
import type { PrizeArtId } from '../data/guides';
import { tokens } from '../theme';

/*
 * What the prize looks like.
 *
 * A prize contest is entered for an object, and an object with no picture is a
 * line of text competing with every other line on the page. The app has no
 * image pipeline — no uploads, no CDN, nothing in `public/` but the
 * curriculum — so these are drawn rather than photographed: one flat line
 * illustration per prize kind, in the app's own stroke weight and tokens, on
 * the white tile the design puts a product shot on.
 *
 * They are deliberately generic. "Laptop" is not a picture of a MacBook, and
 * that is the honest form for a drawing standing in for a specific product:
 * the model is written underneath, where a caption can be corrected without
 * anyone redrawing anything. When real photography exists, `art` becomes a
 * file name and only this file changes.
 */

const S = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' } as const;
const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ART: Record<PrizeArtId, JSX.Element> = {
  laptop: (
    <>
      <rect x="10" y="14" width="28" height="18" rx="2.4" {...S} />
      <path d="M6 36h36l-2.2-4H8.2L6 36Z" {...S} {...round} />
      <path d="M20 34h8" {...S} {...round} />
    </>
  ),
  earbuds: (
    <>
      <rect x="8" y="24" width="16" height="14" rx="4" {...S} />
      <path d="M12 24v-2.5a4 4 0 0 1 8 0V24" {...S} {...round} />
      <path d="M32 12a5 5 0 0 1 5 5v9a4 4 0 0 1-8 0 4 4 0 0 1 3-3.9V17a5 5 0 0 0-5-5" {...S} {...round} />
    </>
  ),
  watch: (
    <>
      <rect x="15" y="14" width="18" height="21" rx="5" {...S} />
      <path d="M20 14V9h8v5M20 35v5h8v-5" {...S} {...round} />
      <path d="M24 21v4l3 2" {...S} {...round} />
    </>
  ),
  tablet: (
    <>
      <rect x="12" y="7" width="24" height="34" rx="3.4" {...S} />
      <path d="M21 36h6" {...S} {...round} />
      <path d="M16 12h16" {...S} {...round} strokeWidth={1} opacity={0.5} />
    </>
  ),
  ereader: (
    <>
      <rect x="12" y="8" width="24" height="32" rx="3" {...S} />
      <path d="M17 15h14M17 20h14M17 25h9" {...S} {...round} />
    </>
  ),
  books: (
    <>
      <path d="M10 12h11a3 3 0 0 1 3 3v22a3 3 0 0 0-3-2.6H10V12Z" {...S} {...round} />
      <path d="M38 12H27a3 3 0 0 0-3 3v22a3 3 0 0 1 3-2.6h11V12Z" {...S} {...round} />
    </>
  ),
};

/**
 * The illustration on its tile. `size` is the tile; the drawing sits on a 48
 * grid inside it, so a 56px tile and a 120px one carry the same picture.
 */
export function PrizeArt({ art, size = 56, color = tokens.ink2, bg = '#fff' }: {
  art: PrizeArtId; size?: number; color?: string; bg?: string;
}) {
  return (
    <Box aria-hidden sx={{
      width: size, height: size, flex: 'none', bgcolor: bg, color,
      borderRadius: `${size >= 96 ? tokens.rCard : tokens.rTile}px`,
      display: 'grid', placeItems: 'center',
    }}>
      <Box
        component="svg"
        viewBox="0 0 48 48"
        sx={{ width: size * 0.68, height: size * 0.68, display: 'block' }}
      >
        {ART[art]}
      </Box>
    </Box>
  );
}
