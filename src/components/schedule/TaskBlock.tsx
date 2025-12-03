import { motion } from 'framer-motion';
import { Task, CATEGORY_LABELS } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, RefreshCw, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskBlockProps {
  task: Task;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  work: 'border-l-category-work bg-category-work/10 hover:bg-category-work/15',
  personal: 'border-l-category-personal bg-category-personal/10 hover:bg-category-personal/15',
  health: 'border-l-category-health bg-category-health/10 hover:bg-category-health/15',
  learning: 'border-l-category-learning bg-category-learning/10 hover:bg-category-learning/15',
  social: 'border-l-category-social bg-category-social/10 hover:bg-category-social/15',
  other: 'border-l-category-other bg-category-other/10 hover:bg-category-other/15',
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

export const TaskBlock = ({ task, onClick }: TaskBlockProps) => {
  const StatusIcon = statusIcons[task.status];
  
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'w-full h-full rounded-lg border-l-4 p-3 text-left transition-all duration-200',
        'glass glass-hover cursor-pointer overflow-hidden',
        categoryColors[task.category]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={cn('w-4 h-4 flex-shrink-0', statusColors[task.status])} />
            <h4 className="font-semibold text-sm truncate text-foreground">{task.title}</h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{task.startTime} - {task.endTime}</span>
          </div>
        </div>
        <Badge variant={task.category as any} className="flex-shrink-0 text-[10px]">
          {CATEGORY_LABELS[task.category]}
        </Badge>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
      )}
    </motion.button>
  );
};
