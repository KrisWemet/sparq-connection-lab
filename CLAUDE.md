# CLAUDE.md — Sparq Connection Lab

## Project Overview

Sparq Connection Lab is a **solo-first relationship enhancement app** that helps users become better partners through daily 5-7 minute sessions. The core philosophy is **"Making me a better me for us"** — the app delivers immediate value from Day 1 while progressively discovering each user's personality profile over 14 days.

The app uses a **Learn → Implement → Reflect** daily cycle powered by AI, with content drawn from Love Languages, Gottman Method, CBT, Attachment Theory, EFT, Narrative Therapy, and other psychology frameworks.

**Live domain**: sharedjourney.ai

## Tech Stack

- **Framework**: React 18 + TypeScript (Vite SPA, not Next.js — ignore `package.json` scripts referencing `next`)
- **Build tool**: Vite (dev server on port 8080)
- **Routing**: React Router DOM (client-side SPA routing)
- **Styling**: Tailwind CSS 3 with `tailwindcss-animate` plugin, dark mode via `class` strategy
- **UI components**: shadcn/ui (53 components in `src/components/ui/`)
- **State management**: React Context API (AuthContext, SubscriptionProvider, ThemeProvider) + React Query for server state
- **AI layer**: Multi-provider abstraction (`AIModelService`) — Gemini Flash (free), Claude Sonnet 4.5 (premium), Claude Opus 4.5 (reports)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel (configured in `vercel.json`, outputs to `dist/`)

## Build & Development Commands

```bash
# Start dev server (Vite on localhost:8080)
npx vite

# Production build
npx vite build

# Lint
npx eslint . --ext .ts,.tsx
```

> **Note**: `package.json` scripts reference `next dev`/`next build` but the project actually uses Vite. Use the commands above directly, or run `npx vite` for development.

## Project Structure

```
src/
├── main.tsx                 # App entry point (ReactDOM.createRoot)
├── index.css                # Tailwind base imports + CSS variables
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── auth/                # LoginForm, AuthLayout, ProtectedRoute
│   ├── dashboard/           # Dashboard cards and layout
│   ├── journey/             # Journey content views, partner sync, activity cards
│   ├── onboarding/          # 3-step onboarding flow (welcome, goals, archetype)
│   ├── session/             # Daily session UI (Learn→Implement→Reflect components)
│   ├── profile/             # Profile header, achievements, personal info
│   ├── quiz/                # Relationship health quiz views
│   ├── insights/            # Relationship insight cards
│   └── *.tsx                # Top-level feature components (MetaphorAnimation, FuturePacing, etc.)
├── pages/                   # Route-level page components
│   ├── Index.tsx            # Landing page
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Auth.tsx             # Login/signup
│   ├── Journeys.tsx         # Journey selection
│   ├── journeys/            # 13 specific journey pages
│   ├── DailyQuestions.tsx   # Learn→Implement→Reflect daily session flow
│   ├── Quiz.tsx             # Relationship quiz
│   └── ...                  # ~30 total pages
├── services/                # Business logic & API layer
│   ├── aiModelService.ts    # AI model abstraction (Gemini/Claude/OpenAI routing)
│   ├── dailySessionService.ts  # Core Learn→Implement→Reflect session orchestrator
│   ├── supabaseService.ts   # Core Supabase CRUD operations (largest service)
│   ├── aiService.ts         # OpenAI integration for date ideas (singleton pattern)
│   ├── personalityInferenceService.ts  # AI-powered personality signal extraction
│   ├── personalityProfileService.ts    # Profile aggregation & context builder
│   ├── discoveryQuestionService.ts     # AI question generation for 14-day arc
│   ├── mirrorNarrativeService.ts       # Day 14 "we see you" narrative generator
│   ├── journeyService.ts    # Journey progress tracking
│   ├── journeyContentService.ts
│   ├── partnerService.ts    # Partner invitation and connection
│   ├── analyticsService.ts  # Relationship health metrics
│   ├── memoryService.ts     # Supabase key-value persistence (used by personality system)
│   ├── notificationService.ts
│   ├── onboardingService.ts
│   └── dataLogger.ts        # Activity logging
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts / .tsx    # Auth state access
│   ├── useAuthRedirect.ts   # Auth-based navigation
│   ├── usePersonalityDiscovery.ts  # 14-day personality discovery orchestrator
│   ├── useDashboardData.ts  # Dashboard data fetching (React Query)
│   ├── useJourney.ts        # Journey-specific state
│   ├── useOnboarding.ts     # Onboarding flow state
│   ├── useRealtimeSync.ts   # Supabase realtime subscriptions
│   ├── useAnalytics.ts
│   ├── useMemory.ts
│   └── use-toast.ts / use-mobile.tsx
├── lib/                     # Core utilities & context providers
│   ├── auth-context.tsx     # AuthContext provider (user, profile, session)
│   ├── subscription-provider.tsx  # Subscription tier management
│   ├── theme-provider.tsx   # Dark/light mode
│   ├── supabase.ts          # Supabase client initialization & helpers
│   ├── api-config.ts        # API key management
│   ├── utils.ts             # cn(), date formatting, ID generation, debounce
│   ├── colorThemes.ts
│   ├── auth-utils.ts
│   └── mem0.ts              # Mem0 client (mock implementation)
├── types/                   # TypeScript type definitions
│   ├── session.ts           # DailySession, LearnStep, ImplementStep, ReflectStep, archetypes
│   ├── personality.ts       # PersonalityProfile, signals, dimensions, discovery arc
│   ├── profile.ts           # Profile, UserBadge, DailyActivity (+ archetype, mode fields)
│   ├── journey.ts           # Journey, JourneyPhase, UserJourneyProgress
│   ├── quiz.ts              # Question, WeekendActivity, PsychologyModality
│   ├── memory.ts
│   └── supabase.ts          # Database types
├── config/
│   └── archetypes.ts        # 4 identity archetype configurations
├── data/                    # Static content data
│   ├── microActions.ts      # 65 curated micro-action templates (5 categories)
│   ├── journeys.ts          # 14 journey definitions with phases
│   ├── quizData.ts          # Questions & weekend activities
│   ├── persuasiveContent.ts # Psychological technique content
│   └── relationshipContent.ts
├── content/journeys/        # Journey-specific content files
└── integrations/supabase/   # Supabase client & generated types

supabase/
├── migrations/              # 6 SQL migration files
├── functions/               # Edge Functions (memory-operations, send-partner-invite)
├── schema.sql               # Complete database schema
└── config.toml              # Local Supabase config
```

