---
name: sparq-ui
description: "Sparq Connection design system, component patterns, and UI standards. Use this skill whenever: building or modifying React components, creating new pages or layouts, styling elements, choosing colors or typography, implementing animations, building responsive layouts, adding accessibility features, creating loading/empty/error states, or making ANY visual change to the Sparq UI. If you're touching JSX, CSS, Tailwind classes, or shadcn components in the Sparq codebase — consult this skill first."
---

# Sparq Connection — UI & Design System

## 1. Design Philosophy

Sparq should feel like **a warm journal in a quiet room** — never a clinical tool, never a generic SaaS dashboard. The visual language balances deep plum, warm coral and soft gold with ivory and stone surfaces. That warmth is felt before a single word is read.

Every visual choice serves emotional safety: generous whitespace, rounded corners, serif italic for emotional moments, soft animations that guide rather than demand attention.

**The voice of Sparq** is a wise old doctor who makes you feel like the only person in the room — full of knowledge, never rushed, warm with humor, genuinely concerned about this specific user. The UI must feel like that person designed it.

**Core principles:**
- **Warmth over efficiency** — Soft gradients and organic shapes over hard edges and dense layouts
- **Breathing room** — Generous padding, relaxed line heights, space between elements. White space is structural, not decorative. Crowded screens feel unsafe.
- **Gentle motion** — Animations are subtle and purposeful. They guide attention, never demand it.
- **Progressive revelation** — Don't overwhelm. Show what matters now, reveal depth as users go deeper.
- **Pull, don't push** — Make the next step inviting and easy. Once the user has chosen a direction, offer choices of *how* to proceed; before they have, a real "whether" choice with a "not now" is respected (constitution §5A).
- **Emotional resonance** — Typography, color, and micro-interactions reinforce the feeling of growth and connection.

### Psychological design: process yes, direction no (constitution v1.2 §5A)

Every visual choice is influence, and that is expected. Apply the same test as Peter's words:

- **Process influence** helps the user engage with growth — reflect, notice, persist, return, act, regulate, stay curious, see progress, feel courage/hope/calm/connection/agency. **Direction influence** favors a particular belief, interpretation, identity, goal, relationship outcome, life decision or moral conclusion, and needs a direction the user explicitly chose.
- **Process priming is allowed anywhere it serves the user:** calm backgrounds before a hard reflection, hopeful golden-hour imagery, warmth before a vulnerable question, sequencing safety before courage, progress made visible, friction removed from a chosen mission, a welcoming return screen.
- **Direction priming is not:** no imagery, color, ordering, default selection or copy that quietly favors a belief, an identity, or a relationship or life outcome (stay, leave, reconcile, forgive, cut someone off). A two-option choice about a life decision gets equal visual weight.
- **Never:** urgency or scarcity styling (countdowns, red badges, "expires"), loss framing on progress ("streak lost"), comparison with a partner or other couples, embedded commands or emphasis tricks.
- **Transparency test:** if a user asked "why does this screen look like this?", the honest answer must be acceptable to them.

---

## 2. Tech Foundation

| Layer | Technology | Notes |
|---|---|---|
| Components | shadcn/ui (Radix primitives) | Base components in `src/components/ui/` — don't modify directly |
| Styling | Tailwind CSS 3 | Config: `tailwind.config.ts` (the only config — a stale `.js` twin was removed) |
| Animations | Framer Motion + CSS keyframes | Framer for interactive, CSS for entrance animations |
| Icons | Lucide React | Consistent 22px nav, 18px inline, 16px small |
| Toasts | Sonner | Via `toast()` from `sonner` |
| Class merging | `cn()` from `@/lib/utils` | Always use for conditional Tailwind classes |
| Theme | CSS custom properties + `tailwind.config.ts` | Dark mode via `.dark` class (`darkMode: ["class"]`) |
| Confetti | `canvas-confetti` | Via `src/lib/ElegantConfetti.ts` |

