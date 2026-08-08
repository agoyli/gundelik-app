import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/*
 * Full-screen sub-pages (roadmap, lesson) sit inside a tab panel, but a sideways
 * swipe there should not slide you into the next tab. Any such page calls
 * `useSwipeLock()` while mounted; the shell freezes the horizontal track.
 */
const Ctx = createContext<{ locked: boolean; retain: () => () => void }>({
  locked: false,
  retain: () => () => {},
});

export function SwipeLockProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const retain = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(() => ({ locked: count > 0, retain }), [count, retain]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSwipeLocked = () => useContext(Ctx).locked;

/** Lock horizontal tab swiping for as long as the calling component is mounted. */
export function useSwipeLock() {
  const { retain } = useContext(Ctx);
  useEffect(() => retain(), [retain]);
}
