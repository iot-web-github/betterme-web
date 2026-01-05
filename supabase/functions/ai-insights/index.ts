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
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch user data for analysis
    const [
      { data: tasks },
      { data: habits },
      { data: habitLogs },
      { data: moods },
      { data: checkins },
      { data: focusSessions },
      { data: goals }
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).gte('scheduled_date', weekAgo).order('scheduled_date', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', weekAgo),
      supabase.from('mood_entries').select('*').eq('user_id', user.id).gte('date', weekAgo).order('date', { ascending: false }),
      supabase.from('daily_checkins').select('*').eq('user_id', user.id).gte('date', weekAgo).order('date', { ascending: false }),
      supabase.from('focus_sessions').select('*').eq('user_id', user.id).gte('started_at', weekAgo),
      supabase.from('user_goals').select('*').eq('user_id', user.id).eq('is_active', true)
    ]);

    // Calculate analytics
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const taskCompletionRate = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    const completedHabitLogs = habitLogs?.filter(h => h.completed) || [];
    const habitCompletionRate = habitLogs?.length ? Math.round((completedHabitLogs.length / habitLogs.length) * 100) : 0;
    const avgMood = moods?.length ? Math.round(moods.reduce((a, m) => a + m.level, 0) / moods.length) : 0;
    const avgEnergy = checkins?.length ? Math.round(checkins.reduce((a, c) => a + (c.energy || 0), 0) / checkins.length) : 0;
    const avgSleep = checkins?.filter(c => c.wake_up_time && c.sleep_time).length || 0;
    const totalFocusMinutes = focusSessions?.reduce((a, s) => a + (s.duration_minutes || 0), 0) || 0;

    // Build context for AI
    const context = `
User's weekly summary:
- Tasks: ${completedTasks.length}/${tasks?.length || 0} completed (${taskCompletionRate}%)
- Habits: ${completedHabitLogs.length}/${habitLogs?.length || 0} completed (${habitCompletionRate}%)
- Average mood: ${avgMood}/5
- Average energy: ${avgEnergy}/5
- Focus time: ${totalFocusMinutes} minutes
- Active goals: ${goals?.length || 0}
- Sleep tracked days: ${avgSleep}
${moods?.length ? `- Recent mood trend: ${moods.slice(0, 3).map(m => m.level).join(' → ')}` : ''}
${checkins?.length ? `- Recent energy: ${checkins.slice(0, 3).map(c => c.energy).join(' → ')}` : ''}
`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a friendly wellness and productivity coach. Analyze the user's data and provide:
1. A brief daily summary (2-3 sentences)
2. One specific pattern you noticed
3. One actionable recommendation

Keep responses warm, encouraging, and concise. Use emoji sparingly. Focus on progress, not perfection.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_insights',
              description: 'Generate structured insights from user data',
              parameters: {
                type: 'object',
                properties: {
                  daily_summary: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Short title (5 words max)' },
                      content: { type: 'string', description: 'Brief summary (2-3 sentences)' }
                    },
                    required: ['title', 'content']
                  },
                  pattern: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Pattern name' },
                      content: { type: 'string', description: 'Pattern description' }
                    },
                    required: ['title', 'content']
                  },
                  recommendation: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Action item' },
                      content: { type: 'string', description: 'How to implement' }
                    },
                    required: ['title', 'content']
                  }
                },
                required: ['daily_summary', 'pattern', 'recommendation']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_insights' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const insights = JSON.parse(toolCall.function.arguments);
    console.log('Generated insights:', insights);

    // Store insights in database
    const insightPromises = [
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'daily_summary',
        title: insights.daily_summary.title,
        content: insights.daily_summary.content,
        metadata: { task_completion_rate: taskCompletionRate, habit_completion_rate: habitCompletionRate }
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'pattern',
        title: insights.pattern.title,
        content: insights.pattern.content,
        metadata: { avg_mood: avgMood, avg_energy: avgEnergy }
      }, { onConflict: 'user_id,date,insight_type' }),
      supabase.from('ai_insights').upsert({
        user_id: user.id,
        date: today,
        insight_type: 'recommendation',
        title: insights.recommendation.title,
        content: insights.recommendation.content,
        metadata: {}
      }, { onConflict: 'user_id,date,insight_type' })
    ];

    await Promise.all(insightPromises);

    return new Response(JSON.stringify({
      success: true,
      insights,
      stats: {
        taskCompletionRate,
        habitCompletionRate,
        avgMood,
        avgEnergy,
        totalFocusMinutes
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
