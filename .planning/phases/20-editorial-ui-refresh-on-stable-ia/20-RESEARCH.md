# Phase 20: Editorial UI Refresh on Stable IA - Research

**Researched:** 2026-04-05
**Domain:** Frontend editorial refresh on a locked Next.js Pages Router IA
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Stable Surface Scope
- **D-01:** The editorial refresh applies to the stable primary destinations and their supporting stable surfaces:
  - `dashboard`
  - `daily-growth`
  - `journeys`
  - `connect`
  - `journal`
  - bottom navigation
  - the current playful MVP cards on their existing surfaces
- **D-02:** Secondary-access pages (`profile`, `settings`, `subscription`, `trust-center`) are not part of the main editorial pass. They may receive only the minimum cohesion polish needed so they do not feel visually broken next to the refreshed primary destinations.

### Home Hierarchy
- **D-03:** Home must remain focused and magnetic, with one dominant Today hero as the strongest visual and behavioral anchor.
- **D-04:** `Daily Spark` stays clearly secondary to the Today hero and must not compete with the main launch action.
- **D-05:** The destination strip should become a quiet but premium editorial wayfinding rail rather than a louder second stack of equal-weight cards.
- **D-06:** The refresh must reduce the current utilitarian dashboard feel without turning Home back into a browse-heavy multi-purpose surface.

### Destination Personality
- **D-07:** The four primary destinations should share one cohesive system while each carries a distinct mood:
  - `Home`: focused and magnetic
  - `Journeys`: clear, structured, and progress-oriented
  - `Connect`: curated, warm, and intentional rather than a tool dump
  - `Journal`: private, quiet, and reflective rather than another dashboard
- **D-08:** Destination personality must come from hierarchy, spacing, composition, color allocation, and card treatment, not from inventing new navigation branches or feature modules.
- **D-09:** `Journeys` should feel clearly different from Home by emphasizing active practice and progress clarity rather than duplicating Home's single-next-step launch role.

### Visual Consistency
- **D-10:** Visual consistency across all four primary destinations is a top-level requirement for the phase.
- **D-11:** The editorial system should make the app feel calmer, more premium, and more relationship-life oriented while still staying emotionally safe and easy to read.
- **D-12:** The refresh should improve hierarchy, spacing, and card treatment first; it should not depend on new content systems or new product capabilities.

### Scope Guardrails
- **D-13:** The completed Phase 19 IA is the locked structure for this phase.
- **D-14:** This phase does not add new tabs, new features, `date ideas`, games expansion, rituals expansion, onboarding changes, or daily-growth logic changes.
- **D-15:** This phase does not reopen navigation, destination ownership, or the Home-owned daily launch path.

### Claude's Discretion
- Exact token values, CSS variable rollout order, and component-by-component implementation sequence
- Exact card compositions within each destination, as long as they reinforce the locked hierarchy above
- Exact motion, texture, and illustration rhythm, as long as the result stays calm and does not overpower the primary CTA surfaces
- Exact level of light cohesion polish on secondary-access pages

### Deferred Ideas (OUT OF SCOPE)
- New tabs or destination changes - explicitly out of scope because IA is locked in Phase 19
- New product features - separate future work
- `date ideas` - still deferred beyond this phase
- Games expansion - separate future product work
- Rituals expansion - separate future product work
- Onboarding changes - explicitly out of scope
- Daily-growth logic changes - explicitly out of scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-EDITORIAL-01 | Define a premium relationship-life visual contract grounded in warm ivory surfaces, violet accents, rounded cards, expressive serif type, and magazine-like hierarchy. | Token-first rollout, typography guidance, page hierarchy rules, and reusable editorial primitives below. |
| UI-EDITORIAL-02 | Limit the refresh to safe existing surfaces: dashboard, daily-growth home, bottom nav, editorial content cards, and playful MVP surfaces. | Scope map, file touch list, route-protection risks, and verification plan all preserve existing IA and feature ownership. |
| UI-EDITORIAL-03 | Make the refresh buildable and safe inside the current codebase without routing or architecture changes. | Current stack recommendation uses existing Next Pages Router, Tailwind, next/font, Framer Motion, and Playwright coverage only. |
| IA-WAVE1-03 | Preserve `Home`, `Journeys`, `Connect`, `Journal` navigation ownership and keep `/daily-growth` Home-owned. | Existing nav ownership files/tests are treated as regression gates and must remain green through the phase. |
</phase_requirements>

