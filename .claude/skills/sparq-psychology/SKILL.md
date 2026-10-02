---
name: sparq-psychology
description: "Comprehensive psychology modalities and content framework for Sparq Connection. Covers 12+ therapeutic frameworks (Gottman, EFT, ACT, CBT, Positive Psychology, Attachment Theory, IFS, Mindfulness, NVC, Somatic, Narrative Therapy, Influence Psychology), personality-based content personalization, and content safety guardrails. Use this skill WHENEVER: generating questions or exercises, writing user-facing prompts or reflections, building onboarding assessments, implementing content personalization logic, designing the AI content engine, building question selection algorithms, creating relationship health scoring, adapting content for personality types, or writing ANY user-facing therapeutic/educational content. If the task involves psychology, content, or personalization in Sparq — use this skill."
---

# Sparq Connection — Psychology & Content Framework

## 1. Philosophy

Sparq uses **12+ evidence-based modalities** for both individual growth and couple connection. The core belief: **when each individual heals, it's easier to heal the relationship.**

Sparq is a **guided transformation system**, starting with relationships (constitution v1.2 §1) — a relationship gym, not therapy. It is educational, not clinical. It draws from research-backed therapeutic frameworks and presents them as accessible daily practices. Every piece of content serves a dual purpose: helping the individual grow AND strengthening their relationship.

### Foundation first

These modalities are Sparq's **foundation**: they are how Sparq reasons about what may be happening, what need sits under a behavior, what cycle is running and what question or intervention might fit (constitution §2A). Ethical influence, behavioral observation, priming and behavior design (§12 below) are a **supplementary layer** that shapes *how* Sparq leads — never the reason an intervention is chosen. New foundational modalities (e.g. DBT, Transactional Analysis) need Chris's approval before they are added here.

### The Change Chain

The Change Chain is the compressed daily form of the constitution's **Transformation Engine** (§1A: Insight → Meaning → Choice → Micro-action → Cue → Real-world practice → Reflection → Learning → Adaptation → Repetition → Identity evidence → Contribution). Permanent internal change requires the full chain — the app must support every link:

```
Insight → Emotional Processing → New Behavior in a Real Moment → Different Outcome → Updated Self-Story
```

Most apps stop at Insight. Sparq closes the whole chain through the Daily Loop (morning story → daily action → evening reflection).

### Levels of Change (deepest to most fragile)

1. **Identity** — "I am someone who stays present during conflict." (most durable)
2. **Values** — "My relationship is worth this effort because..."
3. **Beliefs** — "Conflict doesn't mean the relationship is broken."
4. **Behaviors** — "I paused before responding." (most fragile — reverts under stress)

The app works at levels 1-2, not just level 4 — but identity is **user-authored and evidence-grounded** (constitution §1A). Peter points to the evidence and asks what it means ("You used to pull away. This week you stayed present three times. Does that change how you see yourself?"); he never assigns the identity.

---

## 2. Modality Overview

| # | Modality | Core Idea | Primary Use in Sparq | Features It Powers |
|---|---|---|---|---|
| 1 | **Gottman Method** | Sound Relationship House; repair attempts predict success more than conflict frequency | Repair science, bid recognition, 5:1 ratio | Conflict First Aid, Repair Window, Weekly Mirror |
| 2 | **EFT** | Couples change when they name their negative cycle as the enemy — not each other | Cycle mapping, attachment bonding, emotional accessibility | Interaction cycles in `/us` (both confirm), evening chat |
| 3 | **ACT** | Values-based action is more durable than symptom-reduction action | Values anchoring, psychological flexibility, defusion | Values Clarification, Daily Loop micro-actions |
| 4 | **CBT** | Thought-Feeling-Behavior Triangle; identify distortions, change patterns | Cognitive restructuring, distortion identification | Morning stories (reframing), Translator |
| 5 | **IFS** | Self-Leadership; understand reactive "parts" without being controlled by them | Parts awareness, unblending from reactivity | Evening reflection, Conflict First Aid |
| 6 | **Narrative Therapy** | Externalize the problem; re-author the relationship story | Story re-authoring, identity arc tracking | Morning stories, Graduation Report, Weekly Mirror |
| 7 | **Positive Psychology** | PERMA model; strengths-based growth; gratitude and savoring | Gratitude practices, strength identification | Daily actions, Relationship OS Score |
| 8 | **Attachment Theory** | 4 styles drive how people seek/avoid closeness; security is learnable | Content personalization by attachment style | All personalized content, trait inference |
| 9 | **Mindfulness** | Present-moment awareness; non-judgmental observation | Emotional regulation, mindful listening | Somatic phase in Conflict First Aid, daily actions |
| 10 | **NVC** | Observation → Feelings → Needs → Requests | Communication skill building | Translator, Communication skill track |
| 11 | **Somatic Approaches** | Body awareness; nervous system regulation (window of tolerance) | Grounding, co-regulation, trauma-informed pacing | Conflict First Aid somatic phase, breathing exercises |
| 12 | **Ethical Influence** *(supplementary layer, not a foundational modality — §2A)* | Process influence at any stage; direction influence only toward what the user chose (constitution v1.2 §5A) | How Sparq leads: follow-through, cues, priming, timing | Experiments/missions + the user's own reasons, forgiving streaks, grounded normalization |

