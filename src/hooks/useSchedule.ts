import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api/mockApi';
import { TODAY } from '../lib/date';
import type { DayInfo, DaySchedule } from '../types';

export function useSchedule(initialKey = TODAY) {
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
      const d = await api.fetchDay(key);
      if (id === req.current) setDay(d);
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void api.fetchWeek().then(setDays);
    void api.fetchLastChecked().then(setLastChecked);
    void loadDay(initialKey);
  }, [initialKey, loadDay]);

  const selectDate = useCallback((key: string) => {
    if (key === dateKey) return;
    setDateKey(key);
    setNeedsCheck(true);
    void loadDay(key);
  }, [dateKey, loadDay]);

  const setHwDone = useCallback(async (lessonId: string, done: boolean) => {
    const updated = await api.setHomeworkDone(dateKey, lessonId, done);
    setDay(updated);
  }, [dateKey]);

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
