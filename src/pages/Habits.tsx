import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { HabitTracker } from '@/components/tracking/HabitTracker';
import { MoodTracker } from '@/components/tracking/MoodTracker';
import { SleepAnalysis } from '@/components/tracking/SleepAnalysis';
import { WeeklyReview } from '@/components/dashboard/WeeklyReview';
import { CheckInCard } from '@/components/dashboard/CheckInCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Repeat } from 'lucide-react';

const Habits = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <Repeat className="w-6 h-6 text-info" />
                Habits & Tracking
              </h1>
              <p className="text-sm text-muted-foreground">
                Build better routines • {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <HabitTracker />
            
            <div className="grid md:grid-cols-2 gap-6">
              <MoodTracker />
              <SleepAnalysis />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CheckInCard />
            <WeeklyReview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Habits;
