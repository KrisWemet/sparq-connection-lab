# Component Catalog — Detailed Specs

Every component documented below exists in the codebase (checked 2026-10-02; deleted components were removed from this file rather than kept as stale specs). Each entry includes: location, props, visual states, responsive behavior, animation, accessibility notes, and a usage example.

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

## Dashboard & journal cards (current)

The live dashboard and journal cards are in `src/components/dashboard/` — read the file before reusing a pattern: `PeterGreeting`, `DailyPrimeCard` (anchored micro-prime), `ExperimentsCard` (the user's experiments / missions + their reasons), `WeeklyMirrorCard`, `ThirtyDayMirrorCard`, `NorthStarCard`, `IdentityArcCard` (the user's own words only), `GrowthThread`, `CsiPulseCard` / `CsiTrajectoryCard`, `NeutralObserverCard`, `WelcomeBackCard`, `HomeDestinationStrip`. Onboarding steps are in `src/components/onboarding/` (`ConsentGate`, `QuestionFlow`, `HabitAnchorPick`, `PeterSession`, `Day14Graduation`, …).

### Doctrine for cards, progress and celebration (constitution v1.2 §5A, §10)

- **Progress displays are process influence** — they make real progress visible. They never grade, rank, compare partners or users, or show a loss ("streak broken", "you missed 3 days").
- **Streaks** celebrate a run while it lasts and welcome a return; no countdowns, no "don't lose it", and no upgrade prompt triggered by a streak milestone.
- **Celebrations** point to evidence and hand the meaning back to the user; Peter never claims to be proud or to have missed them.
- **No embedded commands** or emphasis tricks in card copy; no copy, imagery or ordering that favors a relationship outcome (stay, leave, forgive, reconcile).
- **Upgrade prompts** describe more depth plainly; never scarcity, urgency or guilt, and never on a safety tool.

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
- **Active**: `bg-brand-primary/10` pill behind icon, icon color `#C56B4D`, stroke 2.5, label `#C56B4D`
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

## Composing New Components — Checklist

When building a new Sparq component, follow these patterns:

1. **Cards**: Start with `rounded-3xl`, add `border border-brand-primary/10` for warmth
2. **Backgrounds**: Use `bg-brand-linen` or gradient, not flat white
3. **Text hierarchy**: Serif for headings/emotional text, sans for UI/labels
4. **Labels**: `bar-title`, `section-title` or `note-label` from `globals.css` — never ALL-CAPS tracked labels
5. **Animation**: Wrap in `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`
6. **Interactive**: Add `whileHover={{ scale: 1.01 }}` and `whileTap={{ scale: 0.98 }}`
7. **Organic shapes**: Add a `absolute w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl` in a corner
8. **Loading**: Return `<PeterLoading isLoading />` — never skeleton alone
9. **Icons**: Lucide React, 18px inline, `brand-primary` color or contextual
10. **Spacing**: `p-5` to `p-6` card padding, `space-y-5` between cards, `pb-24` page bottom
11. **Dark mode**: Use semantic tokens when possible, check `globals.css` for raw color overrides
12. **Accessibility**: `focus-visible:ring-2`, 44px touch targets, `aria-label` on icon buttons
