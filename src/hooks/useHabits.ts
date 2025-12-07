import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, parseISO } from 'date-fns';

const HABITS_STORAGE_KEY = 'smart-schedule-habits';
const HABIT_LOGS_STORAGE_KEY = 'smart-schedule-habit-logs';

const getStoredHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultHabits();
  } catch {
    return getDefaultHabits();
  }
};

const getStoredLogs = (): HabitLog[] => {
  try {
    const stored = localStorage.getItem(HABIT_LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getDefaultHabits = (): Habit[] => [
  { id: '1', name: 'Drink Water', icon: '💧', color: 'hsl(199 89% 48%)', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: '2', name: 'Exercise', icon: '🏃', color: 'hsl(142 76% 36%)', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: '3', name: 'Read', icon: '📚', color: 'hsl(38 92% 50%)', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: '4', name: 'Meditate', icon: '🧘', color: 'hsl(262 83% 58%)', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: '5', name: 'Sleep Early', icon: '😴', color: 'hsl(340 82% 52%)', frequency: 'daily', createdAt: new Date().toISOString() },
];

const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
};

const saveLogs = (logs: HabitLog[]) => {
  localStorage.setItem(HABIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHabits(getStoredHabits());
    setLogs(getStoredLogs());
    setIsLoading(false);
  }, []);

  const addHabit = useCallback((data: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setHabits(prev => {
      const updated = [...prev, newHabit];
      saveHabits(updated);
      return updated;
    });
    
    return newHabit;
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => {
      const updated = prev.filter(h => h.id !== habitId);
      saveHabits(updated);
      return updated;
    });
    
    // Also delete related logs
    setLogs(prev => {
      const updated = prev.filter(l => l.habitId !== habitId);
      saveLogs(updated);
      return updated;
    });
  }, []);

  const toggleHabit = useCallback((habitId: string, date: string) => {
    const existingLog = logs.find(l => l.habitId === habitId && l.date === date);
    
    if (existingLog) {
      // Toggle existing
      setLogs(prev => {
        const updated = prev.map(l =>
          l.id === existingLog.id
            ? { ...l, completed: !l.completed }
            : l
        );
        saveLogs(updated);
        return updated;
      });
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: uuidv4(),
        habitId,
        date,
        completed: true,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      setLogs(prev => {
        const updated = [...prev, newLog];
        saveLogs(updated);
        return updated;
      });
    }
  }, [logs]);

  const getLogsForDate = useCallback((date: string): HabitLog[] => {
    return logs.filter(l => l.date === date);
  }, [logs]);

  const isHabitCompleted = useCallback((habitId: string, date: string): boolean => {
    const log = logs.find(l => l.habitId === habitId && l.date === date);
    return log?.completed ?? false;
  }, [logs]);

  const getHabitStreak = useCallback((habitId: string): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const log = logs.find(l => l.habitId === habitId && l.date === date);
      
      if (log?.completed) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }, [logs]);

  const getWeeklyCompletion = useCallback((habitId: string): { date: string; completed: boolean }[] => {
    const today = new Date();
    const result: { date: string; completed: boolean }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const log = logs.find(l => l.habitId === habitId && l.date === date);
      result.push({
        date,
        completed: log?.completed ?? false,
      });
    }
    
    return result;
  }, [logs]);

  const getTodayProgress = useCallback((): { completed: number; total: number } => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLogs = logs.filter(l => l.date === today && l.completed);
    return {
      completed: todayLogs.length,
      total: habits.length,
    };
  }, [logs, habits]);

  return {
    habits,
    logs,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabit,
    getLogsForDate,
    isHabitCompleted,
    getHabitStreak,
    getWeeklyCompletion,
    getTodayProgress,
  };
};
