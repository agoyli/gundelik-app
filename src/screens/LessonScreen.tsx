import { Box, Button, ButtonBase, Slider, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AiChatSheet, AiFab } from '../components/AiHelper';
import type { AiSuggestion } from '../components/AiHelper';
import { CheckIcon, ChevronIcon, QuizIcon } from '../components/Icons';
import { PaidFeatureSheet } from '../components/Paywall';
import { DoneBadge, PillHeader } from '../components/Ui';
import { usePrefs } from '../state/prefs';
import { tokens } from '../theme';

export type LessonKind = 'text' | 'video' | 'interactive' | 'test';

type Meta = { label: string; color: string; ink: string; tint: string; icon: (size: number) => ReactNode };
type LessonLite = { id: string; title: string; kind: LessonKind; extent: string; done: boolean };

/* ---------------- Content ---------------- */

/* Structured text-lesson content — matches the CMS schema (hook, summary,
   adim_adim, key_concepts, formulas, mysal, must_know, ozuni_barla) */
type TextLessonContent = {
  hook: string;
  summary: string;
  adim_adim: string[];
  key_concepts: string[];
  formulas: string[];
  mysal: string[];
  must_know: string[];
  ozuni_barla: { sorag: string; jogap: string }[];
};

const TEXT_CONTENT: TextLessonContent = {
  hook: 'Biz gündelik durmuşda dürli zatlary sanaýarys: kitaplary, depderleri, oturgyçlary. Sanamak üçin ulanýan sanlarymyz — natural sanlar.',
  summary: 'Zatlar sanalanda ulanylýan sanlara natural sanlar diýilýär: 1, 2, 3, 4, ... Nol natural san däldir. Natural sanlary okamagy, deňeşdirmegi, goşmagy we aýyrmagy öwrenýäris.',
  adim_adim: [
    'Natural sanlar: 1, 2, 3, 4, ... Olar tükeniksiz köpdür. Nol natural san däldir.',
    'Uly sany okamak üçin ony sagdan üç sifrden toparlara böl: 52 837 548 901 → 52 milliard 837 million 548 müň 901.',
    'Sany razrýadlara dagydyp bolýar: 8903 = 8000 + 900 + 3.',
    'Goşalyň: 5 + 2 = 7. Bu ýerde 5 we 2 — goşýan sanlarymyz. Olara goşulyjylar diýilýär. 7 — jem.',
    'Aýyralyň: 9 - 4 = 5. 9 — kemeliji (kemelýän san), 4 — kemeldiji (kemeldýän san), 5 — tapawut.',
    'Uly sanlary sütünleýin goşmak amatly: sanlary biri-biriniň aşagynda, razrýadlary deň geler ýaly ýaz. Sagdan başlap goş.',
    'Barlamak islseň: tapawuda kemeldijini goş. Kemeliji çyksa — dogry.',
  ],
  key_concepts: [
    'San okalanda üç sifrden ybarat klaslara bölünýär: birlikler, müňlükler, millionlar, milliardlar klasy.',
    'Sany razrýadlara dagytmak bolýar: 8903 = 8000 + 900 + 3.',
    'Rim sifrleri: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
    'Sanlary deňeşdirmegiň netijesi deňsizlik görnüşinde ýazylýar: 5 < 8; 9 > 8.',
    'Goşulýan sanlara goşulyjylar, netijä jem diýilýär.',
    'Kemeldilýän sana kemeliji, kemeldýän sana kemeldiji, netijä tapawut diýilýär.',
  ],
  formulas: [
    'Goşmagyň orun çalyşma häsiýeti: a + b = b + a.',
    'Goşmagyň utgaşdyrma häsiýeti: (a + b) + c = a + (b + c).',
    'a + 0 = a; a - 0 = a; a - a = 0.',
  ],
  mysal: [
    'Razrýadlaýyn goşmak: 2641 + 5237 = (2000 + 5000) + (600 + 200) + (40 + 30) + (1 + 7) = 7878.',
    'Amatly usul: 97 + 28 = (97 + 3) + 25 = 100 + 25 = 125.',
  ],
  must_know: [
    'Köpbelgili sanlary razrýadlaýyn we sütünleýin goşup we aýryp bilmek.',
    'Sütünleýin goşanda razrýadyň birlikleri bir sütünde ýerleşer ýaly ýazmaly.',
    'Aýyrmagyň barlagy: tapawut + kemeldiji = kemeliji.',
  ],
  ozuni_barla: [
    { sorag: 'Nol natural sanmy?', jogap: 'Ýok, nol natural san däldir.' },
    { sorag: '27 + 15 = 42 ýazgyda 27 we 15 nähili atlandyrylýar?', jogap: 'Goşulyjylar. 42 — jem.' },
    { sorag: '80 - 30 = 50 ýazgyda kemeliji haýsy?', jogap: '80 — kemeliji, 30 — kemeldiji, 50 — tapawut.' },
  ],
};

