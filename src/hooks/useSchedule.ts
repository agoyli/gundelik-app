import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api/mockApi';
import { TODAY } from '../lib/date';
import { useChild } from '../state/children';
import type { DayInfo, DaySchedule } from '../types';

export function useSchedule(initialKey = TODAY) {
  /* whose diary this is — a change of child is a change of every answer below,
     so it is a dependency of the fetch rather than a filter over the result */
  const { id: child } = useChild();
  const [days, setDays] = useState<DayInfo[]>([]);
  const [dateKey, setDateKey] = useState(initialKey);
  const [day, setDay] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState('');
  const [needsCheck, setNeedsCheck] = useState(false);
  const req = useRef(0);

  const loadDay = useCallback(async (key: string) => {
    const id = ++req.current;
    setLoading(true);
    try {
      const d = await api.fetchDay(key, child);
      if (id === req.current) setDay(d);
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    void api.fetchWeek().then(setDays);
    void api.fetchLastChecked().then(setLastChecked);
    void loadDay(dateKey);
    /* `dateKey` is intentionally not a dependency: selectDate loads the day it
       selects. This effect is the first load and the reload after a switch. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDay]);

  const selectDate = useCallback((key: string) => {
    if (key === dateKey) return;
    setDateKey(key);
    setNeedsCheck(true);
    void loadDay(key);
  }, [dateKey, loadDay]);

  const setHwDone = useCallback(async (lessonId: string, done: boolean) => {
    const updated = await api.setHomeworkDone(dateKey, lessonId, done, child);
    setDay(updated);
  }, [dateKey, child]);

  /* Signing is per-day: `signed` is a fact about the selected date, not a
     global "last refreshed" stamp, so switching days switches the answer. */
  const [checking, setChecking] = useState(false);
  const signDay = useCallback(async () => {
    setChecking(true);
    try {
      setDays(await api.signDay(dateKey));
      setNeedsCheck(false);
    } finally {
      setChecking(false);
    }
  }, [dateKey]);

  const signed = days.some((d) => d.key === dateKey && d.checked);

  const hwStats = day
    ? {
        done: day.lessons.filter((l) => l.hwDone).length,
        total: day.lessons.filter((l) => l.hw).length,
      }
    : { done: 0, total: 0 };

  return {
    days, dateKey, day, loading, lastChecked, needsCheck, checking, hwStats, signed,
    selectDate, setHwDone, signDay,
  };
}
