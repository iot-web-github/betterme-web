import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useEnergyTracker } from '@/hooks/useEnergyTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Zap,
  Plus,
  TrendingUp,
  Clock,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
} from 'lucide-react';

const ENERGY_ICONS = {
  1: BatteryLow,
  2: BatteryLow,
  3: BatteryMedium,
  4: BatteryFull,
  5: BatteryCharging,
};

const ENERGY_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Peak'];
const ENERGY_COLORS = [
  'text-destructive',
  'text-warning',
  'text-muted-foreground',
  'text-success',
  'text-primary',
];

export const EnergyTracker = () => {
  const {
    logs,
    addLog,
    getWeeklyTrend,
    getPeakEnergyTime,
    getWeeklyAverage,
    getLogsForDate,
  } = useEnergyTracker();

  const [showQuickInput, setShowQuickInput] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = getLogsForDate(today);
  const weeklyTrend = getWeeklyTrend();
  const peakTime = getPeakEnergyTime();
  const weeklyAverage = getWeeklyAverage();

  const handleSubmit = () => {
    if (selectedLevel) {
      addLog({ level: selectedLevel, note: note || undefined });
      setSelectedLevel(null);
      setNote('');
      setShowQuickInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-display font-semibold text-foreground">Energy Tracker</h2>
        </div>
        <Button onClick={() => setShowQuickInput(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Log Energy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Weekly Average</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {weeklyAverage > 0 ? weeklyAverage.toFixed(1) : '-'}
          </p>
          <p className="text-xs text-muted-foreground">out of 5</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Peak Time</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {peakTime || '-'}
          </p>
          <p className="text-xs text-muted-foreground">highest energy</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Today's Logs</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {todayLogs.length}
          </p>
          <p className="text-xs text-muted-foreground">entries</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {todayLogs.length > 0 ? ENERGY_LABELS[todayLogs[todayLogs.length - 1].level - 1] : '-'}
          </p>
          <p className="text-xs text-muted-foreground">energy level</p>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Weekly Energy Trend
        </h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyTrend.map((day, idx) => {
            const height = day.average > 0 ? (day.average / 5) * 100 : 5;
            const colorClass = day.average >= 4 ? 'bg-success' : 
                              day.average >= 3 ? 'bg-warning' : 
                              day.average > 0 ? 'bg-destructive' : 'bg-muted';

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.05 }}
                  className={`w-full rounded-t-lg ${colorClass}`}
                />
                <span className="text-xs text-muted-foreground">
                  {format(subDays(new Date(), 6 - idx), 'EEE')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Timeline */}
      {todayLogs.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Energy Timeline
          </h3>
          <div className="space-y-3">
            {todayLogs.map((log, idx) => {
              const Icon = ENERGY_ICONS[log.level];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <span className="text-sm text-muted-foreground w-12">{log.time}</span>
                  <Icon className={`w-5 h-5 ${ENERGY_COLORS[log.level - 1]}`} />
                  <span className="text-sm font-medium text-foreground">
                    {ENERGY_LABELS[log.level - 1]}
                  </span>
                  {log.note && (
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      — {log.note}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Input Dialog */}
      <Dialog open={showQuickInput} onOpenChange={setShowQuickInput}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>How's your energy?</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Energy Selection */}
            <div className="space-y-2">
              {([1, 2, 3, 4, 5] as const).map((level) => {
                const Icon = ENERGY_ICONS[level];
                return (
                  <motion.button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      selectedLevel === level
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Icon className={`w-6 h-6 ${ENERGY_COLORS[level - 1]}`} />
                    <span className="text-foreground font-medium">{ENERGY_LABELS[level - 1]}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Note */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Add a note (optional)</p>
              <Input
                placeholder="What's affecting your energy?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!selectedLevel}
            >
              Log Energy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
