-- Fix daily_reflections RLS (currently has NO policies)
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections" 
ON public.daily_reflections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections" 
ON public.daily_reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
ON public.daily_reflections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
ON public.daily_reflections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix profiles table - add INSERT policy for new user signup
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Fix profiles table - add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Add foreign key constraints with CASCADE delete
ALTER TABLE public.habit_logs 
ADD CONSTRAINT fk_habit_logs_habit 
FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE;

ALTER TABLE public.note_entries 
ADD CONSTRAINT fk_note_entries_note 
FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;

ALTER TABLE public.goal_progress 
ADD CONSTRAINT fk_goal_progress_goal 
FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE;

-- Add composite indexes for frequently queried combinations
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON public.mood_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON public.energy_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON public.daily_reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON public.health_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_note_entries_note ON public.note_entries(note_id);