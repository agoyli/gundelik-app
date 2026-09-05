import { Box, ButtonBase, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { LockIcon, SparkleIcon, TrophyIcon } from '../components/Icons';
import { BetaPill, TeaserCard } from '../components/Paywall';
import {
  EmptyState, HeaderIconButton, IconBadge, SectionLabel, Segmented, StatTile, SubPage, VariantSheet,
} from '../components/Ui';
import type { Variant } from '../components/Ui';
import { AWARDS, BADGE_TYPES, TONE, WEEK_LABELS, badgeType, toneOf } from '../data/badges';
import type { Award, BadgeTone } from '../data/badges';
import { fmtDate } from '../lib/date';
import { tierFor, useCan, usePrefs } from '../state/prefs';
import { tokens } from '../theme';

/*
 * Mugallymyň ýyldyzlary — the badge feed and its statistics.
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
      aria-label={`${tone.label} ýyldyz: ${t.label}`}
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

/* ---------------- three ways to read a term of badges ----------------
 *
 * The stats page answers "how is the term going" and answers it well, but it
 * is the only question it answers — and it is a parent's question. A pupil
 * opening Ýyldyzlar wants to know which badges they have collected; a parent
 * catching up on the week wants to read what the teachers actually wrote, in
 * order, without decoding three charts first.
 *
 * So the same term of `AWARDS` is read three ways, behind the app's own
 * `VariantSheet`: statistics, a collection, and a diary. Nothing is duplicated
 * — every screen aggregates the same array at render time — and switching
 * keeps the period you had chosen, because the period is a fact about what you
 * are looking at rather than a setting of one layout.
 */
export type BadgeView = 'stats' | 'collection' | 'feed';

export const BADGE_VIEWS: Variant<BadgeView>[] = [
  { id: 'stats', name: 'Statistika', note: 'Sanlar, paýlar we hepdelik tendensiýa' },
  { id: 'collection', name: 'Kolleksiýa', note: 'Ýygnalan ýyldyzlar — görnüşi boýunça' },
  { id: 'feed', name: 'Gündelik ýazgy', note: 'Mugallymlaryň ýazany — wagt tertibinde' },
];

/*
 * The collection.
 *
 * Nine badge types exist; a pupil has some of them and not others, and that is
 * the shape of the thing they are actually trying to fill. So every type gets
 * a tile — earned ones in their tone with a count, unearned ones flat with
 * what earns them — and the good ones come first, because a wall that opens
 * with four red tiles is a wall nobody opens twice.
 *
 * The unearned tile is the useful half: it is the only place in the app that
 * says *how* a badge is given, in the teacher's own terms.
 */
function BadgeCollection({ awards, can, onUpgrade, plan }: {
  awards: Award[]; can: boolean; onUpgrade: () => void; plan?: { name: string };
}) {
  const counted = BADGE_TYPES.map((t) => ({
    t,
    n: awards.filter((a) => a.typeId === t.id).length,
  })).sort((a, b) => (a.t.tone === b.t.tone ? b.n - a.n : a.t.tone === 'good' ? -1 : 1));

  const earned = counted.filter((c) => c.n > 0).length;

  return (
    <>
      <Box sx={{
        mt: '12px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`,
        p: `16px ${tokens.padCard}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Ýygnalan görnüşler</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {earned}/{BADGE_TYPES.length}
          </Typography>
        </Box>
        <Box aria-hidden sx={{
          mt: '10px', height: 8, borderRadius: `${tokens.rPill}px`,
          bgcolor: tokens.dividerSoft, overflow: 'hidden',
        }}>
          <Box sx={{
            height: '100%', width: `${(earned / BADGE_TYPES.length) * 100}%`,
            bgcolor: tokens.blue, borderRadius: `${tokens.rPill}px`,
          }} />
        </Box>
      </Box>

      <SectionLabel>Ýyldyzlaryň görnüşleri</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {counted.map(({ t, n }) => {
          const tone = TONE[t.tone];
          const has = n > 0;
          return (
            <Box key={t.id} sx={{
              bgcolor: has ? tone.tint : tokens.surface,
              borderRadius: `${tokens.rCard}px`, p: '14px 13px', minHeight: 128,
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box aria-hidden sx={{
                  width: 40, height: 40, borderRadius: `${tokens.rTile}px`,
                  bgcolor: has ? '#fff' : tokens.surfacePress,
                  display: 'grid', placeItems: 'center', fontSize: 20,
                  filter: has ? 'none' : 'grayscale(1)', opacity: has ? 1 : .55,
                }}>{t.emoji}</Box>
                {has && (
                  <Typography sx={{
                    fontSize: 20, fontWeight: 700, color: tone.ink, fontVariantNumeric: 'tabular-nums',
                  }}>{n}</Typography>
                )}
              </Box>
              <Typography sx={{
                fontSize: 15, fontWeight: 700, color: has ? tokens.ink : tokens.ink3,
              }}>{t.label}</Typography>
              <Typography sx={{
                fontSize: 12.5, color: has ? tokens.ink2 : tokens.inkMuted, lineHeight: 1.4,
              }}>{has ? `${n} gezek berildi` : t.note}</Typography>
            </Box>
          );
        })}
      </Box>

      {!can && (
        <Box sx={{ pt: '14px' }}>
          <TeaserCard
            title="Her ýyldyzyň arkasynda bir waka bar"
            note={`Haýsy sapakda, haýsy mugallym we näme üçin berlenini ${plan?.name} bilen oka.`}
            feature="badges"
            onUpgrade={onUpgrade}
          />
        </Box>
      )}
    </>
  );
}

/*
 * The diary.
 *
 * What a parent reads on a Sunday: the term in order, grouped by day, each
 * entry saying who gave it and — where there is one — the sentence the teacher
 * wrote. It is the plainest of the three views and probably the most read; the
 * charts are for deciding, this is for knowing.
 */
function BadgeFeed({ awards, can, onUpgrade }: {
  awards: Award[]; can: boolean; onUpgrade: () => void;
}) {
  const days = useMemo(() => {
    const map = new Map<string, Award[]>();
    awards.forEach((a) => map.set(a.date, [...(map.get(a.date) ?? []), a]));
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [awards]);

  if (!can) return <LockedFeed awards={awards} onUpgrade={onUpgrade} />;

  return (
    <>
      {days.map(([date, items]) => (
        <Box key={date}>
          <SectionLabel>{fmtDate(date)}</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((a) => <AwardRow key={a.id} a={a} />)}
          </Box>
        </Box>
      ))}
      {days.length === 0 && (
        <Box sx={{ pt: '20px' }}>
          <EmptyState
            icon={<TrophyIcon size={26} />}
            title="Bu döwürde ýyldyz ýok"
            note="Başga döwri saýlap gör."
          />
        </Box>
      )}
    </>
  );
}

export function BadgeStatsScreen({ onBack, onUpgrade }: { onBack: () => void; onUpgrade: () => void }) {
  const { beta } = usePrefs();
  const can = useCan('badges');
  const plan = tierFor('badges');
  const [range, setRange] = useState<Range>('term');
  const [tone, setTone] = useState<BadgeTone | 'all'>('all');
  /* which reading of the same term — kept above the period, because the period
     survives a switch: it is a fact about what you are looking at */
  const [view, setView] = useState<BadgeView>('stats');
  const [picker, setPicker] = useState(false);

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
    <SubPage
      title="Ýyldyzlar"
      onBack={onBack}
      action={(
        <HeaderIconButton label="Sahypanyň görnüşleri" onClick={() => setPicker(true)}>
          <SparkleIcon size={20} />
        </HeaderIconButton>
      )}
      help="Mugallymlaryň sapakda beren ýyldyzlary. Baha näme edileni, ýyldyz bolsa nähili işlenilenini görkezýär."
    >
      <VariantSheet
        open={picker}
        title="Ýyldyzlar sahypasynyň görnüşleri"
        lede="Bir çärýek — üç dürli okalyşy. Maglumat ählisinde birmeňzeş."
        variants={BADGE_VIEWS}
        current={view}
        onClose={() => setPicker(false)}
        onPick={setView}
      />

      <Box sx={{ pt: '14px' }}>
        <Segmented
          label="Döwür"
          value={range}
          onChange={setRange}
          options={[{ id: 'week', label: 'Şu hepde' }, { id: 'term', label: 'Çärýek' }]}
        />
      </Box>

      {view === 'collection' && (
        <BadgeCollection awards={scoped} can={can} onUpgrade={onUpgrade} plan={plan} />
      )}
      {view === 'feed' && <BadgeFeed awards={scoped} can={can} onUpgrade={onUpgrade} />}
      {view === 'stats' && (
      <>

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
        <Box role="img" aria-label={`Ýagşy ýyldyzlaryň paýy ${share} göterim`} sx={{
          display: 'flex', height: 12, borderRadius: `${tokens.rPill}px`, overflow: 'hidden', bgcolor: tokens.dividerSoft,
        }}>
          <Box sx={{ width: `${share}%`, bgcolor: tokens.greenDeep }} />
          <Box sx={{ flex: 1, bgcolor: tokens.red }} />
        </Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '10px', lineHeight: 1.45 }}>
          {share >= 80
            ? 'Ajaýyp görkeziji — ýyldyzlaryň aglabasy ýagşy.'
            : share >= 60
              ? 'Gowy görkeziji. Üns bermeli ýyldyzlaryň sebäbini aşakdan görüp bilersiň.'
              : 'Üns bermeli ýyldyzlar köpelýär — aşakdaky derslere seret.'}
        </Typography>
      </Box>

      {can ? (
        <>
          {/* per badge */}
          <SectionLabel>Ýyldyz görnüşleri</SectionLabel>
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
                <Box sx={{ height: 8, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${(n / maxType) * 100}%`, height: '100%', borderRadius: `${tokens.rPill}px`,
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
                    borderRadius: `${tokens.rChip}px 0 0 ${tokens.rChip}px`,
                  }} />
                  <Box sx={{
                    width: `${(s.bad / maxSubject) * 100}%`, bgcolor: tokens.red,
                    borderRadius: s.good ? `0 ${tokens.rChip}px ${tokens.rChip}px 0` : `${tokens.rChip}px`,
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
                <Box role="img" aria-label="Hepdelik ýyldyz tendensiýasy" sx={{
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
                            borderRadius: `${tokens.rChip}px ${tokens.rChip}px 0 0`, minHeight: 4,
                          }} />
                        )}
                        <Box sx={{
                          height: `${(w.good / maxWeek) * 92}px`, bgcolor: tokens.greenDeep,
                          borderRadius: w.bad > 0 ? `0 0 ${tokens.rChip}px ${tokens.rChip}px` : `${tokens.rChip}px`, minHeight: w.good ? 4 : 0,
                        }} />
                      </Box>
                      <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>{w.label}</Typography>
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
            title="Doly seljerme ýapyk"
            note={`Haýsy ýyldyzlaryň näçe gezek berlendigi, dersler boýunça bölünişi we hepdelik tendensiýa — ${plan?.name} bilen açylýar.`}
            feature="badges"
            icon={<TrophyIcon size={22} />}
            onUpgrade={onUpgrade}
            preview={(
              <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {byType.slice(0, 4).map(({ t, n }) => (
                  <Box key={t.id} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '10px' }}>
                    <Typography noWrap sx={{ fontSize: 13, color: tokens.ink2 }}>{t.emoji} {t.label}</Typography>
                    <Box sx={{ height: 8, borderRadius: `${tokens.rPill}px`, bgcolor: tokens.dividerSoft }}>
                      <Box sx={{ width: `${(n / maxType) * 100}%`, height: '100%', borderRadius: `${tokens.rPill}px`, bgcolor: TONE[t.tone].solid }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          />
        </Box>
      )}

      <SectionLabel>Ýyldyzlaryň taryhy</SectionLabel>
      {can ? (
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
                    bgcolor: on ? tokens.blueSolid : tokens.surface,
                    color: on ? '#fff' : tokens.ink2,
                    transition: 'background .15s ease,color .15s ease',
                  }}
                >{label}</ButtonBase>
              );
            })}
          </Box>
          {feed.length === 0 ? (
            <EmptyState icon={<TrophyIcon size={26} />} title="Ýyldyz ýok" note="Bu döwürde bu görnüşde ýyldyz berilmedik." />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feed.map((a) => <AwardRow key={a.id} a={a} />)}
            </Box>
          )}
        </>
      ) : (
        <LockedFeed awards={scoped} onUpgrade={onUpgrade} />
      )}
      </>
      )}
    </SubPage>
  );
}

