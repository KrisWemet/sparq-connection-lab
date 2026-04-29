-- Sprint 2 Architectural Upgrades: Create if_then_checkins table
--
-- Evening micro-check-in for implementation intentions.
-- After the daily session, Peter asks: "Your plan today was: [plan]. How did it go?"
-- The user responds with one of: completed | partial | not_attempted | skip
-- Optional note captures free-text context.
--
-- One check-in per session (unique on session_id + user_id).
-- References daily_sessions.id; cascade-deletes if session is deleted.
-- Separate from daily_sessions to keep the sessions table lean and allow
-- the check-in to be recorded asynchronously (evening, not at session start).

CREATE TABLE IF NOT EXISTS if_then_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      uuid NOT NULL REFERENCES daily_sessions(id) ON DELETE CASCADE,

  -- The plan that was checked on (snapshot at check-in time)
  plan_text       text NOT NULL,

  -- How it went
  outcome         text NOT NULL CHECK (outcome IN ('completed', 'partial', 'not_attempted', 'skip')),

  -- Optional free-text note from user
  note            text,

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_if_then_checkins_session UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_if_then_checkins_user_id
  ON if_then_checkins (user_id);

CREATE INDEX IF NOT EXISTS idx_if_then_checkins_session_id
  ON if_then_checkins (session_id);

ALTER TABLE if_then_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own if_then_checkins"
  ON if_then_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
