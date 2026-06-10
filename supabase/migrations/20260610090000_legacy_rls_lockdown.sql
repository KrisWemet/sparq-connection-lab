-- Legacy RLS lockdown: 7 tables flagged by Supabase advisors with RLS disabled,
-- fully exposed to anon/authenticated roles via the public anon key.
--
-- Usage audit (2026-06-10):
--   goals, goal_milestones        — only referenced by supabaseService.ts via Goals.tsx,
--                                   which no page renders; queries are user-scoped already
--   daily_questions, date_ideas   — content catalogs; ZERO code references
--   daily_question_responses,
--   user_date_ideas               — user data; ZERO code references
--   system_settings               — admin-gated in app code ONLY (client-side check),
--                                   which is exactly why DB-level RLS is required
--
-- Policy patterns follow supabase/migrations/20260609120000_growth_engine.sql.
-- DROP POLICY IF EXISTS makes this re-runnable.

-- ── goals: user-scoped ────────────────────────────────────────────────────────
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS goals_own ON public.goals;
CREATE POLICY goals_own ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── goal_milestones: scoped via owning goal (table has goal_id, no user_id) ───
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS goal_milestones_own ON public.goal_milestones;
CREATE POLICY goal_milestones_own ON public.goal_milestones
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = goal_milestones.goal_id AND g.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = goal_milestones.goal_id AND g.user_id = auth.uid()
  ));

-- ── daily_questions: content catalog — read for authenticated, write for admin ─
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_questions_read ON public.daily_questions;
CREATE POLICY daily_questions_read ON public.daily_questions
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS daily_questions_admin ON public.daily_questions;
CREATE POLICY daily_questions_admin ON public.daily_questions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ── date_ideas: content catalog — read for authenticated, write for admin ─────
ALTER TABLE public.date_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS date_ideas_read ON public.date_ideas;
CREATE POLICY date_ideas_read ON public.date_ideas
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS date_ideas_admin ON public.date_ideas;
CREATE POLICY date_ideas_admin ON public.date_ideas
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ── daily_question_responses: user-scoped ─────────────────────────────────────
ALTER TABLE public.daily_question_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_question_responses_own ON public.daily_question_responses;
CREATE POLICY daily_question_responses_own ON public.daily_question_responses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── user_date_ideas: user-scoped ──────────────────────────────────────────────
ALTER TABLE public.user_date_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_date_ideas_own ON public.user_date_ideas;
CREATE POLICY user_date_ideas_own ON public.user_date_ideas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── system_settings: admin-only (app code checks admin client-side only) ──────
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS system_settings_admin ON public.system_settings;
CREATE POLICY system_settings_admin ON public.system_settings
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
