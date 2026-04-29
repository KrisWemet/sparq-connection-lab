---
phase: 21-pattern-infrastructure
plan: 03
subsystem: api
tags: [supabase, typescript, profile_traits, personalization, attachment, journey-routing]

# Dependency graph
requires:
  - phase: 21-01
    provides: "Behavioral vocabulary contract — clinical labels (anxious/avoidant/disorganized/secure) replaced with behavioral labels (reaches_out/steps_back/feels_torn/feels_steady)"
  - phase: 21-02
    provides: "buildPatternContext + patternContextToTraits — single-source-of-truth helper for reading 8 pattern dimensions from profile_traits"
provides:
  - "src/pages/api/peter/morning.ts — migrated to buildPatternContext for pattern dimensions"
  - "src/pages/api/peter/chat.ts — migrated to buildPatternContext for pattern dimensions"
  - "src/lib/server/next-journey-recommender.ts — scoring conditionals use behavioral attachment vocabulary"
affects:
  - "22-signal-capture (consumers now read from canonical helper)"
  - "23-peter-adaptation (Peter prompt building now flows through PatternContext)"
  - "24-pattern-weighted-journey-routing (recommender already on behavioral vocab)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Caller migration pattern: import buildPatternContext + patternContextToTraits, prepend pattern traits, append remaining narrow profile_traits read for love_language/conflict_style"
    - "Behavioral-vocabulary scoring: string comparisons in scoring conditionals updated from clinical to behavioral labels with no signature changes"
---

## Objective

Migrate the 3 callers identified in D-16 to consume `buildPatternContext` from `src/lib/server/attachment-context.ts` and update `recommendNextJourneys` scoring to the behavioral attachment vocabulary established in 21-01. This is the consumer-side wiring that makes Wave 1's infrastructure actually used.

## What was built

**`src/pages/api/peter/morning.ts`** and **`src/pages/api/peter/chat.ts`**
- Both API routes now import `buildPatternContext` and `patternContextToTraits` from `attachment-context.ts`.
- Replaced the direct `profile_traits` query for all 8 pattern dimensions with `buildPatternContext(supabase, userId)`.
- `love_language` and `conflict_style` are preserved via a separate narrow `.in()` query merged into the traits array (these are not part of the 8 pattern dimensions).
- Pattern traits from `PatternContext` are prepended; remaining traits appended. `buildPersonalizedPrompt` receives the same `ProfileTrait[]` shape as before — no personalization loss.

**`src/lib/server/next-journey-recommender.ts`**
- Replaced clinical labels with D-01 behavioral values in the `recommendNextJourneys` scoring conditionals:
  - `reaches_out` → boost `building-trust`, `safe-in-love`
  - `steps_back` → boost `opening-heart`, `calm-before-closeness`
  - `feels_torn` → boost `mixed-feelings`, `healing-old-wounds`
  - `feels_steady` → boost `deepening-good`, `shared-language`
- Function signature unchanged; journey IDs and boost amounts unchanged.
- After D-11 migration applies on live DB, `session/complete.ts` will pass behavioral values that now match correctly.

## Key files changed

```
src/pages/api/peter/morning.ts          (modified: +10 / -4)
src/pages/api/peter/chat.ts             (modified: +10 / -4)
src/lib/server/next-journey-recommender.ts  (modified: +5 / -4)
```

## Commits

- `8d3d304` — feat(21-03): migrate morning.ts and chat.ts to buildPatternContext
- `ec8186e` — feat(21-03): update recommendNextJourneys scoring to behavioral attachment labels

## Verification

- `npx tsc --noEmit` — passes with 0 errors
- No remaining direct `from('profile_traits')` queries against the 8 pattern dimensions in the migrated callers (verified via grep over morning.ts, chat.ts, next-journey-recommender.ts)
- Behavioral vocabulary in `next-journey-recommender.ts` matches the values defined in `VALID_PATTERN_VALUES.attachment_style` from `attachment-context.ts`

## Notes / Outstanding

- The D-11 live DB migration (`pattern_vocabulary`) is already applied to production at version `20260423025703`. Verified via Supabase MCP: all 30 `attachment_style` rows are on behavioral values (`reaches_out`), zero clinical values remain. The local file was renamed from `20260406000000_pattern_vocabulary.sql` to `20260423025703_pattern_vocabulary.sql` to match live history.
- The executor agent for this plan completed all code work in 2 atomic commits (`8d3d304`, `ec8186e`) before hitting a usage quota; SUMMARY.md, ROADMAP, and STATE updates were finished by the orchestrator.
