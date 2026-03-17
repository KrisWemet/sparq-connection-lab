-- Ensure deterministic "one daily session per user per local date".
DO $$
BEGIN
  IF to_regclass('public.daily_sessions') IS NULL THEN
    RETURN;
  END IF;

  -- Backward compatibility for remotes that don't yet have this column.
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_sessions'
      AND column_name = 'session_local_date'
  ) THEN
    ALTER TABLE public.daily_sessions
    ADD COLUMN session_local_date date;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'daily_sessions'
        AND column_name = 'local_date'
    ) THEN
      EXECUTE 'UPDATE public.daily_sessions
               SET session_local_date = COALESCE(session_local_date, local_date::date)';
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'daily_sessions'
        AND column_name = 'created_at'
    ) THEN
      EXECUTE 'UPDATE public.daily_sessions
               SET session_local_date = COALESCE(session_local_date, (created_at AT TIME ZONE ''UTC'')::date)';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_sessions'
      AND column_name = 'session_local_date'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_sessions_user_local_date_key'
      AND conrelid = 'public.daily_sessions'::regclass
  ) THEN
    ALTER TABLE public.daily_sessions
    ADD CONSTRAINT daily_sessions_user_local_date_key
    UNIQUE (user_id, session_local_date);
  END IF;
END $$;
