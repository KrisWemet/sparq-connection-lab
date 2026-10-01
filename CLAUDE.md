# CLAUDE.md — Sparq Connection Lab

This file provides comprehensive context for AI assistants working on this codebase. Read the product context section first — every time, without skipping.

> **Product constitution (v1.2):** [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) defines Sparq's governing principles — *Sparq helps people discover who they want to become, understand why it matters, and practice becoming that person in the real world*; the user chooses the destination and Sparq helps lead the path; the Transformation Engine; hypotheses never diagnoses; Peter's conversation modes; memory discipline; and private/shared privacy boundaries. Read it before planning any feature. Its "Constitutional test" applies to every major feature. Implementation map: `docs/CONSTITUTION_AUDIT.md` (status + §13 checklist), `docs/PERSON_MODEL.md`, `docs/RELATIONSHIP_MODEL.md`, `docs/METRICS.md`, `docs/INFLUENCE_AUDIT.md` (v1.1 conflicts: fixed vs. still to fix), `docs/TRANSFORMATION_ENGINE.md` (v1.2 map + build status — missions, Deep Why, identity evidence, rites of passage; migration `20261001100000` **written, not applied**), `docs/PRIMING_AUDIT.md` (design-influence elements by review tier), `docs/evals/resistance-handling.md` (Peter pushback and leadership cases). It is the source of truth for everything it covers; where it is silent, the rest of this file and the Master PRD apply.

---

# SPARQ PRODUCT CONTEXT
## Read this before touching anything. Load the relevant skill before writing any code.

---

## Skill Loading — Do This First

Before working in any of these domains, read the corresponding skill file:

| Domain | Skill to load |
|---|---|
| Psychology content, questions, exercises, personalization | `.claude/skills/sparq-psychology` |
| Language, copy, influence patterns, voice | `.claude/skills/sparq-psychology/references/language-framework` |
| Peter (SVG, animations, copy, poses, voice) | `.claude/skills/sparq-peter` |
| Database schema, Supabase patterns | `.claude/skills/sparq-db` |
| UI components, design tokens, layout | `.claude/skills/sparq-ui` |
| Architecture decisions, API patterns | `.claude/skills/sparq-architecture` |
| Frontend design quality | `.claude/skills/frontend-design` |

If you're not sure which skill applies — load `sparq-psychology` and `sparq-architecture` as defaults. If you are writing any user-facing copy — also load the language framework.

---

## What Sparq Is

**Sparq Connection** is a relationship growth app for committed couples. Core belief: stronger individuals create stronger relationships.

It is a **relationship gym** — not therapy, not a wellness platform, not a gamified couples game. Users come here to build a consistent practice that compounds into real change over time.

The transformation arc: **autopilot → intentional → deeply connected.**

Sparq integrates evidence-based modalities (Gottman, EFT, ACT, CBT, Positive Psychology, Attachment Theory, IFS, Mindfulness, NVC, Somatic, Narrative Therapy, DBT-informed skills, Transactional Analysis), with Influence Psychology as a supplementary layer (constitution §1B). This is the core competitive advantage. See `sparq-psychology` skill for the full framework.

---

## Who It's For

**Primary user:** Committed couples (married or long-term) who want to grow — not in crisis, self-aware, willing to put in effort. They are not looking for a therapist. They are looking for a consistent practice.

**Secondary user:** Couples who feel distance or stagnation and want a low-barrier path back toward each other — without the weight of "we need therapy."

**Not for:** Couples in active crisis, casual daters, passive entertainment seekers.

---

## What It Must Feel Like

Sparq must feel:
- **Warm** — like it was made by someone who cares about your relationship
- **Intelligent** — grounded, not fluffy
- **Emotionally safe** — never judgmental, never clinical
- **Intimate** — like a well-designed journal, not a dashboard
- **Occasionally playful** — especially through Peter, never forced

It must never feel like: a corporate HR tool, a generic self-help app, a gamified points machine, a cold SaaS dashboard, a therapy intake form.

