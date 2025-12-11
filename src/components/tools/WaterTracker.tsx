import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, Minus, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const GLASS_SIZE = 250; // ml
const DAILY_GOAL = 2000; // ml (8 glasses)

export const WaterTracker = () => {
  const { user } = useAuth();
  const [waterIntake, setWaterIntake] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch today's data
      const { data: todayData } = await supabase
        .from('health_logs')
        .select('water_intake')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (todayData) {
        setWaterIntake(todayData.water_intake || 0);
      }

      // Fetch weekly data
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      
      const { data: weekData } = await supabase
        .from('health_logs')
        .select('water_intake, date')
        .eq('user_id', user.id)
        .gte('date', format(startOfWeek, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (weekData) {
        setWeeklyData(weekData.map(d => d.water_intake || 0));
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user, today]);

  const updateWaterIntake = async (amount: number) => {
    if (!user) return;

    const newAmount = Math.max(0, waterIntake + amount);
    setWaterIntake(newAmount);

    const { error } = await supabase
      .from('health_logs')
      .upsert({
        user_id: user.id,
        date: today,
        water_intake: newAmount,
      }, { onConflict: 'user_id,date' });

    if (error) {
      toast.error('Failed to update');
      setWaterIntake(waterIntake);
    } else {
      toast.success(amount > 0 ? '+1 glass!' : 'Updated');
    }
  };

  const glasses = Math.floor(waterIntake / GLASS_SIZE);
  const progress = Math.min((waterIntake / DAILY_GOAL) * 100, 100);
  const avgWeekly = weeklyData.length > 0 
    ? Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-secondary/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground">Water Tracker</h2>
          <p className="text-xs text-muted-foreground">
            Stay hydrated • Goal: {DAILY_GOAL}ml
          </p>
        </div>
      </div>

      {/* Main Progress */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{waterIntake}ml</p>
            <p className="text-xs text-muted-foreground">{glasses} glasses today</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                className="text-secondary"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                r="16"
                cx="18"
                cy="18"
              />
              <motion.circle
                className="text-info"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                r="16"
                cx="18"
                cy="18"
                strokeDasharray={`${progress}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${progress}, 100` }}
                transition={{ duration: 0.5 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateWaterIntake(-GLASS_SIZE)}
            disabled={waterIntake === 0}
            className="h-12 w-12 rounded-xl"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => updateWaterIntake(GLASS_SIZE)}
            className="h-12 px-8 rounded-xl gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Glass
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Daily Goal</span>
          </div>
          <p className="font-bold text-foreground">{progress.toFixed(0)}%</p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Weekly Avg</span>
          </div>
          <p className="font-bold text-foreground">{avgWeekly}ml</p>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick Add</p>
        <div className="grid grid-cols-4 gap-2">
          {[100, 250, 500, 750].map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => updateWaterIntake(amount)}
              className="text-xs"
            >
              +{amount}ml
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
