import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertIcon, CheckIcon, ChevronIcon, DocIcon, ImageIcon, LockIcon, PhoneIcon,
  QuestionOutlineIcon, SendIcon, ShieldIcon, SparkleIcon, TabBookIcon,
} from '../components/Icons';
import {
  GradeBadge, GradeSlot, RowEnd, SectionLabel, Segmented, SheetDrawer,
  SubPage, SurfaceRow, ToggleSwitch,
} from '../components/Ui';
import { BadgeScore } from './BadgeScreens';
import { absDate } from '../lib/date';
import { tierName, usePrefs } from '../state/prefs';
import { LABEL_SX, NEUTRAL, RowGroup, rowIcon } from './settingsBits';
import type { Toast } from './settingsBits';
import { tokens } from '../theme';

/*
 * Kömek merkezi — one door for everything a user asks the app about.
 *
 * Help used to be three rows in the settings list — FAQ, materials, support —
 * plus "Programma barada" hiding a version number two rows below them. Four
 * entries for one intention ("I am stuck"), and the reader had to guess which
 * of the four holds their answer before they know what kind of answer it is.
 * They are now one section and one page: read (gollanmalar), ask (FAQ), talk to
 * a person (goldaw), in the order a person actually tries them.
 *
 * The guides are split by **who is asking**, because this app is four different
 * apps depending on who opens it: a parent signs and reads, a student does
 * homework, a teacher records marks, a principal publishes and reports. A single
 * "how to use Gündelik" list is wrong for all four. The role picker is the first
 * control on the page for that reason, and it moves the FAQ with it: the same
 * question ("baha nädip üýtgedilýär?") has a different answer depending on which
 * side of it you sit.
 */

/* ---------------- guide widgets ----------------
 *
 * A guide is a short article, and the thing it is explaining is a control the
 * reader is looking at right now — so the article shows that control rather
 * than describing it. Every demo below is built from the *same* components the
 * app draws with (`GradeBadge`, `BadgeScore`, `ToggleSwitch`, the homework
 * chip's own shape), so a guide cannot teach a button that no longer looks
 * like that. A screenshot would go stale the first time a radius changed.
 *
 * They are inert on purpose: an article is a place to recognise a control, not
 * to operate one. Tapping it here would do nothing to the reader's own data
 * and teach that the app is unresponsive.
 */
type WidgetId =
  | 'bahalar' | 'ýyldyzlar' | 'öýIşi' | 'gol' | 'günler' | 'faýl' | 'bildiriş'
  | 'söhbet' | 'tarif' | 'kart' | 'test' | 'gulp' | 'hasabat' | 'rollar';

const Panel = ({ children }: { children: ReactNode }) => (
  <Box aria-hidden sx={{
    bgcolor: '#fff', border: `1px solid ${tokens.dividerSoft}`,
    borderRadius: `${tokens.rRow}px`, p: '15px',
    display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start',
  }}>{children}</Box>
);

const Chip = ({ children, tint, ink }: { children: ReactNode; tint: string; ink: string }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: '6px', px: '10px', height: 28,
    borderRadius: `${tokens.rPill}px`, bgcolor: tint, color: ink, fontSize: 13, fontWeight: 600,
  }}>{children}</Box>
);

/* the homework chip, in both of its two states */
const HwChip = ({ done }: { done: boolean }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
    px: '11px', height: 34, borderRadius: `${tokens.rTile}px`,
    bgcolor: done ? tokens.greenTint : tokens.orangeTint,
  }}>
    <Box sx={{
      width: 17, height: 17, borderRadius: '50%', flex: 'none',
      display: 'grid', placeItems: 'center',
      bgcolor: done ? tokens.greenDeep : 'transparent',
      border: done ? 'none' : `1.6px solid ${tokens.orangeText}`,
      color: '#fff',
    }}>{done && <CheckIcon size={9} />}</Box>
    <Typography sx={{
      fontSize: 13.5, fontWeight: 600,
      color: done ? tokens.greenText : tokens.orangeText,
      textDecoration: done ? 'line-through' : 'none',
    }}>№320–326.</Typography>
  </Box>
);

const DayCell = ({ n, day, dot }: { n: number; day: string; dot: boolean }) => (
  <Box sx={{
    position: 'relative', width: 46, height: 62, borderRadius: `${tokens.rTile}px`,
    bgcolor: tokens.surface, display: 'grid', placeItems: 'center', alignContent: 'center',
  }}>
    {dot && <Box sx={{
      position: 'absolute', top: 6, right: 6, width: 7, height: 7,
      borderRadius: '50%', bgcolor: tokens.dot,
    }} />}
    <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>{n}</Typography>
    <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>{day}</Typography>
  </Box>
);

const Bubble = ({ mine, children }: { mine?: boolean; children: ReactNode }) => (
  <Box sx={{
    maxWidth: '82%', p: '8px 12px', fontSize: 13.5, lineHeight: 1.45,
    ...(mine
      ? {
        alignSelf: 'flex-end', bgcolor: tokens.blueSolid, color: '#fff',
        borderRadius: `${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px ${tokens.rRow}px`,
      }
      : {
        alignSelf: 'flex-start', bgcolor: tokens.surface, color: tokens.ink,
        borderRadius: `${tokens.rRow}px ${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px`,
      }),
  }}>{children}</Box>
);

const Bar = ({ label, pct, tone }: { label: string; pct: number; tone: string }) => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink2, fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
        {pct}%
      </Typography>
    </Box>
    <Box sx={{ height: 6, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.surfacePress, overflow: 'hidden' }}>
      <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: tone, borderRadius: `${tokens.rPill}px` }} />
    </Box>
  </Box>
);

