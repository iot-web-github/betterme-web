import { motion } from 'framer-motion';
import { Task, CATEGORY_ICONS } from '@/types/schedule';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Clock, ChevronRight } from 'lucide-react';

interface UpcomingTasksProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  limit?: number;
}

export const UpcomingTasks = ({ tasks, onTaskClick, limit = 5 }: UpcomingTasksProps) => {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = format(new Date(), 'HH:mm');

  const upcomingTasks = tasks
    .filter(t => {
      if (t.status !== 'pending') return false;
      if (t.date < today) return false;
      if (t.date === today && t.startTime < currentTime) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, limit);

  const getDateLabel = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE, MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-rose-500';
      case 'medium': return 'border-l-amber-500';
      default: return 'border-l-emerald-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground">Upcoming Tasks</h3>
        <Clock className="w-4 h-4 text-muted-foreground" />
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No upcoming tasks</p>
          <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.map((task, index) => (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTaskClick?.(task)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors border-l-4 ${getPriorityColor(task.priority)} text-left group`}
            >
              <span className="text-lg">{CATEGORY_ICONS[task.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getDateLabel(task.date)} • {task.startTime}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
