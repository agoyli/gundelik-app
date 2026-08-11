import { useSyncExternalStore } from 'react';
import { TODAY } from '../lib/date';

/*
 * Conversations with Akylly mugallym.
 *
 * The AI used to live only in a bottom sheet on a lesson page: you asked, you
 * closed it, and the answer was gone. That is fine for a one-line question and
 * wrong for the thing the top tier is sold on — a student who worked out a
 * quadratic with it on Tuesday should be able to find that on Thursday.
 *
 * So a conversation is a record, and the store holds all of them. It is the
 * same `useSyncExternalStore` module store the rest of the app uses for state
 * that outlives a screen: the chat page is mounted and unmounted every time it
 * is opened, and a `useState` thread would be lost each time.
 *
 * The title is derived from the first thing the student asked rather than
 * typed by them. Nobody names a conversation, and "Täze söhbet · 3" is not a
 * history — the question *is* the label.
 */

export type AiMsg = { role: 'user' | 'ai'; text: string; at: string };

export type AiChat = {
  id: string;
  /** derived from the first user message; `null` until there is one */
  title: string | null;
  at: string;
  msgs: AiMsg[];
};

/* Seeded so the history has something in it — an empty list teaches nothing
   about what the feature is for. Dates are anchored to the app's TODAY. */
let chats: AiChat[] = [
  {
    id: 'a1',
    title: 'Diskriminant näme üçin gerek?',
    at: `${TODAY}T09:12`,
    msgs: [
      { role: 'user', text: 'Diskriminant näme üçin gerek?', at: `${TODAY}T09:12` },
      {
        role: 'ai',
        at: `${TODAY}T09:12`,
        text: 'Diskriminant kwadrat deňlemäniň näçe kökü bardygyny köki tapmazdan öň aýdýar. D > 0 bolsa iki kök, D = 0 bolsa bir kök, D < 0 bolsa hakyky kök ýok.',
      },
    ],
  },
  {
    id: 'a2',
    title: 'Om kanunyny düşündir',
    at: '2026-02-11T20:40',
    msgs: [
      { role: 'user', text: 'Om kanunyny düşündir', at: '2026-02-11T20:40' },
      {
        role: 'ai',
        at: '2026-02-11T20:41',
        text: 'Zynjyryň bölegindäki tok güýji naprýaženiýä göni, garşylyga ters proporsionaldyr: I = U / R. Ýagny naprýaženiýe iki esse artsa tok hem iki esse artýar.',
      },
    ],
  },
  {
    id: 'a3',
    title: 'Present Perfect bilen Past Simple tapawudy',
    at: '2026-02-09T18:05',
    msgs: [
      { role: 'user', text: 'Present Perfect bilen Past Simple tapawudy näme?', at: '2026-02-09T18:05' },
      {
        role: 'ai',
        at: '2026-02-09T18:06',
        text: 'Past Simple gutaran wagty görkezýär — “I saw him yesterday”. Present Perfect bolsa netijesi häzir wajyp bolan hereket — “I have seen this film”, haçandygy däl-de, gördüm diýen fakt möhüm.',
      },
    ],
  },
];

let listeners: (() => void)[] = [];
const emit = () => { chats = [...chats]; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
};

export const useAiChats = () => useSyncExternalStore(subscribe, () => chats);

export const getAiChat = (id: string) => chats.find((c) => c.id === id);

export const newAiChat = (): string => {
  const id = `a${Date.now()}`;
  chats = [{ id, title: null, at: `${TODAY}T${new Date().toTimeString().slice(0, 5)}`, msgs: [] }, ...chats];
  emit();
  return id;
};

/* A first question names the conversation. Trimmed at a word boundary so the
   history reads as a list of questions and not of truncated fragments. */
const titleFrom = (text: string) => {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= 42) return t;
  const cut = t.slice(0, 42);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 20 ? cut.lastIndexOf(' ') : 42)}…`;
};

export const addAiMsg = (id: string, msg: AiMsg) => {
  chats = chats.map((c) => (c.id === id
    ? {
      ...c,
      at: msg.at,
      title: c.title ?? (msg.role === 'user' ? titleFrom(msg.text) : null),
      msgs: [...c.msgs, msg],
    }
    : c));
  emit();
};

export const removeAiChat = (id: string) => {
  chats = chats.filter((c) => c.id !== id);
  emit();
};

/* The conversation a screen should land on: the newest one, or a fresh one if
   the history is empty. Also the answer to "what now?" after a delete. */
export const currentAiChatId = (): string => chats[0]?.id ?? newAiChat();

/* What the entry row shows: the newest conversation's last line. */
export const aiLastLine = () => {
  const c = chats[0];
  const m = c?.msgs[c.msgs.length - 1];
  return m ? m.text : 'Islendik sapak boýunça sorag ber';
};
