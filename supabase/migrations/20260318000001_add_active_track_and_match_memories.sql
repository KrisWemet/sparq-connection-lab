-- Phase 1: Vector similarity search function for memories
-- Phase 4: active_track column on daily_sessions

CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_user_id UUID,
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
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Phase 4: Track which skill track a daily session targets
ALTER TABLE daily_sessions ADD COLUMN IF NOT EXISTS active_track TEXT DEFAULT 'communication';