## Key Architecture Decisions

### Routing
All routing is done client-side via React Router DOM. Protected routes use `<ProtectedRoute>` wrapper components (found in `src/components/auth/`, `src/components/ui/`, and `src/components/`). There are three copies of `ProtectedRoute` — check which one a given page uses.

### State Management
- **Global auth**: `AuthContext` in `src/lib/auth-context.tsx` — provides `user`, `profile`, `session`, `login()`, `register()`, `logout()`, `updateProfile()`
- **Subscriptions**: `SubscriptionProvider` in `src/lib/subscription-provider.tsx` — manages tier (free/premium/ultimate), feature gating, daily question limits
- **Theme**: `ThemeProvider` in `src/lib/theme-provider.tsx` — dark/light mode toggle
- **Server state**: React Query (`@tanstack/react-query`) for async data fetching with caching
- **Local state**: Component-level `useState` for UI interactions

### Service Layer
Services in `src/services/` encapsulate all Supabase and external API calls. `supabaseService.ts` is the largest (~29KB) and handles profiles, journeys, quizzes, achievements, and more. `aiService.ts` uses a singleton pattern (`AIService.getInstance()`).

### Database
Supabase (PostgreSQL) with tables: `profiles`, `journeys`, `journey_questions`, `user_journeys`, `journey_responses`, `partner_invitations`, `achievements`, `activities`, `quiz_results`, `user_roles`. Migrations are in `supabase/migrations/`. Row-level security is enabled.

## Code Conventions

### File Naming
- **Components**: PascalCase (`MetaphorAnimation.tsx`, `DashboardHeader.tsx`)
- **Services/utilities**: camelCase (`aiService.ts`, `dataLogger.ts`)
- **Hooks**: `use` prefix, camelCase (`useAuth.ts`, `useDashboardData.ts`)
- **Pages**: PascalCase (`Dashboard.tsx`, `DailyQuestions.tsx`)
- **Types**: camelCase file, PascalCase exports (`profile.ts` → `Profile`, `UserBadge`)

### Import Paths
Use the `@/` path alias for all imports from `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
```

### Component Patterns
- Functional components with hooks exclusively (no class components)
- Props interfaces defined at top of file or inline
- `cn()` utility (from `@/lib/utils`) for conditional Tailwind class merging
- Framer Motion `<motion.div>` for animations
- Sonner toast for user notifications
- shadcn/ui components as the base UI layer — do not create custom primitives when a shadcn component exists

### Styling
- Tailwind CSS utility classes exclusively (no CSS modules, no styled-components)
- Custom colors defined in `tailwind.config.ts`: primary `#9B51E0` (purple), secondary `#FFE4E4` (pink)
- CSS variables for theme colors in `src/index.css`
- Custom animations: `slide-up`, `slide-down`, `slide-left`, `slide-right`, `fade-in`
- Dark mode via class strategy (`dark:` prefix)

