# Design Tokens — Complete Reference

All values sourced from the live codebase. Tokens marked **(proposed)** are not yet implemented but recommended for consistency.

---

## Colors

### Brand Palette (`tailwind.config.ts` → `theme.extend.colors.brand`)

| Token | Hex | HSL (approx) | Usage |
|---|---|---|---|
| `brand-primary` | `#C0614A` | 12° 47% 52% | Primary actions, active states, CTA fills |
| `brand-hover` | `#A3513D` | 12° 45% 44% | Hover state for primary elements |
| `brand-light` | `#FDF8F6` | 20° 64% 98% | Very light warm tint backgrounds |
| `brand-linen` | `#FAF6F1` | 33° 56% 96% | Warm cream page background, Peter cards |
| `brand-sand` | `#E8A857` | 35° 77% 63% | Amber highlights, streak icons, celebrations |
| `brand-taupe` | `#3D2C28` | 14° 22% 20% | Deep warm brown for grounding text |
| `brand-growth` | `#8FAF8A` | 113° 18% 61% | Sage green for progress, success |

### Primary Shades (`tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `primary` (DEFAULT) | `#C86A58` | shadcn primary — buttons, links |
| `primary-foreground` | `#FFFFFF` | Text on primary |
| `primary-100` | `#FDF8F6` | Lightest primary tint |
| `primary-200` | `#F4EFEB` | Medium primary tint (gradients) |

### Secondary

| Token | Hex | Usage |
|---|---|---|
| `secondary` (DEFAULT) | `#F4EFEB` | Secondary surfaces, subtle backgrounds |
| `secondary-foreground` | `#1F1235` | Text on secondary |

### CSS Custom Properties (`:root` in `globals.css`)

| Property | Light Value | Dark Value |
|---|---|---|
| `--background` | `0 0% 100%` | `0 0% 0%` |
| `--foreground` | `222.2 84% 4.9%` | `0 0% 100%` |
| `--card` | `0 0% 100%` | `240 3.7% 15.9%` |
| `--card-foreground` | `222.2 84% 4.9%` | `0 0% 100%` |
| `--popover` | `0 0% 100%` | `0 0% 10%` |
| `--popover-foreground` | `222.2 84% 4.9%` | `0 0% 100%` |
| `--primary` | `222.2 47.4% 11.2%` | `210 40% 98%` |
| `--primary-foreground` | `210 40% 98%` | `222.2 47.4% 11.2%` |
| `--secondary` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `215 20.2% 65.1%` |
| `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| `--accent-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `210 40% 98%` | `210 40% 98%` |
| `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` |
| `--input` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` |
| `--ring` | `222.2 84% 4.9%` | `212.7 26.8% 83.9%` |
| `--radius` | `0.5rem` | `0.5rem` |

### Sidebar CSS Properties

| Property | Light Value | Dark Value |
|---|---|---|
| `--sidebar-background` | `0 0% 98%` | `0 0% 5%` |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` |
| `--sidebar-primary-foreground` | `0 0% 98%` | `0 0% 100%` |
| `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--sidebar-accent-foreground` | `240 5.9% 10%` | `240 4.8% 95.9%` |
| `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` |

### Supplementary Colors (used inline, not in config)

| Color | Hex | Context |
|---|---|---|
| Nav inactive | `#9E8A86` | Bottom nav inactive icons + labels |
| Peter tagline | `#c2a8a0` | Peter fixed/mobile italic text |
| Score muted | `#8C827A` | Building-state description text |
| Confetti set | `#C86A58, #F4EFEB, #8C827A` | `ElegantConfetti.ts` brand palette |

### Semantic Color Mapping (used in components)

| Meaning | Light Class | Dark Override (globals.css) |
|---|---|---|
| Progress/success | `text-green-500`, `bg-green-50/100` | `bg-green-900/30` |
| Warning/streak | `text-amber-500`, `bg-amber-50/100` | `bg-amber-900/30` |
| Info/communication | `text-blue-500`, `bg-blue-50/100` | `bg-blue-900/30` |
| Love/emotional | `text-rose-500`, `bg-rose-50/100` | `bg-rose-900/30` |
| Depth/insight | `text-purple-500`, `bg-purple-50/100` | `bg-purple-900/30` |

---

## Typography

