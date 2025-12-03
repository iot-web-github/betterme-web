import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types/schedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { TaskBlock } from './TaskBlock';
import { cn } from '@/lib/utils';

interface TimelineProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedDate: string;
}

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 5; // 5 AM
const END_HOUR = 24; // 12 AM (midnight)

export const Timeline = ({ tasks, onTaskClick, selectedDate }: TimelineProps) => {
  const { hours, minutes, percentOfDay } = useCurrentTime();
  
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  const currentTimePosition = useMemo(() => {
    const currentMinutes = hours * 60 + minutes;
    const startMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    return ((currentMinutes - startMinutes) / totalMinutes) * 100;
  }, [hours, minutes]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const getTaskPosition = (task: Task) => {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const timelineStartMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    
    const top = ((startMinutes - timelineStartMinutes) / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="relative h-full">
      {/* Time labels column */}
      <div 
        className="relative"
        style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
      >
        {/* Hour lines and labels */}
        {timeSlots.map((hour, index) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(index / (END_HOUR - START_HOUR)) * 100}%` }}
          >
            <span className="w-14 flex-shrink-0 text-xs text-muted-foreground pr-3 -mt-2">
              {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </span>
            <div className="flex-1 border-t border-border/50" />
          </div>
        ))}

        {/* Tasks area */}
        <div className="absolute left-14 right-0 top-0 bottom-0">
          {/* Current time indicator */}
          {isToday && currentTimePosition >= 0 && currentTimePosition <= 100 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="w-3 h-3 rounded-full bg-primary shadow-glow -ml-1.5" />
              <div className="flex-1 h-0.5 bg-primary shadow-glow" />
            </motion.div>
          )}

          {/* Task blocks */}
          {tasks.map((task, index) => {
            const position = getTaskPosition(task);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="absolute left-2 right-2"
                style={{ top: position.top, height: position.height, minHeight: '40px' }}
              >
                <TaskBlock task={task} onClick={() => onTaskClick(task)} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
