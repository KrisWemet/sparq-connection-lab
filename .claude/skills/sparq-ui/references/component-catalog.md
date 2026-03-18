# Component Catalog — Detailed Specs

Every component documented below exists in the codebase. Each entry includes: location, props, visual states, responsive behavior, animation, accessibility notes, and a usage example.

---

## Loading State: PeterLoading

**File**: `src/components/PeterLoading.tsx`

### Props
```typescript
interface PeterLoadingProps {
  isLoading: boolean;
}
```

### Visual Description
Full-screen overlay on `bg-brand-linen` with backdrop blur. Centered content: triple concentric ring spinner (rotating at different speeds/directions) + tip card with serif italic Peter quote. Tip card has `bg-white/80`, `rounded-3xl`, subtle gradient accent bar at top.

### Animation
- Outer container: fade-in 500ms ease-in-out
- Content: scale 0.95→1 + y 10→0 + opacity, 600ms ease-out with 200ms delay
- Spinner rings: continuous rotation at 3s/2s/1.5s (outer/middle/inner), linear
- Random tip selected on each mount

### States
- `isLoading={true}`: Visible with AnimatePresence enter
- `isLoading={false}`: AnimatePresence exit (fade-out)

### Accessibility
- z-index 100 covers entire viewport
- Tip provides context while waiting (not just a spinner)

### Usage
```tsx
import { PeterLoading } from "@/components/PeterLoading";

// In any page or layout:
if (loading) return <PeterLoading isLoading />;
```

### Rule
**ALWAYS use PeterLoading for loading states.** Never use bare spinners, skeleton screens alone, or "Loading..." text as the primary loading indicator.

---

## Card: Standard (shadcn)

**File**: `src/components/ui/card.tsx`

### Props
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
// Also: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
```

### Visual
`rounded-3xl border bg-card text-card-foreground shadow-sm`. The signature 24px border radius is the most distinctive Sparq visual trait.

### Sub-components
| Component | Default Classes |
|---|---|
| `CardHeader` | `flex flex-col space-y-1.5 p-6` |
| `CardTitle` | `text-lg font-semibold leading-none tracking-tight` |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `flex items-center p-6 pt-0` |

### Usage
```tsx
<Card className="border-brand-primary/10">
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## Card: CTA (TodaysFocusCard)

**File**: `src/components/dashboard/TodaysFocusCard.tsx`

### Props
```typescript
interface TodaysFocusCardProps {
  actionText: string;
}
```

### Visual
Full-width button with `bg-brand-primary`, `rounded-[24px]`, warm brand shadow. White text with serif font for action text. Leaf icon in frosted circle, arrow button on right. Organic white blur shape in top-right corner.

### Animation
- `whileHover={{ scale: 1.01 }}`
- `whileTap={{ scale: 0.99 }}`
- Arrow translates right on group hover

### Responsive
- Padding: `p-5 md:p-6`
- Full width on all breakpoints

### Accessibility
- Renders as `<motion.button>` — keyboard accessible
- `text-left` for readable content alignment
- High contrast: white on `#C0614A` (7.2:1)

---

## Card: Peter Insight (PetersInsightCard)

**File**: `src/components/dashboard/PetersInsightCard.tsx`

### Props
```typescript
interface PetersInsightCardProps {
  insight: string;
}
```

### Visual
Speech bubble with `bg-brand-linen rounded-2xl rounded-tr-sm`. Rotated square creates speech tail pointing up-right. Serif italic text in `brand-taupe`. Positioned right-aligned (`ml-auto mr-4`).

### Layout
- Max width: `max-w-sm`
- Margin: `ml-auto mr-4 md:mr-8 mb-6`
- Positioned to appear as if Peter is speaking

---

## Card: Relationship Score (RelationshipScoreCard)

**File**: `src/components/dashboard/RelationshipScoreCard.tsx`

### States

**Loading**: Skeleton — `bg-white/80 rounded-3xl border border-brand-primary/10 shadow-sm p-6 h-48 animate-pulse backdrop-blur-md`

**Building** (not enough data): Centered message with muted `Activity` icon, serif heading, description text. Organic blur orb in top-right. Gradient background via inline style.

**Active**: Full score card with:
- Header: serif title + mini SVG sparkline
- Hero number: `text-5xl font-serif` with trend indicator pill
- 4 dimension progress bars with animated width (Framer Motion, 1s ease-out)
- Background: `bg-gradient-to-br from-white to-brand-linen/30` with blur orb

