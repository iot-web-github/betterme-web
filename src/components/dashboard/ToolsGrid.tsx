import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target,
  Clock,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  Heart,
  FileText,
  Wrench,
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface ToolsGridProps {
  onFocusModeClick: () => void;
}

export const ToolsGrid = ({ onFocusModeClick }: ToolsGridProps) => {
  const tools: Tool[] = [
    {
      id: 'focus',
      name: 'Focus Mode',
      description: 'Pomodoro timer',
      icon: Clock,
      onClick: onFocusModeClick,
      color: 'hsl(var(--primary))',
    },
    {
      id: 'checkin',
      name: 'Check-in',
      description: 'Track your day',
      icon: ClipboardCheck,
      href: '/checkin',
      color: 'hsl(var(--success))',
    },
    {
      id: 'tools',
      name: 'Life Tools',
      description: 'Notes & trackers',
      icon: Wrench,
      href: '/tools',
      color: 'hsl(var(--info))',
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'View insights',
      icon: BarChart3,
      href: '/dashboard',
      color: 'hsl(var(--warning))',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-all cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${tool.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: tool.color }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{tool.name}</p>
                <p className="text-[10px] text-muted-foreground">{tool.description}</p>
              </div>
            </motion.div>
          );

          if (tool.href) {
            return (
              <Link key={tool.id} to={tool.href}>
                {content}
              </Link>
            );
          }

          return (
            <div key={tool.id} onClick={tool.onClick}>
              {content}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
