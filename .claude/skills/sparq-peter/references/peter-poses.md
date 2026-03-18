# Peter Poses & States — Detailed Reference

Each pose describes: visual appearance, when it triggers, transition animation, associated default copy, and enough SVG detail for an artist or Claude to reproduce it.

All poses share Peter's base anatomy from `src/components/dashboard/PeterAvatar.tsx`:
- **Head**: circle r=28 @ (50, 42), fill `#A0724E`
- **Ears**: outer circle r=9 fill `#8B6044`, inner circle r=5.5 fill `#C8886A`, at (26, 22) and (74, 22)
- **Face cream**: ellipse rx=20, ry=19 @ (50, 47), fill `#F0D5B8`
- **Body**: ellipse rx=24, ry=20 @ (50, 88), fill `#A0724E`, belly patch ellipse rx=16, ry=16 fill `#F0D5B8`
- **Arms**: curved paths from body with paw circles (r=5.5, fill `#8B6044`)
- **Tail**: ellipse rx=28, ry=8 @ (50, 108), fill `#6B3A2A`, slight rotation
- **Nose**: ellipse rx=5, ry=4 @ (50, 52), fill `#2D1A12` with shine at (48.5, 50.5)
- **Whiskers**: 3 pairs of angled lines from (28/72, 53-61) to (43/57, 55-60), stroke `#6B3A2A` @ 35-45% opacity

---

## Implemented Poses

### 1. Morning — Alert & Ready

**Mood key**: `morning`

**Visual description**: Peter is bright-eyed and alert, holding an open journal. His eyes are large with prominent sparkle highlights, conveying eagerness for the day ahead.

**Eyes**: Large pupils (r=6.5), white sparkle highlights (r=2.2) offset upper-left, plus extra smaller sparkle dots (r=1, 60% opacity) for alertness.

**Mouth**: Warm open smile — `Q 50 64` (default curve, moderate opening).

**Prop — Journal**: Positioned at `translate(32, 78)`. Brand-primary cover (`#C0614A`, 36×26, rx=3), darker spine (`#A3513D`, 6px wide), cream pages (`#FAF6F1`) on both sides of spine with fine line rules (`#D4B896`, 4 lines left page, 3 lines right page).

**Blink**: Active — 6-second CSS cycle, blink at 93-97%.

**When it triggers**: Dashboard greeting before noon, morning story page, start of daily loop.

**Transition in**: `peterFadeIn` — scale 0.92→1 with opacity, 400ms ease-out.

**Default copy**: "Good morning! Ready to grow a little today?"

---

### 2. Afternoon — Friendly Default

**Mood key**: `afternoon`

**Visual description**: Peter's neutral, friendly state. Relaxed but present — the "baseline" Peter.

**Eyes**: Standard pupils (r=6), white sparkle (r=1.8) offset upper-left.

**Mouth**: Default warm smile — `Q 50 64` curve.

**Prop**: None.

**Blink**: Active.

**When it triggers**: Dashboard after noon, default fallback, any context without a specific mood.

**Transition in**: Fade + scale, 400ms.

**Default copy**: "How's your day going?"

---

### 3. Evening — Calm & Cozy

**Mood key**: `evening`

**Visual description**: Peter is settling in for reflection. Half-closed eyes suggest calm contentment. He's holding a steaming mug — the visual equivalent of "let's sit together."

**Eyes**: Half-closed. Full pupil ellipses (rx=6, ry=4.5, fill `#2D1A12`) with upper eyelid ellipses (rx=6.5, ry=4, fill `#F0D5B8` — matches face cream) covering the top half. Subtle sparkle remains (r=1.2, 70% opacity) to keep eyes alive.

**Mouth**: Small relaxed smile — shorter curve `44→56` with gentler arc (`Q 50 61`).

**Prop — Mug**: Positioned at `translate(38, 82)`. Warm terracotta body (`#D4795F`, 24×20, rx=4), curved handle (`#A3513D`, 3px stroke), amber liquid top (`#E8A857`, 80% opacity), two steam wisps (`#C0614A`, 1.5px stroke, 50% opacity) curving upward.

**Blink**: Disabled (eyes already half-closed).

