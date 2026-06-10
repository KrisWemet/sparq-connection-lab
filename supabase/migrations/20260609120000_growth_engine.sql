-- Growth Engine & Compound Reveal (spec: docs/superpowers/specs/2026-06-09-growth-engine-compound-reveal-design.md)

-- 3.1 pattern_snapshots: weekly copy of the 8-dim state (the time axis profile_traits lacks)
CREATE TABLE IF NOT EXISTS pattern_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start  date NOT NULL,
  snapshot    jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
ALTER TABLE pattern_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY pattern_snapshots_own ON pattern_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.2 baseline_snapshots: the silent "before" snapshot, written once per user
CREATE TABLE IF NOT EXISTS baseline_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  quotes      jsonb NOT NULL DEFAULT '[]',
  summary     text,
  sources     jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE baseline_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY baseline_snapshots_own ON baseline_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.3 growth_moments: engine output; status tracks CHAT consumption only
CREATE TABLE IF NOT EXISTS growth_moments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('pattern_shift', 'practice_consistency', 'tone_trend', 'csi_delta', 'moment_pair')),
  strength    text NOT NULL CHECK (strength IN ('strong', 'soft')),
  tentative   boolean NOT NULL DEFAULT false,
  evidence    jsonb NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'surfaced', 'expired')),
  surfaced_at timestamptz,
  week_start  date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_moments_user_status ON growth_moments (user_id, status);
ALTER TABLE growth_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY growth_moments_own ON growth_moments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.4 csi_pulses: CSI-4 scores
CREATE TABLE IF NOT EXISTS csi_pulses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context     text NOT NULL CHECK (context IN ('baseline', 'monthly')),
  item_scores jsonb NOT NULL,
  total_score int NOT NULL CHECK (total_score BETWEEN 0 AND 21),
  measured_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS csi_pulses_user ON csi_pulses (user_id, measured_at DESC);
ALTER TABLE csi_pulses ENABLE ROW LEVEL SECURITY;
CREATE POLICY csi_pulses_own ON csi_pulses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- §5.2: extend growth_thread.type to allow 'growth' (existing CHECK rejects it;
-- fail-soft inserts would be silently swallowed forever without this)
ALTER TABLE growth_thread DROP CONSTRAINT IF EXISTS growth_thread_type_check;
ALTER TABLE growth_thread ADD CONSTRAINT growth_thread_type_check
  CHECK (type IN ('milestone', 'breakthrough', 'pattern', 'mirror', 'pinned', 'growth'));

-- §5.3: Compound Reveal payload on the immutable graduation report
ALTER TABLE graduation_reports ADD COLUMN IF NOT EXISTS reveal jsonb;

-- §4.1 signal 5: age-aware vector search. The existing match_memories RPC does
-- not return/filter created_at, and addMemory stores every evening reflection —
-- including the current one — so an age filter is REQUIRED to prevent the
-- moment_pair signal from self-matching today's reflection.
CREATE OR REPLACE FUNCTION match_memories_before(
  query_embedding vector(1536),
  match_user_id UUID,
  before_date TIMESTAMPTZ,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  memory TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.memory,
    m.metadata,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
    AND m.embedding IS NOT NULL
    AND m.created_at < before_date
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
