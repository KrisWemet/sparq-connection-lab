-- First Mirror shape (constitution §9 Day 7, §11): one strength, one
-- emerging pattern, one question — and the user writes the interpretation.
ALTER TABLE public.weekly_mirrors
  ADD COLUMN IF NOT EXISTS strength text,
  ADD COLUMN IF NOT EXISTS emerging_pattern text,   -- tentative, never a verdict
  ADD COLUMN IF NOT EXISTS mirror_question text,
  ADD COLUMN IF NOT EXISTS user_reflection text,    -- the user's own conclusion
  ADD COLUMN IF NOT EXISTS user_reflected_at timestamptz;