**shadcn config** (`components.json`): style `default`, base color `slate`, CSS variables enabled, aliases at `@/components/ui`.

### Stitch MCP (screen generation)

The Stitch MCP is connected to Claude Code. When generating new screens or UI mockups:
- Use Stitch to generate design candidates before writing component code
- Always pass the confirmed color palette hex values explicitly in Stitch prompts
- Reference the approved welcome screen as the visual baseline for all new screens
- After Stitch generates a screen, review against the Emotional Screen Test in section 4.5
- Never use Stitch output directly as code — use it as a visual spec to implement in React with the existing component system
- Approved design baseline screens are stored in `references/design-screens/`

---

## 3. Color System

**Colour carries meaning:** plum = understand, coral = connect, gold = grow. Most screens live in ivory, stone and plum; coral appears for connection and gold for insight/progress. Calm and repair moments can use quiet sage. Errors, warnings and success keep explicit status roles.

`src/styles/globals.css` is the source of truth for colour values. `tailwind.config.ts` maps the existing shadcn variables and compatible `brand-*` aliases with opacity support. Exact light/dark values and measured contrast: `references/design-tokens.md`.

| Role | Light value | Use |
|---|---|---|
| `primary` | `#4B2E57` | Deep-plum primary buttons, brand anchors |
| `primary-emphasis` / `understand` | `#4B2E57` | Understanding, reflection, selected navigation text |
| `connection` | `#E97868` | Coral connection fills/accents, with `connection-foreground` text |
| `connection-emphasis` | `#A8452F` | Readable coral words/icons |
| `growth` / `insight` | `#F3B55A` | Gold progress, insights, milestones, with `growth-foreground` text |
| `growth-emphasis` | `#8A5E14` | Readable gold words/icons |
| `background` | `#FAF7F2` | Ivory canvas (`brand-linen`) |
| `card` | `#EEE8E3` | Stone surfaces (`brand-parchment`) |
| `foreground` | `#241D27` | Main plum-black text |
| `muted-foreground` | `#685C6A` | Supporting mauve text, deepened for contrast on stone |
| `brand-mauve` swatch | `#776B78` | Supplied identity swatch; text uses muted foreground |
| `calm` | `#9CB5A0` | Quiet sage accent |

### Moment tones — colour that follows the emotion (`src/lib/moment-tone.ts`)

Use `TONE[tone].card / eyebrow / icon / button / outline / inset` instead of hand-picking colours for a moment.

| Tone | Colour | Where it's used now | Also use it for |
|---|---|---|---|
| `understand` | Plum on ivory/stone | Default: daily questions, learning, most screens | Anything not listed below |
| `connect` | Coral (`coral-soft` card, coral button with dark text) | `/us` shared space, SharePrompt once they choose to share, `/join-partner` | Partner answer reveal (not built yet), partner invites |
| `grow` | Gold (`gold-soft` card, gold button with dark text) | Journey completion synthesis, practice-days card, 30-day and weekly mirrors, GrowthThread milestones/breakthroughs | Self-discoveries, insight moments |
| `repair` | Quiet (`quiet` surface, mauve button, sage/mauve accents) | `/conflict-first-aid` | Heavy check-ins, Peter comforting |

Keep coral and gold rare: they mean something only because most of the app is plum. Safety content (danger banners) keeps its own rose colours.

### Rules

- Default actions use plum with `text-primary-foreground`. Use coral selectively for connection; gold is not a default CTA.
- Coral and gold fills take dark-plum labels. Their small text/icons use emphasis variants. Never white labels on coral or gold.
- Use semantic surfaces and control borders (`background`, `card`, `popover`, `border`, `input`, `ring`). Do not add component-specific neutral palettes.
- Keep functional status colours distinct: `destructive`, `warning`, `success`, with their `*-emphasis` and `*-subtle` variants.
- Legacy brand aliases are theme-aware. Text utilities for primary, espresso, coral and gold resolve to readable text roles; fill utilities retain the fill role.
- The existing Sparq mark is plum with its existing coral-to-gold spark. No new logo asset is needed.
- Confetti uses coral, gold and plum (`ElegantConfetti.ts`). Natural illustrations retain their specific colours.