const SectionCard = ({ title, accent, children }: { title: string; accent?: string; children: ReactNode }) => (
  <Box sx={{
    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  }}>
    <Typography sx={{ fontSize: 15, fontWeight: 700, color: accent ?? tokens.ink }}>{title}</Typography>
    {children}
  </Box>
);

const TEST = [
  { q: 'a = 1, b = 4, c = 3 bolsa, D = b² − 4ac näçe?', options: ['2', '4', '8', '16'], correct: 1 },
  { q: 'D > 0 bolanda deňlemäniň näçe köki bar?', options: ['0', '1', '2', '3'], correct: 2 },
  { q: 'x² − 5x + 6 = 0 deňlemäniň kökleri haýsylar?', options: ['x = 1; 6', 'x = 2; 3', 'x = −2; −3', 'Kök ýok'], correct: 1 },
];

/* The roadmap advertises this count, so the two can never drift apart */
export const TEST_LENGTH = TEST.length;

/* AI prompts per lesson kind */
const AI_FALLBACK = 'Gowy sorag! Gysgaça: diskriminant deňlemäniň köklerini öňünden kesgitlemäge kömek edýär. Has anyk jogap üçin ýokardaky taýýar soraglary hem synap bilersiň.';

const AI_COMMON: AiSuggestion[] = [
  {
    label: 'Ýönekeý dilde düşündir',
    reply: 'Elbetde! Kwadrat deňlemäniň grafigi — parabola. Diskriminant (D) bolsa «parabola ok çyzygyny näçe gezek kesýär?» diýen soraga jogap berýär: D > 0 — iki gezek, D = 0 — bir gezek (galtaşýar), D < 0 — asla kesenok.',
  },
  {
    label: 'Bu näme üçin gerek?',
    reply: 'Kwadrat deňlemeler hakyky durmuşy modelleýär: zyňylan topuň nirä düşjekdigi, awtoulagyň duruş ýoly, iň uly girdejini tapmak. Bu temany bilseň, şeýle meseleleri özüň çözüp bilersiň.',
  },
  {
    label: 'Maňa tabşyryk ber',
    reply: 'Tabşyryk: x² − 6x + 8 = 0 deňlemäni çöz. Ilki D-ni hasapla, soňra kökleri tap. Barlag üçin: kökleriň jemi 6, köpeltmek hasyly 8 bolmaly!',
  },
];

const AI_BY_KIND: Record<Exclude<LessonKind, 'test'>, AiSuggestion[]> = {
  video: [
    {
      label: 'Wideodan sorag ber',
      reply: 'Sorag: wideodaky mysalda D = 25 − 24 = 1 çykdy. Onda deňlemäniň näçe köki bar? Pikirlen: D > 0 bolsa — iki kök! Jogabyňy wideonyň dowamy bilen deňeşdir.',
    },
    ...AI_COMMON.slice(0, 2),
  ],
  text: AI_COMMON,
  interactive: [
    {
      label: 'Parabola näme?',
      reply: 'Parabola — kwadrat funksiýanyň grafigi, simmetrik egri çyzyk. a > 0 bolsa şahalary ýokary, a < 0 bolsa aşak bakýar. Süýşürijiler bilen muny häzir özüň synap gör!',
    },
    {
      label: 'D näme üçin gerek?',
      reply: 'D saňa grafige seretmezden köklerıň sanyny aýdýar. Oýunda hem görýärsiň: D > 0 bolanda parabola ok çyzygyny iki nokatda kesýär — şol nokatlar deňlemäniň kökleri!',
    },
    AI_COMMON[2],
  ],
};

