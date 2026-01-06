import { useState, useEffect, useCallback } from 'react';
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

export const usePersonalizedCheckin = () => {
  const { user } = useAuth();
  const [personalizedQuestions, setPersonalizedQuestions] = useState<PersonalizedQuestion[]>([]);
  const [checkinStreak, setCheckinStreak] = useState<CheckinStreak>({ current: 0, longest: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch personalized questions from AI profile
  useEffect(() => {
    if (!user) return;

    const fetchQuestions = async () => {
      setIsLoading(true);
      
      try {
        // Get AI-generated questions
        const { data: aiProfile } = await supabase
          .from('ai_user_profile')
          .select('ai_questions_asked')
          .eq('user_id', user.id)
          .maybeSingle();

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
              context: 'Following up on yesterday\'s stress level',
              type: 'follow_up',
            });
          }

          // Exercise pattern
          const exerciseDays = recentCheckins.filter(c => c.exercise).length;
          if (exerciseDays < 2 && recentCheckins.length >= 5) {
            questions.push({
              id: 'exercise_motivation',
              question: 'What\'s been making it hard to exercise this week?',
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
                question: 'Your sleep has been shorter lately. What\'s affecting your rest?',
                context: 'Based on your sleep patterns this week',
                type: 'personalized',
              });
            }
          }
        }

        // Add AI-generated questions if available
        if (aiProfile?.ai_questions_asked) {
          const aiQuestions = (aiProfile.ai_questions_asked as any[]).slice(0, 2).map(q => ({
            id: q.id,
            question: q.question,
            context: q.context || q.purpose,
            type: 'personalized' as const,
          }));
          questions.push(...aiQuestions);
        }

        setPersonalizedQuestions(questions.slice(0, 3));
      } catch (err) {
        console.error('Error fetching personalized questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [user]);

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
    updateStreakAfterCheckin,
    calculateCheckinStreak,
  };
};
