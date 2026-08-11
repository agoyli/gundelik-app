export interface Lesson {
  id: string;
  subject: string;
  time: string;
  teacher: string;
  people: number;
  /* One mark per lesson. It used to be a pair rendered as "5/4" behind a
     slash — two grades in one cell is a rare case, and giving it the default
     shape made every ordinary lesson look like one. */
  grade: number | null;
  hwDone: boolean;
  tema: string;
  hw: string | null;
}

/* The one marker a day cell can carry. There used to be three — a house, a
   pen and a dot — and the first two were read as "holiday" and "celebration",
   which is not what they meant and not something the app knows. What it does
   know is whether the day has been checked with Barla, so that is what the
   marker says. */

export interface DayInfo {
  key: string;
  d: number;
  w: string; // short weekday, e.g. "Siş"
  full: string; // full weekday, e.g. "Sişenbe"
  disabled?: boolean;
  checked?: boolean;
}

export interface DaySchedule {
  key: string;
  notes: number;
  lessons: Lesson[];
}

export type TabId = 'gundelik' | 'analitika' | 'gollanmalar' | 'yetisik';

/* tab order — also the left-to-right swipe order */
export const TAB_ORDER: TabId[] = ['gundelik', 'analitika', 'gollanmalar', 'yetisik'];
