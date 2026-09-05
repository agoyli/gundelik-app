import type { PrizeArtId } from './guides';

/*
 * The shop.
 *
 * The app already knows how to hand a pupil something real: the prize contests
 * hand out a laptop or a set of books put up by a named sponsor. This is the
 * everyday version of that — the same partners, the same objects, bought with
 * the balance on the account rather than won.
 *
 * Two things keep it honest. The partner is **named on every item**, because a
 * school app that sells things without saying whose shop they come from is
 * asking for a trust it has not earned; and the price is in TMT, the same unit
 * the subscription is in, so a family can see exactly what a term of Zehinli
 * costs against a set of exercise books.
 *
 * The drawings are the contest's own (`PrizeArt`): the app has no image
 * pipeline, and a flat line drawing in the app's stroke weight is the honest
 * stand-in for a product photo nobody has shot yet.
 */

export type Store = { id: string; name: string; note: string };

export const STORES: Store[] = [
  { id: 'gujurly', name: 'Gujurly Bookstore', note: 'Kitaplar we ýazuw esbaplary' },
  { id: 'okuwcy', name: 'Okuwçy', note: 'Mekdep tehnikasy' },
  { id: 'dana', name: 'Dana', note: 'Elektronika' },
];

export const storeOf = (id: string) => STORES.find((s) => s.id === id) ?? STORES[0];

export type Product = {
  id: string;
  name: string;
  note: string;
  price: number;
  store: string;
  art: PrizeArtId;
};

export const PRODUCTS: Product[] = [
  { id: 'p-depder', name: 'Depder toplumy', note: '10 sany, 48 sahypa', price: 35, store: 'gujurly', art: 'books' },
  { id: 'p-kitap', name: 'Okuw kitaplary', note: '8-nji synp — 4 kitap', price: 120, store: 'gujurly', art: 'books' },
  { id: 'p-ereader', name: 'Elektron okaýjy', note: '6 dýuým, kagyz ekran', price: 780, store: 'gujurly', art: 'ereader' },
  { id: 'p-nausnik', name: 'Nauşnik', note: 'Simsiz, zarýad gutusy bilen', price: 260, store: 'okuwcy', art: 'earbuds' },
  { id: 'p-sagat', name: 'Akylly sagat', note: 'Jaň, ädim, ýatlatma', price: 640, store: 'okuwcy', art: 'watch' },
  { id: 'p-planset', name: 'Planşet', note: '10 dýuým, 64 GB', price: 1450, store: 'dana', art: 'tablet' },
  { id: 'p-noutbuk', name: 'Noutbuk', note: '14 dýuým, okuw üçin', price: 4200, store: 'dana', art: 'laptop' },
];

export const productOf = (id: string) => PRODUCTS.find((p) => p.id === id);

/** The catalogue, grouped the way it is shopped: by the shop it comes from. */
export const shopGroups = () =>
  STORES.map((s) => ({ store: s, items: PRODUCTS.filter((p) => p.store === s.id) }))
    .filter((g) => g.items.length > 0);

/** The cheapest thing in the catalogue — what an empty balance is measured against. */
export const cheapest = () => Math.min(...PRODUCTS.map((p) => p.price));
