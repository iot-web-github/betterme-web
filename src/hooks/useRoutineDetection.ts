import { useMemo } from 'react';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { format, parseISO, differenceInMinutes, subDays } from 'date-fns';

export type PersonType = 'morning' | 'night' | 'balanced';

export interface RoutineInsights {
  personType: PersonType;
  averageWakeTime: string;
  averageSleepTime: string;
  averageSleepDuration: number;
  wakeTimeConsistency: number; // 0-100
  sleepTimeConsistency: number; // 0-100
  recommendedMorningPromptTime: string;
  recommendedNightPromptTime: string;
  totalCheckIns: number;
}

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
  let adjustedMinutes = minutes;
  if (adjustedMinutes < 0) adjustedMinutes += 24 * 60;
  if (adjustedMinutes >= 24 * 60) adjustedMinutes -= 24 * 60;
  
  const h = Math.floor(adjustedMinutes / 60);
  const m = adjustedMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
};

export const useRoutineDetection = (): RoutineInsights => {
  const { checkIns } = useLifeTracking();

  return useMemo(() => {
    // Get last 14 days of check-ins for better pattern detection
    const recentCheckIns = checkIns
      .filter(c => c.wakeUpTime && c.sleepTime)
      .slice(0, 14);

    if (recentCheckIns.length === 0) {
      return {
        personType: 'balanced',
        averageWakeTime: '07:00',
        averageSleepTime: '23:00',
        averageSleepDuration: 8,
        wakeTimeConsistency: 0,
        sleepTimeConsistency: 0,
        recommendedMorningPromptTime: '07:30',
        recommendedNightPromptTime: '21:30',
        totalCheckIns: 0,
      };
    }

    // Calculate average times
    const wakeTimes = recentCheckIns.map(c => timeToMinutes(c.wakeUpTime));
    const sleepTimes = recentCheckIns.map(c => {
      let minutes = timeToMinutes(c.sleepTime);
      // Adjust for times after midnight (e.g., 01:00 = 25:00 for calculation)
      if (minutes < 360) minutes += 24 * 60;
      return minutes;
    });

    const avgWakeMinutes = Math.round(wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length);
    const avgSleepMinutes = Math.round(sleepTimes.reduce((a, b) => a + b, 0) / sleepTimes.length);

    // Calculate sleep duration
    const sleepDurations = recentCheckIns.map(c => {
      let sleepMins = timeToMinutes(c.sleepTime);
      let wakeMins = timeToMinutes(c.wakeUpTime);
      if (sleepMins > wakeMins) {
        wakeMins += 24 * 60;
      }
      return (wakeMins - sleepMins) / 60;
    });
    const avgSleepDuration = Math.round(sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length * 10) / 10;

    // Calculate consistency (lower std dev = higher consistency)
    const wakeStdDev = calculateStandardDeviation(wakeTimes);
    const sleepStdDev = calculateStandardDeviation(sleepTimes);
    
    // Convert std dev to 0-100 score (60 min std dev = 0, 0 min = 100)
    const wakeTimeConsistency = Math.max(0, Math.min(100, Math.round(100 - (wakeStdDev / 60) * 100)));
    const sleepTimeConsistency = Math.max(0, Math.min(100, Math.round(100 - (sleepStdDev / 60) * 100)));

    // Determine person type based on wake time
    let personType: PersonType;
    if (avgWakeMinutes < 6 * 60) { // Before 6 AM
      personType = 'morning';
    } else if (avgWakeMinutes > 9 * 60) { // After 9 AM
      personType = 'night';
    } else {
      personType = 'balanced';
    }

    // Calculate recommended prompt times
    const recommendedMorningPromptTime = minutesToTime(avgWakeMinutes + 30); // 30 min after wake
    const recommendedNightPromptTime = minutesToTime(avgSleepMinutes - 90); // 90 min before sleep

    return {
      personType,
      averageWakeTime: minutesToTime(avgWakeMinutes),
      averageSleepTime: minutesToTime(avgSleepMinutes % (24 * 60)),
      averageSleepDuration: avgSleepDuration,
      wakeTimeConsistency,
      sleepTimeConsistency,
      recommendedMorningPromptTime,
      recommendedNightPromptTime,
      totalCheckIns: recentCheckIns.length,
    };
  }, [checkIns]);
};
