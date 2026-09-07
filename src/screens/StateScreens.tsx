import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SparkleIcon } from '../components/Icons';
import { PillHeader, RowChevron, SectionLabel, SnapSlides, SubPage, SurfaceRow } from '../components/Ui';
import { tokens } from '../theme';

/*
 * The pages nobody designs until the day they are needed.
 *
 * Two families live here. **Error states** — no connection, nothing found, a
 * page that broke, an account that is not allowed in — which the app used to
 * meet with a bare toast or, worse, an empty screen. And the **onboarding**,
 * which is the first thing a new family ever sees.
 *
 * They share a shape on purpose: one drawing, one sentence of what happened,
 * one sentence of what to do, one action. That shape is the whole point —
 * a person meeting an error is not reading, they are scanning for the way out,
 * and every extra element is between them and it.
 *
 * The illustrations are drawn here, in the app's own stroke weight, for the
 * same reason `PrizeArt` is: there is no image pipeline, and a line drawing
 * that matches the icons is honest where a stock illustration is not.
 */

/* ---------------- the drawings ---------------- */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const;
const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export type ArtId = 'offline' | 'empty' | 'broken' | 'locked' | 'notfound' | 'maintenance';

const ART: Record<ArtId, ReactNode> = {
  /* a cloud with a slash — the connection, cut */
  offline: (
    <>
      <path d="M18 44h30a10 10 0 0 0 .6-20 15 15 0 0 0-28.4-4A11 11 0 0 0 18 44Z" {...S} {...round} />
      <path d="M14 14 58 54" {...S} {...round} />
    </>
  ),
  /* an open box with nothing in it */
  empty: (
    <>
      <path d="M12 26h48v28a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V26Z" {...S} {...round} />
      <path d="M8 26 18 12h36l10 14" {...S} {...round} />
      <path d="M28 38h16" {...S} {...round} />
    </>
  ),
  /* a page torn across the middle */
  broken: (
    <>
      <path d="M18 8h24l12 12v14" {...S} {...round} />
      <path d="M42 8v12h12" {...S} {...round} />
      <path d="M18 8v26" {...S} {...round} />
      <path d="M10 38h52l-6 6 6 6-52 .2 6-6-6-6Z" {...S} {...round} />
      <path d="M18 58h36" {...S} {...round} strokeDasharray="4 5" />
    </>
  ),
  /* a padlock, closed */
  locked: (
    <>
      <rect x="16" y="30" width="36" height="28" rx="6" {...S} />
      <path d="M24 30v-8a10 10 0 0 1 20 0v8" {...S} {...round} strokeWidth={2.1} />
      <circle cx="34" cy="43" r="3.4" {...S} />
    </>
  ),
  /* a magnifier over nothing */
  notfound: (
    <>
      <circle cx="30" cy="30" r="16" {...S} />
      <path d="M42 42 58 58" {...S} {...round} strokeWidth={2.2} />
      <path d="M24 30h12" {...S} {...round} />
    </>
  ),
  /* a spanner across a gear — planned work */
  maintenance: (
    <>
      <circle cx="26" cy="26" r="9" {...S} />
      <path d="M26 8v6M26 38v6M8 26h6M38 26h6M14 14l4 4M38 38l4 4M42 10l-4 4M14 38l-4 4" {...S} {...round} />
      <path d="M40 56 56 40a7 7 0 0 0-9-9L31 47l4 4 5-5 5 5-5 5Z" {...S} {...round} />
    </>
  ),
};

/** The drawing, at whatever size the state page asks for. */
export function StateArt({ art, size = 120, tint = tokens.blueTint, ink = tokens.blue }: {
  art: ArtId; size?: number; tint?: string; ink?: string;
}) {
  return (
    <Box aria-hidden sx={{
      width: size, height: size, borderRadius: '50%', bgcolor: tint, color: ink,
      display: 'grid', placeItems: 'center', mx: 'auto',
    }}>
      <Box component="svg" viewBox="0 0 68 68" sx={{ width: size * 0.6, height: size * 0.6 }}>
        {ART[art]}
      </Box>
    </Box>
  );
}

/*
 * One state page.
 *
 * Title, one line, one button, and — when there is one — a quiet second way
 * out underneath. Never two primary buttons: a person who has just hit a wall
 * should not also have to choose.
 */
export function StatePage({ art, tint, ink, title, note, action, onAction, secondary, onSecondary }: {
  art: ArtId; tint?: string; ink?: string;
  title: string; note: string;
  action?: string; onAction?: () => void;
  secondary?: string; onSecondary?: () => void;
}) {
  return (
    <Box sx={{
      flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', textAlign: 'center', px: '28px', py: '40px', gap: '6px',
    }}>
      <StateArt art={art} tint={tint} ink={ink} />
      <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', mt: '18px' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14, color: tokens.ink3, lineHeight: 1.55, maxWidth: 300 }}>
        {note}
      </Typography>
      {action && (
        <Button
          variant="contained" disableElevation onClick={onAction}
          sx={{ mt: '18px', minWidth: 180 }}
        >{action}</Button>
      )}
      {secondary && (
        <ButtonBase
          onClick={onSecondary}
          sx={{
            mt: '10px', height: 40, px: '14px', borderRadius: `${tokens.rPill}px`,
            fontSize: 14, fontWeight: 600, color: tokens.blueText,
          }}
        >{secondary}</ButtonBase>
      )}
    </Box>
  );
}

