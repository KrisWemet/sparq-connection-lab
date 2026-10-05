# Priming & Design-Influence Audit

**Date:** 2026-10-01 · **Against:** constitution v1.2 §5A (seven questions), §5C (review tiers) · **Reviewer for tier 3:** Chris
**Disclosure:** every element below is described to users in plain words at `/how-sparq-works` (linked from the Trust Center and the Insight Profile).

Tiers (§5C): **1** ambient process priming — normal review · **2** personal priming from the user's own words — needs a user-chosen target, retiring it stops the element · **3** inferred-trait, shared-space, sensitive, notification or timing-based priming — Chris reviews before shipping.

## Inventory

| Element | Where | Tier | Process / destination | Target (provenance) | Stops when retired? | Status |
|---|---|---|---|---|---|---|
| Golden-hour metaphor imagery, no people | `public/images/journeys/`, `public/images/dates/` | 1 | Process (calm, hope) | — | — | ✅ |
| Colour follows the moment (plum/coral/gold/quiet) | `src/lib/moment-tone.ts` | 1 | Process | — | — | ✅ |
| Morning stories (Story Recipe, rotating cast) | `getMorningStoryPrompt`, `fallbackStories.json` | 1 | Process | — | — | ✅ |
| Micro-primes with if-then plan | `src/data/micro-primes.ts`, `DailyPrimeCard` | 2 | Destination (a practice) | User's own habit anchor fills the "if" | n/a — the anchor is a time, not a goal | ✅ |
| Confetti on day completion | `daily-growth.tsx` | 1 | Process (acknowledgment) | — | — | ✅ |
| Forgiving practice-day count | `daily-growth.tsx` | 1 | Process | — | — | ✅ ("in a row" reward track retired 2026-10-01) |
| Return-after-break welcome | `WelcomeBackCard`, `return-state.ts` | 1 | Process | — | — | ✅ no guilt copy |
| North Star line on the identity card | `IdentityArcCard` | 2 | Destination | User-confirmed North Star | Yes — "shift" re-ladders; retired rows never shown | ✅ |
| Deep Why "why it matters to you" | `IdentityArcCard`, `/api/me/deep-why` | 2 | Destination | User's own ladder answers | Yes — "Not why anymore" retires a layer | ✅ new |
| Own reason shown at experiment check-in | `ExperimentsCard` | 2 | Destination | `user_reasons` (still_true) | Yes — "doesn't matter to me now" retires it | ✅ |
| One mission idea | `ExperimentsCard`, `suggestMission` | 2 | Destination | North Star line or a still-true reason; shown with "You said…" | Yes — no target → no idea; "Only when I ask" turns ideas off | ✅ new |
| Next step / smaller step offers | `suggestMission` (capacity) | 2 | Destination | Same as above + their own "how hard was it?" answers | Yes | ✅ new |
| Repeat a practice in a new situation; re-cue after a missed moment; rest a practice that didn't help (2026-10-05) | `suggestMission` | 2 | Destination (a practice) | Same target as the mission idea + the user's own check-in answers ("how hard", "what got in the way", "how have the practices felt") | Yes — "burden" → no idea; "not helpful" → practice rests | ✅ new |
| Morning story gives the chosen practice one more moment (2026-10-05) | `getMorningStoryPrompt` `practice`, `daily/session/start.ts` | 2 | Destination (a practice) | A mission the user accepted or wrote in the last 14 days | Yes — let go / not-important-now missions are not `planned`/`tried`, so they stop feeding the story | ✅ new |
| Progress display "what you're practicing" | `ExperimentsCard` | 2 | Process | Their own outcomes only; no comparison | — | ✅ new |
| Identity question after 3 linked steps | `IdentityArcCard`, `src/lib/identity.ts` | 2 | Destination | Steps the user linked themselves | Yes — 14-day cooldown; "Not now" respected | ✅ new |
| Rites of passage | `RiteOfPassage` | 2 | Process | User writes every line | — | ✅ new |
| Peter's quiet North Star orientation | `buildNorthStarOrientation` (chat) | 2 | Destination | User-confirmed line | Yes | ✅ — disclosed on `/how-sparq-works` ("your own words… at the moments they might help") |
| Peter values–behavior challenge | `PETER_SHARED_RULES` | 2 | Destination | Only a value the user stated | Yes — "doesn't fit anymore" | ✅ new; run eval L1–L2 |
| **Story steering toward trait gaps** | `trait-gaps.ts` → morning story "Story idea" | **3** | Process (learning about the user) | Inferred trait gaps | Rejected / confirmed traits are never probed | ✅ **Kept with guardrails (Chris delegated, 2026-10-01).** Steers only toward open, unknown dimensions; never re-probes a trait the user rejected or already confirmed; never steers toward `worth_pattern` (sensitive). Stays "an ordinary story, not a test"; disclosed on `/how-sparq-works` ("Stories that fit you"). Test: `tests/trait-gaps.test.ts`. |
| **Content adapted by inferred attachment signals** | `attachment-context.ts`, `personality-adaptation-guide.md` | **3** | Process (tone, pacing) | Inferred traits (hypotheses) | Yes — rejected traits are excluded explicitly (`status <> 'rejected'`, not only by weight) | ✅ **Kept with guardrails (Chris delegated, 2026-10-01).** Adjusts *how* content is worded (gentler, shorter, more reassurance), never *what* the user should conclude or choose; every trait used is visible and correctable on `/insight-profile`. |
| **No step-ups during a hard stretch** (2026-10-05) | `suggestMission` `readiness` ← `user_insights.emotional_state` | **3** | Process (only ever gentler: withholds a next-step offer, never adds pressure) | Inferred mood | n/a | ⏳ **Needs Chris's review** (timing from an inferred state, §5C/§6B). Removing it is one line: stop passing `readiness` in `/api/experiments` |
| Shared Peter question | `/api/peter/shared-reflect` | 3 | Process | Only `shared_items` | — | ✅ reviewed in step 8 (no sides, partners anonymized) |
| Mission ideas / reminders by notification | — | 3 | — | — | — | Not built (push notifications are out of beta scope) |
| Timing by inferred receptivity | — | 3 | — | — | — | Not built. Timing today uses only what the user states (`hard_days` setting) and the message itself (`conversation-mode.ts`). |

## Never present (checked)

No subliminal or hidden cues, embedded commands, fear or shame imagery, loss framing, countdowns, fabricated social proof, or priming toward a destination the user hasn't chosen. Upgrade copy describes depth, not scarcity (INFLUENCE_AUDIT B15–B16).

## Decisions (2026-10-01)

Chris delegated both tier-3 items ("do whatever is best"). Both are kept because they change *how* Sparq talks, never *where* the user is going, and both are disclosed — with new guardrails:

1. **Story steering** — never toward a rejected, confirmed or sensitive trait (`trait-gaps.ts`).
2. **Tone adaptation** — a rejected trait is excluded explicitly in `buildPatternContext` / `buildLegacyTraits`, so a pushback-based rejection can never keep shaping tone through a stale weight.

Revisit if user testing shows anyone feeling "assessed" (`docs/USER_TESTING_PLAN.md` red flags).
