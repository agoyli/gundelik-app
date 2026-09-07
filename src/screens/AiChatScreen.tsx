import { Box, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  HistoryIcon, SendIcon, SparkleIcon, TrashIcon,
} from '../components/Icons';
import {
  EmptyState, HeaderIconButton, PillHeader, SheetDrawer,
} from '../components/Ui';
import { TeaserCard } from '../components/Paywall';
import { TODAY, fmtWhenShort } from '../lib/date';
import {
  addAiMsg, currentAiChatId, getAiChat, newAiChat, removeAiChat, useAiChats,
} from '../state/aiChats';
import type { AiMsg } from '../state/aiChats';
import { tierFor, useCan } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Akylly mugallym, as a chat of its own.
 *
 * It sits in Habarlar beside the teacher threads because that is what it is —
 * a conversation — and because a student looking for "what did I ask about
 * diskriminant" looks where their other conversations are, not on a lesson
 * page they would have to find first.
 *
 * The page is a thread and nothing else. History is one icon in the header
 * rather than a list above the thread: you are almost always continuing the
 * conversation you are in, and a list of past ones is the rare case. Opening
 * it is also where a new conversation is started, because "start a new one"
 * and "go back to an old one" are the same decision.
 */

const STARTERS = [
  { label: 'Bu temany düşündir', reply: 'Haýsy temany düşündireýin? Ders we sapagyň adyny ýaz, men ony ýönekeý dilde, mysallar bilen aýdyp bereýin.' },
  { label: 'Meselä kömek et', reply: 'Meseläni ýaz — men jogaby bermän, ilki nireden başlamalydygyny görkezerin, soň ädimme-ädim bile çözeris.' },
  { label: 'Test bermek', reply: 'Haýsy ders boýunça? Men 5 soraglyk gysga test taýýarlaýyn, her jogapdan soň näme üçin dogry ýa ýalňyşdygyny düşündirerin.' },
];

const FALLBACK = 'Gowy sorag. Ilki näme bilýändigiňi aýt — şondan ugur alyp, ädimme-ädim düşündireýin.';

const now = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

function Bubble({ m }: { m: AiMsg }) {
  const mine = m.role === 'user';
  return (
    <Box sx={{
      maxWidth: '86%', p: '10px 13px', fontSize: 15, lineHeight: 1.5,
      alignSelf: mine ? 'flex-end' : 'flex-start',
      bgcolor: mine ? tokens.blueSolid : tokens.surface,
      color: mine ? '#fff' : tokens.ink,
      borderRadius: mine
        ? `${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px ${tokens.rRow}px`
        : `${tokens.rRow}px ${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px`,
    }}>{m.text}</Box>
  );
}

