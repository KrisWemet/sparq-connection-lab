# Sparq Visual Emotion System

Implemented October 2, 2026. This layer gives the existing product a shared visual language without changing relationship logic, authentication, Supabase contracts, or the database.

## Foundations and audit decisions

| Existing foundation | Decision |
| --- | --- |
| Semantic plum, coral, gold, calm and warm-neutral tokens in `globals.css` | Retain the palette and its light/dark semantics. Plum provides reflective depth; coral accompanies connection; gold marks emerging possibility. |
| Inter and Cormorant Garamond | Retain both; use the editorial serif for the welcome story and important reflective headings. |
| Tailwind, shadcn/ui and Framer Motion | Reuse existing controls, dialog focus management and interaction motion. Decorative ambient motion uses CSS, as requested. No new dependency. |
| `EditorialSurface`, bottom navigation and established workflows | Extend the editorial primitive and keep existing navigation and controls. Open the Connect and Journal introductions out of their former card treatment. |
| Literal, timed metaphor illustrations | Replace with one family of translucent SVG materials. Previews are self-paced and dismissible. |
| White/linen screen wrappers, strong blur fields and unrelated gradients | Give the main product a shared atmosphere; use paper, layered surfaces and selected organic accents. Remove competing blur layers on journey views. |
| Confetti completion paths | Replace particle bursts with a short wash of light or an unfolding form. |
| Peter and existing editorial/content assets | Preserve the established companion and useful assets. The new visual system introduces no characters or stock couple imagery. |

There is no standalone Games page. The relevant surfaces are Daily Spark and Favorite Us. Insights appear in the insight profile, journal mirrors and related reflection experiences; the integration follows the existing product structure.

## Shared primitives

- `src/lib/visual-emotion.ts`: typed presets, optional explicit appearance preferences, CSS-variable generation, safe numeric snapshots and comparison helpers.
- `VisualEmotionProvider`: observes counts from existing requests and supplies a neutral-first, account-scoped visual context.
- `EmotionalEnvironment`: applies a route's emotional purpose and the shared background. Unmapped settings/admin routes receive no new atmosphere.
- `AmbientScene`: two gentle light fields and a small contour drawing. Decorative and non-interactive.
- `MetaphorVisual`: `bridge`, `bloom` and `flow` share gradients, contour materials and motion vocabulary. Supports growth, quiet and paused rendering.
- `SceneAccent`: a small reusable metaphor for an editorial opening or selected feature, with an optional area override.
- `MetaphorJourney`: one continuous environment with native scrolling. Desktop has a sticky crossfading stage; phones have inline artwork within the same continuous composition.
- `CompletionLight`: a restrained one-shot response. Existing confetti helper names remain compatible with their callers.

Example:

```tsx
<SceneAccent kind="bridge" area="connect" className="h-36 w-full" />
<SceneAccent kind="flow" quiet className="h-28 w-full" />
```

`emotionStyle(area, growth, preferences)` produces variables for intensity, warmth, energy, depth, connection, growth, calmness, motion duration, bloom, flow coherence and bridge strength. Surface purpose determines the preset; it never classifies a person. Future explicit preferences can adjust warmth, energy, spatial openness and pacing without changing content or relationship logic.

## Emotional jobs and coverage

| Area | Treatment | Applied surfaces |
| --- | --- | --- |
| Welcome/onboarding | Spacious, luminous, inviting | Landing, sign-in/register, metaphor previews, onboarding questions, consent, baseline, habit anchor, recommendations and graduation |
| Connect | Paired forms, warm coral/plum, gentle threads | Connect, Us, partner joining, messages, conversation preparation |
| Journal | Quiet paper, low energy, unfolding forms | Journal, daily practice, reflections |
| Games | Slightly greater energy within the same palette | Daily Spark, Favorite Us |
| Discovery | Warmth and emerging possibility | Date Ideas, journeys, journey tier/content views |
| Insights | Organized layers and gradual unfolding | Insight profile, quiz, existing insight surfaces |
| Repair | Stable, quiet currents | Conflict first aid, Neutral Observer, rehearsal, translator |
| Accomplishment | Expansion and light | Daily practice completion, graduation, existing confetti callers |

