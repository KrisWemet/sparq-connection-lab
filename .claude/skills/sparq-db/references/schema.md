# Sparq Connection — Complete Database Schema Reference

This file contains every table definition from `supabase/schema.sql` and the 11 real migrations.

---

## Enums

```sql
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'partner');
CREATE TYPE public.relationship_type AS ENUM ('monogamous', 'polyamorous', 'lgbtq', 'long-distance');
CREATE TYPE public.journey_type AS ENUM ('communication', 'intimacy', 'trust', 'growth', 'conflict');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'platinum');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE public.question_modality AS ENUM ('reflection', 'discussion', 'activity');
CREATE TYPE public.love_language AS ENUM (
  'words-of-affirmation', 'acts-of-service', 'receiving-gifts',
  'quality-time', 'physical-touch'
);
```

---

## Base Schema (from `supabase/schema.sql`)

### profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  gender public.gender DEFAULT 'prefer-not-to-say',
  relationship_type public.relationship_type DEFAULT 'monogamous',
  avatar_url TEXT,
  partner_id UUID REFERENCES public.profiles(id),
  subscription_tier public.subscription_tier DEFAULT 'free',
  subscription_expiry TIMESTAMPTZ,
  is_onboarded BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT now(),
  consent_given_at TIMESTAMPTZ,                    -- Added by migration 20260315
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### user_roles
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

### partner_invitations
```sql
CREATE TABLE public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
```

### journeys
```sql
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type public.journey_type NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  estimated_days INTEGER,
  premium_only BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### journey_questions
```sql
CREATE TABLE public.journey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  modality public.question_modality DEFAULT 'reflection',
  love_language public.love_language,
  sequence_number INTEGER NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### user_journeys
```sql
CREATE TABLE public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, journey_id)
);
```

### journey_responses
```sql
CREATE TABLE public.journey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.journey_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);
```

### goals
```sql
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### goal_milestones
```sql
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### daily_questions
```sql
CREATE TABLE public.daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT,
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### daily_question_responses
```sql
CREATE TABLE public.daily_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id, created_at::date)
);
```

### date_ideas
```sql
CREATE TABLE public.date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cost_level INTEGER DEFAULT 1,
  time_required INTEGER,  -- in minutes
  at_home BOOLEAN DEFAULT false,
  outdoor BOOLEAN DEFAULT false,
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### user_date_ideas
```sql
CREATE TABLE public.user_date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_idea_id UUID NOT NULL REFERENCES public.date_ideas(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  scheduled_for DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date_idea_id)
);
```

### user_activities
```sql
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  details JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### system_settings
```sql
CREATE TABLE public.system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
```

---

## Migration-Added Tables

### daily_sessions (migration 20260301 + 20260302)
```sql
-- Base table created externally, then extended by migrations:
-- Columns as of latest migration state:
CREATE TABLE public.daily_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_local_date DATE,
  timezone TEXT,
  day_index INTEGER,
  status TEXT,                       -- 'morning_ready' | 'morning_viewed' | 'evening_ready' | 'completed'
  morning_story TEXT,
  morning_action TEXT,
  morning_viewed_at TIMESTAMPTZ,
  evening_reflection TEXT,
  evening_peter_response TEXT,
  evening_completed_at TIMESTAMPTZ,
  completed_local_date DATE,
  idempotency_key TEXT,
  is_locked_for_pause BOOLEAN DEFAULT false,   -- Added by migration 20260302213613
  pause_expires_at TIMESTAMPTZ,                -- Added by migration 20260302213613
  active_track TEXT DEFAULT 'communication',   -- Added by migration 20260318000001 (Phase 4: post-day-14 content routing + XP award target)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_local_date)
);

-- Partial index for fast "latest completed day" lookups
CREATE INDEX daily_sessions_user_completed_idx
  ON daily_sessions (user_id, day_index DESC) WHERE status = 'completed';
```

### user_preferences (migration 20260302120000)
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  insights_visible BOOLEAN NOT NULL DEFAULT true,
  personalization_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_memory_mode TEXT NOT NULL DEFAULT 'rolling_90_days',
  relationship_mode TEXT NOT NULL DEFAULT 'solo',
  memory_window TEXT NOT NULL DEFAULT 'indefinite',
  reminder_time TEXT,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT,
  updated_at TIMESTAMPTZ
);
```