## Summary

Phase 20 should be planned as a presentation-system rollout on top of the already verified Phase 19 IA, not as a page-by-page beautification pass. The codebase already has the correct route ownership and Home shape, but the actual implementation still carries a partially older lavender-heavy token layer in [tailwind.config.ts](/Users/chris/sparq-connection-lab/tailwind.config.ts) and [globals.css](/Users/chris/sparq-connection-lab/src/styles/globals.css), plus many hard-coded violet hex values across the stable destinations. That means the safest implementation order is foundation first, then surface-by-surface refinement.

The most important planning fact is that the current primary surfaces are already structurally correct and behaviorally covered by Playwright. The phase should therefore concentrate on token alignment, hierarchy, spacing, and surface treatment while treating navigation ownership, the `Home -> daily-growth` path, playful placement, and destination jobs as locked regression boundaries. Home is the highest-risk page because it is easy to accidentally make the destination strip or `Daily Spark` visually equal to the Today hero.

The repo is also opinionated enough that this should not introduce a new design system or new frontend architecture. Use the current Next.js Pages Router, page-local composition, Tailwind classes, `next/font`, and light Framer Motion. If shared presentation primitives are added, keep them few and presentational-only.

**Primary recommendation:** Plan Phase 20 as 4 waves: editorial foundations, Home/daily-growth/nav refinement, destination-page refinement, then cohesion polish plus visual and route-behavior verification.

## Project Constraints (from CLAUDE.md)

- Use the existing Next.js Pages Router. Do not propose or require App Router migration.
- Use Supabase, shadcn-style components, Tailwind CSS, and Framer Motion only. Do not introduce a new UI library.
- Do not add new feature scope, new journeys, onboarding redesign, or backend architecture changes as part of this phase.
- Preserve Sparq's emotional target: warm, intelligent, emotionally safe, intimate, never B2B dashboard-like.
- Peter is an emotional anchor, not decoration. Do not reduce Peter to a static icon or generic loading spinner.
- Prefer `PeterLoading` for loading states when touched surfaces need a loading UI.
- User-facing copy must stay warm, simple, non-clinical, and solo-safe.
- No new automated test infrastructure should be added unless explicitly asked. Use the existing Playwright setup.
- Keep changes small, explicit, and within the locked phase boundary.

## Likely Plan Breakdown

### Wave 1: Editorial Foundations
- Align the live token layer with the approved editorial direction in [17-UI-SPEC.md](/Users/chris/sparq-connection-lab/.planning/phases/17-editorial-relationship-life-ui-refresh/17-UI-SPEC.md).
- Update shared brand colors, serif usage, spacing, nav well styling, and texture treatment in [tailwind.config.ts](/Users/chris/sparq-connection-lab/tailwind.config.ts), [globals.css](/Users/chris/sparq-connection-lab/src/styles/globals.css), and possibly [src/pages/_app.tsx](/Users/chris/sparq-connection-lab/src/pages/_app.tsx).
- Remove hard-coded `#EDE9FE`, `#5B4A86`, and `#2E1065` usage from the stable primary surfaces first, or wrap them behind shared semantic classes.
- If shared primitives are needed, add a small `src/components/editorial/` layer for hero headers and quiet/featured surface shells only.

### Wave 2: Home, Daily-Growth Home, And Bottom Nav
- Refine [dashboard.tsx](/Users/chris/sparq-connection-lab/src/pages/dashboard.tsx), [HomeDestinationStrip.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/HomeDestinationStrip.tsx), [PeterGreeting.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/PeterGreeting.tsx), [DailySparkCard.tsx](/Users/chris/sparq-connection-lab/src/components/playful/DailySparkCard.tsx), and [bottom-nav.tsx](/Users/chris/sparq-connection-lab/src/components/bottom-nav.tsx).
- Refine the `daily-growth` home state only, especially the Today card, supportive reminder card, `FavoriteUsCard`, and reflection preview.
- Preserve CTA ordering, target routes, and playful placement exactly.

