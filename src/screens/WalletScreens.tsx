import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { useState } from 'react';
import {
  BuildingIcon, CheckIcon, CoinIcon, HistoryIcon, ShopIcon, WalletIcon,
} from '../components/Icons';
import { PrizeArt } from '../components/PrizeArt';
import {
  BalanceHero, EmptyState, IconBadge, RowChevron, SectionLabel, SheetDrawer, StatTile, SubPage,
  SurfaceRow,
} from '../components/Ui';
import { useChild } from '../state/children';
import { EARN_POINTS } from '../state/earn';
import { PRODUCTS, cheapest, productOf, shopGroups, storeOf } from '../data/shop';
import type { Product, Store } from '../data/shop';
import { usePointsBalance } from '../state/points';
import { buyProduct, useOrders } from '../state/shop';
import {
  POINTS_PER_TMT, TOP_UPS, convertPoints, pointsRemainder, topUp, useWallet,
} from '../state/wallet';
import { PAY_NUMBERS } from '../state/payMethods';
import { absDate } from '../lib/date';
import { tokens } from '../theme';

type Toast = (m: string) => void;

/* ---------------- Balans ---------------- */

const KIND_LOOK = {
  topup: { sign: '+', color: tokens.greenText, tint: tokens.greenTint },
  convert: { sign: '+', color: tokens.blueText, tint: tokens.blueTint },
  spend: { sign: '−', color: tokens.ink, tint: tokens.surfacePress },
} as const;

/*
 * The balance, and the two ways it grows.
 *
 * A wallet screen that only shows a number is a receipt. This one answers the
 * three questions in order: how much is there, how do I put more in, and what
 * happened to what was there — with the earned `bal` sitting between the first
 * two, because for a pupil that is the top-up they can actually do themselves.
 */