### TypeScript
- `tsconfig.json` has `strict: true` but the codebase has some lenient patterns
- Path alias: `@/*` → `./src/*`
- Type definitions centralized in `src/types/`
- `@typescript-eslint/no-unused-vars` is turned off in ESLint config

## Environment Variables

All client-side env vars use the `VITE_` prefix:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_OPENAI_API_KEY` — OpenAI API key (for date idea generation)

Environment files: `.env` (local), `.env.production` (production). These are gitignored.

## Subscription Tiers

Three tiers gate feature access (managed in `src/lib/subscription-provider.tsx`):
- **Free**: 2 daily questions, limited journeys
- **Premium**: 4 daily questions, 3 journeys
- **Ultimate**: Unlimited access, AI therapist, advanced analytics

## Testing

No test framework is currently configured. No test files exist in the repository.

## Deployment

- **Host**: Vercel
- **Config**: `vercel.json` — framework `vite`, output `dist/`
- **Security headers**: CSP, X-Frame-Options (DENY), X-Content-Type-Options, X-XSS-Protection configured in `vercel.json`

## Daily Session System (Learn → Implement → Reflect)

The core user experience. Every day, users complete a 5-7 minute session:

1. **Yesterday Check-in** (Day 2+, 30s) — Quick MC about how yesterday's micro-action went
2. **Learn** (2-3 min) — AI-generated question that teaches AND reveals personality signals
3. **Implement** (1 min) — Personalized micro-action from curated template library
4. **Session Complete** — Archetype-flavored celebration + streak

### Architecture Flow

```
User opens DailyQuestions page
        ↓
DailySessionService.generateSession()
  ├── AIModelService (routes to Gemini/Sonnet/Opus by tier)
  ├── ArchetypeConfig (personalizes greeting, framing, celebration)
  ├── DiscoveryQuestionService (generates Learn question)
  └── MicroAction templates + AI personalization (Implement step)
        ↓
User answers Learn question
        ↓
PersonalityInferenceService.analyzeResponse()
  → Extracts personality signals → feeds to PersonalityProfileService
  → Shows warm "micro-insight" to user
        ↓
User accepts micro-action → Session complete
```

### Key Files
- **Orchestrator**: `src/services/dailySessionService.ts`
- **AI Routing**: `src/services/aiModelService.ts`
- **Types**: `src/types/session.ts`
- **Components**: `src/components/session/` (7 components)
- **Page**: `src/pages/DailyQuestions.tsx` (state machine flow)

### Identity Archetypes

Users choose one during onboarding. It deeply personalizes all content:

| Archetype | Tagline | Content Frame |
|-----------|---------|---------------|
| **Calm Anchor** | "I want to be the steady, grounding presence" | Stability, grounding |
| **Compassionate Listener** | "I want to truly hear and understand" | Empathy, understanding |
| **Growth Seeker** | "I want to keep evolving and learning" | Progress, evolution |
| **Connection Builder** | "I want to create deeper bonds" | Intimacy, closeness |

Config: `src/config/archetypes.ts`

### Micro-Action Template Library

65 curated templates across 5 categories: communication (15), conflict (10), connection (15), awareness (12), behavior (13). Each has solo/partner versions, archetype variants, difficulty ratings, and AI personalization slots.

Data: `src/data/microActions.ts`

### Question Format Progression

| Days | Phase | MC % | Open % | Scale % |
|------|-------|------|--------|---------|
| 1-5 | Self-Awareness | 70 | 10 | 20 |
| 6-10 | Behavior Change | 50 | 25 | 15 |
| 11-14 | Skill Building | 35 | 40 | 15 |
| 15+ | Integration | 20 | 55 | 15 |

### Onboarding (3 screens, ~2 min)

1. **Welcome** — Name, solo/partner mode
2. **What brings you** — Goals (max 3), preferred session time
3. **Growth Identity** — Choose archetype

## AI Model Abstraction Layer

All AI calls route through `AIModelService` (`src/services/aiModelService.ts`):

| Task | Free (Gemini Flash) | Premium (Claude Sonnet 4.5) | Reports (Claude Opus 4.5) |
|------|--------------------|-----------------------------|---------------------------|
| Daily sessions | Yes | Yes | - |
| Question generation | Yes | Yes | - |
| Personality inference | Yes | Yes | - |
| Mirror narrative | - | - | Yes |
| Weekly insights | - | Yes | - |

The service handles provider routing, fallback chains, and request throttling.

## Personality Discovery System

The core differentiator of Sparq Connection Lab is its **14-day progressive personality discovery** system. Instead of upfront assessments, the app learns who users are through their natural daily responses — then reflects that understanding back to them.

### Architecture Overview

```
User answers daily question
        ↓
PersonalityInferenceService    ← Extracts personality signals via AI
        ↓
