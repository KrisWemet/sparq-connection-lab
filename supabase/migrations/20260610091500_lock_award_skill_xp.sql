-- Lock down award_skill_xp (advisor: anon/authenticated can execute SECURITY DEFINER).
--
-- The function has NO auth check and writes XP for an arbitrary p_user_id —
-- callable by anyone with the anon key via /rest/v1/rpc/award_skill_xp.
-- Usage audit (2026-06-10): zero callers in src/, e2e/, scripts/ — dead code,
-- kept for future server-side use only.
--
-- NOTE: is_admin() is intentionally NOT touched — the legacy_rls_lockdown
-- policies evaluate is_admin(auth.uid()) as the querying user, so the
-- authenticated role must retain EXECUTE on it.

REVOKE EXECUTE ON FUNCTION public.award_skill_xp(uuid, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_skill_xp(uuid, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.award_skill_xp(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.award_skill_xp(uuid, text, integer) TO service_role;

-- Also pin its search_path while here (advisor: function_search_path_mutable)
ALTER FUNCTION public.award_skill_xp(uuid, text, integer) SET search_path = public;
