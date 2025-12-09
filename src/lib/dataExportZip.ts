import JSZip from 'jszip';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface ExportableData {
  tasks: any[];
  goals: any[];
  daily_analytics: any[];
  schedule_blocks: any[];
  timetable_entries: any[];
  ai_chat_history: any[];
  user_preferences: any;
  profile: any;
  habits: any[];
  habit_logs: any[];
  mood_entries: any[];
  daily_checkins: any[];
  energy_logs: any[];
  health_logs: any[];
  notes: any[];
  note_entries: any[];
  user_streaks: any;
  user_achievements: any[];
}

// Fetch all user data from Supabase
export const fetchAllUserData = async (userId: string): Promise<ExportableData> => {
  const [
    tasksResult,
    goalsResult,
    analyticsResult,
    scheduleResult,
    timetableResult,
    chatResult,
    preferencesResult,
    profileResult,
    habitsResult,
    habitLogsResult,
    moodResult,
    checkinsResult,
    energyResult,
    healthResult,
    notesResult,
    noteEntriesResult,
    streaksResult,
    achievementsResult,
  ] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('daily_analytics').select('*').eq('user_id', userId),
    supabase.from('schedule_blocks').select('*').eq('user_id', userId),
    supabase.from('timetable_entries').select('*').eq('user_id', userId),
    supabase.from('ai_chat_history').select('*').eq('user_id', userId),
    supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_logs').select('*').eq('user_id', userId),
    supabase.from('mood_entries').select('*').eq('user_id', userId),
    supabase.from('daily_checkins').select('*').eq('user_id', userId),
    supabase.from('energy_logs').select('*').eq('user_id', userId),
    supabase.from('health_logs').select('*').eq('user_id', userId),
    supabase.from('notes').select('*').eq('user_id', userId),
    supabase.from('note_entries').select('*'),
    supabase.from('user_streaks').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_achievements').select('*').eq('user_id', userId),
  ]);

  // Filter note entries to only include those belonging to user's notes
  const userNoteIds = notesResult.data?.map(n => n.id) || [];
  const userNoteEntries = noteEntriesResult.data?.filter(e => userNoteIds.includes(e.note_id)) || [];

  return {
    tasks: tasksResult.data || [],
    goals: goalsResult.data || [],
    daily_analytics: analyticsResult.data || [],
    schedule_blocks: scheduleResult.data || [],
    timetable_entries: timetableResult.data || [],
    ai_chat_history: chatResult.data || [],
    user_preferences: preferencesResult.data || null,
    profile: profileResult.data || null,
    habits: habitsResult.data || [],
    habit_logs: habitLogsResult.data || [],
    mood_entries: moodResult.data || [],
    daily_checkins: checkinsResult.data || [],
    energy_logs: energyResult.data || [],
    health_logs: healthResult.data || [],
    notes: notesResult.data || [],
    note_entries: userNoteEntries,
    user_streaks: streaksResult.data || null,
    user_achievements: achievementsResult.data || [],
  };
};

