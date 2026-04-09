import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, Sun, Moon, Sunset, Coffee } from 'lucide-react';

export const WelcomeCard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const currentHour = new Date().getHours();

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return { text: 'Good Morning', icon: Sun };
    if (currentHour >= 12 && currentHour < 17) return { text: 'Good Afternoon', icon: Coffee };
    if (currentHour >= 17 && currentHour < 21) return { text: 'Good Evening', icon: Sunset };
    return { text: 'Good Night', icon: Moon };
  };

  const greeting = getGreeting();
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-primary/10 via-card/80 to-success/10 p-6 shadow-lg">
      <div className="absolute -right-24 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-16 -bottom-12 h-32 w-32 rounded-full bg-success/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <greeting.icon className="w-5 h-5 text-primary" />
            <span>{greeting.text}</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl mb-2">
            {displayName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-surface border border-border/60 shadow-sm">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
      </div>

      <p className="relative mt-5 max-w-2xl text-sm leading-6 text-muted-foreground/90">
        Ready to turn today into momentum? Capture one win, keep the momentum, and make progress feel effortless.
      </p>
    </div>
  );
};