### Animation
- Container: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Progress bars: `initial={{ width: 0 }} animate={{ width: "X%" }}` with 1s ease-out

### Dimension Colors
| Dimension | Color |
|---|---|
| Communication | `bg-blue-500` |
| Repair Speed | `bg-green-500` |
| Emotional Safety | `bg-purple-500` |
| Daily Ritual | `bg-amber-500` |

---

## Card: Partner Synthesis (PartnerSynthesisCard)

**File**: `src/components/dashboard/PartnerSynthesisCard.tsx`

### Visual
`bg-brand-primary/5 backdrop-blur-md rounded-3xl` with warm shadow. Icon in `bg-white/60 rounded-2xl` container. Serif italic quote for synthesis text. Privacy disclaimer at bottom.

### Animation
- `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}` at 400ms

---

## Interactive: HeartbeatButton

**File**: `src/components/dashboard/HeartbeatButton.tsx`

### Visual
Full-width button with gradient brand background (`from-brand-primary/10 via-brand-primary/5 to-brand-primary/10`), `rounded-3xl`. Heart icon + serif "Thinking of you" label in `brand-primary`.

### Animation
- `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.95 }}`
- **On press**: Expanding ripple circle (`scale: 0.5→3, opacity: 0.5→0`), heart pulses (`scale: [1, 1.2, 1, 1.2, 1]`)
- Haptic feedback via `navigator.vibrate([50, 100, 50])` when supported

### Feedback
- Toast notification: "Thinking of you sent." with heart icon

---

## Gamification: StreakIndicator

**File**: `src/components/StreakIndicator.tsx`

### Props
```typescript
interface StreakIndicatorProps {
  streak: number;
  onShare?: () => void;
}
```

### Visual Tiers
| Days | Icon | Color | Background |
|---|---|---|---|
| 1-6 | Flame | `text-orange-500` | `bg-orange-100` |
| 7-13 | Star | `text-blue-500` | `bg-blue-100` |
| 14-29 | Medal | `text-brand-primary/80` | `bg-brand-primary/10` |
| 30+ | Trophy | `text-amber-500` | `bg-amber-100` |

### Animation
- Container: slide-up spring entrance
- Icon: `whileHover={{ scale: 1.2, rotate: 10 }}`
- Streak number: keyframe scale pulse (`[1, 1.2, 1]`) with delay
- Embedded command text: fade-in with 1s delay
- Premium upsell: height + opacity reveal with 2s delay

### Conditional Sections
- `streak === 0`: renders nothing
- `streak >= 3 && !isPremium`: shows premium upgrade prompt
- `streak >= 10 && isPremium`: shows ultimate upgrade prompt

---

## Navigation: BottomNav

**File**: `src/components/bottom-nav.tsx`

### Items
| Icon | Label | Path |
|---|---|---|
| Home | Home | `/dashboard` |
| BookOpen | Journeys | `/journeys` |
| MessageCircle | Daily | `/daily-growth` |
| TreePine | Skills | `/skill-tree` |
| User2 | Profile | `/profile` |

### Visual
- Fixed bottom, `z-50`
- Glass effect: `rgba(255,255,255,0.92)` + `backdrop-blur-xl`
- Top border: `rgba(200,106,88,0.1)` — very subtle warm tint
- Shadow: `0 -4px 20px rgba(200,106,88,0.04)`
- Safe area: `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`

### States
- **Active**: `bg-brand-primary/10` pill behind icon, icon color `#C0614A`, stroke 2.5, label `#C0614A`
- **Inactive**: icon color `#9E8A86`, stroke 1.8, label `#9E8A86`

### Hidden Pages
Returns `null` for: `/`, `/auth`, `/login`, `/signup`, `/onboarding-flow`

---

## Transition: PageTransition

**File**: `src/components/PageTransition.tsx`

### Props
```typescript
interface PageTransitionProps {
  children: React.ReactNode;
}
```

### Animation
- Uses `AnimatePresence mode="wait"` keyed on `router.pathname`
- Enter: `opacity: 0→1, y: 10→0, scale: 0.99→1` at 400ms
- Exit: `opacity: 1→0, y: 0→-10, scale: 1→0.99` at 400ms
- Custom easing: `[0.22, 1, 0.36, 1]` — fast start, gentle settle

---

## Animation: AnimatedContainer / AnimatedList

