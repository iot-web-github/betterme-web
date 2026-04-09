// Refresh intervals (ms)
export const STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const REFETCH_INTERVAL = 30 * 1000; // 30 seconds

// Defaults
export const DEFAULT_WATER_GOAL = 8; // glasses
export const DEFAULT_SLEEP_GOAL = 8; // hours
export const DEFAULT_FOCUS_DURATION = 25; // minutes (pomodoro)
export const DEFAULT_BREAK_DURATION = 5; // minutes

// Limits
export const MAX_HABITS = 20;
export const MAX_GOALS = 10;
export const MAX_NOTES_LENGTH = 5000;

// Timeline
export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 23;
export const HOUR_HEIGHT_PX = 80;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'smart-schedule-theme',
  TASKS: 'smart-schedule-tasks',
} as const;
