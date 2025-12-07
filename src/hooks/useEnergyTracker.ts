import { useState, useEffect, useCallback } from 'react';
import { EnergyLog } from '@/types/tools';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, parseISO } from 'date-fns';

const STORAGE_KEY = 'smart-schedule-energy';

const getStoredLogs = (): EnergyLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs: EnergyLog[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const useEnergyTracker = () => {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLogs(getStoredLogs());
    setIsLoading(false);
  }, []);

  const addLog = useCallback((data: {
    level: 1 | 2 | 3 | 4 | 5;
    note?: string;
    date?: string;
    time?: string;
  }): EnergyLog => {
    const now = new Date();
    const newLog: EnergyLog = {
      id: uuidv4(),
      date: data.date || format(now, 'yyyy-MM-dd'),
      time: data.time || format(now, 'HH:mm'),
      level: data.level,
      note: data.note,
      createdAt: now.toISOString(),
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      saveLogs(updated);
      return updated;
    });

    return newLog;
  }, []);

  const deleteLog = useCallback((logId: string) => {
    setLogs(prev => {
      const updated = prev.filter(l => l.id !== logId);
      saveLogs(updated);
      return updated;
    });
  }, []);

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

    // Group by hour
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
