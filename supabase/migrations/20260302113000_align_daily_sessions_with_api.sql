-- Align legacy daily_sessions schema with the API contract used by
-- /api/daily/session/{start,morning-viewed,complete}.
DO $$
BEGIN
  IF to_regclass('public.daily_sessions') IS NULL THEN
    RETURN;
  END IF;

  -- Core identifiers and scheduling columns.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'session_local_date'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN session_local_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN timezone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'day_index'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN day_index integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN status text;
  END IF;

  -- Morning and evening content columns.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'morning_story'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN morning_story text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'morning_action'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN morning_action text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'morning_viewed_at'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN morning_viewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'evening_reflection'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN evening_reflection text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'evening_peter_response'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN evening_peter_response text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'evening_completed_at'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN evening_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'completed_local_date'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN completed_local_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN idempotency_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.daily_sessions ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Backfill best-effort from legacy columns if present.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'local_date'
  ) THEN
    EXECUTE 'UPDATE public.daily_sessions
             SET session_local_date = COALESCE(session_local_date, local_date::date)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_sessions' AND column_name = 'day'
  ) THEN
    EXECUTE 'UPDATE public.daily_sessions
             SET day_index = COALESCE(day_index, day::integer)';
  END IF;

  -- Normalize defaults for API writes.
  UPDATE public.daily_sessions
  SET status = COALESCE(status, 'morning_ready'),
      day_index = COALESCE(day_index, 1),
      updated_at = COALESCE(updated_at, now()),
      created_at = COALESCE(created_at, now());
END $$;

-- Keep this query fast for "latest completed day" checks.
CREATE INDEX IF NOT EXISTS daily_sessions_user_completed_idx
  ON public.daily_sessions (user_id, day_index DESC)
  WHERE status = 'completed';

