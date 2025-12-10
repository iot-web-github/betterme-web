import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserGoals, GoalType, GoalFrequency } from '@/hooks/useUserGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, X, Trophy, Trash2, Moon, Sun, Dumbbell, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const GOAL_TYPE_CONFIG: Record<GoalType, { icon: typeof Moon; label: string; color: string }> = {
  sleep: { icon: Moon, label: 'Sleep', color: 'text-primary' },
  wake_up: { icon: Sun, label: 'Wake-up', color: 'text-warning' },
  habit: { icon: Sparkles, label: 'Habit', color: 'text-info' },
  productivity: { icon: TrendingUp, label: 'Productivity', color: 'text-success' },
  health: { icon: Dumbbell, label: 'Health', color: 'text-destructive' },
  custom: { icon: Target, label: 'Custom', color: 'text-muted-foreground' },
};

export const GoalSettingCard = () => {
  const { activeGoals, completedGoals, createGoal, updateGoalProgress, deleteGoal, isLoading } = useUserGoals();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('habit');
  const [targetValue, setTargetValue] = useState(7);
  const [unit, setUnit] = useState('days');
  const [frequency, setFrequency] = useState<GoalFrequency>('weekly');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const result = await createGoal({
      title: title.trim(),
      goalType,
      targetValue,
      unit,
      frequency,
    });

    if (result) {
      toast.success('Goal created!', {
        description: 'Track your progress to achieve it.',
      });
      setTitle('');
      setTargetValue(7);
      setShowForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
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
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <config.icon className={`w-3 h-3 ${config.color}`} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as GoalFrequency)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Target</Label>
                <Input
                  type="number"
                  min={1}
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., days, hours"
                  className="bg-secondary/50"
                />
              </div>
            </div>

            <Button type="submit" size="sm" className="w-full">
              Create Goal
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {isLoading ? (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : activeGoals.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No active goals</p>
          <p className="text-xs text-muted-foreground mt-1">Set a goal to track your progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.slice(0, 4).map((goal, index) => {
            const config = GOAL_TYPE_CONFIG[goal.goalType];
            const Icon = config.icon;
            const progress = goal.targetValue 
              ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
              : 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-xl bg-secondary/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{goal.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{goal.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateGoalProgress(goal.id, 1)}
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
                  <Progress value={progress} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Goals Summary */}
      {completedGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3 text-warning" />
            {completedGoals.length} goal{completedGoals.length !== 1 && 's'} achieved!
          </p>
        </div>
      )}
    </motion.div>
  );
};
