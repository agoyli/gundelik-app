import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import { DocIcon, ImageIcon, LockIcon, SendIcon, ShareIcon } from '../components/Icons';
import {
  GradeBadge, IconBadge, SectionLabel, Segmented, SheetDrawer, SwitchRow,
} from '../components/Ui';
import type { DaySchedule } from '../types';
import { absDate } from '../lib/date';
import { tokens } from '../theme';

/*
 * Sharing the diary.
 *
 * The button used to hand `navigator.share` a single sentence — "Gündelik —
 * 12.02.2026: 6 sapak" — which is not a diary, it is a receipt for one. And
 * the people a diary is actually sent to want three different things: a
 * grandparent wants to *read* today's marks in the message itself, a parent's
 * work chat wants something that looks like a card, and a tutor wants to keep
 * looking at it next week without being sent a new one every day.
 *
 * So sharing has three forms, and they are the three things a phone can
 * actually do — text, a picture, a link. The page shows the real thing before
 * it leaves: what is copied, what the card looks like, what the recipient will
 * open. Nothing is sent until the last button, and what goes out is exactly
 * what was on the screen.
 *
 * The link is the one with consequences, so it is the one with controls: what
 * it includes, and when it stops working. A link that never expires is a
 * permanent public record of a child's marks handed out by a button.
 */

type Toast = (m: string) => void;

export type ShareForm = 'text' | 'card' | 'link';

export const SHARE_FORMS: { id: ShareForm; label: string }[] = [
  { id: 'text', label: 'Tekst' },
  { id: 'card', label: 'Kart' },
  { id: 'link', label: 'Salgy' },
];

/** How long a shared link lives. A choice, because "forever" cannot be one. */
const SPANS = [
  { id: '1', label: '1 gün' },
  { id: '7', label: '1 hepde' },
  { id: '30', label: '1 aý' },
] as const;
type SpanId = typeof SPANS[number]['id'];

/** The text form, built once and used by the preview and by the share itself. */
export const shareText = (day: DaySchedule | null, dateKey: string, withHw: boolean) => {
  if (!day) return `Gündelik — ${absDate(dateKey)}`;
  const lines = day.lessons.map((l) => {
    const grade = l.grade ? ` — ${l.grade}` : '';
    const hw = withHw && l.hw ? `\n   Öý işi: ${l.hw}` : '';
    return `• ${l.subject}${grade}${hw}`;
  });
  const marks = day.lessons.filter((l) => l.grade).length;
  return [
    `Gündelik — ${absDate(dateKey)}`,
    ...lines,
    marks ? `${marks} baha alyndy` : 'Baha goýulmady',
  ].join('\n');
};

/* A made-up but stable link: the same day always produces the same address, so
   re-sharing a day does not scatter three different links to the same page. */
const linkFor = (dateKey: string) => `gundelik.tm/g/${dateKey.replace(/-/g, '').slice(2)}`;

/*
 * The card: the day as a picture.
 *
 * It is drawn in the app's own components rather than composed as an image,
 * because the app has no image pipeline — so what the reader sees here is
 * literally what would be captured. Marks, subjects, and the one line a
 * grandparent reads first.
 */
function ShareCard({ day, dateKey, student, school }: {
  day: DaySchedule | null; dateKey: string; student: string; school: string;
}) {
  const marks = (day?.lessons ?? []).filter((l) => l.grade);
  const avg = marks.length
    ? (marks.reduce((n, l) => n + (l.grade ?? 0), 0) / marks.length).toFixed(1).replace('.', ',')
    : '—';
  return (
    <Box sx={{
      borderRadius: `${tokens.rCard}px`, overflow: 'hidden', bgcolor: tokens.surface,
      border: `1px solid ${tokens.dividerSoft}`,
    }}>
      <Box sx={{
        background: `linear-gradient(155deg, ${tokens.blue}, ${tokens.bluePress})`,
        color: '#fff', p: '16px 18px',
      }}>
        <Typography sx={{ fontSize: 12.5, opacity: .85 }}>{absDate(dateKey)}</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', mt: '2px' }}>
          {student}
        </Typography>
        <Typography sx={{ fontSize: 12.5, opacity: .85 }}>{school}</Typography>
      </Box>
      <Box sx={{ p: '14px 18px 16px' }}>
        {(day?.lessons ?? []).slice(0, 6).map((l, i) => (
          <Box key={l.id} sx={{
            display: 'flex', alignItems: 'center', gap: '10px', minHeight: 34,
            borderTop: i > 0 ? `1px solid ${tokens.dividerSoft}` : 'none',
          }}>
            <Typography sx={{ flex: 1, fontSize: 14, color: tokens.ink2 }} noWrap>{l.subject}</Typography>
            {l.grade ? <GradeBadge grade={l.grade} /> : (
              <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>—</Typography>
            )}
          </Box>
        ))}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mt: '12px', pt: '12px', borderTop: `1px solid ${tokens.divider}`,
        }}>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }}>Günüň ortaça bahasy</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: tokens.blueText }}>{avg}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
 * The share sheet.
 *
 * One sheet, three forms on a `Segmented` — the app's own control for "the
 * same thing, told differently" — and the form's own settings underneath it.
 * The send button says which form it is sending, because "Paýlaş" three times
 * over three different payloads is how people send the wrong one.
 */
