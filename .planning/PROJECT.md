# Sparq Connection Lab

## Vision
Sparq is a solo-first relationship growth app that helps one person become a steadier, more connected partner through small daily actions, clear reflection, and a warm AI coach.

## Current Milestone: v2.0 Attachment-Aware Personalization

**Goal:** Build a hidden intelligence layer that infers 8 relationship pattern dimensions from onboarding and daily loop behavior, then applies them to make Peter's tone, prompts, and journey routing feel genuinely tailored — without clinical labels, diagnostic framing, or new UI surfaces.

**Target features:**
- Extend onboarding to capture signals for repair style, reassurance need, space preference, stress communication, interpretation bias, vulnerability pace, and worth pattern
- Extend evening reflection analysis to continuously infer all 8 dimensions from daily behavior
- Extend Peter morning story personalization and chat tone to apply all 8 dimensions
- Extend journey recommendation to weight by inferred pattern profile
- Peter occasionally surfaces a named pattern naturally in context (no dashboard tab)

## Previous Milestone
Beta stabilization for the existing product surface.

## Constraints

- **Language:** No clinical labels in user-facing copy — never "avoidant", "anxious", "attachment style", "love language"
- **Consent:** All inference is silent and gated behind existing `can_analyze_profile` privacy flag
- **UI:** No new tabs, no diagnostic dashboard, no "your patterns" settings screen
- **Data:** `profile_traits` table is the single source of truth for all inferred dimensions
- **Architecture:** Next.js Pages Router, Supabase, shadcn/ui — no new libraries
- **Solo-first:** All 8 dimensions must work without a partner present

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `profile_traits` as single trait store | Already exists, holds arbitrary trait_key values, RLS-gated | — Pending |
| Silent inference only (no explicit quiz) | Avoids clinical framing, builds trust through felt experience | — Pending |
| Peter names patterns occasionally in context | Provides payoff without exposing the machinery | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-05 — Milestone v2.0 started*
