import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, parseISO } from 'date-fns';

export interface PersonalizedQuestion {
  id: string;
  question: string;
  context?: string;
  type: 'standard' | 'personalized' | 'follow_up';
}

export interface CheckinStreak {
  current: number;
  longest: number;
}

const QUESTIONS_CACHE_KEY = 'ai_questions_cache';
const QUESTIONS_CACHE_TIME = 'ai_questions_cache_time';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export const usePersonalizedCheckin = () => {
  const { user } = useAuth();
  const [personalizedQuestions, setPersonalizedQuestions] = useState<PersonalizedQuestion[]>([]);
  const [checkinStreak, setCheckinStreak] = useState<CheckinStreak>({ current: 0, longest: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Fetch AI-generated personalized questions
  const fetchAIQuestions = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    // Check cache first
    if (!forceRefresh) {
      const cachedTime = localStorage.getItem(QUESTIONS_CACHE_TIME);
      const cachedQuestions = localStorage.getItem(QUESTIONS_CACHE_KEY);
      
      if (cachedTime && cachedQuestions) {
        const timeSinceCache = Date.now() - parseInt(cachedTime, 10);
        if (timeSinceCache < CACHE_DURATION) {
          try {
            const questions = JSON.parse(cachedQuestions);
            setPersonalizedQuestions(questions);
            return;
          } catch {
            // Cache invalid, continue to fetch
          }
        }
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(
        `https://mpcavptnwtcoyubhurck.supabase.co/functions/v1/ai-generate-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          // Fallback to local questions generation
          await fetchLocalQuestions();
          return;
        }
        throw new Error('Failed to fetch AI questions');
      }

      const data = await response.json();
      const questions = (data.questions || []).slice(0, 5) as PersonalizedQuestion[];
      
      // Cache the questions
      localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(questions));
      localStorage.setItem(QUESTIONS_CACHE_TIME, Date.now().toString());
      
      setPersonalizedQuestions(questions);
    } catch (err) {
      console.error('Error fetching AI questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
      // Fallback to local generation
      await fetchLocalQuestions();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fallback: Generate questions locally based on recent data
  const fetchLocalQuestions = useCallback(async () => {
    if (!user) return;

    try {
      // Get recent check-in data to generate contextual questions
      const { data: recentCheckins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      const questions: PersonalizedQuestion[] = [];

      // Add contextual questions based on recent data
      if (recentCheckins && recentCheckins.length > 0) {
        const yesterday = recentCheckins[0];
        
        // Low energy follow-up
        if (yesterday && yesterday.energy && yesterday.energy <= 2) {
          questions.push({
            id: 'follow_up_energy',
            question: 'Your energy was low yesterday. How are you feeling today?',
            context: 'Based on your check-in from yesterday',
            type: 'follow_up',
          });
        }

        // High stress follow-up
        if (yesterday && yesterday.stress && yesterday.stress >= 4) {
          questions.push({
            id: 'follow_up_stress',
            question: 'You mentioned high stress yesterday. Did anything help you relax?',
            context: "Following up on yesterday's stress level",
            type: 'follow_up',
          });
        }

        // Exercise pattern
        const exerciseDays = recentCheckins.filter(c => c.exercise).length;
        if (exerciseDays < 2 && recentCheckins.length >= 5) {
          questions.push({
            id: 'exercise_motivation',
            question: "What's been making it hard to exercise this week?",
            context: 'We noticed fewer exercise days recently',
            type: 'personalized',
          });
        }

        // Sleep pattern
        const avgSleep = recentCheckins
          .filter(c => c.wake_up_time && c.sleep_time)
          .map(c => {
            const [sleepH] = (c.sleep_time || '23:00').split(':').map(Number);
            const [wakeH] = (c.wake_up_time || '07:00').split(':').map(Number);
            let hours = wakeH - sleepH;
            if (hours < 0) hours += 24;
            return hours;
          });
        
        if (avgSleep.length > 0) {
          const avg = avgSleep.reduce((a, b) => a + b, 0) / avgSleep.length;
          if (avg < 6) {
            questions.push({
              id: 'sleep_quality',
              question: "Your sleep has been shorter lately. What's affecting your rest?",
              context: 'Based on your sleep patterns this week',
              type: 'personalized',
            });
          }
        }

        // Mood trend
        const moodTrend = recentCheckins.slice(0, 3).map(c => c.mood || 3);
        const avgMood = moodTrend.reduce((a, b) => a + b, 0) / moodTrend.length;
        if (avgMood <= 2.5) {
          questions.push({
            id: 'mood_support',
            question: "Your mood has been lower recently. What's one thing that could brighten your day?",
            context: 'Based on your recent mood patterns',
            type: 'personalized',
          });
        }
      }

      setPersonalizedQuestions(questions.slice(0, 3));
    } catch (err) {
      console.error('Error generating local questions:', err);
    }
  }, [user]);

  // Fetch questions on mount - reset hasFetched when user changes
  useEffect(() => {
    // Reset when user changes
    hasFetched.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchAIQuestions();
    }
  }, [user, fetchAIQuestions]);

  // Calculate and update check-in streak
  const calculateCheckinStreak = useCallback(async () => {
    if (!user) return { current: 0, longest: 0 };

    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!checkins || checkins.length === 0) {
      return { current: 0, longest: 0 };
    }

    const checkinDates = new Set(checkins.map(c => c.date));
    
    let currentStreak = 0;
    let checkDate = new Date();
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd');

    // Check if streak is active (today or yesterday has check-in)
    if (!checkinDates.has(todayStr) && !checkinDates.has(yesterdayStr)) {
      currentStreak = 0;
    } else {
      // Start counting from today or yesterday
      if (!checkinDates.has(todayStr)) {
        checkDate = subDays(checkDate, 1);
      }

      while (checkinDates.has(format(checkDate, 'yyyy-MM-dd'))) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(checkinDates).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = parseISO(sortedDates[i - 1]);
        const currDate = parseISO(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current: currentStreak, longest: longestStreak };
  }, [user]);

  // Update streak in database after check-in
  const updateStreakAfterCheckin = useCallback(async () => {
    if (!user) return;

    const streak = await calculateCheckinStreak();
    setCheckinStreak(streak);

    // Update user_streaks table
    await supabase.from('user_streaks').upsert({
      user_id: user.id,
      checkin_streak: streak.current,
      longest_checkin_streak: Math.max(streak.current, streak.longest),
    }, { onConflict: 'user_id' });

    // Clear question cache to get fresh questions next time
    localStorage.removeItem(QUESTIONS_CACHE_KEY);
    localStorage.removeItem(QUESTIONS_CACHE_TIME);

    return streak;
  }, [user, calculateCheckinStreak]);

  // Fetch initial streak
  useEffect(() => {
    if (!user) return;
    
    const fetchStreak = async () => {
      const { data } = await supabase
        .from('user_streaks')
        .select('checkin_streak, longest_checkin_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCheckinStreak({
          current: data.checkin_streak || 0,
          longest: data.longest_checkin_streak || 0,
        });
      }
    };

    fetchStreak();
  }, [user]);

  return {
    personalizedQuestions,
    checkinStreak,
    isLoading,
    error,
    updateStreakAfterCheckin,
    calculateCheckinStreak,
    refreshQuestions: () => fetchAIQuestions(true),
  };
};
