import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import { CheckIcon, QuizIcon, TargetIcon } from '../components/Icons';
import {
  MeterTile, SectionLabel, StickyFooter, SubPage, SurfaceRow, RowEnd,
} from '../components/Ui';
import {
  ANSWERS, QUESTIONS, TRAITS, drivers, matches, specialityOf, traitScores,
} from '../data/career';
import type { Answers } from '../data/career';
import { saveCareerResult, useCareerResult } from '../state/career';
import { fmtDate } from '../lib/date';
import { tokens } from '../theme';

/*
 * Hünär synagy — twelve statements, six traits, three ranked matches.
 *
 * "Arzuwymdaky hünär" used to be only a picker of jobs. That is right for a
 * student who already knows and useless for one who does not: a list of five
 * words asks the very question it was supposed to answer. This is the other
 * path to the same goal, and it ends by writing into it.
 *
 * Three rules the page is built on:
 *
 * - **One statement per screen.** A grid of twelve rows with three radio
 *   buttons each is a form; this is a question being asked. It also makes the
 *   progress honest — twelve steps that visibly advance beat a scroll bar.
 * - **Yza actually goes back a question**, not out of the test. The single
 *   most common thing a person does in a quiz is reconsider the last answer.
 * - **The result explains itself.** Every match shows a percentage, the two
 *   traits that earned it, and the school subjects it rests on — so it reads
 *   as advice a student can act on this term, not a verdict handed down.
 */

const CHOICE_TINT = [tokens.surface, tokens.blueTint, tokens.blue];
const CHOICE_INK = [tokens.ink2, tokens.blueText, '#fff'];

