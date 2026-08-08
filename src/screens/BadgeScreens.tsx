import { Box, ButtonBase, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { LockIcon, TrophyIcon } from '../components/Icons';
import { BetaPill, TeaserCard } from '../components/Paywall';
import {
  EmptyState, IconBadge, SectionLabel, Segmented, StatTile, SubPage,
} from '../components/Ui';
import { AWARDS, BADGE_TYPES, TONE, WEEK_LABELS, badgeType, toneOf } from '../data/badges';
import type { Award, BadgeTone } from '../data/badges';
import { fmtDate } from '../lib/date';
import { usePrefs } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Mugallymyň nyşanlary — the badge feed and its statistics.
 *
 * Everything on this page is aggregated from `AWARDS` at render time, so the
 * headline counts, the per-badge bars, the per-subject split and the weekly
 * trend can never tell three different stories about the same term.
 *
 * The free tier sees counts only — see LockedFeed for where that line is drawn
 * and why.
 */

/* ---------------- the chip ---------------- */

export function BadgeChip({ typeId, size = 'md' }: { typeId: string; size?: 'sm' | 'md' }) {
  const t = badgeType(typeId);
  if (!t) return null;
  const tone = TONE[t.tone];
  const sm = size === 'sm';
  return (
    <Box
      role="img"
      aria-label={`${tone.label} nyşan: ${t.label}`}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: sm ? '4px' : '6px', flex: 'none',
        height: sm ? 22 : 28, px: sm ? '7px' : '10px', borderRadius: `${tokens.rPill}px`,
        bgcolor: tone.tint, color: tone.ink,
        fontSize: sm ? 11.5 : 13, fontWeight: 600, maxWidth: '100%',
      }}
    >
      <Box component="span" aria-hidden sx={{ fontSize: sm ? 11 : 13, lineHeight: 1 }}>{t.emoji}</Box>
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {t.label}
      </Box>
    </Box>
  );
}

/* The one compact badge signal: "+3 / −1" in tone-tinted numerals.
   Emoji are the badge's identity in a labelled list, but on a lesson card next
   to the geometric GradeBadge an unlabelled emoji disc reads as decoration —
   the app speaks in tinted pills and numbers, so this does too.
   `plain` drops the pill for places that already sit in a figure slot. */
export function BadgeScore({ good, bad, plain }: { good: number; bad: number; plain?: boolean }) {
  if (good === 0 && bad === 0) return null;
  const cell = (n: number, sign: string, tint: string, ink: string) => (
    <Box sx={plain ? { color: ink } : {
      display: 'inline-grid', placeItems: 'center', minWidth: 26, height: 22, px: '6px',
      borderRadius: `${tokens.rPill}px`, bgcolor: tint, color: ink,
      fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
    }}>{sign}{n}</Box>
  );
  return (
    <Box role="img" aria-label={`${good} ýagşy, ${bad} üns bermeli`} sx={{
      display: 'inline-flex', alignItems: 'center', gap: plain ? '9px' : '6px', flex: 'none',
    }}>
      {good > 0 && cell(good, '+', tokens.greenTint, tokens.greenText)}
      {bad > 0 && cell(bad, '−', tokens.redTint, tokens.redText)}
    </Box>
  );
}

/* ---------------- award row ---------------- */

