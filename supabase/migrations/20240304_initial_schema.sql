-- Create custom types
CREATE TYPE journey_category AS ENUM ('communication', 'intimacy', 'growth', 'trust', 'connection');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    category journey_category NOT NULL,
    sequence INTEGER NOT NULL,
    image TEXT NOT NULL,
    psychology TEXT[] NOT NULL,
    benefits TEXT[] NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    phases JSONB NOT NULL,
    overview TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE user_journey_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    current_day INTEGER NOT NULL DEFAULT 1,
    completed_activities JSONB NOT NULL DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(user_id, journey_id)
);

CREATE TABLE journey_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(journey_id, inviter_id, invitee_email)
);

CREATE TABLE activity_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    activity_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    answered_by TEXT NOT NULL CHECK (answered_by IN ('user', 'partner')),
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_user_journey_progress_user ON user_journey_progress(user_id);
CREATE INDEX idx_user_journey_progress_journey ON user_journey_progress(journey_id);
CREATE INDEX idx_journey_invitations_invitee ON journey_invitations(invitee_email);
CREATE INDEX idx_activity_responses_journey ON activity_responses(journey_id, day);

-- Create RLS policies
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_responses ENABLE ROW LEVEL SECURITY;

-- Journeys policies
CREATE POLICY "Journeys are viewable by all authenticated users"
    ON journeys FOR SELECT
    TO authenticated
    USING (true);

-- Progress policies
CREATE POLICY "Users can view their own progress"
    ON user_journey_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can update their own progress"
    ON user_journey_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_journey_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Invitation policies
CREATE POLICY "Users can view invitations they sent or received"
    ON journey_invitations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = inviter_id OR 
        auth.email() = invitee_email
    );

CREATE POLICY "Users can create invitations"
    ON journey_invitations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitees can update invitation status"
    ON journey_invitations FOR UPDATE
    TO authenticated
    USING (auth.email() = invitee_email)
    WITH CHECK (auth.email() = invitee_email);

-- Response policies
CREATE POLICY "Users can view responses for their journeys"
    ON activity_responses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_journey_progress
            WHERE journey_id = activity_responses.journey_id
            AND (user_id = auth.uid() OR partner_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own responses"
    ON activity_responses FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_journey_progress
            WHERE journey_id = activity_responses.journey_id
            AND (user_id = auth.uid() OR partner_id = auth.uid())
        )
    );

-- Create function for saving activity responses
CREATE OR REPLACE FUNCTION save_activity_response(
    p_user_id UUID,
    p_journey_id UUID,
    p_day INTEGER,
    p_activity_id TEXT,
    p_response JSONB
) RETURNS void AS $$
BEGIN
    INSERT INTO activity_responses (
        user_id,
        journey_id,
        day,
        activity_id,
        question_id,
        answer,
        answered_by
    ) VALUES (
        p_user_id,
        p_journey_id,
        p_day,
        p_activity_id,
        p_response->>'questionId',
        p_response->>'answer',
        p_response->>'answeredBy'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 