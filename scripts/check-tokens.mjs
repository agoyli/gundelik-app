/*
 * The design system, enforced.
 *
 * A design system that is only written down is a wish. Every rule the docs
 * state about themselves is checked here, so the pages under /#/design stay
 * true by construction rather than by memory:
 *
 *   1. every `fontSize` is a step on TYPE_SCALE
 *   2. every `borderRadius` goes through a radius token
 *   3. no colour is spelled as a hex outside theme.ts, bar a short allowlist
 *   4. every accent that carries words uses its Text grade, and every accent
 *      surface under white words uses its Solid grade (contrast is computed,
 *      not asserted)
 *
 * Run with `npm run check:tokens`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
})(SRC);

const rel = (p) => p.slice(SRC.length);

/*
 * Read one object-literal value starting at `i`, stopping at the comma that
 * ends it. Quotes, template literals and `${…}` interpolations are tracked so a
 * comma *inside* a value (`p: '4px 13px, 10px'`) doesn't cut it short, and so
 * the following properties on the same line aren't swallowed into it.
 */
function readValue(line, i) {
  let depth = 0, quote = null, out = '';
  for (; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      out += c;
      if (c === quote && line[i - 1] !== '\\') quote = null;
      else if (quote === '`' && c === '{' && line[i - 1] === '$') depth++;
      else if (quote === '`' && c === '}' && depth > 0) depth--;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; out += c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    if (c === ')' || c === ']' || c === '}') { if (depth === 0) break; depth--; }
    if (c === ',' && depth === 0) break;
    out += c;
  }
  return out;
}
const problems = [];
const fail = (file, line, msg) => problems.push(`${rel(file)}:${line}  ${msg}`);

/* ---- the ladder, read from the theme so it cannot fall out of step ---- */
const themeSrc = readFileSync(join(SRC, 'theme.ts'), 'utf8');
const SCALE = new Set(
  themeSrc.match(/export const TYPE_SCALE = \[([^\]]+)\]/)[1]
    .split(',').map((n) => Number(n.trim())),
);
const RADIUS_TOKENS = [...themeSrc.matchAll(/^\s{2}(r[A-Z]\w*):/gm)].map((m) => m[1]);
const tokenHex = {};
for (const m of themeSrc.matchAll(/^\s{2}(\w+): '(#[0-9A-Fa-f]{6})'/gm)) tokenHex[m[1]] = m[2];

/*
 * Colours that are allowed to be literal.
 *   #fff/#000  — knockout ink and pure black; not accents, no token would help
 *   rgba(...)  — shadows and glass, which are alpha over an unknown ground
 * ReferralScreen's palette is the documented exception: those hexes are a
 * *depiction* of Turkmen banknotes, not UI colour, and tokenising them would
 * claim they are reusable.
 */
const HEX_OK = new Set(['#fff', '#ffffff', '#000', '#000000']);
const HEX_EXEMPT_FILES = [
  'screens/ReferralScreen.tsx', /* banknote artwork */
  'brand/marks.ts',            /* the logo's own colour, by definition */
  'brand/BrandbookScreen.tsx', /* prints hex codes as documentation */
  'brand/DesignSystemScreen.tsx',
];

for (const file of files) {
  if (file.endsWith('theme.ts')) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  const exemptHex = HEX_EXEMPT_FILES.some((f) => file.endsWith(f));

  lines.forEach((line, i) => {
    const n = i + 1;
    if (/^\s*(\*|\/\/)/.test(line)) return; /* comments describe, they don't render */

    /* 1. type scale */
    for (const m of line.matchAll(/fontSize: (\d+(?:\.\d+)?)(?![\d.])/g)) {
      const v = Number(m[1]);
      if (!SCALE.has(v)) fail(file, n, `fontSize ${v} is not on TYPE_SCALE`);
    }

    /*
     * 2. radius ladder. Radii are written as template strings — often compound
     * ones like `${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px …` — so
     * the check strips every token interpolation and every allowed exception,
     * then fails if any bare number survives. That catches the 4px hiding in
     * the fourth corner of a chat bubble, which a naive match does not.
     */
    for (const m of line.matchAll(/borderRadius: /g)) {
      /* `<Mono>borderRadius: 4</Mono>` in the docs is prose about the rule, not a use of it.
         In real code the property is always preceded by whitespace, `{` or `,`. */
      if (line[m.index - 1] === '>') continue;
      const value = readValue(line, m.index + m[0].length);
      const rest = value
        .replace(/\$\{tokens\.r[A-Z]\w*\}/g, '')  /* radius tokens */
        .replace(/\$\{[^}]*\}/g, '')              /* other interpolations: variables */
        .replace(/'50%'/g, '')                    /* a circle is not a radius */
        .replace(/'44px'/g, '')                   /* the handset bezel, deliberately off */
        .replace(/\b0\b/g, ' ');                  /* a 0 corner is square, not a radius */
      if (/\d/.test(rest)) {
        fail(file, n, `borderRadius has a bare value (${value.trim().slice(0, 60)}) — use ${RADIUS_TOKENS.join('/')}`);
      }
    }

    /* 3. literal colour */
    if (!exemptHex) {
      for (const m of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
        const hex = m[0].toLowerCase();
        if (HEX_OK.has(hex)) continue;
        const dupe = Object.entries(tokenHex).find(([, v]) => v.toLowerCase() === hex);
        fail(file, n, dupe
          ? `${m[0]} duplicates tokens.${dupe[0]} — use the token`
          : `${m[0]} is a colour with no token`);
      }
    }
  });
}

