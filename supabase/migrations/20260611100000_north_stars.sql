-- North Star (Phase B): ideal-self capture via adaptive values laddering.
-- Spec: docs/superpowers/specs/2026-06-11-north-star-ideal-self-design.md §3.
-- History accumulates (no unique user_id); at most one non-retired row enforced in code.

CREATE TABLE IF NOT EXISTS north_stars (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'seeded'
                    CHECK (status IN ('seeded', 'laddering', 'active', 'retired', 'declined')),
  seed_text       text,
  line            text,
  proposed_line   text,
  ladder_transcript jsonb NOT NULL DEFAULT '[]',
  attempt_count   int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  confirmed_at    timestamptz,
  reaffirmed_at   timestamptz,
  needs_reladder  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS north_stars_user_status ON north_stars (user_id, status);
ALTER TABLE north_stars ENABLE ROW LEVEL SECURITY;
CREATE POLICY north_stars_own ON north_stars
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
