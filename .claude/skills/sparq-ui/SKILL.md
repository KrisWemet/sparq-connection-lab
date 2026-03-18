---
name: sparq-ui
description: "Sparq Connection design system, component patterns, and UI standards. Use this skill whenever: building or modifying React components, creating new pages or layouts, styling elements, choosing colors or typography, implementing animations, building responsive layouts, adding accessibility features, creating loading/empty/error states, or making ANY visual change to the Sparq UI. If you're touching JSX, CSS, Tailwind classes, or shadcn components in the Sparq codebase — consult this skill first."
---

# Sparq Connection — UI & Design System

## 1. Design Philosophy

Sparq should feel like a **warm conversation with a supportive friend** — never a clinical tool, never a generic SaaS dashboard. Every visual choice serves emotional safety: soft animations, generous whitespace, rounded corners, gentle color transitions.

**Core principles:**
- **Warmth over efficiency** — Prefer soft gradients and organic shapes over hard edges and dense layouts
- **Breathing room** — Generous padding, relaxed line heights, space between elements. Content should never feel cramped.
- **Gentle motion** — Animations are subtle and purposeful. They guide attention, not demand it.
- **Progressive revelation** — Don't overwhelm. Show what matters now, reveal depth as users go deeper.
- **Emotional resonance** — Colors, typography, and micro-interactions should reinforce the feeling of growth and connection.

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

---

## 3. Color System

### Brand Palette (implemented in `tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#C0614A` | Primary buttons, active nav, CTA fills, accent borders |
| `brand-hover` | `#A3513D` | Hover state for primary |
| `brand-light` | `#FDF8F6` | Very light warm tint for backgrounds |
| `brand-linen` | `#FAF6F1` | Warm cream page backgrounds (replaces pure white) |
| `brand-sand` | `#E8A857` | Amber highlights, streak indicators, celebration |
| `brand-taupe` | `#3D2C28` | Deep warm brown for grounding text, headings |
| `brand-growth` | `#8FAF8A` | Soft sage green for progress bars, success states |

### Semantic Colors (implemented via CSS variables in `globals.css`)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#C86A58` | `hsl(210 40% 98%)` | shadcn primary — buttons, links |
| `primary-100` | `#FDF8F6` | — | Light primary tint |
| `primary-200` | `#F4EFEB` | — | Medium primary tint |
| `secondary` | `#F4EFEB` | `hsl(217.2 32.6% 17.5%)` | Secondary surfaces |
| `destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, destructive actions |
| `muted` | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Subdued text, disabled states |
| `background` | `hsl(0 0% 100%)` | `hsl(0 0% 0%)` | Page background |
| `card` | `hsl(0 0% 100%)` | `hsl(240 3.7% 15.9%)` | Card surfaces |

### Color Usage Rules

- **Page backgrounds**: `bg-brand-linen` or `bg-gradient-to-b from-white to-gray-50` — never pure white
- **Card backgrounds**: `bg-white` light / `bg-card` with dark mode support, or `bg-brand-linen` for Peter elements
- **Text**: `brand-taupe` (#3D2C28) for headings, `text-zinc-700/800` for body, `text-zinc-500` for secondary
- **Borders**: `border-brand-primary/10` for subtle warmth, `border-border` for neutral
- **Accent backgrounds**: `bg-brand-primary/5` to `bg-brand-primary/10` for tinted surfaces
- **Gradients**: `bg-gradient-to-br from-white to-brand-linen/30` for cards, `bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-primary/10` for interactive surfaces
- **Dark mode overrides**: Handled via `globals.css` `.dark` class overrides — see reference file for full list

---

## 4. Typography

### Font Families (implemented)

| Token | Stack | Usage |
|---|---|---|
| `font-serif` | `var(--font-serif)`, Georgia, Cambria, serif | Headings, Peter quotes, emotional text, large display numbers |
| `font-sans` | Inter, system sans-serif | Body text, labels, UI elements |

### Scale & Usage Patterns

| Class | Size | Usage |
|---|---|---|
| `text-xs` | 12px | Labels, timestamps, metadata, fine print |
| `text-sm` | 14px | Secondary body text, card descriptions |
| `text-[15px]` | 15px | Peter speech bubbles, insight quotes |
| `text-base` | 16px | Primary body text |
| `text-lg` | 18px | Card titles, section headings |
| `text-xl` | 20px | Page section headings |
| `text-2xl` | 24px | Page titles |
| `text-5xl` | 48px | Hero numbers (Relationship OS score) |

### Weight Patterns

- `font-semibold` — Card titles, labels, active nav text
- `font-medium` — Body with emphasis, button text, interactive labels
- `font-serif` + `italic` — Peter quotes, emotional/reflective content
- `font-bold` — Streak numbers, strong emphasis (sparingly)
- `tracking-widest uppercase text-xs` — Section labels ("Today's Focus", "Peter's Insight")

### Line Heights

- `leading-snug` (1.375) — Headings, short text blocks
- `leading-relaxed` (1.625) — Peter quotes, reflective text, long-form content
- Default (1.5) — Body text

---

## 5. Spacing & Layout

### Base Unit

Tailwind's 4px base. Primary spacers: `4` (16px), `5` (20px), `6` (24px), `8` (32px).

### Page Layout (implemented in `DashboardLayout`)

```
min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24
  └─ main.container.max-w-lg.mx-auto.px-4.py-6.space-y-5
