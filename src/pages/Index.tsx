import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { DateSelector } from '@/components/layout/DateSelector';
import { Timeline } from '@/components/schedule/Timeline';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskDetailSheet } from '@/components/schedule/TaskDetailSheet';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProductivityScore } from '@/components/dashboard/ProductivityScore';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { useSchedule } from '@/hooks/useSchedule';
import { Task } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, XCircle, Clock, Target } from 'lucide-react';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    dailyStats,
  } = useSchedule(selectedDate);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
            
            {/* Timeline Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Daily Schedule</h2>
                  <p className="text-sm text-muted-foreground">
                    {tasks.length} tasks planned
                  </p>
                </div>
                <Button variant="glow" onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>

              <div className="h-[600px] overflow-y-auto scrollbar-thin pr-2">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start planning your day by adding your first task
                    </p>
                    <Button variant="outline" onClick={() => setShowTaskForm(true)}>
                      <Plus className="w-4 h-4" />
                      Add Your First Task
                    </Button>
                  </div>
                ) : (
                  <Timeline
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                    selectedDate={selectedDate}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-4">
            <ProductivityScore score={dailyStats.productivityScore} />
            
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
