import { Box, Typography } from '@mui/material';
import { BrandLockup, BrandMark } from '../components/Brand';
import { SectionLabel } from '../components/Ui';
import { tokens } from '../theme';
import { level, ratio } from './contrast';
import {
  DocsPage, Fig, Mono, Num, Plate, Prose, Rule, Stage, Table,
} from './docs';
import type { PlateRef } from './docs';
import { BRAND_BLUE, MARK_PATH } from './marks';

/*
 * The brandbook: who this product is, and what its identity is allowed to do.
 *
 * The parts it is *made of* — tokens, type, every component — live on the
 * design system page (#/design). Splitting them is not filing: a designer
 * drawing a store listing and a designer drawing a settings row are asking
 * different questions, and one long page made both scroll past the other's
 * answer.
 */

const PLATES: readonly PlateRef[] = [
  ['01', 'Marka', 'What this is, and who opens it'],
  ['02', 'Nyşan', 'The mark'],
  ['03', 'Görnüşler', 'Variants, lockups, architecture'],
  ['04', 'Howpsuz meýdan', 'Clear space, minimum size, misuse'],
  ['05', 'Programma nyşany', 'App icon'],
  ['06', 'Ses', 'Voice'],
  ['07', 'Faýllar', 'Assets and governance'],
] as const;

const MISUSE = [
  { note: 'Never rotate. A cube tipped off its axis stops being a cube.', el: <BrandMark size={62} style={{ transform: 'rotate(20deg)' }} /> },
  { note: 'Never stretch. The 2:1 projection collapses immediately.', el: <BrandMark size={62} style={{ transform: 'scaleX(1.45)' }} /> },
  { note: 'Never recolour. Brand blue, ink, or a white knockout.', el: <BrandMark size={62} style={{ color: tokens.purple }} /> },
  {
    note: 'Never fill a face. The faces are holes, not shapes.',
    el: (
      <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <Box sx={{
          position: 'absolute', width: 32, height: 32, bgcolor: tokens.orange,
          clipPath: 'polygon(50% 0, 100% 28%, 50% 56%, 0 28%)',
        }} />
        <BrandMark size={62} />
      </Box>
    ),
  },
  { note: 'No shadow, bevel, glow or gradient on the mark.', el: <BrandMark size={62} style={{ filter: 'drop-shadow(0 6px 7px rgba(17,18,19,.45))' }} /> },
  {
    note: 'Never park it in a badge. The hexagon is already the container.',
    el: (
      <Box sx={{ display: 'grid', placeItems: 'center', width: 80, height: 80, borderRadius: '999px', bgcolor: tokens.blueTint }}>
        <BrandMark size={46} />
      </Box>
    ),
  },
  {
    note: 'Never on a busy ground — the faces fill with whatever is behind.',
    el: (
      <Box sx={{
        display: 'grid', placeItems: 'center', width: 104, height: 78,
        background: `linear-gradient(120deg, ${BRAND_BLUE}, ${tokens.green}, ${tokens.orange})`,
      }}>
        <BrandMark size={56} />
      </Box>
    ),
  },
  {
    note: 'Never reset either wordmark in another face.',
    el: <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 25 }}>eMekdep</Typography>,
  },
];

