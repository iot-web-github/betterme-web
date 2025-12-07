import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  X,
  Trash2,
} from 'lucide-react';

const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '😴', '🥗', '💊', '🎯', '✍️', '🌱'];
const HABIT_COLORS = [
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(262 83% 58%)',
  'hsl(340 82% 52%)',
  'hsl(0 84% 60%)',
];

export const HabitTracker = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const {
    habits,
    addHabit,
    deleteHabit,
    toggleHabit,
    isHabitCompleted,
    getHabitStreak,
    getWeeklyCompletion,
    getTodayProgress,
  } = useHabits();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💧');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  const todayProgress = getTodayProgress();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Repeat className="w-5 h-5 text-info" />
          Daily Habits
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {todayProgress.completed}/{todayProgress.total} today
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                          selectedIcon === icon
                            ? 'bg-primary scale-110'
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
                        className={`w-8 h-8 rounded-lg transition-all ${
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

      <div className="space-y-3">
        <AnimatePresence>
          {habits.map((habit, idx) => {
            const isCompleted = isHabitCompleted(habit.id, today);
            const streak = getHabitStreak(habit.id);
            const weeklyData = getWeeklyCompletion(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 group"
              >
                {/* Toggle Button */}
                <motion.button
                  onClick={() => toggleHabit(habit.id, today)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all flex-shrink-0 ${
                    isCompleted ? 'scale-110' : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                  style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                  whileHover={{ scale: isCompleted ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-white" /> : habit.icon}
                </motion.button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-warning">
                        <Flame className="w-3 h-3" />
                        {streak} day{streak !== 1 && 's'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Weekly Dots */}
                <div className="hidden sm:flex gap-1">
                  {weeklyData.map((day, i) => (
                    <div
                      key={day.date}
                      className={`w-2 h-2 rounded-full ${
                        day.completed ? 'bg-success' : 'bg-muted'
                      }`}
                      title={format(subDays(new Date(), 6 - i), 'EEE')}
                    />
                  ))}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {habits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No habits yet. Add one to start tracking!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
