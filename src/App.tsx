import { Box, CssBaseline, GlobalStyles, Snackbar, ThemeProvider } from '@mui/material';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
/*
 * The two documentation routes are loaded on demand. They carry the logo's path
 * data and a specimen of every component, which is ~135kB a parent should never
 * be made to download to read a school day.
 */
const BrandbookScreen = lazy(() => import('./brand/BrandbookScreen')
  .then((m) => ({ default: m.BrandbookScreen })));
const DesignSystemScreen = lazy(() => import('./brand/DesignSystemScreen')
  .then((m) => ({ default: m.DesignSystemScreen })));
import { ErrorBoundary } from './components/ErrorBoundary';
import { PhoneFrame } from './components/PhoneFrame';
import { PointsFx } from './components/PointsFx';
import { SwipeLockProvider, useSwipeLocked } from './components/SwipeLock';
import { TabBar } from './components/Ui';
import { GundelikScreen } from './screens/GundelikScreen';
import { AnalitikaScreen, GollanmalarScreen, ProfilScreen } from './screens/OtherScreens';
import { OnboardingScreen } from './screens/StateScreens';
import { theme, tokens } from './theme';
import { TAB_ORDER } from './types';
import type { TabId } from './types';

function Shell() {
  const [tab, setTab] = useState<TabId>('gundelik');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toast = useCallback((msg: string) => setToastMsg(msg), []);

  /*
   * Swipe navigation: the panels live on one horizontal scroll-snap track, so the
   * OS drives the gesture (momentum, rubber-banding, mid-swipe cancel) instead of
   * a JS animation. Scroll position is the source of truth; `tab` mirrors it.
   */
  const locked = useSwipeLocked();
  const trackRef = useRef<HTMLDivElement>(null);
  /* set while we scroll programmatically, so the scroll handler doesn't fight the tap */
  const settling = useRef(false);
  /* the browser restores horizontal scroll on reload, which would land us mid-track */
  const ready = useRef(false);

  /*
   * The browser restores this track's scrollLeft on reload — and it does so
   * *after* the first layout pass, so setting it to 0 once here was not
   * enough: a page reloaded while a later tab was showing came back parked
   * between two panels, half of one and half of the next, with the tab bar
   * naming a third. Scroll restoration is turned off, and the alignment is
   * re-asserted on the next frame and again at `load` for the case where the
   * restore still lands. `ready` only flips once the track is actually where
   * it belongs, so the restore's own scroll event can't retitle the tab.
   */
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const align = () => { track.scrollLeft = 0; };
    align();
    const raf = requestAnimationFrame(() => {
      align();
      ready.current = true;
    });
    const onLoad = () => align();
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  const goToTab = useCallback((id: TabId) => {
    const track = trackRef.current;
    if (!track) return;
    if (id === tab) {
      /* re-tapping the active tab returns it to the top, as most apps do */
      track.children[TAB_ORDER.indexOf(id)]?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTab(id);
    settling.current = true;
    track.scrollTo({ left: track.clientWidth * TAB_ORDER.indexOf(id), behavior: 'smooth' });
  }, [tab]);

  /* derive the active tab from where the track has settled */
  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0 || !ready.current) return;
    /* a sub-page owns the screen; never let a stray scroll retitle the tab under it */
    if (locked) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    const id = TAB_ORDER[Math.min(Math.max(idx, 0), TAB_ORDER.length - 1)];
    if (settling.current) {
      if (id === tab) settling.current = false; /* programmatic scroll has arrived */
      return;
    }
    if (id !== tab) setTab(id);
  };

  /* keep the panel aligned when the frame resizes (rotation, desktop resize) */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => {
      track.scrollLeft = track.clientWidth * TAB_ORDER.indexOf(tab);
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [tab]);

  return (
    <>
      {/* the phone surface owns the document: full height, no page scroll */}
      <GlobalStyles styles={{
        'html, body, #root': { height: '100%' },
        body: { background: tokens.pageBg, overscrollBehavior: 'none' },
      }} />

      <PhoneFrame>
          <Box
            ref={trackRef}
            onScroll={onTrackScroll}
            sx={{
              flex: 1, minHeight: 0, display: 'flex',
              overflowX: locked ? 'hidden' : 'auto', overflowY: 'hidden',
              scrollSnapType: locked ? 'none' : 'x mandatory',
              overscrollBehaviorX: 'contain',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {TAB_ORDER.map((id) => (
              <Box
                key={id}
                role="tabpanel"
                aria-hidden={tab !== id}
                sx={{
                  flex: '0 0 100%', width: '100%', height: '100%',
                  scrollSnapAlign: 'start', scrollSnapStop: 'always',
                  overflowY: 'auto', WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorY: 'contain',
                  scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                  /* clear the glass tab bar floating above the content — but
                     only while there is one: an inner page hides the bar, and
                     leaving its 104px reserved would strand every sticky footer
                     above a band of nothing. */
                  pb: locked
                    ? 'calc(16px + env(safe-area-inset-bottom))'
                    : 'calc(104px + env(safe-area-inset-bottom))',
                }}
              >
                <ErrorBoundary>
                  {id === 'gundelik' && <GundelikScreen toast={toast} />}
                  {id === 'analitika' && <AnalitikaScreen toast={toast} />}
                  {id === 'gollanmalar' && <GollanmalarScreen toast={toast} />}
                  {id === 'yetisik' && <ProfilScreen toast={toast} />}
                </ErrorBoundary>
              </Box>
            ))}
          </Box>
          {/* A page reached by a back button owns the screen. Leaving the tab
              bar under it offers a second, competing way out of somewhere the
              user got to by drilling in — and the back button is the one that
              preserves where they were. `locked` is set by PillHeader, so
              "has a back button" and "hides the nav" cannot drift apart. */}
          {!locked && <TabBar value={tab} onChange={goToTab} />}
          {/* the one thing that celebrates: `bal`, thrown up the screen when
              it is actually banked. Above the sheets, and it blocks nothing. */}
          <PointsFx />
      </PhoneFrame>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={2200}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          bottom: 'calc(110px + env(safe-area-inset-bottom)) !important',
          '& .MuiSnackbarContent-root': {
            bgcolor: 'rgba(17,18,19,.92)', borderRadius: `${tokens.rPill}px`,
            fontSize: 13.5, fontWeight: 500, minWidth: 0, justifyContent: 'center',
          },
        }}
      />
    </>
  );
}