### Font Families

| Token | CSS | Stack |
|---|---|---|
| `font-serif` | `var(--font-serif)` | Georgia, Cambria, "Times New Roman", Times, serif |
| `font-sans` | (Tailwind default) | Inter, system-ui, sans-serif |

> `--font-serif` CSS variable should be set in `_document.tsx` or `globals.css`. Currently falls back to Georgia.

### Font Size Scale (Tailwind defaults)

| Class | Size | Line Height | Common Use |
|---|---|---|---|
| `text-[10px]` | 10px | — | Fine print (social proof, legal) |
| `text-xs` | 12px | 16px | Labels, timestamps, section headers (uppercase) |
| `text-sm` | 14px | 20px | Secondary body, descriptions, card metadata |
| `text-[15px]` | 15px | — | Peter speech (custom size for reading comfort) |
| `text-base` | 16px | 24px | Primary body text |
| `text-lg` | 18px | 28px | Card titles, section headings |
| `text-xl` | 20px | 28px | Page section headings |
| `text-2xl` | 24px | 32px | Page titles |
| `text-5xl` | 48px | 1 | Hero numbers (score display) |

### Font Weight

| Class | Weight | Usage |
|---|---|---|
| `font-normal` | 400 | Body text (default) |
| `font-medium` | 500 | Emphasized body, button text, interactive labels |
| `font-semibold` | 600 | Card titles, active nav labels, section headers |
| `font-bold` | 700 | Streak numbers, strong emphasis (use sparingly) |

### Letter Spacing

| Class | Usage |
|---|---|
| `tracking-tight` | Large serif headings ("Your Shared Reflection") |
| `tracking-wide` | Dimension labels in score cards |
| `tracking-widest` | Uppercase section labels ("TODAY'S FOCUS") |

---

## Spacing

### Tailwind Scale (base unit = 4px)

| Token | Value | Common Use |
|---|---|---|
| `1` | 4px | Tight inline gaps |
| `1.5` | 6px | Card header vertical spacing |
| `2` | 8px | Icon-to-text gaps, small padding |
| `3` | 12px | Card content gaps, button padding |
| `4` | 16px | Standard page padding (mobile), card inner padding |
| `5` | 20px | Dashboard card padding, card gaps |
| `6` | 24px | Card padding (generous), section spacing |
| `8` | 32px | Section dividers, Peter mobile padding-top |
| `12` | 48px | Large vertical spacing |
| `24` | 96px | Bottom page padding (to clear nav) |

### Container Widths

| Class | Width | Usage |
|---|---|---|
| `max-w-sm` | 384px | Peter insight speech bubble |
| `max-w-md` | 448px | Onboarding container |
| `max-w-lg` | 512px | Dashboard main content |
| `max-w-1100px` | 1100px | Dashboard wrapper (desktop, custom in globals.css) |
| `2xl` container | 1400px | Max container width (tailwind.config.ts) |

---

## Border Radius

### Tailwind Config (`--radius: 0.5rem`)

| Class | Computed | Usage |
|---|---|---|
| `rounded-sm` | 4px | Small internal elements |
| `rounded-md` | 6px | Input fields |
| `rounded-lg` | 8px | Small buttons (`size="sm"`) |
| `rounded-xl` | 12px | Default buttons |
| `rounded-2xl` | 16px | Large buttons, Peter insight bubble |
| `rounded-3xl` | 24px | **Signature Sparq radius** — all cards, containers |
| `rounded-full` | 9999px | Icon buttons, avatar circles, pills, nav active indicator |
| `rounded-[24px]` | 24px | CTA cards (explicit, matches rounded-3xl) |

---

## Shadows

| Pattern | Usage |
|---|---|
| `shadow-sm` | Default card shadow, subtle elevation |
| `shadow-[0_8px_30px_rgb(192,97,74,0.15)]` | Elevated CTA cards (TodaysFocusCard) — warm brand-tinted shadow |
| `shadow-[0_8px_30px_rgb(200,106,88,0.04)]` | Very subtle warm shadow (PartnerSynthesisCard) |
| `shadow-[0_4px_24px_rgba(200,106,88,0.06)]` | Medium warm shadow (score building state) |
| `shadow-sm` + `border border-brand-primary/10` | Standard warm card treatment |

---

