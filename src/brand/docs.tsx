import { Box, GlobalStyles, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { BrandMark } from '../components/Brand';
import { tokens } from '../theme';

/*
 * The furniture both documentation pages are built from.
 *
 * There are two of them — the brandbook (#/brand) and the design system
 * (#/design) — and they answer different questions. The brandbook is about the
 * *identity*: the mark, its blues, its lockups, what the product may sound
 * like. The design system is about the *parts*: tokens, type, and every
 * component in `Ui.tsx` staged live. Someone drawing a poster needs the first;
 * someone drawing a screen needs the second, and neither should have to scroll
 * through the other.
 *
 * They share this file so the two pages cannot drift into two house styles —
 * which would be the fragmentation both pages exist to argue against.
 */

export const MAX = 1120;

export type PlateRef = readonly [n: string, title: string, en: string];

/* ---------------- text ---------------- */

export const Prose = ({ children, lead }: { children: ReactNode; lead?: boolean }) => (
  <Typography sx={{
    maxWidth: '68ch', fontSize: lead ? 17.5 : 15.5,
    color: lead ? tokens.ink : tokens.ink2, lineHeight: 1.6,
  }}>{children}</Typography>
);

/** A normative statement. The pages are mostly these; prose is the exception. */
export const Rule = ({ title, children, warn }: {
  title: string; children: ReactNode; warn?: boolean;
}) => (
  <Box sx={{ borderLeft: `2px solid ${warn ? tokens.redText : tokens.blue}`, pl: '16px', maxWidth: '68ch' }}>
    <Typography sx={{ fontWeight: 650, letterSpacing: '-.01em', mb: '2px' }}>{title}</Typography>
    <Typography sx={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.55 }}>{children}</Typography>
  </Box>
);

export const Mono = ({ children }: { children: ReactNode }) => (
  <Box component="code" sx={{
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12.5, bgcolor: tokens.surface, px: '6px', py: '2px', borderRadius: `${tokens.rChip}px`,
    whiteSpace: 'nowrap',
  }}>{children}</Box>
);

export const Num = ({ children }: { children: ReactNode }) => (
  <Box component="span" sx={{
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontVariantNumeric: 'tabular-nums', fontSize: 13,
  }}>{children}</Box>
);

/* ---------------- staging ---------------- */

export const Stage = ({ children, bg = '#fff', gap = 28, pad = 32 }: {
  children: ReactNode; bg?: string; gap?: number; pad?: number;
}) => (
  <Box sx={{
    bgcolor: bg, border: `1px solid ${bg === '#fff' ? tokens.divider : 'transparent'}`,
    borderRadius: `${tokens.rCard}px`, p: `${pad}px`, maxWidth: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', gap: `${gap}px`, minHeight: 120, overflowX: 'auto',
  }}>{children}</Box>
);

export const Fig = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '11px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 96 }}>{children}</Box>
    {label && (
      <Typography sx={{ fontSize: 12, color: tokens.inkMuted, textAlign: 'center', lineHeight: 1.45 }}>
        {label}
      </Typography>
    )}
  </Box>
);

/*
 * A component that owns a whole screen — the capsule header, the tab bar, a
 * sticky footer — cannot be judged floating on a white card. It gets the
 * surface it was drawn for: 393px, clipped, with the app's own frame.
 */
export const PhoneStage = ({ children, height = 300, label }: {
  children: ReactNode; height?: number; label?: string;
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '11px', alignItems: 'center' }}>
    <Box sx={{
      width: 393, height, flex: '0 0 auto', position: 'relative', overflow: 'hidden',
      bgcolor: '#fff', border: `1px solid ${tokens.divider}`, borderRadius: `${tokens.rCard}px`,
    }}>{children}</Box>
    {label && <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>{label}</Typography>}
  </Box>
);

/** Wide specimens scroll inside their own box; the page never scrolls sideways. */
export const Scroller = ({ children, gap = 24 }: { children: ReactNode; gap?: number }) => (
  <Box sx={{
    overflowX: 'auto', display: 'flex', gap: `${gap}px`, pb: '4px',
    maxWidth: '100%',
    scrollbarWidth: 'thin',
  }}>{children}</Box>
);