### conflict_episodes (migration 20260302120000)
```sql
CREATE TABLE conflict_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity INTEGER NOT NULL DEFAULT 3,
  tool_used TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  repair_duration_minutes NUMERIC,
  resolution_method TEXT,
  updated_at TIMESTAMPTZ
);
```

### outcome_assessments (migration 20260302120000)
```sql
CREATE TABLE outcome_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]',
  total_score NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### analytics_events (migration 20260302120000)
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_props JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_event_name_idx ON analytics_events (event_name, created_at);
```

### vulnerability_escrow (migration 20260302213828)
```sql
CREATE TABLE vulnerability_escrow (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_id UUID NOT NULL,
  prompt_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_response TEXT NOT NULL,
  partner_response TEXT,
  is_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  unlocked_at TIMESTAMPTZ,
  UNIQUE(couple_id, prompt_id, user_id)
);
```

### weekly_insights (migration 20260303000000)
```sql
CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  patterns JSONB NOT NULL DEFAULT '[]',
  growth_edge TEXT NOT NULL,
  strength TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);
```

### partner_syntheses (migration 20260303000001)
```sql
CREATE TABLE partner_syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  synthesis TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a_id, user_b_id, day_index)
);
```

### graduation_reports (migration 20260303000002)
```sql
CREATE TABLE graduation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  what_i_learned TEXT NOT NULL,
  biggest_growth TEXT NOT NULL,
  relationship_superpower TEXT NOT NULL,
  focus_next TEXT NOT NULL,
  recommended_track TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### user_skill_tracks (migration 20260303000003)
```sql
CREATE TABLE user_skill_tracks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_key TEXT NOT NULL,       -- 'communication' | 'conflict_repair' | 'emotional_intimacy' | 'trust_security' | 'shared_vision'
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'basic',  -- 'basic' | 'advanced' | 'expert'
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, track_key)
);
```

### user_entitlements (migration 20260315000000)
```sql
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  loop_limit_per_week INT,
  coach_message_limit_per_day INT,
  starter_quests_limit INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