/*
 * Routing, such as it is.
 *
 * The product is one screen with four tabs, so it has never needed a router and
 * still doesn't. What it needs is a second *destination* — the brandbook — that
 * is not part of the phone surface: it is desktop, it scrolls the document, and
 * no parent should ever land on it. A hash is enough to carry that, costs no
 * dependency, and survives a reload.
 */
const useHash = () => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
};

export default function App() {
  /*
   * Two documentation routes, and the plate anchors inside them (`#p06`) have
   * to keep whichever page is open — an anchor is a position on a page, not a
   * page of its own, so it resolves against the last docs route rather than
   * dropping the reader back into the phone surface.
   */
  const hash = useHash();
  const [docs, setDocs] = useState<'brand' | 'design' | null>(null);
  /*
   * The first three screens, before anything else.
   *
   * A new family arriving at a school diary has no idea whether it is free,
   * whether it needs a code, or what is inside it — three questions the
   * onboarding answers with facts and then gets out of the way. It shows once
   * (state is in memory, like everything else in this prototype) and can be
   * replayed from Sazlamalar → Ýörite sahypalar, which is also where the error
   * pages live.
   */
  const [onboarding, setOnboarding] = useState(true);
  useEffect(() => {
    if (hash.startsWith('#/brand')) setDocs('brand');
    else if (hash.startsWith('#/design')) setDocs('design');
    else if (!/^#p\d\d$/.test(hash)) setDocs(null);
  }, [hash]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* what is true on every route */}
      <GlobalStyles styles={{
        '*': { WebkitTapHighlightColor: 'transparent' },
        ':focus-visible': { outline: `2px solid ${tokens.blue}`, outlineOffset: '2px' },
        /* Respect the OS setting: pulses, bobbing and screen transitions collapse to a blink */
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }} />
      {onboarding && !docs ? (
        /* the same frame the app runs in — the first screen a family sees is
           not the one screen that ignores the phone surface */
        <PhoneFrame><OnboardingScreen onDone={() => setOnboarding(false)} /></PhoneFrame>
      ) : docs ? (
        <ErrorBoundary>
          <Suspense fallback={<Box sx={{ minHeight: '100dvh', bgcolor: tokens.surface }} />}>
            {docs === 'brand' ? <BrandbookScreen /> : <DesignSystemScreen />}
          </Suspense>
        </ErrorBoundary>
      ) : (
        <SwipeLockProvider>
          <Shell />
        </SwipeLockProvider>
      )}
    </ThemeProvider>
  );
}