The atmosphere remains behind the task. Not every card receives artwork. Journal and repair atmospheres are static; repair accents are quiet to avoid competing with vulnerable work.

## Gradual growth and privacy

The current source is `practice_days` from the existing `/api/me/return-state` response, observed in WelcomeBackCard and the daily-growth completion path. This count represents participation/session-start days. It is **not** a verified count of completed reflections, psychological development, relationship quality or wellbeing.

No new request is added. No journal text, mood, attachment pattern, love language, partner activity or inferred diagnosis enters this system. Legacy resetting streak counts are not used.

Growth starts at 0.15 and follows a gentle asymptotic curve:

```text
0.15 + 0.85 × (1 − exp(−max(0, practiceDays − 1) / 180))
```

Rendering grows richer over months: Bridge adds threads, Bloom gains fullness and layers, and Flow becomes more coherent. The first render is already complete and welcoming. Repair enrichment remains restrained.

The provider keeps the highest valid count observed for the signed-in account. Missed days and stale/lower responses do not remove richness. It guards against responses from an earlier account, clears the active visual context when identity changes, and does not remount page content or forms. Storage failures fall back to memory/neutral visuals.

Local storage contains only `{version: 1, practiceDays: number}` under an account-specific key. The parser rejects extra fields, malformed values and oversized payloads. This is a local rendering cache, not a server history or a security authority. Clearing browser storage can reset the local high-water mark until existing API data is observed again.

`VisualSnapshot`, validation/serialization and `compareVisualSnapshots` support a future before/after view. Historical snapshots, cross-device persistence and a milestone-history UI are not implemented. Any future data source must preserve private/shared boundaries, describe what it actually measures, and remain nonpunitive.

## Motion, access and performance

- Ambient cycles are generally 20–30 seconds, with preference values constrained to 18–30 seconds. Movement is a few pixels, small rotations, gentle scaling and opacity changes.
- CSS handles continuous motion. There is no React frame loop, particle engine, canvas, video, raster illustration or added graphics dependency.
- SVGs use stable unique gradient IDs and deterministic geometry. Decorative content is hidden from assistive technology and cannot intercept input.
- Intersection and document-visibility observers pause offscreen/hidden motion. Inactive desktop chapter artwork is paused.
- Reduced-motion rules remove ambient transforms/animation and chapter crossfades while retaining the complete static materials. Existing Framer interactions inherit the app's user reduced-motion setting.
- Metaphor previews use the existing accessible dialog, Escape dismissal and explicit return focus. No timer blocks continuation.
- Auth inputs are at least 48px tall with 16px text. Password visibility has an accessible name/state and a 48px target. Dialog close and small actions have at least 44px targets.
- Existing semantic text/action colors are retained. Decorative color communicates no required status or instruction.

## Verification

The implementation is reviewed at phone widths (390px and 320px for public pages) and desktop widths (1024px and 1280px). Public pages run in the actual Next app. Authenticated layout review uses the actual components with fictional local fixtures; no test account or live relationship data is created.

Keyboard verification covers opening a metaphor preview, initial focus, Escape dismissal and return focus. Native chapter scrolling selects Bridge, Bloom and Flow in turn. Sign-in/register mode changes retain entered form data without submitting it.

Run the repository checks with `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build`. No new repository tests were added, following CLAUDE.md. The existing unit suite does not constitute a live Supabase end-to-end test.

Remaining release checks: live signed-in flows with a configured environment, physical iPhone/Safari performance, operating-system reduced-motion behavior and a full assistive-technology audit. Reduced-motion styling was inspected in source; phone review used browser viewport emulation.

Validation on October 2: standalone TypeScript checking, lint, all 46 existing unit tests and the production build passed. The build required network access for the existing Google Fonts. It reports existing Browserslist/Tailwind warnings and missing local Supabase public environment variables. Those missing variables prevent a live authenticated check in this checkout. The pre-existing auth legal links also need approved legal destinations; this visual change does not author legal policies or change consent behavior. The new welcome footer uses existing public routes and its own section anchor.