```

- **Container**: `max-w-lg` (512px) for mobile-first card layouts, `max-w-md` (448px) for onboarding
- **Page padding**: `px-4` (16px) mobile, `px-6` (24px) tablet+
- **Card gap**: `space-y-5` (20px) between dashboard cards
- **Bottom padding**: `pb-24` to clear bottom nav (fixed, ~80px)

### Card Patterns

- **Border radius**: `rounded-3xl` (24px) for cards — the signature Sparq radius
- **Card padding**: `p-5` to `p-6` (20-24px)
- **Card shadow**: `shadow-sm` default, `shadow-[0_8px_30px_rgb(192,97,74,0.15)]` for elevated CTA cards
- **Card border**: `border border-brand-primary/10` for warm-tinted borders

### Dashboard Desktop Layout (implemented in `globals.css`)

```css
/* Mobile: single column, Peter above content */
/* Desktop (1024px+): Peter fixed right, content left, max-w-1100px */
.dashboard-main-wrapper { max-width: 1100px; }
.dashboard-main { max-width: 520px; }
.peter-fixed { right: 60px; top: 180px; width: 220px; }
```

### Bottom Nav (implemented)

- Fixed bottom, `z-50`, backdrop blur (`backdrop-blur-xl`)
- Safe area inset: `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`
- Background: `rgba(255,255,255,0.92)` with subtle brand-tinted top border
- Hidden on: `/`, `/auth`, `/login`, `/signup`, `/onboarding-flow`

---

## 6. Component Patterns

> Full specs with props, states, and usage examples: `references/component-catalog.md`

### Loading States
**Always use `<PeterLoading isLoading />`** — never bare spinners or "Loading..." text. Shows elegant triple-ring spinner on `bg-brand-linen` with rotating Peter wisdom tips in a speech-bubble card.

### Cards
All cards use `rounded-3xl`. Key variants:
- **Standard card**: `Card` from shadcn with `rounded-3xl border bg-card shadow-sm`
- **CTA card** (TodaysFocusCard): `bg-brand-primary rounded-[24px]` with white text and organic blur shapes
- **Insight card** (PetersInsight): `bg-brand-linen rounded-2xl` speech bubble with serif italic text
- **Score card**: `bg-gradient-to-br from-white to-brand-linen/30` with animated progress bars
- **Partner card**: `bg-brand-primary/5 backdrop-blur-md rounded-3xl` with subtle shadow
- **Skeleton**: `bg-white/80 rounded-3xl border border-brand-primary/10 h-48 animate-pulse backdrop-blur-md`

### Buttons
Customized from shadcn — `rounded-xl` default, `rounded-2xl` for large, `rounded-full` for icon. Key variants:
- **Primary**: `bg-primary text-primary-foreground`
- **Ghost CTA**: `bg-brand-primary/10 rounded-3xl` with heart/icon — used for emotional actions (HeartbeatButton)
- **Gradient CTA**: `bg-gradient-to-r from-blue-500 to-brand-primary` for upgrade prompts

### Onboarding
- Container: `min-h-screen bg-slate-50 py-8 px-4` with `max-w-md` centered card
- Progress indicator in header, back/next/skip controls in footer

### Empty/Building States
- Centered layout with muted icon, serif heading, small description text
- Organic blur shape in background (`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl`)
- Example: RelationshipScoreCard "building" state

### Navigation
- **Mobile**: Fixed bottom nav with 5 items (Home, Journeys, Daily, Skills, Profile)
- **Active state**: `bg-brand-primary/10` pill behind icon, `brand-primary` color, bolder stroke
- **Inactive**: `#9E8A86` color, thinner stroke

