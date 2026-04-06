# Phase 21: Pattern Infrastructure - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the stable pattern vocabulary and shared context builder that all downstream personalization phases depend on.

Specifically:
- Define 7 new `profile_traits` keys with 2–4 plain-language values each, plus update `attachment_style` to non-clinical values
- Enforce vocabulary validation server-side for all 8 pattern keys
- Create `src/lib/server/attachment-context.ts` exporting `buildPatternContext(userId)` returning a typed `PatternContext` covering all 8 dimensions
- Migrate Peter morning, Peter chat, and journey recommender to use `buildPatternContext`

Explicitly out of scope: signal inference, onboarding changes, Peter copy changes, journey routing changes.

</domain>

<decisions>
## Implementation Decisions

### Pattern Vocabulary — 8 Dimensions

`buildPatternContext` covers exactly 8 dimensions: the 7 new keys + `attachment_style`. `love_language` and `conflict_style` remain in `profile_traits` but are not part of `PatternContext` for this milestone.

**D-01: attachment_style** (updated — existing clinical values replaced)
- `reaches_out` | `steps_back` | `feels_torn` | `feels_steady`
- Replaces: `anxious` | `avoidant` | `disorganized` | `secure`
- Requires data migration for existing rows

**D-02: repair_style** (new)
- `reaches_out_first` | `needs_space_first` | `uses_humor` | `wants_direct_talk`

**D-03: reassurance_need** (new)
- `frequent_check_ins` | `words_matter_most` | `actions_over_words` | `figures_it_out`

**D-04: space_preference** (new)
- `process_together` | `process_alone_first` | `moves_between_both`

**D-05: stress_communication** (new)
- `goes_quiet` | `talks_it_through` | `gets_louder` | `needs_to_move_first`

**D-06: interpretation_bias** (new)
- `assumes_the_best` | `looks_for_patterns` | `takes_it_personally` | `asks_directly`

**D-07: vulnerability_pace** (new)
- `opens_up_early` | `opens_slowly` | `needs_full_safety` | `struggles_to_open`

**D-08: worth_pattern** (new)
- `tied_to_being_needed` | `tied_to_being_chosen` | `tied_to_achieving` | `relatively_stable`

### Vocabulary Enforcement

- **D-09:** Server-side validation mirrors the existing pattern in `profile-analysis.ts`: a `VALID_TRAIT_VALUES` map with a `Set<string>` per key — discard any insert that fails the allowed-values check.
- **D-10:** The migration file must include a comment block documenting all 8 keys and their allowed values so future phases have a human-readable contract without opening application code.

### attachment_style Data Migration

- **D-11:** A data migration must UPDATE existing `profile_traits` rows where `trait_key = 'attachment_style'` to map old values to new:
  - `anxious` → `reaches_out`
  - `avoidant` → `steps_back`
  - `disorganized` → `feels_torn`
  - `secure` → `feels_steady`
- **D-12:** `profile-analysis.ts` VALID_TRAIT_VALUES for `attachment_style` must be updated to the new values so inference continues to write valid data post-migration.

### PatternContext Type and Builder

- **D-13:** `PatternContext` type has 8 nullable string fields — one per dimension. All fields are `string | null` (never undefined). A user with no trait rows returns an object with all 8 set to `null` — never throws.
- **D-14:** `buildPatternContext(userId)` takes a Supabase client + userId, queries `profile_traits` for the 8 keys filtered by `effective_weight >= 0.3`, and returns the typed object.
- **D-15:** Only dimensions with `effective_weight >= 0.3` are populated; dimensions below threshold return `null` (consistent with existing personalization threshold in Peter morning).

### Caller Migration Scope

- **D-16:** Phase 21 migrates exactly 3 callers to `buildPatternContext`: Peter morning (`src/pages/api/peter/morning.ts`), Peter chat (`src/pages/api/peter/chat.ts`), and journey recommender (`src/lib/server/next-journey-recommender.ts`).
- **D-17:** All other scattered `profile_traits` reads (rehearsal, session complete, evening checkin, session start, profile snapshot) stay as-is and are migration targets for later phases.
- **D-18:** The 3 migrated callers should pass the `PatternContext` to `buildPersonalizedPrompt` or equivalent — removing their individual `profile_traits` queries for the 8 pattern keys.