### Wave 3: Destination Personality Pass
- Refine [connect.tsx](/Users/chris/sparq-connection-lab/src/pages/connect.tsx) for curated warmth.
- Refine [journal.tsx](/Users/chris/sparq-connection-lab/src/pages/journal.tsx), [WeeklyMirrorCard.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/WeeklyMirrorCard.tsx), [IdentityArcCard.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/IdentityArcCard.tsx), and [GrowthThread.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/GrowthThread.tsx) for privacy and quietness.
- Refine [journeys.tsx](/Users/chris/sparq-connection-lab/src/pages/journeys.tsx) so the active-practice summary, search/filter controls, and grid feel structured and progress-oriented instead of like a utility catalog.

### Wave 4: Cohesion Polish And Verification
- Apply minimum cohesion polish to `/profile`, `/settings`, `/subscription`, and `/trust-center` only where the refreshed primary surfaces make them feel broken.
- Run focused Playwright route-ownership and playful-placement regressions.
- Run a manual screenshot-based editorial review across the five stable primary destinations.

## Reusable Components / Tokens / Styles To Touch

### Global Foundation

| File | Why It Matters | Planning Note |
|------|----------------|---------------|
| [tailwind.config.ts](/Users/chris/sparq-connection-lab/tailwind.config.ts) | Canonical brand colors, font family extension, animations | Primary rollout point for color and font token alignment. Do not migrate to Tailwind v4 as part of this phase. |
| [globals.css](/Users/chris/sparq-connection-lab/src/styles/globals.css) | CSS variables, dark overrides, texture utility, base background | Current values still encode the older lavender-heavy system; this is the largest foundation mismatch. |
| [src/pages/_app.tsx](/Users/chris/sparq-connection-lab/src/pages/_app.tsx) | Global font loading and app shell styling | One place to update serif/body font strategy and shell-level background treatment. |

### Shared Surface Primitives

| File | Why It Matters | Planning Note |
|------|----------------|---------------|
| [src/components/bottom-nav.tsx](/Users/chris/sparq-connection-lab/src/components/bottom-nav.tsx) | Stable nav ownership plus visual shell | Behavior is locked. Styling can change, path mapping cannot. |
| [src/components/dashboard/PeterGreeting.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/PeterGreeting.tsx) | Sets Home tone immediately | Good place to deepen editorial warmth without creating a heavy card wrapper. |
| `src/components/editorial/*` | Optional new presentation-only helpers | Add only if repeated hero/surface patterns are causing drift. Keep this small. |

### Home And Daily Surfaces

| File | Why It Matters | Planning Note |
|------|----------------|---------------|
| [src/pages/dashboard.tsx](/Users/chris/sparq-connection-lab/src/pages/dashboard.tsx) | Home hero hierarchy and CTA dominance | Highest-risk page; do not flatten the Today hero. |
| [src/components/dashboard/HomeDestinationStrip.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/HomeDestinationStrip.tsx) | Quiet wayfinding rail | Must become more premium while staying quieter than the hero. |
| [src/pages/daily-growth.tsx](/Users/chris/sparq-connection-lab/src/pages/daily-growth.tsx) | `daily-growth` home, morning, evening, completion states | Only the home state is in scope for editorial emphasis; flow logic is not. |
| [src/components/playful/DailySparkCard.tsx](/Users/chris/sparq-connection-lab/src/components/playful/DailySparkCard.tsx) | Home playful card | Styling must remain clearly secondary. |
| [src/components/playful/FavoriteUsCard.tsx](/Users/chris/sparq-connection-lab/src/components/playful/FavoriteUsCard.tsx) | `daily-growth` playful card | Should read as a warm side note, not a task. |

### Destination Pages