**When it triggers**: Evening reflection chat, dashboard after 6pm, daily loop evening phase.

**Transition in**: Slower fade, 500ms. Glow shifts to softer pulse.

**Default copy**: "I'm here. Take your time."

---

### 4. Celebrating — Pure Joy

**Mood key**: `celebrating`

**Visual description**: Peter is elated — eyes squeezed shut with happiness, mouth wide open in laughter, surrounded by confetti. This is the "big moment" Peter.

**Eyes**: Squeezed shut — upward curve paths (`M 33 40 Q 39 34, 45 40`, stroke `#2D1A12` width 3). Cheek blush ellipses (rx=5, ry=3, fill `#E8907A` @ 35%) at (33, 46) and (67, 46).

**Mouth**: Big open smile with fill — `Q 50 66` (deeper curve), stroke `#3D1A10` width 2.5, fill `#C26B54` (warm coral).

**Prop — Confetti**: Scattered circles and rotated rectangles in brand colors:
- Circles: `#E8A857` (r=3 @ 18,22), `#8FAF8A` (r=2.5 @ 82,18), `#C0614A` (r=2 @ 88,50), `#D4795F` (r=2.5 @ 12,55)
- Rectangles: `#E8A857` (6×6, rotated 30° @ 15,70), `#8FAF8A` (5×5, rotated -20° @ 78,72)
- Star characters: ✦ in `#E8A857` (@ 10,35 size 10) and `#C0614A` (@ 80,30 size 8)

**Blink**: Disabled (eyes squeezed shut).

**When it triggers**: Streak milestones, exercise completion, day completion, graduation, achievement unlock, skill level up.

**Transition in**: Spring bounce — scale 0.8→1.05→1 with 300ms spring. Often paired with `fireSubtleBurst()` or `fireElegantConfetti()`.

**Default copy**: "You did it! 🦦✨"

---

### 5. Curious — Intrigued & Listening

**Mood key**: `curious`

**Visual description**: Peter is genuinely interested. One eye is wider than the other (asymmetric engagement), one brow is raised. His mouth has a knowing side-smile. This is "I'm listening and thinking about what you said."

**Eyes**: Asymmetric — left eye larger (r=7) with large sparkle (r=2.2), right eye smaller (r=5.5) with smaller sparkle (r=1.8). Raised inner eyebrow path on left (`M 34 33 Q 39 30, 45 33`, stroke `#6B3A2A` width 2).

**Mouth**: Asymmetric side-smile — left side higher (`M 43 58 Q 50 62, 57 57`).

**Prop**: None.

**Blink**: Active.

**When it triggers**: When Peter is about to ask a follow-up question, processing user's reflection, displaying a thought-provoking insight, onboarding assessment questions.

**Transition in**: Subtle head tilt effect (slight rotation) if implemented, otherwise standard fade.

**Default copy**: "Hmm, tell me more about that."

---

## Proposed Poses (Not Yet Implemented)

### 6. Empathetic — Soft & Present

**Mood key**: `empathetic` (proposed)

**Visual description**: Peter's gentlest state. Eyes are slightly downturned with soft warmth — not sad, just deeply present. Mouth is a small, closed, caring smile. No props — just Peter being fully there.

**Eyes**: Slightly narrowed (r=5), pupils looking slightly downward (offset cy by +1). Sparkle is softer (r=1.5, 50% opacity). Optional: very subtle glistening effect (tiny white dot at bottom of eye).

**Mouth**: Small closed smile — shorter, gentler curve. `M 44 57 Q 50 60, 56 57`.

**Body language**: Arms slightly closer to body (arm paths curve inward). Optional: one paw resting over heart area.

**When it triggers**: User shares difficulty, crisis-adjacent content (before safety routing takes over), post-conflict check-in, low mood detected in reflection.

**Transition in**: Very gentle — 600ms fade, no scale change. Glow softens to minimal.

**Default copy**: "I hear you. That sounds really hard."

---

### 7. Confused/Apologetic — Oops

**Mood key**: `confused` (proposed)

**Visual description**: Peter is sheepish. Wide eyes, slight frown, maybe one paw behind head (scratching). Conveys "I messed up" or "something went wrong" without alarm.

