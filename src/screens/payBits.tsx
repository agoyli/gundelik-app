import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { CheckIcon, SparkleIcon } from '../components/Icons';
import { HeaderIconButton, PillHeader, VariantSheet } from '../components/Ui';
import {
  FEATURES, TIERS, listYearly, perMonth, savePct, setTier, usePrefs,
} from '../state/prefs';
import type { Tier, TierId } from '../state/prefs';
import { spend, useWallet } from '../state/wallet';
import { tokens } from '../theme';

/*
 * What every payment screen shares.
 *
 * There are three of them — three ways of asking the same question, kept side
 * by side so the one that works can be chosen on evidence rather than taste.
 * That only means anything if they are three *presentations* of one offer, so
 * every price, every feature list and the purchase itself come from here: a
 * variant may differ in what it shows and in what order, never in what it
 * sells or what it costs.
 */

export type Term = 'year' | 'month';

/**
 * The payment screens, as the chooser lists them.
 *
 * `table` is the reference page itself, listed here like the rest so the
 * switcher can get *back* to it — a chooser you can leave but not return to is
 * a one-way door, and the reference is the page most of these are argued
 * against.
 */
export type PayVariant = 'table' | 'offer' | 'compare' | 'value' | 'trial' | 'worth';

export const PAY_VARIANTS: { id: PayVariant; name: string; note: string }[] = [
  { id: 'table', name: 'Doly deňeşdirme', note: 'Ähli aýratynlyklar tablisada — häzirki sahypa' },
  { id: 'offer', name: 'Bir teklip', note: 'Bir nyrhnama, bir baha, bir düwme' },
  { id: 'compare', name: 'Deňeşdirme', note: 'Iki nyrhnama gapma-garşy, diňe tapawudy' },
  { id: 'value', name: 'Näme açylýar', note: 'Ilki peýdasy, soň bahasy' },
  { id: 'trial', name: '7 gün synag', note: 'Mugt synagdan başlaýar, tölegi soň düşündirýär' },
  { id: 'worth', name: 'Näçä durýar', note: 'Bahany gündelik zatlar bilen deňeşdirýär' },
];

/** Every payment screen's props: the ways out, the toast, and the switcher. */
export type PayProps = {
  onBack: () => void;
  /** where a completed purchase lands — the whole tariff area closes, because
      the thing it was arguing for is now bought */
  onDone: () => void;
  toast: (m: string) => void;
  /** open the variant chooser — every payment screen carries the same ✦, so
      whichever one you are looking at, the others are one tap away */
  onSwitch?: () => void;
};

/*
 * The state a payment screen has: which plan, which term, and the one action.
 *
 * `zehin` and `year` are the defaults everywhere. A default is a
 * recommendation, and the honest one to make is the plan that answers the
 * question a family came with — plus the term that costs them least per month.
 */
export const usePay = ({ onDone, toast }: Pick<PayProps, 'onDone' | 'toast'>) => {
  const { tier: current, premium } = usePrefs();
  const [pick, setPick] = useState<Exclude<TierId, 'free'>>('zehin');
  const [term, setTerm] = useState<Term>('year');
  const tier = TIERS.find((t) => t.id === pick)!;

  /*
   * Paying.
   *
   * The account has a balance, so the subscription is paid out of it when it
   * covers the price — no card, no sheet, one press. When it does not, the
   * card flow stands in (this prototype has no acquirer behind it) and the
   * toast says which of the two happened, because "paid" and "paid *from your
   * balance*" are different facts about the same money.
   */
  const buy = (t: Tier = tier, over: Term = term) => {
    const price = over === 'year' ? t.yearly : t.monthly;
    const fromBalance = spend(price, `${t.name} — ${over === 'year' ? 'bir ýyl' : 'bir aý'}`);
    /* the term is what was paid for, so it is what the countdown counts */
    setTier(t.id, over === 'year' ? 365 : 30);
    toast(premium && current === t.id
      ? `Abuna uzaldyldy${fromBalance ? ' — balansdan' : ''}`
      : `${t.name} işjeňleşdirildi — ${price} TMT${fromBalance ? ' balansdan' : ''} 🎉`);
    onDone();
  };

  return { pick, setPick, term, setTerm, tier, buy, premium };
};

/** What one plan costs for the chosen term, and the per-month reading of it. */
export const priceOf = (t: Tier, term: Term) => (term === 'year' ? t.yearly : t.monthly);
export const unitOf = (term: Term) => (term === 'year' ? 'ýyl' : 'aý');
export const perMonthOf = (t: Tier, term: Term) =>
  (term === 'year' ? perMonth(t) : String(t.monthly));

/** `400 TMT/ýyl` — the one way a price is spelled, in every variant. */
export const priceLine = (t: Tier, term: Term) => `${priceOf(t, term)} TMT/${unitOf(term)}`;

/*
 * What a tier *adds*, in the app's own words.
 *
 * Read from `FEATURES`, which is also what the screens gate themselves with, so
 * a bullet on a payment screen cannot promise something the app then locks. A
 * plan's list is what it adds over the one below it — repeating the cheaper
 * plan's features inside the dearer one's column is how a comparison stops
 * showing a difference.
 */
