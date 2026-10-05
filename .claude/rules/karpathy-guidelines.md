# Coding workflow: assumptions, simplicity, focus, verification

How to work on code in this repo. Adapted from the Karpathy-inspired guidelines
(github.com/multica-ai/andrej-karpathy-skills, MIT) for Sparq's own rules.

**Precedence:** `docs/CONSTITUTION.md` and `CLAUDE.md` win over this file. This
file refines CLAUDE.md → "How to Work Here" (items 2, 3, 5, 7); it does not
replace it. Branch, deployment, protected-file, skill-loading and approval rules
in CLAUDE.md and the session instructions are unchanged — follow them as written.
Enabled plugin skills (e.g. superpowers' test-driven development) don't override
the test-approval rule below.

Scale everything below to the task. A copy fix or one-line bug fix gets a
one-line restatement and a quick check, not a plan document.

## 1. Surface material assumptions before coding

- **Ask** only when the answer materially changes scope, user-visible behaviour,
  architecture, security or privacy, cost, or an irreversible action (live
  database writes, deletes, merges, deploys, anything sent to real users).
  These are what CLAUDE.md item 5 ("Flag ambiguity… Ask. Don't invent.") means.
- **For routine implementation choices** (naming, file placement, which
  existing helper to reuse, copy within an established voice), state the
  assumption in one line and proceed.
- If there are two readings of a request and they lead to different behaviour,
  name both and say which one you are taking, or ask if the difference is
  material.
- If a simpler approach than the one asked for exists, say so before building.

## 2. Choose the simplest implementation that meets the requirement

- No features, options or configurability beyond what was asked.
- No new abstraction for a single use. Reuse existing helpers, patterns and
  components first (`src/lib/`, `src/lib/server/`, `src/components/ui/`).
- No error handling for cases that can't happen; do handle the ones that can
  (missing env vars, failed network calls, RLS denials) the way nearby code does.
- If the result is much longer than the problem warrants, rewrite it shorter.

## 3. Keep changes focused on the requested task

- Every changed line should trace to the request. Match the surrounding style.
- Don't reformat, rename or refactor adjacent code that isn't part of the task.
- Remove imports, variables and files that *your* change made unused. Mention
  pre-existing dead code or unrelated bugs instead of fixing them in the same
  change (or suggest them as a separate task).
- Don't stage build artefacts that tools rewrite (e.g. `tsconfig.tsbuildinfo`).

## 4. Define success criteria, then verify

**Before substantial work** (new feature, multi-file change, schema change,
anything touching auth, privacy, payments or Peter's behaviour):
- Identify the code paths involved: pages, API routes, `src/lib/server/`
  modules, migrations, RLS policies.
- Write down concrete acceptance criteria — what a user or the database should
  observably do when it's done. For multi-step work, a short plan:
  `1. step → verify: check`.

**After implementing**, run the checks that fit the change:
- Always for code changes: `npx tsc --noEmit`, `npm run lint`, `npm test`.
- `npm run build` for changes to pages, config, dependencies or anything that
  affects bundling.
- `npm run eval:peter` (and the evals in `docs/evals/`) before any Peter prompt
  change — already required by CLAUDE.md.

**Tests follow CLAUDE.md's policy:** ask Chris before adding any new test to
`tests/` or `e2e/`. Verifying with existing tests, a throwaway script in the
scratchpad, or a browser run is fine without approval. Never write a test
just to satisfy this file.

**Verify behaviour, not just compilation.** A passing build doesn't show the
feature works.
- **UI changes:** look at the rendered page (Playwright with the
  pre-installed Chromium, phone width 390px, check for horizontal scroll) when
  tools allow. If you couldn't, say so.
- **State or database changes:** confirm the row was actually written or
  updated, the relevant transitions happen (e.g. status changes, counts, RLS
  allowing the owner and blocking others), and re-reading returns the new
  state. Read-only queries are fine for checking; writes to the live database
  follow the irreversible-action rule above.
- **Server/API changes:** call the route or exercise the path that uses it,
  including the unauthenticated or failure case when it matters.

**Review the diff before committing:** `git diff` for unrelated edits, leftover
debug code, and complexity the task didn't need.

## 5. Report honestly

- List only checks that actually ran, with their result.
- Name failures, blockers and anything left unverified (and why — e.g. no
  service-role key in the sandbox, no real phone for push).
- Don't describe a change as working when only the build passed.
