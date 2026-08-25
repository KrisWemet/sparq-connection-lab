-- Two-track streak (Master PRD decision 4, Chris 2026-06-12).
--
-- Track 1 — current_streak: FORGIVING "practice days". Never resets. This is
--   the shame-free count Phase D established; a missed day costs nothing.
-- Track 2 — consecutive_streak: the DOPAMINE track. Increments on genuinely
--   consecutive days, silently resets to 1 after a gap. Losing it removes a
--   reward; it never produces guilt copy and never touches practice days.
--
-- Rationale: reward consistency without punishing lapse. The user keeps every
-- day they ever showed up, and separately gets a celebration when a live run
-- is going.

ALTER TABLE public.user_streaks
  ADD COLUMN IF NOT EXISTS consecutive_streak int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_consecutive int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.update_streak_on_session()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_streak RECORD;
  v_consecutive int;
BEGIN
  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.user_streaks (
      user_id, current_streak, longest_streak, last_session_date, total_sessions,
      consecutive_streak, longest_consecutive
    )
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1, 1, 1);
  ELSIF v_streak.last_session_date = CURRENT_DATE THEN
    -- Already practiced today — no double count on either track
    NULL;
  ELSE
    -- Track 2: consecutive only survives an exactly-adjacent day
    IF v_streak.last_session_date = CURRENT_DATE - 1 THEN
      v_consecutive := COALESCE(v_streak.consecutive_streak, 0) + 1;
    ELSE
      v_consecutive := 1; -- gap: the reward run restarts, quietly
    END IF;

    UPDATE public.user_streaks SET
      -- Track 1: forgiving — any earlier date increments (never resets)
      current_streak = v_streak.current_streak + 1,
      longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
      consecutive_streak = v_consecutive,
      longest_consecutive = GREATEST(COALESCE(v_streak.longest_consecutive, 0), v_consecutive),
      last_session_date = CURRENT_DATE,
      total_sessions = v_streak.total_sessions + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Mirror to profiles (unchanged: streak_count stays the FORGIVING count)
  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    discovery_day = NEW.discovery_day,
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Extend the return-state RPC so surfaces can read both tracks in one call.
CREATE OR REPLACE FUNCTION public.get_return_state()
 RETURNS TABLE (
   days_away integer,
   practice_days integer,
   consecutive_streak integer,
   longest_consecutive integer
 )
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE((CURRENT_DATE - last_session_date), 0)::integer            AS days_away,
    COALESCE(total_sessions, 0)::integer                                AS practice_days,
    COALESCE(consecutive_streak, 0)::integer                            AS consecutive_streak,
    COALESCE(longest_consecutive, 0)::integer                           AS longest_consecutive
  FROM public.user_streaks
  WHERE user_id = auth.uid();
$function$;
