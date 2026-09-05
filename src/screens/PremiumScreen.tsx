import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { CheckIcon, StarFilledIcon } from '../components/Icons';
import { IconBadge, PillHeader, RowChevron, SectionLabel, StickyFooter } from '../components/Ui';
import { PREMIUM_ADS } from '../data/premium';
import type { PremiumAd } from '../data/premium';
import { FEATURES, PLAN, PROOF, TIERS, meets, tierName } from '../state/prefs';
import type { Tier } from '../state/prefs';
import { BalanceNote, ListPrice, SavePill, TrustLine, perMonthOf, priceLine, usePay } from './payBits';
import type { PayProps, Term } from './payBits';
import { PREMIUM_GRADIENT, tokens } from '../theme';

/*
 * The tariff page, as an advertisement. The second of two.
 *
 * `UpgradeScreen` is the *reference* form: a term switch, two plan cards and
 * the comparison table, everything visible at once, nothing sold twice. It is
 * the right page for a parent who has already decided to pay and wants to know
 * exactly what the two plans differ by.
 *
 * This is the other job — the page that has to make the case in the first
 * place. So it inverts the *structure*: the emblem before the price, one plan
 * and one term rather than a grid of four numbers, and the features as
 * promises you can open rather than ticks you have to decode.
 *
 * What it does not invert is the app. An earlier draft of this page was dark,
 * on the theory that an ad should not look like the product — and one screen
 * in its own mode is a different app wearing the product's name, which is a
 * strange thing to hand someone at the moment you ask them for money. It is
 * the same daylight, the same `IconBadge` pairs, the same green saving badge
 * and the same primary button as everywhere else. The one thing that is
 * special is the emblem, because that is the mark of the thing being sold.
 *
 * Both pages read the same `TIERS` and the same `FEATURES`, and both end in
 * `setTier`, so two presentations can never quote two prices or promise two
 * feature sets. It is a variant, not a replacement: which one converts better
 * is a question for the numbers, and keeping both is how it stays answerable.
 */

/* the shared offer: same prices, same features, same purchase as variants 1–2 */

/* ---------------- the hero ---------------- */

/*
 * Forty stars, placed once.
 *
 * They are generated rather than typed so the field looks scattered instead of
 * gridded, and generated from a *fixed* seed rather than `Math.random` so it is
 * the same sky on every render — a background that reshuffles itself when the
 * plan radio changes is a background that has to be explained. They sit on the
 * brand's own blue panel, which is the app's one existing "this is the paid
 * thing" surface.
 */
const STARS = (() => {
  let seed = 20260904;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: 40 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    /* px, spelled out: MUI reads a bare `width: 1` as 100% */
    size: `${1 + Math.round(rnd() * 2)}px`,
    dim: 0.25 + rnd() * 0.5,
  }));
})();

/*
 * The emblem.
 *
 * Not the brand mark: the mark is the school diary's identity and it is the
 * brand's blue by rule, so pouring a gradient through it would say "this is a
 * different product". A star is the thing being sold — the same glyph the app
 * already gives a top student — and it can carry the premium treatment without
 * lying about whose logo it is.
 */
const Hero = ({ title, lede }: { title: string; lede: string }) => (
  <Box sx={{
    position: 'relative', overflow: 'hidden', mt: '14px',
    borderRadius: `${tokens.rCard}px`, px: '20px', pt: '26px', pb: '24px',
    background: `linear-gradient(155deg, ${tokens.blue}, ${tokens.bluePress})`,
    boxShadow: tokens.shadowFab, textAlign: 'center',
  }}>
    <Box aria-hidden sx={{ position: 'absolute', inset: 0 }}>
      {STARS.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: s.left, top: s.top, width: s.size, height: s.size,
          borderRadius: '50%', bgcolor: '#fff', opacity: s.dim,
        }} />
      ))}
    </Box>
    <Box sx={{ position: 'relative' }}>
      <Box aria-hidden sx={{
        width: 92, height: 92, borderRadius: '50%', mx: 'auto',
        background: PREMIUM_GRADIENT, color: '#fff', display: 'grid', placeItems: 'center',
        boxShadow: `0 12px 30px -10px ${tokens.ink}`,
      }}>
        <StarFilledIcon size={46} />
      </Box>
      <Typography sx={{
        fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-.4px', mt: '16px',
      }}>{title}</Typography>
      <Typography sx={{
        fontSize: 14, color: '#fff', opacity: .88, lineHeight: 1.5, mt: '8px',
      }}>{lede}</Typography>
    </Box>
  </Box>
);

/* ---------------- price ---------------- */

/*
 * One term, as a row.
 *
 * Both rows print the same unit on the right — what it costs *per month* —
 * because that is the only way two terms compare, and the row's own line
 * carries what you actually hand over. The saving is stated against the twelve
 * months it is a discount from, in the same green badge the tariff page uses,
 * and both figures are derived, so the badge cannot contradict the price
 * beside it.
 */