const WIDGETS: Record<WidgetId, ReactNode> = {
  bahalar: (
    <Panel>
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <GradeBadge grade={5} />
        <GradeBadge grade={4} />
        <GradeBadge grade={3} />
        <GradeBadge grade={2} />
        <GradeSlot grade={null} />
      </Box>
    </Panel>
  ),
  'ýyldyzlar': (
    <Panel>
      <BadgeScore good={3} bad={1} />
    </Panel>
  ),
  'öýIşi': (
    <Panel>
      <HwChip done={false} />
      <HwChip done />
    </Panel>
  ),
  gol: (
    <Panel>
      <Box sx={{
        width: '100%', p: '12px 14px', borderRadius: `${tokens.rTile}px`, bgcolor: tokens.greenTint,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: tokens.greenText }}>
            Ene-ata gol çekdi
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.ink3, mt: '2px' }}>12.02.2026</Typography>
        </Box>
        <Box sx={{
          width: 30, height: 30, borderRadius: '50%', bgcolor: '#fff',
          color: tokens.greenDeep, display: 'grid', placeItems: 'center',
        }}><CheckIcon size={13} /></Box>
      </Box>
      <Box sx={{
        width: '100%', p: '12px 14px', borderRadius: `${tokens.rTile}px`, bgcolor: tokens.surface,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Ene-ata gol çekmedi</Typography>
        <Chip tint={tokens.blue} ink="#fff">Barla</Chip>
      </Box>
    </Panel>
  ),
  'günler': (
    <Panel>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <DayCell n={9} day="Duş" dot />
        <DayCell n={10} day="Siş" dot />
        <DayCell n={11} day="Çar" dot={false} />
        <DayCell n={12} day="Pen" dot={false} />
      </Box>
    </Panel>
  ),
  'faýl': (
    <Panel>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '9px',
        px: '11px', height: 36, borderRadius: `${tokens.rPill}px`,
        border: `1px solid ${tokens.dividerSoft}`,
      }}>
        <Box sx={{
          width: 22, height: 22, borderRadius: `${tokens.rCell}px`, bgcolor: tokens.redTint,
          color: tokens.redText, display: 'grid', placeItems: 'center',
        }}><DocIcon size={13} /></Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Rasporýaniýe.pdf</Typography>
        <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>180 KB</Typography>
      </Box>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '9px',
        px: '11px', height: 36, borderRadius: `${tokens.rPill}px`,
        border: `1px solid ${tokens.dividerSoft}`,
      }}>
        <Box sx={{
          width: 22, height: 22, borderRadius: `${tokens.rCell}px`, bgcolor: tokens.purpleTint,
          color: tokens.purpleText, display: 'grid', placeItems: 'center',
        }}><ImageIcon size={13} /></Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Mekdep-shemasy.png</Typography>
        <Typography sx={{ fontSize: 12, color: tokens.inkMuted }}>1.2 MB</Typography>
      </Box>
    </Panel>
  ),
  'bildiriş': (
    <Panel>
      {[['Ähli bildirişler', true], ['Bahalar', true], ['Öý işi', false]].map(([label, on]) => (
        <Box key={String(label)} sx={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
          opacity: label === 'Ähli bildirişler' ? 1 : 0.9,
        }}>
          <Typography sx={{
            flex: 1, fontSize: 14,
            fontWeight: label === 'Ähli bildirişler' ? 700 : 500,
          }}>{label}</Typography>
          <ToggleSwitch on={Boolean(on)} />
        </Box>
      ))}
    </Panel>
  ),
  'söhbet': (
    <Panel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%' }}>
        <Bubble>Salam! Ertirki barlag işi haýsy temalardan?</Bubble>
        <Bubble mine>§18–§21, esasan Wieta teoremasy.</Bubble>
      </Box>
    </Panel>
  ),
  tarif: (
    <Panel>
      <Box sx={{ display: 'flex', gap: '7px', width: '100%' }}>
        <Chip tint={tokens.surfacePress} ink={tokens.ink2}>Mugt</Chip>
        <Chip tint={tokens.surfacePress} ink={tokens.ink2}>Göreldeli</Chip>
        <Chip tint={tokens.blue} ink="#fff">Zehinli</Chip>
      </Box>
    </Panel>
  ),
  kart: (
    <Panel>
      <Box sx={{ display: 'flex', gap: '9px', width: '100%' }}>
        {[['Diskriminant', tokens.surface, tokens.ink], ['D = b² − 4ac', tokens.blueTint, tokens.blueText]]
          .map(([text, bg, ink]) => (
            <Box key={String(text)} sx={{
              flex: 1, height: 64, borderRadius: `${tokens.rTile}px`, bgcolor: String(bg),
              color: String(ink), display: 'grid', placeItems: 'center',
              fontSize: 13.5, fontWeight: 700,
            }}>{text}</Box>
          ))}
      </Box>
    </Panel>
  ),
  test: (
    <Panel>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '50%', flex: 'none',
          border: `4px solid ${tokens.green}`, display: 'grid', placeItems: 'center',
          fontSize: 15, fontWeight: 700,
        }}>8/10</Box>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>2 sorag ýalňyş</Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }}>
            Her ýalňyşyň dogry jogaby görkezilýär
          </Typography>
        </Box>
      </Box>
    </Panel>
  ),
  gulp: (
    <Panel>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '11px', width: '100%',
        p: '10px 12px', borderRadius: `${tokens.rTile}px`, bgcolor: tokens.surface,
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: `${tokens.rCell}px`, flex: 'none',
          bgcolor: tokens.surfacePress, color: tokens.inkMuted,
          display: 'grid', placeItems: 'center',
        }}><LockIcon size={15} /></Box>
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: tokens.ink3 }}>
          5-nji synp · 20 sapak
        </Typography>
        <Chip tint={tokens.blueTint} ink={tokens.blueText}>Premium</Chip>
      </Box>
    </Panel>
  ),
  hasabat: (
    <Panel>
      <Bar label="8 «A»" pct={86} tone={tokens.green} />
      <Bar label="8 «B»" pct={74} tone={tokens.blue} />
      <Bar label="8 «C»" pct={61} tone={tokens.orange} />
    </Panel>
  ),
  rollar: (
    <Panel>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        <Chip tint={tokens.blueTint} ink={tokens.blueText}>Mugallym</Chip>
        <Chip tint={tokens.greenTint} ink={tokens.greenText}>Synp ýolbaşçysy</Chip>
        <Chip tint={tokens.purpleTint} ink={tokens.purpleText}>Müdiriň orunbasary</Chip>
        <Chip tint={tokens.surfacePress} ink={tokens.ink2}>Ýapyk hasap</Chip>
      </Box>
    </Panel>
  ),
};

/* ---------------- guides ---------------- */

type Block =
  | { p: string }
  | { w: WidgetId; caption: string }
  | { steps: string[] }
  | { note: string };

type Doc = { title: string; len: string; blocks: Block[] };
type Qa = { q: string; a: string };

type RoleId = 'ene-ata' | 'okuwçy' | 'mugallym' | 'müdir';

