import { useState, useEffect, useCallback } from 'react';
import { DailyCheckIn, LifeMetrics, MoodLevel, EnergyLevel, StressLevel } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';
import { subDays, parseISO, differenceInMinutes, format } from 'date-fns';

const STORAGE_KEY = 'smart-schedule-checkins';

const getStoredCheckIns = (): DailyCheckIn[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCheckIns = (checkIns: DailyCheckIn[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
};

export const useLifeTracking = () => {
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredCheckIns();
    setCheckIns(stored);
    setIsLoading(false);
  }, []);

  const getCheckInForDate = useCallback((date: string): DailyCheckIn | undefined => {
    return checkIns.find(c => c.date === date);
  }, [checkIns]);

  const saveCheckIn = useCallback((data: Omit<DailyCheckIn, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt'>) => {
    const existing = checkIns.find(c => c.date === data.date);
    
    if (existing) {
      // Update existing
      setCheckIns(prev => {
        const updated = prev.map(c =>
          c.date === data.date
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c
        );
        saveCheckIns(updated);
        return updated;
      });
    } else {
      // Create new
      const newCheckIn: DailyCheckIn = {
        ...data,
        id: uuidv4(),
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCheckIns(prev => {
        const updated = [...prev, newCheckIn];
        saveCheckIns(updated);
        return updated;
      });
    }
  }, [checkIns]);

  const getWeeklyStats = useCallback((): LifeMetrics => {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    
    const weekCheckIns = checkIns.filter(c => {
      const date = parseISO(c.date);
      return date >= weekAgo && date <= today;
    });

    if (weekCheckIns.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        averagePhoneUsage: 0,
        exerciseDays: 0,
        waterAverage: 0,
      };
    }

    const totalMood = weekCheckIns.reduce((sum, c) => sum + c.mood, 0);
    const totalEnergy = weekCheckIns.reduce((sum, c) => sum + c.energy, 0);
    const totalStress = weekCheckIns.reduce((sum, c) => sum + c.stress, 0);
    const totalPhone = weekCheckIns.reduce((sum, c) => sum + c.phoneUsage, 0);
    const totalWater = weekCheckIns.reduce((sum, c) => sum + c.waterIntake, 0);
    const exerciseDays = weekCheckIns.filter(c => c.exercise).length;
    
    // Calculate average sleep
    let totalSleepMinutes = 0;
    weekCheckIns.forEach(c => {
      if (c.sleepTime && c.wakeUpTime) {
        const sleepParts = c.sleepTime.split(':').map(Number);
        const wakeParts = c.wakeUpTime.split(':').map(Number);
        
        // Assume sleep is previous night
        let sleepMinutes = (wakeParts[0] * 60 + wakeParts[1]) - (sleepParts[0] * 60 + sleepParts[1]);
        if (sleepMinutes < 0) sleepMinutes += 24 * 60; // Crossed midnight
        totalSleepMinutes += sleepMinutes;
      }
    });

    return {
      averageMood: Math.round((totalMood / weekCheckIns.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / weekCheckIns.length) * 10) / 10,
      averageStress: Math.round((totalStress / weekCheckIns.length) * 10) / 10,
      averageSleep: Math.round((totalSleepMinutes / weekCheckIns.length / 60) * 10) / 10,
      averagePhoneUsage: Math.round(totalPhone / weekCheckIns.length),
      exerciseDays,
      waterAverage: Math.round((totalWater / weekCheckIns.length) * 10) / 10,
    };
  }, [checkIns]);

  const getMonthlyCheckIns = useCallback((month: Date): DailyCheckIn[] => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return checkIns.filter(c => {
      const date = parseISO(c.date);
      return date >= monthStart && date <= monthEnd;
    });
  }, [checkIns]);

  const getMoodTrend = useCallback((days: number = 7): { date: string; mood: number }[] => {
    const today = new Date();
    const result: { date: string; mood: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const checkIn = checkIns.find(c => c.date === date);
      result.push({
        date,
        mood: checkIn?.mood || 0,
      });
    }
    
    return result;
  }, [checkIns]);

  return {
    checkIns,
    isLoading,
    getCheckInForDate,
    saveCheckIn,
    getWeeklyStats,
    getMonthlyCheckIns,
    getMoodTrend,
  };
};
