import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtendedStreakData {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  perfectDays: number;
  checkinStreak?: number;
  longestCheckinStreak?: number;
}

interface StreakCardProps {
  streakData: ExtendedStreakData;
}

export const StreakCard = ({ streakData }: StreakCardProps) => {
  const { currentStreak, longestStreak, totalTasksCompleted, perfectDays, checkinStreak = 0, longestCheckinStreak = 0 } = streakData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 sm:p-5 overflow-hidden relative"
    >
      {/* Animated background glow for active streak */}
      {currentStreak > 0 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-primary/10"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={currentStreak > 0 ? {
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0],
            } : {}}
            transition={{
              duration: 0.6,
              repeat: currentStreak > 0 ? Infinity : 0,
              repeatDelay: 2,
            }}
          >
            <Flame className={cn(
              "w-5 h-5",
              currentStreak > 0 ? "text-warning" : "text-muted-foreground"
            )} />
          </motion.div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Streaks & Progress</h3>
        </div>

        {/* Dual streak display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Task Streak */}
          <motion.div
            className={cn(
              "relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full",
              currentStreak > 0 
                ? "bg-gradient-to-br from-warning/20 to-primary/20" 
                : "bg-muted/50"
            )}
            animate={currentStreak >= 7 ? {
              boxShadow: [
                "0 0 0 0 rgba(251, 191, 36, 0)",
                "0 0 0 8px rgba(251, 191, 36, 0.1)",
                "0 0 0 0 rgba(251, 191, 36, 0)",
              ],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Flame className={cn(
              "w-4 h-4 mb-0.5",
              currentStreak > 0 ? "text-warning" : "text-muted-foreground"
            )} />
            <motion.span
              className={cn(
                "text-2xl sm:text-3xl font-bold",
                currentStreak > 0 ? "text-warning" : "text-muted-foreground"
              )}
              key={currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentStreak}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">tasks</span>
          </motion.div>

          {/* Check-in Streak */}
          <motion.div
            className={cn(
              "relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full",
              checkinStreak > 0 
                ? "bg-gradient-to-br from-info/20 to-success/20" 
                : "bg-muted/50"
            )}
            animate={checkinStreak >= 7 ? {
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0)",
                "0 0 0 8px rgba(34, 197, 94, 0.1)",
                "0 0 0 0 rgba(34, 197, 94, 0)",
              ],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <ClipboardCheck className={cn(
              "w-4 h-4 mb-0.5",
              checkinStreak > 0 ? "text-success" : "text-muted-foreground"
            )} />
            <motion.span
              className={cn(
                "text-2xl sm:text-3xl font-bold",
                checkinStreak > 0 ? "text-success" : "text-muted-foreground"
              )}
              key={checkinStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {checkinStreak}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">check-ins</span>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <motion.div
            className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-secondary/50"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mb-0.5" />
            <span className="text-sm sm:text-lg font-bold text-foreground">{longestStreak}</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">Best</span>
          </motion.div>
          
          <motion.div
            className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-secondary/50"
            whileHover={{ scale: 1.05 }}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success mb-0.5" />
            <span className="text-sm sm:text-lg font-bold text-foreground">{totalTasksCompleted}</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">Tasks</span>
          </motion.div>
          
          <motion.div
            className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-secondary/50"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning mb-0.5" />
            <span className="text-sm sm:text-lg font-bold text-foreground">{perfectDays}</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">Perfect</span>
          </motion.div>

          <motion.div
            className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-secondary/50"
            whileHover={{ scale: 1.05 }}
          >
            <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-info mb-0.5" />
            <span className="text-sm sm:text-lg font-bold text-foreground">{longestCheckinStreak}</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">C-Best</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
