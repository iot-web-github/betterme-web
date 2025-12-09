import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO } from 'date-fns';

export interface HealthLog {
  id: string;
  date: string;
  waterIntake: number;
  calories?: number;
  exerciseMinutes: number;
  steps?: number;
  createdAt: string;
  updatedAt: string;
}

export const useHealthStats = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data && !error) {
        setLogs(data.map(l => ({
          id: l.id,
          date: l.date,
          waterIntake: l.water_intake || 0,
          calories: l.calories || undefined,
          exerciseMinutes: l.exercise_minutes || 0,
          steps: l.steps || undefined,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
        })));
      }
      
      setIsLoading(false);
    };

    fetchLogs();
  }, [user]);

  const getLogForDate = useCallback((date: string): HealthLog | undefined => {
    return logs.find(l => l.date === date);
  }, [logs]);

  const saveLog = useCallback(async (data: {
    date: string;
    waterIntake?: number;
    calories?: number;
    exerciseMinutes?: number;
    steps?: number;
  }) => {
    if (!user) return;

    const existing = logs.find(l => l.date === data.date);
    
    if (existing) {
      const { error } = await supabase
        .from('health_logs')
        .update({
          water_intake: data.waterIntake ?? existing.waterIntake,
          calories: data.calories ?? existing.calories,
          exercise_minutes: data.exerciseMinutes ?? existing.exerciseMinutes,
          steps: data.steps ?? existing.steps,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating health log:', error);
        return;
      }

      setLogs(prev => prev.map(l =>
        l.date === data.date
          ? { 
              ...l, 
              waterIntake: data.waterIntake ?? l.waterIntake,
              calories: data.calories ?? l.calories,
              exerciseMinutes: data.exerciseMinutes ?? l.exerciseMinutes,
              steps: data.steps ?? l.steps,
              updatedAt: new Date().toISOString() 
            }
          : l
      ));
    } else {
      const { data: newLog, error } = await supabase.from('health_logs').insert({
        user_id: user.id,
        date: data.date,
        water_intake: data.waterIntake || 0,
        calories: data.calories || null,
        exercise_minutes: data.exerciseMinutes || 0,
        steps: data.steps || null,
      }).select().single();

      if (error || !newLog) {
        console.error('Error creating health log:', error);
        return;
      }

      setLogs(prev => [...prev, {
        id: newLog.id,
        date: newLog.date,
        waterIntake: newLog.water_intake || 0,
        calories: newLog.calories || undefined,
        exerciseMinutes: newLog.exercise_minutes || 0,
        steps: newLog.steps || undefined,
        createdAt: newLog.created_at,
        updatedAt: newLog.updated_at,
      }]);
    }
  }, [user, logs]);

  const addWater = useCallback((date: string) => {
    const existing = logs.find(l => l.date === date);
    const currentIntake = existing?.waterIntake || 0;
    saveLog({ date, waterIntake: currentIntake + 1 });
  }, [logs, saveLog]);

  const removeWater = useCallback((date: string) => {
    const existing = logs.find(l => l.date === date);
    const currentIntake = existing?.waterIntake || 0;
    if (currentIntake > 0) {
      saveLog({ date, waterIntake: currentIntake - 1 });
    }
  }, [logs, saveLog]);

  const addExercise = useCallback((date: string, minutes: number) => {
    const existing = logs.find(l => l.date === date);
    const currentMinutes = existing?.exerciseMinutes || 0;
    saveLog({ date, exerciseMinutes: currentMinutes + minutes });
  }, [logs, saveLog]);

  const getWeeklyStats = useCallback(() => {
    const today = new Date();
    const weekLogs = logs.filter(l => {
      const logDate = parseISO(l.date);
      return logDate >= subDays(today, 7) && logDate <= today;
    });

    const totalWater = weekLogs.reduce((sum, l) => sum + l.waterIntake, 0);
    const totalExercise = weekLogs.reduce((sum, l) => sum + l.exerciseMinutes, 0);
    const exerciseDays = weekLogs.filter(l => l.exerciseMinutes > 0).length;

    return {
      averageWater: weekLogs.length > 0 ? totalWater / weekLogs.length : 0,
      totalExercise,
      exerciseDays,
      daysLogged: weekLogs.length,
    };
  }, [logs]);

  const getWeeklyTrend = useCallback((): { date: string; water: number; exercise: number }[] => {
    const today = new Date();
    const result: { date: string; water: number; exercise: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const log = logs.find(l => l.date === date);
      result.push({
        date,
        water: log?.waterIntake || 0,
        exercise: log?.exerciseMinutes || 0,
      });
    }

    return result;
  }, [logs]);

  return {
    logs,
    isLoading,
    getLogForDate,
    saveLog,
    addWater,
    removeWater,
    addExercise,
    getWeeklyStats,
    getWeeklyTrend,
  };
};
