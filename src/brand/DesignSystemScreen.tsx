import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as Icons from '../components/Icons';
import {
  BookmarkButton, CountPill, DateStrip, DeltaLine, DoneBadge, EmptyState, Field,
  GradeBadge, GradeSlot, GridTile, HeaderIconButton, HelpButton, HeroStat, IconBadge,
  Lede, LessonCard, MeterTile, MonthCalendar, PeriodNav, PillHeader, PointsPill,
  RankRow, RowChevron, RowEnd, SectionHeading, SectionLabel, Segmented, SheetSection,
  StatTile, StickyFooter, SurfaceRow, SwitchRow, TabBar, TagPill, ToggleSwitch,
} from '../components/Ui';
import { theme, tokens } from '../theme';
import type { DayInfo, Lesson, TabId } from '../types';
import { level, ratio } from './contrast';
import {
  DocsPage, Fig, Mono, Num, Plate, PhoneStage, Prose, Rule, Scroller, SpecGroup,
  SpecRow, Stage, Table,
} from './docs';
import { BRAND_BLUE } from './marks';

/*
 * The design system: every part a screen is assembled from, staged live.
 *
 * The point of it being a route rather than a document is that nothing here is
 * a picture of a component. The palette is read from `tokens`, the type scale
 * from `theme.typography`, the icon sheet from every export of `Icons.tsx`, and
 * each specimen below is the component itself — so a radius changed in
 * `theme.ts` changes here, and a page cannot teach a button that no longer
 * looks like that.
 */

const PLATES = [
  ['01', 'Reňk', 'Palette, measured'],
  ['02', 'Tipografika', 'Type scale'],
  ['03', 'Forma', 'Radius, spacing, surface, motion'],
  ['04', 'Bahalar', 'Marks'],
  ['05', 'Setirler', 'Rows'],
  ['06', 'Bellikler', 'Pills and badges'],
  ['07', 'Plitalar', 'Tiles and figures'],
  ['08', 'Dolandyryjylar', 'Controls'],
  ['09', 'Sahypa gurluşy', 'Page structure'],
  ['10', 'Senenama', 'Dates'],
  ['11', 'Piktogrammalar', 'The icon set'],
] as const;

/* ---------------- specimen data ---------------- */

const SPECIMEN_LESSON: Lesson = {
  id: 'spec',
  subject: 'Himiýa',
  time: '9:50 – 10:35',
  teacher: 'M. Ataýew',
  people: 3,
  grade: 5,
  hwDone: false,
  tema: 'Kislotalar we esaslar. Neýtrallaşma reaksiýasy.',
  hw: 'Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.',
};

const SPECIMEN_WEEK: DayInfo[] = [
  { key: '2026-02-09', d: 9, w: 'Duş', full: 'Duşenbe', checked: true },
  { key: '2026-02-10', d: 10, w: 'Siş', full: 'Sişenbe', checked: true },
  { key: '2026-02-11', d: 11, w: 'Çar', full: 'Çarşenbe' },
  { key: '2026-02-12', d: 12, w: 'Pen', full: 'Penşenbe' },
  { key: '2026-02-13', d: 13, w: 'Ann', full: 'Anna' },
  { key: '2026-02-14', d: 14, w: 'Şen', full: 'Şenbe' },
];

const ACCENTS = [
  { label: 'Ýaşyl', fill: tokens.green, text: tokens.greenText, tint: tokens.greenTint, carries: 'Success, a 5, a signed day, the done badge.' },
  { label: 'Gök', fill: tokens.blue, text: tokens.blueText, tint: tokens.blueTint, carries: 'The interface primary, and a 4.' },
  { label: 'Narynç', fill: tokens.orange, text: tokens.orangeText, tint: tokens.orangeTint, carries: 'Points, a 3, the coin.' },
  { label: 'Gyzyl', fill: tokens.red, text: tokens.redText, tint: tokens.redTint, carries: 'Unread, alerts, a 2, destructive actions.' },
  { label: 'Benewşe', fill: tokens.purple, text: tokens.purpleText, tint: tokens.purpleTint, carries: 'Video lessons, the beta label.' },
  { label: 'Firuze', fill: tokens.teal, text: tokens.tealText, tint: tokens.tealTint, carries: 'Interactive lessons, society subjects.' },
];

