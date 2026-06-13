# The Way Back — Relapse / Repair (Phase D) — Design Spec

**Date:** 2026-06-11
**Status:** Approved by Chris (brainstorming session 2026-06-11)
**Origin:** Phase D of the science program (credibility ✅ → ideal self ✅ → Finkel ✅ → **relapse/repair**). Governed by [[enjoyment-first]]: returning must feel warm and shame-free, never clinical, never punishing.

---

## 1. Problem & Goal

Change is non-linear; people lapse. Shame on return is the #1 churn driver in habit apps (and Neff's self-compassion research shows self-kindness predicts *more* behavior change than self-criticism). Sparq currently does two things wrong on return:

1. **The streak punishes.** The live `update_streak_on_session` trigger (AFTER INSERT on `daily_sessions`) has a *"Streak broken, restart → current_streak = 1"* branch. This directly contradicts Sparq's own science copy library, which already promises *"missing a day doesn't break the streak"* and *"No streak broken. That's not how this works."*
2. **Peter is oblivious to absence.** `generateGreeting` writes `user_insights.next_greeting_text` at *completion* time, referencing "today." A user returning after a week sees a stale greeting about a day that was actually 7 days ago — and no acknowledgment of the return at all.

**Goal:** make returning after a gap a warm, held, shame-free moment — resolve the streak contradiction toward forgiveness, and give Peter a gap-aware welcome.

**Decisions (from brainstorming):**

| Decision | Choice |
|---|---|
| Streak model | **Fully forgiving** — any session-day increments the count; a gap never resets it. (`total_sessions` already never resets; `current_streak` becomes "days you've shown up.") |
| Peter re-entry | **Both** — fix the stale greeting on return AND show a gentle welcome-back card |
| Greeting production | **Deterministic warm copy** (name + days-away band templates) — reliable, instant, no LLM in the dashboard hot path, no stale-greeting race |
| Away threshold | **3+ days** (`days_away >= 3`) — a single missed day is normal life, not a relapse |
| Re-entry friction | **Same 5-minute loop, warmer framing** — no special shortened content |

---

## 2. The forgiving streak (migration, applied live)

Rewrite `public.update_streak_on_session()` (a new migration that `CREATE OR REPLACE`s it, preserving `SECURITY DEFINER`, `SET search_path = public`, the `profiles` mirror of `streak_count`/`discovery_day`/`last_daily_activity`, and `longest_streak`/`total_sessions` maintenance).

**The only change:** delete the *"Streak broken, restart"* branch. The current logic is:
- `last_session_date = CURRENT_DATE` → no-op (already today)
- `last_session_date = yesterday` → `current_streak + 1`
- else (gap > 1 day) → **reset to 1** ← REMOVE THIS

New logic: any `last_session_date < CURRENT_DATE` (yesterday OR a longer gap) → `current_streak + 1`. Missed days are simply skipped, never punished. Because the trigger fires once per session-day (daily_sessions has a per-user-per-day uniqueness constraint), `current_streak` becomes a clean "count of days you've shown up" that only grows.

**Preserve the first-session path explicitly.** The existing `IF v_streak IS NULL` branch (no `user_streaks` row yet → INSERT with `current_streak = 1`) stays untouched — only the ELSE (existing-row) branch's gap reset is removed. The rewrite must NOT leave a brand-new user at streak 0: first session = 1, as today. (Guard against the SQL `NULL < CURRENT_DATE → NULL` trap — that case is handled by the `IS NULL` branch, never the date comparison.)

**Trigger unchanged** (`on_daily_session_created AFTER INSERT`). **Re-grant note:** the migration must re-apply the hardening from `20260610092000` (the function is `CREATE OR REPLACE`d, which preserves grants, but the migration explicitly re-states `SET search_path = public` inside the body to be safe). No retroactive healing of already-reset users — going forward it simply stops punishing.