**The voice of Sparq** is a wise old doctor who makes you feel like the only person in the room — full of knowledge, never rushed, warm with humor, genuinely concerned about this specific user. Not a therapist. Not a coach. Someone with deep wisdom delivered with complete warmth and zero ego.

**The test**: Would this UI or copy feel at home in a warm conversation or a Moleskine notebook? If it feels more at home in a B2B dashboard — it's wrong.

---

## Peter

Peter is the emotional anchor of the app. He is an otter — warm, playful, expressive, never clinical. He is not a chatbot. He is a companion who reflects the emotional tone of the user's current state.

**Never reduce Peter to a static icon or a loading spinner. He makes Sparq feel different from every other app.**

Full character spec, SVG anatomy, poses, voice rules, and copy library: see `sparq-peter` skill.

---

## The Daily Loop

The Daily Loop is the spine of the product — not a feature. Every session completes in 5 minutes.

**Before the loop begins — emotional check-in:**
Peter always checks in before any content. "Is there anything you'd like to share before we begin? I'm here to listen." If the user shares something difficult, Peter responds as an interactive journal — empathizing, asking gentle self-reflection questions, and suggesting somatic work before modified daily content begins. Emotional state comes first. Content is always second.

**Session structure:**
1. **Yesterday's Reflection** (30 sec)
2. **Today's Learn** (2 min) — story or psycho-educational content from the day's modality
3. **Today's Implement** (2 min) — micro-action to practice in real life
4. **Set Intention** (30 sec)

Each partner answers independently, then answers are revealed. The loop closes with acknowledgment (streak, completion state).

It should feel like a ritual, not a checklist.

Full Daily Loop structure, modality sequencing, and session architecture: see `sparq-psychology` skill. Language and tone for all session copy: see the language framework.

---

## Design Principles

1. **Felt experience over feature count.** One screen that feels right beats five screens that feel generic.
2. **Small and consistent beats big and overwhelming.** The Daily Loop is 5 minutes, not 50.
3. **Both partners matter equally.** Never design a flow that makes one partner feel evaluated.
4. **Progressive depth.** Questions and journeys move from surface → meaningful → deep. Never skip the gradient.
5. **Emotional safety is a design constraint.** If a feature could make someone feel judged, exposed, or compared negatively to their partner — rethink it.
6. **Pull, don't push.** Every prompt should help the user discover something they want to move toward — not instruct them to comply.
7. **Never rob the user of their own growth.** Sparq guides. The user arrives at their own truth.

---

## Beta Scope — What's In

- User auth (email/password via Supabase)
- Couple linking / partner invite system
- Daily question flow (both partners, reveal mechanic)
- Streak tracking — a forgiving count of days shown up (no reward streak; shallow gamification is out, constitution §10)
- Journeys (existing 14 — no new ones for beta)
- Peter (present, mood-driven, emotionally expressive)
- Basic profile
- Identity statement — stored in memory, displayed in hero placecard on dashboard

---

## Beta Scope — What's Explicitly Out

Do not build, suggest, or stub these without explicit authorization from Chris:

