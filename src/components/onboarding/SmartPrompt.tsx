import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoutineDetection } from '@/hooks/useRoutineDetection';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { useAppTime } from '@/hooks/useAppTime';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { X, Sun, Moon, Zap, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

type PromptType = 'morning' | 'night' | null;

interface SmartPromptProps {
  onClose: () => void;
}

export const SmartPrompt = ({ onClose }: SmartPromptProps) => {
  const { now, today } = useAppTime();
  const routine = useRoutineDetection();
  const { getCheckInForDate, saveCheckIn } = useLifeTracking();
  const [promptType, setPromptType] = useState<PromptType>(null);
  const [dismissed, setDismissed] = useState(false);

  // Form state
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [productivityRating, setProductivityRating] = useState(3);
  const [plannedSleepTime, setPlannedSleepTime] = useState('23:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Check if we should show a prompt
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    // Parse recommended times
    const [morningH, morningM] = routine.recommendedMorningPromptTime.split(':').map(Number);
    const [nightH, nightM] = routine.recommendedNightPromptTime.split(':').map(Number);
    const morningMinutes = morningH * 60 + morningM;
    const nightMinutes = nightH * 60 + nightM;

    // Check if already checked in today
    const todayCheckIn = getCheckInForDate(today);

    // Determine prompt type based on time
    // Show morning prompt within 2 hours of recommended time
    if (currentTotalMinutes >= morningMinutes && currentTotalMinutes <= morningMinutes + 120) {
      // Only show if no check-in today or check-in incomplete
      if (!todayCheckIn || !todayCheckIn.wakeUpTime) {
        setPromptType('morning');
      }
    }
    // Show night prompt within 2 hours of recommended time
    else if (currentTotalMinutes >= nightMinutes && currentTotalMinutes <= nightMinutes + 120) {
      setPromptType('night');
    }

    // Check localStorage for dismissed prompts
    const dismissedKey = `prompt_dismissed_${today}_${promptType}`;
    if (localStorage.getItem(dismissedKey)) {
      setDismissed(true);
    }
  }, [now, routine, getCheckInForDate, today]);

  const handleDismiss = () => {
    const dismissedKey = `prompt_dismissed_${today}_${promptType}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
    onClose();
  };

  const handleSubmit = async () => {
    const existingCheckIn = getCheckInForDate(today);

    if (promptType === 'morning') {
      await saveCheckIn({
        date: today,
        wakeUpTime: existingCheckIn?.wakeUpTime || routine.averageWakeTime,
        sleepTime: existingCheckIn?.sleepTime || routine.averageSleepTime,
        phoneUsage: existingCheckIn?.phoneUsage || 0,
        mood: sleepQuality as 1 | 2 | 3 | 4 | 5,
        energy: energyLevel as 1 | 2 | 3 | 4 | 5,
        stress: existingCheckIn?.stress || 3,
        waterIntake: existingCheckIn?.waterIntake || 0,
        exercise: existingCheckIn?.exercise || false,
        notes: notes || existingCheckIn?.notes,
      });
      toast.success('Morning check-in saved!', {
        description: 'Have a productive day!',
      });
    } else if (promptType === 'night') {
      await saveCheckIn({
        date: today,
        wakeUpTime: existingCheckIn?.wakeUpTime || routine.averageWakeTime,
        sleepTime: plannedSleepTime,
        phoneUsage: existingCheckIn?.phoneUsage || 0,
        mood: productivityRating as 1 | 2 | 3 | 4 | 5,
        energy: existingCheckIn?.energy || 3,
        stress: existingCheckIn?.stress || 3,
        waterIntake: existingCheckIn?.waterIntake || 0,
        exercise: existingCheckIn?.exercise || false,
        notes: notes || existingCheckIn?.notes,
      });
      toast.success('Evening check-in saved!', {
        description: 'Rest well tonight!',
      });
    }

    handleDismiss();
  };

  if (dismissed || !promptType) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 bottom-20 z-50 max-w-md mx-auto"
      >
        <div className="glass rounded-2xl p-5 border border-primary/20 shadow-glow">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                promptType === 'morning' 
                  ? 'bg-warning/20' 
                  : 'bg-primary/20'
              }`}>
                {promptType === 'morning' ? (
                  <Sun className="w-5 h-5 text-warning" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">
                  {promptType === 'morning' ? 'Good Morning!' : 'Evening Reflection'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quick check-in ({routine.personType === 'morning' ? 'Early bird' : routine.personType === 'night' ? 'Night owl' : 'Balanced'})
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Morning Prompt Content */}
          {promptType === 'morning' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Sleep Quality
                  </span>
                  <span className="text-xs text-muted-foreground">{sleepQuality}/5</span>
                </div>
                <Slider
                  value={[sleepQuality]}
                  onValueChange={([v]) => setSleepQuality(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    Energy Level
                  </span>
                  <span className="text-xs text-muted-foreground">{energyLevel}/5</span>
                </div>
                <Slider
                  value={[energyLevel]}
                  onValueChange={([v]) => setEnergyLevel(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* Night Prompt Content */}
          {promptType === 'night' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Today's Productivity
                  </span>
                  <span className="text-xs text-muted-foreground">{productivityRating}/5</span>
                </div>
                <Slider
                  value={[productivityRating]}
                  onValueChange={([v]) => setProductivityRating(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-info" />
                    Planned Bedtime
                  </span>
                </div>
                <input
                  type="time"
                  value={plannedSleepTime}
                  onChange={(e) => setPlannedSleepTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <Textarea
              placeholder={promptType === 'morning' ? 'Any goals for today?' : 'Reflections on today...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] text-sm bg-secondary/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={handleDismiss} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