| File | Why It Matters | Planning Note |
|------|----------------|---------------|
| [src/pages/connect.tsx](/Users/chris/sparq-connection-lab/src/pages/connect.tsx) | Curated tool landing | Keep four-row ownership unchanged. Improve curation and warmth through hierarchy only. |
| [src/pages/journal.tsx](/Users/chris/sparq-connection-lab/src/pages/journal.tsx) | Reflective landing | Mood should feel quieter and more private than Connect and Journeys. |
| [src/components/dashboard/WeeklyMirrorCard.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/WeeklyMirrorCard.tsx) | Journal narrative surface | Strong candidate for featured editorial card treatment. |
| [src/components/dashboard/IdentityArcCard.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/IdentityArcCard.tsx) | Journal identity-progress surface | Needs clearer premium hierarchy, not more interaction complexity. |
| [src/components/dashboard/GrowthThread.tsx](/Users/chris/sparq-connection-lab/src/components/dashboard/GrowthThread.tsx) | Journal list surface | Needs quiet list styling and consistent expansion rhythm. |
| [src/pages/journeys.tsx](/Users/chris/sparq-connection-lab/src/pages/journeys.tsx) | Active-practice summary plus dense browse UI | Needs the strongest structure work after Home because search, pills, and cards currently skew utilitarian. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `13.5.7` | Existing app shell via Pages Router | Locked project architecture; all current surfaces already live here. |
| `react` | `18.2.0` | UI rendering | Current repo baseline; no upgrade needed for this phase. |
| `tailwindcss` | `3.3.3` | Utility styling and token rollout | Already drives the entire surface system. |
| `framer-motion` | `10.16.4` | Entrance and transition polish | Already used across destination pages and daily-flow states. |
| `lucide-react` | `0.482.0` | Iconography | Already established in nav and destination rows. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/font/google` | bundled with `next@13.5.7` | Global serif/sans loading | Use for any font change approved in this phase. |
| repo-local shadcn/Radix wrappers | repo-local | Base card/button/surface composition | Use existing wrappers; do not replace the UI foundation. |
| `@playwright/test` | `1.58.2` | Route and UI regression coverage | Use for IA, playful-placement, and navigation protection. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind token cleanup in the current stack | Tailwind v4 `@theme` migration | Too wide for this phase; changes build conventions for no Phase 20 gain. |
| `next/font` in `_app.tsx` | Manual font CSS imports | Worse privacy/performance and inconsistent with current Next.js best practice. |
| Existing shadcn/Tailwind surfaces | New UI/component library | Reopens foundation decisions and widens risk. |
| Playwright + manual screenshot review | New visual snapshot framework | Too much infra for a locked-scope editorial pass. |

**Installation:**
```bash
# No new packages are required for Phase 20.
# Keep the current repo stack unless a separate upgrade phase is approved.
```

**Version verification:** Current repo versions were verified in `package.json`, and current registry releases were checked on 2026-04-05 with `npm view`.

| Package | Repo Version | Repo Version Published | Latest Registry Version | Latest Published | Recommendation |
|---------|--------------|------------------------|-------------------------|------------------|----------------|
| `next` | `13.5.7` | 2024-09-17 | `16.2.2` | 2026-04-01 | Stay on repo version for this phase. |
| `react` | `18.2.0` | 2022-06-14 | `19.2.4` | 2026-01-26 | Stay on repo version for this phase. |
| `tailwindcss` | `3.3.3` | 2023-07-13 | `4.2.2` | 2026-03-18 | Stay on repo version for this phase. |
| `framer-motion` | `10.16.4` | 2023-09-05 | `12.38.0` | 2026-03-17 | Stay on repo version for this phase. |
| `lucide-react` | `0.482.0` | 2025-03-14 | `1.7.0` | 2026-03-25 | Stay on repo version for this phase. |
| `@playwright/test` | `1.58.2` | 2026-02-06 | `1.59.1` | 2026-04-01 | Stay on repo version for this phase. |

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── pages/                    # Route composition stays page-local
├── components/
│   ├── dashboard/            # Home and journal-owned modules
│   ├── playful/              # Daily Spark / Favorite Us stay on current surfaces
│   └── editorial/            # Optional: small presentation-only primitives
└── styles/
    └── globals.css           # CSS variables, texture, shell-level rules
```

### Pattern 1: Token-First Editorial Rollout
**What:** Update shared colors, serif usage, spacing rhythm, and nav/surface treatments before restyling individual pages.
**When to use:** Always do this first because the stable surfaces currently mix brand tokens with hard-coded lavender values.
**Example:**
```tsx
import { Inter, Lora } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${lora.variable} font-sans`}>{children}</div>;
}
```
// Source: https://nextjs.org/docs/pages/getting-started/fonts

### Pattern 2: One Featured Module, Multiple Quiet Modules
**What:** Each destination gets one clearly featured module and quieter supporting cards beneath it.
**When to use:** On `dashboard`, `connect`, `journal`, `journeys`, and the `daily-growth` home state.
**Example:**
```tsx
<section className="space-y-5">
  <div className="rounded-3xl bg-brand-primary p-6 text-white">{/* featured */}</div>
  <div className="rounded-3xl bg-brand-parchment p-5">{/* quiet support */}</div>
  <div className="rounded-3xl bg-brand-parchment p-5">{/* quiet support */}</div>
