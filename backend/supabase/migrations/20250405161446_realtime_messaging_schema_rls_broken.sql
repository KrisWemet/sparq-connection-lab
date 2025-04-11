-- Create the conversations table with correct RLS setup
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_b UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add generated columns for LEAST and GREATEST
ALTER TABLE conversations
ADD COLUMN participant_a_lower UUID GENERATED ALWAYS AS (LEAST(participant_a, participant_b)) STORED,
ADD COLUMN participant_b_higher UUID GENERATED ALWAYS AS (GREATEST(participant_a, participant_b)) STORED;

-- Create the unique index using the generated columns
CREATE UNIQUE INDEX unique_conversation_participants
ON conversations (participant_a_lower, participant_b_higher);

-- Set up row level security policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for participants"
ON conversations
FOR SELECT
USING (
    participant_a = auth.uid() OR participant_b = auth.uid()
);

CREATE POLICY "Allow insert for participants"
ON conversations
FOR INSERT
WITH CHECK (
    participant_a = auth.uid() OR participant_b = auth.uid()
);