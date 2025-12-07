// Notes Types
export interface NoteEntry {
  id: string;
  timestamp: string;
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  entries: NoteEntry[];
  tags: string[];
  folder?: string;
  color: string;
  isPinned: boolean;
  attachments: NoteAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'link' | 'voice';
  url: string;
  name: string;
}

// Energy Tracker Types
export interface EnergyLog {
  id: string;
  date: string;
  time: string;
  level: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string;
}

// Focus Tracker Types
export interface FocusSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  taskId?: string;
  distractions: number;
  quality: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string;
}

// Health Stats Types
export interface HealthLog {
  id: string;
  date: string;
  waterIntake: number; // glasses
  calories?: number;
  exerciseMinutes: number;
  steps?: number;
  createdAt: string;
  updatedAt: string;
}

// Mood Entry with triggers
export interface MoodEntry {
  id: string;
  date: string;
  time: string;
  level: 1 | 2 | 3 | 4 | 5;
  triggers: string[];
  reasons: string;
  createdAt: string;
}
