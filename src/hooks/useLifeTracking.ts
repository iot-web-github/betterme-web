import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { subDays, parseISO, format } from 'date-fns';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckIn {
  id: string;
  date: string;
  wakeUpTime: string;
  sleepTime: string;
  phoneUsage: number;
  mood: MoodLevel;
  energy: EnergyLevel;
  stress: StressLevel;
  waterIntake: number;
  exercise: boolean;
  exerciseDuration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifeMetrics {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageSleep: number;
  averagePhoneUsage: number;
  exerciseDays: number;
  waterAverage: number;
}

export const useLifeTracking = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckIns([]);
      setIsLoading(false);
      return;
    }

    const fetchCheckIns = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data && !error) {
        setCheckIns(data.map(c => ({
          id: c.id,
          date: c.date,
          wakeUpTime: c.wake_up_time || '',
          sleepTime: c.sleep_time || '',
          phoneUsage: c.phone_usage || 0,
          mood: (c.mood || 3) as MoodLevel,
          energy: (c.energy || 3) as EnergyLevel,
          stress: (c.stress || 3) as StressLevel,
          waterIntake: c.water_intake || 0,
          exercise: c.exercise || false,
          exerciseDuration: c.exercise_duration || undefined,
          notes: c.notes || undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })));
      }
      
      setIsLoading(false);
    };

    fetchCheckIns();
  }, [user]);

  const getCheckInForDate = useCallback((date: string): DailyCheckIn | undefined => {
    return checkIns.find(c => c.date === date);
  }, [checkIns]);

  const saveCheckIn = useCallback(async (data: Omit<DailyCheckIn, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const existing = checkIns.find(c => c.date === data.date);
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('daily_checkins')
        .update({
          wake_up_time: data.wakeUpTime,
          sleep_time: data.sleepTime,
          phone_usage: data.phoneUsage,
          mood: data.mood,
          energy: data.energy,
          stress: data.stress,
          water_intake: data.waterIntake,
          exercise: data.exercise,
          exercise_duration: data.exerciseDuration,
          notes: data.notes,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating check-in:', error);
        return;
      }

      setCheckIns(prev => prev.map(c =>
        c.date === data.date
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Create new
      const { data: newCheckIn, error } = await supabase.from('daily_checkins').insert({
        user_id: user.id,
        date: data.date,
        wake_up_time: data.wakeUpTime,
        sleep_time: data.sleepTime,
        phone_usage: data.phoneUsage,
        mood: data.mood,
        energy: data.energy,
        stress: data.stress,
        water_intake: data.waterIntake,
        exercise: data.exercise,
        exercise_duration: data.exerciseDuration,
        notes: data.notes,
      }).select().single();

      if (error || !newCheckIn) {
        console.error('Error creating check-in:', error);
        return;
      }

      setCheckIns(prev => [...prev, {
        id: newCheckIn.id,
        date: newCheckIn.date,
        wakeUpTime: newCheckIn.wake_up_time || '',
        sleepTime: newCheckIn.sleep_time || '',
        phoneUsage: newCheckIn.phone_usage || 0,
        mood: (newCheckIn.mood || 3) as MoodLevel,
        energy: (newCheckIn.energy || 3) as EnergyLevel,
        stress: (newCheckIn.stress || 3) as StressLevel,
        waterIntake: newCheckIn.water_intake || 0,
        exercise: newCheckIn.exercise || false,
        exerciseDuration: newCheckIn.exercise_duration || undefined,
        notes: newCheckIn.notes || undefined,
        createdAt: newCheckIn.created_at,
        updatedAt: newCheckIn.updated_at,
      }]);
    }
  }, [user, checkIns]);

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
        
        let sleepMinutes = (wakeParts[0] * 60 + wakeParts[1]) - (sleepParts[0] * 60 + sleepParts[1]);
        if (sleepMinutes < 0) sleepMinutes += 24 * 60;
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
