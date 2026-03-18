---
name: sparq-architecture
description: "Core architecture and spec reference for the Sparq Connection relationship app. Use this skill whenever working on ANY Sparq Connection feature, component, database query, API endpoint, or bug fix. Always consult this before writing Sparq code."
---

# Sparq Connection — Architecture Skill

## What Is Sparq?

Sparq Connection is an AI-powered relationship enhancement app grounded in **EFT (Emotionally Focused Therapy)**, **ACT (Acceptance and Commitment Therapy)**, **Gottman Method**, and **Narrative Therapy** frameworks. It is a "relationship gym" — not therapy. It uses structured daily practice, AI coaching, and partner synchronization to build lasting behavioral change in couples.

**Key constraint**: No crisis intervention features, no diagnostic language, no clinical claims. Peter (the AI coach) is a guide, not a therapist.

---

## Mascot: Peter the Otter

Peter the otter appears throughout the UX as a warm, wise companion. He delivers morning stories, facilitates evening reflections, and adapts his personality based on inferred user traits (attachment style, conflict style, love language). He speaks like a caring friend — never preachy, never clinical.

- Avatar component: `src/components/PeterAvatar.tsx`
- Speech bubble: `src/components/PeterSpeechBubble.tsx`
- Loading screen: `src/components/PeterLoading.tsx` (always use this for loading states)
- Chat API: `POST /api/peter/chat`
- Morning story API: `GET /api/peter/morning`
- Model: OpenRouter → Claude Haiku 4.5 (primary), with fallback chain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 13 (Pages Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Backend/DB | Supabase (PostgreSQL, Auth, Realtime, Edge Functions, pgvector) |
| AI (chat) | OpenRouter → Claude Haiku 4.5 |
| AI (analysis) | OpenAI GPT-4o-mini (trait inference, moderation, embeddings) |
| Memory | Mem0 OSS + Supabase pgvector |
| Animation | Framer Motion |
| State | React Context (Auth, Subscription) + TanStack React Query |
| Deployment | Vercel |

---

## Core Architecture: The Daily Loop

The Daily Loop is the core engagement engine — a 3-phase daily cycle over 14 days.

### Phase 1: Morning Story (Read — 2 min)
- `POST /api/daily/session/start` → creates/resumes `daily_sessions` row
- `GET /api/peter/morning` → OpenRouter generates personalized therapeutic story
- Story uses the day's relationship concept (14 concepts mapped to 14 days)
- Page: `/daily-growth`

### Phase 2: Daily Action (Do — throughout the day)
- Micro-action derived from morning concept
- Displayed on Dashboard via `TodaysFocusCard`
- User marks complete when done

### Phase 3: Evening Chat (Reflect — 5 min)
- `POST /api/peter/chat` — 3-5 turn conversation with Peter
- Context: morning story, daily action, user traits, vector memories
- On completion: `PATCH /api/daily/session/complete`
- **Post-completion triggers** (fire-and-forget):
  - Trait inference: `POST /api/profile/analyze`
  - Memory storage: Mem0 `addMemory()` → pgvector embeddings
  - Partner synthesis: If both partners completed → shared reflection generated

### Session State Machine
```
morning_pending → morning_complete → evening_pending → evening_complete
```
Stored in `daily_sessions.phase`. Unique constraint: one session per user per day.

### 14-Day Concept Progression
Days 1-14 cover: Presence → Gratitude → Curiosity → Regulation → Positive Attention → Intimacy → Attunement → Joy → Clean Repair → Presence → Self-Awareness → Levity → Appreciation → Shared Future

---

## Core Architecture: Skill Tree

Unlocks after Day 14 graduation. Provides ongoing structured growth.

### 5 Tracks
1. **Communication** — expressing needs, active listening, bid recognition
2. **Conflict Repair** — de-escalation, soft startup, repair attempts
3. **Emotional Intimacy** — vulnerability, empathic responding, emotional check-ins
4. **Trust & Security** — consistency rituals, boundary respect, secure base
5. **Shared Vision** — values alignment, dream sharing, life vision mapping

### Progression
- Levels: Locked → Beginner → Intermediate → Advanced
- XP earned from daily activities → `skill_progress` table
- Gate: `profiles.discovery_day >= 15`
- Page: `/skill-tree`
- Graduation report recommends a starting track based on user's inferred traits

---

## Supabase Patterns

### Auth
- Supabase Auth with email/password
- Auth context: `src/lib/auth-context.tsx` — provides `user`, `profile`, `session`, `login`, `logout`
- API auth middleware: `src/lib/server/supabase-auth.ts` → `getAuthedContext()` returns `{ supabase, userId }`

### RLS Policies
- All tables have RLS enabled
- Core pattern: users read/write only their own rows
- Partners can read each other's profile (via `partner_id`)
- Partner syntheses: SELECT where `auth.uid() = user_a_id OR auth.uid() = user_b_id`
- Admin bypass via `is_admin()` database function

### Realtime
- Used for partner sync (completion signals, synthesis availability)
- Subscribe to `daily_sessions` changes filtered by partner's user ID

### Edge Functions
- `send-partner-invite` — sends invitation emails with invite codes
- `memory-operations` — CRUD for Mem0-style relationship memories

### Supabase Client
- **Canonical**: `src/lib/supabase.ts` (uses `process.env.NEXT_PUBLIC_*`)
- **Legacy** (do not use for new code): `src/integrations/supabase/client.ts`

---

## Database Schema (Key Tables)

> Full schema with column definitions: see `references/architecture-overview.md`

### User Domain
- `profiles` — user profile, partner link, discovery_day, streak, points
- `profile_traits` — inferred psychological traits (attachment, conflict style, love language)
- `user_preferences` — notification, privacy, AI memory settings
- `user_entitlements` — subscription tier and period
- `user_roles` — RBAC (user, admin, partner)

### Daily Loop
- `daily_sessions` — one row per user per day, tracks phase progression
- `daily_questions` / `daily_question_responses` — question bank and answers

### Journeys & Skills
- `journeys` / `journey_questions` / `user_journeys` / `journey_responses`
- `skill_progress` — track, skill, level, XP per user

### Partner System
- `partner_invitations` — invite codes with 7-day expiry
- `partner_syntheses` — AI-generated shared reflections when both complete

### AI & Memory
- `memories` — pgvector embeddings for semantic search (Mem0)
- `weekly_insights` — patterns, growth edge, strength (cached weekly)
- `graduation_reports` — Day 14 personalized reports

### Safety & Analytics
- `conflict_episodes` — conflict tracking with resolution timestamps
- `vulnerability_escrow` — encrypted sensitive content
- `analytics_events` / `user_activities` — event logging

---

## Key File Paths

| Purpose | Path |
|---|---|
| Auth context | `src/lib/auth-context.tsx` |
| Supabase client | `src/lib/supabase.ts` |
| API auth middleware | `src/lib/server/supabase-auth.ts` |
| Trait analysis | `src/lib/server/profile-analysis.ts` |
| Entitlements | `src/lib/server/entitlements.ts` + `src/lib/product.ts` |
| Memory (Mem0) | `src/lib/server/memory.ts` |
| Safety system | `src/lib/safety.ts` |
| Morning parser | `src/lib/morning-parser.ts` |
| Daily session APIs | `src/pages/api/daily/session/` |
| Peter AI APIs | `src/pages/api/peter/` |
| Dashboard | `src/pages/dashboard.tsx` |
| Daily growth | `src/pages/daily-growth.tsx` |
| Skill tree | `src/pages/skill-tree.tsx` |
| Peter avatar | `src/components/PeterAvatar.tsx` |
| Peter loading | `src/components/PeterLoading.tsx` |

---

## Key Constraints

1. **Not therapy**: No diagnostic language, no clinical claims, no crisis intervention. Peter is a "relationship coach," not a therapist.
2. **Privacy by default**: Journals and reflections are private. Partners never see each other's Peter conversations or raw trait data. Partner synthesis reveals only blended themes, never exact words.
3. **Safety**: Crisis detection keywords trigger safety response with hotline numbers. Outbound moderation on all AI responses. Conflict First Aid is always free (safety tool, never gated).
4. **Loading UX**: Always use `<PeterLoading isLoading />` for loading states — never bare spinners or "Loading..." text.
5. **Subscription**: Free tier: 3 daily loops/week, 10 coach messages/day. Premium: $14.99/mo. Stripe not yet integrated (localStorage mock). Enforcement via `resolveEntitlements()`.

---

## API Route Map

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/daily/session/start` | Create/resume today's session |
| PATCH | `/api/daily/session/complete` | Advance session phase |
| GET | `/api/daily/session/status` | Current session state |
| GET | `/api/peter/morning` | Generate morning story |
| POST | `/api/peter/chat` | Evening conversation turn |
| GET/PATCH | `/api/me` | User profile |
| GET/PATCH | `/api/profile/traits` | Trait labels + feedback |
| POST | `/api/profile/analyze` | Trait inference (fire-and-forget) |
| GET | `/api/preferences` | User preferences |
| GET | `/api/conflicts/first-aid` | Personalized conflict guidance |
| GET | `/api/journeys/progress` | Journey completion state |
| GET | `/api/admin/kpis` | Admin dashboard metrics |

---

## Cross-Skill References

- **For database schema, RLS, and migrations**: see `sparq-db` skill
- **For Peter's personality, prompts, and copy**: see `sparq-peter` skill
- **For psychology modalities and content personalization**: see `sparq-psychology` skill
- **For UI components, design tokens, and animations**: see `sparq-ui` skill
- **For testing patterns and E2E infrastructure**: see `sparq-testing` skill

---

*For full database schema definitions and deeper architectural detail, see `references/architecture-overview.md`.*
