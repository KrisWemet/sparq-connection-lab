-- Create enums for various types
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'partner');
CREATE TYPE public.relationship_type AS ENUM ('monogamous', 'polyamorous', 'lgbtq', 'long-distance');
CREATE TYPE public.journey_type AS ENUM ('communication', 'intimacy', 'trust', 'growth', 'conflict');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'platinum');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE public.question_modality AS ENUM ('reflection', 'discussion', 'activity');
CREATE TYPE public.love_language AS ENUM (
  'words-of-affirmation',
  'acts-of-service',
  'receiving-gifts',
  'quality-time',
  'physical-touch'
);

CREATE TYPE public.event_status AS ENUM ('planned', 'completed', 'cancelled');