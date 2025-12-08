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
  Wrench,
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
    description: 'Rich notes with tags & timestamps',
    icon: FileText,
    color: 'from-primary to-info',
  },
  {
    id: 'habits',
    label: 'Habit Tracker',
    description: 'Build streaks & track progress',
    icon: Target,
    color: 'from-success to-info',
  },
  {
    id: 'mood',
    label: 'Mood Tracker',
    description: 'Track moods & patterns',
    icon: Smile,
    color: 'from-warning to-success',
  },
  {
    id: 'sleep',
    label: 'Sleep Tracker',
    description: 'Monitor sleep quality',
    icon: Moon,
    color: 'from-info to-primary',
  },
  {
    id: 'energy',
    label: 'Energy Tracker',
    description: 'Track energy levels',
    icon: Zap,
    color: 'from-warning to-destructive',
  },
  {
    id: 'health',
    label: 'Health Stats',
    description: 'Water, exercise & more',
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

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-foreground">Life Tools</h1>
                  <p className="text-xs text-muted-foreground">
                    Your personal hub for tracking & self-improvement
                  </p>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setActiveTool(tool.id)}
                      className="group relative glass rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-display font-semibold text-foreground mb-0.5">
                        {tool.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {tool.description}
                      </p>
                      
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors"
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
              className="space-y-3"
            >
              {/* Tool Header */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTool(null)}
                  className="h-8 w-8 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {activeToolData && (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeToolData.color} flex items-center justify-center`}>
                      <activeToolData.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-semibold text-foreground">
                      {activeToolData.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Tool */}
              <div className="glass rounded-2xl p-4 md:p-5">
                <ScrollArea className="h-[calc(100vh-180px)]">
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
