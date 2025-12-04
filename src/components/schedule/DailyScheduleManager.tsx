import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleTemplate, CATEGORY_LABELS, CATEGORY_ICONS, DAY_LABELS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Clock, CalendarDays, Power, X, Sparkles } from 'lucide-react';

interface DailyScheduleManagerProps {
  templates: ScheduleTemplate[];
  onAddTemplate: (template: Omit<ScheduleTemplate, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleActive: (id: string) => void;
  onApplyToday: (templates: ScheduleTemplate[]) => void;
}

const categoryColors: Record<string, string> = {
  work: 'border-l-category-work bg-category-work/5',
  personal: 'border-l-category-personal bg-category-personal/5',
  health: 'border-l-category-health bg-category-health/5',
  learning: 'border-l-category-learning bg-category-learning/5',
  social: 'border-l-category-social bg-category-social/5',
  other: 'border-l-category-other bg-category-other/5',
};

export const DailyScheduleManager = ({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onToggleActive,
  onApplyToday,
}: DailyScheduleManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work' as const,
    priority: 'medium' as const,
    description: '',
    daysOfWeek: [1, 2, 3, 4, 5] as number[], // Mon-Fri default
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTemplate({
      ...formData,
      isActive: true,
    });
    setFormData({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      priority: 'medium',
      description: '',
      daysOfWeek: [1, 2, 3, 4, 5],
    });
    setShowForm(false);
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const activeTemplates = templates.filter(t => t.isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Daily Schedule</h3>
            <p className="text-xs text-muted-foreground">
              {activeTemplates.length} active routines
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTemplates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplyToday(activeTemplates)}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Today
            </Button>
          )}
          <Button
            variant={showForm ? "secondary" : "default"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-1.5"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Routine'}
          </Button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-5 p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Morning Exercise"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: any) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Day Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Repeat on</Label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                      formData.daysOfWeek.includes(index)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add to Schedule
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Templates List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No routines yet</p>
            <p className="text-xs mt-1">Add your daily habits and routines</p>
          </div>
        ) : (
          templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-l-4 transition-all",
                categoryColors[template.category],
                !template.isActive && "opacity-50"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[template.category]}</span>
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {template.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.startTime} - {template.endTime}
                  </span>
                  <span className="flex gap-0.5">
                    {template.daysOfWeek.map(d => (
                      <span key={d} className="px-1 py-0.5 rounded bg-secondary/50 text-[10px]">
                        {DAY_LABELS[d].charAt(0)}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={template.isActive}
                  onCheckedChange={() => onToggleActive(template.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTemplate(template.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
