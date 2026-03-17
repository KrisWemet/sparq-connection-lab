# Sparq Connection — Master Specification
### The Complete Source of Truth for Building This App

> "Stronger individuals create stronger relationships. Stronger relationships create stronger families. Stronger families create stronger communities."

**Version:** 3.1
**Last Updated:** 2026-03-06
**Last Repo Audit:** 2026-03-06
**Evidence Basis:** Repo-first (`src/`, `supabase/`, `package.json`, `vercel.json`)
**Status:** Living document — authoritative source of truth for product behavior, current repo state, and planned work

## Document Contract

This file intentionally contains three kinds of information. Each section should be read according to its type:

- **Normative spec**: What Sparq is supposed to do and how it should behave
- **Implementation snapshot**: What the current repo appears to implement as of the last repo audit date
- **Roadmap**: Planned work that is not yet shipped

Completion standard for this file:

- No unresolved `TBD` values remain in normative sections
- "Complete map" sections match the checked-in repo
- Snapshot sections are explicitly dated and may lag deployed infrastructure
- If a new public page, API route, or table is added, this file must be updated in the same change

---

## Table of Contents

1. [Vision, Mission & Positioning](#1-vision-mission--positioning)
2. [Core Product Philosophy](#2-core-product-philosophy)
3. [The Change Science Framework](#3-the-change-science-framework)
4. [Tech Stack & Architecture](#4-tech-stack--architecture)
5. [Directory Structure](#5-directory-structure)
6. [Database Schema — All Tables](#6-database-schema--all-tables)
7. [API Routes — Complete Map](#7-api-routes--complete-map)
8. [Feature Specifications](#8-feature-specifications)
9. [Peter the Otter — Full AI Behavior Spec](#9-peter-the-otter--full-ai-behavior-spec)
10. [Safety System](#10-safety-system)
11. [Living Profile & Personalization System](#11-living-profile--personalization-system)
12. [Partner System](#12-partner-system)
13. [Business Model & Monetization](#13-business-model--monetization)
14. [Current Implementation Status](#14-current-implementation-status)
15. [Prioritized Build Roadmap](#15-prioritized-build-roadmap)
16. [The Psychological Effectiveness Framework](#16-the-psychological-effectiveness-framework)
17. [Known Technical Debt](#17-known-technical-debt)
18. [Environment Variables](#18-environment-variables)
19. [Development Commands](#19-development-commands)

---

## 1. Vision, Mission & Positioning

### Mission
Help people build stronger, more fulfilling relationships through consistent connection, meaningful communication, and AI-guided growth.

### Vision
Become the most trusted daily AI companion for relationship growth — the "relationship fitness system" people return to for years, not weeks.

### Sparq's Core Promise
Sparq helps you become a steadier, more connected partner through small daily actions and an AI coach that adapts to you — without feeling like therapy.

### Positioning
| What Sparq Is | What Sparq Is Not |
|---|---|
| A daily relationship fitness system | A replacement for therapy |
| A warm AI companion (Peter) | A clinical diagnostic tool |
| Crisis-aware and safety-first | A judge or mediator between partners |
| Individual growth, relationally applied | A surveillance tool for partners |
| Evidence-based behavioral change | A generic chatbot |

### Target Market
- Couples who want to proactively improve (not just crisis intervention)
- Individuals who want to become better partners
- People who've tried therapy but want something daily and affordable
- Launch geography: United States, Canada, United Kingdom, Australia, New Zealand (English-only)

---

## 2. Core Product Philosophy

**1. Individual first.** We coach the user's own behavior and mindset. We never attempt to fix their partner or take sides in a conflict.

**2. Relationally adaptive.** Guidance changes based on attachment cues, conflict style, love language, and emotional state — silently inferred over time.

**3. Non-clinical voice.** Warm, simple, emotionally safe, approximately 4th-grade reading level. No diagnostic language ever.

**4. Action over content.** Daily micro-actions and reflection loops drive measurable behavior change. We are not a content library — we are a practice system.

**5. Safety by design.** Crisis risk is detected and routed to human professional support. This is non-negotiable and always available regardless of subscription tier.

**6. Identity-level change.** The goal is not behavior change (fragile) but identity shift ("I am becoming someone who..."). Every design decision should serve this deeper mechanism.

**7. The couple as a system.** Both partners are trapped in patterns together — not enemies. When we help them name the pattern ("the cycle"), not each other, everything shifts.

---

## 3. The Change Science Framework

This section explains *why* the product is designed the way it is. Every agent building this app should understand these mechanisms.

### 3.1 The Chain of Permanent Change

Permanent internal change requires this full chain — the app must support every link:

```
Insight → Emotional Processing → New Behavior in a Real Moment → Different Outcome → Updated Self-Story
```

Most relationship apps stop at Insight. Sparq is architected to close the whole chain.

### 3.2 Levels of Change (deepest to most fragile)

1. **Identity** — "I am someone who stays present during conflict." (most durable)
2. **Values** — "My relationship is worth this effort because..."
3. **Beliefs** — "Conflict doesn't mean the relationship is broken."
4. **Behaviors** — "I paused before responding." (most fragile — reverts under stress)

The app must work at levels 1-2, not just level 4.

### 3.3 Key Evidence-Based Mechanisms

**EFT (Emotionally Focused Therapy) — Primary Framework**
- Couples change when they see their "negative cycle" (the repeating pattern) as the enemy — not each other
- The cycle: Partner A pursues → Partner B withdraws → A feels unloved → B feels overwhelmed → repeat
- Naming the cycle together ("we're in the cycle again") interrupts it
- Attachment needs drive the cycle; meeting those needs rewires the pattern

**ACT (Acceptance and Commitment Therapy)**
- Values-based committed action is more durable than symptom-reduction action
- Psychological flexibility (accepting hard feelings without being controlled by them) predicts long-term change
- "Why does this relationship matter to you at your deepest level?" is the anchor question

**Narrative Therapy**
- People change when they change the story they tell about themselves
- Not "I'm avoidant" (fixed label) but "I used to pull away, and I'm learning to stay" (arc)
- Peter must narrate the user's growth arc, not just their current state

**Neuroscience of Habit and Identity**
- Every action is a "vote" for the identity you're becoming (James Clear)
- New neural pathways require: novelty + attention + emotion + repetition
- Spaced repetition (revisiting skills at increasing intervals) prevents regression

**Repair Science (Gottman)**
- The #1 predictor of long-term relationship health is not conflict frequency — it's repair speed and quality
- Successful repair after conflict is more important than avoiding conflict
- Tracking repair attempts and speed is the primary behavioral outcome metric

### 3.4 What Doesn't Create Permanent Change

- Information alone (reading about attachment)
- Insight without integration (journaling into a void)
- Behavior tracking without identity framing
- Skills practiced in the app but never transferred to real moments
- Extrinsic motivation (streaks/badges) without intrinsic values anchoring

---

## 4. Tech Stack & Architecture

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 13 (Pages Router) | All pages in `src/pages/` |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS 3 + shadcn/ui | 60+ UI primitives in `src/components/ui/` |
| Backend/DB | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) | Canonical client: `src/lib/supabase.ts` |
| AI — Coach | OpenRouter (Claude Haiku 4.5 primary, fallbacks) | `src/lib/openrouter.ts` |
| AI — Analysis | OpenAI GPT-4o-mini | Used for trait analysis, moderations |
| AI — Memory | Mem0 OSS (Supabase vector store) | `src/lib/server/memory.ts` |
| Animation | Framer Motion | Standard variants in `AnimatedContainer` |
| State | React Context (Auth, Subscription) + TanStack React Query v5 | |
| Icons | Lucide React | |
| Toasts | Sonner | |
| Deployment | Vercel | `vercel.json` set to `"framework": "nextjs"` |
| E2E Testing | Playwright | `e2e/` directory |

### Auth Architecture
- Primary: `src/lib/auth-context.tsx` → `AuthProvider` → wired in `_app.tsx`
- API auth: `getAuthedContext()` from `src/lib/server/supabase-auth.ts`
- All API routes must call `getAuthedContext(req)` and check for null

### AI Model Priority (OpenRouter fallback chain)
```
1. anthropic/claude-haiku-4-5-20251001  (primary)
2. google/gemini-flash-1.5-8b            (fallback)
3. mistralai/mistral-7b-instruct         (fallback)
```

---

## 5. Directory Structure

Repo-first note: this is a curated inventory of the primary app surfaces and canonical integration points, not an exhaustive dump of every page/component file. When this section and the repo disagree, the repo wins and this file must be updated.

```
sparq-connection-lab/
├── src/
│   ├── pages/                          # Next.js pages (file-based routing)
│   │   ├── _app.tsx                    # App wrapper: QueryClient → Auth → Subscription → BottomNav
│   │   ├── _document.tsx               # Custom HTML document
│   │   ├── index.tsx                   # Root redirect (→ /dashboard or /login)
│   │   ├── login.tsx                   # Login/Register page
│   │   ├── signup.tsx                  # Signup page
│   │   ├── onboarding-flow.tsx         # Peter-led onboarding conversation
│   │   ├── dashboard.tsx               # Main dashboard (protected)
│   │   ├── daily-growth.tsx            # Daily Loop: morning story → action → evening chat
│   │   ├── daily-questions.tsx         # Legacy daily questions
│   │   ├── skill-tree.tsx              # Skill Tree (unlocks Day 15+)
│   │   ├── journeys.tsx                # Journey listing
│   │   ├── journey-details.tsx         # Journey progress page
│   │   ├── journey-start.tsx           # Journey onboarding
│   │   ├── profile.tsx                 # User profile
│   │   ├── settings.tsx                # App settings
│   │   ├── trust-center.tsx            # Privacy & data controls
│   │   ├── conflict-first-aid.tsx      # Real-time de-escalation tool (personalized)
│   │   ├── assessment.tsx              # Relationship health assessment
│   │   ├── mirrorreport.tsx            # Mirror Report — patterns & insights
│   │   ├── subscription.tsx            # Subscription management
│   │   ├── join-partner.tsx            # Partner invite acceptance
│   │   ├── translator.tsx              # Message translator/rephraser
│   │   ├── date-ideas.tsx              # AI-powered date suggestions
│   │   ├── goals.tsx                   # Goal setting and tracking
│   │   ├── reflect.tsx                 # Standalone reflection
│   │   ├── messaging.tsx               # Partner messaging
│   │   ├── admin.tsx                   # Admin UI
│   │   ├── not-found.tsx               # 404
│   │   ├── api/
│   │   │   ├── peter/
│   │   │   │   ├── chat.ts             # Peter coaching chat (personalized, safety-aware)
│   │   │   │   ├── morning.ts          # Morning story generation
│   │   │   │   ├── analyze.ts          # Conversation analysis
│   │   │   │   └── transcribe.ts       # Voice transcription for Peter chat
│   │   │   ├── daily/session/
│   │   │   │   ├── start.ts            # Create/resume daily session
│   │   │   │   ├── morning-viewed.ts   # Mark morning story as viewed
│   │   │   │   └── complete.ts         # Complete session (triggers trait analysis + partner synthesis)
│   │   │   ├── me/
│   │   │   │   ├── assessment.ts       # Relationship assessment submission/fetch
│   │   │   │   ├── patterns.ts         # Weekly Mirror — pattern insights API
│   │   │   │   ├── graduation-report.ts # Day 14 personalized report API
│   │   │   │   ├── relationship-score.ts# Relationship OS score
│   │   │   │   ├── entitlements.ts     # Subscription entitlements
│   │   │   │   └── memory-settings.ts  # AI memory preference
│   │   │   ├── profile/
│   │   │   │   ├── preferences.ts      # Legacy profile-scoped preferences endpoint
│   │   │   │   ├── traits.ts           # Profile traits (supports ?include_partner=true)
│   │   │   │   └── snapshot.ts         # Plain-language profile snapshot
│   │   │   ├── conflicts/
│   │   │   │   ├── index.ts            # Create conflict episode
│   │   │   │   └── resolve.ts          # Resolve conflict episode
│   │   │   ├── date-ideas/generate.ts  # AI date idea generation
│   │   │   ├── journeys/start.ts       # Start or resume journey with entitlement enforcement
│   │   │   ├── preferences.ts          # Canonical user preferences CRUD
│   │   │   └── admin/kpis.ts           # Admin KPI dashboard (protected)
│   │   └── journeys/                   # 14 individual journey pages
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (do not modify directly)
│   │   ├── dashboard/
│   │   │   ├── RelationshipScoreCard.tsx     # Relationship OS Score card
│   │   │   ├── WeeklyMirrorCard.tsx          # Weekly pattern insights (new)
│   │   │   ├── PartnerSynthesisCard.tsx      # Shared partner reflection (new)
│   │   │   ├── DailyConnectCard.tsx
│   │   │   ├── DateIdeasCard.tsx
│   │   │   └── PartnerConnectionCard.tsx
│   │   ├── onboarding/
│   │   │   ├── Day14Graduation.tsx           # Day 14 celebration + personalized report (new)
│   │   │   └── OnboardingStep{One-Four}.tsx
│   │   ├── journey/
│   │   │   ├── JourneyContentView.tsx
│   │   │   └── PersuasiveJourneyPrompt.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── LogoutCard.tsx
│   │   │   └── PartnerConnectionCard.tsx
│   │   ├── PeterChat.tsx               # Chat UI component
│   │   ├── PeterTheOtter.tsx           # Peter character component
│   │   └── MetaphorAnimation.tsx       # ~24K lines — bridge/flower/river animations
│   │
│   ├── lib/
│   │   ├── auth-context.tsx            # PRIMARY auth provider (use this)
│   │   ├── supabase.ts                 # Supabase client (NEXT_PUBLIC_* env vars) — use this
│   │   ├── subscription-provider.tsx   # Subscription state/context
│   │   ├── openrouter.ts               # OpenRouter peterChat() function
│   │   ├── peterService.ts             # Peter prompts, PETER_SYSTEM_PROMPT, buildPersonalizedPrompt()
│   │   ├── safety.ts                   # Crisis detection + country resources
│   │   ├── morning-parser.ts           # Parse morning story + action from Peter response
│   │   ├── utils.ts                    # cn() utility for Tailwind
│   │   ├── product.ts                  # Tier definitions
│   │   └── server/
│   │       ├── supabase-auth.ts        # getAuthedContext() — use in all API routes
│   │       ├── analytics.ts            # trackEvent() server helper
│   │       ├── memory.ts               # Mem0 OSS: addMemory(), searchMemories(), getRecentMemories()
│   │       ├── profile-analysis.ts     # analyzeProfileTraits() — fire-and-forget trait inference
│   │       ├── partner-synthesis.ts    # generatePartnerSynthesis() — EFT couple reflection (new)
│   │       ├── entitlements.ts         # resolveEntitlements() — subscription tier checks
│   │       └── date-utils.ts           # parseLocalDate()
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                  # Wrapper: useAuth() from auth-context
│   │   ├── useJourney.ts               # Journey state management
│   │   ├── useOnboardingRedirect.ts    # Redirect logic for onboarding
│   │   └── useOnboarding.ts.deprecated # Deprecated onboarding hook retained for reference
│   │
│   ├── services/
│   │   ├── aiService.ts                # OpenAI date idea generation
│   │   ├── partnerService.ts           # Partner invitation logic
│   │   ├── journeyService.ts           # Journey CRUD
│   │   └── analyticsService.ts         # Client-side analytics
│   │
│   ├── data/
│   │   ├── journeys.ts                 # 14 journey definitions
│   │   ├── quizData.ts                 # Relationship health quiz questions
│   │   ├── fallbackStories.json        # Fallback morning stories for Days 1-14
│   │   ├── relationshipContent.ts      # ~27K lines — static relationship guidance
│   │   └── persuasiveContent.ts        # ~22K lines — psychological messaging copy
│   │
│   └── types/
│       ├── profile.ts                  # Profile, UserBadge, DailyActivity types
│       ├── journey.ts                  # Journey types
│       └── quiz.ts                     # Quiz types
│
├── supabase/
│   ├── schema.sql                      # Full DB schema reference
│   ├── migrations/                     # Incremental SQL migration files
│   │   ├── [placeholder files]         # Pre-20260301: empty (schema applied directly to remote)
│   │   ├── 20260301091500_enforce_daily_session_uniqueness.sql
│   │   ├── 20260302113000_align_daily_sessions_with_api.sql
│   │   ├── 20260302120000_create_missing_tables.sql
│   │   ├── 20260303000000_create_weekly_insights.sql      # Pattern Mirror
│   │   ├── 20260303000001_create_partner_syntheses.sql    # Partner Reflection Loop
│   │   └── 20260303000002_create_graduation_reports.sql   # Day 14 Report
│   └── functions/
│       ├── memory-operations/           # Edge function: Mem0 memory CRUD
│       └── send-partner-invite/         # Edge function: partner invite emails
│
├── e2e/                                # Playwright E2E tests
├── public/
│   └── Path to Together/               # Educational markdown content
├── CLAUDE.md                           # AI agent instructions (dev context)
├── SPARQ_MASTER_SPEC.md               # This file — master source of truth
└── vercel.json                         # Vercel config (framework: nextjs)
```

---

## 6. Database Schema — All Tables

All tables have Row Level Security (RLS) enabled. Users can only access their own rows unless otherwise noted.

### Core User Tables

```sql
-- User profiles (extends auth.users)
profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  name text,
  partner_name text,
  partner_id uuid REFERENCES auth.users(id),  -- links coupled users
  streak_count integer DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- User preferences and privacy settings
user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  insights_visible boolean DEFAULT true,
  personalization_enabled boolean DEFAULT true,
  ai_memory_mode text DEFAULT 'rolling_90_days',  -- 'rolling_90_days' | 'indefinite'
  relationship_mode text DEFAULT 'solo',            -- 'solo' | 'partnered'
  reminder_time text,
  notifications_enabled boolean DEFAULT true,
  timezone text,
  updated_at timestamptz DEFAULT now()
)

-- RBAC
user_roles (
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL  -- 'user' | 'admin' | 'partner'
)
```

### Daily Session System

```sql
-- Primary daily session tracking
daily_sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  day_index integer NOT NULL,                      -- 1-14 (onboarding), 15+ (ongoing)
  status text DEFAULT 'active',                    -- 'active' | 'completed'
  phase text DEFAULT 'morning',                    -- 'morning' | 'evening' | 'complete'
  morning_story text,
  morning_action text,
  morning_viewed_at timestamptz,
  evening_reflection text,
  evening_peter_response text,
  evening_completed_at timestamptz,
  completed_local_date date,
  session_local_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_index)
)

-- Mirror of completed sessions for efficient querying
daily_entries (
  user_id uuid,
  day integer,
  morning_story text,
  morning_action text,
  morning_viewed_at timestamptz,
  evening_reflection text,
  evening_peter_response text,
  evening_completed_at timestamptz,
  UNIQUE(user_id, day)
)
```

### Profile Intelligence

```sql
-- Inferred psychological traits (updated after each evening session)
profile_traits (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  trait_key text NOT NULL,           -- 'attachment_style' | 'love_language' | 'conflict_style'
  inferred_value text NOT NULL,      -- e.g., 'anxious', 'words', 'avoidant'
  confidence numeric(3,2),           -- 0.0 to 1.0
  effective_weight numeric(3,2),     -- adjusted by user feedback
  user_feedback text,                -- 'yes' | 'not_really' | 'unsure'
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trait_key)
)

-- Aggregate user insights (onboarding progress, skill tree status)
user_insights (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  attachment_style text,
  love_language text,
  conflict_style text,
  emotional_state text,
  onboarding_day integer DEFAULT 1,            -- current day cursor (next day to show)
  skill_tree_unlocked boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  last_analysis_at timestamptz
)
```

### AI Memory System

```sql
-- Mem0 vector store (managed by mem0ai OSS library)
memories (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  memory text NOT NULL,
  metadata jsonb,
  embedding vector(1536)  -- text-embedding-3-small
)

memory_history (
  id uuid PRIMARY KEY,
  memory_id uuid,
  user_id text,
  old_memory text,
  new_memory text,
  event text,
  created_at timestamptz
)
```

### Partner System

```sql
-- Partner invitations (7-day expiry)
partner_invitations (
  id uuid PRIMARY KEY,
  inviter_id uuid REFERENCES auth.users(id),
  invite_code text UNIQUE NOT NULL,
  invitee_email text,
  status text DEFAULT 'pending',               -- 'pending' | 'accepted' | 'expired'
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
)

-- Synthesized reflections when both partners complete the same day
partner_syntheses (
  id uuid PRIMARY KEY,
  user_a_id uuid REFERENCES auth.users(id),   -- always min(id1, id2) for idempotency
  user_b_id uuid REFERENCES auth.users(id),
  day_index integer NOT NULL,
  synthesis text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id, day_index)
)
-- RLS: SELECT where auth.uid() = user_a_id OR auth.uid() = user_b_id
```

### Psychological Insight Tables

```sql
-- Weekly pattern insights (cached, one per user per week)
weekly_insights (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  week_start date NOT NULL,
  patterns jsonb NOT NULL DEFAULT '[]',        -- array of 2 pattern strings
  growth_edge text NOT NULL,
  strength text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
)

-- Day 14 personalized graduation report (generated once, immutable)
graduation_reports (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES auth.users(id),
  what_i_learned text NOT NULL,
  biggest_growth text NOT NULL,
  relationship_superpower text NOT NULL,
  focus_next text NOT NULL,
  recommended_track text,                      -- 'conflict_repair' | 'trust_security' | 'communication'
  generated_at timestamptz DEFAULT now()
)

-- Relationship health assessments (baseline + Day 14 comparison)
outcome_assessments (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  milestone text NOT NULL,                     -- 'baseline' | 'day_14'
  responses jsonb NOT NULL DEFAULT '[]',
  total_score numeric(5,2) DEFAULT 0,
  completed_at timestamptz DEFAULT now()
)

-- Relationship OS Score history
relationship_scores (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  overall_score numeric(5,2),
  communication_quality numeric(5,2),
  repair_speed numeric(5,2),
  emotional_safety numeric(5,2),
  ritual_consistency numeric(5,2),
  computed_at timestamptz DEFAULT now()
)
```

### Conflict & Safety

```sql
-- Conflict episode tracking
conflict_episodes (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  severity integer DEFAULT 3,
  tool_used text,
  notes text,
  resolved_at timestamptz,
  resolution_method text,                      -- 'used_tool' | 'resolved_naturally' | 'ongoing'
  started_at timestamptz DEFAULT now()
)

-- Safety/crisis events (for audit and compliance)
safety_events (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  crisis_types text[],
  matched_terms text[],
  country_code text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
)
```

### Journeys & Skills

```sql
-- Journey definitions (static data)
journeys (
  id uuid PRIMARY KEY,
  title text,
  description text,
  duration_days integer,
  category text,
  difficulty text,
  is_premium boolean DEFAULT false
)

-- User journey progress
user_journeys (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  journey_id uuid REFERENCES journeys(id),
  current_day integer DEFAULT 1,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
)

-- Skill tree progression
skill_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  track text NOT NULL,                         -- 'communication' | 'conflict_repair' | 'emotional_intimacy' | 'trust_security' | 'shared_vision'
  level text DEFAULT 'basic',                  -- 'basic' | 'advanced' | 'expert'
  xp integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, track)
)
```

### Analytics & Monetization

```sql
-- Event tracking
analytics_events (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_name text NOT NULL,
  event_props jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
)
INDEX on (user_id, event_name, created_at DESC)

-- Coach message rate limiting
coach_usage_daily (
  user_id uuid,
  usage_date date,
  message_count integer DEFAULT 0,
  updated_at timestamptz,
  PRIMARY KEY (user_id, usage_date)
)

-- Subscription entitlements
user_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  tier text DEFAULT 'free',                    -- 'free' | 'premium' | 'ultimate'
  coach_message_limit_per_day integer,
  daily_sessions_per_week integer,
  valid_until timestamptz
)
```

---

## 7. API Routes — Complete Map

Repo-first note: this section documents the current checked-in HTTP surface. It does not invent routes that the repo does not expose.

### Daily Session Flow

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/daily/session/start` | Create or resume today's session |
| POST | `/api/daily/session/morning-viewed` | Mark morning story as read |
| POST | `/api/daily/session/complete` | Complete session (triggers trait analysis + partner synthesis) |

### Peter AI Coach

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/peter/chat` | Personalized chat (traits + memories + optional eveningContext) |
| POST | `/api/peter/morning` | Generate morning story + daily action |
| POST | `/api/peter/analyze` | Analyze conversation for insights |
| POST | `/api/peter/transcribe` | Transcribe Peter voice input to text |

### User Profile & Insights

| Method | Route | Description |
|--------|-------|-------------|
| GET/PATCH | `/api/profile/traits` | Get/update profile traits (`?include_partner=true` for conflict guidance) |
| GET | `/api/profile/snapshot` | Plain-language profile summary |
| GET | `/api/me/patterns` | Weekly Mirror — pattern insights (cached weekly) |
| GET | `/api/me/graduation-report` | Day 14 personalized report (generated once, immutable) |
| GET | `/api/me/relationship-score` | Relationship OS Score + history |
| GET | `/api/me/entitlements` | Subscription entitlements for current user |
| GET/POST | `/api/me/assessment` | Submit or fetch relationship health assessment |
| GET/PUT | `/api/me/memory-settings` | AI memory window preference |
| GET/PATCH | `/api/preferences` | Canonical user preferences endpoint |
| GET/POST | `/api/profile/preferences` | Legacy preferences endpoint kept for backward compatibility |

### Conflict & Safety

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/conflicts` | Create conflict episode (opened on page visit) |
| POST | `/api/conflicts/resolve` | Resolve conflict episode (called on page leave) |

### Other

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/date-ideas/generate` | Generate AI-powered date ideas |
| POST | `/api/journeys/start` | Start or resume a journey with free/premium enforcement |
| POST | `/api/translator` | Rephrase message for partner's communication style |
| GET | `/api/admin/kpis` | Admin KPI dashboard (admin-only) |

### Partner System

There is currently **no standalone `/api/partner/*` HTTP surface** in the checked-in repo. Partner invite and acceptance flows are implemented via:

- Client-side Supabase access in `src/services/partnerService.ts`
- Invite acceptance UI in `src/pages/join-partner.tsx`
- Supabase Edge Function `send-partner-invite`

---

## 8. Feature Specifications

### 8.1 The Daily Loop (Core Feature — Days 1-14)

**Philosophy:** 6-10 minutes/day. Three phases that together form a complete learning cycle.

**Phase 1 — Morning Story (2-3 min)**
- Peter narrates a short story about "Alex and Sam" (relatable couple) embodying the day's concept
- Concept is never named — it's demonstrated through story
- Ends with "Today's Action" — one specific, small, doable task
- Generated by `/api/peter/morning` using `getMorningStoryPrompt(day, insights)`
- 14 concepts, one per day (see `src/lib/peterService.ts`)
- Idempotent: checks if today's session already has a morning story before generating

**Phase 2 — Daily Action (during the day)**
- User carries the action into real life
- App shows a reminder of today's action on return
- "Put the Phone Down Quest" — hold-to-verify UX confirms they actually did it

**Phase 3 — Evening Chat (3-5 min)**
- User reports how it went — free text with Peter
- Peter responds using full personalization (traits + vector memories + evening context)
- `eveningContext: { day, morningAction, turnNumber }` appended to personalized system prompt
- After 2+ turns, user can mark day complete
- Completion triggers: trait analysis (fire-and-forget) + partner synthesis if partner completed same day

**Day Advancement Logic:**
- `user_insights.onboarding_day` = next day cursor
- Guard against double-advance via `lastCompletedFromCursor` check
- Day 14 completion → `skill_tree_unlocked: true` + shows `Day14Graduation` component

---

### 8.2 Peter the Otter AI Coach

See full spec in [Section 9](#9-peter-the-otter--full-ai-behavior-spec).

---

### 8.3 Living Profile System

**How traits are inferred (silent — no quizzes):**
1. User completes evening reflection
2. `complete.ts` fires `analyzeProfileTraits()` asynchronously
3. GPT-4o-mini reads the reflection + Peter response
4. Infers: `attachment_style`, `love_language`, `conflict_style`, `emotional_state`
5. Writes to `profile_traits` with confidence score
6. Confidence accumulates across days via effective_weight
7. User can correct traits via PATCH `/api/profile/traits` with `{ trait_key, feedback: 'yes' | 'not_really' | 'unsure' }`

**Trait Keys:**
- `attachment_style`: `anxious` | `avoidant` | `disorganized` | `secure`
- `love_language`: `words` | `acts` | `gifts` | `time` | `touch`
- `conflict_style`: `avoidant` | `volatile` | `validating`
- `emotional_state`: `struggling` | `neutral` | `thriving`

**Confidence thresholds:**
- < 0.4: not used in personalization
- 0.4-0.7: used but held lightly
- > 0.7: used with full weight in prompts

---

### 8.4 Weekly Mirror (Pattern Insights)

**Purpose:** Show users their own patterns — the primary change mechanism in therapy.

**How it works:**
1. GET `/api/me/patterns` checks `weekly_insights` cache for current week
2. If no cache: fetch last 7 days completed sessions + profile traits + 5 memories
3. Require ≥ 3 completed sessions, otherwise return `{ insufficient_data: true }`
4. GPT generates: 2 recurring patterns ("I noticed..." language), 1 growth edge, 1 strength
5. Cache in `weekly_insights` for the week
6. `WeeklyMirrorCard` on Dashboard renders the result

**Output format:**
```json
{
  "patterns": ["I noticed you tend to...", "I noticed that when..."],
  "growth_edge": "One specific thing you're growing toward",
  "strength": "One clear strength I see in you"
}
```

**UI States:**
- Loading: pulse skeleton
- Insufficient data: "Peter is still getting to know you..."
- Data present: 2 pattern bullets + amber "growing toward" pill + teal "your strength" pill

---

### 8.5 Partner Synthesis (Couple Reflection Loop)

**Purpose:** When both partners complete the same day, synthesize their reflections using EFT framing. This is the moment they see the relationship as a shared experience, not two parallel ones.

**How it works:**
1. Session complete → `complete.ts` checks partner's `partner_id`
2. Fetch partner's `daily_sessions` row for same `day_index`
3. If partner completed: call `generatePartnerSynthesis()`
4. Canonical UUID ordering (min → user_a_id) ensures unique constraint is idempotent
5. GPT generates synthesis with "you both" framing, never revealing who said what
6. Privacy note always shown: "Peter isn't sharing what either of you said word for word."

**Synthesis prompt rules:**
- "You both" framing throughout
- Highlight genuine commonality (even if described differently)
- Name one gentle difference — warmly, not as criticism
- Never identify who said which reflection
- Warm, not clinical

**`PartnerSynthesisCard`:** Soft purple card, renders only when synthesis exists, shown on Dashboard when `partnerName` is truthy.

---

### 8.6 Day 14 Personalized Graduation Report

**Purpose:** Replace generic confetti with a personalized account of who this user became over 14 days. This is the identity-level moment.

**How it works:**
1. Day 14 complete → `Day14Graduation` component mounts
2. Fetches GET `/api/me/graduation-report`
3. API checks `graduation_reports` — if exists, returns cached (immutable, generated once)
4. If not: fetch all 14 sessions + all profile traits + user name
5. GPT generates 4 fields using specific reflections as evidence
6. `recommended_track` selected by logic: conflict_style avoidant/volatile → conflict_repair; attachment anxious/avoidant → trust_security; default → communication
7. Insert into `graduation_reports`, return to client

**Report fields:**
- `what_i_learned`: What Peter observed about this specific user over 14 days
- `biggest_growth`: The most meaningful shift witnessed
- `relationship_superpower`: Their clearest strength in relationships
- `focus_next`: The next area to explore (hopeful, not prescriptive)
- `recommended_track`: Skill tree track to start with

**UI:** Shown below generic celebration. 4 colored sections + recommended track card + "Enter the Skill Tree" CTA.

---

### 8.7 Personalized Conflict First Aid

**Purpose:** Turn a static tool into a personalized intervention based on this specific couple's conflict dynamic.

**Somatic phase (first 60 seconds):**
- Dark screen, breathing animation, timer
- Nervous system regulation before any cognitive tools
- Cannot skip (except dev mode)

**Tools phase (after 60 seconds):**
1. Danger disclaimer (always)
2. Reset Protocol (4 universal steps)
3. **"Your Dynamic Right Now"** (amber card — personalized, only when traits available)
4. Repair Starters (personalized love language starters prepended to universal starters)

**Personalization logic (`getPersonalizedGuidance()`):**
- volatile + avoidant: chase/withdraw dynamic, name it, suggest timed return
- avoidant + volatile: overwhelm/abandonment dynamic, need a "not done" signal
- both avoidant: risk of never fully resolving, suggest gentle re-opening
- both volatile: heat without light, agree to 5-minute pause
- validating: lean into the gift, make it explicit
- Love language repair starters: one prepended based on partner's primary love language

**Graceful degradation:** If no traits available, page renders identically to before.

---

### 8.8 Skill Tree (Day 15+)

**Tracks:**
1. Communication — Clear, kind expression and listening
2. Conflict Repair — Speed and quality of reconnection after conflict
3. Emotional Intimacy — Vulnerability, presence, emotional attunement
4. Trust & Security — Reliability, honesty, felt safety
5. Shared Vision & Rituals — Aligned future, daily connection rituals

**Progression:** Basic → Advanced → Expert

**Thresholds (normative):**
- Basic: `0-99 XP`
- Advanced: `100-249 XP`
- Expert: `250+ XP`

**XP earning rules (normative target):**
- Daily loop completed: `+10 XP` to the primary associated track
- Conflict First Aid completed: `+15 XP` to Conflict Repair
- Journey module completed: `+20 XP` to the journey's primary track
- Values or reflection milestone completed: `+5 XP` to Emotional Intimacy or Shared Vision, depending on module

**Locked:** Before Day 14 completion, Skill Tree shows a locked gate with day count

---

### 8.9 Journeys (Guided Quests)

14 predefined journeys in `src/data/journeys.ts`:
- Communication, Intimacy, Trust Rebuilding, Conflict Resolution
- Love Languages, Emotional Intelligence, Attachment Healing
- Relationship Renewal, Values, Mindful Sexuality, Sexual Intimacy
- Fantasy Exploration, Power Dynamics, Long Distance

Each journey: 3-14 days, solo reflection + optional partner interaction, adaptive pacing.

---

### 8.10 Relationship OS Score

Composite score (0-100) updated via `relationship_scores` table:
- **Communication Quality** — depth and clarity of reflections
- **Repair Speed** — time between conflict episode and resolution
- **Emotional Safety** — tone and vulnerability in reflections
- **Ritual Consistency** — daily streak and completion rate

Displayed as sparkline chart + dimension bars in `RelationshipScoreCard`.

---

### 8.11 Mirror Report Page (`/mirrorreport`)

Full-page version of weekly insights. Shows pattern history over multiple weeks. Linked from Dashboard.

---

### 8.12 Assessment (`/assessment`)

Hendrick Relationship Assessment Scale — standardized pre/post measurement.
- Baseline at onboarding
- Day 14 repeat for outcome comparison
- Stored in `outcome_assessments`

---

### 8.13 Translator (`/translator`)

Rephrase a message the user is about to send, optimized for their partner's communication style. Uses partner's love language and conflict style from traits.

---

### 8.14 Trust Center (`/trust-center`)

Privacy controls:
- Insight visibility toggle (show/hide inferred traits)
- Personalization toggle (on = Peter adapts to you; off = generic)
- AI memory window (90 days rolling vs indefinite)
- Relationship mode (solo/partnered)
- Data deletion and export (built, needs wiring)

---

### 8.15 Date Ideas (`/date-ideas`)

AI-generated date suggestions based on location preferences and relationship stage. Uses OpenAI directly.

---

## 9. Peter the Otter — Full AI Behavior Spec

### Core Identity

Peter is a warm, friendly otter who helps people build stronger relationships. He is NOT a therapist, counselor, or coach in the clinical sense. He is a knowledgeable friend who cares deeply and has seen a lot.

### Personality Rules

- Simple, everyday language (4th-grade reading level)
- Short sentences. Never long paragraphs.
- Celebrates **effort**, not just results
- When someone is struggling: comfort first, advice second
- When someone is doing well: genuine celebration
- Curious about the person's actual life — asks one focused follow-up at a time
- Remembers what the user has shared and refers back naturally
- Signs off with warmth, sometimes otter-themed humor 🦦

### Strictly Forbidden Language

Peter NEVER uses:
- `attachment style`, `love language`, `avoidant`, `anxious`, `trauma`
- `dysregulated`, `maladaptive`, `codependent`, `narcissist`, `toxic`, `gaslighting`
- `diagnosis`, `disorder`, `treatment plan`, `clinical`, `symptoms`
- "you're doing it wrong", "you should"

### Preferred Phrasing (Natural Language Translations)

| Clinical | Peter's Version |
|---|---|
| attachment anxious | "you sometimes worry about whether your partner is really there for you" |
| attachment avoidant | "you sometimes need space to process before opening up" |
| volatile conflict style | "you tend to express your feelings intensely in the moment" |
| avoidant conflict style | "you tend to step back when things get heated" |
| words of affirmation | "hearing that you're appreciated means a lot to you" |
| acts of service | "when someone does something thoughtful for you, it really lands" |
| physical touch | "physical closeness and affection help you feel connected" |

### Personalization Architecture

Every Peter response is built from three layers in `chat.ts`:

**Layer 1: Base System Prompt (`PETER_SYSTEM_PROMPT`)**
Always present. Establishes Peter's identity, voice, and forbidden language.

**Layer 2: Personalization Block (`buildPersonalizedPrompt()`)**
Added when user is authenticated AND no `systemOverride` is present:
- Fetches profile_traits with effective_weight ≥ 0.3
- Fetches 5 most relevant memories via semantic search
- Appends natural-language descriptions of traits and memories
- Instruction: "Reference these insights naturally. NEVER state them directly."

**Layer 3: Context Append**
Added on top of layers 1+2:
- `eveningContext`: appended when handling evening check-in (replaces old systemOverride)
- `systemOverride`: still accepted for Skill Tree and other non-personalized flows

### Tone Adaptation

| User State | Peter's Mode |
|---|---|
| Distress / shame / hopelessness language | Reassurance first — comfort, then comfort again |
| Post-conflict or flooding indicators | De-escalation — slower pace, no growth-pushing |
| Stable + repeated avoidable mistake | Gentle accountability — direct, action-oriented |
| Heavy blame with low self-ownership | Ownership redirect — what can YOU do? |
| Consistent completion streaks | Increase challenge depth — celebrate momentum |

### Crisis Protocol

When `detectCrisisIntent()` triggers (self-harm, DV, child harm, stalking, acute panic):
1. Log to `safety_events` table
2. Track `crisis_escalation_triggered` analytics event
3. Return `buildCrisisResponse(countryCode, crisisTypes)` — bypasses all other logic
4. Country-specific resources: US, CA, UK, AU, NZ
5. "Please reach out to a real human right now"
6. All subsequent normal coaching suspended for that session

### Identity Arc Language (Critical)

Peter should narrate users' **growth arc**, not just their current state. When the system has data across multiple sessions, Peter references the delta:

**Wrong:** "You tend to step back when things get heated."
**Right:** "You used to pull away every time. I've watched you stay present three times this week. That's who you're becoming."

This is the identity-level intervention. It should be woven into weekly mirrors, Day 14 reports, and evening responses when there's historical data to draw from.

---

## 10. Safety System

### Crisis Detection (`src/lib/safety.ts`)

Detects and routes for:
- Self-harm or suicide intent
- Domestic violence, threats, coercive control
- Child harm
- Stalking or illegal surveillance intent
- Acute panic/dissociation language

### Response Behavior

1. Immediately switch to stabilization mode
2. Provide localized crisis resources by country
3. Suspend normal relationship coaching
4. Log to `safety_events` + analytics
5. Outbound moderation: all Peter responses run through OpenAI moderation API

### Country Resources (Static at Launch)
US, Canada, UK, Australia, New Zealand — hardcoded in `safety.ts`

### Red Lines (Never Cross)
- Diagnose or claim clinical certainty
- Enable manipulation of partner behavior
- Act as judge/jury in partner conflict
- Advise staying in unsafe/abusive situations
- Present as therapy or therapist replacement

### Conflict First Aid Availability
Always available regardless of subscription tier. This is a safety feature, not a premium feature.

---

## 11. Living Profile & Personalization System

### Profile Fields

**Mandatory at signup:**
- Email + password
- Display name
- Relationship mode (solo/partnered)
- Timezone + notification preferences

**Inferred silently over time:**
- Attachment tendency (anxious/avoidant/disorganized/secure)
- Conflict style (avoidant/volatile/validating)
- Love language (words/acts/gifts/time/touch)
- Emotional state (struggling/neutral/thriving)
- Tone sensitivity (reassurance vs accountability seeker)

### Personalization Rules

Peter's behavior adapts based on inferred traits:

| Signal | Adaptation |
|---|---|
| Anxious attachment | Reassurance, clarity, predictability in responses |
| Avoidant attachment | Lower intensity, shorter prompts, space-respecting |
| Volatile conflict style | Mirror energy but add pause suggestion |
| Avoidant conflict style | Low-pressure re-entry micro-steps |
| Words love language | Verbal affirmation woven into responses |
| Physical touch love language | Physical presence suggestions in actions |
| Struggling emotional state | Comfort first, no challenge, soften expectations |
| Thriving emotional state | Match energy, increase challenge |
| High streak | Deepen reflection prompts |

### User Correction Flow

1. User sees trait on Profile page: "You tend to step back when things get heated"
2. Feedback options: "Yes, that's me" / "Not really" / "Not sure"
3. PATCH `/api/profile/traits` with `{ trait_key, feedback }`
4. Weight map: yes → 1.5, unsure → 1.0, not_really → 0.25
5. Trait is still used but with reduced influence

### Vector Memory (Mem0)

After each evening session completion:
- `addMemory()` called with the conversation
- Mem0 auto-extracts key facts ("They mentioned their mother visited", "Partner works late on Thursdays")
- Stored as embeddings in `memories` table (Supabase vector store)
- Retrieved via `searchMemories(userId, latestMessage, 5)` in Peter's personalization block
- Memory window: 90 days rolling (default) or indefinite (user preference)

---

## 12. Partner System

### Linking Flow
1. User A sends invite from the in-app partner invite UI/service layer → creates `partner_invitations` row → `send-partner-invite` Edge Function sends email
2. User B opens link → `/join-partner` page → accepts → `profiles.partner_id` linked on both sides

### Privacy Rules
- Journals and reflections are **private by default**
- No partner access to the other's Peter conversations
- Profile trait labels hidden from partner
- Partner synthesis: never reveals exact words — only synthesized blend
- `partner_syntheses` RLS: SELECT only where `auth.uid() = user_a_id OR auth.uid() = user_b_id`

### What Partners Can See
- That the other completed a day (completion signal)
- Partner Synthesis card (when both complete same day)
- Shared reflection prompts (opt-in per journey)
- Partner's display name and avatar

---

## 13. Business Model & Monetization

### Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 3 daily loops/week, 10 coach messages/day, 1-2 starter quests |
| Premium | $14.99/month or $119.99/year per couple | Full daily engine, full quest library, unlimited coach |

**Launch scope:** only `Free` and `Premium` are part of the authoritative pricing model. "Ultimate" remains a future exploration concept and is intentionally excluded from current entitlements and enforcement rules.

### Enforcement Points

All enforcement is intended to use `resolveEntitlements()` → checks `user_entitlements` table:

1. **Daily session start** (`/api/daily/session/start`): check sessions this week
2. **Coach messages** (`/api/peter/chat`): check `coach_usage_daily`
3. **Journey access** (`/journeys`): check `is_premium` on journey definition
4. Conflict First Aid: always free (safety tool, no gating)

### Payment
- Stripe integration: **NOT YET BUILT** — current subscription is localStorage mock
- Target: $14.99/month per couple, $119.99/year per couple

### Free Tier Always Includes
- Conflict First Aid (safety)
- Crisis support
- 3 daily loops/week
- Partner linking
- Day 1-14 onboarding

---

## 14. Current Implementation Status

Implementation snapshot as of 2026-03-06, based on checked-in repo state. This section is descriptive, not normative.

### ✅ Fully Implemented and Working

- Authentication (Supabase Auth, AuthProvider, protected routes)
- Daily Loop: Morning story generation, evening chat, session completion
- Peter AI: Personalized chat (traits + memories), crisis detection, evening context
- Profile trait inference (fire-and-forget after each session)
- Vector memory (Mem0 OSS with Supabase vector store)
- Weekly Mirror Card (patterns, growth edge, strength — cached weekly)
- Partner Synthesis (EFT couple reflection when both complete same day)
- Day 14 Personalized Graduation Report
- Personalized Conflict First Aid (conflict style + love language guidance)
- Relationship OS Score
- Skill Tree (Day 15+ gate, 5 tracks, XP tracking)
- 14 Journeys (definitions, pages, progress tracking)
- Partner invitation and linking system
- Trust Center (privacy controls, memory settings)
- Assessment page (Hendrick scale)
- Safety system (crisis detection, country resources, outbound moderation)
- Admin KPI dashboard
- Bottom nav (Next.js Link/useRouter — no react-router-dom)
- Vercel config (framework: nextjs)
- All npm dependencies installed

### 🟡 Partial / Needs Work

- **Subscription enforcement**: entitlements exist in DB but no enforcement middleware on session start or journey access
- **Stripe payment**: localStorage mock only — no real payment processing
- **Mem0 initialization**: requires SUPABASE_SERVICE_ROLE_KEY (server-side only key) — not documented in env setup
- **Skill Tree XP earning**: DB schema supports XP but no code awards XP from daily activities
- **Repair-time metric**: no measurement (PRD's primary behavioral outcome)
- **Consent capture at onboarding**: no explicit privacy consent screen
- **Data export**: settings exist but export not implemented
- **Account deletion**: settings exist but cascade delete not implemented
- **Notification plumbing**: preference stored but no actual push/email sending

### 🔴 Not Started (High Priority)

- **Stripe integration** — cannot charge users without this
- **Spaced repetition for skills** — skills decay without revisit cadence
- **Pre-situation coaching** — highest-leverage feature gap (see Section 16)
- **The Couple's Cycle Map** — core EFT intervention (see Section 16)
- **Repair Window flow** — post-conflict debriefing to encode learning
- **Values clarification module** — intrinsic motivation anchor
- **Forgiveness micro-journey** — addresses #1 blocker of relationship change
- **Identity arc tracking** — delta between earliest traits and recent behavior

---

## 15. Prioritized Build Roadmap

Roadmap snapshot as of 2026-03-06. Items here are planned work, not shipped guarantees.

### P0 — Revenue Prerequisites
1. Stripe payment integration (monthly + annual)
2. Subscription enforcement middleware on session start and journey access
3. Server-side entitlement checks (not localStorage)

### P1 — Core Loop Completeness
4. XP earning rules: map daily activity types → skill tracks → XP amounts
5. Skill tree level-up thresholds and progression engine
6. Repair-time metric instrumentation (track time from conflict episode to resolution)
7. Activation metric: Day 3 completion + goal set → emit composite analytics event

### P2 — Psychological Depth (100x Effectiveness)
8. **Couple's Cycle Map** — generate the couple's repeating pattern description using both partners' traits; show in Partner Synthesis and on Profile (see Section 16)
9. **Pre-Situation Coaching** — free-text "anything coming up?" in evening chat, Peter responds with trait-based specific guidance for the upcoming situation
10. **Repair Window Flow** — post-conflict dedicated screen: "How did the repair go?" → structured debrief → tracks repair speed over time
11. **Values Clarification Module** — 5-question exercise at start of journey or Day 3; user's "why" stored and referenced by Peter in hard moments
12. **Identity Arc Tracking** — store earliest trait snapshot; compute delta after 14 days; feed into Peter's language as "you used to... I've watched you..."

### P3 — Retention & Monetization Depth
13. Spaced repetition for skill tree — revisit cadence (Day 21, 42, 84) for each completed skill
14. Weekly summary notifications (email or push) with that week's Mirror Report
15. Forgiveness micro-journey (3-5 day module addressing unresolved resentment)
16. Behavioral specificity feedback in Weekly Mirror ("you made 4 repair attempts this week, up from 1 last week")

### P4 — Privacy & Compliance
17. Consent capture screen at onboarding (before account creation)
18. Data export endpoint (downloadable archive)
19. Account + data deletion flow (cascade, with confirmation)
20. Memory window enforcement (respect 90-day setting in actual data pruning)

### P5 — Tech Debt & Infrastructure
21. Consolidate duplicate auth implementations (delete `src/lib/auth/` directory)
22. Migrate all `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
23. Schema migration history — replace placeholder migrations with real SQL
24. CSP headers — remove `unsafe-eval` and `unsafe-inline` from production
25. Large file refactoring: split `supabaseService.ts` (~29K lines) by domain

---

## 16. The Psychological Effectiveness Framework

This section describes the features that will make Sparq transformatively effective at permanent internal change — not just engagement. These are rooted in EFT, ACT, narrative therapy, and repair science.

### 16.1 The Couple's Cycle Map (Highest Priority)

**What it does:** Names the couple's repeating argument pattern as a *shared system* — not as each other's fault. This is the single most powerful moment in EFT.

**How to build:**
- After both partners have 7+ days of data, GPT synthesizes their attachment + conflict style combination into a "cycle description"
- Example output: "When conflict comes up, one of you tends to press in and the other tends to pull back — you've both probably felt this loop before. The moment you both call it 'the cycle' instead of calling it each other, it loses its grip."
- Shown in: Partner Synthesis card, Profile page "Your Dynamic" section
- Updated quarterly or when traits shift significantly

**Why it works:** Couples who can name their cycle without blame show dramatically faster repair and deeper empathy for each other's behavior.

---

### 16.2 Pre-Situation Coaching (Highest Leverage Gap)

**What it does:** Bridges the insight-to-real-life gap. The app currently only works *after* things happen. This feature activates *before* a hard moment.

**How to build:**
- Add optional free-text at bottom of evening check-in: "Anything coming up that you're thinking about?"
- If user mentions an upcoming hard conversation: Peter responds in next morning's story with trait-specific guidance
- Example: "You mentioned talking to your partner tonight about money. Here's what I know about how you both tend to handle tension..."
- No new tables needed — store in evening_reflection, detect "upcoming" language in morning generation

**Why it works:** The highest-leverage moment for behavioral change is *before* the situation, when the user is calm and can prime their nervous system.

---

### 16.3 The Repair Window

**What it does:** Dedicated post-conflict flow that encodes what worked in the repair — making repair faster over time.

**How to build:**
- When user opens Conflict First Aid and later resolves the episode, trigger a debrief prompt in next evening's chat: "Something tough came up yesterday. How did you two come back together?"
- Structured follow-up questions: "What did you do that helped? What would you do differently?"
- Track and display repair speed trend in Relationship OS Score
- New metric: avg hours from `conflict_episodes.started_at` to `resolved_at`

**Why it works:** Repair skill is learned by studying what worked — not just by having good intentions.

---

### 16.4 Values Clarification Module

**What it does:** Anchors the user's daily practice to their deepest *why* — converting extrinsic motivation (streaks) to intrinsic (values-based).

**How to build:**
- 5-question exercise at Day 3 or journey start
- Questions: "What kind of partner do you want to be in 5 years?", "What does a great relationship feel like for you?", "Why does this matter to you at your core?"
- Store as `user_values` (or in user_preferences JSONB)
- Peter references the user's stated values in hard moments: "You said being a steady presence for your partner is what you want most. This moment is that."

**Why it works:** ACT research: behavior change driven by personal values is more durable and requires less willpower than behavior change driven by rules or fear.

---

### 16.5 Identity Arc Tracking

**What it does:** Peter narrates the user's growth arc — who they were vs. who they're becoming. This is the identity-level intervention that makes change feel real and worth continuing.

**How to build:**
- Store earliest trait snapshot (Day 3 or first confident inference) in a `trait_snapshots` table
- After Day 14: compute delta between snapshot and current state
- Feed delta into: Day 14 Graduation Report (already implemented), Weekly Mirror, evening responses
- Peter language: "You used to pull away every time conflict came up. I've watched you stay present three times this week. That's who you're becoming."

**Why it works:** Identity-level language ("I am becoming...") creates more durable change than behavioral language ("I did X"). James Clear: every action is a vote for the identity you're becoming.

---

### 16.6 The Forgiveness Module

**What it does:** Addresses the #1 silent blocker of relationship change — unresolved resentment. Without this, users hit a ceiling no matter how many tools they learn.

**How to build:**
- 3-5 day micro-journey within the skill tree under "Trust & Security"
- Day 1: Name the hurt specifically (private to Peter — never shared)
- Day 2: Explore what the hurt means about your needs
- Day 3: Separate the person from the action
- Day 4: The internal release — "choosing to put this down" as a self-interested act, not a favor
- Day 5: What you want the relationship to be from here
- Peter holds this space with exceptional gentleness — no fixing, only witnessing

**Why it works:** Forgiveness is not about the other person — it's about releasing the user from the weight of carrying the hurt. It's the doorway to genuine change.

---

### 16.7 Spaced Repetition for Skills

**What it does:** Prevents skill regression. Relationship skills learned without reinforcement revert to baseline within 3-6 weeks.

**How to build:**
- When a user completes a skill module, schedule revisit events: Day +21, +42, +84
- Revisit: shorter version of the original skill (5 min instead of full session)
- Slightly harder challenge each time (Basic review → Advanced application → Expert teaching-back)
- Store revisit schedule in `skill_progress` table (add `next_revisit_at` column)
- Surface in Dashboard as "Time to revisit: Active Listening"

**Why it works:** Spaced repetition is the most proven method for encoding skills into long-term memory. Language learning apps (Anki, Duolingo) apply this to cognitive skills. Relationship skills are no different.

---

### 16.8 Behavioral Specificity Feedback

**What it does:** Show users their behavioral change in concrete terms, not abstract scores.

**How to build:**
- Track specific micro-behaviors in evening reflections via NLP in profile-analysis:
  - Repair attempt ("I apologized", "we talked it through")
  - Vulnerability ("I told them how I really felt")
  - De-escalation ("I took a pause", "I stepped away")
  - Curiosity ("I asked instead of assuming")
- Store as behavioral events in analytics_events
- Weekly Mirror includes: "This week you made 4 repair attempts. Last week: 1."
- Relationship OS Score breakdown shows week-over-week behavioral change

**Why it works:** People cannot see their own growth from the inside. Specific behavioral data — not abstract scores — creates the experience of "I'm actually changing."

---

## 17. Known Technical Debt

| Issue | Priority | Location |
|---|---|---|
| Stripe payment not integrated | P0 — blocks revenue | `src/pages/subscription.tsx` |
| Subscription is localStorage mock | P0 — security risk | `src/lib/subscription-provider.tsx` |
| Legacy Supabase client (Vite env vars) | Medium | `src/integrations/supabase/client.ts` |
| `api-config.ts` uses `import.meta.env` | Medium | `src/lib/api-config.ts` |
| Duplicate auth implementations | Low | `src/lib/auth/` (10 files, unused) |
| 3 duplicate ProtectedRoute components | Low | Multiple locations |
| 2 duplicate useAuth hooks | Low | `src/hooks/useAuth.ts` + `useAuth.tsx` |
| `MetaphorAnimation.tsx` is 24K lines | Low | `src/components/MetaphorAnimation.tsx` |
| `supabaseService.ts` is 29K lines | Low | `src/services/supabaseService.ts` |
| Schema migration history is placeholder files | Medium | `supabase/migrations/` |
| `.env` has hardcoded credentials | High — security | `.env` (should be `.env.local` only) |
| CSP headers have `unsafe-eval` | Medium | `vercel.json` |
| Duplicate preferences endpoints create API ambiguity | Medium | `/api/preferences` + `/api/profile/preferences` |
| Admin KPI endpoint depends on `is_admin()` existing in every environment | Medium | `/api/admin/kpis.ts` + database RPC |

---

## 18. Environment Variables

### Required (App Will Not Work Without These)

```env
# Supabase — canonical client (src/lib/supabase.ts)
NEXT_PUBLIC_SUPABASE_URL=https://ujqdnyxdenadpowxrkjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# Supabase — server-side only (for Mem0 vector store, service-level operations)
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# OpenRouter — Peter AI chat and analysis
OPENROUTER_API_KEY=<key>

# OpenAI — trait analysis (profile-analysis.ts), outbound moderation, date ideas, Mem0 embeddings
OPENAI_API_KEY=<key>
```

### Optional (Features Degrade Gracefully Without These)

```env
# Mem0 cloud (not used — OSS version via Supabase vector store is primary)
NEXT_PUBLIC_MEM0_API_KEY=<key>

# Google Places API — date ideas location features
NEXT_PUBLIC_GOOGLE_API_KEY=<key>

# Legacy Vite env vars (tech debt — still referenced in legacy files)
VITE_SUPABASE_URL=<same as NEXT_PUBLIC_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<same as anon key>
VITE_OPENAI_API_KEY=<same as OPENAI_API_KEY>
```

### Security Warning
The `.env` file committed to the repository contains real Supabase credentials. This file should be deleted from git history and added to `.gitignore`. All secrets should live in `.env.local` (already gitignored by Next.js).

---

## 19. Development Commands

```bash
npm install          # Install all dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (check for lint errors)
npm start            # Start production server
npm run lint         # ESLint (next lint)
npx playwright test  # Run all E2E tests
```

### Local Supabase (Optional)
```bash
supabase start       # Start local Supabase
supabase db reset    # Reset local DB (applies all migrations)
supabase functions serve  # Serve Edge Functions locally
```

### Deploying Edge Functions
```bash
supabase functions deploy send-partner-invite
supabase functions deploy memory-operations
```

### E2E Test Coverage
- `01-auth.spec.ts` — Login, redirect, logout
- `02-onboarding.spec.ts` — Peter welcome, 5-turn conversation, progression
- `03-daily-growth.spec.ts` — Full daily loop flow
- `04-skill-tree.spec.ts` — Locked gate, unlock, 5 tracks
- `05-dashboard.spec.ts` — Dashboard features and cards
- `06-safety-trust.spec.ts` — Crisis detection, trust center controls
- `07-daily-session-reliability.spec.ts` — Session state machine reliability

---

## Appendix: The 14 Morning Story Concepts (Days 1-14)

| Day | Concept | Focus |
|-----|---------|-------|
| 1 | Listening without planning your response | Presence |
| 2 | Expressing appreciation for small things | Gratitude |
| 3 | Asking instead of assuming | Curiosity |
| 4 | Taking a breath before reacting | Regulation |
| 5 | Noticing what your partner does right | Positive attention |
| 6 | Sharing something vulnerable | Intimacy |
| 7 | Asking "what do you need right now?" | Attunement |
| 8 | Celebrating a small win together | Joy |
| 9 | Saying sorry without "but" | Clean repair |
| 10 | Making time for connection without phones | Presence |
| 11 | Checking in with yourself before a hard conversation | Self-awareness |
| 12 | Finding the funny side of a disagreement | Levity |
| 13 | Telling your partner one thing you admire | Appreciation |
| 14 | Planning one small thing to look forward to together | Shared future |

---

## Appendix: Skill Track Recommended Triggers

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

*This document is the authoritative source of truth for Sparq Connection. Any agent building, modifying, or auditing this codebase should treat this document as the primary reference. When this document conflicts with any other file, this document takes precedence — except for actual running code, which represents the current implementation state.*