const ROLES: { id: RoleId; label: string; who: string; docs: Doc[]; faq: Qa[] }[] = [
  {
    id: 'ene-ata',
    label: 'Ene-ata',
    who: 'Çagaňyzyň gününi okamak, gol çekmek we mugallym bilen habarlaşmak.',
    docs: [
      {
        title: 'Gündelik sahypasy',
        len: '3 min',
        blocks: [
          { p: 'Gündelik bir güni görkezýär. Ýokardaky hatardan güni saýlaýarsyňyz, aşagynda şol günüň sapaklary sagady bilen durýar.' },
          { w: 'günler', caption: 'Sag ýokarky nokat — şol güne gol çekilendigini aňladýar. Nokat ýok bolsa, gün heniz barlanmadyk.' },
          { p: 'Sapagyň setirinde çepde sagat, ortada ders bilen tema, sagda bolsa mugallymyň ýazan zady — ýyldyz we baha durýar.' },
          { note: 'Şenbe hem okuw güni. Diňe ýekşenbe kesgin dynç güni hökmünde solgun görkezilýär.' },
        ],
      },
      {
        title: '“Barla” we gol çekmek',
        len: '2 min',
        blocks: [
          { p: 'Gol — kagyz gündelikdäki goluň ornuny tutýar: şol günüň maglumaty bilen tanşandygyňyzy bildirýär.' },
          { w: 'gol', caption: 'Gol çekilmedik gün «Barla» düwmesini görkezýär; gol çekilenden soň panel ýaşyl bolýar we soramagyny bes edýär.' },
          { steps: [
            'Barlamakçy bolýan günüňizi saýlaň.',
            'Sapaklary, bahalary we öý işini okaň.',
            'Aşakdaky «Barla» düwmesine basyň.',
          ] },
          { note: 'Gol her güne aýratyn goýulýar — bir gezek basmak tutuş hepdäni tassyklamaýar.' },
        ],
      },
      {
        title: 'Bahalar we ýyldyzlar',
        len: '3 min',
        blocks: [
          { p: 'Baha — işiň netijesi. Ol 2-den 5-e çenli bolýar we reňki bahanyň özünden gelýär, şonuň üçin sanawy sürüp geçeniňizde reňk ýalňyş düşünje bermeýär.' },
          { w: 'bahalar', caption: 'Iň sagdaky boş öýjük — «baha heniz goýulmadyk» diýmek. Ol hemişe şol bir ýerde durýar, şonuň üçin baha bilen başga zat çalyşmaýar.' },
          { p: 'Ýyldyz — işiň nähili edilendigi: ýygnanyşyk, tertip, kömek. Ol baha täsir etmeýär, ýöne çärýegiň dowamynda surat berýär.' },
          { w: 'ýyldyzlar', caption: 'Ýaşyl — ýagşy, gyzyl — üns bermeli. Iki san hemişe bilelikde görkezilýär.' },
        ],
      },
      {
        title: 'Mugallym bilen ýazyşmak',
        len: '2 min',
        blocks: [
          { p: 'Habarlar bölüminde her mugallym bilen aýratyn söhbet, şeýle hem synpyň umumy topary bar.' },
          { w: 'söhbet', caption: 'Söhbet sapaga bagly açylanda, haýsy gün we haýsy ders barada gürrüň gidýändigi öz-özünden düşnükli bolýar.' },
          { w: 'faýl', caption: 'Ugradylan faýl ady we göwrümi bilen görünýär — ýüklemezden öň nämedigi belli.' },
          { note: 'Mugallymyň okan wagty söhbetde bellenýär, şonuň üçin gaýtalap ýazmak hökman däl.' },
        ],
      },
      {
        title: 'Bildirişleri sazlamak',
        len: '2 min',
        blocks: [
          { p: 'Sazlamalar → Bildirişler bölüminde haýsy habarlaryň geljegini saýlaýarsyňyz.' },
          { w: 'bildiriş', caption: 'Ýokarky esasy açar ýapylsa, aşakdaky ähli setirler işlemeýär we solgun görkezilýär — sazlama ýitmeýär, diňe wagtlaýyn ýapylýar.' },
          { note: 'Bildiriş gelmese, telefonyň öz sazlamalarynda programma rugsat berlendigini hem barlaň.' },
        ],
      },
      {
        title: 'Birnäçe çaga bir hasapda',
        len: '2 min',
        blocks: [
          { p: 'Bir ene-ata hasabyna birnäçe çagany baglap bolýar. Her çaganyň gündeligi, tölegi we bildirişleri aýratyn saklanýar.' },
          { steps: [
            'Profil → Maglumatlary üýtget.',
            '«Çaga goş» — mekdebiň beren kodyny giriziň.',
            'Ýokarky at arkaly çagalaryň arasynda geçiň.',
          ] },
          { note: 'Kody mekdebiň okuw bölümi berýär; ol her çaga üçin bir gezeklik.' },
        ],
      },
      {
        title: 'Abuna we tölegler',
        len: '4 min',
        blocks: [
          { p: 'Gündeligiň özi — bahalar, öý işi, gatnaşyk — mugt. Tölegli tarifler diňe okuw serişdelerini we derňewi açýar.' },
          { w: 'tarif', caption: 'Häzirki tarifiňiz mawy bilen bellenýär. Tarifi islendik wagt üýtgetmek bolýar; galan günler hasaba alynýar.' },
          { steps: [
            'Sazlamalar → Abuna.',
            'Tarifi we möhleti (aý ýa-da ýyl) saýlaň.',
            'Karty goşuň we tölegi tassyklaň.',
          ] },
          { note: 'Çekler Abuna → Taryh bölüminde saklanýar. Ýyllyk töleg aýlygyň jeminden arzan.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Gol çekmek näme üçin gerek?',
        a: 'Gol — günüň maglumaty bilen tanşandygyňyzy tassyklaýar. Ol kagyz gündelikdäki goluň ornuny tutýar: mugallym haýsy günleriň barlanandygyny görýär, siz bolsa gündelikde we senenamada nokat görýärsiňiz.',
      },
      {
        q: 'Baha ýalňyş goýlan bolsa näme etmeli?',
        a: 'Bahany diňe ony goýan mugallym üýtgedip bilýär. Sapagy açyň, «Mugallyma ýaz» düwmesi arkaly ýazyň — söhbet şol sapaga bagly bolýar, şonuň üçin haýsy gün we haýsy ders barada gürrüň gidýändigi öz-özünden düşnükli.',
      },
      {
        q: 'Iki çagam bar — bir hasapdan görüp bilerinmi?',
        a: 'Hawa. Profil → Maglumatlary üýtget bölüminden çagany goşmak bolýar; ýokarky at arkaly aralarynda geçilýär. Her çaganyň gündeligi, tölegleri we bildirişleri aýratyn saklanýar.',
      },
      {
        q: 'Bildirişler gelmeýär',
        a: 'Sazlamalar → Bildirişler bölüminde esasy açar açyk bolmaly; ol ýapyk bolsa galan setirler hem işlemeýär. Soňra telefonyň öz sazlamalarynda Gündelik programmasyna bildiriş rugsadynyň berlendigini barlaň.',
      },
    ],
  },
  {
    id: 'okuwçy',
    label: 'Okuwçy',
    who: 'Sapaklar, öý işi, kartlar we testler — her günki ulanyş.',
    docs: [
      {
        title: 'Sapaklar we öý işi',
        len: '3 min',
        blocks: [
          { p: 'Ýokardaky hatardan güni saýlaýarsyň, aşakda şol günüň sapaklary çykýar. Sapagyň üstüne bassaň tema, öý işi we mugallymyň belligi doly açylýar.' },
          { w: 'günler', caption: 'Hatar ekrandan giň — çepe-saga süýşürilýär. Sag gyradaky solgunlyk ýene günleriň bardygyny aňladýar.' },
          { w: 'öýIşi', caption: 'Öý işi setirde durýar: ýokarkysy edilmedik, aşakdakysy bellenen.' },
        ],
      },
      {
        title: 'Öý işini bellemek',
        len: '1 min',
        blocks: [
          { p: 'Öý işiniň ýanyndaky tegelege basmak ony ýerine ýetirildi diýip belleýär. Sapagy açmak gerek däl.' },
          { w: 'öýIşi', caption: 'Tabşyrygyň teksti üýtgemeýär — diňe reňk, tegelek we üsti çyzyk üýtgeýär, şonuň üçin näme berlendigi hemişe okalýar.' },
          { note: 'Bu belgi diňe seniň üçin. Mugallym ony görmeýär — işiň bahasyny ol sapakda goýýar.' },
        ],
      },
      {
        title: 'Öwrediji kartlar',
        len: '3 min',
        blocks: [
          { p: 'Kartyň bir ýüzünde sorag, beýleki ýüzünde jogap. Karty açyp, bildiňmi ýa-da bilmediňmi diýip özüň belleýärsiň.' },
          { w: 'kart', caption: 'Bilmedik kartlaryň toparyň soňuna gaýtadan goşulýar we şol gün ýene bir gezek çykýar.' },
          { steps: [
            'Gollanmalar → Öwrediji kartlar.',
            'Dersi we toplumy saýla.',
            'Karty aç, jogaby ýatla, soňra ýüzüni öwür.',
          ] },
          { note: 'Açylan toplumlar enjamda galýar — internetsiz hem gaýtalap bolýar.' },
        ],
      },
      {
        title: 'Testden öň taýýarlyk',
        len: '3 min',
        blocks: [
          { p: 'Test bir soragy bir ekranda görkezýär. Yza gaýdyp jogaby üýtgetmek bolýar, soňky ädimde barysy tabşyrylýar.' },
          { w: 'test', caption: 'Netijeden soň her ýalňyş sorag dogry jogaby bilen görkezilýär — bal däl-de, şol sanaw peýdaly.' },
          { steps: [
            'Gollanmalar → Testler → dersi saýla.',
            'Testi tamamla we netijäni aç.',
            'Ýalňyş soraglary okap, şol temany kartlarda gaýtala.',
          ] },
        ],
      },
      {
        title: 'Akylly mugallymdan sorag',
        len: '3 min',
        blocks: [
          { p: 'Akylly mugallym sapak boýunça düşündirýär, mysal berýär we ýalňyşy tapmaga kömek edýär.' },
          { w: 'söhbet', caption: 'Näçe anyk sorasaň, şonça peýdaly jogap: «matematika düşünmedim» däl-de, «diskriminant näme üçin gerek?».' },
          { note: 'Söhbetleriň taryhy saklanýar — ýokarky sagatly nyşan öň soranlaryňy açýar. Sapak sahypasyndan soralan soraglar hem şol ýerde jemlenýär.' },
        ],
      },
      {
        title: 'Sapak ýoly (Sapaklar)',
        len: '2 min',
        blocks: [
          { p: 'Sapaklar — 1-nji synpdan 12-nji synpa çenli uzalyp gidýän ýol. Programma seni hemişe indiki sapagyň üstüne getirýär.' },
          { w: 'gulp', caption: 'Gulply bölüm näçe sapagyň ýapykdygyny we ony näme açýandygyny aç-açan ýazýar.' },
          { steps: [
            'Gollanmalar → Sapaklar.',
            '«Başla» ýazgyly düwme — seniň häzirki sapagyň.',
            'Tamamlanan synplar ýygrylýar, gerek bolsa açylýar.',
          ] },
        ],
      },
      {
        title: 'Bäsleşikler we ýyldyzlar',
        len: '2 min',
        blocks: [
          { p: 'Testler, kartlar we bäsleşikler bal getirýär. Ballar synpdaky ornuňy kesgitleýär we çärýek çalşanda pozulmaýar.' },
          { w: 'ýyldyzlar', caption: 'Mugallymyň ýyldyzlary aýry hasaplanýar — olar bal däl, häsiýetnama.' },
          { note: 'Bäsleşige gatnaşmak üçin öňünden ýazylmaly: sahypada galan wagt görkezilýär.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Öý işini bellesem mugallym görýärmi?',
        a: 'Ýok. Bu belgi diňe seniň üçin — näme edilendigini ýatda saklamaga kömek edýär. Işiň hakyky bahasyny mugallym sapakda goýýar.',
      },
      {
        q: 'Internet ýok wagty işleýärmi?',
        a: 'Açylan sapaklar we kartlar enjamda saklanýar, olary internetsiz gaýtalap bolýar. Test netijeleri we öý işi belgileri baglanyşyk dikelende ugradylýar.',
      },
      {
        q: 'Test netijesi gündelige düşýärmi?',
        a: 'Ýok. Gollanmalardaky testler — öz-özüňi barlamak üçin. Gündelige diňe mugallymyň goýan bahasy düşýär.',
      },
      {
        q: 'Akylly mugallym öý işimi meniň ýerime edýärmi?',
        a: 'Ol jogaby däl-de, ýoly görkezýär: düşündirýär, mysal berýär, ýalňyşyňy tapmaga kömek edýär. Söhbetleriň taryhy saklanýar, şonuň üçin öň soran zadyňy soň hem tapyp bolýar.',
      },
    ],
  },
  {
    id: 'mugallym',
    label: 'Mugallym',
    who: 'Baha we ýyldyz goýmak, öý işi bermek, synp bilen habarlaşmak.',
    docs: [
      {
        title: 'Synp žurnaly: baha goýmak',
        len: '4 min',
        blocks: [
          { p: 'Žurnal sapak boýunça işleýär: güni we dersi saýlaýarsyňyz, synpyň sanawy çykýar, her okuwçynyň gapdalyna baha goýulýar.' },
          { w: 'bahalar', caption: 'Baha 2-den 5-e çenli. Reňk awtomatiki — aýratyn saýlanmaýar, şonuň üçin žurnalda bir baha iki dürli görnüşde bolup bilmeýär.' },
          { steps: [
            'Güni we sapagy saýlaň.',
            'Okuwçynyň setirine basyp bahany saýlaň.',
            'Gerek bolsa gysgaça düşündiriş ýazyň — ol ene-ata görünýär.',
          ] },
          { note: 'Baha goýlan badyna okuwçynyň we ene-atanyň gündeligine düşýär. Şol gün üýtgetmek bolýar.' },
        ],
      },
      {
        title: 'Ýyldyzlar: ýagşy we üns bermeli',
        len: '2 min',
        blocks: [
          { p: 'Baha — işiň netijesi, ýyldyz — işiň nähili edilendigi. Sapaga taýýarlyk, kömek, tertip — bular ýyldyz bilen bellenýär.' },
          { w: 'ýyldyzlar', caption: 'Ýyldyzlar çärýegiň dowamynda jemlenýär we häsiýetnama üçin taýýar surat berýär.' },
          { note: '«Üns bermeli» — käýinç däl. Söz bilelikde işlemeli zady aňladýar we ene-ata şeýle okaýar.' },
        ],
      },
      {
        title: 'Öý işi bermek we barlamak',
        len: '3 min',
        blocks: [
          { p: 'Öý işi sapaga ýazylýar we şol synpyň ähli okuwçysynyň gündeligine bir wagtda düşýär.' },
          { w: 'öýIşi', caption: 'Okuwçy ony özi üçin bellemek bilen ýerine ýetirdim diýip belleýär; bu baha däl-de, ýatlatma.' },
          { steps: [
            'Sapagy açyň → «Öý işi».',
            'Tabşyrygy ýazyň we möhleti saýlaň.',
            'Gerek bolsa aýratyn okuwça goşmaça tabşyryk goşuň.',
          ] },
        ],
      },
      {
        title: 'Tema we rasporýaniýe',
        len: '3 min',
        blocks: [
          { p: 'Her sapagyň temasy gündelikde tekst bolup görünýär — ol ene-ata we okuwça näme geçilendigini aýdýar.' },
          { steps: [
            'Sapagy açyň → «Tema» meýdanyny dolduryň.',
            'Çalyşma bolsa, sapagy başga dersе geçiriň — üýtgeşme bildiriş bolup ugraýar.',
            'Geçilmedik sapagy sebäbi bilen belläň.',
          ] },
          { note: 'Boş tema — gündelikde boş setir. Ony doldurmak ene-atanyň iň köp soraýan zadyny aradan aýyrýar.' },
        ],
      },
      {
        title: 'Synp bilen habarlaşmak',
        len: '3 min',
        blocks: [
          { p: 'Her synpyň umumy topary we her ene-ata bilen şahsy söhbeti bar.' },
          { w: 'söhbet', caption: 'Toparda birnäçe habar biri-biriniň yzyndan gelse, at diňe bir gezek ýazylýar.' },
          { w: 'faýl', caption: 'Faýl ady we göwrümi bilen ugradylýar, şonuň üçin ony açmazdan öň nämedigi belli.' },
          { note: 'Tutuş synpa degişli habar — söhbet däl-de, bildiriş: ony okuw bölümi arkaly çap etmek has dogry.' },
        ],
      },
      {
        title: 'Gol çekilmedik günler',
        len: '2 min',
        blocks: [
          { p: 'Ene-ata her güne aýratyn gol çekýär. Žurnalda haýsy günleriň gol çekilmändigi görünýär.' },
          { w: 'günler', caption: 'Nokatly gün — gol çekilen; nokatsyz gün — heniz okalmadyk.' },
          { note: 'Ýatlatma ugratmak söhbetden geçýär: bu awtomatiki jerime däl-de, adaty habar.' },
        ],
      },
      {
        title: 'Çärýek jemini çykarmak',
        len: '4 min',
        blocks: [
          { p: 'Çärýegiň jemi goýlan bahalardan hasaplanýar; jemleýji işleriň agramy aýratyn görkezilýär.' },
          { w: 'hasabat', caption: 'Synplaryň deňeşdirmesi şol bir bahalardan alynýar — sanaw bilen hasabat gapma-garşy bolup bilmeýär.' },
          { steps: [
            'Žurnal → Çärýek jemi.',
            'Ortaça bahany we teklip edilýän jemi barlaň.',
            'Tassyklaň — soňra üýtgetme diňe ýolbaşçynyň rugsady bilen.',
          ] },
          { note: 'Tassyklanan jem ene-ata şol bada görünýär.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Goýlan bahany üýtgedip bolýarmy?',
        a: 'Şol günüň dowamynda — hawa, sapagy açyp üýtgetmek bolýar. Ondan soň üýtgetme synp ýolbaşçysynyň tassyklamagy bilen geçýär we her üýtgeşme taryhda galýar.',
      },
      {
        q: 'Öý işini tutuş synpa nädip bermeli?',
        a: 'Sapagy açyň → «Öý işi» bölümine ýazyň → möhleti saýlaň. Ol synpyň ähli okuwçysynyň gündeligine şol bada düşýär; aýratyn okuwçy üçin goşmaça tabşyryk hem goşup bolýar.',
      },
      {
        q: 'Ene-atanyň habaryna näçe wagtda jogap bermeli?',
        a: 'Programma möhlet goýmaýar. Söhbetde okalan wagty görkezilýär, şonuň üçin garaşylýan habarlar öz-özünden görünýär.',
      },
    ],
  },
  {
    id: 'müdir',
    label: 'Müdir',
    who: 'Mekdebiň hasabatlary, bildirişler we ulanyjy hukuklary.',
    docs: [
      {
        title: 'Mekdep hasabatlary',
        len: '5 min',
        blocks: [
          { p: 'Hasabatlar žurnalyň özünden hasaplanýar — aýratyn maglumat girizilmeýär, şonuň üçin hasabat bilen žurnal hemişe gabat gelýär.' },
          { w: 'hasabat', caption: 'Synplaryň deňeşdirmesi ortaça baha ýa-da gatnaşyk boýunça görkezilýär.' },
          { steps: [
            'Mekdep → Hasabatlar.',
            'Çärýegi we görkezijini saýlaň.',
            'XLSX ýa-da PDF görnüşinde ýükläň.',
          ] },
        ],
      },
      {
        title: 'Bildiriş çap etmek',
        len: '3 min',
        blocks: [
          { p: 'Bildiriş — mekdebiň resmi habary. Ol söhbet däl: oňa jogap ýazylmaýar, ol diňe okalýar.' },
          { w: 'faýl', caption: 'Rasporýaniýe, meýilnama ýa-da nusga faýl goşulanda, ol bildirişiň içinde ady bilen görünýär.' },
          { steps: [
            'Mekdep → Bildirişler → «Täze».',
            'Görnüşi saýlaň: mekdep, okuw, çäre ýa-da duýduryş.',
            'Kime degişlidigini saýlaň: tutuş mekdep, synp ýa-da mugallymlar.',
          ] },
          { note: 'Çap edilen bildiriş kimiň okandygyny sanap görkezýär.' },
        ],
      },
      {
        title: 'Hasaplar we hukuklar',
        len: '4 min',
        blocks: [
          { p: 'Hukuk hemişe anyk synpa we derse baglanýar — «hemme zada rugsat» diýen hukuk ýok.' },
          { w: 'rollar', caption: 'Ýapyk hasap maglumaty pozmaýar: goýlan bahalar we ýazgylar galýar, diňe giriş bes edilýär.' },
          { steps: [
            'Mekdep → Mugallymlar → «Goş».',
            'Ady we wezipesini giriziň.',
            'Synplary we dersleri belläň.',
          ] },
          { note: 'Synp ýolbaşçysy öz synpynyň ähli derslerini görýär, ýöne başga synpyň bahasyny üýtgedip bilmeýär.' },
        ],
      },
      {
        title: 'Synplar we rasporýaniýe',
        len: '4 min',
        blocks: [
          { p: 'Rasporýaniýe bir gezek girizilýär we tutuş mekdep şondan okaýar. Üýtgeşme girizilende ol gündelikde şol bada görünýär.' },
          { steps: [
            'Mekdep → Synplar → synpy saýlaň.',
            'Hepdelik sapak tertibini dolduryň ýa-da faýldan ýükläň.',
            'Çalyşmany aýratyn gün üçin belläň.',
          ] },
          { note: 'Çalyşma girizilende degişli synpa awtomatiki duýduryş ugradylýar.' },
        ],
      },
      {
        title: 'Çärýek we ýyl jemi',
        len: '3 min',
        blocks: [
          { p: 'Çärýegiň başy we soňy mekdep boýunça bir gezek bellenýär; jemler şol möhletlerden hasaplanýar.' },
          { steps: [
            'Mekdep → Çärýekler.',
            'Senesini belläň we tassyklaň.',
            'Jem çykandan soň çärýegi ýapyň.',
          ] },
          { note: 'Ýapylan çärýegi açmak bolýar, ýöne her üýtgeşme kim we haçan diýip bellenýär.' },
        ],
      },
      {
        title: 'Maglumat howpsuzlygy',
        len: '3 min',
        blocks: [
          { p: 'Okuwçynyň maglumaty diňe oňa degişli adamlara açyk: özi, ene-atasy we şol synpda işleýän mugallymlar.' },
          { w: 'gulp', caption: 'Hukugy ýok bölüm ýapyk görkezilýär we näme üçin ýapykdygyny ýazýar — sessiz gizlenmeýär.' },
          { note: 'Her eksport we her hukuk üýtgeşmesi girişiň taryhynda galýar.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Hasabatlary faýl görnüşinde alyp bolýarmy?',
        a: 'Hawa — synp we çärýek boýunça hasabatlar XLSX we PDF görnüşinde ýüklenýär. Eksport her gezek girişiň taryhynda bellenýär.',
      },
      {
        q: 'Mugallyma hukuk nädip berilýär?',
        a: 'Mekdep → Mugallymlar bölüminden hasap döredilýär we oňa synp bilen ders berilýär. Hukuk diňe berlen synplara degişli bolýar; ýapylan hasap maglumaty pozmaýar, diňe girişi bes edýär.',
      },
      {
        q: 'Ýapylan çärýegi açyp bolýarmy?',
        a: 'Hawa, ýöne yz galdyryp: açylan çärýekdäki her üýtgeşme kim we haçan diýip bellenýär, jemler bolsa gaýtadan hasaplanýar.',
      },
    ],
  },
];

/* ---------------- one guide ----------------
 *
 * Short article, one screen or two: a sentence of what the thing is, the thing
 * itself, then what to do with it. No hero, no cover art, no author — a guide
 * is read once, to solve one problem, and everything above the first sentence
 * is a delay.
 */
export function GuideScreen({ doc, onBack }: { doc: Doc; onBack: () => void }) {
  return (
    <SubPage title={doc.title} onBack={onBack}>
      <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, pt: '14px', fontWeight: 600 }}>
        {`${doc.len} okamak`}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '10px', pb: '8px' }}>
        {doc.blocks.map((b, i) => {
          if ('p' in b) {
            return (
              <Typography key={i} sx={{ fontSize: 15, lineHeight: 1.6, color: tokens.ink2 }}>
                {b.p}
              </Typography>
            );
          }
          if ('w' in b) {
            return (
              <Box key={i}>
                {WIDGETS[b.w]}
                <Typography sx={{
                  fontSize: 13, color: tokens.ink3, lineHeight: 1.5, mt: '9px', px: '2px',
                }}>{b.caption}</Typography>
              </Box>
            );
          }
          if ('steps' in b) {
            return (
              <Box key={i} component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {b.steps.map((s, n) => (
                  <Box key={s} component="li" sx={{
                    display: 'flex', gap: '11px', alignItems: 'flex-start',
                    mt: n === 0 ? 0 : '10px',
                  }}>
                    <Box aria-hidden sx={{
                      width: 22, height: 22, borderRadius: '50%', flex: 'none', mt: '1px',
                      bgcolor: tokens.blueTint, color: tokens.blueText,
                      fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center',
                    }}>{n + 1}</Box>
                    <Typography sx={{ fontSize: 15, lineHeight: 1.5, color: tokens.ink2 }}>{s}</Typography>
                  </Box>
                ))}
              </Box>
            );
          }
          return (
            <Box key={i} sx={{
              display: 'flex', gap: '11px', p: '13px 15px',
              bgcolor: tokens.blueTint, borderRadius: `${tokens.rTile}px`,
            }}>
              <Box aria-hidden sx={{ color: tokens.blueText, flex: 'none', mt: '1px' }}>
                <SparkleIcon size={17} />
              </Box>
              <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: tokens.ink2 }}>{b.note}</Typography>
            </Box>
          );
        })}
      </Box>
    </SubPage>
  );
}

/* An answer that opens in place. Used by both the role FAQ and the full list,
   so a question looks and behaves the same wherever it is read. */
function QaRow({ item, open, onToggle }: { item: Qa; open: boolean; onToggle: () => void }) {
  return (
    <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, overflow: 'hidden' }}>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 52,
          px: '15px', py: '12px', textAlign: 'left', justifyContent: 'flex-start',
        }}
      >
        <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{item.q}</Typography>
        <Box aria-hidden sx={{
          color: tokens.inkMuted, display: 'flex', flex: 'none',
          transform: open ? 'rotate(-90deg)' : 'rotate(90deg)',
          transition: `transform .2s ${tokens.ease}`,
        }}>
          <ChevronIcon size={11} />
        </Box>
      </ButtonBase>
      {open && (
        <Typography sx={{
          fontSize: 14, color: tokens.ink2, lineHeight: 1.55, px: '15px', pb: '15px', mt: '-2px',
        }}>{item.a}</Typography>
      )}
    </Box>
  );
}

