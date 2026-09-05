import { Box, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SendIcon, SparkleIcon } from './Icons';
import { SheetDrawer } from './Ui';
import { TODAY } from '../lib/date';
import { addAiMsg, newAiChat } from '../state/aiChats';
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

/*
 * AI chat in a bottom sheet, for a question asked *while reading a lesson* —
 * greeting, ready prompts, scrollable thread, pinned input.
 *
 * The sheet stays because the question here has context the standalone page
 * does not: you are on the lesson, so the prompts are about the lesson. What
 * changed is that it is no longer a separate memory. Every message is mirrored
 * into the same store the Akylly mugallym page reads, so a question asked from
 * a lesson is in the history with the rest. Two AI surfaces are fine; two
 * histories would mean the answer you remember is in neither.
 *
 * Mock replies for now; swap `ask` for a real model call when the backend exists.
 */
export function AiChatSheet({
  open, onClose, suggestions, fallback,
  title = 'Akylly mugallym', note = 'Sapak boýunça islendik zat soraň',
  greeting = 'Salam! 👋 Men bu sapak boýunça kömek edip bilerin. Taýýar soraglardan birini saýla ýa-da özüň ýaz.',
  icon, remember = true, footer,
}: {
  open: boolean; onClose: () => void; suggestions: AiSuggestion[]; fallback: string;
  /* The same sheet answers two different jobs — a question about a lesson, and
     a question about the app. Only the words and the icon change, because a
     second chat component would be a second set of bugs and a second thing to
     keep looking like the app. */
  title?: string; note?: string; greeting?: string; icon?: ReactNode;
  /** whether the conversation joins the Akylly mugallym history — support
      threads do not: a help query is not part of a pupil's study record */
  remember?: boolean;
  /** what sits under the composer — for support, the way to a human */
  footer?: ReactNode;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  /* one stored conversation per opening of the sheet */
  const chatId = useRef<string | null>(null);
  const record = (m: Msg) => {
    if (!remember) return;
    if (!chatId.current) chatId.current = newAiChat();
    addAiMsg(chatId.current, { ...m, at: `${TODAY}T${new Date().toTimeString().slice(0, 5)}` });
  };

  /* a fresh visit is a fresh conversation */
  useEffect(() => {
    if (!open) { chatId.current = null; setMsgs([]); }
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, thinking, open]);

  const ask = (q: string, reply: string) => {
    if (thinking) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    record({ role: 'user', text: q });
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: 'ai', text: reply }]);
      record({ role: 'ai', text: reply });
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
          alignSelf: 'flex-end', bgcolor: tokens.blueSolid, color: '#fff',
          borderRadius: `${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px ${tokens.rRow}px`,
        }
        : {
          alignSelf: 'flex-start', bgcolor: tokens.surface, color: tokens.ink,
          borderRadius: `${tokens.rRow}px ${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px`,
        }),
      /* replies quote the lesson's own concept and exam lists, which arrive as
         one string of bulleted lines */
      whiteSpace: 'pre-line',
    }}>{m.text}</Box>
  );

  return (
    <SheetDrawer open={open} onClose={onClose}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', pb: '10px' }}>
        <Box aria-hidden sx={{
          width: 40, height: 40, borderRadius: `${tokens.rTile}px`, flex: 'none',
          bgcolor: tokens.blueSoft, color: tokens.blue, display: 'grid', placeItems: 'center',
        }}>{icon ?? <SparkleIcon size={22} />}</Box>
        <Box>
          <Typography variant="h2" component="h2" sx={{ fontSize: 17 }}>{title}</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>{note}</Typography>
        </Box>
      </Box>

      {/* Thread — ready prompts live here as starting points and step aside once the chat begins */}
      <Box ref={listRef} aria-live="polite" sx={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        minHeight: '20dvh', maxHeight: '42dvh', overflowY: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        pb: '4px',
      }}>
        {bubble({ role: 'ai', text: greeting }, 'hello')}
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
          inputProps={{ 'aria-label': `${title} — sorag` }}
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
      {footer}
    </SheetDrawer>
  );
}