export const addsOf = (id: TierId) => FEATURES.filter((f) => f.tier === id).map((f) => f.label);

/** What everyone has without paying — the baseline both plans build on. */
export const freeBase = () => addsOf('free');

/* The saving, in two pieces — a page puts them on one line or on two, but
   both are derived from the same two prices, so neither can overstate it. */

/** `600 TMT`, struck: the twelve months the yearly price is a discount from. */
export const ListPrice = ({ tier }: { tier: Tier }) => (
  <Typography sx={{
    fontSize: 12.5, color: tokens.inkMuted, textDecoration: 'line-through',
    fontVariantNumeric: 'tabular-nums',
  }}>{listYearly(tier)} TMT</Typography>
);

/** `33% arzan` — the app's one saving badge, green like every other good news. */
export const SavePill = ({ tier }: { tier: Tier }) => (
  <Box sx={{
    px: '8px', height: 20, borderRadius: `${tokens.rPill}px`, flex: 'none',
    bgcolor: tokens.greenTint, color: tokens.greenText,
    fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center',
  }}>{savePct(tier)}% arzan</Box>
);

/** Both, on one line. */
export const SaveLine = ({ tier }: { tier: Tier }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
    <ListPrice tier={tier} />
    <SavePill tier={tier} />
  </Box>
);

/*
 * The line under every buy button.
 *
 * It is the same sentence on all three screens on purpose: what happens next
 * and how to get out of it is not a variable to test, it is the thing that
 * makes a payment screen safe to press.
 */
export const TrustLine = () => (
  <Typography sx={{ fontSize: 12, color: tokens.inkMuted, textAlign: 'center', mt: '8px' }}>
    Ilkinji 7 gün mugt · islendik wagt ýatyrylýar
  </Typography>
);

/** A ticked line — the one shape a "you get this" bullet has. */
export function Tick({ children, tone = 'green' }: { children: string; tone?: 'green' | 'muted' }) {
  const on = tone === 'green';
  return (
    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <Box aria-hidden sx={{
        width: 20, height: 20, borderRadius: '50%', flex: 'none', mt: '1px',
        bgcolor: on ? tokens.greenTint : tokens.surfacePress,
        color: on ? tokens.greenDeep : tokens.inkMuted,
        display: 'grid', placeItems: 'center',
      }}><CheckIcon size={12} /></Box>
      <Typography sx={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.45 }}>{children}</Typography>
    </Box>
  );
}

/*
 * What the balance can cover, said before the button rather than after it.
 *
 * A payment screen that discovers mid-press that there is not enough money is
 * a payment screen that wastes the one moment the reader was ready. This line
 * sits above the button on every variant: what is on the account, and — when
 * it is short — exactly how much to top up.
 */
export function BalanceNote({ price, onTopUp }: { price: number; onTopUp?: () => void }) {
  const { balance } = useWallet();
  const covers = balance >= price;
  return (
    <Typography sx={{ fontSize: 12.5, color: tokens.ink3, textAlign: 'center', mb: '8px' }}>
      {covers
        ? `Balansyňdan tölener — ${balance} TMT bar`
        : `Balansda ${balance} TMT · ýene ${price - balance} TMT gerek`}
      {!covers && onTopUp && (
        <Typography
          component="span"
          onClick={onTopUp}
          sx={{ fontSize: 12.5, fontWeight: 700, color: tokens.blueText, ml: '6px', cursor: 'pointer' }}
        >Doldur</Typography>
      )}
    </Typography>
  );
}

/*
 * The header every payment screen wears.
 *
 * Same capsule, same back button, same ✦ in the action slot — a switcher that
 * moved or changed shape between variants would itself become a difference
 * between them, which is exactly what a comparison must not have. The icon
 * button rather than a labelled pill because at 375px the capsule holds a back
 * button, a centred title and about 96px of controls.
 */
export function PayHeader({ title, onBack, onSwitch }: {
  title: string; onBack: () => void; onSwitch?: () => void;
}) {
  return (
    <PillHeader
      title={title}
      onBack={onBack}
      action={onSwitch && (
        <HeaderIconButton label="Töleg sahypasynyň görnüşleri" onClick={onSwitch}>
          <SparkleIcon size={20} />
        </HeaderIconButton>
      )}
    />
  );
}

/*
 * The chooser, which is the app's own `VariantSheet` with this page's words in
 * it — the badges page uses the same control, and two sheets that looked
 * slightly different would themselves become a difference between screens.
 */
export function PayVariantSheet({ open, current, onClose, onPick }: {
  open: boolean; current: PayVariant; onClose: () => void; onPick: (id: PayVariant) => void;
}) {
  return (
    <VariantSheet
      open={open}
      title="Töleg sahypasynyň görnüşleri"
      lede="Bir teklip, alty dürli aýdylyşy. Bahalar we aýratynlyklar ählisinde birmeňzeş."
      variants={PAY_VARIANTS}
      current={current}
      onClose={onClose}
      onPick={onPick}
    />
  );
}
