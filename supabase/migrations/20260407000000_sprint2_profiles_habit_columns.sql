-- Sprint 2 Architectural Upgrades: Add habit anchor and neutral observer columns to profiles
--
-- habit_anchors: array of user-defined anchor moments (e.g. 'morning coffee', 'after gym')
--   Used by the daily session copy to ground the micro-action in a real-life moment.
--   Stored as text[] so multiple anchors can be set.
--
-- next_neutral_observer_due: timestamp for the next scheduled Neutral Observer Reflection
--   (Finkel et al. 2013). Set to now() + 90 days on reflection completion. NULL = not yet set.
--
-- onboarding_anchor_set_at: records when the user completed the habit anchor onboarding screen.
--   Used to determine whether to show the anchor prompt on first launch.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'habit_anchors'
  ) THEN
    ALTER TABLE profiles ADD COLUMN habit_anchors text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'next_neutral_observer_due'
  ) THEN
    ALTER TABLE profiles ADD COLUMN next_neutral_observer_due timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_anchor_set_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_anchor_set_at timestamptz;
  END IF;
END $$;
