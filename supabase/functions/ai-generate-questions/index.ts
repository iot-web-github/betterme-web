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

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    console.log('Generating AI personalized questions for user:', user.id);

    // Fetch user data for analysis
    const [
      { data: recentCheckins },
      { data: tasks },
      { data: habits },
      { data: habitLogs },
      { data: aiProfile },
      { data: streaks }
    ] = await Promise.all([
      supabase.from('daily_checkins').select('*').eq('user_id', user.id).gte('date', weekAgo).order('date', { ascending: false }),
      supabase.from('tasks').select('*').eq('user_id', user.id).gte('scheduled_date', weekAgo),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', weekAgo),
      supabase.from('ai_user_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    console.log('Data fetched:', { 
      checkins: recentCheckins?.length || 0, 
      tasks: tasks?.length || 0,
      habits: habits?.length || 0
    });

    // Calculate metrics for context
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const taskCompletionRate = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    const avgEnergy = recentCheckins?.length 
      ? recentCheckins.reduce((a, c) => a + (c.energy || 3), 0) / recentCheckins.length 
      : 0;
    const avgStress = recentCheckins?.length 
      ? recentCheckins.reduce((a, c) => a + (c.stress || 3), 0) / recentCheckins.length 
      : 0;
    const avgMood = recentCheckins?.length 
      ? recentCheckins.reduce((a, c) => a + (c.mood || 3), 0) / recentCheckins.length 
      : 0;
    const exerciseDays = recentCheckins?.filter(c => c.exercise).length || 0;

    // Build context for AI
    const context = `
User Check-in Data (Last 7 days):
- Check-ins completed: ${recentCheckins?.length || 0}/7
- Average mood: ${avgMood.toFixed(1)}/5
- Average energy: ${avgEnergy.toFixed(1)}/5
- Average stress: ${avgStress.toFixed(1)}/5
- Exercise days: ${exerciseDays}/7
- Task completion rate: ${taskCompletionRate}%
- Current streak: ${streaks?.current_streak || 0} days
- Check-in streak: ${streaks?.checkin_streak || 0} days

Recent patterns:
${recentCheckins?.slice(0, 3).map(c => 
  `${c.date}: mood=${c.mood}, energy=${c.energy}, stress=${c.stress}, exercise=${c.exercise}`
).join('\n') || 'No recent check-ins'}

Active habits: ${habits?.map(h => h.name).join(', ') || 'None'}

Previous AI questions answered: ${aiProfile?.ai_questions_answered?.length || 0}
`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are a wellness coach creating personalized daily check-in questions. Generate 3-5 thoughtful, personalized questions based on the user's recent data and patterns. Questions should be:
- Specific to their recent experiences (reference actual data)
- Designed to understand their current state and challenges
- Focused on actionable insights
- Warm and supportive in tone`
          },
          { 
            role: 'user', 
            content: `${context}

Generate personalized check-in questions. Return ONLY raw JSON (no markdown):
{
  "questions": [
    {
      "id": "unique_id",
      "question": "The question text",
      "context": "Why this question is relevant (shown to user)",
      "type": "personalized"
    }
  ]
}` 
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
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
    const generatedText = aiResponse.choices?.[0]?.message?.content || '';
    
    let questions = [];
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Generate fallback questions based on data
      questions = [];
      
      if (avgEnergy < 3) {
        questions.push({
          id: 'energy_followup',
          question: 'Your energy has been lower than usual. What do you think is affecting it?',
          context: 'Based on your recent energy levels',
          type: 'personalized'
        });
      }
      
      if (avgStress > 3.5) {
        questions.push({
          id: 'stress_coping',
          question: 'Stress has been elevated recently. What helps you decompress?',
          context: 'Based on your stress patterns',
          type: 'personalized'
        });
      }
      
      if (exerciseDays < 2) {
        questions.push({
          id: 'exercise_barrier',
          question: "What's been making it challenging to exercise this week?",
          context: 'Based on your activity patterns',
          type: 'personalized'
        });
      }
      
      if (taskCompletionRate < 50) {
        questions.push({
          id: 'task_challenges',
          question: 'What would help you complete more of your planned tasks?',
          context: 'Based on your task completion rate',
          type: 'personalized'
        });
      }
    }

    // Store generated questions in AI profile
    await supabase.from('ai_user_profile').upsert({
      user_id: user.id,
      ai_questions_asked: questions,
      last_analysis_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      success: true,
      questions,
      metrics: {
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        avgMood: Math.round(avgMood * 10) / 10,
        exerciseDays,
        taskCompletionRate
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
