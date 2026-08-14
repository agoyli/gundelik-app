import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { loadCurriculum } from './data/curriculum';
import { loadIndex } from './data/library';

/*
 * Boot: fetch the programme, then mount the app.
 *
 * The subject list, the themes, the lesson paths, the test bank and the card
 * decks are content, not code, so they arrive over the network from whatever
 * source the build points at (see `data/source.ts`) — the programme and the
 * catalogue of what has been written for it, together, in two requests.
 *
 * The app is imported *after* those resolve, and that order is the whole trick:
 * every module below can then read the curriculum and the catalogue as
 * an ordinary list, and no screen carries a "still loading" branch for data
 * that is already in memory by the time it renders. It also means this entry
 * stays tiny — no MUI, no screens — so the request leaves as early as it can.
 */

const root = createRoot(document.getElementById('root')!);

type Tokens = typeof import('./theme').tokens;

const Failed = ({ error, t }: { error: unknown; t: Tokens }) => (
  <div style={{
    minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '32px',
    font: '600 15px/1.6 Inter, system-ui, sans-serif', color: t.ink2, textAlign: 'center',
  }}>
    <div>
      <p style={{ fontSize: 17, color: t.ink, marginBottom: 8 }}>Maglumatlar ýüklenmedi</p>
      <p style={{ fontWeight: 400, color: t.inkMuted }}>
        Internet birikmäňizi barlaň — sapaklaryň maksatnamasy serwerden alynýar.
      </p>
      <p style={{ fontWeight: 400, fontSize: 12.5, color: t.lockInk, marginTop: 10 }}>
        {error instanceof Error ? error.message : String(error)}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          marginTop: 18, padding: '11px 26px', borderRadius: t.rPill, border: 0,
          background: t.blueSolid, color: '#fff', font: '600 15px Inter, system-ui, sans-serif',
        }}
      >Gaýtadan synanyş</button>
    </div>
  </div>
);

Promise.all([loadCurriculum(), loadIndex()])
  .then(async () => {
    const { default: App } = await import('./App');
    root.render(<StrictMode><App /></StrictMode>);
  })
  .catch(async (error) => {
    /* the failure page is the only thing that needs the design tokens here, and
       it can afford to fetch them */
    const { tokens } = await import('./theme');
    root.render(<Failed error={error} t={tokens} />);
  });
