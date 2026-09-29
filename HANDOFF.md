# Sparq Connection — Session Handoff

**Last updated:** 2026-09-29 (end of a long refactor + priming session)
**Read this first in a new chat**, then `CLAUDE.md`, then `docs/CONSTITUTION.md`.

> This is a snapshot of *where the build is*, not a spec. Specs/principles live in `docs/CONSTITUTION.md` and `CLAUDE.md`; deeper history lives in `CURRENT_STATE.md`.

---

## 1. Where things stand (one paragraph)

The codebase was cleaned up and hardened, the whole app was moved onto the Warm Clay palette with WCAG-AA contrast, and a **transparent psychological-priming layer** was built: framework-aligned copy, a shared **Story Recipe**, stories in morning messages / daily primes / **all 13 journeys (244 stories)**, and warm people-free imagery. Fake testimonials and invented stats were removed. A new **product constitution** (`docs/CONSTITUTION.md`) was added and is the source of truth for everything it covers (see §6). Everything below was merged to `main` and is live on Vercel unless marked otherwise.

---

## 2. How to work in this repo (conventions that worked)

- **Branch:** `claude/eloquent-noether-j35laa`. After every merge, restart it from `origin/main` (`git fetch origin main && git checkout -B claude/eloquent-noether-j35laa origin/main`).
- **Every push to `main` deploys to production** (Vercel). Work in small slices → open a PR → wait for the Vercel check → merge. Chris has been approving each slice with "open it and merge then continue".
- **Verify before every push:** `npx tsc --noEmit && npm run lint && npm run build`. For the build without real env vars use placeholders: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x npm run build`.
- **Look at the real app** ("green build ≠ correct app"): `npx next start -p 3100`, then Playwright with the preinstalled Chromium at `executablePath: '/opt/pw-browsers/chromium'` (do not run `playwright install`). Logged-in pages redirect to `/login` — there is **no test account** in the cloud environment.
- **Gotchas:** `git checkout -- tsconfig.tsbuildinfo` after builds (it's tracked and churns). Use scoped `git add <files>`, never `git add -A` at the root (sweeps in `.claude/` junk). Kill stale Next servers by PID (`ps -eo pid,args | grep next-`), not `pkill -f` (it can kill your own shell).
- **No OpenRouter/OpenAI keys in the cloud env** → AI outputs (morning stories, Peter chat) can't be sampled live; check them on the Vercel preview.
- **Canva images:** `generate-image` only returns 200px thumbnails. Full-size = place media into a Canva design page (`update_fill` on the page background) and `export-design` as JPG. The design **"Warm linen photo container"** in Chris's Canva holds all generated images (safe to delete; files are already in `public/images/`).

---

## 3. What was done today (merged PRs, in order)

| PR | What |
|---|---|
| #8 | Cleanup & reliability: fixed `/quiz` + `/partner-profile` crashing (imported an unwired auth context); fixed leaked auth listener in `auth-context.tsx`; app-wide Peter `ErrorBoundary`; removed ~80 dead files, legacy Supabase shim, `/test-page` |
| #9 | Removed `/ai-therapist` page + `aiTherapist` flag (beta scope: no therapist features) |
| #10, #11 | Replaced all hardcoded violet hexes and Tailwind purple/indigo/violet classes with Warm Clay tokens |
| #12 | Priming copy pass (no hidden commands; clinical labels → plain language; pull-style CTAs; Peter loading) + **Story Recipe** in the language framework + morning-story prompt with a **rotating 14-couple cast** + rewritten fallback stories |
| #13 | Story-first daily primes; journey `story` field + Communication pilot; removed an invented "research shows…" claim from every journey lesson |
| #14, #15 | People-free imagery: 4 journey images replaced (Canva, golden-hour metaphors); 9 new date-idea images; Unsplash hotlinks removed |
| #16, #17, #19 | Stories for all remaining journeys (Conflict Resolution, Love Languages, EI, Intimacy, Trust Rebuilding, Values, Renewal, Attachment, Power Dynamics, 3 sexuality journeys) |
| #20 | Removed all made-up testimonials and invented social-proof stats (no real users exist) |
| #21 | Warm shadows (violet-tinted `rgba(42,34,52)` → espresso); skill palettes synced to config; honest contrast numbers |
| #22 | **A11y:** small clay text → `text-brand-hover` (#A85539, 4.6:1) |
| #23 | **A11y:** white text on clay buttons is bold ≥14px; `Button` filled variants bold, `link` variant darker |
| #24 | Renamed "Attachment Healing" → **"Feeling Safe Together"** (route `/journeys/attachment-healing` unchanged) |
| #25 | Missing Supabase env no longer 500s every page (placeholder host + `isSupabaseConfigured`) |
| #26 | `docs/CONSTITUTION.md` (verbatim product constitution) + pointer in `CLAUDE.md` + this handoff |

---

## 4. Key systems & where they live

**Priming / content layer**
- **Story Recipe** (start mid-moment → one sensory detail → familiar reaction → inner turn → small honest result → bridge question): `.claude/skills/sparq-psychology/references/language-framework.md`
- **Morning stories:** `getMorningStoryPrompt` in `src/lib/peterService.ts` (`STORY_CAST`, 14 couples with pronouns) — used by `api/peter/morning.ts` and `api/daily/session/start.ts`. Output contract: plain text ending with a `Today's Action:` line. Fallbacks: `src/data/fallbackStories.json`.
- **Daily primes:** `src/data/micro-primes.ts` (`story` field) rendered by `DailyPrimeCard.tsx`.
- **Journeys:** each concept in `src/pages/journeys/*.tsx` has `story` (shown instead of `example` via `JourneyContentView.tsx`). Trust Rebuilding uses its own couple (Elena & Marco) so betrayal never touches the main cast. Sexuality journeys are non-explicit by design.
- **Future-self card:** `src/data/persuasiveContent.ts` (`futurePacingTimeframes`, each vision ends with a `reflection` question) → `FuturePacing.tsx`.
- Recurring cast names: Maya/Dev, Rosa/Ben, Jordan(they)/Priya, Sam/Theo, Leah/Marcus, Aiko/Daniel, Nia/Omar, Grace/Luis, Ellie/Jo, Kofi/Anna, Hannah/Raj, Mateo/Clara, Zoe/Isaac, Wei/Sophie.

