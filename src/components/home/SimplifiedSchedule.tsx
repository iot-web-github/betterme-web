import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useScheduleDB';

interface SimplifiedScheduleProps {
  tasks: Task[];
  selectedDate: string;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onToggleStatus: (taskId: string, status: Task['status']) => void;
}

export const SimplifiedSchedule = ({
  tasks,
  selectedDate,
  onAddTask,
  onTaskClick,
  onToggleStatus
}: SimplifiedScheduleProps) => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            {format(new Date(selectedDate), 'EEEE')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} tasks completed
          </p>
        </div>
        <Button onClick={onAddTask} size="sm" className="gap-1.5 h-8 px-3 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No tasks yet</h3>
            <p className="text-xs text-muted-foreground mb-3">Plan your day</p>
            <Button variant="outline" size="sm" onClick={onAddTask} className="gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </motion.div>
        ) : (
          tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-secondary/60 ${
                task.status === 'completed' ? 'bg-secondary/30' : 'bg-secondary/50'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(
                    task.id,
                    task.status === 'completed' ? 'pending' : 'completed'
                  );
                }}
                className="flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className={`w-5 h-5 ${getPriorityColor(task.priority)}`} />
                )}
              </button>
              
              <div 
                className="flex-1 min-w-0"
                onClick={() => onTaskClick(task)}
              >
                <p className={`text-sm font-medium truncate ${
                  task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}>
                  {task.title}
                </p>
                {task.scheduled_time && (
                  <p className="text-xs text-muted-foreground">
                    {task.scheduled_time.slice(0, 5)}
                    {task.duration_minutes && ` • ${task.duration_minutes}m`}
                  </p>
                )}
              </div>

              {task.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {task.category}
                </span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
