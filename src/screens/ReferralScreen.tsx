import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import {
  CheckIcon, ClockIcon, CoinIcon, ShareIcon, ShopIcon, UsersIcon, WalletIcon,
} from '../components/Icons';
import {
  IconBadge, RowChevron, SectionLabel, SheetDrawer, StatTile, SubPage, SurfaceRow,
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

/*
 * The note's palette is the one thing in this file that does not come from
 * `tokens`, and deliberately: it answers to the 2012 five-manat note rather
 * than to the app. Colour is most of what identifies a denomination to someone
 * who handles it every day, so a token green or a token tan both read as
 * generic play money. These are the note's own inks — khaki paper, the olive
 * field, the lime and violet bands down the right, rust ornament.
 */
const NOTE = {
  paper: '#DFD9AD',
  field: '#C9D68A',
  lime: '#C8D14F',
  violet: '#8A62A0',
  rust: '#A24B33',
  cream: '#F0E9CC',
  ink: '#463521',
  emblem: '#2E7A4E',
  red: '#B8402C',
};

/* ---------------- illustration ----------------
 *
 * The reward, drawn: a five-manat note, a second one behind it, two coins.
 *
 * Three things were wrong with the version before this. The note was a
 * near-facsimile — serials, blind marks, microtext, a cameo silhouette — all
 * rendered about 110px wide, where every one of those details collapses into a
 * khaki smudge. Then it was simplified but left small, sharing the frame with
 * two flat avatar circles and a dashed arc: a busy scene in which nothing was
 * the subject. And the note itself had no *structure* — a coloured rectangle
 * with a blob in the middle is not read as money.
 *
 * So: the note is the subject and it fills the frame. It is drawn the way a
 * note is actually composed — an engraved inner frame, one big numeral with
 * the word beneath it, a portrait oval, the emblem, the göl band and the two
 * colour strips down the right edge. Nine elements, all of them structural,
 * none of them smaller than the word MANAT. The palette stays the 2012 note's
 * own rather than the app's tokens, because the ink is most of the
 * recognition, and the numeral is `PLAN.referralReward` so the drawing cannot
 * contradict the offer written under it.
 */
function Note({ id }: { id: string }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect width="150" height="76" rx="6" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="150" height="76" fill={NOTE.paper} />
        {/* the two colour strips down the right edge */}
        <rect x="118" y="0" width="22" height="76" fill={NOTE.lime} />
        <rect x="140" y="0" width="10" height="76" fill={NOTE.violet} />
        {/* rust ornament along the top */}
        <rect x="0" y="0" width="118" height="7" fill={NOTE.rust} />
        {/* göller down the lime band */}
        {[16, 38, 60].map((cy) => (
          <path key={cy} d={`M129 ${cy - 6}L135 ${cy}L129 ${cy + 6}L123 ${cy}Z`}
            fill={NOTE.emblem} opacity=".3" />
        ))}
        {/* the portrait oval — a vignette, not a face: at this size a likeness
            is worse than the empty engraved oval a reader's eye expects */}
        <ellipse cx="97" cy="41" rx="17" ry="24" fill={NOTE.field} opacity=".55" />
        <ellipse cx="97" cy="41" rx="17" ry="24" fill="none" stroke={NOTE.ink} strokeWidth=".8" opacity=".3" />
        <ellipse cx="97" cy="41" rx="13" ry="19.5" fill="none" stroke={NOTE.ink} strokeWidth=".6" opacity=".18" />
        {/* the state emblem, as a göl */}
        <g transform="translate(63 41)">
          <path d="M0-12 8.5-8.5 12 0 8.5 8.5 0 12-8.5 8.5-12 0-8.5-8.5Z" fill={NOTE.emblem} />
          <path d="M0-6.6 4.7-4.7 6.6 0 4.7 4.7 0 6.6-4.7 4.7-6.6 0-4.7-4.7Z" fill={NOTE.cream} opacity=".9" />
          <circle r="2.8" fill={NOTE.red} />
        </g>
        {/* the denomination and the one word on the note */}
        <text x="27" y="46" textAnchor="middle" fontSize="30" fontWeight="700" fill={NOTE.ink}>
          {PLAN.referralReward}
        </text>
        <text x="27" y="58" textAnchor="middle" fontSize="8" fontWeight="700"
          letterSpacing=".7" fill={NOTE.ink} opacity=".75">MANAT</text>
        <rect x="12" y="62" width="30" height="1.4" fill={NOTE.ink} opacity=".25" />
        {/* the engraved inner frame */}
        <rect x="5" y="5" width="140" height="66" rx="4"
          fill="none" stroke={NOTE.ink} strokeWidth="1" opacity=".2" />
      </g>
      <rect width="150" height="76" rx="6" fill="none" stroke={NOTE.ink} strokeWidth="1.2" opacity=".25" />
    </>
  );
}

const Coin = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={tokens.orange} />
    <circle r={r * 0.66} fill="none" stroke="#fff" strokeWidth="1.6" opacity=".85" />
  </g>
);

function ReferralArt() {
  return (
    <Box
      component="svg"
      viewBox="0 0 300 150"
      role="img"
      aria-label={`Dostuňy çagyr — her tölegli dost üçin ${PLAN.referralReward} manat bonus`}
      sx={{ width: '100%', maxWidth: 300, display: 'block', mx: 'auto' }}
    >
      <ellipse cx="150" cy="134" rx="104" ry="11" fill={tokens.blueSoft} opacity=".55" />

      {/* the second note, behind — depth without another subject */}
      <g transform="translate(96 22) rotate(-11 75 38)" opacity=".8">
        <Note id="note-back" />
      </g>
      <g transform="translate(74 30) rotate(-2 75 38)">
        <Note id="note-front" />
      </g>

      <Coin x={48} y={104} r={17} />
      <Coin x={74} y={116} r={12} />

      <path d="M252 30l3 7.2 7.2 3-7.2 3-3 7.2-3-7.2-7.2-3 7.2-3z"
        fill={tokens.orange} opacity=".7" />
      <circle cx="40" cy="52" r="5" fill={tokens.teal} opacity=".35" />
      <circle cx="268" cy="96" r="4" fill={tokens.blue} opacity=".3" />
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

      {/* What you have, directly under what is on offer — the page's own
          answer to the headline above it. The balance used to sit at the foot,
          below the friend list, with a duplicate "Bonus" figure in a stat tile
          up here: the same number twice, and the real one last.

          The balance and the two things it can become. and the two things it can become. No "withdraw": the bonus
          is credit, and a disabled payout button with a minimum under it would
          promise a bank transfer that is not on offer. Two real destinations
          beat one blocked one. */}
      <Box sx={{
        mt: '12px', bgcolor: tokens.greenTint, borderRadius: `${tokens.rCard}px`,
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
      {/* the counts sit with the list they count, not in a strip at the top of
          the page describing something three screens below */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mb: '12px' }}>
        <StatTile value={`${paid}`} label="Tölegli dost" color={tokens.blueText} />
        <StatTile value={`${pending}`} label="Garaşylýar" color={tokens.orangeText} />
      </Box>
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

      <Button
        fullWidth variant="text" onClick={() => setRules(true)}
        sx={{ mt: '14px', mb: '4px', fontSize: 14, fontWeight: 700 }}
      >Şertler bilen tanyş</Button>

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
      <RowChevron />
    </ButtonBase>
  );
}
