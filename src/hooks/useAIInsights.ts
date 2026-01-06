import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AIInsight {
  id: string;
  user_id: string;
  date: string;
  insight_type: 'daily_summary' | 'recommendation' | 'pattern' | 'prediction' | 'correlation';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InsightStats {
  taskCompletionRate: number;
  habitCompletionRate: number;
  avgMood: number;
  avgEnergy: number;
  avgStress?: number;
  avgSleep?: number;
  exerciseDays?: number;
  totalFocusMinutes: number;
  currentStreak?: number;
  checkinStreak?: number;
}

export const useAIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInsights((data || []) as AIInsight[]);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const generateInsights = useCallback(async () => {
    if (!user || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://mpcavptnwtcoyubhurck.supabase.co/functions/v1/ai-insights`,
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
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error('AI is busy. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setStats(data.stats);
      await fetchInsights();
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating, fetchInsights]);

  const dailySummary = insights.find(i => i.insight_type === 'daily_summary');
  const pattern = insights.find(i => i.insight_type === 'pattern');
  const recommendation = insights.find(i => i.insight_type === 'recommendation');

  return {
    insights,
    dailySummary,
    pattern,
    recommendation,
    stats,
    isLoading,
    isGenerating,
    error,
    generateInsights,
    refetch: fetchInsights
  };
};
