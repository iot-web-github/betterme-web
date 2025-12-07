import { motion } from 'framer-motion';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { useHabits } from '@/hooks/useHabits';
import { useSchedule } from '@/hooks/useSchedule';
import { format } from 'date-fns';
import {
  TrendingUp,
  Target,
  Sparkles,
  Moon,
  Smartphone,
  Droplets,
  Heart,
} from 'lucide-react';

export const WeeklyReview = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { getWeeklyStats } = useLifeTracking();
  const { habits, getTodayProgress } = useHabits();
  const { allTasks } = useSchedule(today);
  
  const weeklyStats = getWeeklyStats();
  const habitProgress = getTodayProgress();
  
  // Calculate weekly task completion
  const weekTasks = allTasks.filter(t => {
    const taskDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo;
  });
  
  const completedTasks = weekTasks.filter(t => 
    t.status === 'completed' || t.status === 'completed-on-time'
  ).length;

  const insights = [
    {
      icon: Heart,
      label: 'Mood',
      value: weeklyStats.averageMood > 0 ? weeklyStats.averageMood.toFixed(1) : '--',
      suffix: '/5',
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
    },
    {
      icon: Moon,
      label: 'Sleep',
      value: weeklyStats.averageSleep > 0 ? weeklyStats.averageSleep.toFixed(1) : '--',
      suffix: 'h',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: Smartphone,
      label: 'Phone',
      value: weeklyStats.averagePhoneUsage > 0 ? Math.floor(weeklyStats.averagePhoneUsage / 60) : '--',
      suffix: 'h',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      icon: Droplets,
      label: 'Water',
      value: weeklyStats.waterAverage > 0 ? weeklyStats.waterAverage.toFixed(0) : '--',
      suffix: '💧',
      color: 'text-info',
      bgColor: 'bg-info/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-warning" />
          Weekly Review
        </h3>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${insight.bgColor} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                {insight.value}
                <span className="text-xs text-muted-foreground">{insight.suffix}</span>
              </p>
              <p className="text-xs text-muted-foreground">{insight.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Tasks</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {completedTasks}
            <span className="text-sm text-muted-foreground font-normal">/{weekTasks.length}</span>
          </p>
          <p className="text-xs text-muted-foreground">completed this week</p>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-info" />
            <span className="text-sm text-muted-foreground">Exercise</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {weeklyStats.exerciseDays}
            <span className="text-sm text-muted-foreground font-normal">/7</span>
          </p>
          <p className="text-xs text-muted-foreground">days this week</p>
        </div>
      </div>
    </motion.div>
  );
};
