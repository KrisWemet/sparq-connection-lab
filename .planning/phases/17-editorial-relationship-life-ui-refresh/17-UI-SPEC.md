---
phase: 17
slug: editorial-relationship-life-ui-refresh
status: draft
shadcn_initialized: true
preset: default
created: 2026-03-31
---

# Phase 17 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated from the current Sparq stack, the user-provided editorial reference, and the constraint that the proven signup-driven path must remain intact.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | default |
| Component library | Radix |
| Icon library | lucide-react |
| Font | Editorial display serif for headlines plus clean sans body; target pairing: `Cormorant Garamond` or equivalent for display, existing app sans for body |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, eyebrow spacing, inline dividers |
| sm | 8px | Tight stacks, chip padding, metadata rows |
| md | 16px | Default card padding and component spacing |
| lg | 24px | Card interior sections, grouped controls |
| xl | 32px | Major card breathing room, section gaps |
| 2xl | 48px | Dashboard module separation |
| 3xl | 64px | Page openings, hero spacing, editorial section breaks |

Exceptions: 20px internal padding is allowed for narrow mobile cards only when 16px feels cramped and 24px feels oversized.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.6 |
| Label | 12px | 600 | 1.4 |
| Heading | 28px | 600 | 1.15 |
| Display | 40px | 600 | 1.05 |

Rules:
- Use display serif only for screen titles, editorial pull quotes, and one hero statement per screen.
- Use sans for all controls, navigation, pills, metadata, and body copy.
- Keep body copy at roughly fourth-grade reading level even when the visual language becomes more premium.
- Avoid all-caps blocks longer than one short eyebrow label.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F7F1EC` | App background, main page canvas, quiet surfaces |
| Secondary (30%) | `#EEE7F8` | Featured cards, secondary modules, nav wells, soft highlight zones |
| Accent (10%) | `#6E56F7` | Primary CTA fills, active nav state, progress rings, selected chips, focused prompt cards |
| Destructive | `#C95B6A` | Destructive actions only |

Accent reserved for: primary buttons, active bottom-nav icon and label, key progress indicators, selected filters, one featured card per screen, and links that represent the single next step.

Never use accent for: all cards at once, body text, passive icons, helper copy, or every interactive element on a screen.

Supporting neutrals:
- Text primary: `#2A2234`
- Text secondary: `#655D73`
- Border soft: `#DED6EA`
- Success soft: `#DCEEDC`
- Warm highlight: `#F7D978`

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Start today` |
| Empty state heading | `A gentle place to begin` |
| Empty state body | `Nothing new is here yet. Start with the next small step and Sparq will fill this in.` |
| Error state | `That part did not load. You can keep going with the main step and try this again in a moment.` |
| Destructive confirmation | `Remove this`: `This will clear it for now. You can add a new one later.` |

Voice rules:
- Prefer warm invitation over coaching pressure.
- Favor delight, ease, and relationship warmth over therapeutic gravity.
- Keep playful copy light, safe, and never mocking.
- Write for solo or couple use without making solo users feel behind.

---

## Surface Contract

### Dashboard
- Treat the dashboard as an editorial home, not a control panel.
- One hero card should carry the single main next step.
- Supporting modules should vary in tone: reflection, progress, playful, and lifestyle.
- Use more asymmetry and card hierarchy; avoid a wall of equal-weight boxes.

### Daily-Growth Home
- Preserve the current serious core action and order of operations.
- Style the page as a guided morning page with one strong hero statement, one clear action, and softer companion cards beneath.
- `Favorite Us` must feel like a warm side note, never like a competing task.

### Bottom Navigation
- Keep navigation logic unchanged.
- Visually shift to a softer floating tray or cushioned well rather than a hard utility bar.
- Active state gets the violet accent; inactive states stay quiet and warm.

### Editorial Cards
- Cards should feel collectible and magazine-like.
- Use rounded corners generously.
- Mix soft tints, image-led cards, and pull-quote cards to prevent sameness.
- Every screen should have one featured module and multiple quieter modules.

### Playful Layer
- `Daily Spark` and `Favorite Us` should look delightful and easy, not silly.
- Use small moments of color lift, micro-illustrative rhythm, and warm copy.
- Never let playful styling overpower the core next-step card.

---

## Motion Contract

- Use short upward fades for card entrance: `180ms` to `240ms`.
- Use one featured-card reveal per screen; avoid stacking multiple attention-grabbing animations.
- Swaps, saves, and copy feedback should feel instant and soft, not bouncy.
- No celebratory motion on serious error or reflection states.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `card`, `button`, `tabs`, `sheet`, `badge`, `separator`, `navigation-menu` | not required |
| Radix primitives already in repo | dialog, popover, tooltip, progress, tabs, toast | not required |
| third-party registries | none planned | shadcn view + diff required |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
