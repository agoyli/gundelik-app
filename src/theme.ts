import { createTheme } from '@mui/material/styles';

/* Design tokens extracted from the source mock */
export const tokens = {
  blue: '#3F7CF2',
  bluePress: '#2F66D6',
  blueSoft: '#DCE9FD',
  blueTint: '#EFF5FF',
  surface: '#F7F7F7',
  surfacePress: '#EFEFEF',
  ink: '#111213',
  ink2: '#5A5E6F',
  ink3: '#6F7488',
  inkMuted: '#898D95',
  inkDisabled: '#C4C6CA',
  divider: '#E4E5E6',
  dividerSoft: '#EDEDF1',
  red: '#EA5455',
  redDeep: '#D22630',
  redTint: '#FDE8E8',
  green: '#2DD579',
  greenDeep: '#22A06B',
  greenTint: '#E3F7ED',
  orange: '#F59B1B',
  orangeTint: '#FDEFDC',
  purple: '#A78BE0',
  purpleTint: '#EDE6F9',
  teal: '#1FA58C',
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
  rPill: 999,
  gutter: '11px',
  padCard: '17px',
  ease: 'cubic-bezier(.32,.72,.28,1)',
  /* glass surfaces — the one blur treatment used app-wide */
  blurBg: 'rgba(255,255,255,.92)',
  blurBgSoft: 'rgba(255,255,255,.8)',
  blurTintBg: 'rgba(239,245,255,.88)',
  blur: 'saturate(1.6) blur(14px)',
  /* elevation scale: raised control · floating control · primary FAB · sticky header */
  shadowCtl: '0 1px 4px rgba(17,18,19,.07)',
  shadowFloat: '0 6px 18px rgba(17,18,19,.14)',
  shadowFab: '0 8px 20px rgba(63,124,242,.4)',
  shadowHeader: '0 8px 16px -10px rgba(17,18,19,.16)',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.blue, dark: tokens.bluePress, light: tokens.blueSoft },
    success: { main: tokens.green },
    error: { main: tokens.red },
    background: { default: '#EDEEF1', paper: '#FFFFFF' },
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
    caption: { fontSize: 13, color: tokens.inkMuted },
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
          borderRadius: '24px 24px 0 0',
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
