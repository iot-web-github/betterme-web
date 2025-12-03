import { motion } from 'framer-motion';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { CalendarDays, Zap } from 'lucide-react';

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
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
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground tabular-nums">{timeString}</p>
              <p className="text-xs text-muted-foreground">Current Time</p>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
