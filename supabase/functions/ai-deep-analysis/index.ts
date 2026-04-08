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

    const body = await req.json();
    const { action, questionId, answer } = body;

    const today = new Date().toISOString().split('T')[0];
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`AI Deep Analysis - Action: ${action}`);

    // Fetch comprehensive data for deep analysis
    const [
      { data: tasks },
      { data: habits },
      { data: habitLogs },
      { data: moods },
      { data: checkins },
      { data: focusSessions },
      { data: goals },
      { data: streaks },
      { data: aiProfile },
      { data: allInsights }
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).gte('scheduled_date', ninetyDaysAgo),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', ninetyDaysAgo),
      supabase.from('mood_entries').select('*').eq('user_id', user.id).gte('date', ninetyDaysAgo),
      supabase.from('daily_checkins').select('*').eq('user_id', user.id).gte('date', ninetyDaysAgo),
      supabase.from('focus_sessions').select('*').eq('user_id', user.id).gte('started_at', ninetyDaysAgo),
      supabase.from('user_goals').select('*').eq('user_id', user.id),
      supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('ai_user_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('ai_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    ]);

    // Handle answer submission
    if (action === 'answer_question' && questionId && answer) {
      const currentAnswers = aiProfile?.ai_questions_answered || [];
      const newAnswer = { questionId, answer, answeredAt: new Date().toISOString() };
      
      await supabase.from('ai_user_profile').upsert({
        user_id: user.id,
        ai_questions_answered: [...currentAnswers, newAnswer].slice(-50),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ success: true, message: 'Answer saved' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate comprehensive stats
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const taskCompletionRate = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    // Weekly averages
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentCheckins = checkins?.filter(c => c.date >= weekAgo) || [];
    const avgMood = recentCheckins.length ? recentCheckins.reduce((a, c) => a + (c.mood || 3), 0) / recentCheckins.length : 0;
    const avgEnergy = recentCheckins.length ? recentCheckins.reduce((a, c) => a + (c.energy || 3), 0) / recentCheckins.length : 0;
    const avgStress = recentCheckins.length ? recentCheckins.reduce((a, c) => a + (c.stress || 3), 0) / recentCheckins.length : 0;
    const exerciseDays = recentCheckins.filter(c => c.exercise).length;

    // Build comprehensive context
    const context = `
DEEP ANALYSIS REQUEST - 90 Day Comprehensive Review

USER DATA SUMMARY:
- Total tasks (90 days): ${tasks?.length || 0}
- Completed tasks: ${completedTasks.length} (${taskCompletionRate}%)
- Current streak: ${streaks?.current_streak || 0} days
- Longest streak: ${streaks?.longest_streak || 0} days
- Check-in streak: ${streaks?.checkin_streak || 0} days
- Perfect days: ${streaks?.perfect_days || 0}

WELLNESS AVERAGES (Last Week):
- Mood: ${avgMood.toFixed(1)}/5
- Energy: ${avgEnergy.toFixed(1)}/5
- Stress: ${avgStress.toFixed(1)}/5
- Exercise days: ${exerciseDays}/7

HABITS:
- Active habits: ${habits?.length || 0}
- Habit names: ${habits?.map(h => h.name).join(', ') || 'None'}
- Total habit logs: ${habitLogs?.length || 0}

GOALS:
- Active goals: ${goals?.filter(g => g.is_active).length || 0}
- Completed goals: ${goals?.filter(g => g.is_completed).length || 0}
- Goal titles: ${goals?.map(g => `${g.title} (${g.is_completed ? 'done' : 'active'})`).join(', ') || 'None'}

FOCUS TIME:
- Total focus sessions: ${focusSessions?.length || 0}
- Total minutes: ${focusSessions?.reduce((a, s) => a + (s.duration_minutes || 0), 0) || 0}

PREVIOUS AI ANALYSIS:
${aiProfile?.personality_traits ? `Personality: ${JSON.stringify(aiProfile.personality_traits)}` : 'First analysis'}
${aiProfile?.discovered_patterns ? `Known patterns: ${JSON.stringify(aiProfile.discovered_patterns.slice(0, 5))}` : ''}

USER'S PREVIOUS ANSWERS:
${aiProfile?.ai_questions_answered?.slice(-5).map((a: any) => `Q: ${a.questionId} A: ${a.answer}`).join('\n') || 'No previous answers'}

RECENT CHECK-INS DATA:
${checkins?.slice(0, 7).map(c => `${c.date}: mood=${c.mood}, energy=${c.energy}, stress=${c.stress}, exercise=${c.exercise}`).join('\n') || 'No recent check-ins'}
`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating deep analysis with Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are BetterMe\'s deep analysis AI. Generate detailed, personalized analysis based on user data.' },
          { role: 'user', content: `${context}\n\nGenerate a JSON response with personality_insights, behavioral_predictions, detailed_report, suggestions, and weekly_focus. Raw JSON only.` }
        ],
        temperature: 0.7,
        max_tokens: 2500,
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
    const generatedText = aiResponse.choices?.[0]?.message?.content || '';
    
    let analysis;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return basic structure
      analysis = {
        personality_insights: {
          type: 'Flexible',
          productivity_style: 'Building consistent habits',
          strengths: ['Commitment to tracking', 'Self-awareness'],
          growth_areas: ['Consistency', 'Work-life balance']
        },
        behavioral_predictions: [],
        detailed_report: {
          executive_summary: 'Keep tracking your progress to unlock deeper insights.',
          sleep_analysis: 'Continue logging sleep data for patterns.',
          mood_analysis: 'More check-ins will reveal mood trends.',
          productivity_analysis: `${taskCompletionRate}% task completion rate.`,
          exercise_analysis: `${exerciseDays} exercise days this week.`,
          correlations: [],
          key_insights: ['Consistency is building', 'Keep going!']
        },
        understanding_questions: [
          { id: 'q1', question: 'What motivates you to track your daily habits?', purpose: 'Understand your why', category: 'motivation' }
        ],
        suggestions: [
          { id: 's1', category: 'habits', priority: 'high', title: 'Daily Check-in', description: 'Complete your daily check-in every morning', expected_impact: 'Better self-awareness' }
        ],
        weekly_focus: {
          theme: 'Building Momentum',
          primary_goal: 'Consistency over perfection',
          daily_tips: ['Start small', 'Track everything', 'Celebrate wins']
        }
      };
    }

    // Update AI profile with deep analysis
    await supabase.from('ai_user_profile').upsert({
      user_id: user.id,
      personality_traits: analysis.personality_insights,
      detailed_report: analysis.detailed_report,
      suggestions: analysis.suggestions,
      ai_questions_asked: analysis.understanding_questions,
      last_analysis_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    console.log('Deep analysis complete');

    return new Response(JSON.stringify({
      success: true,
      analysis,
      stats: {
        taskCompletionRate,
        avgMood: Math.round(avgMood * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        currentStreak: streaks?.current_streak || 0,
        checkinStreak: streaks?.checkin_streak || 0,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-deep-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
