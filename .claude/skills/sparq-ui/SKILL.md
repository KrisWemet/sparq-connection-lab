---
name: sparq-ui
description: "Sparq Connection design system, component patterns, and UI standards. Use this skill whenever: building or modifying React components, creating new pages or layouts, styling elements, choosing colors or typography, implementing animations, building responsive layouts, adding accessibility features, creating loading/empty/error states, or making ANY visual change to the Sparq UI. If you're touching JSX, CSS, Tailwind classes, or shadcn components in the Sparq codebase — consult this skill first."
---

# Sparq Connection — UI & Design System

## 1. Design Philosophy

Sparq should feel like **a warm journal in a quiet room** — never a clinical tool, never a generic SaaS dashboard. The visual language is built entirely from warm tones. There are no cool or cold colors anywhere in the system. That warmth is felt before a single word is read.

Every visual choice serves emotional safety: generous whitespace, rounded corners, serif italic for emotional moments, soft animations that guide rather than demand attention.

**The voice of Sparq** is a wise old doctor who makes you feel like the only person in the room — full of knowledge, never rushed, warm with humor, genuinely concerned about this specific user. The UI must feel like that person designed it.

**Core principles:**
- **Warmth over efficiency** — Soft gradients and organic shapes over hard edges and dense layouts
- **Breathing room** — Generous padding, relaxed line heights, space between elements. White space is structural, not decorative. Crowded screens feel unsafe.
- **Gentle motion** — Animations are subtle and purposeful. They guide attention, never demand it.
- **Progressive revelation** — Don't overwhelm. Show what matters now, reveal depth as users go deeper.
- **Pull, don't push** — Every interactive element assumes the user is moving forward. Never ask "do you want to proceed?" — offer a choice of how to proceed.
- **Emotional resonance** — Typography, color, and micro-interactions reinforce the feeling of growth and connection.

---

## 2. Tech Foundation

| Layer | Technology | Notes |
|---|---|---|
| Components | shadcn/ui (Radix primitives) | Base components in `src/components/ui/` — don't modify directly |
| Styling | Tailwind CSS 3 | Config: `tailwind.config.ts` (canonical), `tailwind.config.js` (legacy) |
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

**The palette principle**: Every color in this system is warm-toned. There are no cool or cold colors anywhere. The warmth is felt subconsciously before anything is read.

### Brand Palette (implement in `tailwind.config.ts`)

| Token | Hex | Psychology | Usage |
|---|---|---|---|
| `brand-primary` | `#B5604E` | Warm clay — safety, human warmth, connection | Primary buttons, active nav, CTA fills, accent borders |
| `brand-hover` | `#9A5242` | Deeper clay | Hover state for primary elements |
| `brand-light` | `#FDF8F6` | Softest warm tint | Very light background tints |
| `brand-linen` | `#FAF6F1` | Warm cream — journal quality | Page backgrounds, replaces pure white |
| `brand-parchment` | `#EDE4D8` | Layered warmth — pages in a book | Card surfaces, sits above linen background |
| `brand-sand` | `#D4A96A` | Warm gold — value, light, optimism | Celebrations, streak indicators, milestone moments |
| `brand-espresso` | `#2C1A14` | Deep warm near-black — trust, depth | Headings, dark UI elements, never cold |
| `brand-growth` | `#7A9B80` | Warm sage — healing, gentle forward movement | Progress bars, success states, growth indicators |
| `brand-text-primary` | `#1A1008` | Near-black warm | Primary readable text |
| `brand-text-secondary` | `#6B4C3B` | Warm brown-grey | Peter's voice, captions, secondary copy |

### Semantic Colors (CSS variables in `globals.css`)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#B5604E` | `hsl(210 40% 98%)` | shadcn primary — buttons, links |
| `primary-100` | `#FDF8F6` | — | Light primary tint |
| `primary-200` | `#EDE4D8` | — | Medium primary tint (matches brand-parchment) |
| `secondary` | `#EDE4D8` | `hsl(217.2 32.6% 17.5%)` | Secondary surfaces |
| `destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, destructive actions |
| `muted` | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Subdued text, disabled states |
| `background` | `#FAF6F1` | `#1A0F0A` | Page background — warm linen, not pure white |
| `card` | `#EDE4D8` | `hsl(240 3.7% 15.9%)` | Card surfaces — parchment |

### Color Usage Rules

- **Page backgrounds**: Always `bg-brand-linen` — never pure white, never grey
- **Card backgrounds**: `bg-brand-parchment` — must read as distinct from linen background
- **Text primary**: `brand-espresso` for headings, `brand-text-primary` for body
- **Text secondary**: `brand-text-secondary` for captions, Peter's voice, supporting copy
- **Borders**: `border-brand-primary/10` for warm subtle borders
- **Accent backgrounds**: `bg-brand-primary/5` to `bg-brand-primary/10` for tinted surfaces
- **Celebration**: `brand-sand` for milestone moments, streaks, achievement indicators
- **Growth/progress**: `brand-growth` for forward movement, completion states
- **Dark emotional moments**: `brand-espresso` background for Couples Mode, Day 14 reveal — warm dark, never cold navy or pure black
- **Confetti colors**: `['#B5604E', '#FAF6F1', '#D4A96A']` in `ElegantConfetti.ts`