/* ---- 4. contrast, computed from the tokens themselves ---- */
const chan = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const GROUNDS = { white: '#FFFFFF', surface: tokenHex.surface, surfacePress: tokenHex.surfacePress };
const contrastProblems = [];

/* every Text grade must carry words on white, on surface, and on its own tint */
for (const [name, hex] of Object.entries(tokenHex)) {
  if (!name.endsWith('Text')) continue;
  for (const [gname, g] of Object.entries(GROUNDS)) {
    const r = ratio(hex, g);
    if (r < 4.5) contrastProblems.push(`tokens.${name} on ${gname} = ${r.toFixed(2)} (needs 4.5)`);
  }
  const tint = tokenHex[name.replace(/Text$/, 'Tint')];
  if (tint) {
    const r = ratio(hex, tint);
    if (r < 4.5) contrastProblems.push(`tokens.${name} on its tint = ${r.toFixed(2)} (needs 4.5)`);
  }
}

/* every Solid grade must carry white words */
for (const [name, hex] of Object.entries(tokenHex)) {
  if (!name.endsWith('Solid')) continue;
  const r = ratio(hex, '#FFFFFF');
  if (r < 4.5) contrastProblems.push(`#fff on tokens.${name} = ${r.toFixed(2)} (needs 4.5)`);
}

/*
 * A plain accent has to clear 3:1 on white when it is the thing being read —
 * an icon, a stroke, a border that carries meaning.
 *
 * `green`, `orange` and `purple` are deliberately brighter than that and are
 * fill-only: green fills a progress bar inside a grey track, orange and purple
 * fill roadmap tiles that already carry a text label, a done badge and a pulse.
 * In each case the boundary and the meaning come from something else, which is
 * what WCAG 1.4.11 actually asks. What they must have is somewhere to go when
 * they *do* need to carry meaning — so each is required to own a darker grade.
 */
const FILL_ONLY = { green: 'greenDeep', orange: 'orangeText', purple: 'purpleText' };
for (const name of ['blue', 'green', 'orange', 'red', 'purple', 'teal']) {
  const hex = tokenHex[name];
  if (!hex) continue;
  const r = ratio(hex, '#FFFFFF');
  if (r >= 3) continue;
  const escape = FILL_ONLY[name];
  if (!escape) {
    contrastProblems.push(`tokens.${name} on white = ${r.toFixed(2)} (needs 3 to be read)`);
  } else if (!tokenHex[escape] || ratio(tokenHex[escape], '#FFFFFF') < 3) {
    contrastProblems.push(
      `tokens.${name} is fill-only (${r.toFixed(2)} on white) but tokens.${escape} cannot carry meaning either`);
  }
}

/* ---- report ---- */
if (problems.length) {
  console.error(`\n${problems.length} token violation(s):\n`);
  for (const p of problems) console.error('  ' + p);
}
if (contrastProblems.length) {
  console.error(`\n${contrastProblems.length} contrast violation(s):\n`);
  for (const p of contrastProblems) console.error('  ' + p);
}
if (problems.length || contrastProblems.length) process.exit(1);

console.log(`design system OK — ${files.length} files, ${SCALE.size} type steps, ${RADIUS_TOKENS.length} radii, contrast verified`);
