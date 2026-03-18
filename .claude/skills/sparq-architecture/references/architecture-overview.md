# Sparq Connection — Architecture Deep Reference

This file contains detailed database schema definitions, API patterns, and architectural decisions condensed from the master spec (`SPARQ_MASTER_SPEC.md`).

---

## Full Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  partner_name TEXT,
  partner_id UUID REFERENCES profiles(id),
  avatar_url TEXT,
  discovery_day INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  relationship_points INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### profile_traits
```sql
CREATE TABLE profile_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  trait_key TEXT NOT NULL,           -- 'attachment_style' | 'love_language' | 'conflict_style'
  inferred_value TEXT NOT NULL,      -- e.g., 'anxious', 'words', 'avoidant'
  confidence NUMERIC(3,2) DEFAULT 0.3, -- 0.0 to 1.0
  effective_weight NUMERIC(3,2) DEFAULT 1.0, -- adjusted by user feedback
  user_feedback TEXT,                -- 'yes' | 'not_really' | 'unsure'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
Trait keys: `attachment_style` (anxious/avoidant/disorganized/secure), `conflict_style` (avoidant/volatile/validating), `love_language` (words/acts/gifts/time/touch), `emotional_state` (struggling/neutral/thriving), `tone_sensitivity` (reassurance/accountability).

### user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  insights_visible BOOLEAN DEFAULT TRUE,
  personalization_enabled BOOLEAN DEFAULT TRUE,
  ai_memory_mode TEXT DEFAULT 'rolling_90_days',  -- or 'indefinite'
  relationship_mode TEXT DEFAULT 'solo',           -- or 'partnered'
  reminder_time TEXT DEFAULT '09:00',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  timezone TEXT
);
```

### user_entitlements
```sql
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  tier TEXT NOT NULL DEFAULT 'free',  -- 'free' or 'premium'
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  source TEXT  -- 'stripe', 'admin_grant', 'trial'
);
```

### daily_sessions
```sql
CREATE TABLE daily_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  phase TEXT DEFAULT 'morning_pending',
  morning_story TEXT,
  daily_action TEXT,
  evening_reflection TEXT,
  morning_completed_at TIMESTAMPTZ,
  evening_completed_at TIMESTAMPTZ,
  forced_pause_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);
```

### skill_progress
```sql
CREATE TABLE skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  track_id TEXT NOT NULL,   -- 'communication', 'conflict_repair', 'emotional_intimacy', 'trust_security', 'shared_vision'
  skill_id TEXT NOT NULL,
  level INTEGER DEFAULT 0,  -- 0=locked, 1=beginner, 2=intermediate, 3=advanced
  xp INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ
);
```

### partner_invitations
```sql
CREATE TABLE partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES profiles(id),
  invite_code TEXT UNIQUE NOT NULL,
  invitee_email TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'expired'
  expires_at TIMESTAMPTZ,         -- 7-day expiry
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### partner_syntheses
```sql
CREATE TABLE partner_syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES profiles(id),
  user_b_id UUID REFERENCES profiles(id),
  session_date DATE,
  synthesis_text TEXT,
  theme TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS: SELECT WHERE auth.uid() = user_a_id OR auth.uid() = user_b_id
```

### memories (pgvector — migration 20260318000000)
```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory TEXT NOT NULL,                     -- concatenated conversation text
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),                  -- OpenAI text-embedding-3-small (pgvector in PUBLIC schema)
  expires_at TIMESTAMPTZ,                  -- null = indefinite; set for 90-day memory window users
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: FOR ALL WHERE auth.uid() = user_id
-- Reads/writes use service-role client (src/lib/server/memory.ts)
-- Vector search via match_memories() RPC
```

### weekly_insights
```sql
CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  week_start DATE,
  patterns TEXT,
  growth_edge TEXT,
  strength TEXT,
  raw_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### graduation_reports