### Supplementary Colors (used inline)

| Color | Hex | Context |
|---|---|---|
| Nav inactive | `#9E8A86` | Bottom nav inactive icons and labels |
| Peter tagline | `#c2a8a0` | Peter fixed/mobile italic text |
| Score muted | `#8C827A` | Building-state description text |

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

Both options must move forward. There is no "stay stuck" option on the menu. The question is never "do you want to?" — always "which way would you like to?"

### Peter Appears Without a Container

Peter never sits inside a card, a box, or a background shape. He appears directly on the screen surface. His dialogue appears below him as italic text — no speech bubble box in most contexts. (The speech bubble card variant is only for the dashboard insight card.)

Peter is never reduced to a static icon or loading spinner. He is the emotional presence of the app.

### Dark Screens for Peak Emotional Moments

Couples Mode shared reflection and Day 14 profile reveal use a dark background — warm espresso `#2C1A14`, not cold navy or pure black. This creates intimacy and signals importance. The contrast says: *this moment is different.*

### The Linen-to-Parchment Layering

Background: `brand-linen` `#FAF6F1`
Card surfaces: `brand-parchment` `#EDE4D8`

The separation must be visible but never harsh. It reads like pages in a journal — layered warmth, not stark contrast. If parchment cards disappear into the linen background, increase parchment depth until the separation is clear at arm's length on a phone screen.

### No Stock Photography of Humans. Ever.

Peter is the emotional presence. Human photography of couples or people breaks the emotional contract of the app. If an illustration or image is needed — it is Peter, or it is an abstract warm shape. Never a stock photo of a couple, a person, or a lifestyle scene.

### Button Hierarchy — Three Patterns Only

- **Primary**: Full width, filled clay `#B5604E`, rounded, white text
- **Secondary**: Full width, outlined clay, no fill, clay text
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
min-h-screen bg-brand-linen pb-24
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
- **Card shadow**: `shadow-sm` default, `shadow-[0_8px_30px_rgb(181,96,78,0.15)]` for elevated CTA cards
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

- **Primary**: Full width, `bg-brand-primary text-white rounded-2xl` — filled clay
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

### Streak Indicator Tiers

| Days | Color | Background | Rationale |
|---|---|---|---|
| 1–6 | `brand-sand` | `bg-brand-sand/15` | Warm gold — early momentum |
| 7–13 | `brand-growth` | `bg-brand-growth/15` | Sage — building strength |
| 14–29 | `brand-primary` | `bg-brand-primary/10` | Clay — real achievement |
| 30+ | `brand-espresso` | `bg-brand-sand/20` | Deep warmth — mastery |

### Relationship Score Dimension Colors

| Dimension | Color | Rationale |
|---|---|---|
| Communication | `bg-brand-growth` | Forward movement, growth |
| Repair Speed | `bg-brand-primary` | Action, warmth |
| Emotional Safety | `bg-brand-sand` | Gold, value, light |
| Daily Ritual | `bg-brand-espresso/60` | Depth, consistency |

### Onboarding

- Container: `min-h-screen bg-brand-linen py-8 px-4` with `max-w-md` centered
- Progress indicator in header, back/next/skip controls in footer
- Peter appears in-flow above content, no container box

### Empty and Building States

- Centered layout with muted icon, serif heading, small warm description text
- Organic blur shape in background corner
- Warm, encouraging copy — never "no data available"

### Navigation

- **Mobile**: Fixed bottom nav, 4–5 items max
- **Active state**: `bg-brand-primary/10` pill, `brand-primary` color, bolder stroke
- **Inactive**: `#9E8A86` color, thinner stroke

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
| **Heartbeat pulse** | `scale: [1, 1.2, 1, 1.2, 1]` @ 600ms | HeartbeatButton send animation |

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
- Colors: `['#B5604E', '#FAF6F1', '#D4A96A']` — clay, linen, gold
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
- **Color contrast**: `#B5604E` on `#FAF6F1` = 4.3:1 (passes AA). `#2C1A14` on `#FAF6F1` = 14.1:1.
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

- CSS variable swaps for shadcn semantic tokens
- Brute-force overrides for non-semantic classes
- Background: warm near-black `#1A0F0A` — never pure black
- Cards: warm dark grey — never cold grey
- Colored backgrounds use `/30` opacity in dark mode

### Rules for New Components

- Prefer semantic tokens (`bg-card`, `text-foreground`) over raw colors
- If using raw colors, check `globals.css` for existing dark overrides
- Brand colors work in both modes without override
- Test both modes before shipping

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
- **For NLP language patterns and copy rules**: see `sparq-psychology/references/nlp-language-framework`

---

> **Deep reference**: `references/component-catalog.md` — full component specs with props, states, and usage examples
> **Deep reference**: `references/design-tokens.md` — complete token list with exact values
> **Deep reference**: `references/design-screens/` — approved Stitch screen baselines