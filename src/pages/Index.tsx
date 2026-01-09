import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { DateSelector } from '@/components/layout/DateSelector';
import { FocusMode } from '@/components/schedule/FocusMode';
import { WelcomeCard } from '@/components/home/WelcomeCard';
import { QuickActions } from '@/components/home/QuickActions';
import { CompactHabits } from '@/components/home/CompactHabits';
import { SimplifiedSchedule } from '@/components/home/SimplifiedSchedule';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';

import { useScheduleDB, Task } from '@/hooks/useScheduleDB';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Flame, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, X, Edit3, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showFocusMode, setShowFocusMode] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formCategory, setFormCategory] = useState('');

  // Streak data
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const {
    tasks,
    tasksForDate,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useScheduleDB(selectedDate);

  // Fetch streak data
  useEffect(() => {
    if (!user) return;
    
    supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStreakData({
            currentStreak: data.current_streak || 0,
            longestStreak: data.longest_streak || 0
          });
        }
      });
  }, [user]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormTime('');
    setFormDuration('30');
    setFormPriority('medium');
    setFormCategory('');
    setEditingTask(null);
  };

  const handleOpenAddTask = () => {
    resetForm();
    setShowTaskForm(true);
  };

  const handleSubmitTask = async () => {
    if (!formTitle.trim()) return;

    const taskData = {
      title: formTitle,
      description: formDescription || undefined,
      scheduled_date: dateString,
      scheduled_time: formTime || undefined,
      duration_minutes: formDuration ? parseInt(formDuration) : undefined,
      priority: formPriority,
      category: formCategory || undefined,
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }

    resetForm();
    setShowTaskForm(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setFormTitle(selectedTask.title);
      setFormDescription(selectedTask.description || '');
      setFormTime(selectedTask.scheduled_time || '');
      setFormDuration(selectedTask.duration_minutes?.toString() || '30');
      setFormPriority(selectedTask.priority);
      setFormCategory(selectedTask.category || '');
      setEditingTask(selectedTask);
      setSelectedTask(null);
      setShowTaskForm(true);
    }
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleToggleStatus = async (taskId: string, status: Task['status']) => {
    await updateTaskStatus(taskId, status);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Quick Actions */}
        <QuickActions onFocusModeClick={() => setShowFocusMode(true)} />

        {/* Date Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <DateSelector 
            selectedDate={dateString} 
            onDateChange={(date) => setSelectedDate(new Date(date))} 
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Today's Schedule */}
        <SimplifiedSchedule
          tasks={tasksForDate}
          selectedDate={dateString}
          onAddTask={handleOpenAddTask}
          onTaskClick={handleTaskClick}
          onToggleStatus={handleToggleStatus}
        />

        {/* Habits Grid */}
        <CompactHabits />

        {/* Streak + AI Insights Row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Streak Card - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
                <Flame className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {streakData.currentStreak}
                </p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-semibold text-foreground">
                  {streakData.longestStreak}
                </p>
                <p className="text-[10px] text-muted-foreground">Best</p>
              </div>
            </div>
          </motion.div>

          {/* AI Summary Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AIInsightsCard />
          </motion.div>
        </div>
      </main>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowTaskForm(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Add details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  min="5"
                  max="480"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowTaskForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitTask} className="flex-1" disabled={!formTitle.trim()}>
                {editingTask ? 'Update' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask?.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 pt-2">
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedTask.scheduled_time && (
                  <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {selectedTask.scheduled_time.slice(0, 5)}
                  </span>
                )}
                {selectedTask.duration_minutes && (
                  <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {selectedTask.duration_minutes}min
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full ${
                  selectedTask.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                  selectedTask.priority === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {selectedTask.priority}
                </span>
                {selectedTask.category && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {selectedTask.category}
                  </span>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleEditTask} className="flex-1 gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteTask} className="flex-1 gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Focus Mode */}
      <AnimatePresence>
        {showFocusMode && (
          <FocusMode onClose={() => setShowFocusMode(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
