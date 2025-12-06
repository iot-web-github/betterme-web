import { motion } from 'framer-motion';
import { Task } from '@/types/schedule';
import { Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react';

interface ProductiveHoursProps {
  tasks: Task[];
}

export const ProductiveHours = ({ tasks }: ProductiveHoursProps) => {
  const completedTasks = tasks.filter(
    t => t.status === 'completed' || t.status === 'completed-on-time'
  );

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const tasksInHour = completedTasks.filter(t => {
      const startHour = parseInt(t.startTime.split(':')[0]);
      return startHour === hour;
    });
    return { hour, count: tasksInHour.length };
  });

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  // Find peak hours (top 3)
  const peakHours = [...hourlyData]
    .sort((a, b) => b.count - a.count)
    .filter(h => h.count > 0)
    .slice(0, 3);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const getTimeOfDayIcon = (hour: number) => {
    if (hour >= 5 && hour < 9) return <Sunrise className="w-4 h-4 text-amber-500" />;
    if (hour >= 9 && hour < 17) return <Sun className="w-4 h-4 text-yellow-500" />;
    if (hour >= 17 && hour < 21) return <Sunset className="w-4 h-4 text-orange-500" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  // Group by time of day
  const timeOfDay = {
    morning: hourlyData.slice(5, 12).reduce((acc, h) => acc + h.count, 0),
    afternoon: hourlyData.slice(12, 17).reduce((acc, h) => acc + h.count, 0),
    evening: hourlyData.slice(17, 21).reduce((acc, h) => acc + h.count, 0),
    night: hourlyData.slice(21, 24).reduce((acc, h) => acc + h.count, 0) + 
           hourlyData.slice(0, 5).reduce((acc, h) => acc + h.count, 0),
  };

  const totalCompleted = completedTasks.length;
  const getMostProductiveTime = () => {
    const entries = Object.entries(timeOfDay);
    const max = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return max[1] > 0 ? max[0] : null;
  };

  const mostProductive = getMostProductiveTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-foreground">Productive Hours</h3>
          <p className="text-sm text-muted-foreground">When you get things done</p>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>

      {totalCompleted === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Complete tasks to see your patterns</p>
        </div>
      ) : (
        <>
          {/* Peak Hours */}
          {peakHours.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Peak hours</p>
              <div className="flex flex-wrap gap-2">
                {peakHours.map((peak, index) => (
                  <motion.div
                    key={peak.hour}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                  >
                    {getTimeOfDayIcon(peak.hour)}
                    <span className="text-sm font-medium text-foreground">
                      {formatHour(peak.hour)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({peak.count})
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Time of Day Distribution */}
          <div className="space-y-3">
            {[
              { key: 'morning', label: 'Morning', icon: <Sunrise className="w-4 h-4" />, color: 'bg-amber-500' },
              { key: 'afternoon', label: 'Afternoon', icon: <Sun className="w-4 h-4" />, color: 'bg-yellow-500' },
              { key: 'evening', label: 'Evening', icon: <Sunset className="w-4 h-4" />, color: 'bg-orange-500' },
              { key: 'night', label: 'Night', icon: <Moon className="w-4 h-4" />, color: 'bg-indigo-400' },
            ].map(({ key, label, icon, color }) => {
              const count = timeOfDay[key as keyof typeof timeOfDay];
              const percentage = totalCompleted > 0 ? (count / totalCompleted) * 100 : 0;
              
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-secondary ${key === mostProductive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">{count} tasks</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
};
