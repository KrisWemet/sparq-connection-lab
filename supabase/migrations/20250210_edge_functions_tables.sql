-- Migration: Create tables for Sparq Connection edge functions
-- Created: 2026-02-10

-- Table: daily_sessions
-- Stores completed Learn→Implement→Reflect sessions
CREATE TABLE IF NOT EXISTS daily_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    discovery_day INTEGER NOT NULL DEFAULT 1,
    phase TEXT NOT NULL DEFAULT 'rhythm',
    
    -- Learn step data
    learn_response TEXT,
    learn_question_id TEXT,
    learn_question_text TEXT,
    modality TEXT,
    
    -- Implement step data
    micro_action TEXT,
    micro_action_accepted BOOLEAN DEFAULT true,
    implement_action_id TEXT,
    
    -- Reflect step data
    reflect_response TEXT,
    
    -- Check-in (Day 2+)
    check_in_response TEXT,
    
    -- Points and streak tracking
    points_earned INTEGER DEFAULT 0,
    streak_at_session INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for daily_sessions
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_id ON daily_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_session_date ON daily_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON daily_sessions(user_id, session_date);

-- Table: personality_signals
-- Stores extracted personality signals from user responses
CREATE TABLE IF NOT EXISTS personality_signals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES daily_sessions(id) ON DELETE CASCADE,
    
    -- Signal data
    dimension TEXT NOT NULL, -- attachment, loveLanguage, conflict, emotionalExpression, values, intimacy, relationalIdentity
    source_modality TEXT NOT NULL,
    observation TEXT NOT NULL,
    strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
    indicator TEXT NOT NULL,
    
    -- Metadata
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    discovery_day INTEGER NOT NULL DEFAULT 1
);

-- Indexes for personality_signals
CREATE INDEX IF NOT EXISTS idx_personality_signals_user_id ON personality_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_signals_dimension ON personality_signals(dimension);
CREATE INDEX IF NOT EXISTS idx_personality_signals_user_dimension ON personality_signals(user_id, dimension);

-- Table: generated_questions
-- Stores AI-generated questions for reference
CREATE TABLE IF NOT EXISTS generated_questions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Question data
    text TEXT NOT NULL,
    target_dimensions TEXT[] DEFAULT '{}',
    modality TEXT,
    intimacy_level INTEGER CHECK (intimacy_level >= 1 AND intimacy_level <= 5),
    
    -- Discovery context
    discovery_day INTEGER NOT NULL DEFAULT 1,
    phase TEXT NOT NULL DEFAULT 'rhythm',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for generated_questions
CREATE INDEX IF NOT EXISTS idx_generated_questions_user_id ON generated_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_questions_discovery_day ON generated_questions(discovery_day);

-- Table: user_streaks
-- Tracks user streaks for engagement
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    total_sessions INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- daily_sessions policies
CREATE POLICY "Users can view own sessions" ON daily_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON daily_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON daily_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- personality_signals policies
CREATE POLICY "Users can view own signals" ON personality_signals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert signals" ON personality_signals
    FOR INSERT WITH CHECK (true); -- Edge functions use service role

-- generated_questions policies
CREATE POLICY "Users can view own questions" ON generated_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert questions" ON generated_questions
    FOR INSERT WITH CHECK (true);

-- user_streaks policies
CREATE POLICY "Users can view own streak" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can update streaks" ON user_streaks
    FOR ALL USING (true);

-- Add discovery fields to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'discovery_day') THEN
        ALTER TABLE profiles ADD COLUMN discovery_day INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'identity_archetype') THEN
        ALTER TABLE profiles ADD COLUMN identity_archetype TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'relationship_mode') THEN
        ALTER TABLE profiles ADD COLUMN relationship_mode TEXT DEFAULT 'solo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_goals') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_goals TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_daily_activity') THEN
        ALTER TABLE profiles ADD COLUMN last_daily_activity DATE;
    END IF;
END
$$;
