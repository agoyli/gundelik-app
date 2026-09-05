import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { BellIcon, CheckIcon, LockIcon } from '../components/Icons';
import { SectionLabel, StickyFooter } from '../components/Ui';
import { TIERS } from '../state/prefs';
import { BalanceNote, PayHeader, TrustLine, addsOf, perMonthOf, priceLine, usePay } from './payBits';
import type { PayProps } from './payBits';
import { tokens } from '../theme';

/*
 * Payment, variant 4: the trial, told honestly.
 *
 * Every other variant asks for money on the first screen. This one asks for
 * nothing — the offer is seven days — and then spends the rest of the page on
 * the thing free trials are usually vague about: **what happens on day eight**.
 *
 * That is the whole design. A trial page that buries the renewal converts
 * better this week and produces chargebacks, one-star reviews and a parent who
 * never trusts the app again. So the sequence is a timeline: today it opens,
 * on the fifth day a notification says the charge is coming, on the eighth it
 * is taken — and the cancel line is stated in the same size as the rest, not
 * in grey six-point type at the bottom.
 *
 * The bet is that in a market where families are careful with subscriptions,
 * being the app that *tells* you when it will charge is worth more than the
 * extra few percent that hiding it buys.
 */

const FULL = TIERS[1];
const TRIAL_DAYS = 7;

/* The three moments, in order, each with what the reader does about it. */
const STEPS = [
  {
    id: 'now',
    day: 'Şu gün',
    title: 'Hemme zat açylýar',
    note: 'Ähli sapaklar, testler, kartlar we Akylly mugallym — çäksiz.',
    icon: <CheckIcon size={15} />,
    tint: tokens.greenTint,
    ink: tokens.greenDeep,
  },
  {
    id: 'warn',
    day: '5-nji gün',
    title: 'Ýatlatma iberilýär',
    note: 'Tölegiň başlajagyny öňünden habar berýäris — bildiriş we SMS bilen.',
    icon: <BellIcon size={15} />,
    tint: tokens.blueTint,
    ink: tokens.blueText,
  },
  {
    id: 'charge',
    day: `${TRIAL_DAYS + 1}-nji gün`,
    title: 'Töleg başlaýar',
    note: 'Şoňa çenli ýatyrsaň, hiç zat alynmaýar.',
    icon: <LockIcon size={14} />,
    tint: tokens.orangeTint,
    ink: tokens.orangeText,
  },
];

export function PayTrialScreen({ onBack, onDone, toast, onSwitch }: PayProps) {
  const { term, setTerm, buy } = usePay({ onDone, toast });

  return (
    <>
      <PayHeader title="Mugt synag" onBack={onBack} onSwitch={onSwitch} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* The offer is the number of days, so the number of days is the page's
            one big figure — not the price it eventually becomes. */}
        <Box sx={{
          mt: '14px', borderRadius: `${tokens.rCard}px`, p: `24px ${tokens.padCard}`,
          bgcolor: tokens.greenTint, textAlign: 'center',
        }}>
          <Typography sx={{
            fontSize: 34, fontWeight: 700, letterSpacing: '-.5px', color: tokens.greenText,
            lineHeight: 1.1,
          }}>{TRIAL_DAYS} gün mugt</Typography>
          <Typography sx={{ fontSize: 15, color: tokens.ink2, mt: '6px', lineHeight: 1.5 }}>
            {FULL.name} nyrhnamasynyň ählisi. Kart soralmaýar, häzir töleg alynmaýar.
          </Typography>
        </Box>

        {/* What the week contains — four lines, so the offer is not an empty
            "everything unlocked" */}
        <Box sx={{
          mt: '12px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `14px ${tokens.padCard}`, display: 'flex', flexWrap: 'wrap', gap: '8px',
        }}>
          {addsOf('zehin').slice(0, 4).map((label) => (
            <Box key={label} sx={{
              px: '10px', height: 28, borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 12.5, fontWeight: 600,
              display: 'grid', placeItems: 'center',
            }}>{label}</Box>
          ))}
        </Box>

        {/* The part other trial pages hide. */}
        <SectionLabel>Näme bolar</SectionLabel>
        <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}` }}>
          {STEPS.map((st, i) => (
            <Box key={st.id} sx={{ display: 'flex', gap: '13px' }}>
              {/* the rail: a marker per moment, joined by the line between them */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                <Box aria-hidden sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: st.tint, color: st.ink, display: 'grid', placeItems: 'center',
                }}>{st.icon}</Box>
                {i < STEPS.length - 1 && (
                  <Box aria-hidden sx={{ width: '2px', flex: 1, bgcolor: tokens.dividerSoft, my: '4px' }} />
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, pb: i < STEPS.length - 1 ? '18px' : 0 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: st.ink }}>{st.day}</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 600, mt: '2px' }}>{st.title}</Typography>
                <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '3px', lineHeight: 1.5 }}>
                  {st.note}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* The price, stated plainly and late — after the reader knows when it
            will be asked for. The term switch is two words rather than a
            control: it is a detail of an offer that has not started yet. */}
        <SectionLabel>Synagdan soň</SectionLabel>
        <Box sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {priceLine(FULL, term)}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
              {perMonthOf(FULL, term)} TMT/aý · islendik wagt ýatyrylýar
            </Typography>
          </Box>
          <ButtonBase
            onClick={() => setTerm(term === 'year' ? 'month' : 'year')}
            sx={{
              flex: 'none', px: '12px', height: 34, borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13, fontWeight: 700,
            }}
          >{term === 'year' ? 'Aýlyga geç' : 'Ýyllyga geç'}</ButtonBase>
        </Box>

        <Box sx={{ height: '10px' }} />
        <StickyFooter>
          <BalanceNote price={term === 'year' ? FULL.yearly : FULL.monthly} />
          <Button fullWidth variant="contained" disableElevation onClick={() => buy(FULL, term)}>
            {TRIAL_DAYS} gün mugt başla
          </Button>
          <TrustLine />
        </StickyFooter>
      </Box>
    </>
  );
}
