import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { TrendingUp, LayoutGrid, Download } from 'lucide-react';

interface DashboardHeaderProps {
  onExport?: () => void;
}

export const DashboardHeader = ({ onExport }: DashboardHeaderProps) => {
  const { user } = useAuth();

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
            <TrendingUp className="w-7 h-7 text-white" />
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

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/30">
        {[
          { label: 'Total Tasks', value: '247', change: '+12%' },
          { label: 'Completion Rate', value: '89%', change: '+5%' },
          { label: 'Avg. Productivity', value: '7.8', change: '+0.3' },
          { label: 'Best Streak', value: '14d', change: 'Record!' },
        ].map((stat, idx) => (
          <div key={stat.label} className="text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <span className="text-[10px] text-success">{stat.change}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
