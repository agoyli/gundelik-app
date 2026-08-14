import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { tokens } from '../theme';

/*
 * One quiz, wherever questions are asked.
 *
 * The lesson path's checkpoints and the Testler section ask the same banks in
 * the same way — a question at a time, no going back once it is answered
 * except by stepping back, the result only at the end — so they ask them with
 * the same component rather than two that drift.
 *
 * The questions come from the content source. Nothing here invents one.
 */

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  /** which theme it came from, when a quiz spans several */
  theme?: string;
};

export type QuizStage = 'start' | number | 'result';

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
        width: '100%', minHeight: 48, borderRadius: `${tokens.rRow}px`, px: '15px', py: '10px',
        justifyContent: 'flex-start', textAlign: 'left', fontSize: 15, fontWeight: 600, lineHeight: 1.4,
        bgcolor: palette.bg, color: palette.color,
        border: `1.5px solid ${palette.border}`,
        transition: 'background .15s ease,border-color .15s ease',
      }}
    >{label}</ButtonBase>
  );
}

/** The answers a reader has given so far, and what they add up to. */
export const useQuiz = (questions: QuizQuestion[]) => {
  const [stage, setStage] = useState<QuizStage>('start');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const score = questions.filter((t, i) => answers[i] === t.correct).length;
  /* the themes a wrong answer came from — what to read again */
  const weak = [...new Set(
    questions.filter((t, i) => answers[i] !== undefined && answers[i] !== t.correct)
      .map((t) => t.theme)
      .filter((t): t is string => !!t),
  )];

  return {
    stage,
    answers,
    score,
    weak,
    inQuestions: typeof stage === 'number',
    start: () => { setAnswers({}); setStage(0); },
    reset: () => { setAnswers({}); setStage('start'); },
    answer: (i: number, choice: number) => setAnswers((a) => ({ ...a, [i]: choice })),
    goto: setStage,
  };
};

export type QuizState = ReturnType<typeof useQuiz>;

/** The question a reader is on, with its progress bar and its two buttons. */
export function QuizQuestions({ questions, quiz, accent, onQuit }: {
  questions: QuizQuestion[]; quiz: QuizState; accent: string; onQuit: () => void;
}) {
  const i = quiz.stage as number;
  const q = questions[i];
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box sx={{ flex: 1, height: 6, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
          <Box sx={{
            width: `${((i + 1) / questions.length) * 100}%`, height: '100%',
            borderRadius: `${tokens.rPill}px`, bgcolor: accent, transition: 'width .25s ease',
          }} />
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
          {i + 1}/{questions.length}
        </Typography>
      </Box>

      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '18px 17px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {q.theme && (
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: tokens.inkMuted }}>{q.theme}</Typography>
        )}
        <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45 }}>{q.q}</Typography>
        {q.options.map((o, oi) => (
          <AnswerRow
            key={o}
            label={o}
            state={quiz.answers[i] === oi ? 'selected' : 'idle'}
            onClick={() => quiz.answer(i, oi)}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: '10px' }}>
        <Button fullWidth sx={{ bgcolor: tokens.surface, color: tokens.ink }}
          onClick={() => (i === 0 ? onQuit() : quiz.goto(i - 1))}>
          Yza
        </Button>
        <Button fullWidth variant="contained" disableElevation
          disabled={quiz.answers[i] === undefined}
          onClick={() => quiz.goto(i === questions.length - 1 ? 'result' : i + 1)}>
          {i === questions.length - 1 ? 'Netije' : 'Indiki'}
        </Button>
      </Box>
    </>
  );
}

/** The score, what to revisit, and every question with its right answer. */
export function QuizResult({ questions, quiz, extra }: {
  questions: QuizQuestion[]; quiz: QuizState; extra?: ReactNode;
}) {
  const { score, weak, answers } = quiz;
  const ring = score === questions.length ? tokens.greenDeep
    : score * 2 >= questions.length ? tokens.orange
      : tokens.red;
  return (
    <>
      <Box sx={{
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '22px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <Box sx={{
          width: 86, height: 86, borderRadius: '50%', display: 'grid', placeItems: 'center',
          border: `6px solid ${ring}`,
          fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        }}>{score}/{questions.length}</Box>
        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
          {score === questions.length ? 'Ajaýyp! 🎉'
            : score * 2 >= questions.length ? 'Gowy netije!'
              : 'Ýene synanyş!'}
        </Typography>
        {weak.length > 0 && (
          <Typography variant="body2" sx={{ color: tokens.ink2, textAlign: 'center' }}>
            Gaýtalamaly: {weak.join(', ')}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: '8px', mt: '2px' }}>
          <ButtonBase
            onClick={quiz.start}
            sx={{
              height: 32, px: '14px', borderRadius: `${tokens.rPill}px`,
              bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5, fontWeight: 600,
            }}>Täzeden çöz</ButtonBase>
          {extra}
        </Box>
      </Box>

      {questions.map((t, qi) => (
        <Box key={t.q} sx={{
          bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px 15px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
            {qi + 1}. {t.q}
          </Typography>
          <AnswerRow label={t.options[t.correct]} state="correct" />
          {answers[qi] !== t.correct && answers[qi] !== undefined && (
            <AnswerRow label={`Siziň jogabyňyz: ${t.options[answers[qi]]}`} state="wrong" />
          )}
        </Box>
      ))}
    </>
  );
}
