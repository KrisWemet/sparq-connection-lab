# Conventions

## General Coding Style
- TypeScript is the default across the repo.
- React function components are the standard pattern: `src/pages/dashboard.tsx`, `src/components/onboarding/ConsentGate.tsx`
- Tailwind utility classes are the primary styling mechanism.
- Motion is commonly added with Framer Motion rather than bespoke animation utilities.

## Import And Module Style
- Both alias imports and relative imports are used:
  - alias example: `@/lib/server/journey-content`
  - relative example: `../lib/auth-context`
- This is workable, but not yet fully normalized.

## State And Data Patterns
- App-wide providers are centralized in `src/pages/_app.tsx`
- Local page state often lives inside the page component with `useState` and `useEffect`
- React Query exists globally, but many screens still fetch manually rather than using shared query hooks
- Browser Supabase calls are common on pages like `src/pages/dashboard.tsx`
- Server-side coordination is increasingly moving into `src/pages/api/**` + `src/lib/server/**`

## Auth Patterns
- Protected pages typically rely on `useAuth()` from `src/lib/auth-context.tsx`
- API routes use `getAuthedContext()` from `src/lib/server/supabase-auth.ts`
- There are duplicate auth helpers and hooks under `src/lib/auth/**` and `src/hooks/useAuth*`, so the convention is not fully consolidated

## Error Handling
- The codebase tends to favor forgiving UX over strict failures:
  - many async blocks use `try/catch {}` with silent failure or fallback behavior
  - analytics calls are explicitly best-effort in `src/lib/server/analytics.ts`
- This helps product flow, but it also hides failure causes.

## Product-Language Conventions
- AI and user-facing copy are intentionally moving toward:
  - warm tone
  - non-clinical voice
  - short sentences
  - simple reading level
- The strongest source for that policy is `src/lib/peterService.ts`

## Testing Conventions
- Tests are end-to-end oriented with Playwright
- Auth bootstrapping is handled first in `e2e/auth.setup.ts`
- Shared mocks live in `e2e/helpers/mock-peter.ts` and `e2e/helpers/mock-supabase.ts`
- Test files are numbered by flow in `e2e/tests/**`

## Lint And Type Conventions
- ESLint extends `next/core-web-vitals`: `.eslintrc.json`
- The repo still contains many `any` types and multiple `eslint-disable` comments, especially in older service code and some pages

## Convention Gaps Worth Noting
- Mixed old/new architecture patterns
- Duplicate auth modules
- Inconsistent preference for API routes vs direct browser Supabase access
- Heavy `any` usage in older files like `src/services/supabaseService.ts`, `src/pages/profile.tsx`, and `src/pages/join-partner.tsx`
