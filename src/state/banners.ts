/*
 * The campaigns this account has booked.
 *
 * A booking is a purchase, so it goes through the wallet the shop goes
 * through — same balance, same history line — rather than inventing a second
 * kind of money for advertisers. If the balance does not cover it, nothing is
 * written: a campaign that exists without being paid for would be a slot the
 * app has promised twice.
 *
 * Bookings made here join `BOOKED` for availability, so the day you buy stops
 * being offered to you a minute later on the same form.
 */

import { useSyncExternalStore } from 'react';
import { BOOKED, bannerPrice } from '../data/banners';
import type { BannerArtId, PlacementId } from '../data/banners';
import { addDays } from '../lib/date';
import { TODAY } from '../lib/date';
import { spend } from './wallet';

export type MyBanner = {
  id: string;
  title: string;
  note: string;
  art: BannerArtId;
  tint: string;
  ink: string;
  placement: PlacementId;
  school: string;
  from: string;
  to: string;
  days: number;
  price: number;
};

let mine: MyBanner[] = [];
const listeners = new Set<() => void>();
const emit = () => { mine = [...mine]; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const myBanners = () => mine;

export type BannerStatus = 'planned' | 'live' | 'done';

/** Where a campaign is in its life, from the app's own today. */
export const statusOf = (b: MyBanner): BannerStatus =>
  b.from > TODAY ? 'planned' : b.to < TODAY ? 'done' : 'live';

export const STATUS_LABEL: Record<BannerStatus, string> = {
  planned: 'Garaşylýar',
  live: 'Işleýär',
  done: 'Gutardy',
};

type Draft = Omit<MyBanner, 'id' | 'to' | 'price'>;

/**
 * Book a window. Returns the campaign, or `null` when the balance is short —
 * the caller says which, because the two failures need different words.
 */
export const bookBanner = (d: Draft): MyBanner | null => {
  const price = bannerPrice(d.placement, d.school, d.days);
  if (!spend(price, `Mahabat: ${d.title}`)) return null;
  const banner: MyBanner = {
    ...d,
    id: `mb${Date.now().toString(36)}`,
    to: addDays(d.from, d.days - 1),
    price,
  };
  mine = [banner, ...mine];
  /* the slot is sold now — the same table the availability check reads */
  BOOKED.push({
    placement: d.placement, school: d.school, from: banner.from, to: banner.to, who: 'Siz',
  });
  emit();
  return banner;
};

export const useMyBanners = () => useSyncExternalStore(subscribe, myBanners, myBanners);
