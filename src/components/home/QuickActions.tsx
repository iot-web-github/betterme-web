import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ClipboardCheck, BarChart3, Wrench } from 'lucide-react';

interface QuickActionsProps {
  onFocusModeClick: () => void;
}

export const QuickActions = ({ onFocusModeClick }: QuickActionsProps) => {
  const actions = [
    {
      id: 'focus',
      label: 'Focus',
      icon: Clock,
      color: 'hsl(var(--primary))',
      onClick: onFocusModeClick,
    },
    {
      id: 'checkin',
      label: 'Check-in',
      icon: ClipboardCheck,
      color: 'hsl(var(--success))',
      href: '/checkin',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      color: 'hsl(var(--info))',
      href: '/tools',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: BarChart3,
      color: 'hsl(var(--warning))',
      href: '/dashboard',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-4 gap-2"
    >
      {actions.map((action, idx) => {
        const Icon = action.icon;
        const content = (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-[10px] font-medium text-foreground">{action.label}</span>
          </motion.div>
        );

        if (action.href) {
          return <Link key={action.id} to={action.href}>{content}</Link>;
        }

        return (
          <div key={action.id} onClick={action.onClick}>
            {content}
          </div>
        );
      })}
    </motion.div>
  );
};
