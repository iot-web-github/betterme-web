import { useState, useEffect, useCallback, useRef } from 'react';
import { FocusSession } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'smart-schedule-focus-sessions';

const getStoredSessions = (): FocusSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSessions = (sessions: FocusSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export type TimerState = 'idle' | 'focus' | 'break' | 'paused';

export const useFocusTimer = (focusDuration = 25, breakDuration = 5) => {
  const [state, setState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    setSessions(getStoredSessions());
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const saveSession = useCallback((type: 'focus' | 'break', duration: number) => {
    const session: FocusSession = {
      id: uuidv4(),
      taskId: currentTaskId || undefined,
      duration,
      completedAt: new Date().toISOString(),
      type,
    };

    setSessions(prev => {
      const updated = [...prev, session];
      saveSessions(updated);
      return updated;
    });
  }, [currentTaskId]);

  const startFocus = useCallback((taskId?: string) => {
    clearTimer();
    setCurrentTaskId(taskId || null);
    setTimeRemaining(focusDuration * 60);
    setState('focus');

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          saveSession('focus', focusDuration);
          setCompletedPomodoros(p => p + 1);
          // Auto-start break
          setState('break');
          return breakDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, [focusDuration, breakDuration, clearTimer, saveSession]);

  const startBreak = useCallback(() => {
    clearTimer();
    setTimeRemaining(breakDuration * 60);
    setState('break');

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          saveSession('break', breakDuration);
          setState('idle');
          return focusDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, [breakDuration, focusDuration, clearTimer, saveSession]);

  const pause = useCallback(() => {
    clearTimer();
    pausedTimeRef.current = timeRemaining;
    setState('paused');
  }, [clearTimer, timeRemaining]);

  const resume = useCallback(() => {
    if (pausedTimeRef.current <= 0) return;

    const prevState = state === 'paused' ? 'focus' : state;
    setState(prevState === 'break' ? 'break' : 'focus');
    setTimeRemaining(pausedTimeRef.current);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          if (prevState === 'focus') {
            saveSession('focus', focusDuration);
            setCompletedPomodoros(p => p + 1);
            setState('break');
            return breakDuration * 60;
          } else {
            saveSession('break', breakDuration);
            setState('idle');
            return focusDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
  }, [state, clearTimer, focusDuration, breakDuration, saveSession]);

  const stop = useCallback(() => {
    clearTimer();
    setState('idle');
    setTimeRemaining(focusDuration * 60);
    setCurrentTaskId(null);
    pausedTimeRef.current = 0;
  }, [clearTimer, focusDuration]);

  const skipBreak = useCallback(() => {
    clearTimer();
    setState('idle');
    setTimeRemaining(focusDuration * 60);
  }, [clearTimer, focusDuration]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todaySessions = sessions.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.completedAt.startsWith(today) && s.type === 'focus';
  });

  const totalFocusToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  return {
    state,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    currentTaskId,
    completedPomodoros,
    sessions,
    todaySessions,
    totalFocusToday,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    skipBreak,
  };
};
