import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api/mockApi';
import type { DayInfo, DaySchedule } from '../types';

export function useSchedule(initialKey = 'd2') {
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

  const markHwDone = useCallback(async (lessonId: string) => {
    const updated = await api.markHomeworkDone(dateKey, lessonId);
    setDay(updated);
  }, [dateKey]);

  const [checking, setChecking] = useState(false);
  const runCheck = useCallback(async () => {
    setChecking(true);
    try {
      const stamp = await api.runSyncCheck();
      setLastChecked(stamp);
      setNeedsCheck(false);
      await loadDay(dateKey);
    } finally {
      setChecking(false);
    }
  }, [dateKey, loadDay]);

  const hwStats = day
    ? {
        done: day.lessons.filter((l) => l.hwDone).length,
        total: day.lessons.filter((l) => l.hw).length,
      }
    : { done: 0, total: 0 };

  return {
    days, dateKey, day, loading, lastChecked, needsCheck, checking, hwStats,
    selectDate, markHwDone, runCheck,
  };
}