/* ---------------- hub ---------------- */

export function HelpScreen({ onBack, onSupport, onFaq }: {
  onBack: () => void; onSupport: () => void; onFaq: () => void;
}) {
  const [role, setRole] = useState<RoleId>('ene-ata');
  const [seen, setSeen] = useState<string[]>([]);
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const r = ROLES.find((x) => x.id === role)!;
  const hour = new Date().getHours();
  const open = hour >= SUPPORT_OPEN.from && hour < SUPPORT_OPEN.to;
  const read = r.docs.filter((d) => seen.includes(d.title)).length;

  if (doc) return <GuideScreen doc={doc} onBack={() => setDoc(null)} />;

  return (
    <SubPage
      title="Kömek merkezi"
      onBack={onBack}
      help="Gollanmalar, ýygy soralýan soraglar we goldaw bir ýerde. Ýokardaky saýlaw kim bolup girýändigiňizi soraýar — mugallymyň we ene-atanyň sowallary başga, şonuň üçin jogaplar hem başga."
    >
      {/* Talking to a person is the last resort but the first thing to be sure
          of: whether anyone is there right now. It is the same SurfaceRow as
          every other destination — a bespoke card here would make the one row
          that is not new look like the one row that matters. */}
      <Box sx={{ pt: '14px' }}>
        <SurfaceRow
          icon={rowIcon(
            <PhoneIcon size={22} />,
            open ? tokens.greenTint : NEUTRAL.tint,
            open ? tokens.greenText : NEUTRAL.ink,
          )}
          label="Goldaw bilen habarlaş"
          labelSx={LABEL_SX}
          end={<RowEnd value={open ? 'Işleýär' : 'Ýapyk'} />}
          onClick={onSupport}
        />
      </Box>

      <SectionLabel>Kim bolup girýärsiňiz</SectionLabel>
      <Segmented
        label="Ulanyjynyň görnüşi"
        value={role}
        options={ROLES.map((x) => ({ id: x.id, label: x.label }))}
        onChange={(id: RoleId) => { setRole(id); setOpenQ(null); }}
      />
      <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '10px', px: '2px', lineHeight: 1.5 }}>
        {r.who}
      </Typography>

      <SectionLabel>{`Gollanmalar · ${read}/${r.docs.length}`}</SectionLabel>
      <RowGroup>
        {r.docs.map((d) => {
          const done = seen.includes(d.title);
          return (
            <SurfaceRow
              key={d.title}
              icon={rowIcon(
                <DocIcon size={20} />,
                done ? tokens.greenTint : tokens.blueTint,
                done ? tokens.greenText : tokens.blueText,
              )}
              label={d.title}
              labelSx={LABEL_SX}
              end={<RowEnd value={d.len} />}
              onClick={() => {
                setSeen((s) => (s.includes(d.title) ? s : [...s, d.title]));
                setDoc(d);
              }}
            />
          );
        })}
      </RowGroup>

      <SectionLabel>Ýygy soralýan soraglar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {r.faq.map((item) => (
          <QaRow
            key={item.q}
            item={item}
            open={openQ === item.q}
            onToggle={() => setOpenQ(openQ === item.q ? null : item.q)}
          />
        ))}
      </Box>
      <Button
        fullWidth variant="text" onClick={onFaq}
        sx={{ mt: '10px', fontSize: 14, fontWeight: 700 }}
      >Programma boýunça ähli soraglar</Button>

    </SubPage>
  );
}