const aiForTest = (score: number): AiSuggestion[] => [
  {
    label: 'Netijämi seljer',
    reply: `Netijäň: ${score}/${TEST.length}. ${score === TEST.length
      ? 'Ajaýyp — tema doly özleşdirilipdir! Indiki sapaga arkaýyn geçip bilersiň.'
      : score >= 2
        ? 'Gowy netije! Ýalňyşan soraglaryňa aşakdaky seljermede seret — köplenç mesele D-niň belgisinde bolýar.'
        : 'Tema entek doly berkemedi. «Diskriminant we kökler» sapagyny gaýtalamagy maslahat berýärin.'}`,
  },
  {
    label: 'Ýalňyşlarymy düşündir',
    reply: 'D-ni hasaplanyňda belgilere üns ber: −4ac agzasynda c otrisatel bolsa netije položitel bolýar. Kökleri barlamagyň iň aňsat ýoly — olary deňlemä goýup görmek.',
  },
  {
    label: 'Haýsy temany gaýtalamaly?',
    reply: 'Saňa «Diskriminant we kökler» temasyny gaýtalamak peýdaly bolar — Gollanmalarda şol sapagy açyp, «Gaýtadan gör» düwmesine bas.',
  },
];

/* ---------------- Answer row ---------------- */
function AnswerRow({ label, state, onClick }: {
  label: string; state: 'idle' | 'selected' | 'correct' | 'wrong'; onClick?: () => void;
}) {
  const palette = {
    idle: { bg: '#fff', border: 'transparent', color: tokens.ink },
    selected: { bg: tokens.blueTint, border: tokens.blue, color: tokens.blueText },
    correct: { bg: tokens.greenTint, border: tokens.greenDeep, color: tokens.greenText },
    wrong: { bg: tokens.redTint, border: tokens.red, color: tokens.redText },
  }[state];
  return (
    <ButtonBase
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={state !== 'idle'}
      sx={{
        width: '100%', minHeight: 48, borderRadius: `${tokens.rRow}px`, px: '15px',
        justifyContent: 'flex-start', fontSize: 15, fontWeight: 600,
        bgcolor: palette.bg, color: palette.color,
        border: `1.5px solid ${palette.border}`,
        transition: 'background .15s ease,border-color .15s ease',
      }}
    >{label}</ButtonBase>
  );
}

/* ---------------- Parabola playground (interactive kind) ---------------- */
const MISSIONS: { id: 'two' | 'one' | 'down'; label: string; hint?: string }[] = [
  { id: 'two', label: 'Parabola ok çyzygyny 2 ýerde kessin (D > 0)' },
  { id: 'one', label: 'Parabola ok çyzygyna galtaşsyn (D = 0)', hint: 'meselem: a = 1, b = 4, c = 4' },
  { id: 'down', label: 'Şahalaryny aşak bakdyryň (a < 0)' },
];

