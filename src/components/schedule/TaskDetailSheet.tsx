import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus, CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  X, Clock, CheckCircle2, XCircle, RefreshCw, 
  Trash2, Edit3, MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDetailSheetProps {
  task: Task;
  onClose: () => void;
  onUpdateStatus: (status: TaskStatus, notes?: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}

const statusOptions: { status: TaskStatus; label: string; icon: any; color: string }[] = [
  { status: 'completed-on-time', label: 'Completed On-Time', icon: CheckCircle2, color: 'success' },
  { status: 'completed', label: 'Completed', icon: CheckCircle2, color: 'success' },
  { status: 'missed', label: 'Missed', icon: XCircle, color: 'destructive' },
  { status: 'rescheduled', label: 'Rescheduled', icon: RefreshCw, color: 'warning' },
];

export const TaskDetailSheet = ({ 
  task, 
  onClose, 
  onUpdateStatus, 
  onDelete,
  onEdit 
}: TaskDetailSheetProps) => {
  const [notes, setNotes] = useState(task.notes || '');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  const handleStatusClick = (status: TaskStatus) => {
    setSelectedStatus(status);
  };

  const handleConfirmStatus = () => {
    if (selectedStatus) {
      onUpdateStatus(selectedStatus, notes || undefined);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className={cn(
          'p-6 border-b border-border',
          `bg-category-${task.category}/10`
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={task.category as any}>{CATEGORY_LABELS[task.category]}</Badge>
                <Badge variant={`priority-${task.priority}` as any}>{PRIORITY_LABELS[task.priority]}</Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">{task.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="w-4 h-4" />
                <span>{task.startTime} - {task.endTime}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {task.description && (
            <div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Current Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">Current Status:</span>
            <Badge variant="secondary" className="font-medium">
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Update Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(({ status, label, icon: Icon, color }) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? color as any : 'outline'}
                  className={cn(
                    'justify-start gap-2 h-auto py-3',
                    selectedStatus === status && 'ring-2 ring-offset-2 ring-offset-background'
                  )}
                  onClick={() => handleStatusClick(status)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reflection Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why was this task completed/missed? What can you improve?"
              className="bg-secondary/50 min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
          <Button 
            variant="glow" 
            onClick={handleConfirmStatus}
            disabled={!selectedStatus}
          >
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
