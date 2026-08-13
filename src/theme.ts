import { createTheme } from '@mui/material/styles';

/* Design tokens extracted from the source mock */
/*
 * Accent colors come in grades:
 *   `x`      — fills, icons, borders, charts (WCAG needs only 3:1 for these)
 *   `xSolid` — the same accent as a *surface carrying white words* (>=4.5:1 on #fff)
 *   `xText`  — the same accent when it carries *words* at caption/body size
 *              (>=4.5:1 on white, on `surface`, and on its own tint)
 * Never set a caption in the plain accent; use the Text grade. Never put white
 * words on the plain accent; use the Solid grade.
 *
 * Blue is the brand, and the whole ramp is *derived* from the logo's own colour
 * — scaled toward black for the solids, toward white for the tints — so the app
 * and the mark cannot drift apart again. `blue` is the mark's colour exactly.
 * It measures 3.91:1 on white, which carries a fill or an icon but not a word,
 * which is the entire reason the Solid and Text grades exist.
 */
export const tokens = {
  blue: '#3F7CF2',      /* the logo's colour, exactly */
  blueSolid: '#3970DA', /* brand x .90 — white words on it clear 4.66:1 */
  bluePress: '#3161BD', /* brand x .78 — the Solid grade, pressed */
  blueText: '#2D59AE',  /* brand x .72 — 6.6:1 on white */
  blueSoft: '#DCE7FD',  /* brand + 82% white */
  blueTint: '#F2F6FE',  /* brand + 93% white */
  surface: '#F7F7F7',
  surfacePress: '#EFEFEF',
  pageBg: '#EDEEF1', /* the ground the phone frame sits on */
  ink: '#111213',
  ink2: '#5A5E6F',
  ink3: '#646979',
  inkMuted: '#6B7080',
  inkDisabled: '#C4C6CA',
  divider: '#E4E5E6',
  dividerSoft: '#EDEDF1',
  red: '#EA5455',
  redDeep: '#D22630',
  redText: '#BC2C32',
  redTint: '#FDE8E8',
  green: '#2DD579',
  greenDeep: '#22A06B',
  greenText: '#17734D',
  greenTint: '#E3F7ED',
  orange: '#F59B1B',
  orangeText: '#965600',
  orangeTint: '#FDEFDC',
  purple: '#A78BE0',
  purpleText: '#7050B5',
  purpleTint: '#EDE6F9',
  teal: '#1FA58C',
  tealText: '#10705F',
  tealTint: '#DFF3EF',
  gold: '#F2C94C',
  silver: '#C8CDD4',
  bronze: '#D9A05B',
  lockTile: '#ECECEF',
  lockInk: '#A9A9B0',
  lockBadge: '#B9B9C0',
  heatBase: '#F2F2F4',
  heat1: '#C8EDD9',
  heat2: '#7CD9A8',
  dot: '#494C5B',
  rCard: 24,
  rRow: 16,
  rTile: 12,
  rCell: 8,
  rChip: 4,   /* swatches, legend keys, heat cells — anything under ~16px square */
  rPill: 999, /* also the right answer for any bar: a bar's radius is half its height */
  gutter: '11px',
  padCard: '17px',
  ease: 'cubic-bezier(.32,.72,.28,1)',
  /* glass surfaces — the one blur treatment used app-wide */
  blurBg: 'rgba(255,255,255,.92)',
  blurBgSoft: 'rgba(255,255,255,.8)',
  blurTintBg: 'rgba(242,246,254,.88)', /* blueTint, at 88% */
  blur: 'saturate(1.6) blur(14px)',
  /* elevation scale: raised control · floating control · primary FAB · sticky header */
  shadowCtl: '0 1px 4px rgba(17,18,19,.07)',
  shadowFloat: '0 6px 18px rgba(17,18,19,.14)',
  shadowFab: '0 8px 20px rgba(63,124,242,.4)',
  shadowHeader: '0 8px 16px -10px rgba(17,18,19,.16)',
} as const;

/*
 * The type ladder. Every `fontSize` in the app is one of these, and
 * `npm run check:tokens` fails the build if one isn't.
 *
 * 13.5 and 12.5 are real steps, not slips. They carried 42 and 63 uses
 * respectively — more than several of the named variants — because dense label
 * rows and micro captions each genuinely needed a half step between 13 and 14
 * and below 13. Declaring them is honest; pretending the scale was 13/14 was
 * not. Everything sparser than that was snapped onto a neighbour.
 */
export const TYPE_SCALE = [34, 30, 26, 22, 20, 17, 16, 15, 14, 13.5, 13, 12.5, 12, 11] as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    /* contained buttons set white labels on `primary.main`, so the palette takes
       the Solid grade — the brand blue itself is 3.91:1 and would fail there */
    primary: { main: tokens.blueSolid, dark: tokens.bluePress, light: tokens.blueSoft },
    success: { main: tokens.green },
    error: { main: tokens.red },
    background: { default: tokens.pageBg, paper: '#FFFFFF' },
    text: { primary: tokens.ink, secondary: tokens.ink2, disabled: tokens.inkDisabled },
    divider: tokens.divider,
  },
  shape: { borderRadius: tokens.rRow },
  typography: {
    fontFamily:
      "'Inter Variable','Inter',-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif",
    h1: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px' },
    h2: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
    h3: { fontSize: 16, fontWeight: 600, letterSpacing: '-0.2px' }, // card title
    subtitle1: { fontSize: 17, fontWeight: 600, letterSpacing: '-0.2px' }, // row label
    body1: { fontSize: 15 },
    body2: { fontSize: 14, lineHeight: 1.5 },
    caption: { fontSize: 13, color: tokens.ink3 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: 15 },
  },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: tokens.rRow, height: 48, boxShadow: 'none' },
        contained: { '&.Mui-disabled': { backgroundColor: tokens.inkDisabled, color: '#fff' } },
        containedPrimary: { '&:active': { backgroundColor: tokens.bluePress } },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: { borderRadius: tokens.rCard, backgroundColor: '#F1F1F3' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: `${tokens.rCard}px ${tokens.rCard}px 0 0`,
          maxWidth: 393,
          margin: '0 auto',
          boxShadow: '0 -8px 40px rgba(17,18,19,.16)',
          backgroundColor: 'rgba(255,255,255,.9)',
          backdropFilter: 'saturate(1.6) blur(20px)',
        },
      },
    },
  },
});
