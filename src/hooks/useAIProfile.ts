import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PersonalityInsights {
  type: string;
  productivity_style: string;
  strengths: string[];
  growth_areas: string[];
}

export interface BehavioralPrediction {
  type: string;
  prediction: string;
  confidence: number;
  timeframe: string;
}

export interface Correlation {
  factor1: string;
  factor2: string;
  correlation: string;
  insight: string;
}

export interface DetailedReport {
  executive_summary: string;
  sleep_analysis: string;
  mood_analysis: string;
  productivity_analysis: string;
  exercise_analysis: string;
  correlations: Correlation[];
  key_insights: string[];
}

export interface AIQuestion {
  id: string;
  question: string;
  purpose: string;
  category: string;
}

export interface AISuggestion {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  expected_impact: string;
  implemented?: boolean;
  dismissed?: boolean;
}

export interface WeeklyFocus {
  theme: string;
  primary_goal: string;
  daily_tips: string[];
}

export interface DeepAnalysis {
  personality_insights: PersonalityInsights;
  behavioral_predictions: BehavioralPrediction[];
  detailed_report: DetailedReport;
  understanding_questions: AIQuestion[];
  suggestions: AISuggestion[];
  weekly_focus: WeeklyFocus;
}

export interface AIProfile {
  personality_traits: PersonalityInsights | null;
  discovered_patterns: any[];
  ai_questions_asked: AIQuestion[];
  ai_questions_answered: any[];
  detailed_report: DetailedReport | null;
  suggestions: AISuggestion[];
  last_analysis_at: string | null;
}

export const useAIProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ai_user_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (data) {
        setProfile({
          personality_traits: data.personality_traits as unknown as PersonalityInsights | null,
          discovered_patterns: (data.discovered_patterns as unknown as any[]) || [],
          ai_questions_asked: (data.ai_questions_asked as unknown as AIQuestion[]) || [],
          ai_questions_answered: (data.ai_questions_answered as unknown as any[]) || [],
          detailed_report: data.detailed_report as unknown as DetailedReport | null,
          suggestions: (data.suggestions as unknown as AISuggestion[]) || [],
          last_analysis_at: data.last_analysis_at,
        });
      }
    } catch (err) {
      console.error('Error fetching AI profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const runDeepAnalysis = useCallback(async () => {
    if (!user || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://mpcavptnwtcoyubhurck.supabase.co/functions/v1/ai-deep-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'analyze' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      await fetchProfile();
      return data.analysis;
    } catch (err) {
      console.error('Error running deep analysis:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, isAnalyzing, fetchProfile]);

  const answerQuestion = useCallback(async (questionId: string, answer: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(
        `https://mpcavptnwtcoyubhurck.supabase.co/functions/v1/ai-deep-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'answer_question', questionId, answer }),
        }
      );

      if (!response.ok) throw new Error('Failed to save answer');
      
      await fetchProfile();
    } catch (err) {
      console.error('Error answering question:', err);
      throw err;
    }
  }, [user, fetchProfile]);

  const updateSuggestion = useCallback(async (suggestionId: string, update: { implemented?: boolean; dismissed?: boolean }) => {
    if (!user || !profile) return;

    const updatedSuggestions = profile.suggestions.map(s => 
      s.id === suggestionId ? { ...s, ...update } : s
    );

    const { error } = await supabase
      .from('ai_user_profile')
      .update({ suggestions: updatedSuggestions as unknown as any })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, suggestions: updatedSuggestions } : null);
    }
  }, [user, profile]);

  return {
    profile,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    runDeepAnalysis,
    answerQuestion,
    updateSuggestion,
    refetch: fetchProfile,
  };
};
