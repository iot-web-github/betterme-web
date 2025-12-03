import { motion } from 'framer-motion';
import { Task, CATEGORY_LABELS, PRIORITY_LABELS } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, RefreshCw, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskBlockProps {
  task: Task;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  work: 'border-l-category-work bg-category-work/10 hover:bg-category-work/20',
  personal: 'border-l-category-personal bg-category-personal/10 hover:bg-category-personal/20',
  health: 'border-l-category-health bg-category-health/10 hover:bg-category-health/20',
  learning: 'border-l-category-learning bg-category-learning/10 hover:bg-category-learning/20',
  social: 'border-l-category-social bg-category-social/10 hover:bg-category-social/20',
  other: 'border-l-category-other bg-category-other/10 hover:bg-category-other/20',
};

const statusIcons = {
  pending: Circle,
  completed: CheckCircle2,
  'completed-on-time': CheckCircle2,
  missed: XCircle,
  rescheduled: RefreshCw,
};

const statusColors = {
  pending: 'text-muted-foreground',
  completed: 'text-success',
  'completed-on-time': 'text-success',
  missed: 'text-destructive',
  rescheduled: 'text-warning',
};

const priorityIndicator = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

export const TaskBlock = ({ task, onClick }: TaskBlockProps) => {
  const StatusIcon = statusIcons[task.status];
  const isCompleted = task.status === 'completed' || task.status === 'completed-on-time';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full h-full rounded-lg border-l-4 p-3 text-left transition-all duration-200',
        'glass cursor-pointer overflow-hidden relative group',
        categoryColors[task.category],
        isCompleted && 'opacity-70'
      )}
    >
      {/* Priority indicator dot */}
      {task.priority === 'high' && (
        <motion.div
          className="absolute top-2 right-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={cn('w-2 h-2 rounded-full', priorityIndicator[task.priority])} />
        </motion.div>
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                initial={false}
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <StatusIcon className={cn('w-4 h-4 flex-shrink-0', statusColors[task.status])} />
              </motion.div>
              <h4 className={cn(
                'font-semibold text-sm truncate text-foreground',
                isCompleted && 'line-through decoration-success/50'
              )}>
                {task.title}
              </h4>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.startTime} - {task.endTime}
              </span>
              {task.priority === 'high' && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  High
                </span>
              )}
            </div>
          </div>
          <Badge variant={task.category as any} className="flex-shrink-0 text-[10px]">
            {CATEGORY_LABELS[task.category]}
          </Badge>
        </div>
        
        {task.description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-2 line-clamp-2"
          >
            {task.description}
          </motion.p>
        )}
      </div>
    </motion.button>
  );
};
