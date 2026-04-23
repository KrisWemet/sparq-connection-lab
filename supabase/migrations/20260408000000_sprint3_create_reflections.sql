CREATE TABLE reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prime_type text NOT NULL DEFAULT 'neutral_observer_reflection',
  screen_1_response text,   -- AES-256-GCM encrypted: base64(iv):base64(ciphertext):base64(tag)
  screen_2_response text,
  screen_3_response text,
  shared_with_partner boolean DEFAULT false,
  trigger_source text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_created_at ON reflections(created_at DESC);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY reflections_select_own ON reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY reflections_insert_own ON reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY reflections_update_own ON reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY reflections_delete_own ON reflections
  FOR DELETE USING (auth.uid() = user_id);