## Animation Durations & Easings

### CSS Animations (defined in `globals.css`)

| Name | Duration | Easing | Fill |
|---|---|---|---|
| `fadeIn` | 500ms | ease-out | forwards |
| `slideUp` | 500ms | ease-out | forwards |
| `slideIn` | 500ms | ease-out | forwards |
| `scale` | 500ms | ease-out | forwards |
| `bounce` | 600ms | cubic-bezier(0.175, 0.885, 0.32, 1.275) | forwards |
| `pulse` | 1500ms | ease-in-out | infinite |
| `peterFadeIn` | — | — | — |

### Tailwind Config Animations

| Name | Duration | Easing |
|---|---|---|
| `slide-up` | 300ms | ease-out |
| `slide-down` | 300ms | ease-out |
| `slide-left` | 300ms | ease-out |
| `slide-right` | 300ms | ease-out |
| `fade-in` | 300ms | ease-out |

### Framer Motion Standards

| Context | Duration | Easing |
|---|---|---|
| Page transition | 400ms | `[0.22, 1, 0.36, 1]` custom cubic-bezier |
| Card entrance | 300-400ms | default (ease-out) |
| Hover scale | instant | spring: stiffness 400, damping 17 |
| Tap feedback | instant | spring: stiffness 400, damping 10 |
| Progress bar fill | 1000ms | ease-out |
| Peter loading spinner | 1.5-3s | linear (infinite rotation) |

### Stagger Delay Classes

| Class | Delay |
|---|---|
| `.animate-delay-100` | 100ms |
| `.animate-delay-200` | 200ms |
| `.animate-delay-300` | 300ms |
| `.animate-delay-400` | 400ms |
| `.animate-delay-500` | 500ms |

---

## Z-Index Scale

| Value | Usage |
|---|---|
| `z-0` | Decorative background elements (blur orbs, organic shapes) |
| `z-10` | Card content above decorative elements |
| `z-20` | Peter fixed sidebar (desktop) |
| `z-50` | Bottom navigation |
| `z-[100]` | PeterLoading full-screen overlay, confetti |

---

## Opacity Patterns

| Pattern | Usage |
|---|---|
| `/5` | Very subtle tinted backgrounds (`bg-brand-primary/5`) |
| `/10` | Light tinted borders, subtle backgrounds (`border-brand-primary/10`) |
| `/20` | Icon container backgrounds on dark surfaces (`bg-white/20`) |
| `/30` | Dark mode colored backgrounds (`bg-blue-900/30`) |
| `/40` | Accent gradient endpoints (`from-brand-primary/40`) |
| `/60` | SVG strokes (`text-brand-primary/60`) |
| `/80` | Near-full-opacity text overlays (`text-white/80`) |
| `/92` | Bottom nav glass effect (`rgba(255,255,255,0.92)`) |

---

## Gradient Patterns (implemented)

| Pattern | Usage |
|---|---|
| `bg-gradient-to-b from-white to-gray-50` | Page background |
| `bg-gradient-to-br from-white to-brand-linen/30` | Card surfaces (score, insights) |
| `bg-gradient-to-br from-white to-primary-100` | DailyConnect card |
| `bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-primary/10` | HeartbeatButton surface |
| `bg-gradient-to-r from-primary-100 to-white` | Streak card |
| `bg-gradient-to-r from-blue-500 to-brand-primary` | Premium upgrade CTA |
| `bg-gradient-to-r from-purple-500 to-pink-500` | Ultimate upgrade CTA |
| `linear-gradient(145deg, #FFFFFF 0%, #FDF8F6 100%)` | Inline style for score building state |

---

## Utility Classes (custom, in `globals.css`)

| Class | Effect |
|---|---|
| `.texture-bg` | SVG fractal noise overlay at 3% opacity — subtle paper texture |
| `.animate-fade-in` | 500ms fade-in with forwards fill |
| `.animate-slide-up` | 500ms slide-up + fade with forwards fill |
| `.animate-slide-in` | 500ms slide-in from left + fade with forwards fill |
| `.animate-scale` | 500ms scale 0.9→1 + fade with forwards fill |
| `.animate-bounce` | 600ms bouncy entrance (cubic-bezier) |
| `.animate-pulse` | 1.5s infinite pulsing scale + opacity |
