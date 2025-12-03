import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Lock, ChevronRight } from 'lucide-react';
import { Achievement } from '@/hooks/useStreaks';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AchievementsCardProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalAchievements: number;
}

export const AchievementsCard = ({ 
  achievements, 
  unlockedCount, 
  totalAchievements 
}: AchievementsCardProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const displayAchievements = showAll 
    ? achievements 
    : achievements.slice(0, 4);

  const progressPercent = (unlockedCount / totalAchievements) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Achievements</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{totalAchievements}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-success rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <AnimatePresence mode="popLayout">
          {displayAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg aspect-square cursor-pointer group",
                achievement.unlockedAt 
                  ? "bg-primary/10 hover:bg-primary/20" 
                  : "bg-muted/50"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {achievement.unlockedAt ? (
                <motion.span 
                  className="text-xl"
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    repeat: 0,
                  }}
                >
                  {achievement.icon}
                </motion.span>
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover text-popover-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                <p className="font-medium">{achievement.name}</p>
                <p className="text-muted-foreground text-[10px]">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more button */}
      {totalAchievements > 4 && (
        <motion.button
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          onClick={() => setShowAll(!showAll)}
          whileTap={{ scale: 0.98 }}
        >
          {showAll ? 'Show less' : `Show all ${totalAchievements} achievements`}
          <ChevronRight className={cn(
            "w-3 h-3 transition-transform",
            showAll && "rotate-90"
          )} />
        </motion.button>
      )}
    </motion.div>
  );
};
