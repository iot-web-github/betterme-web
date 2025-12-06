import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTimer, TimerState } from '@/hooks/useFocusTimer';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, SkipForward, Coffee, Target, Flame } from 'lucide-react';

interface FocusModeProps {
  taskId?: string;
  taskTitle?: string;
  onClose: () => void;
}

export const FocusMode = ({ taskId, taskTitle, onClose }: FocusModeProps) => {
  const {
    state,
    formattedTime,
    completedPomodoros,
    totalFocusToday,
    startFocus,
    pause,
    resume,
    stop,
    skipBreak,
  } = useFocusTimer(25, 5);

  const getStateColor = () => {
    switch (state) {
      case 'focus':
        return 'from-primary/20 to-purple-500/20';
      case 'break':
        return 'from-emerald-500/20 to-teal-500/20';
      default:
        return 'from-secondary/50 to-secondary/30';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'focus':
        return <Target className="w-6 h-6" />;
      case 'break':
        return <Coffee className="w-6 h-6" />;
      default:
        return <Play className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4"
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="flex flex-col items-center gap-8 px-4">
        {/* Task Title */}
        {taskTitle && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-lg"
          >
            {taskTitle}
          </motion.p>
        )}

        {/* Timer Circle */}
        <motion.div
          className={`relative w-72 h-72 rounded-full bg-gradient-to-br ${getStateColor()} flex items-center justify-center`}
          animate={{
            scale: state === 'focus' ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: state === 'focus' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-2 rounded-full bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <motion.div
              key={state}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-muted-foreground mb-2"
            >
              {getStateIcon()}
            </motion.div>
            <motion.span
              className="text-6xl font-display font-bold text-foreground"
              key={formattedTime}
            >
              {formattedTime}
            </motion.span>
            <span className="text-sm text-muted-foreground mt-2 capitalize">
              {state === 'idle' ? 'Ready to focus' : state === 'paused' ? 'Paused' : state}
            </span>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  size="lg"
                  onClick={() => startFocus(taskId)}
                  className="gap-2 px-8 bg-primary hover:bg-primary/90"
                >
                  <Play className="w-5 h-5" />
                  Start Focus
                </Button>
              </motion.div>
            )}

            {state === 'focus' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3"
              >
                <Button variant="outline" size="lg" onClick={pause} className="gap-2">
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
                <Button variant="ghost" size="lg" onClick={stop}>
                  Stop
                </Button>
              </motion.div>
            )}

            {state === 'paused' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3"
              >
                <Button size="lg" onClick={resume} className="gap-2 bg-primary hover:bg-primary/90">
                  <Play className="w-5 h-5" />
                  Resume
                </Button>
                <Button variant="ghost" size="lg" onClick={stop}>
                  Stop
                </Button>
              </motion.div>
            )}

            {state === 'break' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3"
              >
                <Button variant="outline" size="lg" onClick={skipBreak} className="gap-2">
                  <SkipForward className="w-5 h-5" />
                  Skip Break
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm">
              <strong className="text-foreground">{completedPomodoros}</strong> pomodoros today
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm">
              <strong className="text-foreground">{totalFocusToday}</strong> min focused
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
