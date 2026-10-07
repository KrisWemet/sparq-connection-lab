# CLAUDE.md — Sparq Connection Lab

This file provides comprehensive context for AI assistants working on this codebase. Read the product context section first — every time, without skipping.

> **Product constitution (v1.2):** [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) defines Sparq as a **guided transformation system** — "Sparq helps people discover who they want to become, understand why it matters, and practice becoming that person in the real world." It sets the governing principle (**Sparq leads the path; the user chooses the destination**), the Transformation Engine (UNDERSTAND → CHOOSE → ACT → REFLECT → ADAPT → REPEAT → BECOME), psychology modalities (incl. DBT-informed skills and Transactional Analysis) as the foundation with influence as a supplementary layer, hypotheses never diagnoses, Peter's conversation modes, memory discipline, and private/shared privacy boundaries. Read it before planning any feature. Its "Constitutional test" applies to every major feature. Implementation map: `docs/TRANSFORMATION_ENGINE.md` (engine map + v1.2 build status), `docs/CONSTITUTION_AUDIT.md` (status + §13 checklist), `docs/PERSON_MODEL.md`, `docs/RELATIONSHIP_MODEL.md`, `docs/METRICS.md`, `docs/INFLUENCE_AUDIT.md` (influence/doctrine conflicts: fixed, open decisions), `docs/evals/peter-behavior.md` + `docs/evals/resistance-handling.md` (Peter behavioral eval spec — run both before any Peter prompt change). It is the source of truth for everything it covers; where it is silent, the rest of this file and the Master PRD apply.
>
> **Doctrine map — which documents give instructions:**
> - **Active rules:** `docs/CONSTITUTION.md` → `CLAUDE.md` (with `.claude/rules/`) → `docs/*.md` (Person Model, Relationship Model, Metrics, audits) and `docs/evals/` → the `.claude/skills/sparq-*` skills.
> - **Reference beneath the constitution:** `SPARQ_MASTER_SPEC.md` (product/repo/roadmap), `SPARQ-PSYCHOLOGY-MODALITIES.md` (modality background), `SPARQ-VISION.md` (brief).
> - **Snapshots — status, not rules:** `HANDOFF.md`, `CURRENT_STATE.md`, `LAUNCH_CHECKLIST.md`, `IMPLEMENTATION_STATUS.md`.
> - **Historical — never follow as instructions:** `OLD_PRD.md`, `REFERENCE_UNIFIED_PRD.md`, `Sparq_build_Spec.md`, `audit_report_sprint1.md`, `docs/superpowers/`, `.planning/`. They predate the constitution and contain superseded ideas (silent profiling, partner synthesis, "always presuppose", streak pressure).

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
| Phone feel (tap, hover, viewport, inputs, safe areas) | `.claude/skills/mobile-native` |
| Animation decisions, audits, reviews, where to add motion | `.claude/skills/emil-design-eng`, `improve-animations`, `review-animations`, `find-animation-opportunities` (Framer Motion still required) |
| Toasts (Sonner) | `.claude/skills/ask-sonner` |

If you're not sure which skill applies — load `sparq-psychology` and `sparq-architecture` as defaults. If you are writing any user-facing copy — also load the language framework.

---

## What Sparq Is

**Sparq Connection** is a relationship growth app for committed couples. Core belief: stronger individuals create stronger relationships.

It is a **relationship gym** — not therapy, not a wellness platform, not a gamified couples game. Users come here to build a consistent practice that compounds into real change over time.

The transformation arc: **autopilot → intentional → deeply connected.**

Sparq is grounded in evidence-based modalities (Gottman, EFT, ACT, CBT, Positive Psychology, Attachment Theory, IFS, Mindfulness, NVC, Somatic, Narrative Therapy, DBT-informed skills, Transactional Analysis) — the foundation for understanding what is happening — plus a supplementary ethical-influence and behavioral-science layer that shapes how Sparq leads (constitution §1B). This is the core competitive advantage. See `sparq-psychology` skill for the full framework.

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

The Daily Loop is the spine of the product — not a feature. It is the daily form of the constitution's Transformation Engine (§1A): learn something, take it into real life, reflect on what happened. Every session completes in 5 minutes.

