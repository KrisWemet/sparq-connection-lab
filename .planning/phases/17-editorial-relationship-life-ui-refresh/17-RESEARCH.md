# Phase 17: Editorial Relationship Life UI Refresh — Research

**Researched:** 2026-04-05
**Domain:** UI design contract — Tailwind/shadcn/Framer Motion visual system, editorial design patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- This is a **design contract phase**, not an implementation phase. It produces a finalized UI spec that drives a later implementation phase.
- Safe surfaces in scope: dashboard, daily-growth home, bottom navigation, editorial content cards and supporting modules, playful MVP card styling on current surfaces.
- Out of scope: onboarding logic changes, Peter behavior changes, signup and auth changes, daily-growth step logic changes, new tabs/sections/product features.
- Contract must preserve: signup-driven onboarding path, dashboard arrival, daily-growth start, Day 1 completion.

### Claude's Discretion
- Specific token values, card pattern names, component naming conventions.
- How gaps in the existing UI-SPEC.md are resolved and documented.
- How to identify what must be created vs. modified in implementation.

### Deferred Ideas (OUT OF SCOPE)
- New routing or navigation architecture.
- Product features not already present.
- Onboarding redesign.
- Peter behavior changes.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-EDITORIAL-01 | Define a visual contract shifting Sparq toward a premium relationship life app — warm ivory surfaces, violet accents, rounded cards, expressive serif display type, magazine-like section hierarchy | Design system gap analysis below; current tokens vs. target contract documented in § Standard Stack and § Architecture Patterns |
| UI-EDITORIAL-02 | Limit the refresh to safe existing surfaces: dashboard, daily-growth home, bottom navigation, editorial content cards, playful layer styling | Current component inventory in § Architecture Patterns; safe-surface boundary analysis in § Common Pitfalls |
| UI-EDITORIAL-03 | Make the refresh buildable and safe: define tokens, type hierarchy, spacing rules, color allocation, copywriting rules, registry safety expectations in terms the current codebase can implement | Token implementation patterns in § Architecture Patterns and § Code Examples; registry analysis in § Don't Hand-Roll |
</phase_requirements>

---

## Summary

Phase 17 produces a UI design contract — not implementation code. The contract must finalize the visual and interaction spec for five safe surfaces so a later implementation phase can build with confidence.

The key discovery is that the codebase already has the violet palette applied (from recent commits). The `tailwind.config.ts` defines `brand.primary` as `#8B5CF6` (violet), `brand.linen` as `#F5F3FF`, and `brand.parchment`/`brand.card` as `#EDE9FE`. The `_app.tsx` loads **Lora** as the serif via `next/font/google` and exposes it as `--font-serif`. This means the editorial serif foundation already exists — it just needs to be applied correctly on the target surfaces.

The existing `17-UI-SPEC.md` is a solid starting draft but it describes an idealized palette (`#F7F1EC`, `#EEE7F8`, `#6E56F7`) that differs from what is actually in `tailwind.config.ts` (`#F5F3FF`, `#EDE9FE`, `#8B5CF6`). The plan must reconcile these two and land on one authoritative token set.

There is a merge conflict active in `Dashboard.tsx` (the `<<<<<<< Updated upstream` marker at line 243). Any plan touching that file must resolve the conflict as its first action, consistent with the STATE.md directive to "take upstream."

**Primary recommendation:** The plan should resolve the token discrepancy between `17-UI-SPEC.md` and the live codebase, declare one authoritative color and typography contract, then specify per-surface changes needed to bring each of the five safe surfaces into alignment — without touching routing, step logic, or Peter behavior.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 13.5.7 | Pages Router framework | [VERIFIED: package.json] |
| Tailwind CSS | ^3.3.3 | Utility-first styling | [VERIFIED: package.json] |
| Framer Motion | ^10.16.4 | All animations | [VERIFIED: package.json] |
| shadcn/ui | default preset | Component system | [VERIFIED: components.json] |
| Lora (next/font/google) | — | Serif font — loaded as `--font-serif` | [VERIFIED: _app.tsx] |
| Inter (next/font/google) | — | Sans body font — loaded as `--font-inter` | [VERIFIED: _app.tsx] |
| Lucide React | current | Icons | [VERIFIED: codebase usage] |

