import { useState, useEffect, useCallback } from 'react';
import { MoodEntry } from '@/types/tools';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, parseISO } from 'date-fns';

const STORAGE_KEY = 'smart-schedule-mood-entries';

const MOOD_TRIGGERS = [
  'Work', 'Family', 'Health', 'Weather', 'Sleep', 'Exercise',
  'Social', 'Food', 'Stress', 'Achievement', 'Relationship', 'Money'
];

const getStoredEntries = (): MoodEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEntries = (entries: MoodEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const useMoodTracker = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setEntries(getStoredEntries());
    setIsLoading(false);
  }, []);

  const addEntry = useCallback((data: {
    level: 1 | 2 | 3 | 4 | 5;
    triggers?: string[];
    reasons?: string;
    date?: string;
    time?: string;
  }): MoodEntry => {
    const now = new Date();
    const newEntry: MoodEntry = {
      id: uuidv4(),
      date: data.date || format(now, 'yyyy-MM-dd'),
      time: data.time || format(now, 'HH:mm'),
      level: data.level,
      triggers: data.triggers || [],
      reasons: data.reasons || '',
      createdAt: now.toISOString(),
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      saveEntries(updated);
      return updated;
    });

    return newEntry;
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== entryId);
      saveEntries(updated);
      return updated;
    });
  }, []);

  const getEntriesForDate = useCallback((date: string): MoodEntry[] => {
    return entries.filter(e => e.date === date).sort((a, b) => 
      b.time.localeCompare(a.time)
    );
  }, [entries]);

  const getAverageForDate = useCallback((date: string): number => {
    const dayEntries = entries.filter(e => e.date === date);
    if (dayEntries.length === 0) return 0;
    return dayEntries.reduce((sum, e) => sum + e.level, 0) / dayEntries.length;
  }, [entries]);

  const getWeeklyTrend = useCallback((): { date: string; average: number; entries: number }[] => {
    const today = new Date();
    const result: { date: string; average: number; entries: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const dayEntries = entries.filter(e => e.date === date);
      result.push({
        date,
        average: getAverageForDate(date),
        entries: dayEntries.length,
      });
    }

    return result;
  }, [entries, getAverageForDate]);

  const getTriggerStats = useCallback((): { trigger: string; count: number; avgMood: number }[] => {
    const stats: { [trigger: string]: { count: number; totalMood: number } } = {};

    entries.forEach(entry => {
      entry.triggers.forEach(trigger => {
        if (!stats[trigger]) {
          stats[trigger] = { count: 0, totalMood: 0 };
        }
        stats[trigger].count++;
        stats[trigger].totalMood += entry.level;
      });
    });

    return Object.entries(stats)
      .map(([trigger, data]) => ({
        trigger,
        count: data.count,
        avgMood: data.totalMood / data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const getMoodVsActivityCorrelation = useCallback((): { 
    sleepCorrelation: number | null;
    exerciseCorrelation: number | null;
  } => {
    // This would integrate with other trackers
    // Simplified version returning null for now
    return {
      sleepCorrelation: null,
      exerciseCorrelation: null,
    };
  }, []);

  const getWeeklyAverage = useCallback((): number => {
    const today = new Date();
    const weekEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= subDays(today, 7) && entryDate <= today;
    });

    if (weekEntries.length === 0) return 0;
    return weekEntries.reduce((sum, e) => sum + e.level, 0) / weekEntries.length;
  }, [entries]);

  return {
    entries,
    isLoading,
    triggers: MOOD_TRIGGERS,
    addEntry,
    deleteEntry,
    getEntriesForDate,
    getAverageForDate,
    getWeeklyTrend,
    getTriggerStats,
    getMoodVsActivityCorrelation,
    getWeeklyAverage,
  };
};
