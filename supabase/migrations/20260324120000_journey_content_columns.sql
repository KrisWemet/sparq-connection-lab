-- Journey content system: add journey tracking columns
-- Additive migration — no existing columns modified or dropped.

-- Track which starter journey the user is currently on
ALTER TABLE user_insights
  ADD COLUMN IF NOT EXISTS active_journey_id text,
  ADD COLUMN IF NOT EXISTS last_completed_journey_id text;

-- Store the evening reflection prompt from journey content
-- so the Peter evening chat can use it
ALTER TABLE daily_sessions
  ADD COLUMN IF NOT EXISTS evening_reflection_prompt text;

-- Add journey metadata to daily sessions for display
ALTER TABLE daily_sessions
  ADD COLUMN IF NOT EXISTS journey_id text,
  ADD COLUMN IF NOT EXISTS journey_title text,
  ADD COLUMN IF NOT EXISTS journey_day_index integer;

COMMENT ON COLUMN user_insights.active_journey_id IS 'Current starter journey ID (e.g. safe-in-love). Null = between journeys or pre-onboarding.';
COMMENT ON COLUMN user_insights.last_completed_journey_id IS 'Most recently completed starter journey ID.';
COMMENT ON COLUMN daily_sessions.evening_reflection_prompt IS 'Journey-specific reflection prompt for Peter evening chat.';
COMMENT ON COLUMN daily_sessions.journey_id IS 'Starter journey ID that generated this session content.';