---

## 7. Animation Principles

### Core Rules
- **Subtle and purposeful** — Animations guide attention, never distract
- **200-400ms** for UI transitions, **500-700ms** for content entrances
- **Ease-out** for entrances, **ease-in-out** for persistent motion
- **`prefers-reduced-motion`** — Confetti uses `disableForReducedMotion: true`

### Framer Motion Patterns (implemented)

| Pattern | Props | Usage |
|---|---|---|
| **Page transition** | `y: 10→0, opacity: 0→1, scale: 0.99→1` @ 400ms | `PageTransition` component wraps all pages |
| **Card entrance** | `opacity: 0→1, y: 12-20→0` @ 300-400ms | Dashboard cards, staggered with delay |
| **Hover lift** | `whileHover={{ scale: 1.01-1.02 }}` | Interactive cards |
| **Tap feedback** | `whileTap={{ scale: 0.95-0.99 }}` | Buttons, tappable cards |
| **Spring motion** | `type: "spring", stiffness: 400, damping: 17` | Bouncy interactive elements |
| **Pulse accent** | `animate={{ scale: [1, 1.1, 1] }}` + repeat | "New!" badges, attention indicators |
| **Progress bar** | `width: 0→X%` @ 1s ease-out | Skill bars, score dimensions |
| **Heartbeat pulse** | `scale: [1, 1.2, 1, 1.2, 1]` @ 600ms | HeartbeatButton send animation |

### Page Transition Easing (implemented)
```typescript
ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier — fast start, gentle settle
```

### CSS Keyframe Animations (implemented in `globals.css`)

| Name | Effect | Duration | Usage |
|---|---|---|---|
| `fadeIn` | opacity 0→1 | 500ms | `.animate-fade-in` |
| `slideUp` | y+20→0, opacity 0→1 | 500ms | `.animate-slide-up` |
| `slideIn` | x-20→0, opacity 0→1 | 500ms | `.animate-slide-in` |
| `scale` | scale 0.9→1, opacity 0→1 | 500ms | `.animate-scale` |
| `bounce` | y+20→y-5→0, opacity 0→1 | 600ms | `.animate-bounce` (cubic-bezier) |
| `pulse` | scale 0.95↔1.05, opacity 0.8↔1 | 1.5s infinite | `.animate-pulse` |
| `peterFadeIn` | scale 0.92→1, opacity 0→1 | — | Peter-specific entrance |

**Stagger delays**: `.animate-delay-100` through `.animate-delay-500` (100ms increments).

### AnimatedContainer / AnimatedList (implemented)
- `AnimatedContainer` — CVA-based wrapper for CSS animations
- `AnimatedList` — Framer Motion staggered list with configurable `staggerDelay` (default 0.1s)

### Celebration Animations (implemented in `src/lib/ElegantConfetti.ts`)
- `fireElegantConfetti()` — 3-second continuous confetti from both sides, brand colors (`#C86A58`, `#F4EFEB`, `#8C827A`)
- `fireSubtleBurst()` — Single 40-particle burst, brand colors
- Both use `disableForReducedMotion: true` and `canvas-confetti`

---

## 8. Accessibility Requirements

### Minimum: WCAG 2.1 AA

