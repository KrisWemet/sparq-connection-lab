# Applied Frameworks Deep Reference (7-12)

These 6 modalities are applied science frameworks that inform Sparq's content design, engagement mechanics, and personalization system.

---

## 7. Positive Psychology

**Research basis**: Martin Seligman, University of Pennsylvania. Founded the field in 1998. Core focus: what makes life worth living, not just what's wrong.

### PERMA Model for Couples

| Element | Individual | In Relationship |
|---|---|---|
| **P**ositive Emotions | Joy, gratitude, serenity | Shared laughter, appreciation rituals, celebrating wins together |
| **E**ngagement | Flow states, absorption | Deep conversations, shared activities, being fully present |
| **R**elationships | Meaningful social connections | The couple bond itself — quality of attention and care |
| **M**eaning | Purpose beyond self | "Our relationship serves something bigger than us" |
| **A**ccomplishment | Sense of achievement | Growing together, hitting milestones, overcoming challenges |

### VIA Character Strengths

Research shows that couples who identify and leverage each other's character strengths have higher relationship satisfaction. Sparq uses this in:
- Graduation Report: "Your relationship superpower" section
- Weekly Mirror: "One clear strength I see in you"
- Daily Actions: Strength-spotting exercises ("Notice one strength your partner used today")

### Gratitude Practices

Gratitude is the single most studied positive psychology intervention. In couples, expressing specific gratitude (not generic "thanks") increases relationship satisfaction by 15-25% in studies.

### Growth Mindset in Relationships

Dweck's research: people who believe relationships require work and growth (growth mindset) handle conflict better than those who believe "if it's right, it shouldn't be this hard" (fixed mindset).

### How Sparq Uses Positive Psychology