/* ---------------- Programma barada ----------------
 *
 * Its own menu, not a block at the foot of the help centre. What the app *is*
 * and what changed in it are read for a different reason than "how do I sign a
 * day?" — usually before installing, or when something looks unfamiliar after
 * an update — and putting them under the guides made the help page end twice.
 */
export function AboutScreen({ onBack, toast, onUpdates }: {
  onBack: () => void; toast: Toast; onUpdates: () => void;
}) {
  return (
    <SubPage title="Programma barada" onBack={onBack}>
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: tokens.padCard, mt: '14px',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <Box aria-hidden sx={{
            width: 44, height: 44, borderRadius: `${tokens.rTile}px`, flex: 'none',
            bgcolor: tokens.blue, color: '#fff', display: 'grid', placeItems: 'center',
          }}><TabBookIcon /></Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Gündelik</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '2px' }}>
              {`${APP.version} · ${absDate(APP.at)}`}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.55, mt: '12px' }}>
          {APP.about}
        </Typography>
      </Box>

      <SectionLabel>Kimler üçin</SectionLabel>
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, px: tokens.padCard }}>
        {APP.users.map((u, i) => (
          <Box key={u.role} sx={{
            py: '13px',
            borderTop: i === 0 ? 'none' : `1px solid ${tokens.dividerSoft}`,
          }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{u.role}</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '2px', lineHeight: 1.45 }}>
              {u.does}
            </Typography>
          </Box>
        ))}
      </Box>

      <SectionLabel>Wersiýalar</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<SparkleIcon size={22} />, tokens.purpleTint, tokens.purpleText)}
          label="Täzelikler"
          labelSx={LABEL_SX}
          end={<RowEnd value={RELEASES[0].version} />}
          onClick={onUpdates}
        />
        <SurfaceRow
          icon={rowIcon(<ShieldIcon size={22} />, NEUTRAL.tint, NEUTRAL.ink)}
          label="Ulanyş şertleri we gizlinlik"
          labelSx={LABEL_SX}
          end={<RowEnd />}
          onClick={() => toast('Resminama tiz wagtda açylar')}
        />
      </RowGroup>
    </SubPage>
  );
}

