import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { WeeklyTrends } from '@/components/dashboard/WeeklyTrends';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { ProductiveHours } from '@/components/dashboard/ProductiveHours';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { LifeScoreCard } from '@/components/dashboard/LifeScoreCard';
import { CorrelationInsights } from '@/components/dashboard/CorrelationInsights';
import { DataExportCard } from '@/components/dashboard/DataExportCard';
import { CelebrationModal, useCelebrations } from '@/components/dashboard/CelebrationModal';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LayoutGrid, TrendingUp, User } from 'lucide-react';

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState(today);
  const { user } = useAuth();
  
  const { allTasks, dailyStats } = useSchedule(selectedDate);
  const { streakData } = useStreaks(allTasks);
  const { celebration, checkStreakMilestone, checkTaskMilestone, closeCelebration } = useCelebrations();

  useEffect(() => {
    if (streakData.currentStreak > 0) {
      checkStreakMilestone(streakData.currentStreak);
    }
    
    const completedCount = allTasks.filter(t => t.status === 'completed' || t.status === 'completed-on-time').length;
    if (completedCount > 0) {
      checkTaskMilestone(completedCount);
    }
  }, [streakData.currentStreak, allTasks]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Insights & Analytics • {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border/20">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                  {user.email}
                </span>
              </div>
            )}
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <section className="mb-6">
          <DashboardStats tasks={allTasks} />
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">
            <WeeklyTrends tasks={allTasks} />
            
            <div className="grid sm:grid-cols-2 gap-4">
              <ProductiveHours tasks={allTasks} />
              <CategoryBreakdown timeByCategory={dailyStats.timeByCategory} />
            </div>

            {/* Correlation Insights - Full Width */}
            <CorrelationInsights />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            <LifeScoreCard />
            <StreakCard streakData={streakData} />
            <DataExportCard />
            <UpcomingTasks tasks={allTasks} limit={5} />
          </div>
        </div>
      </main>

      {/* Celebration Modal */}
      {celebration && (
        <CelebrationModal
          isOpen={!!celebration}
          onClose={closeCelebration}
          type={celebration.type}
          milestone={celebration.milestone}
          message={celebration.message}
        />
      )}
    </div>
  );
};

export default Dashboard;
