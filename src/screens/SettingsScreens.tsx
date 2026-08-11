import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertIcon, BellIcon, CardIcon, CheckIcon, CoinIcon, ComputerIcon, GlobeIcon, HistoryIcon,
  LockIcon, LogoutIcon, PencilIcon, PhoneIcon, QuestionOutlineIcon, ShieldIcon, SoundIcon,
  SparkleIcon, TrashIcon, UsersIcon, WalletIcon,
} from '../components/Icons';
import {
  EmptyState, Field, IconBadge, RowEnd, SectionLabel, SheetDrawer,
  StickyFooter, SubPage, SurfaceRow, SwitchRow,
} from '../components/Ui';
import {
  ENTRY, LANGS, PLAN, TIERS, langLabel, savePct, setPref, setTier, tierName, tierOf, usePrefs,
} from '../state/prefs';
import {
  AboutScreen, APP, FaqScreen, HelpScreen, SupportScreen, UpdatesScreen,
} from './HelpScreens';
import {
  BANKS, PAY_NUMBERS, addPayMethod, bankOf, mainPayMethod, methodLabel, methodNote, methodTone,
  removePayMethod, setMainPayMethod, usePayMethods,
} from '../state/payMethods';
import type { BankId } from '../state/payMethods';
import { LABEL_SX, NEUTRAL, RowGroup, rowIcon } from './settingsBits';
import type { Toast } from './settingsBits';
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

/* Preferences, the plan and the language list all live in ../state/prefs so the
   diary, the paywall and this tree read one source of truth. */

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
  const methods = usePayMethods();
  const main = methods.find((m) => m.main) ?? methods[0];
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

      {/* the method that will actually be charged, read from the store rather
          than printed here — a second copy is free to go stale */}
      <SectionLabel>Töleg usuly</SectionLabel>
      <SurfaceRow
        icon={rowIcon(
          <CardIcon size={22} />,
          main ? methodTone(main).tint : tokens.blueTint,
          main ? methodTone(main).ink : tokens.blueText,
        )}
        label={main ? methodLabel(main) : 'Kart goşulmadyk'}
        labelSx={LABEL_SX}
        end={<RowEnd value={main ? methodNote(main) : undefined} />}
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

/* ---------------- Töleg usullary ----------------
 *
 * The cards this account has saved, and the page that adds one.
 *
 * It was "Kartlarym"; the page is now "Töleg usullary" because a card is not
 * the only way to pay — but the other two ways are not *saved* ways, so they
 * are not here. A gift card is a code you spend once and a phone transfer is
 * something you do from your own phone: neither has anything worth keeping
 * between payments, and both are offered in the pay sheet at the moment they
 * are useful.
 */
