import { motion } from 'framer-motion';
import { Task } from '@/types/schedule';
import { format, subDays, startOfDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyTrendsProps {
  tasks: Task[];
}

export const WeeklyTrends = ({ tasks }: WeeklyTrendsProps) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(startOfDay(date), 'yyyy-MM-dd');
  });

  const dailyData = last7Days.map(date => {
    const dayTasks = tasks.filter(t => t.date === date);
    const completed = dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
    const total = dayTasks.length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date, completed, total, score };
  });

  const maxScore = Math.max(...dailyData.map(d => d.score), 100);
  const avgScore = Math.round(dailyData.reduce((acc, d) => acc + d.score, 0) / 7);
  
  const prevWeekAvg = (() => {
    const prev7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 13 - i), 'yyyy-MM-dd')
    );
    const prevData = prev7Days.map(date => {
      const dayTasks = tasks.filter(t => t.date === date);
      const completed = dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
      const total = dayTasks.length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    return Math.round(prevData.reduce((acc, s) => acc + s, 0) / 7);
  })();

  const trend = avgScore - prevWeekAvg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground">Weekly Productivity</h3>
          <p className="text-sm text-muted-foreground">Last 7 days performance</p>
        </div>
        <div className="flex items-center gap-2">
          {trend > 0 ? (
            <div className="flex items-center gap-1 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{trend}%</span>
            </div>
          ) : trend < 0 ? (
            <div className="flex items-center gap-1 text-rose-500">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Minus className="w-4 h-4" />
              <span className="text-sm font-medium">0%</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {dailyData.map((day, index) => (
          <motion.div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-2"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="w-full flex-1 flex items-end">
              <motion.div
                className={`w-full rounded-t-md transition-colors ${
                  day.score >= 80 ? 'bg-emerald-500' :
                  day.score >= 50 ? 'bg-primary' :
                  day.score > 0 ? 'bg-amber-500' :
                  'bg-secondary'
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${(day.score / maxScore) * 100}%` }}
                transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                style={{ minHeight: day.score > 0 ? 8 : 4 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(day.date), 'EEE')}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Average Score */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
        <span className="text-sm text-muted-foreground">Weekly Average:</span>
        <span className="text-lg font-display font-bold text-foreground">{avgScore}%</span>
      </div>
    </motion.div>
  );
};
