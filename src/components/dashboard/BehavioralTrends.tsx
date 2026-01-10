import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLifeTracking } from '@/hooks/useLifeTracking';
import { useScheduleDB } from '@/hooks/useScheduleDB';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Brain } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const BehavioralTrends = () => {
  const { checkIns } = useLifeTracking();
  const { tasks: allTasks } = useScheduleDB();

  // Sleep vs Productivity correlation data
  const correlationData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const checkIn = checkIns.find(c => c.date === date);
      const dayTasks = allTasks.filter(t => t.scheduled_date === date);
      
      let sleepHours = 0;
      if (checkIn?.sleepTime && checkIn?.wakeUpTime) {
        const [sleepH, sleepM] = checkIn.sleepTime.split(':').map(Number);
        const [wakeH, wakeM] = checkIn.wakeUpTime.split(':').map(Number);
        let sleepMins = sleepH * 60 + sleepM;
        let wakeMins = wakeH * 60 + wakeM;
        if (sleepMins > wakeMins) wakeMins += 24 * 60;
        sleepHours = Math.round(((wakeMins - sleepMins) / 60) * 10) / 10;
      }

      const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
      const productivity = dayTasks.length > 0 
        ? Math.round((completedTasks / dayTasks.length) * 100) 
        : 0;

      if (checkIn || dayTasks.length > 0) {
        data.push({
          date: format(subDays(new Date(), i), 'MMM d'),
          sleep: sleepHours,
          productivity,
          mood: checkIn?.mood || 0,
          energy: checkIn?.energy || 0,
        });
      }
    }
    return data.slice(-14); // Last 14 days with data
  }, [checkIns, allTasks]);

  // Best performance hours
  const hourlyPerformance = useMemo(() => {
    const hourData: Record<number, { completed: number; total: number }> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourData[i] = { completed: 0, total: 0 };
    }

    allTasks.forEach(task => {
      if (task.scheduled_time) {
        const hour = parseInt(task.scheduled_time.split(':')[0]);
        hourData[hour].total++;
        if (task.status === 'completed') {
          hourData[hour].completed++;
        }
      }
    });

    return Object.entries(hourData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        label: `${hour}:00`,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        total: data.total,
      }))
      .filter(d => d.total > 0)
      .slice(6, 22); // 6 AM to 10 PM
  }, [allTasks]);

  // Find peak hours
  const peakHours = useMemo(() => {
    const sorted = [...hourlyPerformance].sort((a, b) => b.rate - a.rate);
    return sorted.slice(0, 3);
  }, [hourlyPerformance]);

  // Calculate correlation coefficient between sleep and productivity
  const sleepProductivityCorrelation = useMemo(() => {
    const dataWithBoth = correlationData.filter(d => d.sleep > 0 && d.productivity > 0);
    if (dataWithBoth.length < 3) return null;

    const n = dataWithBoth.length;
    const sumX = dataWithBoth.reduce((a, b) => a + b.sleep, 0);
    const sumY = dataWithBoth.reduce((a, b) => a + b.productivity, 0);
    const sumXY = dataWithBoth.reduce((a, b) => a + (b.sleep * b.productivity), 0);
    const sumX2 = dataWithBoth.reduce((a, b) => a + (b.sleep * b.sleep), 0);
    const sumY2 = dataWithBoth.reduce((a, b) => a + (b.productivity * b.productivity), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    if (denominator === 0) return null;
    return Math.round((numerator / denominator) * 100) / 100;
  }, [correlationData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Behavioral Trends
        </h3>
      </div>

      {/* Sleep vs Productivity Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Sleep vs Productivity</span>
          {sleepProductivityCorrelation !== null && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              sleepProductivityCorrelation > 0.3 
                ? 'bg-success/20 text-success' 
                : sleepProductivityCorrelation < -0.3
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {sleepProductivityCorrelation > 0 ? '+' : ''}{sleepProductivityCorrelation} correlation
            </span>
          )}
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Sleep (h)"
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
                name="Productivity %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Sleep</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Productivity</span>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-warning" />
          <span className="text-sm text-foreground">Your Peak Hours</span>
        </div>
        {peakHours.length > 0 ? (
          <div className="flex gap-2">
            {peakHours.map((peak, idx) => (
              <div 
                key={peak.hour}
                className={`flex-1 p-3 rounded-xl text-center ${
                  idx === 0 
                    ? 'bg-warning/20 border border-warning/30' 
                    : 'bg-secondary/50'
                }`}
              >
                <p className={`text-lg font-display font-bold ${
                  idx === 0 ? 'text-warning' : 'text-foreground'
                }`}>
                  {peak.label}
                </p>
                <p className="text-xs text-muted-foreground">{peak.rate}% success</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more tasks to see your peak hours
          </p>
        )}
      </div>

      {/* Insight Card */}
      {sleepProductivityCorrelation !== null && sleepProductivityCorrelation > 0.3 && (
        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
          <p className="text-xs text-success flex items-start gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Your data shows better sleep leads to higher productivity. 
              Aim for 7-8 hours for optimal performance!
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};
