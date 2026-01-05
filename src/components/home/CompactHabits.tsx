import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHabits } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const CompactHabits = () => {
  const { habits, logs, toggleHabit, isLoading } = useHabits();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayLogs = logs.filter(l => l.date === today);
  const completedCount = todayLogs.filter(l => l.completed).length;
  const totalHabits = habits.length;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary rounded w-24" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-secondary rounded-xl" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-display font-semibold text-foreground">Habits</h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalHabits} today
          </p>
        </div>
        <Link to="/tools?tab=habits">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </Link>
      </div>

      {habits.length === 0 ? (
        <Link to="/tools?tab=habits">
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-2">No habits yet</p>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" />
              Create Habit
            </Button>
          </div>
        </Link>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {habits.slice(0, 4).map((habit, idx) => {
            const isCompleted = todayLogs.some(l => l.habitId === habit.id && l.completed);

            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleHabit(habit.id, today)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  isCompleted 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-secondary/50 hover:bg-secondary/70'
                }`}
              >
                <span className="text-lg">{habit.icon}</span>
                <span className={`text-[10px] font-medium truncate w-full text-center ${
                  isCompleted ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {habit.name}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {habits.length > 4 && (
        <Link to="/tools?tab=habits">
          <p className="text-xs text-center text-primary mt-2 hover:underline cursor-pointer">
            +{habits.length - 4} more habits
          </p>
        </Link>
      )}
    </motion.div>
  );
};
