-- supabase_schema_rls.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types (Assuming these might exist or be needed)
-- Referencing environment_details, assuming 'message_type' and 'message_status'
-- are defined in supabase/migrations/20250402_enums.sql or similar.
-- If not, uncomment and define them here:
-- CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');
-- CREATE TYPE message_status AS ENUM ('Sending', 'Sent', 'Delivered', 'Read', 'Failed');

-- Table: conversations
-- Stores metadata about each chat conversation between two users.
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- participant_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Consider if direct FK to auth.users is desired/allowed
    -- participant_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Or use profiles table if that exists
    participant_a UUID NOT NULL, -- Assuming FKs will be added later or managed at app level/via profiles
    participant_b UUID NOT NULL,
    last_message_id UUID, -- Reference to the latest message (can be FK later)
    unread_count_a INT DEFAULT 0 NOT NULL,
    unread_count_b INT DEFAULT 0 NOT NULL,
    -- Ensures a unique conversation per pair, regardless of order
    CONSTRAINT unique_conversation_pair UNIQUE (LEAST(participant_a, participant_b), GREATEST(participant_a, participant_b))
);

-- Indexes for conversations
CREATE INDEX idx_conversations_participant_a ON conversations(participant_a);
CREATE INDEX idx_conversations_participant_b ON conversations(participant_b);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Table: messages
-- Stores individual messages within conversations.
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID NOT NULL, -- REFERENCES auth.users(id) ON DELETE SET NULL, -- Or profiles
    recipient_id UUID NOT NULL, -- REFERENCES auth.users(id) ON DELETE SET NULL, -- Or profiles
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    message_type message_type NOT NULL DEFAULT 'TEXT',
    -- Encrypted content using Signal Protocol (CiphertextMessage)
    -- For TEXT: Contains the encrypted text payload.
    -- For IMAGE: Contains metadata like encrypted filename, type, size, and the Supabase Storage path to the encrypted blob.
    encrypted_content TEXT NOT NULL, -- Using TEXT for Base64 encoded binary data
    -- Status tracking for the message (sender's perspective initially)
    status message_status NOT NULL DEFAULT 'Sending',
    -- Optional: Store the Signal message type (PreKeyWhisperMessage vs WhisperMessage) if needed for decryption logic
    signal_message_type SMALLINT -- 1 for PreKeyWhisperMessage, 3 for WhisperMessage
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_status ON messages(status); -- If querying by status is common

-- Table: e2ee_keys
-- Stores public key bundles required for Signal Protocol.
CREATE TABLE e2ee_keys (
    user_id UUID PRIMARY KEY NOT NULL, -- REFERENCES auth.users(id) ON DELETE CASCADE, -- Or profiles
    -- Identity Key (Public) - Curve25519
    identity_key BYTEA NOT NULL,
    -- Signed PreKey (Public) - Curve25519
    signed_prekey_id INT NOT NULL,
    signed_prekey_public BYTEA NOT NULL,
    signed_prekey_signature BYTEA NOT NULL,
    -- One-Time PreKeys (Public) - Curve25519 - Stored as JSONB for flexibility
    -- Format: { "key_id_1": "base64_encoded_public_key_1", "key_id_2": "..." }
    one_time_prekeys JSONB NOT NULL,
    -- Registration ID (typically a random integer)
    registration_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_keys UNIQUE (user_id)
);

-- Indexes for e2ee_keys
-- Primary key index is created automatically.

-- RLS Policies --
-- Assumes helper function `auth.uid()` returns the current user's ID.

-- Enable RLS for all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE e2ee_keys ENABLE ROW LEVEL SECURITY;

-- Policies for 'conversations' table
CREATE POLICY "Allow read access to own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Allow insert access for participants"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);
    -- Note: Need server-side logic or trigger to ensure both participants exist and maybe consent.

CREATE POLICY "Allow update access for participants (e.g., unread count)"
    ON conversations FOR UPDATE
    USING (auth.uid() = participant_a OR auth.uid() = participant_b)
    WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);
    -- Be specific about which columns can be updated by whom if needed.

-- Policies for 'messages' table
CREATE POLICY "Allow read access to messages in own conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE auth.uid() = participant_a OR auth.uid() = participant_b
        )
    );

CREATE POLICY "Allow insert access for sender"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id AND conversation_id IN (SELECT id FROM conversations WHERE auth.uid() = participant_a OR auth.uid() = participant_b));

CREATE POLICY "Allow update access for status changes (complex)"
    ON messages FOR UPDATE
    USING (
        -- Allow sender to update status (e.g., Sending -> Sent)
        (auth.uid() = sender_id) OR
        -- Allow recipient to update status (e.g., Delivered, Read)
        (auth.uid() = recipient_id)
    )
    WITH CHECK (
        -- Define specific allowed transitions if necessary
        (auth.uid() = sender_id AND status IN ('Sending', 'Sent', 'Failed')) OR
        (auth.uid() = recipient_id AND status IN ('Delivered', 'Read'))
    );
    -- Note: Status updates might be better handled via Realtime broadcasts + client-side logic
    -- or dedicated functions to prevent race conditions / invalid updates.

-- Policies for 'e2ee_keys' table
CREATE POLICY "Allow read access to anyone's public keys"
    ON e2ee_keys FOR SELECT
    USING (true); -- Public keys need to be fetchable by anyone starting a chat.

CREATE POLICY "Allow insert access for own keys"
    ON e2ee_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update access for own keys"
    ON e2ee_keys FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete access for own keys (e.g., account deletion)"
    ON e2ee_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at timestamps (Example for one table)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conversations_timestamp
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_messages_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_e2ee_keys_timestamp
BEFORE UPDATE ON e2ee_keys
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();