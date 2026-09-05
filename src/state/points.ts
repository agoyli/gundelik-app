import { useChild } from './children';
import { useAllPoints } from './contest';
import { useWorkPoints } from './earn';
import { POINTS_PER_TMT, pointsToTmt, useWallet } from './wallet';

/*
 * How many `bal` the selected child holds — one number, derived, in one place.
 *
 * It used to be two. Testler printed the child's total from `children.ts`
 * (1251) and the wallet printed what it could convert (what the contests and
 * the homework had paid this session), so the same account had two balances
 * with the same name and neither mentioned the other. A balance you cannot
 * reconcile with the one on the next screen is not a balance, it is a score.
 *
 * So: what the child came in with, plus everything the app has paid them,
 * minus what has already become money. The pot is the child's — a family with
 * five children has five of them — while the TMT it converts into belongs to
 * the account, which is why the wallet remembers conversions per child.
 */
export const usePointsBalance = () => {
  const { child } = useChild();
  const contests = useAllPoints();
  const work = useWorkPoints();
  const { converted } = useWallet();

  const earned = child.points + contests + work.total;
  const balance = Math.max(0, earned - (converted[child.id] ?? 0));
  return {
    balance,
    /** what it is worth in whole TMT, at the wallet's rate */
    worth: pointsToTmt(balance),
    rate: POINTS_PER_TMT,
    /** the four sources, for the line that says where it came from */
    before: child.points,
    contests,
    hw: work.hw,
    tests: work.tests,
  };
};
