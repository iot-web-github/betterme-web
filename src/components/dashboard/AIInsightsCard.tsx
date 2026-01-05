import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIInsights } from '@/hooks/useAIInsights';

export const AIInsightsCard = () => {
  const {
    dailySummary,
    pattern,
    recommendation,
    isLoading,
    isGenerating,
    error,
    generateInsights
  } = useAIInsights();

  const hasInsights = dailySummary || pattern || recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground">AI Insights</h3>
            <p className="text-xs text-muted-foreground">Personalized analysis</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateInsights}
          disabled={isGenerating}
          className="h-8 px-3 text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasInsights ? (
        <div className="space-y-3">
          {dailySummary && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{dailySummary.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {dailySummary.content}
              </p>
            </motion.div>
          )}

          {pattern && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-info" />
                <span className="text-xs font-medium text-foreground">{pattern.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pattern.content}
              </p>
            </motion.div>
          )}

          {recommendation && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-medium text-foreground">{recommendation.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recommendation.content}
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">No insights yet</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Generate AI-powered analysis of your data
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
            className="h-8 px-4 text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Insights
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