**Design**
- Tokens: `tailwind.config.ts` (Warm Clay: primary `#C56B4D`, hover `#A85539`, linen `#F5F1EA`, parchment `#EFE7DC`, espresso `#2E2620`, sage `#9CB5A0`, gold `#D9A441`).
- **Contrast rule:** clay text only at `text-2xl`+ / `text-xl` bold / icons; small clay text uses `text-brand-hover`; white on clay is always bold ≥14px.
- **Imagery rule:** warm metaphor images, never people (hands-only OK). `public/images/journeys/`, `public/images/dates/`.

**Reliability**
- One auth context: `src/lib/auth-context.tsx`. `ErrorBoundary` in `_app.tsx`. `src/lib/supabase.ts` survives missing env.

---

## 5. Decisions Chris made today

- Priming uses the **transparent toolkit** (stories, sensory detail, presupposition, identity language, future-self imagery) — **no hidden embedded commands**.
- Imagery: **metaphors, no people**; hands-only images are OK.
- Contrast: **option 2** (clay for fills/large text; darker clay for small text) + **bold button text**.
- Journey rename: **"Feeling Safe Together"** (name chosen by Claude; easy to change).
- Remove all fake testimonials/stats.
- Adopt `docs/CONSTITUTION.md` into the repo.

---

## 6. Constitution decisions (Chris, 2026-09-29)

1. **Precedence** — `docs/CONSTITUTION.md` is the source of truth for everything it covers; the Master PRD, `CLAUDE.md` and specs fill the gaps. (`CURRENT_STATE.md` hierarchy updated.)
2. **Tests** — allowed, but **ask Chris before adding each test**.
3. **Quiet assessment** — no conflict: learning quietly through daily content is fine; anything surfaced is a correctable hypothesis, never a label. (Clarifying line added to the `sparq-psychology` skill.)

No open product decisions right now.

---

## 7. What still needs to be done

**Recommended next (from the constitution review):**
1. **Constitution audit** (its §14 step 1): map every section to keep / adapt / replace / missing. Already exists: trait confidence + revision (`profile-analysis.ts`), North Star, growth engine + trust bar, Day-14 Compound Reveal, CSI-4, weekly mirror, partner synthesis (blended, no attribution), encrypted reflections, forgiving streak, `/help-now` safety routing, `if_then_checkins`.
2. **Peter conversation engine** (prompt-only, low risk): add Listen / Explore / Reflect / Challenge / Act / Celebrate / Safety modes, "smallest useful action", the distance rule ("don't steal the realization"), hypothesis-only wording, "sometimes remember instead of coaching" → `PETER_SHARED_RULES` in `src/lib/peterService.ts`.
3. **Memory discipline:** every evening chat is currently stored via `addMemory` in `src/lib/server/profile-analysis.ts`; gate it so only meaningful items (discoveries, intentions, facts, growth evidence) are stored.
4. **Bigger constitution gaps:** self-discoveries as first-class records; user-created experiments with outcomes; one authoritative Person Model; Relationship Model + interaction cycles; Shared Peter with data-level private/shared boundaries; Meaningful Discovery Rate metric.

**Other open items:**
- **Logged-in walkthrough** of the live site (signup → onboarding → dashboard → daily loop → journeys) — nothing since the auth fix has been verified logged in.
- **Read 2–3 live morning stories** on production to confirm Haiku follows the Story Recipe well.
- **Dark theme** in `globals.css` is still the old violet (dormant; re-derive from Warm Clay before enabling dark mode).
- **`src/content/journeys/attachment-healing.md`** still says "Attachment Healing" — unused by the app (content is fetched from `public/Path to Together/`).
- **Delete the Canva design** "Warm linen photo container" (optional cleanup).
- `CURRENT_STATE.md` predates today's work; this file supersedes its §7 for current status.

---

## 8. Environment facts

- Supabase project `ujqdnyxdenadpowxrkjn` — **free tier, auto-pauses after ~7 days idle** (backend vanishes while the frontend still serves). **No real users** (102 dev/test accounts).
- Vercel builds every push to `main` to production. The Vercel MCP connector was not authorized this session (no deploy logs available).
- AI: OpenRouter → Claude Haiku 4.5 for Peter (do not change); OpenAI for embeddings.
