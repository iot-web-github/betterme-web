import { useState, useEffect, useCallback } from 'react';
import { HealthLog } from '@/types/tools';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, parseISO } from 'date-fns';

const STORAGE_KEY = 'smart-schedule-health';

const getStoredLogs = (): HealthLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs: HealthLog[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const useHealthStats = () => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLogs(getStoredLogs());
    setIsLoading(false);
  }, []);

  const getLogForDate = useCallback((date: string): HealthLog | undefined => {
    return logs.find(l => l.date === date);
  }, [logs]);

  const saveLog = useCallback((data: {
    date: string;
    waterIntake?: number;
    calories?: number;
    exerciseMinutes?: number;
    steps?: number;
  }) => {
    const existing = logs.find(l => l.date === data.date);
    
    if (existing) {
      setLogs(prev => {
        const updated = prev.map(l =>
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
        );
        saveLogs(updated);
        return updated;
      });
    } else {
      const newLog: HealthLog = {
        id: uuidv4(),
        date: data.date,
        waterIntake: data.waterIntake || 0,
        calories: data.calories,
        exerciseMinutes: data.exerciseMinutes || 0,
        steps: data.steps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLogs(prev => {
        const updated = [...prev, newLog];
        saveLogs(updated);
        return updated;
      });
    }
  }, [logs]);

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
