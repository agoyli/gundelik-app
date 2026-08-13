import { Box, Button, ButtonBase, InputBase, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  BellIcon, CameraIcon, CheckIcon, ClipIcon, ClockIcon,
  DocIcon, ImageIcon, LockIcon, SendIcon, SparkleIcon,
} from '../components/Icons';
import { AdSlot, BetaPill } from '../components/Paywall';
import {
  CountPill, EmptyState, IconBadge, RowChevron, SectionLabel, Segmented, SheetDrawer, SubPage,
  SurfaceRow,
} from '../components/Ui';
import {
  ARTICLES, ARTICLE_CATS, CHATS, NOTIFS, NOTIF_META, TEACHERS, catMeta, lastMsg, msgPreview,
} from '../data/inbox';
import type { Article, ArticleCat, Chat, ChatFile, ChatMsg, Notif, Teacher } from '../data/inbox';
import { fmtDate, fmtWhen, fmtWhenShort, TODAY } from '../lib/date';
import { tierFor, useCan, usePrefs } from '../state/prefs';
import { AiChatScreen } from './AiChatScreen';
import { aiLastLine } from '../state/aiChats';
import { tokens } from '../theme';

/*
 * Habarlar — the three streams that arrive from outside the student.
 *
 * Bildiriş is announcements from the school office and nothing else, so the
 * page never repeats a grade or a badge the diary has already shown. Söhbet is
 * real conversation — teachers, the class, the parents' group — and Makala is
 * whatever the admin CMS has published.
 */

type Toast = (m: string) => void;
type Tab = 'notifs' | 'chats' | 'articles';

/* ---------------- announcements ---------------- */

const FILE_KIND: Record<string, { tint: string; ink: string; icon: (p: { size?: number }) => ReactElement }> = {
  pdf: { tint: tokens.redTint, ink: tokens.redText, icon: DocIcon },
  img: { tint: tokens.purpleTint, ink: tokens.purpleText, icon: ImageIcon },
  doc: { tint: tokens.blueTint, ink: tokens.blueText, icon: DocIcon },
};

/*
 * An announcement, read the way an announcement is read: who sent it first.
 *
 * The row used to lead with a 44px coloured icon per category, then with a
 * tinted category pill. Both were a label on a list where every item is the
 * same kind of thing — an announcement — and neither told the reader what the
 * one in front of them says. What is needed before the headline is the sender:
 * "Okuw bölümi" and "Mekdep müdirligi" are different authorities and change
 * how urgently the rest is read.
 *
 * The list is a list: two lines of body, clipped, and the count of files if
 * there are any. An announcement can run to three paragraphs and a timetable,
 * and a list that shows all of it is not a list — it is the page. The rest is
 * behind the row, on its own page.
 */