**Before the loop begins — emotional check-in:**
Peter always checks in before any content. "Is there anything you'd like to share before we begin? I'm here to listen." If the user shares something difficult, Peter responds as an interactive journal — empathizing, asking gentle self-reflection questions, and suggesting somatic work before modified daily content begins. Emotional state comes first. Content is always second.

**Session structure:**
1. **Yesterday's Reflection** (30 sec)
2. **Today's Learn** (2 min) — story or psycho-educational content from the day's modality
3. **Today's Implement** (2 min) — micro-action to practice in real life
4. **Set Intention** (30 sec)

Each partner answers independently, and answers stay private. A partner sees an answer only when its author taps **"Share with partner"** — nothing is shared automatically, and whether someone completed a day is visible to their partner only if they opt in (Chris, 2026-10-02; constitution §8). The loop closes with acknowledgment (streak, completion state).

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
- Daily practice, `/daily-growth` (both partners answer privately; "Share with partner" button, never automatic)
- Streak tracking — a forgiving count of days shown up (no reward streak; shallow gamification is out, constitution §10)
- Journeys: the existing catalog (13 staged + 9 daily starter journeys, see Journeys below) — no new ones for beta
- Peter (present, mood-driven, emotionally expressive)
- Basic profile
- Identity statement — stored in memory, displayed in hero placecard on dashboard
- Daily reminders by phone notification (web push) and email, opt-in, off by default (Chris approved 2026-10-03; `docs/REMINDERS.md`)

---

## Beta Scope — What's Explicitly Out

Do not build, suggest, or stub these without explicit authorization from Chris:

