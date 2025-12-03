import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => {
  const today = new Date().toISOString().split('T')[0];
  
  const getWeekDays = () => {
    const selected = new Date(selectedDate);
    const days = [];
    
    // Get the Monday of the week
    const day = selected.getDay();
    const diff = selected.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(selected.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const selectedDateObj = new Date(selectedDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    onDateChange(today);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon-sm" onClick={() => navigateWeek('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          {selectedDate !== today && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon-sm" onClick={() => navigateWeek('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          
          return (
            <motion.button
              key={dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onDateChange(dateStr)}
              className={cn(
                'flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'hover:bg-secondary',
                isToday && !isSelected && 'ring-1 ring-primary'
              )}
            >
              <span className="text-xs font-medium opacity-70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{date.getDate()}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
