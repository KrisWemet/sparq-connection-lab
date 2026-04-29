# Phase 21: Pattern Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-06
**Phase:** 21-pattern-infrastructure
**Mode:** discuss
**Areas discussed:** 8-dimensions scope, Caller migration scope, Existing key renames, Pattern vocabulary values

---

## Gray Areas Identified

| Area | Description |
|------|-------------|
| Pattern vocabulary values | What are the 2–4 plain-language allowed values for each of the 7 new keys? |
| "8 dimensions" scope | Does PatternContext include existing 3 keys or just 7 new + 1 existing? |
| Caller migration scope | Which profile_traits reads get migrated in Phase 21 vs deferred? |
| Existing key renames | Do attachment_style's clinical values need updating too? |

---

## Decisions Made

### 8 Dimensions Scope

- **Question:** REQUIREMENTS says "all 8 dimensions" but 7 new + 3 existing = 10.
- **Decision:** 7 new keys + `attachment_style` = 8. `love_language` and `conflict_style` remain in `profile_traits` but are NOT part of `PatternContext` for this milestone.

### Caller Migration Scope

- **Question:** Migrate 3 named callers (Peter morning, Peter chat, journey recommender) or all scattered reads?
- **Decision:** 3 named callers only. Other reads (rehearsal, session APIs, profile snapshot) stay as-is — migration is Phase 22+ work.

### Existing Key Renames

- **Question:** Does Phase 21 need to rename attachment_style values from clinical to plain-language?
- **Decision:** Yes — update `attachment_style` values too. Requires:
  - Data migration: UPDATE existing rows (anxious→reaches_out, avoidant→steps_back, disorganized→feels_torn, secure→feels_steady)
  - Updated VALID_TRAIT_VALUES in profile-analysis.ts

### Pattern Vocabulary

- **Question:** What are the allowed values for all 8 dimensions?
- **Decision:** Confirmed proposed vocabulary:

| Key | Allowed Values |
|-----|----------------|
| `attachment_style` | `reaches_out` \| `steps_back` \| `feels_torn` \| `feels_steady` |
| `repair_style` | `reaches_out_first` \| `needs_space_first` \| `uses_humor` \| `wants_direct_talk` |
| `reassurance_need` | `frequent_check_ins` \| `words_matter_most` \| `actions_over_words` \| `figures_it_out` |
| `space_preference` | `process_together` \| `process_alone_first` \| `moves_between_both` |
| `stress_communication` | `goes_quiet` \| `talks_it_through` \| `gets_louder` \| `needs_to_move_first` |
| `interpretation_bias` | `assumes_the_best` \| `looks_for_patterns` \| `takes_it_personally` \| `asks_directly` |
| `vulnerability_pace` | `opens_up_early` \| `opens_slowly` \| `needs_full_safety` \| `struggles_to_open` |
| `worth_pattern` | `tied_to_being_needed` \| `tied_to_being_chosen` \| `tied_to_achieving` \| `relatively_stable` |

---

## No Scope Creep Flagged

Discussion stayed within Phase 21 scope. All deferred items captured in CONTEXT.md.