function NotifList({ items, onOpen }: { items: Notif[]; onOpen: (n: Notif) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, Notif[]>();
    items.forEach((n) => {
      const day = n.at.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), n]);
    });
    return [...map.entries()];
  }, [items]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BellIcon size={26} />}
        title="Bildiriş ýok"
        note="Mekdep müdirligi bildiriş çap edende şu ýerde görünýär."
      />
    );
  }

  return (
    <>
      {groups.map(([day, list]) => (
        <Box key={day}>
          <SectionLabel>{fmtDate(day)}</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map((n) => (
              <ButtonBase
                key={n.id}
                onClick={() => onOpen(n)}
                aria-label={`${n.from}: ${n.title}${n.files?.length ? `, ${n.files.length} faýl` : ''}${n.unread ? ', okalmadyk' : ''}`}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                  width: '100%', textAlign: 'left',
                  bgcolor: n.unread ? tokens.blueTint : tokens.surface,
                  borderRadius: `${tokens.rCard}px`, p: '13px 15px 14px',
                  transition: 'background .2s ease',
                  '&:active': { filter: 'brightness(.97)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <Typography noWrap sx={{
                    flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: tokens.ink2,
                  }}>{n.from}</Typography>
                  <Typography sx={{ fontSize: 12, color: tokens.inkMuted, flex: 'none' }}>
                    {n.at.slice(11, 16)}
                  </Typography>
                </Box>

                <Typography sx={{
                  fontSize: 15, fontWeight: n.unread ? 700 : 600, lineHeight: 1.3, mt: '6px',
                }}>{n.title}</Typography>

                {/* two lines, then the rest is on the page behind the row */}
                <Typography sx={{
                  fontSize: 13, color: tokens.ink3, mt: '4px', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{n.body}</Typography>

                {!!n.files?.length && (
                  <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, mt: '7px', fontWeight: 600 }}>
                    {`${n.files.length} faýl`}
                  </Typography>
                )}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
}

/* The announcement itself: everything the row had to cut. Full text, the date
   written out, and the files named — the row promised "3 faýl" and this is
   where they are. The title is in the body rather than the header because an
   announcement's title is a sentence and a header is one line. */
function NotifDetail({ notif, onBack, toast }: {
  notif: Notif; onBack: () => void; toast: Toast;
}) {
  return (
    <SubPage title="Bildiriş" onBack={onBack}>
      <Box sx={{ pt: '16px' }}>
        <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted }}>
          {`${NOTIF_META[notif.kind].label} · ${fmtDate(notif.at.slice(0, 10))}, ${notif.at.slice(11, 16)}`}
        </Typography>
        <Typography variant="h2" component="h2" sx={{ fontSize: 22, lineHeight: 1.25, mt: '6px' }}>
          {notif.title}
        </Typography>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.ink2, mt: '8px' }}>
          {notif.from}
        </Typography>
      </Box>

      <Box sx={{
        mt: '16px', bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: tokens.padCard,
      }}>
        <Typography sx={{
          fontSize: 15, color: tokens.ink2, lineHeight: 1.65, whiteSpace: 'pre-line',
        }}>{notif.body}</Typography>
      </Box>

      {!!notif.files?.length && (
        <>
          <SectionLabel>{`Faýllar · ${notif.files.length}`}</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notif.files.map((f) => {
              const c = FILE_KIND[f.kind] ?? FILE_KIND.doc;
              const Glyph = c.icon;
              return (
                <SurfaceRow
                  key={f.name}
                  icon={<IconBadge bg={c.tint} color={c.ink} size={44}><Glyph size={20} /></IconBadge>}
                  label={f.name}
                  labelSx={{ fontSize: 15, fontWeight: 600 }}
                  sub={f.size}
                  onClick={() => toast(`${f.name} ýüklenýär…`)}
                />
              );
            })}
          </Box>
        </>
      )}
    </SubPage>
  );
}

/* ---------------- chat thread ---------------- */

/* One entry per file kind: colour and glyph together, so a bubble and the
   attach sheet can never label the same kind two different ways. */

/* A file is a card, never a bubble of text: it has to show what it is and how
   big before anyone decides to open it. */
