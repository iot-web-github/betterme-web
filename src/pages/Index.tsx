import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { DateSelector } from '@/components/layout/DateSelector';
import { EnhancedTimeline } from '@/components/schedule/EnhancedTimeline';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskDetailSheet } from '@/components/schedule/TaskDetailSheet';
import { DailyScheduleManager } from '@/components/schedule/DailyScheduleManager';
import { FocusMode } from '@/components/schedule/FocusMode';
import { WelcomeCard } from '@/components/home/WelcomeCard';
import { QuickStatsBar } from '@/components/home/QuickStatsBar';
import { GoalsOverview } from '@/components/home/GoalsOverview';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { ToolsGrid } from '@/components/dashboard/ToolsGrid';
import { HabitsSection } from '@/components/home/HabitsSection';

import { WeeklyView } from '@/components/views/WeeklyView';
import { MonthlyView } from '@/components/views/MonthlyView';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { useDailySchedule } from '@/hooks/useDailySchedule';

import { Task, ScheduleTemplate } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Calendar, CalendarDays, LayoutGrid } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showFocusMode, setShowFocusMode] = useState(false);

  const {
    tasks,
    allTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useSchedule(selectedDate);

  const { streakData } = useStreaks(allTasks);

  const {
    templates,
    addTemplate,
    deleteTemplate,
    toggleTemplateActive,
  } = useDailySchedule();

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

  const handleMarkTask = (taskId: string, status: 'completed' | 'completed-on-time' | 'missed') => {
    updateTaskStatus(taskId, status);
  };

  const handleApplyTemplates = (templatesToApply: ScheduleTemplate[]) => {
    const dayOfWeek = new Date(selectedDate).getDay();
    const relevantTemplates = templatesToApply.filter(t => t.daysOfWeek.includes(dayOfWeek));
    
    relevantTemplates.forEach(template => {
      const existingTask = tasks.find(t => 
        t.templateId === template.id && t.date === selectedDate
      );
      
      if (!existingTask) {
        addTask({
          title: template.title,
          startTime: template.startTime,
          endTime: template.endTime,
          category: template.category,
          priority: template.priority,
          description: template.description,
          date: selectedDate,
          isFromTemplate: true,
          templateId: template.id,
        });
      }
    });
  };

  const handleDateSelectFromMonth = (date: string) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Welcome Card */}
        <WelcomeCard />


        {/* Quick Stats */}
        <QuickStatsBar />

        {/* Top Bar with Date & View Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="glass border border-border/20 h-9">
              <TabsTrigger value="day" className="gap-1.5 h-7 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Day</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-1.5 h-7 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-1.5 h-7 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-4">
          {/* Main Content */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {viewMode === 'day' && (
                <motion.div
                  key="day-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="glass rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-display font-bold text-foreground">
                        {format(new Date(selectedDate), 'EEEE')}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {tasks.length} task{tasks.length !== 1 && 's'} • {format(new Date(selectedDate), 'MMM d')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowTaskForm(true)} 
                      size="sm"
                      className="gap-1.5 h-8 px-3 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </Button>
                  </div>

                  <div className="h-[400px] overflow-y-auto scrollbar-thin pr-1">
                    {tasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                      >
                        <motion.div 
                          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3"
                          animate={{ scale: [1, 1.03, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Clock className="w-7 h-7 text-muted-foreground" />
                        </motion.div>
                        <h3 className="text-sm font-display font-semibold text-foreground mb-1">
                          No tasks scheduled
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Start planning your day
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setShowTaskForm(true)} className="gap-1.5 h-8 text-xs">
                          <Plus className="w-3.5 h-3.5" />
                          Add Task
                        </Button>
                      </motion.div>
                    ) : (
                      <EnhancedTimeline
                        tasks={tasks}
                        templates={templates}
                        onTaskClick={handleTaskClick}
                        onMarkTask={handleMarkTask}
                        selectedDate={selectedDate}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {viewMode === 'week' && (
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

              {viewMode === 'month' && (
                <motion.div
                  key="month-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <MonthlyView
                    tasks={allTasks}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelectFromMonth}
                    onMonthChange={setCurrentMonth}
                    currentMonth={currentMonth}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Habits Section */}
            <HabitsSection />

            {/* Goals Overview */}
            <GoalsOverview />

            {/* Quick Actions */}
            <ToolsGrid onFocusModeClick={() => setShowFocusMode(true)} />

            {/* Daily Schedule Manager */}
            {viewMode === 'day' && (
              <DailyScheduleManager
                templates={templates}
                onAddTemplate={addTemplate}
                onDeleteTemplate={deleteTemplate}
                onToggleActive={toggleTemplateActive}
                onApplyToday={handleApplyTemplates}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <MiniCalendar
              tasks={allTasks}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <StreakCard streakData={streakData} />
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

        {showFocusMode && (
          <FocusMode onClose={() => setShowFocusMode(false)} />
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