### Fonts — Current State
The `_app.tsx` loads two fonts via `next/font/google`:
- `Inter` → `--font-inter` variable
- `Lora` → `--font-serif` variable

Lora is already available everywhere through the `font-serif` Tailwind class and `var(--font-serif)`. The `17-UI-SPEC.md` specifies Cormorant Garamond as the editorial display target, but **Lora is already loaded and renders well as a serif editorial face**. The plan must decide: use Lora (zero install cost) or add Cormorant Garamond (requires a new `next/font/google` declaration in `_app.tsx`). [ASSUMED: Lora is a valid default unless Chris explicitly prefers Cormorant]

### No New Libraries Needed
The entire editorial visual contract is achievable with the existing stack. No new npm packages are required for the design contract phase. The implementation phase will inherit this as a constraint.

---

## Architecture Patterns

### Current Token State (what is actually in the codebase)

**Verified from `tailwind.config.ts`:** [VERIFIED: tailwind.config.ts]

| Token | Current Value | Role |
|-------|--------------|------|
| `brand.primary` | `#8B5CF6` | Soft violet — CTA fills, active states |
| `brand.hover` | `#7C3AED` | Violet-600 hover |
| `brand.light` | `#FAF9FF` | Barely-there lavender white |
| `brand.linen` | `#F5F3FF` | Soft lavender page background |
| `brand.parchment` / `brand.card` | `#EDE9FE` | Lavender card surfaces |
| `brand.espresso` | `#2E1065` | Deep violet near-black for headings |
| `brand.sand` | `#F9C74F` | Butter gold for streaks/highlights |
| `brand.taupe` | `#6B5B9E` | Muted purple for secondary text |
| `brand.growth` | `#93C5FD` | Soft sky blue for progress |

**CSS custom properties in `globals.css`:** [VERIFIED: globals.css]
- `--primary: 263 70% 63%` (HSL for `#8B5CF6`)
- `--ring: 263 70% 63%`
- `--radius: 0.5rem` (8px — note: this is the shadcn default radius, NOT the Sparq rounded-3xl signature)
- `--background: 220 14% 96%` (this is a grey, not the brand-linen violet — a divergence from tailwind.config.ts)
- `--card: 0 0% 100%` (pure white — another divergence from brand.parchment)

**Important divergence:** The CSS `--background` and `--card` variables point to grey and white. The brand tokens in Tailwind are warmer violet-tinted values. Many components bypass `bg-background` and use `bg-brand-linen` or `bg-white` directly. The contract must address this.

### Token Discrepancy: UI-SPEC vs. Codebase

The existing `17-UI-SPEC.md` proposes:
- Dominant: `#F7F1EC` (warm ivory — terracotta heritage)
- Secondary: `#EEE7F8` (soft violet)
- Accent: `#6E56F7` (deeper violet)

The live codebase has:
- Dominant: `#F5F3FF` (soft lavender linen)
- Secondary: `#EDE9FE` (lavender parchment)
- Accent: `#8B5CF6` (violet-500)

The warm ivory `#F7F1EC` is a terracotta-era value that predates the violet palette shift. The plan must **resolve this to one authoritative set** before specifying per-surface changes.

### Current Surface Inventory

