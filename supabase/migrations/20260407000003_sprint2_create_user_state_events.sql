-- Sprint 2 Architectural Upgrades: Create user_state_events table
--
-- Just-In-Time Adaptive Intervention (JITAI) state tag logs.
-- When a user taps one of the 4 state chips on the home screen
-- (Just had conflict / Partner shared good news / Feeling disconnected / Tense or anxious),
-- the selection is logged here and used to route them to appropriate Prime content.
--
-- state_tag: the chip the user tapped
--   Values: 'just_had_conflict' | 'partner_good_news' | 'feeling_disconnected' | 'tense_or_anxious'
--
-- routed_to: which Prime category or flow the state tag triggered
--   e.g. 'neutral_observer_reflection', 'capitalization', 'perceived_partner_responsiveness'
--   NULL = logged but not yet routed (e.g. user dismissed without acting)
--
-- session_id: the daily session associated with this state event, if one was started
--   NULL if user tapped the tag but did not start a session.

CREATE TABLE IF NOT EXISTS user_state_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which chip was tapped
  state_tag       text NOT NULL CHECK (state_tag IN (
                    'just_had_conflict',
                    'partner_good_news',
                    'feeling_disconnected',
                    'tense_or_anxious'
                  )),

  -- Where it routed to (nullable -- set after routing decision)
  routed_to       text,

  -- Associated session if one was started from this state event
  session_id      uuid REFERENCES daily_sessions(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_state_events_user_id
  ON user_state_events (user_id);

CREATE INDEX IF NOT EXISTS idx_user_state_events_state_tag
  ON user_state_events (state_tag, created_at DESC);

ALTER TABLE user_state_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own state events"
  ON user_state_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