PersonalityProfileService      ← Aggregates signals into structured profile
        ↓
DiscoveryQuestionService       ← Generates next questions based on what's known/unknown
        ↓
MirrorNarrativeService         ← Day 14: generates "we see you" reflection
```

### Key Files

- **Types**: `src/types/personality.ts` — Complete type system for personality dimensions, signals, profiles, discovery phases
- **Inference**: `src/services/personalityInferenceService.ts` — AI-powered response analysis, extracts personality signals
- **Profile Builder**: `src/services/personalityProfileService.ts` — Aggregates signals, calculates dimension scores, persists via SupabaseMemory
- **Question Generator**: `src/services/discoveryQuestionService.ts` — AI-generated personalized questions for each discovery phase
- **Mirror Narrative**: `src/services/mirrorNarrativeService.ts` — Day 14 warm personal narrative reflecting the user's profile
- **React Hook**: `src/hooks/usePersonalityDiscovery.ts` — Orchestrates all services, provides state to UI components

### The 7 Personality Dimensions

| Dimension | What It Reveals | Key Modalities |
|-----------|----------------|----------------|
| **Attachment Style** | Secure, anxious, avoidant, fearful-avoidant | Attachment Theory, EFT |
| **Love Language** | Words, quality time, touch, acts, gifts | Love Languages |
| **Conflict Style** | Pursuer, withdrawer, validator, volatile, avoidant | Gottman Method, NVC |
| **Emotional Expression** | Vulnerability openness, vocabulary depth, processing style | EFT, Attachment Theory |
| **Values** | Core values, growth orientation, autonomy-interdependence | Narrative Therapy, CBT, Positive Psych |
| **Intimacy Profile** | Emotional/physical comfort, novelty preference, progression rate | Mindfulness, Sensate Focus |
| **Relational Identity** | How they see themselves as a partner, role patterns | Imago Therapy |

### The 14-Day Discovery Arc

| Phase | Days | Focus | Intimacy Level |
|-------|------|-------|---------------|
| **Rhythm** | 1-3 | Light, warm — values, positive memories, dreams | 1-2 |
| **Deepening** | 4-6 | Emotional depth — attachment, needs, what they cherish | 2-3 |
| **Navigating** | 7-9 | Challenge — conflict styles, love language confirmation, repair | 2-4 |
| **Layers** | 10-12 | Vulnerability — intimacy preferences, deeper patterns, identity | 3-4 |
| **Mirror** | 13-14 | Integration — celebrate discoveries, deliver the narrative | 3-5 |

### How to Use in Components

```typescript
import { usePersonalityDiscovery } from "@/hooks/usePersonalityDiscovery";

function DailyQuestionFlow() {
  const {
    discoveryDay, discoveryPhase, dailyQuestions,
    submitResponse, generateQuestions, mirrorReady,
    generateMirror, mirrorNarrative, profile
  } = usePersonalityDiscovery();

  // Generate today's questions
  useEffect(() => { generateQuestions("AM", 2); }, []);

  // After user answers
  const handleAnswer = (answer: string) => {
    submitResponse(question.text, question.modality, question.category, question.intimacyLevel, answer);
  };

  // Day 14: show the mirror
  if (mirrorReady) { generateMirror(); }
}
```

### ProfileContext for AI Calls

Every AI-powered feature should include the `ProfileContext` in its prompts. Get it via `getProfileContext()` from the hook. This ensures date ideas, journey recommendations, and coaching are all personalized to who the user actually is.

### Design Principles

1. **Discovery, not assessment** — Questions feel like connection exercises, not personality tests
2. **Strength-framed** — All traits described as natural tendencies, never diagnoses
3. **Confidence-tracked** — Each dimension has a confidence score; low-confidence findings are flagged as "emerging"
4. **Sensitivity-aware** — The system tracks topics to approach gently based on attachment/intimacy signals
5. **Progressive** — Profile keeps refining after Day 14 as the user continues engaging

## Common Gotchas

1. **package.json scripts are wrong**: They reference `next dev`/`next build` but the project uses Vite. Use `npx vite` for dev and `npx vite build` for builds.
2. **Multiple ProtectedRoute components**: There are three versions at `src/components/auth/ProtectedRoute.tsx`, `src/components/ui/protected-route.tsx`, and `src/components/ProtectedRoute.tsx`. Check which one is imported.
3. **`_app.tsx` and `_document.tsx` are vestiges**: These Next.js files exist in `src/pages/` but are not used by the Vite setup.
4. **Mem0 integration is mocked**: `src/lib/mem0.ts` is a mock implementation, not fully connected.
5. **Duplicate files**: `useAuth.ts` and `useAuth.tsx` both exist in `src/hooks/` — verify which is imported.
