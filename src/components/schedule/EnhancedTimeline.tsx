import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, ScheduleTemplate, CATEGORY_ICONS } from '@/types/schedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertTriangle, RotateCcw, Circle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedTimelineProps {
  tasks: Task[];
  templates: ScheduleTemplate[];
  onTaskClick: (task: Task) => void;
  onMarkTask: (taskId: string, status: 'completed' | 'completed-on-time' | 'missed') => void;
  selectedDate: string;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 5;
const END_HOUR = 24;

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  work: { bg: 'bg-category-work/15', border: 'border-category-work', text: 'text-category-work' },
  personal: { bg: 'bg-category-personal/15', border: 'border-category-personal', text: 'text-category-personal' },
  health: { bg: 'bg-category-health/15', border: 'border-category-health', text: 'text-category-health' },
  learning: { bg: 'bg-category-learning/15', border: 'border-category-learning', text: 'text-category-learning' },
  social: { bg: 'bg-category-social/15', border: 'border-category-social', text: 'text-category-social' },
  other: { bg: 'bg-category-other/15', border: 'border-category-other', text: 'text-category-other' },
};

const statusConfig = {
  pending: { icon: Circle, color: 'text-muted-foreground', label: 'Pending' },
  completed: { icon: Check, color: 'text-success', label: 'Done' },
  'completed-on-time': { icon: Sparkles, color: 'text-success', label: 'On-Time!' },
  missed: { icon: AlertTriangle, color: 'text-destructive', label: 'Missed' },
  rescheduled: { icon: RotateCcw, color: 'text-warning', label: 'Rescheduled' },
};

export const EnhancedTimeline = ({ 
  tasks, 
  templates,
  onTaskClick, 
  onMarkTask,
  selectedDate 
}: EnhancedTimelineProps) => {
  const { hours, minutes, currentTime } = useCurrentTime();
  
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

  const getTaskPosition = useCallback((startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const timelineStartMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    
    const top = ((startMinutes - timelineStartMinutes) / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  }, []);

  const isTaskCurrent = (task: Task) => {
    if (!isToday) return false;
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    const taskStart = startH * 60 + startM;
    const taskEnd = endH * 60 + endM;
    const now = hours * 60 + minutes;
    return now >= taskStart && now < taskEnd;
  };

  const isTaskPast = (task: Task) => {
    if (!isToday) return new Date(selectedDate) < new Date(new Date().toISOString().split('T')[0]);
    const [endH, endM] = task.endTime.split(':').map(Number);
    const taskEnd = endH * 60 + endM;
    const now = hours * 60 + minutes;
    return now >= taskEnd;
  };

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
            <span className="w-16 flex-shrink-0 text-xs font-medium text-muted-foreground pr-4 -mt-2 text-right">
              {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </span>
            <div className="flex-1 border-t border-border/30 relative">
              {/* Half-hour marker */}
              <div className="absolute top-8 left-0 right-0 border-t border-border/15" />
            </div>
          </div>
        ))}

        {/* Tasks area */}
        <div className="absolute left-16 right-0 top-0 bottom-0">
          {/* Current time indicator */}
          <AnimatePresence>
            {isToday && currentTimePosition >= 0 && currentTimePosition <= 100 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                style={{ top: `${currentTimePosition}%` }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 -ml-1.5"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                <span className="absolute -left-14 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  NOW
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task blocks */}
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task, index) => {
              const position = getTaskPosition(task.startTime, task.endTime);
              const colors = categoryColors[task.category];
              const isCurrent = isTaskCurrent(task);
              const isPast = isTaskPast(task);
              const StatusIcon = statusConfig[task.status].icon;
              const isCompleted = task.status === 'completed' || task.status === 'completed-on-time';

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: 24, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    transition: { delay: index * 0.04 }
                  }}
                  exit={{ opacity: 0, x: -24, scale: 0.95 }}
                  className={cn(
                    "absolute left-2 right-2 group cursor-pointer",
                    isCurrent && "z-20"
                  )}
                  style={{ 
                    top: position.top, 
                    height: position.height, 
                    minHeight: '48px' 
                  }}
                  whileHover={{ scale: 1.015, zIndex: 15 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onTaskClick(task)}
                >
                  <div className={cn(
                    "relative h-full rounded-xl border-l-[3px] p-3 transition-all duration-200",
                    colors.bg,
                    colors.border,
                    isCurrent && "ring-2 ring-primary/30 shadow-glow-sm",
                    isCompleted && "opacity-60"
                  )}>
                    {/* Priority indicator */}
                    {task.priority === 'high' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-priority-high flex items-center justify-center">
                        <span className="text-[10px] font-bold text-destructive-foreground">!</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex items-start justify-between gap-2 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[task.category]}</span>
                          <h4 className={cn(
                            "font-semibold text-sm truncate text-foreground",
                            isCompleted && "line-through opacity-70"
                          )}>
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {task.startTime} - {task.endTime}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1">
                        {task.status === 'pending' && isPast && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 bg-success/10 hover:bg-success/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkTask(task.id, 'completed-on-time');
                              }}
                            >
                              <Check className="w-3.5 h-3.5 text-success" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 bg-destructive/10 hover:bg-destructive/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkTask(task.id, 'missed');
                              }}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        )}
                        
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium",
                          task.status === 'pending' && "bg-secondary text-muted-foreground",
                          (task.status === 'completed' || task.status === 'completed-on-time') && "bg-success/15 text-success",
                          task.status === 'missed' && "bg-destructive/15 text-destructive",
                          task.status === 'rescheduled' && "bg-warning/15 text-warning"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">{statusConfig[task.status].label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Current task glow effect */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)`,
                        }}
                      />
                    )}
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
