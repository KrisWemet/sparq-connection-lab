---
name: sparq-db
description: "Database schema, Supabase patterns, RLS policies, Edge Functions, realtime subscriptions, migrations, and query patterns for Sparq Connection. Use this skill whenever working on ANY database migration, Supabase query, RLS policy, Edge Function, realtime subscription, data model change, or API route that touches the database in Sparq Connection."
---

# Sparq Connection — Database & Supabase Patterns

## Schema Overview

Sparq uses **Supabase** (PostgreSQL) with RLS on every table. The schema is defined in `supabase/schema.sql` (base) plus 11 real migrations in `supabase/migrations/`.

> Full table definitions with columns: see `references/schema.md`

### Table Map

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER DOMAIN                                                        │
│  profiles ←──── user_roles          user_preferences                │
│     │           user_entitlements    profile_traits (AI-inferred)     │
│     │                                                               │
│  PARTNERSHIPS                                                       │
│  profiles.partner_id ←→ profiles    (bidirectional link)            │
│  partner_invitations                (7-day expiring invite codes)    │
│  partner_syntheses                  (shared AI reflections)          │
│  vulnerability_escrow               (mutual-unlock deep prompts)    │
│                                                                     │
│  DAILY LOOP                                                         │
│  daily_sessions                     (1 per user per day, 4-phase)   │
│  daily_questions → daily_question_responses                         │
│                                                                     │
│  JOURNEYS                                                           │
│  journeys → journey_questions                                       │
│  user_journeys     (progress per user per journey)                  │
│  journey_responses (answers to journey questions)                   │
│                                                                     │
│  SKILL TREE                                                         │
│  skill_progress    (per-skill level + XP)                           │
│  user_skill_tracks (aggregate XP per track, level-up via RPC)       │
│                                                                     │
│  AI & INSIGHTS                                                      │
│  memories          (pgvector embeddings for Mem0 semantic search)   │
│  weekly_insights   (cached weekly analysis: patterns, growth edge)  │
│  graduation_reports (Day 14 personalized report)                    │
│  profile_traits    (attachment, conflict, love language inferences)  │
│                                                                     │
│  SAFETY & TRACKING                                                  │
│  conflict_episodes      (conflict → resolution tracking)            │
│  outcome_assessments    (milestone assessments with scores)         │
│  analytics_events       (event log: event_name + event_props)       │
│  user_activities        (activity log: activity_type + details)     │
│                                                                     │
│  OTHER                                                              │
│  goals → goal_milestones    (user goal tracking)                    │
│  date_ideas → user_date_ideas (catalog + user saves)                │
│  system_settings            (admin key-value config)                │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Relationships

- `profiles.id` references `auth.users(id)` — every auth user has a profile
- `profiles.partner_id` → `profiles.id` — bidirectional partner link (both sides set)
- `partner_invitations.sender_id` → `auth.users(id)` — invite flow creates link on acceptance
- `daily_sessions` unique on `(user_id, session_local_date)` — one session per user per day
- `journey_responses` unique on `(user_id, question_id)` — one answer per question
- `user_skill_tracks` primary key `(user_id, track_key)` — one row per user per track
- `partner_syntheses` unique on `(user_a_id, user_b_id, day_index)` — one synthesis per couple per day
- `vulnerability_escrow` unique on `(couple_id, prompt_id, user_id)` — one response per user per prompt

### Custom Enums

```sql
user_role:          'user' | 'admin' | 'partner'
relationship_type:  'monogamous' | 'polyamorous' | 'lgbtq' | 'long-distance'
journey_type:       'communication' | 'intimacy' | 'trust' | 'growth' | 'conflict'
subscription_tier:  'free' | 'premium' | 'platinum'
invitation_status:  'pending' | 'accepted' | 'declined' | 'expired'
question_modality:  'reflection' | 'discussion' | 'activity'
love_language:      'words-of-affirmation' | 'acts-of-service' | 'receiving-gifts' | 'quality-time' | 'physical-touch'
gender:             'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
```

---

## Supabase Auth Patterns

### Client-Side Auth

Auth context lives in `src/lib/auth-context.tsx`, wired into `_app.tsx`.

