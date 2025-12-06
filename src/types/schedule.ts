export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'social' | 'other';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'completed-on-time' | 'missed' | 'rescheduled';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TaskRecurrence {
  type: RecurrenceType;
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: which days (0-6)
  endDate?: string; // Optional end date YYYY-MM-DD
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD format
  notes?: string;
  isFromTemplate?: boolean;
  templateId?: string;
  recurrence?: TaskRecurrence;
  parentTaskId?: string; // For tracking recurring task instances
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleTemplate {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: TaskCategory;
  priority: TaskPriority;
  description?: string;
  isActive: boolean;
  daysOfWeek: number[]; // 0-6, Sunday-Saturday
}

export interface DailyStats {
  totalTasks: number;
  completedTasks: number;
  completedOnTime: number;
  missedTasks: number;
  rescheduledTasks: number;
  productivityScore: number;
  timeByCategory: Record<TaskCategory, number>; // minutes
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetCount: number;
  currentCount: number;
  type: 'weekly' | 'monthly';
  category?: TaskCategory;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  duration: number; // minutes
  completedAt: string;
  type: 'focus' | 'break';
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health & Fitness',
  learning: 'Learning',
  social: 'Social',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work: '💼',
  personal: '🏠',
  health: '💪',
  learning: '📚',
  social: '👥',
  other: '📌',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  'completed-on-time': 'On-Time',
  missed: 'Missed',
  rescheduled: 'Rescheduled',
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};