export function PayMethodsScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const methods = usePayMethods();
  const [add, setAdd] = useState(false);

  if (add) return <AddCardScreen onBack={() => setAdd(false)} toast={toast} />;

  return (
    <SubPage title="Töleg usullary" onBack={onBack}>
      {methods.length === 0 ? (
        <EmptyState
          icon={<CardIcon size={26} />}
          title="Kart goşulmadyk"
          note="Abunany kart bilen tölemek üçin karty goş. Sowgat karty we telefon geçirimi töleg wagtynda saýlanýar."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', pt: '14px' }}>
          {methods.map((m) => {
            const tone = methodTone(m);
            return (
              <Box key={m.id} sx={{
                bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '15px',
                border: `1.5px solid ${m.main ? tokens.blue : 'transparent'}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                  {rowIcon(<CardIcon size={22} />, tone.tint, tone.ink)}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Typography sx={{ fontSize: 15.5, fontWeight: 600 }} noWrap>
                        {methodLabel(m)}
                      </Typography>
                      {m.main && (
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: tokens.blueText, flex: 'none' }}>
                          Esasy
                        </Typography>
                      )}
                    </Box>
                    <Typography noWrap sx={{
                      fontSize: 13, color: tokens.ink3, mt: '2px', fontVariantNumeric: 'tabular-nums',
                    }}>{methodNote(m)}</Typography>
                  </Box>
                </Box>
                <Box sx={{
                  display: 'flex', gap: '8px', mt: '12px', pt: '12px',
                  borderTop: `1px solid ${tokens.dividerSoft}`,
                }}>
                  {!m.main && (
                    <Button
                      fullWidth disableElevation
                      onClick={() => { setMainPayMethod(m.id); toast('Esasy kart üýtgedildi'); }}
                      sx={{ height: 40, fontSize: 13.5, bgcolor: tokens.blueTint, color: tokens.blueText }}
                    >
                      Esasy et
                    </Button>
                  )}
                  <Button
                    fullWidth disableElevation
                    onClick={() => { removePayMethod(m.id); toast('Kart aýryldy'); }}
                    sx={{ height: 40, fontSize: 13.5, bgcolor: tokens.redTint, color: tokens.redText }}
                  >
                    Aýyr
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ pt: '16px' }}>
        <Button fullWidth variant="contained" disableElevation onClick={() => setAdd(true)}>
          Kart goş
        </Button>
      </Box>

      {/* the two ways to pay that are not saved anywhere — said here so the
          reader does not go looking for them on this page */}
      <Box sx={{
        mt: '14px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: tokens.padCard,
      }}>
        <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.55 }}>
          Sowgat karty we telefon arkaly geçirim aýratyn saklanmaýar — olar töleg edilende
          «Tölemek» penjiresinde saýlanýar.
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5, px: '6px', pt: '12px' }}>
        Kart maglumatlaryň bank tarapyndan goralýar — programma diňe soňky dört belgini görýär.
      </Typography>
    </SubPage>
  );
}

/* ---------------- Kart goş ----------------
 *
 * The bank first, then the digits: it decides what the card looks like and it
 * is the thing the reader is holding. Only the bank is named — each of these
 * issues several different cards, so a product name beside the bank would be
 * wrong for most of the plastic in circulation.
 *
 * The preview above the form is the point. Card entry is the one form where
 * people routinely mistype and cannot tell — so the digits, the expiry and the
 * name are echoed onto a card face as they are typed, grouped the way they are
 * printed, in the chosen bank's colour. Everything formats as you type rather
 * than validating after submit, and the footer stays disabled until the form is
 * complete, so the error state is "not finished yet" instead of a red message.
 */

const digits = (v: string) => v.replace(/\D/g, '');

const fmtCardNumber = (v: string) => digits(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const fmtExpiry = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

export function AddCardScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [bank, setBank] = useState<BankId>('halk');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');
  const [main, setMain] = useState(true);

  const b = bankOf(bank);
  const nDigits = digits(number);
  const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  const ready = nDigits.length === 16 && expOk && digits(cvv).length === 3 && holder.trim().length > 2;

  const save = () => {
    addPayMethod({ type: 'card', main, bank, last4: nDigits.slice(-4), exp });
    toast('Kart goşuldy');
    onBack();
  };

  return (
    <SubPage title="Kart goş" onBack={onBack}>
      <SectionLabel>Kartyň banky</SectionLabel>
      <RowGroup>
        {BANKS.map((x) => {
          const on = x.id === bank;
          return (
            <ButtonBase
              key={x.id}
              onClick={() => setBank(x.id)}
              aria-pressed={on}
              sx={{
                display: 'flex', alignItems: 'center', gap: '13px', width: '100%',
                textAlign: 'left', justifyContent: 'flex-start', minHeight: 60, px: '15px',
                borderRadius: `${tokens.rCard}px`,
                bgcolor: on ? tokens.blueTint : tokens.surface,
                border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
              }}
            >
              {rowIcon(<CardIcon size={22} />, x.tint, x.ink)}
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600 }}>{x.name}</Typography>
              {on && <Box aria-hidden sx={{ color: tokens.blue, display: 'flex' }}><CheckIcon size={15} /></Box>}
            </ButtonBase>
          );
        })}
      </RowGroup>

      {/* what the reader is filling in, as they fill it in */}
      <Box aria-hidden sx={{
        mt: '16px', height: 168, borderRadius: `${tokens.rCard}px`, p: '18px',
        background: `linear-gradient(145deg, ${b.ink}, ${tokens.ink})`,
        color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        /* neutral lift, not the blue FAB glow — the card wears the bank's colour
           and a blue halo around a green card reads as a bug */
        boxShadow: tokens.shadowFloat,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ width: 38, height: 28, borderRadius: '6px', bgcolor: 'rgba(255,255,255,.35)' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, opacity: .9 }}>{b.name}</Typography>
        </Box>
        <Typography sx={{
          fontSize: 19, fontWeight: 600, letterSpacing: '1.5px', fontVariantNumeric: 'tabular-nums',
          opacity: nDigits.length ? 1 : .55,
        }}>
          {fmtCardNumber(number) || '•••• •••• •••• ••••'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
          <Typography noWrap sx={{
            fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: holder ? .95 : .5,
          }}>{holder || 'AT FAMILIÝA'}</Typography>
          <Typography sx={{
            fontSize: 13, fontWeight: 600, opacity: exp ? .95 : .5, fontVariantNumeric: 'tabular-nums',
          }}>{exp || 'AA/ÝÝ'}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '20px' }}>
        <Field
          label="Kartyň belgisi" value={fmtCardNumber(number)} onChange={setNumber}
          placeholder="0000 0000 0000 0000" type="tel"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Möhleti" value={exp} onChange={(v) => setExp(fmtExpiry(v))} placeholder="AA/ÝÝ" type="tel" />
          <Field label="CVV" value={cvv} onChange={(v) => setCvv(digits(v).slice(0, 3))} placeholder="000" type="tel" />
        </Box>
        <Field label="Kartyň eýesi" value={holder} onChange={setHolder} placeholder="AT FAMILIÝA" />
      </Box>

      <Box sx={{ pt: '16px' }}>
        <SwitchRow
          icon={rowIcon(<CardIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Esasy kart edip belle"
          on={main}
          onToggle={() => setMain(!main)}
        />
      </Box>

      <StickyFooter>
        <Button fullWidth variant="contained" disableElevation disabled={!ready} onClick={save}>
          Karty goş
        </Button>
      </StickyFooter>
    </SubPage>
  );
}

/* ---------------- Töleg sheet (shared by Profil and Abuna) ---------------- */

/*
 * Paying, and the three ways it happens.
 *
 * A saved card is one row per card. The other two are not saved anywhere and
 * appear here because here is where they exist: a gift card is a code spent
 * once, and a phone transfer is something the reader does from their own phone
 * to one of our numbers. That is why the phone option shows *our* numbers with
 * a pay button beside each rather than asking for theirs — the app is the payee.
 */
export function PaySheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: Toast }) {
  const [plan, setPlan] = useState<'month' | 'year'>('month');
  const methods = usePayMethods();
  /* `null` means "whatever the main card is" — the sheet opens on it without
     having to copy it into state on every open */
  const [pick, setPick] = useState<string | null>(null);
  const [gift, setGift] = useState('');
  const { tier } = usePrefs();
  const t = tierOf(tier) ?? ENTRY;
  const payWith = pick ?? mainPayMethod()?.id ?? 'gift';
  const amount = plan === 'month' ? t.monthly : t.yearly;

  const options = [
    { id: 'month' as const, label: 'Aýlyk', price: `${t.monthly} TMT`, note: 'Islendik wagt ýatyrsa bolýar' },
    { id: 'year' as const, label: 'Ýyllyk', price: `${t.yearly} TMT`, note: `${savePct(t)}% arzan` },
  ];

  const row = (id: string, tint: string, ink: string, icon: ReactNode, label: string, note: string) => {
    const on = id === payWith;
    return (
      <ButtonBase
        key={id}
        onClick={() => setPick(id)}
        aria-pressed={on}
        sx={{
          display: 'flex', alignItems: 'center', gap: '11px', width: '100%',
          textAlign: 'left', justifyContent: 'flex-start', minHeight: 56, px: '13px',
          borderRadius: `${tokens.rRow}px`,
          bgcolor: on ? tokens.blueTint : tokens.surface,
          border: `1.5px solid ${on ? tokens.blue : 'transparent'}`,
        }}
      >
        <IconBadge bg={tint} color={ink} size={36} radius={10}>{icon}</IconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>{label}</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: tokens.ink3 }}>{note}</Typography>
        </Box>
        {on && <Box aria-hidden sx={{ color: tokens.blue, display: 'flex' }}><CheckIcon size={14} /></Box>}
      </ButtonBase>
    );
  };

  const giftReady = gift.replace(/-/g, '').length === 12;

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

      <SectionLabel>Töleg usuly</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {methods.map((m) => row(
          m.id, methodTone(m).tint, methodTone(m).ink, <CardIcon size={18} />,
          methodLabel(m), methodNote(m),
        ))}
        {row('gift', tokens.purpleTint, tokens.purpleText, <CoinIcon size={18} />,
          'Sowgat karty', 'Kodyňy giriz')}
        {row('phone', tokens.tealTint, tokens.tealText, <PhoneIcon size={18} />,
          'Telefon arkaly geçirim', 'Belgimize geçirim et')}
      </Box>

      {/* the gift code, where it is used rather than where it would be stored */}
      {payWith === 'gift' && (
        <Box sx={{ mt: '12px' }}>
          <Field
            label="Sowgat kartynyň kody"
            value={gift}
            onChange={(v) => setGift(
              v.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12)
                .replace(/(.{4})/g, '$1-').replace(/-$/, ''),
            )}
            placeholder="XXXX-XXXX-XXXX"
            note="Kod kartyň arka ýüzündäki gorag gatlagynyň astynda"
          />
        </Box>
      )}

      {/* our numbers, each with its own pay button — the reader transfers to
          one of them, so the number is the content and the button is beside it */}
      {payWith === 'phone' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '12px' }}>
          {PAY_NUMBERS.map((n) => (
            <Box key={n.id} sx={{
              display: 'flex', alignItems: 'center', gap: '10px',
              bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '10px 10px 10px 14px',
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {n.number}
                </Typography>
                <Typography noWrap sx={{ fontSize: 12, color: tokens.ink3, mt: '1px' }}>{n.operator}</Typography>
              </Box>
              <Button
                disableElevation
                onClick={() => toast(`${n.number} — ${amount} TMT geçirim tassyklanýar`)}
                sx={{
                  flex: 'none', height: 38, minWidth: 0, px: '16px', fontSize: 13.5,
                  bgcolor: tokens.tealTint, color: tokens.tealText,
                }}
              >
                Töle
              </Button>
            </Box>
          ))}
          <Typography sx={{ fontSize: 12, color: tokens.ink3, lineHeight: 1.5, px: '4px', pt: '2px' }}>
            Geçirimden soň töleg 10 minudyň dowamynda hasabyňda görünýär.
          </Typography>
        </Box>
      )}

      {payWith !== 'phone' && (
        <Box sx={{ mt: '18px' }}>
          <Button
            fullWidth variant="contained" disableElevation
            disabled={payWith === 'gift' && !giftReady}
            onClick={() => {
              const m = methods.find((x) => x.id === payWith);
              onClose();
              setGift('');
              toast(m
                ? `${methodLabel(m)} · ${amount} TMT tassyklanýar`
                : 'Sowgat karty ulanyldy');
            }}
          >
            {payWith === 'gift' ? 'Sowgat kartyny ulan' : `${amount} TMT tölemek`}
          </Button>
        </Box>
      )}
    </SheetDrawer>
  );
}

/* ---------------- Sazlamalar (root) ---------------- */

type View = 'root' | 'profile' | 'notifications' | 'security' | 'language' | 'payments' | 'cards'
  | 'help' | 'faq' | 'support' | 'about' | 'updates';

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
  if (view === 'cards') return <PayMethodsScreen onBack={home} toast={toast} />;
  /* Kömek merkezi is the hub; FAQ, goldaw and täzelikler hang off it and return
     to it, so a reader who drilled in one step does not land back in the root. */
  if (view === 'help') {
    return (
      <HelpScreen
        onBack={home}
        onSupport={() => setView('support')}
        onFaq={() => setView('faq')}
      />
    );
  }
  if (view === 'about') {
    return (
      <AboutScreen
        onBack={home} toast={toast}
        onUpdates={() => setView('updates')}
      />
    );
  }
  if (view === 'faq') {
    return (
      <FaqScreen
        onBack={() => setView('help')} toast={toast}
        onSupport={() => setView('support')}
      />
    );
  }
  if (view === 'support') return <SupportScreen onBack={() => setView('help')} toast={toast} />;
  if (view === 'updates') return <UpdatesScreen onBack={() => setView('about')} />;
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

      {/* Two rows: how to use it, and what it is. Guides, questions and support
          used to be three separate entries for one intention ("I am stuck"),
          which made the reader choose before they knew what kind of answer they
          needed. What the app *is* stays its own menu — it is read for a
          different reason and at a different time. */}
      <SectionLabel>Kömek</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<QuestionOutlineIcon size={22} />, tokens.purpleTint, tokens.purpleText)}
          label="Kömek merkezi"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => setView('help')}
        />
        <SurfaceRow
          icon={rowIcon(<HistoryIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Programma barada"
          labelSx={LABEL_SX}
          end={<RowEnd value={APP.version} />}
          onClick={() => setView('about')}
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
