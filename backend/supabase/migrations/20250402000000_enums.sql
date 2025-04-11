-- Create enums for various types, ensuring they are only created if they don't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'partner');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
        CREATE TYPE public.relationship_type AS ENUM ('monogamous', 'polyamorous', 'lgbtq', 'long-distance');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journey_type') THEN
        CREATE TYPE public.journey_type AS ENUM ('communication', 'intimacy', 'trust', 'growth', 'conflict');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'platinum');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE public.gender AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_modality') THEN
        CREATE TYPE public.question_modality AS ENUM ('reflection', 'discussion', 'activity');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'love_language') THEN
        CREATE TYPE public.love_language AS ENUM (
          'words-of-affirmation',
          'acts-of-service',
          'receiving-gifts',
          'quality-time',
          'physical-touch'
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE public.event_status AS ENUM ('planned', 'completed', 'cancelled');
    END IF;
END$$;