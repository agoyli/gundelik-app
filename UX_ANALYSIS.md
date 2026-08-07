# UX/UI Analysis — Gündelik (Daily Diary Screen)

## 1. What this page is and its goals

**Product context.** A school-diary app (Turkmen-language, kundelik-style) for parents and
students. The Gündelik screen is the home screen — the daily "what's happening at school"
surface.

**Primary user goals, in order of frequency:**
1. *Glance*: "What lessons does my child have today, and is anything wrong?" (grades,
   unread teacher messages, missed homework) — a 5-second job-to-be-done.
2. *Check homework*: see today's assignments and whether they're done.
3. *Navigate time*: hop to another school day.
4. *React*: read teacher notes, open a lesson's topic/homework, share the day.

**Business/parent goals:** daily habitual open (the "Barla" sync + notes badge drive
return visits), trust (grades visible and current), low friction for non-technical parents.

**Information architecture of the screen (top → bottom = decreasing urgency):**
date context → alerts (notes badge, homework fraction) → the lesson feed → system status
(last sync) → app-level navigation. This ordering is correct: alerts before content,
content before meta.

---

## 2. UX evaluation (heuristics-based)

### What the design does well
- **Recognition over recall.** Every lesson card repeats the same anatomy
  (title · time / Tema · Öý işi · status), so scanning is pre-attentive; the user reads
  the right-hand cluster only ("is there a red circle? a grade?").
- **Status visibility.** Three distinct alert encodings that don't collide: red pill =
  volume of notes, red circle = unread per lesson, blue/green grade chip = evaluation.
  "Soňky barlanan senesi" honestly exposes data freshness — rare and good.
- **Match to the mental model.** The week strip mirrors a paper diary; Monday–Saturday
  with Sunday omitted matches the actual school week; disabled future days prevent
  dead-end taps.
- **Minimal chrome.** One accent color (blue) reserved for "selected/actionable";
  neutral surfaces (#F7F7F7) carry all content. Visual hierarchy is achieved with
  weight and spacing, not decoration.

### Issues found, by severity

**High**
- *H1 — Color-only semantics on grade chips.* Blue `5/4` vs green `5/5` differ only by
  hue; the rule is undocumented and invisible to color-blind users.
  → Fixed in app: chips carry `aria-label="Baha 5/4"`; recommend also a tooltip/legend
  in Ýetişik. Open question logged in HANDOFF.md.
- *H2 — Ambiguous dual counters.* "5/1"-style fraction next to "Şu günki öý işler" read
  as arbitrary in the mock (source artwork literally said 5/1).
  → Fixed in app: the fraction is *computed* (done/total) and tapping opens the homework
  sheet that explains it item-by-item.
- *H3 — No empty/loading/error states in the mock.* A schedule app spends much of its
  life without data (weekends, pre-term).
  → Fixed in app: skeleton shimmer while fetching, a designed empty state ("Bu gün sapak
  ýok" + guidance), race-safe request handling.

**Medium**
- *M1 — Unlabeled event markers* (house/quill icons, dark dot on date cells). Novel icons
  with no legend force guessing.
  → Partially fixed: cells expose full accessible labels; a legend in the date-picker
  sheet is the recommended next step.
- *M2 — "Barla" affordance.* In the mock it is permanently gray — looks broken.
  → Fixed in app: disabled by default, arms (turns blue) when data may be stale
  (date changed), shows progress, reports success via toast, then disarms. The "?"
  sheet explains the rule.
- *M3 — Tema / Öý işi look like separate buttons* but a 108px card with two 13px targets
  creates mis-tap risk on the divider.
  → Fixed in app: the whole card is one target opening a detail sheet where Tema and
  Öý işi are separate, full-width sections — bigger targets, same information scent.
- *M4 — Truncation risk.* "Türkmenistanyň taryhy" nearly collides with the time.
  → Fixed: single-line ellipsis, time block non-shrinking; full title in the sheet.

**Low**
- *L1 — First date cell half-cut* in the mock (scroll affordance). Kept as a deliberate
  scroll cue, but the selected cell now auto-centers after selection.
- *L2 — Share icon* is a "redo/forward" arrow, unconventional for share; kept for brand
  consistency, backed by the native share sheet so intent is clarified on tap.
- *L3 — Touch targets*: 32px header chips are below the 44px guideline; padding hit-area
  extended invisibly in the app version.

---

## 3. UI / visual-system analysis

- **Grid & rhythm:** 393px reference, 11px page gutter, 12px vertical rhythm between
  surfaces, 17px card inset. Consistent — encoded as `tokens.gutter` / `tokens.padCard`.
- **Radius scale communicates hierarchy:** 24 (content cards) > 16 (action rows) >
  12 (controls/tiles) > 8 (dense cells/chips). Bigger radius = bigger container. Encoded
  as `rCard/rRow/rTile/rCell`.
- **Color roles:** 1 brand blue (+2 tints), 4-step ink ramp (#111213 → #C4C6CA),
  2 reds (alert pill vs unread circle — intentional separation), 1 success green.
  No gradient, no shadow on content (shadow reserved for overlays) — flat, calm, legible.
- **Type scale:** 26/700 page title, 17/600 row, 16/600 card title, 15/400 metadata,
  13–14 support, 11 nav. Tabular numerals for all times/dates/grades.
- **Iconography:** 13–21px stroke/flat hybrid set; extracted verbatim so the React app is
  glyph-identical to the mock.

---

## 4. Design-system integration status (how the page lives in the app)

| System layer | Where it lives in the React app |
|---|---|
| Tokens (color/radius/spacing/motion) | `src/theme.ts` — exported `tokens` + MUI `createTheme` (palette, typography, shape, component overrides) |
| Icons | `src/components/Icons.tsx` — verbatim vectors, `currentColor` for stateful tab icons |
| Primitives | `Ui.tsx`: `SurfaceRow`, `CountPill`, `GradeBadge`, `DateStrip`, `LessonCard`, `TabBar`, `SheetDrawer`, `SheetSection` — every screen composes these; no one-off styling |
| Patterns | list-row pattern reused across Gündelik/Çagam/Gollanmalar/Ýetişik; sheet pattern reused for all 5 dialogs; stat-tile and bar-chart patterns in Analitika |
| Data contract | `types.ts` + `mockApi.ts` — UI renders only from typed data; any new page integrates by adding an endpoint + composing primitives |

**Integration rule going forward:** a new page enters the app by (1) mapping its content
to existing primitives, (2) adding tokens only if a value repeats 3+ times, (3) defining
its data as types + a mock endpoint. That keeps the system closed and consistent.

---

## 5. Prioritized recommendations (next iteration)

1. Define + surface the grade-color rule (legend chip in Ýetişik, tooltip on long-press).
2. Add a legend for date-cell event markers inside the "Senäni saýlaň" sheet.
3. Notifications: the notes badge should deep-link to a filterable notes screen
   (currently a summary sheet).
4. Pull-to-refresh on the lesson list as a gesture twin of "Barla".
5. Week pagination (previous/next week) in the date strip; today-shortcut chip.
6. Dark theme: the token layer makes it a palette swap; verify the red/green chips
   against WCAG on dark surfaces.
