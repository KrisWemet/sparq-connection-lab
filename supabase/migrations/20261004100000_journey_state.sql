-- Journey state: one durable source of truth for every journey (Journey audit, Phase 1).
--
-- Before this, Sparq kept journey progress in two places: the 9 starter
-- journeys on user_insights.active_journey_id + a global day counter, and the
-- 13 staged journeys (Roots → Growth → Bloom) only in the browser's
-- localStorage. user_journeys existed but could hold neither: its journey_id
-- was a UUID pointing at the (empty) journeys table, while every journey id
-- is a text slug.
--
-- This migration makes user_journeys the per-journey record for all of them:
--   * journey_id becomes text (slug); the FK to journeys is dropped.
--   * status (active / paused / completed / left), stage, journey_day,
--     stage_progress, last_step_at, paused_at, left_at, updated_at.
--   * at most one active journey per user (partial unique index).
--   * journey_step_entries holds the private written answers of staged
--     journeys (previously browser-only).
--   * existing starter-journey users are backfilled from user_insights and
--     their completed daily sessions.
-- user_insights.active_journey_id stays as a pointer, written by
-- src/lib/server/journey-state.ts together with user_journeys.
-- NOT purely additive: it changes user_journeys.journey_id from uuid to text and
-- drops the FK to journeys. Idempotent. Live table had 0 rows when written
-- (2026-10-04). Backup, deployment order and recovery:
-- docs/migrations/2026-10-04-journey-state.md

-- ── 1. journey_id: uuid → text, no FK to journeys ─────────────────────────
ALTER TABLE public.user_journeys DROP CONSTRAINT IF EXISTS user_journeys_journey_id_fkey;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_journeys'
      AND column_name = 'journey_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.user_journeys ALTER COLUMN journey_id TYPE text USING journey_id::text;
  END IF;
END $$;

-- ── 2. State columns ──────────────────────────────────────────────────────
ALTER TABLE public.user_journeys
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS journey_day integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stage_progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_step_at timestamptz,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS left_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_journeys DROP CONSTRAINT IF EXISTS user_journeys_status_check;
ALTER TABLE public.user_journeys ADD CONSTRAINT user_journeys_status_check
  CHECK (status IN ('active', 'paused', 'completed', 'left'));
ALTER TABLE public.user_journeys DROP CONSTRAINT IF EXISTS user_journeys_stage_check;
ALTER TABLE public.user_journeys ADD CONSTRAINT user_journeys_stage_check
  CHECK (stage IS NULL OR stage IN ('roots', 'growth', 'bloom'));
ALTER TABLE public.user_journeys DROP CONSTRAINT IF EXISTS user_journeys_journey_day_check;
ALTER TABLE public.user_journeys ADD CONSTRAINT user_journeys_journey_day_check
  CHECK (journey_day >= 1);

-- Rows written before status existed: derive it from is_active / completed_at.
UPDATE public.user_journeys
SET status = CASE
  WHEN completed_at IS NOT NULL THEN 'completed'
  WHEN is_active IS TRUE THEN 'active'
  ELSE 'left'
END
WHERE status = 'active' AND (completed_at IS NOT NULL OR is_active IS NOT TRUE);

-- One active journey per user: keep the most recent, pause the rest.
UPDATE public.user_journeys uj
SET status = 'paused', is_active = false, paused_at = now()
WHERE uj.status = 'active'
  AND EXISTS (
    SELECT 1 FROM public.user_journeys newer
    WHERE newer.user_id = uj.user_id AND newer.status = 'active'
      AND (newer.start_date, newer.id) > (uj.start_date, uj.id)
  );

CREATE UNIQUE INDEX IF NOT EXISTS user_journeys_one_active
  ON public.user_journeys (user_id) WHERE status = 'active';

-- ── 3. Backfill starter-journey users from user_insights ──────────────────
-- journey_day = the next day after the highest completed day OF THAT JOURNEY
-- (the old code used a global counter, which is the bug this fixes).
INSERT INTO public.user_journeys (user_id, journey_id, status, is_active, journey_day, progress, last_step_at, start_date)
SELECT
  ui.user_id,
  ui.active_journey_id,
  'active',
  true,
  COALESCE(done.max_day, 0) + 1,
  COALESCE(done.days, 0),
  done.last_at,
  COALESCE(done.first_at, now())
FROM public.user_insights ui
LEFT JOIN LATERAL (
  SELECT max(ds.journey_day_index) AS max_day,
         count(DISTINCT ds.journey_day_index)::int AS days,
         max(ds.evening_completed_at) AS last_at,
         min(ds.created_at) AS first_at
  FROM public.daily_sessions ds
  WHERE ds.user_id = ui.user_id AND ds.journey_id = ui.active_journey_id AND ds.status = 'completed'
) done ON true
WHERE ui.active_journey_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_journeys a WHERE a.user_id = ui.user_id AND a.status = 'active')
ON CONFLICT (user_id, journey_id) DO NOTHING;

INSERT INTO public.user_journeys (user_id, journey_id, status, is_active, completed_at)
SELECT ui.user_id, ui.last_completed_journey_id, 'completed', false, now()
FROM public.user_insights ui
WHERE ui.last_completed_journey_id IS NOT NULL
ON CONFLICT (user_id, journey_id) DO NOTHING;

-- ── 4. Private written answers for staged journeys ────────────────────────
CREATE TABLE IF NOT EXISTS public.journey_step_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('roots', 'growth', 'bloom')),
  day integer NOT NULL CHECK (day >= 1),
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'app' CHECK (source IN ('app', 'browser_import')),
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, journey_id, stage, day)
);
CREATE INDEX IF NOT EXISTS journey_step_entries_user_idx
  ON public.journey_step_entries (user_id, journey_id, completed_at DESC);
ALTER TABLE public.journey_step_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS journey_step_entries_own ON public.journey_step_entries;
CREATE POLICY journey_step_entries_own ON public.journey_step_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.journey_step_entries IS
  'Private answers written on a staged journey day (Roots/Growth/Bloom). Never shared; a partner sees nothing here.';
COMMENT ON COLUMN public.user_journeys.journey_day IS
  'Next day to practice: within the current stage for staged journeys, within the journey for daily (starter) journeys.';
COMMENT ON COLUMN public.user_journeys.stage_progress IS
  'Staged journeys only: {"roots": {"next_day": 15, "completed_at": "..."}, ...}.';
COMMENT ON COLUMN public.user_journeys.progress IS
  'Days practiced on this journey in total. Never decreases.';
