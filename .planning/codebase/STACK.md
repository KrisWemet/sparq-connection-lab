# Stack

## Overview
- Product: `sparq-connection-lab`
- App type: Next.js web app with API routes, Supabase backend, AI-assisted relationship coaching, and Playwright end-to-end coverage.
- Main entry points: `src/pages/_app.tsx`, `src/pages/index.tsx`, `src/pages/dashboard.tsx`, `src/pages/api/**`.

## Languages And Runtime
- TypeScript across app and API code: `src/**/*.ts`, `src/**/*.tsx`, `supabase/functions/**/*.ts`
- React 18 for UI: `src/pages/**/*.tsx`, `src/components/**/*.tsx`
- Next.js 13 Pages Router: `package.json`, `src/pages/**`
- Node runtime for local dev and Next server: `package.json`
- Deno runtime for Supabase Edge Functions: `supabase/functions/**`

## Frontend Stack
- React 18 + Next.js pages router: `package.json`, `src/pages/_app.tsx`
- Tailwind CSS 3: `tailwind.config.js`, `tailwind.config.ts`, `src/styles/globals.css`
- Radix UI primitives + shadcn-style wrappers: `package.json`, `src/components/ui/**`
- Framer Motion for transitions and motion polish: `package.json`, `src/pages/dashboard.tsx`, `src/components/PageTransition.tsx`
- TanStack React Query provider initialized globally: `src/pages/_app.tsx`
- Sonner for toasts: `package.json`
- Lucide React for icons: `package.json`
- `next/font/google` for typography setup: `src/pages/_app.tsx`

## Backend Stack
- Next.js API routes under `src/pages/api/**`
- Supabase for auth, Postgres, realtime, and edge functions: `src/lib/supabase.ts`, `src/lib/server/supabase-auth.ts`, `supabase/config.toml`
- Supabase migrations tracked in `supabase/migrations/**`
- Supabase schema snapshot in `supabase/schema.sql`

## AI Stack
- OpenRouter chat completions for Peter with model fallback routing: `src/lib/openrouter.ts`
- OpenAI SDK used for transcription, embeddings, and some analysis paths: `src/pages/api/peter/transcribe.ts`, `src/lib/server/embeddings.ts`, `src/lib/safety.ts`
- Prompting and coach policy live in `src/lib/peterService.ts`
- Memory layer backed by Supabase + embeddings in `src/lib/server/memory.ts`

## Testing And Quality Tooling
- ESLint via Next core-web-vitals preset: `.eslintrc.json`
- Playwright end-to-end suite: `playwright.config.ts`, `e2e/tests/**`
- No Jest or Vitest config found in the repo root.

## Build And Deployment
- Dev/build/start scripts: `package.json`
- Vercel deployment config: `vercel.json`
- Supabase local stack ports and auth config: `supabase/config.toml`

## Key Dependencies
- `next`, `react`, `react-dom`
- `@supabase/supabase-js`
- `@tanstack/react-query`
- `framer-motion`
- `openai`
- `zod`
- `lucide-react`
- `sonner`

## Observed Stack Notes
- The repo carries both old service-style modules under `src/services/**` and newer server-oriented logic under `src/lib/server/**` and `src/pages/api/**`.
- Tailwind appears to have both `tailwind.config.js` and `tailwind.config.ts`, which is a configuration smell worth cleaning up later.
