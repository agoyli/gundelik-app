import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertIcon, BellIcon, CardIcon, CheckIcon, ChevronIcon, ComputerIcon, GlobeIcon,
  HistoryIcon, LockIcon, LogoutIcon, PencilIcon, QuestionOutlineIcon, ShieldIcon, SoundIcon,
  SparkleIcon, TrashIcon, UsersIcon, WalletIcon,
} from '../components/Icons';
import {
  EmptyState, Field, IconBadge, RowEnd, SectionLabel, SheetDrawer,
  StickyFooter, SubPage, SurfaceRow, SwitchRow,
} from '../components/Ui';
import {
  ENTRY, LANGS, PLAN, TIERS, langLabel, savePct, setPref, setTier, tierName, tierOf, usePrefs,
} from '../state/prefs';
import type { TierId } from '../state/prefs';
import { absDate } from '../lib/date';
import type { BoolPref } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Sazlamalar — the account tree behind the Profil header gear.
 * Every row that used to be a toast now lands on a real page; the leaves that
 * genuinely need a backend (paying, changing a password) end in one confirming
 * sheet rather than a silent dead end.
 */

type Toast = (m: string) => void;

/* Preferences, the plan and the language list all live in ../state/prefs so the
   diary, the paywall and this tree read one source of truth. */

/* ---------------- shared bits ---------------- */

const rowIcon = (icon: ReactNode, tint: string, color: string) => (
  <IconBadge bg={tint} color={color} size={44}>{icon}</IconBadge>
);

/* The badge for rows with no accent of their own. It must NOT be `surface` —
   that is the SurfaceRow's own fill, so the squircle disappears and the row
   shows a bare floating icon next to neighbours that have a container. */
const NEUTRAL = { tint: tokens.surfacePress, ink: tokens.ink2 };

const LABEL_SX = { fontSize: 15, fontWeight: 500 };

const RowGroup = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</Box>
);

/* ---------------- Profil maglumatlary ---------------- */

export function ProfileEditScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [name, setName] = useState('Muhammedow Muhammet');
  const [phone, setPhone] = useState('+993 65 12 34 56');
  const [email, setEmail] = useState('m.muhammet@mekdep.tm');
  const [birth, setBirth] = useState('14.05.2011');

  const save = () => { toast('Maglumatlar ýatda saklandy'); onBack(); };

  return (
    <SubPage title="Profil maglumatlary" onBack={onBack}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', pt: '16px' }}>
        <Box aria-hidden sx={{
          width: 88, height: 88, borderRadius: '50%',
          background: `linear-gradient(150deg, #5B93F5 0%, ${tokens.blue} 70%)`,
          color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 700,
        }}>MM</Box>
        <Button
          disableElevation
          onClick={() => toast('Surat üýtgetmek tiz wagtda elýeterli bolar')}
          sx={{ height: 36, px: '16px', bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5 }}
        >
          Suraty çalyş
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '22px' }}>
        <Field label="Ady we familiýasy" value={name} onChange={setName} />
        <Field label="Doglan senesi" value={birth} onChange={setBirth} placeholder="gg.aa.ýýýý" />
        <Field label="Telefon" value={phone} onChange={setPhone} type="tel" />
        <Field label="E-poçta" value={email} onChange={setEmail} type="email" />
        <Field label="Synp" value="8-nji «B» synp" note="Synpy we mekdebi mekdep dolandyrýar." />
        <Field label="Mekdep" value="16-njy orta mekdep" note="Üýtgetmek üçin synp ýolbaşçyňa ýüz tut." />
      </Box>

      <StickyFooter>
        <Button fullWidth variant="contained" disableElevation onClick={save}>Ýatda sakla</Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Bildirişler ---------------- */

