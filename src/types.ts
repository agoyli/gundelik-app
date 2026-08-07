export type GradeColor = 'blue' | 'green';

export interface Grade {
  a: number;
  b: number;
  color: GradeColor;
}

export interface Lesson {
  id: string;
  subject: string;
  time: string;
  teacher: string;
  people: number;
  grade: Grade | null;
  unread: number;
  hwDone: boolean;
  tema: string;
  hw: string | null;
}

export type DayEvent = 'house' | 'pen' | 'dot';

export interface DayInfo {
  key: string;
  d: number;
  w: string; // short weekday, e.g. "Siş"
  full: string; // full weekday, e.g. "Sişenbe"
  disabled?: boolean;
  events: DayEvent[];
}

export interface DaySchedule {
  key: string;
  notes: number;
  lessons: Lesson[];
}

export type TabId = 'cagam' | 'gundelik' | 'analitika' | 'gollanmalar' | 'yetisik';
