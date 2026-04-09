import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { TrendingUp, LayoutGrid, Download } from 'lucide-react';

interface DashboardHeaderProps {
  onExport?: () => void;
  stats?: {
    totalTasks: number;
    completionRate: number;
    avgProductivity: number;
    bestStreak: number;
  };
}

export const DashboardHeader = ({ onExport, stats }: DashboardHeaderProps) => {
  const { user } = useAuth();

  const displayStats = [
    { label: 'Total Tasks', value: stats ? String(stats.totalTasks) : '—' },
    { label: 'Completion Rate', value: stats ? `${stats.completionRate}%` : '—' },
    { label: 'Avg. Productivity', value: stats ? stats.avgProductivity.toFixed(1) : '—' },
    { label: 'Best Streak', value: stats ? `${stats.bestStreak}d` : '—' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-info to-success flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Your insights & progress • {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5 h-9">
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
          <Link to="/">
            <Button variant="default" size="sm" className="gap-1.5 h-9">
              <LayoutGrid className="w-4 h-4" />
              Schedule
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/30">
        {displayStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
