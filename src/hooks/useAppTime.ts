import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, subDays, subWeeks, subMonths, subYears, addDays } from 'date-fns';

export type TimeFilter = 'today' | 'week' | 'month' | 'year';

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AppTime {
  now: Date;
  today: string;
  currentTimeFilter: TimeFilter;
  timeRange: TimeRange;
  setTimeFilter: (filter: TimeFilter) => void;
  getDateRange: (filter: TimeFilter) => TimeRange;
  formatDate: (date: Date | string, formatStr?: string) => string;
  isToday: (date: Date | string) => boolean;
  getTimezone: () => string;
  getTimezoneOffset: () => number;
}

export const useAppTime = (): AppTime => {
  const [now, setNow] = useState(new Date());
  const [currentTimeFilter, setCurrentTimeFilter] = useState<TimeFilter>('today');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const today = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);

  const getDateRange = useCallback((filter: TimeFilter): TimeRange => {
    const current = new Date();
    
    switch (filter) {
      case 'today':
        return {
          start: startOfDay(current),
          end: current,
          label: 'Today',
        };
      case 'week':
        return {
          start: startOfWeek(current, { weekStartsOn: 1 }),
          end: endOfWeek(current, { weekStartsOn: 1 }),
          label: 'This Week',
        };
      case 'month':
        return {
          start: startOfMonth(current),
          end: endOfMonth(current),
          label: 'This Month',
        };
      case 'year':
        return {
          start: startOfYear(current),
          end: endOfYear(current),
          label: 'This Year',
        };
      default:
        return {
          start: startOfDay(current),
          end: current,
          label: 'Today',
        };
    }
  }, []);

  const timeRange = useMemo(() => getDateRange(currentTimeFilter), [currentTimeFilter, getDateRange]);

  const formatDate = useCallback((date: Date | string, formatStr: string = 'yyyy-MM-dd'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
  }, []);

  const isToday = useCallback((date: Date | string): boolean => {
    const d = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return d === today;
  }, [today]);

  const getTimezone = useCallback((): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const getTimezoneOffset = useCallback((): number => {
    return new Date().getTimezoneOffset();
  }, []);

  const setTimeFilter = useCallback((filter: TimeFilter) => {
    setCurrentTimeFilter(filter);
  }, []);

  return {
    now,
    today,
    currentTimeFilter,
    timeRange,
    setTimeFilter,
    getDateRange,
    formatDate,
    isToday,
    getTimezone,
    getTimezoneOffset,
  };
};

// Utility function to get relative date ranges for comparisons
export const getComparisonRange = (filter: TimeFilter): { current: TimeRange; previous: TimeRange } => {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return {
        current: {
          start: startOfDay(now),
          end: now,
          label: 'Today',
        },
        previous: {
          start: startOfDay(subDays(now, 1)),
          end: subDays(now, 1),
          label: 'Yesterday',
        },
      };
    case 'week':
      return {
        current: {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
          label: 'This Week',
        },
        previous: {
          start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          label: 'Last Week',
        },
      };
    case 'month':
      return {
        current: {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month',
        },
        previous: {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1)),
          label: 'Last Month',
        },
      };
    case 'year':
      return {
        current: {
          start: startOfYear(now),
          end: endOfYear(now),
          label: 'This Year',
        },
        previous: {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1)),
          label: 'Last Year',
        },
      };
    default:
      return {
        current: { start: startOfDay(now), end: now, label: 'Today' },
        previous: { start: startOfDay(subDays(now, 1)), end: subDays(now, 1), label: 'Yesterday' },
      };
  }
};
