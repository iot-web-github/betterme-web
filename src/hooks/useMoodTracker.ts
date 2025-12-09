import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO } from 'date-fns';

export interface MoodEntry {
  id: string;
  date: string;
  time: string;
  level: 1 | 2 | 3 | 4 | 5;
  triggers: string[];
  reasons: string;
  createdAt: string;
}

const MOOD_TRIGGERS = [
  'Work', 'Family', 'Health', 'Weather', 'Sleep', 'Exercise',
  'Social', 'Food', 'Stress', 'Achievement', 'Relationship', 'Money'
];

export const useMoodTracker = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (data && !error) {
        setEntries(data.map(e => ({
          id: e.id,
          date: e.date,
          time: e.time,
          level: e.level as 1 | 2 | 3 | 4 | 5,
          triggers: e.triggers || [],
          reasons: e.reasons || '',
          createdAt: e.created_at,
        })));
      }
      
      setIsLoading(false);
    };

    fetchEntries();
  }, [user]);

  const addEntry = useCallback(async (data: {
    level: 1 | 2 | 3 | 4 | 5;
    triggers?: string[];
    reasons?: string;
    date?: string;
    time?: string;
  }): Promise<MoodEntry | null> => {
    if (!user) return null;

    const now = new Date();
    const entryDate = data.date || format(now, 'yyyy-MM-dd');
    const entryTime = data.time || format(now, 'HH:mm');

    const { data: newEntry, error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      date: entryDate,
      time: entryTime,
      level: data.level,
      triggers: data.triggers || [],
      reasons: data.reasons || '',
    }).select().single();

    if (error || !newEntry) {
      console.error('Error adding mood entry:', error);
      return null;
    }

    const entry: MoodEntry = {
      id: newEntry.id,
      date: newEntry.date,
      time: newEntry.time,
      level: newEntry.level as 1 | 2 | 3 | 4 | 5,
      triggers: newEntry.triggers || [],
      reasons: newEntry.reasons || '',
      createdAt: newEntry.created_at,
    };

    setEntries(prev => [entry, ...prev]);
    return entry;
  }, [user]);

  const deleteEntry = useCallback(async (entryId: string) => {
    if (!user) return;

    const { error } = await supabase.from('mood_entries').delete().eq('id', entryId);
    
    if (error) {
      console.error('Error deleting mood entry:', error);
      return;
    }

    setEntries(prev => prev.filter(e => e.id !== entryId));
  }, [user]);

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