/* ---------------- Ýygy soralýan soraglar ---------------- */

const FAQ: Qa[] = [
  {
    q: 'Ballar nädip toplanýar?',
    a: 'Her tamamlanan test, kart toplumy we bäsleşik bal getirýär. Ballar reýtingi kesgitleýär we her çärýegiň başynda dowam edýär — pozulmaýar.',
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
    a: 'Ene-ataň «Çagam» bölüminde bahalaryňy, gatnaşygyňy we öý işleriňi görýär. Test netijeleri we Akylly mugallym ýazgylaryň görünmeýär.',
  },
  {
    q: 'Internet ýok wagty işleýärmi?',
    a: 'Açylan sapaklar we kartlar enjamda saklanýar, olary internetsiz gaýtalap bilersiň. Netijeler baglanyşyk dikelende ugradylýar.',
  },
];

export function FaqScreen({ onBack, toast, onSupport }: {
  onBack: () => void; toast: Toast; onSupport: () => void;
}) {
  const [open, setOpen] = useState<string | null>(FAQ[0].q);
  return (
    <SubPage title="Ähli soraglar" onBack={onBack}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '14px' }}>
        {FAQ.map((f) => (
          <QaRow
            key={f.q}
            item={f}
            open={open === f.q}
            onToggle={() => setOpen(open === f.q ? null : f.q)}
          />
        ))}
      </Box>

      <SectionLabel>Başga sorag barmy</SectionLabel>
      <RowGroup>
        <SurfaceRow
          icon={rowIcon(<QuestionOutlineIcon size={22} />, tokens.blueTint, tokens.blueText)}
          label="Goldaw bilen habarlaş"
          labelSx={LABEL_SX}
          end={<RowEnd value="09:00 – 18:00" />}
          onClick={onSupport}
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

