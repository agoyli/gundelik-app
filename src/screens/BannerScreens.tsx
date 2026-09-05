/*
 * Banners — the two halves of the same thing.
 *
 * A free reader gets `BannerSlot`: one 2:1 card in a fixed place, with the
 * advertiser's own colour, a "mahabat" label so it is never mistaken for the
 * app's own content, and an ✕ that says the honest thing — the way to remove
 * it is Premium. Tapping the card opens what the advertiser is actually
 * offering, one panel at a time, instead of throwing the reader out of the app.
 *
 * A local business gets `MyBannersScreen`: what a slot costs a day, which
 * schools it reaches, which days are already sold, and a form that books one
 * against the same balance the shop spends. The seller's calendar and the
 * reader's banner are the same three tables read from two ends.
 */

import { useState } from 'react';
import { Box, Button, ButtonBase, Typography } from '@mui/material';
import {
  ChipRow, DoneBadge, EmptyState, Field, IconBadge, RowChevron, SectionLabel, Segmented,
  SheetDrawer, SnapSlides, StatTile, StickyFooter, SubPage, SurfaceRow,
} from '../components/Ui';
import { PaidFeatureSheet } from '../components/Paywall';
import {
  BuildingIcon, CalendarIcon, CheckIcon, CloseIcon, MegaphoneIcon, PhoneIcon, ShopIcon,
} from '../components/Icons';
import { MonthCalendar } from '../components/Ui';
import {
  AD_SCHOOLS, BANNERS, BannerArt, PLACEMENTS, bannerFor, bannerPrice, bannerReach,
  clashesFor, isBusyDay, nextFree, placementOf, schoolOf,
} from '../data/banners';
import type { Banner, BannerArtId, PlacementId } from '../data/banners';
import { STATUS_LABEL, bookBanner, statusOf, useMyBanners } from '../state/banners';
import type { MyBanner } from '../state/banners';
import { usePrefs } from '../state/prefs';
import { useWallet } from '../state/wallet';
import { TODAY, absDate, addDays, fmtRange } from '../lib/date';
import { tokens } from '../theme';

type Toast = (m: string) => void;

/* ---------------- the card itself ----------------
   2:1, always. A slot with a fixed shape is what lets a page keep its rhythm
   when the campaign in it changes, and it is the shape an advertiser is
   actually asked to draw for. */

