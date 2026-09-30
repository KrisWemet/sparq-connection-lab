-- Insight Profile, user-set part (constitution v1.1 §3 Insight Profile,
-- §5A Liking; docs/PERSON_MODEL.md §8.1). How the user says they like Peter
-- to talk with them — their own settings, never inferred. Peter follows them.
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS conversation_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;
