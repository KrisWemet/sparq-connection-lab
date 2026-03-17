-- Create 4 missing tables that cause 500 errors at runtime

-- 1. outcome_assessments
CREATE TABLE IF NOT EXISTS outcome_assessments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone     text NOT NULL,
  responses     jsonb NOT NULL DEFAULT '[]',
  total_score   numeric NOT NULL DEFAULT 0,
  completed_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE outcome_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own assessments" ON outcome_assessments
  FOR ALL USING (auth.uid() = user_id);

-- 2. conflict_episodes
CREATE TABLE IF NOT EXISTS conflict_episodes (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity                integer NOT NULL DEFAULT 3,
  tool_used               text,
  notes                   text,
  started_at              timestamptz NOT NULL DEFAULT now(),
  resolved_at             timestamptz,
  repair_duration_minutes numeric,
  resolution_method       text,
  updated_at              timestamptz
);
ALTER TABLE conflict_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own episodes" ON conflict_episodes
  FOR ALL USING (auth.uid() = user_id);

-- 3. user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  insights_visible        boolean NOT NULL DEFAULT true,
  personalization_enabled boolean NOT NULL DEFAULT true,
  ai_memory_mode          text NOT NULL DEFAULT 'rolling_90_days',
  relationship_mode       text NOT NULL DEFAULT 'solo',
  memory_window           text NOT NULL DEFAULT 'indefinite',
  reminder_time           text,
  notifications_enabled   boolean NOT NULL DEFAULT true,
  timezone                text,
  updated_at              timestamptz
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 4. analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name  text NOT NULL,
  event_props jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own events" ON analytics_events
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events (event_name, created_at);
