import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Lightbulb, Clock, Calendar } from 'lucide-react';
import { useProductivityInsights } from '@/hooks/useProductivityInsights';

export const CorrelationInsights = () => {
  const { correlations, patterns, recommendations, weeklyComparison } = useProductivityInsights();

  const getCorrelationColor = (impact: 'positive' | 'negative' | 'neutral') => {
    if (impact === 'positive') return 'bg-success/20 border-success/30';
    if (impact === 'negative') return 'bg-destructive/20 border-destructive/30';
    return 'bg-muted border-border';
  };

  const getCorrelationIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    if (impact === 'positive') return <TrendingUp className="w-4 h-4 text-success" />;
    if (impact === 'negative') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Insights</h3>
          <p className="text-xs text-muted-foreground">Patterns in your data</p>
        </div>
        <Lightbulb className="w-5 h-5 text-warning" />
      </div>

      {/* Correlation Cards */}
      <div className="space-y-3 mb-6">
        {correlations.length > 0 ? (
          correlations.slice(0, 4).map((correlation, index) => (
            <motion.div
              key={correlation.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border ${getCorrelationColor(correlation.impact)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{correlation.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{correlation.title}</span>
                    {getCorrelationIcon(correlation.impact)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{correlation.description}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Complete more check-ins to see insights</p>
          </div>
        )}
      </div>

      {/* Productivity Patterns */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-3 rounded-xl bg-primary/10 border border-primary/20"
        >
          <Clock className="w-4 h-4 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Peak Hour</p>
          <p className="text-lg font-display font-bold text-foreground">
            {patterns.bestHour}:00
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-xl bg-info/10 border border-info/20"
        >
          <Calendar className="w-4 h-4 text-info mb-2" />
          <p className="text-xs text-muted-foreground">Best Day</p>
          <p className="text-lg font-display font-bold text-foreground">
            {patterns.bestDay.slice(0, 3)}
          </p>
        </motion.div>
      </div>

      {/* Weekly Comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-3 rounded-xl bg-secondary/50 border border-border/50 mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">This week vs last</p>
            <p className="text-sm font-medium text-foreground">
              {weeklyComparison.tasksThisWeek} tasks
            </p>
          </div>
          <div className={`flex items-center gap-1 ${weeklyComparison.percentChange >= 0 ? 'text-success' : 'text-destructive'}`}>
            {weeklyComparison.percentChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {weeklyComparison.percentChange >= 0 ? '+' : ''}{weeklyComparison.percentChange}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Recommendations:</p>
          {recommendations.slice(0, 2).map((rec, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-xs text-foreground/80 mb-1"
            >
              💡 {rec}
            </motion.p>
          ))}
        </div>
      )}
    </motion.div>
  );
};