function FileBubble({ msg, mine, toast }: { msg: ChatMsg; mine: boolean; toast: Toast }) {
  const f = msg.file!;
  const c = FILE_KIND[f.kind] ?? FILE_KIND.doc;
  const Glyph = c.icon;
  return (
    <ButtonBase
      onClick={() => toast(`${f.name} ýüklenýär…`)}
      aria-label={`${f.name}, ${f.size}`}
      sx={{
        display: 'flex', alignItems: 'center', gap: '11px', width: '100%', textAlign: 'left',
        bgcolor: mine ? 'rgba(255,255,255,.16)' : '#fff', p: '9px 11px',
        borderRadius: `${tokens.rTile}px`,
      }}
    >
      <Box aria-hidden sx={{
        width: 36, height: 36, borderRadius: `${tokens.rCell}px`, flex: 'none',
        bgcolor: mine ? 'rgba(255,255,255,.22)' : c.tint,
        color: mine ? '#fff' : c.ink, display: 'grid', placeItems: 'center',
      }}><Glyph size={18} /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: mine ? '#fff' : tokens.ink }} noWrap>
          {f.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: mine ? 'rgba(255,255,255,.8)' : tokens.ink3 }}>
          {f.kind.toUpperCase()} · {f.size}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function ChatThread({ chat, onBack, toast }: { chat: Chat; onBack: () => void; toast: Toast }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(chat.thread);
  const [draft, setDraft] = useState('');
  const [attach, setAttach] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const group = chat.kind === 'synp' || chat.kind === 'ene-ata';

  /*
   * Scroll the page itself to its true bottom rather than the last bubble into
   * view. `scrollIntoView({block:'end'})` lines the anchor up with the bottom
   * of the scroll container — which is precisely where the sticky composer
   * sits, so the newest message ended up hidden behind the input bar it was
   * just typed into. The composer is the last thing in the column, so
   * scrollTop = scrollHeight is the only position that puts it flush and the
   * newest message right above it.
   */
  const scrollToEnd = (behavior: ScrollBehavior = 'auto') => {
    let el = endRef.current?.parentElement as HTMLElement | null | undefined;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 4) {
        el.scrollTo({ top: el.scrollHeight, behavior });
        return;
      }
      el = el.parentElement;
    }
  };

  /* land at the newest message, the way every messenger does */
  useEffect(() => { scrollToEnd(); }, []);

  /* Stamped against the app's anchor, not the wall clock: the mock lives in
     February 2026, and a real `new Date()` would make every message the user
     sends read as a date two streams apart from the one above it. */
  const now = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

  const push = (m: Omit<ChatMsg, 'id' | 'at' | 'from'>) => {
    setMsgs((prev) => [...prev, { id: `me-${prev.length}`, from: 'me', at: now(), ...m }]);
    setTimeout(() => scrollToEnd('smooth'), 60);
  };

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    push({ text: t });
    setDraft('');
  };

  const sendFile = (kind: ChatFile['kind'], name: string) => {
    setAttach(false);
    push({ file: { name, size: '1.2 MB', kind } });
    toast('Faýl ugradyldy');
  };

  return (
    <SubPage title={chat.name} onBack={onBack}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '11px', mt: '12px',
        bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
      }}>
        <Box aria-hidden sx={{
          width: 44, height: 44, borderRadius: '50%', flex: 'none', position: 'relative',
          bgcolor: chat.tint, color: chat.ink, display: 'grid', placeItems: 'center',
          fontSize: 15, fontWeight: 700,
        }}>
          {chat.initials}
          {chat.online && (
            <Box sx={{
              position: 'absolute', right: -1, bottom: -1, width: 12, height: 12, borderRadius: '50%',
              bgcolor: tokens.green, border: '2px solid #fff',
            }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>{chat.name}</Typography>
          <Typography sx={{ fontSize: 12.5, color: chat.online ? tokens.greenText : tokens.ink3, mt: '1px' }} noWrap>
            {chat.online ? 'Onlaýn' : chat.role}
          </Typography>
        </Box>
      </Box>

      {/* The thread claims the rest of the viewport so the composer sits at the
          bottom of the screen even when the conversation is three messages long
          — a sticky bar with nothing under it floats in the middle otherwise. */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', gap: '8px', pt: '16px',
        minHeight: 'calc(100dvh - 340px)',
      }}>
        {msgs.map((m, i) => {
          const mine = m.from === 'me';
          /* in a group, the name is only needed when the speaker changes */
          const showAuthor = group && !mine && m.author && m.author !== msgs[i - 1]?.author;
          return (
            <Box key={m.id} sx={{
              maxWidth: '84%', minWidth: m.file ? 210 : 0,
              alignSelf: mine ? 'flex-end' : 'flex-start',
              p: m.file ? '8px' : '9px 13px 7px',
              bgcolor: mine ? tokens.blueSolid : tokens.surface,
              color: mine ? '#fff' : tokens.ink,
              borderRadius: mine
                ? `${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px ${tokens.rRow}px`
                : `${tokens.rRow}px ${tokens.rRow}px ${tokens.rRow}px ${tokens.rChip}px`,
            }}>
              {showAuthor && (
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: chat.ink, px: m.file ? '4px' : 0, mb: '3px' }}>
                  {m.author}
                </Typography>
              )}
              {m.file && <FileBubble msg={m} mine={mine} toast={toast} />}
              {m.text && (
                <Typography component="span" sx={{ fontSize: 14, lineHeight: 1.5, display: 'block' }}>
                  {m.text}
                </Typography>
              )}
              {/* the clock trails the text instead of claiming a line of its own */}
              <Typography sx={{
                fontSize: 11, textAlign: 'right', mt: '2px', px: m.file ? '4px' : 0,
                color: mine ? 'rgba(255,255,255,.75)' : tokens.inkMuted,
              }}>{fmtWhen(m.at)}</Typography>
            </Box>
          );
        })}
        <Box ref={endRef} />
      </Box>

      <Box sx={{
        position: 'sticky', bottom: 0, mx: `-${tokens.gutter}`, px: tokens.gutter,
        pt: '10px', pb: 'calc(10px + env(safe-area-inset-bottom))',
        bgcolor: tokens.blurBg, backdropFilter: tokens.blur, mt: '14px',
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '6px', minHeight: 46,
          bgcolor: tokens.surface, borderRadius: `${tokens.rPill}px`, pl: '6px', pr: '6px',
        }}>
          <ButtonBase
            onClick={() => setAttach(true)}
            aria-label="Faýl goş"
            sx={{
              width: 34, height: 34, borderRadius: '50%', flex: 'none',
              color: tokens.ink2, '&:active': { bgcolor: tokens.surfacePress },
            }}
          >
            <ClipIcon size={17} />
          </ButtonBase>
          <InputBase
            placeholder="Habar ýazyň…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            multiline
            maxRows={4}
            sx={{ flex: 1, fontSize: 14, py: '6px' }}
            inputProps={{ 'aria-label': 'Habar' }}
          />
          <ButtonBase onClick={send} disabled={!draft.trim()} aria-label="Ugrat"
            sx={{
              width: 34, height: 34, borderRadius: '50%', flex: 'none', alignSelf: 'flex-end', mb: '6px',
              bgcolor: draft.trim() ? tokens.blue : tokens.inkDisabled, color: '#fff',
              transition: 'background .15s ease',
            }}>
            <SendIcon size={15} />
          </ButtonBase>
        </Box>
      </Box>

      <SheetDrawer open={attach} onClose={() => setAttach(false)}>
        <Typography variant="h2">Faýl goş</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '14px' }}>
          {([
            { kind: 'img', icon: ImageIcon, label: 'Surat ýa-da wideo', note: 'Galereýadan saýla', file: 'Surat.jpg' },
            { kind: 'doc', icon: DocIcon, label: 'Resminama', note: 'PDF, Word, tablisa', file: 'Resminama.pdf' },
            { kind: 'pdf', icon: CameraIcon, label: 'Skaner', note: 'Depderi surata düşür', file: 'Depder-skan.pdf' },
          ] as const).map(({ kind, icon: Glyph, label, note, file }) => (
            <ButtonBase
              key={kind}
              onClick={() => sendFile(kind, file)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
                bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '12px 14px',
                '&:active': { bgcolor: tokens.surfacePress },
              }}
            >
              <IconBadge bg={FILE_KIND[kind].tint} color={FILE_KIND[kind].ink} size={40} radius={12}>
                <Glyph size={19} />
              </IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '1px' }}>{note}</Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}

