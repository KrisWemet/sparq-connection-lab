-- Add Forced Pause locks to daily_sessions
ALTER TABLE daily_sessions
ADD COLUMN is_locked_for_pause BOOLEAN DEFAULT false,
ADD COLUMN pause_expires_at TIMESTAMPTZ;

-- Add comment explaining usage
COMMENT ON COLUMN daily_sessions.is_locked_for_pause IS 'True if the evening reflection was too triggered and should be reviewed tomorrow';
COMMENT ON COLUMN daily_sessions.pause_expires_at IS 'When the lock expires, allowing submission again';
