import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import { CheckIcon, LockIcon, SparkleIcon } from '../components/Icons';
import { SectionLabel, StickyFooter, SubPage } from '../components/Ui';
import {
  FEATURES, TIERS, listYearly, meets, savePct, setTier, usePrefs,
} from '../state/prefs';
import type { Tier, TierId } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Tariff page. Two decisions — how long, and which plan — then one action, so
 * the page carries only what serves them: what it costs, and what is behind
 * the wall.
 *
 * It used to also carry a stat strip, four highlight tiles and two reviews —
 * three more blocks all saying "Premium is good", two of them repeating rows of
 * the table underneath. Selling the same point four times reads as pressure,
 * and it buried the price choice below three screens of scrolling.
 *
 * Term comes first and is deliberately the *small* control: it is the cheap
 * decision, and settling it lets both plan cards show one price each instead of
 * four numbers competing. The table is the honest part and gets to be the
 * content: every row is a whole feature, so a lock means the feature is not in
 * that column's plan — no hedging text like "hepdede 1" in a cell that is meant
 * to be read at a glance.
 */

type Term = 'month' | 'year';

const COLS: TierId[] = ['free', 'gorelde', 'zehin'];
const COL_LABEL: Record<TierId, string> = { free: 'Mugt', gorelde: 'Göreldeli', zehin: 'Zehinli' };

const price = (t: Tier, term: Term) => (term === 'month' ? t.monthly : t.yearly);

const Mark = ({ on }: { on: boolean }) => (
  <Box
    role="img"
    aria-label={on ? 'bar' : 'ýok'}
    sx={{
      display: 'grid', placeItems: 'center',
      color: on ? tokens.greenDeep : tokens.inkDisabled,
    }}
  >
    {on ? <CheckIcon size={17} /> : <LockIcon size={15} />}
  </Box>
);

/* One plan, priced for the term already chosen. */
function PlanCard({ tier, term, on, onPick }: {
  tier: Tier; term: Term; on: boolean; onPick: () => void;
}) {
  const p = price(tier, term);
  const list = listYearly(tier);
  return (
    <ButtonBase
      onClick={onPick}
      aria-pressed={on}
      aria-label={`${tier.name} nyrhnamasy, ${p} TMT ${term === 'month' ? 'aýda' : 'ýylda'}`}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%',
        p: '14px 15px', textAlign: 'left', justifyContent: 'flex-start',
        borderRadius: `${tokens.rCard}px`,
        bgcolor: on ? tokens.blueTint : tokens.surface,
        border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
        transition: 'background .15s ease',
      }}
    >
      <Box aria-hidden sx={{
        width: 22, height: 22, borderRadius: '50%', flex: 'none', mt: '2px',
        border: `2px solid ${on ? tokens.blue : tokens.inkDisabled}`,
        display: 'grid', placeItems: 'center', color: '#fff',
        bgcolor: on ? tokens.blue : 'transparent',
      }}>{on && <CheckIcon size={12} />}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, flex: 1 }} noWrap>{tier.name}</Typography>
          <Typography sx={{
            fontSize: 18, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
            color: on ? tokens.blueText : tokens.ink,
          }}>{p} TMT</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', mt: '2px' }}>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, flex: 1, lineHeight: 1.4 }}>
            {tier.blurb}
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.inkMuted, flex: 'none' }}>
            {term === 'month' ? 'aýda' : 'ýylda'}
          </Typography>
        </Box>

        {/* The yearly saving is shown against the price it is a discount from,
            and that list price is twelve months of the figure above — so the
            claim cannot contradict the number beside it. */}
        {term === 'year' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', mt: '9px' }}>
            <Typography sx={{
              fontSize: 12.5, color: tokens.inkMuted, textDecoration: 'line-through',
              fontVariantNumeric: 'tabular-nums',
            }}>{list} TMT</Typography>
            <Box sx={{
              px: '8px', height: 20, borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.greenTint, color: tokens.greenText, fontSize: 11, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>{savePct(tier)}% arzan</Box>
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

export function UpgradeScreen({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const { tier: current, premium } = usePrefs();
  const [term, setTerm] = useState<Term>('year');
  const [pick, setPick] = useState<Tier['id']>('zehin');

  const chosen = TIERS.find((t) => t.id === pick)!;

  const buy = () => {
    setTier(pick);
    toast(premium && current === pick ? 'Abuna uzaldyldy' : `${chosen.name} işjeňleşdirildi 🎉`);
    onBack();
  };

  return (
    <SubPage title="Nyrhnamalar" onBack={onBack}>
      {/* One short hero. It used to read "Okuwyň doly güýji" over a user count —
          a boast about the product and a boast about its size, neither of which
          says what the reader gets. The line now names the benefit in the
          reader's terms: modern tools, better results. */}
      <Box sx={{
        mt: '14px', borderRadius: `${tokens.rCard}px`, p: `18px ${tokens.padCard}`,
        background: `linear-gradient(155deg, ${tokens.blue}, ${tokens.bluePress})`,
        color: '#fff', boxShadow: tokens.shadowFab,
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <Box aria-hidden sx={{
          width: 46, height: 46, borderRadius: `${tokens.rRow}px`, flex: 'none',
          bgcolor: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center',
        }}><SparkleIcon size={24} /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.3px', lineHeight: 1.25 }}>
            Döwrebap tehnologiýa bilen netijeli bilim al
          </Typography>
        </Box>
      </Box>

      {/* the cheap decision first, so each plan card shows one price */}
      <SectionLabel>Möhlet</SectionLabel>
      <Box sx={{
        display: 'flex', bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, p: '4px',
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

      <SectionLabel>Nyrhnama</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TIERS.map((t) => (
          <PlanCard key={t.id} tier={t} term={term} on={t.id === pick} onPick={() => setPick(t.id)} />
        ))}
      </Box>

      {/* the whole argument, in one table */}
      <SectionLabel>Deňeşdirme</SectionLabel>
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '4px 13px 10px' }}>
        <Box sx={{
          display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 42px 58px 50px', alignItems: 'center',
          py: '10px', borderBottom: `1px solid ${tokens.divider}`,
        }}>
          <Box />
          {COLS.map((c) => (
            <Typography key={c} sx={{
              fontSize: 11, fontWeight: 700, textAlign: 'center', letterSpacing: '-.1px',
              color: c === pick ? tokens.blueText : tokens.inkMuted,
            }}>{COL_LABEL[c]}</Typography>
          ))}
        </Box>
        {FEATURES.map((f, i) => (
          <Box key={f.id} sx={{
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 42px 58px 50px',
            alignItems: 'center', gap: '4px', minHeight: 44,
            borderBottom: i < FEATURES.length - 1 ? `1px solid ${tokens.dividerSoft}` : 'none',
          }}>
            <Typography sx={{ fontSize: 13, color: tokens.ink2, pr: '6px', lineHeight: 1.35 }}>
              {f.label}
            </Typography>
            {COLS.map((c) => <Mark key={c} on={meets(c, f.tier)} />)}
          </Box>
        ))}
      </Box>

      <Box sx={{ height: '10px' }} />
      <StickyFooter>
        <Button fullWidth variant="contained" disableElevation onClick={buy}>
          {chosen.name} — {price(chosen, term)} TMT
        </Button>
        <Typography sx={{ fontSize: 11.5, color: tokens.inkMuted, textAlign: 'center', mt: '8px' }}>
          Ilkinji 7 gün mugt · islendik wagt ýatyrylýar
        </Typography>
      </StickyFooter>
    </SubPage>
  );
}