> **Deep reference**: `references/modalities-therapeutic.md` (modalities 1-6), `references/modalities-applied.md` (modalities 7-12)

---

## 3. Personality Assessment Overview

### 5 Assessment Dimensions

| Dimension | Possible Values | Inference Source |
|---|---|---|
| **Attachment Style** | Anxious, Avoidant, Disorganized, Secure | Evening reflection language patterns |
| **Love Language** | Words, Acts, Gifts, Time, Touch | What the user mentions appreciating |
| **Communication Style** | Direct/Indirect/Avoidant expression, Active/Empathic/Fix-it/Passive listening | Response patterns in daily exercises |
| **Conflict Resolution Style** | Compete, Collaborate, Compromise, Accommodate, Avoid | Scenario-based questions + reflection analysis |
| **Emotional Regulation** | Self-soothing capacity, co-regulation needs, stress response (fight/flight/freeze/fawn) | Behavioral patterns and response timing |

Additionally tracked but not a formal dimension:
- **Emotional State**: Struggling / Neutral / Thriving (dynamic, updated each session)
- **Tone Sensitivity**: Reassurance-seeking vs. accountability-seeking

### Progressive Discovery (NOT an Upfront Questionnaire)

Assessment is **woven into daily content** rather than front-loaded as a questionnaire — it is more accurate because it's based on real responses to real exercises. It is not hidden: the user can see Peter's guesses on their Insight Profile, and Peter explains honestly if asked why (constitution §5A, transparency). Whatever is learned stays a hypothesis: when a trait is surfaced to the user, it is offered tentatively and they can correct it — never presented as a label or diagnosis (constitution §2).

- **Day 1**: Name, solo/partner, what brings you here, daily time preference, identity archetype selection
- **Days 2-14**: Assessment questions embedded naturally in daily exercises. Each day's content is selected partly to reveal a personality dimension.
- **By Day 14**: Full personality profile built from actual answers and behaviors
- **Day 14**: Growth reveal — the first milestone (constitution §1A, §9): Peter shows evidence and offers guesses as maybes ("Here's what I think I'm noticing — you're the judge"); the user says what it means
- **Ongoing**: Traits continue to refine with each session. Re-assessed quarterly or after significant life events.

### Identity Archetypes

Users select an archetype during onboarding that affects content framing, celebration language, and micro-action style:

| Archetype | Focus | Content Framing |
|---|---|---|
| **Calm Anchor** | Stability, grounding | "Your steady presence is the foundation..." |
| **Compassionate Listener** | Empathy, feeling-oriented | "Your ability to tune in to feelings..." |
| **Growth Seeker** | Challenge, achievement | "You're someone who pushes for better..." |
| **Connection Builder** | Togetherness, bonding | "Your drive to bring people closer..." |

The archetype is the user's own pick and can be changed anytime; once they write their own identity statement or North Star, their words take priority over the archetype's framing. Archetypes work **WITH** attachment style, not instead of it. Archetype affects framing and celebration language; attachment style affects content depth, wording, and safety scaffolding.

### Confidence System

- Initial confidence: `0.3` (low — held lightly)
- Same value repeated: confidence grows by `+0.1` per session (max 1.0)
- Different value: confidence drops by `-0.15`
- Below `0.4`: trait is **not used** in personalization
- `0.4-0.7`: used but held lightly
- Above `0.7`: used with full weight in prompts
- User can correct traits via feedback (yes → 1.5x weight, not_really → 0.25x weight)

---

## 4. Content Personalization Principles

**Core rule**: Every piece of content must feel like it was written FOR this specific user. Content adapts along three axes: attachment style, love language, and emotional state.

### Personalization Example: Same Exercise, 3 Attachment Styles

**Base exercise**: "Share one thing you appreciate about your partner today."

**Anxious attachment** (seeks reassurance, fears abandonment):
> "Before you share, take a breath and remind yourself: this isn't a test. Your partner doesn't need to respond perfectly for this to count. Just say one thing you noticed and appreciated — even something tiny. The act of noticing is the practice."

**Avoidant attachment** (needs space, fears engulfment):
> "This one's quick — no big emotional scene required. Just mention one specific thing your partner did that you noticed. It can be small. You don't have to make it a moment. Just say it and move on."

