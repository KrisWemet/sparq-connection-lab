-- Rejected hypotheses — what Peter got wrong (constitution v1.1 §2 "resistance
-- is information", §4 Insight Evidence, §6A resistance protocol, §12
-- "never re-push"; docs/PERSON_MODEL.md §8.7). Stored as evidence about
-- Peter's understanding — never as a "resistance" score about the user.

CREATE TABLE IF NOT EXISTS public.rejected_hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hypothesis_ref text,                    -- e.g. 'trait:stress_communication', or null for a free reflection
  offered_as text NOT NULL DEFAULT 'reflection'
    CHECK (offered_as IN ('reflection', 'challenge', 'suggestion', 'interpretation', 'insight')),
  offered_text text CHECK (char_length(offered_text) <= 400),     -- Peter's words (short)
  user_response text CHECK (char_length(user_response) <= 500),   -- the user's words
  what_peter_missed text CHECK (char_length(what_peter_missed) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rejected_hypotheses_user_idx ON public.rejected_hypotheses (user_id, created_at DESC);
ALTER TABLE public.rejected_hypotheses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rejected_hypotheses_own ON public.rejected_hypotheses;
CREATE POLICY rejected_hypotheses_own ON public.rejected_hypotheses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
