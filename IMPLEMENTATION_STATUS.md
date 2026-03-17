# Sparq Connection Lab — Implementation Status

> Repo-first snapshot: March 6, 2026
> Sources: checked-in code under `src/`, `supabase/`, `package.json`, `vercel.json`, plus supporting docs
> Note: this file is secondary to `SPARQ_MASTER_SPEC.md` and should not contradict it.

---

## How to Read This Document

- **DONE** = Code exists and appears functional
- **PARTIAL** = Code exists but is incomplete, broken, or has known issues
- **NOT STARTED** = No code exists for this requirement
- **TECH DEBT** = Working but needs cleanup/refactoring

Each section maps PRD requirements to actual code files.

---

## 1. Infrastructure & Platform

### 1.1 Framework & Build (PARTIAL — tech debt)

| Item | Status | Details |
|------|--------|---------|
| Next.js 13 Pages Router | DONE | `src/pages/` with ~31 page files |
| TypeScript | DONE | `tsconfig.json` with strict mode |
| Tailwind CSS + shadcn/ui | DONE | 60+ UI primitives in `src/components/ui/` |
| Vercel deployment config | DONE | `vercel.json` is set to `"framework": "nextjs"` with `npm run build` |
| Vite → Next.js migration | **PARTIAL** | Leftover `vite.config.ts`, `src/main.tsx`, and `import.meta.env` references in `src/integrations/supabase/client.ts` and `src/lib/api-config.ts` |

**Action needed:**
1. Delete any remaining unused Vite bootstrap files if still present locally
2. Migrate all `import.meta.env.VITE_*` references to `process.env.NEXT_PUBLIC_*`
3. Remove or consolidate `src/integrations/supabase/client.ts` (legacy Vite client)

### 1.2 Supabase Backend (DONE)

| Item | Status | Files |
|------|--------|-------|
| Supabase client (Next.js) | DONE | `src/lib/supabase.ts` |
| Legacy Supabase client (Vite) | TECH DEBT | `src/integrations/supabase/client.ts` — should be removed |
| Database schema | PARTIAL | Placeholder migration history still exists; reproducibility from a fresh local reset is not yet guaranteed |
| RLS policies | DONE | `supabase/migrations/20260226000000_secure_rls_and_partner_lifecycle.sql` |
| Edge functions | DONE | `supabase/functions/memory-operations/`, `supabase/functions/send-partner-invite/` |

### 1.3 Environment Variables (PARTIAL)

| Item | Status | Details |
|------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | DONE | Used by `src/lib/supabase.ts` |
| `VITE_SUPABASE_URL` / `ANON_KEY` | TECH DEBT | Legacy vars still in `.env`, used by old client |
| `VITE_OPENAI_API_KEY` | TECH DEBT | Should be `NEXT_PUBLIC_OPENAI_API_KEY` or server-only `OPENAI_API_KEY` |
| `.env` has hardcoded secrets | **RISK** | Actual Supabase credentials committed in `.env` — should use `.env.local` only |

---

## 2. Authentication & Authorization (DONE — with duplication debt)

### 2.1 Auth System

| Item | Status | Files |
|------|--------|-------|
| Supabase Auth integration | DONE | `src/lib/auth-context.tsx` (primary, 366 lines) |
| Login / Register | DONE | `src/pages/login.tsx`, `src/components/auth/LoginForm.tsx` |
| Session management | DONE | Via `AuthProvider` in `src/pages/_app.tsx` |
| Protected routes | DONE | `src/components/ProtectedRoute.tsx` (+ 2 duplicates) |
| Profile CRUD | DONE | `src/lib/auth-context.tsx` → `updateUserProfile()` |
| Admin role check | DONE | `is_admin()` SQL function in RLS policies |

### 2.2 Auth Tech Debt

| Issue | Files to Clean Up |
|-------|-------------------|
| 3 duplicate ProtectedRoute components | `src/components/ProtectedRoute.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/components/ui/protected-route.tsx` — consolidate to 1 |
| Refactored auth module not connected | `src/lib/auth/` (10 files) — either wire up or delete |
| 2 duplicate useAuth hooks | `src/hooks/useAuth.ts` and `src/hooks/useAuth.tsx` — consolidate |

