-- Migration: Create tables for the Path to Together Journeys feature

-- Enable UUID generation if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Supabase usually has this enabled

BEGIN;

-- Table: journeys
-- Stores the definition of each available journey program.
DROP TABLE IF EXISTS public.journeys CASCADE; -- Drop the table first to ensure a clean state
CREATE TABLE IF NOT EXISTS public.journeys (
    id TEXT PRIMARY KEY, -- Using TEXT based on examples like "communication-mastery"
    title TEXT NOT NULL,
    description TEXT,
    estimated_duration_days INT NOT NULL,
    theme TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.journeys IS 'Defines the available journey programs.';
COMMENT ON COLUMN public.journeys.id IS 'Unique identifier for the journey (e.g., "communication-mastery").';
COMMENT ON COLUMN public.journeys.estimated_duration_days IS 'Approximate number of days the journey takes.';
COMMENT ON COLUMN public.journeys.theme IS 'Categorical theme of the journey (e.g., Communication, Intimacy).';

-- Table: journey_days
-- Stores the definition of each day within a specific journey.
DROP TABLE IF EXISTS public.journey_days CASCADE; -- Add CASCADE to drop dependent objects if they exist
CREATE TABLE IF NOT EXISTS public.journey_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id TEXT NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title TEXT NOT NULL,
    reflection_prompt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (journey_id, day_number) -- Ensure day numbers are unique within a journey
);

COMMENT ON TABLE public.journey_days IS 'Defines the content structure for each day within a journey.';
COMMENT ON COLUMN public.journey_days.journey_id IS 'Foreign key referencing the journey this day belongs to.';
COMMENT ON COLUMN public.journey_days.day_number IS 'Sequential number of the day within the journey (1, 2, 3...).';
COMMENT ON COLUMN public.journey_days.reflection_prompt IS 'The reflection prompt for this specific day.';

-- Table: journey_day_content_blocks
-- Stores individual content blocks (text, video, etc.) for each journey day.
DROP TABLE IF EXISTS public.journey_day_content_blocks CASCADE;
CREATE TABLE IF NOT EXISTS public.journey_day_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_day_id UUID NOT NULL REFERENCES public.journey_days(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'video', 'exercise', 'link')),
    value TEXT NOT NULL,
    "order" INT NOT NULL, -- Using quotes as "order" is a reserved keyword
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.journey_day_content_blocks IS 'Stores individual content blocks for a journey day.';
COMMENT ON COLUMN public.journey_day_content_blocks.journey_day_id IS 'Foreign key referencing the journey day this content belongs to.';
COMMENT ON COLUMN public.journey_day_content_blocks.type IS 'Type of content block (text, video, exercise, link).';
COMMENT ON COLUMN public.journey_day_content_blocks.value IS 'Content value (text, URL, description).';
COMMENT ON COLUMN public.journey_day_content_blocks."order" IS 'Order in which content blocks appear for the day.';

-- Table: journey_day_activities
-- Stores the optional activity associated with a journey day.
DROP TABLE IF EXISTS public.journey_day_activities CASCADE;
CREATE TABLE IF NOT EXISTS public.journey_day_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_day_id UUID NOT NULL REFERENCES public.journey_days(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('quiz', 'discussion', 'action')),
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (journey_day_id) -- Assuming only one optional activity per day
);

COMMENT ON TABLE public.journey_day_activities IS 'Stores the optional activity for a journey day.';
COMMENT ON COLUMN public.journey_day_activities.journey_day_id IS 'Foreign key referencing the journey day this activity belongs to.';
COMMENT ON COLUMN public.journey_day_activities.type IS 'Type of activity (quiz, discussion, action).';
COMMENT ON COLUMN public.journey_day_activities.details IS 'Description or instructions for the activity.';

-- Table: user_relationships
-- Stores the link between a user and their partner (if any).
CREATE TABLE IF NOT EXISTS public.user_relationships (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow partner removal/unlinking
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (user_id <> partner_id) -- Ensure user cannot be their own partner
);

COMMENT ON TABLE public.user_relationships IS 'Links users to their partners for features like reflection sharing.';
COMMENT ON COLUMN public.user_relationships.user_id IS 'The user initiating or owning the relationship link.';
COMMENT ON COLUMN public.user_relationships.partner_id IS 'The linked partner''s user ID.';

-- Table: user_journey_progress
-- Tracks the progress of a specific user through a specific journey.
DROP TABLE IF EXISTS public.user_journey_progress CASCADE;
CREATE TABLE IF NOT EXISTS public.user_journey_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id TEXT NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
    current_day INT NOT NULL DEFAULT 1,
    completed_days INT[] NOT NULL DEFAULT '{}', -- Array of completed day numbers
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_accessed_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, journey_id) -- Ensure a user has only one progress record per journey
);

COMMENT ON TABLE public.user_journey_progress IS 'Tracks individual user progress through journeys.';
COMMENT ON COLUMN public.user_journey_progress.user_id IS 'Foreign key referencing the user.';
COMMENT ON COLUMN public.user_journey_progress.journey_id IS 'Foreign key referencing the journey being tracked.';
COMMENT ON COLUMN public.user_journey_progress.current_day IS 'The highest day number the user has accessed or unlocked.';
COMMENT ON COLUMN public.user_journey_progress.completed_days IS 'Array storing the numbers of the days marked as complete.';
COMMENT ON COLUMN public.user_journey_progress.start_date IS 'Timestamp when the user started the journey.';
COMMENT ON COLUMN public.user_journey_progress.last_accessed_date IS 'Timestamp when the user last interacted with the journey.';

-- Table: user_reflections
-- Stores user reflections submitted for specific journey days.
DROP TABLE IF EXISTS public.user_reflections CASCADE;
CREATE TABLE IF NOT EXISTS public.user_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_journey_progress_id UUID NOT NULL REFERENCES public.user_journey_progress(id) ON DELETE CASCADE,
    journey_day_id UUID NOT NULL REFERENCES public.journey_days(id) ON DELETE CASCADE, -- Link to the specific day definition
    response_text TEXT,
    shared_with_partner BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- Corresponds to 'timestamp' in spec
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_journey_progress_id, journey_day_id) -- One reflection per user per day instance
);

COMMENT ON TABLE public.user_reflections IS 'Stores user reflections for specific days within their journey progress.';
COMMENT ON COLUMN public.user_reflections.user_journey_progress_id IS 'Foreign key referencing the user''s specific journey progress record.';
COMMENT ON COLUMN public.user_reflections.journey_day_id IS 'Foreign key referencing the specific journey day this reflection is for.';
COMMENT ON COLUMN public.user_reflections.response_text IS 'The text content of the user''s reflection.';
COMMENT ON COLUMN public.user_reflections.shared_with_partner IS 'Flag indicating if the reflection is shared with the linked partner.';
COMMENT ON COLUMN public.user_reflections.created_at IS 'Timestamp when the reflection was first saved.';
COMMENT ON COLUMN public.user_reflections.updated_at IS 'Timestamp when the reflection was last updated.';

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_journey_days_journey_id ON public.journey_days(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_day_content_blocks_journey_day_id ON public.journey_day_content_blocks(journey_day_id);
CREATE INDEX IF NOT EXISTS idx_journey_day_activities_journey_day_id ON public.journey_day_activities(journey_day_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_partner_id ON public.user_relationships(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user_id ON public.user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_journey_id ON public.user_journey_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_user_journey_progress_id ON public.user_reflections(user_journey_progress_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_journey_day_id ON public.user_reflections(journey_day_id);

COMMIT;