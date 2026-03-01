# Peter the Otter — Assistant System

Peter is the app's reactive UI assistant. He appears as a bottom-right overlay, reacts to app events, and serves as the coaching voice for guidance, tips, success confirmations, and error help.

## Architecture

```
peterEvents.ts      → Typed event bus (singleton, SSR-safe)
peterMachine.ts     → Pure state machine (state + event → next state)
messageRouter.ts    → Routes coaching messages through Peter
usePeter.ts         → React hook for components to talk to Peter
PeterAssistant.tsx  → Global UI overlay (mount once in _app.tsx)
animation/
  PeterAnimator.tsx → Animation renderer (Rive/Lottie/static fallback)
  RivePeter.tsx     → Rive adapter stub
  LottiePeter.tsx   → Lottie adapter stub
```

## How Peter Is Mounted

Peter is loaded via `next/dynamic` in `src/pages/_app.tsx` with `ssr: false`:

```tsx
const PeterAssistant = dynamic(
  () => import('@/components/peter/PeterAssistant'),
  { ssr: false }
);

// Inside the App component, after <Component />:
<PeterAssistant />
```

He mounts once, globally, and manages his own state internally.

## How to Trigger Events

Any component can emit raw events:

```tsx
import { emitPeter } from "@/components/peter";

// On a CTA button:
<button
  onMouseEnter={() => emitPeter({ type: "HOVER_CTA" })}
  onClick={() => emitPeter({ type: "CLICK_CTA" })}
>
  Get Started
</button>

// On form submission:
emitPeter({ type: "FORM_SUBMIT_START" });
// ... after async operation:
emitPeter({ type: "FORM_SUBMIT_SUCCESS" });
// or:
emitPeter({ type: "FORM_SUBMIT_ERROR", message: "Invalid email" });
```

## How to Send Guidance Through Peter

Use the `usePeter()` hook for the coaching voice API:

```tsx
import { usePeter } from "@/components/peter";

function MyComponent() {
  const peter = usePeter();

  // Show a tip
  peter.tip("Want the fast way? Start with your daily question.");

  // Show a success message
  peter.success("Profile updated. Looking good.");

  // Show an error with action buttons
  peter.errorHelp("That didn't save. Want to try again?", [
    { label: "Retry", event: { type: "FORM_SUBMIT_START" } },
    { label: "Dismiss", event: { type: "DISMISS_BUBBLE" } },
  ]);
}
```

### Usage Examples

**1. Tip**
```tsx
peter.tip("Pro tip: daily questions build momentum over time.");
```

**2. Next Step with Actions**
```tsx
peter.next("Your profile's set. Ready to explore journeys?", [
  { label: "Show Journeys", event: { type: "NAVIGATED", path: "/journeys" } },
  { label: "Maybe Later", event: { type: "DISMISS_BUBBLE" } },
]);
```

**3. Error Help**
```tsx
peter.errorHelp("Quick fix — pop a real email in there.", [
  { label: "Try Again", event: { type: "CLICK_CTA" } },
]);
```

### Full Hook API

| Method | Description |
|---|---|
| `say(kind, text, options?)` | Send any message kind |
| `tip(text, options?)` | Quick tip (auto-hides in 5s) |
| `next(text, actions?)` | Next step guidance with optional actions |
| `success(text?)` | Success confirmation (auto-hides in 3s) |
| `errorHelp(text, actions?)` | Error explanation with recovery actions |
| `emit(event)` | Emit a raw PeterEvent |
| `setEnabled(boolean)` | Enable/disable Peter entirely |

## States

Peter has 8 states with associated animations:

| State | Animation | Trigger |
|---|---|---|
| `hidden` | (minimized) | TOGGLE_MINIMIZE |
| `idle` | Gentle breathing | APP_READY, USER_ACTIVE |
| `curious` | Lean + tilt | HOVER_CTA |
| `happy` | Bounce | CLICK_CTA, next_step messages |
| `celebrate` | Big bounce + spin | FORM_SUBMIT_SUCCESS |
| `thinking` | Side rock | FORM_SUBMIT_START |
| `error` | Shake | FORM_SUBMIT_ERROR |
| `sleep` | Slow float + dim | USER_INACTIVE (60s) |

## How to Swap Animation Assets

The animator checks for assets in `public/peter/` in this order:

1. **Rive** — `public/peter/peter.riv`
2. **Lottie** — `public/peter/peter.json`
3. **Static image** — `public/peter/peter.png`
4. **Inline SVG** — Built-in fallback (no file needed)

To use Rive:
1. `npm install @rive-app/react-canvas`
2. Place your `peter.riv` in `public/peter/`
3. Edit `animation/RivePeter.tsx` to use the real Rive component
4. Import it in `PeterAnimator.tsx` when `assetType === "rive"`

To use Lottie:
1. `npm install lottie-react`
2. Place your `peter.json` in `public/peter/`
3. Edit `animation/LottiePeter.tsx` to use the real Lottie component
4. Import it in `PeterAnimator.tsx` when `assetType === "lottie"`

## Debug Mode

Press **Ctrl+Shift+P** to toggle the debug overlay, which shows:
- Current state
- Last event received
- Current speech text
- Bubble open/closed status

## Demo Page

Visit `/peter-demo` to test all events and message types interactively.

## Accessibility

- Speech bubble uses `role="status"` and `aria-live="polite"` for screen readers
- All buttons have proper `aria-label` attributes
- Focus ring visible on keyboard navigation
- Respects `prefers-reduced-motion` — disables animations when enabled
- Does not trap focus or block screen content
- Draggable on both desktop (mouse) and mobile (touch)

## Performance

- Loaded with `next/dynamic` + `ssr: false` (no server-side rendering)
- Event bus is a simple Set — no framework overhead
- State machine is a pure function — no allocations beyond the result
- Uses refs for stable event subscription (no re-subscribe on state change)
- Animation variants handled by framer-motion (already in bundle)
- Asset detection runs once on mount
