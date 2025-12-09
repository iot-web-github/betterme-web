import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO } from 'date-fns';

export interface EnergyLog {
  id: string;
  date: string;
  time: string;
  level: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string;
}

export const useEnergyTracker = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EnergyLog[]>([]);
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
        .from('energy_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (data && !error) {
        setLogs(data.map(l => ({
          id: l.id,
          date: l.date,
          time: l.time,
          level: l.level as 1 | 2 | 3 | 4 | 5,
          note: l.note || undefined,
          createdAt: l.created_at,
        })));
      }
      
      setIsLoading(false);
    };

    fetchLogs();
  }, [user]);

  const addLog = useCallback(async (data: {
    level: 1 | 2 | 3 | 4 | 5;
    note?: string;
    date?: string;
    time?: string;
  }): Promise<EnergyLog | null> => {
    if (!user) return null;

    const now = new Date();
    const logDate = data.date || format(now, 'yyyy-MM-dd');
    const logTime = data.time || format(now, 'HH:mm');

    const { data: newLog, error } = await supabase.from('energy_logs').insert({
      user_id: user.id,
      date: logDate,
      time: logTime,
      level: data.level,
      note: data.note || null,
    }).select().single();

    if (error || !newLog) {
      console.error('Error adding energy log:', error);
      return null;
    }

    const log: EnergyLog = {
      id: newLog.id,
      date: newLog.date,
      time: newLog.time,
      level: newLog.level as 1 | 2 | 3 | 4 | 5,
      note: newLog.note || undefined,
      createdAt: newLog.created_at,
    };

    setLogs(prev => [log, ...prev]);
    return log;
  }, [user]);

  const deleteLog = useCallback(async (logId: string) => {
    if (!user) return;

    const { error } = await supabase.from('energy_logs').delete().eq('id', logId);
    
    if (error) {
      console.error('Error deleting energy log:', error);
      return;
    }

    setLogs(prev => prev.filter(l => l.id !== logId));
  }, [user]);

  const getLogsForDate = useCallback((date: string): EnergyLog[] => {
    return logs.filter(l => l.date === date).sort((a, b) => 
      a.time.localeCompare(b.time)
    );
  }, [logs]);

  const getAverageForDate = useCallback((date: string): number => {
    const dayLogs = logs.filter(l => l.date === date);
    if (dayLogs.length === 0) return 0;
    return dayLogs.reduce((sum, l) => sum + l.level, 0) / dayLogs.length;
  }, [logs]);

  const getWeeklyTrend = useCallback((): { date: string; average: number }[] => {
    const today = new Date();
    const result: { date: string; average: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      result.push({
        date,
        average: getAverageForDate(date),
      });
    }

    return result;
  }, [getAverageForDate]);

  const getPeakEnergyTime = useCallback((): string | null => {
    if (logs.length === 0) return null;

    const hourlyAverage: { [hour: string]: { sum: number; count: number } } = {};
    
    logs.forEach(log => {
      const hour = log.time.split(':')[0];
      if (!hourlyAverage[hour]) {
        hourlyAverage[hour] = { sum: 0, count: 0 };
      }
      hourlyAverage[hour].sum += log.level;
      hourlyAverage[hour].count++;
    });

    let peakHour = '';
    let maxAverage = 0;

    Object.entries(hourlyAverage).forEach(([hour, data]) => {
      const avg = data.sum / data.count;
      if (avg > maxAverage) {
        maxAverage = avg;
        peakHour = hour;
      }
    });

    return peakHour ? `${peakHour}:00` : null;
  }, [logs]);

  const getWeeklyAverage = useCallback((): number => {
    const today = new Date();
    const weekLogs = logs.filter(l => {
      const logDate = parseISO(l.date);
      return logDate >= subDays(today, 7) && logDate <= today;
    });

    if (weekLogs.length === 0) return 0;
    return weekLogs.reduce((sum, l) => sum + l.level, 0) / weekLogs.length;
  }, [logs]);

  return {
    logs,
    isLoading,
    addLog,
    deleteLog,
    getLogsForDate,
    getAverageForDate,
    getWeeklyTrend,
    getPeakEnergyTime,
    getWeeklyAverage,
  };
};