</section>
```
// Source: repo pattern derived from `src/pages/dashboard.tsx` and `src/pages/journal.tsx`

### Pattern 3: Destination Personality Through Composition, Not New Features
**What:** Reuse the same base editorial system but change prominence, density, and emphasis by destination.
**When to use:** Across `Home`, `Journeys`, `Connect`, and `Journal`.
**Example:**
```text
Home      -> strongest single hero, quiet rail, playful card below
Journeys  -> summary first, utility controls second, grid third
Connect   -> editorial intro, then four curated rows
Journal   -> quieter hero, reflective modules, slower list rhythm
```

### Anti-Patterns to Avoid
- **Page-by-page hex edits:** This locks the older palette drift in place and makes later consistency impossible.
- **Equal-weight cards everywhere:** This reintroduces dashboard energy and erases destination personality.
- **New routing or shell abstractions:** Pages Router and route ownership are locked for this phase.
- **Playful cards as bright feature cards:** `Daily Spark` and `Favorite Us` must remain additive companions.
- **Broad reusable-component overbuild:** Add only the few presentational primitives that reduce repetition across the touched surfaces.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Global font loading | Manual `@import` font CSS | `next/font/google` or `next/font/local` | Better privacy, no external runtime request, global Pages Router pattern already supported by Next.js. |
| Motion orchestration | New animation framework | Existing Framer Motion + current page transitions | The repo already uses it and the phase only needs subtle entrance/exit polish. |
| New component system | Fresh card/nav library | Existing Tailwind + repo-local shadcn/Radix wrappers | Avoids widening scope and keeps visual work composable. |
| Visual regression platform | Snapshot-diff infrastructure | Focused Playwright assertions plus operator screenshots | Faster to add, lower maintenance, enough for a locked IA restyle. |
| Nav ownership logic | New destination router layer | Existing [bottom-nav.tsx](/Users/chris/sparq-connection-lab/src/components/bottom-nav.tsx) mapping plus tests | Route ownership is already correct and verified. |

**Key insight:** This phase is risky because it feels cosmetic but touches shared tokens and route shells. Reuse the current stack aggressively and spend complexity budget on hierarchy and consistency, not on infrastructure.

## Common Pitfalls

### Pitfall 1: Token Drift From Hard-Coded Violet Values
**What goes wrong:** Some refreshed screens look warm and premium while others still render the older lavender system.
**Why it happens:** The primary surfaces mix semantic classes with direct hex values like `#EDE9FE`, `#5B4A86`, and `#2E1065`.
**How to avoid:** Replace or centralize hard-coded stable-surface colors before doing page polish.
**Warning signs:** Connect, Journal, or Journeys still look like a different product after Home is restyled.

### Pitfall 2: Home Hero Loses Dominance
**What goes wrong:** `Daily Spark` or the destination strip becomes visually equal to the main Today card.
**Why it happens:** Designers often improve supporting cards by increasing tint, shadow, or icon weight until they compete with the hero.
**How to avoid:** Keep one featured surface only on Home and review it above the fold on mobile.
**Warning signs:** The eye no longer lands on the Today CTA first on `/dashboard`.

### Pitfall 3: Destination Sameness
**What goes wrong:** `Connect`, `Journal`, and `Journeys` all become the same card stack with different labels.
**Why it happens:** Shared primitives are reused without changing density, emphasis, and rhythm per destination.
**How to avoid:** Define a mood rule for each page before editing components.
**Warning signs:** Screens feel interchangeable in grayscale or in quick screenshot review.

### Pitfall 4: Route-Behavior Regression Hidden By Cosmetic Scope
**What goes wrong:** A visual edit quietly breaks nav ownership, leaf return routes, or the Home-owned daily path.
**Why it happens:** Shared headers, nav shells, and CTA wrappers get restyled without re-running the IA regression specs.
**How to avoid:** Treat Phase 19 Playwright specs as must-pass gates for every wave.
**Warning signs:** `aria-current` moves to the wrong tab, `/daily-growth` no longer highlights Home, or Connect leaves stop returning to `/connect`.

### Pitfall 5: Off-Brand Loading Or Empty States
**What goes wrong:** Primary destinations feel editorial, then fallback to generic spinners or flat skeletons.
**Why it happens:** Existing touched paths still contain non-editorial loading/fallback UI, especially around `ProtectedRoute`.
**How to avoid:** If a touched page exposes a loading or empty state, bring it into minimum visual compliance in the same wave.
**Warning signs:** Users see "Loading..." and a spinner immediately before a premium-looking destination page.

