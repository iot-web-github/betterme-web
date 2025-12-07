import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useHealthStats } from '@/hooks/useHealthStats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  Droplets,
  Flame,
  Plus,
  Minus,
  Timer,
  TrendingUp,
} from 'lucide-react';

const WATER_GOAL = 8; // glasses
const EXERCISE_GOAL = 30; // minutes

export const HealthStatsTracker = () => {
  const {
    getLogForDate,
    addWater,
    removeWater,
    addExercise,
    getWeeklyStats,
    getWeeklyTrend,
  } = useHealthStats();

  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [exerciseMinutes, setExerciseMinutes] = useState('15');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = getLogForDate(today);
  const weeklyStats = getWeeklyStats();
  const weeklyTrend = getWeeklyTrend();

  const waterProgress = ((todayLog?.waterIntake || 0) / WATER_GOAL) * 100;
  const exerciseProgress = ((todayLog?.exerciseMinutes || 0) / EXERCISE_GOAL) * 100;

  const handleAddExercise = () => {
    const minutes = parseInt(exerciseMinutes);
    if (minutes > 0) {
      addExercise(today, minutes);
      setExerciseMinutes('15');
      setShowExerciseDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-success" />
        <h2 className="text-lg font-display font-semibold text-foreground">Health Stats</h2>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Water Intake */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-info" />
              <span className="font-medium text-foreground">Water Intake</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {todayLog?.waterIntake || 0}/{WATER_GOAL} glasses
            </span>
          </div>
          
          <Progress value={Math.min(waterProgress, 100)} className="h-3 mb-4" />
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => removeWater(today)}
              disabled={!todayLog || todayLog.waterIntake === 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-3 h-6 rounded-full ${
                    i < (todayLog?.waterIntake || 0)
                      ? 'bg-info'
                      : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => addWater(today)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Exercise */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-destructive" />
              <span className="font-medium text-foreground">Exercise</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {todayLog?.exerciseMinutes || 0}/{EXERCISE_GOAL} min
            </span>
          </div>
          
          <Progress value={Math.min(exerciseProgress, 100)} className="h-3 mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">
                {todayLog?.exerciseMinutes || 0}
              </p>
              <p className="text-xs text-muted-foreground">minutes today</p>
            </div>
            <Button onClick={() => setShowExerciseDialog(true)} className="gap-2">
              <Timer className="w-4 h-4" />
              Log Exercise
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          This Week
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-info">
              {weeklyStats.averageWater.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">avg. glasses/day</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-destructive">
              {weeklyStats.totalExercise}
            </p>
            <p className="text-xs text-muted-foreground">total exercise min</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-success">
              {weeklyStats.exerciseDays}
            </p>
            <p className="text-xs text-muted-foreground">active days</p>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Weekly Activity</h3>
        <div className="space-y-4">
          {/* Water Trend */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-info" />
              <span className="text-sm text-muted-foreground">Water</span>
            </div>
            <div className="flex items-end justify-between h-16 gap-2">
              {weeklyTrend.map((day, idx) => {
                const height = day.water > 0 ? (day.water / WATER_GOAL) * 100 : 5;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(height, 100)}%` }}
                      transition={{ delay: idx * 0.05 }}
                      className={`w-full rounded-t-lg ${day.water >= WATER_GOAL ? 'bg-info' : 'bg-info/40'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercise Trend */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Exercise</span>
            </div>
            <div className="flex items-end justify-between h-16 gap-2">
              {weeklyTrend.map((day, idx) => {
                const height = day.exercise > 0 ? (day.exercise / 60) * 100 : 5;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(height, 100)}%` }}
                      transition={{ delay: idx * 0.05 }}
                      className={`w-full rounded-t-lg ${day.exercise >= EXERCISE_GOAL ? 'bg-destructive' : 'bg-destructive/40'}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(subDays(new Date(), 6 - idx), 'E')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Log Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">How many minutes?</p>
              <div className="flex items-center gap-4">
                {[15, 30, 45, 60].map(min => (
                  <Button
                    key={min}
                    variant={exerciseMinutes === String(min) ? 'default' : 'outline'}
                    onClick={() => setExerciseMinutes(String(min))}
                    className="flex-1"
                  >
                    {min}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Or enter custom</p>
              <Input
                type="number"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                placeholder="Minutes"
              />
            </div>
            <Button onClick={handleAddExercise} className="w-full">
              Log {exerciseMinutes} minutes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
