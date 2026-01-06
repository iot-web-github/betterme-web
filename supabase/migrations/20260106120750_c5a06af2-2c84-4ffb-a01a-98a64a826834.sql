-- Create ai_user_profile table for storing AI-generated user insights
CREATE TABLE public.ai_user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  personality_traits JSONB DEFAULT '{}',
  discovered_patterns JSONB DEFAULT '[]',
  ai_questions_asked JSONB DEFAULT '[]',
  ai_questions_answered JSONB DEFAULT '[]',
  detailed_report JSONB DEFAULT '{}',
  suggestions JSONB DEFAULT '[]',
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add check-in streak tracking to user_streaks
ALTER TABLE public.user_streaks 
ADD COLUMN IF NOT EXISTS checkin_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_checkin_streak INTEGER DEFAULT 0;

-- Enable RLS on ai_user_profile
ALTER TABLE public.ai_user_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_user_profile
CREATE POLICY "Users can view their own AI profile"
ON public.ai_user_profile FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI profile"
ON public.ai_user_profile FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI profile"
ON public.ai_user_profile FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI profile"
ON public.ai_user_profile FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_user_profile_updated_at
BEFORE UPDATE ON public.ai_user_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();