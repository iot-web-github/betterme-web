import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/schedule';
import { format, subDays } from 'date-fns';

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

export const useStreaks = (allTasks: Task[]) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalTasksCompleted: 0,
    perfectDays: 0,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch streaks and achievements from Supabase
  useEffect(() => {
    if (!user) {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        totalTasksCompleted: 0,
        perfectDays: 0,
      });
      setUnlockedAchievements([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      
      const [streaksResult, achievementsResult] = await Promise.all([
        supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
      ]);

      if (streaksResult.data) {
        setStreakData({
          currentStreak: streaksResult.data.current_streak || 0,
          longestStreak: streaksResult.data.longest_streak || 0,
          lastActiveDate: streaksResult.data.last_active_date,
          totalTasksCompleted: streaksResult.data.total_tasks_completed || 0,
          perfectDays: streaksResult.data.perfect_days || 0,
        });
      }

      if (achievementsResult.data) {
        setUnlockedAchievements(achievementsResult.data.map(a => a.achievement_id));
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

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
    
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd');
    
    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
      return { currentStreak: 0, lastActiveDate: null, totalTasksCompleted: 0, perfectDays: 0 };
    }

    if (!completedDates.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    while (completedDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }

    const totalCompleted = allTasks.filter(t => 
      t.status === 'completed' || t.status === 'completed-on-time'
    ).length;

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

  // Update streaks when tasks change
  useEffect(() => {
    if (!user || isLoading) return;

    const calculated = calculateStreakFromTasks();
    const newData = {
      currentStreak: calculated.currentStreak,
      lastActiveDate: calculated.lastActiveDate,
      totalTasksCompleted: calculated.totalTasksCompleted,
      perfectDays: calculated.perfectDays,
      longestStreak: Math.max(streakData.longestStreak, calculated.currentStreak),
    };

    // Only update if changed
    if (
      newData.currentStreak !== streakData.currentStreak ||
      newData.totalTasksCompleted !== streakData.totalTasksCompleted ||
      newData.perfectDays !== streakData.perfectDays
    ) {
      setStreakData(newData);

      // Sync to Supabase
      supabase.from('user_streaks').upsert({
        user_id: user.id,
        current_streak: newData.currentStreak,
        longest_streak: newData.longestStreak,
        last_active_date: newData.lastActiveDate,
        total_tasks_completed: newData.totalTasksCompleted,
        perfect_days: newData.perfectDays,
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) console.error('Error syncing streaks:', error);
      });
    }
  }, [user, allTasks, calculateStreakFromTasks, isLoading]);

  // Check for new achievements
  useEffect(() => {
    if (!user || isLoading) return;

    const checkAchievements = async () => {
      const newUnlocked: string[] = [];

      for (const achievement of ACHIEVEMENTS_CONFIG) {
        if (unlockedAchievements.includes(achievement.id)) continue;

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
        }
      }

      if (newUnlocked.length > 0) {
        // Insert new achievements
        const inserts = newUnlocked.map(id => ({
          user_id: user.id,
          achievement_id: id,
        }));

        const { error } = await supabase.from('user_achievements').insert(inserts);
        
        if (!error) {
          setUnlockedAchievements(prev => [...prev, ...newUnlocked]);
        }
      }
    };

    checkAchievements();
  }, [user, streakData, unlockedAchievements, isLoading]);

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
