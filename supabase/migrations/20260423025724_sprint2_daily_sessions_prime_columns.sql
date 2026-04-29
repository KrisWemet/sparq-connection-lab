-- Sprint 2 Architectural Upgrades: Add Prime content and implementation intention columns to daily_sessions
--
-- prime_type: which Prime category drove this session's content
--   e.g. 'perceived_partner_responsiveness', 'capitalization', 'michelangelo',
--        'loving_kindness', 'growth_mindset'
--   NULL = session predates Prime content or used standard daily content.
--
-- if_then_plan: the user-edited implementation intention for this session
--   Format: "When [situation], I will [action]."
--   Stored as entered; editable until session is completed.
--
-- if_then_default: the system-generated default plan before user edits
--   Preserved separately so we can measure how often users modify the default.
--
-- trigger_source: what triggered this session to start
--   Values: 'scheduled' | 'state_tag' | 'partner_invite' | 'manual'
--   Defaults to 'scheduled'. Used for JITAI effectiveness analysis.
--
-- citation: the APA-style citation for the research behind today's Prime content
--   e.g. "Reis et al. (2004). Perceived partner responsiveness..."
--
-- institution: the lead institution for the Prime content's research
--   e.g. "University of Rochester"

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'prime_type'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN prime_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'if_then_plan'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN if_then_plan text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'if_then_default'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN if_then_default text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'trigger_source'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN trigger_source text DEFAULT 'scheduled';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'citation'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN citation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_sessions' AND column_name = 'institution'
  ) THEN
    ALTER TABLE daily_sessions ADD COLUMN institution text;
  END IF;
END $$;