### Claude's Discretion
- Internal variable naming conventions within `attachment-context.ts`
- Whether `buildPatternContext` does a single query for all 8 keys or batched reads (single query preferred for efficiency)
- Exact TypeScript interface name (e.g., `PatternContext` or `UserPatternContext`) — pick what reads cleanly as an import
- Migration file timestamp and naming format (follow existing migration conventions)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §ATTACH-INFRA-01, §ATTACH-INFRA-02 — canonical requirement statements for Phase 21

### Existing Patterns to Mirror
- `src/lib/server/profile-analysis.ts` — `VALID_TRAIT_VALUES` validation pattern + `TRAIT_KEYS` list + upsert pattern to mirror for new keys
- `src/lib/server/trait-gaps.ts` — `CORE_TRAITS` list and steering hint map to update in Phase 22 (informational for Phase 21)
- `src/lib/peterService.ts:286` — `ProfileTrait` interface and `buildPersonalizedPrompt` signature — PatternContext feeds into this

### Callers to Migrate
- `src/pages/api/peter/morning.ts:93` — independent `profile_traits` query to replace
- `src/pages/api/peter/chat.ts:104` — independent `profile_traits` query to replace
- `src/lib/server/next-journey-recommender.ts` — attachment_style read to migrate

### Migration Context
- `supabase/migrations/` — follow existing timestamp + naming format
- `supabase/migrations/20260325_growth_ecosystem.sql` — most recent migration for structural reference

### Product Spec
- `SPARQ_MASTER_SPEC.md §11` — Living Profile & Personalization System — personalization rules and non-clinical language constraint

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `profile-analysis.ts:VALID_TRAIT_VALUES` — the validation pattern (`Record<string, Set<string>>`) to copy directly for all 8 keys
- `profile-analysis.ts:TRAIT_KEYS` — the keys array pattern; replicate for the 8 pattern keys in `attachment-context.ts`
- `peterService.ts:buildPersonalizedPrompt(traits, memories, prompt, options)` — existing consumers of profile_traits pass a `ProfileTrait[]` into this; `buildPatternContext` should return a shaped object that can produce a compatible trait array or be used directly

### Established Patterns
- Supabase query: `.from('profile_traits').select('trait_key, inferred_value, confidence, effective_weight').eq('user_id', userId).gte('effective_weight', 0.3)` — exact query used by Peter morning and chat today; `buildPatternContext` consolidates this
- Validation guard: `if (allowed && !allowed.has(value)) { console.warn(...); continue; }` — use the same pattern in the new vocabulary enforcement
- Non-blocking error pattern: all personalization reads are wrapped in try/catch that falls back silently — maintain this in `buildPatternContext`

### Integration Points
- `profile_traits` table (Supabase) — the single data source; no schema changes needed for Phase 21 (the 7 new keys are just new row values, not new columns)
- Peter morning + chat: their `Promise.all` personalization blocks will call `buildPatternContext` instead of querying `profile_traits` directly
- `next-journey-recommender.ts`: currently takes `attachmentStyle?: string | null` as a parameter — will need to accept or derive from `PatternContext`

</code_context>

<specifics>
## Specific Ideas

- The `attachment_style` data migration must map old clinical values to new ones row-by-row — not wipe existing data
- Non-clinical language constraint is strict: values like `reaches_out`, `steps_back` are behavioral descriptions the user would recognize, not diagnoses
- `buildPatternContext` is the stable interface downstream phases (22–24) will depend on — get the TypeScript type signature right here so later phases don't rework it

</specifics>

<deferred>
## Deferred Ideas

- Updating `love_language` and `conflict_style` to be part of PatternContext — future milestone
- Migrating remaining scattered `profile_traits` reads (rehearsal, session APIs, profile snapshot) to `buildPatternContext` — Phase 22+
- Updating `trait-gaps.ts` CORE_TRAITS to include all 8 dimensions — Phase 22 (ATTACH-SIGNAL-03)
- Display-layer updates for new vocabulary values in profile snapshot UI — Phase 22+
- User correction flow updates to handle the renamed attachment_style values — Phase 22+

</deferred>

---

*Phase: 21-pattern-infrastructure*
*Context gathered: 2026-04-06*
