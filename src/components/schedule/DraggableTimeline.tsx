import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Task } from '@/types/schedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { TaskBlock } from './TaskBlock';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableTimelineProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onReorder: (tasks: Task[]) => void;
  selectedDate: string;
}

const HOUR_HEIGHT = 60;
const START_HOUR = 5;
const END_HOUR = 24;

export const DraggableTimeline = ({ 
  tasks, 
  onTaskClick, 
  onReorder,
  selectedDate 
}: DraggableTimelineProps) => {
  const { hours, minutes } = useCurrentTime();
  const [isDragging, setIsDragging] = useState(false);
  
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

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aStart = parseInt(a.startTime.replace(':', ''));
      const bStart = parseInt(b.startTime.replace(':', ''));
      return aStart - bStart;
    });
  }, [tasks]);

  const getTaskPosition = useCallback((task: Task) => {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const timelineStartMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    
    const top = ((startMinutes - timelineStartMinutes) / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  }, []);

  return (
    <div className="relative h-full">
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
          <AnimatePresence>
            {isToday && currentTimePosition >= 0 && currentTimePosition <= 100 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                style={{ top: `${currentTimePosition}%` }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full bg-primary shadow-glow -ml-1.5"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex-1 h-0.5 bg-primary shadow-glow" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task blocks with absolute positioning */}
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task, index) => {
              const position = getTaskPosition(task);
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.03 }
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute left-2 right-2 group"
                  style={{ 
                    top: position.top, 
                    height: position.height, 
                    minHeight: '40px' 
                  }}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative h-full">
                    {/* Drag handle */}
                    <motion.div
                      className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10 p-1 rounded bg-secondary/80"
                      whileHover={{ scale: 1.1 }}
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                    </motion.div>
                    <TaskBlock 
                      task={task} 
                      onClick={() => onTaskClick(task)} 
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
