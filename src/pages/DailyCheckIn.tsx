import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { usePersonalizedCheckin } from '@/hooks/usePersonalizedCheckin';
import { MoodLevel, EnergyLevel, StressLevel, MOOD_EMOJIS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sun,
  Moon,
  Smartphone,
  Heart,
  Zap,
  Brain,
  Droplets,
  Dumbbell,
  Sparkles,
  Flame,
  MessageCircle,
  Camera,
} from 'lucide-react';

const STANDARD_QUESTIONS = [
  { id: 'wake', title: 'Wake up time?', icon: Sun },
  { id: 'sleep', title: 'Bedtime last night?', icon: Moon },
  { id: 'phone', title: 'Screen time yesterday?', icon: Smartphone },
  { id: 'mood', title: 'How do you feel?', icon: Heart },
  { id: 'energy', title: 'Energy level?', icon: Zap },
  { id: 'stress', title: 'Stress level?', icon: Brain },
  { id: 'water', title: 'Water intake goal?', icon: Droplets },
  { id: 'exercise', title: 'Did you exercise?', icon: Dumbbell },
  { id: 'notes', title: 'Any reflections?', icon: Sparkles },
];

const DailyCheckInPage = () => {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { getCheckInForDate, saveCheckIn } = useLifeTracking();
  const { personalizedQuestions, checkinStreak, updateStreakAfterCheckin } = usePersonalizedCheckin();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [personalizedAnswers, setPersonalizedAnswers] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    phoneUsage: 120,
    mood: 3 as MoodLevel,
    energy: 3 as EnergyLevel,
    stress: 3 as StressLevel,
    waterIntake: 8,
    exercise: false,
    exerciseDuration: 30,
    notes: '',
  });

  // Build combined questions list - personalized first, then standard
  const allQuestions = [
    ...personalizedQuestions.map(pq => ({
      id: pq.id,
      title: pq.question,
      icon: MessageCircle,
      type: 'personalized' as const,
      context: pq.context,
    })),
    ...STANDARD_QUESTIONS.map(q => ({ ...q, type: 'standard' as const })),
  ];

  useEffect(() => {
    const existing = getCheckInForDate(today);
    if (existing) {
      setFormData({
        wakeUpTime: existing.wakeUpTime,
        sleepTime: existing.sleepTime,
        phoneUsage: existing.phoneUsage,
        mood: existing.mood,
        energy: existing.energy,
        stress: existing.stress,
        waterIntake: existing.waterIntake,
        exercise: existing.exercise,
        exerciseDuration: existing.exerciseDuration || 30,
        notes: existing.notes || '',
      });
    }
  }, [today, getCheckInForDate]);

  const [isParsing, setIsParsing] = useState(false);
  const [quickLogText, setQuickLogText] = useState('');
  const [isScanningScreenshot, setIsScanningScreenshot] = useState(false);

  const handleQuickLog = async () => {
    if (!quickLogText.trim()) return;
    
    setIsParsing(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-log-parser', {
        body: { text: quickLogText },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data) {
        setFormData(prev => ({
          ...prev,
          wakeUpTime: data.wakeUpTime || prev.wakeUpTime,
          sleepTime: data.sleepTime || prev.sleepTime,
          phoneUsage: data.phoneUsage ?? prev.phoneUsage,
          mood: data.mood || prev.mood,
          energy: data.energy || prev.energy,
          stress: data.stress || prev.stress,
          waterIntake: data.waterIntake ?? prev.waterIntake,
          exercise: data.exercise != null ? data.exercise : prev.exercise,
          exerciseDuration: data.exerciseDuration || prev.exerciseDuration,
          notes: data.notes || prev.notes,
        }));

        const parts: string[] = ['Check-in fields auto-filled.'];
        if (data.tasksCreated > 0) {
          parts.push(`${data.tasksCreated} task${data.tasksCreated > 1 ? 's' : ''} created.`);
        }
        if (data.moodEntry) parts.push('Mood logged.');
        if (data.energyEntry) parts.push('Energy logged.');
        
        toast.success('AI parsed your day!', { description: parts.join(' ') });
        
        const notesIdx = allQuestions.findIndex(q => q.id === 'notes');
        if (notesIdx !== -1) setCurrentStep(notesIdx);
      }
    } catch (err: any) {
      console.error('Quick log error:', err);
      const message = err?.message || 'Could not parse your log automatically.';
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleScreenshotScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file is too large. Please choose a smaller image.');
      return;
    }

    setIsScanningScreenshot(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Create form data for the API call
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const { data, error } = await supabase.functions.invoke('ai-screen-time-scanner', {
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.screenTime !== undefined && data.confidence > 0.5) {
        setFormData(prev => ({
          ...prev,
          phoneUsage: data.screenTime
        }));

        toast.success('Screen time detected!', {
          description: `Found ${Math.floor(data.screenTime / 60)}h ${data.screenTime % 60}m of screen time.`,
        });
      } else {
        toast.error('Could not detect screen time in the image. Please try a clearer screenshot.');
      }
    } catch (err) {
      console.error('Screenshot scan error:', err);
      toast.error('Failed to scan screenshot. Please try again.');
    } finally {
      setIsScanningScreenshot(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const progress = ((currentStep + 1) / allQuestions.length) * 100;
  const currentQuestion = allQuestions[currentStep];
  const CurrentIcon = currentQuestion?.icon || Sparkles;

  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Save the check-in
    await saveCheckIn({
      date: today,
      ...formData,
    });
    
    // Update streak
    const newStreak = await updateStreakAfterCheckin();
    
    toast.success('Check-in saved!', {
      description: newStreak && newStreak.current > 1 
        ? `🔥 ${newStreak.current} day streak!` 
        : 'Keep tracking your progress.',
    });
    
    navigate('/');
  };

  const renderQuestion = () => {
    const question = allQuestions[currentStep];
    
    // Handle personalized questions
    if (question.type === 'personalized') {
      return (
        <div className="space-y-4">
          {question.context && (
            <p className="text-xs text-muted-foreground text-center px-4 py-2 bg-primary/5 rounded-lg">
              💡 {question.context}
            </p>
          )}
          <Textarea
            placeholder="Share your thoughts..."
            value={personalizedAnswers[question.id] || ''}
            onChange={(e) => setPersonalizedAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
            className="min-h-[100px] glass border-primary/20 text-sm"
          />
        </div>
      );
    }

    // Standard questions
    switch (question.id) {
      case 'wake':
        return (
          <Input
            type="time"
            value={formData.wakeUpTime}
            onChange={(e) => setFormData({ ...formData, wakeUpTime: e.target.value })}
            className="text-xl h-14 text-center glass border-primary/20"
          />
        );
      
      case 'sleep':
        return (
          <Input
            type="time"
            value={formData.sleepTime}
            onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
            className="text-xl h-14 text-center glass border-primary/20"
          />
        );
      
      case 'phone':
        return (
          <div className="space-y-5">
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-foreground">
                {Math.floor(formData.phoneUsage / 60)}h {formData.phoneUsage % 60}m
              </span>
            </div>
            <Slider
              value={[formData.phoneUsage]}
              onValueChange={([value]) => setFormData({ ...formData, phoneUsage: value })}
              min={0}
              max={720}
              step={15}
              className="py-3"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
            
            {/* Scan Screenshot Button */}
            <div className="flex justify-center pt-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotScan}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isScanningScreenshot}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
                  disabled={isScanningScreenshot}
                >
                  <Camera className="w-4 h-4 text-primary" />
                  {isScanningScreenshot ? 'Scanning...' : 'Scan Screenshot'}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Upload a screenshot of your screen time to auto-fill
            </p>
          </div>
        );
      
      case 'mood':
        return (
          <div className="flex justify-center gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <motion.button
                key={level}
                onClick={() => setFormData({ ...formData, mood: level })}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                  formData.mood === level
                    ? 'bg-primary scale-110 shadow-lg'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                whileHover={{ scale: formData.mood === level ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {MOOD_EMOJIS[level]}
              </motion.button>
            ))}
          </div>
        );
      
      case 'energy':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFormData({ ...formData, energy: level })}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    formData.energy === level
                      ? 'bg-warning scale-110 shadow-lg'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: formData.energy === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className={`w-5 h-5 ${formData.energy >= level ? 'text-warning-foreground' : 'text-muted-foreground'}`} />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {formData.energy === 1 && 'Very Low'}
              {formData.energy === 2 && 'Low'}
              {formData.energy === 3 && 'Moderate'}
              {formData.energy === 4 && 'High'}
              {formData.energy === 5 && 'Very High'}
            </p>
          </div>
        );
      
      case 'stress':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {([1, 2, 3, 4, 5] as StressLevel[]).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFormData({ ...formData, stress: level })}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    formData.stress === level
                      ? 'bg-destructive scale-110 shadow-lg'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: formData.stress === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className={`w-5 h-5 ${formData.stress >= level ? 'text-destructive-foreground' : 'text-muted-foreground'}`} />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {formData.stress === 1 && 'Relaxed'}
              {formData.stress === 2 && 'Slight'}
              {formData.stress === 3 && 'Moderate'}
              {formData.stress === 4 && 'Stressed'}
              {formData.stress === 5 && 'Very Stressed'}
            </p>
          </div>
        );
      
      case 'water':
        return (
          <div className="space-y-5">
            <div className="text-center">
              <span className="text-4xl font-display font-bold text-info">
                {formData.waterIntake}
              </span>
              <span className="text-lg text-muted-foreground ml-2">glasses</span>
            </div>
            <Slider
              value={[formData.waterIntake]}
              onValueChange={([value]) => setFormData({ ...formData, waterIntake: value })}
              min={0}
              max={16}
              step={1}
              className="py-3"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>8 (goal)</span>
              <span>16</span>
            </div>
          </div>
        );
      
      case 'exercise':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-3">
              <Switch
                checked={formData.exercise}
                onCheckedChange={(checked) => setFormData({ ...formData, exercise: checked })}
                className="scale-125"
              />
              <Label className="text-base">
                {formData.exercise ? 'Yes!' : 'Not yet'}
              </Label>
            </div>
            
            {formData.exercise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="text-center">
                  <span className="text-2xl font-display font-bold text-success">
                    {formData.exerciseDuration}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">minutes</span>
                </div>
                <Slider
                  value={[formData.exerciseDuration]}
                  onValueChange={([value]) => setFormData({ ...formData, exerciseDuration: value })}
                  min={5}
                  max={180}
                  step={5}
                  className="py-3"
                />
              </motion.div>
            )}
          </div>
        );
      
      case 'notes':
        return (
          <Textarea
            placeholder="Thoughts, gratitude, or goals for today..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="min-h-[120px] glass border-primary/20 text-sm"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Daily Check-in</h1>
              <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-lg font-semibold text-primary">{checkinStreak.current || 0} days</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {allQuestions.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Current Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card/50 rounded-2xl border border-border/50 p-6 mb-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.type === 'personalized' && currentQuestion.context && (
                  <p className="text-sm text-muted-foreground">{currentQuestion.context}</p>
                )}
              </div>
            </div>

            {renderQuestion()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {currentStep === allQuestions.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Quick Log Sidebar */}
        <div className="mt-8 bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Quick AI Log</h3>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your day in a few sentences..."
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleQuickLog}
              disabled={isParsing || !quickLogText.trim()}
              className="w-full gap-2"
              variant="secondary"
            >
              {isParsing ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              Parse with AI
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyCheckInPage;
