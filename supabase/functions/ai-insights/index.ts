import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('Fetching comprehensive user data for AI analysis...');

    // Fetch ALL user data comprehensively
    const [
      { data: tasks },
      { data: habits },
      { data: habitLogs },
      { data: moods },
      { data: checkins },
      { data: focusSessions },
      { data: goals },
      { data: energyLogs },
      { data: streaks },
      { data: aiProfile }
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).gte('scheduled_date', thirtyDaysAgo).order('scheduled_date', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('mood_entries').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo).order('date', { ascending: false }),
      supabase.from('daily_checkins').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo).order('date', { ascending: false }),
      supabase.from('focus_sessions').select('*').eq('user_id', user.id).gte('started_at', thirtyDaysAgo),
      supabase.from('user_goals').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('energy_logs').select('*').eq('user_id', user.id).gte('date', weekAgo),
      supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('ai_user_profile').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    console.log('Data fetched:', { 
      tasks: tasks?.length || 0, 
      habits: habits?.length || 0, 
      checkins: checkins?.length || 0,
      moods: moods?.length || 0,
      focusSessions: focusSessions?.length || 0
    });

    // Calculate comprehensive analytics
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const taskCompletionRate = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    const recentHabitLogs = habitLogs?.filter(h => h.date >= weekAgo) || [];
    const completedHabitLogs = recentHabitLogs.filter(h => h.completed) || [];
    const habitCompletionRate = recentHabitLogs.length ? Math.round((completedHabitLogs.length / recentHabitLogs.length) * 100) : 0;
    
    const recentMoods = moods?.filter(m => m.date >= weekAgo) || [];
    const avgMood = recentMoods.length ? Math.round(recentMoods.reduce((a, m) => a + m.level, 0) / recentMoods.length * 10) / 10 : 0;
    
    const recentCheckins = checkins?.filter(c => c.date >= weekAgo) || [];
    const avgEnergy = recentCheckins.length ? Math.round(recentCheckins.reduce((a, c) => a + (c.energy || 0), 0) / recentCheckins.length * 10) / 10 : 0;
    const avgStress = recentCheckins.length ? Math.round(recentCheckins.reduce((a, c) => a + (c.stress || 0), 0) / recentCheckins.length * 10) / 10 : 0;
    const avgSleepHours = recentCheckins.filter(c => c.wake_up_time && c.sleep_time).length;
    const exerciseDays = recentCheckins.filter(c => c.exercise).length;
    
    const totalFocusMinutes = focusSessions?.reduce((a, s) => a + (s.duration_minutes || 0), 0) || 0;
    
    // Calculate sleep patterns
    let avgSleep = 0;
    if (recentCheckins.length > 0) {
      const sleepCalcs = recentCheckins.filter(c => c.wake_up_time && c.sleep_time).map(c => {
        const [sleepH, sleepM] = (c.sleep_time || '23:00').split(':').map(Number);
        const [wakeH, wakeM] = (c.wake_up_time || '07:00').split(':').map(Number);
        let hours = (wakeH + wakeM/60) - (sleepH + sleepM/60);
        if (hours < 0) hours += 24;
        return hours;
      });
      if (sleepCalcs.length > 0) {
        avgSleep = Math.round(sleepCalcs.reduce((a, b) => a + b, 0) / sleepCalcs.length * 10) / 10;
      }
    }

    // Pattern detection: Exercise vs Mood correlation
    let exerciseMoodCorrelation = '';
    if (recentCheckins.length >= 3) {
      const exerciseDaysData = recentCheckins.filter(c => c.exercise);
      const nonExerciseDaysData = recentCheckins.filter(c => !c.exercise);
      if (exerciseDaysData.length > 0 && nonExerciseDaysData.length > 0) {
        const avgMoodExercise = exerciseDaysData.reduce((a, c) => a + (c.mood || 3), 0) / exerciseDaysData.length;
        const avgMoodNoExercise = nonExerciseDaysData.reduce((a, c) => a + (c.mood || 3), 0) / nonExerciseDaysData.length;
        const diff = Math.round((avgMoodExercise - avgMoodNoExercise) / avgMoodNoExercise * 100);
        if (diff > 10) {
          exerciseMoodCorrelation = `Your mood is ${diff}% higher on exercise days`;
        }
      }
    }

    // Build comprehensive context for AI
    const context = `
User's comprehensive data analysis (Last 30 days):

TASK PERFORMANCE:
- Total tasks: ${tasks?.length || 0}
- Completed: ${completedTasks.length} (${taskCompletionRate}% completion rate)
- Current streak: ${streaks?.current_streak || 0} days
- Longest streak: ${streaks?.longest_streak || 0} days
- Perfect days: ${streaks?.perfect_days || 0}

WELLNESS METRICS (Last 7 days):
- Average mood: ${avgMood}/5
- Average energy: ${avgEnergy}/5
- Average stress: ${avgStress}/5
- Average sleep: ${avgSleep} hours
- Exercise days: ${exerciseDays}/7
- Check-in streak: ${streaks?.checkin_streak || 0} days

HABITS:
- Total habits tracked: ${habits?.length || 0}
- Habit completion this week: ${habitCompletionRate}%
- Habits: ${habits?.map(h => h.name).join(', ') || 'None'}

FOCUS & PRODUCTIVITY:
- Total focus time: ${totalFocusMinutes} minutes (${Math.round(totalFocusMinutes/60)} hours)
- Active goals: ${goals?.length || 0}
- Goals: ${goals?.map(g => g.title).slice(0, 3).join(', ') || 'None'}

PATTERNS DETECTED:
${exerciseMoodCorrelation ? `- ${exerciseMoodCorrelation}` : '- Need more data for correlation analysis'}
${recentMoods.length > 2 ? `- Mood trend: ${recentMoods.slice(0, 3).map(m => m.level).join(' → ')}` : ''}
${recentCheckins.length > 2 ? `- Energy trend: ${recentCheckins.slice(0, 3).map(c => c.energy).join(' → ')}` : ''}

PREVIOUS AI PROFILE DATA:
${aiProfile?.personality_traits ? `Personality: ${JSON.stringify(aiProfile.personality_traits)}` : 'No previous analysis'}
${aiProfile?.discovered_patterns?.length ? `Known patterns: ${JSON.stringify(aiProfile.discovered_patterns.slice(0, 3))}` : ''}
`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are BetterMe's AI wellness coach. Analyze the user's comprehensive data and generate personalized insights.

