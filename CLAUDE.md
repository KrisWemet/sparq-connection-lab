# CLAUDE.md — Sparq Connection Lab

This file provides comprehensive context for AI assistants working on this codebase. Read the product context section first — every time, without skipping.

---

# SPARQ PRODUCT CONTEXT
## Read this before touching anything. Load the relevant skill before writing any code.

---

## Skill Loading — Do This First

Before working in any of these domains, read the corresponding skill file:

| Domain | Skill to load |
|---|---|
| Psychology content, questions, exercises, personalization | `.claude/skills/sparq-psychology` |
| Language, copy, NLP patterns, voice | `.claude/skills/sparq-psychology/references/nlp-language-framework` |
| Peter (SVG, animations, copy, poses, voice) | `.claude/skills/sparq-peter` |
| Database schema, Supabase patterns | `.claude/skills/sparq-db` |
| UI components, design tokens, layout | `.claude/skills/sparq-ui` |
| Architecture decisions, API patterns | `.claude/skills/sparq-architecture` |
| Frontend design quality | `.claude/skills/frontend-design` |

If you're not sure which skill applies — load `sparq-psychology` and `sparq-architecture` as defaults. If you are writing any user-facing copy — also load the NLP language framework.

---

## What Sparq Is

**Sparq Connection** is a relationship growth app for committed couples. Core belief: stronger individuals create stronger relationships.

It is a **relationship gym** — not therapy, not a wellness platform, not a gamified couples game. Users come here to build a consistent practice that compounds into real change over time.

The transformation arc: **autopilot → intentional → deeply connected.**

Sparq integrates 12 evidence-based modalities (Gottman, EFT, ACT, CBT, Positive Psychology, Attachment Theory, IFS, Mindfulness, NVC, Somatic, Narrative Therapy, Influence Psychology). This is the core competitive advantage. See `sparq-psychology` skill for the full framework.

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

Full Daily Loop structure, modality sequencing, and session architecture: see `sparq-psychology` skill. Language and tone for all session copy: see NLP language framework.

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
- Streak tracking
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
- **No automated tests** — accepted for now. Do not add test infrastructure unless asked.
- **Mem0 is mocked** — do not attempt to wire real Mem0 unless explicitly asked.
- **OpenRouter → Claude Haiku 4.5** — Peter's AI backend. Do not change the model.

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
| AI | OpenRouter → Claude Haiku 4.5 (Peter), OpenAI API (date ideas), Mem0 (relationship memory — currently mocked) |
| Deployment | Vercel |

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint (next lint)
```

There are **no automated tests** in this project.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional integrations
NEXT_PUBLIC_MEM0_API_KEY=your_mem0_api_key

# Legacy Vite env vars (used by src/lib/api-config.ts and src/integrations/supabase/client.ts)
VITE_OPENAI_API_KEY=your_openai_key
VITE_GOOGLE_API_KEY=your_google_places_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The app has two Supabase client instances due to an incomplete migration from Vite to Next.js. The canonical client for Next.js pages is `src/lib/supabase.ts` (uses `process.env.NEXT_PUBLIC_*`). Some legacy code still references `src/integrations/supabase/client.ts` (uses `import.meta.env.VITE_*`).

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
│   │   ├── auth-context.tsx    # PRIMARY AuthProvider and useAuth (used by _app.tsx)
│   │   ├── supabase.ts         # Supabase client + DB helpers (Next.js env vars)
│   │   ├── subscription-provider.tsx  # Subscription state/context
│   │   ├── mem0.ts             # Mem0 memory client (currently mocked)
│   │   ├── api-config.ts       # OpenAI/Google API key config (uses Vite env vars)
│   │   ├── auth/               # Refactored auth modules (not yet wired to _app.tsx)
│   │   └── utils.ts            # cn() utility for Tailwind class merging
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # Wrapper hook (uses lib/auth-context)
│   │   ├── useDashboardData.ts # Dashboard data fetching
│   │   ├── useJourney.ts       # Journey state management
│   │   ├── useMemory.ts        # Mem0 memory operations
│   │   ├── useOnboarding.ts    # Onboarding flow state
│   │   └── ...
│   │
│   ├── services/
│   │   ├── aiService.ts        # OpenAI date idea generation
│   │   ├── partnerService.ts   # Partner invitation logic
│   │   ├── journeyService.ts   # Journey CRUD operations
│   │   ├── memoryService.ts    # Memory storage abstraction
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
│   │   ├── relationshipContent.ts  # Static content (activities, etc.)
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
└── vercel.json                 # Vercel deployment config (note: currently set to "vite" framework — may need update)
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

### Navigation warning

`src/components/bottom-nav.tsx` still uses `react-router-dom` (`Link`, `useLocation`). This will cause errors in Next.js pages. If you modify navigation, use `next/router` (`useRouter`) and `next/link` (`Link`) instead.

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

### Auth duplication warning

There are several overlapping auth implementations:
- `src/lib/auth-context.tsx` — **active, used by `_app.tsx`**
- `src/lib/auth/` directory — refactored modular version, **not yet connected**
- `src/hooks/useAuth.ts` and `src/hooks/useAuth.tsx` — wrapper hooks
- `src/components/auth/ProtectedRoute.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/ui/protected-route.tsx` — duplicated

When adding auth features, work in `src/lib/auth-context.tsx`.

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
| `ultimate` | Unlimited | Unlimited | Everything + AI therapist |

**Important:** `SubscriptionProvider` is **not** currently in `_app.tsx`. Pages that use `useSubscription()` (like `DailyQuestions.tsx`) must either have the provider added to `_app.tsx` or wrap themselves.

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

## Large Files to Be Aware Of

These files are unusually large and may be slow to edit or navigate:

| File | Size | Notes |
|---|---|---|
| `src/components/MetaphorAnimation.tsx` | ~24,000 lines | Animated metaphor visualizations (bridge, flower, river) |
| `src/services/supabaseService.ts` | ~29,000 lines | All DB operations — candidate for splitting by domain |
| `src/data/relationshipContent.ts` | ~27,000 lines | Pre-written relationship guidance content |
| `src/data/persuasiveContent.ts` | ~22,000 lines | Psychological messaging and persuasive copy |

When working in these files, use targeted searches rather than reading the full file.

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

These issues exist in the codebase and should be kept in mind:

1. **Incomplete Vite → Next.js migration**
   - `vercel.json` still declares `"framework": "vite"` — this may need updating to `"nextjs"`
   - `vite.config.ts` and `src/main.tsx` are leftover Vite files
   - `src/integrations/supabase/client.ts` uses `import.meta.env` (Vite syntax)
   - `src/lib/api-config.ts` uses `import.meta.env` for OpenAI/Google keys

2. **Duplicate Supabase clients**
   - `src/lib/supabase.ts` — canonical for Next.js (uses `process.env.NEXT_PUBLIC_*`)
   - `src/integrations/supabase/client.ts` — legacy Vite version (uses `import.meta.env.VITE_*`)
   - Prefer `src/lib/supabase.ts` for new code

3. **`bottom-nav.tsx` uses React Router**
   - Uses `react-router-dom` Link and `useLocation` — incompatible with Next.js
   - Needs migration to `next/link` and `next/router`

4. **`SubscriptionProvider` missing from `_app.tsx`**
   - Pages using `useSubscription()` will throw at runtime unless wrapped

5. **Duplicate auth implementations** — see Authentication section above

6. **Mem0 is mocked**
   - `src/lib/mem0.ts` uses an in-memory Map, not the real Mem0 API
   - The `NEXT_PUBLIC_MEM0_API_KEY` env var exists but is unused

7. **`@tanstack/react-query` is in `_app.tsx` but not in `package.json`**
   - Check if this dependency is actually installed

8. **`.env` contains hardcoded Supabase credentials**
   - The `.env` file in the repo root has actual `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values
   - Never commit additional secrets to `.env`; use `.env.local` (gitignored) for local dev