**Eyes**: Wide open (r=7.5), pupils slightly off-center (looking to the side). Sparkle larger than normal. Optional raised eyebrows (both sides).

**Mouth**: Slight downward curve (not sad — more "oops"): `M 43 57 Q 50 55, 57 57`.

**Prop**: Optional — small question mark or spiral above head.

**When it triggers**: API errors, network failures, unexpected states, "something went wrong" screens.

**Transition in**: Slight wobble — `rotate(-3deg)→rotate(3deg)→rotate(0)` over 400ms.

**Default copy**: "Oops — I tripped over my tail. Let me try that again. 🦦"

---

### 8. Sleeping/Resting — Idle

**Mood key**: `sleeping` (proposed)

**Visual description**: Peter is dozing. Eyes fully closed (curved downward lines, opposite of celebrating curves). Small peaceful smile. Optional: tiny "z" floating above. Holding mug (like evening) or no prop.

**Eyes**: Closed — downward curves: `M 33 40 Q 39 44, 45 40` (inverse of celebrating). No sparkle.

**Mouth**: Tiny smile — minimal curve: `M 46 57 Q 50 59, 54 57`.

**Prop**: Optional floating "z" text elements, staggered opacity animation.

**When it triggers**: User hasn't opened app in 24h+ (welcome back screen), very late night access, Peter "resting" between sessions.

**Transition in**: Very slow fade (800ms). Breathing glow on slowest cycle (5s).

**Default copy**: "Oh — you're here! *stretches* Let me wake up."

---

### 9. Partner Heart — Connected

**Mood key**: `partner` (proposed)

**Visual description**: Peter is holding a small heart in both paws, front and center. Joyful eyes (like afternoon). Heart pulses gently. Conveys "your partner is thinking of you."

**Eyes**: Standard friendly (like afternoon) with extra sparkle.

**Mouth**: Warm smile (default).

**Prop**: Heart shape in brand-primary (`#C0614A`), centered between paws at ~(50, 78). Gentle pulse animation: scale 1→1.1→1 on 2s loop.

**When it triggers**: Partner sends "Thinking of you" heartbeat, partner completes their daily session, partner synthesis is available.

**Transition in**: Heart fades in separately after Peter appears (200ms delay).

**Default copy**: "Your partner just sent some love your way. 💜"

---

### 10. Achievement — Full Celebration

**Mood key**: `achievement` (proposed)

**Visual description**: Extended celebrating pose — Peter with both arms raised high, bigger confetti burst, optional starbursts. This is graduation-level joy.

**Eyes**: Same as celebrating (squeezed shut, blush).

**Mouth**: Same as celebrating (big open smile).

**Arms**: Modified path — arms extended upward and outward instead of to the sides. Paws at approximately (20, 50) and (80, 50).

**Prop**: Larger confetti array + star bursts. Consider integrating with `fireElegantConfetti()`.

**When it triggers**: Day 14 graduation, first Skill Tree level unlock, 30-day streak, partner link established.

**Transition in**: Bounce entrance with confetti: spring scale 0.7→1.1→1 over 500ms + `fireElegantConfetti()`.

**Default copy**: "This is HUGE. I'm so proud of who you're becoming. 🦦✨"

---

## State Transitions

### Mood Selection Logic (proposed)

```typescript
function selectMood(context: {
  screen: string;
  hour: number;
  sessionPhase?: string;
  isTyping?: boolean;
  isError?: boolean;
  isCelebration?: boolean;
  partnerActive?: boolean;
}): PeterMood {
  if (context.isError) return 'confused';
  if (context.isCelebration) return 'celebrating';
  if (context.partnerActive) return 'partner';
  if (context.isTyping) return 'curious';
  if (context.sessionPhase === 'evening_pending') return 'evening';
  if (context.hour < 12) return 'morning';
  if (context.hour >= 18) return 'evening';
  return 'afternoon';
}
```

### Animation Between Moods

When mood changes, don't hard-cut. Use:
1. Quick fade-out of current expression (150ms, opacity 1→0)
2. Swap SVG elements
3. Fade-in new expression (250ms, opacity 0→1)

Total transition: 400ms. Imperceptible as a "swap" — feels like Peter's expression shifted naturally.
