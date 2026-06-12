# A Different Pair of Eyes — The Finkel Method (Phase C) — Design Spec

**Date:** 2026-06-11
**Status:** Approved by Chris (brainstorming session 2026-06-11)
**Origin:** Phase C of the science program (credibility ✅ → ideal self ✅ → **Finkel** → relapse/repair). Implements `sparq_science_upgrade_package` §3.1 (Sprint 3), adapted to the enjoyment-first principle.

---

## 1. Problem & Goal

Finkel et al. (2013, *Psychological Science*, Northwestern): three 7-minute individual writing sessions per year — describing a recent disagreement from the perspective of a neutral third party who wants the best for both partners — **completely eliminated the normal 2-year decline in marital quality** across satisfaction, love, intimacy, trust, passion, and commitment. Solo, brief, writing-based: it is the single strongest validation of Sparq's whole architecture, and it is not in the product.

**Goal:** ship the Neutral Observer Reflection as a warm, quiet ritual — Finkel's protocol exactly, Sparq's voice entirely.

**Decisions (from brainstorming):**

| Decision | Choice |
|---|---|
| Build strategy | **Port** the finished sprint-3 implementation (never merged; ~95 commits stale) — lift its clean new files, write fresh integrations; do NOT git-merge the branch (drags stale sprint-2 UI + conflicts) |
| Labeling | Warm name, quiet credentials: title "A Different Pair of Eyes", one small line "Backed by Northwestern research"; full story stays in the Trust Center science section |
| Triggers | All three: quarterly dashboard card + post-Conflict-First-Aid offer + HomeDestinationStrip menu entry |
| LLM involvement | **None.** Pure expressive writing — that is the validated protocol. Reflections are never fed to Peter, memories, or the growth engine |
| Privacy | AES-256-GCM per-user encryption (HMAC-derived keys); private journaling; Trust Center delete-all cascades |

Governing principle: enjoyment-first — the science credential is one quiet line; the experience is a ritual, not a study citation.

---

## 2. Experience walkthrough

**Entry** (any trigger) → a calm intro screen: title "A Different Pair of Eyes", subtitle in Peter's warm register ("90 seconds, just you. No one else sees this."), small line: *Backed by Northwestern research.* → privacy note → **three screens** (ported flow, copy refined to current voice):

1. *"Bring to mind a recent disagreement with [partner]. Not the worst one — just one that's still a little warm."* (free text)
2. *"Now — describe what happened through the eyes of someone neutral who wants the best for BOTH of you. What would they notice?"* (free text)
3. *"What might get in the way of seeing it that way next time it happens? What's one small thing that could help?"* (free text)

→ completion beat (warm acknowledgment, link to past reflections) → history page lists previous reflections (decrypted server-side per user).

**Quarterly card** (dashboard): renders when `profiles.next_neutral_observer_due` is null or ≤ now AND the user is onboarded. Completing a **scheduled** reflection advances `next_neutral_observer_due` +90 days (Finkel dosage: 3×/year deliberately, not monthly). On-demand / conflict-triggered completions do NOT advance the schedule (ported API already distinguishes `trigger_source`).

**Post-conflict offer**: at the end of the Conflict First Aid flow, a gentle card: *"When you're ready — sometimes it helps to see what happened through different eyes. 90 seconds, just you."* → `/neutral-observer?trigger=conflict`.

**Menu entry**: 4th destination in `HomeDestinationStrip` (existing: Journey Progress / Shared Connection / Journal) → `/neutral-observer` (on-demand). Short warm label (executor picks against the strip's visual rhythm; e.g. "Fresh Eyes").

---

## 3. Ported assets (from `.worktrees/sprint-3-finkel-method`, commit 8a134aa)

| Source file | Destination | Port adaptations |
|---|---|---|
| `src/lib/server/encryption.ts` | same path | **Add missing-key guard**: today it silently encrypts with an empty master key if `REFLECTION_ENCRYPTION_KEY` is unset. Port adds `isEncryptionConfigured()` and the APIs refuse with 503 instead of storing weakly-encrypted text |
| `src/pages/api/reflections/index.ts` | same path | Keep auth (`getAuthedContext`), per-user encryption, `trigger_source` semantics, +90d schedule advance for scheduled completions; add the missing-key 503 guard |
| `src/pages/api/reflections/[id].ts` | same path | Same guard; verify delete/read are user-scoped |
| `src/pages/neutral-observer.tsx` | same path | Retitle + credential line per labeling decision; align styling to current brand tokens/components; `?trigger=conflict` → `trigger_source: 'state_tag'` (keep ported value for analytics continuity) |
| `src/pages/neutral-observer/history.tsx` | same path | Brand alignment only |

**Already live (no migration needed):** `reflections` table + RLS (migration `20260423142708_sprint3_create_reflections.sql`), `profiles.next_neutral_observer_due` (migration `20260423025712_sprint2_profiles_habit_columns.sql`). Phase C ships **zero schema changes**.

## 4. New integrations (written fresh against today's main)

- `src/components/dashboard/NeutralObserverCard.tsx` — quarterly card; fetches due-state from a small GET (`/api/reflections/due` or piggyback on existing endpoint — executor's choice, fail-soft renders nothing); mounted on `dashboard.tsx` near the other cards.
- `src/pages/conflict-first-aid.tsx` — end-of-flow offer card linking `/neutral-observer?trigger=conflict`. Must not interfere with the page's auto-resolve-on-leave behavior.
- `src/components/dashboard/HomeDestinationStrip.tsx` — 4th destination.
- `src/pages/api/me/memory-settings.ts` — DELETE (delete-all) gains `reflections` cascade. PATCH memory=none does NOT touch reflections (they are deliberate journaling with their own privacy contract, not ambient memory).

## 5. Deployment requirement (the one manual step)

`REFLECTION_ENCRYPTION_KEY` — 32-byte hex (`openssl rand -hex 32`) — set in `.env.local` and Vercel env. Until set in production, the flow shows a soft "not available yet" state (503 path) rather than weak encryption. Key rotation is out of scope (losing the key orphans old ciphertext — documented).

## 6. Failure handling

Standard contract: every card/offer fail-soft (fetch error → renders nothing); API errors → friendly retry copy in the flow; missing env key → 503 + soft client state; history decryption failures per-row fail-soft (skip row, never crash the page).

## 7. Verification (no test infra, per CLAUDE.md)

- tsc/lint/build green.
- Greps: `isEncryptionConfigured` guard present in both API files; no `peterChat`/`openrouter` imports anywhere in the neutral-observer flow; `from('reflections')` only in the two API files + memory-settings cascade; "Finkel" appears in Trust Center only, not in the flow UI (warm-label check).
- Round-trip logic check (one-off script): encrypt → decrypt identity; tamper → throws; missing key → guard refuses.
- Seeded manual UAT: due card → 3 screens → encrypted row in `reflections` (ciphertext visibly `iv:data:tag`) → history decrypts → `next_neutral_observer_due` advanced +90d; conflict-triggered completion does NOT advance it; delete-all wipes reflections.

## 8. Out of scope (deferred)

- Sprint-2 UI from the same branch (habit anchors, if-then cards, state chips) — separate phase (JITAI)
- Partner sharing of reflections (`shared_with_partner` column exists, stays false)
- Peter/North-Star/growth-engine awareness of reflection content — private by design
- Key rotation tooling
- Reminder notifications (out of beta scope)