9. **`run_dev.py` targets port 8085**
   - The Python dev launcher script opens `http://localhost:8085`, but Next.js dev server defaults to port 3000
   - Use `npm run dev` directly for development

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

Sparq uses a layered language system to create genuine change — not just insights. When writing any user-facing content:

- **Load the NLP language framework** (`.claude/skills/sparq-psychology/references/nlp-language-framework`) before writing any copy, questions, or Peter dialogue
- Questions must pull the user forward, not push — surface emotional truth, not intellectual compliance
- Maximum 2 options per question (3 absolute maximum) — never more
- Always presuppose forward movement — never ask "do you want to"
- Fourth grade reading level — always
- Never use clinical language — see the forbidden language table in `sparq-psychology` skill

Core language techniques used throughout the app:
- **Presupposition** — assume forward movement inside the question structure
- **Outcome framing** — point toward what's possible, not what's wrong
- **RAS recalibration** — help users aim their attention filter more accurately
- **Pull language** — surface emotional truth the user moves toward, not instructions they comply with
- **Identity reinforcement** — "you're becoming someone who..." not "you should..."
- **Shadow reframing** — honoring protective patterns and releasing them when no longer needed

Full framework: `.claude/skills/sparq-psychology/references/nlp-language-framework`

---

## Journeys

There are 14 predefined journeys defined in `src/data/journeys.ts` with corresponding page components in `src/pages/journeys/`:

- Communication, Intimacy, Trust Rebuilding, Conflict Resolution
- Love Languages, Emotional Intelligence, Attachment Healing
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

Deployed on Vercel. The `vercel.json` configures:
- Build command: `npm run build`
- Output directory: `dist` (Vite leftover — Next.js outputs to `.next`)
- Security headers: CSP, X-Frame-Options DENY, X-XSS-Protection, nosniff

> **Action needed:** `vercel.json` has `"framework": "vite"` and `"outputDirectory": "dist"` which are incorrect for a Next.js project. These should be `"framework": "nextjs"` with no `outputDirectory` override.