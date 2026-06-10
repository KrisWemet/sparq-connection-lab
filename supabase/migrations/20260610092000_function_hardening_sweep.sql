-- Function hardening sweep (advisors: function_search_path_mutable,
-- anon/authenticated_security_definer_function_executable).
--
-- 1. Pin search_path on all remaining flagged functions (all reference
--    public-schema objects only).
-- 2. Revoke client EXECUTE on trigger functions — triggers fire as the table
--    owner and never check the calling role's EXECUTE, so this only removes
--    the useless /rest/v1/rpc/ exposure.
-- 3. is_admin: pin search_path and revoke anon, but KEEP authenticated —
--    the legacy_rls_lockdown policies evaluate is_admin(auth.uid()) as the
--    querying user. (anon calling it merely returned false, but there is no
--    reason to expose it.)

-- ── search_path pins ──────────────────────────────────────────────────────────
ALTER FUNCTION public.update_streak_on_session() SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user_insights() SET search_path = public;
ALTER FUNCTION public.trigger_set_updated_at() SET search_path = public;
ALTER FUNCTION public.generate_partner_code() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.match_memories(vector(1536), uuid, int) SET search_path = public;

-- ── revoke client EXECUTE on trigger functions ────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_insights() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_streak_on_session() FROM PUBLIC, anon, authenticated;

-- ── is_admin: remove anon exposure, keep authenticated (RLS policies need it) ─
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
