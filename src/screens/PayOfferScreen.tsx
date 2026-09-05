import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { StarFilledIcon } from '../components/Icons';
import { PillHeader, StickyFooter } from '../components/Ui';
import { TIERS, perMonth } from '../state/prefs';
import { PREMIUM_ADS } from '../data/premium';
import {
  BalanceNote, SaveLine, Tick, TrustLine, addsOf, freeBase, priceLine, usePay,
} from './payBits';
import type { PayProps } from './payBits';
import { tokens } from '../theme';

/*
 * Payment, variant 1: one offer.
 *
 * The premise is that most people do not want to choose a plan; they want to
 * be told what the thing costs and whether it is worth it. So the page makes
 * the choice — the full plan, billed yearly, which is what a family who is
 * paying at all almost always wants — states one price, gives four reasons,
 * and offers one button.
 *
 * The other options are still here, because a page that hides them is not
 * simple, it is evasive. They are one line each under the button, in the voice
 * of an aside: the same offer monthly, and the cheaper plan. A reader who has
 * a reason to want them will look for exactly that line; everyone else reads
 * the price and presses the button.
 *
 * The one number the page repeats is the per-month reading of the year, since
 * "400 TMT" and "33 TMT a month" are the same fact told to two different
 * people.
 */

const FULL = TIERS[1];   /* Zehinli — the plan this page recommends */
const ENTRY = TIERS[0];  /* Göreldeli — the aside */

/* Four reasons, taken from the ad copy so the sales lines are written once */
const REASONS = ['roadmap', 'tests', 'cards', 'ai'] as const;

export function PayOfferScreen({ onBack, onDone, toast }: PayProps) {
  const { buy } = usePay({ onDone, toast });

  return (
    <>
      <PillHeader title="Abuna" onBack={onBack} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* The price, and nothing competing with it. */}
        <Box sx={{
          mt: '14px', borderRadius: `${tokens.rCard}px`, p: `22px ${tokens.padCard}`,
          bgcolor: tokens.blueTint, textAlign: 'center',
        }}>
          <Box aria-hidden sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto', bgcolor: '#fff',
            color: tokens.blue, display: 'grid', placeItems: 'center',
          }}><StarFilledIcon size={28} /></Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700, mt: '12px' }}>{FULL.name}</Typography>
          <Typography sx={{
            fontSize: 34, fontWeight: 700, letterSpacing: '-.5px', color: tokens.blueText,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, mt: '2px',
          }}>{perMonth(FULL)} TMT<Typography component="span" sx={{
            fontSize: 17, fontWeight: 600, color: tokens.ink3,
          }}>/aý</Typography></Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.ink2, mt: '4px' }}>
            {priceLine(FULL, 'year')} — bir gezek tölenýär
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
            <SaveLine tier={FULL} />
          </Box>
        </Box>

        {/* Four reasons, not thirteen. The comparison table is a document; this
            is an offer, and an offer that lists everything is a document too. */}
        <Box sx={{
          mt: '12px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
          p: `16px ${tokens.padCard}`, display: 'flex', flexDirection: 'column', gap: '13px',
        }}>
          {REASONS.map((id) => {
            const ad = PREMIUM_ADS.find((a) => a.id === id)!;
            return <Tick key={id}>{`${ad.title} — ${ad.blurb.replace(/\.$/, '')}`}</Tick>;
          })}
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, pl: '30px' }}>
            we {addsOf('zehin').length + addsOf('gorelde').length - REASONS.length} sany ýene
          </Typography>
        </Box>

        {/* The asides. Both are one tap, and neither is dressed as a decision. */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: '14px' }}>
          {[
            {
              label: `Aýlyk tölemek — ${priceLine(FULL, 'month')}`,
              note: 'Islendik aý ýatyrsa bolýar',
              go: () => buy(FULL, 'month'),
            },
            {
              label: `${ENTRY.name} — ${priceLine(ENTRY, 'year')}`,
              note: ENTRY.blurb,
              go: () => buy(ENTRY, 'year'),
            },
          ].map((row) => (
            <ButtonBase
              key={row.label}
              onClick={row.go}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px',
                width: '100%', textAlign: 'left', p: '11px 6px', borderRadius: `${tokens.rRow}px`,
                '&:active': { bgcolor: tokens.surfacePress },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.blueText }}>
                {row.label}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>{row.note}</Typography>
            </ButtonBase>
          ))}
        </Box>

        {/* What is free stays stated: a payment screen that implies the diary
            itself is behind the wall is selling something the app gives away. */}
        <Typography sx={{
          fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', mt: '6px',
        }}>
          {freeBase().join(' · ')} — hemişe mugt.
        </Typography>

        <Box sx={{ height: '10px' }} />
        <StickyFooter>
          <BalanceNote price={FULL.yearly} />
          <Button fullWidth variant="contained" disableElevation onClick={() => buy(FULL, 'year')}>
            {FULL.name} al — {priceLine(FULL, 'year')}
          </Button>
          <TrustLine />
        </StickyFooter>
      </Box>
    </>
  );
}
