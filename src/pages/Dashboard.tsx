import { useState, useEffect, useMemo } from 'react';
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
import { BehavioralTrends } from '@/components/dashboard/BehavioralTrends';
import { GoalSettingCard } from '@/components/dashboard/GoalSettingCard';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { useScheduleDB } from '@/hooks/useScheduleDB';
import { useStreaks } from '@/hooks/useStreaks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, TrendingUp, Award, Brain } from 'lucide-react';

const Dashboard = () => {
  const today = new Date();
  const [selectedDate] = useState(today);
  const { user } = useAuth();
  
  const { tasks, tasksForDate, calculateDailyStats } = useScheduleDB(selectedDate);
  const dailyStats = useMemo(() => calculateDailyStats(), [calculateDailyStats]);
  
  // Convert DB tasks to format expected by legacy components
  const allTasks = useMemo(() => tasks.map(t => ({
    ...t,
    date: t.scheduled_date || '',
    startTime: t.scheduled_time || '09:00',
    endTime: t.scheduled_time ? 
      `${String(parseInt(t.scheduled_time.split(':')[0]) + Math.ceil((t.duration_minutes || 30) / 60)).padStart(2, '0')}:${t.scheduled_time.split(':')[1]}` : 
      '10:00',
    category: (t.category || 'personal') as any,
    status: t.status as any,
    createdAt: t.created_at,
    updatedAt: t.created_at,
  })) as any[], [tasks]);

  const { streakData, achievements } = useStreaks(allTasks);
  const { celebration, checkStreakMilestone, checkTaskMilestone, closeCelebration } = useCelebrations();

  // Fetch check-in streak data
  const [checkinStreakData, setCheckinStreakData] = useState({ checkinStreak: 0, longestCheckinStreak: 0 });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchCheckinStreak = async () => {
      const { data } = await supabase
        .from('user_streaks')
        .select('checkin_streak, longest_checkin_streak')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCheckinStreakData({
          checkinStreak: data.checkin_streak || 0,
          longestCheckinStreak: data.longest_checkin_streak || 0,
        });
      }
    };
    
    fetchCheckinStreak();
  }, [user]);

  useEffect(() => {
    if (streakData.currentStreak > 0) {
      checkStreakMilestone(streakData.currentStreak);
    }
    
    const completedCount = allTasks.filter(t => t.status === 'completed').length;
    if (completedCount > 0) {
      checkTaskMilestone(completedCount);
    }
  }, [streakData.currentStreak, allTasks, checkStreakMilestone, checkTaskMilestone]);

  const extendedStreakData = {
    ...streakData,
    ...checkinStreakData,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pb-20">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Stats Overview */}
        <section className="mb-4 sm:mb-6">
          <DashboardStats tasks={allTasks} />
        </section>

        {/* Tabbed Content - Mobile optimized */}
        <Tabs defaultValue="today" className="space-y-3 sm:space-y-4">
          <TabsList className="glass border border-border/20 p-1 w-full grid grid-cols-3 sm:grid-cols-5 h-auto">
            <TabsTrigger value="today" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Today</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden sm:flex">
              <Target className="w-3.5 h-3.5" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden sm:flex">
              <Award className="w-3.5 h-3.5" />
              Awards
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <SectionErrorBoundary>
                    <ProductiveHours tasks={allTasks} />
                  </SectionErrorBoundary>
                  <SectionErrorBoundary>
                    <LifeScoreCard />
                  </SectionErrorBoundary>
                </div>
                <SectionErrorBoundary>
                  <WeeklyTrends tasks={allTasks} />
                </SectionErrorBoundary>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <StreakCard streakData={extendedStreakData} />
                <UpcomingTasks tasks={allTasks} limit={5} />
                <DataExportCard />
              </div>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <SectionErrorBoundary>
                  <AIInsightsCard />
                </SectionErrorBoundary>
                <SectionErrorBoundary>
                  <CorrelationInsights />
                </SectionErrorBoundary>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionErrorBoundary>
                  <LifeScoreCard />
                </SectionErrorBoundary>
                <StreakCard streakData={extendedStreakData} />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <SectionErrorBoundary>
                  <AdvancedSleepAnalytics />
                </SectionErrorBoundary>
                <SectionErrorBoundary>
                  <BehavioralTrends />
                </SectionErrorBoundary>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionErrorBoundary>
                  <LifeScoreCard />
                </SectionErrorBoundary>
                <StreakCard streakData={extendedStreakData} />
              </div>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2">
                <SectionErrorBoundary>
                  <GoalSettingCard />
                </SectionErrorBoundary>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionErrorBoundary>
                  <LifeScoreCard />
                </SectionErrorBoundary>
                <StreakCard streakData={extendedStreakData} />
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2">
                <AchievementsCard 
                  achievements={achievements}
                  unlockedCount={achievements.filter(a => a.unlockedAt).length}
                  totalAchievements={achievements.length}
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <StreakCard streakData={extendedStreakData} />
                <SectionErrorBoundary>
                  <LifeScoreCard />
                </SectionErrorBoundary>
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
