-- Person Model V1 + memory schema (constitution §3, §4, §12; spec: docs/PERSON_MODEL.md)
-- Additive only: existing readers of profile_traits / memories keep working.

-- ── 1. profile_traits becomes the hypothesis layer ─────────────────────────
-- Every inferred trait is a hypothesis with evidence, never a fact.
ALTER TABLE public.profile_traits
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'hypothesis'
    CHECK (status IN ('hypothesis', 'confirmed', 'rejected')),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'inferred'
    CHECK (source IN ('inferred', 'user_stated', 'user_confirmed')),
  ADD COLUMN IF NOT EXISTS sensitivity text NOT NULL DEFAULT 'normal'
    CHECK (sensitivity IN ('normal', 'sensitive')),
  -- [{at, source, value, note}] — capped at 10 entries by the writer
  ADD COLUMN IF NOT EXISTS evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS counter_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- A competing value is held here until its evidence outweighs the current
  -- one — a single contradicting reflection never flips the hypothesis.
  ADD COLUMN IF NOT EXISTS candidate_value text,
  ADD COLUMN IF NOT EXISTS candidate_confidence numeric,
  ADD COLUMN IF NOT EXISTS last_evidence_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

COMMENT ON TABLE public.profile_traits IS
  'Person Model hypothesis layer (constitution §3). Inferred values are hypotheses: status/source/evidence/counter_evidence carry certainty. Never surface as fact.';

-- ── 2. memories get a kind and an importance ───────────────────────────────
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'context'
    CHECK (kind IN ('fact', 'context', 'pattern', 'discovery', 'intention', 'growth')),
  ADD COLUMN IF NOT EXISTS importance real NOT NULL DEFAULT 0.5
    CHECK (importance >= 0 AND importance <= 1);

CREATE INDEX IF NOT EXISTS memories_user_kind_idx ON public.memories (user_id, kind);

-- Ranked retrieval: similarity weighted by importance, self-discoveries and
-- facts slightly favored, time-bound context decays after ~30 days.
CREATE OR REPLACE FUNCTION public.match_memories_ranked(
  query_embedding vector(1536),
  match_user_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (id uuid, memory text, metadata jsonb, kind text, importance real, similarity float, score float)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT m.id, m.memory, m.metadata, m.kind, m.importance,
         (1 - (m.embedding <=> query_embedding))::float AS similarity,
         ((1 - (m.embedding <=> query_embedding))
           * (0.75 + 0.5 * m.importance)
           * CASE m.kind WHEN 'discovery' THEN 1.15 WHEN 'fact' THEN 1.05 ELSE 1.0 END
           * CASE WHEN m.kind = 'context' AND m.created_at < now() - interval '30 days' THEN 0.7 ELSE 1.0 END
         )::float AS score
  FROM public.memories m
  WHERE m.user_id = match_user_id
    AND m.embedding IS NOT NULL
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY score DESC
  LIMIT match_count;
$$;

-- ── 3. Self-discoveries: conclusions the user reached themselves ───────────
CREATE TABLE IF NOT EXISTS public.self_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery text NOT NULL,              -- in the user's own words
  context text,                         -- what they were talking about
  source text NOT NULL DEFAULT 'chat'
    CHECK (source IN ('evening', 'chat', 'mirror', 'ladder', 'journey', 'manual')),
  session_id uuid,
  sensitivity text NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('normal', 'sensitive')),
  still_true boolean NOT NULL DEFAULT true,  -- user can retire a discovery
  revisited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS self_discoveries_user_idx ON public.self_discoveries (user_id, created_at DESC);
ALTER TABLE public.self_discoveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS self_discoveries_own ON public.self_discoveries;
CREATE POLICY self_discoveries_own ON public.self_discoveries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 4. Experiments: small things the user chooses to try ───────────────────
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intention text NOT NULL,              -- "When X, I'll try Y" in the user's words
  context text,
  origin text NOT NULL DEFAULT 'user' CHECK (origin IN ('user', 'peter_suggested')),
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'tried', 'skipped', 'let_go')),
  outcome text CHECK (outcome IN ('helped', 'mixed', 'didnt_help')),
  outcome_note text,                    -- what the user noticed
  check_in_on date,
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS experiments_user_status_idx ON public.experiments (user_id, status, check_in_on);
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS experiments_own ON public.experiments;
CREATE POLICY experiments_own ON public.experiments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 5. Mark competing / dead stores as deprecated (not dropped) ────────────
-- All are empty and unreferenced by app code; dropping waits for Chris.
COMMENT ON TABLE public.personality_signals IS 'DEPRECATED (Person Model V1): unused; superseded by profile_traits.';
COMMENT ON TABLE public.personality_profiles IS 'DEPRECATED (Person Model V1): unused; superseded by profile_traits.';
COMMENT ON TABLE public.mirror_narratives IS 'DEPRECATED (Person Model V1): unused; superseded by weekly_mirrors.';
COMMENT ON TABLE public.memory_storage IS 'DEPRECATED (Person Model V1): unused; superseded by memories.';
COMMENT ON TABLE public.conversation_memories IS 'DEPRECATED (Person Model V1): only the legacy memory-operations edge function; superseded by memories.';
COMMENT ON TABLE public.if_then_checkins IS 'DEPRECATED (Person Model V1): unused; superseded by experiments.';
COMMENT ON COLUMN public.user_insights.attachment_style IS 'DEPRECATED: trait truth lives in profile_traits.';
COMMENT ON COLUMN public.user_insights.love_language IS 'DEPRECATED: trait truth lives in profile_traits.';
COMMENT ON COLUMN public.user_insights.conflict_style IS 'DEPRECATED: trait truth lives in profile_traits.';