#### Dashboard (`src/pages/Dashboard.tsx`) [VERIFIED: source]
- Background: inline `linear-gradient(160deg, #F5F3FF 0%, #F9FAFB 40%, #EDE9FE 100%)`
- Layout: `max-w-lg mx-auto px-4 pt-6 space-y-5 pb-24`
- Active components (rendered in order):
  1. `DashboardHeaderNew` — greeting + streak badge
  2. `DailyPulseBar` — mood selector, `bg-white` card
  3. `TodaysReflectionCard` — violet gradient `#7C3AED → #8B5CF6`, serif italic question
  4. `PartnerAnsweredCard` (conditional) — soft violet gradient
  5. Today's Focus CTA block (inline motion.div) — `#5B21B6 → #7C3AED` gradient, primary CTA
  6. `DailySparkCard` (playful, conditional) — `bg-white rounded-3xl`
  7. **MERGE CONFLICT** — upstream has `ActiveChallengeCard`, incoming has `IdentityArcCard`
  8. `SharedAchievements` — `bg-white` achievement rows
- Key gap: Dashboard has a live merge conflict at line 243. Any dashboard work must resolve this first (take upstream = `ActiveChallengeCard`).

#### Daily-Growth Home (`src/pages/daily-growth.tsx`) [VERIFIED: source]
- Background: `bg-gray-50` — **not using brand-linen**
- Header: `bg-gray-50`, text `#2C1A14` (espresso legacy), `text-amethyst-600` for nav elements
- Top bar: plain flex with SPARQ wordmark and settings icon
- Cards shown in home phase:
  1. `DayProgressArc` (centered)
  2. `TodaysExerciseCard` — `bg-white rounded-3xl`, `text-amethyst-600` label
  3. `PreviousReflectionCard` — `bg-[#EDE9FE]`, brand-primary label
  4. Peter section — `PeterAvatar` + `font-serif italic text-gray-500` tagline
- `FavoriteUsCard` is **not currently rendered in daily-growth.tsx** — the playful API provides it, but no component renders it on the home screen. This is a gap from Phase 14 that the editorial contract must acknowledge and specify placement for.

#### Bottom Navigation (`src/components/bottom-nav.tsx`) [VERIFIED: source]
- Current: `background: rgba(255,255,255,0.95)`, `borderTop: 1px solid rgba(139,92,246,0.12)`, `boxShadow: 0 -4px 20px rgba(139,92,246,0.06)`
- Active icon: `text-brand-primary` + `bg-brand-primary/10` pill
- Inactive icon: `text-brand-taupe/60`
- Navigation items: Home → `/dashboard`, Insights → `/insights`, Library → `/journeys`, Challenges → `/couples`
- Hidden on: `/`, `/auth`, `/login`, `/signup`, `/onboarding`, `/rehearsal`
- Uses `next/link` and `next/router` correctly — no React Router dependency [VERIFIED: source]

#### Playful Cards (`src/components/playful/`) [VERIFIED: source]
- `DailySparkCard`: `bg-white rounded-3xl border border-brand-primary/10 shadow-sm p-5` — close to brand pattern but uses raw white
- `FavoriteUsCard`: same base pattern — `bg-white rounded-3xl`, brand-primary labels, Lora serif italic for prompt text
- Both use correct Framer Motion patterns: `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}`
- Both use `font-serif italic text-brand-espresso` for prompt text — aligned with spec

### Recommended Project Structure (no changes needed)

```
src/
├── pages/
│   ├── Dashboard.tsx          # Merge conflict to resolve; editorial card stack
│   └── daily-growth.tsx       # Home shell needs bg-brand-linen, FavoriteUs placement
├── components/
│   ├── bottom-nav.tsx         # Float treatment update
│   ├── dashboard/             # Per-card token cleanup
│   └── playful/               # bg-white → bg-brand-parchment swap
└── styles/globals.css         # --background and --card variable reconciliation
```

### Typography — Current State vs. Contract

**Current font loading:** [VERIFIED: _app.tsx]
```tsx
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });
```

**Applied in `_app.tsx` root div:**
```tsx
className={`${inter.variable} ${lora.variable} font-sans min-h-screen ...`}
```

`font-sans` is the default body font (Inter). `font-serif` resolves to Lora via `var(--font-serif)`.