**Secure attachment** (comfortable with closeness):
> "Share one thing you appreciate about your partner today. Be specific — what did they do, and why did it land for you? Notice how it feels to say it out loud."

### Adaptation Rules

| Signal | Content Adaptation |
|---|---|
| Anxious attachment | Add reassurance, reduce ambiguity, normalize imperfection |
| Avoidant attachment | Shorten prompts, reduce intensity, respect space, no pressure |
| Volatile conflict style | Mirror energy briefly, then add pause/breath suggestion |
| Avoidant conflict style | Low-pressure micro-steps, permission to go slow |
| Words of affirmation | Weave verbal acknowledgment into prompts |
| Physical touch | Suggest physical presence/closeness in actions |
| Struggling emotional state | Comfort first, soften expectations, no challenge |
| Thriving emotional state | Match energy, increase depth, add challenge |

### Notification Personalization by Attachment Style

| Style | Suggested default frequency (the user sets the real one) | Tone | Example |
|---|---|---|---|
| **Anxious** | More frequent, predictable timing | Warm, reassuring, "I'm here" | "Your daily growth moment is ready whenever you are" *(never claim Peter thinks about or misses them)* |
| **Avoidant** | Less frequent, user-controlled | Respectful, non-intrusive, choice-emphasizing | "New practice available when you're ready" |
| **Secure** | Standard frequency | Balanced, collaborative | "Today's practice is ready for you" |
| **Disorganized** | Predictable timing, gentle | Extra safe, permission-giving | "Something gentle is waiting for you — no pressure" |

### The Transparent Growth Principle

