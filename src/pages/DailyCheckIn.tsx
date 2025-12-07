import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { MoodLevel, EnergyLevel, StressLevel, MOOD_EMOJIS, DailyCheckIn as DailyCheckInType } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
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
} from 'lucide-react';

const QUESTIONS = [
  { id: 'wake', title: 'What time did you wake up?', icon: Sun },
  { id: 'sleep', title: 'What time did you go to sleep last night?', icon: Moon },
  { id: 'phone', title: 'How long did you use your phone yesterday?', icon: Smartphone },
  { id: 'mood', title: 'How are you feeling today?', icon: Heart },
  { id: 'energy', title: "What's your energy level?", icon: Zap },
  { id: 'stress', title: "What's your stress level?", icon: Brain },
  { id: 'water', title: 'How many glasses of water will you drink today?', icon: Droplets },
  { id: 'exercise', title: 'Did you exercise today?', icon: Dumbbell },
  { id: 'notes', title: 'Any thoughts or reflections?', icon: Sparkles },
];

const DailyCheckInPage = () => {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { getCheckInForDate, saveCheckIn } = useLifeTracking();
  
  const [currentStep, setCurrentStep] = useState(0);
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

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const CurrentIcon = QUESTIONS[currentStep].icon;

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
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

  const handleSubmit = () => {
    saveCheckIn({
      date: today,
      ...formData,
    });
    
    toast.success('Daily check-in saved!', {
      description: 'Keep up the great work tracking your life.',
    });
    
    navigate('/');
  };

  const renderQuestion = () => {
    switch (QUESTIONS[currentStep].id) {
      case 'wake':
        return (
          <div className="space-y-4">
            <Input
              type="time"
              value={formData.wakeUpTime}
              onChange={(e) => setFormData({ ...formData, wakeUpTime: e.target.value })}
              className="text-2xl h-16 text-center glass border-primary/30"
            />
          </div>
        );
      
      case 'sleep':
        return (
          <div className="space-y-4">
            <Input
              type="time"
              value={formData.sleepTime}
              onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
              className="text-2xl h-16 text-center glass border-primary/30"
            />
          </div>
        );
      
      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-display font-bold text-foreground">
                {Math.floor(formData.phoneUsage / 60)}h {formData.phoneUsage % 60}m
              </span>
            </div>
            <Slider
              value={[formData.phoneUsage]}
              onValueChange={([value]) => setFormData({ ...formData, phoneUsage: value })}
              min={0}
              max={720}
              step={15}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>
        );
      
      case 'mood':
        return (
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFormData({ ...formData, mood: level })}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    formData.mood === level
                      ? 'bg-primary scale-110 shadow-glow'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: formData.mood === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {MOOD_EMOJIS[level]}
                </motion.button>
              ))}
            </div>
          </div>
        );
      
      case 'energy':
        return (
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFormData({ ...formData, energy: level })}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    formData.energy === level
                      ? 'bg-warning scale-110 shadow-lg'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: formData.energy === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className={`w-6 h-6 ${formData.energy >= level ? 'text-warning-foreground' : 'text-muted-foreground'}`} />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
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
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {([1, 2, 3, 4, 5] as StressLevel[]).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFormData({ ...formData, stress: level })}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    formData.stress === level
                      ? 'bg-destructive scale-110 shadow-lg'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  whileHover={{ scale: formData.stress === level ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className={`w-6 h-6 ${formData.stress >= level ? 'text-destructive-foreground' : 'text-muted-foreground'}`} />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {formData.stress === 1 && 'Relaxed'}
              {formData.stress === 2 && 'Slightly Stressed'}
              {formData.stress === 3 && 'Moderate'}
              {formData.stress === 4 && 'Stressed'}
              {formData.stress === 5 && 'Very Stressed'}
            </p>
          </div>
        );
      
      case 'water':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl font-display font-bold text-info">
                {formData.waterIntake}
              </span>
              <span className="text-xl text-muted-foreground ml-2">glasses</span>
            </div>
            <Slider
              value={[formData.waterIntake]}
              onValueChange={([value]) => setFormData({ ...formData, waterIntake: value })}
              min={0}
              max={16}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>8 (goal)</span>
              <span>16</span>
            </div>
          </div>
        );
      
      case 'exercise':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Switch
                checked={formData.exercise}
                onCheckedChange={(checked) => setFormData({ ...formData, exercise: checked })}
                className="scale-150"
              />
              <Label className="text-lg">
                {formData.exercise ? 'Yes, I exercised!' : 'Not yet'}
              </Label>
            </div>
            
            {formData.exercise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="text-3xl font-display font-bold text-success">
                    {formData.exerciseDuration}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">minutes</span>
                </div>
                <Slider
                  value={[formData.exerciseDuration]}
                  onValueChange={([value]) => setFormData({ ...formData, exerciseDuration: value })}
                  min={5}
                  max={180}
                  step={5}
                  className="py-4"
                />
              </motion.div>
            )}
          </div>
        );
      
      case 'notes':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Write your thoughts, reflections, or anything you want to remember about today..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[150px] glass border-primary/30"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-display font-bold text-foreground">Daily Check-in</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
          <div className="w-10" />
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <CurrentIcon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground">
                {QUESTIONS[currentStep].title}
              </h2>
            </div>

            {renderQuestion()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {QUESTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-primary w-6'
                    : idx < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            {currentStep === QUESTIONS.length - 1 ? (
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
      </main>
    </div>
  );
};

export default DailyCheckInPage;
