-- Add onboarding-related columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_range              text,
  ADD COLUMN IF NOT EXISTS pronouns               text,
  ADD COLUMN IF NOT EXISTS psychological_profile  jsonb;
