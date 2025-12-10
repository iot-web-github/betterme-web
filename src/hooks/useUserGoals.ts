import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type GoalType = 'sleep' | 'wake_up' | 'habit' | 'productivity' | 'health' | 'custom';
export type GoalFrequency = 'daily' | 'weekly' | 'monthly';

export interface UserGoal {
  id: string;
  title: string;
  description?: string;
  goalType: GoalType;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  frequency: GoalFrequency;
  startDate: string;
  endDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  date: string;
  value: number;
  notes?: string;
}

export const useUserGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    const fetchGoals = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setGoals(data.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description || undefined,
          goalType: g.goal_type as GoalType,
          targetValue: g.target_value ? Number(g.target_value) : undefined,
          currentValue: Number(g.current_value) || 0,
          unit: g.unit || undefined,
          frequency: g.frequency as GoalFrequency,
          startDate: g.start_date,
          endDate: g.end_date || undefined,
          isCompleted: g.is_completed || false,
          isActive: g.is_active || true,
          createdAt: g.created_at,
          updatedAt: g.updated_at,
        })));
      }
      
      setIsLoading(false);
    };

    fetchGoals();
  }, [user]);

  const createGoal = useCallback(async (goalData: {
    title: string;
    description?: string;
    goalType: GoalType;
    targetValue?: number;
    unit?: string;
    frequency: GoalFrequency;
    endDate?: string;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: user.id,
        title: goalData.title,
        description: goalData.description,
        goal_type: goalData.goalType,
        target_value: goalData.targetValue,
        unit: goalData.unit,
        frequency: goalData.frequency,
        end_date: goalData.endDate,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating goal:', error);
      return null;
    }

    const newGoal: UserGoal = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      goalType: data.goal_type as GoalType,
      targetValue: data.target_value ? Number(data.target_value) : undefined,
      currentValue: Number(data.current_value) || 0,
      unit: data.unit || undefined,
      frequency: data.frequency as GoalFrequency,
      startDate: data.start_date,
      endDate: data.end_date || undefined,
      isCompleted: data.is_completed || false,
      isActive: data.is_active || true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  }, [user]);

  const updateGoalProgress = useCallback(async (goalId: string, value: number) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newValue = goal.currentValue + value;
    const isCompleted = goal.targetValue ? newValue >= goal.targetValue : false;

    const { error } = await supabase
      .from('user_goals')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
      })
      .eq('id', goalId);

    if (error) {
      console.error('Error updating goal:', error);
      return;
    }

    // Log progress
    await supabase.from('goal_progress').insert({
      user_id: user.id,
      goal_id: goalId,
      date: new Date().toISOString().split('T')[0],
      value,
    });

    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, currentValue: newValue, isCompleted }
        : g
    ));
  }, [user, goals]);

  const deleteGoal = useCallback(async (goalId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      return;
    }

    setGoals(prev => prev.filter(g => g.id !== goalId));
  }, [user]);

  const toggleGoalActive = useCallback(async (goalId: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const { error } = await supabase
      .from('user_goals')
      .update({ is_active: !goal.isActive })
      .eq('id', goalId);

    if (error) {
      console.error('Error toggling goal:', error);
      return;
    }

    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, isActive: !g.isActive } : g
    ));
  }, [user, goals]);

  const activeGoals = goals.filter(g => g.isActive && !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    toggleGoalActive,
  };
};
