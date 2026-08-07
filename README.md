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

## Notes

- Fonts are bundled locally via `@fontsource/inter` (no CDN dependency).
- Bottom sheets use MUI `SwipeableDrawer` (swipe-down to dismiss).
- Design tokens/colors/radii/sizes are measured from the source mock; see
  `HANDOFF.md` from the design handoff for the full token table.
- To add routing later: screens map 1:1 to routes (`react-router` drop-in).