/* ---------------- the free tier's view of the feed ----------------
 * The free tier gets the count, the date, the tone — and the teacher's name.
 * What stays hidden is what the star actually was: the type, the subject and
 * the comment. That is where the value is — a parent does not upgrade to learn
 * that five things happened, they upgrade to learn *which* five.
 *
 * The teacher is named on purpose. A row that says "Ogulgerek Nurýewa · 12.05"
 * over a masked line is a specific question ("what did she write?"), and a
 * specific question is what makes someone tap; a row of two grey bars is just a
 * wall. It also keeps the free tier useful rather than merely teasing.
 *
 * Everything shown is true: the count, the dates, the balance, the teacher.
 * Nothing is invented to manufacture urgency.
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
                {/* who wrote it is free; what they wrote is not */}
                <Typography noWrap sx={{ fontSize: 15, fontWeight: 600 }}>{a.teacher}</Typography>
                <Box aria-hidden sx={{
                  height: 9, width: '62%', borderRadius: `${tokens.rPill}px`, bgcolor: tone.tint, mt: '7px',
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
          title={`${hidden} ýyldyz ýazgysy ýapyk`}
          note={`Haýsy ýyldyz, haýsy dersde we mugallymyň näme ýazandygy — ${tierFor('badges')?.name} bilen açylýar.`}
          feature="badges"
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
      aria-label={`Mugallymyň ýyldyzlary: ${good} ýagşy, ${bad} üns bermeli`}
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
        Mugallymyň ýyldyzlary
      </Typography>
      <BadgeScore good={good} bad={bad} />
    </ButtonBase>
  );
}
