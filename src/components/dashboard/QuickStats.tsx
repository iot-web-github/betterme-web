import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, Calendar, Activity } from 'lucide-react';
import { DailyStats, Task } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

interface QuickStatsProps {
  dailyStats: DailyStats;
  allTasks: Task[];
  selectedDate: string;
}

export const QuickStats = ({ dailyStats, allTasks, selectedDate }: QuickStatsProps) => {
  // Calculate weekly comparison
  const lastWeekDate = format(subDays(new Date(selectedDate), 7), 'yyyy-MM-dd');
  const lastWeekTasks = allTasks.filter(t => t.date === lastWeekDate);
  const lastWeekCompleted = lastWeekTasks.filter(t => 
    t.status === 'completed' || t.status === 'completed-on-time'
  ).length;
  
  const completionChange = dailyStats.totalTasks > 0 && lastWeekTasks.length > 0
    ? Math.round(((dailyStats.completedTasks / dailyStats.totalTasks) - 
        (lastWeekCompleted / lastWeekTasks.length)) * 100)
    : 0;

  // Calculate average task duration
  const totalMinutes = Object.values(dailyStats.timeByCategory).reduce((a, b) => a + b, 0);
  const avgDuration = dailyStats.totalTasks > 0 
    ? Math.round(totalMinutes / dailyStats.totalTasks) 
    : 0;

  const stats = [
    {
      label: 'Completion Rate',
      value: dailyStats.totalTasks > 0 
        ? `${Math.round((dailyStats.completedTasks / dailyStats.totalTasks) * 100)}%` 
        : '0%',
      change: completionChange,
      icon: Activity,
      color: 'primary',
    },
    {
      label: 'Avg Duration',
      value: avgDuration > 0 ? `${avgDuration}m` : '-',
      icon: Clock,
      color: 'info',
    },
    {
      label: 'Total Time',
      value: totalMinutes > 60 
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` 
        : `${totalMinutes}m`,
      icon: Calendar,
      color: 'success',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h3>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-md",
                stat.color === 'primary' && "bg-primary/20 text-primary",
                stat.color === 'info' && "bg-info/20 text-info",
                stat.color === 'success' && "bg-success/20 text-success",
              )}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{stat.value}</span>
              {stat.change !== undefined && stat.change !== 0 && (
                <span className={cn(
                  "flex items-center text-[10px]",
                  stat.change > 0 ? "text-success" : "text-destructive"
                )}>
                  {stat.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
