# Phase 9 Focused Production Audit

Date: 2026-03-31
Scope:
- primary signup-driven production path first
- operator-facing production risks second
- obvious redundancies and dead or legacy seams last

## 1. Journey confirmation ignores activation and onboarding-write failures

- Title: Onboarding can advance even if journey activation or `isonboarded` persistence fails
- Severity: high
- Affected files:
  - `src/components/onboarding/JourneyDetail.tsx`
- Why it matters:
  - `handleStart()` awaits both `/api/journeys/activate` and the `profiles` update, but it never checks `response.ok` or the Supabase mutation error.
  - The UI can call `onConfirm()` and move the user into the post-onboarding path even if the starter journey was not actually activated or the onboarding flag was not saved.
  - That can create hard-to-reproduce state drift on the core beta path.
- Recommended fix:
  - require `response.ok` for the activation request
  - read and handle Supabase update errors explicitly
  - only call `onConfirm()` after both writes succeed
  - emit a narrow primary-path error event if either write fails
- Fix timing:
  - fix now

## 2. `daily_action_verified` can be logged for the wrong day

- Title: Action verification state can leak into the next day analytics payload
- Severity: medium
- Affected files:
  - `src/pages/daily-growth.tsx`
- Why it matters:
  - `actionVerified` is tracked in a `useEffect` that depends on `currentDay`.
  - The state is never reset before `currentDay` advances, so a successful completion can cause the effect to re-fire with the next day number while `actionVerified` is still `true`.
  - The live successful run showed this pattern with a stray `daily_action_verified` event for `day = 2` on a Day 1 walkthrough.
- Recommended fix:
  - emit the verification event only at the moment the hold action completes
  - remove `currentDay` from the effect-driven analytics path or reset `actionVerified` before incrementing the day
- Fix timing:
  - fix now

## 3. Successful runs emit duplicate completion analytics

- Title: `daily_session_completed` is recorded on both the server and the page client
- Severity: medium
- Affected files:
  - `src/pages/daily-growth.tsx`
  - `src/pages/api/daily/session/complete.ts`
- Why it matters:
  - The server writes `daily_session_completed` during canonical session completion.
  - The client writes another `daily_session_completed` event after the API call succeeds.
  - The repaired live run shows duplicate completion rows, which weakens funnel counts and operator trust in completion metrics.
- Recommended fix:
  - choose one source of truth for completion analytics
  - keep canonical lifecycle analytics on the server and reserve the client for view-only or UX-only telemetry if needed
- Fix timing:
  - later

## 4. Analytics transport can fail silently with no operator signal

- Title: Beta ops evidence can disappear without any persistent alert
- Severity: medium
- Affected files:
  - `src/lib/server/analytics.ts`
  - `src/lib/server/beta-ops.ts`
- Why it matters:
  - `trackEvent()` catches and swallows all insert failures.
  - `trackPrimaryPathServerError()` depends on that same helper, so even the error-reporting path has no durable fallback or operator-visible alert if analytics writes fail.
  - Controlled beta decisions now depend on these events, so silent monitoring failure is an operator risk.
- Recommended fix:
  - log insert failures with structured server logs
  - optionally add a second sink for primary-path error writes
  - at minimum, return a clear server log line whenever `analytics_events` insert fails
- Fix timing:
  - later

## 5. Entitlements silently degrade to free tier on schema drift

- Title: Missing entitlement tables can quietly downgrade users without an operator alarm
- Severity: high
- Affected files:
  - `src/lib/server/entitlements.ts`
- Why it matters:
  - if `user_entitlements` or legacy `entitlements` is missing, the resolver falls back to profile tier or free entitlements
  - the missing-table case is treated as a soft fallback, not an operator-facing failure
  - in production drift, this can silently under-grant access and look like a product bug instead of a data or schema issue
- Recommended fix:
  - distinguish expected local-dev fallback from production schema failure
  - add structured logging or alerting when entitlement tables are missing in non-local environments
  - consider failing closed with a user-safe message for paid users instead of silently downgrading
- Fix timing:
  - later

## 6. Legal and privacy links on the live register path are dead

- Title: Register-flow consent and footer links point to `#`
- Severity: low
- Affected files:
  - `src/components/auth/LoginForm.tsx`
- Why it matters:
  - the register path asks for trust and consent, but the visible Privacy Policy and Terms links do not resolve anywhere
  - this weakens credibility on the very first production step and makes operator review harder if testers ask where the policy lives
- Recommended fix:
  - replace `href=\"#\"` with the real policy routes or external documents
  - if those pages are not ready, remove the fake links and show plain copy instead
- Fix timing:
  - fix now
