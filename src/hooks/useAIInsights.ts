import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

const REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in ms
const LAST_REFRESH_KEY = 'ai_insights_last_refresh';

export const useAIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const hasAutoRefreshed = useRef(false);

  // Fetch the most recent insights (not just today's)
  const fetchInsights = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      
      // First try to get today's insights
      let { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // If no insights for today, get the most recent ones
      if (!data || data.length === 0) {
        const { data: recentData, error: recentError } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (recentError) throw recentError;
        data = recentData;
      }
      
      setInsights((data || []) as AIInsight[]);
      
      // Update last refresh time from localStorage
      const storedRefresh = localStorage.getItem(LAST_REFRESH_KEY);
      if (storedRefresh) {
        setLastRefreshTime(parseInt(storedRefresh, 10));
      }
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

  // Auto-refresh check on mount
  useEffect(() => {
    if (!user || hasAutoRefreshed.current) return;
    
    const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);
    const shouldAutoRefresh = !lastRefresh || 
      (Date.now() - parseInt(lastRefresh, 10)) > REFRESH_INTERVAL;
    
    if (shouldAutoRefresh && insights.length === 0) {
      hasAutoRefreshed.current = true;
      // Delay to avoid blocking initial render
      setTimeout(() => {
        generateInsights(true);
      }, 2000);
    }
  }, [user, insights.length]);

  const generateInsights = useCallback(async (isAutoRefresh = false) => {
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
          const errorMsg = 'AI is busy. Please try again in a moment.';
          setError(errorMsg);
          if (!isAutoRefresh) {
            toast.error(errorMsg);
          }
          return;
        }
        if (response.status === 402) {
          const errorMsg = 'AI credits exhausted. Please try again later.';
          setError(errorMsg);
          if (!isAutoRefresh) {
            toast.error(errorMsg);
          }
          return;
        }
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setStats(data.stats);
      
      // Store refresh time
      const now = Date.now();
      localStorage.setItem(LAST_REFRESH_KEY, now.toString());
      setLastRefreshTime(now);
      
      await fetchInsights();
      
      if (!isAutoRefresh) {
        toast.success('Insights generated!');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMsg);
      if (!isAutoRefresh) {
        toast.error(errorMsg);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating, fetchInsights]);

  // Calculate time until next refresh
  const getNextRefreshTime = useCallback(() => {
    if (!lastRefreshTime) return null;
    const nextRefresh = lastRefreshTime + REFRESH_INTERVAL;
    const remaining = nextRefresh - Date.now();
    if (remaining <= 0) return 'Ready to refresh';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `Auto-refresh in ${hours}h ${minutes}m`;
  }, [lastRefreshTime]);

  const dailySummary = insights.find(i => i.insight_type === 'daily_summary');
  const pattern = insights.find(i => i.insight_type === 'pattern');
  const recommendation = insights.find(i => i.insight_type === 'recommendation');
  const prediction = insights.find(i => i.insight_type === 'prediction');

  return {
    insights,
    dailySummary,
    pattern,
    recommendation,
    prediction,
    stats,
    isLoading,
    isGenerating,
    error,
    lastRefreshTime,
    nextRefreshTime: getNextRefreshTime(),
    generateInsights: () => generateInsights(false),
    refetch: fetchInsights
  };
};