export function NotificationsScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const p = usePrefs();
  /* the master switch gates the rest — dimmed and inert, not silently ignored */
  const off = !p.notify;

  return (
    <SubPage title="Bildirişler" onBack={onBack}>
      <Box sx={{ pt: '14px' }}>
        <SwitchRow
          icon={rowIcon(<BellIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Bildirişler"
          on={p.notify}
          onToggle={() => setPref('notify', !p.notify)}
        />
      </Box>

      <SectionLabel>Nämeler barada</SectionLabel>
      <RowGroup>
        {([
          ['nGrades', 'Täze bahalar'],
          ['nHw', 'Öý işi'],
          ['nLessons', 'Sapak ýatlatmasy'],
          ['nContests', 'Bäsleşikler'],
          ['nNews', 'Mekdep habarlary'],
        ] as [BoolPref, string][]).map(([key, label]) => (
          <SwitchRow
            key={key}
            label={label}
            on={!off && p[key]}
            disabled={off}
            onToggle={() => setPref(key, !p[key])}
          />
        ))}
      </RowGroup>

      <SectionLabel>Rejim</SectionLabel>
      <RowGroup>
        <SwitchRow
          label="Ümsüm sagatlar · 22:00 – 07:00"
          on={!off && p.quiet}
          disabled={off}
          onToggle={() => setPref('quiet', !p.quiet)}
        />
        <SwitchRow
          icon={rowIcon(<SoundIcon size={22} />, tokens.orangeTint, tokens.orangeText)}
          label="Ses"
          on={!off && p.sound}
          disabled={off}
          onToggle={() => setPref('sound', !p.sound)}
        />
        <SwitchRow
          label="Titremek"
          on={!off && p.haptics}
          disabled={off}
          onToggle={() => setPref('haptics', !p.haptics)}
        />
      </RowGroup>

      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '16px' }}>
        Bahalar we öý işi barada bildirişler ene-ataňa hem barýar.
      </Typography>

      <Box sx={{ pt: '12px' }}>
        <Button
          fullWidth disableElevation
          onClick={() => toast('Synag bildirişi ugradyldy')}
          sx={{ bgcolor: tokens.blueTint, color: tokens.blueText }}
        >
          Synag bildirişini ugrat
        </Button>
      </Box>
    </SubPage>
  );
}

/* ---------------- Gizlinlik we howpsuzlyk ---------------- */

const DEVICES = [
  { id: 'phone', name: 'iPhone 13', sub: 'Aşgabat · şu enjam', current: true },
  { id: 'tab', name: 'Samsung Tab A8', sub: 'Aşgabat · 3 gün öň', current: false },
];

export function SecurityScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const p = usePrefs();
  const [pwd, setPwd] = useState(false);

  return (
    <SubPage title="Gizlinlik we howpsuzlyk" onBack={onBack}>
      <SectionLabel>Girmek</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<LockIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Paroly üýtget"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => setPwd(true)}
        />
        <SwitchRow
          icon={rowIcon(<ShieldIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Barmak yzy bilen girmek"
          on={p.biometry}
          onToggle={() => setPref('biometry', !p.biometry)}
        />
        <SwitchRow
          label="Iki basgançakly tassyklama"
          on={p.twoFactor}
          onToggle={() => {
            setPref('twoFactor', !p.twoFactor);
            toast(p.twoFactor ? 'Iki basgançakly tassyklama ýapyldy' : 'Telefonyňa kod ugradyldy');
          }}
        />
      </RowGroup>

      <SectionLabel>Aktiw enjamlar</SectionLabel>
      <RowGroup>
        {DEVICES.map((d) => (
          <SurfaceRow
            key={d.id}
            icon={rowIcon(<ComputerIcon size={22} />, d.current ? tokens.greenTint : NEUTRAL.tint,
              d.current ? tokens.greenText : NEUTRAL.ink)}
            label={d.name}
            labelSx={LABEL_SX}
            sub={d.sub}
            end={d.current ? (
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.greenText }}>Häzir</Typography>
            ) : (
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.redText }}>Çykar</Typography>
            )}
            onClick={d.current ? undefined : () => toast('Enjam hasapdan çykaryldy')}
          />
        ))}
      </RowGroup>

      <SectionLabel>Maglumatlarym</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<UsersIcon size={22} />, tokens.tealTint, tokens.tealText)}
          label="Profilimi kim görýär"
          labelSx={LABEL_SX}
          end={<RowEnd value="Synpdaşlarym" />}
          onClick={() => toast('Gizlinlik derejesi tiz wagtda')}
        />
        <SurfaceRow
          icon={rowIcon(<HistoryIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Maglumatlarymy ýükle"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => toast('Faýl e-poçtaňa ugradylar')}
        />
      </RowGroup>

      <SheetDrawer open={pwd} onClose={() => setPwd(false)}>
        <Typography variant="h2">Paroly üýtget</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: '4px' }}>
          Täze parol azyndan 8 belgiden ybarat bolmaly.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '16px' }}>
          <Field label="Häzirki parol" value="" onChange={() => undefined} type="password" placeholder="••••••••" />
          <Field label="Täze parol" value="" onChange={() => undefined} type="password" placeholder="••••••••" />
        </Box>
        <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
          <Button fullWidth onClick={() => setPwd(false)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
            Ýatyr
          </Button>
          <Button
            fullWidth variant="contained" disableElevation
            onClick={() => { setPwd(false); toast('Parol üýtgedildi'); }}
          >
            Tassykla
          </Button>
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* ---------------- Dil ---------------- */

export function LanguageScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const p = usePrefs();
  return (
    <SubPage title="Dil" onBack={onBack}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '14px' }}>
        {LANGS.map((l) => {
          const on = l.id === p.lang;
          return (
            <ButtonBase
              key={l.id}
              onClick={() => { setPref('lang', l.id); toast(`Dil: ${l.label}`); }}
              aria-pressed={on}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 56,
                px: '15px', textAlign: 'left', justifyContent: 'flex-start',
                borderRadius: `${tokens.rRow}px`,
                bgcolor: on ? tokens.blueTint : tokens.surface,
                border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
                transition: 'background .15s ease',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: on ? tokens.blueText : tokens.ink }}>
                  {l.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>{l.native}</Typography>
              </Box>
              {on && <Box aria-hidden sx={{ color: tokens.blue, display: 'flex' }}><CheckIcon size={17} /></Box>}
            </ButtonBase>
          );
        })}
      </Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '16px' }}>
        Sapak mazmuny mugallymyň ýazan dilinde galýar.
      </Typography>
    </SubPage>
  );
}