```tsx
import { useAuth } from "@/lib/auth-context";
const { user, profile, session, loading, login, logout, updateProfile } = useAuth();
```

- `login(email, password)` → calls `supabase.auth.signInWithPassword()`
- `register(email, password, { name })` → creates auth user + profile row
- Profile is fetched on auth state change via `supabase.auth.onAuthStateChange()`

### Server-Side Auth (API Routes)

All API routes authenticate via `getAuthedContext()` from `src/lib/server/supabase-auth.ts`:

```tsx
import { getAuthedContext } from "@/lib/server/supabase-auth";

export default async function handler(req, res) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: "Unauthorized" });

  // ctx.supabase — client scoped to this user's JWT (respects RLS)
  // ctx.userId  — the authenticated user's UUID
  const { data } = await ctx.supabase.from("profiles").select("*").eq("id", ctx.userId).single();
}
```

The middleware extracts the `Authorization: Bearer <token>` header and creates a Supabase client scoped to that user's JWT. This means **RLS policies are automatically enforced** on all queries.

### Profile Creation

No database trigger — profiles are created client-side during registration in `auth-context.tsx`. The `register()` function calls `supabase.auth.signUp()` then inserts into `profiles`.

### Partner Invitation Flow

1. User A calls partner invite UI → inserts into `partner_invitations` (status: pending, 7-day expiry)
2. `send-partner-invite` Edge Function sends email with invite link
3. User B opens `/join-partner` → accepts → both `profiles.partner_id` updated to point at each other

---

## RLS (Row Level Security)

**Every table has RLS enabled.** Four policy patterns are used:

| Pattern | SQL Shape | Used By |
|---|---|---|
| **User-scoped** | `auth.uid() = user_id` | Most tables (daily_sessions, user_journeys, goals, etc.) |
| **Partner-visible** | `auth.uid() IN (user_a_id, user_b_id)` | partner_syntheses, vulnerability_escrow |
| **Profile + partner** | Own profile + partner via subquery | profiles |
| **Admin override** | `public.is_admin(auth.uid())` | profiles, user_roles, partner_invitations, user_entitlements |
| **Public read** | `FOR SELECT USING (true)` | journeys, journey_questions, daily_questions, date_ideas |

Key rules:
- Always enable RLS immediately after creating a table
- `service_role` key bypasses all RLS — Edge Functions need no policies, API routes using user JWT do
- Use `WITH CHECK` (not `USING`) for `INSERT` policies
- Add admin override policy for any table that needs admin dashboard access

> Full per-table policy definitions: see `references/rls-policies.md`

---

## Edge Functions

Located in `supabase/functions/`. Each has its own directory with `index.ts`.

| Function | Purpose | Trigger |
|---|---|---|
| `memory-operations` | Mem0 CRUD (get, set, delete, search, batchGet, clear) | API call |
| `send-partner-invite` | Send invite email via SendGrid | Partner invite UI |
| `generate-daily-insight` | Generate daily relationship insight | Scheduled / API |
| `send-tonight-action` | Send evening action reminders | Scheduled |
| `stripe-checkout` | Stripe payment integration | Subscription page |

### Conventions
- All functions import CORS headers from `_shared/cors.ts`
- Use `SUPABASE_SERVICE_ROLE_KEY` for privileged operations (not user-scoped)
- AI processing (LLM calls) is done in **Next.js API routes** (`src/pages/api/`), not Edge Functions
- Edge Functions are used for: email sending, scheduled tasks, memory CRUD, payment webhooks
- Deploy: `supabase functions deploy <function-name>`

### When to Use Edge Functions vs API Routes
- **Edge Functions**: Background jobs, scheduled tasks, operations needing service role, third-party webhooks
- **API Routes** (`src/pages/api/`): User-facing requests, AI generation (morning story, chat, trait analysis), anything needing the user's JWT context

> Annotated template with full example: see `references/edge-function-template.md`

---

## Realtime Subscriptions

Realtime is used for partner synchronization. Implementation in `src/hooks/useRealtimeSync.ts`.