*(Replaces the former "Covert Growth Principle" — constitution v1.1: discovery before direction, agency before influence. If a technique would stop working once the user understood it, it isn't used.)*

Sparq helps users change **by helping them see themselves clearly and choose for themselves** — not by changing them without their noticing:

- Learning is woven into content rather than presented as a test — and anything Sparq infers is a hypothesis the user can see and correct
- Psychological frameworks are demonstrated through stories and exercises, never lectured
- "Aha moments" are the user's own discoveries — Peter asks the smallest useful question and doesn't steal the realization
- Identity reinforcement uses only identities the user named (identity statement, North Star) — no assigned archetype identities, no embedded commands
- Peter offers observations tentatively and with permission ("I have a thought about what might be happening — want to hear it?"), never clinically and never as fact
- The 14-day structure creates progressive depth; if a user asks why Peter is doing something, he explains honestly

> **Deep reference**: `references/personality-adaptation-guide.md` — full adaptation matrix with worked examples

---

## 5. Content Generation Rules

### Tone & Voice
- **Warm, accessible, conversational** — like a wise friend, never clinical or academic
- **4th-grade reading level** — simple words, short sentences
- **Frame as growth and practice** — never treatment or diagnosis
- Questions are **open-ended and invitational** — never interrogative
- Always include **"why this matters"** context with accessible science
- Celebrate **effort**, not just results

### The Daily Cycle: Learn → Implement → Reflect

Every day follows this pedagogical structure (change through practice in real life, not just knowledge):

1. **Learn** (Morning — 2 min): Discovery question or psycho-educational content from the day's modality. Story-based, not lecture-based.
2. **Implement** (During the day — 2 min): Micro-action or exercise to practice in real life. Always specific and doable.
3. **Reflect** (Evening — 3 min): How did it go? What did you notice? Peter facilitates processing.

This maps to the Change Chain and the Transformation Engine: Learn = Insight (+ Meaning), Implement = a Real-World Mission with a cue, Reflect = Reflection → Learning → Adaptation. When a practice becomes easy, offer the next level (adaptive difficulty); when a day goes badly, treat it as data, never failure (constitution §1A).

### Modality Sequencing (Days 1-14+)

| Days | Modality Focus | Rationale |
|---|---|---|
| 1-3 | **Positive Psychology** | Warm, approachable, non-threatening entry. Builds rapport and positive framing before deeper work. |
| 4-7 | **Attachment Theory + Gottman** | The deeper hook — "aha moment" territory. Users discover their patterns. |
| 8-14 | **Rotating all modalities** | Selected based on user profile and responses. AI-driven personalization begins. |
| 14 | **Growth reveal** | Evidence of change + guesses offered as maybes; the user interprets. First milestone (rite of passage, not a retention device). |
| 15+ | **AI-driven selection** | Based on full profile, recent responses, growth areas, and skill tree track. |

Question format also progresses: **Multiple choice heavy** in Days 1-7, **mixed** Days 8-14, **open-ended heavy** Day 15+.

### Length & Format
- Exercises completable in **2-5 minutes** (micro-format for Daily Loop)
- Morning stories: **under 150 words**
- Peter responses: **3-5 sentences max**
- Each piece of content maps to **at least one modality** and **one therapeutic intent**
- Every day has BOTH a discovery/learning element AND an immediate actionable practice

### Language Substitution Table — NEVER Say

| Don't Say | Do Say |
|---|---|
| "your anxious attachment" | "your tendency to seek reassurance" or "your desire for closeness" |
| "your avoidant attachment" | "your need for independence" or "your need for space to process" |
| "love language" | Describe naturally: "hearing appreciation really lands for you" |
| "trauma" | "difficult experience" or "something that stayed with you" |
| "dysregulated" | "overwhelmed" or "flooded" |
| "codependent" / "narcissist" / "toxic" | Never use — describe specific behaviors instead |
| "disorder" | "pattern" or "tendency" |
| "diagnosis" | "insight" or "awareness" |
| "treatment" | "practice" or "exercise" |
| "therapy" (as what we do) | "growth work" or "personal development" |
| "patient" | "user" or just their name |
| "symptom" | "signal" or "pattern" |
| "dysfunction" | "challenge" or "growth area" |
| "pathological" | Never use this word |
| "you should" | "you might try" or "one thing that sometimes helps" |
| any DSM terminology | Plain language behavioral descriptions |

### Relationship Stage Awareness

Content must respect where the user is:
- **New relationship**: Focus on building habits, discovery, positive patterns
- **Established**: Deepen patterns, address maintenance, prevent drift
- **Struggling**: Comfort first, small wins, regulate before problem-solve
- **Thriving**: Increase challenge, explore depth, celebrate momentum
- **Individual (no partner)**: Focus on self-growth, preparation, individual healing

### Content Mapping Rule

Every piece of generated content must include (in metadata or system prompt):
- **Modality tag**: Which of the 12 modalities this draws from
- **Therapeutic intent**: What psychological shift this is designed to create
- **Difficulty level**: Beginner / Intermediate / Advanced
- **Relationship stage**: Which stages this is appropriate for

> **Deep reference**: `references/question-bank-patterns.md` (24+ example questions with modality tags), `references/exercise-templates.md` (12+ exercise templates)

---

## 6. Safety & Legal Guardrails

### What We NEVER Do
- **No crisis intervention features** — route to real professionals immediately (see `src/lib/safety.ts`)
- **No clinical claims** — we are educational, not therapeutic
- **No diagnostic language** — never suggest a user has a disorder or pathology
- **No regulated therapeutic assessments** — use simplified educational versions only
- **No enabling manipulation** — never help users control/change their partner's behavior
- **No taking sides** — never act as judge/jury in partner conflict
- **No advising staying in unsafe situations** — safety routing is immediate and non-negotiable

### What We CAN Do
- Use **ideas and themes** from therapeutic modalities without regulated clinical terminology
- Reference **published research** and present it accessibly
- Offer **educational self-reflection** tools inspired by clinical frameworks
- Use **simplified versions** of clinical assessments (e.g., Hendrick scale for outcome measurement)

### Privacy & Data
- Sensitive response data is **encrypted** and never used for model training
- Partner reflections are **never shared** — not even as AI-synthesized blends (automatic partner synthesis was removed; see `docs/RELATIONSHIP_MODEL.md`). Only what a partner explicitly shares reaches the "Us" space
- Trait inferences are **private** — partner never sees the other's trait labels
- Users control their own data: memory window, visibility toggle, deletion rights
- **Conflict First Aid is ALWAYS free** — safety features are never paywalled

### Crisis Detection (`src/lib/safety.ts`)
Detects: self-harm, domestic violence, child harm, stalking, acute distress. Response: immediate safety resources by country (US, CA, UK, AU, NZ), coaching suspended for that session.

---

## 7. Reference File Routing

| When you need... | Load this reference |
|---|---|
| Deep detail on Gottman, EFT, ACT, CBT, IFS, or Narrative Therapy | `references/modalities-therapeutic.md` |
| Deep detail on Positive Psych, Attachment, Mindfulness, NVC, Somatic, or Influence | `references/modalities-applied.md` |
| How to adapt content for specific attachment styles / love languages / personality profiles | `references/personality-adaptation-guide.md` |
| Example questions with modality tags, therapeutic intents, and difficulty scaffolding | `references/question-bank-patterns.md` |
| Exercise templates for the Daily Loop (individual + partner + combined) | `references/exercise-templates.md` |
| Crisis detection and safety system implementation | `src/lib/safety.ts` (code) |
| Trait inference and confidence system | `src/lib/server/profile-analysis.ts` (code) |
| Peter's system prompt and personalization architecture | `src/lib/peterService.ts` (code) |

## Cross-Skill References

- **For Peter's personality, voice, and copy library**: see `sparq-peter` skill
- **For database schema (profile_traits, user_insights)**: see `sparq-db` skill
- **For UI component patterns and design tokens**: see `sparq-ui` skill
- **For testing psychology-based personalization**: see `sparq-testing` skill
