import { motion } from 'framer-motion';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { Moon, Sun, TrendingUp, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SleepAnalysis = () => {
  const { getWeeklyStats, checkIns } = useLifeTracking();
  const weeklyStats = getWeeklyStats();
  
  // Calculate average sleep and wake times from recent check-ins
  const recentCheckIns = checkIns.slice(-7);
  
  const avgSleep = weeklyStats.averageSleep;
  const sleepGoal = 8; // hours
  const sleepPercentage = Math.min((avgSleep / sleepGoal) * 100, 100);

  // Get most common sleep/wake times
  const getAverageTime = (times: string[]): string => {
    if (times.length === 0) return '--:--';
    const totalMinutes = times.reduce((sum, time) => {
      const [h, m] = time.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0);
    const avgMinutes = Math.round(totalMinutes / times.length);
    const hours = Math.floor(avgMinutes / 60) % 24;
    const minutes = avgMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const avgSleepTime = getAverageTime(recentCheckIns.map(c => c.sleepTime).filter(Boolean));
  const avgWakeTime = getAverageTime(recentCheckIns.map(c => c.wakeUpTime).filter(Boolean));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          Sleep Analysis
        </h3>
      </div>

      {/* Average Sleep Duration */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Average Sleep</span>
          <span className="text-sm font-medium text-foreground">
            {avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : '--'} / {sleepGoal}h goal
          </span>
        </div>
        <Progress value={sleepPercentage} className="h-2" />
        {avgSleep > 0 && avgSleep < sleepGoal && (
          <p className="text-xs text-warning mt-1">
            You're {(sleepGoal - avgSleep).toFixed(1)}h short of your goal
          </p>
        )}
      </div>

      {/* Sleep & Wake Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg. Bedtime</p>
            <p className="text-lg font-display font-bold text-foreground">{avgSleepTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Sun className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg. Wake</p>
            <p className="text-lg font-display font-bold text-foreground">{avgWakeTime}</p>
          </div>
        </div>
      </div>

      {/* Sleep Tip */}
      <div className="mt-4 p-3 rounded-xl bg-info/10 border border-info/20">
        <p className="text-xs text-info flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {avgSleep >= 7 && avgSleep <= 9
              ? "Great job! You're getting the recommended 7-9 hours of sleep."
              : avgSleep < 7
              ? "Try to get at least 7 hours of sleep for better health and productivity."
              : "You're sleeping more than average. Consider if you're feeling well-rested."}
          </span>
        </p>
      </div>
    </motion.div>
  );
};
