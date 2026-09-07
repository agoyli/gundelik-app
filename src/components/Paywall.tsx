import { Box, Button, ButtonBase, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CheckIcon, LockIcon, SparkleIcon } from './Icons';
import { IconBadge, RowChevron, SheetDrawer } from './Ui';
import {
  ENTRY, FREE_BLURB, PLAN, PROOF, planDaysLeft, planEndingSoon, tierFor, tierName, tierOf,
  usePrefs,
} from '../state/prefs';
import {
  childDaysLeft, childEndingSoon, childLeftLabel, childLeftShort, useStudent,
} from '../state/children';
import type { Child } from '../state/children';
import type { FeatureId } from '../state/prefs';
import { tokens } from '../theme';

/*
 * The paywall vocabulary. Every gate in the app is built from these shapes so
 * a locked thing always looks locked the same way:
 *
 *   PremiumPill   — the mark that says "this is a Premium thing"
 *   PlanWidget    — the plan the account is on, and the way up from it
 *   LockedPreview — real content, obscured: you see what you are missing
 *   TeaserCard    — the locked thing plus one honest sentence and one CTA
 *
 * Rules: a teaser always shows something real (never an empty grey box), it
 * never blocks a path the free tier is entitled to, and it carries exactly one
 * primary action. Free limits state what remains, not just what is forbidden.
 *
 * There is no house ad any more. `AdCard` was the app's own full-width
 * advertisement for itself, and its last home was the slot `PlanWidget` now
 * holds — a page that names the reader's plan and what the next one costs is
 * already the argument, and a second one under it would be the nagging the
 * free tier was redesigned to stop.
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

/* ---------------- which plan, and how long is left ----------------
 *
 * One pill for "what is this child on, and until when". It was two hand-drawn
 * pills and a literal: a green "Işjeň" on the profile, a white one in the
 * payments header, and "28 gün galdy" typed under a date nobody counted from.
 *
 * The subscription is per child, so the badge takes one: `show="plan"` names
 * the tier (Adaty · Göreldeli · Zehinli), which is what a list of five
 * children needs; `show="status"` says Işjeň, which is what a page already
 * titled with the plan name needs. The free plan has no end, so it carries no
 * countdown — an "unlimited" that counts down would be a lie in a badge.
 */
export function PlanBadge({ child, show = 'status', tone = 'light' }: {
  child?: Child; show?: 'status' | 'plan'; tone?: 'light' | 'onDark';
}) {
  const selected = useStudent();
  const c = child ?? selected;
  const left = show === 'plan' ? childLeftShort(c) : childLeftLabel(c);
  const days = childDaysLeft(c);
  const free = c.tier === 'free';
  const over = days !== null && days < 0;

  const look = tone === 'onDark'
    ? { bg: 'rgba(255,255,255,.22)', ink: '#fff' }
    : free ? { bg: tokens.surfacePress, ink: tokens.ink3 }
      : over ? { bg: tokens.redTint, ink: tokens.redText }
        : childEndingSoon(c) ? { bg: tokens.orangeTint, ink: tokens.orangeText }
          : { bg: tokens.greenTint, ink: tokens.greenText };

  /* A free plan has no subscription, so it has no *status*: a green "Işjeň"
     on Adaty read as a running subscription that would one day stop. It says
     what it is instead — the price — which is also the only word "Mugt" is
     allowed to mean anywhere in the app. */
  const head = show === 'plan'
    ? tierName(c.tier)
    : free ? 'Mugt' : (over ? 'Möhleti gutardy' : PLAN.status);

  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', flex: 'none', maxWidth: '100%',
      height: 22, px: '9px', borderRadius: `${tokens.rPill}px`,
      bgcolor: look.bg, color: look.ink, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {head}
      {!free && !over && left && (
        <>
          <Box aria-hidden component="span" sx={{ opacity: .5 }}>·</Box>
          {left}
        </>
      )}
    </Box>
  );
}

/* ---------------- obscured real content ----------------
   The preview is rendered, then blurred and made inert — the point of a teaser
   is that you can see the shape of what you are missing. */

