# Structure

## Top-Level Layout
- `src/pages/**`: route files, route-local page logic, API routes
- `src/components/**`: reusable UI and domain components
- `src/lib/**`: shared libraries, auth, server helpers, utilities
- `src/services/**`: older service-style abstractions
- `src/data/**`: static data sets and starter-journey content
- `src/content/**`: markdown content
- `src/hooks/**`: custom hooks
- `src/types/**`: shared TypeScript types
- `supabase/**`: schema, migrations, edge functions, local config
- `e2e/**`: Playwright setup, helpers, and end-to-end specs
- `scripts/**`: local utility scripts for test setup and simulation

## Key Source Directories

### Pages
- App shell: `src/pages/_app.tsx`
- Auth entry points: `src/pages/login.tsx`, `src/pages/signup.tsx`, `src/pages/auth.tsx`
- Core product pages: `src/pages/dashboard.tsx`, `src/pages/daily-growth.tsx`, `src/pages/journeys.tsx`, `src/pages/profile.tsx`, `src/pages/trust-center.tsx`
- API routes: `src/pages/api/**`
- Legacy or alternate product pages still present: `src/pages/daily-questions.tsx`, `src/pages/daily-activity.tsx`, `src/pages/quiz.tsx`, `src/pages/messages.tsx`

### Components
- Dashboard slices: `src/components/dashboard/**`
- Onboarding flow: `src/components/onboarding/**`
- Shared UI primitives: `src/components/ui/**`
- Profile-related components: `src/components/profile/**`
- Daily and journey-specific components: `src/components/daily/**`, `src/components/journey/**`, `src/components/journeys/**`

### Libraries
- Auth and session helpers: `src/lib/auth-context.tsx`, `src/lib/auth/**`
- Supabase browser client: `src/lib/supabase.ts`
- OpenRouter client: `src/lib/openrouter.ts`
- Peter prompt policy: `src/lib/peterService.ts`
- Server domain helpers: `src/lib/server/**`

### Supabase
- Config: `supabase/config.toml`
- Migrations: `supabase/migrations/**`
- Edge Functions: `supabase/functions/**`
- Snapshot schema: `supabase/schema.sql`

## Naming Patterns
- Pages use route-style file names, mostly kebab-case: `daily-growth.tsx`, `trust-center.tsx`
- React components use PascalCase: `PartnerSynthesisCard.tsx`, `ConsentGate.tsx`
- Server helper files are lower-case and domain-based: `relationship-score.ts`, `journey-content.ts`
- API route grouping mirrors product domains: `src/pages/api/daily/session/**`, `src/pages/api/profile/**`, `src/pages/api/peter/**`

## Structural Observations
- The codebase mixes newer alias imports like `@/lib/server/...` with older relative imports like `../lib/auth-context`.
- There is a lot of domain sprawl inside `src/pages/`, which makes route discovery easy but increases the need for documentation.
- Several legacy surfaces remain checked in even when the product direction has shifted, so route presence does not always mean active priority.

## Good Entry Points For New Contributors
- Product shell: `src/pages/_app.tsx`
- Main user dashboard: `src/pages/dashboard.tsx`
- Daily loop: `src/pages/daily-growth.tsx`
- Peter behavior: `src/lib/peterService.ts`
- Daily session API lifecycle: `src/pages/api/daily/session/start.ts`
- Schema and migrations: `supabase/schema.sql`, `supabase/migrations/**`