export function BannerCard({ brand, title, note, art, tint, ink, onOpen, onRemove }: {
  brand: string; title: string; note: string;
  art: BannerArtId; tint: string; ink: string;
  onOpen?: () => void; onRemove?: () => void;
}) {
  return (
    <Box sx={{ position: 'relative' }}>
      <ButtonBase
        onClick={onOpen}
        disabled={!onOpen}
        aria-label={`${brand} — ${title}`}
        sx={{
          display: 'block', width: '100%', aspectRatio: '2 / 1', textAlign: 'left',
          borderRadius: `${tokens.rCard}px`, overflow: 'hidden', position: 'relative',
          bgcolor: tint, color: tokens.ink,
          '&.Mui-disabled': { opacity: 1 },
        }}
      >
        <BannerArt art={art} ink={ink} />
        <Box sx={{
          position: 'relative', height: '100%', p: '14px 15px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          /* the text half never runs under the artwork on a narrow phone */
          width: '68%',
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: ink, letterSpacing: '.4px' }} noWrap>
            {brand.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px', lineHeight: 1.25 }}>
            {title}
          </Typography>
          <Typography sx={{
            fontSize: 12.5, color: tokens.ink3, lineHeight: 1.4,
            /* two lines at most: the card is 2:1 and the rest of it belongs to
               the headline and the "mahabat" label under the fold of the text */
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {note}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>mahabat</Typography>
        </Box>
      </ButtonBase>

      {/* The ✕ is not a lie: it does not hide this banner for a day, it opens
          the one thing that removes every banner for good. */}
      {onRemove && (
        <ButtonBase
          onClick={onRemove}
          aria-label="Mahabaty aýyrmak"
          sx={{
            position: 'absolute', top: 8, right: 8, width: 28, height: 28,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,.82)', color: tokens.ink2,
            display: 'grid', placeItems: 'center',
          }}
        ><CloseIcon size={15} /></ButtonBase>
      )}
    </Box>
  );
}

/* ---------------- the slot a page puts on the screen ---------------- */

export function BannerSlot({ placement, onUpgrade, toast, onAdvertise }: {
  placement: PlacementId; onUpgrade: () => void; toast: Toast; onAdvertise?: () => void;
}) {
  const { premium } = usePrefs();
  const [open, setOpen] = useState(false);
  const [remove, setRemove] = useState(false);
  const banner = bannerFor(placement);
  if (premium) return null;
  return (
    <>
      <BannerCard
        brand={banner.brand} title={banner.title} note={banner.blurb}
        art={banner.art} tint={banner.tint} ink={banner.ink}
        onOpen={() => setOpen(true)}
        onRemove={() => setRemove(true)}
      />
      <BannerDetailSheet
        banner={banner}
        open={open}
        onClose={() => setOpen(false)}
        toast={toast}
        onAdvertise={onAdvertise}
      />
      <PaidFeatureSheet
        open={remove}
        onClose={() => setRemove(false)}
        title="Mahabatsyz Gündelik"
        note="Mahabat diňe mugt hasapda görkezilýär. Abuna ýazylanyňdan soň bir bannerem çykmaýar."
        feature="noads"
        bullets={[
          'Ähli sahypalarda mahabat ýok',
          'Sapaklaryň arasynda hiç zat päsgel bermeýär',
          'Islendik wagt yzyna gaýtaryp bolýar',
        ]}
        onUpgrade={onUpgrade}
      />
    </>
  );
}

/* ---------------- what the advertiser is offering ----------------
   A sheet rather than a page: an ad that navigates away from the diary has
   taken something the reader did not offer. */

export function BannerDetailSheet({ banner, open, onClose, toast, onAdvertise }: {
  banner: Banner; open: boolean; onClose: () => void; toast: Toast; onAdvertise?: () => void;
}) {
  return (
    <SheetDrawer open={open} onClose={onClose}>
      <Box sx={{ borderRadius: `${tokens.rCard}px`, overflow: 'hidden' }}>
        <BannerCard
          brand={banner.brand} title={banner.title} note={banner.blurb}
          art={banner.art} tint={banner.tint} ink={banner.ink}
        />
      </Box>

      {/* the description, one panel at a time — the app's own snapping track */}
      <Box sx={{ mt: '14px' }}>
        <SnapSlides labels={banner.slides.map((s) => s.title)}>
          {banner.slides.map((s) => (
            <Box key={s.title} sx={{
              bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '15px',
              minHeight: 116, mr: '1px',
            }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.2px' }}>{s.title}</Typography>
              <Typography sx={{ fontSize: 13.5, color: tokens.ink3, lineHeight: 1.5, mt: '6px' }}>
                {s.note}
              </Typography>
            </Box>
          ))}
        </SnapSlides>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '4px' }}>
        <SurfaceRow
          icon={<IconBadge bg={banner.tint} color={banner.ink} size={38}><PhoneIcon size={18} /></IconBadge>}
          label={banner.phone}
          sub="Jaň etmek"
          onClick={() => { window.location.href = `tel:${banner.phone.replace(/\s/g, '')}`; }}
          end={<RowChevron />}
        />
        <SurfaceRow
          icon={<IconBadge bg={tokens.surfacePress} color={tokens.ink2} size={38}><ShopIcon size={18} /></IconBadge>}
          label={banner.where}
          sub="Salgysy"
        />
      </Box>

      <Typography sx={{ fontSize: 12, color: tokens.inkMuted, mt: '12px', px: '4px', lineHeight: 1.5 }}>
        Bu mahabat Gündelik tarapyndan barlanan mekdep hyzmatydyr. Töleg we hyzmat
        üçin jogapkärçilik mahabat berijä degişli.
      </Typography>

      <Box sx={{ display: 'flex', gap: '10px', mt: '14px' }}>
        <Button fullWidth onClick={onClose} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>Ýap</Button>
        <Button
          fullWidth variant="contained" disableElevation
          onClick={() => {
            onClose();
            if (onAdvertise) onAdvertise();
            else toast('Öz banneriňi Profil → Mahabat bölüminde ýerleşdirip bolýar');
          }}
        >Öz bannerim</Button>
      </Box>
    </SheetDrawer>
  );
}

/* ---------------- the seller's side ---------------- */

const STATUS_TINT = {
  planned: { bg: tokens.blueTint, ink: tokens.blueText },
  live: { bg: tokens.greenTint, ink: tokens.greenText },
  done: { bg: tokens.surfacePress, ink: tokens.inkMuted },
} as const;

function MyBannerRow({ b }: { b: MyBanner }) {
  const st = statusOf(b);
  const look = STATUS_TINT[st];
  return (
    <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '12px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
      <BannerCard brand="Siziň banneriňiz" title={b.title} note={b.note} art={b.art} tint={b.tint} ink={b.ink} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '3px' }}>
        <Box sx={{
          height: 24, px: '10px', borderRadius: `${tokens.rPill}px`, flex: 'none',
          bgcolor: look.bg, color: look.ink, fontSize: 12, fontWeight: 700,
          display: 'grid', placeItems: 'center',
        }}>{STATUS_LABEL[st]}</Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, flex: 1, minWidth: 0 }} noWrap>
          {fmtRange(b.from, b.to)} · {placementOf(b.placement).label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{b.price} TMT</Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: tokens.inkMuted, px: '3px' }}>
        {schoolOf(b.school).name} · takmynan {bannerReach(b.placement, b.school)} görkeziliş/gün
      </Typography>
    </Box>
  );
}