- **Day 1 Priority**: Positive Psychology leads the onboarding experience (warm, strengths-based, non-threatening entry). This is the safest starting modality — it builds rapport before the deeper modalities arrive.
- **Daily Actions**: Gratitude exercises, appreciation practices, strength-spotting
- **Relationship OS Score**: Tracks positive-to-negative ratio (Gottman's 5:1)
- **Graduation Report**: Strengths-based summary of growth
- **Morning Stories**: Often demonstrate gratitude, savoring, or celebration of small wins
- **Skill Tree → Shared Vision**: Values alignment, shared meaning creation

---

## 8. Attachment Theory

**Research basis**: John Bowlby (1950s-70s), Mary Ainsworth (Strange Situation, 1970s), Hazan & Shaver (adult romantic attachment, 1987), Sue Johnson (EFT clinical application). Most extensively replicated finding in relationship psychology.

### The 4 Attachment Styles

| Style | Core Fear | Core Need | In Conflict | In Intimacy |
|---|---|---|---|---|
| **Secure** (~50%) | Minimal — trusts repair will happen | Connection + autonomy balanced | Stays present, regulates, seeks repair | Comfortable with closeness and independence |
| **Anxious** (~20%) | Abandonment, being unimportant | Reassurance, proximity, verbal confirmation | Pursues, escalates, seeks immediate resolution | Craves closeness, may feel "never enough" |
| **Avoidant** (~25%) | Engulfment, losing autonomy | Space, independence, self-reliance | Withdraws, minimizes, shuts down | Uncomfortable with deep emotional exposure |
| **Disorganized** (~5%) | Both closeness AND distance feel unsafe | Safety, predictability | Alternates between pursuing and withdrawing chaotically | Wants closeness but panics when they get it |

### CRITICAL: How Each Style Processes the Same Content

**Example prompt**: "Tell your partner one thing you need from them this week."

**Secure**: Processes straightforwardly. Can articulate needs clearly. Doesn't feel threatened by the vulnerability.
> Adaptation: None needed. Can add depth: "Be specific about what it would look like."

**Anxious**: May feel flooded with needs, afraid of asking for "too much," or hyperactivate worrying about partner's reaction.
> Adaptation: Normalize having needs. Add: "Pick just one thing. Having needs doesn't make you needy — it makes you human." Frame as safe and small.

**Avoidant**: May feel pressure, resist the exercise, or intellectualize rather than feel. The word "need" itself may trigger discomfort.
> Adaptation: Reframe as preference, not need. "What's one thing that would make your week a little better? It doesn't have to be deep." Make it lightweight and low-stakes.

**Disorganized**: May feel pulled to share deeply and then panic, or may freeze entirely.
> Adaptation: Provide extreme safety. "You don't have to share this with your partner — just notice what comes up for you when you think about it. That's the whole exercise."

### Regulation Patterns by Style

| Style | Self-Regulation | Co-Regulation | What Helps |
|---|---|---|---|
| Secure | Effective — can name emotions and soothe | Naturally seeks and offers comfort | Reciprocal connection |
| Anxious | Under-regulates — emotions intensify quickly | Over-relies on partner for regulation | Consistent reassurance, predictability |
| Avoidant | Over-regulates — suppresses emotions | Resists co-regulation, prefers solitude | Space to process, then gentle invitation back |
| Disorganized | Dysregulated — oscillates between extremes | Wants co-regulation but finds it threatening | Safety, predictability, very small steps |

### The Anxious-Avoidant Trap (Critical for Couple Features)

This is the most researched destructive dyadic pattern and the most common couple configuration in distressed relationships:

```
1. Anxious partner senses distance → seeks closeness (texts, asks "are we okay?")
2. Avoidant partner feels pressured → withdraws (goes quiet, gets busy)
3. Withdrawal confirms anxious fears → escalates pursuit (more texts, more questions)
4. Pursuit overwhelms avoidant → increases distance (shuts down, leaves room)
= The pursue-withdraw cycle that Gottman identifies as predicting relationship failure
```

**Breaking the pattern requires BOTH sides to move against their instinct:**

| Partner | Default Move | Growth Move |
|---|---|---|
| **Anxious** | Pursue harder when threatened | Self-soothe before pursuing; use scheduled check-ins to reduce hypervigilance; trust that space ≠ abandonment |
| **Avoidant** | Withdraw further when pressured | Make proactive small bids for connection; explicitly state need for space ("I need 20 minutes, then I'm coming back"); name the withdrawal instead of just doing it |

**Key insight**: Neither partner is the problem. The CYCLE is the problem. When they can name it together ("we're in the cycle again"), blame decreases and empathy increases.

**In Sparq**: Conflict First Aid uses the attachment pairing to describe the couple's current dynamic. Partner Synthesis names the cycle without blame. Peter coaches each individual to make their growth move.

### How Sparq Uses Attachment Theory

- **Trait Inference**: Attachment style is the primary personalization dimension (see `profile-analysis.ts`)
- **Content Adaptation**: Every exercise is adapted for all 4 styles (see personality-adaptation-guide.md)
- **Peter's Behavior**: Adjusts warmth/intensity based on attachment style
- **Notification Personalization**: Anxious users get more frequent, warm notifications; avoidant users get less frequent, choice-emphasizing notifications (see personality-adaptation-guide.md)
- **Conflict First Aid**: "Your Dynamic Right Now" card uses attachment pairing to describe the couple's interaction pattern
- **Couple's Cycle Map** (planned): Uses both partners' attachment styles to name their cycle

---

## 9. Mindfulness

**Research basis**: Jon Kabat-Zinn (MBSR, 1979), Thich Nhat Hanh, Carson et al. (2004 — Mindfulness-Based Relationship Enhancement showed significant improvements in relationship satisfaction, closeness, and acceptance of partner).

### Core Practices for Relationships

| Practice | Individual Benefit | Relationship Benefit |
|---|---|---|
| **Present-moment awareness** | Reduces rumination about past or anxiety about future | Being fully present with partner instead of distracted |
| **Non-judgmental observation** | Notice thoughts/feelings without reacting | Observe partner's behavior without jumping to interpretation |
| **Emotional regulation** | Pause between stimulus and response | The pause that prevents reactive conflict |
| **Compassionate presence** | Self-compassion in difficult moments | Compassion for partner's difficult moments |
| **Mindful listening** | Full attention without planning response | Partner feels truly heard |

### Co-Regulation

Partners' nervous systems synchronize. When one partner is regulated (calm, present), it helps the other regulate. This is the scientific basis for:
- One partner practicing mindfulness can shift the entire relationship dynamic
- The Daily Loop works even when only one partner participates

### How Sparq Uses Mindfulness

- **Conflict First Aid Somatic Phase**: 60-second breathing exercise before any cognitive tools. Cannot be skipped. Based on the principle that a dysregulated nervous system cannot problem-solve.
- **Daily Actions**: "Take one breath before responding to your partner today"
- **Evening Reflection**: Peter encourages noticing without judgment: "What did you notice about how you felt?"
- **Morning Stories**: Often demonstrate the power of pausing, being present, listening fully
- **Day 4 concept**: "Taking a breath before reacting" — Regulation

---

## 10. NVC (Nonviolent Communication)

**Research basis**: Marshall Rosenberg (1960s-present). Used in 65+ countries for conflict resolution. Core insight: all human behavior is an attempt to meet universal needs.

### The 4-Step NVC Process

```
1. OBSERVATION  — What actually happened (facts, not interpretation)
2. FEELING      — How I feel about it (emotion, not thought)
3. NEED         — What need of mine is connected to this feeling
4. REQUEST      — A specific, doable action that would help
```

**Example transformation:**
- **Before NVC**: "You never listen to me. You're always on your phone."
- **After NVC**: "When I see you looking at your phone while I'm talking (observation), I feel unimportant (feeling), because I need to feel like I matter to you (need). Would you be willing to put your phone down when we're eating together? (request)"

### Expanding Emotional Vocabulary

Most people use ~10 emotion words. NVC teaches ~100+. This precision reduces misunderstandings:
- Instead of "fine" → "relieved," "content," "numb," "resigned"
- Instead of "angry" → "frustrated," "hurt," "disappointed," "overwhelmed"
- Instead of "happy" → "grateful," "excited," "peaceful," "proud"

### How Sparq Uses NVC

- **Translator Feature**: Rephrases user's messages using NVC structure
- **Skill Tree → Communication**: NVC framework is the backbone of communication skill exercises
- **Daily Actions**: "Try expressing one feeling using a specific emotion word today"
- **Morning Stories**: Alex and Sam often demonstrate the NVC shift (reactive → NVC)
- **Peter's Prompting**: "What were you feeling underneath that? What did you need in that moment?"

---

## 11. Somatic Approaches

**Research basis**: Peter Levine (Somatic Experiencing), Bessel van der Kolk ("The Body Keeps the Score"), Stephen Porges (Polyvagal Theory). Core insight: the body stores and processes emotional experience — cognitive understanding alone is insufficient.

### Window of Tolerance

```
     HYPERAROUSAL (fight/flight)
     ─────────────────────────
     │  WINDOW OF TOLERANCE  │  ← Where learning and connection happen
     ─────────────────────────
     HYPOAROUSAL (freeze/collapse)
```

- **Hyperarousal**: Racing heart, tension, anger, anxiety, can't sit still
- **Window of Tolerance**: Alert but calm, can think clearly, emotionally available
- **Hypoarousal**: Numbness, disconnection, fatigue, shutdown, dissociation

**Relationship implication**: Partners outside their window of tolerance cannot: listen, empathize, problem-solve, or connect. ALL relationship tools fail when the nervous system is dysregulated. Regulation must come first.

### Fight / Flight / Freeze in Relationships

| Response | Looks Like | Partner Experiences |
|---|---|---|
| **Fight** | Yelling, blaming, criticizing, pursuing | Threat, needing to defend or flee |
| **Flight** | Leaving the room, changing subject, staying busy | Abandonment, being unimportant |
| **Freeze** | Stonewalling, going blank, dissociating | Wall, rejection, "nobody's home" |
| **Fawn** | Over-agreeing, people-pleasing, suppressing own needs | Surface harmony masking resentment |

### Co-Regulation Exercises

| Exercise | Duration | Context |
|---|---|---|
| **Synchronized breathing** | 2 min | Sit facing each other, breathe together |
| **Hand on heart** | 1 min | Place hand on own heart while listening to partner |
| **Grounding (5-4-3-2-1)** | 3 min | Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste |
| **Shared silence** | 2 min | Sit together in comfortable silence, no agenda |
| **Temperature regulation** | 1 min | Hold warm drink, splash cold water — resets vagus nerve |

### Trauma-Informed Patterns

- Never force emotional disclosure
- Always offer a "this is enough" exit from exercises
- Titrate intensity — small doses of vulnerability with lots of safety
- Normalize protective responses ("Your body learned to do that for good reasons")

### How Sparq Uses Somatic Approaches

- **Conflict First Aid Somatic Phase**: 60-second breathing exercise with dark screen and timer. Cannot be skipped. This is the #1 safety design decision — regulate the nervous system before offering any cognitive tools.
- **Daily Actions**: "Before your next conversation, take three slow breaths" (Day 4)
- **Peter's Crisis Response**: De-escalation and grounding before any coaching
- **Forced Pause**: `daily_sessions.is_locked_for_pause` — when evening reflection indicates flooding, the session is locked and resumed tomorrow

---

## 12. Influence & Persuasion Psychology

**Research basis**: Robert Cialdini ("Influence," 1984), BJ Fogg (Behavior Design), Nir Eyal ("Hooked"), James Clear ("Atomic Habits"). Applied ethically — these principles serve the user's stated goals, never manipulate against their interests.

### Ethical Application Principles

Sparq uses influence psychology to **help users follow through on their own goals**. The user has already chosen to improve their relationship — these principles reduce friction and increase consistency.

| Principle | Research | Ethical Application in Sparq |
|---|---|---|
| **Reciprocity** | People return what they receive | Peter gives warmth/insight → user gives honest reflection |
| **Commitment/Consistency** | Small commitments lead to larger ones | 14-day progressive structure, public goal-setting |
| **Social Proof** | People follow what others do | "Other couples at your stage often notice..." (Peter's language) |
| **Liking/Rapport** | We're influenced by those we like | Peter's warm personality, otter character, humor |
| **Scarcity/Value** | We value what feels rare or limited | Premium content gating; "Today's focus" creates daily urgency |
| **Authority** | We trust credible expertise | "Research shows..." context in exercises; evidence-based framing |

### Habit Formation (Sparq's Engagement Model)

Based on BJ Fogg's Behavior Model (B = MAP: Motivation × Ability × Prompt):

- **Motivation**: Values anchoring (ACT), identity framing ("you're becoming someone who..."), streak mechanics
- **Ability**: Micro-format exercises (2-5 min), simplified language (4th-grade level), clear single actions
- **Prompt**: Morning notification, dashboard "Today's Focus," evening reminder

### Identity-Level Habit Design (James Clear)

"Every action is a vote for the type of person you wish to become."

Sparq uses this by:
- Framing daily actions as "votes" for the partner they want to be
- Peter narrating identity arcs, not just behavioral tips
- Graduation report as identity-level narrative ("who you became over 14 days")

### How Sparq Uses Influence Psychology

- **Streak Mechanics**: Commitment/consistency — maintaining a streak reinforces daily habit
- **Peter's Personality**: Liking/rapport — the warm otter character builds trust
- **Onboarding Design**: Small commitments first, progressive deepening
- **Social Proof Notifications**: "Other couples at your stage often notice..." (used sparingly, authentically)
- **Premium Gating**: Scarcity/value — free tier gives enough to prove value, premium unlocks full depth
- **Evidence Framing**: Authority — "Research shows that repair speed predicts relationship health better than conflict frequency"