```

---

## Functions & Triggers

### is_admin()
```sql
CREATE FUNCTION public.is_admin(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'::public.user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### trigger_set_updated_at()
```sql
CREATE FUNCTION public.trigger_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: profiles, partner_invitations, goals, system_settings
```

### match_memories() (migration 20260318000001)
```sql
-- Vector similarity search for Peter's memory retrieval.
-- Called by src/lib/server/memory.ts → searchMemories() via supabase.rpc('match_memories', {...})
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),   -- embedding of the search query
  match_user_id UUID,             -- scope to this user's memories
  match_count INT DEFAULT 5       -- max results to return
)
RETURNS TABLE (
  id UUID,
  memory TEXT,
  metadata JSONB,
  similarity FLOAT                -- cosine similarity (1.0 = identical, 0.0 = orthogonal)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.memory,
    m.metadata,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
    AND m.embedding IS NOT NULL
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### award_skill_xp()
```sql
CREATE FUNCTION award_skill_xp(p_user_id UUID, p_track TEXT, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  new_level TEXT;
BEGIN
  SELECT total_xp INTO current_xp
  FROM user_skill_tracks
  WHERE user_id = p_user_id AND track_key = p_track;

  IF current_xp IS NULL THEN current_xp := 0; END IF;
  new_xp := current_xp + p_xp;

  -- Level thresholds: Basic (0), Advanced (100), Expert (300)
  IF new_xp >= 300 THEN new_level := 'expert';
  ELSIF new_xp >= 100 THEN new_level := 'advanced';
  ELSE new_level := 'basic';
  END IF;

  INSERT INTO user_skill_tracks (user_id, track_key, total_xp, current_level, last_activity_at)
  VALUES (p_user_id, p_track, new_xp, new_level, now())
  ON CONFLICT (user_id, track_key)
  DO UPDATE SET total_xp = EXCLUDED.total_xp,
                current_level = EXCLUDED.current_level,
                last_activity_at = EXCLUDED.last_activity_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Indexes (22 total from base schema)

```sql
CREATE INDEX idx_profiles_partner_id ON profiles(partner_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_partner_invitations_sender_id ON partner_invitations(sender_id);
CREATE INDEX idx_partner_invitations_recipient_email ON partner_invitations(recipient_email);
CREATE INDEX idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX idx_user_journeys_journey_id ON user_journeys(journey_id);
CREATE INDEX idx_journey_questions_journey_id ON journey_questions(journey_id);
CREATE INDEX idx_journey_responses_user_id ON journey_responses(user_id);
CREATE INDEX idx_journey_responses_journey_id ON journey_responses(journey_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_daily_question_responses_user_id ON daily_question_responses(user_id);
CREATE INDEX idx_user_date_ideas_user_id ON user_date_ideas(user_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);

-- From migrations:
CREATE INDEX daily_sessions_user_completed_idx ON daily_sessions (user_id, day_index DESC) WHERE status = 'completed';
CREATE INDEX analytics_events_event_name_idx ON analytics_events (event_name, created_at);
CREATE INDEX memories_user_id_idx ON memories(user_id);
-- Deferred: memories_embedding_idx (ivfflat, requires existing rows)
```

---

## Migration History

| File | Real SQL? | Purpose |
|---|---|---|
| 20240304000000_remote_placeholder.sql | No | Empty placeholder |
| 20240304000001_remote_placeholder.sql | No | Empty placeholder |
| 20240304000002_remote_placeholder.sql | No | Empty placeholder |
| 20240305_remote_placeholder.sql | No | Empty placeholder |
| 20240320000000_remote_placeholder.sql | No | Empty placeholder |
| 20240322000000_remote_placeholder.sql | No | Empty placeholder |
| 20260225000000_remote_placeholder.sql | No | Empty placeholder |
| 20260225000001_remote_placeholder.sql | No | Empty placeholder |
| 20260226000000_remote_placeholder.sql | No | Empty placeholder |
| 20260226000001_remote_placeholder.sql | No | Empty placeholder |
| 20260226010000_remote_placeholder.sql | No | Empty placeholder |
| 20260226011000_remote_placeholder.sql | No | Empty placeholder |
| 20260227000000_remote_placeholder.sql | No | Empty placeholder |
| 20260227000001_remote_placeholder.sql | No | Empty placeholder |
| 20260227010000_remote_placeholder.sql | No | Empty placeholder |
| **20260301091500** | **Yes** | Enforce daily_session uniqueness (user_id, session_local_date) |
| **20260302113000** | **Yes** | Align daily_sessions with API contract (add columns, backfill) |
| **20260302120000** | **Yes** | Create 4 missing tables (outcome_assessments, conflict_episodes, user_preferences, analytics_events) |
| **20260302213613** | **Yes** | Add forced pause columns to daily_sessions |
| **20260302213828** | **Yes** | Create vulnerability_escrow table |
| **20260303000000** | **Yes** | Create weekly_insights table |
| **20260303000001** | **Yes** | Create partner_syntheses table |
| **20260303000002** | **Yes** | Create graduation_reports table |
| **20260303000003** | **Yes** | Add XP system: user_skill_tracks + award_skill_xp() RPC |
| **20260315000000** | **Yes** | Add consent_given_at to profiles + user_entitlements table |
| **20260318000000** | **Yes** | Drop legacy memories table, recreate with pgvector embedding column |
| **20260318000001** | **Yes** | Create match_memories() RPC + add active_track to daily_sessions |

---

## Tables Created Directly on Remote (No Migration File)

These tables exist in the live database and are actively used by the codebase, but have no local migration file. They were created directly on the Supabase remote database.

### profile_traits
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Inferred psychological traits, updated after each evening reflection
-- Source: SPARQ_MASTER_SPEC.md §6 "Profile Intelligence" + src/lib/server/profile-analysis.ts
CREATE TABLE profile_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trait_key TEXT NOT NULL,               -- 'attachment_style' | 'love_language' | 'conflict_style'
  inferred_value TEXT NOT NULL,          -- e.g., 'anxious', 'words', 'avoidant'
  confidence NUMERIC(3,2) DEFAULT 0.3,  -- 0.0 to 1.0 (grows/shrinks with repeated analysis)
  effective_weight NUMERIC(3,2) DEFAULT 1.0, -- adjusted by user feedback
  user_feedback TEXT,                    -- 'yes' | 'not_really' | 'unsure'
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, trait_key)
);

