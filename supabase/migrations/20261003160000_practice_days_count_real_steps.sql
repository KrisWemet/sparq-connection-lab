-- Practice days count days the person actually did something, not page loads.
--
-- Before: the AFTER INSERT trigger counted a day whenever a daily_sessions row
-- was created — which happens as soon as /daily-growth loads and generates the
-- morning story. Opening the page counted as "showing up" (19 of 33 sessions
-- were never started).
--
-- Now a day counts when the session reaches morning_viewed (the person read
-- the story and took today's step) or completed (they reflected). Still
-- forgiving: the count never resets, one per local day.

CREATE OR REPLACE FUNCTION public.update_streak_on_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_streak RECORD;
  v_day date := COALESCE(NEW.session_local_date, CURRENT_DATE);
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET discovery_day = NEW.discovery_day WHERE id = NEW.user_id;
  END IF;

  -- Only a real step counts.
  IF NEW.status NOT IN ('morning_viewed', 'completed') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IN ('morning_viewed', 'completed') THEN
    RETURN NEW; -- this session already counted
  END IF;

  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date, total_sessions)
    VALUES (NEW.user_id, 1, 1, v_day, 1);
  ELSIF v_streak.last_session_date >= v_day THEN
    NULL; -- already counted today — no double count
  ELSE
    UPDATE public.user_streaks SET
      current_streak = v_streak.current_streak + 1,
      longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
      last_session_date = v_day,
      total_sessions = v_streak.total_sessions + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE TRIGGER on_daily_session_progressed
  AFTER UPDATE OF status ON public.daily_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_session();

-- Recount everyone from what they actually did.
UPDATE public.user_streaks s SET
  total_sessions = r.days,
  current_streak = r.days,
  longest_streak = r.days,
  last_session_date = r.last_day,
  updated_at = now()
FROM (
  SELECT u.user_id,
         count(DISTINCT d.session_local_date)::integer AS days,
         max(d.session_local_date) AS last_day
  FROM public.user_streaks u
  LEFT JOIN public.daily_sessions d
    ON d.user_id = u.user_id AND d.status IN ('morning_viewed', 'completed')
  GROUP BY u.user_id
) r
WHERE s.user_id = r.user_id;

UPDATE public.profiles p SET streak_count = s.current_streak
FROM public.user_streaks s
WHERE s.user_id = p.id;
