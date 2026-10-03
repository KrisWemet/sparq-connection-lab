# Peter accompanies

## Audit and identity

The previous canonical `dashboard/PeterAvatar` had a circular head, large eyes,
book/mug props, confetti, repeated blinking and a fast glow. It appeared in the
Home greeting, weekly/monthly mirrors, CSI notes, Us, insight profile, auth,
error fallback, daily growth, evening check-in, journey completion and onboarding.
Onboarding and rehearsal also used bouncing response dots; scoring scaled the
whole otter repeatedly.

`PeterChat` used a separate clothed raster (`public/images/peter-default.png`).
`PeterTheOtter`, in Translator and Mirror Report, used a missing
`/sparq-mascot.png` and an imperatively inserted emoji fallback. Its fixed overlay
could overlap controls. `PeterLoading` displayed three rotating rings.

The redesign preserves warm brown fur, cream muzzle, whiskers and familiarity.
Small side ears, restrained eyes, an elongated torso, resting paws and a tapering
tail make the anatomy more otter-like. Plum depth and coral/gold reflected light
connect him to the surrounding material without recolouring his fur.

## Shared rendering

- `components/peter/PeterCompanion.tsx`: one scoped inline SVG, no external assets.
- `lib/peter-presentation.ts`: eight explicit states and bounded visual preferences.
- `dashboard/PeterAvatar.tsx`: compatibility wrapper for existing mood/time props.
- `PeterResponseStatus`: readable response status, with a still listening portrait.

At 64px and below, auto mode uses a still portrait with a softly fading shoulder.
Larger sizes show the full silhouette. Decorative instances are hidden from
assistive technology; standalone illustration callers may supply a label.
Essential status remains written text.

Neutral, welcoming, listening, reflective, encouraging, grounding, celebrating
and curious share the same anatomy. Head angle, eyelid contours, gaze, brow position, closed-mouth shape and resting
paw position vary visibly at phone size. Listening leans in, reflective looks down
with one paw raised, grounding rests with closed eyes and lowered paws, and
celebrating uses smiling eyes and a broader closed smile. Curious has an asymmetric
gaze and clear tilt; welcoming opens the paws; encouraging lifts one paw toward
the chest. These are static poses, not repeated gestures. Grounding and listening remain still. Celebration adds warmth, not a
performance. Optional Bridge/Bloom/Flow structures sit behind the figure.

Ambient CSS motion takes 24–40 seconds and moves less than a pixel. It pauses
outside the viewport and when the document is hidden. Reduced motion removes
animation entirely; `motion="still"` also provides an explicit static rendering.
There are no frame loops, blink loops, cursor tracking, new animation libraries,
video or raster sequences.

## Integration decisions

All existing `PeterAvatar` consumers receive the same artwork. Chat now uses the
shared portrait. Loading uses the quiet full figure and an explicit loading
label. Onboarding and rehearsal response dots use readable still status; scoring
no longer pulses Peter. Answer acknowledgements use encouraging instead of a
celebratory expression. Translator and Mirror Report show Peter as an in-flow
note; an empty idle note is omitted. This removes a redundant floating mascot
and keeps controls clear. The unused legacy raster remains on disk for rollback.

State is chosen from actual screen purpose or response status, never inferred
from attachment style, message sentiment, diagnoses or psychological traits.
Future explicit preferences can adjust warmth, energy, complexity and pacing;
there is no new storage or backend coupling. Coaching prompts, memory, APIs,
auth, Supabase and relationship logic are unchanged.

## Review

The separate local review fixture at `http://127.0.0.1:3101/?screen=%2Fpeter-preview`
shows the three existing material environments, all eight states, daylight and
evening light, a static option, a small portrait and sample conversation.
It is not a production route and uses fictional data.

Reviewed at 320px, 390px and 1024px; narrow controls remain 44px tall with no
horizontal overflow. The static option and CSS reduced-motion rules were
checked. OS-level reduced-motion emulation is unavailable in the browser tool;
physical-device testing and live authenticated coaching remain unverified.
