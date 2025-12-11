import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { WeeklyTrends } from '@/components/dashboard/WeeklyTrends';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { ProductiveHours } from '@/components/dashboard/ProductiveHours';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { LifeScoreCard } from '@/components/dashboard/LifeScoreCard';
import { CorrelationInsights } from '@/components/dashboard/CorrelationInsights';
import { DataExportCard } from '@/components/dashboard/DataExportCard';
import { CelebrationModal, useCelebrations } from '@/components/dashboard/CelebrationModal';
import { AdvancedSleepAnalytics } from '@/components/dashboard/AdvancedSleepAnalytics';
import { TimeFilteredInsights } from '@/components/dashboard/TimeFilteredInsights';
import { BehavioralTrends } from '@/components/dashboard/BehavioralTrends';
import { GoalSettingCard } from '@/components/dashboard/GoalSettingCard';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, TrendingUp, Award } from 'lucide-react';

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState(today);
  
  const { allTasks, dailyStats } = useSchedule(selectedDate);
  const { streakData, achievements } = useStreaks(allTasks);
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
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Stats Overview */}
        <section className="mb-6">
          <DashboardStats tasks={allTasks} />
        </section>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="glass border border-border/20 p-1">
            <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <TimeFilteredInsights />
                <div className="grid sm:grid-cols-2 gap-4">
                  <ProductiveHours tasks={allTasks} />
                  <LifeScoreCard />
                </div>
                <WeeklyTrends tasks={allTasks} />
              </div>

              <div className="space-y-4">
                <StreakCard streakData={streakData} />
                <UpcomingTasks tasks={allTasks} limit={5} />
                <DataExportCard />
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <AdvancedSleepAnalytics />
                <BehavioralTrends />
                <CorrelationInsights />
              </div>

              <div className="space-y-4">
                <LifeScoreCard />
                <StreakCard streakData={streakData} />
              </div>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <GoalSettingCard />
              </div>

              <div className="space-y-4">
                <LifeScoreCard />
                <StreakCard streakData={streakData} />
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AchievementsCard 
                  achievements={achievements}
                  unlockedCount={achievements.filter(a => a.unlockedAt).length}
                  totalAchievements={achievements.length}
                />
              </div>

              <div className="space-y-4">
                <StreakCard streakData={streakData} />
                <LifeScoreCard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