const INKS: [string, string, string][] = [
  ['ink', tokens.ink, 'Titles, marks, the primary line of any row.'],
  ['ink2', tokens.ink2, 'Body copy and secondary lines.'],
  ['ink3', tokens.ink3, 'Captions.'],
  ['inkMuted', tokens.inkMuted, 'The quietest text still allowed to be read.'],
  ['inkDisabled', tokens.inkDisabled, 'Disabled controls only — WCAG exempts them. Never for de-emphasis.'],
];

const TYPE_SCALE: [string, string][] = [
  ['h1', 'Gündelik'],
  ['h2', 'Üçünji çärýek'],
  ['subtitle1', 'Töleg usullary'],
  ['h3', 'Himiýa · 9:50'],
  ['body1', 'Kislotalar we esaslar. Neýtrallaşma reaksiýasy.'],
  ['body2', 'Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.'],
  ['caption', '12.02.2026 · Okuw bölümi'],
];

const Swatch = ({ name, value, use }: { name: string; value: string; use: string }) => (
  <Box sx={{ border: `1px solid ${tokens.divider}`, borderRadius: `${tokens.rRow}px`, overflow: 'hidden', bgcolor: '#fff' }}>
    <Box sx={{ height: 76, bgcolor: value }} />
    <Box sx={{ p: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{name}</Typography>
      <Typography sx={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12, color: tokens.inkMuted, textTransform: 'uppercase',
      }}>{value}</Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink2, lineHeight: 1.45, mt: '2px' }}>{use}</Typography>
    </Box>
  </Box>
);

const Chip = ({ c, border }: { c: string; border?: boolean }) => (
  <Box component="span" sx={{
    display: 'inline-block', width: 16, height: 16, borderRadius: '5px',
    bgcolor: c, verticalAlign: '-3px', mr: '8px',
    border: border ? `1px solid ${tokens.divider}` : 0,
  }} />
);

