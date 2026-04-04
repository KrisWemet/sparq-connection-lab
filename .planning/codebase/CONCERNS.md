# Concerns

## 1. Architecture Drift
- The repo currently holds multiple overlapping implementation styles:
  - `src/services/**`
  - `src/lib/server/**`
  - direct Supabase use inside pages like `src/pages/dashboard.tsx`
- This makes it harder to know the canonical place for new logic.

## 2. Auth Duplication
- Auth logic exists in several places:
  - `src/lib/auth-context.tsx`
  - `src/lib/auth/**`
  - `src/hooks/useAuth.ts`
  - `src/hooks/useAuth.tsx`
- This is a maintenance risk because behavior can diverge silently.

## 3. Type Safety Erosion
- Many files still rely on `any`, especially:
  - `src/services/supabaseService.ts`
  - `src/services/journeyContentService.ts`
  - `src/pages/profile.tsx`
  - `src/pages/join-partner.tsx`
  - parts of API handlers and memory helpers
- The app is written in TypeScript, but some important domains are still loosely typed.

## 4. Silent Failure Patterns
- Many `try/catch` blocks swallow errors or degrade quietly.
- This protects UX, but it can hide operational issues in:
  - dashboard loading
  - partner syncing
  - memory and AI operations
  - analytics

## 5. Legacy Surface Area
- The route tree is broad and appears to include old or alternate product directions:
  - `src/pages/daily-questions.tsx`
  - `src/pages/daily-activity.tsx`
  - `src/pages/quiz.tsx`
  - older services under `src/services/**`
- That increases cognitive load for product work and onboarding.

## 6. Config Smells
- Both `tailwind.config.js` and `tailwind.config.ts` are present.
- Generated artifacts like `playwright-report/index.html` and `tsconfig.tsbuildinfo` are currently modified in the working tree.

## 7. Testing Scope Imbalance
- The repo has useful Playwright coverage, but no unit or component test framework was found.
- Lower-level business rules in `src/lib/server/**` and `src/lib/**` may be under-protected.

## 8. Sensitive-System Risks
- The app handles trust, memory, AI coaching, and relationship guidance.
- That raises the cost of:
  - imprecise copy
  - hidden auth bugs
  - accidental data exposure
  - weak separation between private and shared partner data

## 9. Working Tree Noise
- The repository is currently dirty with unrelated modified and untracked files, including docs, images, test artifacts, and generated output.
- That raises merge and review friction for future changes unless kept tidy.

## 10. Best Near-Term Refactor Targets
- Consolidate around `src/pages/api/**` + `src/lib/server/**` as the backend path
- Reduce `src/services/**` to only still-needed browser-side helpers
- Collapse duplicate auth entry points
- Replace high-churn `any` usage in core flows with real domain types
- Add smaller tests for helper logic behind the daily loop and trust/privacy behavior