/* ---------------- the catalogue of states ---------------- */

export type StateId =
  | 'offline' | 'notfound' | 'broken' | 'locked' | 'maintenance' | 'empty';

export const STATES: {
  id: StateId; name: string; when: string;
  art: ArtId; tint: string; ink: string;
  title: string; note: string; action: string; secondary?: string;
}[] = [
  {
    id: 'offline', name: 'Baglanyşyk ýok', when: 'Internet kesilende',
    art: 'offline', tint: tokens.orangeTint, ink: tokens.orangeText,
    title: 'Internet ýok',
    note: 'Gündelik açyk maglumatlary görkezýär. Baglanyşyk dikeldilende özi täzelener.',
    action: 'Gaýtadan synanyş', secondary: 'Ýatda saklananlary aç',
  },
  {
    id: 'notfound', name: 'Tapylmady', when: 'Gözlegde netije bolmasa',
    art: 'notfound', tint: tokens.blueTint, ink: tokens.blueText,
    title: 'Hiç zat tapylmady',
    note: 'Başga söz bilen gözläp gör ýa-da süzgüçleri arassala.',
    action: 'Süzgüçleri arassala',
  },
  {
    id: 'broken', name: 'Ýalňyşlyk', when: 'Sahypa ýüklenmedik ýagdaýynda',
    art: 'broken', tint: tokens.redTint, ink: tokens.redText,
    title: 'Bir zat ýalňyş gitdi',
    note: 'Sahypany açyp bilmedik. Täzeden synanyş — gaýtalansa, goldawa ýaz.',
    action: 'Täzeden aç', secondary: 'Goldawa ýaz',
  },
  {
    id: 'locked', name: 'Rugsat ýok', when: 'Hasap girip bilmeýän bölüme',
    art: 'locked', tint: tokens.purpleTint, ink: tokens.purpleText,
    title: 'Bu bölüm ýapyk',
    note: 'Bu maglumat diňe mekdep tarapyndan rugsat berlen hasaplar üçin.',
    action: 'Yza dolan', secondary: 'Rugsat sora',
  },
  {
    id: 'maintenance', name: 'Tehniki işler', when: 'Serwer täzelenende',
    art: 'maintenance', tint: tokens.tealTint, ink: tokens.tealText,
    title: 'Tehniki işler dowam edýär',
    note: 'Gysga wagtda gutarýar. Şu wagt diňe gündelik we rasporýaniýe elýeterli.',
    action: 'Ýagdaýy barla',
  },
  {
    id: 'empty', name: 'Boş', when: 'Bölümde henize çenli maglumat ýok',
    art: 'empty', tint: tokens.blueTint, ink: tokens.blueText,
    title: 'Bu ýerde entek zat ýok',
    note: 'Ilkinji ýazgy peýda bolanda, şu ýerde görüner.',
    action: 'Yza dolan',
  },
];

/* ---------------- onboarding ---------------- */

/*
 * The first three screens.
 *
 * Three, because a fourth is where people start pressing "skip" — and each one
 * carries a *fact*, not a feeling: how much material there is, what the diary
 * does, what the free account gets. The last slide is the only one that asks
 * for anything, and what it asks for is a school code, which is the one thing
 * the app genuinely cannot work without.
 *
 * Skip is on every slide from the first. A new user who already knows what
 * they came for should not be made to swipe through an advert to get in.
 */
export const ONBOARDING: { id: string; art: ArtId; tint: string; ink: string; title: string; note: string }[] = [
  {
    id: 'diary', art: 'empty', tint: tokens.blueTint, ink: tokens.blueText,
    title: 'Gündelik — elmydama ýanyňda',
    note: 'Bahalar, öý işleri we mugallymyň bellikleri her gün täzelenýär. Ene-ata gol çekýär, okuwçy ýerine ýetirenini bellik edýär.',
  },
  {
    id: 'learn', art: 'notfound', tint: tokens.greenTint, ink: tokens.greenText,
    title: '1–12-nji synp okuw gollanmalary',
    note: 'Sapaklar, testler, öwrediji kartlar we interaktiw gönükmeler — programma boýunça, tema-tema.',
  },
  {
    /* What the app does with the marks once it has them. The three slides
       before this said what the app *holds*; a parent's own question is what
       it tells them, and a pupil's is what they get out of it. */
    id: 'analytics', art: 'maintenance', tint: tokens.purpleTint, ink: tokens.purpleText,
    title: 'Bilim analitikasy we höweslendiriji gurallar',
    note: 'Hepdelik ýetişik, çärýek ortaçasy we ýylyň kartasy — bahalardan hasaplanýar. Öý işi we test bolsa bal getirýär: ýyldyzlar, bäsleşikler we balansa öwrülýän ballar.',
  },
  {
    id: 'free', art: 'locked', tint: tokens.orangeTint, ink: tokens.orangeText,
    title: 'Gündelik hemişe mugt',
    note: 'Bahalar, rasporýaniýe we mugallymlar bilen söhbet — töleg soralmaýar. Günde bir test we bir toplum hem mugt.',
  },
];

