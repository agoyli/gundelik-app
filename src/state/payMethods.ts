import { useSyncExternalStore } from 'react';
import { tokens } from '../theme';

/*
 * How the account pays — and it is not only a bank card.
 *
 * The app used to model payment as "kartlarym": a list of bank cards, with the
 * pay sheet printing "Halkbank · 4821" as a hardcoded string beside it. Two
 * problems, one of them a product problem. The small one is that the sheet and
 * the list could disagree, so the store is shared and both read it.
 *
 * The real one is that a card is not how every family here pays. A parent may
 * hold a gift card bought at a kiosk, or may prefer to transfer from their
 * phone. Neither of those is a *stored* method — there is nothing to keep
 * between payments — so they are offered at the moment of paying instead, and
 * this store holds only what it makes sense to save: cards.
 */

/* A saved method is a card. Paying by phone transfer or with a gift card is
   something you do *at the till*, not something the account stores: there is no
   phone number or code to keep between payments — you pick it when you pay.
   Both live in the pay sheet. */
export type MethodType = 'card';

export type BankId = 'halk' | 'senagat' | 'rysgal';

/* The three issuers a Turkmen school family actually holds. Only the bank is
   named: each of them issues several different cards, so printing one product
   name beside the bank would be wrong for most of the cards people hold. The
   card the reader is adding identifies itself by its last four digits. */
export const BANKS: { id: BankId; name: string; tint: string; ink: string }[] = [
  { id: 'halk', name: 'Halk bank', tint: tokens.greenTint, ink: tokens.greenText },
  { id: 'senagat', name: 'Senagatbank', tint: tokens.blueTint, ink: tokens.blueText },
  { id: 'rysgal', name: 'Rysgalbank', tint: tokens.orangeTint, ink: tokens.orangeText },
];

export const bankOf = (id?: BankId) => BANKS.find((b) => b.id === id) ?? BANKS[0];

export type PayMethod = {
  id: string;
  type: MethodType;
  main: boolean;
  bank: BankId;
  last4: string;
  exp: string;
};

let methods: PayMethod[] = [
  { id: 'm1', type: 'card', main: true, bank: 'halk', last4: '4821', exp: '09/28' },
  { id: 'm2', type: 'card', main: false, bank: 'senagat', last4: '1096', exp: '02/27' },
];

/* Where a phone transfer actually goes. These are the app's own numbers, one
   per operator, and the reader transfers to them from their own phone — so the
   screen's job is to show the number, not to collect one. */
export const PAY_NUMBERS = [
  { id: 'tmcell', operator: 'TM CELL', number: '+993 65 80 12 12' },
  { id: 'ashtu', operator: 'Aşgabat şäher telefon ulgamy', number: '+993 12 46 80 12' },
];

let listeners: (() => void)[] = [];
const emit = () => { methods = [...methods]; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
};

export const usePayMethods = () => useSyncExternalStore(subscribe, () => methods);

export const addPayMethod = (m: Omit<PayMethod, 'id'>) => {
  const id = `m${Date.now()}`;
  methods = [...(m.main ? methods.map((x) => ({ ...x, main: false })) : methods), { ...m, id }];
  emit();
};

export const removePayMethod = (id: string) => {
  const gone = methods.find((x) => x.id === id);
  methods = methods.filter((x) => x.id !== id);
  /* something always has to be the main method, or the next payment has none */
  if (gone?.main && methods.length > 0) methods = methods.map((x, i) => ({ ...x, main: i === 0 }));
  emit();
};

export const setMainPayMethod = (id: string) => {
  methods = methods.map((x) => ({ ...x, main: x.id === id }));
  emit();
};

export const mainPayMethod = () => methods.find((m) => m.main) ?? methods[0];

/* One name for a method, everywhere it is printed: the list, the pay sheet and
   the receipt cannot describe the same card three ways. */
export const methodLabel = (m: PayMethod) => bankOf(m.bank).name;

export const methodNote = (m: PayMethod) => `•••• ${m.last4} · ${m.exp}`;

export const methodTone = (m: PayMethod) => ({ tint: bankOf(m.bank).tint, ink: bankOf(m.bank).ink });
