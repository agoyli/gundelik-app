import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AiChatSheet, AiFab } from '../components/AiHelper';
import type { AiSuggestion } from '../components/AiHelper';
import { CheckIcon, ChevronIcon, QuizIcon } from '../components/Icons';
import { PaidFeatureSheet } from '../components/Paywall';
import { PillHeader } from '../components/Ui';
import { tierFor, useCan } from '../state/prefs';
import type { LessonKind } from '../data/curriculum';
import { appUrl, loadExam, loadLesson } from '../data/lessons';
import type { ExamQuestion, LessonContent } from '../data/lessons';
import { tokens } from '../theme';

type Meta = { label: string; color: string; ink: string; tint: string; icon: (size: number) => ReactNode };
type LessonLite = {
  id: string; title: string; kind: LessonKind; extent: string; done: boolean;
  grade: number; nos: number[];
};

/*
 * The lesson page reads the lesson.
 *
 * It used to hold one hand-written lesson about natural numbers, one parabola
 * playground and one three-question test about discriminants, and showed that
 * same set whichever of the 4051 themes you opened. Everything here now comes
 * from `src/data/lessons/<grade>-<slug>.json`, fetched for the stop you opened.
 *
 * Three kinds of stop, three pages:
 *   text         the written lesson — hook, summary, steps, formulas, examples
 *   interactive  the theme's own mini-app, given the whole screen
 *   test         a checkpoint over the last three themes' test banks
 *
 * 3597 themes have no material written yet. The page says so plainly instead of
 * showing somebody else's lesson.
 */

const SectionCard = ({ title, accent, children }: { title: string; accent?: string; children: ReactNode }) => (
  <Box sx={{
    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  }}>
    <Typography sx={{ fontSize: 15, fontWeight: 700, color: accent ?? tokens.ink }}>{title}</Typography>
    {children}
  </Box>
);

const Bullet = ({ color, children }: { color: string; children: ReactNode }) => (
  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
    <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flex: 'none', mt: '8px' }} />
    <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{children}</Typography>
  </Box>
);

/* ---------------- AI prompts, made of this lesson's own material ---------------- */
const list = (items: string[]) => items.map((x) => `• ${x}`).join('\n');

const aiForLesson = (c: LessonContent): AiSuggestion[] => [
  { label: 'Gysgaça düşündir', reply: c.summary },
  ...(c.concepts.length ? [{ label: 'Esasy düşünjeler', reply: list(c.concepts) }] : []),
  ...(c.selfCheck.length
    ? [{ label: 'Maňa sorag ber', reply: `${c.selfCheck[0].q}\n\nJogaby: ${c.selfCheck[0].a}` }]
    : []),
  ...(c.examPoints.length ? [{ label: 'Synagda näme soralýar?', reply: list(c.examPoints) }] : []),
];

const aiForResult = (score: number, total: number, weak: string[]): AiSuggestion[] => [
  {
    label: 'Netijämi seljer',
    reply: `Netijäň: ${score}/${total}. ${score === total
      ? 'Ajaýyp — üç temany hem berk özleşdiripsiň!'
      : `Gaýtalamaly temalar:\n${list(weak)}`}`,
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
        width: '100%', minHeight: 48, borderRadius: `${tokens.rRow}px`, px: '15px', py: '10px',
        justifyContent: 'flex-start', textAlign: 'left', fontSize: 15, fontWeight: 600, lineHeight: 1.4,
        bgcolor: palette.bg, color: palette.color,
        border: `1.5px solid ${palette.border}`,
        transition: 'background .15s ease,border-color .15s ease',
      }}
    >{label}</ButtonBase>
  );
}

