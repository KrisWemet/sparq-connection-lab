-- User insights table for Peter's silent profiling
CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  attachment_style TEXT CHECK (attachment_style IN ('anxious', 'avoidant', 'disorganized', 'secure')),
  love_language TEXT CHECK (love_language IN ('words', 'acts', 'gifts', 'time', 'touch')),
  conflict_style TEXT CHECK (conflict_style IN ('avoidant', 'volatile', 'validating')),
  emotional_state TEXT NOT NULL DEFAULT 'neutral' CHECK (emotional_state IN ('struggling', 'neutral', 'thriving')),
  onboarding_day INTEGER NOT NULL DEFAULT 0,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  skill_tree_unlocked BOOLEAN NOT NULL DEFAULT false,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily loop entries (morning story + evening reflection)
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  morning_story TEXT,
  morning_action TEXT,
  morning_viewed_at TIMESTAMP WITH TIME ZONE,
  evening_reflection TEXT,
  evening_peter_response TEXT,
  evening_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, day)
);

-- Enable RLS
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

-- Policies: users access only their own rows
CREATE POLICY "Users manage own insights"
  ON public.user_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own daily entries"
  ON public.daily_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create user_insights row when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_insights()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_insights (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_insights
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_insights();
