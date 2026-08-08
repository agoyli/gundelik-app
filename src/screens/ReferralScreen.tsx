import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import {
  CheckIcon, ClockIcon, CoinIcon, ShareIcon, ShopIcon, UsersIcon, WalletIcon,
} from '../components/Icons';
import {
  IconBadge, SectionLabel, SheetDrawer, StatTile, SubPage, SurfaceRow,
} from '../components/Ui';
import { fmtDate } from '../lib/date';
import { PLAN } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Dostuňy çagyr — the referral programme.
 *
 * The page has to answer three questions in order, so it is laid out in that
 * order: what do I get (illustration + the number), what do I do (code +
 * share), and did it work (balance + the list of friends with their state).
 * Everything is drawn from `PLAN.referralReward`, so the promised amount can
 * never disagree with itself between the hero, the steps and the rules.
 *
 * The bonus is **credit, not cash**: it pays for the subscription or buys
 * school supplies at partner shops. That is a deliberate product choice and it
 * changes the page — there is no "withdraw" button and no payout minimum,
 * because a balance that can only be spent has no threshold to clear. Saying
 * so plainly beats letting a reader assume a bank transfer is coming.
 */

/*
 * A code is read aloud, texted, and typed by someone else — so it is a word
 * plus three digits, not a hash. "ALTYN-472" survives a phone call; "a7Kq2xB"
 * does not. The word list avoids characters that collide when spoken or
 * written (no 0/O, 1/I), and the code is generated once per session rather
 * than hardcoded, so the mock never implies every user shares one code.
 */
const CODE_WORDS = [
  'ALTYN', 'DURNA', 'GÜNEŞ', 'ÝYLDYZ', 'DERÝA',
  'ZÜMRAT', 'MERJEN', 'SÄHRA', 'ARZUW', 'NAGYŞ',
];

const makeCode = () => {
  const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  const digits = 100 + Math.floor(Math.random() * 900);
  return `${word}-${digits}`;
};

const CODE = makeCode();

/* Where the bonus can actually go. Named shops, because "partner stores" is a
   promise and a list is a fact. */
const PARTNERS = [
  { id: 'bilim', name: 'Bilim dükany', note: 'Depder, ruçka, mekdep esbaplary' },
  { id: 'miras', name: 'Miras kitap', note: 'Okuw kitaplary we edebiýat' },
  { id: 'nesil', name: 'Ýaş nesil', note: 'Sumkalar we mekdep formasy' },
  { id: 'aydyn', name: 'Aýdyň market', note: 'Kanselýariýa harytlary' },
];

type FriendState = 'paid' | 'trial' | 'invited';

const FRIENDS: { id: string; name: string; when: string; state: FriendState }[] = [
  { id: 'f1', name: 'A. Kerim', when: '2026-02-03', state: 'paid' },
  { id: 'f2', name: 'G. Aýna', when: '2026-01-28', state: 'paid' },
  { id: 'f3', name: 'S. Merdan', when: '2026-01-25', state: 'trial' },
  { id: 'f4', name: 'B. Şirin', when: '2026-01-19', state: 'paid' },
  { id: 'f5', name: 'O. Jemal', when: '2026-01-14', state: 'invited' },
];

const FRIEND_STATE: Record<FriendState, { label: string; tint: string; ink: string; icon: React.ReactNode }> = {
  paid: { label: 'Tölendi', tint: tokens.greenTint, ink: tokens.greenText, icon: <CheckIcon size={16} /> },
  trial: { label: 'Synag möhleti', tint: tokens.orangeTint, ink: tokens.orangeText, icon: <ClockIcon /> },
  invited: { label: 'Garaşylýar', tint: tokens.surfacePress, ink: tokens.ink3, icon: <UsersIcon size={16} /> },
};

const STEPS = [
  { title: 'Kody paýlaş', note: 'Dostuňa kodyňy ýa-da salgyny iber.' },
  { title: 'Dostuň nyrhnama alýar', note: 'Ol kod bilen abuna ýazylýar — özi hem 7 gün mugt alýar.' },
  {
    title: `${PLAN.referralReward} manat bonus`,
    note: 'Töleg geçen badyna balansyňa goşulýar — abuna tölegine ýa-da hyzmatdaş dükanlarda harçlanýar.',
  },
];