export function WalletScreen({ onBack, toast, onShop, onPoints }: {
  onBack: () => void; toast: Toast; onShop: () => void; onPoints: () => void;
}) {
  const { balance, entries } = useWallet();
  /* every bal the child holds — the same derived number the Testler landing
     states, and the page behind this row owns what can be done with it */
  const pot = usePointsBalance();
  const [topOpen, setTopOpen] = useState(false);

  return (
    <SubPage
      title="Balans"
      onBack={onBack}
      help={`Balans — hasabyňdaky pul. Abuna töleginiň hem, dükandan alnan harydyň hem puly şu ýerden çykýar. Bäsleşiklerde toplanan ballary pula öwrüp bolýar: ${POINTS_PER_TMT} bal = 1 TMT.`}
    >
      <BalanceHero
        tint={tokens.blueTint}
        color={tokens.blueText}
        icon={<WalletIcon size={24} />}
        value={`${balance} TMT`}
        label="Hasabyňdaky pul"
        actions={(
          <>
            <Button
              fullWidth variant="contained" disableElevation onClick={() => setTopOpen(true)}
            >Doldur</Button>
            <Button
              fullWidth disableElevation onClick={onShop}
              sx={{ bgcolor: '#fff', color: tokens.blueText }}
              startIcon={<ShopIcon size={18} />}
            >Dükan</Button>
          </>
        )}
      />

      {/* The account's other pot, one tap away. It used to be converted from
          here, which put two balances and two primary buttons on the money
          page; the bal has its own page now, and this row is the door to it. */}
      <SectionLabel>Toplanan ballar</SectionLabel>
      <SurfaceRow
        icon={(
          <IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={44}>
            <CoinIcon size={22} />
          </IconBadge>
        )}
        label={`${pot.balance} bal`}
        sub={`${POINTS_PER_TMT} bal = 1 TMT · ${pot.worth} TMT bolýar`}
        end={<RowChevron />}
        onClick={onPoints}
      />

      <SectionLabel>Hereketler</SectionLabel>
      {entries.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={26} />} title="Heniz hereket ýok" note="Balansy doldurup başla" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entries.map((e) => {
            const look = KIND_LOOK[e.kind];
            return (
              <SurfaceRow
                key={e.id}
                icon={(
                  <IconBadge bg={look.tint} color={look.color} size={40} radius={tokens.rTile}>
                    {e.kind === 'convert' ? <CoinIcon size={18} />
                      : e.kind === 'topup' ? <WalletIcon size={18} /> : <ShopIcon size={18} />}
                  </IconBadge>
                )}
                label={e.note}
                sub={absDate(e.at)}
                end={(
                  <Typography sx={{
                    fontSize: 15, fontWeight: 700, color: look.color,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{look.sign}{Math.abs(e.amount)} TMT</Typography>
                )}
              />
            );
          })}
        </Box>
      )}

      <SheetDrawer open={topOpen} onClose={() => setTopOpen(false)}>
        <Typography variant="h2">Balansy doldur</Typography>
        <Typography variant="caption">Telefon geçirimi ýa-da sowgat kart</Typography>
        <SectionLabel>Mukdar</SectionLabel>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          {TOP_UPS.map((n) => (
            <ButtonBase
              key={n}
              onClick={() => { topUp(n, 'TM CELL — telefon geçirimi'); setTopOpen(false); toast(`Balans ${n} TMT doldy`); }}
              sx={{
                flex: 1, minHeight: 52, borderRadius: `${tokens.rCard}px`,
                bgcolor: tokens.surface, fontSize: 16, fontWeight: 700,
                '&:active': { bgcolor: tokens.surfacePress },
              }}
            >{n} TMT</ButtonBase>
          ))}
        </Box>
        <SectionLabel>Nirä geçirmeli</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PAY_NUMBERS.map((p) => (
            <SurfaceRow
              key={p.id}
              icon={<IconBadge bg={tokens.blueSoft} color={tokens.blue} size={40} radius={tokens.rTile}>
                <BuildingIcon size={18} />
              </IconBadge>}
              label={p.number}
              sub={p.operator}
            />
          ))}
        </Box>
        <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, lineHeight: 1.5, mt: '12px' }}>
          Geçirimden soň balans 5 minudyň dowamynda dolýar.
        </Typography>
      </SheetDrawer>
    </SubPage>
  );
}

/*
 * The other pot: `bal`.
 *
 * It was a card on the money page, which gave that page two balances, two
 * primary buttons and two answers to "how much have I got". A pot with its own
 * sources, its own arithmetic and its own way out deserves its own page — and
 * the shop opens from here as well as from the money, because a pupil counting
 * their points is the one most likely to be looking for something to spend
 * them on.
 */
