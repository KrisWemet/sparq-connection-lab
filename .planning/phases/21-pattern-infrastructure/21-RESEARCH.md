# Phase 21: Pattern Infrastructure - Research

**Researched:** 2026-04-06
**Domain:** TypeScript server-side trait vocabulary enforcement + Supabase data migration
**Confidence:** HIGH — all findings verified by direct codebase inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

**D-09:** Vocabulary enforcement mirrors `profile-analysis.ts` VALID_TRAIT_VALUES pattern: `Record<string, Set<string>>`, guard = `if (allowed && !allowed.has(value)) { console.warn(...); continue; }`.

**D-10:** Migration file must include a comment block documenting all 8 keys and allowed values.

**D-11:** Data migration maps old `attachment_style` values:
- `anxious` → `reaches_out`
- `avoidant` → `steps_back`
- `disorganized` → `feels_torn`
- `secure` → `feels_steady`

**D-12:** `profile-analysis.ts` VALID_TRAIT_VALUES for `attachment_style` updated to new values.

**D-13:** `PatternContext` has 8 nullable string fields — all `string | null`. User with no rows returns all-null object, never throws.

**D-14:** `buildPatternContext(userId)` takes Supabase client + userId, queries `profile_traits` for 8 keys filtered by `effective_weight >= 0.3`.

**D-15:** Dimensions below threshold (`effective_weight >= 0.3`) return `null`.

**D-16:** Phase 21 migrates exactly 3 callers: `peter/morning.ts`, `peter/chat.ts`, `next-journey-recommender.ts`.

**D-17:** All other scattered `profile_traits` reads stay as-is (Phase 22+).

**D-18:** The 3 migrated callers pass `PatternContext` to `buildPersonalizedPrompt` or equivalent — removing their independent `profile_traits` queries for the 8 pattern keys.

### Claude's Discretion
- Internal variable naming within `attachment-context.ts`
- Whether `buildPatternContext` does a single query or batched reads (single query preferred for efficiency)
- Exact TypeScript interface name (`PatternContext` or `UserPatternContext`)
- Migration file timestamp and naming format (follow existing conventions)

### Deferred Ideas (OUT OF SCOPE)
- Updating `love_language` and `conflict_style` to be part of PatternContext
- Migrating remaining scattered `profile_traits` reads (rehearsal, session APIs, profile snapshot)
- Updating `trait-gaps.ts` CORE_TRAITS to include all 8 dimensions (Phase 22)
- Display-layer updates for new vocabulary in profile snapshot UI
- User correction flow updates for renamed `attachment_style` values
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ATTACH-INFRA-01 | Define 7 new `profile_traits` keys with 2–4 allowed plain-language values each, enforce via server-side validation mirroring `profile-analysis.ts`, document in migration | Exact VALID_TRAIT_VALUES pattern verified in source; migration format verified from 20260325 reference |
| ATTACH-INFRA-02 | Create `src/lib/server/attachment-context.ts` exporting `buildPatternContext(userId)` returning typed `PatternContext`; used by Peter morning, Peter chat, journey recommender; handles missing traits gracefully | All 3 caller query patterns verified; `recommendNextJourneys` signature verified; `ProfileTrait[]` interface verified |
</phase_requirements>

---

## Summary

Phase 21 has narrow scope: write one SQL migration, update one TypeScript file (`profile-analysis.ts`), create one new TypeScript file (`attachment-context.ts`), and refactor three callers. No new tables. No new columns. No UI changes.

The codebase already has a complete, proven pattern for everything Phase 21 needs. `profile-analysis.ts` defines `VALID_TRAIT_VALUES` as `Record<string, Set<string>>` with an identical guard that this phase must replicate. The query used by `peter/morning.ts` and `peter/chat.ts` is identical: `.from('profile_traits').select('trait_key, inferred_value, confidence, effective_weight').eq('user_id', userId).gte('effective_weight', 0.3)` — `buildPatternContext` consolidates this to one call for 8 keys and maps the result into the typed `PatternContext` object.