- Crisis intervention features
- Therapist matching or referral flows
- Video or voice features
- Social sharing of relationship content
- Leaderboards or competitive mechanics between couples
- AI features that store/surface relationship data without an explicit consent flow
- Other push notifications beyond the opt-in daily reminder
- Payment/subscription enforcement (design it, don't enforce it)
- New journeys (no additions to the existing catalog for beta)
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
  - `PETER_MODELS` in `src/lib/openrouter.ts` is Haiku only (2026-10-03). For testing without OpenRouter credits, `PETER_FREE_FALLBACK=true` adds free models as a fallback — they may log prompts, so never in production.

---

## How to Work Here

1. **Load the relevant skill first.** Don't skip this.
2. **Restate before building.** Before writing code: what are you building, what files will you touch, what will you not touch.
3. **One slice at a time.** Do not expand scope mid-implementation.
4. **When filling a design gap,** consult the relevant skill — not generic SaaS patterns.
5. **Flag ambiguity before working around it.** Ask when it materially affects scope, behaviour, architecture, security, cost or an irreversible action; for routine choices, state the assumption and proceed. Don't invent.
6. **Preserve existing architecture** unless Chris explicitly authorizes changes.
7. **Small changes, explained.** Say why, not just what.

How to scope, verify and report code changes (acceptance criteria, behaviour checks, diff review, honest reporting): [`.claude/rules/karpathy-guidelines.md`](.claude/rules/karpathy-guidelines.md).

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
| AI | OpenRouter → Claude Haiku 4.5 (Peter), OpenAI (embeddings, voice transcription, date ideas), pgvector memory (`src/lib/server/memory.ts`) |
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

Unit tests (Vitest, `tests/`) cover the constitution guarantees Chris approved (2026-09-30, extended 2026-10-01): guess revision, Peter's mode picker (incl. setbacks vs. comfort-first), privacy boundaries, mission ideas and adaptive difficulty, identity-evidence timing, Deep Why layers, and journey progress and state (2026-10-04). They are pure logic — no network or database. Ask Chris before adding new tests. Playwright e2e scripts live in `e2e/`.

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

Main folders (not every file):

```
sparq-connection-lab/
├── src/
│   ├── pages/                  # Next.js pages (file-based routing, lowercase file names)
│   │   ├── _app.tsx            # App wrapper (QueryClient, AuthProvider, SubscriptionProvider, ErrorBoundary)
│   │   ├── _document.tsx       # HTML document (icons, manifest, iOS home-screen tags)
│   │   ├── index.tsx           # Public welcome page
│   │   ├── dashboard.tsx, daily-growth.tsx, journeys.tsx, us.tsx, settings.tsx …
│   │   ├── journeys/           # One page per staged journey + journey-template.tsx
│   │   ├── neutral-observer/   # Neutral Observer sub-pages
│   │   └── api/                # API routes (daily/, peter/, me/, journeys/, push/, cron/, reminders/ …)
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (don't edit by hand)
│   │   ├── dashboard/, daily/, journey/, onboarding/, profile/, peter/, emotion/, playful/ …
│   │   ├── auth/               # LoginForm, AuthCardLayout
│   │   ├── brand/SparqMark.tsx # The Sparq mark
│   │   ├── legal/LegalPage.tsx # Shared layout for /privacy and /terms
│   │   ├── bottom-nav.tsx, ErrorBoundary.tsx, ProtectedRoute.tsx
│   │   └── PeterChat.tsx, PeterTheOtter.tsx, PeterLoading.tsx
│   │
│   ├── lib/
│   │   ├── auth-context.tsx    # THE AuthProvider and useAuth
│   │   ├── supabase.ts         # The one browser Supabase client
│   │   ├── subscription-provider.tsx, plans.ts, product.ts   # plans and entitlements
│   │   ├── openrouter.ts, peterService.ts                    # Peter's model calls and prompts
│   │   ├── journeys/           # catalog.ts, progress.ts, client.ts (journey state rules)
│   │   ├── push-client.ts, partner-invite.ts, welcome-back.ts …
│   │   └── server/             # API-route-only modules: memory, growth engine, journey-state,
│   │                           #   reminders, push, privacy, supabase-auth, supabase-admin …
│   │
│   ├── hooks/                  # useAuth (re-export), useProfileTraits, shadcn helpers
│   ├── services/               # aiService (date ideas via /api/date-ideas/generate),
│   │                           #   analyticsService, journeyContentService
│   ├── types/                  # profile, journey, memory, generated supabase types
│   ├── data/                   # journeys.ts, starter-journeys/, fallbackStories.json,
│   │                           #   micro-primes.ts, playful-prompts.ts, persuasiveContent.ts
│   ├── content/journeys/       # Markdown content for journey narratives
│   └── styles/globals.css      # Global CSS / Tailwind base
│
├── .claude/
│   ├── rules/                  # Workflow rules (karpathy-guidelines.md)
│   └── skills/                 # Skill files — load before working in each domain (table above)
│
├── supabase/
│   ├── schema.sql              # Original schema; later changes live in migrations/
│   ├── migrations/             # Incremental SQL migrations (newest are the truth)
│   ├── functions/              # Old edge functions; nothing in src/ calls them
│   └── config.toml
│
├── tests/                      # Vitest unit tests (approved guarantees only)
├── e2e/                        # Playwright scripts
├── docs/                       # Constitution, models, audits, evals, REMINDERS.md
├── public/                     # Icons, manifest, service worker (sw.js), images
├── .eslintrc.json              # ESLint (next/core-web-vitals)
└── vercel.json                 # Vercel config (headers, install command)
```

---

## Routing

All pages use **Next.js Pages Router**. Key routes:

| URL | File | Notes |
|---|---|---|
| `/` | `src/pages/index.tsx` | Public welcome page |
| `/login`, `/signup` | `src/pages/login.tsx`, `signup.tsx` | `/signup` redirects to `/login?mode=register` |
| `/onboarding` | `src/pages/onboarding.tsx` | Dashboard sends users back here until it's finished |
| `/dashboard` | `src/pages/dashboard.tsx` | Protected home |
| `/daily-growth` | `src/pages/daily-growth.tsx` | The daily practice. `/daily-questions` and `/daily-activity` redirect here |
| `/journeys` | `src/pages/journeys.tsx` | Journey catalog; staged journeys under `/journeys/<slug>` |
| `/us` | `src/pages/us.tsx` | Shared couple space |
| `/join-partner` | `src/pages/join-partner.tsx` | Make or enter a 24-hour partner code; unlink |
| `/settings` | `src/pages/settings.tsx` | Reminders, data download, account delete |
| `/trust-center` | `src/pages/trust-center.tsx` | Memory and privacy settings |
| `/privacy`, `/terms` | `src/pages/privacy.tsx`, `terms.tsx` | Public |
| `/help-now` | `src/pages/help-now.tsx` | Crisis resources, always free |

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

### Plans (decided 2026-10-02 — source of truth: `src/lib/plans.ts`)

Each plan adds to the one before it. Only list features that exist in the app.

| Plan | Price (USD) | Adds |
|---|---|---|
| Free | $0 | First 14 days = everything in Solo (trial); then daily practice 3 days/week, Peter 10 messages/day, 2 journeys, Insight Profile, partner linking. Conflict First Aid + crisis help always free |
| Solo | $9.99/mo or $79.99/yr | Daily practice every day, unlimited Peter, all 14 journeys |
| Together | $14.99/mo or $119.99/yr, both partners | Solo for both + "Us" shared space, Shared Peter (something to talk about), patterns between you |

Payments aren't built (design, don't enforce). Server entitlements stay two-level (`lib/product.ts`): Free = `FREE_ENTITLEMENTS` (enforced in daily session start, Peter chat and journey start); Solo and Together both map to `premium`. Together's couple features are open to everyone until payments launch. Never paywall safety tools or the user's view/control of their own data. The subscription provider's `features` block (dailyQuestions, etc.) is legacy — don't build on it.

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
| `partner_invitations` | Unused. Partner linking uses `profiles.partner_code` (valid 24 hours, single use) and the `link_partner` / `unlink_partner` RPCs |
| `journeys` | Predefined journey definitions |
| `journey_questions` | Steps within journeys |
| `user_journeys` | One record per user per journey (all 22, text slug ids): `status` active/paused/completed/left (one active per user), `stage`, `journey_day` (per journey), `progress` (days practiced). Written only by `src/lib/server/journey-state.ts` |
| `journey_step_entries` | Private answers on staged-journey days (Roots/Growth/Bloom) |
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

