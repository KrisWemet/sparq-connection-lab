-- Skill progress tracking for the Skill Tree (Day 15+)
CREATE TABLE IF NOT EXISTS public.skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track TEXT NOT NULL CHECK (track IN ('communication', 'conflict', 'intimacy')),
  level TEXT NOT NULL CHECK (level IN ('basic', 'advanced', 'expert')),
  story_viewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, track, level)
);

ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skill progress"
  ON public.skill_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
