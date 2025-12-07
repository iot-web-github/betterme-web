import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Droplet, Moon, Brain, Target, Dumbbell, Heart } from 'lucide-react';
import { useLifeScore } from '@/hooks/useLifeScore';
import { Progress } from '@/components/ui/progress';

const scoreCategories = [
  { key: 'sleep', label: 'Sleep', icon: Moon, color: 'hsl(var(--info))' },
  { key: 'mood', label: 'Mood', icon: Heart, color: 'hsl(var(--category-social))' },
  { key: 'productivity', label: 'Tasks', icon: Target, color: 'hsl(var(--primary))' },
  { key: 'habits', label: 'Habits', icon: Brain, color: 'hsl(var(--category-learning))' },
  { key: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'hsl(var(--success))' },
  { key: 'hydration', label: 'Water', icon: Droplet, color: 'hsl(var(--info))' },
] as const;

export const LifeScoreCard = () => {
  const { totalScore, breakdown, trend, insights } = useLifeScore();

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Life Score</h3>
          <p className="text-xs text-muted-foreground">Your overall wellness</p>
        </div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-xs ${trendColor}`}>
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
          </span>
        </motion.div>
      </div>

      {/* Main Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          className="relative w-32 h-32"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(totalScore / 100) * 352} 352` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--info))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-display font-bold ${getScoreColor(totalScore)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {totalScore}
            </motion.span>
            <span className="text-xs text-muted-foreground">out of 100</span>
          </div>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-4">
        {scoreCategories.map((cat, index) => {
          const Icon = cat.icon;
          const score = breakdown[cat.key];
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{cat.label}</span>
                  <span className="text-xs font-medium text-foreground">{score}%</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Quick tips:</p>
          {insights.map((insight, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-xs text-foreground/80 mb-1"
            >
              • {insight}
            </motion.p>
          ))}
        </div>
      )}
    </motion.div>
  );
};