export function BrandbookScreen() {
  return (
    <DocsPage
      route="brand"
      kicker="eMekdep · Gündelik"
      title={<>Brandbook</>}
      lede="The identity: the mark, which blue is which, how the two names lock up, and what the product is allowed to sound like. The parts it is built from live on the design system page."
      meta={['Wersiýa 1.0', '#/brand', 'iOS · Android · Web']}
      art={<BrandMark size={168} title="eMekdep" />}
      plates={PLATES}
    >
      {/* 01 ── marka */}
      <Plate n="01" title="Marka" en="What this is, and who opens it">
        <Prose lead>
          eMekdep is the school platform used across Turkmenistan. Gündelik is its phone half:
          a parent opens it to read a school day and sign it; a student opens it to see what was
          set, practise, and ask a question at ten at night when nobody is awake to answer.
        </Prose>
        <Prose>
          The product's job is to state what actually happened at school today — accurately, in
          Turkmen, on a phone that may be three generations old. It is a record before it is
          anything else.
        </Prose>
        <SectionLabel>Dört okyjy</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            ['Ene-ata', 'Reads the day, signs it, messages the teacher, pays.'],
            ['Okuwçy', 'Homework, roadmap, tests, cards, the AI tutor.'],
            ['Mugallym', 'Records marks, badges and notes; answers parents.'],
            ['Mekdep müdiri', 'Publishes announcements, reads reports.'],
          ].map(([who, what]) => (
            <Box key={who} sx={{
              bgcolor: '#fff', border: `1px solid ${tokens.divider}`,
              borderRadius: `${tokens.rRow}px`, p: '18px',
            }}>
              <Typography sx={{ fontWeight: 650, mb: '4px' }}>{who}</Typography>
              <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.5 }}>{what}</Typography>
            </Box>
          ))}
        </Box>
        <Prose>
          Design for whichever of the four is on the screen you are drawing. A single “how it
          works” that serves all four serves none of them — the parent scrolls past mark entry,
          the teacher past signatures.
        </Prose>
        <Rule title="A number is stated once and derived everywhere else.">
          Two components never restate the same figure from separate literals. A stored ranking,
          a stored colour, a second copy of “premium” — each is free to disagree with the thing it
          was copied from. Both documentation pages are built the same way.
        </Rule>
        <Rule title="The content is the page.">
          No section opens with a tinted banner repeating the first row beneath it in a louder
          voice. That is a promotion, not navigation.
        </Rule>
        <Rule title="Say what remains, not what is lost.">
          Limits are stated where the choice is made, in terms of what the reader still has. No
          countdowns, no invented scarcity, no urgency the product does not actually have.
        </Rule>
        <Rule title="Personality: a good class teacher.">
          Plain-spoken, precise, respectful of the reader's time and of the institution behind the
          marks. Not playful — a mark is somebody's school record. Not corporate — a parent is not
          a user segment.
        </Rule>
      </Plate>

      {/* 02 ── nyşan */}
      <Plate n="02" title="Nyşan" en="The mark">
        <Prose lead>
          The mark is a cube, drawn as an open frame: a six-sided silhouette with three faces left
          as white space. It is the icon already shipping on iOS, Android and the web build, and it
          is the only mark this brand has.
        </Prose>
        <Stage>
          <Fig label="The mark"><BrandMark size={150} title="eMekdep" /></Fig>
          <Fig label="Seven points, three edges">
            <svg width={150} height={150} viewBox="-8 -8 528 528" aria-hidden>
              <path fill={BRAND_BLUE} fillRule="evenodd" d={MARK_PATH} opacity={0.16} />
              <g fill="none" stroke={tokens.ink3} strokeWidth={3}>
                <path d="M256 0 L512 128 L512 384 L256 512 L0 384 L0 128 Z" />
                <path d="M256 256 L256 512 M256 256 L0 128 M256 256 L512 128" />
              </g>
              <g fill={BRAND_BLUE}>
                {[[256, 0], [512, 128], [512, 384], [256, 512], [0, 384], [0, 128], [256, 256]].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={9} />
                ))}
              </g>
            </svg>
          </Fig>
        </Stage>
        <Table
          head={['Measure', 'Value', 'Note']}
          rows={[
            ['Silhouette', <Num>Hexagon, 512 × 512</Num>, 'Vertical sides, points top and bottom. The artwork fills its box exactly — there is no built-in padding.'],
            ['Projection', <Num>2 : 1 — 26.57°</Num>, 'Not true 30° isometric. Every sloping edge runs two across for one down, which is why it sits square on a pixel grid.'],
            ['Frame weight', <Num>≈ 63 / 512 — 12.3%</Num>, 'Even all the way round; the three interior edges carry the same weight as the silhouette.'],
            ['Joins', <Num>Rounded, ≈ 32 / 512</Num>, 'Every corner, outside and in. Nothing in the mark comes to a sharp point.'],
            ['Faces', <Num>3, all white space</Num>, 'The faces are holes, not shapes. On any ground the ground shows through them.'],
          ]}
        />
        <Rule warn title="The vector in this app is a reconstruction, not the original artwork.">
          No vector of the mark exists in any repository — it ships as 512&nbsp;px PNGs and as a
          Flutter asset. <Mono>MARK_PATH</Mono> was traced from the 512&nbsp;px master at half-pixel
          tolerance and agrees with it on 99.83% of its ink. It is safe at any size, but if the
          original artwork turns up, replace the constant and delete this note.
        </Rule>
        <Rule title="The faces stay empty.">
          Filling them — with a tint, a gradient, a photograph, three different colours — turns an
          open frame into a solid object and breaks every small size. The mark reads because the
          ground passes through it.
        </Rule>
      </Plate>

      {/* 03 ── görnüşler */}
      <Plate n="03" title="Görnüşler" en="Variants, lockups, architecture">
        <SectionLabel>Üç görnüş</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <Stage><Fig label="Brand blue · default"><BrandMark size={76} /></Fig></Stage>
          <Stage><Fig label="Mono · ink"><BrandMark size={76} style={{ color: tokens.ink }} /></Fig></Stage>
          <Stage bg={BRAND_BLUE}><Fig label=""><BrandMark size={76} style={{ color: '#fff' }} /></Fig></Stage>
        </Box>
        <Prose>
          The mark is one colour, always: brand blue by default, ink where a page is set in one
          colour, white knocked out of a filled ground. There is no two-tone version, no gradient
          version and no version with a filled face.
        </Prose>

        <SectionLabel>Lokaplar</SectionLabel>
        <Stage gap={52}>
          <Fig label="Platform lockup"><BrandLockup kind="platform" size={40} /></Fig>
          <Fig label="Product lockup"><BrandLockup kind="product" size={40} /></Fig>
          <Fig label="Stacked"><BrandLockup kind="platform" size={46} stacked /></Fig>
        </Stage>
        <Table
          head={['Measure', 'Value', 'Note']}
          rows={[
            ['Gap, horizontal', <Num>0.33 × mark width</Num>, 'Derived inside BrandLockup, so a lockup cannot be assembled at the wrong gap.'],
            ['Gap, stacked', <Num>0.22 × mark width</Num>, 'Optically centred on the wordmark, not on its bounding box.'],
            ['Product name', <Num>0.62 × mark · 800 · −3.5%</Num>, 'The mark’s points overshoot the caps, so the name is set to the mark rather than matched to its height.'],
            ['Wordmark height', <Num>0.5 × mark</Num>, 'The eMekdep artwork carries its own side bearings; do not add more.'],
          ]}
        />
        <Rule title="The “ü” keeps its diaeresis. Always.">
          “Gundelik” is a different word and a visible disrespect. Any face chosen for the wordmark
          must carry ä ç ž ň ö ş ü ý — check before you set it, not after.
        </Rule>

        <SectionLabel>Marka gurluşy</SectionLabel>
        <Prose>
          eMekdep is the platform: the schools, the journal, the reports, the contracts. Gündelik
          is the app families hold. <b>One mark serves both</b> — what changes is the name beside
          it. Use the platform lockup on anything a school administration reads, and the product
          lockup on the store listing and anywhere a family is being addressed.
        </Prose>
        <Rule warn title="Two blues exist, and they are four percent apart.">
          The mark and the wordmark both ship in <Mono>{BRAND_BLUE}</Mono>. The interface blue is
          {' '}<Mono>tokens.blue</Mono> — <Mono>{tokens.blue}</Mono>. Side by side at similar size they
          read as a printing fault rather than two deliberate colours, so never put the logo
          directly beside a UI-blue element on the same surface. One blue per surface.
        </Rule>
        <Rule warn title={`${BRAND_BLUE} is never a text colour.`}>
          It measures <Num>{ratio(BRAND_BLUE, '#FFFFFF')}</Num> on white — {level(BRAND_BLUE, '#FFFFFF')} at
          body size. Legitimate as the logo's own fill at display size, and nowhere else. Three
          icons in the app still carry it as a hardcoded hex; they are a bug, not a precedent.
        </Rule>
        <Rule title="Open question for the next revision.">
          Drawing the logo in <Mono>tokens.blue</Mono> instead would remove the near-miss entirely
          and cost nothing at display size, where both read as the same blue. It needs a decision
          from whoever owns the brand; until then both values stand as documented here.
        </Rule>
      </Plate>

      {/* 04 ── howpsuz meýdan */}
      <Plate n="04" title="Howpsuz meýdan" en="Clear space, minimum size, misuse">
        <Prose lead>
          Clear space is <b>one third of the mark's width</b> on every side, measured from the
          bounding box — which, since the artwork fills its box, is the hexagon's own extremes.
        </Prose>
        <Stage gap={44}>
          <Fig label="Clear space = ⅓ of the width">
            <Box sx={{ bgcolor: tokens.blueTint, p: '32px', display: 'inline-flex' }}>
              <Box sx={{ outline: `2px dashed ${BRAND_BLUE}`, outlineOffset: '-1px', display: 'inline-flex' }}>
                <BrandMark size={96} />
              </Box>
            </Box>
          </Fig>
          <Fig label="96 · 48 · 32 · 24 · 20 px">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '18px' }}>
              {[96, 48, 32, 24, 20].map((s) => <BrandMark key={s} size={s} />)}
            </Box>
          </Fig>
        </Stage>
        <Table
          head={['Context', 'Minimum', 'Why']}
          rows={[
            ['Screen', <Num>20 px</Num>, 'Below this the three faces close up and the cube reads as a solid blob.'],
            ['Favicon', <Num>16 px</Num>, 'Only with the frame weight thickened by hand for that one export.'],
            ['App icon', <Num>60 px</Num>, 'Smallest home-screen rendering on the platforms we ship to.'],
            ['Print', <Num>8 mm</Num>, 'Below 8 mm the faces fill in on uncoated stock.'],
          ]}
        />
        <SectionLabel>Nädogry ulanyş</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {MISUSE.map((m, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Box sx={{
                height: 122, display: 'grid', placeItems: 'center', overflow: 'hidden',
                bgcolor: '#fff', border: `1px solid ${tokens.redTint}`, borderRadius: `${tokens.rRow}px`,
              }}>{m.el}</Box>
              <Typography sx={{ fontSize: 13, color: tokens.ink2, lineHeight: 1.45 }}>
                <Box component="span" sx={{ color: tokens.redText, fontWeight: 700, fontSize: 11.5, mr: '7px' }}>ÝOK</Box>
                {m.note}
              </Typography>
            </Box>
          ))}
        </Box>
      </Plate>

      {/* 05 ── programma nyşany */}
      <Plate n="05" title="Programma nyşany" en="App icon">
        <Prose lead>
          The icon is the mark on white — no gradient, no ground colour, no wordmark. This is what
          ships today on iOS, Android, macOS and the web build.
        </Prose>
        <Stage gap={36}>
          {[
            { size: 132, radius: 30, mark: 82, label: '1024 master · 132 shown', bg: '#fff' },
            { size: 60, radius: 14, mark: 38, label: '60 px · minimum', bg: '#fff' },
            { size: 60, radius: 999, mark: 38, label: 'Circle mask', bg: '#fff' },
            { size: 60, radius: 14, mark: 38, label: 'Reversed · dark contexts', bg: BRAND_BLUE },
          ].map((ic, i) => (
            <Fig key={i} label={ic.label}>
              <Box sx={{
                display: 'grid', placeItems: 'center', width: ic.size, height: ic.size,
                borderRadius: `${ic.radius}px`, bgcolor: ic.bg,
                border: ic.bg === '#fff' ? `1px solid ${tokens.divider}` : 0,
              }}>
                <BrandMark size={ic.mark} style={ic.bg === '#fff' ? undefined : { color: '#fff' }} />
              </Box>
            </Fig>
          ))}
        </Stage>
        <Table
          head={['Spec', 'Value']}
          rows={[
            ['Master canvas', <Num>1024 × 1024, square, no baked corner radius</Num>],
            ['Mark size', <Num>640 px — 62.5% of the canvas</Num>],
            ['Ground', <Num>#FFFFFF, flat</Num>],
            ['Safe zone', <Num>Everything inside the centre 80% circle</Num>],
            ['Android adaptive', <Num>Foreground = mark at 45% of 108dp; background = flat white</Num>],
            ['Themed (Android 13+)', <Num>Mono mark, system tint, transparent ground</Num>],
          ]}
        />
        <Rule title="The wordmark never goes in the icon.">
          Under the label the OS already prints, it is unreadable and redundant.
        </Rule>
        <Rule warn title="A white icon needs a visible edge in the store.">
          On the white listing pages of both stores the icon disappears into the page. Give the
          screenshots and the feature graphic a coloured ground — never by adding a border to the
          icon itself.
        </Rule>
      </Plate>

      {/* 06 ── ses */}
      <Plate n="06" title="Ses" en="Voice">
        <Prose lead>
          Turkmen, in the register a class teacher uses with a parent: exact about facts, warm about
          people, never dramatic. Interface strings are written by whoever designs the screen — they
          are design material, not copy added later.
        </Prose>
        <Table
          head={['Use', 'Not', 'Because']}
          rows={[
            ['Barla', 'Tassykla, Täzele', 'It is a parent’s signature on a day — “I have seen this” — not a data refresh or an approval.'],
            ['Üns bermeli', 'Käýinç', 'The negative badge describes something to work on, not a reprimand handed down.'],
            ['Nyşan', 'Bellik', '“Bellik” already means a teacher’s note in the diary. One word cannot carry two meanings one screen apart.'],
            ['Göreldeli · Zehinli', 'Premium, Gold, Pro', 'Plans are named after the student they are bought for. A tier a family can say out loud is one they can choose between.'],
          ]}
        />
        <Rule title="A row’s second line is a value, never an explanation.">
          The label already says what the row does. Put current state on the right —
          {' '}<i>Dil → Türkmen dili ›</i> — and drop the rest, so a menu reads as a list of
          destinations instead of a list of paragraphs.
        </Rule>
        <Rule title="Every mutating action ends in a toast that names what happened.">
          And a toast is the <i>last</i> resort for a dead end: a row that could plausibly open a
          page gets the page, not a “Tiz wagtda…”.
        </Rule>
        <Rule title="Dates: DD.MM.YYYY, never an ordinal month name.">
          <i>04.02.2026</i> is scannable, fixed-width and sorts by eye. Relative wins at ±1 day —
          {' '}<i>Şu gün · Düýn · Ertir</i> — and loses past it, because “3 gün öň” makes the reader do
          arithmetic to place it in a week.
        </Rule>
        <Rule title="No invented scarcity.">
          When something is locked, the number of hidden rows is the real number and the dates stay
          visible. A specific gap is stronger than a wall, and everything on screen is still true.
        </Rule>
      </Plate>

      {/* 07 ── faýllar */}
      <Plate n="07" title="Faýllar" en="Assets and governance">
        <Table
          head={['File', 'What it is', 'Use for']}
          rows={[
            [<Mono>src/brand/marks.ts</Mono>, 'The mark and wordmark as path data', 'The source both components draw from.'],
            [<Mono>src/components/Brand.tsx</Mono>, 'BrandMark · BrandWordmark · BrandLockup', 'Every appearance of the logo in the product.'],
            [<Mono>brand/emekdep-mark.svg</Mono>, 'The mark as a standalone file', 'Handing the logo to anyone outside the codebase.'],
            [<Mono>brand/emekdep-appicon.svg</Mono>, '1024 master, white ground', 'Store builds, home screen.'],
            [<Mono>brand/emekdep-mark-512.png</Mono>, 'The original raster master', 'Reference — what the vector was traced from.'],
            [<Mono>brand/emekdep-wordmark.svg</Mono>, 'The platform wordmark, as it ships', 'Platform lockups outside the codebase.'],
          ]}
        />
        <Rule title="The code is the source of truth; these pages read it.">
          The palette, the type scale, the icon sheet and every component specimen are the running
          code. If something looks wrong here, the fix is in <Mono>src/</Mono>, not in this file.
        </Rule>
        <SectionLabel>Açyk meseleler</SectionLabel>
        <Rule warn title="The mark has no original vector.">
          Everything downstream is a raster or a trace. Finding the original artwork — or
          commissioning a redraw of the frame geometry — is the highest-value thing anyone could do
          to this kit.
        </Rule>
        <Rule warn title="Two blues, pending a decision.">
          See plate 03. Until it is settled, brand blue stays on brand surfaces and
          {' '}<Mono>tokens.blue</Mono> stays inside the product.
        </Rule>
        <Rule warn title="Three icons still carry hardcoded hexes.">
          <Mono>{BRAND_BLUE}</Mono>, <Mono>#898D95</Mono> and <Mono>#5A5E6F</Mono>, of which only the
          last is a token. They predate this palette. Bugs to fix, never a precedent.
        </Rule>
      </Plate>
    </DocsPage>
  );
}
