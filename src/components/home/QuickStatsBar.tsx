import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Target, Zap } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useStreaks } from '@/hooks/useStreaks';
import { useScheduleDB } from '@/hooks/useScheduleDB';

export const QuickStatsBar = () => {
  const { getTodayProgress } = useHabits();
  const { tasksForDate } = useScheduleDB();
  const { streakData } = useStreaks([]);

  const habitsProgress = getTodayProgress();
  const completedTasks = tasksForDate.filter(t => t.status === 'completed').length;

  const stats = [
    {
      label: 'Tasks Done',
      value: `${completedTasks}/${tasksForDate.length}`,
      icon: CheckCircle2,
      color: 'from-success to-info',
    },
    {
      label: 'Habits',
      value: `${habitsProgress.completed}/${habitsProgress.total}`,
      icon: Target,
      color: 'from-primary to-info',
    },
    {
      label: 'Streak',
      value: `${streakData.currentStreak}d`,
      icon: Flame,
      color: 'from-warning to-destructive',
    },
    {
      label: 'Energy',
      value: 'High',
      icon: Zap,
      color: 'from-warning to-success',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid grid-cols-4 gap-2"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 + idx * 0.03 }}
          className="glass rounded-xl p-3 text-center"
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
            <stat.icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
