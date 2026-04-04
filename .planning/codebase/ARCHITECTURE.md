# Architecture

## High-Level Shape
- Frontend: Next.js pages in `src/pages/**`
- Shared UI: reusable components in `src/components/**`
- Browser data access: Supabase client from `src/lib/supabase.ts`
- Server-side orchestration: API routes in `src/pages/api/**`
- Server-only helpers: `src/lib/server/**`
- Content/data sources: `src/data/**`, `src/content/**`
- Database and edge infrastructure: `supabase/**`

## Main Runtime Flow
1. App bootstraps in `src/pages/_app.tsx`
2. Providers wrap the app:
   - `AuthProvider` from `src/lib/auth-context.tsx`
   - `SubscriptionProvider` from `src/lib/subscription-provider.tsx`
   - `QueryClientProvider` from `@tanstack/react-query`
3. Route-level pages either:
   - render directly with browser-side Supabase calls, or
   - call API routes under `src/pages/api/**`
4. API routes validate auth through `src/lib/server/supabase-auth.ts`
5. API routes use Supabase tables plus server helpers in `src/lib/server/**`
6. AI-capable routes call Peter/OpenRouter or OpenAI-backed utilities

## Main Product Domains

### Daily Loop
- UI: `src/pages/daily-growth.tsx`
- Session APIs: `src/pages/api/daily/session/start.ts`, `morning-viewed.ts`, `complete.ts`, `evening-checkin.ts`
- Content resolution: `src/lib/server/journey-content.ts`
- Prompt construction: `src/lib/peterService.ts`

### Dashboard / Progress
- Main page: `src/pages/dashboard.tsx`
- Dashboard components: `src/components/dashboard/**`
- Realtime sync hook: `src/hooks/useRealtimeSync.ts`
- Journey velocity helper: `src/services/journeyContentService.ts`

### Onboarding
- Main page: `src/pages/onboarding.tsx`
- Onboarding component flow: `src/components/onboarding/**`
- Matching and profile derivation: `src/lib/onboarding/**`
- Onboarding scoring route: `src/pages/api/onboarding/score-freetext.ts`

### Peter / Coaching
- Prompt and voice policy: `src/lib/peterService.ts`
- Model client: `src/lib/openrouter.ts`
- API routes: `src/pages/api/peter/**`

### Profile / Personalization / Trust
- Preferences endpoint: `src/pages/api/preferences.ts`
- Profile endpoints: `src/pages/api/profile/**`
- Trust UI: `src/pages/trust-center.tsx`
- Memory and privacy helpers: `src/lib/server/memory.ts`, `src/lib/server/privacy.ts`

## Architectural Pattern In Practice
- The intended modern pattern looks like:
  - page or hook
  - API route
  - server helper
  - Supabase
- Example: `src/pages/api/daily/session/start.ts` uses `getAuthedContext()`, entitlement resolution, date helpers, analytics, trait-gap helpers, and journey content helpers.

## Architectural Drift
- There are two parallel patterns in the repo:
  - newer server-first code in `src/lib/server/**` and `src/pages/api/**`
  - older broad service abstractions in `src/services/**`
- There are also multiple auth layers:
  - `src/lib/auth-context.tsx`
  - `src/lib/auth/**`
  - `src/hooks/useAuth.ts`
  - `src/hooks/useAuth.tsx`
- This increases the cost of changes because the canonical path is not always obvious.

## Data Flow Notes
- Some pages fetch directly from Supabase in the browser, for example `src/pages/dashboard.tsx`.
- Some pages use API routes to centralize behavior and analytics, for example the daily session flow.
- Trust-sensitive operations like memory access and semantic search run server-side with service-role Supabase credentials in `src/lib/server/memory.ts`.

## Practical Summary
- The codebase is not a clean layered monolith, but it does have a visible center of gravity:
  - `src/pages/**` for product surfaces
  - `src/pages/api/**` for business operations
  - `src/lib/server/**` for reusable backend logic
- Future refactors should consolidate toward that path and shrink the older `src/services/**` footprint.