The main coordination point is the `next-journey-recommender.ts` migration: that function currently takes `attachmentStyle?: string | null` as a plain string parameter (not a PatternContext), and the actual query for `attachment_style` happens in `session/complete.ts` before calling `recommendNextJourneys`. Phase 21 must update the function signature to accept `PatternContext` (or `attachmentStyle` derived from it), and update `session/complete.ts` to pass a PatternContext or the extracted value — whichever approach is cleanest given D-17 (that caller is NOT in the Phase 21 migration scope for its own `profile_traits` query, but the `attachment_style` value it passes must now be a new-vocab value post D-11).

**Primary recommendation:** Implement in this order — (1) SQL migration, (2) update `profile-analysis.ts` VALID_TRAIT_VALUES, (3) create `attachment-context.ts`, (4) update the 3 callers.

---

## Standard Stack

No new dependencies. Phase 21 uses exactly what is already installed.

| Asset | Version | Purpose |
|-------|---------|---------|
| `@supabase/supabase-js` | existing | Supabase client type for `buildPatternContext` parameter |
| TypeScript | 5 (existing) | Typed `PatternContext` interface |
| Next.js Pages Router | 13 (existing) | API route context; no changes to routing |

[VERIFIED: direct codebase inspection — package.json and CLAUDE.md]

---

## Architecture Patterns

### Existing VALID_TRAIT_VALUES Pattern (MIRROR THIS EXACTLY)

Source: `src/lib/server/profile-analysis.ts` lines 16–22

```typescript
// [VERIFIED: src/lib/server/profile-analysis.ts]
const TRAIT_KEYS = ['attachment_style', 'love_language', 'conflict_style'] as const;

const VALID_TRAIT_VALUES: Record<string, Set<string>> = {
  attachment_style: new Set(['anxious', 'avoidant', 'disorganized', 'secure']),
  love_language: new Set(['words', 'acts', 'gifts', 'time', 'touch']),
  conflict_style: new Set(['avoidant', 'volatile', 'validating']),
};
```

The validation guard at line 74–77:

```typescript
// [VERIFIED: src/lib/server/profile-analysis.ts]
const allowed = VALID_TRAIT_VALUES[key];
if (allowed && !allowed.has(value)) {
  console.warn(`Profile analysis: invalid ${key} value "${value}", skipping`);
  continue;
}
```

Phase 21 needs TWO separate `VALID_TRAIT_VALUES` maps:
1. The **new** map in `attachment-context.ts` covering all 8 pattern dimensions (for `buildPatternContext` filtering)
2. The **updated** map in `profile-analysis.ts` where `attachment_style` values change from clinical to behavioral (D-12)

### Exact Query Used by the 3 Callers (WHAT buildPatternContext REPLACES)

Both `peter/morning.ts` (line 93) and `peter/chat.ts` (line 104) use the same query:

```typescript
// [VERIFIED: src/pages/api/peter/morning.ts, src/pages/api/peter/chat.ts]
authed.supabase
  .from('profile_traits')
  .select('trait_key, inferred_value, confidence, effective_weight')
  .eq('user_id', authed.userId)
  .gte('effective_weight', 0.3)
```

This returns ALL traits (no key filter). `buildPatternContext` should filter to the 8 pattern keys specifically, then build the typed object. The callers currently take the full array and pass it as `ProfileTrait[]` to `buildPersonalizedPrompt`.