/* ---------------- illustration ----------------
   Drawn rather than imported: a bitmap would not follow the token palette, and
   this scene is the one place in the app that gets to be playful. Two circles,
   one dashed hand-off, coins landing in a wallet — the whole offer in a glance. */
function ReferralArt() {
  return (
    <Box
      component="svg"
      viewBox="0 0 320 176"
      role="img"
      aria-label={`Dostuňy çagyr — her tölegli dost üçin ${PLAN.referralReward} manat bonus`}
      sx={{ width: '100%', maxWidth: 340, display: 'block', mx: 'auto' }}
    >
      {/* soft ground */}
      <ellipse cx="160" cy="150" rx="120" ry="16" fill={tokens.blueSoft} opacity=".55" />

      {/* dashed hand-off arc */}
      <path d="M96 92 C 130 44, 190 44, 224 92" fill="none" stroke={tokens.blue}
        strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 8" opacity=".65" />

      {/* coins travelling along the arc */}
      <g>
        <circle cx="139" cy="60" r="11" fill={tokens.orange} />
        <circle cx="139" cy="60" r="6.5" fill="none" stroke="#fff" strokeWidth="1.4" strokeDasharray="2 2" />
        <circle cx="181" cy="60" r="8" fill={tokens.orange} opacity=".75" />
        <circle cx="160" cy="47" r="6" fill={tokens.orange} opacity=".5" />
      </g>

      {/* sender */}
      <g>
        <circle cx="78" cy="100" r="34" fill={tokens.blue} />
        <circle cx="78" cy="90" r="12" fill="#fff" />
        <path d="M58 122a20 20 0 0 1 40 0z" fill="#fff" />
      </g>

      {/* receiver */}
      <g>
        <circle cx="242" cy="100" r="34" fill={tokens.teal} />
        <circle cx="242" cy="90" r="12" fill="#fff" />
        <path d="M222 122a20 20 0 0 1 40 0z" fill="#fff" />
      </g>

      {/* the reward, landing */}
      <g>
        <rect x="128" y="96" width="64" height="46" rx="12" fill="#fff" stroke={tokens.divider} strokeWidth="1.5" />
        <text x="160" y="126" textAnchor="middle" fontSize="20" fontWeight="700" fill={tokens.orangeText}>
          {PLAN.referralReward} TMT
        </text>
      </g>

      {/* sparkles */}
      <path d="M40 54l2.6 6.4L49 63l-6.4 2.6L40 72l-2.6-6.4L31 63l6.4-2.6z" fill={tokens.orange} opacity=".8" />
      <path d="M280 42l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={tokens.teal} opacity=".7" />
      <circle cx="292" cy="112" r="4" fill={tokens.blue} opacity=".35" />
      <circle cx="28" cy="112" r="5" fill={tokens.teal} opacity=".3" />
    </Box>
  );
}

