import { Box, CssBaseline, GlobalStyles, Snackbar, ThemeProvider } from '@mui/material';
import { useCallback, useState } from 'react';
import { TabBar } from './components/Ui';
import { GundelikScreen } from './screens/GundelikScreen';
import { AnalitikaScreen, CagamScreen, GollanmalarScreen, ProfilScreen } from './screens/OtherScreens';
import { theme, tokens } from './theme';
import type { TabId } from './types';

export default function App() {
  const [tab, setTab] = useState<TabId>('gundelik');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toast = useCallback((msg: string) => setToastMsg(msg), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        'html, body, #root': { height: '100%' },
        body: { background: '#EDEEF1', overscrollBehavior: 'none' },
        '*': { WebkitTapHighlightColor: 'transparent' },
        ':focus-visible': { outline: `2px solid ${tokens.blue}`, outlineOffset: '2px' },
      }} />

      <Box sx={{ height: '100dvh', display: 'flex', justifyContent: 'center' }}>
        {/* Phone frame on desktop, edge-to-edge on mobile */}
        <Box sx={{
          width: '100%', maxWidth: 393, height: '100%', position: 'relative',
          bgcolor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          '@media (min-width:480px)': {
            my: '24px', height: 'min(852px, calc(100dvh - 48px))',
            borderRadius: '44px', boxShadow: '0 10px 40px rgba(17,18,19,.14)',
          },
        }}>
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {(['cagam', 'gundelik', 'analitika', 'gollanmalar', 'yetisik'] as TabId[]).map((id) => (
              <Box
                key={id}
                role="tabpanel"
                hidden={tab !== id}
                sx={{
                  position: 'absolute', inset: 0, overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain',
                  scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                  /* clear the glass tab bar floating above the content */
                  pb: 'calc(104px + env(safe-area-inset-bottom))',
                  ...(tab === id && {
                    animation: `screenIn .22s ${tokens.ease}`,
                    '@keyframes screenIn': {
                      from: { opacity: 0.25, transform: 'translateY(6px)' },
                      to: { opacity: 1, transform: 'none' },
                    },
                  }),
                }}
              >
                {id === 'gundelik' && <GundelikScreen toast={toast} />}
                {id === 'cagam' && <CagamScreen toast={toast} />}
                {id === 'analitika' && <AnalitikaScreen />}
                {id === 'gollanmalar' && <GollanmalarScreen toast={toast} />}
                {id === 'yetisik' && <ProfilScreen toast={toast} />}
              </Box>
            ))}
          </Box>
          <TabBar value={tab} onChange={setTab} />
        </Box>
      </Box>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={2200}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          bottom: 'calc(110px + env(safe-area-inset-bottom)) !important',
          '& .MuiSnackbarContent-root': {
            bgcolor: 'rgba(17,18,19,.92)', borderRadius: '999px',
            fontSize: 13.5, fontWeight: 500, minWidth: 0, justifyContent: 'center',
          },
        }}
      />
    </ThemeProvider>
  );
}
