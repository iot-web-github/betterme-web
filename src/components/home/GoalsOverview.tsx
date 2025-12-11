import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUserGoals } from '@/hooks/useUserGoals';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Plus, Trophy } from 'lucide-react';

export const GoalsOverview = () => {
  const { activeGoals, completedGoals, isLoading } = useUserGoals();

  // Show top 3 active goals
  const displayGoals = activeGoals.slice(0, 3);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-secondary rounded" />
          <div className="h-16 bg-secondary rounded-xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning to-success flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Goals</h3>
            <p className="text-xs text-muted-foreground">
              {completedGoals.length} completed
            </p>
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Goals List */}
      {displayGoals.length > 0 ? (
        <div className="space-y-3">
          {displayGoals.map((goal, idx) => {
            const progress = goal.targetValue 
              ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) 
              : 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-secondary/40 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground truncate flex-1">
                    {goal.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">No active goals</p>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
              Create Goal
            </Button>
          </Link>
        </div>
      )}

      {/* View All Link */}
      {activeGoals.length > 3 && (
        <Link to="/dashboard">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full gap-1 text-xs h-8 mt-3 text-muted-foreground hover:text-foreground"
          >
            View all {activeGoals.length} goals
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      )}
    </motion.div>
  );
};
