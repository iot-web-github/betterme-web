import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, CATEGORY_LABELS, TaskCategory } from '@/types/schedule';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, X, Trophy, Trash2 } from 'lucide-react';

export const GoalsCard = () => {
  const { activeGoals, completedGoals, addGoal, updateGoalProgress, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState(5);
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [category, setCategory] = useState<TaskCategory | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      targetCount,
      type,
      category: category || undefined,
    });

    setTitle('');
    setTargetCount(5);
    setType('weekly');
    setCategory('');
    setShowForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">Goals</h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3 mb-4 overflow-hidden"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title..."
              className="bg-secondary/50"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Target</Label>
                <Input
                  type="number"
                  min={1}
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Period</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'weekly' | 'monthly')}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90">
              Add Goal
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No active goals</p>
          <p className="text-xs text-muted-foreground mt-1">Set a goal to track your progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{goal.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{goal.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => updateGoalProgress(goal.id)}
                    className="h-7 w-7"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(goal.currentCount / goal.targetCount) * 100} 
                  className="h-2 flex-1"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {goal.currentCount}/{goal.targetCount}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Goals Summary */}
      {completedGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            {completedGoals.length} goal{completedGoals.length !== 1 && 's'} completed
          </p>
        </div>
      )}
    </motion.div>
  );
};
