---
name: sparq-skill-creator
description: "Meta-skill for creating and maintaining Sparq Connection Claude Code skills. Use when: asked to create a new skill, asked to update or split an existing skill, a recurring workflow pattern should be captured as a skill, or when reviewing the skill library for gaps. Also use when troubleshooting why a skill isn't triggering properly (check description wording) or when a skill has grown too large and needs restructuring."
---

# Sparq Skill Creator — Meta-Skill Guide

## 1. When to Create a New Skill

Create a new skill when any of these are true:

**Pattern recognition**: A recurring pattern has emerged across 3+ conversations. You keep explaining the same conventions, referencing the same files, or applying the same rules. Examples: deployment process, API versioning patterns, a new integration (payments, analytics).

**New feature domain**: A major new feature area is being built that has its own conventions distinct from existing skills. Example: adding Stripe payments would need its own skill — it doesn't belong in sparq-db or sparq-architecture.

**Skill splitting**: An existing skill has grown past ~400 lines and covers two clearly separable domains. Example: if sparq-db grew to cover both database AND API route patterns extensively, the API patterns could split into sparq-api.

**Repeated reference loading**: Claude notices it keeps loading the same reference material for a specific type of task that isn't well-served by existing skill descriptions.

### When NOT to Create a New Skill

- **The knowledge fits in an existing skill's reference file.** Adding `references/stripe-integration.md` to sparq-architecture is better than a whole new sparq-payments skill if the domain is small.
- **It's project-specific context, not a reusable pattern.** Use CLAUDE.md or memory instead.
- **The trigger is too narrow.** If a skill would only activate for one specific task, it's not worth the overhead. Put it in a reference file.

---

## 2. Skill Structure Requirements

### Directory Layout

```
.claude/skills/sparq-[name]/
├── SKILL.md              # Frontmatter + body (under 500 lines)
└── references/            # Deep detail files (unlimited length)
    ├── [topic-a].md
    ├── [topic-b].md
    └── [template].md
```

### SKILL.md Frontmatter

```yaml
---
name: sparq-[name]
description: "[What this skill covers]. Use this skill whenever: [specific trigger phrases and task types]. [Additional trigger scenarios]."
---
```

**Description rules:**
- Must be "pushy" — over-triggering is better than under-triggering
- List specific task types and trigger phrases that should activate the skill
- Include both the domain AND the action verbs ("writing tests", "building components", "modifying schema")
- Keep under ~100 tokens — enough for reliable matching, not a full summary

**Good description example** (sparq-testing):
> "Testing standards, patterns, and Sparq-specific edge cases. Use this skill whenever: writing tests for new features, debugging test failures, setting up test infrastructure, creating mock data, testing psychology-based content personalization..."

**Bad description** (too vague):
> "Testing for Sparq Connection."

### SKILL.md Body

- **Under 500 lines.** Current skills range from 215-476 lines.
- Numbered sections for scanability
- Tables for structured data (color palettes, API routes, component specs)
- Code blocks for patterns that should be copied exactly
- Cross-references to other skills and to reference files
- Ends with a routing table: "when you need X, load reference Y"

### Reference Files

- Unlimited length — this is where deep detail lives
- Named descriptively: `design-tokens.md`, `test-fixtures.md`, `peter-poses.md`
- Loaded on demand, not automatically — keeps context window lean
- Should be self-contained: a developer reading just the reference file should understand it
- Include concrete examples, not just abstract rules

---

## 3. Progressive Disclosure Pattern

The skill system uses three layers of detail. Never dump everything into SKILL.md.

### Layer 1: Frontmatter Description (~100 tokens)
**Purpose**: Trigger matching. Claude reads this to decide whether to load the skill.
**Content**: Domain scope + specific trigger phrases + task types.
**Loaded**: Automatically, every conversation.

### Layer 2: SKILL.md Body (<500 lines)
**Purpose**: Working knowledge. Enough to do the task correctly without loading reference files.
**Content**: Overview, rules, conventions, decision tables, cross-references, routing table to reference files.
**Loaded**: When skill is triggered.