/*
 * The onboarding itself: a scroll-snap track, dots, and one button that says
 * what it does. The track is the app shell's own mechanism, so a swipe behaves
 * the way every other horizontal surface in the app behaves.
 */
export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  return (
    <Box sx={{
      /* it fills the phone frame it is mounted in — the tab bar and the day
         strip do not exist yet for someone who has not arrived */
      height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fff',
      pt: 'env(safe-area-inset-top)',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: '10px 12px' }}>
        <ButtonBase
          onClick={onDone}
          sx={{ height: 40, px: '14px', borderRadius: `${tokens.rPill}px`, fontSize: 14, color: tokens.ink3 }}
        >Ätle</ButtonBase>
      </Box>

      {/* the app's one snapping track — same scrolling, same dots as the
          banner descriptions and the premium page's promises */}
      <SnapSlides
        labels={ONBOARDING.map((s) => s.title)}
        sx={{ flex: 1 }}
        footer={({ at, last, go }) => (
          <Box sx={{ px: tokens.gutter, pb: 'calc(18px + env(safe-area-inset-bottom))' }}>
            <Button
              fullWidth variant="contained" disableElevation
              onClick={() => (last ? onDone() : go(at + 1))}
            >{last ? 'Başla' : 'Dowam et'}</Button>
          </Box>
        )}
      >
        {ONBOARDING.map((slide) => (
          <Box key={slide.id} sx={{
            height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', textAlign: 'center', px: '30px', gap: '8px',
          }}>
            <StateArt art={slide.art} size={140} tint={slide.tint} ink={slide.ink} />
            <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px', mt: '20px' }}>
              {slide.title}
            </Typography>
            <Typography sx={{ fontSize: 15, color: tokens.ink3, lineHeight: 1.55, maxWidth: 320 }}>
              {slide.note}
            </Typography>
          </Box>
        ))}
      </SnapSlides>
    </Box>
  );
}

/* ---------------- the gallery, for Sazlamalar ---------------- */

/*
 * Every state page in one list.
 *
 * These screens are, by definition, the ones nobody sees during a normal
 * day — which is exactly why they rot. A page in this list is a page somebody
 * can look at deliberately, and a designer can hand to a developer without
 * having to unplug the wifi to find it.
 */
export function CustomPagesScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<StateId | 'onboarding' | null>(null);

  if (open === 'onboarding') return <OnboardingScreen onDone={() => setOpen(null)} />;

  if (open) {
    const st = STATES.find((x) => x.id === open)!;
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PillHeader title={st.name} onBack={() => setOpen(null)} />
        <StatePage
          art={st.art} tint={st.tint} ink={st.ink}
          title={st.title} note={st.note}
          action={st.action} onAction={() => setOpen(null)}
          secondary={st.secondary} onSecondary={() => setOpen(null)}
        />
      </Box>
    );
  }

  return (
    <SubPage
      title="Ýörite sahypalar"
      onBack={onBack}
      help="Programmanyň adaty ýagdaýda görünmeýän sahypalary: ýalňyşlyklar, boş bölümler we ilkinji tanyşdyryş. Barlamak we görkezmek üçin şu ýerden açyp bolýar."
    >
      <SectionLabel>Tanyşdyryş</SectionLabel>
      <SurfaceRow
        icon={<Box sx={{
          width: 44, height: 44, borderRadius: `${tokens.rRow}px`, flex: 'none',
          bgcolor: tokens.blueTint, color: tokens.blueText, display: 'grid', placeItems: 'center',
        }}><SparkleIcon size={20} /></Box>}
        label="Ilkinji açylyş"
        sub={`${ONBOARDING.length} sahypa · täze ulanyjy üçin`}
        end={<RowChevron />}
        onClick={() => setOpen('onboarding')}
      />

      <SectionLabel>Ýagdaý sahypalary</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {STATES.map((st) => (
          <SurfaceRow
            key={st.id}
            icon={<StateArt art={st.art} size={44} tint={st.tint} ink={st.ink} />}
            label={st.name}
            sub={st.when}
            end={<RowChevron />}
            onClick={() => setOpen(st.id)}
          />
        ))}
      </Box>
      <Box sx={{ height: '16px' }} />
    </SubPage>
  );
}