Your analysis should be:
1. Based ONLY on the actual data provided - never make up statistics
2. Warm, encouraging, and actionable
3. Focused on patterns and correlations in their behavior
4. Personalized to their specific habits and goals

Generate insights that feel like they come from someone who truly understands the user's journey.`;

    console.log('Calling Gemini API for insights...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{
              text: `${systemPrompt}\n\nUser Data:\n${context}\n\nGenerate a JSON response with this exact structure (no markdown, just raw JSON):
{
  "daily_summary": {
    "title": "Brief 3-4 word title",
    "content": "2-3 sentence personalized summary of their current state based on real data"
  },
  "pattern": {
    "title": "Pattern name",
    "content": "Describe a specific pattern you found in their data with actual numbers"
  },
  "recommendation": {
    "title": "Action item",
    "content": "One specific, actionable recommendation based on their data"
  },
  "prediction": {
    "title": "Tomorrow's forecast",
    "content": "Prediction for tomorrow based on their patterns"
  },
  "personalized_questions": [
    {
      "id": "q1",
      "question": "A personalized question to understand them better, based on patterns in their data",
      "context": "Why you're asking this"
    },
    {
      "id": "q2", 
      "question": "Another personalized question based on their goals or habits",
      "context": "Why you're asking this"
    }
  ],
  "wellness_score": {
    "score": 0-100,
    "breakdown": {
      "sleep": 0-100,
      "mood": 0-100,
      "productivity": 0-100,
      "exercise": 0-100,
      "habits": 0-100
    },
    "trend": "up|down|stable"
  }
}`
            }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Gemini response received');
    
    const generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON from response (handle markdown code blocks)
    let insights;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, generatedText);
      // Fallback insights based on actual data
      insights = {
        daily_summary: {
          title: taskCompletionRate > 60 ? 'Productive Day Ahead' : 'Building Momentum',
          content: `You've completed ${completedTasks.length} tasks with ${taskCompletionRate}% completion rate. ${avgMood >= 4 ? 'Your mood has been positive!' : 'Focus on small wins today.'}`
        },
        pattern: {
          title: 'Consistency Pattern',
          content: streaks?.current_streak > 0 ? `You're on a ${streaks.current_streak}-day streak! Keep it going.` : 'Start building your streak today.'
        },
        recommendation: {
          title: 'Today\'s Focus',
          content: avgEnergy < 3 ? 'Consider a short walk to boost energy.' : 'You have good energy - tackle your important tasks now.'
        },
        prediction: {
          title: 'Tomorrow Outlook',
          content: 'Based on your patterns, consistency is key. Keep checking in!'
        },
        personalized_questions: [],
        wellness_score: {
          score: Math.round((avgMood + avgEnergy) * 10 + taskCompletionRate * 0.5),
          breakdown: {
            sleep: Math.round(avgSleep / 8 * 100),
            mood: Math.round(avgMood * 20),
            productivity: taskCompletionRate,
            exercise: Math.round(exerciseDays / 7 * 100),
            habits: habitCompletionRate
          },
          trend: 'stable'
        }
      };
    }

    console.log('Generated insights:', insights);

    // Store insights in database
    const insightPromises = [
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'daily_summary',
        title: insights.daily_summary?.title || 'Daily Summary',
        content: insights.daily_summary?.content || '',
        metadata: { task_completion_rate: taskCompletionRate, habit_completion_rate: habitCompletionRate }
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'pattern',
        title: insights.pattern?.title || 'Pattern',
        content: insights.pattern?.content || '',
        metadata: { avg_mood: avgMood, avg_energy: avgEnergy }
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'recommendation',
        title: insights.recommendation?.title || 'Recommendation',
        content: insights.recommendation?.content || '',
        metadata: {}
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'prediction',
        title: insights.prediction?.title || 'Prediction',
        content: insights.prediction?.content || '',
        metadata: { wellness_score: insights.wellness_score }
      }, { onConflict: 'user_id,date,insight_type' }),
    ];

    // Store personalized questions in AI profile
    if (insights.personalized_questions?.length > 0) {
      insightPromises.push(
        supabase.from('ai_user_profile').upsert({
          user_id: user.id,
          ai_questions_asked: insights.personalized_questions,
          discovered_patterns: [
            ...(aiProfile?.discovered_patterns || []),
            { pattern: insights.pattern?.content, date: today }
          ].slice(-10),
          last_analysis_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      );
    }

    await Promise.all(insightPromises);

    return new Response(JSON.stringify({
      success: true,
      insights,
      stats: {
        taskCompletionRate,
        habitCompletionRate,
        avgMood,
        avgEnergy,
        avgStress,
        avgSleep,
        exerciseDays,
        totalFocusMinutes,
        currentStreak: streaks?.current_streak || 0,
        checkinStreak: streaks?.checkin_streak || 0,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
