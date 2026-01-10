import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { useScheduleDB } from '@/hooks/useScheduleDB';
import { useAppTime, TimeFilter } from '@/hooks/useAppTime';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  CheckCircle, 
  Zap, 
  Heart,
  Clock,
  Target,
} from 'lucide-react';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

export const TimeFilteredInsights = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('week');
  const { checkIns } = useLifeTracking();
  const { tasks: allTasks } = useScheduleDB();
  const { getDateRange } = useAppTime();

  const insights = useMemo(() => {
    const range = getDateRange(activeFilter);
    
    // Filter check-ins by date range
    const filteredCheckIns = checkIns.filter(c => {
      const date = parseISO(c.date);
      return isWithinInterval(date, { start: range.start, end: range.end });
    });

    // Filter tasks by date range
    const filteredTasks = allTasks.filter(t => {
      if (!t.scheduled_date) return false;
      const date = parseISO(t.scheduled_date);
      return isWithinInterval(date, { start: range.start, end: range.end });
    });

    // Calculate averages
    const avgMood = filteredCheckIns.length > 0
      ? filteredCheckIns.reduce((sum, c) => sum + c.mood, 0) / filteredCheckIns.length
      : 0;
    
    const avgEnergy = filteredCheckIns.length > 0
      ? filteredCheckIns.reduce((sum, c) => sum + c.energy, 0) / filteredCheckIns.length
      : 0;

    // Calculate sleep average
    let totalSleepMinutes = 0;
    let sleepCount = 0;
    filteredCheckIns.forEach(c => {
      if (c.sleepTime && c.wakeUpTime) {
        const [sleepH, sleepM] = c.sleepTime.split(':').map(Number);
        const [wakeH, wakeM] = c.wakeUpTime.split(':').map(Number);
        let sleepMins = sleepH * 60 + sleepM;
        let wakeMins = wakeH * 60 + wakeM;
        if (sleepMins > wakeMins) wakeMins += 24 * 60;
        totalSleepMinutes += wakeMins - sleepMins;
        sleepCount++;
      }
    });
    const avgSleep = sleepCount > 0 ? Math.round((totalSleepMinutes / sleepCount / 60) * 10) / 10 : 0;

    // Task completion
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = filteredTasks.length > 0
      ? Math.round((completedTasks / filteredTasks.length) * 100)
      : 0;

    // Exercise days
    const exerciseDays = filteredCheckIns.filter(c => c.exercise).length;
    
    // Streaks (consecutive days with check-ins)
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      if (filteredCheckIns.some(c => c.date === date)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      checkInCount: filteredCheckIns.length,
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgSleep,
      completedTasks,
      totalTasks: filteredTasks.length,
      taskCompletionRate,
      exerciseDays,
      currentStreak,
      period: range.label,
    };
  }, [activeFilter, checkIns, allTasks, getDateRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Insights
        </h3>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 mb-4">
        {TIME_FILTERS.map(filter => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(filter.key)}
            className={`flex-1 h-8 text-xs ${
              activeFilter === filter.key 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mood */}
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Avg Mood</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {insights.avgMood > 0 ? `${insights.avgMood}/5` : '--'}
          </p>
        </div>

        {/* Energy */}
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Avg Energy</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {insights.avgEnergy > 0 ? `${insights.avgEnergy}/5` : '--'}
          </p>
        </div>

        {/* Sleep */}
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Sleep</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {insights.avgSleep > 0 ? `${insights.avgSleep}h` : '--'}
          </p>
        </div>

        {/* Tasks */}
        <div className="p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Tasks Done</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {insights.completedTasks}/{insights.totalTasks}
          </p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mt-4 p-3 rounded-xl bg-secondary/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-info" />
            Task Completion Rate
          </span>
          <span className="text-sm font-bold text-foreground">{insights.taskCompletionRate}%</span>
        </div>
        <Progress value={insights.taskCompletionRate} className="h-2" />
      </div>

      {/* Bottom Stats */}
      <div className="flex justify-between mt-4 pt-4 border-t border-border/30">
        <div className="text-center">
          <p className="text-lg font-display font-bold text-foreground">{insights.exerciseDays}</p>
          <p className="text-xs text-muted-foreground">Exercise Days</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-foreground">{insights.checkInCount}</p>
          <p className="text-xs text-muted-foreground">Check-ins</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-primary">{insights.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>
    </motion.div>
  );
};