---

## 3. Onboarding — "Trojan Horse" 14-Day Experience (PARTIAL)

**PRD requirement:** Days 1–14 of conversational onboarding that silently profiles attachment style, conflict patterns, love language, and tone sensitivity.

### 3.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Conversational onboarding flow (5 turns with Peter) | DONE | `src/pages/onboarding-flow.tsx` (192 lines) |
| Onboarding step components (4 steps) | DONE | `src/components/onboarding/OnboardingStep{One,Two,Three,Four}.tsx` |
| Onboarding state hook | PARTIAL | `src/hooks/useOnboarding.ts` is deprecated; active onboarding flow is implemented directly in `src/pages/onboarding-flow.tsx` |
| Onboarding redirect | DONE | `src/hooks/useOnboardingRedirect.ts` |
| Day 14 Graduation component | DONE | `src/components/onboarding/Day14Graduation.tsx` |
| User insights DB table (attachment, love language, conflict style) | DONE | Migration `20260225000000_add_user_insights.sql` |
| Fallback stories for 14 days | DONE | `src/data/fallbackStories.json` |

### 3.2 What's Missing (from Build Spec Step 2)

| Item | Status | Details |
|------|--------|---------|
| Deterministic day-state transitions | **NOT STARTED** | No `onboarding_day` counter or `daily_entries` tracking to reliably advance Day 1→14 |
| Idempotent morning story generation guard | **NOT STARTED** | No dedup check — calling `/api/peter/morning` twice on same day generates 2 stories |
| Fallback content wiring for failed model responses | **PARTIAL** | `fallbackStories.json` exists but integration with the morning API is unclear |
| Day 14 graduation trigger | **NOT STARTED** | `Day14Graduation.tsx` component exists but no logic triggers it at day 14 |
| Silent profiling from journaling behavior | **NOT STARTED** | DB columns exist (`user_insights` table) but no inference logic writes to them |

