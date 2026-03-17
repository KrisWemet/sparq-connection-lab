CREATE TABLE IF NOT EXISTS partner_syntheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index integer NOT NULL,
  synthesis text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_a_id, user_b_id, day_index)
);

ALTER TABLE partner_syntheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read syntheses they are part of"
  ON partner_syntheses FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Service role can insert partner syntheses"
  ON partner_syntheses FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