/* ---------------- the plan a family is on ----------------
 *
 * One widget for the tariff, on every tier.
 *
 * Profil used to hold two unrelated objects in this slot: a status row for a
 * subscriber, and a full ad card for everyone else — so the page changed shape
 * depending on what the reader had paid, and the free plan was never named. A
 * tariff is the same fact in both cases ("this is the plan you are on, this is
 * what it gives, this is what happens next"), so it is one card with the same
 * three parts, and only the words change.
 *
 * The foot is the action, and it is the *right* action: while there is time,
 * it opens the payment page; under a fortnight it turns amber and says extend,
 * because a countdown nobody can act on is decoration; on the free plan it
 * quotes the cheapest way up rather than the dearest.
 */
export function PlanWidget({ onOpen, onUpgrade }: { onOpen: () => void; onUpgrade: () => void }) {
  const { tier, premium } = usePrefs();
  const plan = tierOf(tier);
  const soon = planEndingSoon();
  const over = premium && (planDaysLeft() ?? 1) <= 0;

  const tone = !premium
    ? { tint: tokens.surfacePress, ink: tokens.ink2 }
    : over ? { tint: tokens.redTint, ink: tokens.redText }
      : soon ? { tint: tokens.orangeTint, ink: tokens.orangeText }
        : { tint: tokens.greenTint, ink: tokens.greenText };

  const foot = premium
    ? {
      label: soon || over ? 'Möhleti uzalt' : 'Abuna we töleg',
      note: `${PLAN.until} çenli · aýda ${plan?.monthly ?? 0} TMT`,
      ink: soon || over ? tokens.orangeText : tokens.blueText,
      go: onOpen,
    }
    : {
      label: `${ENTRY.name} bilen açylýar`,
      note: `Aýda ${ENTRY.monthly} TMT-den · islendik wagt ýatyryp bolýar`,
      ink: tokens.blueText,
      go: onUpgrade,
    };

  return (
    <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px', p: `15px ${tokens.padCard}` }}>
        <IconBadge bg={tone.tint} color={tone.ink} size={48}>
          {premium ? <SparkleIcon size={22} /> : <LockIcon size={21} />}
        </IconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.2px' }} noWrap>
              {tierName(tier)}
            </Typography>
            <PlanBadge />
          </Box>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px', lineHeight: 1.4 }}>
            {plan ? plan.blurb : FREE_BLURB}
          </Typography>
        </Box>
      </Box>

      <ButtonBase
        onClick={foot.go}
        aria-label={`${foot.label} — ${foot.note}`}
        sx={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left',
          p: `12px ${tokens.padCard}`, borderTop: `1px solid ${tokens.dividerSoft}`,
          '&:active': { bgcolor: tokens.surfacePress },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: foot.ink }} noWrap>{foot.label}</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }} noWrap>{foot.note}</Typography>
        </Box>
        <RowChevron />
      </ButtonBase>
    </Box>
  );
}

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

export function TeaserCard({ title, note, feature, cta, icon, preview, onUpgrade, compact }: {
  title: string; note: string; feature?: FeatureId; cta?: string; icon?: ReactNode;
  preview?: ReactNode; onUpgrade: () => void; compact?: boolean;
}) {
  /* The button names the plan that opens *this* feature, read from the same
     table the screens gate on — so a teaser can never invite someone to a tier
     that would not actually unlock the thing they just tapped. */
  const label = cta ?? `${(feature && tierFor(feature)?.name) ?? ENTRY.name} al`;
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
        >{label}</Button>
      </Box>
    </Box>
  );
}

/* ---------------- the "this is paid" sheet ----------------
   For gates reached by tapping something (the AI button), where a full page
   would lose the user's place. */

export function PaidFeatureSheet({ open, onClose, title, note, feature, bullets, onUpgrade }: {
  open: boolean; onClose: () => void; title: string; note: string;
  feature?: FeatureId; bullets: string[]; onUpgrade: () => void;
}) {
  const plan = (feature && tierFor(feature)?.name) ?? ENTRY.name;
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
          {`${plan} al`}
        </Button>
      </Box>
    </SheetDrawer>
  );
}
