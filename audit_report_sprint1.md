# Sprint 1 Audit Report — NLP & Polyvagal References

Generated: 2026-06-10
Per: `sparq_science_upgrade_package/06_CODEBASE_AUDIT_CHECKLIST.md`

## Summary — the headline

**Zero NLP or Polyvagal references exist in `src/` — no shipped code, no data files, no user-facing strings, no DB string literals, no framework tables.** The entire exposure is in internal documentation and AI-guidance skill files. Additionally, **no science page exists in the app at all** — Sprint 5's "rewrite" is actually a fresh build.

- NLP references (live, need retag): **8 lines across 4 files**
- NLP references (frozen history, leave): 2 historical spec docs + OLD_PRD.md + .planning Phase-23 docs + stale worktree copies
- Polyvagal references: **1 line in 1 file**
- False positive: 1 (acronym collision — see below)
- Framework data structures in code/DB: **none found** (no `frameworks` table, no `'nlp'` literals, no Prime metadata yet)

## Detailed findings

### NLP references — live, to retag

| Location | Context | Action |
|---|---|---|
| `CLAUDE.md:19,26,96,619,634` | References to "NLP patterns" / "NLP language framework" skill path | Rename references → "language framework"; retag construct names |
| `.claude/skills/sparq-psychology/references/nlp-language-framework.md` | The framework reference file itself (title + framing; techniques inside are valid under other names) | Rename file → `language-framework.md`; rewrite title/intro to cite validated parent constructs (Gross 2002 cognitive reappraisal; pragmatics presupposition; Chartrand & Bargh 1999 mimicry; identity-based motivation). **All technique content stays.** |
| `.claude/skills/sparq-ui/SKILL.md:537` | "For NLP language patterns and copy rules" | Update path + label |
| `.claude/skills/sparq-psychology/SKILL.md:153` | "uses light NLP — no embedded commands" | Retag → "identity reinforcement (self-perception theory)" |
| `SPARQ-PSYCHOLOGY-MODALITIES.md:537` | "Light NLP: Identity reinforcement" | Same retag |

### False positive (disambiguation)

- `SPARQ_MASTER_SPEC.md:1401` — "Track specific micro-behaviors in evening reflections via NLP in profile-analysis" — this is **natural language processing** (the LLM text analysis in profile-analysis.ts), not neuro-linguistic programming. Reword to "language analysis" to kill the acronym ambiguity.

### Polyvagal references

- `.claude/skills/sparq-psychology/references/modalities-applied.md:185` — cites "Stephen Porges (Polyvagal Theory)" as research basis inside the Somatic section. Per spec §2.2: reframe as "a widely-used clinical framework," anchor physiology to HRV (Thayer & Lane 2000) and affective neuroscience (Davidson et al. 2000). Keep "co-regulation," "settling," "nervous system states."

### Frozen history — deliberately NOT modified

- `OLD_PRD.md` — superseded document
- `docs/superpowers/specs/2026-03-23-onboarding-design.md`, `2026-03-25-public-beta-readiness-design.md`, `docs/superpowers/plans/2026-03-26-public-beta-readiness.md` — committed historical specs
- `.planning/phases/23-peter-adaptation/*` — frozen phase records (reference the old skill path as it existed then)
- `.claude/worktrees/*` — stale worktree copies

### Anchor disambiguation (per checklist)

All "anchor" hits in the codebase are **habit-anchor** sense (sprint-2 migrations: `onboarding_anchor_set_at`, habit columns) — zero NLP-sense anchors found. No action.

## Recommended sequence

1. Rename + rewrite the language framework reference file (single source the others point at)
2. Update the 3 live referencing skill/doc files + CLAUDE.md
3. Retag the 2 "Light NLP" lines; disambiguate the master-spec acronym
4. Soften the single Polyvagal line
5. (Separate, larger Phase-A work: build the science page fresh + Prime citation infrastructure — needs design treatment under the "enjoyment first" principle)

## Why this matters less AND more than expected

Less: no code migration, no DB changes, nothing user-visible to break.
More: the retag changes the **instructions every future AI session reads before writing copy** — getting the construct names right in the skills means all future generated copy inherits defensible framing automatically.