export function PointsScreen({ onBack, toast, onShop }: {
  onBack: () => void; toast: Toast; onShop: () => void;
}) {
  const pot = usePointsBalance();
  const { entries } = useWallet();
  const { child } = useChild();
  const short = POINTS_PER_TMT - pointsRemainder(pot.balance);

  const doConvert = () => {
    const tmt = convertPoints(pot.balance);
    toast(tmt > 0
      ? `${tmt * POINTS_PER_TMT} bal → ${tmt} TMT`
      : `Öwürmek üçin azyndan ${POINTS_PER_TMT} bal gerek`);
  };

  /* where the pot came from, in the order it was filled */
  const sources = [
    { id: 'before', label: 'Öňden ýygnalan', sub: 'Çärýekleriň dowamynda', n: pot.before },
    { id: 'hw', label: 'Öý işi', sub: `${pot.hw} tabşyryk · +${EARN_POINTS.hw} bal`, n: pot.hw * EARN_POINTS.hw },
    { id: 'test', label: 'Testler', sub: `${pot.tests} test · +${EARN_POINTS.test} bal`, n: pot.tests * EARN_POINTS.test },
    { id: 'contest', label: 'Bäsleşikler', sub: 'Toplumlaryň jogaplary', n: pot.contests },
  ].filter((r) => r.n > 0);

  const swaps = entries.filter((e) => e.kind === 'convert');

  return (
    <SubPage
      title="Ballar"
      onBack={onBack}
      help={`Bal — okuwyň özi üçin tölenýän hasap. Öý işi, test we bäsleşikler ony dolduryar; ${POINTS_PER_TMT} bal = 1 TMT bolup balansa geçýär, galyndysy hasapda galýar.`}
    >
      <BalanceHero
        tint={tokens.orangeTint}
        color={tokens.orangeText}
        icon={<CoinIcon size={24} />}
        value={`${pot.balance} bal`}
        label={`${child.short} — toplanan bal`}
        note={`${POINTS_PER_TMT} bal = 1 TMT · ${pot.worth} TMT bolýar`}
        actions={(
          <>
            <Button
              fullWidth variant="contained" disableElevation
              disabled={pot.worth < 1}
              onClick={doConvert}
            >{pot.worth >= 1 ? `${pot.worth} TMT-a öwür` : `${short} bal ýetenok`}</Button>
            <Button
              fullWidth disableElevation onClick={onShop}
              sx={{ bgcolor: '#fff', color: tokens.orangeText }}
              startIcon={<ShopIcon size={18} />}
            >Dükan</Button>
          </>
        )}
      />
      {pot.worth >= 1 && pointsRemainder(pot.balance) > 0 && (
        <Typography sx={{ fontSize: 12, color: tokens.inkMuted, textAlign: 'center', mt: '8px' }}>
          {pointsRemainder(pot.balance)} bal hasapda galýar
        </Typography>
      )}

      <SectionLabel>Nireden geldi</SectionLabel>
      {sources.length === 0 ? (
        <EmptyState
          icon={<CoinIcon size={26} />}
          title="Heniz bal ýok"
          note="Öý işini belläp ýa-da test tabşyryp başla"
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
          {sources.map((r) => (
            <SurfaceRow
              key={r.id}
              icon={(
                <IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={40} radius={tokens.rTile}>
                  <CoinIcon size={18} />
                </IconBadge>
              )}
              label={r.label}
              labelSx={{ fontSize: 15, fontWeight: 600 }}
              sub={r.sub}
              end={(
                <Typography sx={{
                  fontSize: 15, fontWeight: 700, color: tokens.orangeText,
                  fontVariantNumeric: 'tabular-nums',
                }}>{r.n}</Typography>
              )}
            />
          ))}
        </Box>
      )}

      {swaps.length > 0 && (
        <>
          <SectionLabel>Pula öwrülenler</SectionLabel>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
            {swaps.map((e) => (
              <SurfaceRow
                key={e.id}
                icon={(
                  <IconBadge bg={tokens.blueTint} color={tokens.blueText} size={40} radius={tokens.rTile}>
                    <WalletIcon size={18} />
                  </IconBadge>
                )}
                label={e.note}
                labelSx={{ fontSize: 15, fontWeight: 600 }}
                sub={absDate(e.at)}
                end={(
                  <Typography sx={{
                    fontSize: 15, fontWeight: 700, color: tokens.blueText,
                    fontVariantNumeric: 'tabular-nums',
                  }}>+{e.amount} TMT</Typography>
                )}
              />
            ))}
          </Box>
        </>
      )}
    </SubPage>
  );
}

/* ---------------- Dükan ---------------- */

/*
 * One item, as the app's own list row.
 *
 * There is no product card here and there should not be: a row with a picture,
 * a name, a second line and something on the right is `SurfaceRow`, which is
 * what every other list in the app is built from. The picture is the contest's
 * `PrizeArt` at row size, and the right-hand slot carries the price and — when
 * the balance cannot cover it — the one word that says so.
 */
