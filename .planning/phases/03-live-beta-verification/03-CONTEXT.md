# Phase 3 Context — Live Beta Verification

## Intent
Phase 3 is not a build phase. It exists to verify the remaining risks that cannot be proven from repo state alone before Sparq is exposed to real beta users.

## Source Of Truth
- `SPARQ_MASTER_SPEC.md`

## Supporting Context
- `LAUNCH_CHECKLIST.md`
- `IMPLEMENTATION_STATUS.md`
- `.planning/phases/01-beta-stabilization/01-01-SUMMARY.md`
- `.planning/phases/01-beta-stabilization/01-02-SUMMARY.md`
- `.planning/phases/01-beta-stabilization/01-03-SUMMARY.md`
- `.planning/phases/02-beta-hardening/02-01-SUMMARY.md`
- `.planning/phases/02-beta-hardening/02-02-SUMMARY.md`
- `.planning/phases/02-beta-hardening/02-03-SUMMARY.md`

## Supported Beta Path
- `/signup`
- `/onboarding`
- `/dashboard`
- `/daily-growth`

## What This Phase Must Prove
1. The linked Supabase project actually matches the supported beta path.
2. The deployed environment really has the keys and runtime conditions Peter needs.
3. A solo user can complete the supported beta path live, not just in mocks and local tests.
4. Every live verification item leaves an operator-readable evidence trail.

## What This Phase Must Not Turn Into
- no feature expansion
- no broad refactors
- no architecture cleanup that is not required to complete a live check
- no partner-system expansion

## Recommended Evidence Types
- exact CLI command output
- screenshots from the live flow
- concise pass/fail notes per checklist item
- timestamps and environment target names where known
