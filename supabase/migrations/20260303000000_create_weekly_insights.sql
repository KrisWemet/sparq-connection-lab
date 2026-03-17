CREATE TABLE IF NOT EXISTS weekly_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  patterns jsonb NOT NULL DEFAULT '[]',
  growth_edge text NOT NULL,
  strength text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own weekly insights"
  ON weekly_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly insights"
  ON weekly_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);