### Layer 3: Reference Files (unlimited)
**Purpose**: Deep detail for complex tasks. Exact specs, worked examples, templates, full catalogs.
**Content**: Everything that's too detailed for the SKILL.md body.
**Loaded**: On demand, when the task requires specific deep knowledge.

### How to Decide What Goes Where

| Question | Answer |
|---|---|
| Would Claude need this to decide IF this skill applies? | Frontmatter description |
| Would Claude need this for MOST tasks in this domain? | SKILL.md body |
| Would Claude need this only for SPECIFIC deep tasks? | Reference file |
| Is this a full catalog, template, or spec table? | Reference file |
| Is this a rule or convention? | SKILL.md body |
| Is this a worked example? | Reference file |

---

## 4. Sparq Skill Conventions

### Research First

Always pull from the **existing codebase** before inventing. Read the actual files, extract actual values. Every color hex, every component prop, every SQL column should come from the code — not from assumptions.

When the user says "Before you start, read [skills]" — do it. This ensures cross-skill consistency.

### Cross-References

Every skill should reference related skills. Use this format at the end of SKILL.md:

```markdown
## Cross-Skill References

- **For [domain]**: see `sparq-[name]` skill
- **For [domain]**: see `sparq-[name]` skill
```

### Tone by Skill Type

| Skill Type | Tone | Example |
|---|---|---|
| Architecture / code | Technical precision, code-heavy, terse | sparq-db, sparq-architecture |
| Content / UX | Warm accessibility, example-heavy | sparq-peter, sparq-psychology |
| Process / workflow | Step-by-step, checklist-oriented | sparq-testing, sparq-skill-creator |

### Structural Patterns from Existing Skills

| Pattern | Used In | When to Apply |
|---|---|---|
| Table map (ASCII diagram) | sparq-db (schema overview) | Complex relationships between entities |
| Emotional range table | sparq-peter (personality) | Mapping states to visual/behavioral cues |
| "Never Say / Do Say" table | sparq-psychology (language) | Content guardrails with concrete substitutions |
| Composing checklist | sparq-ui (new components) | Step-by-step guide for creating new instances |
| Worked examples per domain | sparq-testing (test-examples) | When patterns vary significantly by context |
| Fixture catalog | sparq-testing (test-fixtures) | Reusable mock/test data |

---

## 5. Pre-Creation Checklist

Before creating a new skill, verify all of these:

### 1. Check for overlap
Review the existing skill inventory (§6). Could this content fit as:
- A new section in an existing SKILL.md?
- A new reference file in an existing skill?
- An update to CLAUDE.md instead?

### 2. Define the trigger
Write the frontmatter description FIRST. If you can't write a clear, specific description with concrete trigger phrases, the skill scope isn't well-defined enough.

Test the description by asking: "If a user said [task X], would this description make Claude load the skill?" Try 5 different phrasings of likely user requests.

### 3. Plan reference files
Identify 2-5 reference files before writing. Each should cover a distinct subtopic. Common patterns:
- `[domain]-overview.md` — full specs or catalog
- `[domain]-examples.md` — worked examples
- `[domain]-template.md` — copy-paste templates
- `[domain]-fixtures.md` — reusable test/mock data

### 4. Outline the SKILL.md sections
Sketch 5-8 numbered sections. Each section should answer one clear question. If a section would exceed ~80 lines, it belongs in a reference file instead.

### 5. Research the codebase
Read the actual files. Extract real values, real patterns, real conventions. List every file you'll reference.

---

## 6. Existing Skill Inventory