function TermRow({ tier, term, on, onPick }: {
  tier: Tier; term: Term; on: boolean; onPick: () => void;
}) {
  const year = term === 'year';
  const per = perMonthOf(tier, term);
  return (
    <ButtonBase
      onClick={onPick}
      aria-pressed={on}
      aria-label={`${year ? 'Ýyllyk' : 'Aýlyk'}, ${per} TMT aýda`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '13px', width: '100%',
        p: '14px 15px', textAlign: 'left', justifyContent: 'flex-start',
        borderRadius: `${tokens.rCard}px`,
        bgcolor: on ? tokens.blueTint : tokens.surface,
        border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
        transition: 'background .15s ease',
      }}
    >
      <Box aria-hidden sx={{
        width: 22, height: 22, borderRadius: '50%', flex: 'none',
        border: `2px solid ${on ? tokens.blue : tokens.inkDisabled}`,
        bgcolor: on ? tokens.blue : 'transparent',
        display: 'grid', placeItems: 'center', color: '#fff',
      }}>{on && <CheckIcon size={12} />}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* the badge rides with the term's name, the prices sit under it —
            three figures on one line wrapped into an unreadable stack at 375px */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {year ? 'Ýyllyk' : 'Aýlyk'}
          </Typography>
          {year && <SavePill tier={tier} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', mt: '3px' }}>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, fontVariantNumeric: 'tabular-nums' }}>
            {priceLine(tier, term)}
          </Typography>
          {year && <ListPrice tier={tier} />}
        </Box>
      </Box>

      <Typography sx={{
        fontSize: 17, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
        color: on ? tokens.blueText : tokens.ink,
      }}>{per} TMT/aý</Typography>
    </ButtonBase>
  );
}

/* ---------------- the list of promises ---------------- */

function AdRow({ ad, locked, onOpen }: { ad: PremiumAd; locked: boolean; onOpen: () => void }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={ad.title}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '13px', width: '100%',
        p: '14px 15px', textAlign: 'left', justifyContent: 'flex-start',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <IconBadge bg={ad.tint} color={ad.ink} size={40} radius={tokens.rTile}>{ad.icon(22)}</IconBadge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{ad.title}</Typography>
          {/* An ad may not promise what the plan in the radio above does not
              include — so a row the chosen tier cannot reach says which one can,
              rather than being hidden or quietly implying it is included. */}
          {locked && (
            <Box sx={{
              px: '8px', height: 19, borderRadius: `${tokens.rPill}px`, flex: 'none',
              bgcolor: tokens.surfacePress, color: tokens.inkMuted,
              fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center',
            }}>{tierName('zehin')}</Box>
          )}
        </Box>
        <Typography sx={{ fontSize: 13, color: tokens.ink3, lineHeight: 1.45, mt: '3px' }}>
          {ad.blurb}
        </Typography>
      </Box>
      <Box sx={{ mt: '10px' }}><RowChevron /></Box>
    </ButtonBase>
  );
}

/*
 * One promise, opened.
 *
 * The whole list is mounted on one horizontal scroll-snap track — the same
 * mechanism the app shell uses for its tabs — so a reader who opened
 * "Analitika" out of curiosity can swipe through the other nine without going
 * back to the list and choosing again. The dots are the position in that list,
 * and they are tappable, because a dot you can see and cannot press is a
 * decoration pretending to be a control.
 */
