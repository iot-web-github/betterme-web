import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  completed_at?: string;
  created_at: string;
}

export const useScheduleDB = (selectedDate: Date = new Date()) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasksForDate = useMemo(() => {
    return tasks.filter(task => task.scheduled_date === dateString);
  }, [tasks, dateString]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data]);
      toast({ title: 'Task added' });
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({ title: 'Failed to add task', variant: 'destructive' });
      return null;
    }
  }, [user, toast]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: 'Failed to update task', variant: 'destructive' });
    }
  }, [user, toast]);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    const updates: Partial<Task> = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateTask(taskId, updates);
  }, [updateTask]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: 'Task deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({ title: 'Failed to delete task', variant: 'destructive' });
    }
  }, [user, toast]);

  const calculateDailyStats = useCallback(() => {
    const dayTasks = tasksForDate;
    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const total = dayTasks.length;
    return {
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasksForDate]);

  return {
    tasks,
    tasksForDate,
    isLoading,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    calculateDailyStats,
    refetch: fetchTasks
  };
};
