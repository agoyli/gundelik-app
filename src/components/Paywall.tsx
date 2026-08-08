import { Box, Button, ButtonBase, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CheckIcon, LockIcon, SparkleIcon, TrendUpIcon, UsersIcon } from './Icons';
import { IconBadge, SheetDrawer } from './Ui';
import { ENTRY, PROOF, usePrefs } from '../state/prefs';
import { tokens } from '../theme';

/*
 * The paywall vocabulary. Every gate in the app is built from these four
 * shapes so a locked thing always looks locked the same way:
 *
 *   PremiumPill   — the mark that says "this is a Premium thing"
 *   LockedPreview — real content, obscured: you see what you are missing
 *   TeaserCard    — the locked thing plus one honest sentence and one CTA
 *   AdCard        — the only ad surface; it sells Premium, nothing else
 *
 * Rules: a teaser always shows something real (never an empty grey box), it
 * never blocks a path the free tier is entitled to, and it carries exactly one
 * primary action. Free limits state what remains, not just what is forbidden.
 */

/* ---------------- the mark ---------------- */

export function PremiumPill({ label = 'Premium', tone = 'solid' }: {
  label?: string; tone?: 'solid' | 'soft';
}) {
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 'none',
      height: 20, px: '8px', borderRadius: `${tokens.rPill}px`,
      fontSize: 11, fontWeight: 700, letterSpacing: '.2px',
      ...(tone === 'solid'
        ? { background: `linear-gradient(135deg, ${tokens.blue}, ${tokens.bluePress})`, color: '#fff' }
        : { bgcolor: tokens.blueTint, color: tokens.blueText }),
    }}>
      <SparkleIcon size={11} />{label}
    </Box>
  );
}

export const BetaPill = () => (
  <Box component="span" sx={{
    display: 'inline-grid', placeItems: 'center', flex: 'none',
    height: 20, px: '8px', borderRadius: `${tokens.rPill}px`,
    bgcolor: tokens.purpleTint, color: tokens.purpleText, fontSize: 11, fontWeight: 700,
  }}>BETA</Box>
);

/* ---------------- obscured real content ----------------
   The preview is rendered, then blurred and made inert — the point of a teaser
   is that you can see the shape of what you are missing. */

