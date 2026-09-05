import { useSyncExternalStore } from 'react';
import { TODAY } from '../lib/date';
import { spend } from './wallet';
import { productOf } from '../data/shop';

/*
 * What has been bought, and what state it is in.
 *
 * An order is not finished when the money leaves: something has to be picked
 * up or delivered, and a shop that forgets an order the moment it is paid for
 * is a shop that cannot answer the only question a buyer asks afterwards —
 * where is it. So orders are kept, with a code the counter can be shown.
 *
 * The money side is the wallet's: `buy` spends and only records an order if
 * the spend actually happened, so there can be no order without a payment.
 */

export type Order = { id: string; code: string; productId: string; price: number; at: string };

let orders: Order[] = [];
let seq = 0;

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
let snapshot: Order[] = orders;
const publish = () => { snapshot = orders; listeners.forEach((fn) => fn()); };

export const useOrders = () => useSyncExternalStore(subscribe, () => snapshot);

/** Six digits, which is what a pickup counter can read back over a phone. */
const codeFor = (n: number) => String(100000 + ((n * 7919) % 899999));

export const buyProduct = (productId: string) => {
  const p = productOf(productId);
  if (!p) return false;
  if (!spend(p.price, `${p.name} — ${p.store}`)) return false;
  seq += 1;
  orders = [{ id: `o${seq}`, code: codeFor(seq + 37), productId, price: p.price, at: TODAY }, ...orders];
  publish();
  return true;
};