For `session/complete.ts` (the third caller's upstream), the query is narrowed to one key:

```typescript
// [VERIFIED: src/pages/api/daily/session/complete.ts lines 271-276]
const { data: traits } = await ctx.supabase
  .from('profile_traits')
  .select('inferred_value')
  .eq('user_id', ctx.userId)
  .eq('trait_key', 'attachment_style')
  .maybeSingle();

const { recommendations, suggestRest } = recommendNextJourneys(
  completedIds,
  traits?.inferred_value,
  activeJourneyId,
);
```

### recommendNextJourneys Current Signature

```typescript
// [VERIFIED: src/lib/server/next-journey-recommender.ts lines 42-46]
export function recommendNextJourneys(
  completedJourneyIds: string[],
  attachmentStyle?: string | null,
  lastCompletedJourneyId?: string | null,
): { recommendations: NextJourneyRec[]; suggestRest: boolean }
```

The current affinity scoring uses **old clinical values** (`'anxious'`, `'avoidant'`, `'disorganized'`, `'secure'`). After D-11 data migration, existing rows will have new values (`'reaches_out'`, etc.). The scoring logic at lines 64–67 must be updated to match new vocabulary. This is a **Phase 21 scope item** because the caller migration cannot work correctly if the scoring still expects clinical labels.

### ProfileTrait Interface and buildPersonalizedPrompt

```typescript
// [VERIFIED: src/lib/peterService.ts lines 286-291]
export interface ProfileTrait {
  trait_key: string;
  inferred_value: string;
  confidence: number;
  effective_weight: number;
}

export function buildPersonalizedPrompt(
  traits: ProfileTrait[],
  memories: MemoryResult[],
  basePrompt: string = PETER_SYSTEM_PROMPT,
  options: PeterPersonalizationOptions = {},
): string
```

`buildPersonalizedPrompt` internally checks `TRAIT_DESCRIPTIONS` for the combination of `trait_key` + `inferred_value`. Currently `TRAIT_DESCRIPTIONS` has entries for `attachment_style` with old clinical keys. After Phase 21, when `attachment_style` values change to behavioral labels, the `TRAIT_DESCRIPTIONS.attachment_style` entries must also be updated — otherwise Peter's personalization prompt for attachment_style produces no output (the lookup silently returns `undefined` at line 337).

This is a **required update in Phase 21** to avoid breaking existing personalization.

### Non-Blocking Error Pattern

All personalization reads are wrapped in try/catch that falls back silently. `buildPatternContext` must follow the same pattern:

```typescript
// [VERIFIED: src/pages/api/peter/morning.ts lines 126-128]
} catch {
  // Personalization failure is non-blocking
}
```

`buildPatternContext` itself should never throw — it should return an all-null `PatternContext` on any error. This satisfies success criterion 3.

### profile_traits Table Shape

```sql
-- [VERIFIED: .claude/skills/sparq-db/references/schema.md lines 582-592]
CREATE TABLE profile_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trait_key TEXT NOT NULL,
  inferred_value TEXT NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 0.3,
  effective_weight NUMERIC(3,2) DEFAULT 1.0,
  user_feedback TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, trait_key)
);
```

Key constraint: **`UNIQUE(user_id, trait_key)`** — one row per user per trait_key. This means the 7 new keys will produce up to 7 new rows per user (as signals are inferred over time). Phase 21 does NOT insert any rows for new keys — it only defines the vocabulary and context builder. Rows for new keys appear when Phase 22 inference writes them.

### Migration File Format

Timestamp format from most recent migration: `20260404000000_create_rehearsal_sessions.sql`

Pattern: `YYYYMMDDHHMMSS_snake_case_description.sql`

The reference migration (`20260325_growth_ecosystem.sql`) omits the time portion (uses `YYYYMMDD_name`). Both formats exist. The more recent migration (`20260404000000`) uses full timestamp. Use full timestamp to avoid ambiguity.

Suggested name: `20260406000000_pattern_vocabulary.sql`

SQL structure from `20260325_growth_ecosystem.sql`:
- Section dividers with `-- ─── SECTION NAME ─────` style comments
- `DO $$ BEGIN ... END $$;` blocks for conditional ALTER TABLE (not needed here — no column additions)
- `COMMENT ON ...` for column documentation

For Phase 21 the migration is data-only (no DDL), so structure is simpler:
```sql
-- Vocabulary comment block (required by D-10)
-- Data migration for attachment_style rename (required by D-11)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Vocabulary validation | Custom regex or ad-hoc string checks | Mirror `VALID_TRAIT_VALUES` + `Set.has()` — already battle-tested in `profile-analysis.ts` |
| Null-safe trait lookup | Throw-catching wrappers or optional chaining chains | Single query + `Map` construction + explicit null per missing key |
| Supabase client threading | Passing supabase through 3 hops | Accept `SupabaseClient` as parameter — matches existing server helper pattern |

---

## Common Pitfalls

### Pitfall 1: TRAIT_DESCRIPTIONS Not Updated for New attachment_style Values

**What goes wrong:** After D-11 data migration and D-12 vocab update, the `TRAIT_DESCRIPTIONS.attachment_style` map in `peterService.ts` still has old clinical keys (`anxious`, `avoidant`, etc.). `buildPersonalizedPrompt` silently returns no attachment_style personalization line because `descriptions[trait.inferred_value]` is `undefined`. No error is thrown — personalization just disappears for all users who had an `attachment_style` trait.

**Why it happens:** `TRAIT_DESCRIPTIONS` is not in scope of VALID_TRAIT_VALUES and is not flagged in CONTEXT.md, but it is the downstream consumer of `inferred_value` for building Peter's prompt.

**How to avoid:** Update `TRAIT_DESCRIPTIONS.attachment_style` in `peterService.ts` as part of Phase 21, mapping new behavioral values to their human-language Peter descriptions. Phase 23 will add more dimensions, but `attachment_style` must be updated now.

**Warning signs:** Peter's personalized prompt for attachment users loses its "From what you've learned..." line with no TypeScript error.

### Pitfall 2: `recommendNextJourneys` Scoring Uses Old Clinical Values Post-Migration

**What goes wrong:** After D-11 migration, `profile_traits` rows have `inferred_value = 'reaches_out'` for previously-anxious users. The scoring at lines 64–67 checks `if (attachmentStyle === 'anxious')` — always false. All users get a score of 0 for attachment affinity and journey routing becomes meaningless.

**Why it happens:** The scoring map was written against old clinical vocabulary and lives in a pure function that takes a raw string, not a `PatternContext`.

**How to avoid:** Update the scoring conditionals in `recommendNextJourneys` to use new values (e.g., `'reaches_out'` → boost `building-trust`, `safe-in-love`; `'steps_back'` → boost `opening-heart`, `calm-before-closeness`; etc.) in Phase 21 alongside the function signature update.

### Pitfall 3: buildPatternContext Returns undefined Instead of null

**What goes wrong:** If `buildPatternContext` uses `const context: any = {}` and only assigns found keys, missing dimensions are `undefined` not `null`. TypeScript may not catch this if the return type uses `| null`. Downstream callers (Phases 22–24) that check `if (patternContext.repair_style !== null)` silently treat undefined as truthy or falsy depending on operator.

**How to avoid:** Explicitly initialize every field to `null` before the query, then assign only found values. Pattern:
```typescript
const context: PatternContext = {
  attachment_style: null,
  repair_style: null,
  // ... all 8 fields
};
for (const row of data) {
  if (PATTERN_KEYS.has(row.trait_key)) {
    (context as any)[row.trait_key] = row.inferred_value;
  }
}
return context;
```

### Pitfall 4: Migration Wipes Instead of Updating attachment_style Rows

**What goes wrong:** `DELETE FROM profile_traits WHERE trait_key = 'attachment_style'` followed by new inserts loses confidence scores and user_feedback values. Users who confirmed their trait lose that signal.

**How to avoid:** Use `UPDATE ... SET inferred_value = CASE WHEN ...` (CASE expression), not DELETE + INSERT. Preserve `confidence`, `effective_weight`, `user_feedback`, and `updated_at`.

### Pitfall 5: Callers Pass PatternContext to buildPersonalizedPrompt Incorrectly

**What goes wrong:** `buildPersonalizedPrompt` expects `ProfileTrait[]`, not a `PatternContext` object. If a caller passes the `PatternContext` directly, TypeScript will catch it — but only if types are strict.

**How to avoid:** `buildPatternContext` should optionally expose a `toProfileTraits()` helper or the callers should derive a `ProfileTrait[]` slice from the PatternContext for the existing `buildPersonalizedPrompt` call. Alternatively, Phase 21 can add a new overload — but D-18 says to remove the independent trait queries, so the callers need a clear path. The simplest approach: keep passing `traits` (the full `profile_traits` result) to `buildPersonalizedPrompt` as before, and use `buildPatternContext` result only for the journey recommender. This avoids breaking `buildPersonalizedPrompt` while satisfying D-16/D-17/D-18. See Open Questions section.

### Pitfall 6: effective_weight Threshold Applied at Wrong Layer

**What goes wrong:** The current Peter morning/chat query filters at `.gte('effective_weight', 0.3)` at the database layer. `buildPatternContext` must also filter at this threshold (D-15). If the query is written without the `gte` filter and the threshold is applied in TypeScript instead, low-weight traits get included (user marked trait as `not_really`, weight drops to 0.25).

**How to avoid:** Apply `.gte('effective_weight', 0.3)` in the Supabase query inside `buildPatternContext`, mirroring the exact existing query.

---

## Code Examples

### VALID_TRAIT_VALUES for All 8 Pattern Dimensions (for attachment-context.ts)

```typescript
// Source: mirrors pattern from src/lib/server/profile-analysis.ts
const PATTERN_KEYS = [
  'attachment_style',
  'repair_style',
  'reassurance_need',
  'space_preference',
  'stress_communication',
  'interpretation_bias',
  'vulnerability_pace',
  'worth_pattern',
] as const;

type PatternKey = typeof PATTERN_KEYS[number];

const VALID_PATTERN_VALUES: Record<PatternKey, Set<string>> = {
  attachment_style: new Set(['reaches_out', 'steps_back', 'feels_torn', 'feels_steady']),
  repair_style: new Set(['reaches_out_first', 'needs_space_first', 'uses_humor', 'wants_direct_talk']),
  reassurance_need: new Set(['frequent_check_ins', 'words_matter_most', 'actions_over_words', 'figures_it_out']),
  space_preference: new Set(['process_together', 'process_alone_first', 'moves_between_both']),
  stress_communication: new Set(['goes_quiet', 'talks_it_through', 'gets_louder', 'needs_to_move_first']),
  interpretation_bias: new Set(['assumes_the_best', 'looks_for_patterns', 'takes_it_personally', 'asks_directly']),
  vulnerability_pace: new Set(['opens_up_early', 'opens_slowly', 'needs_full_safety', 'struggles_to_open']),
  worth_pattern: new Set(['tied_to_being_needed', 'tied_to_being_chosen', 'tied_to_achieving', 'relatively_stable']),
};
```

### PatternContext Type

```typescript
// Exact shape required by D-13
export interface PatternContext {
  attachment_style: string | null;
  repair_style: string | null;
  reassurance_need: string | null;
  space_preference: string | null;
  stress_communication: string | null;
  interpretation_bias: string | null;
  vulnerability_pace: string | null;
  worth_pattern: string | null;
}
```

### buildPatternContext Implementation Skeleton

```typescript
// Source: mirrors query from src/pages/api/peter/morning.ts and src/pages/api/peter/chat.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export async function buildPatternContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<PatternContext> {
  // Initialize all dimensions to null — satisfies success criterion 3
  const context: PatternContext = {
    attachment_style: null,
    repair_style: null,
    reassurance_need: null,
    space_preference: null,
    stress_communication: null,
    interpretation_bias: null,
    vulnerability_pace: null,
    worth_pattern: null,
  };

  try {
    const { data } = await supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, effective_weight')
      .eq('user_id', userId)
      .in('trait_key', [...PATTERN_KEYS])
      .gte('effective_weight', 0.3);

    for (const row of data || []) {
      const key = row.trait_key as PatternKey;
      const allowed = VALID_PATTERN_VALUES[key];
      if (!allowed || !allowed.has(row.inferred_value)) continue; // vocab guard
      context[key] = row.inferred_value;
    }
  } catch {
    // Non-blocking — return all-null context on any error
  }

  return context;
}
```

### SQL Data Migration (D-11 value rename)

```sql
-- [VERIFIED: CONTEXT.md D-11 mapping]
UPDATE profile_traits
SET
  inferred_value = CASE inferred_value
    WHEN 'anxious'      THEN 'reaches_out'
    WHEN 'avoidant'     THEN 'steps_back'
    WHEN 'disorganized' THEN 'feels_torn'
    WHEN 'secure'       THEN 'feels_steady'
    ELSE inferred_value
  END,
  updated_at = now()