/* ---------------- Screen ---------------- */
export function LessonScreen({ lesson, subjectSlug, meta, onClose, onComplete, onUpgrade }: {
  lesson: LessonLite; subjectSlug: string; meta: Meta;
  onClose: () => void; onComplete: () => void; onUpgrade: () => void;
}) {
  const canAi = useCan('ai');
  /* undefined while the subject-grade file is in flight, null when the theme
     has no material at all */
  const [content, setContent] = useState<LessonContent | null | undefined>(undefined);
  const [exam, setExam] = useState<ExamQuestion[] | undefined>(undefined);
  const [aiOpen, setAiOpen] = useState(false);
  /* self-check accordions */
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  /* checkpoint: intro → one question per step → result */
  const [stage, setStage] = useState<'start' | number | 'result'>('start');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const isExam = lesson.kind === 'test';

  useEffect(() => {
    let live = true;
    setContent(undefined);
    setExam(undefined);
    setStage('start');
    setAnswers({});
    setRevealed({});
    if (isExam) {
      loadExam(lesson.grade, subjectSlug, lesson.nos).then((qs) => { if (live) setExam(qs); });
    } else {
      loadLesson(lesson.grade, subjectSlug, lesson.nos[0]).then((c) => { if (live) setContent(c); });
    }
    return () => { live = false; };
  }, [isExam, lesson.grade, lesson.nos, subjectSlug]);

  const test = exam ?? [];
  const score = test.filter((t, i) => answers[i] === t.correct).length;
  const weak = [...new Set(test.filter((t, i) => answers[i] !== t.correct).map((t) => t.theme))];
  const inQuestions = isExam && typeof stage === 'number';

  const aiSuggestions = isExam
    ? (stage === 'result' ? aiForResult(score, test.length, weak) : [{
      label: 'Nämä taýýarlanmaly?',
      reply: `Bu barlag ${lesson.nos.length} temany öz içine alýar. Her temanyň sapagyny bir gezek gözden geçir, esasy düşünjelere we formulalara üns ber.`,
    }])
    : content ? aiForLesson(content)
      : [{
        label: 'Bu tema näme hakda?',
        reply: `«${lesson.title}» boýunça sapak materialy heniz taýýarlanmady. Şonda-da soragyňy ýaz — düşündirmäge synanyşaýyn.`,
      }];
  const aiFallback = content
    ? `${content.summary}\n\nJogabyň gysgasy şeýle. Ýokardaky taýýar soraglar hem kömek edip biler.`
    : 'Soragyňy ýaz — elimden gelenini düşündireýin.';

  /* The interactive stop is the mini-app: it gets the screen, not a card on a
     page of prose. Its own scrolling happens inside the frame. */
  const appSrc = lesson.kind === 'interactive' && content?.app
    ? appUrl(lesson.grade, subjectSlug, content.app)
    : null;

  return (
    /* The detail page owns the whole screen. The tab bar hides itself behind a
       back button (App.tsx), so the old inset that kept a 92px strip free for
       it only ever exposed the page underneath. */
    <Box sx={{
      position: 'absolute', inset: 0,
      zIndex: 20, bgcolor: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      <PillHeader title={meta.label} onBack={onClose} />

      {appSrc ? (
        <Box component="iframe" src={appSrc} title={lesson.title}
          sx={{ flex: 1, width: '100%', border: 0, bgcolor: tokens.surface }} />
      ) : (
        <Box sx={{
          flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
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

            {/* ---- still loading ---- */}
            {((isExam && exam === undefined) || (!isExam && content === undefined)) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[64, 120, 90].map((h) => (
                  <Box key={h} aria-hidden sx={{
                    height: h, borderRadius: `${tokens.rCard}px`, bgcolor: tokens.surface,
                    animation: 'lessonPulse 1.2s ease-in-out infinite',
                    '@keyframes lessonPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: .55 } },
                  }} />
                ))}
                <Typography variant="caption" sx={{ textAlign: 'center' }}>Sapak açylýar…</Typography>
              </Box>
            )}

            {/* ---- nothing written for this theme yet ---- */}
            {!isExam && content === null && (
              <Box sx={{
                bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '24px 18px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center',
              }}>
                <Box aria-hidden sx={{
                  width: 56, height: 56, borderRadius: `${tokens.rCard}px`, bgcolor: tokens.blueTint,
                  color: tokens.blueText, display: 'grid', placeItems: 'center',
                }}>{meta.icon(28)}</Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Material taýýarlanýar</Typography>
                <Typography variant="body2" sx={{ color: tokens.ink2 }}>
                  Bu tema mekdep maksatnamasynda bar we onuň üçin {lesson.extent} berilýär.
                  Sapagyň ýazgysy, gönükmeleri we testi taýýar bolanda şu ýerde peýda bolar.
                </Typography>
                <Typography variant="caption">
                  Şu wagt temany geçen bolsaň, aşakdan bellik edip bilersiň.
                </Typography>
              </Box>
            )}

            {/* ---- the written lesson ---- */}
            {!isExam && content && (
              <>
                {content.hook && (
                  <Typography variant="body2" sx={{ fontSize: 15, lineHeight: 1.65, color: tokens.ink2, px: '2px' }}>
                    {content.hook}
                  </Typography>
                )}

                {content.summary && (
                  <Box sx={{ bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`, p: '15px 16px' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokens.blueText, mb: '5px' }}>Gysgaça</Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{content.summary}</Typography>
                  </Box>
                )}

                {content.steps.length > 0 && (
                  <SectionCard title="Ädimme-ädim">
                    {content.steps.map((s, i) => (
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
                )}

                {content.concepts.length > 0 && (
                  <SectionCard title="Esasy düşünjeler">
                    {content.concepts.map((k) => <Bullet key={k.slice(0, 18)} color={tokens.blue}>{k}</Bullet>)}
                  </SectionCard>
                )}

                {content.formulas.length > 0 && (
                  <SectionCard title="Formulalar">
                    {content.formulas.map((f) => (
                      <Box key={f.slice(0, 18)} sx={{
                        bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, p: '11px 13px',
                        fontSize: 15, fontWeight: 600, color: tokens.blueText, fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.5,
                      }}>{f}</Box>
                    ))}
                  </SectionCard>
                )}

                {content.examples.length > 0 && (
                  <SectionCard title="Mysallar">
                    {content.examples.map((m) => (
                      <Box key={m.slice(0, 18)} sx={{ bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, p: '12px 13px' }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{m}</Typography>
                      </Box>
                    ))}
                  </SectionCard>
                )}

                {content.mustKnow.length > 0 && (
                  <SectionCard title="Hökman bilmeli" accent={tokens.orangeText}>
                    {content.mustKnow.map((m) => (
                      <Box key={m.slice(0, 18)} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <Box aria-hidden sx={{ color: tokens.orangeText, display: 'flex', mt: '3px', flex: 'none' }}>
                          <CheckIcon size={13} />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>{m}</Typography>
                      </Box>
                    ))}
                  </SectionCard>
                )}

                {content.examPoints.length > 0 && (
                  <SectionCard title="Synagda soralýar" accent={tokens.purpleText}>
                    {content.examPoints.map((e) => <Bullet key={e.slice(0, 18)} color={tokens.purple}>{e}</Bullet>)}
                  </SectionCard>
                )}

                {content.selfCheck.length > 0 && (
                  <SectionCard title="Özüňi barla">
                    {content.selfCheck.map((q, i) => (
                      <Box key={q.q} sx={{ bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, overflow: 'hidden' }}>
                        <ButtonBase
                          onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                          aria-expanded={!!revealed[i]}
                          sx={{
                            width: '100%', p: '12px 14px', justifyContent: 'space-between', gap: '10px',
                            textAlign: 'left', fontSize: 14, fontWeight: 600, lineHeight: 1.4,
                          }}
                        >
                          {q.q}
                          <Box sx={{
                            color: tokens.inkDisabled, display: 'flex', flex: 'none',
                            transform: revealed[i] ? 'rotate(-90deg)' : 'rotate(90deg)',
                            transition: 'transform .15s ease',
                          }}><ChevronIcon size={10} /></Box>
                        </ButtonBase>
                        {revealed[i] && (
                          <Typography variant="body2" sx={{ p: '0 14px 12px', color: tokens.greenText, fontWeight: 600 }}>
                            {q.a}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </SectionCard>
                )}
              </>
            )}

            {/* ---- checkpoint: the three themes' banks, asked together ---- */}
            {isExam && exam && stage === 'start' && (
              <Box sx={{
                bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '24px 18px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
              }}>
                <Box aria-hidden sx={{
                  width: 64, height: 64, borderRadius: `${tokens.rCard}px`, bgcolor: meta.tint,
                  color: meta.color, display: 'grid', placeItems: 'center',
                }}><QuizIcon size={32} /></Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Taýynmy?</Typography>
                <Typography variant="body2" sx={{ color: tokens.ink2 }}>
                  {test.length} sorag · her soragyň bir dogry jogaby bar.
                  Soraglar şu temalardan alynýar:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'stretch' }}>
                  {[...new Set(test.map((q) => q.theme))].map((t, i) => (
                    <Box key={t} sx={{
                      display: 'flex', gap: '9px', alignItems: 'center', textAlign: 'left',
                      bgcolor: '#fff', borderRadius: `${tokens.rRow}px`, p: '10px 12px',
                    }}>
                      <Box aria-hidden sx={{
                        width: 22, height: 22, borderRadius: '50%', flex: 'none',
                        bgcolor: tokens.blueSoft, color: tokens.blueText, fontSize: 12, fontWeight: 700,
                        display: 'grid', placeItems: 'center',
                      }}>{i + 1}</Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{t}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {inQuestions && typeof stage === 'number' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
                    <Box sx={{
                      width: `${((stage + 1) / test.length) * 100}%`, height: '100%',
                      borderRadius: `${tokens.rPill}px`, bgcolor: meta.color, transition: 'width .25s ease',
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                    {stage + 1}/{test.length}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '18px 17px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: tokens.inkMuted }}>
                    {test[stage].theme}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45 }}>{test[stage].q}</Typography>
                  {test[stage].options.map((o, i) => (
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
                    onClick={() => setStage(stage === test.length - 1 ? 'result' : stage + 1)}>
                    {stage === test.length - 1 ? 'Netije' : 'Indiki'}
                  </Button>
                </Box>
              </>
            )}

            {isExam && stage === 'result' && (
              <>
                <Box sx={{
                  bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '22px 18px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}>
                  <Box sx={{
                    width: 86, height: 86, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    border: `6px solid ${score === test.length ? tokens.greenDeep : score * 2 >= test.length ? tokens.orange : tokens.red}`,
                    fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  }}>{score}/{test.length}</Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                    {score === test.length ? 'Ajaýyp! 🎉' : score * 2 >= test.length ? 'Gowy netije!' : 'Ýene synanyş!'}
                  </Typography>
                  {weak.length > 0 && (
                    <Typography variant="body2" sx={{ color: tokens.ink2, textAlign: 'center' }}>
                      Gaýtalamaly: {weak.join(', ')}
                    </Typography>
                  )}
                  <ButtonBase
                    onClick={() => { setAnswers({}); setStage(0); }}
                    sx={{
                      height: 32, px: '14px', borderRadius: `${tokens.rPill}px`, mt: '2px',
                      bgcolor: tokens.blueTint, color: tokens.blueText, fontSize: 13.5, fontWeight: 600,
                    }}>Täzeden çöz</ButtonBase>
                </Box>
                {test.map((t, qi) => (
                  <Box key={t.q} sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '16px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
      )}

      {/* Footer CTA — during the questions, navigation lives in the content */}
      {!inQuestions && (
        <Box sx={{
          p: `12px ${tokens.gutter} calc(12px + env(safe-area-inset-bottom))`,
          borderTop: `1px solid ${tokens.divider}`, bgcolor: '#fff',
        }}>
          {isExam && stage === 'start' ? (
            <Button fullWidth variant="contained" disableElevation
              disabled={test.length === 0}
              startIcon={<QuizIcon size={18} />}
              onClick={() => { setAnswers({}); setStage(0); }}>
              Başla ({test.length} sorag)
            </Button>
          ) : (
            <Button fullWidth variant="contained" disableElevation onClick={onComplete}>
              {isExam && stage === 'result'
                ? `Tamamla (${score}/${test.length}) ✓`
                : lesson.done ? 'Ýap' : 'Tamamla ✓'}
            </Button>
          )}
        </Box>
      )}

      {/* AI helper: floating button + chat sheet, on every lesson page.
          For the free tier the same button explains the feature instead. */}
      <AiFab lift onClick={() => setAiOpen(true)} />
      {canAi ? (
        <AiChatSheet
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          suggestions={aiSuggestions}
          fallback={aiFallback}
        />
      ) : (
        <PaidFeatureSheet
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          title="Akylly mugallym 24/7"
          note={`Sapak boýunça islendik soragyňa jogap berýän kömekçi — ${tierFor('ai')?.name} bilen açylýar.`}
          feature="ai"
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