**Current serif usage in codebase:**
- `DashboardHeaderNew`: does NOT use serif for the name/greeting
- `TodaysReflectionCard`: `font-serif italic text-white text-lg` — correct
- `DailySparkCard`: `font-serif italic text-brand-espresso text-lg` — correct
- `FavoriteUsCard`: `font-serif italic text-brand-espresso text-lg` — correct
- `TodaysExerciseCard`: `font-serif italic text-gray-900 text-xl` — correct but uses raw gray
- `PreviousReflectionCard`: `font-serif italic text-[#2E1065]` — correct, matches espresso hex
- `daily-growth.tsx` Peter tagline: `font-serif italic text-gray-500 text-[15px]` — correct pattern, raw gray color

**Gap:** No screen currently uses a large `display`-scale serif headline (40px+). The editorial contract calls for one per-screen hero statement. The plan must specify where this goes on each surface.

### Anti-Patterns to Avoid

- **Using `bg-white` on cards:** Multiple components (`DailyPulseBar`, `TodaysExerciseCard`, playful cards) use `bg-white` instead of `bg-brand-parchment`. The editorial contract should migrate these to `bg-brand-parchment` (`#EDE9FE`) so cards read as warm rather than sterile.
- **Using `text-gray-*` for emotional text:** `TodaysExerciseCard` uses `text-gray-900` and `text-gray-500`. These should be `text-brand-espresso` and `text-brand-taupe`.
- **Inline hex colors:** Several components (`DashboardHeaderNew`, `SharedAchievements`, `DailyPulseBar`) hardcode hex values instead of Tailwind brand tokens. The contract should specify token equivalents.
- **`bg-gray-50` for page backgrounds:** The daily-growth page uses `bg-gray-50`, which is cold and breaks the warm lavender editorial feel.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google font loading | Custom font CDN links in `_document.tsx` | `next/font/google` already in `_app.tsx` | Already active; Lora + Inter loaded; adding fonts follows same pattern |
| Card animation entrance | CSS-only transitions | Framer Motion `motion.div` pattern already in every card | Consistent spring easing, already imported everywhere |
| CSS custom property theming | Separate CSS files or inline JS theme objects | Tailwind config `brand.*` tokens + `globals.css` CSS vars | Already set up; adding new tokens follows the existing pattern |
| Responsive layout | Custom media queries | Tailwind breakpoints `md:` / `lg:` | Already used throughout dashboard layout |
| Safe area insets | Custom JS | `env(safe-area-inset-bottom)` in Tailwind via `pb-[calc(...)]` | Already in `bottom-nav.tsx` |
| Focus ring styles | Custom focus CSS | `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2` | Already used in bottom-nav and buttons |

**Key insight:** The editorial contract requires no new infrastructure. Every visual mechanism is already present. The work is token consolidation, per-surface application spec, and merge conflict resolution — not architecture.

---

## Common Pitfalls

### Pitfall 1: The Merge Conflict in Dashboard.tsx
**What goes wrong:** Any plan that edits `Dashboard.tsx` without first resolving the `<<<<<<< Updated upstream` conflict at line 243 will create a parse error that breaks the build.
**Why it happens:** A stashed Dashboard Rebuild (Phase 18) branch was partially merged and left a conflict marker in the working file.
**How to avoid:** The first task of any plan touching `Dashboard.tsx` must be: resolve conflict by taking upstream (keep `ActiveChallengeCard`, discard `IdentityArcCard` and other stash components). This is explicitly documented in STATE.md.
**Warning signs:** Running `npm run build` or `npm run lint` will immediately surface the conflict.

### Pitfall 2: The Token Discrepancy Between UI-SPEC and Codebase
**What goes wrong:** The `17-UI-SPEC.md` uses warm ivory `#F7F1EC` (a terracotta-era value) as the dominant background, but the live codebase uses lavender `#F5F3FF`. If the plan proceeds without reconciling these, the implementation phase will guess which one to use.
**Why it happens:** The UI-SPEC was drafted from a visual reference that predated the violet palette migration applied in the most recent commit history.
**How to avoid:** The plan must explicitly declare the authoritative palette as the live codebase values (`#F5F3FF`, `#EDE9FE`, `#8B5CF6`) and note the UI-SPEC values as drafts to be superseded.
**Warning signs:** Any component spec that references `#F7F1EC` or `#6E56F7` is using the draft values.