const Phone = ({ children }: { children: ReactNode }) => (
  <Box sx={{ px: tokens.gutter, py: '12px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
    {children}
  </Box>
);

type IconComp = (p: { size?: number }) => ReactNode;

function IconSheet() {
  const entries = Object.entries(Icons as unknown as Record<string, IconComp>)
    .filter(([name]) => name.endsWith('Icon'));
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: '2px',
      border: `1px solid ${tokens.divider}`, borderRadius: `${tokens.rRow}px`,
      overflow: 'hidden', bgcolor: tokens.dividerSoft,
    }}>
      {entries.map(([name, Icon]) => (
        <Box key={name} sx={{
          bgcolor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '9px', py: '18px', px: '6px', color: tokens.ink,
        }}>
          <Icon size={24} />
          <Typography sx={{
            fontSize: 10.5, color: tokens.inkMuted, textAlign: 'center',
            wordBreak: 'break-word', lineHeight: 1.3,
          }}>{name.replace(/Icon$/, '')}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ---------------- the page ---------------- */

export function DesignSystemScreen() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [seg, setSeg] = useState<'a' | 'b'>('a');
  const [hw, setHw] = useState(false);
  const [tab, setTab] = useState<TabId>('gundelik');
  const [day, setDay] = useState('2026-02-12');
  const [name, setName] = useState('Muhammedow Muhammet');

  return (
    <DocsPage
      route="design"
      kicker="eMekdep · Gündelik"
      title={<>Dizaýn<br />ulgamy</>}
      lede="Every part a screen is assembled from — tokens, type, and each component staged live from src/components/Ui.tsx. Nothing here is a drawing of a component, so nothing here can go stale."
      meta={['Wersiýa 1.0', '#/design', 'Çeşme · src/theme.ts']}
      art={(
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: '8px' }}>
          {[tokens.blue, tokens.green, tokens.orange, tokens.red, tokens.purple, tokens.teal,
            tokens.blueTint, tokens.greenTint, tokens.orangeTint].map((c) => (
              <Box key={c} sx={{ width: 44, height: 44, borderRadius: `${tokens.rTile}px`, bgcolor: c }} />
          ))}
        </Box>
      )}
      plates={PLATES}
    >
      {/* 01 ── reňk */}
      <Plate n="01" title="Reňk" en="Palette, measured">
        <Prose lead>
          Every value here is read from <Mono>src/theme.ts</Mono> and every ratio is computed from
          it at render time. There is nothing on this plate to keep in step by hand.
        </Prose>
        <Rule title="Two grades per accent, and the difference is not decorative.">
          The plain accent fills tiles, icons, borders and chart marks, where WCAG asks 3:1. The
          {' '}<Mono>Text</Mono> grade is the same accent the moment it carries <i>words</i> at caption or
          body size. Setting a caption in the plain accent was the single most common contrast bug
          in this app.
        </Rule>
        <SectionLabel>Gök reňkler</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          <Swatch name="BRAND_BLUE" value={BRAND_BLUE} use={`The logo only — ${ratio(BRAND_BLUE, '#FFFFFF')} on white, ${level(BRAND_BLUE, '#FFFFFF')} for text.`} />
          <Swatch name="blue" value={tokens.blue} use={`The interface primary: fills, active states, hero figures. ${ratio(tokens.blue, '#FFFFFF')}.`} />
          <Swatch name="bluePress" value={tokens.bluePress} use="The pressed state of anything blue." />
          <Swatch name="blueText" value={tokens.blueText} use={`Blue carrying words. ${ratio(tokens.blueText, '#FFFFFF')} on white, ${ratio(tokens.blueText, tokens.blueTint)} on its own tint.`} />
        </Box>
        <SectionLabel>Aksentler</SectionLabel>
        <Table
          head={['Accent', 'Fill', 'Text grade', 'Tint', 'Text on tint', 'Carries']}
          rows={ACCENTS.map((a) => [
            a.label,
            <><Chip c={a.fill} /><Num>{a.fill}</Num></>,
            <><Chip c={a.text} /><Num>{a.text}</Num></>,
            <><Chip c={a.tint} border /><Num>{a.tint}</Num></>,
            <Num>{ratio(a.text, a.tint)}</Num>,
            a.carries,
          ])}
        />
        <SectionLabel>Ink</SectionLabel>
        <Table
          head={['Token', 'Value', 'On white', 'Level', 'Use']}
          rows={INKS.map(([n, value, use]) => [
            <Mono>{n}</Mono>,
            <><Chip c={value} border /><Num>{value}</Num></>,
            <Num>{ratio(value, '#FFFFFF')}</Num>,
            <Num>{level(value, '#FFFFFF')}</Num>,
            use,
          ])}
        />
        <Rule title="Red means unread, and nothing else.">
          A count that is only a quantity — twelve teacher notes — is a quiet pill. Two stacked rows
          must never both shout.
        </Rule>
        <Rule title="No hardcoded hex in a screen.">
          Colour comes from <Mono>tokens</Mono>. The deliberate exceptions are the banknote
          illustration and white as a knockout.
        </Rule>
      </Plate>

      {/* 02 ── tipografika */}
      <Plate n="02" title="Tipografika" en="Type scale">
        <Prose lead>
          Inter Variable, falling back to the platform's own UI face. One family across the whole
          product — hierarchy is carried by size, weight and colour, never by a second typeface.
        </Prose>
        <SpecGroup>
          {TYPE_SCALE.map(([variant, sample]) => {
            const v = theme.typography[variant as keyof typeof theme.typography] as
              { fontSize?: number | string; fontWeight?: number | string };
            return (
              <Box key={variant} sx={{
                display: 'flex', alignItems: 'baseline', gap: '20px', py: '13px', flexWrap: 'wrap',
                borderBottom: `1px solid ${tokens.dividerSoft}`, '&:last-of-type': { borderBottom: 0 },
              }}>
                <Typography sx={{
                  flex: '0 0 150px', fontSize: 11.5, color: tokens.inkMuted,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}>
                  {variant} · {String(v?.fontSize ?? '')} / {String(v?.fontWeight ?? 400)}
                </Typography>
                <Typography variant={variant as 'h1'} sx={{ minWidth: 0 }}>{sample}</Typography>
              </Box>
            );
          })}
        </SpecGroup>
        <Rule title="Every figure is tabular.">
          Marks, prices, dates, counts, times. A column of figures that shifts by a hair between
          rows is the fastest way to make a record look untrustworthy.
        </Rule>
        <Rule title="The Turkmen set is non-negotiable: ä ç ž ň ö ş ü ý.">
          Before adopting any face, set <i>Şu gün · Şenbe · Öý işi · Ýetişik · Bäsleşik · Nyşanlar</i>
          {' '}and look at every diacritic at 13&nbsp;px. A face that fakes ň with a tilde is disqualified.
        </Rule>
        <Rule title="Sentence case everywhere.">
          The one uppercase element is <Mono>SectionLabel</Mono>, the group label above a row list.
        </Rule>
      </Plate>

      {/* 03 ── forma */}
      <Plate n="03" title="Forma" en="Radius, spacing, surface, motion">
        <SectionLabel>Radius</SectionLabel>
        <Stage gap={22}>
          {([
            ['rCard', tokens.rCard, 84, 84],
            ['rRow', tokens.rRow, 84, 60],
            ['rTile', tokens.rTile, 60, 48],
            ['rCell', tokens.rCell, 40, 40],
            ['rPill', tokens.rPill, 84, 32],
          ] as const).map(([n, r, w, h]) => (
            <Fig key={n} label={`${n} ${r}`}>
              <Box sx={{
                width: w, height: h, borderRadius: `${r}px`,
                bgcolor: tokens.blueTint, border: `1px solid ${tokens.blueSoft}`,
              }} />
            </Fig>
          ))}
        </Stage>
        <Prose>
          Cards, tiles and the pill header take <Mono>rCard</Mono>. Rows and buttons take
          {' '}<Mono>rRow</Mono>, inputs and small tiles <Mono>rTile</Mono>, date cells <Mono>rCell</Mono>,
          tags and switches <Mono>rPill</Mono>. A radius that is not on this ladder is a bug.
        </Prose>
        <SectionLabel>Aralyk</SectionLabel>
        <Prose>
          Gutter <Mono>{tokens.gutter}</Mono> between siblings; card padding <Mono>{tokens.padCard}</Mono>.
          Icon-only controls are <Mono>44 × 44</Mono> minimum, text pills <Mono>32px</Mono> tall. Both
          are floors, not targets.
        </Prose>
        <SectionLabel>Ýüzler</SectionLabel>
        <Table
          head={['Token', 'Value', 'Use']}
          rows={[
            [<Mono>blurBg</Mono>, <Num>{tokens.blurBg}</Num>, 'Sticky headers, the tab bar, sheets — every floating surface is glass.'],
            [<Mono>blur</Mono>, <Num>{tokens.blur}</Num>, 'The one blur treatment, app-wide.'],
            [<Mono>shadowCtl</Mono>, <Num>{tokens.shadowCtl}</Num>, 'A raised header button.'],
            [<Mono>shadowFloat</Mono>, <Num>{tokens.shadowFloat}</Num>, 'A floating control, the jump button.'],
            [<Mono>shadowFab</Mono>, <Num>{tokens.shadowFab}</Num>, 'The primary action, blue-tinted.'],
            [<Mono>shadowHeader</Mono>, <Num>{tokens.shadowHeader}</Num>, 'The soft fade under a sticky header.'],
          ]}
        />
        <SectionLabel>Hereket</SectionLabel>
        <Rule title={`One easing curve: ${tokens.ease}`}>
          Quick out, long settle. Anything that needs a different curve to feel right is usually the
          wrong duration.
        </Rule>
        <Rule title="Gestures belong to the OS.">
          Tab switching is a scroll-snap track, not a JS animation, so momentum, rubber-banding and
          mid-swipe cancel come free. Never re-implement a gesture the platform already owns.
        </Rule>
        <Rule title="prefers-reduced-motion collapses everything.">
          Every animation and transition, globally — not a curated subset.
        </Rule>
      </Plate>

      {/* 04 ── bahalar */}
      <Plate n="04" title="Bahalar" en="Marks">
        <Prose lead>
          A mark is the most-read number in the product, so it has exactly one shape and nothing
          else in the app may borrow it.
        </Prose>
        <SpecGroup>
          <SpecRow name="GradeBadge" note="Solid fill, rounded square, 30×28. The colour is derived from the digit, never stored beside it.">
            <GradeBadge grade={5} /><GradeBadge grade={4} /><GradeBadge grade={3} /><GradeBadge grade={2} />
          </SpecRow>
          <SpecRow name="GradeSlot" note="The mark's column is reserved on every row, marked or not — otherwise the next thing along slides into the mark's position and is read as one.">
            <GradeSlot grade={5} /><GradeSlot grade={null} />
          </SpecRow>
        </SpecGroup>
        <Rule title="Anything that is not a mark out of five is not a GradeBadge.">
          A subject average (<Num>4.6</Num>), a homework ratio (<Num>3/5</Num>), a points total —
          averages are plain tabular figures and ratios stay <Mono>n/total</Mono> text.
        </Rule>
      </Plate>

      {/* 05 ── setirler */}
      <Plate n="05" title="Setirler" en="Rows">
        <SpecGroup>
          <SpecRow name="LessonCard" note="The timetable row: a left rail of aligned times, the subject, the real tema, and homework as a control that ticks in place.">
            <Box sx={{ width: 361, flex: '0 0 auto' }}>
              <LessonCard
                lesson={{ ...SPECIMEN_LESSON, hwDone: hw }}
                onOpen={() => {}}
                onToggleHw={() => setHw((v) => !v)}
              />
            </Box>
          </SpecRow>
          <SpecRow name="SurfaceRow" note="The one navigating row. A second line carries a value, never an explanation of what the row does.">
            <Box sx={{ width: 361, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SurfaceRow
                icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={40}><Icons.BellIcon size={20} /></IconBadge>}
                label="Bildirişler"
                end={<CountPill n={3} />}
                onClick={() => {}}
              />
              <SurfaceRow label="Dil" end={<RowEnd value="Türkmen dili" />} onClick={() => {}} />
              <SurfaceRow label="Töleg taryhy" end={<RowChevron />} onClick={() => {}} />
            </Box>
          </SpecRow>
          <SpecRow name="SwitchRow" note="The row carries role=switch and the whole row is the target; the knob is never a second tab stop.">
            <Box sx={{ width: 361, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SwitchRow label="Bahalar barada" on={on} onToggle={() => setOn((v) => !v)} />
              <SwitchRow label="Habarlar" sub="Master switch off" on={off} disabled onToggle={() => setOff((v) => !v)} />
            </Box>
          </SpecRow>
          <SpecRow name="RankRow" note="Medal, name, school, points. The reader's own row is tinted, never bolded.">
            <Box sx={{ width: 361, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <RankRow rank={1} name="A. Kerim" sub="7-nji mekdep, 8A" points={410} />
              <RankRow rank={2} name="M. Muhammet" sub="16-njy mekdep, 8B" points={320} self />
            </Box>
          </SpecRow>
        </SpecGroup>
        <Rule title="One icon treatment per row group.">
          In a list of sibling rows, either every icon sits in an <Mono>IconBadge</Mono> or none
          does. A mix reads as two different components stacked by accident.
        </Rule>
      </Plate>

      {/* 06 ── bellikler */}
      <Plate n="06" title="Bellikler" en="Pills and badges">
        <SpecGroup>
          <SpecRow name="CountPill" note="Red means unread. A count that is only a quantity takes the quiet tone.">
            <CountPill n={3} /><CountPill n={12} tone="quiet" />
          </SpecRow>
          <SpecRow name="TagPill" note="Small tinted pill above a list or beside a section heading.">
            <TagPill label="Ähli" />
            <TagPill label="TOP-50" icon={<Icons.TrophyIcon size={15} />} />
          </SpecRow>
          <SpecRow name="PointsPill" note="The one way points are ever shown: coin, figure, unit.">
            <PointsPill value={320} unit="bal" />
          </SpecRow>
          <SpecRow name="IconBadge" note="Squircle icon container. Neutral badges on a surface row use surfacePress, never surface — the row's own fill would swallow the squircle.">
            <IconBadge><Icons.TemaIcon size={22} /></IconBadge>
            <IconBadge bg={tokens.orangeTint} color={tokens.orangeText}><Icons.CoinIcon size={22} /></IconBadge>
            <IconBadge bg={tokens.surfacePress} color={tokens.ink2} radius={28}><Icons.LockIcon size={22} /></IconBadge>
            <IconBadge bg={tokens.greenTint} color={tokens.greenText} size={40}><Icons.CheckIcon size={20} /></IconBadge>
          </SpecRow>
          <SpecRow name="DoneBadge" note="The one “completed” mark: greenDeep circle, white check, white ring.">
            <DoneBadge /><DoneBadge size={28} />
          </SpecRow>
          <SpecRow name="BookmarkButton" note="The one “save this” control, and it lives in a detail page's header — saving is a decision, and the detail page is where there is enough to make it.">
            <BookmarkButton item={{ kind: 'book', id: 'spec-doc', title: 'Nusga kitap', sub: 'Dizaýn ulgamy' }} />
          </SpecRow>
        </SpecGroup>
      </Plate>

      {/* 07 ── plitalar */}
      <Plate n="07" title="Plitalar" en="Tiles and figures">
        <SpecGroup>
          <SpecRow name="StatTile" note="Small figure and label, always in a 3-up grid.">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 108px)', gap: '11px' }}>
              <StatTile value="4.6" label="Ortaça baha" />
              <StatTile value="1 251" label="Bal" color={tokens.blueText} />
              <StatTile value="7" label="Synpda orun" />
            </Box>
          </SpecRow>
          <SpecRow name="MeterTile" note="A StatTile for a figure with a known maximum. Use it whenever the reader would otherwise have to supply the scale.">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 108px)', gap: '11px' }}>
              <MeterTile value="97%" label="Gatnaşyk" pct={97} color={tokens.green} />
              <MeterTile value="92%" label="Öý işi" pct={92} color={tokens.blue} />
              <MeterTile value="64%" label="Testler" pct={64} color={tokens.orange} />
            </Box>
          </SpecRow>
          <SpecRow name="GridTile" note="White card with an icon badge and a 17/700 label, in a 2-column grid. The Gollanmalar entry.">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 172px)', gap: '11px' }}>
              <GridTile icon={<IconBadge><Icons.TemaIcon size={24} /></IconBadge>} label="Temalar" sub="5 ders" onClick={() => {}} />
              <GridTile icon={<IconBadge bg={tokens.purpleTint} color={tokens.purpleText}><Icons.CardsIcon size={24} /></IconBadge>} label="Kartlar" sub="3 toplum" onClick={() => {}} />
            </Box>
          </SpecRow>
          <SpecRow name="HeroStat · DeltaLine" note="The 34/700 figure on an Analitika card, with its change beneath it.">
            <Box>
              <HeroStat>4.6</HeroStat>
              <DeltaLine>+0.3 geçen hepdä garanyňda</DeltaLine>
            </Box>
          </SpecRow>
        </SpecGroup>
      </Plate>

      {/* 08 ── dolandyryjylar */}
      <Plate n="08" title="Dolandyryjylar" en="Controls">
        <SpecGroup>
          <SpecRow name="ToggleSwitch" note="The one switch visual. On, off, and disabled at 50%.">
            <ToggleSwitch on={on} /><ToggleSwitch on={false} /><ToggleSwitch on={false} disabled />
          </SpecRow>
          <SpecRow name="Segmented" note="Two or three mutually exclusive options on one visible track. Use instead of a cycling pill whenever the alternatives must stay readable.">
            <Box sx={{ width: 300 }}>
              <Segmented
                value={seg}
                onChange={setSeg}
                label="Çärýek"
                options={[{ id: 'a', label: 'I–II çärýek' }, { id: 'b', label: 'III–IV çärýek' }]}
              />
            </Box>
          </SpecRow>
          <SpecRow name="Field" note="Labelled input. A read-only field says who owns the value rather than being mysteriously inert.">
            <Box sx={{ width: 320, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Ady" value={name} onChange={setName} />
              <Field label="Synpy" value="8 «B» · 16-njy mekdep" note="Synpy we mekdebi mekdep dolandyrýar" />
            </Box>
          </SpecRow>
          <SpecRow name="PeriodNav" note="‹ label › — the one period switcher.">
            <PeriodNav label="III çärýek" onPrev={() => {}} onNext={() => {}} />
          </SpecRow>
          <SpecRow name="HeaderIconButton · HelpButton" note="44×44 header controls. The “?” is one shape app-wide, and the count clips to the button's corner.">
            <HeaderIconButton label="Bildirişler" count={3} onClick={() => {}}><Icons.BellIcon size={22} /></HeaderIconButton>
            <HeaderIconButton label="Sazlamalar" onClick={() => {}}><Icons.GearIcon size={22} /></HeaderIconButton>
            <HelpButton onClick={() => {}} />
          </SpecRow>
          <SpecRow name="Button" note="MUI's contained button with the app's overrides: 48 tall, rRow, no shadow.">
            <Button variant="contained" disableElevation>Barla</Button>
            <Button variant="contained" disableElevation disabled>Barlandy</Button>
            <Button variant="text">Ýatyr</Button>
          </SpecRow>
        </SpecGroup>
      </Plate>

      {/* 09 ── sahypa gurluşy */}
      <Plate n="09" title="Sahypa gurluşy" en="Page structure">
        <Prose lead>
          A component that owns a whole screen cannot be judged floating on a white card, so these
          are staged on the surface they were drawn for: 393&nbsp;px, clipped, with the app's frame.
        </Prose>
        <Scroller>
          <PhoneStage height={260} label="PillHeader · the inner-page header">
            <PillHeader title="Töleg usullary" onBack={() => {}} action={<HelpButton onClick={() => {}} />} />
            <Phone>
              <SectionLabel>Kartlarym</SectionLabel>
              <SurfaceRow label="Halk bank" sub="•••• 4821 · 09/28" end={<RowChevron />} onClick={() => {}} />
            </Phone>
          </PhoneStage>
          <PhoneStage height={260} label="TabBar · the root navigation">
            <Phone>
              <Lede>Four tabs, one scroll-snap track. The bar hides on any page reached by a back button.</Lede>
            </Phone>
            <TabBar value={tab} onChange={setTab} />
          </PhoneStage>
          <PhoneStage height={260} label="StickyFooter · a page's primary action">
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Phone>
                  <SectionHeading title="Test" action={<TagPill label="10 sorag" />} />
                  <Lede>The footer stays above the fold on any length of page.</Lede>
                </Phone>
              </Box>
              <Box sx={{ px: tokens.gutter }}>
                <StickyFooter>
                  <Button variant="contained" disableElevation fullWidth>Başla</Button>
                </StickyFooter>
              </Box>
            </Box>
          </PhoneStage>
        </Scroller>
        <SpecGroup>
          <SpecRow name="SectionLabel" note="The one uppercase element in the product: a group label above a row list.">
            <SectionLabel>Hasap</SectionLabel>
          </SpecRow>
          <SpecRow name="SectionHeading" note="An h2 with an optional trailing pill row.">
            <Box sx={{ width: 361 }}>
              <SectionHeading title="Bäsleşikler" action={<TagPill label="Ähli" />} />
            </Box>
          </SpecRow>
          <SpecRow name="SheetSection" note="A titled block inside a bottom sheet.">
            <Box sx={{ width: 361 }}>
              <SheetSection title="Öý işi" end={<CountPill n={2} tone="quiet" />}>
                <Typography sx={{ fontSize: 14, color: tokens.ink2 }}>
                  Laboratoriýa depderini doldurmaly. §14, 3-nji sorag.
                </Typography>
              </SheetSection>
            </Box>
          </SpecRow>
          <SpecRow name="EmptyState" note="Muted badge, title, one note. The one “nothing here yet” shape.">
            <Box sx={{ width: 361, bgcolor: '#fff' }}>
              <EmptyState
                icon={<Icons.BookmarkIcon size={24} />}
                title="Bellikledim boş"
                note="Haladyk zadyňy detal sahypasyndan belläp bilersiň."
              />
            </Box>
          </SpecRow>
          <SpecRow name="Lede" note="One sentence of explanation. Prefer the header's “?” — an explanation on demand costs no visitor a paragraph they read once.">
            <Box sx={{ width: 361 }}>
              <Lede>Nyşanlar mugallymyň bahadan başga ýazýan zady.</Lede>
            </Box>
          </SpecRow>
        </SpecGroup>
      </Plate>

      {/* 10 ── senenama */}
      <Plate n="10" title="Senenama" en="Dates">
        <Prose lead>
          Data stores an ISO date and only <Mono>lib/date</Mono> formats one:
          {' '}<Mono>DD.MM.YYYY</Mono>, with <i>Şu gün · Düýn · Ertir</i> winning at ±1 day and losing
          past it.
        </Prose>
        <Scroller>
          <PhoneStage height={132} label="DateStrip · the week">
            <Box sx={{ pt: '12px' }}>
              <DateStrip days={SPECIMEN_WEEK} selected={day} onSelect={setDay} onPick={() => {}} />
            </Box>
          </PhoneStage>
          <PhoneStage height={392} label="MonthCalendar · the one date picker">
            <Box sx={{ p: '12px' }}>
              <MonthCalendar
                month="2026-02"
                selected={day}
                marked={(iso) => ['2026-02-09', '2026-02-10'].includes(iso)}
                onSelect={setDay}
              />
            </Box>
          </PhoneStage>
        </Scroller>
        <Rule title="A day cell carries one marker, and it means one thing.">
          The dot means the day has been signed. There used to be three markers — a house, a pen and
          a dot — which readers took for “holiday” and “celebration”, neither of which the app knows.
        </Rule>
        <Rule title="A scrollable strip has to say so.">
          The date strip is wider than the screen, so it carries a 26&nbsp;px mask fade at its right
          edge. A scrollbar it never shows is not an affordance.
        </Rule>
      </Plate>

      {/* 11 ── piktogrammalar */}
      <Plate n="11" title="Piktogrammalar" en="The icon set">
        <Prose lead>
          Every glyph exported by <Mono>src/components/Icons.tsx</Mono>, at <Mono>size 24</Mono>.
          Stroked at 1.8 on a 24 grid, always in <Mono>currentColor</Mono>.
        </Prose>
        <IconSheet />
        <Rule title="Size means optical size, not box size — and the factor is measured.">
          Render the glyph, read its <Mono>getBBox()</Mono>, and scale so the geometric mean of the
          ink lands on 15.8&nbsp;px at <Mono>size 22</Mono>. Measured across this set, ink ran from
          11.7&nbsp;px to 26.2&nbsp;px inside one nominal size: a 2.25× spread. Normalised, it is
          1.003×. Re-derive the same way if a glyph is replaced.
        </Rule>
        <Rule title="An icon's ink is currentColor.">
          A baked-in hex makes a glyph single-use: the same calendar was blue in a tinted pill and
          wrong in a white header button.
        </Rule>
        <Rule title="Different things get different glyphs.">
          Three identical paperclips on three attach options told the reader nothing about which row
          did what. A pin means <i>place</i>, not <i>attachment</i>.
        </Rule>
        <Rule title="The logo is not an icon.">
          The cube never appears in a row, a tab bar or a button. It is a signature, and a signature
          that turns up mid-sentence stops being one.
        </Rule>
      </Plate>
    </DocsPage>
  );
}
