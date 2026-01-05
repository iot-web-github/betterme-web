-- Create schedule_templates table (migrate from localStorage)
CREATE TABLE public.schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  description TEXT,
  days_of_week INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates" ON public.schedule_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON public.schedule_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.schedule_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.schedule_templates FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_schedule_templates_user ON public.schedule_templates(user_id);

-- Create focus_sessions table (migrate from localStorage)
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break')),
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own focus sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own focus sessions" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_focus_sessions_user ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_user_date ON public.focus_sessions(user_id, started_at);

-- Create ai_insights table for storing AI-generated analysis
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily_summary', 'recommendation', 'pattern', 'prediction', 'correlation')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date, insight_type)
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON public.ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insights" ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_ai_insights_user_date ON public.ai_insights(user_id, date);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(user_id, insight_type);