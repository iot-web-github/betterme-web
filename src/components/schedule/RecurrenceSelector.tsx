import { TaskRecurrence, RecurrenceType, RECURRENCE_LABELS, DAY_LABELS } from '@/types/schedule';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Calendar } from 'lucide-react';

interface RecurrenceSelectorProps {
  value: TaskRecurrence;
  onChange: (recurrence: TaskRecurrence) => void;
}

export const RecurrenceSelector = ({ value, onChange }: RecurrenceSelectorProps) => {
  const handleTypeChange = (type: RecurrenceType) => {
    onChange({
      ...value,
      type,
      interval: 1,
      daysOfWeek: type === 'weekly' ? [new Date().getDay()] : undefined,
    });
  };

  const handleIntervalChange = (interval: number) => {
    onChange({ ...value, interval: Math.max(1, interval) });
  };

  const handleDayToggle = (day: number) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    if (newDays.length > 0) {
      onChange({ ...value, daysOfWeek: newDays });
    }
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...value, endDate: endDate || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Repeat</Label>
      </div>

      <Select value={value.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="bg-secondary/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AnimatePresence mode="wait">
        {value.type !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Interval */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Every</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={value.interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-16 bg-secondary/50"
              />
              <span className="text-sm text-muted-foreground">
                {value.type === 'daily' && (value.interval === 1 ? 'day' : 'days')}
                {value.type === 'weekly' && (value.interval === 1 ? 'week' : 'weeks')}
                {value.type === 'monthly' && (value.interval === 1 ? 'month' : 'months')}
              </span>
            </div>

            {/* Days of week for weekly */}
            {value.type === 'weekly' && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">On days</Label>
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                        value.daysOfWeek?.includes(index)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm text-muted-foreground">End date (optional)</Label>
              </div>
              <Input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-secondary/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