WHERE trait_key = 'attachment_style'
  AND inferred_value IN ('anxious', 'avoidant', 'disorganized', 'secure');
```

### Updated recommendNextJourneys Affinity Scoring (for new values)

```typescript
// [VERIFIED: src/lib/server/next-journey-recommender.ts lines 64-67 — current clinical values]
// After D-11 migration, scoring must use new behavioral labels:
if (attachmentStyle === 'reaches_out'  && ['building-trust', 'safe-in-love'].includes(j.id)) score += 2;
if (attachmentStyle === 'steps_back'   && ['opening-heart', 'calm-before-closeness'].includes(j.id)) score += 2;
if (attachmentStyle === 'feels_torn'   && ['mixed-feelings', 'healing-old-wounds'].includes(j.id)) score += 2;
if (attachmentStyle === 'feels_steady' && ['deepening-good', 'shared-language'].includes(j.id)) score += 2;
```

### Updated TRAIT_DESCRIPTIONS for attachment_style (for peterService.ts)

```typescript
// [VERIFIED: src/lib/peterService.ts lines 266-271 — current clinical keys]
// Must be updated to new behavioral keys to prevent silent personalization loss:
attachment_style: {
  reaches_out:   'you sometimes worry about whether your partner is really there for you',
  steps_back:    'you sometimes need space to process your feelings before opening up',
  feels_torn:    'you can feel pulled between wanting closeness and needing distance',
  feels_steady:  'you generally feel comfortable being open and close with your partner',
},
```

---

## All profile_traits Callers — Complete Inventory

The following is every location in the codebase that reads or writes `profile_traits`. This is provided so the planner can verify D-17 (Phase 21 migrates exactly 3) and flag the remaining callers for later phases.

[VERIFIED: grep of src/ directory]

| File | Operation | Details | Phase 21 Action |
|------|-----------|---------|-----------------|
| `src/lib/server/profile-analysis.ts` | WRITE | Upserts `attachment_style`, `love_language`, `conflict_style` | Update `VALID_TRAIT_VALUES` for `attachment_style` — IN SCOPE |
| `src/pages/api/peter/morning.ts` | READ | Full trait read, `effective_weight >= 0.3` | Replace with `buildPatternContext` — IN SCOPE |
| `src/pages/api/peter/chat.ts` | READ | Full trait read, `effective_weight >= 0.3` | Replace with `buildPatternContext` — IN SCOPE |
| `src/pages/api/daily/session/complete.ts` | READ | Only `attachment_style` key, `inferred_value` only, no weight filter | Upstream of `recommendNextJourneys` — score update IN SCOPE, query stays as D-17 |
| `src/pages/api/daily/session/evening-checkin.ts` | READ | Full trait read, `effective_weight >= 0.3` (personalization for evening context) | DEFERRED — Phase 22+ |
| `src/pages/api/peter/rehearsal/message.ts` | READ | Only `attachment_style`, `inferred_value` only | DEFERRED — Phase 22+ |
| `src/pages/api/profile/snapshot.ts` | READ | All fields, no weight filter (display layer) | DEFERRED — Phase 22+ |
| `src/pages/api/profile/traits.ts` | READ + WRITE | GET returns all; PATCH updates `effective_weight` + `user_feedback` | DEFERRED — not a personalization reader |
| `src/pages/api/me/patterns.ts` | READ | `trait_key, inferred_value, confidence`, `confidence >= 0.4` (weekly pattern gen) | DEFERRED — Phase 22+ |
| `src/pages/api/me/graduation-report.ts` | READ | `trait_key, inferred_value, confidence`, `confidence >= 0.4` | DEFERRED — Phase 22+ |
| `src/pages/api/admin/beta-testers.ts` | READ | Admin use only | DEFERRED — not a personalization reader |
| `src/lib/server/trait-gaps.ts` | READ | `trait_key, confidence` for `CORE_TRAITS` | DEFERRED — Phase 22 (ATTACH-SIGNAL-03) |

**Important:** `evening-checkin.ts` uses the same query pattern as `morning.ts` and `chat.ts` (full trait read with `effective_weight >= 0.3`). It is NOT in Phase 21 scope per D-17, but it is the most natural next candidate for Phase 22.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Clinical attachment labels | Plain behavioral descriptions | Phase 21 (D-11) | Existing `profile_traits` rows need data migration; scoring logic needs update |
| Scattered per-caller `profile_traits` queries | Single `buildPatternContext` call | Phase 21 | 3 callers simplified; type safety for downstream phases |
| `attachment_style` only in journey routing | `PatternContext` (8 dimensions) | Phase 21 foundation; routing update in Phase 24 | Journey affinity will be richer in Phase 24 |

---

## Open Questions

### 1. How should Peter morning/chat callers integrate PatternContext with buildPersonalizedPrompt?

**What we know:** `buildPersonalizedPrompt` accepts `ProfileTrait[]`. After Phase 21, `buildPatternContext` returns `PatternContext`. The callers currently pass the full `profile_traits` array (all traits, all keys) to `buildPersonalizedPrompt`.

**What's unclear:** D-18 says callers should "pass PatternContext to buildPersonalizedPrompt or equivalent — removing their independent queries for the 8 pattern keys." But `buildPersonalizedPrompt` uses `TRAIT_DESCRIPTIONS` which maps `trait_key + inferred_value` to natural language. A `PatternContext` can be converted to `ProfileTrait[]` but requires synthetic `confidence` and `effective_weight` values.

**Recommendation:** The cleanest approach consistent with D-17 is to keep the full `profile_traits` query in the callers (for `love_language` and `conflict_style` which remain scattered), but additionally call `buildPatternContext` and use the result for the journey recommender or future Phase 23 prompting. For Phase 21, the morning/chat callers replace their independent query with `buildPatternContext`, and pass `PatternContext` values as `ProfileTrait[]` objects (synthesizing confidence=1.0, effective_weight=1.0 since the threshold was already applied). This avoids breaking `buildPersonalizedPrompt` while satisfying D-18. Confirm with Chris if needed, or use discretion.

### 2. Does session/complete.ts need to call buildPatternContext or just pass the attachment_style string?

**What we know:** `session/complete.ts` queries one field (`attachment_style`) and passes the string to `recommendNextJourneys`. D-16 says `next-journey-recommender.ts` is in scope. D-17 says other scattered reads stay as-is.

**What's unclear:** If `next-journey-recommender.ts` is updated to accept `PatternContext`, then `session/complete.ts` must call `buildPatternContext`. If the signature stays as `attachmentStyle?: string | null`, then `session/complete.ts` just passes the post-migration value unchanged.

**Recommendation:** Keep `recommendNextJourneys` signature as `attachmentStyle?: string | null` for Phase 21 (update scoring labels only). Phase 24 (ATTACH-JOURNEY-01) will refactor to full `PatternContext`-based weighting. This minimizes scope creep and satisfies D-17.

---

## Environment Availability

Step 2.6 SKIPPED — Phase 21 is purely code and SQL migration changes. No new external tools, services, CLIs, or runtimes are required beyond the existing Next.js + Supabase stack.

---

## Validation Architecture

> nyquist_validation: No automated tests per CLAUDE.md ("No automated tests — accepted for now"). Manual verification steps listed below.

### Success Criterion Verification

| Criterion | Verification Method |
|-----------|-------------------|
| SC-1: Only vocab values insertable via any server path | TypeScript compilation check on `profile-analysis.ts` + SQL query against live DB |
| SC-2: `attachment-context.ts` exists and exports typed `buildPatternContext` | `npx tsc --noEmit` must pass; file must exist at path |
| SC-3: Empty user returns all-null PatternContext | Manual API call trace or node REPL test |
| SC-4: Migration documents all 7 new keys and allowed values in comment block | Read migration file |

### TypeScript Compilation Check

```bash
# From project root — must pass with 0 errors
npx tsc --noEmit
```

Run after every file change. This catches missing exports, type mismatches, and broken imports.

### SQL Verification: Only Allowed Values in Database

After applying the migration and running any inference:

```sql
-- Should return 0 rows — any result means an out-of-vocab value got through
SELECT trait_key, inferred_value, count(*)
FROM profile_traits
WHERE trait_key IN (
  'attachment_style', 'repair_style', 'reassurance_need', 'space_preference',
  'stress_communication', 'interpretation_bias', 'vulnerability_pace', 'worth_pattern'
)
AND inferred_value NOT IN (
  -- attachment_style
  'reaches_out', 'steps_back', 'feels_torn', 'feels_steady',
  -- repair_style
  'reaches_out_first', 'needs_space_first', 'uses_humor', 'wants_direct_talk',
  -- reassurance_need
  'frequent_check_ins', 'words_matter_most', 'actions_over_words', 'figures_it_out',
  -- space_preference
  'process_together', 'process_alone_first', 'moves_between_both',
  -- stress_communication
  'goes_quiet', 'talks_it_through', 'gets_louder', 'needs_to_move_first',
  -- interpretation_bias
  'assumes_the_best', 'looks_for_patterns', 'takes_it_personally', 'asks_directly',
  -- vulnerability_pace
  'opens_up_early', 'opens_slowly', 'needs_full_safety', 'struggles_to_open',
  -- worth_pattern
  'tied_to_being_needed', 'tied_to_being_chosen', 'tied_to_achieving', 'relatively_stable'
)
GROUP BY trait_key, inferred_value;
```

### SQL Verification: Data Migration Applied Correctly

```sql
-- Should return 0 rows — any result means old clinical values remain
SELECT trait_key, inferred_value, count(*)
FROM profile_traits
WHERE trait_key = 'attachment_style'
  AND inferred_value IN ('anxious', 'avoidant', 'disorganized', 'secure')
