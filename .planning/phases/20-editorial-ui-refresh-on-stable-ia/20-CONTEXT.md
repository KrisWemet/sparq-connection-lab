# Phase 20: Editorial UI Refresh on Stable IA - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the visual and editorial refinement pass on top of the completed Phase 19 IA.

This phase delivers presentation refinement only:
- calmer, more premium, more relationship-life-oriented surfaces
- stronger hierarchy, spacing, and card treatment
- less utilitarian dashboard energy across the stable primary destinations

This phase must preserve:
- the locked `Home`, `Journeys`, `Connect`, `Journal` structure from Phase 19
- the proven `Home -> daily-growth` launch path
- the current `Daily Spark` placement on Home
- the current `Favorite Us` placement on `daily-growth`
- the current daily-growth logic, onboarding behavior, and destination ownership

This phase does **not** reopen IA, navigation, destination ownership, or feature scope.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Exact token values, CSS variable rollout order, and component-by-component implementation sequence
- Exact card compositions within each destination, as long as they reinforce the locked hierarchy above
- Exact motion, texture, and illustration rhythm, as long as the result stays calm and does not overpower the primary CTA surfaces
- Exact level of light cohesion polish on secondary-access pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product And Milestone Guardrails
- `SPARQ_MASTER_SPEC.md` — source-of-truth product direction and solo-first emotional-safety constraints
- `IMPLEMENTATION_STATUS.md` — current recovered implementation snapshot and supported path framing
- `.planning/PROJECT.md` — milestone guardrails, credibility-first posture, and no-new-broad-feature rule
- `.planning/REQUIREMENTS.md` — milestone requirements that keep reliability and trust ahead of aesthetic expansion
- `.planning/STATE.md` — latest milestone state and the warning not to reopen IA or destabilize the core path

### Locked IA Inputs
- `.planning/phases/18-sparq-ia-contract-and-home-simplification/18-CONTEXT.md` — Phase 18 boundary, locked IA framing, and structural intent
- `.planning/phases/18-sparq-ia-contract-and-home-simplification/18-IA-CONTRACT.md` — structural source of truth for destination ownership and Home scope
- `.planning/phases/19-implement-ia-wave-1-home-simplification-and-navigation-restructure/19-CONTEXT.md` — locked Wave 1 implementation decisions this phase must style rather than revise
- `.planning/phases/19-implement-ia-wave-1-home-simplification-and-navigation-restructure/19-VERIFICATION.md` — proof that the IA baseline is now stable enough to polish

### Editorial Direction
- `.planning/phases/17-editorial-relationship-life-ui-refresh/17-CONTEXT.md` — editorial refresh purpose, safe-surface framing, and emotional target
- `.planning/phases/17-editorial-relationship-life-ui-refresh/17-UI-SPEC.md` — visual contract for typography, spacing, color allocation, motion, and surface character
- `.planning/ROADMAP.md` §Phase 20 — phase boundary and dependency on the completed IA work

### Product Direction For Supporting Surfaces
- `.planning/phases/11-relationship-life-expansion-strategy/11-PRODUCT-STRATEGY.md` — relationship-life positioning and broader product tone
- `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md` — additive playful placement guardrails
- `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md` — playful MVP scope boundaries on existing surfaces
- `.planning/phases/16-playful-layer-controlled-beta-exposure-and-signal-review/16-03-SUMMARY.md` — keep-as-is recommendation for playful placement and prominence

### Codebase Architecture And UI Patterns
- `.planning/codebase/STACK.md` — current frontend stack, styling tools, and motion primitives
- `.planning/codebase/CONVENTIONS.md` — styling, motion, and page-pattern conventions already used in the app
- `.planning/codebase/STRUCTURE.md` — route inventory and current surface map
- `.planning/codebase/CONCERNS.md` — current risks, especially around noisy surface sprawl and keeping the app coherent

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/dashboard.tsx` — current Home shell with the locked Phase 19 structure: Peter greeting, dominant Today card, `DailySparkCard`, and `HomeDestinationStrip`
- `src/components/dashboard/HomeDestinationStrip.tsx` — the quiet destination rail that should become more premium without becoming louder
- `src/pages/daily-growth.tsx` — the Home-owned daily destination that already uses the brand palette and contains `FavoriteUsCard`
- `src/pages/connect.tsx` — current curated landing page for shared tools; likely needs stronger warmth and editorial curation
- `src/pages/journal.tsx` — current reflective landing page; likely needs more privacy and quietness in its hierarchy
- `src/pages/journeys.tsx` — current structured browse/progress surface; likely needs cleaner progress-oriented editorial clarity
- `src/components/bottom-nav.tsx` — stable primary-nav shell that should be visually refined without changing ownership rules
- `src/components/playful/DailySparkCard.tsx` and `src/components/playful/FavoriteUsCard.tsx` — supporting playful modules that must remain additive and subordinate

### Established Patterns
- Next.js Pages Router remains the active shell, so the refresh should work within page-local composition rather than a new app-shell architecture
- Tailwind utility classes and existing brand tokens are the current styling path
- Framer Motion is already used for light entrance and transition polish
- The app already uses warm neutrals, violet accents, and serif moments in several places, so the editorial pass should consolidate and deepen that system rather than introduce a new visual language from scratch

### Integration Points
- `src/pages/dashboard.tsx` — Home hierarchy, hero dominance, and destination-strip treatment
- `src/pages/daily-growth.tsx` — preserve the proven flow while upgrading the morning-page feel
- `src/pages/connect.tsx` — refine the curated-tool landing presentation
- `src/pages/journal.tsx` — make the reflective destination feel quieter and more private
- `src/pages/journeys.tsx` — improve progress clarity and reduce generic dashboard-card energy
- `src/components/bottom-nav.tsx` — align the nav tray with the editorial system without changing behavior
- `src/styles/globals.css` and shared tokens — likely rollout point for calmer spacing, surface treatment, and color allocation consistency

</code_context>

<specifics>
## Specific Ideas

- Use the completed Phase 19 IA as the locked structure.
- The next phase is visual and editorial refinement only.
- Make the app feel calmer, more premium, and more relationship-life oriented.
- Improve hierarchy, spacing, and card treatment.
- Reduce the utilitarian/dashboard feel.
- Preserve the proven `Home`, `Journeys`, `Connect`, `Journal` structure.
- Preserve the `Home -> daily-growth` launch path.
- `Home` should feel focused and magnetic.
- `Connect` should feel curated and warm, not like a tool dump.
- `Journal` should feel private and reflective, not like another dashboard.
- `Journeys` should feel clear and progress-oriented without duplicating Home.
- Visual consistency across all four primary destinations is a core success condition.

</specifics>

<deferred>
## Deferred Ideas

- New tabs or destination changes — explicitly out of scope because IA is locked in Phase 19
- New product features — separate future work
- `date ideas` — still deferred beyond this phase
- Games expansion — separate future product work
- Rituals expansion — separate future product work
- Onboarding changes — explicitly out of scope
- Daily-growth logic changes — explicitly out of scope

</deferred>

---

*Phase: 20-editorial-ui-refresh-on-stable-ia*
*Context gathered: 2026-04-05*