export function CareerTestScreen({ onBack, onPickDream, toast }: {
  onBack: () => void;
  /** writing the result into the Profil goal is the point of the whole screen */
  onPickDream: (id: string) => void;
  toast: (m: string) => void;
}) {
  const saved = useCareerResult();
  /* `intro` on a first visit, `result` when there is one to re-read */
  const [stage, setStage] = useState<'intro' | 'ask' | 'result'>(saved ? 'result' : 'intro');
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {});
  const [step, setStep] = useState(0);

  const q = QUESTIONS[step];
  const answered = Object.keys(answers).length;

  const start = () => { setAnswers({}); setStep(0); setStage('ask'); };

  const answer = (value: number) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      saveCareerResult(next);
      setStage('result');
    }
  };

  /* ---------------- intro ---------------- */
  if (stage === 'intro') {
    return (
      <SubPage title="Hünär synagy" onBack={onBack}>
        <Box sx={{
          mt: '14px', bgcolor: tokens.purpleTint, borderRadius: `${tokens.rCard}px`,
          p: '20px 17px', textAlign: 'center',
        }}>
          <Box aria-hidden sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto',
            bgcolor: '#fff', color: tokens.purpleText, display: 'grid', placeItems: 'center',
          }}><QuizIcon size={26} /></Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, mt: '12px', letterSpacing: '-.2px' }}>
            Haýsy hünär saňa golaý?
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.55, mt: '6px' }}>
            {QUESTIONS.length} sany ýönekeý sowal. Netijede saňa iň laýyk üç hünär we olaryň
            haýsy derslere daýanýandygy görkeziler.
          </Typography>
        </Box>

        <SectionLabel>Synag näme ölçeýär</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {TRAITS.map((t) => (
            <Box key={t.id} sx={{
              display: 'flex', alignItems: 'center', gap: '12px',
              bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '12px 15px',
            }}>
              <Box aria-hidden sx={{
                width: 8, height: 8, borderRadius: '50%', flex: 'none', bgcolor: t.color,
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{t.label}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }}>{t.note}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* said before the test, not after: a result nobody warned you about
            reads as a verdict */}
        <Typography sx={{
          fontSize: 12.5, color: tokens.ink3, lineHeight: 1.55, px: '6px', pt: '14px',
        }}>
          Netije — maslahat, karar däl. Ol seniň häzirki gyzyklanmalaryňy görkezýär
          we ýyldan-ýyla üýtgäp biler.
        </Typography>

        <StickyFooter>
          <Button fullWidth variant="contained" disableElevation onClick={start}>
            Başla
          </Button>
        </StickyFooter>
      </SubPage>
    );
  }

  /* ---------------- one question ---------------- */
  if (stage === 'ask') {
    return (
      <SubPage
        title={`${step + 1} / ${QUESTIONS.length}`}
        onBack={() => (step === 0 ? setStage('intro') : setStep(step - 1))}
      >
        <Box aria-hidden sx={{
          height: 4, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.surfacePress, mt: '16px', overflow: 'hidden',
        }}>
          <Box sx={{
            width: `${(step / QUESTIONS.length) * 100}%`, height: '100%',
            bgcolor: tokens.blue, borderRadius: `${tokens.rPill}px`, transition: `width .25s ${tokens.ease}`,
          }} />
        </Box>

        <Typography sx={{
          fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-.2px',
          mt: '28px', mb: '24px',
        }}>{q.text}</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ANSWERS.map((a) => {
            const on = answers[q.id] === a.value;
            return (
              <ButtonBase
                key={a.value}
                onClick={() => answer(a.value)}
                aria-pressed={on}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minHeight: 56,
                  px: '18px', textAlign: 'left', justifyContent: 'flex-start',
                  borderRadius: `${tokens.rRow}px`,
                  bgcolor: CHOICE_TINT[a.value], color: CHOICE_INK[a.value],
                  fontSize: 16, fontWeight: 600,
                  transition: 'background .15s ease',
                }}
              >
                <Box sx={{ flex: 1 }}>{a.label}</Box>
                {on && <Box aria-hidden sx={{ display: 'flex' }}><CheckIcon size={16} /></Box>}
              </ButtonBase>
            );
          })}
        </Box>

        <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, textAlign: 'center', pt: '18px' }}>
          Dogry ýa-da nädogry jogap ýok
        </Typography>
      </SubPage>
    );
  }

  /* ---------------- result ---------------- */
  const ranked = matches(answers);
  const [top, ...rest] = ranked;
  const scores = traitScores(answers);
  const why = drivers(top.id, answers);

  return (
    <SubPage title="Synagyň netijesi" onBack={onBack}>
      {/* the match, and immediately why it is the match */}
      <Box sx={{
        mt: '14px', bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`, p: '18px 17px',
      }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: tokens.blueText }}>
          SAŇA IŇ LAÝYGY
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px', mt: '4px' }}>
          <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.4px', flex: 1 }}>
            {top.label}
          </Typography>
          <Typography sx={{
            fontSize: 22, fontWeight: 700, color: tokens.blueText, fontVariantNumeric: 'tabular-nums',
          }}>{top.match}%</Typography>
        </Box>
        <Typography sx={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, mt: '6px' }}>
          {top.what}
        </Typography>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: '7px', mt: '13px', pt: '13px',
          borderTop: `1px solid rgba(53,112,223,.18)`,
        }}>
          {why.map((d) => (
            <Box key={d.trait.id} sx={{
              px: '11px', height: 28, borderRadius: `${tokens.rPill}px`, bgcolor: '#fff',
              display: 'grid', placeItems: 'center',
              fontSize: 13, fontWeight: 600, color: d.trait.color,
            }}>{`${d.trait.label} ${d.score}%`}</Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '11px' }}>
          {`Dersler: ${top.hint}`}
        </Typography>
      </Box>

      <Box sx={{ pt: '14px' }}>
        <Button
          fullWidth variant="contained" disableElevation
          startIcon={<TargetIcon size={17} />}
          onClick={() => { onPickDream(top.id); toast(`${top.label} maksat edip bellendi`); }}
        >
          Maksat edip belle
        </Button>
      </Box>

      <SectionLabel>Ýene seret</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rest.slice(0, 2).map((s) => (
          <SurfaceRow
            key={s.id}
            label={s.label}
            labelSx={{ fontSize: 15, fontWeight: 600 }}
            sub={s.hint}
            end={<RowEnd value={`${s.match}%`} />}
            onClick={() => { onPickDream(s.id); toast(`${s.label} maksat edip bellendi`); }}
          />
        ))}
      </Box>

      {/* the profile the ranking was computed from, so the percentages above
          are checkable rather than pronounced */}
      <SectionLabel>Seniň ugurlaryň</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {TRAITS.map((t) => (
          <MeterTile
            key={t.id}
            value={`${scores[t.id]}%`}
            label={t.label}
            pct={scores[t.id]}
            color={t.color}
          />
        ))}
      </Box>

      <Typography sx={{
        fontSize: 12.5, color: tokens.ink3, textAlign: 'center', lineHeight: 1.5, pt: '14px',
      }}>
        {saved ? `${fmtDate(saved.at)} · ${answered} sowala jogap berildi` : ''}
      </Typography>

      <Button
        fullWidth variant="text" onClick={start}
        sx={{ mt: '8px', mb: '4px', fontSize: 14, fontWeight: 700 }}
      >Synagy gaýtadan geç</Button>
    </SubPage>
  );
}

/* What the Profil row shows without opening the test: the top match, or an
   invitation. Derived from the stored answers like everything else. */
export const careerRowValue = (answers?: Answers) => {
  if (!answers) return 'Geçilmedik';
  const top = matches(answers)[0];
  return `${top.label} · ${top.match}%`;
};

export const careerDreamLabel = (id: string) => specialityOf(id)?.label ?? '—';

/** The school subjects a goal rests on — the half of a job title a pupil can
    act on this term, so the goal is never only a word. */
export const careerDreamHint = (id: string) => specialityOf(id)?.hint ?? '';
