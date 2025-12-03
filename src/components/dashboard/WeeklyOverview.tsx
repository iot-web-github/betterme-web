import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Task } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';

interface WeeklyOverviewProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const WeeklyOverview = ({ tasks, selectedDate, onDateSelect }: WeeklyOverviewProps) => {
  const today = new Date();
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const completedCount = dayTasks.filter(t => 
      t.status === 'completed' || t.status === 'completed-on-time'
    ).length;
    const missedCount = dayTasks.filter(t => t.status === 'missed').length;
    
    return {
      date,
      dateStr,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: isSameDay(date, today),
      isSelected: dateStr === selectedDate,
      taskCount: dayTasks.length,
      completedCount,
      missedCount,
      completionRate: dayTasks.length > 0 
        ? Math.round((completedCount / dayTasks.length) * 100) 
        : 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Overview</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDateSelect(day.dateStr)}
            className={cn(
              "relative flex flex-col items-center p-2 rounded-lg transition-all duration-200",
              day.isSelected 
                ? "bg-primary text-primary-foreground shadow-glow" 
                : day.isToday 
                  ? "bg-secondary ring-2 ring-primary/50" 
                  : "hover:bg-secondary/70"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={cn(
              "text-[10px] uppercase tracking-wider mb-1",
              day.isSelected ? "text-primary-foreground" : "text-muted-foreground"
            )}>
              {day.dayName}
            </span>
            <span className={cn(
              "text-lg font-bold",
              day.isSelected ? "text-primary-foreground" : "text-foreground"
            )}>
              {day.dayNumber}
            </span>
            
            {/* Task indicators */}
            <div className="flex items-center gap-0.5 mt-1">
              {day.taskCount > 0 ? (
                <>
                  {day.completedCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                  {day.taskCount - day.completedCount - day.missedCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  )}
                  {day.missedCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  )}
                </>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Week summary */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">This week</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              {weekDays.reduce((a, d) => a + d.completedCount, 0)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Circle className="w-3 h-3" />
              {weekDays.reduce((a, d) => a + (d.taskCount - d.completedCount - d.missedCount), 0)}
            </span>
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="w-3 h-3" />
              {weekDays.reduce((a, d) => a + d.missedCount, 0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
