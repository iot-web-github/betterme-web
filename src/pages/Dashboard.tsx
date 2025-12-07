import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { WeeklyTrends } from '@/components/dashboard/WeeklyTrends';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { GoalsCard } from '@/components/dashboard/GoalsCard';
import { ProductiveHours } from '@/components/dashboard/ProductiveHours';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { DailyNotes } from '@/components/dashboard/DailyNotes';
import { LifeScoreCard } from '@/components/dashboard/LifeScoreCard';
import { CorrelationInsights } from '@/components/dashboard/CorrelationInsights';
import { CelebrationModal, useCelebrations } from '@/components/dashboard/CelebrationModal';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid } from 'lucide-react';

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState(today);
  
  const { allTasks, dailyStats } = useSchedule(selectedDate);
  const { streakData } = useStreaks(allTasks);
  const { celebration, checkStreakMilestone, checkTaskMilestone, closeCelebration } = useCelebrations();

  // Check for milestones
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Your productivity overview • {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Schedule
            </Button>
          </Link>
        </motion.div>

        {/* Stats Overview */}
        <section className="mb-8">
          <DashboardStats tasks={allTasks} />
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyTrends tasks={allTasks} />
            
            <div className="grid md:grid-cols-2 gap-6">
              <ProductiveHours tasks={allTasks} />
              <CategoryBreakdown timeByCategory={dailyStats.timeByCategory} />
            </div>

            <DailyNotes selectedDate={selectedDate} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <LifeScoreCard />
            <CorrelationInsights />
            <StreakCard streakData={streakData} />
            <GoalsCard />
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