---

## 4. Typography

### Font Families

| Token | CSS | Stack |
|---|---|---|
| `font-serif` | `var(--font-serif)` | Georgia, Cambria, "Times New Roman", Times, serif |
| `font-sans` | (Tailwind default) | Inter, system-ui, sans-serif |

> `--font-serif` CSS variable set in `_document.tsx` or `globals.css`. Falls back to Georgia.

### Scale and Usage

| Class | Size | Usage |
|---|---|---|
| `text-xs` | 12px | Labels, timestamps, metadata — always small caps with `tracking-widest` |
| `text-sm` | 14px | Secondary body, card descriptions |
| `text-[15px]` | 15px | Peter speech — custom size for reading comfort |
| `text-base` | 16px | Primary body text |
| `text-lg` | 18px | Card titles, section headings |
| `text-xl` | 20px | Page section headings |
| `text-2xl` | 24px | Page titles |
| `text-5xl` | 48px | Hero numbers (Relationship OS score) |

### Weight Patterns

- `font-semibold` — Card titles, labels, active nav text
- `font-medium` — Body with emphasis, button text
- `font-serif italic` — Peter quotes, emotional questions, reflective content, shared partner responses — **the most important typographic rule**
- `font-bold` — Streak numbers, strong emphasis (use sparingly)

### Label Pattern

All category labels, modality names, section headers:
```
text-xs font-semibold tracking-widest uppercase text-brand-primary
```
Never sentence case for labels. Always small caps.

### The Typography Hierarchy on Any Screen

1. **Serif italic headline** — Large, emotional. The thing they should feel.
2. **Body text** — Humanist sans, generous line height, one idea per sentence
3. **Small caps label** — Context, never the focus
4. **Peter's voice** — Italic, warm, personal. No container around it.

### Line Heights

- `leading-snug` (1.375) — Headings, short text blocks
- `leading-relaxed` (1.625) — Peter quotes, reflective text, long-form content
- Default (1.5) — Body text

---

## 4.5 Confirmed Visual Language

This section documents the visual patterns confirmed through design validation. These are non-negotiable — they define what makes Sparq look and feel like Sparq.

### Emotional Moments Always Use Serif Italic

Any time the app is asking the user to feel something — a question, a reflection prompt, a Peter message, a shared partner response — the text is serif italic. Large, generous, unhurried. This is the single most important visual rule in the app.

Examples:
- Welcome headline: *"Welcome to your relationship gym."*
- Daily question: *"What is one thing your partner did this week that made you feel truly seen?"*
- Peter's voice: *"Ready when you are."*
- Partner response quotes in Couples Mode

### Two Options. Always Two. Maximum Three.

Never present more than three choices. Preferably two. Choice selectors are large, full-width tap targets — not radio buttons, not dropdowns, not small toggles.

When the user has already chosen the direction, both options move forward ("which way would you like to start?"). When they haven't, one honest option can be "not now" — that is agency, not a "stay stuck" option (constitution §5A, language framework §3–4).

### Peter Appears Without a Container

Peter never sits inside a card, a box, or a background shape. He appears directly on the screen surface. His dialogue appears below him as italic text — no speech bubble box in most contexts. (The speech bubble card variant is only for the dashboard insight card.)

Peter is never reduced to a static icon or loading spinner. He is the emotional presence of the app.

### Dark Screens for Peak Emotional Moments

