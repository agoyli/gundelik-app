# Gündelik Design System

Single source of truth: [`src/theme.ts`](src/theme.ts) (tokens) + [`src/components/Ui.tsx`](src/components/Ui.tsx) (primitives).
Extracted from the original Figma screens (Gündelik, Analitika, Gollanmalar, Testler, Algebra roadmap).

## Tokens

### Color
| Token | Value | Use |
|---|---|---|
| `blue` / `bluePress` | `#3570DF` / `#2758B8` | Primary fills, active states, hero stats |
| **`*Text` grade** — `blueText` `orangeText` `purpleText` `greenText` `tealText` `redText` | darker twins | **The same accent when it carries words.** ≥4.5:1 on white, on `surface`, and on its own tint |
| `blueSoft` / `blueTint` | `#DCE9FD` / `#EFF5FF` | Icon badges, tag pills, banners, grade bands |
| `surface` / `surfacePress` | `#F7F7F7` / `#EFEFEF` | Cards, rows, pill headers |
| `ink` `ink2` `ink3` `inkMuted` `inkDisabled` | grays | Text hierarchy (title → disabled) |
| `red` / `redDeep` / `redTint` | `#EA5455` / `#D22630` / `#FDE8E8` | Alerts, unread counters, "Ynsanperwer" |
| `green` / `greenDeep` / `greenTint` | `#2DD579` / `#22A06B` / `#E3F7ED` | Success grades, deltas, active plan tab, jump button |
| `orange` / `orangeTint` | `#F59B1B` / `#FDEFDC` | Points (bal) pill, coin |
| `purple` / `purpleTint` | `#A78BE0` / `#EDE6F9` | "Takyk" lesson kind |
| `teal` / `tealTint` | `#1FA58C` / `#DFF3EF` | Subject card (Jemgyýet) |
| `gold` `silver` `bronze` | — | Leaderboard medals, level progress fill |

**Two grades per accent.** `x` fills tiles, icons, borders and chart marks (WCAG needs only 3:1 there); `xText` is used the moment the accent becomes *text* at caption or body size. Never set a caption in the plain accent — that was the single most common contrast bug in the app. `KIND_META` carries both as `color` (fill) and `ink` (text).

The ink ramp is likewise all text-safe: `ink` → `ink2` (6.4:1) → `ink3` (5.5:1) → `inkMuted` (4.9:1). `inkDisabled` is for genuinely disabled controls only, which WCAG exempts.

### Radius
`rCard 24` (cards, tiles, pill header) · `rRow 16` (rows, buttons) · `rTile 12` (inputs, small tiles) · `rCell 8` (date cells) · `rPill 999` (tags, plan switch)

### Glass & elevation
- **Glass** (`blurBg` white / `blurBgSoft` lighter white / `blurTintBg` blue-tint + `blur`): every sticky or floating chrome surface is translucent with backdrop blur so content glimpses through — page headers, capsule headers, roadmap grade bands, the **tab bar** (floats over content; tab panels pad `104px + safe-area` to clear it, dropping to `16px` on inner pages where the bar is hidden), bottom **sheets** (`MuiDrawer` frosted paper), and the roadmap **jump button**. Full-screen overlays (lesson pages) stop above the tab bar so their footer CTAs stay reachable.
- **Shadows**: `shadowCtl` (raised header buttons) · `shadowFloat` (floating controls, jump button) · `shadowFab` (primary FAB, blue-tinted) · `shadowHeader` (soft downward fade under every sticky header — separates the glass from content scrolling beneath it). The continue card adds a a blue glow + gradient (`155deg, blue → bluePress`) as the one hero treatment.
- **Heatmap scale**: `heatBase → heat1 → heat2 → greenDeep` (Profil).

### Layout & type
Gutter `11px`, card padding `17px`. Type scale: h1 26/700, h2 20/700, h3 16/600, subtitle 17/600, body 15/14, caption 13. Numbers always `tabular-nums`.

