import { motion } from 'framer-motion';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { CalendarDays, Zap, Sparkles } from 'lucide-react';

export const Header = () => {
  const { timeString, currentTime } = useCurrentTime();
  
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="glass border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5 text-primary-foreground" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-3 h-3 text-warning" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SmartSchedule</h1>
              <p className="text-xs text-muted-foreground">Your productivity coach</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <motion.div 
              className="hidden sm:flex items-center gap-2 text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary/50"
              whileHover={{ scale: 1.02 }}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </motion.div>
            
            <motion.div 
              className="text-right px-4 py-2 rounded-xl glass"
              whileHover={{ scale: 1.02 }}
            >
              <motion.p 
                className="text-2xl font-bold text-foreground tabular-nums"
                key={timeString}
                initial={{ opacity: 0.5, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {timeString}
              </motion.p>
              <p className="text-xs text-muted-foreground">Current Time</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
