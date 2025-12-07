import { useMemo } from 'react';
import { useLifeTracking } from './useLifeTracking';
import { useSchedule } from './useSchedule';
import { useHabits } from './useHabits';
import { useFocusTimer } from './useFocusTimer';
import { format, subDays, parseISO } from 'date-fns';
import { Task } from '@/types/schedule';

export interface CorrelationInsight {
  title: string;
  description: string;
  correlation: number; // -1 to 1
  impact: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface ProductivityPattern {
  bestHour: number;
  bestDay: string;
  averageTasksPerDay: number;
  focusTimePerDay: number;
}

export interface InsightsData {
  correlations: CorrelationInsight[];
  patterns: ProductivityPattern;
  recommendations: string[];
  weeklyComparison: {
    tasksThisWeek: number;
    tasksLastWeek: number;
    percentChange: number;
  };
}

export const useProductivityInsights = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { checkIns, getWeeklyStats } = useLifeTracking();
  const { allTasks } = useSchedule(today);
  const { habits, logs: habitLogs } = useHabits();
  const { sessions } = useFocusTimer();

  const insights = useMemo((): InsightsData => {
    // Build correlations
    const correlations: CorrelationInsight[] = [];
    const weeklyStats = getWeeklyStats();

    // Sleep vs Productivity correlation
    if (checkIns.length >= 3) {
      const sleepProductivityData = checkIns.slice(-14).map(checkIn => {
        const dayTasks = allTasks.filter(t => t.date === checkIn.date);
        const completedRatio = dayTasks.length > 0 
          ? dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length / dayTasks.length 
          : 0;
        
        // Calculate sleep hours
        const sleepParts = checkIn.sleepTime?.split(':').map(Number) || [23, 0];
        const wakeParts = checkIn.wakeUpTime?.split(':').map(Number) || [7, 0];
        let sleepHours = (wakeParts[0] + wakeParts[1]/60) - (sleepParts[0] + sleepParts[1]/60);
        if (sleepHours < 0) sleepHours += 24;
        
        return { sleep: sleepHours, productivity: completedRatio };
      });

      const avgSleepHigh = sleepProductivityData.filter(d => d.sleep >= 7).reduce((s, d) => s + d.productivity, 0) / 
        Math.max(1, sleepProductivityData.filter(d => d.sleep >= 7).length);
      const avgSleepLow = sleepProductivityData.filter(d => d.sleep < 7).reduce((s, d) => s + d.productivity, 0) / 
        Math.max(1, sleepProductivityData.filter(d => d.sleep < 7).length);
      
      const sleepCorrelation = avgSleepHigh - avgSleepLow;
      
      correlations.push({
        title: 'Sleep → Productivity',
        description: sleepCorrelation > 0.1 
          ? `You're ${Math.round(sleepCorrelation * 100)}% more productive with 7+ hours of sleep`
          : 'Sleep patterns show minimal impact on productivity',
        correlation: sleepCorrelation,
        impact: sleepCorrelation > 0.1 ? 'positive' : 'neutral',
        icon: '😴',
      });
    }

    // Mood vs Task Completion
    if (checkIns.length >= 3) {
      const moodTaskData = checkIns.slice(-14).map(checkIn => {
        const dayTasks = allTasks.filter(t => t.date === checkIn.date);
        const completedCount = dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
        return { mood: checkIn.mood, completed: completedCount };
      });

      const highMoodCompletion = moodTaskData.filter(d => d.mood >= 4).reduce((s, d) => s + d.completed, 0) /
        Math.max(1, moodTaskData.filter(d => d.mood >= 4).length);
      const lowMoodCompletion = moodTaskData.filter(d => d.mood < 4).reduce((s, d) => s + d.completed, 0) /
        Math.max(1, moodTaskData.filter(d => d.mood < 4).length);
      
      const moodCorrelation = (highMoodCompletion - lowMoodCompletion) / Math.max(1, highMoodCompletion);

      correlations.push({
        title: 'Mood → Tasks',
        description: moodCorrelation > 0.15 
          ? `Good mood days = ${Math.round((highMoodCompletion - lowMoodCompletion))} more tasks completed`
          : 'Mood has balanced impact on task completion',
        correlation: moodCorrelation,
        impact: moodCorrelation > 0.1 ? 'positive' : 'neutral',
        icon: '😊',
      });
    }

    // Exercise vs Energy
    if (checkIns.length >= 3) {
      const exerciseData = checkIns.slice(-14);
      const exerciseDays = exerciseData.filter(c => c.exercise);
      const nonExerciseDays = exerciseData.filter(c => !c.exercise);
      
      const avgEnergyExercise = exerciseDays.length > 0 
        ? exerciseDays.reduce((s, c) => s + c.energy, 0) / exerciseDays.length 
        : 0;
      const avgEnergyNonExercise = nonExerciseDays.length > 0 
        ? nonExerciseDays.reduce((s, c) => s + c.energy, 0) / nonExerciseDays.length 
        : 0;
      
      const exerciseCorrelation = (avgEnergyExercise - avgEnergyNonExercise) / 5;

      correlations.push({
        title: 'Exercise → Energy',
        description: exerciseCorrelation > 0.1 
          ? `Exercise days boost your energy by ${Math.round((avgEnergyExercise - avgEnergyNonExercise) * 20)}%`
          : 'Exercise shows consistent energy benefits',
        correlation: exerciseCorrelation,
        impact: exerciseCorrelation > 0.05 ? 'positive' : 'neutral',
        icon: '💪',
      });
    }

    // Phone usage vs Stress
    if (checkIns.length >= 3) {
      const phoneData = checkIns.slice(-14);
      const highPhone = phoneData.filter(c => c.phoneUsage >= 180); // 3+ hours
      const lowPhone = phoneData.filter(c => c.phoneUsage < 180);
      
      const avgStressHigh = highPhone.length > 0 
        ? highPhone.reduce((s, c) => s + c.stress, 0) / highPhone.length 
        : 0;
      const avgStressLow = lowPhone.length > 0 
        ? lowPhone.reduce((s, c) => s + c.stress, 0) / lowPhone.length 
        : 0;
      
      const phoneCorrelation = (avgStressHigh - avgStressLow) / 5;

      correlations.push({
        title: 'Screen Time → Stress',
        description: phoneCorrelation > 0.1 
          ? `3+ hours screen time increases stress by ${Math.round(phoneCorrelation * 100)}%`
          : 'Screen time has minimal stress impact',
        correlation: -phoneCorrelation,
        impact: phoneCorrelation > 0.1 ? 'negative' : 'neutral',
        icon: '📱',
      });
    }

    // Calculate productivity patterns
    const tasksByHour: Record<number, number> = {};
    const tasksByDay: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    allTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').forEach(task => {
      const hour = parseInt(task.startTime.split(':')[0], 10);
      tasksByHour[hour] = (tasksByHour[hour] || 0) + 1;
      
      const dayOfWeek = dayNames[parseISO(task.date).getDay()];
      tasksByDay[dayOfWeek] = (tasksByDay[dayOfWeek] || 0) + 1;
    });

