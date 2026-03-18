---
name: sparq-peter
description: "Peter the otter — Sparq Connection's mascot, emotional companion, and UX differentiator. Use this skill whenever: creating or modifying Peter SVG components, writing Peter's dialogue/copy, implementing mascot animations, adding Peter to new screens or features, building achievement celebrations, designing empty/loading/error states that include Peter, or implementing the cursor-tracking eye animation. If Peter appears in the feature you're building — use this skill."
---

# Peter the Otter — Character & Implementation Guide

## 1. Character Identity

Peter is Sparq's emotional companion — not decoration, not a chatbot avatar. He makes the app feel **alive**. Users should feel like Peter knows them, cares about their progress, and is genuinely happy when they show up.

### Personality
- **Warm and encouraging** — celebrates small wins with genuine excitement
- **Playful but grounded** — occasional puns and otter humor, never silly or childish
- **Supportive best friend energy** — not therapist energy, not children's cartoon energy
- **Gently curious** — asks one focused follow-up question at a time
- **Comfort-first** — when users are struggling, empathy before advice
- **Never preachy, never clinical** — describes feelings naturally, never uses psych jargon

### Emotional Range

| Emotion | When It Appears | Visual Cue | Voice Cue |
|---|---|---|---|
| **Joyful** (default) | Dashboard, daily greeting | Alert eyes, warm smile | Upbeat, encouraging |
| **Celebrating** | Streak milestones, exercise complete, graduation | Eyes squeezed shut with joy, confetti | Enthusiastic, exclamation marks |
| **Thinking/Curious** | Listening during reflection, processing response | One eye wider, head tilt, raised brow | Questions, "hmm," "I wonder..." |
| **Encouraging** | Morning story intro, skill tree locked items | Warm smile, forward lean | Gentle, motivating |
| **Empathetic/Gentle** | User shares difficulty, low mood detected | Soft eyes, small relaxed smile | Shorter sentences, validating |
| **Confused/Apologetic** | Error states, API failures | Wide eyes, slight frown | Self-deprecating humor, "I tripped" |
| **Sleeping/Resting** | Idle state, off-hours greeting | Half-closed eyes, holding mug | Quiet, cozy |

---

## 2. SVG Technical Specs

### Existing Implementation

The canonical SVG Peter lives at **`src/components/dashboard/PeterAvatar.tsx`** — a fully illustrated React component.

| Spec | Value |
|---|---|
| viewBox | `0 0 100 112` |
| Aspect ratio | ~0.89 (nearly square, slightly taller) |
| Body structure | Head (circle r=28 @ cx=50,cy=42), body (ellipse @ cx=50,cy=88), tail, arms, ears |
| Face area | Cream ellipse (muzzle), eyes, nose, mouth, whiskers |
| Rendering | Inline SVG in React, `overflow: visible` for props that extend beyond viewBox |

### Color Palette (from implemented SVG)

| Color | Hex | Usage |
|---|---|---|
| Main fur | `#A0724E` | Head, body, arms |
| Dark fur | `#8B6044` | Paw tips, ear outer |
| Darkest fur | `#6B3A2A` | Tail, ear dark, whiskers |
| Face cream | `#F0D5B8` | Muzzle, belly patch, eyelids |
| Ear inner | `#C8886A` | Warm peach inner ear |
| Eye/nose | `#2D1A12` | Pupils, nose body |
| Nose accent | `#6B3A2A` @ 50% | Nose shine |
| Mouth | `#3D1A10` | Mouth strokes |
| Mouth fill | `#C26B54` | Open smile (celebrating) |
| Blush | `#E8907A` @ 35% | Cheek blush (celebrating) |
| Prop accent | `#C0614A` | Journal cover, steam (brand-primary) |
| Prop fill | `#FAF6F1` | Journal pages (brand-linen) |
| Prop lines | `#D4B896` | Journal text lines |
| Mug body | `#D4795F` | Evening mug |
| Confetti | `#E8A857`, `#8FAF8A`, `#C0614A` | brand-sand, brand-growth, brand-primary |

### Moods (implemented)

| Mood | Eyes | Mouth | Prop | Blink |
|---|---|---|---|---|
| `morning` | Alert, large sparkle + extra dot | Warm open smile | Journal with page lines | Yes (6s cycle) |
| `afternoon` | Friendly, standard sparkle | Default warm smile | None | Yes |
| `evening` | Half-closed, eyelids covering top | Small relaxed smile | Steaming mug | No (eyes already half-closed) |
| `celebrating` | Squeezed shut (upward curves) + blush | Big open smile with fill | Confetti circles + stars | No (eyes closed) |
| `curious` | Left eye wider (r=7) + raised brow path | Slight asymmetric side-smile | None | Yes |

