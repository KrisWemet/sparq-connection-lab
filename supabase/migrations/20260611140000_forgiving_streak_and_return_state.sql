-- The Way Back (Phase D): forgiving streak + return-state RPC.
-- Spec: docs/superpowers/specs/2026-06-11-the-way-back-relapse-repair-design.md

-- ── Forgiving streak: a gap no longer resets current_streak ──────────────────
-- Only change vs. the live definition: the old gap-reset ELSE branch (which set
-- current_streak back to 1 after a missed day) is removed; any
-- last_session_date < CURRENT_DATE now increments. The IS NULL first-session
-- branch (current_streak = 1) is preserved.
CREATE OR REPLACE FUNCTION public.update_streak_on_session()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_streak RECORD;
BEGIN
  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date, total_sessions)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1);
  ELSIF v_streak.last_session_date = CURRENT_DATE THEN
    -- Already practiced today — no streak change, no double count
    NULL;
  ELSE
    -- Any earlier date (yesterday OR a longer gap): forgiving increment.
    -- Missed days are skipped, never punished (spec §2).
    UPDATE public.user_streaks SET
      current_streak = v_streak.current_streak + 1,
      longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
      last_session_date = CURRENT_DATE,
      total_sessions = v_streak.total_sessions + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Mirror to profiles (unchanged from live definition)
  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    discovery_day = NEW.discovery_day,
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Trigger on_daily_session_created (AFTER INSERT) is unchanged — the function
-- replacement preserves it.

-- ── Return-state RPC: DB-basis date math, RLS-safe (SECURITY INVOKER) ─────────
-- Computes days_away in CURRENT_DATE basis so the streak and the greeting band
-- never disagree at a day boundary (spec §3). Reads the caller's own row only.
CREATE OR REPLACE FUNCTION public.get_return_state()
 RETURNS TABLE (days_away integer, practice_days integer)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE((CURRENT_DATE - last_session_date), 0)::integer AS days_away,
    COALESCE(total_sessions, 0)::integer AS practice_days
  FROM public.user_streaks
  WHERE user_id = auth.uid();
$function$;
