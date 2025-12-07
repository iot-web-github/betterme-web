import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Star,
  Bed,
} from 'lucide-react';

const SLEEP_GOAL = 8; // hours

export const SleepTracker = () => {
  const { checkIns, saveCheckIn, getWeeklyStats, getCheckInForDate } = useLifeTracking();

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState([3]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCheckIn = getCheckInForDate(today);
  const weeklyStats = getWeeklyStats();

  // Get last 7 days of sleep data
  const sleepTrend = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const checkIn = checkIns.find(c => c.date === date);
    let sleepHours = 0;
    
    if (checkIn?.sleepTime && checkIn?.wakeUpTime) {
      const [sleepH, sleepM] = checkIn.sleepTime.split(':').map(Number);
      const [wakeH, wakeM] = checkIn.wakeUpTime.split(':').map(Number);
      let mins = (wakeH * 60 + wakeM) - (sleepH * 60 + sleepM);
      if (mins < 0) mins += 24 * 60;
      sleepHours = mins / 60;
    }

    return {
      date,
      hours: sleepHours,
      quality: checkIn?.mood || 0, // Using mood as proxy for now
    };
  });

  const calculateSleepDuration = (sleep: string, wake: string): number => {
    const [sleepH, sleepM] = sleep.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);
    let mins = (wakeH * 60 + wakeM) - (sleepH * 60 + sleepM);
    if (mins < 0) mins += 24 * 60;
    return mins / 60;
  };

  const previewDuration = calculateSleepDuration(sleepTime, wakeTime);

  const handleLogSleep = () => {
    saveCheckIn({
      date: today,
      sleepTime,
      wakeUpTime: wakeTime,
      mood: todayCheckIn?.mood || 3,
      energy: todayCheckIn?.energy || 3,
      stress: todayCheckIn?.stress || 3,
      phoneUsage: todayCheckIn?.phoneUsage || 0,
      waterIntake: todayCheckIn?.waterIntake || 0,
      exercise: todayCheckIn?.exercise || false,
      gratitude: todayCheckIn?.gratitude || [],
      notes: todayCheckIn?.notes || '',
    });
    setShowLogDialog(false);
  };

  const getSleepQualityLabel = (hours: number): string => {
    if (hours >= 7 && hours <= 9) return 'Optimal';
    if (hours >= 6 && hours < 7) return 'Slightly Low';
    if (hours > 9 && hours <= 10) return 'Slightly High';
    if (hours < 6) return 'Too Low';
    return 'Too High';
  };

  const getSleepQualityColor = (hours: number): string => {
    if (hours >= 7 && hours <= 9) return 'text-success';
    if (hours >= 6 && hours < 7) return 'text-warning';
    if (hours > 9 && hours <= 10) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Sleep Tracker</h2>
        </div>
        <Button onClick={() => setShowLogDialog(true)} size="sm" className="gap-2">
          <Bed className="w-4 h-4" />
          Log Sleep
        </Button>
      </div>

      {/* Today's Sleep */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-foreground">Last Night</span>
          <span className="text-sm text-muted-foreground">
            Goal: {SLEEP_GOAL}h
          </span>
        </div>

        {todayCheckIn?.sleepTime && todayCheckIn?.wakeUpTime ? (
          <>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2 mx-auto">
                  <Moon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Bedtime</p>
                <p className="text-xl font-display font-bold text-foreground">{todayCheckIn.sleepTime}</p>
              </div>
              <div className="flex-1 max-w-[100px] h-1 bg-gradient-to-r from-primary to-warning rounded-full" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mb-2 mx-auto">
                  <Sun className="w-8 h-8 text-warning" />
                </div>
                <p className="text-sm text-muted-foreground">Wake up</p>
                <p className="text-xl font-display font-bold text-foreground">{todayCheckIn.wakeUpTime}</p>
              </div>
            </div>

            {(() => {
              const hours = calculateSleepDuration(todayCheckIn.sleepTime, todayCheckIn.wakeUpTime);
              return (
                <div className="text-center">
                  <p className={`text-4xl font-display font-bold ${getSleepQualityColor(hours)}`}>
                    {hours.toFixed(1)}h
                  </p>
                  <p className={`text-sm ${getSleepQualityColor(hours)}`}>
                    {getSleepQualityLabel(hours)}
                  </p>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-8">
            <Bed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sleep logged for today</p>
            <Button onClick={() => setShowLogDialog(true)} variant="outline" className="mt-4">
              Log Sleep
            </Button>
          </div>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-display font-bold text-foreground">
            {weeklyStats.averageSleep > 0 ? weeklyStats.averageSleep.toFixed(1) : '-'}
          </p>
          <p className="text-sm text-muted-foreground">avg hours/night</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-display font-bold text-foreground">
            {sleepTrend.filter(d => d.hours >= 7 && d.hours <= 9).length}
          </p>
          <p className="text-sm text-muted-foreground">optimal nights</p>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Sleep Pattern
        </h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {sleepTrend.map((day, idx) => {
            const height = day.hours > 0 ? (day.hours / 12) * 100 : 5;
            const isOptimal = day.hours >= 7 && day.hours <= 9;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.05 }}
                  className={`w-full rounded-t-lg ${
                    isOptimal ? 'bg-success' : 
                    day.hours > 0 ? 'bg-warning' : 'bg-muted'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {format(subDays(new Date(), 6 - idx), 'E')}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0h</span>
          <span>12h</span>
        </div>
      </div>

      {/* Log Sleep Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Log Your Sleep</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Bedtime */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Bedtime</span>
              </div>
              <Input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>

            {/* Wake Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">Wake up time</span>
              </div>
              <Input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>

            {/* Duration Preview */}
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-3xl font-display font-bold text-foreground">
                {previewDuration.toFixed(1)} hours
              </p>
              <p className={`text-sm ${getSleepQualityColor(previewDuration)}`}>
                {getSleepQualityLabel(previewDuration)}
              </p>
            </div>

            <Button onClick={handleLogSleep} className="w-full">
              Log Sleep
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
