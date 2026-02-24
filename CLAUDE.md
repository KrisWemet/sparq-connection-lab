# CLAUDE.md — Sparq Connection Lab

## Project Overview

Sparq Connection Lab is a **relationship enhancement web app** that helps couples strengthen their connection through daily questions, structured relationship journeys, goal tracking, date ideas, and engagement streaks. It uses psychological frameworks (Gottman Method, Love Languages, Attachment Theory, NVC) to guide users.

The app is currently in an **MVP state** focused on: Daily Questions + Streaks + Optional Partner linking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 13 (Pages Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui components |
| Animations | Framer Motion |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Icons | lucide-react |
| Markdown | marked, react-markdown |
| Deployment | Vercel |

**Important:** The project was migrated from Vite to Next.js. Residual Vite files (`vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`, `src/vite-env.d.ts`) still exist but are **not used** by the Next.js build. Do not reference them when making changes.

---

## Repository Structure

```
sparq-connection-lab/
├── src/
│   ├── pages/              # Next.js pages (file-based routing)
│   │   ├── _app.tsx        # App entry: wraps with AuthProvider + QueryClientProvider
│   │   ├── _document.tsx   # Custom HTML document
│   │   ├── index.tsx       # Root redirect (→ /login or /dashboard)
│   │   ├── login.tsx       # Login page
│   │   ├── daily-questions.tsx  # Re-exports DailyQuestions page component
│   │   ├── Dashboard.tsx   # Main dashboard (streak, connection score, partner invite)
│   │   ├── DailyQuestions.tsx   # Core MVP feature: today's question
│   │   ├── Auth.tsx        # Auth flow
│   │   ├── Profile.tsx     # User profile
│   │   ├── Journeys.tsx    # Journey browser
│   │   ├── journeys/       # Individual journey pages (14 journeys)
│   │   └── ...             # Other feature pages
│   │
│   ├── components/         # Reusable React components
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── auth/           # Login form, auth layout
│   │   ├── dashboard/      # Dashboard sub-components
│   │   ├── journey/        # Journey viewer components
│   │   ├── onboarding/     # 4-step onboarding flow
│   │   ├── profile/        # Profile sub-components
│   │   └── quiz/           # Relationship health quiz
│   │
│   ├── lib/
│   │   ├── auth/           # PRIMARY auth system (use this)
│   │   │   ├── index.ts    # Exports: useAuth, AuthProvider, AuthContext
│   │   │   ├── auth-provider.tsx
│   │   │   ├── auth-context.ts
│   │   │   ├── auth-operations.ts
│   │   │   ├── auth-state.ts
│   │   │   └── hooks/      # use-auth-loading, use-auth-operations, etc.
│   │   ├── auth-context.tsx  # LEGACY auth context (kept for backward compat)
│   │   ├── supabase.ts     # Supabase client + DB helper functions + type defs
│   │   ├── mem0.ts         # Mem0 mock client (personalized suggestions)
│   │   ├── utils.ts        # cn() utility (clsx + tailwind-merge)
│   │   └── colorThemes.ts  # Theme color definitions
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts/.tsx # Thin wrappers (prefer src/lib/auth/use-auth.ts)
│   │   ├── useDashboardData.ts
│   │   ├── useJourney.ts
│   │   ├── useOnboarding.ts
│   │   ├── useRealtimeSync.ts
│   │   └── useAnalytics.ts
│   │
│   ├── services/           # Business logic / API calls
│   │   ├── aiService.ts    # OpenAI integration for date ideas
│   │   ├── analyticsService.ts
│   │   ├── journeyService.ts
│   │   ├── journeyContentService.ts  # Loads journey .md content
│   │   ├── memoryService.ts
│   │   ├── notificationService.ts
│   │   ├── onboardingService.ts
│   │   ├── partnerService.ts
│   │   ├── supabase.ts     # Supabase CRUD helpers
│   │   └── supabaseService.ts
│   │
│   ├── data/               # Static data / content
│   │   ├── journeys.ts     # Journey definitions (title, description, phases, etc.)
│   │   ├── quizData.ts     # Relationship health quiz questions
│   │   ├── relationshipContent.ts
│   │   └── persuasiveContent.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── journey.ts
│   │   ├── memory.ts
│   │   ├── profile.ts
│   │   ├── quiz.ts
│   │   └── supabase.ts     # Auto-generated Supabase DB types
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts   # Vite-era Supabase client (uses VITE_ env vars — legacy)
│   │       └── types.ts    # Database type definitions
│   │
│   ├── content/
│   │   └── journeys/       # Markdown content for journeys
│   │
│   └── styles/
│       └── globals.css     # Global CSS (Tailwind + CSS vars for theming)
│
├── supabase/
│   ├── config.toml         # Supabase local dev config (project: nbljcvqiiurfbjquhbxu)
│   ├── schema.sql          # Full database schema definition
│   ├── migrations/         # Incremental SQL migrations
│   └── functions/          # Supabase Edge Functions
│       ├── memory-operations/  # JWT-verified memory CRUD
│       └── send-partner-invite/  # JWT-verified partner invite emails
│
├── public/
│   └── Path to Together/   # Public markdown journey content
│
├── Path to Together/       # Source markdown files for journeys (14 topics)
│
├── .env                    # Local env vars (Vite-style: VITE_SUPABASE_URL, etc.)
├── next-env.d.ts
├── tsconfig.json           # Active TypeScript config (Next.js)
├── tailwind.config.ts      # Active Tailwind config
├── components.json         # shadcn/ui config
├── vercel.json             # Vercel deployment (NOTE: still references "vite" — needs update)
└── package.json
```

---

## Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Next.js dev server on http://localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

There is also a `run_dev.py` script at the root that wraps `npm run dev` with additional logging/process management.

**No test suite is configured.** There are no test files or testing dependencies.

---

## Environment Variables

The project uses two naming conventions (legacy Vite-style and current Next.js-style). Both must be set:

```bash
# .env (Vite-style — used by src/integrations/supabase/client.ts)
VITE_SUPABASE_URL=https://nbljcvqiiurfbjquhbxu.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# .env.local (Next.js-style — used by src/lib/supabase.ts, the primary client)
NEXT_PUBLIC_SUPABASE_URL=https://nbljcvqiiurfbjquhbxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_MEM0_API_KEY=<optional-mem0-key>
```

The primary Supabase client (`src/lib/supabase.ts`) reads `NEXT_PUBLIC_*` vars. Always prefer setting `NEXT_PUBLIC_*` vars for new code.

---

## Authentication

### Primary Auth System
Use `src/lib/auth/index.ts` for all authentication. Import pattern:

```typescript
import { useAuth } from '@/lib/auth';

// Available context values:
const { user, profile, isAdmin, isOnboarded, loading, signIn, signUp, signOut, handleRefreshProfile } = useAuth();
```

The `AuthProvider` is mounted in `src/pages/_app.tsx`. It uses:
- `useInitialSession` — restores session from localStorage + Supabase on mount
- `useAuthSubscription` — listens for `onAuthStateChange` events
- `useAuthOperations` — provides signIn/signUp/signOut handlers

### Legacy Auth (do not use for new code)
- `src/lib/auth-context.tsx` — older monolithic context with `login`/`register`/`logout` API
- `src/hooks/useAuth.ts` / `src/hooks/useAuth.tsx` — thin wrappers around the legacy context

### Auth Flow
1. Unauthenticated users → `/login`
2. Authenticated, not onboarded → `/onboarding` (currently disabled; `is_onboarded` defaults to `false` but redirect is suppressed)
3. Authenticated, onboarded → `/dashboard`

Protected routes use `src/components/auth/ProtectedRoute.tsx` or `src/components/ui/protected-route.tsx`.

---

## Database (Supabase)

### Key Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile extending `auth.users` (name, avatar, partner_id, streak_count, subscription_tier) |
| `user_roles` | Multi-role support (user / admin / partner) |
| `partner_invitations` | Partner invite codes with expiry |
| `journeys` | Predefined relationship growth journey definitions |
| `journey_questions` | Steps/questions within each journey |
| `user_journeys` | Per-user journey progress |
| `journey_responses` | User answers to journey questions |
| `goals` | User-defined relationship goals |
| `goal_milestones` | Milestones within goals |
| `daily_questions` | Daily question bank |
| `daily_question_responses` | User answers to daily questions |
| `date_ideas` | Date idea catalog |
| `user_date_ideas` | Saved/completed date ideas per user |
| `user_activities` | Analytics event log (JSONB details) |
| `system_settings` | Admin-configurable feature flags |

### Row Level Security
All tables have RLS enabled. Key policies:
- Users read/update only their own profile
- Users can read their partner's profile (via `partner_id`)
- Admins can access all records via `is_admin()` function
- Partner invitations are scoped to `sender_id`

### Primary DB Client
`src/lib/supabase.ts` exports `supabase` (the client) plus helper functions: `getProfile`, `updateProfile`, `logActivity`, `getUserAchievements`, `getRecentActivities`.

---

## Routing

Uses Next.js Pages Router. Key routes:

| Path | File | Notes |
|---|---|---|
| `/` | `src/pages/Index.tsx` | Redirects to `/dashboard` or `/login` |
| `/login` | `src/pages/login.tsx` | Login page |
| `/dashboard` | `src/pages/Dashboard.tsx` | Main dashboard |
| `/daily-questions` | `src/pages/daily-questions.tsx` | Re-exports `DailyQuestions.tsx` |
| `/profile` | `src/pages/Profile.tsx` | User profile |
| `/journeys` | `src/pages/Journeys.tsx` | Journey browser |
| `/journeys/[id]` | `src/pages/journeys/*.tsx` | Individual journey pages |
| `/onboarding` | `src/pages/Onboarding.tsx` | 4-step onboarding |
| `/join-partner` | `src/pages/JoinPartner.tsx` | Accept partner invite |

Use `next/router` for navigation:
```typescript
import { useRouter } from 'next/router';
const router = useRouter();
router.push('/dashboard');
```

Do **not** use `react-router-dom` — it was removed during the Vite→Next.js migration.

---

## UI Components

### shadcn/ui
All primitive UI components live in `src/components/ui/`. These are generated by shadcn/ui and use Radix UI primitives under the hood. The base color is `slate` with CSS variables for theming.

Add new shadcn components with:
```bash
npx shadcn-ui@latest add <component-name>
```

### Utility Function
Always use the `cn()` helper for conditional class names:
```typescript
import { cn } from '@/lib/utils';
// Uses clsx + tailwind-merge internally
```

### Path Alias
`@/` maps to `src/`. Use this for all imports:
```typescript
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
```

---

## Relationship Journeys

14 journeys are defined across these categories: Foundation, Skills, Advanced. Each journey has:
- `id` (slug string)
- `title`, `description`, `duration`, `category`
- `phases` (array of named phases with day ranges)
- `psychology` (list of frameworks used)
- `benefits` (user-facing outcomes)
- `icon` (lucide-react component)
- `free` / `badge` (subscription gating)
- `overview` (markdown description)

Journey definitions live in `src/data/journeys.ts`. Markdown content for each journey is in `src/content/journeys/` and `public/Path to Together/`.

---

## Known Issues / Tech Debt

1. **Duplicate auth implementations**: The modular `src/lib/auth/` system is the canonical one. `src/lib/auth-context.tsx` and `src/hooks/useAuth.*` are legacy. New code should import from `@/lib/auth`.

2. **Missing `@tanstack/react-query` dependency**: `src/pages/_app.tsx` imports `QueryClientProvider` from `@tanstack/react-query`, but it's not listed in `package.json`. Install it if using React Query features:
   ```bash
   npm install @tanstack/react-query
   ```

3. **`vercel.json` references Vite**: The `vercel.json` still has `"framework": "vite"` and `"outputDirectory": "dist"`. For a Next.js deployment to Vercel, Vercel auto-detects Next.js so this file may need updating or removal.

4. **Mixed env variable naming**: Some files use `VITE_SUPABASE_*`, others use `NEXT_PUBLIC_SUPABASE_*`. The active Next.js code in `src/lib/supabase.ts` uses `NEXT_PUBLIC_*`. New code should always use `NEXT_PUBLIC_*`.

5. **Mem0 integration is a mock**: `src/lib/mem0.ts` contains a local in-memory mock, not a real Mem0 API call. Set `NEXT_PUBLIC_MEM0_API_KEY` to enable real integration when implemented.

6. **Dead Vite files**: `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`, `src/vite-env.d.ts`, `src/App.css`, `src/SimpleApp.tsx`, `src/SimpleTest.tsx` are unused remnants of the Vite setup. They can be safely removed.

7. **Onboarding disabled**: `src/pages/Index.tsx` or auth redirects skip onboarding even when `is_onboarded = false`. This was intentional ("d67b0f5 Disable onboarding requirement") but may need re-enabling.

---

## Code Conventions

- **TypeScript strict mode** is on. Avoid `any` casts unless unavoidable; use type assertions with `as` sparingly.
- **ESLint** uses `typescript-eslint` recommended rules. `@typescript-eslint/no-unused-vars` is turned off.
- **React hooks** rules are enforced via `eslint-plugin-react-hooks`.
- **Component files** use PascalCase (`DailyQuestions.tsx`). Utility/hook files use camelCase (`useAuth.ts`).
- **No default export inconsistency**: Pages use `export default function PageName()`. Components may use named or default exports.
- **Async patterns**: Supabase calls are always `async/await`. Errors are caught and logged; most functions return `null` or `false` on failure rather than throwing.
- **Streak logic**: A streak increments when the user completes an activity on consecutive calendar days. Missing a day resets it to 1. This logic exists in both `src/lib/auth-context.tsx` and `src/lib/supabase.ts:logActivity`.
- **Profile fields**: The `Profile` type in `src/lib/supabase.ts` uses snake_case (`partner_name`, `streak_count`). The `profiles` table in Supabase schema uses snake_case as well. Be consistent.

---

## Supabase Local Development

```bash
# Start local Supabase stack
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types from schema
npx supabase gen types typescript --local > src/types/supabase.ts

# Stop local stack
npx supabase stop
```

Local ports (from `supabase/config.toml`):
- API: `54321`
- DB: `54322`
- Studio: `54323`
- Auth redirect URL: `http://localhost:3000`

Edge Functions (`supabase/functions/`):
- `memory-operations` — CRUD for user memories (JWT required)
- `send-partner-invite` — Sends partner invite emails (JWT required)