const AwardRow = ({ a }: { a: Award }) => {
  const t = badgeType(a.typeId);
  const tone = TONE[toneOf(a)];
  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: '13px',
      bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
    }}>
      <Box aria-hidden sx={{
        width: 44, height: 44, borderRadius: `${tokens.rRow}px`, flex: 'none',
        bgcolor: tone.tint, display: 'grid', placeItems: 'center', fontSize: 20,
      }}>{t?.emoji}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, flex: 1, color: tone.ink }} noWrap>
            {t?.label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.inkMuted, flex: 'none' }}>{fmtDate(a.date)}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '2px' }} noWrap>
          {a.subject} · {a.teacher}
        </Typography>
        {a.comment && (
          <Typography sx={{ fontSize: 13, color: tokens.ink2, mt: '6px', lineHeight: 1.45 }}>
            “{a.comment}”
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/* ---------------- stats screen ---------------- */

type Range = 'week' | 'term';

export function BadgeStatsScreen({ onBack, onUpgrade }: { onBack: () => void; onUpgrade: () => void }) {
  const { premium, beta } = usePrefs();
  const [range, setRange] = useState<Range>('term');
  const [tone, setTone] = useState<BadgeTone | 'all'>('all');

  const scoped = useMemo(
    () => (range === 'week' ? AWARDS.filter((a) => a.week >= 6) : AWARDS),
    [range],
  );

  const good = scoped.filter((a) => toneOf(a) === 'good').length;
  const bad = scoped.length - good;
  const share = scoped.length ? Math.round((good / scoped.length) * 100) : 0;

  /* per badge type */
  const byType = useMemo(() => BADGE_TYPES
    .map((t) => ({ t, n: scoped.filter((a) => a.typeId === t.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n), [scoped]);
  const maxType = Math.max(1, ...byType.map((x) => x.n));

  /* per subject */
  const bySubject = useMemo(() => {
    const map = new Map<string, { good: number; bad: number }>();
    scoped.forEach((a) => {
      const cur = map.get(a.subject) ?? { good: 0, bad: 0 };
      if (toneOf(a) === 'good') cur.good += 1; else cur.bad += 1;
      map.set(a.subject, cur);
    });
    return [...map.entries()]
      .map(([subject, v]) => ({ subject, ...v, total: v.good + v.bad }))
      .sort((a, b) => b.total - a.total);
  }, [scoped]);
  const maxSubject = Math.max(1, ...bySubject.map((s) => s.total));

  /* weekly trend */
  const byWeek = useMemo(() => WEEK_LABELS.map((label, i) => {
    const week = i + 1;
    const items = AWARDS.filter((a) => a.week === week);
    return {
      label,
      good: items.filter((a) => toneOf(a) === 'good').length,
      bad: items.filter((a) => toneOf(a) === 'bad').length,
    };
  }), []);
  const maxWeek = Math.max(1, ...byWeek.map((w) => w.good + w.bad));

  const feed = tone === 'all' ? scoped : scoped.filter((a) => toneOf(a) === tone);

  return (
    <SubPage title="Nyşanlar" onBack={onBack} help="Mugallymlaryň sapakda beren nyşanlary. Baha näme edileni, nyşan bolsa nähili işlenilenini görkezýär.">

      <Box sx={{ pt: '14px' }}>
        <Segmented
          label="Döwür"
          value={range}
          onChange={setRange}
          options={[{ id: 'week', label: 'Şu hepde' }, { id: 'term', label: 'Çärýek' }]}
        />
      </Box>

      {/* headline — free tier sees this much */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', mt: '12px' }}>
        <StatTile value={`${good}`} label="Ýagşy" color={tokens.greenText} />
        <StatTile value={`${bad}`} label="Üns bermeli" color={tokens.redText} />
        <StatTile value={`${share}%`} label="Ýagşy paýy" color={tokens.blueText} />
      </Box>

      {/* the balance bar reads faster than either number alone */}
      <Box sx={{ mt: '12px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.greenText }}>Ýagşy {good}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.redText }}>Üns bermeli {bad}</Typography>
        </Box>
        <Box role="img" aria-label={`Ýagşy nyşanlaryň paýy ${share} göterim`} sx={{
          display: 'flex', height: 12, borderRadius: `${tokens.rPill}px`, overflow: 'hidden', bgcolor: tokens.dividerSoft,
        }}>
          <Box sx={{ width: `${share}%`, bgcolor: tokens.greenDeep }} />
          <Box sx={{ flex: 1, bgcolor: tokens.red }} />
        </Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '10px', lineHeight: 1.45 }}>
          {share >= 80
            ? 'Ajaýyp görkeziji — nyşanlaryň aglabasy ýagşy.'
            : share >= 60
              ? 'Gowy görkeziji. Üns bermeli nyşanlaryň sebäbini aşakdan görüp bilersiň.'
              : 'Üns bermeli nyşanlar köpelýär — aşakdaky derslere seret.'}
        </Typography>
      </Box>

      {premium ? (
        <>
          {/* per badge */}
          <SectionLabel>Nyşan görnüşleri</SectionLabel>
          <Box sx={{
            bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
            display: 'flex', flexDirection: 'column', gap: '13px',
          }}>
            {byType.map(({ t, n }) => (
              <Box key={t.id} sx={{ display: 'grid', gridTemplateColumns: '132px 1fr 24px', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <Box component="span" aria-hidden sx={{ fontSize: 14 }}>{t.emoji}</Box>
                  <Typography noWrap sx={{ fontSize: 13, color: tokens.ink2 }}>{t.label}</Typography>
                </Box>
                <Box sx={{ height: 8, borderRadius: 4, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${(n / maxType) * 100}%`, height: '100%', borderRadius: 4,
                    bgcolor: TONE[t.tone].solid,
                  }} />
                </Box>
                <Typography sx={{
                  fontSize: 13, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                }}>{n}</Typography>
              </Box>
            ))}
          </Box>

          {/* per subject */}
          <SectionLabel>Dersler boýunça</SectionLabel>
          <Box sx={{
            bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `16px ${tokens.padCard}`,
            display: 'flex', flexDirection: 'column', gap: '13px',
          }}>
            {bySubject.map((s) => (
              <Box key={s.subject}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '5px' }}>
                  <Typography sx={{ fontSize: 13, color: tokens.ink2 }} noWrap>{s.subject}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: tokens.ink3, flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
                    {/* only the sides that exist — "+0 · −1" reads as a zero worth mentioning */}
                    {[s.good ? `+${s.good}` : '', s.bad ? `−${s.bad}` : ''].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
                <Box role="img" aria-label={`${s.subject}: ${s.good} ýagşy, ${s.bad} üns bermeli`} sx={{
                  display: 'flex', gap: '2px', height: 8,
                }}>
                  <Box sx={{
                    width: `${(s.good / maxSubject) * 100}%`, bgcolor: tokens.greenDeep,
                    borderRadius: '4px 0 0 4px',
                  }} />
                  <Box sx={{
                    width: `${(s.bad / maxSubject) * 100}%`, bgcolor: tokens.red,
                    borderRadius: s.good ? '0 4px 4px 0' : '4px',
                  }} />
                </Box>
              </Box>
            ))}
          </Box>

          {/* beta: the experimental trend */}
          {beta && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '6px', pt: '20px', pb: '8px' }}>
                <Typography sx={{
                  fontSize: 13, fontWeight: 600, color: tokens.inkMuted,
                  textTransform: 'uppercase', letterSpacing: '.6px',
                }}>Hepdelik tendensiýa</Typography>
                <BetaPill />
              </Box>
              <Box sx={{ bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: `18px ${tokens.padCard}` }}>
                <Box role="img" aria-label="Hepdelik nyşan tendensiýasy" sx={{
                  display: 'flex', alignItems: 'flex-end', gap: '10px', height: 116,
                }}>
                  {byWeek.map((w) => (
                    <Box key={w.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Box sx={{
                        width: '100%', maxWidth: 26, display: 'flex', flexDirection: 'column',
                        justifyContent: 'flex-end', gap: '2px', height: 92,
                      }}>
                        {w.bad > 0 && (
                          <Box sx={{
                            height: `${(w.bad / maxWeek) * 92}px`, bgcolor: tokens.red,
                            borderRadius: '4px 4px 0 0', minHeight: 4,
                          }} />
                        )}
                        <Box sx={{
                          height: `${(w.good / maxWeek) * 92}px`, bgcolor: tokens.greenDeep,
                          borderRadius: w.bad > 0 ? '0 0 4px 4px' : '4px', minHeight: w.good ? 4 : 0,
                        }} />
                      </Box>
                      <Typography sx={{ fontSize: 10.5, color: tokens.inkMuted }}>{w.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </>
      ) : (
        <Box sx={{ pt: '18px' }}>
          <TeaserCard
            title="Doly seljerme Premium-da"
            note="Haýsy nyşanlaryň näçe gezek berlendigi, dersler boýunça bölünişi we hepdelik tendensiýa."
            icon={<TrophyIcon size={22} />}
            onUpgrade={onUpgrade}
            preview={(
              <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {byType.slice(0, 4).map(({ t, n }) => (
                  <Box key={t.id} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '10px' }}>
                    <Typography noWrap sx={{ fontSize: 13, color: tokens.ink2 }}>{t.emoji} {t.label}</Typography>
                    <Box sx={{ height: 8, borderRadius: 4, bgcolor: tokens.dividerSoft }}>
                      <Box sx={{ width: `${(n / maxType) * 100}%`, height: '100%', borderRadius: 4, bgcolor: TONE[t.tone].solid }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          />
        </Box>
      )}

      <SectionLabel>Nyşanlaryň taryhy</SectionLabel>
      {premium ? (
        <>
          <Box sx={{ display: 'flex', gap: '8px', pb: '14px' }}>
            {([['all', 'Ähli'], ['good', 'Ýagşy'], ['bad', 'Üns bermeli']] as [BadgeTone | 'all', string][]).map(([id, label]) => {
              const on = id === tone;
              return (
                <ButtonBase
                  key={id} onClick={() => setTone(id)} aria-pressed={on}
                  sx={{
                    height: 32, px: '14px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                    fontSize: 13.5, fontWeight: 600,
                    bgcolor: on ? tokens.blue : tokens.surface,
                    color: on ? '#fff' : tokens.ink2,
                    transition: 'background .15s ease,color .15s ease',
                  }}
                >{label}</ButtonBase>
              );
            })}
          </Box>
          {feed.length === 0 ? (
            <EmptyState icon={<TrophyIcon size={26} />} title="Nyşan ýok" note="Bu döwürde bu görnüşde nyşan berilmedik." />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feed.map((a) => <AwardRow key={a.id} a={a} />)}
            </Box>
          )}
        </>
      ) : (
        <LockedFeed awards={scoped} onUpgrade={onUpgrade} />
      )}
    </SubPage>
  );
}

/* ---------------- the free tier's view of the feed ----------------
 * The free tier gets the count and nothing that identifies a badge: not the
 * type, not the subject, not the teacher, not the comment. That is a deliberate
 * line, and it is drawn where the value actually is — a parent does not upgrade
 * to learn that five things happened, they upgrade to learn *which* five.
 *
 * The rows are still drawn, dated and tone-coloured, because a masked row that
 * you can see the shape of is a specific question ("what did the maths teacher
 * write on Tuesday?"), and a specific question is what makes someone tap. An
 * empty state or a bare wall would just read as "nothing here".
 *
 * Everything shown is true: the count, the dates, the balance. Nothing is
 * invented to manufacture urgency.
 */
function LockedFeed({ awards, onUpgrade }: { awards: Award[]; onUpgrade: () => void }) {
  const recent = awards.slice(0, 5);
  const hidden = awards.length;
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recent.map((a) => {
          const tone = TONE[toneOf(a)];
          return (
            <Box key={a.id} sx={{
              display: 'flex', alignItems: 'center', gap: '13px',
              bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
            }}>
              {/* tone is free — it is already in the balance bar above */}
              <Box aria-hidden sx={{
                width: 44, height: 44, borderRadius: `${tokens.rRow}px`, flex: 'none',
                bgcolor: tone.tint, color: tone.ink, display: 'grid', placeItems: 'center',
              }}><LockIcon size={18} /></Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* the masked identity: the row exists, the detail does not */}
                <Box aria-hidden sx={{
                  height: 11, width: '58%', borderRadius: 6, bgcolor: tone.tint,
                }} />
                <Box aria-hidden sx={{
                  height: 9, width: '38%', borderRadius: 5, bgcolor: tokens.dividerSoft, mt: '8px',
                }} />
              </Box>
              <Typography sx={{ fontSize: 12, color: tokens.inkMuted, flex: 'none' }}>
                {fmtDate(a.date)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ pt: '14px', pb: '10px' }}>
        <TeaserCard
          title={`${hidden} nyşan ýazgysy ýapyk`}
          note="Haýsy nyşan, haýsy dersde, haýsy mugallymdan we näme ýazandygy — Premium bilen açylýar."
          cta="Premium al"
          icon={<LockIcon size={22} />}
          onUpgrade={onUpgrade}
        />
      </Box>
    </>
  );
}

/* Entry row for the diary — states the balance, so the row is a summary */
export function BadgeRow({ onClick }: { onClick: () => void }) {
  const good = AWARDS.filter((a) => toneOf(a) === 'good').length;
  const bad = AWARDS.length - good;
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Mugallymyň nyşanlary: ${good} ýagşy, ${bad} üns bermeli`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: 48,
        bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, px: '15px', pr: '12px',
        textAlign: 'left', justifyContent: 'flex-start',
        '&:active': { bgcolor: tokens.surfacePress },
      }}
    >
      <IconBadge bg={tokens.greenTint} color={tokens.greenText} size={40} radius={12}>
        <TrophyIcon size={20} />
      </IconBadge>
      <Typography sx={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: '-.2px' }} noWrap>
        Mugallymyň nyşanlary
      </Typography>
      <BadgeScore good={good} bad={bad} />
    </ButtonBase>
  );
}
