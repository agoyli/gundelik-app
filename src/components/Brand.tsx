import { Box } from '@mui/material';
import type { SVGProps } from 'react';
import { BRAND_BLUE, MARK_PATH, WORDMARK_PATH } from '../brand/marks';
import { tokens } from '../theme';

/*
 * The logo, as components.
 *
 * It lives beside `Icons.tsx` and follows the same two rules, for the same
 * reason: a `size` prop rather than a fixed box, and `currentColor` rather than
 * a baked-in hex. A logo with its blue hardcoded is single-use — it is wrong
 * the first time it has to knock out of a coloured header, and someone copies
 * the file and edits the fill, and then there are two logos.
 *
 * The one exception to `currentColor` is the default: with no colour set the
 * mark paints itself in `BRAND_BLUE`, because a logo dropped into a page with
 * no instruction should be the brand's own blue and not the surrounding text.
 */

type MarkProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

/** The cube. Default colour is the brand blue; set `color` to knock it out. */
export function BrandMark({ size = 40, title, style, ...rest }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', color: BRAND_BLUE, ...style }}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path fill="currentColor" fillRule="evenodd" d={MARK_PATH} />
    </svg>
  );
}

/** The eMekdep wordmark. `size` is its height; the width follows the artwork. */
export function BrandWordmark({ size = 20, title, style, ...rest }: MarkProps) {
  return (
    <svg
      width={(size * 179) / 40}
      height={size}
      viewBox="0 0 179 40"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', color: BRAND_BLUE, ...style }}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path fill="currentColor" d={WORDMARK_PATH} />
    </svg>
  );
}

/*
 * The two lockups. Both are the mark plus a name, and the only thing that
 * changes is which name: `platform` says eMekdep and addresses a school,
 * `product` says Gündelik and addresses a family. Spacing is derived from the
 * mark's own width so a lockup cannot be assembled at the wrong gap.
 */
export function BrandLockup({ kind = 'product', size = 40, color, stacked = false }: {
  kind?: 'product' | 'platform';
  size?: number;
  /** knock the whole lockup out in one colour; omitted means brand blue + ink */
  color?: string;
  stacked?: boolean;
}) {
  const gap = size * (stacked ? 0.22 : 0.33);
  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: `${gap}px`,
        flexDirection: stacked ? 'column' : 'row',
      }}
    >
      <BrandMark size={size} style={color ? { color } : undefined} />
      {kind === 'platform' ? (
        <BrandWordmark size={size * 0.5} style={color ? { color } : undefined} title="eMekdep" />
      ) : (
        <Box
          component="span"
          sx={{
            /* the mark's points overshoot the caps, so the name is set at
               0.62 of the mark rather than matched to its height */
            fontSize: size * 0.62,
            fontWeight: 800,
            letterSpacing: '-.035em',
            lineHeight: 1,
            color: color ?? tokens.ink,
          }}
        >
          Gündelik
        </Box>
      )}
    </Box>
  );
}
