import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Task } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniCalendarProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const MiniCalendar = ({ tasks, selectedDate, onDateSelect }: MiniCalendarProps) => {
  const today = new Date();
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const completedCount = dayTasks.filter(t => 
      t.status === 'completed' || t.status === 'completed-on-time'
    ).length;
    
    return {
      date,
      dateStr,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: isSameDay(date, today),
      isSelected: dateStr === selectedDate,
      totalTasks: dayTasks.length,
      completedTasks: completedCount,
    };
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateSelect(format(currentDate, 'yyyy-MM-dd'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek('prev')}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek('next')}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDateSelect(day.dateStr)}
            className={cn(
              "relative p-2 rounded-xl transition-all duration-200 group",
              day.isSelected && "bg-primary text-primary-foreground",
              day.isToday && !day.isSelected && "ring-1 ring-primary/50",
              !day.isSelected && "hover:bg-secondary"
            )}
          >
            <div className="text-[10px] uppercase text-center opacity-60 mb-1">
              {day.dayName}
            </div>
            <div className={cn(
              "text-lg font-display font-bold text-center",
              day.isSelected ? "text-primary-foreground" : "text-foreground"
            )}>
              {day.dayNumber}
            </div>
            
            {/* Task indicator */}
            {day.totalTasks > 0 && (
              <div className="flex justify-center mt-1 gap-0.5">
                {day.completedTasks === day.totalTasks ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                ) : (
                  <>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      day.isSelected ? "bg-primary-foreground/60" : "bg-muted-foreground/40"
                    )} />
                    {day.completedTasks > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    )}
                  </>
                )}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