### Accessibility floor
Every screen is audited against: **4.5:1** for text (3:1 for ≥24px, or ≥18.66px bold), **44×44** for icon-only controls, and `prefers-reduced-motion` (App-level GlobalStyles collapses every animation and transition). Text pills and chips stay at the 32px spec — wide enough to clear the WCAG AA 24×24 target minimum. An `ErrorBoundary` wraps each tab so a crash shows a Turkmen retry screen instead of a white void.

## Primitives (`src/components/Ui.tsx`)

| Component | Role | Used in |
|---|---|---|
| `SubPage` | **The sub-page frame**: `PillHeader` (which owns the swipe lock and the hidden nav) + gutter column. Every back-button page is built from it, so the back stack behaves identically on all of them | Gollanmalar sections, all detail pages, all Sazlamalar pages |
| `PillHeader` | Capsule page header, centred title, optional round back button. Calls `useSwipeLock()`, which is also what hides the tab bar — one signal for "this is an inner page" | every back-button page |
| `GridTile` | White card: icon badge + 17/700 label, 2-col grid | Gollanmalar |
| `IconBadge` | Squircle/round icon container (tint bg + accent icon) | tiles, subject cards |
| `TagPill` | Small tinted pill ("Ähli", "TOP-50") | section headings |
| `SectionHeading` | h2 + trailing pill row | Testler |
| `PointsPill` | Orange pill: coin + `N bal` | Testler profile, RankRow |
| `RankRow` | Medal + name/school + points | Reýting |
| `HeroStat` / `DeltaLine` | 34/700 blue figure + green ↑ caption | Analitika cards |
| `DoneBadge` | The one "completed" mark: `greenDeep` circle, white check, white ring | roadmap nodes & bands |
| `PeriodNav` | ‹ label › week/quarter switcher | Analitika |
| `SectionLabel` | Uppercase group label above a row list | Profil, Sazlamalar, sections |
| `SubPage`'s `help` prop | The replacement for `Lede`: a `?` button in the header corner opening a sheet. Explanation is available on demand instead of costing every visitor a paragraph they read once | Gollanmalar sections |
| `RowChevron` | The one "this row opens something" affordance | every navigating row |
| `ToggleSwitch` / `SwitchRow` | The one switch visual · the row that toggles it (row carries `role="switch"`, the knob is never a second tab stop) | Bildirişler, Howpsuzlyk |
| `Segmented` | 2–3 mutually exclusive options on one visible track. **Use instead of a cycling pill** whenever the alternatives must stay readable | Profil heatmap term switch |
| `StatTile` | Small figure + label tile, always in a 3-up grid | Çagam, Profil, every detail page |
| `Field` | Labelled input (`rTile` radius); read-only fields carry a `note` saying who owns the value | Profil maglumatlary, parol sheet |
| `StickyFooter` | Frosted footer holding a page's primary action above the tab bar | detail pages, edit form |
| `EmptyState` | The one "nothing here yet" shape: muted badge + title + note | Kartlarym, tests without attempts, Bellikledim |
| `BookmarkButton` | The one "save this" control, in a detail page's header. Filled = saved | every resource detail page |
| `SurfaceRow`, `LessonCard`, `DateStrip`, `GradeBadge`, `CountPill`, `SheetDrawer`, `SheetSection`, `TabBar` | Pre-existing core set | Gündelik & everywhere |

### Paywall vocabulary (`src/components/Paywall.tsx`)

Five shapes cover every free-tier moment, so no screen writes its own `!premium &&` branch.