/* ---------------- Abuna we töleg ---------------- */

/* Six months of the plan the account is actually on — the amount is read from
   the tier rather than typed, so a price change can't leave a receipt behind. */
const PAYMENTS = ['2026-02-12', '2026-01-12', '2025-12-12', '2025-11-14', '2025-11-12', '2025-10-12']
  .map((date, i) => ({ id: `p${i}`, date, ok: i !== 3 }));

export function PaymentsScreen({ onBack, toast, onOpenCards, onPay }: {
  onBack: () => void; toast: Toast; onOpenCards: () => void; onPay: () => void;
}) {
  const [cancel, setCancel] = useState(false);
  const { tier } = usePrefs();
  const plan = tierOf(tier) ?? ENTRY;
  return (
    <SubPage title="Abuna we töleg" onBack={onBack}>
      {/* plan */}
      <Box sx={{
        mt: '14px', borderRadius: `${tokens.rCard}px`, p: `18px ${tokens.padCard}`,
        background: `linear-gradient(155deg, ${tokens.blue}, ${tokens.bluePress})`, color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px' }}>{plan.name}</Typography>
          <Box sx={{
            px: '9px', height: 22, borderRadius: `${tokens.rPill}px`, bgcolor: 'rgba(255,255,255,.22)',
            fontSize: 11.5, fontWeight: 700, display: 'grid', placeItems: 'center',
          }}>{PLAN.status}</Box>
        </Box>
        <Typography sx={{ fontSize: 13.5, opacity: .9, mt: '4px' }}>
          {PLAN.until} çenli · 28 gün galdy
        </Typography>
        <Box sx={{ display: 'flex', gap: '10px', mt: '16px' }}>
          <Button
            fullWidth disableElevation onClick={onPay}
            sx={{ bgcolor: '#fff', color: tokens.blueText, '&:active': { bgcolor: tokens.blueTint } }}
          >
            Möhleti uzalt
          </Button>
        </Box>
      </Box>

      <SectionLabel>Töleg usuly</SectionLabel>
      <SurfaceRow
        icon={rowIcon(<CardIcon size={22} />, tokens.blueTint, tokens.blueText)}
        label="Halkbank · 4821"
        labelSx={LABEL_SX}
        end={<RowEnd />}
        onClick={onOpenCards}
      />

      {/* every row is the same product, so the date is the row's identity and
          the sum is its value — repeating "Premium · aýlyk" six times is noise */}
      <SectionLabel>Töleg taryhy</SectionLabel>
      <RowGroup>
        {PAYMENTS.map((t) => (
          <SurfaceRow
            key={t.id}
            icon={rowIcon(
              t.ok ? <CheckIcon size={20} /> : <AlertIcon size={20} />,
              t.ok ? tokens.greenTint : tokens.redTint,
              t.ok ? tokens.greenText : tokens.redText,
            )}
            label={t.ok ? absDate(t.date) : `${absDate(t.date)} · şowsuz`}
            labelSx={{ ...LABEL_SX, ...(t.ok ? {} : { color: tokens.redText }) }}
            end={(
              <Typography sx={{
                fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: t.ok ? tokens.ink : tokens.inkDisabled,
                textDecoration: t.ok ? 'none' : 'line-through',
              }}>{plan.monthly} TMT</Typography>
            )}
            onClick={() => toast(t.ok ? 'Çek e-poçtaňa ugradyldy' : 'Töleg geçmedi — karty barla')}
          />
        ))}
      </RowGroup>

      <Box sx={{ pt: '18px', pb: '8px' }}>
        <Button
          fullWidth disableElevation onClick={() => setCancel(true)}
          sx={{ bgcolor: tokens.redTint, color: tokens.redText }}
        >
          Abunany ýatyr
        </Button>
      </Box>

      <SheetDrawer open={cancel} onClose={() => setCancel(false)}>
        <Typography variant="h2">Abunany ýatyrmalymy?</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.ink3, lineHeight: 1.55, mt: '8px' }}>
          {PLAN.until} çenli {plan.name} işlemegini dowam eder. Şondan soň testler we
          öwrediji kartlar çäklendirilýär.
        </Typography>
        <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
          <Button fullWidth onClick={() => setCancel(false)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
            Dowam et
          </Button>
          <Button
            fullWidth disableElevation
            onClick={() => { setCancel(false); toast('Abuna ýatyryldy'); }}
            sx={{ bgcolor: tokens.redTint, color: tokens.redText }}
          >
            Ýatyr
          </Button>
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* ---------------- Kartlarym ---------------- */

const CARDS = [
  { id: 'c1', bank: 'Halkbank', last4: '4821', exp: '09/28', main: true },
  { id: 'c2', bank: 'Senagat bank', last4: '1096', exp: '02/27', main: false },
];

export function CardsScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [cards, setCards] = useState(CARDS);
  const [add, setAdd] = useState(false);

  const makeMain = (id: string) => {
    setCards((cs) => cs.map((c) => ({ ...c, main: c.id === id })));
    toast('Esasy kart üýtgedildi');
  };

  return (
    <SubPage title="Kartlarym" onBack={onBack}>
      {cards.length === 0 ? (
        <EmptyState
          icon={<CardIcon size={26} />}
          title="Kart goşulmadyk"
          note="Abunany tölemek üçin bank kartyňy goş."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', pt: '14px' }}>
          {cards.map((c) => (
            <Box key={c.id} sx={{
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '15px',
              border: `1.5px solid ${c.main ? tokens.blue : 'transparent'}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={44}><CardIcon size={22} /></IconBadge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 600 }} noWrap>{c.bank}</Typography>
                    {c.main && (
                      <Box sx={{
                        flex: 'none', px: '7px', height: 19, borderRadius: `${tokens.rPill}px`,
                        bgcolor: tokens.blue, color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'grid', placeItems: 'center',
                      }}>Esasy</Box>
                    )}
                  </Box>
                  <Typography sx={{
                    fontSize: 13, color: tokens.ink3, mt: '2px', fontVariantNumeric: 'tabular-nums',
                  }}>
                    •••• {c.last4} · {c.exp}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{
                display: 'flex', gap: '8px', mt: '12px', pt: '12px',
                borderTop: `1px solid ${tokens.dividerSoft}`,
              }}>
                {!c.main && (
                  <Button
                    fullWidth disableElevation onClick={() => makeMain(c.id)}
                    sx={{ height: 40, fontSize: 13.5, bgcolor: tokens.blueTint, color: tokens.blueText }}
                  >
                    Esasy et
                  </Button>
                )}
                <Button
                  fullWidth disableElevation
                  onClick={() => {
                    setCards((cs) => cs.filter((x) => x.id !== c.id));
                    toast('Kart aýryldy');
                  }}
                  sx={{ height: 40, fontSize: 13.5, bgcolor: tokens.redTint, color: tokens.redText }}
                >
                  Aýyr
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ pt: '16px' }}>
        <Button fullWidth variant="contained" disableElevation onClick={() => setAdd(true)}>
          Kart goş
        </Button>
      </Box>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '12px' }}>
        Kart maglumatlaryň bank tarapyndan goralýar — programma diňe soňky dört belgini görýär.
      </Typography>

      <SheetDrawer open={add} onClose={() => setAdd(false)}>
        <Typography variant="h2">Kart goş</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: '4px' }}>
          Kartyň maglumatlary bank sahypasynda girizilýär.
        </Typography>
        <Box sx={{ mt: '18px' }}>
          <Button
            fullWidth variant="contained" disableElevation
            onClick={() => { setAdd(false); toast('Bankyň sahypasy tiz wagtda açylar'); }}
          >
            Bank sahypasyna geç
          </Button>
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* ---------------- Ýygy soralýan soraglar ---------------- */

const FAQ = [
  {
    q: 'Ballar nädip toplanýar?',
    a: 'Her tamamlanan test, oýun we bäsleşik bal getirýär. Ballar reýtingi kesgitleýär we her çärýegiň başynda dowam edýär — pozulmaýar.',
  },
  {
    q: 'Baham nädogry görkezilýär welin?',
    a: 'Bahalary mugallym girizýär. Ilki sapagy açyp bahanyň senesini barla, soňra synp ýolbaşçyňa ýüz tut — düzediş 24 sagadyň dowamynda görünýär.',
  },
  {
    q: 'Premium näme berýär?',
    a: 'Ähli testlere we öwrediji kartlara doly elýeterlilik, Gollanmalardaky 1–12 synp sapaklary we Akylly mugallymyň çäksiz ulanylyşy.',
  },
  {
    q: 'Ene-atam näme görýär?',
    a: 'Ene-ataň «Çagam» bölüminde bahalaryňy, gatnaşygyňy we öý işleriňi görýär. Oýun netijeleri we Akylly mugallym ýazgylaryň görünmeýär.',
  },
  {
    q: 'Internet ýok wagty işleýärmi?',
    a: 'Açylan sapaklar we kartlar enjamda saklanýar, olary internetsiz gaýtalap bilersiň. Netijeler baglanyşyk dikelende ugradylýar.',
  },
];

export function FaqScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SubPage title="Kömek" onBack={onBack}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '14px' }}>
        {FAQ.map((f, i) => {
          const on = open === i;
          return (
            <Box key={f.q} sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, overflow: 'hidden' }}>
              <ButtonBase
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 52,
                  px: '15px', py: '12px', textAlign: 'left', justifyContent: 'flex-start',
                }}
              >
                <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{f.q}</Typography>
                <Box aria-hidden sx={{
                  color: tokens.inkMuted, display: 'flex', flex: 'none',
                  transform: on ? 'rotate(-90deg)' : 'rotate(90deg)',
                  transition: `transform .2s ${tokens.ease}`,
                }}>
                  <ChevronIcon size={11} />
                </Box>
              </ButtonBase>
              {on && (
                <Typography sx={{
                  fontSize: 14, color: tokens.ink2, lineHeight: 1.55, px: '15px', pb: '15px', mt: '-2px',
                }}>{f.a}</Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <SectionLabel>Başga sorag barmy</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<QuestionOutlineIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Goldaw bilen habarlaş"
          labelSx={LABEL_SX}
          end={<RowEnd value="09:00 – 18:00" />}
          onClick={() => toast('Goldaw söhbetdeşligi tiz wagtda')}
        />
        <SurfaceRow
          icon={rowIcon(<ShieldIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Ulanyş şertleri"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => toast('Resminama tiz wagtda açylar')}
        />
      </RowGroup>
    </SubPage>
  );
}

/* ---------------- Töleg sheet (shared by Profil and Abuna) ---------------- */

export function PaySheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: Toast }) {
  const [plan, setPlan] = useState<'month' | 'year'>('month');
  /* renewing the plan the account is already on, at that plan's own prices */
  const { tier } = usePrefs();
  const t = tierOf(tier) ?? ENTRY;
  const options = [
    { id: 'month' as const, label: 'Aýlyk', price: `${t.monthly} TMT`, note: 'Islendik wagt ýatyrsa bolýar' },
    { id: 'year' as const, label: 'Ýyllyk', price: `${t.yearly} TMT`, note: `${savePct(t)}% arzan` },
  ];
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Typography variant="h2">Abunany tölemek</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: '4px' }}>
        Häzirki möhlet: {PLAN.until}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '16px' }}>
        {options.map((o) => {
          const on = o.id === plan;
          return (
            <ButtonBase
              key={o.id}
              onClick={() => setPlan(o.id)}
              aria-pressed={on}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 62,
                px: '15px', textAlign: 'left', justifyContent: 'flex-start',
                borderRadius: `${tokens.rRow}px`,
                bgcolor: on ? tokens.blueTint : tokens.surface,
                border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: on ? tokens.blueText : tokens.ink }}>
                  {o.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>{o.note}</Typography>
              </Box>
              <Typography sx={{
                fontSize: 16, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums',
                color: on ? tokens.blueText : tokens.ink,
              }}>{o.price}</Typography>
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '10px', mt: '14px',
        bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '12px 15px',
      }}>
        <IconBadge bg="#fff" color={tokens.blueText} size={36} radius={10}><CardIcon size={18} /></IconBadge>
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Halkbank · 4821</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.blueText }}>Çalyş</Typography>
      </Box>
      <Box sx={{ mt: '18px' }}>
        <Button
          fullWidth variant="contained" disableElevation
          onClick={() => { onClose(); toast('Bank tassyklamasy tiz wagtda'); }}
        >
          {plan === 'month' ? `${t.monthly} TMT tölemek` : `${t.yearly} TMT tölemek`}
        </Button>
      </Box>
    </SheetDrawer>
  );
}

/* ---------------- Sazlamalar (root) ---------------- */

type View = 'root' | 'profile' | 'notifications' | 'security' | 'language' | 'payments' | 'cards' | 'faq';

export function SettingsScreen({ onBack, toast, initial = 'root', onUpgrade }: {
  onBack: () => void; toast: Toast; initial?: View; onUpgrade?: () => void;
}) {
  const [view, setView] = useState<View>(initial);
  const [logout, setLogout] = useState(false);
  const [pay, setPay] = useState(false);
  const p = usePrefs();
  const home = () => setView('root');

  if (view === 'profile') return <ProfileEditScreen onBack={home} toast={toast} />;
  if (view === 'notifications') return <NotificationsScreen onBack={home} toast={toast} />;
  if (view === 'security') return <SecurityScreen onBack={home} toast={toast} />;
  if (view === 'language') return <LanguageScreen onBack={home} toast={toast} />;
  if (view === 'cards') return <CardsScreen onBack={home} toast={toast} />;
  if (view === 'faq') return <FaqScreen onBack={home} toast={toast} />;
  if (view === 'payments') {
    return (
      <>
        <PaymentsScreen
          onBack={home} toast={toast}
          onOpenCards={() => setView('cards')}
          onPay={() => setPay(true)}
        />
        <PaySheet open={pay} onClose={() => setPay(false)} toast={toast} />
      </>
    );
  }

  /* every row is one line: label on the left, current value on the right */
  return (
    <SubPage title="Sazlamalar" onBack={onBack}>
      <SectionLabel>Hasap</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<PencilIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Profil maglumatlary"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => setView('profile')}
        />
        <SurfaceRow
          icon={rowIcon(<WalletIcon size={22} />, tokens.greenTint, tokens.greenText)}
          label="Abuna"
          labelSx={LABEL_SX}
          end={<RowEnd value={tierName(p.tier)} />}
          /* without a subscription there is no payment history to read — the
             row leads where it can actually do something */
          onClick={() => (p.premium ? setView('payments') : onUpgrade?.())}
        />
        <SurfaceRow
          icon={rowIcon(<ShieldIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Howpsuzlyk"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => setView('security')}
        />
      </RowGroup>

      <SectionLabel>Programma</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<BellIcon size={22} />, tokens.orangeTint, tokens.orangeText)}
          label="Bildirişler"
          labelSx={LABEL_SX}
          end={<RowEnd value={p.notify ? 'Açyk' : 'Ýapyk'} />}
          onClick={() => setView('notifications')}
        />
        <SurfaceRow
          icon={rowIcon(<GlobeIcon size={22} />, tokens.tealTint, tokens.tealText)}
          label="Dil"
          labelSx={LABEL_SX}
          end={<RowEnd value={langLabel(p.lang)} />}
          onClick={() => setView('language')}
        />
        <SurfaceRow
          icon={rowIcon(<TrashIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Ýady arassala"
          labelSx={LABEL_SX}
          end={<RowEnd value="84 MB" />}
          onClick={() => toast('84 MB boşadyldy')}
        />
      </RowGroup>

      <SectionLabel>Kömek</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<QuestionOutlineIcon size={22} />, tokens.purpleTint, tokens.purpleText)}
          label="Ýygy soralýan soraglar"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => setView('faq')}
        />
        <SurfaceRow
          icon={rowIcon(<HistoryIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Programma barada"
          labelSx={LABEL_SX}
          end={<RowEnd value="1.0.0" />}
          onClick={() => toast('Gündelik · wersiýa 1.0.0')}
        />
      </RowGroup>

      {/* Synag — the two switches that change what the whole app is allowed to
          show. Kept in their own section (and last) because they are not daily
          settings: one simulates a free account, the other opens unfinished
          features. Both say plainly what turning them on does. */}
      <SectionLabel>Synag</SectionLabel>
      <RowGroup>
        {/* Three plans, so this is a picker and not a switch: a boolean could
            only say "paying or not", and the whole point of the tiers is that
            two paying accounts see different apps. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px', p: '11px 15px' }}>
          {rowIcon(<AlertIcon size={22} />, tokens.orangeTint, tokens.orangeText)}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...LABEL_SX, mb: '8px' }}>Hasap rejimi</Typography>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              {(['free', ...TIERS.map((t) => t.id)] as TierId[]).map((id) => {
                const on = p.tier === id;
                return (
                  <ButtonBase
                    key={id}
                    onClick={() => {
                      setTier(id);
                      /* a fresh free week — otherwise the meters look spent on entry */
                      if (id === 'free') { setPref('usedTest', false); setPref('usedCards', false); }
                      toast(`${tierName(id)} rejimi açyldy`);
                    }}
                    aria-pressed={on}
                    sx={{
                      flex: 1, minHeight: 34, borderRadius: `${tokens.rPill}px`,
                      fontSize: 13, fontWeight: on ? 700 : 600,
                      bgcolor: on ? tokens.blue : tokens.surfacePress,
                      color: on ? '#fff' : tokens.ink2,
                      transition: 'background .15s ease,color .15s ease',
                    }}
                  >{tierName(id)}</ButtonBase>
                );
              })}
            </Box>
          </Box>
        </Box>
        <SwitchRow
          icon={rowIcon(<SparkleIcon size={22} />, tokens.purpleTint, tokens.purpleText)}
          label="Beta aýratynlyklar"
          on={p.beta}
          onToggle={() => {
            setPref('beta', !p.beta);
            toast(p.beta ? 'Beta öçürildi' : 'Beta açyldy');
          }}
        />
      </RowGroup>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '10px' }}>
        Mugt rejimde mahabat, çäkler we teklipler görüner. Göreldeli — bildirişler,
        nyşanlar, testler we bäsleşikler. Zehinli — ählisi. Beta —
        taýýar bolmadyk aýratynlyklar: AI gysgaça mazmun, hepdelik grafikler.
      </Typography>

      <Box sx={{ pt: '20px', pb: '8px' }}>
        <SurfaceRow
          icon={rowIcon(<LogoutIcon size={22} />, tokens.redTint, tokens.redText)}
          label="Hasapdan çyk"
          labelSx={{ ...LABEL_SX, color: tokens.redText }}
          onClick={() => setLogout(true)}
        />
      </Box>

      <Typography sx={{
        fontSize: 12, color: tokens.inkDisabled, textAlign: 'center', pt: '16px', pb: '8px',
      }}>
        Gündelik · 1.0.0
      </Typography>

      {/* leaving the account is destructive enough to confirm */}
      <SheetDrawer open={logout} onClose={() => setLogout(false)}>
        <Typography variant="h2">Hasapdan çykmalymy?</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.ink3, lineHeight: 1.55, mt: '8px' }}>
          Ýüklenen sapaklar enjamda galýar. Gaýdyp girmek üçin telefon belgiň we
          parolyň gerek bolar.
        </Typography>
        <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
          <Button fullWidth onClick={() => setLogout(false)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
            Ýatyr
          </Button>
          <Button
            fullWidth disableElevation
            onClick={() => { setLogout(false); toast('Hasapdan çykmak tiz wagtda'); }}
            sx={{ bgcolor: tokens.redTint, color: tokens.redText }}
          >
            Çyk
          </Button>
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}