`supabase/functions/` holds older edge functions (`generate-daily-insight`, `memory-operations`, `send-partner-invite`, `send-tonight-action`, `stripe-checkout`). Nothing in `src/` calls them; app logic lives in Next.js API routes (`src/pages/api/`). Scheduled work runs through Supabase `pg_cron` calling an API route (daily reminders: `docs/REMINDERS.md`).

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
| `src/pages/daily-growth.tsx` | ~1,150 | The daily practice page |
| `src/components/journey/JourneyContentView.tsx` | ~700 | Staged journey day view |
| `src/pages/rehearsal.tsx` | ~700 | Conversation rehearsal |

---

## Public Assets

`public/` contains:
- `icons/` — favicons, app icons, `badge-96.png` (notification badge); `favicon.ico`
- `images/` — `brand/` (logo, flowing S), `journeys/`, `dates/`, `peter-default.png`
- `manifest.webmanifest` + `sw.js` — installable app and the service worker for phone notifications (no caching)
- `og-image.png` — Open Graph image
- `Path to Together/` — old Markdown modules, read only by `src/services/journeyContentService.ts`, which nothing imports

---

## Known Technical Debt

1. **Supabase free tier auto-pauses** after ~7 days idle — the backend disappears while Vercel still serves the frontend. See `CURRENT_STATE.md`.
2. **Missing Supabase env vars disable the backend (no longer a crash).** `src/lib/supabase.ts` falls back to a never-resolving placeholder host and exports `isSupabaseConfigured`, so pages render and data calls fail fast instead of every route 500ing. Still set the env vars before any real build.
3. **Unused shadcn/ui primitives** remain in `src/components/ui/` by convention — harmless, leave them.
4. **`run_dev.py` targets port 8085**, but Next.js defaults to 3000 — use `npm run dev`.
5. **Palette: Plum / Coral / Gold (2026-09-30, Chris).** Plum = understand (buttons: white on `#4B2E57`, 11.5:1), coral = connect, gold = grow. Coral `#E97868` and gold `#F3B55A` are fills/accents only — white text on coral is 2.9:1, so text on them is dark plum; coral/gold-coloured words use `brand-coral-deep` / `brand-gold-deep`. Secondary text is mauve `#685C6A` (5.2:1 on stone). Full table: `sparq-ui` skill §3. The mark is the flowing S (2026-10-05): `src/components/brand/SparqMark.tsx`, `public/images/brand/`, icons in `public/icons/`.
6. Don't use Tailwind `gray-`/`zinc-` 300–500 for text on the warm surfaces — use `text-brand-text-secondary`. Placeholders are the exception.
   **Phone baseline (2026-10-01, `mobile-native` skill):** use `min-h-dvh`/`h-dvh`, never `min-h-screen` (cut off under the browser bar); `hover:` only fires on hover-capable devices (`hoverOnlyWhenSupported`), so give touch users `active:` feedback; touch-screen inputs are forced to ≥16px (iOS zoom); never disable zoom. The CSS lives at the end of `globals.css`; viewport/theme-color meta and `MotionConfig reducedMotion="user"` are in `_app.tsx`.
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