**File**: `src/components/ui/animated-container.tsx`

### AnimatedContainer
CVA-based wrapper with variant/duration/delay props. Uses CSS animation classes.

```tsx
<AnimatedContainer variant="slideUp" duration="slow" delay="medium">
  <Card>...</Card>
</AnimatedContainer>
```

### AnimatedList
Framer Motion staggered list. Wraps children and applies entrance animations with configurable stagger delay.

```tsx
<AnimatedList variant="fadeIn" staggerDelay={0.1} duration="normal" className="space-y-4">
  <Card>First</Card>
  <Card>Second</Card>
  <Card>Third</Card>
</AnimatedList>
```

### Variants
`fadeIn` (y: 10→0), `slideUp` (y: 20→0), `slideDown` (y: -20→0), `slideLeft` (x: 20→0), `slideRight` (x: -20→0)

---

## Button: Standard (shadcn customized)

**File**: `src/components/ui/button.tsx`

### Props
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

### Size → Radius Mapping
| Size | Height | Radius | Padding |
|---|---|---|---|
| `default` | 40px | `rounded-xl` (12px) | `py-2 px-4` |
| `sm` | 36px | `rounded-lg` (8px) | `px-3` |
| `lg` | 44px | `rounded-2xl` (16px) | `px-8` |
| `icon` | 40×40px | `rounded-full` | — |

### Focus
`focus-visible:ring-2 focus-visible:ring-offset-2` on all variants.

---

## Celebration: ElegantConfetti

**File**: `src/lib/ElegantConfetti.ts`

### Functions
```typescript
fireElegantConfetti()  // 3-second continuous confetti from both edges
fireSubtleBurst()      // Single 40-particle center burst
```

### Colors
Brand palette: `['#C86A58', '#F4EFEB', '#8C827A']`

### Usage
```tsx
import { fireElegantConfetti, fireSubtleBurst } from "@/lib/ElegantConfetti";

// On achievement unlock, day completion, graduation
fireElegantConfetti();

// On smaller wins — streak milestone, exercise complete
fireSubtleBurst();
```

Both use `disableForReducedMotion: true` and render at `z-index: 100`.

---

## Layout: DashboardLayout

**File**: `src/components/dashboard/DashboardLayout.tsx`

### Props
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
}
```

### Behavior
- `isLoading={true}`: Returns `<PeterLoading isLoading />`
- `isLoading={false}`: Renders `DashboardHeader` + main content area

### Layout
```
min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24
  └─ DashboardHeader
  └─ main.container.max-w-lg.mx-auto.px-4.py-6.space-y-5
       └─ {children}
```

### Desktop Enhancement (globals.css)
At `lg` (1024px+): Peter moves to fixed right position, content area constrains to 520px within 1100px wrapper.

---

## Layout: OnboardingContainer

**File**: `src/components/onboarding/OnboardingContainer.tsx`

### Props
```typescript
interface OnboardingContainerProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onSkip: () => void;
}
```

### Layout
```
min-h-screen bg-slate-50 py-8 px-4
  └─ max-w-md mx-auto
       └─ OnboardingHeader (step indicator)
       └─ Card
            └─ CardContent pt-6 → {children}
            └─ CardFooter → OnboardingControls (back/next/skip/complete)
```

---

## Composing New Components — Checklist

When building a new Sparq component, follow these patterns:

1. **Cards**: Start with `rounded-3xl`, add `border border-brand-primary/10` for warmth
2. **Backgrounds**: Use `bg-brand-linen` or gradient, not flat white
3. **Text hierarchy**: Serif for headings/emotional text, sans for UI/labels
4. **Uppercase labels**: `text-xs font-semibold text-brand-primary uppercase tracking-widest`
5. **Animation**: Wrap in `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`
6. **Interactive**: Add `whileHover={{ scale: 1.01 }}` and `whileTap={{ scale: 0.98 }}`
7. **Organic shapes**: Add a `absolute w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl` in a corner
8. **Loading**: Return `<PeterLoading isLoading />` — never skeleton alone
9. **Icons**: Lucide React, 18px inline, `brand-primary` color or contextual
10. **Spacing**: `p-5` to `p-6` card padding, `space-y-5` between cards, `pb-24` page bottom
11. **Dark mode**: Use semantic tokens when possible, check `globals.css` for raw color overrides
12. **Accessibility**: `focus-visible:ring-2`, 44px touch targets, `aria-label` on icon buttons
