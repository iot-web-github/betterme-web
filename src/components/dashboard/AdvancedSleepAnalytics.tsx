import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { useRoutineDetection } from '@/hooks/useRoutineDetection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Sun, TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format, subDays, parseISO } from 'date-fns';

export const AdvancedSleepAnalytics = () => {
  const { checkIns, getWeeklyStats } = useLifeTracking();
  const routine = useRoutineDetection();
  const weeklyStats = getWeeklyStats();

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const checkIn = checkIns.find(c => c.date === date);
      
      let sleepHours = 0;
      if (checkIn?.sleepTime && checkIn?.wakeUpTime) {
        const [sleepH, sleepM] = checkIn.sleepTime.split(':').map(Number);
        const [wakeH, wakeM] = checkIn.wakeUpTime.split(':').map(Number);
        let sleepMins = sleepH * 60 + sleepM;
        let wakeMins = wakeH * 60 + wakeM;
        if (sleepMins > wakeMins) wakeMins += 24 * 60;
        sleepHours = Math.round(((wakeMins - sleepMins) / 60) * 10) / 10;
      }
      
      data.push({
        date: format(subDays(new Date(), i), 'EEE'),
        sleep: sleepHours,
        goal: 8,
      });
    }
    return data;
  }, [checkIns]);

  const sleepGoal = 8;
  const avgSleep = weeklyStats.averageSleep;
  const sleepPercentage = Math.min((avgSleep / sleepGoal) * 100, 100);
  const sleepDeficit = Math.max(0, sleepGoal - avgSleep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          Sleep Analytics
        </h3>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>

      {/* Sleep Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <YAxis hide domain={[0, 12]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value}h`, 'Sleep']}
            />
            <Area
              type="monotone"
              dataKey="sleep"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#sleepGradient)"
            />
            <Area
              type="monotone"
              dataKey="goal"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Duration</span>
          </div>
          <p className="text-lg font-display font-bold text-foreground">
            {avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : '--'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Goal Progress</span>
          </div>
          <p className="text-lg font-display font-bold text-foreground">
            {Math.round(sleepPercentage)}%
          </p>
        </div>
      </div>

      {/* Bedtime & Wake Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10">
          <Moon className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Bedtime</p>
            <p className="text-sm font-bold text-foreground">{routine.averageSleepTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10">
          <Sun className="w-5 h-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Wake</p>
            <p className="text-sm font-bold text-foreground">{routine.averageWakeTime}</p>
          </div>
        </div>
      </div>

      {/* Consistency Scores */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Bedtime Consistency</span>
            <span className="font-medium text-foreground">{routine.sleepTimeConsistency}%</span>
          </div>
          <Progress value={routine.sleepTimeConsistency} className="h-1.5" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Wake Time Consistency</span>
            <span className="font-medium text-foreground">{routine.wakeTimeConsistency}%</span>
          </div>
          <Progress value={routine.wakeTimeConsistency} className="h-1.5" />
        </div>
      </div>

      {/* Insight */}
      {sleepDeficit > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning flex items-start gap-2">
            <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              You're averaging {sleepDeficit.toFixed(1)}h less than your 8h goal. 
              Try going to bed {Math.round(sleepDeficit * 60)} minutes earlier.
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};