GROUP BY trait_key, inferred_value;
```

### Manual Null-Safety Test for buildPatternContext

To verify SC-3 (empty user returns all-null PatternContext):

1. Call `/api/peter/morning` for a new user with no `profile_traits` rows. Verify: no 500 error, story is generated (personalization silently skipped).
2. Direct TypeScript unit test (optional, since no test infra): create a minimal inline test in a scratch file, call `buildPatternContext(supabase, 'nonexistent-uuid')`, assert all fields are `null`.

### Lint Check

```bash
npm run lint
```

Run after implementing all files. TypeScript ESLint recommended rules are active; `@typescript-eslint/no-unused-vars` is off (CLAUDE.md).

### File Existence Check

```bash
ls /path/to/project/src/lib/server/attachment-context.ts
ls /path/to/project/supabase/migrations/20260406000000_pattern_vocabulary.sql
```

### Manual Peter Smoke Test

After migrating callers:
1. Start dev server: `npm run dev`
2. Log in as a test user with existing `attachment_style` data
3. Hit `/api/peter/morning` — verify 200 response, no console errors about invalid trait values
4. Hit `/api/peter/chat` with a sample message — verify 200 response

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `peterService.ts` `TRAIT_DESCRIPTIONS.attachment_style` must be updated alongside `VALID_TRAIT_VALUES` or personalization silently breaks | Common Pitfalls / Code Examples | If not updated, all existing attachment_style-personalized users get generic Peter prompts with no error signal |
| A2 | `recommendNextJourneys` scoring conditionals must be updated in Phase 21 (not Phase 24) because the data migration changes values immediately | Common Pitfalls / Open Questions | If deferred to Phase 24, all journey routing after Phase 21 deployment produces wrong affinity scores for all users with an attachment_style trait |
| A3 | `profile_traits` has no DB-level CHECK constraint on `inferred_value` — validation is application-layer only | Architecture Patterns | If a CHECK constraint existed, migration DDL would be needed; this is app-layer only so no DDL required |

**A3 verification:** The schema definition in `sparq-db/references/schema.md` shows no `CHECK` constraint on `inferred_value`. The `profile-analysis.ts` validation is purely in TypeScript. [VERIFIED: direct schema read]

---

## Sources

### Primary (HIGH confidence — verified by direct file read)
- `src/lib/server/profile-analysis.ts` — VALID_TRAIT_VALUES map, TRAIT_KEYS, upsert pattern, validation guard
- `src/lib/peterService.ts` — ProfileTrait interface, buildPersonalizedPrompt signature, TRAIT_DESCRIPTIONS map (lines 230–350)
- `src/pages/api/peter/morning.ts` — exact profile_traits query pattern (lines 91–112)
- `src/pages/api/peter/chat.ts` — exact profile_traits query pattern (lines 102–140)
- `src/lib/server/next-journey-recommender.ts` — full function signature, scoring logic, entry point
- `src/pages/api/daily/session/complete.ts` — how attachment_style is queried and passed to recommendNextJourneys (lines 271–282)
- `src/lib/server/trait-gaps.ts` — CORE_TRAITS list (Phase 22 context only)
- `supabase/migrations/20260325_growth_ecosystem.sql` — migration file format reference
- `.claude/skills/sparq-db/references/schema.md` — profile_traits table definition (lines 582–598)
- `.planning/phases/21-pattern-infrastructure/21-CONTEXT.md` — locked decisions for Phase 21

### Secondary (HIGH confidence — grep verification)
- Full `profile_traits` caller inventory — grep of `src/` directory, all 11 call sites identified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies
- Architecture patterns: HIGH — all patterns verified from source files
- Pitfalls: HIGH — all identified from direct code reading, not inference
- Caller inventory: HIGH — grep-verified, complete

**Research date:** 2026-04-06
**Valid until:** Stable — only changes if Phase 22+ modifies the files listed above before Phase 21 executes
