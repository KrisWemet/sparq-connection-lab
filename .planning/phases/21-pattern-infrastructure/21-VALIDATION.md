---
phase: 21
slug: pattern-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No automated tests (project policy) |
| **Config file** | none |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run lint`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full build must be green, manual verifications complete
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | ATTACH-INFRA-01 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 21-01-02 | 01 | 1 | ATTACH-INFRA-01 | — | vocab enforced server-side | manual | SQL query (see below) | ✅ | ⬜ pending |
| 21-02-01 | 02 | 1 | ATTACH-INFRA-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 21-02-02 | 02 | 2 | ATTACH-INFRA-02 | — | null-safe on empty user | manual | buildPatternContext test (see below) | ✅ | ⬜ pending |
| 21-03-01 | 03 | 2 | ATTACH-INFRA-02 | — | callers use builder | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed.

*This project has no automated test suite (project policy). All verification is via TypeScript compilation + manual checks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vocabulary enforcement blocks out-of-vocab values | ATTACH-INFRA-01 | No test framework | Insert a `profile_traits` row via an API call with an invalid value (e.g., `trait_key='repair_style', inferred_value='invalid'`). Verify the row is NOT inserted and a warn is logged. |
| `buildPatternContext` returns all-null for empty user | ATTACH-INFRA-02 | No test framework | Call `buildPatternContext` in a dev test script for a userId with no profile_traits rows. Verify result has all 8 keys set to `null`, no throw. |
| Data migration maps old clinical values correctly | ATTACH-INFRA-01 | Requires live DB | After running migration, query: `SELECT inferred_value FROM profile_traits WHERE trait_key='attachment_style'`. Verify no rows contain `anxious`, `avoidant`, `disorganized`, `secure`. |
| Peter morning/chat use buildPatternContext (no direct query) | ATTACH-INFRA-02 | Code review only | Review `src/pages/api/peter/morning.ts` and `chat.ts` to confirm they call `buildPatternContext` and have no direct `profile_traits` queries for the 8 pattern keys. |
| Callers produce same behavior as before migration | ATTACH-INFRA-02 | No automated test | Trigger a Peter morning response in dev environment. Verify personalization still works (non-null context is used when traits exist). |

---

## Validation Architecture (from Research)

### TypeScript compilation check
```bash
npm run build
# Must complete with 0 errors — PatternContext type, buildPatternContext signature, all callers
```

### Vocabulary enforcement SQL check (after migration)
```sql
-- Verify no out-of-vocab values exist for any of the 8 pattern keys
SELECT trait_key, inferred_value, count(*) 
FROM profile_traits 
WHERE trait_key IN (
  'attachment_style','repair_style','reassurance_need',
  'space_preference','stress_communication','interpretation_bias',
  'vulnerability_pace','worth_pattern'
)
GROUP BY trait_key, inferred_value
ORDER BY trait_key, inferred_value;
-- All returned values must be from the allowed vocab defined in CONTEXT.md
```

### Data migration check
```sql
-- Verify old clinical attachment_style values are gone
SELECT COUNT(*) FROM profile_traits 
WHERE trait_key = 'attachment_style' 
AND inferred_value IN ('anxious', 'avoidant', 'disorganized', 'secure');
-- Must return 0
```

### null-safe builder check (dev script)
```typescript
// Manually run in a dev API route or test script
import { buildPatternContext } from '@/lib/server/attachment-context';
import { supabase } from '@/lib/supabase';

const result = await buildPatternContext(supabase, 'non-existent-user-id');
console.assert(result !== null, 'Should return object, not null');
console.assert(result !== undefined, 'Should not be undefined');
const keys = ['attachment_style','repair_style','reassurance_need','space_preference',
              'stress_communication','interpretation_bias','vulnerability_pace','worth_pattern'];
keys.forEach(k => console.assert(result[k] === null, `${k} should be null`));
console.log('null-safety: PASS');
```

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual verification steps
- [ ] Wave 0: No framework installation needed (no automated tests)
- [ ] Sampling continuity: build check after each task
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter when all manual checks complete

**Approval:** pending
