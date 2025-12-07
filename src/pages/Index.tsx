import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { DateSelector } from '@/components/layout/DateSelector';
import { EnhancedTimeline } from '@/components/schedule/EnhancedTimeline';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskDetailSheet } from '@/components/schedule/TaskDetailSheet';
import { DailyScheduleManager } from '@/components/schedule/DailyScheduleManager';
import { FocusMode } from '@/components/schedule/FocusMode';
import { ProductivityScore } from '@/components/dashboard/ProductivityScore';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { ToolsGrid } from '@/components/dashboard/ToolsGrid';
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
    dailyStats,
  } = useSchedule(selectedDate);

  const { streakData } = useStreaks(allTasks);

  const {
    templates,
    addTemplate,
    deleteTemplate,
    toggleTemplateActive,
    getTemplatesForDay,
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
      // Check if task already exists from this template today
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Bar: View Toggle & Date Selector */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="glass border border-border/30">
              <TabsTrigger value="day" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Day</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,360px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {viewMode === 'day' && (
                <motion.div
                  key="day-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        {format(new Date(selectedDate), 'EEEE')}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {tasks.length} task{tasks.length !== 1 && 's'} • {format(new Date(selectedDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowTaskForm(true)} 
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>

                  <div className="h-[600px] overflow-y-auto scrollbar-thin pr-2">
                    {tasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 3, -3, 0] 
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Clock className="w-10 h-10 text-muted-foreground" />
                        </motion.div>
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                          No tasks scheduled
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                          Start planning your day by adding tasks or applying your daily routine
                        </p>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setShowTaskForm(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Task
                          </Button>
                        </div>
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
                  transition={{ duration: 0.25 }}
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
                  transition={{ duration: 0.25 }}
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

            {/* Tools Grid */}
            <ToolsGrid onFocusModeClick={() => setShowFocusMode(true)} />

            {/* Daily Schedule Manager - Show only in day view */}
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
            {/* Mini Calendar */}
            <MiniCalendar
              tasks={allTasks}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            {/* Streak Card */}
            <StreakCard streakData={streakData} />
            
            {/* Productivity Score */}
            <ProductivityScore score={dailyStats.productivityScore} />
            
            {/* Quick Stats */}
            <QuickStats 
              dailyStats={dailyStats} 
              allTasks={allTasks} 
              selectedDate={selectedDate} 
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