### Pitfall 3: Missing FavoriteUsCard on Daily-Growth Home
**What goes wrong:** `FavoriteUsCard` exists in `src/components/playful/FavoriteUsCard.tsx` and the API (`/api/playful/today`) returns it, but it is **not rendered anywhere in `daily-growth.tsx`**. If the editorial contract specifies its styling without specifying its placement and wiring, the implementation phase will have a gap.
**Why it happens:** Phase 14 built the component and the data layer but may not have completed the rendering placement on the home shell.
**How to avoid:** The plan must include a task that both specifies how `FavoriteUsCard` is styled AND where it is placed in the daily-growth home screen stack.
**Warning signs:** Searching `src/pages/daily-growth.tsx` for `FavoriteUsCard` returns no results.

### Pitfall 4: `--background` and `--card` CSS Variables Out of Sync
**What goes wrong:** The shadcn semantic token `--background` is set to `220 14% 96%` (cool grey) and `--card` is `0 0% 100%` (white) in `globals.css`. Components that use `bg-background` or `bg-card` will not inherit the warm lavender brand palette.
**Why it happens:** The CSS variable defaults were set during the initial shadcn install and never updated to match the brand token migration.
**How to avoid:** The implementation phase must update `globals.css` `--background` to match `brand.linen` and `--card` to match `brand.parchment`. The contract should document both the target values and the shadcn CSS variable names to update.
**Warning signs:** A component using `bg-background` looks grey/white in the browser instead of lavender.

### Pitfall 5: Two Competing Gradient Treatments on Dashboard Hero Cards
**What goes wrong:** `TodaysReflectionCard` uses `#7C3AED → #8B5CF6` gradient, and Today's Focus CTA uses `#5B21B6 → #7C3AED` gradient (darker). `ActiveChallengeCard` uses `#6D28D9 → #7C3AED → #8B5CF6`. These three cards sit adjacent in the same scroll list and all use violet gradients with slightly different stop values, creating sameness rather than hierarchy.
**Why it happens:** Each card was designed independently, and the gradient values were chosen by feel rather than from a system.
**How to avoid:** The contract must declare ONE featured-card gradient treatment and ONE secondary surface treatment. The editorial contract's "one featured module per screen" rule directly addresses this.
**Warning signs:** Visual review of Dashboard shows a wall of purple gradient cards with no breathing room between them.

---

## Code Examples

Verified patterns from the existing codebase:

### Font Serif Application (confirmed working pattern)
```tsx
// Source: src/components/playful/DailySparkCard.tsx
<p className="font-serif italic text-brand-espresso text-lg leading-snug">
  {prompt.prompt}
</p>
```

### Framer Motion Card Entrance (standard pattern across all dashboard cards)
```tsx
// Source: src/components/dashboard/DashboardHeaderNew.tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

### Brand-Token Card Container (the target pattern — used by playful cards)
```tsx
// Source: src/components/playful/DailySparkCard.tsx
className="bg-white rounded-3xl border border-brand-primary/10 shadow-sm p-5"
// Target editorial version:
className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5"
```

### Bottom Nav Active/Inactive State (currently implemented)
```tsx
// Source: src/components/bottom-nav.tsx
style={{
  background: 'rgba(255,255,255,0.95)',
  borderTop: '1px solid rgba(139,92,246,0.12)',
  boxShadow: '0 -4px 20px rgba(139,92,246,0.06)',
}}
// Active icon:
className={isActive ? 'text-brand-primary' : 'text-brand-taupe/60'}
```

### Next/Font Google Pattern (for adding Cormorant if needed)
```tsx
// Source: src/pages/_app.tsx (existing pattern — Lora already loaded this way)
import { Lora } from 'next/font/google';
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });
// Cormorant would follow the exact same pattern:
// import { Cormorant_Garamond } from 'next/font/google';
// const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600'], variable: '--font-display' });
```

---

## State of the Art

| Old Approach | Current Approach | Status |
|--------------|------------------|--------|
| React Router `Link`/`useLocation` | `next/link` + `next/router` in bottom-nav | [VERIFIED: fixed in Phase 1] |
| `import.meta.env` Vite env vars | `process.env.NEXT_PUBLIC_*` | [VERIFIED: migrated per MEMORY.md] |
| Terracotta brand palette (`#B5604E`, `#FAF6F1`, `#EDE4D8`) | Violet palette (`#8B5CF6`, `#F5F3FF`, `#EDE9FE`) | [VERIFIED: tailwind.config.ts recent commits] |
| `sparq-ui` SKILL.md brand tokens | Different from live config (skill docs the old terracotta palette) | [VERIFIED: divergence — skill not updated for violet migration] |

