/*
 * Contrast, computed rather than quoted.
 *
 * The brandbook prints a ratio beside every colour pair it documents. Those
 * numbers are derived from `tokens` at render time for the same reason every
 * other figure in this app is derived: a ratio typed into a document is a
 * second source of truth, and the moment someone nudges a hex it is a lie that
 * still looks authoritative.
 */

const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG 2.1 contrast ratio, 1–21. */
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export const ratio = (a: string, b: string) => `${contrast(a, b).toFixed(2)}:1`;

export type Level = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/** What a pair is cleared for at body size — the question a designer is asking. */
export const level = (a: string, b: string): Level => {
  const c = contrast(a, b);
  if (c >= 7) return 'AAA';
  if (c >= 4.5) return 'AA';
  if (c >= 3) return 'AA Large';
  return 'Fail';
};
