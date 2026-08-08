import { Box, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { SendIcon, SparkleIcon } from './Icons';
import { SheetDrawer } from './Ui';
import { tokens } from '../theme';

type Msg = { role: 'user' | 'ai'; text: string };
export type AiSuggestion = { label: string; reply: string };

/* Floating entry point — one sparkle button on every lesson page.
   Free users still see it: the button is the ad, and tapping it explains the
   feature rather than doing nothing. */
export function AiFab({ onClick, lift }: { onClick: () => void; lift?: boolean }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label="Akylly mugallym"
      aria-haspopup="dialog"
      sx={{
        position: 'absolute', right: 16, zIndex: 15,
        bottom: lift ? 'calc(86px + env(safe-area-inset-bottom))' : 'calc(20px + env(safe-area-inset-bottom))',
        width: 52, height: 52, borderRadius: '50%', bgcolor: tokens.blue, color: '#fff',
        display: 'grid', placeItems: 'center',
        boxShadow: tokens.shadowFab,
        transition: 'transform .12s ease',
        '&:active': { transform: 'scale(.92)' },
      }}
    >
      <SparkleIcon size={24} />
    </ButtonBase>
  );
}

/* AI chat in a bottom sheet — greeting, ready prompts, scrollable thread, pinned input.
   Mock replies for now; swap `ask` for a real model call when the backend exists. */
export function AiChatSheet({ open, onClose, suggestions, fallback }: {
  open: boolean; onClose: () => void; suggestions: AiSuggestion[]; fallback: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, thinking, open]);

  const ask = (q: string, reply: string) => {
    if (thinking) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: 'ai', text: reply }]);
      setThinking(false);
    }, 700);
  };

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft('');
    ask(q, fallback);
  };

  const bubble = (m: Msg, key: string) => (
    <Box key={key} sx={{
      maxWidth: '86%', p: '9px 13px', fontSize: 14, lineHeight: 1.5,
      ...(m.role === 'user'
        ? {
          alignSelf: 'flex-end', bgcolor: tokens.blue, color: '#fff',
          borderRadius: `${tokens.rRow}px ${tokens.rRow}px 4px ${tokens.rRow}px`,
        }
        : {
          alignSelf: 'flex-start', bgcolor: tokens.surface, color: tokens.ink,
          borderRadius: `${tokens.rRow}px ${tokens.rRow}px ${tokens.rRow}px 4px`,
        }),
    }}>{m.text}</Box>
  );

  return (
    <SheetDrawer open={open} onClose={onClose}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', pb: '10px' }}>
        <Box aria-hidden sx={{
          width: 40, height: 40, borderRadius: `${tokens.rTile}px`, flex: 'none',
          bgcolor: tokens.blueSoft, color: tokens.blue, display: 'grid', placeItems: 'center',
        }}><SparkleIcon size={22} /></Box>
        <Box>
          <Typography variant="h2" component="h2" sx={{ fontSize: 18 }}>Akylly mugallym</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>Sapak boýunça islendik zat soraň</Typography>
        </Box>
      </Box>

      {/* Thread — ready prompts live here as starting points and step aside once the chat begins */}
      <Box ref={listRef} aria-live="polite" sx={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        minHeight: '20dvh', maxHeight: '42dvh', overflowY: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        pb: '4px',
      }}>
        {bubble({ role: 'ai', text: 'Salam! 👋 Men bu sapak boýunça kömek edip bilerin. Taýýar soraglardan birini saýla ýa-da özüň ýaz.' }, 'hello')}
        {msgs.length === 0 && !thinking && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', pt: '2px' }}>
            {suggestions.map((s) => (
              <ButtonBase key={s.label} onClick={() => ask(s.label, s.reply)}
                sx={{
                  height: 32, px: '12px', borderRadius: `${tokens.rPill}px`,
                  bgcolor: tokens.blueTint, color: tokens.blue, fontSize: 13, fontWeight: 600,
                  '&:active': { bgcolor: tokens.blueSoft },
                }}>{s.label}</ButtonBase>
            ))}
          </Box>
        )}
        {msgs.map((m, i) => bubble(m, `${i}-${m.text.slice(0, 12)}`))}
        {thinking && (
          <Box sx={{
            alignSelf: 'flex-start', bgcolor: tokens.surface, color: tokens.inkMuted,
            borderRadius: `${tokens.rRow}px`, p: '9px 13px', fontSize: 14,
          }}>Ýazýar…</Box>
        )}
      </Box>

      {/* Pinned input */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '8px', height: 46, mt: '10px',
        bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, pl: '15px', pr: '6px',
      }}>
        <InputBase
          placeholder="Sorag ýazyň…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          sx={{ flex: 1, fontSize: 14 }}
          inputProps={{ 'aria-label': 'Akylly mugallyma sorag' }}
        />
        <ButtonBase onClick={send} disabled={!draft.trim()} aria-label="Ugrat"
          sx={{
            width: 34, height: 34, borderRadius: '50%', flex: 'none',
            bgcolor: draft.trim() ? tokens.blue : tokens.inkDisabled, color: '#fff',
            transition: 'background .15s ease',
          }}>
          <SendIcon size={15} />
        </ButtonBase>
      </Box>
    </SheetDrawer>
  );
}