### Pitfall 6: Mobile Reflow After Typography Or Spacing Changes
**What goes wrong:** Serif headlines wrap badly, buttons fall below the fold, or the bottom nav overlaps content.
**Why it happens:** `_app.tsx` font changes and larger spacing tokens affect every touched screen.
**How to avoid:** Review the five stable primary surfaces on a narrow mobile viewport before considering a wave done.
**Warning signs:** Home hero CTA or Connect rows require scrolling before the first meaningful action is visible.

## Code Examples

Verified patterns from official sources:

### Global Font Loading In Pages Router
```tsx
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { AppProps } from "next/app";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${display.variable} ${sans.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  );
}
```
// Source: https://nextjs.org/docs/pages/getting-started/fonts

### Exit Animation For Swapping Or Phase Changes
```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait">
  {show && (
    <motion.section
      key="hero"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    />
  )}
</AnimatePresence>
```
// Source: https://motion.dev/docs/react-animate-presence

### Focused Route Assertions In Playwright
```ts
import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("keeps Home-owned daily path", async ({ page }) => {
    await page.getByRole("button", { name: /resume evening reflection/i }).click();
    await expect(page).toHaveURL(/\/daily-growth/);
  });
});
```
// Source: https://playwright.dev/docs/writing-tests

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Overloaded Home/dashboard feed | Locked single-next-step Home with quiet destination rail | Phase 19, verified 2026-04-05 | Phase 20 must style this structure, not re-open it. |
| Ad hoc lavender-heavy token usage | Approved editorial contract with warm ivory surfaces and controlled violet accent | Phase 17 contract, 2026-03-31 | Phase 20 should reconcile the live token layer with the approved direction. |
| Hard utility bottom nav | Floating cushioned destination-owned nav well | Phase 19 implementation | Visual refinement should deepen the premium feel without altering ownership behavior. |
| Feature-by-feature restyling temptation | Token-first, surface-safe rollout | Required for Phase 20 planning | Lowers regression risk and reduces mixed-theme output. |

**Deprecated/outdated:**
- Widespread hard-coded stable-surface hex values: outdated relative to the approved editorial contract and should be normalized during the phase.
- Broad dashboard aesthetics on primary destinations: outdated after Phase 19 because destination ownership is now stable.

## Open Questions

1. **Font decision for editorial display moments**
   - What we know: [src/pages/_app.tsx](/Users/chris/sparq-connection-lab/src/pages/_app.tsx) already loads `Inter` and `Lora`, and Next.js supports global font application in `pages/_app`.
   - What's unclear: Whether `Lora` is "good enough" as the approved editorial serif equivalent or whether the phase should switch to `Cormorant Garamond` or a similar face now.
   - Recommendation: Decide this in Wave 1 before page polish. Do not switch fonts mid-phase.

2. **How far token cleanup should go outside the primary surfaces**
   - What we know: Shared brand tokens affect more than the five stable destinations, and some secondary pages still use the older visual layer.
   - What's unclear: Whether changing shared tokens alone will make secondary pages look broken enough to require extra polish.
   - Recommendation: Plan primary-surface token rollout first, then reserve a small Wave 4 budget for minimum secondary cohesion fixes only.

3. **Whether `ProtectedRoute` loading polish belongs in scope**
   - What we know: [ProtectedRoute.tsx](/Users/chris/sparq-connection-lab/src/components/ProtectedRoute.tsx) still shows a generic spinner and "Loading..." copy, which conflicts with project guidance.
   - What's unclear: Whether users are likely to see this on the touched stable surfaces often enough for it to be a Phase 20 concern.
   - Recommendation: Include it only if touched destinations expose it during normal navigation or test runs.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright `1.58.2` |
