-- Add XP column to skill_progress if it doesn't exist
-- This migration enables the XP-based progression system for the Skill Tree.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skill_progress' AND column_name = 'xp') THEN
        ALTER TABLE skill_progress ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Track cumulative XP per user per track
CREATE TABLE IF NOT EXISTS user_skill_tracks (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_key TEXT NOT NULL,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level TEXT NOT NULL DEFAULT 'basic',
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, track_key)
);

ALTER TABLE user_skill_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill track progress"
    ON user_skill_tracks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill track progress"
    ON user_skill_tracks FOR ALL
    USING (auth.uid() = user_id);

-- RPC for awarding skill XP and handling level-up progression
CREATE OR REPLACE FUNCTION award_skill_xp(p_user_id UUID, p_track TEXT, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_xp INTEGER;
    new_level TEXT;
BEGIN
    -- Get current XP
    SELECT total_xp INTO current_xp
    FROM user_skill_tracks
    WHERE user_id = p_user_id AND track_key = p_track;
    
    IF current_xp IS NULL THEN
        current_xp := 0;
    END IF;
    
    new_xp := current_xp + p_xp;
    
    -- Determine level based on XP thresholds: Basic (0), Advanced (100), Expert (300)
    IF new_xp >= 300 THEN
        new_level := 'expert';
    ELSIF new_xp >= 100 THEN
        new_level := 'advanced';
    ELSE
        new_level := 'basic';
    END IF;
    
    -- Upsert track progress
    INSERT INTO user_skill_tracks (user_id, track_key, total_xp, current_level, last_activity_at)
    VALUES (p_user_id, p_track, new_xp, new_level, now())
    ON CONFLICT (user_id, track_key)
    DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        last_activity_at = EXCLUDED.last_activity_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
