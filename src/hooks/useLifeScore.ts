import { useMemo } from 'react';
import { useLifeTracking } from './useLifeTracking';
import { useHabits } from './useHabits';
import { useSchedule } from './useSchedule';
import { format } from 'date-fns';

export interface LifeScoreBreakdown {
  sleep: number;
  mood: number;
  productivity: number;
  habits: number;
  exercise: number;
  hydration: number;
}

export interface LifeScoreData {
  totalScore: number;
  breakdown: LifeScoreBreakdown;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

export const useLifeScore = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { getWeeklyStats, getCheckInForDate, checkIns } = useLifeTracking();
  const { getTodayProgress, habits } = useHabits();
  const { dailyStats, tasks } = useSchedule(today);

  const lifeScoreData = useMemo((): LifeScoreData => {
    const weeklyStats = getWeeklyStats();
    const todayCheckIn = getCheckInForDate(today);
    const habitProgress = getTodayProgress();

    // Calculate component scores (0-100 each)
    const sleepScore = Math.min(100, (weeklyStats.averageSleep / 8) * 100);
    const moodScore = (weeklyStats.averageMood / 5) * 100;
    
    // Productivity from task completion
    const productivityScore = dailyStats.totalTasks > 0 
      ? (dailyStats.completedTasks / dailyStats.totalTasks) * 100 
      : 50;
    
    // Habits completion rate
    const habitsScore = habits.length > 0 
      ? (habitProgress.completed / habitProgress.total) * 100 
      : 50;
    
    // Exercise (weekly)
    const exerciseScore = (weeklyStats.exerciseDays / 4) * 100; // Target: 4 days/week
    
    // Hydration (8 glasses target)
    const hydrationScore = Math.min(100, (weeklyStats.waterAverage / 8) * 100);

    // Weighted total (weights add up to 1)
    const weights = {
      sleep: 0.20,
      mood: 0.20,
      productivity: 0.25,
      habits: 0.15,
      exercise: 0.10,
      hydration: 0.10,
    };

    const totalScore = Math.round(
      sleepScore * weights.sleep +
      moodScore * weights.mood +
      productivityScore * weights.productivity +
      habitsScore * weights.habits +
      exerciseScore * weights.exercise +
      hydrationScore * weights.hydration
    );

    // Calculate trend based on recent check-ins
    const recentCheckIns = checkIns.slice(-7);
    const olderCheckIns = checkIns.slice(-14, -7);
    
    const recentAvgMood = recentCheckIns.length > 0 
      ? recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length 
      : 0;
    const olderAvgMood = olderCheckIns.length > 0 
      ? olderCheckIns.reduce((sum, c) => sum + c.mood, 0) / olderCheckIns.length 
      : recentAvgMood;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvgMood > olderAvgMood + 0.3) trend = 'up';
    else if (recentAvgMood < olderAvgMood - 0.3) trend = 'down';

    // Generate insights
    const insights: string[] = [];
    
    if (sleepScore < 60) {
      insights.push('Try getting 7-8 hours of sleep for better energy');
    }
    if (hydrationScore < 60) {
      insights.push('Increase water intake to stay hydrated');
    }
    if (exerciseScore < 50) {
      insights.push('Add more exercise days for improved mood');
    }
    if (productivityScore > 80) {
      insights.push('Great productivity! Keep up the momentum');
    }
    if (habitsScore > 80) {
      insights.push('Excellent habit consistency this week!');
    }
    if (moodScore > 80) {
      insights.push('Your mood has been fantastic lately');
    }

    return {
      totalScore,
      breakdown: {
        sleep: Math.round(sleepScore),
        mood: Math.round(moodScore),
        productivity: Math.round(productivityScore),
        habits: Math.round(habitsScore),
        exercise: Math.round(exerciseScore),
        hydration: Math.round(hydrationScore),
      },
      trend,
      insights: insights.slice(0, 3),
    };
  }, [getWeeklyStats, getCheckInForDate, getTodayProgress, dailyStats, habits, checkIns, today]);

  return lifeScoreData;
};
