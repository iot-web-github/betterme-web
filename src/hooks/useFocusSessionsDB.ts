import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  session_type: 'focus' | 'break';
  duration_minutes: number;
  started_at: string;
  ended_at?: string;
  notes?: string;
  created_at: string;
}

export type TimerState = 'idle' | 'focus' | 'break' | 'paused';

export const useFocusSessionsDB = (focusDuration = 25, breakDuration = 5) => {
  const { user } = useAuth();
  const [state, setState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions((data || []) as FocusSession[]);
      
      // Count today's completed pomodoros
      const today = new Date().toISOString().split('T')[0];
      const todayFocus = (data || []).filter(s => 
        s.session_type === 'focus' && s.started_at.startsWith(today)
      );
      setCompletedPomodoros(todayFocus.length);
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const saveSession = useCallback(async (type: 'focus' | 'break', duration: number) => {
    if (!user || !sessionStartRef.current) return;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          task_id: currentTaskId || null,
          session_type: type,
          duration_minutes: duration,
          started_at: sessionStartRef.current,
          ended_at: new Date().toISOString()
        })
        .select()
        .single() as { data: FocusSession | null; error: unknown };

      if (error) throw error;
      if (data) setSessions(prev => [data, ...prev]);
      sessionStartRef.current = null;
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
  }, [user, currentTaskId]);

  const startFocus = useCallback((taskId?: string) => {
    clearTimer();
    setCurrentTaskId(taskId || null);
    setTimeRemaining(focusDuration * 60);
    setState('focus');
    sessionStartRef.current = new Date().toISOString();

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          saveSession('focus', focusDuration);
          setCompletedPomodoros(p => p + 1);
          setState('break');
          sessionStartRef.current = new Date().toISOString();
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
    sessionStartRef.current = new Date().toISOString();

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
            sessionStartRef.current = new Date().toISOString();
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
    sessionStartRef.current = null;
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

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.started_at.startsWith(today) && s.session_type === 'focus');
  const totalFocusToday = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return {
    state,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    currentTaskId,
    completedPomodoros,
    sessions,
    todaySessions,
    totalFocusToday,
    isLoading,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    skipBreak,
    refetch: fetchSessions
  };
};
