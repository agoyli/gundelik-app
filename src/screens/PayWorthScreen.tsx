import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { SectionLabel, Segmented, StickyFooter } from '../components/Ui';
import { PRODUCTS } from '../data/shop';
import { TIERS } from '../state/prefs';
import type { Tier } from '../state/prefs';
import { BalanceNote, PayHeader, Tick, TrustLine, addsOf, priceLine, usePay } from './payBits';
import type { PayProps, Term } from './payBits';
import { tokens } from '../theme';

/*
 * Payment, variant 5: what it costs, next to things that cost something.
 *
 * A price in isolation is unanswerable. "400 TMT a year" is either nothing or
 * a lot depending on what the reader silently compares it to, and every reader
 * compares it to something different. So the page supplies the comparison, and
 * supplies it from prices this app can actually stand behind: the shop's own
 * catalogue (real partner prices, in [`data/shop.tsx`](src/data/shop.tsx)) and
 * one line of tutoring, which is the alternative a family is really choosing
 * between.
 *
 * The unit is the **day**, because that is the honest denominator for a thing
 * used daily and because it is the number that makes the comparison legible:
 * a year of the full plan is about what one exercise-book set costs, spread
 * over 365 days.
 *
 * Nothing here is invented for effect: change a price in the catalogue and
 * this page's bars move with it.
 */

/** TMT a day, to one decimal — the figure the whole page is built on. */
const perDay = (t: Tier, term: Term) =>
  ((term === 'year' ? t.yearly / 365 : t.monthly / 30)).toFixed(1).replace('.', ',');

/*
 * A tutor's hour: the alternative the money is actually weighed against.
 *
 * It is a market price rather than a product of ours, so it is stated as an
 * approximation and labelled as one — a made-up precise number would be worse
 * than an honest round one.
 */
const TUTOR_HOUR = 150;

export function PayWorthScreen({ onBack, onDone, toast, onSwitch }: PayProps) {
  const { term, setTerm, buy } = usePay({ onDone, toast });
  const [tier, setTier] = useState<Tier>(TIERS[1]);

  const price = term === 'year' ? tier.yearly : tier.monthly;

  /* what else that money buys, from the app's own shelves */
  type Anchor = { label: string; value: number; note?: string; self?: boolean };
  const anchors: Anchor[] = [
    { label: `${tier.name} — ${term === 'year' ? 'bir ýyl' : 'bir aý'}`, value: price, self: true },
    { label: 'Repetitor bilen 1 sagat', value: TUTOR_HOUR, note: 'takmynan' },
    ...PRODUCTS.filter((p) => p.price <= 300).slice(0, 2).map((p) => ({ label: p.name, value: p.price })),
  ].sort((a, b) => b.value - a.value);
  const top = Math.max(...anchors.map((a) => a.value));

  return (
    <>
      <PayHeader title="Näçä durýar" onBack={onBack} onSwitch={onSwitch} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ pt: '14px' }}>
          <Segmented
            label="Nyrhnama"
            value={tier.id}
            onChange={(id) => setTier(TIERS.find((t) => t.id === id)!)}
            options={TIERS.map((t) => ({ id: t.id, label: t.name }))}
          />
        </Box>

        {/* The price as a day, which is the unit it is used in. */}
        <Box sx={{
          mt: '14px', borderRadius: `${tokens.rCard}px`, p: `22px ${tokens.padCard}`,
          bgcolor: tokens.blueTint, textAlign: 'center',
        }}>
          <Typography sx={{
            fontSize: 34, fontWeight: 700, letterSpacing: '-.5px', color: tokens.blueText,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
          }}>
            {perDay(tier, term)} TMT
            <Typography component="span" sx={{ fontSize: 17, fontWeight: 600, color: tokens.ink3 }}>
              /günde
            </Typography>
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.ink2, mt: '6px' }}>
            {priceLine(tier, term)} — {term === 'year' ? '365 güne bölünende' : '30 güne bölünende'}
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center', mt: '14px' }}>
            {(['year', 'month'] as Term[]).map((t) => (
              <Box
                key={t}
                component="button"
                onClick={() => setTerm(t)}
                aria-pressed={t === term}
                sx={{
                  border: 0, cursor: 'pointer', px: '14px', height: 34,
                  borderRadius: `${tokens.rPill}px`, fontSize: 13, fontWeight: 700,
                  bgcolor: t === term ? '#fff' : 'transparent',
                  color: t === term ? tokens.blueText : tokens.ink3,
                }}
              >{t === 'year' ? 'Ýyllyk' : 'Aýlyk'}</Box>
            ))}
          </Box>
        </Box>

        {/* The comparison, drawn to scale. Every figure beside it is a price
            this app already quotes somewhere else. */}
        <SectionLabel>Deňeşdirme</SectionLabel>
        <Box sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {anchors.map((a) => (
            <Box key={a.label}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Typography sx={{
                  flex: 1, fontSize: 13.5, lineHeight: 1.4,
                  fontWeight: a.self ? 700 : 500,
                  color: a.self ? tokens.ink : tokens.ink2,
                }}>
                  {a.label}
                  {a.note && (
                    <Typography component="span" sx={{ fontSize: 12, color: tokens.inkMuted }}>
                      &nbsp;({a.note})
                    </Typography>
                  )}
                </Typography>
                <Typography sx={{
                  fontSize: 14, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
                  color: a.self ? tokens.blueText : tokens.ink2,
                }}>{a.value} TMT</Typography>
              </Box>
              <Box aria-hidden sx={{
                mt: '6px', height: 8, borderRadius: `${tokens.rPill}px`,
                bgcolor: tokens.dividerSoft, overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%', width: `${(a.value / top) * 100}%`,
                  borderRadius: `${tokens.rPill}px`,
                  bgcolor: a.self ? tokens.blue : tokens.inkDisabled,
                }} />
              </Box>
            </Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: 12, color: tokens.inkMuted, px: '6px', mt: '10px', lineHeight: 1.5 }}>
          Deňeşdirilýän bahalar — dükanymyzdaky hakyky bahalar. Repetitoryň bahasy takmynan.
        </Typography>

        {/* And what the money is for, in four lines rather than a table. */}
        <SectionLabel>Şu baha näme girýär</SectionLabel>
        <Box sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {addsOf(tier.id).slice(0, 4).map((label) => <Tick key={label}>{label}</Tick>)}
        </Box>

        <Box sx={{ height: '10px' }} />
        <StickyFooter>
          <BalanceNote price={price} />
          <Button fullWidth variant="contained" disableElevation onClick={() => buy(tier, term)}>
            {tier.name} al — {priceLine(tier, term)}
          </Button>
          <TrustLine />
        </StickyFooter>
      </Box>
    </>
  );
}