function ProductRow({ p, affordable, onOpen }: {
  p: Product; affordable: boolean; onOpen: () => void;
}) {
  return (
    <SurfaceRow
      icon={<PrizeArt art={p.art} size={44} bg={tokens.surfacePress} />}
      label={p.name}
      sub={p.note}
      end={(
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{
            fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: affordable ? tokens.ink : tokens.inkMuted,
          }}>{p.price} TMT</Typography>
          {!affordable && (
            <Typography sx={{ fontSize: 11, color: tokens.inkMuted }}>ýetenok</Typography>
          )}
        </Box>
      )}
      onClick={onOpen}
    />
  );
}

/* The balance, above prices that are read against it. One strip, used by the
   shop's front page and by every store page under it. */
function BalanceStrip({ balance, note, onTopUp }: {
  balance: number; note: string; onTopUp: () => void;
}) {
  return (
    <Box sx={{
      mt: '14px', display: 'flex', alignItems: 'center', gap: '12px',
      bgcolor: tokens.blueTint, borderRadius: `${tokens.rCard}px`, p: '13px 15px',
    }}>
      <IconBadge bg="#fff" color={tokens.blueText} size={40} radius={tokens.rTile}>
        <WalletIcon size={19} />
      </IconBadge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {balance} TMT
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.ink3 }} noWrap>{note}</Typography>
      </Box>
      <Button disableElevation onClick={onTopUp} sx={{ bgcolor: '#fff', color: tokens.blueText, flex: 'none' }}>
        Doldur
      </Button>
    </Box>
  );
}

/*
 * The shop's front page: the shops.
 *
 * Seven items from three partners on one scroll is a pile, and it gets worse
 * with every partner added — the page would have to be redesigned the day a
 * fourth shop signs. So this is the same three-level shape the rest of the app
 * uses (Gollanmalar: grid → list → detail; Testler: landing → ders → test):
 * **shops → a shop's items → the item**. Each row says what the shop sells and
 * what its cheapest thing costs, which is the pair a reader with a balance
 * needs to decide which counter to walk to.
 */
export function ShopScreen({ onBack, toast, onTopUp }: {
  onBack: () => void; toast: Toast; onTopUp: () => void;
}) {
  const { balance } = useWallet();
  const orders = useOrders();
  const [store, setStore] = useState<Store | null>(null);

  if (store) {
    return (
      <StoreScreen store={store} onBack={() => setStore(null)} toast={toast} onTopUp={onTopUp} />
    );
  }

  return (
    <SubPage
      title="Dükan"
      onBack={onBack}
      help="Hyzmatdaş dükanlaryň harytlary. Töleg balansdan çykýar; sargyt kody bilen dükandan alyp gaýdýarsyň."
    >
      <BalanceStrip
        balance={balance}
        note={balance >= cheapest() ? 'Balansdan tölemek üçin ýeterlik' : `Iň arzan haryt ${cheapest()} TMT`}
        onTopUp={onTopUp}
      />

      {orders.length > 0 && (
        <>
          <SectionLabel>Sargytlarym</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map((o) => {
              const p = productOf(o.productId);
              return (
                <SurfaceRow
                  key={o.id}
                  icon={(
                    <IconBadge bg={tokens.greenTint} color={tokens.greenDeep} size={44}>
                      <CheckIcon size={18} />
                    </IconBadge>
                  )}
                  label={p?.name ?? 'Haryt'}
                  sub={`Kod ${o.code} · ${storeOf(p?.store ?? '').name} · ${absDate(o.at)}`}
                />
              );
            })}
          </Box>
        </>
      )}

      <SectionLabel>Dükanlar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shopGroups().map((g) => (
          <SurfaceRow
            key={g.store.id}
            icon={(
              <IconBadge bg={tokens.orangeTint} color={tokens.orangeText} size={44}>
                <ShopIcon size={20} />
              </IconBadge>
            )}
            label={g.store.name}
            sub={`${g.store.note} · ${g.items.length} haryt · ${Math.min(...g.items.map((p) => p.price))} TMT-den`}
            end={<RowChevron />}
            onClick={() => setStore(g.store)}
          />
        ))}
      </Box>
      <Box sx={{ height: '16px' }} />
    </SubPage>
  );
}