export function AiChatScreen({ onBack, onUpgrade }: {
  onBack: () => void; onUpgrade: () => void;
}) {
  const chats = useAiChats();
  const entitled = useCan('ai');
  const plan = tierFor('ai');

  /* the conversation being read — the newest one by default, the way a
     messenger opens on the thread you were last in */
  const [id, setId] = useState(currentAiChatId);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const chat = getAiChat(id) ?? chats[0];

  const scrollToEnd = (behavior: ScrollBehavior = 'auto') => {
    let el = endRef.current?.parentElement as HTMLElement | null | undefined;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 4) {
        el.scrollTo({ top: el.scrollHeight, behavior });
        return;
      }
      el = el.parentElement;
    }
  };

  useEffect(() => { scrollToEnd(); }, [id]);
  useEffect(() => { scrollToEnd('smooth'); }, [chat?.msgs.length, thinking]);

  const ask = (q: string, reply: string) => {
    if (thinking || !chat) return;
    addAiMsg(chat.id, { role: 'user', text: q, at: now() });
    setThinking(true);
    setTimeout(() => {
      addAiMsg(chat.id, { role: 'ai', text: reply, at: now() });
      setThinking(false);
    }, 700);
  };

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft('');
    ask(q, FALLBACK);
  };

  const start = () => {
    setHistory(false);
    setId(newAiChat());
  };

  /* Not entitled: the page still opens and still says what it is. A locked
     door with a label beats a row that does nothing. */
  if (!entitled) {
    return (
      <>
        <PillHeader title="Akylly mugallym" onBack={onBack} />
        <Box sx={{ px: tokens.gutter, pt: '18px' }}>
          <Box sx={{
            borderRadius: `${tokens.rCard}px`, p: `24px ${tokens.padCard}`, textAlign: 'center',
            bgcolor: tokens.blueTint, color: tokens.blueText,
          }}>
            <Box aria-hidden sx={{
              width: 56, height: 56, borderRadius: '50%', mx: 'auto', bgcolor: '#fff',
              display: 'grid', placeItems: 'center', color: tokens.blue,
            }}><SparkleIcon size={28} /></Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mt: '14px', color: tokens.ink }}>
              Akylly mugallym 24/7
            </Typography>
            <Typography sx={{ fontSize: 14, color: tokens.ink2, mt: '6px', lineHeight: 1.5 }}>
              Islendik sapak boýunça sorag ber — jogaby bermän, ädimme-ädim alyp barýar.
              Ähli çatlaryň ýatda saklanýar.
            </Typography>
          </Box>
          <Box sx={{ pt: '14px' }}>
            <TeaserCard
              title="Akylly mugallym ýapyk"
              note={`Çäksiz soraglar, sapak boýunça düşündirişler we çat taryhy — ${plan?.name} bilen açylýar.`}
              feature="ai"
              onUpgrade={onUpgrade}
            />
          </Box>
        </Box>
      </>
    );
  }

  const msgs = chat?.msgs ?? [];

  return (
    /* A messenger's composer belongs at the foot of the screen, not at the
       foot of the *content* — a two-message thread left it floating in the
       middle of the page. The column fills the panel so the thread takes the
       slack and the composer stays put. */
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <PillHeader
        title="Akylly mugallym"
        onBack={onBack}
        action={(
          <HeaderIconButton label="Çat taryhy" onClick={() => setHistory(true)}>
            <HistoryIcon size={21} />
          </HeaderIconButton>
        )}
      />

      <Box sx={{
        flex: 1, px: tokens.gutter, pt: '14px', pb: '10px',
        display: 'flex', flexDirection: 'column', gap: '9px',
      }}>
        {/* the greeting is part of the thread, not a banner above it */}
        <Bubble m={{
          role: 'ai',
          at: chat?.at ?? now(),
          text: 'Salam! 👋 Islendik ders boýunça sorag berip bilersiň. Ýokardaky taryh düwmesinden öňki çatlaryňa dolanyp bolýar.',
        }} />

        {msgs.length === 0 && !thinking && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', pt: '2px' }}>
            {STARTERS.map((s) => (
              <ButtonBase
                key={s.label}
                onClick={() => ask(s.label, s.reply)}
                sx={{
                  height: 34, px: '13px', borderRadius: `${tokens.rPill}px`,
                  bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5, fontWeight: 600,
                  '&:active': { bgcolor: tokens.blueSoft },
                }}
              >{s.label}</ButtonBase>
            ))}
          </Box>
        )}

        {msgs.map((m, i) => <Bubble key={`${i}-${m.at}`} m={m} />)}

        {thinking && (
          <Box sx={{
            alignSelf: 'flex-start', bgcolor: tokens.surface, color: tokens.inkMuted,
            borderRadius: `${tokens.rRow}px`, p: '10px 13px', fontSize: 14,
          }}>Ýazýar…</Box>
        )}
        <Box ref={endRef} />
      </Box>

      {/* composer */}
      <Box sx={{
        position: 'sticky', bottom: 0, zIndex: 5, mt: '12px',
        px: tokens.gutter, pt: '10px', pb: 'calc(10px + env(safe-area-inset-bottom))',
        bgcolor: tokens.blurBg, backdropFilter: tokens.blur,
        borderTop: `1px solid ${tokens.dividerSoft}`,
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '8px', minHeight: 46,
          bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, pl: '15px', pr: '6px',
        }}>
          <InputBase
            placeholder="Sorag ýazyň…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            sx={{ flex: 1, fontSize: 15 }}
            inputProps={{ 'aria-label': 'Akylly mugallyma sorag' }}
          />
          <ButtonBase
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Ugrat"
            sx={{
              width: 34, height: 34, borderRadius: '50%', flex: 'none',
              bgcolor: draft.trim() ? tokens.blue : tokens.inkDisabled, color: '#fff',
              transition: 'background .15s ease',
            }}
          ><SendIcon size={15} /></ButtonBase>
        </Box>
      </Box>

      {/* History — and the one place a new conversation is started, because
          "back to an old one" and "start a new one" are the same decision. */}
      <SheetDrawer open={history} onClose={() => setHistory(false)}>
        <Typography variant="h2">Çat taryhy</Typography>

        <Box sx={{ pt: '14px' }}>
          <ButtonBase
            onClick={start}
            sx={{
              display: 'flex', alignItems: 'center', gap: '11px', width: '100%',
              minHeight: 48, px: '14px', textAlign: 'left', justifyContent: 'flex-start',
              borderRadius: `${tokens.rRow}px`, bgcolor: tokens.blueTint, color: tokens.blueText,
              fontSize: 15, fontWeight: 700,
              '&:active': { bgcolor: tokens.blueSoft },
            }}
          >
            <SparkleIcon size={19} />Täze çat
          </ButtonBase>
        </Box>

        {chats.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon size={26} />}
            title="Çat ýok"
            note="Ilkinji soragyňdan soň bu ýerde görüner."
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', pt: '12px' }}>
            {chats.map((c) => {
              const on = c.id === chat?.id;
              return (
                <Box
                  key={c.id}
                  sx={{
                    display: 'flex', alignItems: 'center', borderRadius: `${tokens.rRow}px`,
                    bgcolor: on ? tokens.blueTint : tokens.surface,
                  }}
                >
                  <ButtonBase
                    onClick={() => { setId(c.id); setHistory(false); }}
                    aria-current={on ? 'true' : undefined}
                    sx={{
                      flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px',
                      minHeight: 56, pl: '14px', pr: '6px', textAlign: 'left',
                      justifyContent: 'flex-start', borderRadius: `${tokens.rRow}px`,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{
                        fontSize: 15, fontWeight: 600,
                        color: c.title ? tokens.ink : tokens.ink3,
                      }}>
                        {c.title ?? 'Täze çat'}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '2px' }}>
                        {fmtWhenShort(c.at)} · {c.msgs.filter((m) => m.role === 'user').length} sorag
                      </Typography>
                    </Box>
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => {
                      removeAiChat(c.id);
                      /* never leave the page pointed at nothing */
                      if (c.id === chat?.id) setId(currentAiChatId());
                    }}
                    aria-label={`${c.title ?? 'Täze çat'} — poz`}
                    sx={{
                      width: 44, height: 44, mr: '4px', flex: 'none', borderRadius: '50%',
                      color: tokens.inkMuted, display: 'grid', placeItems: 'center',
                      '&:active': { color: tokens.redText },
                    }}
                  ><TrashIcon size={18} /></ButtonBase>
                </Box>
              );
            })}
          </Box>
        )}
      </SheetDrawer>
    </Box>
  );
}
