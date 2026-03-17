CREATE TABLE IF NOT EXISTS graduation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  what_i_learned text NOT NULL,
  biggest_growth text NOT NULL,
  relationship_superpower text NOT NULL,
  focus_next text NOT NULL,
  recommended_track text,
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE graduation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own graduation report"
  ON graduation_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own graduation report"
  ON graduation_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
