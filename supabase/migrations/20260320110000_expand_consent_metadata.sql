ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS consent_source text;

UPDATE profiles
SET
  consent_version = COALESCE(consent_version, '2026-03-20'),
  consent_source = COALESCE(consent_source, 'legacy_registration')
WHERE consent_given_at IS NOT NULL;