| Component | Role |
|---|---|
| `AdSlot` / `AdCard` | The **only** ad surface. It sells the subscription and nothing else, quotes `ENTRY` (the cheapest plan) rather than the dearest, and carries the `PROOF` numbers (10 000 mugallym her gün, 84 000 okuwçy, 312 mekdep). `AdSlot` renders nothing at all for premium users |
| `TeaserCard` | Locked-content block: a real `preview` behind `LockedPreview`'s blur, then title, one sentence, one CTA. Never a bare "Premium gerek" |
| `FreeLimitBar` | The weekly meter (tests, flash cards). Before use it states **what remains** ("Hepdede 1 mugt test"); after use, when it comes back ("Indiki duşenbe täzelenýär") |
| `PaidFeatureSheet` | For features with no partial state to preview — the AI helper. Sheet with three concrete bullets + the proof line |
| `PremiumPill` / `BetaPill` | The two labels. Premium is blue-on-white on dark, Beta is purple |

## Patterns

- **Shell & navigation** ([`src/App.tsx`](src/App.tsx)): four tabs — Gündelik, Analitika, Gollanmalar, Profil — laid out on one horizontal **scroll-snap track**, so swiping left/right between them is driven by the OS (momentum, rubber-banding, mid-swipe cancel) rather than a JS animation. Scroll position is the source of truth; the tab bar mirrors it. Tapping the active tab scrolls that panel back to the top. Full-screen sub-pages call `useSwipeLock()` ([`SwipeLock.tsx`](src/components/SwipeLock.tsx)) so a sideways swipe inside them can never slide to another tab.
- **Header shape tells you where you are**: root tabs use `TopBar` (large left title + optional trailing action); anything reached by a back button uses the capsule `PillHeader`. Never mix them.
- **Gündelik** ([`GundelikScreen.tsx`](src/screens/GundelikScreen.tsx)) is a schedule, so the schedule gets the screen. Above it sit exactly two things: the date strip, and one **day-summary card** — three figures (bellik · nyşan · öý işi) split by hairlines, each cell a destination. It replaced three full-width rows carrying four coloured icon badges: ~190px of chrome for three numbers, which pushed the first lesson below the fold. Rules that came out of it:
  - **A count with a destination doesn't need a row — the count is the row.** If a row's only content is a label the icon already implies and a number, it is a cell.
  - **Header actions are icon-only.** Labelled pills ("Senäni saýlaň", "Paýlaş") crowded the title on a 375 screen; three 44px `HeaderIconButton`s in one ink colour read as a set.
  - **Notifications live in the header**, on the bell, as a `count` clipped to the button's corner — not as a full-width row competing with the day's actual content.
  - **The lesson row is a timetable row** ([`LessonCard`](src/components/Ui.tsx)): a left rail of aligned start/end times (what you actually scan a schedule by, and cheaper than a clock icon on every row), the subject, and the real `tema` as text. No "Tema" / "Öý işi" labels — a label identical on every card looks like data and carries none. Homework is one pill that appears only when there is homework and states its state (`Öý işi taýýar` in green, or the assignment itself in orange). This replaced a card with a divider, two static labels and a chip strip; four lessons now fit where one did.
  - **Unread and badges are different facts and both show.** An unread note is a thing to open; a badge is a thing that happened. A lesson with both shows the red count *and* the `BadgeScore`, rather than hiding one behind the other.
  - **Today keeps a ring in the date strip** when it is not the selected day, so a reader who has browsed backwards can find "now" without counting.