-- NOTE: src/pages/api/profile/snapshot.ts selects 'trait_value' and 'confidence_score'
-- which may be column aliases or a schema variant. The canonical column names used by
-- profile-analysis.ts, chat.ts, morning.ts, graduation-report.ts, and patterns.ts are
-- 'inferred_value' and 'confidence' as shown above.
```

**Usage in codebase:**
- Written by: `src/lib/server/profile-analysis.ts` (fire-and-forget after evening completion)
- Read by: `src/pages/api/profile/traits.ts` (GET), `src/pages/api/peter/chat.ts`, `src/pages/api/peter/morning.ts`, `src/pages/api/me/graduation-report.ts`, `src/pages/api/me/patterns.ts`, `src/pages/api/profile/snapshot.ts`, `src/pages/api/admin/beta-testers.ts`
- Updated by: `src/pages/api/profile/traits.ts` (PATCH — user feedback adjusts effective_weight)

### user_insights
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Aggregate user insights: onboarding progress cursor, skill tree gate, emotional state
-- Source: SPARQ_MASTER_SPEC.md §6 "Profile Intelligence" + session start/complete APIs
CREATE TABLE user_insights (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attachment_style TEXT,
  love_language TEXT,
  conflict_style TEXT,
  emotional_state TEXT,                   -- 'thriving' | 'neutral' | 'struggling' (set by profile analysis)
  onboarding_day INTEGER DEFAULT 1,      -- next-day cursor (e.g., 3 means Day 2 completed)
  skill_tree_unlocked BOOLEAN DEFAULT false, -- set true when onboarding_day >= 15
  onboarding_completed_at TIMESTAMPTZ,   -- set when Day 14 completed
  last_analysis_at TIMESTAMPTZ
);
```

**Usage in codebase:**
- Upserted by: `src/pages/api/daily/session/start.ts` (sync onboarding_day), `src/pages/api/daily/session/complete.ts` (advance day cursor, unlock skill tree)
- Updated by: `src/lib/server/profile-analysis.ts` (emotional_state + last_analysis_at)
- Read by: `src/pages/api/daily/session/start.ts` (day cursor), `src/pages/api/daily/session/complete.ts` (guard against double-advance), `src/pages/api/profile/snapshot.ts` (progress + legacy trait display), `src/pages/api/admin/beta-testers.ts` (onboarding_day per user), `src/lib/server/relationship-score.ts` (emotional_state for safety score), `e2e/helpers/mock-supabase.ts` (mocked in E2E tests)
- Frontend reads: `src/pages/daily-growth.tsx`, `src/pages/skill-tree.tsx`, `src/pages/onboarding-flow.tsx`

### daily_entries
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Mirror/cache of completed session data for efficient querying
-- Source: SPARQ_MASTER_SPEC.md §6 + session start/complete/morning-viewed APIs
CREATE TABLE daily_entries (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  morning_story TEXT,
  morning_action TEXT,
  morning_viewed_at TIMESTAMPTZ,
  evening_reflection TEXT,
  evening_peter_response TEXT,
  evening_completed_at TIMESTAMPTZ,
  UNIQUE(user_id, day)
);
```

**Usage in codebase:**
- Upserted by: `src/pages/api/daily/session/start.ts` (morning_story + morning_action), `src/pages/api/daily/session/morning-viewed.ts` (morning_viewed_at), `src/pages/api/daily/session/complete.ts` (full evening data), `src/pages/api/peter/morning.ts` (morning story cache)
- Read by: `src/pages/api/peter/morning.ts` (idempotent guard — reuse existing morning story), `src/pages/daily-growth.tsx`, `e2e/helpers/mock-supabase.ts` (mocked in E2E tests)

### relationship_scores
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Relationship OS Score snapshots (composite 0-100 score, updated on demand)
-- Source: SPARQ_MASTER_SPEC.md §8.10 + src/lib/server/relationship-score.ts
CREATE TABLE relationship_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2),
  communication_quality NUMERIC(5,2),
  repair_speed NUMERIC(5,2),
  emotional_safety NUMERIC(5,2),
  ritual_consistency NUMERIC(5,2),
  computed_at TIMESTAMPTZ DEFAULT now()
);
```

