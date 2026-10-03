-- Retire the consecutive "dopamine" streak track (constitution v1.2 §10,
-- Chris 2026-10-01: shallow gamification is out). The forgiving
-- practice-day count (current_streak / total_sessions) is unchanged.
-- Code on main reads consecutive_streak with `?? 0`, so it keeps working.

-- 1. Trigger: forgiving track only.
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
    NULL; -- already practiced today — no double count
  ELSE
    UPDATE public.user_streaks SET
      -- Forgiving: any earlier date increments (never resets)
      current_streak = v_streak.current_streak + 1,
      longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
      last_session_date = CURRENT_DATE,
      total_sessions = v_streak.total_sessions + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    discovery_day = NEW.discovery_day,
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- 2. Return state without the reward track (return type changes → drop + create).
DROP FUNCTION IF EXISTS public.get_return_state();
CREATE FUNCTION public.get_return_state()
RETURNS TABLE(days_away integer, practice_days integer)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE((CURRENT_DATE - last_session_date), 0)::integer AS days_away,
    COALESCE(total_sessions, 0)::integer                     AS practice_days
  FROM public.user_streaks
  WHERE user_id = auth.uid();
$function$;
REVOKE ALL ON FUNCTION public.get_return_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_return_state() TO authenticated, service_role;

-- 3. Drop the columns.
ALTER TABLE public.user_streaks
  DROP COLUMN IF EXISTS consecutive_streak,
  DROP COLUMN IF EXISTS longest_consecutive;