- **Sub-navigation inside a tab**: screen keeps a `view` state, each sub-view renders `PillHeader` with `onBack`.
- **Gollanmalar** is six sections in three pairs — *learn* (Temalar · Öwrediji kartlar), *prove* (Testler · Bäsleşikler), *explore* (Oýunlar · Kitaphana). Each has its own page in [`SectionScreens.tsx`](src/screens/SectionScreens.tsx) built from the same shape: `FeatureCard` (the one thing to do right now) → list or grid of the rest, with the page's explanation behind the header's `?` rather than in a lede above the content. Temalar is the entry to the lesson roadmap.
- **Three levels, never two** (Gollanmalar): tile grid → section list → **detail page** ([`DetailScreens.tsx`](src/screens/DetailScreens.tsx)). No list row commits you to anything: tapping a contest, game, book, deck or test opens a page that says what it is, how it is scored and how you did last time, and only its sticky footer commits. All five details share one skeleton — `Hero` (tinted panel: icon, state pill, title, meta) → 3-up `StatTile` strip → prose `Card`s (`Steps` for anything ordered) → list(s) → `StickyFooter` CTA — so the sections read as one family. Testler adds a middle level: landing → ders → test.
- **List and detail read one record** ([`src/data/guides.tsx`](src/data/guides.tsx)): every section's rows and its detail pages come from the same array, so a card can never advertise a number its own page contradicts. Derived figures (page number from `read`%, `N/M baplar`, deck percentage, attempt counts) are computed, never restated.
- **Drill-down data**: stat cards expose a full-width contained Button that opens a `SheetDrawer` with detail (subject bars).
- **Roadmap** ([`src/screens/RoadmapScreen.tsx`](src/screens/RoadmapScreen.tsx)): winding node path (SVG connector centred at 50%, nodes swing ±54px), grade bands 1–12, level card, search + activity-type filter chips. Floating jump button shows **one direction at a time**: below own grade → `↓ next`, past it (or at the end) → `↑ previous`; targets recompute from the grade currently in view (scroll-spy). Structure rules: **land on the current lesson** (auto-centred on mount); **fully-completed grades collapse** behind the same band (one band style for all grades and both states — green check + "N sapak tamamlandy" caption when complete, chevron flip is the only open/closed difference; collapsing scrolls the band back into view; search/filter auto-expands); grade bands are **sticky** while their section scrolls; no-match search/filter shows an empty state with an "Arassala" reset.
- **Activity kinds** (roadmap): every lesson is `text | video | interactive | test`, mapped to icon + accent (`KIND_META`): Tekst→blue books, Wideo→purple player, Interaktiw→teal gamepad, Test→orange check. Node states: **done** = accent fill, white icon, green corner check; **current** = white fill, accent border, pulse + bobbing "BAŞLA" pill; **locked** = gray fill, lock corner badge, dotted connector. Completed connectors draw in blue. Tapping any node opens a lesson `SheetDrawer` (type badge, extent, status, `Başla`/`Gaýtadan gör`/disabled `Gulply` CTA).