export function ReferralScreen({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const [rules, setRules] = useState(false);
  const [shops, setShops] = useState(false);

  const paid = FRIENDS.filter((f) => f.state === 'paid').length;
  const pending = FRIENDS.length - paid;
  const earned = paid * PLAN.referralReward;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      toast('Kod bufere göçürildi');
    } catch {
      toast(`Kodyň: ${CODE}`);
    }
  };

  const share = async () => {
    const text = `Gündelik programmasyna goşul! Meniň kodym bilen 7 gün mugt synag al: ${CODE}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Gündelik', text });
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    void copy();
  };

  return (
    <SubPage title="Dostuňy çagyr" onBack={onBack}>
      {/* hero: the offer, drawn */}
      <Box sx={{
        mt: '12px', bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`,
        p: '18px 14px 20px', textAlign: 'center',
      }}>
        <ReferralArt />
        <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.3px', mt: '10px' }}>
          Her tölegli dost — {PLAN.referralReward} manat bonus
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.5, mt: '6px', px: '10px' }}>
          Dostuň kodyň bilen abuna ýazylsa, balansyňa {PLAN.referralReward} manat düşýär.
          Ony abuna tölegine ýa-da hyzmatdaş dükanlarda mekdep harytlaryna harçlaýarsyň.
        </Typography>
      </Box>

      {/* did it work */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={`${earned} TMT`} label="Bonus" color={tokens.greenText} />
        <StatTile value={`${paid}`} label="Tölegli dost" color={tokens.blueText} />
        <StatTile value={`${pending}`} label="Garaşylýar" color={tokens.orangeText} />
      </Box>

      {/* what to do */}
      <SectionLabel>Kodyň</SectionLabel>
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
      }}>
        <ButtonBase
          onClick={() => void copy()}
          aria-label={`Kody göçür: ${CODE}`}
          sx={{
            width: '100%', height: 56, borderRadius: `${tokens.rRow}px`,
            border: `1.5px dashed ${tokens.blue}`, bgcolor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            '&:active': { bgcolor: tokens.blueTint },
          }}
        >
          <Typography sx={{
            fontSize: 22, fontWeight: 700, letterSpacing: '2px', color: tokens.blueText,
            fontVariantNumeric: 'tabular-nums',
          }}>{CODE}</Typography>
        </ButtonBase>
        {/* no "tap to copy" hint — the Göçür button below already says it */}
        <Box sx={{ display: 'flex', gap: '10px', mt: '14px' }}>
          <Button
            fullWidth disableElevation onClick={() => void copy()}
            sx={{ bgcolor: tokens.blueTint, color: tokens.blueText }}
          >
            Göçür
          </Button>
          <Button
            fullWidth variant="contained" disableElevation onClick={() => void share()}
            startIcon={<ShareIcon size={16} />}
          >
            Paýlaş
          </Button>
        </Box>
      </Box>

      {/* how it works */}
      <SectionLabel>Nähili işleýär</SectionLabel>
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        {STEPS.map((s, i) => (
          <Box key={s.title} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Box aria-hidden sx={{
              width: 26, height: 26, borderRadius: '50%', flex: 'none',
              bgcolor: i === STEPS.length - 1 ? tokens.orangeTint : '#fff',
              color: i === STEPS.length - 1 ? tokens.orangeText : tokens.blueText,
              display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
            }}>{i + 1}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{s.title}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '2px', lineHeight: 1.45 }}>{s.note}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* who came */}
      <SectionLabel>{`Çagyrylan dostlar · ${FRIENDS.length}`}</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {FRIENDS.map((f) => {
          const st = FRIEND_STATE[f.state];
          return (
            <SurfaceRow
              key={f.id}
              icon={<IconBadge bg={st.tint} color={st.ink} size={44}>{st.icon}</IconBadge>}
              label={f.name}
              labelSx={{ fontSize: 15, fontWeight: 500 }}
              sub={`${fmtDate(f.when)} · ${st.label}`}
              end={(
                <Typography sx={{
                  fontSize: 15, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
                  color: f.state === 'paid' ? tokens.greenText : tokens.inkDisabled,
                }}>
                  {f.state === 'paid' ? `+${PLAN.referralReward}` : '—'}
                </Typography>
              )}
            />
          );
        })}
      </Box>

      {/* The balance and the two things it can become. No "withdraw": the bonus
          is credit, and a disabled payout button with a minimum under it would
          promise a bank transfer that is not on offer. Two real destinations
          beat one blocked one. */}
      <Box sx={{
        mt: '16px', bgcolor: tokens.greenTint, borderRadius: `${tokens.rCard}px`,
        p: `16px ${tokens.padCard}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <IconBadge bg="#fff" color={tokens.greenText} size={44}><WalletIcon size={22} /></IconBadge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, color: tokens.greenText, fontWeight: 600 }}>Bonus balansyň</Typography>
            <Typography sx={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-.3px', fontVariantNumeric: 'tabular-nums',
            }}>{earned} TMT</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: '10px', mt: '14px' }}>
          <Button
            fullWidth disableElevation
            disabled={earned === 0}
            onClick={() => toast('Bonus abuna tölegine ulanyldy')}
            sx={{
              bgcolor: '#fff', color: tokens.greenText,
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,.55)', color: tokens.inkMuted },
            }}
          >
            Abuna töle
          </Button>
          <Button
            fullWidth disableElevation
            disabled={earned === 0}
            onClick={() => setShops(true)}
            sx={{
              bgcolor: '#fff', color: tokens.greenText,
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,.55)', color: tokens.inkMuted },
            }}
          >
            Dükanlar
          </Button>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 12, color: tokens.ink3, textAlign: 'center', mt: '8px' }}>
        Bonus nagt çykarylmaýar — abuna tölegine ýa-da hyzmatdaş dükanlarda harçlanýar
      </Typography>

      <Box sx={{ display: 'grid', placeItems: 'center', pt: '10px', pb: '6px' }}>
        <ButtonBase
          onClick={() => setRules(true)}
          sx={{ height: 44, px: '14px', borderRadius: `${tokens.rPill}px`, color: tokens.blueText, fontSize: 13.5, fontWeight: 600 }}
        >
          Şertler bilen tanyş
        </ButtonBase>
      </Box>

      <SheetDrawer open={shops} onClose={() => setShops(false)}>
        <Typography variant="h2">Hyzmatdaş dükanlar</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: '4px' }}>
          Kassada programmadaky bonus kodyňy görkez
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '16px' }}>
          {PARTNERS.map((sh) => (
            <SurfaceRow
              key={sh.id}
              icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={44}><ShopIcon size={22} /></IconBadge>}
              label={sh.name}
              labelSx={{ fontSize: 15, fontWeight: 600 }}
              sub={sh.note}
              onClick={() => { setShops(false); toast(`${sh.name} — bonus kody kassada görkezilýär`); }}
            />
          ))}
        </Box>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth onClick={() => setShops(false)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        </Box>
      </SheetDrawer>

      <SheetDrawer open={rules} onClose={() => setRules(false)}>
        <Typography variant="h2">Programmanyň şertleri</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '14px' }}>
          {[
            `Her tölegli dost üçin ${PLAN.referralReward} manat berilýär — çagyrylýan dostuň sany çäklendirilmedik.`,
            'Bonus dostuň ilkinji tölegi geçenden soň, 24 sagadyň dowamynda hasabyňa düşýär.',
            'Synag möhletindäki dost üçin bonus töleg geçýänçä garaşylýar diýlip görkezilýär.',
            'Bonus nagt pula öwrülmeýär we karta çykarylmaýar.',
            'Ony abuna tölegine ýa-da hyzmatdaş dükanlarda mekdep harytlaryna harçlap bolýar.',
            'Öz-özüňi çagyrmak ýa-da galp hasaplar programmadan çykarylmaga sebäp bolýar.',
          ].map((t, i) => (
            <Box key={t} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Box aria-hidden sx={{
                width: 20, height: 20, borderRadius: '50%', flex: 'none', mt: '1px',
                bgcolor: tokens.surface, color: tokens.ink2, display: 'grid', placeItems: 'center',
                fontSize: 11, fontWeight: 700,
              }}>{i + 1}</Box>
              <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.5 }}>{t}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: '18px' }}>
          <Button fullWidth variant="contained" disableElevation onClick={() => setRules(false)}>Düşnükli</Button>
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* Entry row for Profil — states the reward, so the row is an offer, not a label */
export function ReferralRow({ onClick }: { onClick: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Dostuňy çagyr, her tölegli dost üçin ${PLAN.referralReward} manat bonus`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
        bgcolor: tokens.orangeTint, borderRadius: `${tokens.rCard}px`, p: '14px 15px',
        transition: 'filter .15s ease', '&:active': { filter: 'brightness(.97)' },
      }}
    >
      <IconBadge bg="#fff" color={tokens.orangeText} size={44}><CoinIcon size={22} /></IconBadge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15.5, fontWeight: 700 }}>Dostuňy çagyr</Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink2, mt: '2px' }}>
          Her tölegli dost üçin {PLAN.referralReward} manat bonus
        </Typography>
      </Box>
      <Box aria-hidden sx={{
        flex: 'none', px: '12px', height: 32, borderRadius: `${tokens.rPill}px`,
        bgcolor: tokens.orangeText, color: '#fff', fontSize: 13, fontWeight: 700,
        display: 'grid', placeItems: 'center',
      }}>Çagyr</Box>
    </ButtonBase>
  );
}