| Skill | Lines | Refs | Domain | Covers |
|---|---|---|---|---|
| **sparq-architecture** | 215 | 1 | Core | Tech stack, Daily Loop, Skill Tree, Supabase patterns, API route map, key constraints |
| **sparq-psychology** | 282 | 5 | Content | 12 therapeutic modalities, personality assessment, content personalization, safety guardrails, language rules |
| **sparq-ui** | 328 | 2 | Frontend | Design philosophy, color system, typography, spacing, component patterns, animations, accessibility, dark mode |
| **sparq-peter** | 246 | 2 | Character | Peter identity/personality, SVG specs, 5 moods, component map, voice/copy guidelines, AI backend |
| **sparq-db** | 476 | 3 | Backend | Schema overview, auth patterns, RLS policies, Edge Functions, Realtime, migrations, query patterns, performance |
| **sparq-testing** | 402 | 2 | Quality | Playwright E2E (installed), Vitest (recommended), test philosophy, domain coverage, edge cases, mocking, CI |
| **sparq-skill-creator** | — | 0 | Meta | This skill — how to create and maintain skills |

### Reference File Inventory

| Skill | File | Lines | Content |
|---|---|---|---|
| sparq-architecture | architecture-overview.md | — | Full architecture deep dive |
| sparq-psychology | modalities-therapeutic.md | — | Gottman, EFT, ACT, CBT, IFS, Narrative Therapy |
| sparq-psychology | modalities-applied.md | — | Positive Psych, Attachment, Mindfulness, NVC, Somatic, Influence |
| sparq-psychology | personality-adaptation-guide.md | — | Full adaptation matrix per attachment style |
| sparq-psychology | question-bank-patterns.md | — | 24+ example questions with modality tags |
| sparq-psychology | exercise-templates.md | — | 12+ exercise templates for Daily Loop |
| sparq-ui | design-tokens.md | 298 | Every color, font, spacing, shadow, animation, z-index value |
| sparq-ui | component-catalog.md | 437 | 12+ component specs with props, states, animation, a11y |
| sparq-peter | peter-poses.md | 269 | 5 implemented + 5 proposed poses with SVG geometry |
| sparq-peter | peter-copy-library.md | 293 | 88 messages organized by context and emotion |
| sparq-db | schema.md | 534 | Every table definition, enums, functions, indexes, migration history |
| sparq-db | rls-policies.md | — | Every RLS policy organized by table |
| sparq-db | edge-function-template.md | — | Annotated Edge Function template with real example |
| sparq-testing | test-examples.md | — | 7 worked test examples (E2E, unit, integration, API) |
| sparq-testing | test-fixtures.md | — | Mock profiles, partnerships, sessions, LLM responses, Supabase factory |

### Coverage Gaps (potential future skills)

| Gap | When to Create | Would Cover |
|---|---|---|
| **sparq-deployment** | When CI/CD, Vercel config, or env management becomes complex | Vercel config, env vars, preview deployments, domain setup, monitoring |
| **sparq-payments** | When Stripe integration is built | Subscription logic, webhook handling, entitlement enforcement, pricing |
| **sparq-analytics** | When analytics/metrics become a major feature area | Event taxonomy, dashboard queries, KPI definitions, A/B testing |
| **sparq-api** | If sparq-db grows too large or API conventions diverge from DB patterns | API route conventions, request/response shapes, error handling, rate limiting |
| **sparq-partner-sync** | If partner features grow complex enough | Realtime patterns, synthesis generation, invitation flow, privacy boundaries |

---

## 7. Troubleshooting

### Skill isn't triggering

1. **Check the description wording.** Does it include the specific verbs and nouns the user would use? Add more trigger phrases.
2. **Is the description too short?** Under 50 tokens is often too vague for reliable matching.
3. **Is there a competing skill?** If two skills have overlapping descriptions, the wrong one may trigger. Differentiate their descriptions more clearly.

### Skill is too large

1. Check line count: `wc -l SKILL.md`. Over 400 lines is a warning sign; over 500 needs action.
2. Identify sections that are catalogs, templates, or worked examples — move them to reference files.
3. Consider splitting if the skill covers two clearly separable domains.

### Skill content is stale

1. Skills should reflect the **current codebase**, not a historical snapshot.
2. After major refactors, re-read the relevant source files and update the skill.
3. Update the inventory in this skill (§6) when skills are added, removed, or restructured.
