# Gündelik — React + Vite + TypeScript + MUI

School-diary mobile SPA (Turkmen). No backend required — a mock API with
simulated latency lives in `src/api/mockApi.ts`; swap its exported functions
for real `fetch()` calls without touching the UI.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle in dist/
npm run preview
```

## Structure

```
src/
  api/mockApi.ts        # mock backend: week, day schedules, hw mutation, sync
  hooks/useSchedule.ts  # data hook: loading states, race-safe requests
  theme.ts              # MUI theme built from the extracted design tokens
  types.ts              # domain types (Lesson, DaySchedule, …)
  components/
    Icons.tsx           # SVG paths extracted verbatim from the design mock
    Ui.tsx              # DateStrip, LessonCard, GradeBadge, TabBar, SheetDrawer…
  screens/
    GundelikScreen.tsx  # main screen + all bottom sheets
    OtherScreens.tsx    # Çagam, Analitika, Gollanmalar, Ýetişik
  App.tsx               # shell: phone frame, tab switching, snackbar
```

## Content API

The curriculum, the lessons and the interactive mini-apps are **content, not
code**: the app fetches them at runtime and no filename is compiled in.

```
<base>/curriculum.json               every subject, its grades, its themes
<base>/index.json                    what each subject-grade holds (5 kB)
<base>/lessons/<grade>-<slug>.json   the written lessons for one subject-grade
<base>/apps/<grade>/<slug>/<file>    an interactive mini-app (HTML)
```

Boot fetches `curriculum.json` and `index.json`; everything else is fetched when
it is opened. The lesson pages, the test bank and the flashcard decks are all
built from these — a test is a theme's own `test_bank`, a card is a self-check
pair or a formula. Nothing in `src/data/guides.tsx` invents them any more.

`<base>` defaults to `public/data` — served next to the app, so a plain build is
a working install. Point it anywhere else with an env var:

```bash
VITE_DATA_URL=https://api.example.tm/v1 npm run build
```

or, at runtime before boot, `configureSource(url)` from `src/data/source.ts`.
`src/main.tsx` fetches the curriculum first and imports the app after, so every
screen reads the programme as a plain list.

Regenerate the content tree from the curriculum repo:

```bash
npm run import:curriculum [path-to-meyilnamalar]
```

## Notes

- Fonts are bundled locally via `@fontsource/inter` (no CDN dependency).
- Bottom sheets use MUI `SwipeableDrawer` (swipe-down to dismiss).
- Design tokens/colors/radii/sizes are measured from the source mock; see
  `HANDOFF.md` from the design handoff for the full token table.
- To add routing later: screens map 1:1 to routes (`react-router` drop-in).
