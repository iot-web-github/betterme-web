import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, DailyStats, TaskCategory, TaskStatus } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, addDays, addWeeks, addMonths, isBefore, isAfter, format, getDay } from 'date-fns';

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

// Generate recurring task instances
const generateRecurringInstances = (tasks: Task[], targetDate: string): Task[] => {
  const targetDateObj = parseISO(targetDate);
  const generatedTasks: Task[] = [];

  tasks.forEach(task => {
    if (!task.recurrence || task.recurrence.type === 'none' || task.parentTaskId) return;

    const taskDate = parseISO(task.date);
    
    // Only generate for future dates from the original task
    if (isAfter(taskDate, targetDateObj)) return;
    if (task.date === targetDate) return; // Original task, don't duplicate

    // Check if past end date
    if (task.recurrence.endDate && isAfter(targetDateObj, parseISO(task.recurrence.endDate))) return;

    // Check if instance already exists for this date
    const existingInstance = tasks.find(
      t => t.parentTaskId === task.id && t.date === targetDate
    );
    if (existingInstance) return;

    // Check if this date matches the recurrence pattern
    let matches = false;
    const interval = task.recurrence.interval || 1;

    switch (task.recurrence.type) {
      case 'daily': {
        const daysDiff = Math.floor((targetDateObj.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
        matches = daysDiff > 0 && daysDiff % interval === 0;
        break;
      }
      case 'weekly': {
        const dayOfWeek = getDay(targetDateObj);
        const weeksDiff = Math.floor((targetDateObj.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0) {
          matches = task.recurrence.daysOfWeek.includes(dayOfWeek) && weeksDiff >= 0 && weeksDiff % interval === 0;
        } else {
          matches = dayOfWeek === getDay(taskDate) && weeksDiff > 0 && weeksDiff % interval === 0;
        }
        break;
      }
      case 'monthly': {
        const sameDay = targetDateObj.getDate() === taskDate.getDate();
        const monthsDiff = (targetDateObj.getFullYear() - taskDate.getFullYear()) * 12 + 
                          (targetDateObj.getMonth() - taskDate.getMonth());
        matches = sameDay && monthsDiff > 0 && monthsDiff % interval === 0;
        break;
      }
    }

    if (matches) {
      generatedTasks.push({
        ...task,
        id: uuidv4(),
        date: targetDate,
        status: 'pending',
        parentTaskId: task.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return generatedTasks;
};

export const useSchedule = (selectedDate: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTasks = getStoredTasks();
    setTasks(storedTasks);
    setIsLoading(false);
  }, []);

  // Generate recurring instances and persist them
  useEffect(() => {
    if (isLoading || !selectedDate) return;

    const recurringInstances = generateRecurringInstances(tasks, selectedDate);
    
    if (recurringInstances.length > 0) {
      setTasks(prev => {
        const updated = [...prev, ...recurringInstances];
        saveTasks(updated);
        return updated;
      });
    }
  }, [selectedDate, isLoading]);

  const tasksForDate = useMemo(() => 
    tasks.filter(task => task.date === selectedDate),
    [tasks, selectedDate]
  );

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
      // Also delete child recurring instances
      const updated = prev.filter(task => task.id !== taskId && task.parentTaskId !== taskId);
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
