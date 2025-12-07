import { Task, DailyCheckIn, Habit, HabitLog, Goal, FocusSession } from '@/types/schedule';
import { format } from 'date-fns';

interface ExportData {
  exportDate: string;
  tasks: Task[];
  checkIns: DailyCheckIn[];
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  focusSessions: FocusSession[];
}

export const exportToJSON = (data: Partial<ExportData>): void => {
  const exportData = {
    ...data,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `smart-schedule-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: Task[]): void => {
  const headers = ['Date', 'Title', 'Category', 'Priority', 'Status', 'Start Time', 'End Time', 'Description'];
  
  const rows = data.map(task => [
    task.date,
    `"${task.title.replace(/"/g, '""')}"`,
    task.category,
    task.priority,
    task.status,
    task.startTime,
    task.endTime,
    `"${(task.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `smart-schedule-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCheckInsToCSV = (data: DailyCheckIn[]): void => {
  const headers = ['Date', 'Wake Up', 'Sleep Time', 'Mood', 'Energy', 'Stress', 'Water', 'Exercise', 'Phone Usage', 'Notes'];
  
  const rows = data.map(checkIn => [
    checkIn.date,
    checkIn.wakeUpTime,
    checkIn.sleepTime,
    checkIn.mood,
    checkIn.energy,
    checkIn.stress,
    checkIn.waterIntake,
    checkIn.exercise ? 'Yes' : 'No',
    checkIn.phoneUsage,
    `"${(checkIn.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `smart-schedule-checkins-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import function
export const importFromJSON = async (file: File): Promise<Partial<ExportData> | null> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return data as Partial<ExportData>;
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
};
