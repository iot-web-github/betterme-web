import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { DateSelector } from '@/components/layout/DateSelector';
import { DraggableTimeline } from '@/components/schedule/DraggableTimeline';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskDetailSheet } from '@/components/schedule/TaskDetailSheet';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProductivityScore } from '@/components/dashboard/ProductivityScore';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WeeklyView } from '@/components/views/WeeklyView';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { Task } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle2, XCircle, Clock, Target, Calendar, LayoutGrid } from 'lucide-react';

type ViewMode = 'day' | 'week';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const {
    tasks,
    allTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    dailyStats,
  } = useSchedule(selectedDate);

  const { streakData, achievements, unlockedCount, totalAchievements } = useStreaks(allTasks);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    addTask(taskData);
    setShowTaskForm(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditingTask(selectedTask);
      setSelectedTask(null);
      setShowTaskForm(true);
    }
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowTaskForm(false);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    // For now, tasks are sorted by time, reordering would update times
    console.log('Reorder tasks:', reorderedTasks);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* View Toggle & Date Selector */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="glass">
              <TabsTrigger value="day" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Day
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2">
                <Calendar className="w-4 h-4" />
                Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,340px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {viewMode === 'day' ? (
                <motion.div
                  key="day-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="glass rounded-xl p-6 hover-lift"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Daily Schedule</h2>
                      <p className="text-sm text-muted-foreground">
                        {tasks.length} tasks planned
                      </p>
                    </div>
                    <Button variant="glow" onClick={() => setShowTaskForm(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>

                  <div className="h-[600px] overflow-y-auto scrollbar-thin pr-2">
                    {tasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0] 
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Clock className="w-10 h-10 text-muted-foreground" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                          Start planning your day by adding your first task and build your streak!
                        </p>
                        <Button variant="outline" onClick={() => setShowTaskForm(true)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Your First Task
                        </Button>
                      </motion.div>
                    ) : (
                      <DraggableTimeline
                        tasks={tasks}
                        onTaskClick={handleTaskClick}
                        onReorder={handleReorderTasks}
                        selectedDate={selectedDate}
                      />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="week-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <WeeklyView
                    tasks={allTasks}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onTaskClick={handleTaskClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weekly Overview - Only show on day view */}
            {viewMode === 'day' && (
              <WeeklyOverview 
                tasks={allTasks} 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
              />
            )}
          </div>

          {/* Sidebar - Stats & Gamification */}
          <div className="space-y-4">
            {/* Streak Card */}
            <StreakCard streakData={streakData} />
            
            {/* Productivity Score */}
            <ProductivityScore score={dailyStats.productivityScore} />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatsCard
                title="Total"
                value={dailyStats.totalTasks}
                icon={Target}
                variant="default"
                delay={0.1}
              />
              <StatsCard
                title="Completed"
                value={dailyStats.completedTasks}
                icon={CheckCircle2}
                variant="success"
                delay={0.15}
              />
              <StatsCard
                title="On-Time"
                value={dailyStats.completedOnTime}
                icon={Clock}
                variant="primary"
                delay={0.2}
              />
              <StatsCard
                title="Missed"
                value={dailyStats.missedTasks}
                icon={XCircle}
                variant="destructive"
                delay={0.25}
              />
            </div>

            {/* Quick Stats */}
            <QuickStats 
              dailyStats={dailyStats} 
              allTasks={allTasks} 
              selectedDate={selectedDate} 
            />

            {/* Achievements */}
            <AchievementsCard 
              achievements={achievements} 
              unlockedCount={unlockedCount} 
              totalAchievements={totalAchievements} 
            />

            {/* Category Breakdown */}
            <CategoryBreakdown timeByCategory={dailyStats.timeByCategory} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            onClose={handleCloseForm}
            selectedDate={selectedDate}
            initialData={editingTask || undefined}
          />
        )}

        {selectedTask && (
          <TaskDetailSheet
            task={selectedTask}
            onClose={handleCloseDetail}
            onUpdateStatus={(status, notes) => updateTaskStatus(selectedTask.id, status, notes)}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