/* ---------------- Täzelikler ----------------
 *
 * A changelog, not a "what's new" splash. Every entry says which of three
 * things it is — täze / gowulandy / düzedildi — because "improvements and bug
 * fixes" is the sentence that taught everyone to stop reading release notes.
 * The newest version carries a "Şu wersiýa" pill so the reader can see at a
 * glance whether what they are reading is what they are running.
 */
type ChangeKind = 'täze' | 'gowulandy' | 'düzedildi';

const CHANGE_TONE: Record<ChangeKind, string> = {
  'täze': tokens.blueText,
  'gowulandy': tokens.greenText,
  'düzedildi': tokens.orangeText,
};

/* Newest first, and inside a release: new things, then improvements, then
   fixes. A reader scanning for "what can I do now that I could not before"
   should never have to read past a bug fix to find it. */
const KIND_ORDER: ChangeKind[] = ['täze', 'gowulandy', 'düzedildi'];

const RELEASES: {
  version: string; at: string; title: string; items: { kind: ChangeKind; text: string }[];
}[] = [
  {
    version: '1.5.0',
    at: '2026-02-12',
    title: 'Ýyldyzlar, Sapaklar we hünär synagy',
    items: [
      { kind: 'täze', text: 'Hünär synagy: 12 sowal — saňa iň laýyk üç hünäri görkezýär' },
      { kind: 'täze', text: 'Her dersiň ýanynda test bankasy görünýär: näçe test, näçe sowal, näçe kart' },
      { kind: 'gowulandy', text: 'Nyşanlar indi Ýyldyzlar diýlip atlandyrylýar' },
      { kind: 'gowulandy', text: 'Temalar bölümi Sapaklar boldy' },
      { kind: 'gowulandy', text: 'Mugt hasapda ýyldyzy kimiň ýazandygy görünýär, ýazgynyň özi ýapyk galýar' },
      { kind: 'gowulandy', text: 'Analitikada ýapyk hasabatlar näçe orun üýtgändigini we iň güýçli dersi aýdýar' },
      { kind: 'gowulandy', text: 'Hepdelik bir mugt test we bir gaýtalama aýryldy — testler we kartlar nyrhnama bilen açylýar' },
    ],
  },
  {
    version: '1.4.0',
    at: '2026-02-10',
    title: 'Akylly mugallym, kömek merkezi we sadalaşdyrylan gündelik',
    items: [
      { kind: 'täze', text: 'Akylly mugallym aýratyn söhbet boldy — soralan zatlaryň taryhy saklanýar' },
      { kind: 'täze', text: 'Bildirişlerde goşulan faýllar ady we göwrümi bilen görünýär' },
      { kind: 'täze', text: 'Kömek merkezi: gollanmalar indi ene-ata, okuwçy, mugallym we müdir üçin aýry' },
      { kind: 'gowulandy', text: 'Gollanmalar gysga makala boldy — düşündiriş bilen bilelikde şol düwmäniň özi görkezilýär' },
      { kind: 'gowulandy', text: 'Öý işi indi sapagy açmazdan, setirdäki tegelek bilen bellenýär' },
      { kind: 'gowulandy', text: 'Baha bir görnüşde: reňk bahanyň özünden alynýar, ýeri hemişe birmeňzeş' },
      { kind: 'düzedildi', text: 'Şenbe güni işjeň däl ýaly görkezilýän ýalňyşlyk aýryldy' },
      { kind: 'düzedildi', text: 'Sapak setirindäki gyzyl tegelek baha bilen çalşylýardy — aýryldy' },
    ],
  },
  {
    version: '1.3.0',
    at: '2026-01-22',
    title: 'Ene-atanyň guly we senenama',
    items: [
      { kind: 'täze', text: '“Barla” indi ene-atanyň guly: her gün aýratyn tassyklanýar' },
      { kind: 'täze', text: 'Senenama görnüşi — aýy bir ekranda görmek we güne geçmek' },
      { kind: 'gowulandy', text: 'Profil sadalaşdyryldy: gatnaşyk, öý işi we ortaça baha bir hatarda' },
      { kind: 'gowulandy', text: 'Ýylyň kartasy bir kartda — bahalar bilen gatnaşyk arasynda geçirgiç' },
    ],
  },
  {
    version: '1.2.0',
    at: '2025-12-15',
    title: 'Dostuňy çagyr we tölegler',
    items: [
      { kind: 'täze', text: 'Dostuňy çagyr: kod, bonus we hyzmatdaş dükanlar' },
      { kind: 'täze', text: 'Kart goşmak sahypasy' },
      { kind: 'gowulandy', text: 'Gollanmalar bäş bölüme jemlendi, interaktiw işler Sapaklaryň içinde' },
      { kind: 'düzedildi', text: 'Sapak tertibi käbir günlerde boş açylýardy' },
    ],
  },
];