**Deprecated/outdated:**
- `sparq-ui` SKILL.md documents the terracotta brand palette (`#B5604E`, `#FAF6F1`). The live codebase has been migrated to violet. Any plan must treat the live `tailwind.config.ts` as authoritative, not the skill docs.
- `tailwind.config.js` (legacy Vite config) — superseded by `tailwind.config.ts`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Lora is an acceptable editorial serif substitute for Cormorant Garamond unless Chris explicitly requests the latter | Standard Stack / Typography | Low — Lora is a high-quality serif; worst case is adding one more `next/font/google` declaration in `_app.tsx` |
| A2 | The authoritative color palette for implementation should be the live `tailwind.config.ts` values, not the warm ivory values in the UI-SPEC draft | Architecture Patterns | Medium — if the warm ivory direction is intended, ALL brand tokens would need to change, a larger scope than assumed |
| A3 | `FavoriteUsCard` is intentionally absent from `daily-growth.tsx` rendering (not a regression — Phase 14 may have deferred the home placement) | Common Pitfalls | Medium — if it was accidentally dropped, it needs placement logic added to the plan |
| A4 | The `ActiveChallengeCard` (upstream) is the correct take for the merge conflict resolution | Common Pitfalls | Low — STATE.md explicitly says "take upstream" |

---

## Open Questions

1. **Warm ivory vs. violet lavender as the page background**
   - What we know: `17-UI-SPEC.md` specifies `#F7F1EC` (warm ivory); live `tailwind.config.ts` uses `#F5F3FF` (lavender). These are meaningfully different aesthetics.
   - What's unclear: Was the warm ivory in the UI-SPEC intentional (a return toward the terracotta heritage), or an artifact of drafting the spec before checking the live code?
   - Recommendation: Ask Chris to confirm before the plan locks in either value. Default assumption is to use the live lavender palette.

2. **Cormorant Garamond vs. Lora for display type**
   - What we know: `17-UI-SPEC.md` specifies Cormorant Garamond. Lora is already loaded.
   - What's unclear: Whether Chris wants the specific Cormorant character (thinner hairlines, more editorial high-contrast) or whether Lora's warmer weight is sufficient.
   - Recommendation: Proceed with Lora unless Chris confirms Cormorant is required. Document the switch path.

3. **FavoriteUsCard placement on daily-growth home**
   - What we know: Component exists, API delivers it, but nothing renders it in `daily-growth.tsx`.
   - What's unclear: Whether Phase 14 intentionally deferred this, or whether the implementation was incomplete.
   - Recommendation: Plan must include FavoriteUsCard placement as an explicit in-scope deliverable.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 17 is a design contract phase. No new external tools, services, CLIs, or runtimes are introduced. All required tools (Node, npm, Next.js dev server) are already verified active by previous phases.

---

## Validation Architecture

Phase 17 produces a **spec document**, not runnable code. Traditional unit/integration tests do not apply. Validation is design review against a checklist.

### Validation Strategy for a UI Spec Phase

