-- User-owned reasons (constitution v1.1 §1 self-persuasion, §4 "The User's
-- Own Reasons", §5A Commitment & Consistency; docs/PERSON_MODEL.md §8.3/§8.5).
-- Why a value, intention or experiment matters to the user, in THEIR words.
-- The only material Peter may use to support follow-through.

CREATE TABLE IF NOT EXISTS public.user_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason_text text NOT NULL CHECK (char_length(reason_text) BETWEEN 1 AND 500),
  attached_type text NOT NULL DEFAULT 'experiment'
    CHECK (attached_type IN ('value', 'north_star', 'discovery', 'experiment', 'intention')),
  attached_id uuid,
  source text NOT NULL DEFAULT 'chat'
    CHECK (source IN ('evening', 'chat', 'mirror', 'ladder', 'onboarding', 'experiment_card')),
  still_true boolean NOT NULL DEFAULT true,   -- retired reasons are never used for influence
  revised_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_reasons_user_idx ON public.user_reasons (user_id, still_true, created_at DESC);
ALTER TABLE public.user_reasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_reasons_own ON public.user_reasons;
CREATE POLICY user_reasons_own ON public.user_reasons
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- An experiment may carry the reason it serves. Required before Peter uses
-- any influence on it (influence provenance, constitution §12).
ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS reason_id uuid REFERENCES public.user_reasons(id) ON DELETE SET NULL;

-- §10 influence-health signal: how often experiments carry the user's own reason.
CREATE OR REPLACE FUNCTION public.discovery_metrics(window_days int DEFAULT 28)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => GREATEST(1, LEAST(window_days, 365)));
  active_user_weeks int;
  discoveries int; mirror_discoveries int;
  experiments_created int; experiments_tried int; experiments_let_go int; experiments_overdue int;
  growth_recognized int;
  traits_confirmed int; traits_rejected int;
  mirrors_generated int; mirrors_reflected int;
  shared_items int;
  reasons_given int; experiments_with_reason int;
  meaningful int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(DISTINCT (user_id, date_trunc('week', session_local_date::timestamp)))
    INTO active_user_weeks
    FROM daily_sessions WHERE status = 'completed' AND session_local_date >= since::date;

  SELECT count(*), count(*) FILTER (WHERE source = 'mirror')
    INTO discoveries, mirror_discoveries FROM self_discoveries WHERE created_at >= since;
  SELECT count(*) INTO experiments_created FROM experiments WHERE created_at >= since;
  SELECT count(*) FILTER (WHERE status = 'tried'), count(*) FILTER (WHERE status IN ('let_go', 'skipped'))
    INTO experiments_tried, experiments_let_go FROM experiments WHERE resolved_at >= since;
  SELECT count(*) INTO experiments_overdue FROM experiments
    WHERE status = 'planned' AND check_in_on < (now() - interval '3 days')::date;
  SELECT count(*) INTO growth_recognized FROM growth_moments WHERE surfaced_at >= since;
  SELECT count(*) FILTER (WHERE status = 'confirmed'), count(*) FILTER (WHERE status = 'rejected')
    INTO traits_confirmed, traits_rejected FROM profile_traits WHERE confirmed_at >= since;
  SELECT count(*), count(*) FILTER (WHERE user_reflection IS NOT NULL)
    INTO mirrors_generated, mirrors_reflected FROM weekly_mirrors WHERE created_at >= since;
  SELECT count(*) INTO shared_items FROM public.shared_items WHERE created_at >= since;
  SELECT count(*) INTO reasons_given FROM public.user_reasons WHERE created_at >= since;
  SELECT count(*) INTO experiments_with_reason FROM experiments WHERE created_at >= since AND reason_id IS NOT NULL;

  -- A meaningful discovery (§10): a genuine insight, a named pattern, a
  -- self-chosen experiment, or recognized growth.
  meaningful := discoveries + experiments_created + experiments_tried + growth_recognized;

  RETURN jsonb_build_object(
    'window_days', window_days,
    'active_user_weeks', active_user_weeks,
    'meaningful_discoveries', meaningful,
    'meaningful_discovery_rate', CASE WHEN active_user_weeks > 0 THEN round(meaningful::numeric / active_user_weeks, 2) END,
    'self_discoveries', discoveries,
    'mirror_discoveries', mirror_discoveries,
    'experiments_created', experiments_created,
    'experiments_tried', experiments_tried,
    'experiments_let_go', experiments_let_go,
    'experiments_overdue', experiments_overdue,
    'experiment_follow_through', CASE WHEN experiments_tried + experiments_let_go + experiments_overdue > 0
      THEN round(experiments_tried::numeric / (experiments_tried + experiments_let_go + experiments_overdue), 3) END,
    'growth_recognized', growth_recognized,
    'traits_confirmed', traits_confirmed,
    'traits_rejected', traits_rejected,
    'correction_rate', CASE WHEN traits_confirmed + traits_rejected > 0
      THEN round(traits_rejected::numeric / (traits_confirmed + traits_rejected), 3) END,
    'mirrors_generated', mirrors_generated,
    'mirrors_reflected', mirrors_reflected,
    'mirror_usefulness', CASE WHEN mirrors_generated > 0 THEN round(mirrors_reflected::numeric / mirrors_generated, 3) END,
    'shared_items', shared_items,
    'reasons_given', reasons_given,
    'own_reason_rate', CASE WHEN experiments_created > 0
      THEN round(experiments_with_reason::numeric / experiments_created, 3) END
  );
END;
$$;
REVOKE ALL ON FUNCTION public.discovery_metrics(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.discovery_metrics(int) TO authenticated;