/* ---------------- article page ---------------- */

function ArticlePage({ article, onBack, toast }: { article: Article; onBack: () => void; toast: Toast }) {
  const { beta } = usePrefs();
  const meta = catMeta(article.cat);
  return (
    <SubPage title={meta.label} onBack={onBack}>
      {/* No cover art: the CMS supplies text, and an app-invented illustration
          would be the app editorialising someone else's article. */}
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px', lineHeight: 1.25, mt: '16px' }}>
        {article.title}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.ink3, mt: '8px' }}>
        {article.author} · {fmtDate(article.date)} · {article.minutes} min okamak
      </Typography>

      {/* beta: the experimental summary, marked as such */}
      {beta && article.takeaways && (
        <Box sx={{
          mt: '16px', bgcolor: tokens.purpleTint, borderRadius: `${tokens.rCard}px`, p: '15px',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '10px' }}>
            <Box aria-hidden sx={{ color: tokens.purpleText, display: 'flex' }}><SparkleIcon size={18} /></Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.purpleText, flex: 1 }}>
              AI gysgaça mazmun
            </Typography>
            <BetaPill />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {article.takeaways.map((t) => (
              <Box key={t} sx={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                <Box aria-hidden sx={{ color: tokens.purpleText, display: 'flex', mt: '2px' }}>
                  <CheckIcon size={15} />
                </Box>
                <Typography sx={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.45 }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '18px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: tokens.ink2, lineHeight: 1.5 }}>
          {article.lede}
        </Typography>
        {article.body.map((p) => (
          <Typography key={p.slice(0, 24)} sx={{ fontSize: 15, color: tokens.ink, lineHeight: 1.65 }}>
            {p}
          </Typography>
        ))}
      </Box>

      <Box sx={{ pt: '20px', pb: '12px' }}>
        <Button
          fullWidth disableElevation onClick={() => toast('Makala paýlaşyldy')}
          sx={{ bgcolor: tokens.surface, color: tokens.ink }}
        >
          Makalany paýlaş
        </Button>
      </Box>
    </SubPage>
  );
}

/* ---------------- the hub ---------------- */

export function InboxScreen({ onBack, toast, onUpgrade }: {
  onBack: () => void; toast: Toast; onUpgrade: () => void;
}) {
  const [tab, setTab] = useState<Tab>('notifs');
  const [read, setRead] = useState<string[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [cat, setCat] = useState<ArticleCat | 'all'>('all');
  const [pick, setPick] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);
  const [ai, setAi] = useState(false);
  const canAi = useCan('ai');
  const aiPlan = tierFor('ai');

  const notifs = useMemo(
    () => NOTIFS.map((n) => (read.includes(n.id) ? { ...n, unread: false } : n)),
    [read],
  );
  const unread = notifs.filter((n) => n.unread).length;
  const chatUnread = CHATS.reduce((s, c) => s + c.unread, 0);
  const shown = cat === 'all' ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);

  /* Picking a teacher opens the existing thread, or starts an empty one — a
     conversation that has not happened yet still needs somewhere to begin. */
  const openTeacher = (t: Teacher) => {
    setPick(false);
    const existing = CHATS.find((c) => c.id === t.chatId);
    setChat(existing ?? {
      id: `new-${t.id}`, name: t.name, role: `${t.subject} mugallymy`, initials: t.initials,
      kind: 'mugallym', tint: tokens.blueTint, ink: tokens.blueText, unread: 0, thread: [],
    });
  };

  if (ai) return <AiChatScreen onBack={() => setAi(false)} onUpgrade={onUpgrade} />;
  if (chat) return <ChatThread chat={chat} onBack={() => setChat(null)} toast={toast} />;
  if (article) return <ArticlePage article={article} onBack={() => setArticle(null)} toast={toast} />;

  if (notif) return <NotifDetail notif={notif} onBack={() => setNotif(null)} toast={toast} />;

  return (
    <SubPage
      title="Habarlar"
      onBack={onBack}
      action={unread > 0 && tab === 'notifs' ? (
        <ButtonBase
          onClick={() => setRead(NOTIFS.map((n) => n.id))}
          sx={{
            height: 34, px: '12px', borderRadius: `${tokens.rPill}px`, bgcolor: '#fff',
            color: tokens.blueText, fontSize: 12.5, fontWeight: 700, boxShadow: tokens.shadowCtl,
          }}
        >
          Ählisini okaldy
        </ButtonBase>
      ) : undefined}
    >
      <Box sx={{ pt: '14px' }}>
        <Segmented
          label="Bölüm"
          value={tab}
          onChange={setTab}
          options={[
            { id: 'notifs', label: unread ? `Bildiriş · ${unread}` : 'Bildiriş' },
            { id: 'chats', label: chatUnread ? `Söhbet · ${chatUnread}` : 'Söhbet' },
            { id: 'articles', label: 'Makala' },
          ]}
        />
      </Box>

      {tab === 'notifs' && (
        <NotifList
          items={notifs}
          onOpen={(n) => {
            setRead((r) => (r.includes(n.id) ? r : [...r, n.id]));
            setNotif(n);
          }}
        />
      )}

      {tab === 'chats' && (
        <>
          <Box sx={{ pt: '14px' }}>
            <Button
              fullWidth disableElevation onClick={() => setPick(true)}
              startIcon={<SendIcon size={15} />}
              sx={{ bgcolor: tokens.blueTint, color: tokens.blueText }}
            >
              Mugallyma ýaz
            </Button>
          </Box>

          {/* Akylly mugallym is a chat, so it is in the chat list — not behind
              a button on a lesson page the student would have to find first.
              It is pinned above the teachers and tinted, because it is the one
              correspondent that is always there and never has an unread. */}
          <Box sx={{ pt: '14px' }}>
            <ButtonBase
              onClick={() => setAi(true)}
              aria-label="Akylly mugallym 24/7"
              sx={{
                display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
                bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
                '&:active': { filter: 'brightness(.97)' },
              }}
            >
              <Box aria-hidden sx={{
                width: 46, height: 46, borderRadius: '50%', flex: 'none',
                bgcolor: '#fff', color: tokens.blue, display: 'grid', placeItems: 'center',
              }}><SparkleIcon size={24} /></Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, flex: 1 }} noWrap>
                    Akylly mugallym
                  </Typography>
                  {!canAi && (
                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 'none',
                      px: '8px', height: 21, borderRadius: `${tokens.rPill}px`,
                      bgcolor: '#fff', color: tokens.blueText, fontSize: 11, fontWeight: 700,
                    }}><LockIcon size={11} />{aiPlan?.name}</Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: 13, color: tokens.ink2, mt: '3px' }} noWrap>
                  {canAi ? aiLastLine() : 'Islendik sapak boýunça sorag ber'}
                </Typography>
              </Box>
              <RowChevron />
            </ButtonBase>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '14px' }}>
            {CHATS.map((c) => {
              const last = lastMsg(c);
              return (
                <ButtonBase
                  key={c.id}
                  onClick={() => setChat(c)}
                  aria-label={`${c.name}${c.unread ? `, ${c.unread} okalmadyk` : ''}`}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '13px', width: '100%', textAlign: 'left',
                    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
                    '&:active': { bgcolor: tokens.surfacePress },
                  }}
                >
                  <Box aria-hidden sx={{
                    width: 46, height: 46, borderRadius: '50%', flex: 'none', position: 'relative',
                    bgcolor: c.tint, color: c.ink, display: 'grid', placeItems: 'center',
                    fontSize: 15, fontWeight: 700,
                  }}>
                    {c.initials}
                    {c.online && (
                      <Box sx={{
                        position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: '50%',
                        bgcolor: tokens.green, border: '2px solid #fff',
                      }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography sx={{ fontSize: 15, fontWeight: c.unread ? 700 : 600, flex: 1 }} noWrap>
                        {c.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: tokens.inkMuted, flex: 'none' }}>
                        {last ? fmtWhenShort(last.at) : ''}
                      </Typography>
                    </Box>
                    <Typography sx={{
                      fontSize: 13, mt: '3px',
                      color: c.unread ? tokens.ink2 : tokens.ink3,
                      fontWeight: c.unread ? 600 : 400,
                    }} noWrap>
                      {last ? msgPreview(last) : 'Habar ýok'}
                    </Typography>
                  </Box>
                  {/* the shared pill, so an unread chat is the same red as an
                      unread lesson note and the bell badge above it */}
                  {c.unread > 0 && (
                    <Box sx={{ flex: 'none' }}><CountPill n={c.unread} /></Box>
                  )}
                </ButtonBase>
              );
            })}
          </Box>
        </>
      )}

      {tab === 'articles' && (
        <>
          {/* category filter — same 32px chip spec as the roadmap */}
          <Box sx={{
            display: 'flex', gap: '8px', overflowX: 'auto', mx: `-${tokens.gutter}`, px: tokens.gutter, pt: '14px',
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            maskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 26px), transparent)',
          }}>
            {ARTICLE_CATS.map((c) => {
              const on = c.id === cat;
              return (
                <ButtonBase
                  key={c.id} onClick={() => setCat(c.id)} aria-pressed={on}
                  sx={{
                    height: 32, px: '14px', borderRadius: `${tokens.rPill}px`, flex: 'none',
                    fontSize: 13.5, fontWeight: 600,
                    bgcolor: on ? tokens.blueSolid : tokens.surface,
                    color: on ? '#fff' : tokens.ink2,
                    transition: 'background .15s ease,color .15s ease',
                  }}
                >{c.label}</ButtonBase>
              );
            })}
          </Box>

          {/* Every article is one row of the same shape. No featured slot and no
              cover mark: the app does not get to promote one piece of the
              admins' content over another, or draw art for it. */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '14px' }}>
            {shown.map((a) => {
              const m = catMeta(a.cat);
              return (
                <ButtonBase
                  key={a.id}
                  onClick={() => setArticle(a)}
                  aria-label={a.title}
                  sx={{
                    display: 'block', width: '100%', textAlign: 'left',
                    bgcolor: tokens.surface, borderRadius: `${tokens.rCard}px`, p: '14px 15px',
                    '&:active': { bgcolor: tokens.surfacePress },
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: m.ink }}>
                    {m.label.toUpperCase()}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mt: '4px', lineHeight: 1.3 }}>
                    {a.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.ink3, mt: '5px', lineHeight: 1.45 }}>
                    {a.lede}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: '8px', color: tokens.inkMuted }}>
                    <ClockIcon size={13} />
                    <Typography sx={{ fontSize: 12 }}>{a.minutes} min · {fmtDate(a.date)}</Typography>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>

          <Box sx={{ pt: '16px' }}>
            <AdSlot onUpgrade={onUpgrade} variant="slim" />
          </Box>
        </>
      )}

      {/* who can I write to */}
      <SheetDrawer open={pick} onClose={() => setPick(false)}>
        <Typography variant="h2">Mugallyma ýaz</Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.ink3, mt: '6px' }}>
          8 «B» synpynyň mugallymlary
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '14px' }}>
          {TEACHERS.map((t) => (
            <ButtonBase
              key={t.id}
              onClick={() => openTeacher(t)}
              aria-label={`${t.name}, ${t.subject}`}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left',
                bgcolor: tokens.surface, borderRadius: `${tokens.rRow}px`, p: '10px 13px',
                '&:active': { bgcolor: tokens.surfacePress },
              }}
            >
              <Box aria-hidden sx={{
                width: 38, height: 38, borderRadius: '50%', flex: 'none',
                bgcolor: tokens.blueTint, color: tokens.blueText, display: 'grid', placeItems: 'center',
                fontSize: 13.5, fontWeight: 700,
              }}>{t.initials}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>{t.name}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{t.subject}</Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </SheetDrawer>
    </SubPage>
  );
}
