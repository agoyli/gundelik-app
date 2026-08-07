# Gündelik Design System

Single source of truth: [`src/theme.ts`](src/theme.ts) (tokens) + [`src/components/Ui.tsx`](src/components/Ui.tsx) (primitives).
Extracted from the original Figma screens (Gündelik, Analitika, Gollanmalar, Testler, Algebra roadmap).

## Tokens

### Color
| Token | Value | Use |
|---|---|---|
| `blue` / `bluePress` | `#3F7CF2` / `#2F66D6` | Primary actions, active states, hero stats |
| `blueSoft` / `blueTint` | `#DCE9FD` / `#EFF5FF` | Icon badges, tag pills, banners, grade bands |
| `surface` / `surfacePress` | `#F7F7F7` / `#EFEFEF` | Cards, rows, pill headers |
| `ink` `ink2` `ink3` `inkMuted` `inkDisabled` | grays | Text hierarchy (title → disabled) |
| `red` / `redDeep` / `redTint` | `#EA5455` / `#D22630` / `#FDE8E8` | Alerts, unread counters, "Ynsanperwer" |
| `green` / `greenDeep` / `greenTint` | `#2DD579` / `#22A06B` / `#E3F7ED` | Success grades, deltas, active plan tab, jump button |
| `orange` / `orangeTint` | `#F59B1B` / `#FDEFDC` | Points (bal) pill, coin |
| `purple` / `purpleTint` | `#A78BE0` / `#EDE6F9` | "Takyk" lesson kind |
| `teal` / `tealTint` | `#1FA58C` / `#DFF3EF` | Subject card (Jemgyýet) |
| `gold` `silver` `bronze` | — | Leaderboard medals, level progress fill |

### Radius
`rCard 24` (cards, tiles, pill header) · `rRow 16` (rows, buttons) · `rTile 12` (inputs, small tiles) · `rCell 8` (date cells) · `rPill 999` (tags, plan switch)

### Glass & elevation
- **Glass** (`blurBg` white / `blurBgSoft` lighter white / `blurTintBg` blue-tint + `blur`): every sticky or floating chrome surface is translucent with backdrop blur so content glimpses through — page headers, capsule headers, roadmap grade bands, the **tab bar** (floats over content; tab panels pad `104px + safe-area` to clear it), bottom **sheets** (`MuiDrawer` frosted paper), and the roadmap **jump button**. Full-screen overlays (lesson pages) stop above the tab bar so their footer CTAs stay reachable.
- **Shadows**: `shadowCtl` (raised header buttons) · `shadowFloat` (floating controls, jump button) · `shadowFab` (primary FAB, blue-tinted) · `shadowHeader` (soft downward fade under every sticky header — separates the glass from content scrolling beneath it). The continue card adds a blue glow (`0 10px 24px rgba(63,124,242,.28)`) + gradient (`155deg, #5B93F5 → blue`) as the one hero treatment.
- **Heatmap scale**: `heatBase → heat1 → heat2 → greenDeep` (Profil).

### Layout & type
Gutter `11px`, card padding `17px`. Type scale: h1 26/700, h2 20/700, h3 16/600, subtitle 17/600, body 15/14, caption 13. Numbers always `tabular-nums`.

## Primitives (`src/components/Ui.tsx`)

| Component | Role | Used in |
|---|---|---|
| `PillHeader` | Capsule page header, centred title, optional round back button | Gollanmalar, Testler |
| `GridTile` | White card: icon badge + 17/700 label, 2-col grid | Gollanmalar |
| `IconBadge` | Squircle/round icon container (tint bg + accent icon) | tiles, subject cards |
| `TagPill` | Small tinted pill ("Ähli", "TOP-50") | section headings |
| `SectionHeading` | h2 + trailing pill row | Testler |
| `PointsPill` | Orange pill: coin + `N bal` | Testler profile, RankRow |
| `RankRow` | Medal + name/school + points | Reýting |
| `HeroStat` / `DeltaLine` | 34/700 blue figure + green ↑ caption | Analitika cards |
| `DoneBadge` | The one "completed" mark: `greenDeep` circle, white check, white ring | roadmap nodes & bands |
| `PeriodNav` | ‹ label › week/quarter switcher | Analitika |
| `SurfaceRow`, `LessonCard`, `DateStrip`, `GradeBadge`, `CountPill`, `SheetDrawer`, `SheetSection`, `TabBar` | Pre-existing core set | Gündelik & everywhere |

