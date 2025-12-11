import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Plus, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GratitudeEntry {
  id: string;
  content: string;
  date: string;
  createdAt: string;
}

export const GratitudeJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      // Using notes table with a special tag for gratitude entries
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .contains('tags', ['gratitude'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        setEntries(data.map(n => ({
          id: n.id,
          content: n.content || '',
          date: n.created_at.split('T')[0],
          createdAt: n.created_at,
        })));
      }
      setIsLoading(false);
    };

    fetchEntries();
  }, [user]);

  const handleAddEntry = async () => {
    if (!user || !newEntry.trim()) return;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: `Gratitude - ${format(new Date(), 'MMM d, yyyy')}`,
        content: newEntry.trim(),
        tags: ['gratitude'],
        color: 'hsl(340 82% 52%)',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save entry');
      return;
    }

    if (data) {
      setEntries(prev => [{
        id: data.id,
        content: data.content || '',
        date: data.created_at.split('T')[0],
        createdAt: data.created_at,
      }, ...prev]);
      setNewEntry('');
      toast.success('Gratitude entry saved!');
    }
  };

  const todayEntry = entries.find(e => e.date === today);

  const prompts = [
    "What made you smile today?",
    "Who are you thankful for?",
    "What's a small win you had?",
    "What's something beautiful you noticed?",
    "What skill or ability are you grateful for?",
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary/40 rounded-xl" />
          <div className="h-24 bg-secondary/40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground">Gratitude Journal</h2>
          <p className="text-xs text-muted-foreground">
            {entries.length} entries • Cultivate positivity
          </p>
        </div>
      </div>

      {/* Today's Entry */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium">Today's Gratitude</span>
        </div>
        
        {todayEntry ? (
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-sm text-foreground">{todayEntry.content}</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Added at {format(new Date(todayEntry.createdAt), 'h:mm a')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground italic">{randomPrompt}</p>
            <Textarea
              placeholder="I'm grateful for..."
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button 
              onClick={handleAddEntry} 
              className="w-full gap-2"
              disabled={!newEntry.trim()}
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>
        )}
      </div>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Entries
          </h3>
          <AnimatePresence>
            {entries.filter(e => e.date !== today).slice(0, 5).map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-secondary/40 rounded-xl p-3"
              >
                <p className="text-sm text-foreground">{entry.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(entry.createdAt), 'EEEE, MMM d')}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Start your gratitude practice today</p>
        </div>
      )}
    </div>
  );
};
