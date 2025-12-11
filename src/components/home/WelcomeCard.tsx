import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, Sun, Moon, Sunset, Coffee } from 'lucide-react';

export const WelcomeCard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const currentHour = new Date().getHours();

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return { text: 'Good Morning', icon: Sun, color: 'text-warning' };
    if (currentHour >= 12 && currentHour < 17) return { text: 'Good Afternoon', icon: Coffee, color: 'text-info' };
    if (currentHour >= 17 && currentHour < 21) return { text: 'Good Evening', icon: Sunset, color: 'text-primary' };
    return { text: 'Good Night', icon: Moon, color: 'text-info' };
  };

  const greeting = getGreeting();
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <greeting.icon className={`w-5 h-5 ${greeting.color}`} />
            <span className="text-sm text-muted-foreground">{greeting.text}</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            {displayName}! <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block"
            >👋</motion.span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};
