import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useMoodTracker } from '@/hooks/useMoodTracker';
import { MOOD_EMOJIS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react';

export const EnhancedMoodTracker = () => {
  const {
    entries,
    triggers,
    addEntry,
    getWeeklyTrend,
    getTriggerStats,
    getWeeklyAverage,
  } = useMoodTracker();

  const [showQuickInput, setShowQuickInput] = useState(false);
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  const weeklyTrend = getWeeklyTrend();
  const triggerStats = getTriggerStats();
  const weeklyAverage = getWeeklyAverage();

  const getTrendIcon = () => {
    const recentDays = weeklyTrend.slice(-3);
    const earlierDays = weeklyTrend.slice(0, -3);
    
    const recentAvg = recentDays.filter(d => d.average > 0).reduce((sum, d) => sum + d.average, 0) / 
                      Math.max(1, recentDays.filter(d => d.average > 0).length);
    const earlierAvg = earlierDays.filter(d => d.average > 0).reduce((sum, d) => sum + d.average, 0) / 
                       Math.max(1, earlierDays.filter(d => d.average > 0).length);

    if (recentAvg > earlierAvg + 0.3) return <TrendingUp className="w-4 h-4 text-success" />;
    if (recentAvg < earlierAvg - 0.3) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const handleToggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmitMood = () => {
    if (selectedMood) {
      addEntry({
        level: selectedMood,
        triggers: selectedTriggers,
        reasons: reason,
      });
      setSelectedMood(null);
      setSelectedTriggers([]);
      setReason('');
      setShowQuickInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-display font-semibold text-foreground">Mood Tracker</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {getTrendIcon()}
            <span>{weeklyAverage > 0 ? weeklyAverage.toFixed(1) : '-'}/5</span>
          </div>
          <Button onClick={() => setShowQuickInput(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Log Mood
          </Button>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyTrend.map((day, idx) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs text-muted-foreground mb-1">
                {format(subDays(new Date(), 6 - idx), 'EEE')}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  day.average > 0 ? 'bg-secondary' : 'bg-secondary/30'
                }`}
              >
                {day.average > 0 ? MOOD_EMOJIS[Math.round(day.average) as 1 | 2 | 3 | 4 | 5] : '—'}
              </div>
              {day.entries > 0 && (
                <span className="text-xs text-muted-foreground mt-1">
                  {day.entries}x
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Mood Distribution</h3>
        <div className="flex justify-between items-end h-24">
          {([1, 2, 3, 4, 5] as const).map((level) => {
            const count = entries.filter(e => e.level === level).length;
            const maxCount = Math.max(...([1, 2, 3, 4, 5] as const).map(l => 
              entries.filter(e => e.level === l).length
            ), 1);
            const height = (count / maxCount) * 100;

            return (
              <div key={level} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  className="w-8 rounded-t-lg bg-primary/60"
                />
                <span className="text-lg">{MOOD_EMOJIS[level]}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trigger Analysis */}
      {triggerStats.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Trigger Analysis
          </h3>
          <div className="space-y-3">
            {triggerStats.slice(0, 5).map(stat => (
              <div key={stat.trigger} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-24 truncate">{stat.trigger}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.avgMood / 5) * 100}%` }}
                    className={`h-full rounded-full ${
                      stat.avgMood >= 4 ? 'bg-success' :
                      stat.avgMood >= 3 ? 'bg-warning' : 'bg-destructive'
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {stat.avgMood.toFixed(1)} ({stat.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Input Dialog */}
      <Dialog open={showQuickInput} onOpenChange={setShowQuickInput}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Mood Selection */}
            <div className="flex justify-center gap-4">
              {([1, 2, 3, 4, 5] as const).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setSelectedMood(level)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    selectedMood === level
                      ? 'bg-primary scale-110 shadow-glow'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: selectedMood === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {MOOD_EMOJIS[level]}
                </motion.button>
              ))}
            </div>

            {/* Triggers */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">What's affecting your mood?</p>
              <div className="flex flex-wrap gap-2">
                {triggers.map(trigger => (
                  <Badge
                    key={trigger}
                    variant={selectedTriggers.includes(trigger) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleToggleTrigger(trigger)}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Want to add more context?</p>
              <Textarea
                placeholder="Write about your mood..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitMood}
              className="w-full"
              disabled={!selectedMood}
            >
              Log Mood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
