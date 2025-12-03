import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '@/types/schedule';
import { format, subDays, differenceInDays, startOfDay } from 'date-fns';

const STREAKS_KEY = 'smart-schedule-streaks';
const ACHIEVEMENTS_KEY = 'smart-schedule-achievements';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'streak' | 'tasks' | 'productivity' | 'category';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalTasksCompleted: number;
  perfectDays: number;
}

const ACHIEVEMENTS_CONFIG: Achievement[] = [
  { id: 'first-task', name: 'First Step', description: 'Complete your first task', icon: '🎯', requirement: 1, type: 'tasks' },
  { id: 'streak-3', name: 'Getting Started', description: '3 day streak', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', icon: '💪', requirement: 7, type: 'streak' },
  { id: 'streak-14', name: 'Consistency King', description: '14 day streak', icon: '👑', requirement: 14, type: 'streak' },
  { id: 'streak-30', name: 'Month Master', description: '30 day streak', icon: '🏆', requirement: 30, type: 'streak' },
  { id: 'tasks-10', name: 'Task Crusher', description: 'Complete 10 tasks', icon: '⚡', requirement: 10, type: 'tasks' },
  { id: 'tasks-50', name: 'Productivity Pro', description: 'Complete 50 tasks', icon: '🚀', requirement: 50, type: 'tasks' },
  { id: 'tasks-100', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', requirement: 100, type: 'tasks' },
  { id: 'perfect-5', name: 'Perfect Five', description: '5 perfect days (100% completion)', icon: '⭐', requirement: 5, type: 'productivity' },
  { id: 'perfect-10', name: 'Perfect Ten', description: '10 perfect days', icon: '🌟', requirement: 10, type: 'productivity' },
];

const getStoredStreaks = (): StreakData => {
  try {
    const stored = localStorage.getItem(STREAKS_KEY);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalTasksCompleted: 0,
      perfectDays: 0,
    };
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalTasksCompleted: 0,
      perfectDays: 0,
    };
  }
};

const getStoredAchievements = (): string[] => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useStreaks = (allTasks: Task[]) => {
  const [streakData, setStreakData] = useState<StreakData>(getStoredStreaks);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(getStoredAchievements);

  const calculateStreakFromTasks = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedDates = new Set<string>();
    
    allTasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'completed-on-time') {
        completedDates.add(task.date);
      }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today or yesterday has activity
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd');
    
    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
      return { currentStreak: 0, lastActiveDate: null };
    }

    // Start from today or yesterday
    if (!completedDates.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days
    while (completedDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }

    const totalCompleted = allTasks.filter(t => 
      t.status === 'completed' || t.status === 'completed-on-time'
    ).length;

    // Calculate perfect days
    const tasksByDate = new Map<string, Task[]>();
    allTasks.forEach(task => {
      const tasks = tasksByDate.get(task.date) || [];
      tasks.push(task);
      tasksByDate.set(task.date, tasks);
    });

    let perfectDays = 0;
    tasksByDate.forEach((tasks) => {
      if (tasks.length > 0) {
        const completedCount = tasks.filter(t => 
          t.status === 'completed' || t.status === 'completed-on-time'
        ).length;
        if (completedCount === tasks.length) {
          perfectDays++;
        }
      }
    });

    return { 
      currentStreak, 
      lastActiveDate: today,
      totalTasksCompleted: totalCompleted,
      perfectDays,
    };
  }, [allTasks]);

  useEffect(() => {
    const calculated = calculateStreakFromTasks();
    setStreakData(prev => {
      const newData = {
        ...prev,
        currentStreak: calculated.currentStreak,
        lastActiveDate: calculated.lastActiveDate,
        totalTasksCompleted: calculated.totalTasksCompleted,
        perfectDays: calculated.perfectDays,
        longestStreak: Math.max(prev.longestStreak, calculated.currentStreak),
      };
      localStorage.setItem(STREAKS_KEY, JSON.stringify(newData));
      return newData;
    });
  }, [calculateStreakFromTasks]);

  // Check for new achievements
  useEffect(() => {
    const newUnlocked: string[] = [...unlockedAchievements];
    let hasNew = false;

    ACHIEVEMENTS_CONFIG.forEach(achievement => {
      if (newUnlocked.includes(achievement.id)) return;

      let shouldUnlock = false;
      switch (achievement.type) {
        case 'streak':
          shouldUnlock = streakData.currentStreak >= achievement.requirement;
          break;
        case 'tasks':
          shouldUnlock = streakData.totalTasksCompleted >= achievement.requirement;
          break;
        case 'productivity':
          shouldUnlock = streakData.perfectDays >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        newUnlocked.push(achievement.id);
        hasNew = true;
      }
    });

    if (hasNew) {
      setUnlockedAchievements(newUnlocked);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newUnlocked));
    }
  }, [streakData, unlockedAchievements]);

  const achievements = useMemo(() => {
    return ACHIEVEMENTS_CONFIG.map(a => ({
      ...a,
      unlockedAt: unlockedAchievements.includes(a.id) ? new Date().toISOString() : undefined,
    }));
  }, [unlockedAchievements]);

  return {
    streakData,
    achievements,
    unlockedCount: unlockedAchievements.length,
    totalAchievements: ACHIEVEMENTS_CONFIG.length,
  };
};
