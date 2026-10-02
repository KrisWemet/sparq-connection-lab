# Sparq Design Tokens

## Colour

`src/styles/globals.css` is the colour source of truth. `tailwind.config.ts` exposes these variables through the existing Tailwind/shadcn system with alpha support. Do not add independent component palettes.

Plum means understanding; coral means connection; gold means growth. Ivory is the canvas and stone is the raised surface. Keep coral and gold selective. Error, warning and success roles remain distinguishable from brand accents.

### Semantic palette

| Role | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#FAF7F2` | `#211925` | Canvas |
| `foreground` | `#241D27` | `#FAF7F2` | Main text |
| `card` | `#EEE8E3` | `#342A38` | Stone surface |
| `card-foreground` | `#241D27` | `#FAF7F2` | Card text |
| `popover` | `#FFFDFA` | `#3D3142` | Elevated surfaces and menus |
| `primary` | `#4B2E57` | `#7D608C` | Primary action fill |
| `primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary action |
| `primary-hover` | `#3A2244` | `#896B97` | Primary hover fill |
| `primary-emphasis` | `#4B2E57` | `#C4A6D1` | Readable plum text/icons |
| `secondary` | `#EEE8E3` | `#342A38` | Secondary surfaces |
| `secondary-foreground` | `#241D27` | `#FAF7F2` | Secondary surface text |
| `muted` | `#EEE8E3` | `#342A38` | Quiet surfaces |
| `muted-foreground` | `#685C6A` | `#C3B6C5` | Supporting text |
| `accent` | `#E8DFEC` | `#49374F` | Selection and reflection tint |
| `accent-foreground` | `#4B2E57` | `#FAF7F2` | Selection text |
| `border` | `#DED5CF` | `#5E4B65` | Decorative dividers |
| `input` | `#8D7B91` | `#9A84A3` | Visible control boundaries |
| `ring` | `#4B2E57` | `#C4A6D1` | Keyboard focus |
| `connection` | `#E97868` | `#E97868` | Coral fill |
| `connection-foreground` | `#241D27` | `#241D27` | Text on coral |
| `connection-emphasis` | `#A8452F` | `#F29A8C` | Coral text/icons |
| `connection-subtle` | `#FBE9E5` | `#472D31` | Connection tint |
| `growth` | `#F3B55A` | `#F3B55A` | Gold fill |
| `growth-foreground` | `#241D27` | `#241D27` | Text on gold |
| `growth-emphasis` | `#8A5E14` | `#F3B55A` | Gold text/icons |
| `growth-subtle` | `#F9ECD7` | `#443622` | Growth tint |
| `destructive` | `#A73547` | `#A73547` | Error/destructive fill |
| `destructive-foreground` | `#FFFFFF` | `#FFFFFF` | Text on destructive fill |
| `destructive-emphasis` | `#A73547` | `#FFA8B8` | Error messages |
| `destructive-subtle` | `#FBE7EB` | `#492830` | Error tint |
| `success` | `#346646` | `#346646` | Success fill |
| `success-emphasis` | `#346646` | `#B6D5BE` | Success messages |
| `success-subtle` | `#E3EEE5` | `#293D30` | Success tint |
| `warning` | `#F3B55A` | `#F3B55A` | Warning fill |
| `warning-emphasis` | `#805610` | `#F3B55A` | Warning messages |
| `warning-subtle` | `#F9ECD7` | `#443622` | Warning tint |
| `calm` | `#9CB5A0` | `#9CB5A0` | Quiet sage accent |
| `inverse` | `#241D27` | `#241D27` | Fixed intimate dark surface |
| `inverse-foreground` | `#FAF7F2` | `#FAF7F2` | Text on inverse surface |

### Compatibility and roles

- `brand-linen`/`brand-ivory` → background; `brand-parchment`/`brand-stone`/`brand-card` → card; `brand-light` → popover.
- `brand-primary` → primary fill; `brand-hover` → primary hover fill. Their **text utilities** use primary emphasis and emphasis hover so they remain readable in dark mode.
- `brand-text-primary` → foreground; `brand-text-secondary`/`brand-taupe` → muted foreground. The supplied mauve `#776B78` remains the brand swatch; supporting copy uses `#685C6A` to meet AA on stone.
- `brand-espresso` retains the fixed inverse fill. `text-brand-espresso` uses foreground, so existing body copy responds to the theme.
- `brand-coral` → connection; `brand-gold`/`brand-sand`/`brand-growth`/`brand-warm-highlight` → growth. Their text utilities use the appropriate emphasis variant. Prefer explicit `connection` and `growth` tokens for new colour work.
- `understand` aliases primary emphasis; `insight` aliases growth. `calm` is the quiet sage counterweight; success remains a distinct green status.
- `primary-100`/`primary-200` retain the background/card aliases. Sidebar variables alias the same semantic colours.
- `shadow` is near-black plum. Existing shadow dimensions/opacity remain unchanged.

### Accessibility

Use dark-plum text on coral and gold fills; white text fails on both. Use emphasis tokens for coloured text, without lowering its opacity. Measured normal-text pairs meet 4.5:1 in both themes; input borders and focus rings exceed 3:1 against their surrounding surfaces. Disabled controls retain their existing state treatment and are not active text targets.

| Pair | Light contrast | Dark contrast |
|---|---|---|
| Main text / canvas | 15.35:1 | 15.97:1 |
| Supporting text / stone card | 5.20:1 | 7.05:1 |
| Primary action label / fill | 11.49:1 | 5.35:1 |
| Primary action label / hover | 14.07:1 | 4.55:1 |
| Dark plum / coral | 5.74:1 | 5.74:1 |
| Dark plum / gold | 9.04:1 | 9.04:1 |
| Input border / card | 3.22:1 | 4.04:1 |

### Dark mode

The existing `.dark` class uses plum-black canvas, plum stone surfaces, lighter plum emphasis/focus, and restrained coral and gold accents. It is not an inversion. All semantic and legacy brand aliases resolve in either scope, including nested dark screens. This task does not add a theme switch or provider.

### Logo and artwork

The existing Sparq mark remains deep plum with its existing coral-to-gold spark; only its inline colours reference tokens. The static favicon matches the same supplied palette. Natural Peter artwork, metaphor illustrations, and photographic assets keep their specific colours.

---

The existing `TONE` moment helper keeps its category logic. `brand-coral-soft`, `brand-gold-soft` and `brand-quiet` are semantic surface aliases; coral/gold button labels use their fixed dark foreground roles in both themes.

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

Preserve the existing elevation dimensions. Use `hsl(var(--shadow)/opacity)` for custom shadows; `shadow` resolves to near-black plum. Standard `shadow-sm` remains the default card elevation. Do not add glow or heavier shadows to introduce the palette.

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
| `/30` | Low-emphasis semantic accents (`bg-connection/30`) |
| `/40` | Accent gradient endpoints (`from-brand-primary/40`) |
| `/60` | SVG strokes (`text-brand-primary/60`) |
| `/80` | Near-full-opacity text overlays (`text-white/80`) |
| `/92` | Bottom nav glass effect (`rgba(255,255,255,0.92)`) |

---

## Gradient Patterns (existing only)

Use the existing gradient shapes with semantic endpoints, such as `from-popover to-card`, `from-brand-linen to-brand-parchment`, and `from-primary to-primary-hover`. The logo's existing spark uses connection to growth. Do not add new gradients for colour rollout.

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
