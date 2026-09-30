-- Meaningful Discovery Rate + supporting metrics (constitution §10, §12).
-- Aggregate COUNTS only — never content — and only for admins. SECURITY
-- DEFINER because RLS limits every table to its owner.
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
    'shared_items', shared_items
  );
END;
$$;
REVOKE ALL ON FUNCTION public.discovery_metrics(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.discovery_metrics(int) TO authenticated;
