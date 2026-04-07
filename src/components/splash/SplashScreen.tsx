import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { BrandIcon } from '@/components/BrandIcon';

interface Quote {
  quote: string;
  author: string | null;
}

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({ onComplete, minDisplayTime = 2500 }: SplashScreenProps) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      // Get today's date to use as seed for consistent daily quote
      const today = new Date().toISOString().split('T')[0];
      const seed = today.split('-').join('');
      
      const { data, error } = await supabase
        .from('motivational_quotes')
        .select('quote, author');

      if (data && data.length > 0 && !error) {
        // Use date as seed for deterministic "random" quote per day
        const index = parseInt(seed) % data.length;
        setQuote(data[index]);
      } else {
        // Fallback quote
        setQuote({
          quote: "Every day is a new opportunity to grow.",
          author: "BetterMe"
        });
      }
    };

    fetchQuote();

    // Complete splash after minimum display time
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minDisplayTime]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-info/10" />
          
          {/* Animated glow orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-primary/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ top: '10%', left: '20%' }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-info/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            style={{ bottom: '20%', right: '15%' }}
          />

          {/* Content */}
          <div className="relative z-10 text-center px-8 max-w-lg">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/10 flex items-center justify-center shadow-glow"
            >
              <BrandIcon className="w-12 h-12" />
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-display font-bold text-foreground mb-2 gradient-text"
            >
              BetterMe
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mb-8"
            >
              Your Personal Growth Companion
            </motion.p>

            {/* Quote */}
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <p className="text-foreground text-base italic leading-relaxed mb-3">
                  "{quote.quote}"
                </p>
                {quote.author && (
                  <p className="text-primary text-sm font-medium">
                    — {quote.author}
                  </p>
                )}
              </motion.div>
            )}

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex justify-center gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
