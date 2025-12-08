import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { NotesTool } from '@/components/tools/NotesTool';
import { EnhancedMoodTracker } from '@/components/tools/EnhancedMoodTracker';
import { EnhancedHabitTracker } from '@/components/tools/EnhancedHabitTracker';
import { SleepTracker } from '@/components/tools/SleepTracker';
import { EnergyTracker } from '@/components/tools/EnergyTracker';
import { HealthStatsTracker } from '@/components/tools/HealthStatsTracker';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Smile,
  Target,
  Moon,
  Zap,
  Activity,
  ChevronLeft,
} from 'lucide-react';

type ToolType = 'notes' | 'mood' | 'habits' | 'sleep' | 'energy' | 'health';

interface Tool {
  id: ToolType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const tools: Tool[] = [
  {
    id: 'notes',
    label: 'Notes',
    description: 'Rich notes with tags, folders & timestamps',
    icon: FileText,
    color: 'from-primary to-info',
  },
  {
    id: 'mood',
    label: 'Mood Tracker',
    description: 'Track moods, triggers & patterns',
    icon: Smile,
    color: 'from-warning to-success',
  },
  {
    id: 'habits',
    label: 'Habit Tracker',
    description: 'Build streaks & track progress',
    icon: Target,
    color: 'from-success to-info',
  },
  {
    id: 'sleep',
    label: 'Sleep Tracker',
    description: 'Monitor sleep quality & patterns',
    icon: Moon,
    color: 'from-info to-primary',
  },
  {
    id: 'energy',
    label: 'Energy Tracker',
    description: 'Track energy levels throughout the day',
    icon: Zap,
    color: 'from-warning to-destructive',
  },
  {
    id: 'health',
    label: 'Health Stats',
    description: 'Water intake, exercise & more',
    icon: Activity,
    color: 'from-success to-warning',
  },
];

const Tools = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'notes':
        return <NotesTool />;
      case 'mood':
        return <EnhancedMoodTracker />;
      case 'habits':
        return <EnhancedHabitTracker />;
      case 'sleep':
        return <SleepTracker />;
      case 'energy':
        return <EnergyTracker />;
      case 'health':
        return <HealthStatsTracker />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Life Tools
                </motion.h1>
                <p className="text-muted-foreground">
                  Your personal hub for tracking, notes & self-improvement
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setActiveTool(tool.id)}
                      className="group relative glass rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                      
                      {/* Hover indicator */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTool(null)}
                className="gap-2 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Tools
              </Button>

              {/* Active Tool */}
              <div className="glass rounded-2xl p-4 md:p-6">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {renderTool()}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Tools;
