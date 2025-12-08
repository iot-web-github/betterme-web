import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Repeat,
  Plus,
  Flame,
  Check,
  ArrowRight,
} from 'lucide-react';

const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '😴', '🥗', '💊', '🎯'];
const HABIT_COLORS = [
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(262 83% 58%)',
];

export const HabitsSection = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const navigate = useNavigate();
  const {
    habits,
    addHabit,
    toggleHabit,
    isHabitCompleted,
    getHabitStreak,
    getTodayProgress,
  } = useHabits();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💧');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  const todayProgress = getTodayProgress();
  const progressPercent = todayProgress.total > 0 
    ? (todayProgress.completed / todayProgress.total) * 100 
    : 0;

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit({
        name: newHabitName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        frequency: 'daily',
      });
      setNewHabitName('');
      setShowAddDialog(false);
    }
  };

  const handleViewAll = () => {
    navigate('/tools');
  };

  // Show max 4 habits in compact view
  const displayHabits = habits.slice(0, 4);
  const hasMore = habits.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center">
            <Repeat className="w-4 h-4 text-info" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Daily Habits</h3>
            <p className="text-xs text-muted-foreground">
              {todayProgress.completed}/{todayProgress.total} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-[340px] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
                          selectedIcon === icon
                            ? 'bg-primary scale-110 shadow-md'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Color</p>
                  <div className="flex gap-2">
                    {HABIT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          selectedColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddHabit} className="w-full" disabled={!newHabitName.trim()}>
                  Add Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Bar */}
      {todayProgress.total > 0 && (
        <div className="mb-4">
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <AnimatePresence>
          {displayHabits.map((habit, idx) => {
            const isCompleted = isHabitCompleted(habit.id, today);
            const streak = getHabitStreak(habit.id);

            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => toggleHabit(habit.id, today)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
                  isCompleted 
                    ? 'bg-success/20 border border-success/30' 
                    : 'bg-secondary/40 hover:bg-secondary/60 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all ${
                    isCompleted ? 'bg-success text-white' : ''
                  }`}
                  style={{ backgroundColor: isCompleted ? undefined : `${habit.color}20` }}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : habit.icon}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-xs font-medium truncate ${isCompleted ? 'text-success line-through' : 'text-foreground'}`}>
                    {habit.name}
                  </p>
                  {streak > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-warning">
                      <Flame className="w-2.5 h-2.5" />
                      {streak}d
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-xs">No habits yet. Add one to start!</p>
        </div>
      )}

      {/* View All Habits Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleViewAll}
        className="w-full gap-1 text-xs h-8 text-muted-foreground hover:text-foreground"
      >
        {hasMore ? `View all ${habits.length} habits` : 'View All Habits'}
        <ArrowRight className="w-3 h-3" />
      </Button>
    </motion.div>
  );
};
