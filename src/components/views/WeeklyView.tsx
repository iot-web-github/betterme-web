import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Task, CATEGORY_LABELS } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface WeeklyViewProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  work: 'bg-category-work/20 border-category-work',
  personal: 'bg-category-personal/20 border-category-personal',
  health: 'bg-category-health/20 border-category-health',
  learning: 'bg-category-learning/20 border-category-learning',
  social: 'bg-category-social/20 border-category-social',
  other: 'bg-category-other/20 border-category-other',
};

export const WeeklyView = ({ 
  tasks, 
  selectedDate, 
  onDateSelect, 
  onTaskClick 
}: WeeklyViewProps) => {
  const today = new Date();
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    
    return {
      date,
      dateStr,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      monthName: format(date, 'MMM'),
      isToday: isSameDay(date, today),
      isSelected: dateStr === selectedDate,
      tasks: dayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });

  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-3 text-xs text-muted-foreground">Time</div>
        {weekDays.map((day, index) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDateSelect(day.dateStr)}
            className={cn(
              "p-3 text-center transition-colors border-l border-border",
              day.isSelected && "bg-primary/10",
              day.isToday && "bg-success/5"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase">{day.dayName}</div>
            <div className={cn(
              "text-lg font-bold",
              day.isSelected ? "text-primary" : day.isToday ? "text-success" : "text-foreground"
            )}>
              {day.dayNumber}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Time grid */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-16 border-b border-border/30">
              <div className="p-2 text-xs text-muted-foreground flex items-start">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {weekDays.map((day) => {
                const tasksInHour = day.tasks.filter(task => {
                  const taskHour = parseInt(task.startTime.split(':')[0]);
                  return taskHour === hour;
                });
                
                return (
                  <div 
                    key={`${day.dateStr}-${hour}`} 
                    className={cn(
                      "border-l border-border/30 p-0.5 relative",
                      day.isSelected && "bg-primary/5"
                    )}
                  >
                    {tasksInHour.map((task, i) => (
                      <motion.button
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                          "w-full text-left p-1 rounded text-[10px] mb-0.5 border-l-2 truncate",
                          categoryColors[task.category],
                          task.status === 'completed' || task.status === 'completed-on-time' 
                            ? 'opacity-60' 
                            : ''
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-1">
                          {(task.status === 'completed' || task.status === 'completed-on-time') && (
                            <CheckCircle2 className="w-2.5 h-2.5 text-success flex-shrink-0" />
                          )}
                          {task.status === 'missed' && (
                            <AlertCircle className="w-2.5 h-2.5 text-destructive flex-shrink-0" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
