---
phase: 23
slug: peter-adaptation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — project has no automated test suite (per CLAUDE.md) |
| **Config file** | none |
| **Quick run command** | `npm run lint` (TypeScript + ESLint) |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~30s (lint) + ~60s (build) |

> **Important:** Sparq has no Jest/Vitest infrastructure. Phase 23 verification relies on:
> 1. **Grep-based static checks** (success criteria 4 + 5 are grep-verifiable)
> 2. **Dev-mode prompt logging** (success criteria 1 + 2 + 3) — emit final system/morning prompt strings to console in development and inspect manually
> 3. **Type compilation** (`npm run build`) — catches `getPatternHints` signature mismatches and `buildLegacyTraits` integration errors
> 4. **Manual UAT** — walk through morning generation + chat session for a user with known `profile_traits` rows

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Build green + grep assertions pass + manual prompt-log inspection complete
- **Max feedback latency:** ~30s for lint, ~90s for build

---

## Per-Task Verification Map

> Filled by planner. Each task should declare an `<automated>` block with the grep/build/lint command that verifies it, OR mark itself for Wave 0 (dev-mode prompt logging hook) or Manual-Only.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _to be filled by planner_ | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Dev-mode prompt logger — a small `logFinalPrompt(label, prompt)` helper gated on `NODE_ENV !== 'production'`, called at the assembly site in `morning.ts` + `session/start.ts` + `chat.ts` so success criteria 1 + 2 + 3 are inspectable.
- [ ] Grep assertion harness (optional) — a tiny script under `scripts/verify-phase-23.sh` that runs:
  - `! grep -rn "from('profile_traits')" src/pages/api/peter/morning.ts src/pages/api/peter/chat.ts src/pages/api/peter/session/start.ts` (must return non-zero — no matches; criterion 5)
  - `grep -n "TRAIT_DESCRIPTIONS" src/lib/peterService.ts` shows existing love_language/conflict_style entries unchanged (criterion 4)

*If none: planner determines what Wave 0 work, if any, is needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chat tone reflects `repair_style` / `reassurance_need` (and 6 other dims) | ATTACH-PETER-01 | LLM output is non-deterministic; verify the **prompt input**, not the model output | Seed a user with `profile_traits.repair_style = 'needs_space_first' (effective_weight 0.5)`. Open a chat. Confirm `chatToneHints` array includes a non-empty hint for `repair_style` in the logged final system prompt. |
| Morning prompt includes hint when dim ≥ 0.35 | ATTACH-PETER-02 | Same — verify prompt input | Seed a user with one trait at `effective_weight 0.4`. Trigger morning generation via the path `daily-growth.tsx` actually uses (`session/start.ts`). Confirm `morningHints` is appended to the final prompt string in dev console. |
| Insight moment phrasing is "I've noticed you tend to..." | ATTACH-PETER-03 | Wording is enforced via prompt skeleton, not regex on output | Seed a trait at `effective_weight 0.75`. Inspect logged system prompt — confirm `insightLines` contains an "I've noticed you tend to..." skeleton and contains NO "you are" / "your X style" / clinical labels. |
| NLP framework + Peter voice compliance for 31 chat tone variants + 31 insight skeletons | ATTACH-PETER-01..03 | Copy quality is editorial — must be reviewed against `.claude/skills/sparq-psychology/references/nlp-language-framework` and `.claude/skills/sparq-peter` | During copy authoring task: read both skills, then review every entry in `CHAT_TONE_VARIANTS` and the insight skeleton table line-by-line. Confirm: pull language, presupposition, fourth-grade reading, no clinical phrasing. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (lint/build/grep) or are explicitly listed as Manual-Only above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers any MISSING references (dev-mode prompt logger, grep harness)
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
