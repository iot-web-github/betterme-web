import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // ENHANCED: Task analysis for to-do list insights
    const tasksByCategory: Record<string, { total: number; completed: number }> = {};
    const tasksByHour: Record<number, { total: number; completed: number }> = {};
    const tasksByDay: Record<string, { total: number; completed: number }> = {};
    const overdueTasks = tasks?.filter(t => t.status !== 'completed' && t.scheduled_date < today) || [];
    
    tasks?.forEach(t => {
      // Category breakdown
      const cat = t.category || 'uncategorized';
      if (!tasksByCategory[cat]) tasksByCategory[cat] = { total: 0, completed: 0 };
      tasksByCategory[cat].total++;
      if (t.status === 'completed') tasksByCategory[cat].completed++;
      
      // Hour breakdown
      if (t.scheduled_time) {
        const hour = parseInt(t.scheduled_time.split(':')[0], 10);
        if (!tasksByHour[hour]) tasksByHour[hour] = { total: 0, completed: 0 };
        tasksByHour[hour].total++;
        if (t.status === 'completed') tasksByHour[hour].completed++;
      }
      
      // Day breakdown
      if (t.scheduled_date) {
        const dayOfWeek = new Date(t.scheduled_date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!tasksByDay[dayOfWeek]) tasksByDay[dayOfWeek] = { total: 0, completed: 0 };
        tasksByDay[dayOfWeek].total++;
        if (t.status === 'completed') tasksByDay[dayOfWeek].completed++;
      }
    });

    // Find peak productivity hour
    let peakHour = 9;
    let peakHourCompletion = 0;
    Object.entries(tasksByHour).forEach(([hour, data]) => {
      const rate = data.total > 0 ? data.completed / data.total : 0;
      if (rate > peakHourCompletion && data.total >= 2) {
        peakHour = parseInt(hour, 10);
        peakHourCompletion = rate;
      }
    });

    // Find best day
    let bestDay = 'Monday';
    let bestDayCompletion = 0;
    Object.entries(tasksByDay).forEach(([day, data]) => {
      const rate = data.total > 0 ? data.completed / data.total : 0;
      if (rate > bestDayCompletion && data.total >= 2) {
        bestDay = day;
        bestDayCompletion = rate;
      }
    });

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
- Overdue tasks: ${overdueTasks.length}
- Current streak: ${streaks?.current_streak || 0} days
- Longest streak: ${streaks?.longest_streak || 0} days
- Perfect days: ${streaks?.perfect_days || 0}

TASK PATTERNS (To-Do Analysis):
- Peak productivity hour: ${peakHour}:00 (${Math.round(peakHourCompletion * 100)}% completion)
- Best day: ${bestDay} (${Math.round(bestDayCompletion * 100)}% completion)
- Category breakdown: ${Object.entries(tasksByCategory).map(([cat, data]) => 
    `${cat}: ${data.completed}/${data.total} (${Math.round(data.completed/data.total*100)}%)`
  ).join(', ')}
- Tasks by hour: ${Object.entries(tasksByHour).slice(0, 5).map(([h, d]) => `${h}:00=${d.completed}/${d.total}`).join(', ')}

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Calling Lovable AI Gateway for insights...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are BetterMe\'s AI wellness coach. Analyze user data and generate personalized, actionable insights based ONLY on the actual data provided. Be warm, encouraging, and specific with numbers. Pay special attention to task patterns and productivity analysis.' },
          { role: 'user', content: `User Data:\n${context}\n\nGenerate a JSON response with this exact structure (no markdown, just raw JSON):
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
  "task_insights": {
    "peak_hour": ${peakHour},
    "best_day": "${bestDay}",
    "productivity_tip": "Specific tip based on their task patterns",
    "category_focus": "Which category needs attention"
  },
  "wellness_score": {
    "score": 0-100,
    "trend": "up|down|stable"
  }
}` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'AI is busy. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Lovable AI response received');
    
    const generatedText = aiResponse.choices?.[0]?.message?.content || '';
    
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
          title: 'Productivity Pattern',
          content: `Your peak productivity is at ${peakHour}:00 with ${Math.round(peakHourCompletion * 100)}% completion. ${bestDay} is your best day.`
        },
        recommendation: {
          title: 'Today\'s Focus',
          content: avgEnergy < 3 ? 'Consider a short walk to boost energy.' : `Schedule your most important task around ${peakHour}:00 for best results.`
        },
        prediction: {
          title: 'Tomorrow Outlook',
          content: 'Based on your patterns, consistency is key. Keep checking in!'
        },
        task_insights: {
          peak_hour: peakHour,
          best_day: bestDay,
          productivity_tip: `Schedule important tasks at ${peakHour}:00 on ${bestDay}`,
          category_focus: Object.entries(tasksByCategory).sort((a, b) => 
            (a[1].completed/a[1].total) - (b[1].completed/b[1].total)
          )[0]?.[0] || 'general'
        },
        wellness_score: {
          score: Math.round((avgMood + avgEnergy) * 10 + taskCompletionRate * 0.5),
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
        metadata: { avg_mood: avgMood, avg_energy: avgEnergy, task_insights: insights.task_insights }
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'recommendation',
        title: insights.recommendation?.title || 'Recommendation',
        content: insights.recommendation?.content || '',
        metadata: { peak_hour: peakHour, best_day: bestDay }
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

    // Update AI profile with discovered patterns
    const newPattern = {
      pattern: insights.pattern?.content,
      date: today,
      task_insights: insights.task_insights
    };

    insightPromises.push(
      supabase.from('ai_user_profile').upsert({
        user_id: user.id,
        discovered_patterns: [
          newPattern,
          ...(aiProfile?.discovered_patterns || [])
        ].slice(0, 20),
        last_analysis_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    );

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
        peakHour,
        bestDay,
        overdueTasks: overdueTasks.length,
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