- **Continue card** (roadmap): the primary CTA — next lesson (kind icon, title, extent) + "Başla" pill, with the grade progress bar folded in; taps open the lesson sheet.
- **Lesson pages** ([`src/screens/LessonScreen.tsx`](src/screens/LessonScreen.tsx)): full-screen per-kind content — video (player mock + progress), text (structured reading: paragraphs, formula callouts, worked example, "Ýatda saklaň" note), interactive (**ParabolaLab**: a/b/c sliders → live SVG parabola, D readout, root markers, three gamified missions gate completion), test (starter page → one question per step with Yza/Indiki → score ring + per-question review). Footer CTA gates on completion rules; completing feeds `doneIds` in the roadmap so the path, badges, captions, and continue card advance live.
- **AI helper** ([`src/components/AiHelper.tsx`](src/components/AiHelper.tsx)): `AiFab` (floating sparkle button on every lesson page, lifts above the footer) opens `AiChatSheet` — a bottom-sheet chat with greeting, per-kind ready prompts (analyze result / quiz me / explain simpler / why needed / give assignment), scrollable thread, pinned input. Replies are mocked; swap `ask` for a model call.
- **One student everywhere**: `STUDENT` in [`src/screens/OtherScreens.tsx`](src/screens/OtherScreens.tsx) (Muhammedow Muhammet, 8-nji «B», 16-njy mekdep) feeds Çagam, Testler, the leaderboard, and Profil.
- **Profil** (4th tab): identity (avatar + edit affordance, name, school·class, "Maglumatlary üýtget" — all three lead to the same edit page) → a 3-up `StatTile` strip answering *where do I stand* (ortaça baha · bal · synpda orun) → payment card (plan + status pill, then Taryh / Kartlar / Tölemek, each a real destination) → the Ýetişik heatmap → goals (favourite subject, dream speciality — both open the same `ChoiceSheet`) → one "Sazlamalar" row into the account tree.
  - The tab shows **standing, not a grade log** — per-lesson grades live in Gündelik and Analitika, so Profil carries no "recent grades" list to go stale beside them.
  - **Heatmap rules**: the term switch is a `Segmented` control that actually swaps the data (I–II çärýek is a finished term, filled edge to edge; III–IV stops at today's cell), the caption above it (`N baha · N işjeň gün`) is summed from the very cells being drawn, and the filter is a labelled chip ("Diňe köp bahaly") rather than an unexplained two-letter switch. The swatch legend stays passive — never styled like a control.
- **Sazlamalar** ([`SettingsScreens.tsx`](src/screens/SettingsScreens.tsx)): the header gear is the single entry; the tab itself never repeats settings rows. Three groups — Hasap (profil maglumatlary · abuna we töleg · gizlinlik we howpsuzlyk), Programma (bildirişler · dil · ýady arassala), Kömek (FAQ · barada) — then "Hasapdan çyk" alone, in `redText`, behind a confirm sheet. Rules that hold across the tree:
  - **Preferences outlive navigation**: switches read from a module-level store (`usePrefs`), so a toggle set here is still set after backing out and returning. A setting that forgets itself reads as a bug.
  - **A master switch dims what it governs** instead of silently ignoring it — the child rows go `disabled` + 50% and show off (Bildirişler).
  - **Read-only fields say who owns them** ("Synpy we mekdebi mekdep dolandyrýar") rather than being mysteriously inert.
  - **Destructive and money actions confirm in a sheet** (log out, cancel subscription, pay), and the leaves that genuinely need a backend end in one toast instead of a dead row.
  - **Synag** is the last group and holds only the two switches that change what the whole app may show: *Mugt hasap rejimi* (drops the entitlement, and resets the weekly meters so free mode starts on a fresh week) and *Beta aýratynlyklar*. One caption under them says what each one turns on.

- **Entitlement is a tier, not a boolean** ([`src/state/prefs.ts`](src/state/prefs.ts)): `usePrefs()` owns `tier`, `beta`, every notification/security switch, the language and the weekly free meters (`usedTest`, `usedCards`). With one paid plan a boolean was the whole model; with two it cannot answer "may this account see Analitika?", because one paying account may and the other may not.
  - **`FEATURES` is the single matrix**: each feature names the lowest tier that unlocks it, and the comparison table on the tariff page *and* the screens that gate themselves both read it. A row that promises a feature and the screen that locks it cannot drift apart.
  - Screens ask **`useCan('analytics')`**, never `premium &&`. `premium` still exists but is *derived* (`tier !== 'free'`) — a second stored copy would be free to disagree.
  - **Two plans, named after the student, not the price**: `Göreldeli` (5 TMT/mo — bildirişler, nyşanlar, testler, bäsleşikler) and `Zehinli` (50 TMT/mo — everything). A tier a family can say out loud is one they can choose between. `ENTRY` is the cheapest way in and is what ads and teasers quote.
  - **A year's list price is derived** (`monthly × 12`), so the discount printed beside it can never contradict the monthly figure above it.
- **Free tier: state the limit where the choice is made, and always name what remains.** The meter appears on the section page (Testler, Öwrediji kartlar) *and* the detail page that spends it — not only after it is gone. Locked grades say so in the roadmap band ("Premium · 20 sapak") rather than waiting for the lesson sheet. What the free tier keeps: the diary and grades in full, the first teacher note, badge totals, 1-nji synp of the roadmap, one test and one card session a week.
- **A teaser shows the real thing, blurred.** `LockedPreview` blurs actual content (the next note, the real per-badge bars) so the offer is legible; a placeholder box would sell nothing.
- **Lock on value, not on volume.** The strictest wall in the app is the badge history for free accounts (`LockedFeed`): the *count* and the *date* stay free, and the type, subject, teacher and comment are what Premium buys. A parent can see that four things happened today and not one of them says what — a specific gap, which is far stronger than a wall, and everything on screen is still true. No invented scarcity, no countdown, no fake urgency: the number of hidden rows is the real number.
- **Analitika is gated, and the gate shows the shape of what is behind it** ([`AnalitikaScreen`](src/screens/OtherScreens.tsx)): four real cards, blurred, each captioned with a true count — "3 hepdelik taryh", "7 ders". The count is free, the reading is paid, same line the badge history draws. The streak stays fully visible because it is counted from grades the diary already shows in full, and hiding a reader's own data back from them buys nothing. No countdown, no invented scarcity.
- **A tab full of derived numbers earns a "?"**: Analitika's header carries the same on-demand help as `SubPage`, because "where does this come from?" is the first question a computed figure provokes.
- **The tariff page carries one decision.** Price choice first, then the comparison table, then one action ([`UpgradeScreen.tsx`](src/screens/UpgradeScreen.tsx)). It used to also carry a stat strip, four highlight tiles and two reviews — three more blocks all saying "Premium is good", two of them restating rows of the table below, which buried the price under three screens of scrolling. Selling the same point four times reads as pressure.
  - Term is settled first and is deliberately the *small* control — it is the cheap decision, and settling it lets each plan card show one price instead of four numbers competing.
  - **In the table a row is a whole feature, so a lock is literally accurate** — `✓` or a lock, never a text value. With two paid plans the table has three mark columns, and the one you have selected is the one highlighted. Hedged cells ("hepdede 1") are unreadable at a glance and forced every feature to be phrased as a quantity; "Çäksiz testler" locked is the same fact, legible.
  - The yearly saving is **derived from the two prices**, so a discount claim can never contradict the numbers printed beside it.
- **Habarlar** ([`InboxScreens.tsx`](src/screens/InboxScreens.tsx), data in [`src/data/inbox.tsx`](src/data/inbox.tsx)): one hub for everything arriving from outside the student, switched by one `Segmented` with live counts, reached from the bell in the Gündelik header. They share a page because they answer one question — "what is new for me?"
  - **Bildiriş is announcements, never activity.** A notification stream that echoed grades, badges and homework was a second, worse copy of the diary. It now carries only what a school office publishes (`mekdep · okuw · çäre · duýduryş`), grouped by day and always naming the office that published it. Nothing in it is an action.
  - **Söhbet is real conversation**: teacher threads, the class thread, and the parents' group. Group threads print the author's name **only when the speaker changes**, so a run of messages from one parent doesn't repeat a name four times. "Mugallyma ýaz" opens the class's teacher list and either resumes an existing thread or starts an empty one — a new conversation is never a dead end.
  - **A file is a card, not a bubble**: name, kind and size, so the reader decides before downloading. The kind's colour *and* glyph come from one `FILE_KIND` map, so a bubble and the attach sheet can never describe the same file two ways.
  - **The composer scrolls the page to its true bottom, not the last bubble into view.** `scrollIntoView({block:'end'})` lines the anchor up with the bottom of the scroll container, which is exactly where the sticky composer sits — the newest message ends up hidden behind the bar it was just typed into. The thread also claims `calc(100dvh - 340px)` so a three-message conversation still puts the composer at the bottom of the screen instead of floating it mid-page.
  - **Makala is CMS content.** Articles are written and published by admins, not by the app — so there is no featured slot and no cover art to invent, just title, byline, date and read time. Categories still get their own mark rather than only their own tint.
- **Mugallymyň nyşanlary** ([`BadgeScreens.tsx`](src/screens/BadgeScreens.tsx), data in [`src/data/badges.tsx`](src/data/badges.tsx)): teacher badges are the qualitative counterpart to grades — *what was done* vs *how it was worked*. Positive and negative are one scale, never two lists: `BadgeScore` (`+3 / −1` in tone-tinted numerals) is the compact form everywhere, and the stats page opens on totals + a single green/red balance bar before breaking down by type and subject. A subject with no negatives shows `+2` — never `+2 · −0`.
  - The two tones are **Ýagşy** and **Üns bermeli**. Not "Bellik" — that word already means a teacher's *note* in the diary, and one word cannot carry two meanings one screen apart. "Üns bermeli" over "Käýinç" because the negative tone describes something to work on, not a reprimand handed down.
  - **An emoji needs a label.** The badge emoji are the badge's identity in a labelled list (the history feed, the type bars). On a lesson card, unlabelled, an emoji disc next to the geometric `GradeBadge` reads as decoration in a different visual language — so the card uses `BadgeScore` and the sheet carries the words.
- **A referral code is read aloud, texted, and typed by someone else** — so it is a word plus three digits (`ALTYN-472`), not a hash. `a7Kq2xB` does not survive a phone call.
- **The referral bonus is credit, not cash**: it pays the subscription or buys school supplies at named partner shops. That changes the page — no "withdraw" button and no payout minimum, because a balance that can only be spent has no threshold to clear. The card carries the two real destinations instead of one blocked one, and says plainly that it is not withdrawable rather than letting a reader assume a bank transfer is coming. Partner shops are **listed by name**, because "partner stores" is a promise and a list is a fact.
- **Dostuňy çagyr** ([`ReferralScreen.tsx`](src/screens/ReferralScreen.tsx)): the one illustrated page in the app — a hand-drawn SVG (two avatars, a dashed hand-off arc, coins, a 5 TMT card) sized to the offer, because the offer is the page. Below it the numbers are real and derived from the friend list (gazanylan · tölegli dost · garaşylýar), the code box is dashed and tappable, three steps say when money actually lands, and the payout button disables under the minimum with the reason stated.

## Conventions

- No hardcoded hex in screens — colors come from `tokens`.
- **A row's second line is for a value it cannot show any other way — never to explain what the row does.** The label already says that; a subtitle repeating it in other words is noise that doubles the height of every row. Put current state in `RowEnd` on the right (`Dil ⟶ Türkmen dili ›`) and drop the rest, so a menu reads as a list of destinations. When every row in a list shares the same title ("Premium · aýlyk" six times), the varying field is the row's identity — promote it to the label and let the amount be the value.
- **Red means unread, and nothing else.** A count that is only a quantity (12 teacher notes) takes `CountPill tone="quiet"`; two stacked rows must never both shout. Every unread count is the *same* `CountPill` — a chat row that rolled its own blue pill made unread mean two colours on one screen.
- **Data stores an ISO date; only [`lib/date`](src/lib/date.ts) formats one.** The mock used to carry pre-formatted Turkmen strings — "4-nji fewral", "8-nji few.", "30-njy ýan." — three spellings of one idea, none sortable, all long enough to truncate in a row. The rules now live in one place:
  - **`DD.MM.YYYY`, never an ordinal month name.** `04.02.2026` is scannable, fixed-width and sorts by eye.
  - **Relative wins at ±1 day and loses past it.** `Şu gün` / `Düýn` / `Ertir` are read faster than a date the reader has to subtract; "3 gün öň" makes you do arithmetic to place it in a week, so day 2 onwards is numeric. `fmtDate` picks; `absDate` forces numeric for tables; `relDate` returns *only* the word (or `null`) for places already showing a date.
  - **Inside today, a message shows the clock**; yesterday shows `Düýn`; older shows the date (`fmtWhenShort` / `fmtWhen`).
  - **One anchor**: `TODAY`. Weekday names, day numbers, "is this today", the week strip, the last-sync stamp and the timestamp on a message the user just sent are all derived from it — including in mock data, so a real `new Date()` can never drop an August row into a February screen.
- **Bookmarks are one store, not one per section** ([`src/state/bookmarks.ts`](src/state/bookmarks.ts)): six sections hold six kinds of resource, but a reader's own shortlist crosses them — the half-read book and the contest they meant to enter belong on one page. The key is `kind:id` because ids are only unique within a section. `BookmarkButton` lives in the **detail page header**, never on list rows: saving is a decision, and the detail page is where there is enough to make it. Filled means saved — a stateful control has to look different in its two states.
- **The nav hides on inner pages.** A page reached by a back button owns the screen; a bottom bar under it offers a second, competing way out of somewhere the user got to by drilling in, and the back button is the one that preserves where they were. `PillHeader` calls `useSwipeLock()`, so "has a back button", "can't be swiped away from" and "hides the nav" are one fact rather than three that can drift. The panel's bottom padding drops with the bar — leaving 104px reserved would strand every sticky footer above a band of nothing.
- **One icon treatment per row group.** In a list of sibling rows, either every icon sits in an `IconBadge` or none does — a mix reads as two different components.
- **Different things get different glyphs.** The attach sheet offered three choices behind three identical paperclips, which told the reader nothing about which row did what; it now uses `ImageIcon`, `DocIcon` and `CameraIcon`, and the paperclip stays the *entry point* to attaching. The same rule caught a map `PinIcon` standing in for an attachment — a pin means *place*.
- **A sub-page opens at its top.** Sub-pages swap into the tab's own scroller, so `SubPage` resets it on mount; otherwise a page opens at whatever offset the previous one was left at.
- **`IconBadge` must stay visible against what it sits on.** A neutral badge on a `SurfaceRow` uses `surfacePress`, never `surface` — that's the row's own fill, and the squircle vanishes, leaving a bare icon floating beside neighbours that have a container.
- **One icon weight per badge.** Badge glyphs are stroked at 1.8; the *filled* `QuestionIcon` reads as a solid disc next to them, so badges use `QuestionOutlineIcon` and the filled one is reserved for standalone hint buttons on a plain surface.
- **`size` means optical size, not box size — and the factors are measured, never guessed.** These glyphs come from the source design with inconsistently cropped viewBoxes: some are trimmed tight to the artwork, others carry generous padding, so a `size` prop sets a *box* that says nothing about how big the icon looks. Measured at `size={22}`, ink ran from **11.7px** (Flame) to **26.2px** (Chevron — taller than its own box): a **2.25× spread inside one nominal size**. So every icon carries an `optical` factor derived by rendering it, reading `getBBox()`, and scaling so the geometric mean of the ink lands on 15.8px at `size={22}` (~72% of nominal, the usual 24-grid convention). That brings the set to a **1.003× spread**. Re-derive the same way if a glyph is replaced; hand-tuning a few icons by 5–10% is noise against this and will not fix it.
- **An icon's ink is `currentColor`.** A baked-in hex makes a glyph single-use: the same calendar was blue in a tinted pill and wrong in a white header button, and three icons carried hexes (`#3F7CF2`, `#898D95`, `#5A5E6F`) that were not tokens at all. The exceptions are deliberate and small: the date-strip event marks (`HouseEventIcon`, `PenEventIcon`) are coloured marks rather than icons, and `#fff` is a knockout — a hole in a coloured shape, not ink.
- Interactive elements are `ButtonBase` with an `aria-label` when the visible content isn't text.
- Decorative icons `aria-hidden`; stats/charts get `role="img"` + Turkmen `aria-label`.
- Toasts (`toast(msg)`) confirm every mutating action, and are the **last** resort for a dead end — a row that could plausibly open a page gets the page, not a "Tiz wagtda…".
- A number is stated once and derived everywhere else; two components never restate the same figure from separate literals.
- Scroll containers hide native scrollbars (`scrollbarWidth: none` + `::-webkit-scrollbar`) — the app renders as a phone surface.
- Keyboard focus is visible globally: `:focus-visible` gets a 2px blue outline (App-level GlobalStyles).
