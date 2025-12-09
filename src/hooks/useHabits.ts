import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number[];
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch habits and logs from Supabase
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      
      const [habitsResult, logsResult] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('habit_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      if (habitsResult.data) {
        setHabits(habitsResult.data.map(h => ({
          id: h.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          frequency: h.frequency as 'daily' | 'weekly',
          targetDays: h.target_days || undefined,
          createdAt: h.created_at,
        })));
      }

      if (logsResult.data) {
        setLogs(logsResult.data.map(l => ({
          id: l.id,
          habitId: l.habit_id,
          date: l.date,
          completed: l.completed,
          notes: l.notes || undefined,
          createdAt: l.created_at,
        })));
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const addHabit = useCallback(async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data: newHabit, error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      frequency: data.frequency,
      target_days: data.targetDays || null,
    }).select().single();

    if (error || !newHabit) {
      console.error('Error adding habit:', error);
      return null;
    }

    const habit: Habit = {
      id: newHabit.id,
      name: newHabit.name,
      icon: newHabit.icon,
      color: newHabit.color,
      frequency: newHabit.frequency as 'daily' | 'weekly',
      targetDays: newHabit.target_days || undefined,
      createdAt: newHabit.created_at,
    };

    setHabits(prev => [...prev, habit]);
    return habit;
  }, [user]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    
    if (error) {
      console.error('Error deleting habit:', error);
      return;
    }

    setHabits(prev => prev.filter(h => h.id !== habitId));
    setLogs(prev => prev.filter(l => l.habitId !== habitId));
  }, [user]);

  const toggleHabit = useCallback(async (habitId: string, date: string) => {
    if (!user) return;

    const existingLog = logs.find(l => l.habitId === habitId && l.date === date);
    
    if (existingLog) {
      // Toggle existing log
      const { error } = await supabase
        .from('habit_logs')
        .update({ completed: !existingLog.completed })
        .eq('id', existingLog.id);

      if (error) {
        console.error('Error updating habit log:', error);
        return;
      }

      setLogs(prev => prev.map(l =>
        l.id === existingLog.id ? { ...l, completed: !l.completed } : l
      ));
    } else {
      // Create new log
      const { data: newLog, error } = await supabase.from('habit_logs').insert({
        user_id: user.id,
        habit_id: habitId,
        date,
        completed: true,
      }).select().single();

      if (error || !newLog) {
        console.error('Error creating habit log:', error);
        return;
      }

      setLogs(prev => [...prev, {
        id: newLog.id,
        habitId: newLog.habit_id,
        date: newLog.date,
        completed: newLog.completed,
        createdAt: newLog.created_at,
      }]);
    }
  }, [user, logs]);

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