```sql
CREATE TABLE graduation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  report_data JSONB,
  recommended_track TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Other Tables
- `journeys` — journey definitions (title, description, duration, category, sequence, is_premium)
- `journey_questions` — steps within journeys (journey_id, question_text, day_number, phase)
- `user_journeys` — per-user progress (user_id, journey_id, current_day, status)
- `journey_responses` — user answers (user_id, journey_id, question_id, answer)
- `daily_questions` — question bank (question_text, category, intimacy_level, follow_up_text)
- `daily_question_responses` — user answers (user_id, question_id, answer)
- `conflict_episodes` — conflict tracking (user_id, started_at, resolved_at, severity, notes)
- `vulnerability_escrow` — encrypted sensitive content (user_id, content, encrypted, release_conditions)
- `analytics_events` — event log (user_id, event_type, event_data)
- `user_activities` — activity log (user_id, activity_type, details)
- `goals` / `goal_milestones` — goal tracking with milestones
- `date_ideas` / `user_date_ideas` — date idea catalog and user saves
- `user_roles` — RBAC (user_id, role: 'user'|'admin'|'partner')
- `system_settings` — admin key-value config

---

## Supabase RLS Policy Patterns

All tables use RLS. Standard patterns:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partner access (profiles only)
CREATE POLICY "Users can view partner profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() = partner_id);

-- Admin bypass
CREATE POLICY "Admins can view all" ON table_name
  FOR SELECT USING (is_admin());
```

---

## Peter AI System Prompt Structure

The Peter chat system prompt is assembled from these pieces:
1. **Base personality**: Warm otter, direct, uses metaphor, never preachy
2. **User traits**: Current `profile_traits` rows (attachment, conflict, love language, emotional state)
3. **Vector memories**: Top 5 relevant memories via `searchMemories(userId, latestMessage, 5)`
4. **Session context**: Today's morning story, daily action, day number
5. **Safety rules**: Crisis keyword detection, hotline numbers, no diagnostic language
6. **Personalization rules**: Trait-based adaptation table (see SKILL.md)

Morning story generation uses the same model but with a different system prompt focused on the day's concept and a ~200-word metaphorical narrative format.

---

## Trait Inference Pipeline

After each evening session completion:
1. `POST /api/profile/analyze` called (fire-and-forget)
2. GPT-4o-mini analyzes the full evening conversation
3. Extracts/updates trait signals: attachment tendency, conflict style, love language, emotional state
4. Upserts `profile_traits` rows with confidence scores
5. Traits influence Peter's next interaction and Weekly Mirror analysis

User correction flow: Profile page shows trait labels → user gives feedback (yes/not really/unsure) → `PATCH /api/profile/traits` adjusts confidence weight.

---

## Partner Linking Flow

1. User A sends invite → creates `partner_invitations` row → `send-partner-invite` Edge Function sends email
2. User B opens link → `/join-partner` page → accepts → `profiles.partner_id` linked on both sides
3. Privacy: journals private, no partner access to Peter conversations, trait labels hidden, synthesis shows only blended themes

---

## Subscription Enforcement Points

| Check Point | API | What's Checked |
|---|---|---|
| Daily session start | `/api/daily/session/start` | Sessions this week vs tier limit |
| Coach messages | `/api/peter/chat` | `coach_usage_daily` count |
| Journey access | `/journeys` page | `is_premium` on journey definition |
| Conflict First Aid | `/api/conflicts/first-aid` | Always free (safety tool) |

Enforcement function: `resolveEntitlements()` in `src/lib/server/entitlements.ts`

---

## Skill Track Recommended Triggers

Used in graduation report `recommended_track` logic:

| Trait Pattern | Recommended Track |
|---|---|
| conflict_style = avoidant | conflict_repair |
| conflict_style = volatile | conflict_repair |
| attachment_style = anxious | trust_security |
| attachment_style = avoidant | trust_security |
| love_language = words + struggling | communication |
| Default (no strong signal) | communication |

---

## Environment Variables

### Required
```
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY        # Server-side only (Mem0, service ops)
OPENROUTER_API_KEY               # Peter AI chat (OpenRouter)
OPENAI_API_KEY                   # Trait analysis, moderation, embeddings
```

### Optional
```
NEXT_PUBLIC_MEM0_API_KEY         # Mem0 cloud (unused — OSS version is primary)
NEXT_PUBLIC_GOOGLE_API_KEY       # Google Places for date ideas
```

---

## Known Technical Debt

- Stripe payment not integrated (localStorage mock)
- Legacy Supabase client at `src/integrations/supabase/client.ts` (do not use for new code)
- Duplicate auth implementations in `src/lib/auth/` (unused, can be deleted)
- Duplicate ProtectedRoute components (3 copies)
- `MetaphorAnimation.tsx` is ~24K lines, `supabaseService.ts` is ~29K lines
- Schema migration history is mostly placeholder files
- `.env` has committed credentials (should be `.env.local` only)

---

*Authoritative source: `SPARQ_MASTER_SPEC.md` in project root. When this document conflicts with any other file, the master spec takes precedence — except for actual running code, which represents the current implementation state.*
