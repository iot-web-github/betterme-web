import { motion } from 'framer-motion';
import { TaskCategory, CATEGORY_LABELS } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  timeByCategory: Record<TaskCategory, number>;
}

const categoryColors: Record<TaskCategory, string> = {
  work: 'bg-category-work',
  personal: 'bg-category-personal',
  health: 'bg-category-health',
  learning: 'bg-category-learning',
  social: 'bg-category-social',
  other: 'bg-category-other',
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const CategoryBreakdown = ({ timeByCategory }: CategoryBreakdownProps) => {
  const totalMinutes = Object.values(timeByCategory).reduce((a, b) => a + b, 0);
  const categories = Object.entries(timeByCategory)
    .filter(([, minutes]) => minutes > 0)
    .sort(([, a], [, b]) => b - a) as [TaskCategory, number][];

  if (categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Time by Category</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No tasks scheduled for today
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Time by Category</h3>
        <span className="text-xs text-muted-foreground">{formatDuration(totalMinutes)} total</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-muted overflow-hidden flex mb-4">
        {categories.map(([category, minutes], index) => (
          <motion.div
            key={category}
            initial={{ width: 0 }}
            animate={{ width: `${(minutes / totalMinutes) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn('h-full', categoryColors[category])}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {categories.map(([category, minutes], index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', categoryColors[category])} />
              <span className="text-foreground">{CATEGORY_LABELS[category]}</span>
            </div>
            <span className="text-muted-foreground">{formatDuration(minutes)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