### Presence (Partner Online Status)
```tsx
const channel = supabase.channel(`presence:${partnerId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    setPartnerIsOnline(Object.keys(state).length > 0);
  })
  .subscribe();
```

### Postgres Changes (Partner Progress)
```tsx
supabase.channel('journey_progress')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_journey_progress',
    filter: `user_id=eq.${partnerId}&journey_id=eq.${journeyId}`
  }, (payload) => {
    setPartnerProgress(payload.new);
  })
  .subscribe();
```

### Tables with Realtime Subscriptions
- `user_journey_progress` — partner journey progress updates
- `activity_responses` — partner activity completion signals
- `partner_invitations` — invitation status changes

### Cleanup
Always unsubscribe on component unmount:
```tsx
useEffect(() => {
  const channel = supabase.channel('...');
  // ... setup ...
  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## Migration Conventions

### Naming
```
YYYYMMDDHHMMSS_descriptive_name.sql
```
Example: `20260302120000_create_missing_tables.sql`

### Structure
Migrations are in `supabase/migrations/`. Current state:
- **15 placeholder files** (empty, from pre-migration era — schema applied directly to remote)
- **11 real migrations** with SQL content (20260301+)

### Writing Migrations

1. Always use `IF NOT EXISTS` / `IF EXISTS` guards for idempotency:
```sql
CREATE TABLE IF NOT EXISTS my_table (...);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'new_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN new_column TEXT;
  END IF;
END $$;
```

2. Always enable RLS and create policies immediately after creating a table:
```sql
CREATE TABLE IF NOT EXISTS my_table (...);
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own data" ON my_table
  FOR ALL USING (auth.uid() = user_id);
```

3. Add indexes for columns used in WHERE/JOIN/ORDER BY:
```sql
CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table (user_id);
```

4. Test locally: `supabase db reset` applies all migrations in order.

---

## Type Generation

### Generating Types from Supabase

```bash
npx supabase gen types typescript --project-id ujqdnyxdenadpowxrkjn > src/types/supabase.ts
```

Re-run this after any migration to keep TypeScript types in sync with the database schema.

### Existing Type Files

| File | Contents |
|---|---|
| `src/types/supabase.ts` | Auto-generated Supabase types (Database, Tables, Enums) |
| `src/types/profile.ts` | Profile, UserBadge, DailyActivity types |
| `src/types/journey.ts` | Journey, JourneyQuestion types |
| `src/types/quiz.ts` | Quiz question/answer types |
| `src/types/memory.ts` | Memory storage types |

### Manual Types in `src/lib/supabase.ts`

The canonical Supabase client also exports manually-defined types:

```typescript
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  partner_id?: string;
  subscription_tier: string;
  is_onboarded: boolean;
  // ... etc
};
```

These are used by `auth-context.tsx` and most components. When the schema changes, update both the generated types and these manual types.

---

## Query Patterns

### Basic CRUD
```tsx
// Single row by ID
const { data, error } = await supabase
  .from("profiles").select("*").eq("id", userId).single();

// Single row that may not exist (no error if missing)
const { data } = await supabase
  .from("user_preferences").select("*").eq("user_id", userId).maybeSingle();

// Insert
await supabase.from("journey_responses").insert([{ user_id, journey_id, question_id, answer }]);

// Upsert (idempotent write)
await supabase.from("daily_sessions").upsert(
  { user_id, session_local_date, day_index, status: "morning_ready" },
  { onConflict: "user_id,session_local_date" }
);

// Update + return updated row
const { data } = await supabase
  .from("daily_sessions")
  .update({ status: "completed", evening_completed_at: new Date().toISOString() })
  .eq("id", sessionId).eq("user_id", userId)
  .select("*").single();
```

### Relational Queries
```tsx
// Join journey questions with their journey
const { data } = await supabase
  .from("journey_questions")
  .select("*, journeys:journey_id(title, type)")
  .eq("journey_id", journeyId)
  .order("sequence_number");

// Get user's active journeys with journey details
const { data } = await supabase
  .from("user_journeys")
  .select("*, journeys:journey_id(*)")
  .eq("user_id", userId)
  .eq("is_active", true);
```

### Partner Data Joins
```tsx
// Get partner's profile via the partner_id link
const { data: myProfile } = await supabase
  .from("profiles").select("partner_id").eq("id", userId).single();

if (myProfile?.partner_id) {
  const { data: partner } = await supabase
    .from("profiles").select("*").eq("id", myProfile.partner_id).single();
}
```

### Skill Tree Aggregations
```tsx
// Get all track progress for a user
const { data } = await supabase
  .from("user_skill_tracks")
  .select("*")
  .eq("user_id", userId);

// Award XP via RPC (handles level-up logic server-side)
await supabase.rpc("award_skill_xp", {
  p_user_id: userId,
  p_track: "communication",
  p_xp: 20
});
```

### Pagination
```tsx
const PAGE_SIZE = 20;
const { data, count } = await supabase
  .from("analytics_events")
  .select("*", { count: "exact" })
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

### Fire-and-Forget (Background Tasks)
```tsx
// Don't await non-critical operations — let them run in background
supabase.from("analytics_events").insert([{
  user_id: userId, event_name: "session_completed", event_props: { day: 5 }
}]);  // No await — fire and forget

// For critical background work, use Promise.all but don't block the response
Promise.all([
  supabase.from("analytics_events").insert([...]),
  fetch("/api/profile/analyze", { method: "POST", ... }),
]).catch(err => console.error("Background task failed:", err));
```

---

## Performance Considerations

### Indexes
The schema defines 22 indexes. Key patterns:
- Every `user_id` foreign key is indexed
- `daily_sessions` has a partial index: `(user_id, day_index DESC) WHERE status = 'completed'`
- `analytics_events` indexed on `(event_name, created_at)` for filtered time-range queries
- `partner_invitations` indexed on both `sender_id` and `recipient_email`

### Avoiding N+1
- Use Supabase's relational select syntax instead of multiple queries:
  ```tsx
  // Good: single query with join
  .from("journey_questions").select("*, journeys:journey_id(title)")

  // Bad: N+1
  const questions = await supabase.from("journey_questions").select("*");
  for (const q of questions) {
    await supabase.from("journeys").select("title").eq("id", q.journey_id);
  }
  ```

### Use `.maybeSingle()` for Optional Rows
```tsx
// Good: returns null if no row exists
const { data } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();

// Bad: throws PGRST116 error if no row exists
const { data } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single();
```

### Upsert for Idempotency
Always use upsert with `onConflict` for operations that might be retried:
```tsx
await supabase.from("daily_sessions").upsert(data, { onConflict: "user_id,session_local_date" });
```

### Supabase Client Singleton
- **Client-side**: `src/lib/supabase.ts` exports a singleton. Never create new clients in components.
- **Server-side**: `getAuthedContext()` creates a per-request client scoped to the user's JWT. This is correct — don't cache server-side clients across requests.

---

## Key Files

| Purpose | Path |
|---|---|
| Base schema | `supabase/schema.sql` |
| Migrations | `supabase/migrations/` (11 real, 15 placeholder) |
| Supabase client (canonical) | `src/lib/supabase.ts` |
| Supabase client (legacy) | `src/integrations/supabase/client.ts` |
| Server auth middleware | `src/lib/server/supabase-auth.ts` |
| Analytics helper | `src/lib/server/analytics.ts` |
| Entitlements resolver | `src/lib/server/entitlements.ts` |
| Memory (Mem0 stub) | `src/lib/server/memory.ts` |
| Profile analysis | `src/lib/server/profile-analysis.ts` |
| Partner synthesis | `src/lib/server/partner-synthesis.ts` |
| Realtime hook | `src/hooks/useRealtimeSync.ts` |
| Edge Functions | `supabase/functions/` |

---

## Cross-Skill References

- **For architecture overview and API route map**: see `sparq-architecture` skill
- **For Peter AI prompts and personalization pipeline**: see `sparq-peter` skill
- **For psychology content and trait interpretation**: see `sparq-psychology` skill
- **For testing patterns, mocking Supabase, and fixtures**: see `sparq-testing` skill

---

*Full SQL table definitions: see `references/schema.md`*
