import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Repeat,
  Plus,
  Flame,
  Check,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
} from 'lucide-react';

const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '😴', '🥗', '💊', '🎯', '✍️', '🌱', '🎸', '🖥️'];
const HABIT_COLORS = [
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(262 83% 58%)',
  'hsl(340 82% 52%)',
  'hsl(0 84% 60%)',
];

export const EnhancedHabitTracker = () => {
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
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const todayProgress = getTodayProgress();
  const completionPercentage = habits.length > 0 
    ? (todayProgress.completed / todayProgress.total) * 100 
    : 0;

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  // Get overall weekly completion rate
  const getOverallWeeklyRate = (): number => {
    if (habits.length === 0) return 0;
    
    let totalCompleted = 0;
    let totalPossible = 0;

    habits.forEach(habit => {
      const weeklyData = getWeeklyCompletion(habit.id);
      totalCompleted += weeklyData.filter(d => d.completed).length;
      totalPossible += 7;
    });

    return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-info" />
          <h2 className="text-lg font-display font-semibold text-foreground">Habits</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {todayProgress.completed}/{todayProgress.total} today
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
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

      {/* Progress Overview */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Today's Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-3" />
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
        <TabsList className="glass w-full">
          <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
          <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
          <TabsTrigger value="month" className="flex-1">Stats</TabsTrigger>
        </TabsList>

        {/* Today View */}
        <TabsContent value="today" className="mt-4 space-y-3">
          <AnimatePresence>
            {habits.map((habit, idx) => {
              const isCompleted = isHabitCompleted(habit.id, today);
              const streak = getHabitStreak(habit.id);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 group"
                >
                  <motion.button
                    onClick={() => toggleHabit(habit.id, today)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all flex-shrink-0 ${
                      isCompleted ? 'scale-110' : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                    style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                    whileHover={{ scale: isCompleted ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? <Check className="w-6 h-6 text-white" /> : habit.icon}
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {habit.name}
                    </p>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-warning">
                        <Flame className="w-3 h-3" />
                        {streak} day streak
                      </span>
                    )}
                  </div>

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
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No habits yet. Create your first one!</p>
            </div>
          )}
        </TabsContent>

        {/* Week View */}
        <TabsContent value="week" className="mt-4">
          <div className="glass rounded-xl p-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Week Grid */}
            <div className="space-y-3">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center gap-3">
                  <div className="w-8 text-center text-lg">{habit.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {weekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const completed = isHabitCompleted(habit.id, dateStr);
                      const isToday = dateStr === today;

                      return (
                        <motion.button
                          key={dateStr}
                          onClick={() => toggleHabit(habit.id, dateStr)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                            completed 
                              ? '' 
                              : isToday 
                                ? 'bg-secondary border-2 border-primary/50' 
                                : 'bg-secondary/50'
                          }`}
                          style={{ backgroundColor: completed ? habit.color : undefined }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-muted-foreground">{format(day, 'd')}</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Week Day Labels */}
            <div className="flex items-center gap-3 mt-3 pl-11">
              <div className="flex-1" />
              <div className="flex gap-1">
                {weekDays.map(day => (
                  <div key={day.toString()} className="w-8 text-center text-xs text-muted-foreground">
                    {format(day, 'EEE')[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Stats View */}
        <TabsContent value="month" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">
                {Math.round(getOverallWeeklyRate())}%
              </p>
              <p className="text-sm text-muted-foreground">weekly completion</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">
                {Math.max(...habits.map(h => getHabitStreak(h.id)), 0)}
              </p>
              <p className="text-sm text-muted-foreground">longest streak</p>
            </div>
          </div>

          {/* Habit Stats */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Habit Performance
            </h3>
            <div className="space-y-4">
              {habits.map(habit => {
                const weeklyData = getWeeklyCompletion(habit.id);
                const completionRate = (weeklyData.filter(d => d.completed).length / 7) * 100;
                const streak = getHabitStreak(habit.id);

                return (
                  <div key={habit.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{habit.icon}</span>
                        <span className="text-sm font-medium text-foreground">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-warning">
                            <Flame className="w-3 h-3" />
                            {streak}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {Math.round(completionRate)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
