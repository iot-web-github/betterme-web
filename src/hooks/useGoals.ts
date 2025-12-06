import { useState, useEffect, useCallback } from 'react';
import { Goal, TaskCategory } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

const STORAGE_KEY = 'smart-schedule-goals';

const getStoredGoals = (): Goal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setGoals(getStoredGoals());
  }, []);

  const addGoal = useCallback((goalData: {
    title: string;
    description?: string;
    targetCount: number;
    type: 'weekly' | 'monthly';
    category?: TaskCategory;
  }) => {
    const now = new Date();
    const startDate = goalData.type === 'weekly' 
      ? format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      : format(startOfMonth(now), 'yyyy-MM-dd');
    const endDate = goalData.type === 'weekly'
      ? format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      : format(endOfMonth(now), 'yyyy-MM-dd');

    const newGoal: Goal = {
      id: uuidv4(),
      ...goalData,
      currentCount: 0,
      startDate,
      endDate,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setGoals(prev => {
      const updated = [...prev, newGoal];
      saveGoals(updated);
      return updated;
    });

    return newGoal;
  }, []);

  const updateGoalProgress = useCallback((goalId: string, increment: number = 1) => {
    setGoals(prev => {
      const updated = prev.map(goal => {
        if (goal.id === goalId) {
          const newCount = Math.min(goal.currentCount + increment, goal.targetCount);
          return {
            ...goal,
            currentCount: newCount,
            isCompleted: newCount >= goal.targetCount,
          };
        }
        return goal;
      });
      saveGoals(updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== goalId);
      saveGoals(updated);
      return updated;
    });
  }, []);

  const activeGoals = goals.filter(g => !g.isCompleted && new Date(g.endDate) >= new Date());
  const completedGoals = goals.filter(g => g.isCompleted);

  return {
    goals,
    activeGoals,
    completedGoals,
    addGoal,
    updateGoalProgress,
    deleteGoal,
  };
};