## Patterns

- **Sub-navigation inside a tab**: screen keeps a `view` state (`grid → testler → roadmap`), each sub-view renders `PillHeader` with `onBack`.
- **Drill-down data**: stat cards expose a full-width contained Button that opens a `SheetDrawer` with detail (subject bars).
- **Roadmap** ([`src/screens/RoadmapScreen.tsx`](src/screens/RoadmapScreen.tsx)): winding node path (SVG connector centred at 50%, nodes swing ±54px), grade bands 1–12, level card, search + activity-type filter chips. Floating jump button shows **one direction at a time**: below own grade → `↓ next`, past it (or at the end) → `↑ previous`; targets recompute from the grade currently in view (scroll-spy). Structure rules: **land on the current lesson** (auto-centred on mount); **fully-completed grades collapse** behind the same band (one band style for all grades and both states — green check + "N sapak tamamlandy" caption when complete, chevron flip is the only open/closed difference; collapsing scrolls the band back into view; search/filter auto-expands); grade bands are **sticky** while their section scrolls; no-match search/filter shows an empty state with an "Arassala" reset.
- **Activity kinds** (roadmap): every lesson is `text | video | interactive | test`, mapped to icon + accent (`KIND_META`): Tekst→blue books, Wideo→purple player, Interaktiw→teal gamepad, Test→orange check. Node states: **done** = accent fill, white icon, green corner check; **current** = white fill, accent border, pulse + bobbing "BAŞLA" pill; **locked** = gray fill, lock corner badge, dotted connector. Completed connectors draw in blue. Tapping any node opens a lesson `SheetDrawer` (type badge, extent, status, `Başla`/`Gaýtadan gör`/disabled `Gulply` CTA).

- **Continue card** (roadmap): the primary CTA — next lesson (kind icon, title, extent) + "Başla" pill, with the grade progress bar folded in; taps open the lesson sheet.
- **Lesson pages** ([`src/screens/LessonScreen.tsx`](src/screens/LessonScreen.tsx)): full-screen per-kind content — video (player mock + progress), text (structured reading: paragraphs, formula callouts, worked example, "Ýatda saklaň" note), interactive (**ParabolaLab**: a/b/c sliders → live SVG parabola, D readout, root markers, three gamified missions gate completion), test (starter page → one question per step with Yza/Indiki → score ring + per-question review). Footer CTA gates on completion rules; completing feeds `doneIds` in the roadmap so the path, badges, captions, and continue card advance live.
- **AI helper** ([`src/components/AiHelper.tsx`](src/components/AiHelper.tsx)): `AiFab` (floating sparkle button on every lesson page, lifts above the footer) opens `AiChatSheet` — a bottom-sheet chat with greeting, per-kind ready prompts (analyze result / quiz me / explain simpler / why needed / give assignment), scrollable thread, pinned input. Replies are mocked; swap `ask` for a model call.
- **One student everywhere**: `STUDENT` in [`src/screens/OtherScreens.tsx`](src/screens/OtherScreens.tsx) (Muhammedow Muhammet, 8-nji «B», 16-njy mekdep) feeds Çagam, Testler, the leaderboard, and Profil.
- **Profil** (5th tab): capsule header + gear, avatar, and the Ýetişik heatmap card (5 months × weekday grid, 4 intensity levels, GM filter toggle, quarter pill, legend), then recent grades.

## Conventions

- No hardcoded hex in screens — colors come from `tokens`.
- Interactive elements are `ButtonBase` with an `aria-label` when the visible content isn't text.
- Decorative icons `aria-hidden`; stats/charts get `role="img"` + Turkmen `aria-label`.
- Toasts (`toast(msg)`) confirm every mutating or dead-end action ("Tiz wagtda…").
- Scroll containers hide native scrollbars (`scrollbarWidth: none` + `::-webkit-scrollbar`) — the app renders as a phone surface.
- Keyboard focus is visible globally: `:focus-visible` gets a 2px blue outline (App-level GlobalStyles).
