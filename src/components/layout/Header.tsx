import { motion } from 'framer-motion';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { Sparkles, Zap } from 'lucide-react';

export const Header = () => {
  const { timeString, currentTime } = useCurrentTime();
  
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div 
              className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-info flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-6 h-6 text-primary-foreground" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-warning drop-shadow-lg" />
              </motion.div>
            </motion.div>
            <div>
              <motion.h1 
                className="text-2xl font-display font-bold gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                SmartSchedule
              </motion.h1>
              <motion.p 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {greeting()} ✨
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div 
              className="hidden sm:block text-right"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm font-medium text-foreground">{formattedDate}</p>
            </motion.div>
            
            <motion.div 
              className="px-4 py-2.5 rounded-2xl glass border border-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <motion.p 
                className="text-2xl font-display font-bold text-foreground tabular-nums tracking-tight"
                key={timeString}
                initial={{ opacity: 0.5, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {timeString}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