- **Focus visible**: All interactive elements have `focus-visible:ring-2 focus-visible:ring-offset-2`
- **Touch targets**: Minimum 44px (`h-10 w-10` / `h-11` for buttons, `w-16` for nav items)
- **Color contrast**: Brand primary `#C0614A` on white = 4.52:1 (passes AA). Text `#3D2C28` on white = 12.2:1.
- **Screen reader labels**: Use `aria-label` on icon-only buttons, `sr-only` text where needed
- **Reduced motion**: Confetti respects `disableForReducedMotion`. CSS animations should include `@media (prefers-reduced-motion: reduce)` override.
- **Keyboard navigation**: All interactive elements reachable via Tab, activatable via Enter/Space

### Rules for New Components
- Never rely on color alone to convey information — pair with icon or text
- All images need `alt` text (Peter avatar images especially)
- Form inputs need associated labels (shadcn `<Label>` component)
- Error messages must be programmatically associated with inputs (`aria-describedby`)
- Bottom nav items need both icon and text label

---

## 9. Mobile-First Rules

### Breakpoints (Tailwind defaults)

| Name | Min-width | Usage |
|---|---|---|
| (default) | 0px | **Design here first** — 375px target |
| `md` | 768px | Tablet — increased padding, side-by-side layouts |
| `lg` | 1024px | Desktop — Peter moves to fixed sidebar, wider content |
| `2xl` | 1400px | Max container width |

### Mobile-First Patterns
- **Single column by default** — Multi-column only at `md`+
- **No hover-only states** — Every hover state has a tap/press equivalent
- **Touch-friendly spacing** — Cards have `p-5` minimum, gaps of `gap-3`+
- **Safe area awareness** — Bottom nav uses `env(safe-area-inset-bottom)` for notched devices
- **Full-bleed CTA cards** — Primary actions span full width on mobile
- **Peter layout**: In-flow above content on mobile, fixed right column on `lg`+

### What Not to Do
- Don't use `hidden` + `md:block` to create desktop-only features — design mobile experience first
- Don't put critical interactions in hover tooltips — they don't work on touch
- Don't make text smaller than `text-xs` (12px) — readability matters
- Don't stack more than 3 levels of nesting in card content on mobile

---

## 10. Dark Mode

Dark mode is implemented via `darkMode: ["class"]` in Tailwind config and extensive `.dark` overrides in `globals.css`.

### Current Approach (implemented)
- CSS variable swaps for shadcn semantic tokens (background, card, border, etc.)
- **Brute-force overrides** in `globals.css` for non-semantic classes (`.dark .bg-white`, `.dark .text-gray-700`, etc.)
- Background: pure black (`hsl(0 0% 0%)`)
- Cards: dark grey (`hsl(240 3.7% 15.9%)`)
- Colored backgrounds get `/30` opacity in dark mode (e.g., `.dark .bg-blue-50 → bg-blue-900/30`)

### Rules for New Components
- Prefer semantic tokens (`bg-card`, `text-foreground`, `border-border`) over raw colors
- If you must use raw colors (`bg-white`, `text-gray-700`), check `globals.css` for existing dark overrides
- Brand colors (`brand-primary`, `brand-sand`) work in both modes without override
- Test both modes — toggle via `<ThemeToggle>` component (`src/components/ui/theme-toggle.tsx`)

---

## 11. Texture & Organic Shapes

Sparq uses subtle organic elements to avoid the "flat SaaS" feel:

- **Noise texture**: `.texture-bg` utility — SVG fractal noise at 3% opacity
- **Blur orbs**: `absolute w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl/3xl` positioned in card corners
- **Gradient overlays**: `bg-gradient-to-br from-white to-brand-linen/30` on cards
- **Accent bars**: `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/40 to-brand-primary/10` on elevated cards

These create visual depth without heavy imagery.

---

## Cross-Skill References

- **For general frontend design principles and aesthetics**: see `frontend-design` skill
- **For Peter avatar poses, moods, and SVG specs**: see `sparq-peter` skill
- **For architecture and page structure**: see `sparq-architecture` skill
- **For psychology-driven content and personalization**: see `sparq-psychology` skill

---

> **Deep reference**: `references/component-catalog.md` — full component specs with props, states, and usage examples
> **Deep reference**: `references/design-tokens.md` — complete token list with exact values