export function MyBannersScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const mine = useMyBanners();
  const [making, setMaking] = useState(false);

  if (making) {
    return <BannerCreateScreen onBack={() => setMaking(false)} onDone={() => setMaking(false)} toast={toast} />;
  }

  return (
    <SubPage
      title="Mahabat"
      onBack={onBack}
      help="Mekdep programmasynda öz bannerini ýerleşdirmek isleýän kärhanalar üçin. Ýeri, mekdebi we günleri saýlaýarsyňyz — töleg balansdan aýrylýar."
    >
      <SectionLabel>Bannerler nirede görkezilýär</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '8px' }}>
        {PLACEMENTS.map((p) => (
          <SurfaceRow
            key={p.id}
            icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={38}><MegaphoneIcon size={18} /></IconBadge>}
            label={p.label}
            sub={`${p.perDay} TMT/gün · ${p.reach} görkeziliş`}
          />
        ))}
      </Box>

      <SectionLabel>Meniň bannerlerim</SectionLabel>
      {mine.length === 0 ? (
        <EmptyState
          icon={<MegaphoneIcon size={28} />}
          title="Entek banner ýok"
          note="Ilkinji banneriňizi ýerleşdiriň — ýeri, mekdebi we günleri saýlap, birbada bron ediň."
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
          {mine.map((b) => <MyBannerRow key={b.id} b={b} />)}
        </Box>
      )}

      <Box sx={{ mt: '16px' }}>
        <Button fullWidth variant="contained" disableElevation onClick={() => setMaking(true)}>
          Täze banner
        </Button>
      </Box>
      <Box sx={{ height: 24 }} />
    </SubPage>
  );
}

/* ---------------- booking one ---------------- */

const PALETTE: { id: string; label: string; tint: string; ink: string }[] = [
  { id: 'blue', label: 'Gök', tint: tokens.blueTint, ink: tokens.blueText },
  { id: 'orange', label: 'Mämişi', tint: tokens.orangeTint, ink: tokens.orangeText },
  { id: 'teal', label: 'Ýaşyl', tint: tokens.tealTint, ink: tokens.tealText },
  { id: 'purple', label: 'Melewşe', tint: tokens.purpleTint, ink: tokens.purpleText },
];

