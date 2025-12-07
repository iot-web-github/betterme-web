import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Flame, Target, Zap, PartyPopper } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'streak' | 'goal' | 'tasks' | 'focus' | 'habits';
  milestone: number;
  message?: string;
}

const celebrationConfig = {
  streak: {
    icon: Flame,
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    title: 'Streak Milestone!',
    emoji: '🔥',
  },
  goal: {
    icon: Target,
    color: 'text-success',
    bgColor: 'bg-success/20',
    title: 'Goal Achieved!',
    emoji: '🎯',
  },
  tasks: {
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    title: 'Tasks Champion!',
    emoji: '🏆',
  },
  focus: {
    icon: Zap,
    color: 'text-info',
    bgColor: 'bg-info/20',
    title: 'Focus Master!',
    emoji: '⚡',
  },
  habits: {
    icon: Star,
    color: 'text-category-social',
    bgColor: 'bg-category-social/20',
    title: 'Habit Hero!',
    emoji: '⭐',
  },
};

const confettiColors = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899'];

export const CelebrationModal = ({ isOpen, onClose, type, milestone, message }: CelebrationModalProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);
  const config = celebrationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
      }));
      setConfetti(particles);

      // Clear confetti after animation
      const timer = setTimeout(() => setConfetti([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-border/50 max-w-sm overflow-hidden">
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
              initial={{ y: particle.y, rotate: 0, opacity: 1 }}
              animate={{
                y: '120%',
                rotate: particle.rotation + 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random(),
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6 relative z-10"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-20 h-20 rounded-full ${config.bgColor} mx-auto mb-4 flex items-center justify-center`}
          >
            <Icon className={`w-10 h-10 ${config.color}`} />
          </motion.div>

          {/* Emoji */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl mb-4"
          >
            {config.emoji}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-display font-bold text-foreground mb-2"
          >
            {config.title}
          </motion.h2>

          {/* Milestone */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="mb-4"
          >
            <span className={`text-4xl font-display font-bold ${config.color}`}>
              {milestone}
            </span>
            <span className="text-lg text-muted-foreground ml-1">
              {type === 'streak' ? 'days' : type === 'focus' ? 'minutes' : 'completed'}
            </span>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mb-6"
            >
              {message}
            </motion.p>
          )}

          {/* Action */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={onClose} className="gap-2">
              <PartyPopper className="w-4 h-4" />
              Keep Going!
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage celebrations
const CELEBRATION_KEY = 'smart-schedule-celebrations';

interface CelebrationState {
  lastStreakMilestone: number;
  lastTaskMilestone: number;
  lastGoalMilestone: number;
  lastFocusMilestone: number;
}

const getStoredCelebrations = (): CelebrationState => {
  try {
    const stored = localStorage.getItem(CELEBRATION_KEY);
    return stored ? JSON.parse(stored) : {
      lastStreakMilestone: 0,
      lastTaskMilestone: 0,
      lastGoalMilestone: 0,
      lastFocusMilestone: 0,
    };
  } catch {
    return {
      lastStreakMilestone: 0,
      lastTaskMilestone: 0,
      lastGoalMilestone: 0,
      lastFocusMilestone: 0,
    };
  }
};

export const useCelebrations = () => {
  const [celebration, setCelebration] = useState<{
    type: 'streak' | 'goal' | 'tasks' | 'focus' | 'habits';
    milestone: number;
    message: string;
  } | null>(null);

  const checkStreakMilestone = (currentStreak: number) => {
    const stored = getStoredCelebrations();
    const milestones = [7, 14, 30, 60, 100, 365];
    
    for (const milestone of milestones) {
      if (currentStreak >= milestone && stored.lastStreakMilestone < milestone) {
        stored.lastStreakMilestone = milestone;
        localStorage.setItem(CELEBRATION_KEY, JSON.stringify(stored));
        setCelebration({
          type: 'streak',
          milestone,
          message: `You've maintained a ${milestone}-day streak! Incredible consistency!`,
        });
        break;
      }
    }
  };

  const checkTaskMilestone = (completedTasks: number) => {
    const stored = getStoredCelebrations();
    const milestones = [10, 50, 100, 250, 500, 1000];
    
    for (const milestone of milestones) {
      if (completedTasks >= milestone && stored.lastTaskMilestone < milestone) {
        stored.lastTaskMilestone = milestone;
        localStorage.setItem(CELEBRATION_KEY, JSON.stringify(stored));
        setCelebration({
          type: 'tasks',
          milestone,
          message: `You've completed ${milestone} tasks total! Amazing productivity!`,
        });
        break;
      }
    }
  };

  const closeCelebration = () => setCelebration(null);

  return {
    celebration,
    checkStreakMilestone,
    checkTaskMilestone,
    closeCelebration,
  };
};
