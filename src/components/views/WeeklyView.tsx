import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Task, CATEGORY_ICONS } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

interface WeeklyViewProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  work: 'bg-category-work/20 border-l-category-work',
  personal: 'bg-category-personal/20 border-l-category-personal',
  health: 'bg-category-health/20 border-l-category-health',
  learning: 'bg-category-learning/20 border-l-category-learning',
  social: 'bg-category-social/20 border-l-category-social',
  other: 'bg-category-other/20 border-l-category-other',
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

  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-border/30">
        <div className="p-4 text-xs font-medium text-muted-foreground uppercase">Time</div>
        {weekDays.map((day, index) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDateSelect(day.dateStr)}
            className={cn(
              "p-4 text-center transition-all border-l border-border/30",
              day.isSelected && "bg-primary/10",
              day.isToday && "bg-success/5"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase mb-1">{day.dayName}</div>
            <div className={cn(
              "text-xl font-display font-bold",
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
            <div key={hour} className="grid grid-cols-8 min-h-[60px] border-b border-border/20">
              <div className="p-2 text-xs font-medium text-muted-foreground flex items-start pt-2">
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
                      "border-l border-border/20 p-1 relative min-h-[60px]",
                      day.isSelected && "bg-primary/5"
                    )}
                  >
                    {tasksInHour.map((task) => {
                      const isCompleted = task.status === 'completed' || task.status === 'completed-on-time';
                      return (
                        <motion.button
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "w-full text-left p-2 rounded-lg text-xs mb-1 border-l-[3px] transition-all",
                            categoryColors[task.category],
                            isCompleted && 'opacity-60'
                          )}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                            ) : task.status === 'missed' ? (
                              <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="truncate font-medium">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[10px]">{task.startTime}</span>
                          </div>
                        </motion.button>
                      );
                    })}
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
