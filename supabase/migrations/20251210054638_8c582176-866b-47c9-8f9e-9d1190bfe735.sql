-- Create user_goals table for goal tracking with SMART goal support
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('sleep', 'wake_up', 'habit', 'productivity', 'health', 'custom')),
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.user_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create goal_progress table for tracking daily progress
CREATE TABLE public.goal_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress" 
ON public.goal_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.goal_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.goal_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.goal_progress FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_goal_progress_goal_id ON public.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_date ON public.goal_progress(date);
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);

-- Create motivational_quotes table
CREATE TABLE public.motivational_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default quotes
INSERT INTO public.motivational_quotes (quote, author, category) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'productivity'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivation'),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'motivation'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams'),
('It does not matter how slowly you go as long as you do not stop.', 'Confucius', 'persistence'),
('Start where you are. Use what you have. Do what you can.', 'Arthur Ashe', 'motivation'),
('The secret of getting ahead is getting started.', 'Mark Twain', 'productivity'),
('Your limitation—it''s only your imagination.', 'Unknown', 'motivation'),
('Push yourself, because no one else is going to do it for you.', 'Unknown', 'motivation'),
('Great things never come from comfort zones.', 'Unknown', 'growth'),
('Dream it. Wish it. Do it.', 'Unknown', 'motivation'),
('Success doesn''t just find you. You have to go out and get it.', 'Unknown', 'success'),
('The harder you work for something, the greater you''ll feel when you achieve it.', 'Unknown', 'motivation'),
('Don''t stop when you''re tired. Stop when you''re done.', 'Unknown', 'persistence'),
('Wake up with determination. Go to bed with satisfaction.', 'Unknown', 'productivity'),
('Do something today that your future self will thank you for.', 'Sean Patrick Flanery', 'motivation'),
('Little things make big days.', 'Unknown', 'mindfulness'),
('It''s going to be hard, but hard does not mean impossible.', 'Unknown', 'persistence'),
('Don''t wait for opportunity. Create it.', 'Unknown', 'motivation'),
('Sometimes we''re tested not to show our weaknesses, but to discover our strengths.', 'Unknown', 'growth'),
('The key to success is to focus on goals, not obstacles.', 'Unknown', 'focus'),
('Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.', 'Harvey Mackay', 'morning'),
('Early to bed and early to rise makes a man healthy, wealthy, and wise.', 'Benjamin Franklin', 'sleep'),
('Sleep is the best meditation.', 'Dalai Lama', 'sleep'),
('A well-spent day brings happy sleep.', 'Leonardo da Vinci', 'sleep'),
('Take care of your body. It''s the only place you have to live.', 'Jim Rohn', 'health'),
('Health is not valued until sickness comes.', 'Thomas Fuller', 'health'),
('The groundwork for all happiness is good health.', 'Leigh Hunt', 'health'),
('Your body hears everything your mind says.', 'Naomi Judd', 'mindfulness'),
('Happiness is not something ready made. It comes from your own actions.', 'Dalai Lama', 'happiness');

-- Make quotes table public readable (no user restriction)
ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quotes" 
ON public.motivational_quotes FOR SELECT 
USING (true);