**Governing rule (constitution v1.2): Sparq leads the path. The user chooses the destination.** Peter actively leads — questions, challenge, missions, follow-up — and helps users reach their own conclusions. *Process influence* — helping the user reflect, notice, persist, return, act, regulate, stay curious, see progress, or feel courage, hope, calm, connection or agency — is allowed at any stage and on every surface (Peter, copy, visuals, imagery, notifications, progress, onboarding, relationship flows) when it serves the user. *Direction influence* — anything favoring a particular belief, interpretation, identity, goal, relationship outcome, life decision or moral conclusion — needs a direction the user explicitly chose, and is never used toward a major life outcome (stay, leave, reconcile, forgive, cut someone off). A suggested mission becomes the user's only through explicit choice (`docs/CONSTITUTION.md` §1A, §5A, §6A).

Sparq uses a layered language system to create genuine change — not just insights. When writing any user-facing content:

- **Load the language framework** (`.claude/skills/sparq-psychology/references/language-framework`) before writing any copy, questions, or Peter dialogue
- Questions must pull the user forward, not push — surface emotional truth, not intellectual compliance
- Maximum 2 options per question (3 absolute maximum) — never more; leave room for "not now" when the user hasn't chosen yet
- Before the user has chosen: ask, invite, and ask permission ("Want to hear a thought?") — "whether" questions are allowed. After they've chosen: presuppose the *how* of their chosen direction
- Send people back into their real lives: small missions with a cue, then "what happened?" Setbacks are data, never failure
- Identity reinforcement only from lived evidence, for an identity the user authored
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

**Journey state (2026-10-04, Phase 1 of the Journey spine):** Supabase is the only source of truth — `user_journeys` via `src/lib/server/journey-state.ts`, rules in `src/lib/journeys/progress.ts`, one catalog in `src/lib/journeys/catalog.ts` (9 daily starter journeys + 13 staged ones), browser access via `src/lib/journeys/client.ts` and `/api/journeys/state`. Never keep journey progress in localStorage (old browser progress is imported once). Switching journeys pauses the current one; pausing and leaving keep the user's place.

There are 13 staged journeys defined in `src/data/journeys.ts` (Long Distance has no content yet) with corresponding page components in `src/pages/journeys/`:

- Communication, Intimacy, Trust Rebuilding, Conflict Resolution
- Love Languages, Emotional Intelligence, Feeling Safe Together (route: `attachment-healing`)
- Relationship Renewal, Values, Mindful Sexuality, Sexual Intimacy
- Fantasy Exploration, Power Dynamics, Long Distance

Journey markdown content lives in `src/content/journeys/`.

---

## Linting

ESLint is configured in `.eslintrc.json`: Next's `next/core-web-vitals` (includes the React Hooks rules), with `react/no-unescaped-entities` and `@next/next/no-html-link-for-pages` as warnings.

Run: `npm run lint` (`next lint`). The old Vite-era `eslint.config.js` was removed (2026-10-03) — it imported packages that aren't installed and broke every ESLint run.

---

## Deployment

Deployed on Vercel — every push to `main` goes straight to production. `vercel.json` sets the build/install commands and security headers (CSP, X-Frame-Options DENY, nosniff). Next.js is auto-detected.