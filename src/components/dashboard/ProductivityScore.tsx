import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6 flex flex-col items-center justify-center"
    >
      <p className="text-sm text-muted-foreground mb-4">{label}</p>
      
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
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
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={cn('text-3xl font-bold', getScoreColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      
      <p className={cn(
        'text-sm font-medium mt-4',
        getScoreColor(score)
      )}>
        {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : score >= 40 ? 'Keep going!' : 'You can do better!'}
      </p>
    </motion.div>
  );
};