export function LockedPreview({ children, height = 132 }: { children: ReactNode; height?: number }) {
  return (
    <Box aria-hidden sx={{ position: 'relative', height, overflow: 'hidden', borderRadius: `${tokens.rRow}px` }}>
      <Box sx={{ filter: 'blur(5px)', opacity: .75, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </Box>
      <Box sx={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${tokens.surface} 92%)`,
      }} />
    </Box>
  );
}

/* ---------------- the teaser ---------------- */

export function TeaserCard({ title, note, cta = 'Premium al', icon, preview, onUpgrade, compact }: {
  title: string; note: string; cta?: string; icon?: ReactNode;
  preview?: ReactNode; onUpgrade: () => void; compact?: boolean;
}) {
  return (
    <Box sx={{
      bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden',
      border: `1px solid ${tokens.dividerSoft}`,
    }}>
      {preview && <LockedPreview height={compact ? 96 : 132}>{preview}</LockedPreview>}
      <Box sx={{
        p: preview ? `0 ${tokens.padCard} ${tokens.padCard}` : tokens.padCard,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center',
        mt: preview ? '-16px' : 0, position: 'relative',
      }}>
        <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={44}>
          {icon ?? <LockIcon size={22} />}
        </IconBadge>
        <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px' }}>{title}</Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5, maxWidth: 290 }}>{note}</Typography>
        <Button
          variant="contained" disableElevation onClick={onUpgrade}
          sx={{ mt: '4px', height: 42, px: '22px' }}
        >{cta}</Button>
      </Box>
    </Box>
  );
}

/* ---------------- free-tier meter ----------------
   States what is left, not only what is spent — a limit the user can still
   act on is information; a limit stated as a refusal is just a wall. */

export function FreeLimitBar({ used, label, note, onUpgrade }: {
  used: boolean; label: string; note: string; onUpgrade: () => void;
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '12px',
      bgcolor: used ? tokens.orangeTint : tokens.blueTint,
      borderRadius: `${tokens.rRow}px`, p: '12px 14px',
    }}>
      <Box aria-hidden sx={{ color: used ? tokens.orangeText : tokens.blueText, display: 'flex', flex: 'none' }}>
        {used ? <LockIcon size={20} /> : <SparkleIcon size={20} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: used ? tokens.orangeText : tokens.blueText }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }}>{note}</Typography>
      </Box>
      <ButtonBase
        onClick={onUpgrade}
        sx={{
          flex: 'none', height: 32, px: '13px', borderRadius: `${tokens.rPill}px`,
          bgcolor: '#fff', color: tokens.blueText, fontSize: 13, fontWeight: 700,
          boxShadow: tokens.shadowCtl,
        }}
      >Açmak</ButtonBase>
    </Box>
  );
}

/* ---------------- the ad ----------------
   Free users see promotion in exactly one shape, and it only ever promotes
   Premium — the social proof is what makes it an argument rather than a nag. */

const PROOF_LINES = [
  { icon: <UsersIcon size={16} />, text: `${PROOF.teachers} mugallym her gün ulanýar` },
  { icon: <TrendUpIcon size={16} />, text: `${PROOF.students} okuwçy ýetişigini ýokarlandyrdy` },
  { icon: <CheckIcon size={16} />, text: `${PROOF.schools} mekdep Premium bilen işleýär` },
];

export function AdCard({ onUpgrade, variant = 'full' }: {
  onUpgrade: () => void; variant?: 'full' | 'slim';
}) {
  if (variant === 'slim') {
    return (
      <ButtonBase
        onClick={onUpgrade}
        aria-label="Premium mümkinçilikleri"
        sx={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left',
          background: `linear-gradient(135deg, ${tokens.blue}, ${tokens.bluePress})`, color: '#fff',
          borderRadius: `${tokens.rCard}px`, p: '14px 16px', boxShadow: tokens.shadowFab,
        }}
      >
        <Box aria-hidden sx={{
          width: 40, height: 40, borderRadius: `${tokens.rTile}px`, flex: 'none',
          bgcolor: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center',
        }}><SparkleIcon size={22} /></Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Premium bilen has köp</Typography>
          <Typography sx={{ fontSize: 12.5, opacity: .9, mt: '1px' }} noWrap>
            {PROOF.teachers} mugallym her gün ulanýar
          </Typography>
        </Box>
        <Box aria-hidden sx={{
          flex: 'none', px: '12px', height: 30, borderRadius: `${tokens.rPill}px`,
          bgcolor: '#fff', color: tokens.blueText, fontSize: 13, fontWeight: 700,
          display: 'grid', placeItems: 'center',
        }}>Aç</Box>
      </ButtonBase>
    );
  }

  return (
    <Box sx={{
      borderRadius: `${tokens.rCard}px`, overflow: 'hidden',
      background: `linear-gradient(155deg, ${tokens.blue}, ${tokens.bluePress})`,
      color: '#fff', p: `18px ${tokens.padCard}`, boxShadow: tokens.shadowFab,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PremiumPill />
        <Typography sx={{ fontSize: 12, opacity: .85 }}>mahabat</Typography>
      </Box>
      <Typography sx={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.3px', mt: '10px' }}>
        Ähli testler, kartlar we Akylly mugallym
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '7px', mt: '12px' }}>
        {PROOF_LINES.map((l) => (
          <Box key={l.text} sx={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: 13.5 }}>
            <Box aria-hidden sx={{ display: 'flex', opacity: .9 }}>{l.icon}</Box>
            <Typography sx={{ fontSize: 13.5, opacity: .95 }}>{l.text}</Typography>
          </Box>
        ))}
      </Box>
      <Button
        fullWidth disableElevation onClick={onUpgrade}
        sx={{
          mt: '16px', bgcolor: '#fff', color: tokens.blueText,
          '&:hover': { bgcolor: tokens.blueTint }, '&:active': { bgcolor: tokens.blueTint },
        }}
      >
        Aýda {ENTRY.monthly} TMT-den — synap gör
      </Button>
    </Box>
  );
}

/* Ads and teasers only exist for the free tier; premium users see the content
   itself. Wrapping the check here keeps `!premium &&` out of every screen. */
export function AdSlot({ onUpgrade, variant }: { onUpgrade: () => void; variant?: 'full' | 'slim' }) {
  const { premium } = usePrefs();
  if (premium) return null;
  return <AdCard onUpgrade={onUpgrade} variant={variant} />;
}

/* ---------------- the "this is paid" sheet ----------------
   For gates reached by tapping something (the AI button), where a full page
   would lose the user's place. */

export function PaidFeatureSheet({ open, onClose, title, note, bullets, onUpgrade }: {
  open: boolean; onClose: () => void; title: string; note: string;
  bullets: string[]; onUpgrade: () => void;
}) {
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
        <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={56} radius={28}>
          <SparkleIcon size={28} />
        </IconBadge>
        <Typography variant="h2">{title}</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.ink3, lineHeight: 1.55, maxWidth: 300 }}>{note}</Typography>
      </Box>
      <Box sx={{
        mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '14px 15px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {bullets.map((b) => (
          <Box key={b} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Box aria-hidden sx={{ color: tokens.greenDeep, display: 'flex', mt: '2px', flex: 'none' }}>
              <CheckIcon size={16} />
            </Box>
            <Typography sx={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.45 }}>{b}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, textAlign: 'center', mt: '12px' }}>
        {PROOF.teachers} mugallym we {PROOF.students} okuwçy eýýäm ulanýar
      </Typography>
      <Box sx={{ display: 'flex', gap: '10px', mt: '14px' }}>
        <Button fullWidth onClick={onClose} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Soňra</Button>
        <Button fullWidth variant="contained" disableElevation onClick={() => { onClose(); onUpgrade(); }}>
          Premium al
        </Button>
      </Box>
    </SheetDrawer>
  );
}
