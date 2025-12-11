import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserGoals, GoalType, GoalFrequency } from '@/hooks/useUserGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Plus, Trash2, Trophy, TrendingUp, CheckCircle2, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: 'sleep', label: 'Sleep', icon: '😴' },
  { value: 'wake_up', label: 'Wake Up', icon: '⏰' },
  { value: 'habit', label: 'Habit', icon: '🎯' },
  { value: 'productivity', label: 'Productivity', icon: '📈' },
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

export const GoalsTool = () => {
  const { goals, activeGoals, completedGoals, createGoal, updateGoalProgress, deleteGoal, toggleGoalActive, isLoading } = useUserGoals();
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('habit');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<GoalFrequency>('daily');

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    await createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      goalType,
      targetValue: targetValue ? Number(targetValue) : undefined,
      unit: unit.trim() || undefined,
      frequency,
    });

    setTitle('');
    setDescription('');
    setTargetValue('');
    setUnit('');
    setShowForm(false);
    toast.success('Goal created!');
  };

  const handleIncrement = async (goalId: string, increment: number = 1) => {
    await updateGoalProgress(goalId, increment);
    toast.success('Progress updated!');
  };

  const handleDelete = async (goalId: string) => {
    await deleteGoal(goalId);
    toast.success('Goal deleted');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-secondary/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-success flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground">Goals</h2>
            <p className="text-xs text-muted-foreground">
              {activeGoals.length} active • {completedGoals.length} completed
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          size="sm" 
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 space-y-4"
          >
            <Input
              placeholder="Goal title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as GoalFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Target value"
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
              />
              <Input
                placeholder="Unit (e.g., hours, times)"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">Create Goal</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="active" className="gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Completed ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No active goals</p>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="mt-2">
                Create your first goal
              </Button>
            </div>
          ) : (
            activeGoals.map((goal, idx) => {
              const progress = goal.targetValue 
                ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) 
                : 0;
              const typeInfo = GOAL_TYPES.find(t => t.value === goal.goalType);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-secondary/40 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{typeInfo?.icon || '🎯'}</span>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleGoalActive(goal.id)}
                      >
                        {goal.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {goal.targetValue && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {goal.frequency} • {goal.goalType}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleIncrement(goal.id)}
                    >
                      +1 Progress
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedGoals.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No completed goals yet</p>
            </div>
          ) : (
            completedGoals.map((goal, idx) => {
              const typeInfo = GOAL_TYPES.find(t => t.value === goal.goalType);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-success/10 border border-success/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-lg">{typeInfo?.icon || '🎯'}</span>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{goal.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {goal.targetValue} {goal.unit} achieved
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