**Usage in codebase:**
- Inserted by: `src/pages/api/me/relationship-score.ts` (stores snapshot after computation)
- Read by: `src/pages/api/me/relationship-score.ts` (12-week history), `src/pages/api/admin/kpis.ts` (avg score across all users)
- Computed by: `src/lib/server/relationship-score.ts` (weighted formula from daily_sessions, coach_usage_daily, conflict_episodes, user_insights, safety_events)

### safety_events
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Safety/crisis event audit log (for compliance and safety monitoring)
-- Source: SPARQ_MASTER_SPEC.md §11 "Safety" + src/pages/api/peter/chat.ts
CREATE TABLE safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crisis_types TEXT[],                   -- array of detected crisis categories
  matched_terms TEXT[],                  -- keywords/phrases that triggered detection
  country_code TEXT,                     -- user's country for localized resources
  metadata JSONB,                        -- e.g., { source: 'api/peter/chat' }
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Usage in codebase:**
- Inserted by: `src/pages/api/peter/chat.ts` (fire-and-forget when `detectCrisisIntent()` triggers)
- Read by: `src/lib/server/relationship-score.ts` (safety_events in last 30 days penalize emotional_safety sub-score)

### coach_usage_daily
```sql
-- EXISTING — discovered from codebase, no migration file found
-- Rate limiting for Peter coach messages per day
-- Source: SPARQ_MASTER_SPEC.md §13 + src/pages/api/peter/chat.ts
CREATE TABLE coach_usage_daily (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, usage_date)
);
```

**Usage in codebase:**
- Upserted by: `src/pages/api/peter/chat.ts` (increments message_count after each Peter response, `onConflict: 'user_id,usage_date'`)
- Read by: `src/pages/api/peter/chat.ts` (check usage against `coach_message_limit_per_day` entitlement), `src/lib/server/relationship-score.ts` (coach engagement factor in communication_quality sub-score)

### memories (migration 20260318000000)
```sql
-- Persistent vector-backed memory storage for Peter's long-term recall.
-- Replaces the old in-memory Map stub in src/lib/server/memory.ts.
--
-- IMPORTANT: pgvector is installed in the PUBLIC schema on this project (not extensions).
-- Always reference the vector type as `vector(1536)`, never `extensions.vector(1536)`.
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory TEXT NOT NULL,                     -- concatenated conversation text (role: content\n...)
  metadata JSONB DEFAULT '{}',             -- e.g. { source: 'evening_reflection' }
  embedding vector(1536),                  -- OpenAI text-embedding-3-small (1536 dimensions)
  expires_at TIMESTAMPTZ,                  -- null = indefinite; set for 90-day memory window users
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX memories_user_id_idx ON memories(user_id);
-- Note: ivfflat index requires existing rows to build lists.
-- Add after sufficient data: CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Usage in codebase:**
- Inserted by: `src/lib/server/memory.ts` → `addMemory()` (called from `src/lib/server/profile-analysis.ts` after evening reflection)
- Searched by: `src/lib/server/memory.ts` → `searchMemories()` (vector similarity via `match_memories` RPC, fallback to recency)
- Read by: `src/lib/server/memory.ts` → `getRecentMemories()` (recency-ordered, filters expired)
- Deleted by: `src/lib/server/memory.ts` → `deleteUserMemories()` (Trust Center "delete all" action)
- Memory.ts uses a **service-role Supabase client** (bypasses RLS) — requires `SUPABASE_SERVICE_ROLE_KEY` env var

**pgvector note:** The `vector` extension is v0.8.0 in the `public` schema. Do NOT use `extensions.vector()` in migrations or function signatures — use `vector()` directly.

---

*Source of truth: `supabase/schema.sql` + `supabase/migrations/`. When adding new tables, create a new migration file — do not edit schema.sql directly.*
