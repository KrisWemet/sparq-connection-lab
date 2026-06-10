-- Pin search_path on match_memories_before (advisor: function_search_path_mutable).
-- The function references memories and the pgvector <=> operator, both in public.
ALTER FUNCTION public.match_memories_before(vector(1536), uuid, timestamptz, int)
  SET search_path = public;
