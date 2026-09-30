-- Person Model V1, part 2 (constitution step 3; docs/PERSON_MODEL.md)

-- 1. The trait feedback UI (TraitCard) and /api/profile/snapshot read and
--    write user_feedback, but the column never existed, so every
--    "does this fit?" answer failed. It now maps onto status.
ALTER TABLE public.profile_traits
  ADD COLUMN IF NOT EXISTS user_feedback text
    CHECK (user_feedback IN ('yes', 'not_really', 'unsure'));

-- 2. Growth traces (the user's own past words, kept for then-vs-now growth
--    detection) are never pulled into Peter's conversation context.
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
    AND NOT coalesce((m.metadata->>'trace')::boolean, false)
  ORDER BY score DESC
  LIMIT match_count;
$$;