// Convert data to CSV format
const toCSV = (data: any[], headers?: string[]): string => {
  if (data.length === 0) return '';
  
  const allHeaders = headers || Object.keys(data[0]);
  const csvRows = [allHeaders.join(',')];
  
  for (const row of data) {
    const values = allHeaders.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val);
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// Create and download ZIP file with all user data
export const exportUserDataAsZip = async (userId: string): Promise<void> => {
  const zip = new JSZip();
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  
  // Fetch all data
  const data = await fetchAllUserData(userId);
  
  // Create data folder
  const dataFolder = zip.folder('data');
  
  // Add JSON and CSV files
  if (dataFolder) {
    // Tasks
    if (data.tasks.length > 0) {
      dataFolder.file('tasks.json', JSON.stringify(data.tasks, null, 2));
      dataFolder.file('tasks.csv', toCSV(data.tasks));
    }
    
    // Goals
    if (data.goals.length > 0) {
      dataFolder.file('goals.json', JSON.stringify(data.goals, null, 2));
      dataFolder.file('goals.csv', toCSV(data.goals));
    }
    
    // Analytics
    if (data.daily_analytics.length > 0) {
      dataFolder.file('daily_analytics.json', JSON.stringify(data.daily_analytics, null, 2));
      dataFolder.file('daily_analytics.csv', toCSV(data.daily_analytics));
    }
    
    // Schedule blocks
    if (data.schedule_blocks.length > 0) {
      dataFolder.file('schedule_blocks.json', JSON.stringify(data.schedule_blocks, null, 2));
      dataFolder.file('schedule_blocks.csv', toCSV(data.schedule_blocks));
    }
    
    // Timetable entries
    if (data.timetable_entries.length > 0) {
      dataFolder.file('timetable_entries.json', JSON.stringify(data.timetable_entries, null, 2));
      dataFolder.file('timetable_entries.csv', toCSV(data.timetable_entries));
    }
    
    // Chat history
    if (data.ai_chat_history.length > 0) {
      dataFolder.file('chat_history.json', JSON.stringify(data.ai_chat_history, null, 2));
    }
    
    // User preferences
    if (data.user_preferences) {
      dataFolder.file('preferences.json', JSON.stringify(data.user_preferences, null, 2));
    }
    
    // Profile
    if (data.profile) {
      dataFolder.file('profile.json', JSON.stringify(data.profile, null, 2));
    }

    // Habits
    if (data.habits.length > 0) {
      dataFolder.file('habits.json', JSON.stringify(data.habits, null, 2));
      dataFolder.file('habits.csv', toCSV(data.habits));
    }

    // Habit logs
    if (data.habit_logs.length > 0) {
      dataFolder.file('habit_logs.json', JSON.stringify(data.habit_logs, null, 2));
      dataFolder.file('habit_logs.csv', toCSV(data.habit_logs));
    }

    // Mood entries
    if (data.mood_entries.length > 0) {
      dataFolder.file('mood_entries.json', JSON.stringify(data.mood_entries, null, 2));
      dataFolder.file('mood_entries.csv', toCSV(data.mood_entries));
    }

    // Daily check-ins
    if (data.daily_checkins.length > 0) {
      dataFolder.file('daily_checkins.json', JSON.stringify(data.daily_checkins, null, 2));
      dataFolder.file('daily_checkins.csv', toCSV(data.daily_checkins));
    }

    // Energy logs
    if (data.energy_logs.length > 0) {
      dataFolder.file('energy_logs.json', JSON.stringify(data.energy_logs, null, 2));
      dataFolder.file('energy_logs.csv', toCSV(data.energy_logs));
    }

    // Health logs
    if (data.health_logs.length > 0) {
      dataFolder.file('health_logs.json', JSON.stringify(data.health_logs, null, 2));
      dataFolder.file('health_logs.csv', toCSV(data.health_logs));
    }

    // Notes
    if (data.notes.length > 0) {
      dataFolder.file('notes.json', JSON.stringify(data.notes, null, 2));
      dataFolder.file('notes.csv', toCSV(data.notes));
    }

    // Note entries
    if (data.note_entries.length > 0) {
      dataFolder.file('note_entries.json', JSON.stringify(data.note_entries, null, 2));
    }

    // User streaks
    if (data.user_streaks) {
      dataFolder.file('streaks.json', JSON.stringify(data.user_streaks, null, 2));
    }

    // Achievements
    if (data.user_achievements.length > 0) {
      dataFolder.file('achievements.json', JSON.stringify(data.user_achievements, null, 2));
    }
  }
  
  // Add summary file
  const summary = {
    export_date: new Date().toISOString(),
    total_records: {
      tasks: data.tasks.length,
      goals: data.goals.length,
      daily_analytics: data.daily_analytics.length,
      schedule_blocks: data.schedule_blocks.length,
      timetable_entries: data.timetable_entries.length,
      chat_messages: data.ai_chat_history.length,
      habits: data.habits.length,
      habit_logs: data.habit_logs.length,
      mood_entries: data.mood_entries.length,
      daily_checkins: data.daily_checkins.length,
      energy_logs: data.energy_logs.length,
      health_logs: data.health_logs.length,
      notes: data.notes.length,
      achievements: data.user_achievements.length,
    },
  };
  zip.file('export_summary.json', JSON.stringify(summary, null, 2));
  
  // Add README
  const readme = `BetterMe Data Export
====================
Export Date: ${format(new Date(), 'MMMM d, yyyy')}

Contents:
- data/tasks.json & tasks.csv - Your scheduled tasks
- data/goals.json & goals.csv - Your goals
- data/daily_analytics.json & daily_analytics.csv - Daily productivity stats
- data/schedule_blocks.json & schedule_blocks.csv - Schedule blocks
- data/timetable_entries.json & timetable_entries.csv - Timetable entries
- data/chat_history.json - AI chat history
- data/preferences.json - Your app preferences
- data/profile.json - Your profile information
- data/habits.json & habits.csv - Your habits
- data/habit_logs.json & habit_logs.csv - Habit completion logs
- data/mood_entries.json & mood_entries.csv - Mood tracking data
- data/daily_checkins.json & daily_checkins.csv - Daily check-in data
- data/energy_logs.json & energy_logs.csv - Energy tracking data
- data/health_logs.json & health_logs.csv - Health stats data
- data/notes.json & notes.csv - Your notes
- data/note_entries.json - Note entries
- data/streaks.json - Your streak data
- data/achievements.json - Your unlocked achievements
- export_summary.json - Summary of exported data

Both JSON and CSV formats are provided where applicable.
JSON files contain complete data, CSV files are for spreadsheet compatibility.

This data is yours and can be imported into other applications or kept for your records.
`;
  zip.file('README.txt', readme);
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `betterme-export-${dateStr}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