| Check | Method | Who |
|-------|--------|-----|
| Token table completeness | All five surfaces have explicit token assignments in the spec | Planner / Chris review |
| No warm ivory vs. lavender ambiguity | The RESEARCH.md open question is answered before plan is finalized | Chris confirmation |
| Merge conflict acknowledged | Plan includes "resolve Dashboard.tsx merge conflict" as task 1 | Planner |
| FavoriteUsCard placement specified | Plan includes explicit placement and wiring spec for daily-growth home | Planner |
| Registry safety | No third-party registries; shadcn official only | Verified by spec review against `17-UI-SPEC.md` registry table |
| Checker sign-off | `17-UI-SPEC.md` Checker Sign-Off section filled in for all six dimensions | Planner / implementation phase |

### UI-SPEC Checker Sign-Off Dimensions (from existing `17-UI-SPEC.md`)
- [ ] Dimension 1 Copywriting — voice rules match CLAUDE.md product voice
- [ ] Dimension 2 Visuals — editorial direction reconciled with live codebase
- [ ] Dimension 3 Color — single authoritative palette declared
- [ ] Dimension 4 Typography — serif usage map per surface
- [ ] Dimension 5 Spacing — token values consistent with live Tailwind scale
- [ ] Dimension 6 Registry Safety — no third-party registries confirmed

### Build Smoke Test (after implementation, not this phase)
```bash
npm run lint          # Catches merge conflict marker — must be clean
npm run build         # Catches TypeScript and import errors
npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium
```
These are not part of Phase 17 but must be in the plan as the Phase 18 acceptance gate.

---

## Security Domain

Phase 17 produces a visual design contract — no new authentication surfaces, API routes, form inputs, data storage, or cryptographic operations are introduced. ASVS categories V2, V3, V4, V5, V6 do not apply to a design spec phase.

---

## Sources

### Primary (HIGH confidence)
- `tailwind.config.ts` — verified brand token values, color palette, keyframe animations
- `src/styles/globals.css` — verified CSS custom properties, dark mode overrides, animation utilities
- `src/pages/_app.tsx` — verified font loading (Inter + Lora via next/font/google), wrapper structure
- `src/components/bottom-nav.tsx` — verified current nav treatment, active states, Next.js routing
- `src/pages/Dashboard.tsx` — verified current component stack, merge conflict location
- `src/pages/daily-growth.tsx` — verified home screen structure, missing FavoriteUsCard
- `src/components/playful/DailySparkCard.tsx` — verified playful card pattern
- `src/components/playful/FavoriteUsCard.tsx` — verified playful card pattern
- `src/components/dashboard/*.tsx` — verified per-card token usage
- `components.json` — verified shadcn setup: style=default, base=slate, cssVariables=true
- `.planning/phases/17-editorial-relationship-life-ui-refresh/17-UI-SPEC.md` — existing spec draft
- `.planning/phases/17-editorial-relationship-life-ui-refresh/17-CONTEXT.md` — phase scope decisions
- `.planning/STATE.md` — merge conflict directive confirmed
- `package.json` — verified next@13.5.7, framer-motion@^10, tailwindcss@^3.3.3

### Secondary (MEDIUM confidence)
- `.claude/skills/sparq-ui/SKILL.md` — design philosophy and component patterns (NOTE: documents terracotta palette, now superseded by violet migration in live code)
- `.claude/skills/frontend-design/SKILL.md` — editorial design principles

### Tertiary (LOW confidence — not verified against live code this session)
- `17-UI-SPEC.md` color values (`#F7F1EC`, `#6E56F7`) — drafts only; superseded by live tailwind.config.ts

---

## Metadata

**Confidence breakdown:**
- Current codebase state: HIGH — all key files read directly
- Standard stack versions: HIGH — verified from package.json and source files
- Design contract gaps: HIGH — specific file lines and divergences documented
- Token reconciliation path: MEDIUM — open question about warm ivory vs. lavender must be resolved with Chris
- FavoriteUsCard placement: MEDIUM — confirmed absent from rendering, reason assumed (not regression)

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable design system — 30 day validity)
