-- Pattern Vocabulary: document all 8 inferred pattern dimensions + migrate attachment_style data
--
-- ─── VOCABULARY CONTRACT ───────────────────────────────────────────────────────
--
-- This file is the single authoritative reference for all allowed values in the
-- profile_traits table for the 8 pattern dimensions used by Phase 21+.
-- Validation is enforced in APPLICATION CODE (server-side), not by SQL constraints.
-- See: src/lib/server/profile-analysis.ts  VALID_TRAIT_VALUES
--      src/lib/server/attachment-context.ts PATTERN_KEYS + VALID_PATTERN_VALUES
--
-- DIMENSION 1: attachment_style
--   Describes how a person naturally moves toward or away from closeness under stress.
--   Allowed values:
--     reaches_out      — tends to reach for connection when worried (formerly: anxious)
--     steps_back       — tends to withdraw to process before reconnecting (formerly: avoidant)
--     feels_torn       — pulled between wanting closeness and needing distance (formerly: disorganized)
--     feels_steady     — generally comfortable being open and close (formerly: secure)
--
-- DIMENSION 2: repair_style
--   Describes how a person typically initiates repair after a disagreement.
--   Allowed values:
--     reaches_out_first  — moves toward the partner quickly to reconnect
--     needs_space_first  — needs time alone before feeling ready to repair
--     uses_humor         — lightens the mood before opening the real conversation
--     wants_direct_talk  — prefers to name what happened and resolve it directly
--
-- DIMENSION 3: reassurance_need
--   Describes what reassurance looks like for this person when they feel uncertain.
--   Allowed values:
--     frequent_check_ins  — regular small check-ins matter more than big gestures
--     words_matter_most   — hearing it said explicitly makes the biggest difference
--     actions_over_words  — what a partner does counts more than what they say
--     figures_it_out      — tends to self-soothe; rarely needs external reassurance
--
-- DIMENSION 4: space_preference
--   Describes how a person prefers to process difficult feelings.
--   Allowed values:
--     process_together     — thinks best by talking it through with someone
--     process_alone_first  — needs solo time before being ready to share
--     moves_between_both   — alternates between solo reflection and talking
--
-- DIMENSION 5: stress_communication
--   Describes how a person communicates when under significant stress.
--   Allowed values:
--     goes_quiet           — becomes quieter and more internal under stress
--     talks_it_through     — wants to verbally process stress as it happens
--     gets_louder          — expresses stress with more intensity and urgency
--     needs_to_move_first  — needs physical movement before words can come
--
-- DIMENSION 6: interpretation_bias
--   Describes a person's default interpretation when a partner's message is ambiguous.
--   Allowed values:
--     assumes_the_best   — defaults to charitable interpretation
--     looks_for_patterns — notices recurring themes; compares to past behavior
--     takes_it_personally — initial read often lands as self-referential
--     asks_directly      — pauses and asks before drawing a conclusion
--
-- DIMENSION 7: vulnerability_pace
--   Describes how quickly a person feels safe opening up emotionally.
--   Allowed values:
--     opens_up_early      — shares readily; emotional openness comes naturally
--     opens_slowly        — needs time and repeated safety signals to open up
--     needs_full_safety   — only opens fully when the environment feels completely safe
--     struggles_to_open   — vulnerability is difficult regardless of safety level
--
-- DIMENSION 8: worth_pattern
--   Describes where a person's sense of self-worth is most anchored.
--   Allowed values:
--     tied_to_being_needed   — feels most worthy when others depend on them
--     tied_to_being_chosen   — feels most worthy when a partner actively chooses them
--     tied_to_achieving      — feels most worthy through accomplishment and progress
--     relatively_stable      — sense of worth is broadly internal and not easily shaken
--
-- NOTE: love_language and conflict_style remain in profile_traits but are NOT part
-- of the 8-dimension PatternContext for this milestone.
-- ──────────────────────────────────────────────────────────────────────────────

-- ─── DATA MIGRATION: attachment_style clinical → behavioral values ─────────────
--
-- Migrates all existing profile_traits rows for attachment_style from the old
-- clinical vocabulary to the new plain-language behavioral labels.
-- Uses CASE expression (not DELETE+INSERT) to preserve confidence, effective_weight,
-- user_feedback, and updated_at metadata on every existing row.
-- Rows whose inferred_value is already a new value (or any unknown value) are
-- passed through unchanged (ELSE inferred_value).
--
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