Couples Mode shared reflection and the Day-14 Growth Reveal (a milestone — evidence plus the user's own meaning) use a dark background — warm espresso `#241D27`, not cold navy or pure black. This creates intimacy and signals importance. The contrast says: *this moment is different.*

### The Linen-to-Parchment Layering

Background: `brand-linen` `#FAF7F2`
Card surfaces: `brand-parchment` `#EEE8E3`

The separation must be visible but never harsh. It reads like pages in a journal — layered warmth, not stark contrast. If parchment cards disappear into the linen background, increase parchment depth until the separation is clear at arm's length on a phone screen.

### No Stock Photography of Humans. Ever.

Peter is the emotional presence. Human photography of couples or people breaks the emotional contract of the app. If an image is needed — it is Peter, an abstract warm shape, or a warm golden-hour metaphor image (`public/images/journeys/`, `public/images/dates/`; hands-only is allowed). Never a stock photo of a couple, a person, or a lifestyle scene, and never imagery that implies how a relationship should turn out.

### Button Hierarchy — Three Patterns Only

- **Primary**: Full width, filled plum `#4B2E57`, rounded, white **bold** text
- **Secondary**: Full width, outlined plum, no fill, plum text
- **Ghost**: Centered text only, no border, no background

No variations. No gradient buttons unless explicitly authorized. No icon-only primary CTAs.

### The Emotional Screen Test

Before shipping any screen, ask these five questions:
1. Does it feel warm before you read a word?
2. Is there enough breathing room to feel safe?
3. Does the most important thing have the most visual weight?
4. Would Peter look comfortable on this screen?
5. Does it look like a journal or a SaaS dashboard?

If the answer to 5 is "dashboard" — add space, reduce elements, increase type size, check color temperature.

### What Sparq Must Never Look Like

- Duolingo — gamified, childish, bright primary colors
- Headspace — teal, floaty, generic mindfulness aesthetic
- A SaaS metrics dashboard — data tables, KPI cards, dense information architecture
- A therapy intake form — clinical language, long questionnaires, sterile white backgrounds
- A dating app — swipe mechanics, profile cards, bold gradients
- Any app where the UI competes with the emotional content for attention

---

## 5. Spacing and Layout

### Base Unit

Tailwind's 4px base. Primary spacers: `4` (16px), `5` (20px), `6` (24px), `8` (32px).

### Page Layout (implemented in `DashboardLayout`)

```
min-h-dvh bg-brand-linen pb-24
  └─ main.container.max-w-lg.mx-auto.px-4.py-6.space-y-5
```

- **Container**: `max-w-lg` (512px) for mobile-first card layouts, `max-w-md` (448px) for onboarding
- **Page padding**: `px-4` (16px) mobile, `px-6` (24px) tablet+
- **Card gap**: `space-y-5` (20px) between dashboard cards
- **Bottom padding**: `pb-24` to clear bottom nav

### Card Patterns

- **Border radius**: `rounded-3xl` (24px) — the signature Sparq radius
- **Card padding**: `p-5` to `p-6` (20-24px)
- **Card background**: `bg-brand-parchment` — distinct from linen page background
- **Card shadow**: `shadow-sm` default, `shadow-[0_8px_30px_hsl(var(--shadow)/0.15)]` for elevated CTA cards
- **Card border**: `border border-brand-primary/10` for warm-tinted borders

### Container Widths

| Class | Width | Usage |
|---|---|---|
| `max-w-sm` | 384px | Peter insight speech bubble |
| `max-w-md` | 448px | Onboarding container |
| `max-w-lg` | 512px | Dashboard main content |
| `max-w-1100px` | 1100px | Dashboard wrapper (desktop) |

### Dashboard Desktop Layout (implemented in `globals.css`)

```css
/* Mobile: single column, Peter above content */
/* Desktop (1024px+): Peter fixed right, content left */
.dashboard-main-wrapper { max-width: 1100px; }
.dashboard-main { max-width: 520px; }
.peter-fixed { right: 60px; top: 180px; width: 220px; }
```

### Bottom Nav (implemented)

- Fixed bottom, `z-50`, backdrop blur (`backdrop-blur-xl`)
- Safe area: `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`
- Background: `rgba(255,255,255,0.92)` with subtle brand-tinted top border
- Hidden on: `/`, `/auth`, `/login`, `/signup`, `/onboarding-flow`

---

## 6. Component Patterns

> Full specs with props, states, and usage examples: `references/component-catalog.md`

### Loading States

**Always use `<PeterLoading isLoading />`** — never bare spinners, skeleton screens alone, or "Loading..." text as the primary indicator. Shows elegant triple-ring spinner on `bg-brand-linen` with rotating Peter wisdom tips in a speech-bubble card.

### Cards

All cards use `rounded-3xl`. Key variants:

- **Standard card**: `Card` from shadcn — `rounded-3xl border bg-brand-parchment shadow-sm border-brand-primary/10`
- **CTA card** (TodaysFocusCard): `bg-brand-primary rounded-[24px]` with white serif text and organic blur shapes
- **Insight card** (PetersInsight): Direct on background, no card — `bg-brand-linen rounded-2xl` speech bubble variant for dashboard only
- **Score card**: `bg-gradient-to-br from-brand-linen to-brand-parchment` with animated progress bars
- **Partner card**: `bg-brand-primary/5 backdrop-blur-md rounded-3xl` with subtle warm shadow
- **Skeleton**: `bg-brand-parchment/80 rounded-3xl border border-brand-primary/10 h-48 animate-pulse backdrop-blur-md`

### Buttons

Three patterns only — no variations:

- **Primary**: Full width, `bg-brand-primary text-white rounded-2xl` — filled plum
- **Secondary**: Full width, `border border-brand-primary text-brand-primary rounded-2xl` — outlined
- **Ghost**: `text-brand-primary` centered, no border, no background

Size → radius mapping from shadcn: `default` → `rounded-xl`, `lg` → `rounded-2xl`, `icon` → `rounded-full`.

### Two-Option Selectors

Large full-width tap targets. The only choice format used in the app.

```tsx
<div className="flex flex-col gap-3 w-full">
  <button className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 
    bg-brand-parchment text-brand-espresso font-medium text-left
    hover:border-brand-primary hover:bg-brand-primary/5
    active:scale-[0.98] transition-all">
    Option A
  </button>
  <button className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 
    bg-brand-parchment text-brand-espresso font-medium text-left
    hover:border-brand-primary hover:bg-brand-primary/5
    active:scale-[0.98] transition-all">
    Option B
  </button>
</div>
```

Never use: radio buttons, dropdowns, checkbox lists, tab bars for content choices.

### Streak Colour Tiers (tokens only — celebrate a live run, never show a loss)

| Days | Color | Background | Rationale |
|---|---|---|---|
| 1–6 | `brand-sand` | `bg-brand-sand/15` | Gold — early momentum |
| 7–13 | `brand-growth` | `bg-brand-growth/15` | Gold — building strength |
| 14–29 | `brand-primary` | `bg-brand-primary/10` | Plum — real achievement |
| 30+ | `brand-espresso` | `bg-brand-sand/20` | Deep warmth — mastery |

### Relationship Score Dimension Colors

| Dimension | Color | Rationale |
|---|---|---|
| Communication | `bg-brand-growth` | Forward movement, growth |
| Repair Speed | `bg-brand-primary` | Action, warmth |
| Emotional Safety | `bg-brand-sand` | Gold, value, light |
| Daily Ritual | `bg-brand-espresso/60` | Depth, consistency |

### Onboarding

- Container: `min-h-dvh bg-brand-linen py-8 px-4` with `max-w-md` centered (never `min-h-screen` — see `mobile-native`)
- Progress indicator in header, back/next/skip controls in footer
- Peter appears in-flow above content, no container box

### Empty and Building States

- Centered layout with muted icon, serif heading, small warm description text
- Organic blur shape in background corner
- Warm, encouraging copy — never "no data available"

### Navigation

- **Mobile**: Fixed bottom nav, 4–5 items max
- **Active state**: `bg-brand-primary/10` pill, `brand-primary` color, bolder stroke
- **Inactive**: `text-muted-foreground`, thinner stroke

---

## 7. Animation Principles

### Core Rules

- **Subtle and purposeful** — Animations guide attention, never distract
- **200–400ms** for UI transitions, **500–700ms** for content entrances
- **Ease-out** for entrances, **ease-in-out** for persistent motion
- **`prefers-reduced-motion`** — Confetti uses `disableForReducedMotion: true`

### Framer Motion Patterns

| Pattern | Props | Usage |
|---|---|---|
| **Page transition** | `y: 10→0, opacity: 0→1, scale: 0.99→1` @ 400ms | `PageTransition` wraps all pages |
| **Card entrance** | `opacity: 0→1, y: 12–20→0` @ 300–400ms | Dashboard cards, staggered |
| **Hover lift** | `whileHover={{ scale: 1.01–1.02 }}` | Interactive cards |
| **Tap feedback** | `whileTap={{ scale: 0.95–0.99 }}` | Buttons, tappable cards |
| **Spring motion** | `type: "spring", stiffness: 400, damping: 17` | Bouncy interactive elements |
| **Progress bar** | `width: 0→X%` @ 1s ease-out | Skill bars, score dimensions |
| **Heartbeat pulse** | `scale: [1, 1.2, 1, 1.2, 1]` @ 600ms | Share-sent confirmation in `/us` (keep subtle; respects reduced motion) |

### Page Transition Easing

```typescript
ease: [0.22, 1, 0.36, 1] // Fast start, gentle settle
```

### CSS Keyframe Animations (`globals.css`)

| Name | Effect | Duration | Class |
|---|---|---|---|
| `fadeIn` | opacity 0→1 | 500ms | `.animate-fade-in` |
| `slideUp` | y+20→0, opacity 0→1 | 500ms | `.animate-slide-up` |
| `slideIn` | x-20→0, opacity 0→1 | 500ms | `.animate-slide-in` |
| `scale` | scale 0.9→1, opacity 0→1 | 500ms | `.animate-scale` |
| `bounce` | y+20→y-5→0, opacity 0→1 | 600ms | `.animate-bounce` |
| `pulse` | scale 0.95↔1.05 | 1.5s infinite | `.animate-pulse` |
| `peterFadeIn` | scale 0.92→1, opacity 0→1 | 400ms | Peter entrance |

**Stagger delays**: `.animate-delay-100` through `.animate-delay-500` (100ms increments).

### Celebration Animations (`src/lib/ElegantConfetti.ts`)

- `fireElegantConfetti()` — 3-second continuous confetti from both sides
- `fireSubtleBurst()` — Single 40-particle center burst
- Colors: `['#E97868', '#F3B55A', '#4B2E57']` — coral, gold, plum
- Both use `disableForReducedMotion: true`

---

## 8. Texture and Organic Shapes

Sparq uses subtle organic elements to avoid the flat SaaS feel:

- **Noise texture**: `.texture-bg` — SVG fractal noise at 3% opacity
- **Blur orbs**: `absolute w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl` in card corners
- **Gradient overlays**: `bg-gradient-to-br from-brand-linen to-brand-parchment` on cards
- **Accent bars**: `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/40 to-brand-primary/10`

These create depth without heavy imagery.

---

## 9. Accessibility Requirements

### Minimum: WCAG 2.1 AA

- **Focus visible**: All interactive elements have `focus-visible:ring-2 focus-visible:ring-offset-2`
- **Touch targets**: Minimum 44px height on all interactive elements
- **Color contrast** (measured 2026-09-30, Plum/Coral/Gold): Dark Plum `#241D27` on ivory 15.4:1, on stone 13.5:1 ✅. White on Deep Plum `#4B2E57` 11.5:1 ✅. Mauve `#685C6A` on stone 5.2:1 ✅. **Coral `#E97868` and gold `#F3B55A` fail as text and under white text** (white on coral 2.9:1) — use them as fills with dark-plum text, and `brand-coral-deep` / `brand-gold-deep` when the words themselves must be coral or gold.
- **Screen reader labels**: `aria-label` on icon-only buttons, `sr-only` text where needed
- **Reduced motion**: Confetti respects `disableForReducedMotion`. CSS animations include `@media (prefers-reduced-motion: reduce)` overrides.
- **Keyboard navigation**: All interactive elements reachable via Tab, activatable via Enter/Space

### Rules for New Components

- Never rely on color alone to convey information — pair with icon or text
- All Peter avatar images need descriptive `alt` text
- Form inputs need associated labels (`<Label>` from shadcn)
- Error messages must use `aria-describedby`
- Bottom nav items need both icon and text label

---

## 10. Mobile-First Rules

### Breakpoints

| Name | Min-width | Usage |
|---|---|---|
| (default) | 0px | **Design here first** — 375px iPhone target |
| `md` | 768px | Tablet — increased padding |
| `lg` | 1024px | Desktop — Peter moves to fixed sidebar |
| `2xl` | 1400px | Max container |

### Mobile-First Patterns

- **Single column by default** — Multi-column only at `md`+
- **No hover-only states** — Every hover has a tap/press equivalent
- **Touch-friendly**: Cards `p-5` minimum, gaps `gap-3`+
- **Safe area**: Bottom nav uses `env(safe-area-inset-bottom)`
- **Full-bleed CTAs**: Primary actions span full width on mobile

### What Not to Do

- Don't use `hidden md:block` to create desktop-only features
- Don't put critical interactions in hover tooltips
- Don't make text smaller than `text-xs` (12px)
- Don't stack more than 3 levels of nesting in mobile card content

---

## 11. Dark Mode

Dark mode via `darkMode: ["class"]` in Tailwind config and `.dark` overrides in `globals.css`.

### Current Approach

- Semantic CSS variables and compatible brand aliases respond to `.dark`.
- Canvas is plum-black, cards are plum stone, and text/focus use lighter readable variants.
- Coral and gold remain accents with dark labels or readable emphasis variants.
- Prefer semantic utilities and check both modes. No theme toggle/provider is added by the colour update.

---

## 12. Composing New Components — Checklist

When building a new Sparq component:

1. **Background**: `bg-brand-linen` for pages, `bg-brand-parchment` for cards — never pure white
2. **Border radius**: Start with `rounded-3xl` for cards — the signature radius
3. **Border**: `border border-brand-primary/10` for warm tinted borders
4. **Text**: `brand-espresso` for headings, `brand-text-primary` for body, `brand-text-secondary` for supporting copy
5. **Emotional text**: Always `font-serif italic` for questions, quotes, reflections
6. **Labels**: Always `text-xs font-semibold tracking-widest uppercase text-brand-primary`
7. **Animation entrance**: `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`
8. **Interactive**: `whileHover={{ scale: 1.01 }}` and `whileTap={{ scale: 0.98 }}`
9. **Organic depth**: `absolute w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl` in corner
10. **Loading**: Return `<PeterLoading isLoading />` — never skeleton alone
11. **Choices**: Two options only, large full-width tap targets
12. **Spacing**: `p-5` to `p-6` card padding, `space-y-5` between cards, `pb-24` page bottom
13. **Icons**: Lucide React, 18px inline, `brand-primary` color
14. **Accessibility**: `focus-visible:ring-2`, 44px touch targets, `aria-label` on icon buttons

---

## Cross-Skill References

- **For general frontend design principles and creative direction**: see `frontend-design` skill
- **For Peter avatar poses, moods, SVG specs, and copy voice**: see `sparq-peter` skill
- **For architecture and page structure**: see `sparq-architecture` skill
- **For psychology-driven content, personalization, and language**: see `sparq-psychology` skill
- **For influence-language patterns and copy rules**: see `sparq-psychology/references/language-framework`

---

> **Deep reference**: `references/component-catalog.md` — full component specs with props, states, and usage examples
> **Deep reference**: `references/design-tokens.md` — complete token list with exact values
> **Deep reference**: `references/design-screens/` — approved Stitch screen baselines