function ParabolaLab({ color, onAllDone }: { color: string; onAllDone: (done: boolean) => void }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(4);
  const [ach, setAch] = useState({ two: false, one: false, down: false });

  const D = b * b - 4 * a * c;
  const roots = useMemo(() => {
    if (D < 0 || a === 0) return [];
    const s = Math.sqrt(D);
    const r = [(-b - s) / (2 * a), (-b + s) / (2 * a)];
    return D === 0 ? [r[0]] : r;
  }, [a, b, D]);

  useEffect(() => {
    setAch((p) => ({
      two: p.two || D > 0,
      one: p.one || D === 0,
      down: p.down || a < 0,
    }));
  }, [a, D]);

  const allDone = ach.two && ach.one && ach.down;
  useEffect(() => { onAllDone(allDone); }, [allDone, onAllDone]);

  /* plot mapping: x ∈ [−5, 5], y ∈ [−8, 8] → 320×190 */
  const sx = (x: number) => 160 + x * 30;
  const sy = (y: number) => 95 - y * 11;
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let x = -5; x <= 5.001; x += 0.2) out.push(`${sx(x).toFixed(1)},${sy(a * x * x + b * x + c).toFixed(1)}`);
    return out.join(' ');
  }, [a, b, c]);

  const dChip = D > 0
    ? { bg: tokens.greenTint, color: tokens.greenText, label: '2 kök' }
    : D === 0
      ? { bg: tokens.orangeTint, color: tokens.orangeText, label: '1 kök' }
      : { bg: tokens.redTint, color: tokens.redText, label: 'kök ýok' };

  const sliderSx = {
    color, py: '10px',
    '& .MuiSlider-thumb': { width: 22, height: 22, bgcolor: '#fff', border: `3px solid ${color}` },
    '& .MuiSlider-rail': { bgcolor: tokens.dividerSoft, opacity: 1 },
  };

  return (
    <>
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.ink2 }}>
          Süýşürijileri üýtgedip, parabolanyň nähili özgerýändigini synlaň
        </Typography>

        {/* Plot */}
        <Box component="svg" viewBox="0 0 320 190" role="img"
          aria-label={`Parabola: a=${a}, b=${b}, c=${c}, D=${D.toFixed(1)}, ${dChip.label}`}
          sx={{ width: '100%', bgcolor: '#fff', borderRadius: `${tokens.rRow}px` }}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={sx(i - 5)} y1={0} x2={sx(i - 5)} y2={190} stroke={tokens.dividerSoft} strokeWidth={1} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1={10} y1={sy((i - 4) * 2)} x2={310} y2={sy((i - 4) * 2)} stroke={tokens.dividerSoft} strokeWidth={1} />
          ))}
          <line x1={10} y1={sy(0)} x2={310} y2={sy(0)} stroke={tokens.inkMuted} strokeWidth={1.5} />
          <line x1={sx(0)} y1={0} x2={sx(0)} y2={190} stroke={tokens.inkMuted} strokeWidth={1.5} />
          <polyline points={pts} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
          {roots.filter((r) => r >= -5 && r <= 5).map((r) => (
            <circle key={r.toFixed(3)} cx={sx(r)} cy={sy(0)} r={5.5} fill={tokens.greenDeep} stroke="#fff" strokeWidth={2} />
          ))}
        </Box>

        {/* Readout — fixed-height rows so the card never resizes */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', height: 28 }}>
          <Typography noWrap sx={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flex: 1, minWidth: 0 }}>
            D = b² − 4ac = {D.toFixed(1)}
          </Typography>
          <Box sx={{
            height: 28, px: '11px', borderRadius: `${tokens.rPill}px`, display: 'inline-flex', flex: 'none',
            alignItems: 'center', fontSize: 13, fontWeight: 700, bgcolor: dChip.bg, color: dChip.color,
          }}>{dChip.label}</Box>
        </Box>
        <Typography noWrap sx={{
          height: 20, fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          color: roots.length > 0 ? tokens.greenText : tokens.inkMuted,
        }}>
          {roots.length === 2
            ? `x₁ = ${roots[0].toFixed(1)},  x₂ = ${roots[1].toFixed(1)}`
            : roots.length === 1
              ? `x = ${roots[0].toFixed(1)}`
              : 'Hakyky kök ýok'}
        </Typography>

        {/* Sliders */}
        {([['a', a, setA, -3, 3, 0.5], ['b', b, setB, -6, 6, 1], ['c', c, setC, -6, 6, 1]] as const).map(
          ([name, val, set, min, max, step]) => (
            <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: '12px', height: 42 }}>
              <Typography noWrap sx={{ width: 80, flex: 'none', fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {name} = {val}
              </Typography>
              <Slider
                value={val}
                min={min} max={max} step={step}
                onChange={(_, v) => {
                  const nv = v as number;
                  if (name === 'a' && nv === 0) set(val > 0 ? -0.5 : 0.5);
                  else set(nv);
                }}
                aria-label={`${name} koeffisiýenti`}
                sx={sliderSx}
              />
            </Box>
          ))}
      </Box>

      {/* Missions */}
      <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Mesele</Typography>
        {MISSIONS.map((m) => (
          <Box key={m.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {ach[m.id]
              ? <DoneBadge size={22} />
              : <Box aria-hidden sx={{
                width: 22, height: 22, borderRadius: '50%', flex: 'none',
                border: `2px solid ${tokens.inkDisabled}`,
              }} />}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{
                fontSize: 14, fontWeight: 600, lineHeight: 1.4,
                color: ach[m.id] ? tokens.greenText : tokens.ink,
              }}>{m.label}</Typography>
              {m.hint && (
                <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, opacity: ach[m.id] ? .5 : 1 }}>
                  {m.hint}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        <Typography sx={{
          height: 20, fontSize: 14, fontWeight: 700,
          color: allDone ? tokens.greenText : tokens.inkMuted,
        }}>
          {allDone
            ? 'Ähli meseleler çözüldi! 🎉'
            : `${Number(ach.two) + Number(ach.one) + Number(ach.down)}/3 çözüldi`}
        </Typography>
      </Box>
    </>
  );
}

/* ---------------- Screen ---------------- */
export function LessonScreen({ lesson, meta, onClose, onComplete, onUpgrade }: {
  lesson: LessonLite; meta: Meta; onClose: () => void; onComplete: () => void; onUpgrade: () => void;
}) {
  const { premium } = usePrefs();
  const [playing, setPlaying] = useState(false);
  /* a video lesson can't be "completed" before it has been started */
  const [started, setStarted] = useState(false);
  const [labDone, setLabDone] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  /* self-check accordions in text lessons */
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  /* test flow: start page → one question per step → result page */
  const [stage, setStage] = useState<'start' | number | 'result'>('start');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const testScore = TEST.filter((t, i) => answers[i] === t.correct).length;
  const canComplete = lesson.kind === 'interactive' ? labDone
    : lesson.kind === 'test' ? stage === 'result'
      : lesson.kind === 'video' ? started || lesson.done
        : true;

  const inQuestions = lesson.kind === 'test' && typeof stage === 'number';
  const aiSuggestions = lesson.kind === 'test'
    ? aiForTest(testScore)
    : AI_BY_KIND[lesson.kind];

  return (
    <Box sx={{
      /* stops above the glass tab bar so the footer CTA stays reachable */
      position: 'absolute', top: 0, left: 0, right: 0,
      bottom: 'calc(92px + env(safe-area-inset-bottom))',
      zIndex: 20, bgcolor: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      <Box sx={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}>
        <PillHeader title={meta.label} onBack={onClose} />

        <Box sx={{ px: tokens.gutter, pt: '4px', pb: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Lesson identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Box aria-hidden sx={{
              width: 56, height: 56, borderRadius: `${tokens.rRow}px`, flex: 'none',
              bgcolor: meta.tint, color: meta.color, display: 'grid', placeItems: 'center',
            }}>{meta.icon(28)}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h2">{lesson.title}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: meta.ink, mt: '2px' }}>
                {meta.label} · {lesson.extent}
              </Typography>
            </Box>
          </Box>

          {/* ---- video ---- */}
          {lesson.kind === 'video' && (
            <>
              <Box sx={{
                aspectRatio: '16 / 9', borderRadius: `${tokens.rCard}px`, bgcolor: tokens.ink,
                display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <ButtonBase
                  onClick={() => { setPlaying(!playing); setStarted(true); }}
                  aria-label={playing ? 'Sakla' : 'Oýnat'}
                  sx={{
                    width: 64, height: 64, borderRadius: '50%', bgcolor: '#fff', color: tokens.ink,
                    display: 'grid', placeItems: 'center',
                  }}
                >
                  {playing ? (
                    <Box sx={{ display: 'flex', gap: '5px' }} aria-hidden>
                      <Box sx={{ width: 6, height: 22, borderRadius: 2, bgcolor: tokens.ink }} />
                      <Box sx={{ width: 6, height: 22, borderRadius: 2, bgcolor: tokens.ink }} />
                    </Box>
                  ) : (
                    <Box aria-hidden sx={{
                      width: 0, height: 0, ml: '5px',
                      borderTop: '13px solid transparent', borderBottom: '13px solid transparent',
                      borderLeft: `21px solid ${tokens.ink}`,
                    }} />
                  )}
                </ButtonBase>
                <Box sx={{ position: 'absolute', left: 14, right: 14, bottom: 12, height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', borderRadius: 3, bgcolor: meta.color,
                    width: playing ? '100%' : '0%', transition: playing ? 'width 9s linear' : 'none',
                  }} />
                </Box>
              </Box>
              <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '14px 15px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.ink2, mb: '6px' }}>Sapak barada</Typography>
                <Typography variant="body2">
                  Bu wideoda {lesson.title.toLowerCase()} temasy mysallar bilen düşündirilýär.
                  Wideony doly görüp, soňra «Tamamla» düwmesine basyň.
                </Typography>
              </Box>
            </>
          )}

          {/* ---- text: structured reading ---- */}
          {lesson.kind === 'text' && (
            <>
              <Typography variant="body2" sx={{ fontSize: 15, lineHeight: 1.65, color: tokens.ink2, px: '2px' }}>
                {TEXT_CONTENT.hook}
              </Typography>

              <Box sx={{ bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`, p: '15px 16px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokens.blueText, mb: '5px' }}>Gysgaça</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{TEXT_CONTENT.summary}</Typography>
              </Box>

              <SectionCard title="Ädimme-ädim">
                {TEXT_CONTENT.adim_adim.map((s, i) => (
                  <Box key={s.slice(0, 18)} sx={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
                    <Box aria-hidden sx={{
                      width: 24, height: 24, borderRadius: '50%', flex: 'none', mt: '1px',
                      bgcolor: tokens.blueSoft, color: tokens.blueText, fontSize: 13, fontWeight: 700,
                      display: 'grid', placeItems: 'center',
                    }}>{i + 1}</Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{s}</Typography>
                  </Box>
                ))}
              </SectionCard>

              <SectionCard title="Esasy düşünjeler">
                {TEXT_CONTENT.key_concepts.map((k) => (
                  <Box key={k.slice(0, 18)} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: tokens.blue, flex: 'none', mt: '8px' }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{k}</Typography>
                  </Box>
                ))}
              </SectionCard>

              <SectionCard title="Formulalar">
                {TEXT_CONTENT.formulas.map((f) => (
                  <Box key={f.slice(0, 18)} sx={{
                    bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, p: '11px 13px',
                    fontSize: 14.5, fontWeight: 600, color: tokens.blueText, fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.5,
                  }}>{f}</Box>
                ))}
              </SectionCard>

              <SectionCard title="Mysallar">
                {TEXT_CONTENT.mysal.map((m) => (
                  <Box key={m.slice(0, 18)} sx={{ bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, p: '12px 13px' }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{m}</Typography>
                  </Box>
                ))}
              </SectionCard>

              <SectionCard title="Hökman bilmeli" accent={tokens.orangeText}>
                {TEXT_CONTENT.must_know.map((m) => (
                  <Box key={m.slice(0, 18)} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Box aria-hidden sx={{ color: tokens.orangeText, display: 'flex', mt: '3px', flex: 'none' }}>
                      <CheckIcon size={13} />
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{m}</Typography>
                  </Box>
                ))}
              </SectionCard>

              <SectionCard title="Özüňi barla">
                {TEXT_CONTENT.ozuni_barla.map((q, i) => (
                  <Box key={q.sorag} sx={{ bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, overflow: 'hidden' }}>
                    <ButtonBase
                      onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                      aria-expanded={!!revealed[i]}
                      sx={{
                        width: '100%', p: '12px 14px', justifyContent: 'space-between', gap: '10px',
                        textAlign: 'left', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      {q.sorag}
                      <Box sx={{
                        color: tokens.inkDisabled, display: 'flex', flex: 'none',
                        transform: revealed[i] ? 'rotate(-90deg)' : 'rotate(90deg)',
                        transition: 'transform .15s ease',
                      }}><ChevronIcon size={10} /></Box>
                    </ButtonBase>
                    {revealed[i] && (
                      <Typography variant="body2" sx={{ p: '0 14px 12px', color: tokens.greenText, fontWeight: 600 }}>
                        {q.jogap}
                      </Typography>
                    )}
                  </Box>
                ))}
              </SectionCard>
            </>
          )}

          {/* ---- interactive: parabola playground ---- */}
          {lesson.kind === 'interactive' && (
            <ParabolaLab color={meta.color} onAllDone={setLabDone} />
          )}

          {/* ---- test: start → questions → result ---- */}
          {lesson.kind === 'test' && stage === 'start' && (
            <Box sx={{
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '24px 18px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
            }}>
              <Box aria-hidden sx={{
                width: 64, height: 64, borderRadius: `${tokens.rCard}px`, bgcolor: meta.tint,
                color: meta.color, display: 'grid', placeItems: 'center',
              }}><QuizIcon size={32} /></Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Taýynmy?</Typography>
              <Typography variant="body2" sx={{ color: tokens.ink2 }}>
                {TEST.length} sorag · her soragyň bir dogry jogaby bar.<br />
                Soraglaryň arasynda yza gaýdyp bilersiňiz,<br />netije diňe soňunda görkezilýär.
              </Typography>
              <Button variant="contained" disableElevation sx={{ px: '36px', mt: '6px' }}
                onClick={() => setStage(0)}>
                Başla
              </Button>
            </Box>
          )}

          {inQuestions && typeof stage === 'number' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${((stage + 1) / TEST.length) * 100}%`, height: '100%',
                    borderRadius: 3, bgcolor: meta.color, transition: 'width .25s ease',
                  }} />
                </Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                  {stage + 1}/{TEST.length}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '18px 17px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45 }}>{TEST[stage].q}</Typography>
                {TEST[stage].options.map((o, i) => (
                  <AnswerRow
                    key={o}
                    label={o}
                    state={answers[stage] === i ? 'selected' : 'idle'}
                    onClick={() => setAnswers((a) => ({ ...a, [stage]: i }))}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button fullWidth sx={{ bgcolor: tokens.surface, color: tokens.ink }}
                  onClick={() => setStage(stage === 0 ? 'start' : stage - 1)}>
                  Yza
                </Button>
                <Button fullWidth variant="contained" disableElevation
                  disabled={answers[stage] === undefined}
                  onClick={() => setStage(stage === TEST.length - 1 ? 'result' : stage + 1)}>
                  {stage === TEST.length - 1 ? 'Netije' : 'Indiki'}
                </Button>
              </Box>
            </>
          )}

          {lesson.kind === 'test' && stage === 'result' && (
            <>
              <Box sx={{
                bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '22px 18px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              }}>
                <Box sx={{
                  width: 86, height: 86, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  border: `6px solid ${testScore === TEST.length ? tokens.greenDeep : testScore >= 2 ? tokens.orange : tokens.red}`,
                  fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                }}>{testScore}/{TEST.length}</Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                  {testScore === TEST.length ? 'Ajaýyp! 🎉' : testScore >= 2 ? 'Gowy netije!' : 'Ýene synanyş!'}
                </Typography>
                <ButtonBase
                  onClick={() => { setAnswers({}); setStage('start'); }}
                  sx={{
                    height: 32, px: '14px', borderRadius: `${tokens.rPill}px`,
                    bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5, fontWeight: 600,
                  }}>Täzeden çöz</ButtonBase>
              </Box>
              {TEST.map((t, qi) => (
                <Box key={t.q} sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4 }}>
                    {qi + 1}. {t.q}
                  </Typography>
                  <AnswerRow label={t.options[t.correct]} state="correct" />
                  {answers[qi] !== t.correct && answers[qi] !== undefined && (
                    <AnswerRow label={`Siziň jogabyňyz: ${t.options[answers[qi]]}`} state="wrong" />
                  )}
                </Box>
              ))}
            </>
          )}

          {lesson.done && !inQuestions && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: '8px', px: '4px',
              color: tokens.greenText, fontSize: 14, fontWeight: 600,
            }}>
              <CheckIcon size={15} />Bu sapagy öň tamamladyňyz
            </Box>
          )}

        </Box>
      </Box>

      {/* Footer CTA — during the test flow, navigation lives in the content */}
      {(lesson.kind !== 'test' || stage === 'result') && (
        <Box sx={{
          p: `12px ${tokens.gutter} calc(12px + env(safe-area-inset-bottom))`,
          borderTop: `1px solid ${tokens.divider}`, bgcolor: '#fff',
        }}>
          <Button fullWidth variant="contained" disableElevation disabled={!canComplete} onClick={onComplete}>
            {lesson.kind === 'test'
              ? `Testi tabşyr (${testScore}/${TEST.length})`
              : lesson.done ? 'Ýap' : 'Tamamla ✓'}
          </Button>
        </Box>
      )}

      {/* AI helper: floating button + chat sheet, on every lesson page.
          For the free tier the same button explains the feature instead. */}
      <AiFab lift={lesson.kind !== 'test' || stage === 'result'} onClick={() => setAiOpen(true)} />
      {premium ? (
        <AiChatSheet
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          suggestions={aiSuggestions}
          fallback={AI_FALLBACK}
        />
      ) : (
        <PaidFeatureSheet
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          title="Akylly mugallym 24/7"
          note="Sapak boýunça islendik soragyňa jogap berýän kömekçi — Premium abunada."
          bullets={[
            'Temany ýönekeý dilde düşündirýär',
            'Ýalňyşyňy tapyp, ädimme-ädim alyp barýar',
            'Test we öý işi üçin tabşyryk berýär',
          ]}
          onUpgrade={onUpgrade}
        />
      )}
    </Box>
  );
}