export function ShareSheet({ open, onClose, day, dateKey, student, school, toast }: {
  open: boolean; onClose: () => void;
  day: DaySchedule | null; dateKey: string; student: string; school: string; toast: Toast;
}) {
  const [form, setForm] = useState<ShareForm>('text');
  const [withHw, setWithHw] = useState(true);
  const [withNotes, setWithNotes] = useState(false);
  const [span, setSpan] = useState<SpanId>('7');

  const text = shareText(day, dateKey, withHw);
  const link = linkFor(dateKey);

  const send = async () => {
    const payload = form === 'link' ? `${text}\n\n${link}` : text;
    if (form === 'card') {
      toast('Kart surat hökmünde ýazdyryldy — galereýaňda');
      onClose();
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Gündelik', text: payload });
        onClose();
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(payload);
      toast(form === 'link' ? 'Salgy bufere göçürildi' : 'Tekst bufere göçürildi');
    } catch {
      toast(payload);
    }
    onClose();
  };

  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Gündeligi paýlaş</Typography>
      <Typography variant="caption">{absDate(dateKey)} · {day?.lessons.length ?? 0} sapak</Typography>

      <Box sx={{ mt: '14px' }}>
        <Segmented label="Paýlaşmagyň görnüşi" value={form} onChange={setForm} options={SHARE_FORMS} />
      </Box>

      {/* Every form shows the real thing before it leaves. */}
      <SectionLabel>Näme iberilýär</SectionLabel>
      {form === 'text' && (
        <Box sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px 15px',
          fontSize: 13.5, color: tokens.ink2, lineHeight: 1.6, whiteSpace: 'pre-wrap',
          maxHeight: 220, overflowY: 'auto',
        }}>{text}</Box>
      )}
      {form === 'card' && <ShareCard day={day} dateKey={dateKey} student={student} school={school} />}
      {form === 'link' && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '12px',
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px 15px',
        }}>
          <IconBadge bg={tokens.blueSoft} color={tokens.blue} size={40} radius={tokens.rTile}>
            <ShareIcon size={18} />
          </IconBadge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{link}</Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }}>
              Diňe okamak üçin · {SPANS.find((s) => s.id === span)?.label} işleýär
            </Typography>
          </Box>
        </Box>
      )}

      {/* What each form lets you decide. Text and card: how much of the day.
          Link: the same, plus the thing only a link needs — when it dies. */}
      <SectionLabel>Sazlamalar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SwitchRow
          icon={rowIcon(<DocIcon size={18} />, tokens.blueTint, tokens.blueText)}
          label="Öý işi hem goşulsyn"
          sub="Tabşyryklaryň teksti bilen"
          on={withHw}
          onToggle={() => setWithHw(!withHw)}
        />
        <SwitchRow
          icon={rowIcon(<LockIcon size={17} />, tokens.orangeTint, tokens.orangeText)}
          label="Mugallymyň bellikleri"
          sub="Şahsy bellikler — adatça paýlaşylmaýar"
          on={withNotes}
          onToggle={() => setWithNotes(!withNotes)}
        />
      </Box>

      {form === 'link' && (
        <>
          <SectionLabel>Salgy näçe wagt işlesin</SectionLabel>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            {SPANS.map((sp) => {
              const on = sp.id === span;
              return (
                <ButtonBase
                  key={sp.id}
                  onClick={() => setSpan(sp.id)}
                  aria-pressed={on}
                  sx={{
                    flex: 1, minHeight: 44, borderRadius: `${tokens.rRow}px`,
                    fontSize: 14, fontWeight: on ? 700 : 600,
                    bgcolor: on ? tokens.blueTint : tokens.surface,
                    color: on ? tokens.blueText : tokens.ink2,
                    border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
                  }}
                >{sp.label}</ButtonBase>
              );
            })}
          </Box>
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, lineHeight: 1.5, mt: '10px' }}>
            Salgyny açan adam diňe şu güni görýär — bahalary üýtgedip, ýazyşyp ýa-da beýleki
            günlere geçip bilmeýär. Möhlet gutaransoň salgy ýapylýar.
          </Typography>
        </>
      )}

      <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
        <Button fullWidth onClick={onClose} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        <Button
          fullWidth variant="contained" disableElevation onClick={() => void send()}
          startIcon={form === 'card' ? <ImageIcon size={17} />
            : form === 'link' ? <ShareIcon size={17} /> : <SendIcon size={17} />}
        >
          {form === 'card' ? 'Kart ýazdyr' : form === 'link' ? 'Salgy iber' : 'Tekst iber'}
        </Button>
      </Box>
    </SheetDrawer>
  );
}

/* The icon shape settings rows use — imported here rather than re-invented. */
function rowIcon(icon: React.ReactNode, tint: string, ink: string) {
  return <IconBadge bg={tint} color={ink} size={36} radius={tokens.rTile}>{icon}</IconBadge>;
}

/* Kept for the day sheet's "how it works" line. */
export const SHARE_HELP =
  'Tekst — habarlaşyk üçin; Kart — surat görnüşinde; Salgy — diňe okamak üçin wagtlaýyn salgy.';