export function UpdatesScreen({ onBack }: { onBack: () => void }) {
  /* The current version is open, the history is not. A changelog is read for
     "what changed for me *this* time"; everything older is reference, and
     three versions unfolded at once is a wall nobody reads to the end of. */
  const [open, setOpen] = useState<string | null>(RELEASES[0].version);

  return (
    <SubPage
      title="Täzelikler"
      onBack={onBack}
      help="Her wersiýada näme üýtgändigi ýazylýar: täze mümkinçilikmi, öňkiniň gowulandyrylmagymy ýa-da ýalňyşyň düzedilmegimi. Programma özi täzelenýär — el bilen ýükläp oturmak gerek däl."
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', pt: '14px' }}>
        {RELEASES.map((r, i) => {
          const on = open === r.version;
          const items = [...r.items].sort(
            (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
          );
          return (
            <Box key={r.version} sx={{
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, overflow: 'hidden',
            }}>
              <ButtonBase
                onClick={() => setOpen(on ? null : r.version)}
                aria-expanded={on}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  p: tokens.padCard, textAlign: 'left',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{r.version}</Typography>
                    {i === 0 && (
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.blueText }}>
                        Şu wersiýa
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>
                      {absDate(r.at)}
                    </Typography>
                  </Box>
                  {/* the headline answers "is this one worth reading?" before
                      the list does, which is the whole job of a collapsed row */}
                  <Typography sx={{ fontSize: 13.5, color: tokens.ink2, mt: '3px', lineHeight: 1.45 }}>
                    {r.title}
                  </Typography>
                  {!on && (
                    <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '5px' }}>
                      {`${r.items.length} üýtgeşme`}
                    </Typography>
                  )}
                </Box>
                <Box aria-hidden sx={{
                  color: tokens.inkMuted, display: 'flex', flex: 'none',
                  transform: on ? 'rotate(-90deg)' : 'rotate(90deg)',
                  transition: `transform .2s ${tokens.ease}`,
                }}>
                  <ChevronIcon size={11} />
                </Box>
              </ButtonBase>

              {on && (
                <Box sx={{ px: tokens.padCard, pb: tokens.padCard }}>
                  {/* The tag is a heading over its group, not a column beside
                      it. A label column costs the same ~76px on every line of a
                      375px screen, so every sentence wrapped into a narrow
                      ribbon down the right-hand side. As a heading it is
                      written once and the changes get the full width. */}
                  {KIND_ORDER.map((kind) => {
                    const group = items.filter((it) => it.kind === kind);
                    if (group.length === 0) return null;
                    return (
                      <Box key={kind} sx={{ pt: '14px' }}>
                        <Typography sx={{
                          fontSize: 12, fontWeight: 700, color: CHANGE_TONE[kind],
                          textTransform: 'uppercase', letterSpacing: '.03em',
                        }}>{kind}</Typography>
                        {group.map((it) => (
                          <Box key={it.text} sx={{
                            display: 'flex', alignItems: 'flex-start', gap: '9px', mt: '7px',
                          }}>
                            <Box aria-hidden sx={{
                              width: 5, height: 5, borderRadius: '50%', flex: 'none', mt: '7px',
                              bgcolor: CHANGE_TONE[kind], opacity: 0.55,
                            }} />
                            <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.5 }}>
                              {it.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </SubPage>
  );
}

/* ---------------- Goldaw ----------------
 *
 * Support, as a place rather than a promise.
 *
 * "Goldaw bilen habarlaş" used to be a row at the foot of the FAQ that raised a
 * toast — the app's one honest dead end, on the screen people reach *after* the
 * answers failed them. A support screen has to say three things before anything
 * else: whether anyone is there now, how long a reply takes, and which channel
 * to use. Those are at the top, in that order.
 *
 * The account block at the foot is there because the first thing an operator
 * asks for is the version and the plan, and a parent reading a phone screen
 * cannot find either. One copy button hands over the whole block.
 */
const SUPPORT_OPEN = { from: 9, to: 18 };

export const APP = {
  version: RELEASES[0].version,
  at: RELEASES[0].at,
  about: 'Türkmenistanyň orta mekdepleri üçin sanly gündelik: 1–12-nji synplaryň sapak tertibi, bahalary, öý işi, mugallym bilen habarlaşyk we okuw serişdeleri — bir programmada.',
  /* Four users, named. "4 ulanyjy görnüşi" is a number a reader has to unpack:
     it says a count and hides the thing the count is of, and every one of the
     four wants to know whether *they* are in it. */
  users: [
    { role: 'Ene-ata', does: 'Çagasynyň gününi okaýar we gol çekýär' },
    { role: 'Okuwçy', does: 'Sapaklary, öý işini, kartlary we testleri açýar' },
    { role: 'Mugallym', does: 'Baha we ýyldyz goýýar, öý işi berýär' },
    { role: 'Mekdep müdiri', does: 'Bildiriş çap edýär, hasabat we hukuk dolandyrýar' },
  ],
};

const CHANNELS: { icon: ReactNode; tint: string; ink: string; label: string; value: string; msg: string }[] = [
  {
    icon: <SendIcon size={20} />, tint: tokens.blueTint, ink: tokens.blueText,
    label: 'Söhbetdeşlik', value: '~5 min', msg: 'Goldaw söhbetdeşligi açylýar…',
  },
  {
    icon: <PhoneIcon size={22} />, tint: tokens.greenTint, ink: tokens.greenText,
    label: 'Jaň et', value: '+993 12 45 67 89', msg: '+993 12 45 67 89 göçürildi',
  },
  {
    icon: <AlertIcon size={22} />, tint: tokens.orangeTint, ink: tokens.orangeText,
    label: 'Näsazlyk barada habar ber', value: '', msg: '',
  },
];

export function SupportScreen({ onBack, toast }: { onBack: () => void; toast: Toast }) {
  const p = usePrefs();
  const [report, setReport] = useState(false);
  const [text, setText] = useState('');
  const hour = new Date().getHours();
  const open = hour >= SUPPORT_OPEN.from && hour < SUPPORT_OPEN.to;

  const account = [
    `Gündelik ${APP.version}`,
    `Hasap: ${tierName(p.tier)}`,
    'ID: GD-4471-0932',
  ].join('\n');

  return (
    <SubPage title="Goldaw" onBack={onBack}>
      {/* Is anyone there — the question every support screen is opened with */}
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        p: tokens.padCard, mt: '14px',
        display: 'flex', alignItems: 'flex-start', gap: '13px',
      }}>
        <Box aria-hidden sx={{
          width: 10, height: 10, borderRadius: '50%', flex: 'none', mt: '6px',
          bgcolor: open ? tokens.green : tokens.inkDisabled,
          boxShadow: open ? `0 0 0 4px ${tokens.greenTint}` : 'none',
        }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            {open ? 'Goldaw işleýär' : 'Häzir ýapyk'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '2px' }}>
            {open
              ? 'Adatça 5 minutda jogap berýäris'
              : 'Iş günleri 09:00 – 18:00. Ýazyp goýuň, ertir jogap bereris'}
          </Typography>
        </Box>
      </Box>

      <SectionLabel>Habarlaşmak</SectionLabel>
      <RowGroup>
        {CHANNELS.map((c) => (
          <SurfaceRow
            key={c.label}
            icon={rowIcon(c.icon, c.tint, c.ink)}
            label={c.label}
            labelSx={LABEL_SX}
            end={<RowEnd value={c.value} />}
            onClick={() => (c.msg ? toast(c.msg) : setReport(true))}
          />
        ))}
      </RowGroup>

      {/* What the operator will ask for, in one block and one tap */}
      <SectionLabel>Hasabyň maglumatlary</SectionLabel>
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: tokens.padCard,
        display: 'flex', alignItems: 'center', gap: '13px',
      }}>
        <Typography sx={{
          flex: 1, minWidth: 0, fontSize: 13.5, color: tokens.ink2, lineHeight: 1.6,
          whiteSpace: 'pre-line',
        }}>{account}</Typography>
        <Button
          variant="text"
          onClick={() => toast('Maglumatlar göçürildi')}
          sx={{ flex: 'none', fontSize: 13.5, fontWeight: 700, minWidth: 0, px: '10px' }}
        >Göçür</Button>
      </Box>

      <SheetDrawer open={report} onClose={() => setReport(false)}>
        <Typography variant="h2" component="h2" sx={{ fontSize: 20 }}>Näsazlyk barada habar ber</Typography>
        <Typography variant="caption" sx={{ mb: '14px', display: 'block' }}>
          Näme bolandygyny ýazyň — hasabyň maglumatlary awtomatik goşulýar
        </Typography>
        <Box
          component="textarea"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder="Meselem: bahalar açylmaýar…"
          aria-label="Näsazlygyň beýany"
          sx={{
            width: '100%', minHeight: 110, p: '13px 15px', boxSizing: 'border-box', resize: 'none',
            border: `1.5px solid ${tokens.dividerSoft}`, borderRadius: `${tokens.rTile}px`,
            font: 'inherit', fontSize: 15, lineHeight: 1.5, bgcolor: '#fff', color: tokens.ink,
            '&:focus': { outline: 'none', borderColor: tokens.blue },
            '&::placeholder': { color: tokens.inkDisabled },
          }}
        />
        <Button
          fullWidth variant="contained" disabled={!text.trim()}
          sx={{ mt: '14px' }}
          onClick={() => { setReport(false); setText(''); toast('Habaryňyz ugradyldy'); }}
        >Ugrat</Button>
      </SheetDrawer>
    </SubPage>
  );
}
