# Integrations

## Core External Services

### Supabase
- Browser client: `src/lib/supabase.ts`
- API auth helper: `src/lib/server/supabase-auth.ts`
- Generated types: `src/types/supabase.ts`, `src/integrations/supabase/types.ts`
- Local project config: `supabase/config.toml`
- Schema and migrations: `supabase/schema.sql`, `supabase/migrations/**`

Used for:
- Auth and session handling
- Postgres data storage
- Realtime presence or sync hooks
- Edge functions

### OpenRouter
- Client wrapper: `src/lib/openrouter.ts`
- Main Peter routes: `src/pages/api/peter/chat.ts`, `src/pages/api/peter/morning.ts`

Used for:
- Peter coaching responses
- Morning story generation
- Fallback model routing across multiple providers

### OpenAI
- Transcription: `src/pages/api/peter/transcribe.ts`
- Embeddings: `src/lib/server/embeddings.ts`
- Safety classification support: `src/lib/safety.ts`
- Date idea generation path also references OpenAI key usage: `src/pages/api/date-ideas/generate.ts`

Used for:
- Voice transcription
- Embedding generation for memory search
- Some safety and generation features

### Mem0 / Memory Layer
- Client wrapper: `src/lib/mem0.ts`
- Server memory layer: `src/lib/server/memory.ts`
- Related types: `src/types/memory.ts`

Used for:
- Long-term AI memory and semantic recall
- Memory deletion and trust-center behavior

## Supabase Edge Functions
- `supabase/functions/memory-operations/index.ts`
- `supabase/functions/send-partner-invite/index.ts`
- `supabase/functions/send-tonight-action/index.ts`
- `supabase/functions/generate-daily-insight/index.ts`
- `supabase/functions/stripe-checkout/index.ts`

## Auth And Identity
- App auth provider: `src/lib/auth-context.tsx`
- Alternate auth module set also exists under `src/lib/auth/**`
- Browser auth persistence currently enabled in `src/lib/supabase.ts`
- API routes expect Bearer tokens through `getAuthedContext()` in `src/lib/server/supabase-auth.ts`

## Analytics
- Server-side event insert helper: `src/lib/server/analytics.ts`
- Older client service wrapper: `src/services/analyticsService.ts`

Used for:
- Product event logging into `analytics_events`
- Daily loop and invite instrumentation

## Payments
- Stripe edge checkout function: `supabase/functions/stripe-checkout/index.ts`
- Subscription UI page: `src/pages/subscription.tsx`
- Entitlements logic: `src/pages/api/me/entitlements.ts`, `src/lib/server/entitlements.ts`

## Notifications / Outbound Actions
- Tonight action function: `supabase/functions/send-tonight-action/index.ts`
- Partner invite function: `supabase/functions/send-partner-invite/index.ts`
- Client notification service abstraction: `src/services/notificationService.ts`

## Configured Environment Variables Seen In Code
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_MEM0_API_KEY`
- `NEXT_PUBLIC_GOOGLE_API_KEY`
- `STRIPE_SECRET_KEY`
- test helpers also use `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `BASE_URL`

## Integration Notes
- Several integrations are wired in more than one style, especially auth, analytics, and Supabase access.
- The newer direction appears to be thin API routes plus `src/lib/server/**` helpers, while `src/services/**` contains older client-driven abstractions still in circulation.
