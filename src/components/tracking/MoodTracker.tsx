import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { MOOD_EMOJIS } from '@/types/schedule';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MoodTracker = () => {
  const { getMoodTrend, getWeeklyStats } = useLifeTracking();
  const moodTrend = getMoodTrend(7);
  const weeklyStats = getWeeklyStats();

  const getTrendIcon = () => {
    const recentMoods = moodTrend.filter(m => m.mood > 0);
    if (recentMoods.length < 2) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    const recent = recentMoods.slice(-3).reduce((sum, m) => sum + m.mood, 0) / Math.min(3, recentMoods.length);
    const earlier = recentMoods.slice(0, -3).reduce((sum, m) => sum + m.mood, 0) / Math.max(1, recentMoods.length - 3);
    
    if (recent > earlier + 0.5) return <TrendingUp className="w-4 h-4 text-success" />;
    if (recent < earlier - 0.5) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Heart className="w-5 h-5 text-destructive" />
          Mood This Week
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {getTrendIcon()}
          <span>{weeklyStats.averageMood > 0 ? weeklyStats.averageMood.toFixed(1) : '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {moodTrend.map((day, idx) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col items-center"
          >
            <span className="text-xs text-muted-foreground mb-1">
              {format(subDays(new Date(), 6 - idx), 'EEE')}
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                day.mood > 0
                  ? 'bg-secondary'
                  : 'bg-secondary/30'
              }`}
            >
              {day.mood > 0 ? MOOD_EMOJIS[day.mood as 1 | 2 | 3 | 4 | 5] : '—'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mood Distribution */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex justify-between items-center">
          {([1, 2, 3, 4, 5] as const).map((level) => {
            const count = moodTrend.filter(m => m.mood === level).length;
            return (
              <div key={level} className="text-center">
                <span className="text-lg">{MOOD_EMOJIS[level]}</span>
                <div className="text-xs text-muted-foreground mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