function AdDetail({ index, tier, term, onBack, onBuy }: {
  index: number; tier: Tier; term: Term; onBack: () => void; onBuy: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(index);

  /* open on the row that was tapped, before the first paint */
  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = el.clientWidth * index;
  }, [index]);

  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PillHeader title="Premium" onBack={onBack} />

      <Box
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAt(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        sx={{
          flex: 1, minHeight: 0, display: 'flex',
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {PREMIUM_ADS.map((ad) => (
          <Box key={ad.id} sx={{
            flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always',
            overflowY: 'auto', px: '20px', pt: '16px',
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          }}>
            <Box sx={{ display: 'grid', placeItems: 'center' }}>
              <IconBadge bg={ad.tint} color={ad.ink} size={68} radius={tokens.rCard}>
                {ad.icon(32)}
              </IconBadge>
            </Box>
            <Typography sx={{
              fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: '-.3px', mt: '14px',
            }}>{ad.title}</Typography>
            <Typography sx={{
              fontSize: 14, color: tokens.ink3, textAlign: 'center', lineHeight: 1.5, mt: '6px',
            }}>{ad.blurb}</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '20px', pb: '14px' }}>
              {ad.points.map((p) => (
                <Box key={p.title} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Box aria-hidden sx={{
                    width: 22, height: 22, borderRadius: '50%', flex: 'none', mt: '1px',
                    bgcolor: tokens.greenTint, color: tokens.greenDeep,
                    display: 'grid', placeItems: 'center',
                  }}><CheckIcon size={13} /></Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{p.title}</Typography>
                    <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5, mt: '2px' }}>
                      {p.note}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px', py: '12px' }}>
        {PREMIUM_ADS.map((ad, i) => (
          <ButtonBase
            key={ad.id}
            onClick={() => go(i)}
            aria-label={ad.title}
            aria-current={i === at}
            sx={{ width: 20, height: 20, borderRadius: '50%' }}
          >
            <Box aria-hidden sx={{
              width: i === at ? 8 : 6, height: i === at ? 8 : 6, borderRadius: '50%',
              bgcolor: i === at ? tokens.blue : tokens.inkDisabled,
              transition: 'width .15s ease, height .15s ease',
            }} />
          </ButtonBase>
        ))}
      </Box>

      <Box sx={{ px: tokens.gutter }}>
        <StickyFooter>
          {/* the term the reader chose one screen ago — a button that quotes a
              different price on the way in and on the way out is two offers */}
          <BuyButton tier={tier} term={term} onBuy={onBuy} />
        </StickyFooter>
      </Box>
    </Box>
  );
}

/* The one action, in the one place it ever appears. */
const BuyButton = ({ tier, term, onBuy }: { tier: Tier; term: Term; onBuy: () => void }) => (
  <Button fullWidth variant="contained" disableElevation onClick={onBuy}>
    {tier.name} al — {priceLine(tier, term)}
  </Button>
);

/* ---------------- the page ---------------- */

export function PremiumScreen({ onBack, onDone, toast }: PayProps) {
  const { pick, setPick, term, setTerm, tier, buy, premium } = usePay({ onDone, toast });
  const [open, setOpen] = useState<number | null>(null);

  if (open !== null) {
    return (
      <AdDetail
        index={open} tier={tier} term={term}
        onBack={() => setOpen(null)} onBuy={() => buy(tier, term)}
      />
    );
  }

  return (
    <>
      <PillHeader title="Premium" onBack={onBack} />
      <Box sx={{ px: tokens.gutter, display: 'flex', flexDirection: 'column' }}>
        <Hero
          title="Gündelik Premium"
          lede="Çäklerden çyk: ähli sapaklar, testler, kartlar we Akylly mugallym — bir abunada."
        />

        {/*
          * Which plan, then how long — the same two decisions the reference
          * page makes, in the same order, but as one control each. Two plans
          * are a *product* choice and belong above the price rows; the term is
          * the cheap decision, and settling it lets each row show one figure
          * instead of four numbers competing.
          */}
        <SectionLabel>Nyrhnama</SectionLabel>
        <Box sx={{
          display: 'flex', bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, p: '4px',
        }}>
          {TIERS.map((t) => {
            const on = t.id === pick;
            return (
              <ButtonBase
                key={t.id}
                onClick={() => setPick(t.id)}
                aria-pressed={on}
                sx={{
                  flex: 1, minHeight: 38, borderRadius: `${tokens.rPill}px`,
                  fontSize: 14, fontWeight: on ? 700 : 600,
                  bgcolor: on ? '#fff' : 'transparent',
                  color: on ? tokens.ink : tokens.ink3,
                  boxShadow: on ? tokens.shadowHeader : 'none',
                  transition: 'background .15s ease,color .15s ease',
                }}
              >{t.name}</ButtonBase>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, px: '6px', mt: '10px', lineHeight: 1.45 }}>
          {tier.blurb}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '12px' }}>
          <TermRow tier={tier} term="year" on={term === 'year'} onPick={() => setTerm('year')} />
          <TermRow tier={tier} term="month" on={term === 'month'} onPick={() => setTerm('month')} />
        </Box>

        <SectionLabel>Näme açylýar</SectionLabel>
        <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
          {PREMIUM_ADS.map((ad, i) => (
            <Box key={ad.id}>
              {i > 0 && (
                <Box aria-hidden sx={{ height: '1px', bgcolor: tokens.dividerSoft, ml: '68px' }} />
              )}
              <AdRow
                ad={ad}
                locked={!meets(pick, FEATURES.find((f) => f.id === ad.id)!.tier)}
                onOpen={() => setOpen(i)}
              />
            </Box>
          ))}
        </Box>

        {/* Who else is already on it. Three figures, no testimonial — the claim
            a school app can actually make is how many schools use it. */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '14px' }}>
          {[
            [PROOF.students, 'okuwçy'],
            [PROOF.schools, 'mekdep'],
            [PROOF.teachers, 'mugallym'],
          ].map(([value, label]) => (
            <Box key={label} sx={{
              bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '13px 8px', textAlign: 'center',
            }}>
              <Typography sx={{
                fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              }}>{value}</Typography>
              <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ height: '10px' }} />
        <StickyFooter>
          <BalanceNote price={term === 'year' ? tier.yearly : tier.monthly} />
          <BuyButton tier={tier} term={term} onBuy={() => buy(tier, term)} />
          {premium ? (
            <Typography sx={{ fontSize: 12, color: tokens.inkMuted, textAlign: 'center', mt: '8px' }}>
              Häzirki abunaň {PLAN.until} çenli · uzaldylýar
            </Typography>
          ) : <TrustLine />}
        </StickyFooter>
      </Box>
    </>
  );
}
