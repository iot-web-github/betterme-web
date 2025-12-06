import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface DailyNotesProps {
  selectedDate: string;
}

const STORAGE_KEY = 'smart-schedule-notes';

const getStoredNotes = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveNotes = (notes: Record<string, string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const reflectionPrompts = [
  "What was your biggest win today?",
  "What challenged you the most?",
  "What are you grateful for?",
  "What could you improve tomorrow?",
  "What made you smile today?",
];

export const DailyNotes = ({ selectedDate }: DailyNotesProps) => {
  const [notes, setNotes] = useState('');
  const [allNotes, setAllNotes] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const stored = getStoredNotes();
    setAllNotes(stored);
    setNotes(stored[selectedDate] || '');
    setIsSaved(true);
  }, [selectedDate]);

  const handleSave = () => {
    const updated = { ...allNotes, [selectedDate]: notes };
    if (!notes.trim()) {
      delete updated[selectedDate];
    }
    saveNotes(updated);
    setAllNotes(updated);
    setIsSaved(true);
  };

  const handleChange = (value: string) => {
    setNotes(value);
    setIsSaved(false);
  };

  const addPrompt = () => {
    const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
    const newNotes = notes ? `${notes}\n\n${randomPrompt}\n` : `${randomPrompt}\n`;
    handleChange(newNotes);
    setShowPrompt(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">Daily Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={addPrompt}
            className="gap-1 text-xs"
          >
            <Sparkles className="w-3 h-3" />
            Prompt
          </Button>
          {!isSaved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-1 text-xs"
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
      </p>

      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleSave}
        placeholder="Write your thoughts, reflections, or notes for the day..."
        className="min-h-[150px] bg-secondary/30 border-border/30 resize-none"
      />

      {!isSaved && (
        <p className="text-xs text-muted-foreground mt-2">
          Changes will be saved automatically
        </p>
      )}
    </motion.div>
  );
};
