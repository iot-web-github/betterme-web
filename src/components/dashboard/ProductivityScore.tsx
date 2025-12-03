import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ProductivityScoreProps {
  score: number;
  label?: string;
}

export const ProductivityScore = ({ score, label = "Today's Productivity" }: ProductivityScoreProps) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-primary';
    if (score >= 40) return 'stroke-warning';
    return 'stroke-destructive';
  };

  const getMessage = (score: number) => {
    if (score >= 80) return { text: 'Excellent!', icon: Award };
    if (score >= 60) return { text: 'Good job!', icon: TrendingUp };
    if (score >= 40) return { text: 'Keep going!', icon: Target };
    return { text: 'You can do better!', icon: Target };
  };

  const message = getMessage(score);
  const MessageIcon = message.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background decoration */}
      {score >= 60 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <p className="text-sm text-muted-foreground mb-4 relative z-10">{label}</p>
      
      <div className="relative w-32 h-32">
        {/* Glow effect for high scores */}
        {score >= 80 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px hsl(var(--success) / 0.2)',
                '0 0 40px hsl(var(--success) / 0.4)',
                '0 0 20px hsl(var(--success) / 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Background circle */}
        <svg className="w-full h-full -rotate-90 relative z-10">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            className={getStrokeColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={cn('text-3xl font-bold', getScoreColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      
      <motion.div 
        className={cn(
          'flex items-center gap-2 mt-4 text-sm font-medium',
          getScoreColor(score)
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <MessageIcon className="w-4 h-4" />
        <span>{message.text}</span>
      </motion.div>
    </motion.div>
  );
};