export const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <Box sx={{
    border: `1px solid ${tokens.divider}`, borderRadius: `${tokens.rRow}px`,
    overflowX: 'auto', bgcolor: '#fff', maxWidth: '100%',
  }}>
    <Box component="table" sx={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 14 }}>
      <Box component="thead">
        <Box component="tr">
          {head.map((h) => (
            <Box
              component="th"
              key={h}
              sx={{
                textAlign: 'left', p: '11px 16px', fontSize: 11, fontWeight: 600,
                letterSpacing: '.07em', textTransform: 'uppercase', color: tokens.inkMuted,
                borderBottom: `1px solid ${tokens.dividerSoft}`, whiteSpace: 'nowrap',
              }}
            >{h}</Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {rows.map((r, i) => (
          <Box component="tr" key={i}>
            {r.map((cell, j) => (
              <Box
                component="td"
                key={j}
                sx={{
                  p: '11px 16px', verticalAlign: 'middle',
                  color: j === 0 ? tokens.ink : tokens.ink2,
                  borderBottom: i === rows.length - 1 ? 0 : `1px solid ${tokens.dividerSoft}`,
                }}
              >{cell}</Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

/** The row a component specimen sits in: what it is on the left, the thing itself on the right. */
export const SpecRow = ({ name, note, children }: {
  name: string; note: string; children: ReactNode;
}) => (
  <Box sx={{
    display: 'grid', gap: '24px', alignItems: 'center',
    gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
    py: '20px', borderBottom: `1px solid ${tokens.dividerSoft}`,
    '&:last-of-type': { borderBottom: 0 },
  }}>
    <Box>
      <Typography sx={{ fontWeight: 650, fontSize: 15 }}>{name}</Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink2, lineHeight: 1.45, mt: '3px' }}>{note}</Typography>
    </Box>
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      minWidth: 0, maxWidth: '100%', overflowX: 'auto',
    }}>{children}</Box>
  </Box>
);

export const SpecGroup = ({ children }: { children: ReactNode }) => (
  <Box sx={{
    bgcolor: '#fff', border: `1px solid ${tokens.divider}`,
    borderRadius: `${tokens.rCard}px`, px: { xs: '16px', md: '24px' }, maxWidth: '100%',
  }}>{children}</Box>
);

/* ---------------- page ---------------- */

export const Plate = ({ n, title, en, children }: {
  n: string; title: string; en: string; children: ReactNode;
}) => (
  <Box
    id={`p${n}`}
    component="section"
    sx={{ borderTop: `1px solid ${tokens.divider}`, py: '64px', scrollMarginTop: '76px' }}
  >
    <Box sx={{
      maxWidth: MAX, mx: 'auto', px: { xs: '20px', md: '32px' },
      display: 'grid', gap: { xs: '10px', md: '24px' },
      gridTemplateColumns: { xs: '1fr', md: '72px minmax(0, 1fr)' },
    }}>
      <Typography sx={{
        fontSize: 13, fontWeight: 500, color: tokens.inkMuted,
        fontVariantNumeric: 'tabular-nums', pt: { md: '10px' },
      }}>{n}</Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ fontSize: { xs: 27, md: 34 }, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.inkMuted, mt: '5px', mb: '30px' }}>{en}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  </Box>
);

const NavLink = ({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) => (
  <Box
    component="a"
    href={href}
    sx={{
      flex: '0 0 auto', textDecoration: 'none', fontSize: 13, fontWeight: 600,
      px: '11px', py: '7px', borderRadius: `${tokens.rPill}px`,
      color: active ? '#fff' : tokens.ink2,
      bgcolor: active ? tokens.ink : 'transparent',
      '&:hover': { bgcolor: active ? tokens.ink : tokens.surfacePress },
    }}
  >{children}</Box>
);

export function DocsPage({ route, title, kicker, lede, meta, art, plates, children }: {
  route: 'brand' | 'design';
  title: ReactNode;
  kicker: string;
  lede: string;
  meta: string[];
  art: ReactNode;
  plates: readonly PlateRef[];
  children: ReactNode;
}) {
  return (
    <>
      {/* the docs scroll the document; the phone surface does not */}
      <GlobalStyles styles={{
        'html, body, #root': { height: 'auto', minHeight: '100%' },
        body: { background: tokens.surface, overscrollBehavior: 'auto' },
      }} />

      <Box sx={{ bgcolor: tokens.surface, color: tokens.ink, minHeight: '100dvh', pb: '80px', overflowX: 'hidden' }}>
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 10,
          bgcolor: tokens.blurBg, backdropFilter: tokens.blur, WebkitBackdropFilter: tokens.blur,
          borderBottom: `1px solid ${tokens.divider}`,
        }}>
          <Box sx={{
            maxWidth: MAX, mx: 'auto', px: { xs: '16px', md: '32px' }, minHeight: 56,
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <Box component="a" href="#/brand" sx={{ display: 'inline-flex', flex: '0 0 auto' }}>
              <BrandMark size={22} title="eMekdep" />
            </Box>
            <Box sx={{ display: 'flex', gap: '4px', flex: '0 0 auto' }}>
              <NavLink href="#/brand" active={route === 'brand'}>Brandbook</NavLink>
              <NavLink href="#/design" active={route === 'design'}>Dizaýn ulgamy</NavLink>
            </Box>
            <Box sx={{
              display: { xs: 'none', lg: 'flex' }, gap: '2px', flex: 1, overflowX: 'auto',
              scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            }}>
              {plates.map(([n, t]) => (
                <Box
                  key={n}
                  component="a"
                  href={`#p${n}`}
                  sx={{
                    flex: '0 0 auto', textDecoration: 'none', color: tokens.ink2,
                    fontSize: 12.5, px: '9px', py: '7px', borderRadius: `${tokens.rCell}px`,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: tokens.surfacePress, color: tokens.ink },
                  }}
                >
                  <Box component="span" sx={{ color: tokens.inkDisabled, mr: '5px' }}>{n}</Box>{t}
                </Box>
              ))}
            </Box>
            <Box component="a" href="#/" sx={{
              flex: '0 0 auto', ml: 'auto', textDecoration: 'none',
              color: tokens.blueText, fontSize: 13, fontWeight: 600,
            }}>← Programma</Box>
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${tokens.divider}` }}>
          <Box sx={{
            maxWidth: MAX, mx: 'auto', px: { xs: '20px', md: '32px' }, py: { xs: '48px', md: '72px' },
            display: 'grid', gap: { xs: '32px', md: '56px' }, alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr)' },
          }}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>{art}</Box>
            <Box>
              <Typography sx={{
                fontSize: 12, fontWeight: 600, letterSpacing: '.09em',
                textTransform: 'uppercase', color: tokens.inkMuted, mb: '10px',
              }}>{kicker}</Typography>
              <Typography component="h1" sx={{
                fontSize: { xs: 40, md: 58 }, fontWeight: 800, letterSpacing: '-.035em',
                lineHeight: 1, mb: '16px',
              }}>{title}</Typography>
              <Prose lead>{lede}</Prose>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '9px', mt: '26px' }}>
                {meta.map((m) => (
                  <Box key={m} sx={{
                    border: `1px solid ${tokens.divider}`, borderRadius: `${tokens.rPill}px`,
                    px: '12px', py: '7px', fontSize: 12, color: tokens.inkMuted,
                  }}>{m}</Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {children}

        <Box sx={{ maxWidth: MAX, mx: 'auto', px: { xs: '20px', md: '32px' }, pt: '48px' }}>
          <Typography sx={{ fontSize: 13.5, color: tokens.inkMuted, maxWidth: '68ch' }}>
            eMekdep · Gündelik — {route === 'brand' ? 'brandbook' : 'dizaýn ulgamy'} v1.0, a route in the
            product itself. Everything on this page is read from the running code:
            {' '}<Mono>src/theme.ts</Mono>, <Mono>src/components/Ui.tsx</Mono>,
            {' '}<Mono>src/components/Icons.tsx</Mono>.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