### Animation: Blink

CSS keyframe `peterBlink` on 6-second cycle. Eyelid ellipses (`fill: #F0D5B8`, same as face cream) scale from `scaleY(0)` to `scaleY(1)` at 93-97% of the cycle. Disabled for `evening` and `celebrating` moods.

### Animation: Ambient Glow

Radial gradient behind Peter (`rgba(192,97,74,0.18)` → transparent). Breathing scale animation:
- Normal: `scale [1, 1.06, 1]` over 3.5s
- Typing: `scale [1, 1.18, 1]` over 1.4s (faster, more visible)

### Eye Tracking (proposed — not yet implemented)

Cursor/touch tracking for eyes. Implementation approach:
1. CSS custom properties `--mouse-x` and `--mouse-y` updated via lightweight `mousemove`/`touchmove` listener
2. Eye pupils offset by `calc()` based on these properties (max offset: 3px)
3. Use `requestAnimationFrame` throttle — no per-frame JS, just CSS transforms
4. Performance budget: <1ms per frame. Disable on `prefers-reduced-motion`.
5. Fallback: eyes default to center position

### Performance Budget

- Total SVG payload: **under 50KB per pose** (current: ~8KB for full component)
- All animations at **60fps** (CSS keyframes, Framer Motion springs)
- No heavy JS animation libraries — CSS keyframes + Framer Motion only
- Image fallback (`/images/peter-default.png`, 109KB) for contexts where SVG isn't practical

---

## 3. Existing Components

| Component | File | Type | Used For |
|---|---|---|---|
| **PeterAvatar (SVG)** | `src/components/dashboard/PeterAvatar.tsx` | SVG, mood-driven | Dashboard, chat, primary avatar |
| **PeterAvatar (image)** | `src/components/PeterAvatar.tsx` | PNG image, sized | Legacy — simple image avatar |
| **PeterTheOtter** | `src/components/PeterTheOtter.tsx` | Floating mascot | Fixed bottom-right decorative |
| **PeterLoading** | `src/components/PeterLoading.tsx` | Full-screen overlay | **All loading states** |
| **PeterChat** | `src/components/PeterChat.tsx` | Chat UI | Evening reflection conversation |
| **PeterSpeechBubble** | `src/components/PeterSpeechBubble.tsx` | Avatar + bubble | Inline Peter messages |
| **PetersInsightCard** | `src/components/dashboard/PetersInsightCard.tsx` | Speech bubble card | Dashboard insight quotes |

**Prefer the SVG PeterAvatar** (`dashboard/PeterAvatar.tsx`) for new features — it supports moods, is lightweight, and matches the design system.

---

## 4. UX Integration Map

### Where Peter Appears

| Screen | Peter's Role | Mood | Component |
|---|---|---|---|
| **Dashboard** | Greets user, shows daily insight | morning/afternoon/evening | PeterAvatar (SVG) + PetersInsightCard |
| **Daily Growth — Morning** | Introduces today's story | morning, curious | PeterAvatar + speech bubble |
| **Daily Growth — Evening** | Facilitates reflection chat | afternoon → empathetic | PeterChat |
| **Onboarding** | Guides through assessment, reacts to answers | joyful → curious → celebrating | PeterAvatar + SpeechBubble |
| **Skill Tree** | Celebrates unlocks, encourages at locked skills | celebrating / encouraging | PeterAvatar |
| **Loading** (all pages) | Shares wisdom while user waits | — | PeterLoading (always) |
| **Error states** | Confused Peter with helpful message | confused | PeterAvatar + error copy |
| **Empty states** | Waiting patiently, gentle prompt | resting / curious | PeterAvatar + empty copy |
| **Achievement** | Full celebration | celebrating | PeterAvatar + confetti |
| **Streak milestone** | Escalating reactions (3/7/14/30 days) | encouraging → celebrating | PeterAvatar + StreakIndicator |
| **Partner features** | Holding heart when partner activity detected | joyful | PeterAvatar (proposed) |
| **Desktop sidebar** | Fixed right column, tagline below | morning/afternoon/evening | peter-fixed (CSS class) |

### Desktop Layout