const ARTS: { id: BannerArtId; label: string }[] = [
  { id: 'book', label: 'Kitap' },
  { id: 'device', label: 'Enjam' },
  { id: 'lang', label: 'Dil' },
  { id: 'sport', label: 'Sport' },
];

const LENGTHS = [3, 7, 14, 30];

export function BannerCreateScreen({ onBack, onDone, toast }: {
  onBack: () => void; onDone: () => void; toast: Toast;
}) {
  const { balance } = useWallet();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [colour, setColour] = useState(PALETTE[0].id);
  const [art, setArt] = useState<BannerArtId>('book');
  const [placement, setPlacement] = useState<PlacementId>('diary');
  const [school, setSchool] = useState('all');
  const [from, setFrom] = useState(addDays(TODAY, 1));
  const [days, setDays] = useState(7);
  const [calendar, setCalendar] = useState(false);

  const look = PALETTE.find((p) => p.id === colour) ?? PALETTE[0];
  const price = bannerPrice(placement, school, days);
  const clashes = clashesFor(placement, school, from, days);
  const free = clashes.length === 0;
  const to = addDays(from, days - 1);
  const suggestion = free ? null : nextFree(placement, school, from, days);
  const enough = balance >= price;

  const book = () => {
    if (!title.trim()) { toast('Bannere at beriň'); return; }
    if (!free) { toast('Bu günler eýýäm band edilen'); return; }
    const made = bookBanner({
      title: title.trim(),
      note: note.trim() || 'Mekdep okuwçylary üçin ýörite teklip',
      art, tint: look.tint, ink: look.ink,
      placement, school, from, days,
    });
    if (!made) { toast(`Balans ýeterlik däl — ${price} TMT gerek`); return; }
    toast(`Banner bron edildi · ${price} TMT`);
    onDone();
  };

  return (
    <SubPage
      title="Täze banner"
      onBack={onBack}
      help="Banner 2:1 ölçegde görkezilýär. Aşakdaky öňünden görnüş — okuwçynyň telefonynda görjek zady."
    >
      <SectionLabel>Öňünden görnüş</SectionLabel>
      <BannerCard
        brand="Siziň kärhanaňyz"
        title={title.trim() || 'Bannerin ady'}
        note={note.trim() || 'Bir setirde teklibiňiz'}
        art={art} tint={look.tint} ink={look.ink}
      />

      <SectionLabel>Tekst</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
        <Field label="Ady" value={title} onChange={setTitle} placeholder="Okuw esbaplary — 20% arzanladyş" />
        <Field label="Bir setir düşündiriş" value={note} onChange={setNote} placeholder="Mekdebe eltip bermek mugt" />
      </Box>

      <SectionLabel>Görnüşi</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
        <ChipRow
          label="Reňk"
          value={colour}
          onChange={setColour}
          chips={PALETTE.map((p) => ({ id: p.id, label: p.label, tint: p.tint, accent: p.ink }))}
        />
        <ChipRow
          label="Surat"
          value={art}
          onChange={(id) => setArt(id as BannerArtId)}
          chips={ARTS.map((a) => ({ id: a.id, label: a.label }))}
        />
      </Box>

      <SectionLabel>Ýeri</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '8px' }}>
        {PLACEMENTS.map((p) => (
          <SurfaceRow
            key={p.id}
            icon={<IconBadge
              bg={p.id === placement ? tokens.blueTint : tokens.surfacePress}
              color={p.id === placement ? tokens.blueText : tokens.ink3}
              size={38}
            ><MegaphoneIcon size={18} /></IconBadge>}
            label={p.label}
            /* the price leads: it is what the row is being chosen on, and the
               line truncates from the right */
            sub={`${p.perDay} TMT/gün · ${p.where}`}
            end={p.id === placement ? <DoneBadge size={20} /> : undefined}
            onClick={() => setPlacement(p.id)}
          />
        ))}
      </Box>

      <SectionLabel>Mekdep</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '8px' }}>
        {AD_SCHOOLS.map((s) => (
          <SurfaceRow
            key={s.id}
            icon={<IconBadge
              bg={s.id === school ? tokens.blueTint : tokens.surfacePress}
              color={s.id === school ? tokens.blueText : tokens.ink3}
              size={38}
            ><BuildingIcon size={18} /></IconBadge>}
            label={s.name}
            sub={`${s.pupils} okuwçy`}
            end={s.id === school ? <DoneBadge size={20} /> : undefined}
            onClick={() => setSchool(s.id)}
          />
        ))}
      </Box>

      <SectionLabel>Günler</SectionLabel>
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
        <SurfaceRow
          icon={<IconBadge bg={tokens.blueTint} color={tokens.blueText} size={38}><CalendarIcon size={18} /></IconBadge>}
          label={absDate(from)}
          sub="Başlanýan güni"
          end={<RowChevron />}
          onClick={() => setCalendar(true)}
        />
        <Segmented
          label="Möhlet"
          value={String(days)}
          options={LENGTHS.map((d) => ({ id: String(d), label: `${d} gün` }))}
          onChange={(v) => setDays(Number(v))}
        />
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <StatTile value={fmtRange(from, to)} label="Möhlet" />
          <StatTile
            value={free ? 'Boş' : 'Band'}
            label="Ýagdaýy"
            color={free ? tokens.greenText : tokens.redText}
          />
          <StatTile value={`${bannerReach(placement, school)}`} label="Görkeziliş/gün" />
        </Box>

        {/* An unavailable window is only half an answer; the other half is the
            first date that would work, as a button rather than a sentence. */}
        {!free && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '8px' }}>
            {clashes.map((c) => (
              <Typography key={`${c.from}${c.who}`} sx={{ fontSize: 12.5, color: tokens.ink3, px: '4px' }}>
                {fmtRange(c.from, c.to)} — {c.who} tarapyndan band edilen
              </Typography>
            ))}
            {suggestion && (
              <Button onClick={() => setFrom(suggestion)} sx={{ bgcolor: tokens.surfacePress, color: tokens.ink }}>
                Iň ýakyn boş sene: {absDate(suggestion)}
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ height: 92 }} />

      <StickyFooter>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{price} TMT</Typography>
            <Typography sx={{ fontSize: 12, color: enough ? tokens.inkMuted : tokens.redText }}>
              {enough ? `Balans: ${balance} TMT` : `Balans ýeterlik däl: ${balance} TMT`}
            </Typography>
          </Box>
          <Button
            variant="contained" disableElevation onClick={book}
            disabled={!free || !enough}
            sx={{ px: '22px', flex: 'none' }}
          >Bron etmek</Button>
        </Box>
      </StickyFooter>

      <SheetDrawer open={calendar} onClose={() => setCalendar(false)}>
        <Typography variant="h2">Başlanýan güni</Typography>
        <Typography variant="caption">Bellenen günler eýýäm band edilen</Typography>
        <Box sx={{ mt: '14px' }}>
          <MonthCalendar
            month={from}
            selected={from}
            marked={(iso) => isBusyDay(placement, school, iso)}
            onSelect={(iso) => {
              if (iso < TODAY) { toast('Geçen sene saýlap bolmaýar'); return; }
              setFrom(iso);
              setCalendar(false);
            }}
          />
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* ---------------- the catalogue, for the design gallery ----------------
   Every campaign in the app, so a banner can be looked at deliberately
   instead of by waiting for the right slot to come round. */
export function BannerGalleryScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const [open, setOpen] = useState<Banner | null>(null);
  return (
    <SubPage title="Bannerler" onBack={onBack} help="Mugt hasapda görkezilýän ähli bannerler.">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
        {BANNERS.map((b) => (
          <BannerCard
            key={b.id}
            brand={b.brand} title={b.title} note={b.blurb}
            art={b.art} tint={b.tint} ink={b.ink}
            onOpen={() => setOpen(b)}
          />
        ))}
      </Box>
      {open && (
        <BannerDetailSheet banner={open} open onClose={() => setOpen(null)} toast={toast} />
      )}
      <Box sx={{ height: 24 }} />
    </SubPage>
  );
}

/* re-exported so a page can show the check mark next to a chosen slot without
   reaching into the data module for the label */
export { CheckIcon };