    const bestHour = Object.entries(tasksByHour).sort((a, b) => b[1] - a[1])[0]?.[0] || '9';
    const bestDay = Object.entries(tasksByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

    // Weekly comparison
    const thisWeekStart = subDays(new Date(), 7);
    const lastWeekStart = subDays(new Date(), 14);
    
    const tasksThisWeek = allTasks.filter(t => {
      const date = parseISO(t.date);
      return date >= thisWeekStart;
    }).length;
    
    const tasksLastWeek = allTasks.filter(t => {
      const date = parseISO(t.date);
      return date >= lastWeekStart && date < thisWeekStart;
    }).length;

    const percentChange = tasksLastWeek > 0 
      ? Math.round(((tasksThisWeek - tasksLastWeek) / tasksLastWeek) * 100)
      : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (weeklyStats.averageSleep < 7) {
      recommendations.push('Aim for 7-8 hours of sleep to boost productivity');
    }
    if (weeklyStats.averagePhoneUsage > 180) {
      recommendations.push('Reduce screen time to lower stress levels');
    }
    if (weeklyStats.exerciseDays < 3) {
      recommendations.push('Add more exercise days for better energy');
    }
    if (parseInt(bestHour, 10) < 12) {
      recommendations.push(`Schedule important tasks around ${bestHour}:00 for peak performance`);
    }

    return {
      correlations,
      patterns: {
        bestHour: parseInt(bestHour, 10),
        bestDay,
        averageTasksPerDay: Math.round(allTasks.length / 7),
        focusTimePerDay: Math.round(sessions.reduce((s, sess) => s + sess.duration, 0) / 7),
      },
      recommendations: recommendations.slice(0, 4),
      weeklyComparison: {
        tasksThisWeek,
        tasksLastWeek,
        percentChange,
      },
    };
  }, [checkIns, allTasks, habits, habitLogs, sessions, getWeeklyStats]);

  return insights;
};
