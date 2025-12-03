import { useState, useEffect, useCallback } from 'react';
import { Task, DailyStats, TaskCategory, TaskStatus } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'smart-schedule-tasks';

const getStoredTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const useSchedule = (selectedDate: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTasks = getStoredTasks();
    setTasks(storedTasks);
    setIsLoading(false);
  }, []);

  const tasksForDate = tasks.filter(task => task.date === selectedDate);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(prev => {
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
    
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );
      saveTasks(updated);
      return updated;
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, notes?: string) => {
    updateTask(taskId, { status, notes: notes || undefined });
  }, [updateTask]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const updated = prev.filter(task => task.id !== taskId);
      saveTasks(updated);
      return updated;
    });
  }, []);

  const calculateDailyStats = useCallback((): DailyStats => {
    const dayTasks = tasksForDate;
    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
    const completedOnTime = dayTasks.filter(t => t.status === 'completed-on-time').length;
    const missedTasks = dayTasks.filter(t => t.status === 'missed').length;
    const rescheduledTasks = dayTasks.filter(t => t.status === 'rescheduled').length;

    const productivityScore = totalTasks > 0
      ? Math.round(((completedOnTime * 1.2 + (completedTasks - completedOnTime) * 0.8) / totalTasks) * 100)
      : 0;

    const timeByCategory = dayTasks.reduce((acc, task) => {
      const [startH, startM] = task.startTime.split(':').map(Number);
      const [endH, endM] = task.endTime.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);
      acc[task.category] = (acc[task.category] || 0) + Math.max(0, duration);
      return acc;
    }, {} as Record<TaskCategory, number>);

    return {
      totalTasks,
      completedTasks,
      completedOnTime,
      missedTasks,
      rescheduledTasks,
      productivityScore: Math.min(100, Math.max(0, productivityScore)),
      timeByCategory,
    };
  }, [tasksForDate]);

  return {
    tasks: tasksForDate,
    allTasks: tasks,
    isLoading,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    dailyStats: calculateDailyStats(),
  };
};