**No UI copy change required:** the active `dashboard.tsx` renders no streak indicator. `JourneyMapCard` (`"{n} day streak"`), `StreakIndicator` (`"{n}-Day Streak!"`), and `DashboardContent` are legacy components not mounted on the beta path — left untouched (they also carry separate Phase-A-style issues like embedded-command copy and unsourced stats; flagged for a future cleanup, out of scope here).

## 3. Return-state detection

New module `src/lib/server/return-state.ts` + endpoint `src/pages/api/me/return-state.ts` (GET):

```
{ returning: boolean, days_away: number, practice_days: number }
```

- Reads `user_streaks` (`last_session_date`, `total_sessions`) for the user.
- `days_away` = whole days between `last_session_date` and today, computed in the **same date basis as the trigger** (DB `CURRENT_DATE`, i.e. `CURRENT_DATE - last_session_date` via SQL — not a JS `Date` diff) so the streak logic and the greeting band never disagree at a day boundary. `practice_days` = `total_sessions`.
- `returning = days_away >= 3 AND last_session_date is not null` (a user who never practiced isn't "returning").
- Fail-soft: any error or missing row → `{ returning: false, days_away: 0, practice_days: 0 }` (normal dashboard).

## 4. Peter's warm return (both halves)

**a) Greeting fix — `src/components/dashboard/PeterGreeting.tsx`.** Today it shows `next_greeting_text` (stale on return). Change: fetch return-state alongside the existing `next_greeting_text` read; when `returning`, display a deterministic warm welcome-back line **instead of** the stale greeting. Copy is selected from a small day-band template set (e.g. 3–6 days, 7–13, 14+), parameterized by first name. Tone: glad you're back, nothing to catch up on, let's just begin (Neff self-compassion, implicit — never the word "self-compassion," never clinical). Non-returning users: unchanged behavior.

**b) Welcome-back card — `src/components/dashboard/WelcomeBackCard.tsx`.** Renders only when `returning` (CsiPulse/NorthStar card pattern, brand tokens, fail-soft). Peter-voiced, deterministic copy that celebrates the lifetime count — *"You've shown up {practice_days} days. That doesn't go away. Want to make it {practice_days + 1}?"* — with one gentle CTA into today's normal loop (`/daily-growth`). Mounted on `dashboard.tsx` near the other cards, above the daily CTA so the welcome frames the day.

Both halves read the same return-state (the card can call the endpoint; PeterGreeting can call it too — two cheap GETs, or share via a tiny fetch; executor's choice, both fail-soft).

## 5. Out of scope (YAGNI / deferred)

- No new tables (return-state is derived from `user_streaks`).
- No notifications/re-engagement pushes (out of beta scope).
- No two-tier "easy mode" content (the loop is already 5 minutes).
- No change to day-progression (the `onboarding_day` cursor already waits correctly).
- No growth-engine / north-star coupling.
- No retroactive streak healing for already-reset users.
- Legacy streak components (`StreakIndicator`, `JourneyMapCard`, `DashboardContent`) — not touched; their copy issues belong to a separate cleanup.

## 6. Failure handling & privacy

Every surface fail-soft: return-state error → no card + normal greeting; PeterGreeting falls back to its existing generic if anything errors. No new personal data is stored (return-state is computed on read), so no Trust Center cascade is needed. All new welcome copy passes the no-clinical-language constraint.

## 7. Verification (no test infra, per CLAUDE.md)

- tsc/lint/build green.
- Greps: no clinical labels in welcome copy (`return-state.ts`, `WelcomeBackCard.tsx`, PeterGreeting welcome templates); `user_streaks` write still only via the trigger; return-state read touched only by its module + the two surfaces.
- **Live SQL trigger check** (the load-bearing one): on a disposable test user, insert a `daily_sessions` row dated today, then simulate a 3-day gap by setting `user_streaks.last_session_date` to 4 days ago with `current_streak = 5`, insert another session, and assert `current_streak = 6` (incremented, NOT reset to 1). Clean up the test rows after.
- Seeded UAT: set `user_streaks.last_session_date` 4 days back → dashboard shows WelcomeBackCard + warm gap-aware greeting + intact (non-zero) streak; set it to yesterday → normal dashboard, no card, normal greeting.