**Action needed:**
1. Add `onboarding_day` tracking (DB column or derived from daily session count)
2. Add idempotency key to morning story API (check if today's story already exists)
3. Wire fallback stories as automatic fallback in `/api/peter/morning`
4. Add graduation detection: when day count reaches 14, show `Day14Graduation` component and unlock Skill Tree
5. Build inference pipeline that analyzes first 14 days of responses to populate `user_insights`

---

## 4. Daily Connection Engine (PARTIAL)

**PRD requirement:** Morning Story (2–3 min) → Daily Action (embedded nudge) → Evening Reflection (3–5 min). Target: 6–10 min/day.

### 4.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Daily questions page | DONE | `src/pages/daily-questions.tsx` (1,128 lines) |
| Daily growth loop page | DONE | `src/pages/daily-growth.tsx` (534 lines) |
| Morning story generation API | DONE | `src/pages/api/peter/morning.ts` |
| Daily session start API | DONE | `src/pages/api/daily/session/start.ts` |
| Morning viewed tracking API | DONE | `src/pages/api/daily/session/morning-viewed.ts` |
| Session completion API | DONE | `src/pages/api/daily/session/complete.ts` |
| Peter coaching chat API | DONE | `src/pages/api/peter/chat.ts` |
| Morning story parser | DONE | `src/lib/morning-parser.ts` |
| Peter system prompt & service | DONE | `src/lib/peterService.ts` |

### 4.2 What's Missing (from Build Spec Step 3)

| Item | Status | Details |
|------|--------|---------|
| Explicit Morning / Action / Evening timeline UI | **NOT STARTED** | Daily growth page exists but lacks a clear 3-phase timeline |
| Reflection quality checks (effort-based guidance) | **NOT STARTED** | No assessment of reflection depth/quality |
| Reminder preference plumbing (time + on/off) | **PARTIAL** | `user_preferences` table has notification fields; no push notification wiring |
| Completion analytics events | **PARTIAL** | `analyticsService.ts` exists but event coverage is incomplete |

**Action needed:**
1. Build a 3-phase timeline UI: Morning Story → Daily Action → Evening Reflection
2. Add reflection quality heuristic (word count / sentiment / effort signal)
3. Wire notification preferences to actual push/email notifications
4. Add analytics events for each phase completion

---

## 5. AI Coach — Peter the Otter (DONE)

**PRD requirement:** Warm, practical AI coach. Non-clinical voice. Crisis-aware.

| Item | Status | Files |
|------|--------|-------|
| Peter chat conversation API | DONE | `src/pages/api/peter/chat.ts` |
| Peter system prompt | DONE | `src/lib/peterService.ts` |
| Chat UI component | DONE | `src/components/PeterChat.tsx` |
| Peter character component | DONE | `src/components/PeterTheOtter.tsx` |
| Morning story generation | DONE | `src/pages/api/peter/morning.ts` |
| Conversation analysis | DONE | `src/pages/api/peter/analyze.ts` |
| Crisis detection in chat | DONE | `src/lib/safety.ts` integrated into chat API |
| Message limit enforcement | DONE | Coach usage tracking in daily sessions migration |

**Potential gap:** Verify Peter's system prompt follows all PRD tone rules (no clinical language, no diagnosis, action-oriented responses, ends with doable next step).

---

## 6. Safety & Crisis System (DONE — Build Spec Step 1 Complete)

**PRD requirement:** Crisis detection for self-harm, DV, child harm, stalking, panic. Route to country-specific resources.

| Item | Status | Files |
|------|--------|-------|
| Crisis keyword/pattern detection | DONE | `src/lib/safety.ts` (163 lines) |
| Country-based crisis resources (US/CA/UK/AU/NZ) | DONE | `src/lib/safety.ts` |
| Crisis routing in Peter chat | DONE | `src/pages/api/peter/chat.ts` |
| Trust Center page | DONE | `src/pages/trust-center.tsx` |
| Conflict First Aid page | DONE | `src/pages/conflict-first-aid.tsx` |
| Insight visibility toggle | DONE | Trust Center |
| Personalization toggle | DONE | Trust Center |
| AI memory window setting (90-day vs indefinite) | DONE | Trust Center |
| Relationship mode selection (solo/partnered) | DONE | Trust Center |
| `user_preferences` migration with RLS | DONE | Migration `20260226000000_add_user_preferences.sql` |
| Link from Settings to Trust Center | DONE | `src/pages/settings.tsx` |
| Link from Dashboard to Conflict First Aid | DONE | `src/pages/dashboard.tsx` |
| Safety events logging table | DONE | Migration `20260226010000_daily_sessions_entitlements_analytics.sql` |

---

## 7. Skill Tree & Growth Dashboard (PARTIAL)

**PRD requirement:** 5 tracks (Communication, Conflict Repair, Emotional Intimacy, Trust & Security, Shared Vision & Rituals). Basic → Advanced → Expert progression.

### 7.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Skill Tree page UI | DONE | `src/pages/skill-tree.tsx` (640 lines) |
| 5 skill tracks defined | DONE | Migration `20260225000001_add_skill_progress.sql` |
| Skill progress DB tables | DONE | `skill_progress` table with track/level/XP |
| Expanded skill system | DONE | Migration `20260226011000_expand_skill_tracks.sql` |
| Locked gate for users before Day 14 | DONE | E2E test confirms this behavior |
| E2E tests for skill tree | DONE | `e2e/tests/04-skill-tree.spec.ts` |

### 7.2 What's Missing (from Build Spec Step 4)

| Item | Status | Details |
|------|--------|---------|
| Basic → Advanced → Expert progression logic | **PARTIAL** | DB schema supports levels but no progression engine (XP thresholds, unlock conditions) |
| Progress dashboard with self-only baselines | **NOT STARTED** | No dashboard showing trends (completion rate, repair-time, regulation patterns) |
| XP/progress earning from daily activities | **NOT STARTED** | No code awards XP to skill tracks based on completed daily activities |

**Action needed:**
1. Build XP earning rules: map daily activity types to skill tracks and XP amounts
2. Implement level-up thresholds (Basic → Advanced → Expert)
3. Build a progress dashboard showing self-comparative trends over time

---

## 8. Guided Journeys / Quests (DONE)

**PRD requirement:** 3–14 day guided experiences with solo reflection and optional partner interaction.

| Item | Status | Files |
|------|--------|-------|
| 14 journey definitions | DONE | `src/data/journeys.ts` |
| Journey listing page | DONE | `src/pages/journeys.tsx` |
| Journey detail/progress page | DONE | `src/pages/journey-details.tsx` (673 lines) |
| Journey start page | DONE | `src/pages/journey-start.tsx` |
| 14 individual journey pages | DONE | `src/pages/journeys/*.tsx` |
| Journey template | DONE | `src/pages/journeys/JourneyTemplate.tsx` |
| Journey content view component | DONE | `src/components/journey/JourneyContentView.tsx` |
| Persuasive journey prompts | DONE | `src/components/journey/PersuasiveJourneyPrompt.tsx` |
| Journey state hook | DONE | `src/hooks/useJourney.ts` |
| Journey services | DONE | `src/services/journeyService.ts`, `journeyContentService.ts` |
| Journey DB tables (user_journeys, journey_responses) | DONE | Schema + migrations |
| Journey markdown content | DONE | `src/content/journeys/` |

---

## 9. Partner System (DONE — but Phase 2 per PRD)

**PRD note:** Solo-first launch. Partner linking ships post-MVP (30–60 days).

| Item | Status | Files |
|------|--------|-------|
| Partner invitation system | DONE | `src/services/partnerService.ts`, `src/components/PartnerInvite.tsx` |
| Join partner page | DONE | `src/pages/join-partner.tsx` |
| Partner invitation DB + 7-day expiry | DONE | `partner_invitations` table, RLS policy migration |
| Send partner invite edge function | DONE | `supabase/functions/send-partner-invite/` |
| Partner profile view | DONE | `src/pages/partnerprofile.tsx` |
| Partner connection card (dashboard) | DONE | `src/components/dashboard/PartnerConnectionCard.tsx` |
| Partner connection card (profile) | DONE | `src/components/profile/PartnerConnectionCard.tsx` |
| Messaging between partners | DONE | `src/pages/messaging.tsx` |
| Partner sync in journeys | DONE | `src/components/journey/PartnerSync.tsx` |

**Note:** Partner features are built ahead of the PRD's Phase 2 schedule. Consider feature-flagging these for launch.

---

## 10. Subscription & Monetization (PARTIAL)

**PRD requirement:** Free tier (3 daily loops/week, 10 coach msgs/day, 1–2 starter quests). Paid tier ($14.99/mo, $119.99/yr).

### 10.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Subscription context/provider | DONE | `src/lib/subscription-provider.tsx` (localStorage-based) |
| Subscription page UI | DONE | `src/pages/subscription.tsx` (568 lines) |
| Tier definitions (free/premium/ultimate) | DONE | `src/lib/subscription-provider.tsx` |
| Feature gating helper | DONE | `isFeatureAvailable()` in subscription provider |
| Entitlements API | DONE | `src/pages/api/me/entitlements.ts` |
| Entitlements DB support | DONE | Migration `20260226010000_daily_sessions_entitlements_analytics.sql` |
| Product tier definitions | DONE | `src/lib/product.ts` |

### 10.2 What's Missing (from Build Spec Step 6)

| Item | Status | Details |
|------|--------|---------|
| **Actual payment integration** | **NOT STARTED** | No Stripe, no payment processing — subscription is localStorage mock only |
| Free tier limit enforcement (3 loops/week) | **NOT STARTED** | Entitlements exist in DB but no enforcement middleware |
| Coach message cap (10/day free) | **PARTIAL** | Coach usage tracking exists in DB; enforcement unclear |
| Quest limits by tier | **NOT STARTED** | No gating on journey access by subscription tier |
| SubscriptionProvider in `_app.tsx` | **BROKEN** | Provider may not be in the app wrapper — pages using `useSubscription()` will crash |

**Action needed:**
1. Integrate Stripe (or chosen payment provider) for real payment processing
2. Add `SubscriptionProvider` to `src/pages/_app.tsx`
3. Build enforcement middleware: check entitlements before allowing daily session start, coach messages, journey access
4. Match pricing to PRD: $14.99/mo or $119.99/yr per couple

---

## 11. Living Profile System (PARTIAL)

**PRD requirement:** Profile with mandatory fields at signup + inferred traits over time, with confidence scores and user correction.

### 11.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Profile page | DONE | `src/pages/profile.tsx` (648 lines) |
| Profile header/avatar | DONE | `src/components/profile/ProfileHeader.tsx` |
| Personal info card | DONE | `src/components/profile/PersonalInfoCard.tsx` |
| Achievements/badges | DONE | `src/components/profile/AchievementsCard.tsx` |
| User insights DB table | DONE | `user_insights` table (attachment_style, love_language, conflict_style, emotional_state) |
| Profile traits DB | DONE | `profile_traits` in daily sessions migration |

### 11.2 What's Missing

| Item | Status | Details |
|------|--------|---------|
| Inferred profile fields (auto-populated from behavior) | **NOT STARTED** | DB columns exist but no inference engine |
| Confidence model per trait | **NOT STARTED** | No confidence scores (Likely / Possible / Not enough info) |
| User correction UI (Yes / Not really / Unsure per trait) | **NOT STARTED** | No user-facing trait feedback controls |
| Profile Snapshot view (plain-language) | **PARTIAL** | `src/pages/api/profile/snapshot.ts` exists but unclear if wired to UI |
| Show/hide insight labels toggle | **DONE** | In Trust Center |
| Personalization toggle | **DONE** | In Trust Center |

**Action needed:**
1. Build trait inference engine (analyze 14-day onboarding responses → write to `user_insights`)
2. Add confidence scoring per trait
3. Build user correction UI on Profile page
4. Wire Profile Snapshot API to a visible UI section

---

## 12. Personalization Engine (NOT STARTED)

**PRD requirement:** Personalization must change AI behavior based on escalation, avoidance, streaks, attachment cues, conflict style, love language, and time-of-day patterns.

| Item | Status | Details |
|------|--------|---------|
| Personalization rules engine | **NOT STARTED** | No code adapts Peter's prompts based on user profile traits |
| Escalation detection → de-escalation mode | **PARTIAL** | Crisis detection exists but no nuanced escalation shifting |
| Avoidance detection → gentle accountability | **NOT STARTED** | No avoidance pattern tracking |
| Streak-based challenge scaling | **NOT STARTED** | Streak tracking exists but doesn't influence content difficulty |
| Attachment-aware prompt adaptation | **NOT STARTED** | No attachment-style–based prompt selection |
| Time-of-day adaptation | **NOT STARTED** | No engagement pattern analysis |

**Action needed:** This is a major feature. Build a personalization layer that sits between the user's profile traits and Peter's system prompt, dynamically adjusting tone, length, and content.

---

## 13. Privacy, Consent & Data Controls (PARTIAL)

**PRD requirement:** Consent capture at onboarding. Memory/export/delete controls. Private-by-default journals.

### 13.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Trust Center with privacy controls | DONE | `src/pages/trust-center.tsx` |
| Memory window setting (90-day vs indefinite) | DONE | Trust Center |
| Insight visibility toggle | DONE | Trust Center |
| Personalization toggle | DONE | Trust Center |
| User preferences DB with RLS | DONE | Migration + API |

### 13.2 What's Missing (from Build Spec Step 5)

| Item | Status | Details |
|------|--------|---------|
| Consent capture at onboarding | **NOT STARTED** | No explicit privacy/data-use consent screen during signup |
| Data export (download my data) | **NOT STARTED** | No export functionality |
| Data deletion (delete my account/data) | **NOT STARTED** | No account deletion flow |
| Memory wiring (respect 90-day window) | **NOT STARTED** | Setting exists but Mem0 is mocked — no actual memory pruning |
| Private vs shared content boundaries | **PARTIAL** | RLS policies exist but no UI for item-level sharing |

**Action needed:**
1. Add consent capture screen to onboarding flow (before account creation)
2. Build data export endpoint (generate downloadable archive of user data)
3. Build account deletion flow (cascade delete with confirmation)
4. Wire memory window preference to actual data retention logic
5. Build item-level sharing UI for shared content between partners

---

## 14. Observability & Analytics (PARTIAL)

**PRD requirement:** Track activation (Day 3 + goal set), 14-day completion, Day-30 retention, repair-time, safety compliance.

### 14.1 What's Built

| Item | Status | Files |
|------|--------|-------|
| Analytics service | DONE | `src/services/analyticsService.ts` |
| Analytics events DB table | DONE | `analytics_events` in migration |
| Admin KPI API | DONE | `src/pages/api/admin/kpis.ts` |
| Admin dashboard page | DONE | `src/pages/admin.tsx` |
| Server-side analytics helper | DONE | `src/lib/server/analytics.ts` |
| Safety events logging | DONE | `safety_events` table |

### 14.2 What's Missing (from Build Spec Step 7)

| Item | Status | Details |
|------|--------|---------|
| Activation metric (Day 3 + goal set) | **NOT STARTED** | No composite activation event tracking |
| 14-day completion cohort tracking | **NOT STARTED** | No cohort analysis |
| Day-30 retention tracking | **NOT STARTED** | No retention metric calculation |
| Repair-time metric | **NOT STARTED** | No repair-time measurement (PRD's primary behavioral outcome) |
| Safety-response compliance tracking | **NOT STARTED** | Safety events logged but no compliance dashboard |

**Action needed:**
1. Define and emit activation event when user completes Day 3 + sets a goal
2. Build cohort tracking for 14-day and 30-day milestones
3. Instrument repair-time metric (time between conflict event and repair action)
4. Add compliance view to admin dashboard

---

## 15. Translator Feature (DONE — but Phase 2 per PRD)

| Item | Status | Files |
|------|--------|-------|
| Translator page | DONE | `src/pages/translator.tsx` |
| Translator API (OpenRouter/Claude) | DONE | `src/pages/api/translator.ts`, `src/lib/openrouter.ts` |

**Note:** Built ahead of PRD's Phase 2 schedule. Uses OpenRouter Claude, not the PRD's original OpenAI plan.

---

## 16. Gamification (DONE)

| Item | Status | Files |
|------|--------|-------|
| Streaks | DONE | `src/components/StreakIndicator.tsx` |
| Achievement badges | DONE | `src/components/AchievementBadge.tsx`, `src/components/profile/AchievementsCard.tsx` |
| Social proof notifications | DONE | `src/components/SocialProofNotification.tsx` |
| Skill tree progression | DONE | `src/pages/skill-tree.tsx` |
| Goals tracking | DONE | `src/pages/goals.tsx`, `src/components/Goals.tsx` |

---

## 17. Additional Features Built (not in original PRD scope)

| Feature | Status | Files |
|---------|--------|-------|
| Relationship Health Quiz | DONE | `src/pages/quiz.tsx`, `src/components/quiz/` (9 components) |
| AI Therapist page | DONE | `src/pages/aitherapist.tsx` |
| Date Ideas (AI-powered) | DONE | `src/pages/date-ideas.tsx`, `src/services/aiService.ts` |
| Mirror Report | DONE | `src/pages/mirrorreport.tsx` |
| Path to Together (educational content) | DONE | `src/pages/pathtotogether.tsx`, `public/Path to Together/` |
| Metaphor Animations (bridge, flower, river) | DONE | `src/components/MetaphorAnimation.tsx` (~24K lines) |
| Hypnotic Story | DONE | `src/components/HypnoticStory.tsx` |
| Future Pacing | DONE | `src/components/FuturePacing.tsx` |
| Memory Demo | DONE | `src/components/MemoryDemo.tsx` |

---

## 18. Testing (PARTIAL)

| Item | Status | Files |
|------|--------|-------|
| E2E tests (Playwright) | DONE | 6 test files in `e2e/tests/` |
| Auth setup | DONE | `e2e/auth.setup.ts` |
| Mock helpers | DONE | `e2e/helpers/mock-peter.ts`, `mock-supabase.ts` |
| Unit tests | **NOT STARTED** | No unit test framework, no unit tests |
| Integration tests | **NOT STARTED** | No API integration tests |

**E2E coverage:**
- `01-auth.spec.ts` — Login, redirect, logout
- `02-onboarding.spec.ts` — Peter welcome, 5-turn conversation, progression
- `03-daily-growth.spec.ts` — Daily activities flow
- `04-skill-tree.spec.ts` — Locked gate, unlock, 5 tracks
- `05-dashboard.spec.ts` — Dashboard features
- `06-safety-trust.spec.ts` — Crisis detection, trust center

---

## 19. Navigation (BROKEN)

| Item | Status | Details |
|------|--------|---------|
| Bottom navigation bar | **BROKEN** | `src/components/bottom-nav.tsx` uses `react-router-dom` (`Link`, `useLocation`) — incompatible with Next.js |

**Action needed:** Rewrite `bottom-nav.tsx` to use `next/link` and `next/router`.

---

## Priority Implementation Roadmap

Based on the Build Spec and PRD, here's the recommended order:

### P0 — Fix What's Broken (Do First)
1. Fix `vercel.json` (framework: "nextjs", remove outputDirectory)
2. Add `SubscriptionProvider` to `_app.tsx` (or verify it's there)
3. Fix `bottom-nav.tsx` — migrate from React Router to Next.js
4. Remove/migrate all `import.meta.env.VITE_*` references

### P1 — Complete Build Spec Step 2: Onboarding Reliability
5. Add deterministic day-state tracking (onboarding_day counter)
6. Add idempotent morning story generation
7. Wire fallback stories to morning API
8. Build Day 14 graduation trigger + Skill Tree unlock

### P2 — Complete Build Spec Step 3: Daily Loop
9. Build Morning → Action → Evening 3-phase timeline UI
10. Add reflection quality checks
11. Wire notification preferences to actual notifications

### P3 — Complete Build Spec Step 4: Skill Tree Progression
12. Build XP earning rules (activities → skill track XP)
13. Implement level-up thresholds (Basic → Advanced → Expert)
14. Build progress dashboard with self-comparative trends

### P4 — Complete Build Spec Step 5: Privacy & Consent
15. Add consent capture to onboarding
16. Build data export endpoint
17. Build account deletion flow
18. Wire memory window preference to data retention

### P5 — Complete Build Spec Step 6: Monetization
19. Integrate Stripe payment processing
20. Enforce free tier limits (3 loops/week, 10 msgs/day)
21. Gate journey/quest access by subscription tier

### P6 — Complete Build Spec Step 7: Analytics
22. Implement activation metric (Day 3 + goal set)
23. Build cohort tracking (14-day, 30-day retention)
24. Instrument repair-time metric
25. Add compliance dashboard to admin

### P7 — Build Personalization Engine
26. Build trait inference pipeline (14-day responses → user_insights)
27. Build profile confidence scoring
28. Build user trait correction UI
29. Build personalization layer for Peter's prompts

### P8 — Tech Debt Cleanup
30. Consolidate duplicate auth implementations
31. Consolidate duplicate ProtectedRoute components
32. Delete unused Vite files and legacy client
33. Refactor large files (supabaseService.ts, MetaphorAnimation.tsx)

---

## Summary Scorecard

| Build Spec Step | Status | Completion |
|-----------------|--------|------------|
| Step 1: Safety + Trust Foundation | **DONE** | 100% |
| Step 2: Onboarding 14-Day Reliability | **PARTIAL** | ~40% |
| Step 3: Daily Loop Productization | **PARTIAL** | ~50% |
| Step 4: Skill Tree Baseline | **PARTIAL** | ~50% |
| Step 5: Privacy, Consent, Data Controls | **PARTIAL** | ~30% |
| Step 6: Monetization and Limits | **PARTIAL** | ~20% |
| Step 7: Observability + KPI Instrumentation | **PARTIAL** | ~20% |
| Step 8: Phase 2 Entry Criteria | **NOT YET** | 0% |

**Overall MVP Readiness: ~40%**

The app has a solid foundation (auth, safety, UI, journeys, Peter coach, database) but is missing critical production-readiness items: payment processing, reliable onboarding state machine, tier enforcement, personalization engine, consent flows, and analytics instrumentation.
