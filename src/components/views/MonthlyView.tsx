import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { Task } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthlyViewProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
}

const categoryDots: Record<string, string> = {
  work: 'bg-category-work',
  personal: 'bg-category-personal',
  health: 'bg-category-health',
  learning: 'bg-category-learning',
  social: 'bg-category-social',
  other: 'bg-category-other',
};

export const MonthlyView = ({ 
  tasks, 
  selectedDate, 
  onDateSelect, 
  onMonthChange,
  currentMonth 
}: MonthlyViewProps) => {
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.date === dateStr);
  };

  const getCompletionRate = (dayTasks: Task[]) => {
    if (dayTasks.length === 0) return 0;
    const completed = dayTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
    return Math.round((completed / dayTasks.length) * 100);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Month Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/30">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handlePrevMonth}
          className="hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <motion.h2 
          key={format(currentMonth, 'MMMM yyyy')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-display font-bold text-foreground"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleNextMonth}
          className="hover:bg-secondary"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/30">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="p-3 text-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = dateStr === selectedDate;
              const completionRate = getCompletionRate(dayTasks);
              const hasCompletedAll = dayTasks.length > 0 && completionRate === 100;

              return (
                <motion.button
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  onClick={() => onDateSelect(dateStr)}
                  className={cn(
                    "relative aspect-square p-2 m-0.5 rounded-xl transition-all duration-200 group",
                    !isCurrentMonth && "opacity-30",
                    isSelected && "bg-primary/20 ring-2 ring-primary/50",
                    isToday && !isSelected && "bg-secondary ring-1 ring-primary/30",
                    !isSelected && !isToday && "hover:bg-secondary/60",
                    hasCompletedAll && "bg-success/10"
                  )}
                >
                  {/* Day Number */}
                  <div className="flex items-start justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isToday ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasCompletedAll && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    )}
                  </div>

                  {/* Task Dots */}
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayTasks.slice(0, 4).map((task, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            categoryDots[task.category],
                            (task.status === 'completed' || task.status === 'completed-on-time') && "opacity-50"
                          )}
                        />
                      ))}
                      {dayTasks.length > 4 && (
                        <span className="text-[8px] text-muted-foreground ml-0.5">
                          +{dayTasks.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Task Count Badge */}
                  {dayTasks.length > 0 && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">
                        {dayTasks.length}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className="w-2.5 h-2.5" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="w-2.5 h-2.5 text-success" />
          <span>All Complete</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-category-work" />
            <div className="w-1.5 h-1.5 rounded-full bg-category-personal" />
            <div className="w-1.5 h-1.5 rounded-full bg-category-health" />
          </div>
          <span>Tasks</span>
        </div>
      </div>
    </motion.div>
  );
};
