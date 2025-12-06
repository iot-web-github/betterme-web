import { motion } from 'framer-motion';
import { Task } from '@/types/schedule';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  tasks: Task[];
}

export const DashboardStats = ({ tasks }: DashboardStatsProps) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weeklyTasks = tasks.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  });

  const monthlyTasks = tasks.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });

  const weeklyCompleted = weeklyTasks.filter(
    t => t.status === 'completed' || t.status === 'completed-on-time'
  ).length;

  const monthlyCompleted = monthlyTasks.filter(
    t => t.status === 'completed' || t.status === 'completed-on-time'
  ).length;

  const weeklyOnTime = weeklyTasks.filter(t => t.status === 'completed-on-time').length;
  const monthlyOnTime = monthlyTasks.filter(t => t.status === 'completed-on-time').length;

  const weeklyRate = weeklyTasks.length > 0 
    ? Math.round((weeklyCompleted / weeklyTasks.length) * 100) 
    : 0;

  const monthlyRate = monthlyTasks.length > 0 
    ? Math.round((monthlyCompleted / monthlyTasks.length) * 100) 
    : 0;

  const stats = [
    {
      label: 'This Week',
      value: weeklyCompleted,
      subValue: `of ${weeklyTasks.length}`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'This Month',
      value: monthlyCompleted,
      subValue: `of ${monthlyTasks.length}`,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Weekly Rate',
      value: `${weeklyRate}%`,
      subValue: 'completion',
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'On Time',
      value: weeklyOnTime,
      subValue: 'this week',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.subValue}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
