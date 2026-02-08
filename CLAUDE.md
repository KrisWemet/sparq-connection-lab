# CLAUDE.md — Sparq Connection Lab

## Project Overview

Sparq Connection Lab is a relationship enhancement web application that guides couples through psychology-backed journeys, daily activities, quizzes, and partner connection features. It uses techniques from Love Languages, Gottman Method, CBT, Attachment Theory, and other frameworks to strengthen relationships.

**Live domain**: sharedjourney.ai

## Tech Stack

- **Framework**: React 18 + TypeScript (Vite SPA, not Next.js — ignore `package.json` scripts referencing `next`)
- **Build tool**: Vite (dev server on port 8080)
- **Routing**: React Router DOM (client-side SPA routing)
- **Styling**: Tailwind CSS 3 with `tailwindcss-animate` plugin, dark mode via `class` strategy
- **UI components**: shadcn/ui (53 components in `src/components/ui/`)
- **State management**: React Context API (AuthContext, SubscriptionProvider, ThemeProvider) + React Query for server state
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
│   ├── onboarding/          # 5-step onboarding flow
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
│   ├── DailyQuestions.tsx   # Daily question flow
│   ├── Quiz.tsx             # Relationship quiz
│   └── ...                  # ~30 total pages
├── services/                # Business logic & API layer
│   ├── supabaseService.ts   # Core Supabase CRUD operations (largest service)
│   ├── aiService.ts         # OpenAI integration for date ideas (singleton pattern)
│   ├── journeyService.ts    # Journey progress tracking
│   ├── journeyContentService.ts
│   ├── partnerService.ts    # Partner invitation and connection
│   ├── analyticsService.ts  # Relationship health metrics
│   ├── memoryService.ts     # Mem0 memory integration
│   ├── notificationService.ts
│   ├── onboardingService.ts
│   └── dataLogger.ts        # Activity logging
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts / .tsx    # Auth state access
│   ├── useAuthRedirect.ts   # Auth-based navigation
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
│   ├── profile.ts           # Profile, UserBadge, DailyActivity
│   ├── journey.ts           # Journey, JourneyPhase, UserJourneyProgress
│   ├── quiz.ts              # Question, WeekendActivity, PsychologyModality
│   ├── memory.ts
│   └── supabase.ts          # Database types
├── data/                    # Static content data
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

## Common Gotchas

1. **package.json scripts are wrong**: They reference `next dev`/`next build` but the project uses Vite. Use `npx vite` for dev and `npx vite build` for builds.
2. **Multiple ProtectedRoute components**: There are three versions at `src/components/auth/ProtectedRoute.tsx`, `src/components/ui/protected-route.tsx`, and `src/components/ProtectedRoute.tsx`. Check which one is imported.
3. **`_app.tsx` and `_document.tsx` are vestiges**: These Next.js files exist in `src/pages/` but are not used by the Vite setup.
4. **Mem0 integration is mocked**: `src/lib/mem0.ts` is a mock implementation, not fully connected.
5. **Duplicate files**: `useAuth.ts` and `useAuth.tsx` both exist in `src/hooks/` — verify which is imported.
