import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { SectionLabel } from '../components/Ui';
import { TIERS } from '../state/prefs';
import type { Tier } from '../state/prefs';
import {
  BalanceNote, PayHeader, Tick, TrustLine, addsOf, freeBase, perMonthOf, priceLine, usePay,
} from './payBits';
import type { PayProps, Term } from './payBits';
import { tokens } from '../theme';

/*
 * Payment, variant 2: the two plans, side by side.
 *
 * The premise is the opposite of variant 1: some people will not pay until
 * they can see what they are *not* buying. The old tariff page answered that
 * with a thirteen-row matrix — three columns of ticks and locks that has to be
 * read cell by cell, which is a document, not a decision.
 *
 * This is the same answer in the form the question is actually asked: two
 * cards, each with its own price and its own button, and under each one only
 * **what that plan adds**. Repeating the cheaper plan's features inside the
 * dearer plan's column is how a comparison stops showing a difference — so
 * Zehinli's card says "everything in Göreldeli, plus…", which is one line
 * where the table needed seven repeated ticks.
 *
 * Both cards buy on the spot. A comparison that ends in a single button below
 * it makes the reader carry their choice down the page and hope the button
 * remembered it.
 */

const [ENTRY, FULL] = TIERS;

function PlanCard({ tier, term, best, includes, onBuy }: {
  tier: Tier; term: Term; best?: boolean; includes?: string; onBuy: () => void;
}) {
  return (
    <Box sx={{
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
      bgcolor: best ? tokens.blueTint : tokens.surface,
      border: `1.5px solid ${best ? tokens.blue : 'transparent'}`,
      borderRadius: `${tokens.rCard}px`, p: '15px 14px 14px',
    }}>
      {/* The badge takes its own line rather than sharing one with the name:
          at half a 375px screen a pill beside "Zehinli" truncated the plan's
          own name, and a card that cannot say what it is sells nothing. Both
          cards keep the line so the two prices stay level. */}
      <Box sx={{ height: 19, mb: '6px' }}>
        {best && (
          <Box sx={{
            display: 'inline-grid', placeItems: 'center', px: '8px', height: 19,
            borderRadius: `${tokens.rPill}px`, bgcolor: tokens.blue, color: '#fff',
            fontSize: 11, fontWeight: 700,
          }}>Köp saýlanýan</Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>{tier.name}</Typography>

      <Typography sx={{
        fontSize: 26, fontWeight: 700, letterSpacing: '-.4px', mt: '6px',
        fontVariantNumeric: 'tabular-nums', color: best ? tokens.blueText : tokens.ink,
      }}>
        {perMonthOf(tier, term)} TMT
        <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: tokens.ink3 }}>
          /aý
        </Typography>
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
        {priceLine(tier, term)}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '14px', flex: 1 }}>
        {includes && (
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink2, lineHeight: 1.4 }}>
            {includes}
          </Typography>
        )}
        {addsOf(tier.id).map((label) => <Tick key={label}>{label}</Tick>)}
      </Box>

      <Button
        fullWidth variant={best ? 'contained' : 'text'} disableElevation onClick={onBuy}
        sx={{
          mt: '14px', height: 44,
          ...(best ? {} : { bgcolor: '#fff', color: tokens.blueText }),
        }}
      >
        Saýla
      </Button>
    </Box>
  );
}

export function PayCompareScreen({ onBack, onDone, toast, onSwitch }: PayProps) {
  const { term, setTerm, buy } = usePay({ onDone, toast });

  return (
    <>
      <PayHeader title="Nyrhnamalar" onBack={onBack} onSwitch={onSwitch} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        {/* Term first and small: it is the cheap decision, and settling it lets
            each card show one price instead of four numbers competing. */}
        <Box sx={{
          display: 'flex', bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, p: '4px',
          mt: '14px',
        }}>
          {([['year', 'Ýyllyk'], ['month', 'Aýlyk']] as const).map(([id, label]) => {
            const on = id === term;
            return (
              <ButtonBase
                key={id}
                onClick={() => setTerm(id)}
                aria-pressed={on}
                sx={{
                  flex: 1, minHeight: 38, borderRadius: `${tokens.rPill}px`,
                  fontSize: 14, fontWeight: on ? 700 : 600,
                  bgcolor: on ? '#fff' : 'transparent',
                  color: on ? tokens.ink : tokens.ink3,
                  boxShadow: on ? tokens.shadowHeader : 'none',
                  transition: 'background .15s ease,color .15s ease',
                }}
              >{label}</ButtonBase>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'stretch', mt: '12px' }}>
          <PlanCard tier={ENTRY} term={term} onBuy={() => buy(ENTRY, term)} />
          <PlanCard
            tier={FULL} term={term} best
            includes={`${ENTRY.name}-däkileriň ählisi, üstesine:`}
            onBuy={() => buy(FULL, term)}
          />
        </Box>

        {/* The floor under both columns, stated once rather than ticked twice. */}
        <SectionLabel>Ikisinde-de bar</SectionLabel>
        <Box sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
          display: 'flex', flexDirection: 'column', gap: '11px',
        }}>
          {freeBase().map((label) => <Tick key={label} tone="muted">{label}</Tick>)}
          <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, pl: '30px' }}>
            Bular abunasyz hem elýeterli.
          </Typography>
        </Box>

        <Box sx={{ mt: '14px' }}>
          <BalanceNote price={term === 'year' ? ENTRY.yearly : ENTRY.monthly} />
        </Box>
        <TrustLine />
        <Box sx={{ height: '16px' }} />
      </Box>
    </>
  );
}