/*
 * One shop's counter.
 *
 * The page a reader lands on after choosing where to shop: that shop's items,
 * nothing else's, with the same balance strip above them so every price is
 * still read against one number. Buying is confirmed in a sheet rather than on
 * a page of its own — it is one decision with one fact behind it (is there
 * enough), which is exactly what the app uses `SheetDrawer` for.
 */
function StoreScreen({ store, onBack, toast, onTopUp }: {
  store: Store; onBack: () => void; toast: Toast; onTopUp: () => void;
}) {
  const { balance } = useWallet();
  const [open, setOpen] = useState<Product | null>(null);
  const items = PRODUCTS.filter((p) => p.store === store.id);

  const buy = (p: Product) => {
    if (buyProduct(p.id)) {
      setOpen(null);
      toast(`${p.name} alyndy — sargyt kody taýýar`);
    } else {
      toast(`Balans ýetenok — ${p.price - balance} TMT dolduryň`);
    }
  };

  return (
    <SubPage title={store.name} onBack={onBack} help={`${store.note}. Töleg balansdan çykýar.`}>
      <BalanceStrip
        balance={balance}
        note={items.some((p) => p.price <= balance)
          ? 'Balansdan tölemek üçin ýeterlik'
          : `Bu dükanda iň arzan haryt ${Math.min(...items.map((p) => p.price))} TMT`}
        onTopUp={onTopUp}
      />

      <SectionLabel>Harytlar</SectionLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((p) => (
          <ProductRow key={p.id} p={p} affordable={balance >= p.price} onOpen={() => setOpen(p)} />
        ))}
      </Box>
      <Box sx={{ height: '16px' }} />

      <SheetDrawer open={open !== null} onClose={() => setOpen(null)}>
        {open && (
          <>
            <Box sx={{ display: 'grid', placeItems: 'center', pt: '4px' }}>
              <PrizeArt art={open.art} size={110} bg={tokens.surface} />
            </Box>
            <Typography variant="h2" sx={{ textAlign: 'center', mt: '12px' }}>{open.name}</Typography>
            <Typography sx={{ fontSize: 13.5, color: tokens.ink3, textAlign: 'center', mt: '4px' }}>
              {open.note} · {store.name}
            </Typography>

            {/* price against balance — the only arithmetic the decision needs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mt: '16px' }}>
              <StatTile value={`${open.price} TMT`} label="Bahasy" />
              <StatTile
                value={`${balance} TMT`} label="Balansyň"
                color={balance >= open.price ? tokens.greenText : tokens.redText}
              />
            </Box>

            <Typography sx={{ fontSize: 12.5, color: tokens.inkMuted, lineHeight: 1.5, mt: '12px' }}>
              Töleg balansdan çykýar. Soňra sargyt kody berilýär — haryt {store.name} dükanyndan alynýar.
            </Typography>
            <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
              <Button fullWidth onClick={() => setOpen(null)} sx={{ bgcolor: tokens.surface, color: tokens.ink }}>
                Ýap
              </Button>
              <Button
                fullWidth variant="contained" disableElevation
                onClick={() => (balance >= open.price ? buy(open) : onTopUp())}
              >
                {balance >= open.price ? 'Satyn al' : 'Balansy doldur'}
              </Button>
            </Box>
          </>
        )}
      </SheetDrawer>
    </SubPage>
  );
}

/** A row for the Profil payment block — the balance, at a glance. */
export function BalanceRow({ onClick }: { onClick: () => void }) {
  const { balance } = useWallet();
  return (
    <SurfaceRow
      icon={<IconBadge bg={tokens.blueSoft} color={tokens.blue} size={44}><WalletIcon size={20} /></IconBadge>}
      label="Balans"
      sub="Dükan we abuna üçin"
      end={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {balance} TMT
          </Typography>
          <RowChevron />
        </Box>
      )}
      onClick={onClick}
    />
  );
}