- Crisis intervention features
- Therapist matching or referral flows
- Video or voice features
- Social sharing of relationship content
- Leaderboards or competitive mechanics between couples
- AI features that store/surface relationship data without an explicit consent flow
- Push notifications
- Payment/subscription enforcement (design it, don't enforce it)
- New journeys (14 exist — no additions for beta)
- Shared couple goals feature (post-beta, after individual onboarding is solid)

---

## Architectural Non-Negotiables

Do not relitigate these:

- **Next.js Pages Router** — not App Router. Do not suggest migration.
- **Supabase** — auth, DB, edge functions. No alternative backend.
- **shadcn/ui + Tailwind** — component and styling system. No new UI libraries.
- **Framer Motion** — all animations. Do not use CSS-only animation for Peter.
- **Tests only with Chris's OK** — Vitest unit tests for constitution guarantees live in `tests/` (`npm test`). Ask Chris before adding any new test.
- **No Mem0 SDK** — memory is Supabase pgvector (`src/lib/server/memory.ts`). Do not wire real Mem0 unless explicitly asked.
- **OpenRouter → Claude Haiku 4.5** — Peter's AI backend. Do not change the model.
  - *Temporary (2026-09-30, Chris's call):* while Chris tests without OpenRouter credits, `PETER_MODELS` in `src/lib/openrouter.ts` is the free `google/gemma-4-31b-it:free` → `qwen/qwen3.8-27b:free`. Free tier is 50 req/day and free providers may log prompts, so switch back to Haiku before real users.

---

## How to Work Here

1. **Load the relevant skill first.** Don't skip this.
2. **Restate before building.** Before writing code: what are you building, what files will you touch, what will you not touch.
3. **One slice at a time.** Do not expand scope mid-implementation.
4. **When filling a design gap,** consult the relevant skill — not generic SaaS patterns.
5. **Flag ambiguity before working around it.** Ask. Don't invent.
6. **Preserve existing architecture** unless Chris explicitly authorizes changes.
7. **Small changes, explained.** Say why, not just what.

---

*Product context ends here. Technical documentation follows.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 13 (Pages Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui components |
| Backend/DB | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Animation | Framer Motion |
| State | React Context (Auth, Subscription) + TanStack React Query |
| Icons | Lucide React |
| Toasts | Sonner |
| AI | OpenRouter → Claude Haiku 4.5 (Peter), OpenAI (embeddings, transcription), pgvector memory (`src/lib/server/memory.ts`) |
| Deployment | Vercel |

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint (next lint)
npm test             # Vitest unit tests (constitution guarantees, tests/)
```

Unit tests (Vitest, `tests/`) cover the constitution guarantees Chris approved (2026-09-30): guess revision, Peter's mode picker, and privacy boundaries. They are pure logic — no network or database. Ask Chris before adding new tests. Playwright e2e scripts live in `e2e/`.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side (API routes)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key   # Peter
OPENAI_API_KEY=your_openai_key           # embeddings, transcription
REFLECTION_ENCRYPTION_KEY=               # openssl rand -hex 32 (Neutral Observer)
```

See `.env.example` for the full, commented list.

> **Note:** There is one Supabase browser client: `src/lib/supabase.ts`. The legacy `src/integrations/supabase/client.ts` shim was removed (2026-09).

---

## Directory Structure

```
sparq-connection-lab/
├── src/
│   ├── pages/                  # Next.js pages (file-based routing)
│   │   ├── _app.tsx            # App wrapper (QueryClient + AuthProvider)
│   │   ├── _document.tsx       # Custom HTML document
│   │   ├── index.tsx           # Root redirect (→ dashboard or login)
│   │   ├── login.tsx           # Login page
│   │   ├── daily-questions.tsx # Re-export of DailyQuestions
│   │   ├── DailyQuestions.tsx  # Main daily questions feature
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Profile.tsx         # User profile
│   │   ├── Settings.tsx        # App settings
│   │   ├── Subscription.tsx    # Subscription management
│   │   ├── Journeys.tsx        # Journeys listing
│   │   ├── journeys/           # Individual journey pages (14 journeys)
│   │   └── ...                 # Other feature pages
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives + custom base components
│   │   ├── dashboard/          # Dashboard section components
│   │   ├── profile/            # Profile section components
│   │   ├── quiz/               # Relationship health quiz components
│   │   ├── journey/            # Journey view components
│   │   ├── onboarding/         # Onboarding flow (4 steps)
│   │   ├── auth/               # Auth-specific components (LoginForm, AuthLayout)
│   │   └── ...                 # Shared feature components
│   │
│   ├── lib/
│   │   ├── auth-context.tsx    # THE AuthProvider and useAuth (used by _app.tsx)
│   │   ├── supabase.ts         # Supabase client + DB helpers (Next.js env vars)
│   │   ├── subscription-provider.tsx  # Subscription state/context
│   │   ├── server/             # API-route-only modules (memory, growth engine, auth middleware…)
│   │   └── utils.ts            # cn() utility for Tailwind class merging
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # Re-export of lib/auth-context useAuth
│   │   ├── useProfileTraits.ts # Trait labels for the current user
│   │   └── use-mobile.tsx, use-toast.ts  # shadcn/ui support hooks
│   │
│   ├── services/
│   │   ├── aiService.ts        # OpenAI date idea generation
│   │   ├── partnerService.ts   # Partner invitation logic
│   │   ├── journeyService.ts   # Journey CRUD operations
│   │   ├── analyticsService.ts # User activity analytics
│   │   └── ...
│   │
│   ├── types/
│   │   ├── profile.ts          # Profile, UserBadge, DailyActivity types
│   │   ├── journey.ts          # Journey types
│   │   ├── quiz.ts             # Quiz types
│   │   ├── memory.ts           # Memory types
│   │   └── supabase.ts         # Generated Supabase DB types
│   │
│   ├── data/
│   │   ├── journeys.ts         # Static journey definitions
│   │   ├── quizData.ts         # Relationship health quiz questions
│   │   └── persuasiveContent.ts    # Psychological messaging content
│   │
│   ├── content/journeys/       # Markdown content for journey narratives
│   └── styles/globals.css      # Global CSS / Tailwind base
│
├── .claude/
│   └── skills/                 # Skill files — load before working in each domain
│       ├── sparq-psychology/   # Psychology frameworks, content rules, personalization
│       ├── sparq-peter/        # Peter character, SVG, animations, voice
│       ├── sparq-db/           # Database schema and Supabase patterns
│       ├── sparq-ui/           # UI components and design tokens
│       ├── sparq-architecture/ # Architecture decisions and API patterns
│       └── frontend-design/    # Frontend design quality standards
│
├── supabase/
│   ├── schema.sql              # Full database schema (source of truth)
│   ├── migrations/             # Incremental SQL migration files
│   ├── functions/
│   │   ├── memory-operations/  # Edge function: Mem0 memory CRUD
│   │   └── send-partner-invite/ # Edge function: partner invitation emails
│   └── config.toml             # Supabase CLI config
│
├── public/                     # Static assets
├── package.json
├── next-env.d.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.js
└── vercel.json                 # Vercel deployment config (headers, install command)
```

---

## Routing

All pages use **Next.js Pages Router**. Key routes:

| URL | File | Notes |
|---|---|---|
| `/` | `src/pages/Index.tsx` | Redirect to `/dashboard` or `/login` |
| `/login` | `src/pages/login.tsx` | |
| `/dashboard` | `src/pages/Dashboard.tsx` | Protected |
| `/daily-questions` | `src/pages/daily-questions.tsx` | Re-exports `DailyQuestions.tsx` |
| `/journeys` | `src/pages/Journeys.tsx` | |
| `/profile` | `src/pages/Profile.tsx` | Protected |
| `/settings` | `src/pages/Settings.tsx` | |
| `/subscription` | `src/pages/Subscription.tsx` | |
| `/quiz` | `src/pages/Quiz.tsx` | Relationship health quiz |
| `/join-partner` | `src/pages/JoinPartner.tsx` | Partner invite acceptance |
| `/date-ideas` | `src/pages/DateIdeas.tsx` | AI-powered date suggestions |

### Navigation

Use `next/router` (`useRouter`) and `next/link` (`Link`). `react-router-dom` is not a dependency — never import it.

---

## Authentication

The primary auth system lives in `src/lib/auth-context.tsx` and is wired into `_app.tsx`.

```tsx
// Correct usage pattern
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, profile, session, loading, login, logout, updateProfile } = useAuth();
}
```

The `AuthContext` provides:
- `user` — Supabase `User` object extended with `profile`
- `profile` — Supabase profile row (`src/lib/supabase.ts` → `Profile` type)
- `session` — Supabase session
- `loading` — boolean
- `login(email, password)` — returns `{ success, error? }`
- `register(email, password, { name, partner_name? })` — returns `{ success, error? }`
- `logout()` — signs out
- `updateUserProfile(data)` / `updateProfile(data)` — both update the profile (duplicated for backward compat)

### One auth context

`src/lib/auth-context.tsx` is the only auth implementation. `src/hooks/useAuth.ts` just re-exports it. The unwired `src/lib/auth/` rewrite was removed in 2026-09 — importing it had crashed `/quiz` and `/partner-profile` ("useAuth must be used within an AuthProvider"). Route guarding lives in `src/components/ProtectedRoute.tsx`.

---

## Subscription System

Subscription state is managed by `src/lib/subscription-provider.tsx` using a React context backed by `localStorage`.

```tsx
import { useSubscription } from "@/lib/subscription-provider";

const { subscription, isFeatureAvailable, upgradeToPremium } = useSubscription();
```

### Tiers

| Tier | Daily Questions | Journeys | Features |
|---|---|---|---|
| `free` | 2 (1 morning + 1 evening) | 0 | Basic 5 question categories |
| `premium` | 4 (2 morning + 2 evening) | 3 | All categories, date ideas, analytics |
| `ultimate` | — | — | Legacy tier — stored values are mapped to `premium` |

`SubscriptionProvider` is mounted in `_app.tsx`, so `useSubscription()` works on every page.

### Error boundary

`_app.tsx` wraps every page in `src/components/ErrorBoundary.tsx`. A render error shows a warm Peter fallback instead of a blank screen, reports through `reportPrimaryPathClientError('render', …)`, and resets on route change. Never show raw error text to users.

---

## Database Schema

Managed via Supabase. Schema defined in `supabase/schema.sql`.

### Key Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles; `partner_id` links coupled users |
| `user_roles` | RBAC — roles: `user`, `admin`, `partner` |
| `partner_invitations` | Invite codes with 7-day expiry |
| `journeys` | Predefined journey definitions |
| `journey_questions` | Steps within journeys |
| `user_journeys` | Per-user journey progress |
| `journey_responses` | User answers to journey questions |
| `goals` + `goal_milestones` | User goal tracking |
| `daily_questions` | Question bank |
| `daily_question_responses` | User answers to daily questions |
| `date_ideas` + `user_date_ideas` | Date idea catalog + user saved/completed |
| `user_activities` | Analytics event log |
| `system_settings` | Admin-configurable key-value settings |
| `profile_traits` | Person Model hypothesis layer — guesses with evidence, `status` hypothesis/confirmed/rejected |
| `memories` | Distilled memories with `kind` + `importance` (pgvector); `metadata.trace` rows are growth-engine only |
| `self_discoveries` / `experiments` | The user's own conclusions and self-chosen experiments / Real-World Missions (cue, skill ladder, learning, environment note) (private) |
| `user_reasons` | The user's own reasons, in their words; Deep Why chains (`parent_reason_id`, `depth`, `is_bedrock`) |
| `identity_evidence` / `growth_arcs` | Steps the user linked to who they want to become; rites of passage they wrote (private, v1.2) |
| `couple_spaces` / `shared_items` / `interaction_cycles` | "Us" — only what a partner explicitly shared (RLS-enforced; see `docs/RELATIONSHIP_MODEL.md`) |

### Row Level Security

All tables have RLS enabled. Core policies:
- Users can only read/write their own rows
- Users can read their partner's profile
- Admins (via `is_admin()` function) bypass most restrictions

### Migrations

Migration files are in `supabase/migrations/`. When modifying the schema, create a new migration file rather than editing `schema.sql` directly (unless resetting from scratch).

---

## Supabase Edge Functions

Located in `supabase/functions/`:

- **`memory-operations/`** — CRUD for Mem0-style relationship memories
- **`send-partner-invite/`** — Sends invitation emails with invite codes

---

## Component Conventions

### UI Components (shadcn/ui)

All base UI primitives are in `src/components/ui/`. These are shadcn/ui components (Radix UI primitives + Tailwind). Do **not** modify these directly — regenerate them via the shadcn CLI if updates are needed.

### Class Merging

Always use the `cn()` utility for conditional/merged Tailwind classes:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", isActive && "active-class", className)} />
```

### Framer Motion

Use `framer-motion` for animations. Standard patterns in the codebase:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
/>
```

The `AnimatedContainer` component (`src/components/ui/animated-container.tsx`) wraps common animation variants.

### Path Aliases

Use the `@/` alias for all imports from `src/`:

```tsx
// Good
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

// Avoid
import { Button } from "../../components/ui/button";
```

---

## Larger Files

| File | Lines | Notes |
|---|---|---|
| `src/services/supabaseService.ts` | ~1,000 | Legacy DB helpers — candidate for splitting by domain |
| `src/components/MetaphorAnimation.tsx` | ~800 | Animated metaphor visualizations (bridge, flower, river) |

---

## Public Assets

`public/` contains:
- `og-image.jpg` — Open Graph image for social sharing
- `favicon.ico` — App favicon
- `Path to Together/` — Markdown educational content modules:
  - `communication.md`, `conflict-resolution.md`, `emotional-intelligence.md`
  - `love-languages.md`, `intimacy.md`

---

## Known Technical Debt

1. **Supabase free tier auto-pauses** after ~7 days idle — the backend disappears while Vercel still serves the frontend. See `CURRENT_STATE.md`.
2. **Missing Supabase env vars disable the backend (no longer a crash).** `src/lib/supabase.ts` falls back to a never-resolving placeholder host and exports `isSupabaseConfigured`, so pages render and data calls fail fast instead of every route 500ing. Still set the env vars before any real build.
3. **Unused shadcn/ui primitives** remain in `src/components/ui/` by convention — harmless, leave them.
4. **`run_dev.py` targets port 8085**, but Next.js defaults to 3000 — use `npm run dev`.
5. **Palette: Plum / Coral / Gold (2026-09-30, Chris).** Plum = understand (buttons: white on `#4B2E57`, 11.5:1), coral = connect, gold = grow. Coral `#E97868` and gold `#F3B55A` are fills/accents only — white text on coral is 2.9:1, so text on them is dark plum; coral/gold-coloured words use `brand-coral-deep` / `brand-gold-deep`. Secondary text is mauve `#685C6A` (5.2:1 on stone). Full table: `sparq-ui` skill §3. The mark is `src/components/brand/SparqMark.tsx` + `public/favicon.svg`.
6. Don't use Tailwind `gray-`/`zinc-` 300–500 for text on the warm surfaces — use `text-brand-text-secondary`. Placeholders are the exception.
7. **Dark theme in `globals.css` is still the old violet.** Dormant: nothing enables dark mode today. Re-derive it from Plum/Coral/Gold before turning dark mode on.

Resolved in the 2026-09 cleanup: all hardcoded violet hexes, Tailwind purple/indigo classes and violet-tinted shadows (now Warm Clay tokens), made-up testimonials and social-proof stats, Vite leftovers and the legacy Supabase client shim, the unwired `src/lib/auth/` rewrite, ~80 unreachable legacy components/hooks/services (including the Mem0 mock `src/lib/mem0.ts`), a leaked auth listener in `auth-context.tsx`, and the public `/test-page` debug route.

---

## Key Patterns

### Data fetching from Supabase

```tsx
import { supabase } from "@/lib/supabase"; // Use this for Next.js pages

const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("user_id", userId)
  .single();
```

### Protected page pattern

```tsx
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return <PageContent />;
}
```

### Toast notifications

```tsx
import { toast } from "sonner";

toast.success("Done!");
toast.error("Something went wrong");
toast("Title", { description: "Details", action: { label: "Go", onClick: () => {} } });
```

---

## Psychological Content Design

**Governing rule (constitution v1.2): The user chooses the destination; Sparq helps lead the path. Leadership supports agency — it does not replace it.** Peter helps users reach their own conclusions about who they are and where they're going (discovery before destination). *Process* influence — making reflection inviting, steps smaller, coming back easier — is allowed at any stage, in the open. *Destination* influence — presupposing a direction, identity reinforcement, commitment and consistency — is allowed only toward a value, goal, insight, identity, intention or experiment the user chose (`docs/CONSTITUTION.md` §5A, §6A). Sparq never tilts toward a major life outcome (stay, leave, forgive) for the user. Psychology modalities stay the foundation; influence and priming are supplementary layers (§1B, §5C).

Sparq uses a layered language system to create genuine change — not just insights. When writing any user-facing content:

- **Load the language framework** (`.claude/skills/sparq-psychology/references/language-framework`) before writing any copy, questions, or Peter dialogue
- Questions must pull the user forward, not push — surface emotional truth, not intellectual compliance
- Maximum 2 options per question (3 absolute maximum) — never more; leave room for "not now" when the user hasn't chosen yet
- Before the user has chosen: ask, invite, and ask permission ("Want to hear a thought?") — "whether" questions are allowed. After they've chosen: presuppose the *how* of their chosen direction
- Prefer self-persuasion: help users voice their own reasons rather than supplying reasons
- Resistance is information: when a user pushes back, ask what Peter might be misunderstanding — never re-push the point
- Guided growth isn't simple validation: Peter may challenge a gap between the user's *own* stated value and their behavior — once, kindly, at the right moment, leaving "it doesn't fit anymore" open
- Send people back into real life: small Real-World Missions from their goals, with a cue and their reason; setbacks are data, never shame
- No fabricated statistics or social proof, no manufactured urgency, no obligation framing, no Peter claims of human feelings
- Fourth grade reading level — always
- Never use clinical language — see the forbidden language table in `sparq-psychology` skill

Core language techniques used throughout the app:
- **Presupposition** — only for a direction the user has already chosen; never presuppose a feeling, conclusion or identity they haven't reached
- **Outcome framing** — point toward what's possible, after the user feels heard
- **RAS recalibration** — an invitation to aim their attention filter more accurately, never an argument against their experience
- **Pull language** — surface emotional truth the user moves toward, not instructions they comply with
- **Identity reinforcement** — "you're becoming someone who..." only for an identity the user named, never assigned
- **Shadow reframing** — honoring protective patterns, only with trust and the user's permission

Full framework: `.claude/skills/sparq-psychology/references/language-framework`

### Stories are the teaching layer

Sparq teaches through short stories, following the **Story Recipe** in the language framework (start mid-moment, one sensory detail, the familiar first reaction, the inner turn, a small honest result, a bridge question). No hidden commands.

- Morning stories: `getMorningStoryPrompt` in `src/lib/peterService.ts` (rotating 14-couple cast) + `src/data/fallbackStories.json`
- Daily primes: `story` field in `src/data/micro-primes.ts`
- Journeys: optional `story` on each concept, shown in place of `example` — all 13 journeys have them. Trust Rebuilding uses its own couple (Elena & Marco) so betrayal never touches the main cast.

### Imagery

Warm, golden-hour metaphor images only — never people (hands-only is allowed). Journey images live in `public/images/journeys/`, date images in `public/images/dates/`. No hotlinked stock photos.

> Framework note (2026-06): these techniques are grounded in validated constructs — cognitive reappraisal (Gross 2002), linguistic presupposition (pragmatics), identity-based motivation (Oyserman 2009), autonomy support (Deci & Ryan 2000). The "NLP" umbrella label is retired; never use it in copy, docs, or marketing. Construct names are for internal/marketing layers only — users never see them (enjoyment-first principle).

---

## Journeys

There are 14 predefined journeys defined in `src/data/journeys.ts` with corresponding page components in `src/pages/journeys/`:

- Communication, Intimacy, Trust Rebuilding, Conflict Resolution
- Love Languages, Emotional Intelligence, Feeling Safe Together (route: `attachment-healing`)
- Relationship Renewal, Values, Mindful Sexuality, Sexual Intimacy
- Fantasy Exploration, Power Dynamics, Long Distance

Journey markdown content lives in `src/content/journeys/`.

---

## Linting

ESLint is configured in `eslint.config.js` with:
- TypeScript ESLint recommended rules
- React Hooks plugin (enforces rules of hooks)
- `@typescript-eslint/no-unused-vars` is **turned off**

Run: `npm run lint`

---

## Deployment

Deployed on Vercel — every push to `main` goes straight to production. `vercel.json` sets the build/install commands and security headers (CSP, X-Frame-Options DENY, nosniff). Next.js is auto-detected.