| Config file | `playwright.config.ts` |
| Quick run command | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-EDITORIAL-01 | Primary destinations feel editorial, warm, hierarchical, and distinct without losing readability | manual visual + screenshot review | Manual operator pass on `/dashboard`, `/daily-growth`, `/connect`, `/journal`, `/journeys` | ❌ Wave 0 |
| UI-EDITORIAL-02 | Refresh stays on safe surfaces and preserves playful placement, daily path, and nav ownership | e2e | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` | ✅ |
| UI-EDITORIAL-03 | Token/type/spacing rollout remains buildable in the current stack without routing change | lint + typecheck + e2e smoke | `npx tsc --noEmit && npm run lint -- --file src/pages/dashboard.tsx --file src/pages/daily-growth.tsx --file src/pages/connect.tsx --file src/pages/journal.tsx --file src/pages/journeys.tsx --file src/components/bottom-nav.tsx --file src/components/dashboard/HomeDestinationStrip.tsx` | ✅ |
| IA-WAVE1-03 | `/daily-growth` stays Home-owned and `Connect`/`Journal` ownership stays correct | e2e | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/19-connect-journal-ia.spec.ts --project=chromium --no-deps --workers=1` | ✅ |

### Sampling Rate
- **Per task commit:** run the quick Playwright command plus targeted lint on touched files.
- **Per wave merge:** run `npx tsc --noEmit` and the quick Playwright command.
- **Phase gate:** run the quick Playwright command, then complete manual screenshot review of the five stable primary destinations before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `e2e/tests/20-editorial-ui-refresh.spec.ts` - dedicated editorial regression coverage for stable primary surfaces and visible hierarchy markers.
- [ ] Operator screenshot checklist artifact - one screenshot and one short editorial pass/fail note per stable primary destination.
- [ ] Manual checklist for Home hero dominance, destination mood separation, playful subordination, and bottom-nav quietness.

## Sources

### Primary (HIGH confidence)
- Local phase context and design contract:
  - [20-CONTEXT.md](/Users/chris/sparq-connection-lab/.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-CONTEXT.md)
  - [17-UI-SPEC.md](/Users/chris/sparq-connection-lab/.planning/phases/17-editorial-relationship-life-ui-refresh/17-UI-SPEC.md)
  - [19-VERIFICATION.md](/Users/chris/sparq-connection-lab/.planning/phases/19-implement-ia-wave-1-home-simplification-and-navigation-restructure/19-VERIFICATION.md)
- Local implementation and testing artifacts:
  - [package.json](/Users/chris/sparq-connection-lab/package.json)
  - [tailwind.config.ts](/Users/chris/sparq-connection-lab/tailwind.config.ts)
  - [globals.css](/Users/chris/sparq-connection-lab/src/styles/globals.css)
  - [dashboard.tsx](/Users/chris/sparq-connection-lab/src/pages/dashboard.tsx)
  - [daily-growth.tsx](/Users/chris/sparq-connection-lab/src/pages/daily-growth.tsx)
  - [connect.tsx](/Users/chris/sparq-connection-lab/src/pages/connect.tsx)
  - [journal.tsx](/Users/chris/sparq-connection-lab/src/pages/journal.tsx)
  - [journeys.tsx](/Users/chris/sparq-connection-lab/src/pages/journeys.tsx)
  - [bottom-nav.tsx](/Users/chris/sparq-connection-lab/src/components/bottom-nav.tsx)
  - [05-dashboard.spec.ts](/Users/chris/sparq-connection-lab/e2e/tests/05-dashboard.spec.ts)
  - [14-playful-connection.spec.ts](/Users/chris/sparq-connection-lab/e2e/tests/14-playful-connection.spec.ts)
  - [19-connect-journal-ia.spec.ts](/Users/chris/sparq-connection-lab/e2e/tests/19-connect-journal-ia.spec.ts)
- Official docs:
  - https://nextjs.org/docs/pages - confirmed Pages Router remains documented and current.
  - https://nextjs.org/docs/pages/getting-started/fonts - confirmed `next/font` global usage for `pages/_app`.
  - https://playwright.dev/docs/writing-tests - confirmed role-based locators, hooks, isolation, and assertions.
  - https://motion.dev/docs/react-animate-presence - confirmed `AnimatePresence` pattern for exit transitions.

### Secondary (MEDIUM confidence)
- `npm view` registry checks run locally on 2026-04-05 for `next`, `react`, `tailwindcss`, `framer-motion`, `lucide-react`, and `@playwright/test`.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from local repo files and live npm registry metadata.
- Architecture: HIGH - phase boundary, live code, and Phase 19 verification all agree on the locked structure.
- Pitfalls: HIGH - most pitfalls are visible directly in the current implementation and existing regression specs.

**Research date:** 2026-04-05
**Valid until:** 2026-05-05
