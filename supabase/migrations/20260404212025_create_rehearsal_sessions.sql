CREATE TABLE rehearsal_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Setup answers (persisted for context reconstruction; nullified at 90 days)
  setup_q1          text,
  setup_q2          text,
  setup_q3          text,

  -- Derived from setup (single LLM call after Q3 accepted)
  situation_summary text,
  topic_category    text CHECK (topic_category IN (
                      'communication','conflict','needs','intimacy','trust','boundaries','other'
                    )),

  intensity_level   text CHECK (intensity_level IN ('gentle','realistic','challenging')),
  exchange_count    integer NOT NULL DEFAULT 0,

  -- Written by /complete only
  confidence_before integer CHECK (confidence_before BETWEEN 1 AND 5),
  confidence_after  integer CHECK (confidence_after BETWEEN 1 AND 5),
  peter_anchor      text,
  completed         boolean NOT NULL DEFAULT false,

  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rehearsal_sessions_user_created
  ON rehearsal_sessions (user_id, created_at DESC);

ALTER TABLE rehearsal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rehearsal sessions"
  ON rehearsal_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Privacy: nullify PII after 90 days (requires pg_cron extension)
SELECT cron.schedule(
  'rehearsal-session-privacy-nullify',
  '0 2 * * *',
  $$UPDATE rehearsal_sessions
    SET situation_summary = NULL,
        setup_q1 = NULL,
        setup_q2 = NULL,
        setup_q3 = NULL
    WHERE created_at < now() - interval '90 days'
      AND (situation_summary IS NOT NULL
        OR setup_q1 IS NOT NULL
        OR setup_q2 IS NOT NULL
        OR setup_q3 IS NOT NULL)$$
);