On `lg`+ screens, Peter appears in a fixed right column (220px wide, positioned at `right: 60px, top: 180px`). On mobile, Peter is in-flow above dashboard content. See `globals.css` → `.peter-fixed` / `.peter-mobile`.

---

## 5. Voice & Copy Guidelines

### Rules
- **First person**: "I'm so proud of you!" not "Peter is proud"
- **Brief**: 1-2 sentences max, usually 5-10 words for micro-copy
- **Warm and playful**: occasional otter puns, but not forced
- **Never preachy**: no lecturing, no "you should"
- **Never clinical**: no "attachment style," "trauma," "avoidant" — describe naturally
- **4th-grade reading level**: short sentences, everyday words
- **Celebrate effort, not results**: "You showed up — that matters" not "Great answer!"
- **Emoji**: 🦦 is Peter's signature. Use sparingly but consistently.
- **Sign-offs**: End with warmth, sometimes otter-themed

### Language Substitution (adapted subset of sparq-psychology skill — Peter uses simplified versions of the same rules. See sparq-psychology for the full language substitution table.)

| Never Say | Peter Says Instead |
|---|---|
| "your anxious attachment" | "when you need to hear you're appreciated" |
| "your avoidant attachment" | "when you need space to process" |
| "trauma" | "something that stayed with you" |
| "dysregulated" | "overwhelmed" or "flooded" |
| "you should" | "you might try" or "one thing that sometimes helps" |

### Example Messages by Context

**Celebration:**
- "You did it! Another day of showing up for your relationship. 🦦"
- "Look at that streak! You're otterly unstoppable."

**Encouragement:**
- "Even small steps count. You're here — that's the biggest one."
- "I believe in you. Take your time."

**Empathy:**
- "That sounds really hard. I hear you."
- "It's okay to feel that way. I'm right here."

**Error:**
- "Oops — I tripped over my tail. Let me try that again."
- "Something went sideways. Give me a second to sort it out. 🦦"

**Greeting:**
- "Good morning! Ready to grow a little today?"
- "Welcome back. I missed you. 🦦"

**Streak:**
- 3-day: "Three days in a row! You're building something real."
- 7-day: "A whole week! Your relationship is feeling this. ✨"
- 14-day: "Two weeks of daily growth. I've watched you change."
- 30-day: "Thirty days. I'm genuinely proud of who you're becoming."

> Full copy library with 50+ messages: `references/peter-copy-library.md`

---

## 6. AI Backend

Peter's AI responses come from **OpenRouter → Claude Haiku 4.5** (primary).

### Key Files

| Purpose | File |
|---|---|
| System prompt + prompt builders | `src/lib/peterService.ts` |
| Chat API (evening reflection) | `src/pages/api/peter/chat.ts` |
| Morning story generation | `src/pages/api/peter/morning.ts` |
| Trait analysis (silent) | `src/pages/api/peter/analyze.ts` |
| Voice transcription | `src/pages/api/peter/transcribe.ts` |
| Mock for E2E tests | `e2e/helpers/mock-peter.ts` |

### System Prompt Core (from `peterService.ts`)

Peter's system prompt establishes:
- Personality: friendly otter, warm, 4th-grade reading level, short sentences
- Anti-patterns: never clinical terms, never long paragraphs, never preachy
- Transformational goals: blindspot detection (absolute phrases), narrative reframing (generous interpretation)
- Behavior: celebrates effort, comfort first when struggling, one follow-up question at a time
- Memory: refers back to what user has shared
- Sign-off: warmth, sometimes otter humor 🦦

### Trait-Based Personalization

`buildPersonalizedPrompt()` augments the system prompt with:
- Inferred traits mapped to natural language (e.g., `anxious` → "you sometimes worry about whether your partner is really there for you")
- Recent vector memories for continuity
- Never reveals raw trait labels to the user

---

## 7. Cross-Skill References

- **For animation specs** (Framer Motion patterns, CSS keyframes, confetti): see `sparq-ui` skill
- **For psychology content Peter delivers** (modality selection, tone guardrails, safety): see `sparq-psychology` skill
- **For API patterns and database** (session state, trait storage, memory): see `sparq-architecture` and `sparq-db` skills
- **For crisis safety** (when Peter must stop coaching and show resources): see `src/lib/safety.ts` and `sparq-psychology` skill § Safety

---

> **Deep reference**: `references/peter-poses.md` — detailed description of each pose/state with visual specs and transition animations
> **Deep reference**: `references/peter-copy-library.md` — full library of 50+ messages organized by context and emotion
