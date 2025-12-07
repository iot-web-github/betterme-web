import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardCheck,
  Sun,
  Moon,
  Smartphone,
  Droplets,
  Dumbbell,
  ArrowRight,
} from 'lucide-react';

export const CheckInCard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { getCheckInForDate, getWeeklyStats } = useLifeTracking();
  const todayCheckIn = getCheckInForDate(today);
  const weeklyStats = getWeeklyStats();

  if (!todayCheckIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-success" />
            Daily Check-in
          </h3>
        </div>

        <div className="text-center py-6">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ClipboardCheck className="w-8 h-8 text-success" />
          </motion.div>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't checked in today. Let's track how you're doing!
          </p>
          <Link to="/checkin">
            <Button className="gap-2">
              Start Check-in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-success" />
          Today's Check-in
        </h3>
        <span className="text-3xl">{MOOD_EMOJIS[todayCheckIn.mood]}</span>
      </div>

      <div className="space-y-4">
        {/* Mood & Energy Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="text-2xl">{MOOD_EMOJIS[todayCheckIn.mood]}</div>
            <div>
              <p className="text-xs text-muted-foreground">Mood</p>
              <p className="text-sm font-medium text-foreground">{MOOD_LABELS[todayCheckIn.mood]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
              <span className="text-warning font-bold">{todayCheckIn.energy}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Energy</p>
              <p className="text-sm font-medium text-foreground">Level {todayCheckIn.energy}/5</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/30">
            <Sun className="w-4 h-4 text-warning mb-1" />
            <span className="text-xs font-medium text-foreground">{todayCheckIn.wakeUpTime}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/30">
            <Moon className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs font-medium text-foreground">{todayCheckIn.sleepTime}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/30">
            <Droplets className="w-4 h-4 text-info mb-1" />
            <span className="text-xs font-medium text-foreground">{todayCheckIn.waterIntake}💧</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/30">
            <Dumbbell className={`w-4 h-4 mb-1 ${todayCheckIn.exercise ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium text-foreground">
              {todayCheckIn.exercise ? `${todayCheckIn.exerciseDuration}m` : 'No'}
            </span>
          </div>
        </div>

        {/* Phone Usage */}
        <div className="p-3 rounded-xl bg-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Phone Usage</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {Math.floor(todayCheckIn.phoneUsage / 60)}h {todayCheckIn.phoneUsage % 60}m
            </span>
          </div>
          <Progress value={Math.min((todayCheckIn.phoneUsage / 360) * 100, 100)} className="h-1.5" />
        </div>

        {/* Update Button */}
        <Link to="/checkin">
          <Button variant="outline" size="sm" className="w-full gap-2">
            Update Check-in
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
