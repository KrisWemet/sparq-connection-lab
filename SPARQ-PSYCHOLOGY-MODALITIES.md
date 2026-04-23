# Sparq Connection — Psychological Modalities Reference

> **Purpose**: This is the definitive reference for all psychological modalities, content personalization rules, and therapeutic frameworks used in Sparq Connection. Feed this file to Claude Code alongside the skill creation prompts to produce richer, more accurate skills.
>
> **How to use**: Place this file in your Sparq project root (or Obsidian vault) and reference it when creating the `sparq-psychology` skill. Tell Claude Code: "Read ./SPARQ_PSYCHOLOGY_MODALITIES.md before creating the psychology skill."

---

## Table of Contents

1. [Philosophy & Positioning](#1-philosophy--positioning)
2. [Modality Overview Table](#2-modality-overview-table)
3. [Modality Deep Dives](#3-modality-deep-dives)
   - 3.1 Gottman Method
   - 3.2 Emotionally Focused Therapy (EFT)
   - 3.3 Acceptance & Commitment Therapy (ACT)
   - 3.4 Cognitive Behavioral Therapy (CBT)
   - 3.5 Positive Psychology
   - 3.6 Attachment Theory
   - 3.7 Internal Family Systems (IFS)
   - 3.8 Mindfulness-Based Approaches
   - 3.9 Nonviolent Communication (NVC)
   - 3.10 Somatic Approaches
   - 3.11 Narrative Therapy
   - 3.12 Influence & Persuasion Psychology
4. [Personality Assessment Frameworks](#4-personality-assessment-frameworks)
5. [Content Personalization System](#5-content-personalization-system)
6. [Content Generation Rules](#6-content-generation-rules)
7. [Daily Loop Integration](#7-daily-loop-integration)
8. [Question Bank Patterns](#8-question-bank-patterns)
9. [Exercise Templates](#9-exercise-templates)
10. [Safety & Legal Guardrails](#10-safety--legal-guardrails)
11. [Database Schema Reference](#11-database-schema-reference)

---

## 1. Philosophy & Positioning

Sparq Connection is a **"relationship gym"** — not therapy, not counseling, not a clinical tool. It's an educational platform deeply rooted in psychology and influence that helps individuals and couples grow.

**Core belief**: When each individual heals, it's easier to heal the relationship.

**Positioning**: Educational with real-life strategies, deeply rooted in psychology and influence. The app uses different psychology and influence techniques from the moment the user logs in to help the individual AND the couple.

**What we are**:
- An evidence-based relationship growth platform
- A tool therapists confidently recommend for between-session work
- A personalized psychology-informed experience that feels like it was built for YOU

**What we are NOT**:
- Therapy or a therapy replacement
- A clinical diagnostic tool
- A crisis intervention platform
- Generic relationship advice

**Competitive advantage**: While Paired uses basic Gottman and Lasting offers generic advice, Sparq integrates 12+ modalities with real-time personalization based on individual psychology profiles. No other app does this.

---

## 2. Modality Overview Table

| # | Modality | Primary Use in Sparq | Features It Powers | Evidence Strength (1-10) |
|---|---------|---------------------|-------------------|------------------------|
| 1 | Gottman Method | Communication patterns & conflict management | Four Horsemen detection, Love Maps, bid tracking, repair attempts | 9 |
| 2 | EFT | Emotional bonding & attachment security | Negative cycle identification, emotional accessibility exercises, bonding prompts | 9 |
| 3 | ACT | Values alignment & psychological flexibility | Values identification exercises, cognitive defusion micro-practices, committed action prompts | 7 |
| 4 | CBT | Thought pattern awareness & restructuring | Cognitive distortion identification, thought records, behavioral activation | 8 |
| 5 | Positive Psychology | Strengths & gratitude | Character strengths assessment, gratitude practices, savoring exercises, PERMA tracking | 7 |
| 6 | Attachment Theory | Core personality profiling & content personalization | Onboarding assessment, content adaptation engine, partner compatibility insights | 9 |
| 7 | IFS | Self-awareness & internal conflict resolution | Parts identification, Self-leadership exercises, unblending practices | 6 |
| 8 | Mindfulness | Present-moment awareness & regulation | Mindful listening exercises, co-regulation practices, guided awareness moments | 7 |
| 9 | NVC | Communication skills & empathy | Four-step communication exercises, feelings vocabulary building, needs expression | 7 |
| 10 | Somatic | Body awareness & nervous system regulation | Grounding exercises, co-regulation practices, body check-in prompts | 5 |
| 11 | Narrative Therapy | Story reframing & journaling | Reflection prompts, relationship narrative exercises, externalization practices | 6 |
| 12 | Influence Psychology | Ethical engagement & habit formation | Reciprocity practices, commitment reinforcement, social proof elements, app engagement design | 6 |

---

## 3. Modality Deep Dives

### 3.1 Gottman Method

**Research Foundation**: Dr. John Gottman, 40+ years of longitudinal research with 3,000+ couples, 94% accuracy in predicting relationship outcomes.

**Key Principles**:
- **Sound Relationship House Theory**: Seven levels of relationship building (Love Maps → Fondness & Admiration → Turning Toward → Positive Perspective → Manage Conflict → Make Life Dreams Come True → Create Shared Meaning)
- **Four Horsemen**: The four destructive communication patterns that predict relationship failure:
  - *Criticism* → Antidote: Gentle Startup (use "I" statements, describe the situation, express needs)
  - *Contempt* → Antidote: Build Culture of Appreciation (daily gratitude, fondness expression)
  - *Defensiveness* → Antidote: Take Responsibility (acknowledge partner's perspective, own your part)
  - *Stonewalling* → Antidote: Physiological Self-Soothing (take breaks, practice calming, return to conversation)
- **Love Maps**: Deep knowledge of partner's inner psychological world — their dreams, stressors, joys, fears, aspirations
- **5:1 Ratio**: Positive Sentiment Override — successful relationships maintain at least 5 positive interactions for every negative one
- **Bid-and-Response**: Tracking how partners respond to emotional "bids" for connection (turning toward, turning away, turning against)
- **Repair Attempts**: Communication strategies to de-escalate conflict and reconnect

**Sparq Implementation**:
- Four Horsemen detection in user response patterns
- Love Maps building through daily partner knowledge questions
- 5:1 ratio tracking in relationship health scoring
- Bid-and-response awareness exercises
- Repair attempt training through guided practice prompts
- Gentle Startup practice exercises

**Database Integration**:
```
Modality name: 'gottman_method'
Assessment domains: love_maps, fondness_admiration, turning_towards, conflict_management, shared_meaning
Intervention categories: love_map_building, appreciation_exercises, repair_attempt_training, ritual_creation, gentle_startup
```

**Example Interventions**:
- "Gentle Startup Practice" — Transform criticism into gentle conversation starters (Steps: Start positive → Use I statements → Be specific → Express feelings → Make clear request)
- "Love Maps Update" — Weekly partner knowledge questions that deepen understanding
- "Repair Attempt Practice" — Phrases and techniques for de-escalating conflict

---

### 3.2 Emotionally Focused Therapy (EFT)

**Research Foundation**: Sue Johnson, 70-73% recovery rate for distressed couples, recognized by APA.

**Key Principles**:
- **Attachment Security**: Creating safe emotional bonds between partners
- **Negative Cycle Identification**: Recognizing destructive interaction patterns:
  - Pursue-Withdraw (one partner seeks closeness, the other pulls away)
  - Criticize-Defend (one attacks, the other deflects)
  - Attack-Counterattack (both escalate)
- **Emotional Accessibility**: Being open, responsive, and engaged with partner's emotions
- **Identify-Explore-Restructure**: The therapeutic cycle adapted for daily check-in prompts
- **Vulnerability and Connection**: Creating safety for vulnerable emotional expression

**Sparq Implementation**:
- Negative cycle pattern detection from user responses
- Emotional accessibility exercises in Daily Loop
- Bonding conversation prompts that facilitate safe vulnerability
- Cycle-mapping exercises for couple awareness
- Emotional expression scaffolding (graduated vulnerability)

**Database Integration**:
```
Modality name: 'eft_approach'
Assessment domains: attachment_security, emotional_responsiveness, negative_cycles, secure_base_behavior
Intervention categories: cycle_mapping, emotional_expression, bonding_exercises
```

---

### 3.3 Acceptance & Commitment Therapy (ACT)

**Research Foundation**: Steven Hayes, extensive evidence base for psychological flexibility.

**Key Principles**:
- **Values Identification**: Clarifying what matters most in the relationship
- **Cognitive Defusion**: Unhooking from unhelpful thoughts ("I'm having the thought that..." rather than "My partner always...")
- **Present-Moment Awareness**: Mindful attention to the current experience
- **Committed Action**: Taking steps aligned with relationship values even when uncomfortable
- **Psychological Flexibility**: Adapting responses based on values rather than reactive patterns
- **Acceptance**: Making room for difficult emotions without being controlled by them

**Sparq Implementation**:
- Values alignment exercises for individuals and couples
- Cognitive defusion micro-practices (2-minute reframing exercises)
- Committed action prompts ("Based on your value of [connection], what's one small thing you could do today?")
- Psychological flexibility tracking as a growth metric
- Acceptance-based exercises for relationship difficulties

**Maps to Daily Loop**: ACT exercises are particularly well-suited to the 2-5 minute micro-format. Defusion exercises can be as simple as "Notice a thought about your partner. Now add 'I notice I'm having the thought that...' before it. How does that change things?"

---

### 3.4 Cognitive Behavioral Therapy (CBT)

**Research Foundation**: Aaron Beck's cognitive model, extensive evidence base for relationship issues.

**Key Principles**:
- **Thought-Feeling-Behavior Triangle**: How thoughts drive emotions which drive actions in relationships
- **Cognitive Distortions in Relationships**:
  - Mind Reading ("They didn't text back, so they must be angry at me")
  - Catastrophizing ("This argument means we're going to break up")
  - All-or-Nothing Thinking ("You never listen to me" / "You always do this")
  - Personalization ("It's my fault they're in a bad mood")
  - Should Statements ("They should know what I need without me saying it")
  - Emotional Reasoning ("I feel unloved, so I must be unloved")
- **Behavioral Activation**: Increasing engagement in positive relationship behaviors
- **Communication Skills Training**: Structured approaches to better conversations

**Sparq Implementation**:
- Cognitive distortion identification exercises ("Which of these thinking patterns do you notice?")
- Thought record micro-exercises (situation → thought → feeling → alternative thought)
- Behavioral activation prompts ("Schedule one positive interaction today")
- Communication skill-building through daily practice

---

### 3.5 Positive Psychology

**Research Foundation**: Martin Seligman's PERMA model, Peterson & Seligman's VIA Character Strengths.

**Key Principles**:
- **PERMA Model** applied to couples:
  - *Positive Emotions*: Cultivating joy, gratitude, serenity, interest in the relationship
  - *Engagement*: Flow states in shared activities
  - *Relationships*: The quality of the bond itself
  - *Meaning*: Shared purpose and values
  - *Achievement*: Celebrating growth and milestones together
- **Character Strengths**: VIA framework (wisdom, courage, humanity, justice, temperance, transcendence) — identifying and leveraging individual and couple strengths
- **Gratitude Practices**: Daily appreciation expression, gratitude journaling
- **Growth Mindset**: Believing the relationship can improve through effort
- **Savoring**: Deliberately attending to and appreciating positive shared experiences

**Sparq Implementation**:
- Character Strengths assessment in onboarding
- Daily gratitude micro-practices ("Name one thing your partner did today that you appreciated")
- Strengths-based exercises ("Your top strength is kindness. How can you use it in your relationship this week?")
- Savoring prompts after positive experiences
- PERMA tracking in relationship health score

**Day 1 Priority**: Positive Psychology leads the onboarding experience (warm, strengths-based, non-threatening). Attachment Theory comes Days 2-3 for the deeper hook.

---

### 3.6 Attachment Theory

**Research Foundation**: John Bowlby, Mary Ainsworth, foundational research on attachment bonds. Neuroscience research confirms different attachment styles show distinct brain activation patterns.

**THIS IS THE MOST CRITICAL MODALITY FOR PERSONALIZATION.**

**Four Attachment Styles**:

**Secure** (~55% of population):
- Comfortable with intimacy AND independence
- Can communicate needs directly
- Trust partner's availability
- Regulate emotions effectively
- Brain: Balanced activation of approach/aversion systems, efficient emotion regulation

**Anxious** (~20% of population):
- Hyperactivating strategy — amplifies distress to elicit caregiving
- Craves reassurance but struggles to believe it
- Fears abandonment, monitors partner closely
- Difficulty with self-soothing
- Brain: Elevated amygdala activity, difficulty with emotion regulation, negative self-model
- In Sparq: Needs frequent, predictable check-ins with warm reassuring tone emphasizing security

**Avoidant** (~25% of population):
- Deactivating strategy — suppresses emotions to maintain independence
- Values self-sufficiency, uncomfortable with dependency
- Maintains positive self-model but negative other-model
- Appears calm but shows elevated physiological stress (heart rate, cortisol)
- Brain: Suppression (not reappraisal) of emotions, cognitively demanding
- In Sparq: Needs autonomy-respecting invitations without pressure, less frequent user-controlled notifications

**Disorganized/Fearful** (~5% of population):
- Conflicting strategies — wants closeness but fears it
- Often linked to early trauma
- Inconsistent behavior patterns
- In Sparq: Needs trauma-informed approach, gentle pacing, extra safety cues

**The Anxious-Avoidant Trap** (Critical for couple features):
This is the most researched destructive dyadic pattern:
1. Anxious partner senses distance → seeks closeness
2. Avoidant partner feels pressured → withdraws
3. Withdrawal confirms anxious fears → escalates pursuit
4. Pursuit overwhelms avoidant → increases distance
= The pursue-withdraw cycle that Gottman identifies as predicting relationship failure.

**Breaking the pattern requires**:
- Anxious partners: self-soothing before pursuing, scheduled check-ins to reduce hypervigilance
- Avoidant partners: proactive small bids for connection, explicitly stating need for space rather than just withdrawing

**Content Personalization by Attachment Style** (see Section 5 for full details):
- Every question, exercise, and prompt gets adapted based on the user's attachment profile
- The app should feel like it was "built and talking straight to them"

**Database Integration**:
```
Modality name: 'attachment_theory'
Assessment domains: attachment_style, secure_base_provision, emotional_regulation_capacity, intimacy_comfort
Intervention categories: secure_base_building, emotion_regulation_training, intimacy_building, injury_repair_process
User profile fields: primary_attachment_style, secondary_attachment_style, attachment_confidence_level
```

---

### 3.7 Internal Family Systems (IFS)

**Research Foundation**: Richard Schwartz's parts-based therapy model.

**Key Principles**:
- **Self-Leadership**: Leading from the compassionate, curious, calm, connected Self
- **Parts Awareness**: Recognizing different internal voices/parts:
  - *Managers*: Proactive protectors (control, planning, people-pleasing)
  - *Firefighters*: Reactive protectors (anger, numbing, distraction)
  - *Exiles*: Wounded parts carrying pain, shame, fear
- **Unblending**: Separating from reactive parts to respond from Self
- **Parts Communication**: Internal dialogue between parts

**Sparq Implementation**:
- Parts identification exercises ("When you feel defensive in arguments, which part of you is activated?")
- Self-leadership practice (recognizing when a part is driving vs. Self)
- Unblending techniques for conflict situations
- Understanding how your parts interact with your partner's parts

---

### 3.8 Mindfulness-Based Approaches

**Research Foundation**: Jon Kabat-Zinn, Thich Nhat Hanh. Carson et al. (2004) Mindfulness-Based Relationship Enhancement study.

**Key Principles**:
- **Present-Moment Awareness**: Being fully present with partner, not on autopilot
- **Non-Judgmental Observation**: Noticing thoughts and behaviors without labeling them good/bad
- **Emotional Regulation**: Using awareness to manage reactivity
- **Compassionate Presence**: Bringing kindness to difficult moments
- **Mindful Listening**: Fully attending to partner without planning a response
- **Conscious Speaking**: Choosing words intentionally

**Co-Regulation Practices**:
- Synchronized breathing exercises
- Shared silence moments
- Mindful touch (gentle, non-sexual connection)
- Shared movement (walking together mindfully)

**Sparq Implementation**:
- 2-minute mindful listening exercises
- Pre-conversation grounding practices
- Co-regulation exercises for couples
- Mindful check-in prompts before Daily Loop exercises

---

### 3.9 Nonviolent Communication (NVC)

**Research Foundation**: Marshall Rosenberg.

**Key Principles — The Four-Step Process**:
1. **Observation** (without evaluation): "When I notice [specific behavior]..." NOT "You always/never..."
2. **Feelings** (identification): "I feel [emotion]..." NOT "I feel like you..."
3. **Needs** (awareness and expression): "Because I need [need]..." — connecting feelings to universal human needs
4. **Requests** (specific, doable): "Would you be willing to [specific action]?" NOT demands

**Empathic Listening**: Hearing the feelings and needs behind what someone says, even when they express it as criticism.

**Sparq Implementation**:
- NVC practice exercises in Daily Loop
- Feelings vocabulary expansion (many people only use ~5 emotion words)
- Needs identification exercises
- Guided conversation starters using NVC framework
- "Translate this" exercises (converting criticism to NVC format)

---

### 3.10 Somatic Approaches

**Research Foundation**: Peter Levine (Waking the Tiger), Bessel van der Kolk (The Body Keeps the Score).

**Key Principles**:
- **Body Awareness**: Noticing physical sensations during relationship interactions
- **Nervous System Regulation**: Understanding the window of tolerance
  - *Hyperarousal* (fight/flight): racing heart, tension, anxiety, anger
  - *Hypoarousal* (freeze/collapse): numbness, disconnection, shutdown
  - *Window of Tolerance*: the zone where you can think clearly and communicate effectively
- **Trauma-Informed Relationship Patterns**: How unresolved trauma shows up in partnerships
- **Co-Regulation**: Using physical connection to help regulate each other's nervous systems
- **Grounding Techniques**: Bringing yourself back into the present moment through body awareness

**Sparq Implementation**:
- Body check-in prompts ("Where do you notice tension right now?")
- Grounding exercises before difficult conversations
- Co-regulation partner exercises (synchronized breathing, gentle touch)
- Window of tolerance awareness ("Are you in a place to have this conversation right now?")
- Nervous system regulation techniques

---

### 3.11 Narrative Therapy

**Research Foundation**: Michael White and David Epston.

**Key Principles**:
- **Externalization**: "The problem is the problem, not the person" — separating the issue from identity
- **Re-authoring**: Rewriting the dominant story of the relationship by finding overlooked positive moments
- **Unique Outcomes**: Identifying times when the problem DIDN'T happen or was overcome
- **Preferred Stories**: Consciously choosing the narrative about your relationship and future

**Sparq Implementation**:
- Reflection prompts for journaling features
- "Rewrite the story" exercises (taking a negative narrative and finding the counter-evidence)
- Externalization practice ("Instead of 'we're bad at communication,' try 'communication challenges visit us when we're tired'")
- Unique outcomes journaling ("Write about a time you handled conflict well together")

---

### 3.12 Neuroplasticity + Habit Science (formerly "Influence & Persuasion Psychology")

> **Framework update:** This section's content maps to the revised Pillar 6 (Neuroplasticity + Habit Science) and Pillar 7 (Positive Psychology & Relationship Science) in the current eight-pillar architecture. The underlying techniques (reciprocity, commitment, habit formation) are valid; the "Influence & Persuasion" label has been retired. Core research: Wendy Wood (USC), James Clear, Robert Cialdini.

**Research Foundation**: Robert Cialdini (Influence: The Psychology of Persuasion); Wendy Wood (habit science, USC).

**Ethical Application for Positive Relationship Dynamics**:
- **Reciprocity**: Balanced giving and receiving — exercises that create positive exchange cycles
- **Consistency & Commitment**: Aligning daily actions with stated relationship values. Streak mechanics. Public commitment to growth.
- **Social Proof**: Learning from successful couples, community features, "other couples who did this exercise reported..."
- **Liking & Rapport**: Building genuine connection and affinity through shared positive experiences
- **Scarcity & Value**: Appreciating what's precious and unique about the relationship
- **Authority & Expertise**: Research citations, therapist endorsements, evidence-based positioning

**Sparq Implementation (also drives app engagement design)**:
- Reciprocity-based exercises ("Do one thing for your partner today. Notice what comes back.")
- Commitment devices (streaks, goals, identity archetypes)
- Social proof elements in UI ("92% of couples who completed this exercise reported feeling closer")
- Value appreciation prompts
- The app itself uses these principles ethically to form healthy habits

---

## 4. Personality Assessment Frameworks

### Assessment Dimensions (Discovered Progressively During Onboarding + Days 1-14)

**1. Attachment Style** (Primary driver of content personalization)
- Assessed through: ECR-R inspired questions (simplified, 15-question version)
- Outputs: Primary style (Secure/Anxious/Avoidant/Disorganized), secondary tendencies, confidence level
- Updates: Re-assessed quarterly or after significant life events

**2. Love Languages** (Gary Chapman's 5)
- Words of Affirmation
- Quality Time
- Receiving Gifts
- Acts of Service
- Physical Touch
- Assessed through: 10-question quiz in early onboarding days
- Drives: Exercise selection, micro-action suggestions, partner insight cards

**3. Communication Style**
- Conflict approach (direct/indirect/avoidant)
- Emotional expression level (high/moderate/reserved)
- Listening style (active/empathic/fix-it/passive)
- Feedback receptivity (welcomes/cautious/defensive)
- Discovered through: Response patterns during Days 1-14

**4. Conflict Resolution Style**
- Compete, Collaborate, Compromise, Accommodate, Avoid
- Discovered through: Scenario-based questions during assessment period

**5. Emotional Regulation Patterns**
- Self-soothing capacity
- Co-regulation needs
- Stress response (fight/flight/freeze/fawn)
- Discovered through: Behavioral questions and response timing patterns

### Identity Archetypes (Selected during onboarding)
Users choose an identity archetype that affects content framing, celebration language, and micro-action style:
- **Calm Anchor** — Stability-focused, grounding
- **Compassionate Listener** — Empathy-focused, feeling-oriented
- **Growth Seeker** — Challenge-focused, achievement-oriented
- **Connection Builder** — Relationship-focused, togetherness-oriented

These archetypes work WITH attachment style, not instead of it. Archetype affects framing; attachment style affects content depth and wording.

### Progressive Discovery (NOT upfront questionnaire)
- Day 1: Name, solo/partner, what brings you here, daily time preference, identity archetype
- Days 2-14: Assessment questions woven naturally into daily exercises
- By Day 14: Full personality profile built from actual answers and behaviors
- Users don't realize they're being assessed — it feels like engaging content
- More accurate than self-report questionnaires because it's based on real responses

---

## 5. Content Personalization System

### The Core Rule
**Every piece of content must feel like it was written FOR this specific user.** An avoidant reads the same words differently than an anxious person. The app must adapt.

### Attachment-Style Content Adaptation

**Same exercise, three versions:**

**Exercise: "Share something vulnerable with your partner today"**

For **Anxious** attachment:
> "Your willingness to be open is a real strength. Today, share one thing you've been feeling with your partner. Remember — you don't need their immediate response to validate what you're feeling. Your emotions are already real and already matter. After sharing, try sitting with whatever comes, even if your partner needs time to process."

For **Avoidant** attachment:
> "Today's practice is about choosing to share — on your terms, at your pace. Pick one thing from your inner world to share with your partner. It can be small. You're not giving up your independence by letting someone in — you're actually building a stronger foundation. Share only what feels manageable right now."

For **Secure** attachment:
> "Today, share something you've been thinking or feeling with your partner. Notice how the conversation flows. What did you learn about each other? How did it feel to be heard?"

### Language Adaptation Rules

**For Anxious Users**:
- Lead with validation ("Your feelings make sense")
- Emphasize security and predictability
- Use reassuring language
- Include self-soothing suggestions alongside connection exercises
- More frequent, predictable check-ins
- AVOID: suggesting they "need space" or "stop worrying"
- NEVER say: "you're being too emotional" or "relax"
- Notification tone: warm, reassuring, emphasizing "I'm here"

**For Avoidant Users**:
- Lead with autonomy and choice ("You get to decide")
- Respect their need for independence
- Frame vulnerability as strength, not weakness
- Start with behavioral tasks before emotional vulnerability
- Less frequent, user-controlled notifications
- AVOID: pressuring emotional expression or demanding openness
- NEVER say: "you need to open up more" or "why won't you talk about it?"
- Notification tone: respectful, non-intrusive, emphasizing choice

**For Disorganized Users**:
- Extra gentle, trauma-informed approach
- Clear safety cues
- Slower pacing
- More explicit permission-giving ("It's okay to skip this one")
- Both validation AND autonomy messaging

**For Secure Users**:
- Direct, collaborative language
- Can handle more complexity and nuance
- Focus on deepening rather than building safety
- Less scaffolding needed

### Notification Personalization
- **Anxious**: More frequent, predictable, emotionally warm ("Your daily growth moment is ready ✨")
- **Avoidant**: Less frequent, user-controlled, practical ("New practice available when you're ready")
- **Secure**: Standard frequency, balanced tone

---

## 6. Content Generation Rules

### Tone & Voice
- Warm, accessible, conversational — like a supportive, knowledgeable friend
- Never clinical, academic, or textbook-like
- Never preachy, never lecturing
- Identity-based framing (James Clear, Atomic Habits): identity reinforcement ("As a Growth Seeker, you...") — no embedded commands
- Peter the otter's voice when delivering celebration/encouragement (see Peter specs)

### Framing
- Frame everything as growth and practice, NEVER treatment or diagnosis
- "Relationship gym" language — practice, train, strengthen, build, grow
- NEVER suggest a user has a disorder or pathology
- NEVER use diagnostic language (don't say "your anxious attachment" — say "your tendency to seek reassurance" or "your desire for closeness")
- Can say: "Research shows that people who value closeness in relationships often..."
- Cannot say: "Your anxious attachment style means you..."

### Question Design
- Open-ended and invitational, never interrogative
- Multiple choice heavy in Days 1-7, mixed 8-14, open-ended heavy 15+
- Always map to at least one modality and one therapeutic intent
- Include "why this matters" context with accessible science
- Scaffold difficulty: beginner → intermediate → advanced within each modality

### Exercise Design
- Completable in 2-5 minutes (micro-format for Daily Loop)
- Every day has BOTH a discovery/learning element AND an immediate actionable practice
- Daily cycle: Learn → Implement → Reflect (rewrites subconscious through practice, not just knowledge)
- Always provide clear, specific instructions — not vague advice
- Include partner-sharing option but never require it (especially for solo users)

### Relationship Stage Awareness
Content adapts based on relationship stage:
- **New** (< 1 year): Focus on building foundation, discovery, positive patterns
- **Established** (1-5 years): Deepening connection, preventing stagnation, maintaining curiosity
- **Long-term** (5+ years): Reinvention, rekindling, addressing accumulated patterns
- **Struggling**: Repair-focused, gentle, emphasizing safety and small wins
- **Individual/Solo**: Self-focused growth, understanding own patterns, preparing for better partnership

---

## 7. Daily Loop Integration

### Daily Session Structure (5 minutes)

**Morning Session**:
1. **Yesterday's Reflection** (30 sec) — Quick check on yesterday's micro-action
2. **Today's Learn** (2 min) — Discovery question or psycho-educational content. Draws from the day's selected modality.
3. **Today's Implement** (2 min) — Micro-action or exercise to practice throughout the day
4. **Set Intention** (30 sec) — Brief commitment to today's practice

**Optional Evening Reflection** (for advanced users):
- How did the micro-action go?
- What did you notice?
- Brief gratitude moment

### Modality Rotation Strategy
- Days 1-3: Positive Psychology (warm, approachable, non-threatening entry)
- Days 4-7: Attachment Theory + Gottman (the deeper hook — "aha moment" territory)
- Days 8-14: Rotating through all modalities based on user profile and responses
- Day 14: Personality profile reveal — major milestone and retention moment
- Days 15+: AI-driven selection based on profile, recent responses, and growth areas

### Question-to-Modality Mapping
Every question in the bank is tagged with:
- `modality_id` — which framework it draws from
- `psychological_intent` — what it's designed to surface or develop
- `difficulty_level` — 1-5, used for scaffolding
- `attachment_adaptations` — alternative wordings per attachment style
- `relationship_stage` — which stages it's appropriate for
- `expected_outcomes` — what growth looks like after engaging
- `follow_up_suggestions` — what to serve next based on the response

---

## 8. Question Bank Patterns

### Example Questions by Modality (2 per modality, showing structure)

**Gottman Method**:
1. "What's something your partner is currently worried about?" (Love Maps, difficulty: 1)
   - Intent: Building partner knowledge
   - Why it matters: "Gottman's research shows couples who maintain updated 'love maps' — detailed knowledge of each other's inner world — handle stress better and stay connected through life changes."

2. "Think about your last disagreement. Did you notice yourself criticizing, getting defensive, shutting down, or feeling contempt? Which one showed up most?" (Four Horsemen awareness, difficulty: 2)
   - Intent: Self-awareness of destructive patterns
   - Why it matters: "These four patterns — what researcher John Gottman calls 'the Four Horsemen' — are the strongest predictors of relationship difficulty. Recognizing them is the first step to replacing them with healthier alternatives."

**EFT**:
1. "When you feel disconnected from your partner, what do you usually do? Move toward them, pull away, or something else?" (Negative cycle identification, difficulty: 1)
2. "What would it feel like to tell your partner 'I need you' right now? Notice what comes up." (Emotional accessibility, difficulty: 3)

**ACT**:
1. "If your relationship could be about anything — with no barriers — what would it be about? What matters most to you?" (Values identification, difficulty: 1)
2. "Notice a critical thought you have about your partner. Now try saying: 'I notice I'm having the thought that...' How does that feel different?" (Cognitive defusion, difficulty: 2)

**CBT**:
1. "When your partner didn't respond to your text for hours, what was the first thought that popped into your head?" (Cognitive distortion identification, difficulty: 1)
2. "Is there a 'should' that you hold about your partner? ('They should know what I need.' 'They should be more romantic.') Where did that expectation come from?" (Should statements, difficulty: 2)

**Positive Psychology**:
1. "What's one character strength your partner has that you really admire?" (Strengths appreciation, difficulty: 1)
2. "Recall a recent positive moment with your partner. Close your eyes for 30 seconds and really re-experience it — the sights, sounds, feelings." (Savoring, difficulty: 1)

**Attachment Theory**:
1. "When you're stressed, what do you need most from your partner? (Talk it out / Space to process / Physical comfort / Practical help / Distraction)" (Stress response mapping, difficulty: 1)
2. "After a fight, what needs to happen before you can move on?" (Repair style, difficulty: 2)

**IFS**:
1. "When you get defensive during an argument, what's the voice inside saying? Something like 'I need to protect myself' or 'They don't understand'?" (Parts awareness, difficulty: 2)
2. "Is there a part of you that takes over during conflict? What's it trying to protect?" (Parts identification, difficulty: 3)

**Mindfulness**:
1. "Right now, take three slow breaths. On each exhale, notice one thing about how your body feels." (Present-moment awareness, difficulty: 1)
2. "Next time your partner is talking, try this: Don't plan what you'll say next. Just listen. Notice what you hear differently." (Mindful listening, difficulty: 2)

**NVC**:
1. "Think of something that bothered you recently. Can you separate what actually happened (the facts) from your interpretation of it?" (Observation vs. evaluation, difficulty: 2)
2. "What do you need most in your relationship right now? (Not what you want your partner to DO — what you actually need to FEEL.)" (Needs identification, difficulty: 2)

**Somatic**:
1. "Where in your body do you first notice stress? Shoulders? Chest? Stomach? Jaw?" (Body awareness, difficulty: 1)
2. "Before your next important conversation with your partner, try this: plant your feet, take 3 deep breaths, and feel the ground beneath you." (Grounding, difficulty: 1)

**Narrative Therapy**:
1. "If your relationship challenges were a character in a story (not you or your partner, but something separate), what would you name that character?" (Externalization, difficulty: 2)
2. "Think of a time when you and your partner handled something difficult really well together. What was different about that time?" (Unique outcomes, difficulty: 2)

**Influence Psychology**:
1. "What's one small thing your partner did for you recently that you could acknowledge today?" (Reciprocity, difficulty: 1)
2. "What's something rare and precious about your relationship that you might be taking for granted?" (Scarcity/value, difficulty: 2)

---

## 9. Exercise Templates

### Template Structure
```
Title: [Exercise name]
Modality: [Which framework]
Type: individual | partner | combined
Time: [2-5 minutes]
Difficulty: [1-5]
Attachment adaptations: [variations by style]

Instructions:
[Step-by-step, clear, specific]

Reflection prompt:
[What to notice/journal after]

Partner sharing prompt (optional):
[How to share the experience]

Why this matters:
[Accessible science explanation]
```

### Example: Gottman Gentle Startup Practice
```
Title: The Gentle Startup
Modality: Gottman Method
Type: individual (practice solo, use with partner)
Time: 3 minutes
Difficulty: 2

Instructions:
1. Think of something that's been bothering you about your relationship lately.
2. Instead of starting with "You always..." or "You never...", try this formula:
   - "I feel [emotion] about [specific situation]."
   - "I need [what you need]."
   - "Would you be willing to [specific, doable request]?"
3. Write it out. Read it back. Does it sound like an invitation or an attack?

Reflection:
How did it feel to express the same frustration differently? What shifted?

Partner sharing (optional):
Try using your gentle startup in a real conversation this week. Notice what's different.

Why this matters:
Research shows that conversations tend to end on the same note they begin. Starting gently — with "I" statements and specific requests instead of blame — changes the entire trajectory of the conversation.

Attachment adaptations:
- Anxious: Add "Remember, expressing your needs clearly is the healthiest way to get them met. You don't need to escalate to be heard."
- Avoidant: Add "This isn't about being overly emotional — it's about being precise. Think of it as clear, efficient communication."
- Secure: Standard version.
```

### Example: Somatic Grounding for Couples
```
Title: 60-Second Co-Regulation Reset
Modality: Somatic Approaches
Type: partner
Time: 2 minutes
Difficulty: 1

Instructions:
1. Sit or stand facing your partner.
2. Both take 3 slow breaths together. Try to synchronize.
3. Place one hand on your own heart. Notice the feeling.
4. If comfortable, place your other hand on your partner's hand or shoulder.
5. Breathe together for 60 seconds. No words needed.

Reflection:
What did you notice in your body? Did anything shift between the start and end?

Why this matters:
Our nervous systems are wired to sync with the people closest to us. Research on autonomic nervous system regulation shows that co-regulation — calming ourselves through connection with a trusted person — is one of the most powerful ways to reduce stress and build security. (This includes the clinical work of Stephen Porges, alongside HRV research by Thayer & Lane and affective neuroscience by Davidson et al.)

Attachment adaptations:
- Anxious: "This exercise is about being present, not about getting a specific response. Notice what YOUR body feels, not just your partner's reaction."
- Avoidant: "Physical co-regulation might feel unfamiliar. Start with just the breathing — no touch needed. You can add that when it feels right."
```

---

## 10. Safety & Legal Guardrails

### What We Never Do
- No crisis intervention features (removed to reduce legal complexity)
- No clinical claims ("This will treat your depression" ← NEVER)
- No diagnostic language ("You have anxious attachment disorder" ← NEVER)
- No regulated therapeutic assessments — simplified, educational versions only
- No medication or medical advice
- No mandatory reporting language or frameworks
- Never position the app as a replacement for therapy

### What We Always Do
- Position as educational and growth-focused
- Use published research as foundation but present accessibly
- Include "if you're in crisis" resources in app settings (but don't build a crisis system)
- Respect user autonomy — always allow skipping, always allow "not now"
- Protect privacy — sensitive response data encrypted, never used for training
- Use ideas and themes from modalities without clinical-specific terminology

### Language Substitutions
| Don't Say | Do Say |
|-----------|--------|
| "Your anxious attachment" | "Your tendency to seek reassurance" |
| "Your avoidant attachment" | "Your need for independence" |
| "Disorder" | "Pattern" or "tendency" |
| "Diagnosis" | "Insight" or "awareness" |
| "Treatment" | "Practice" or "exercise" |
| "Therapy" | "Growth work" or "personal development" |
| "Patient" | "User" or just their name |
| "Symptom" | "Signal" or "pattern" |
| "Dysfunction" | "Challenge" or "growth area" |
| "Pathological" | Never use this word |

---

## 11. Database Schema Reference

### Core Psychology Tables

```sql
-- Therapeutic Modalities Master Table
therapeutic_modalities (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,  -- 'gottman_method', 'eft_approach', etc.
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    research_basis TEXT,
    key_principles JSONB NOT NULL,
    assessment_categories JSONB NOT NULL,
    intervention_strategies JSONB NOT NULL,
    evidence_strength INTEGER (1-10),
    is_active BOOLEAN DEFAULT TRUE
)

-- Psychology Framework Components
psychology_frameworks (
    id UUID PRIMARY KEY,
    modality_id UUID → therapeutic_modalities(id),
    framework_name TEXT NOT NULL,
    category TEXT ('assessment' | 'intervention' | 'principle' | 'theory'),
    description TEXT,
    implementation_guide JSONB,
    research_citations TEXT[],
    difficulty_level INTEGER (1-5)
)

-- User Psychology Profiles
user_psychology_profiles (
    id UUID PRIMARY KEY,
    user_id UUID → users(id) UNIQUE,
    primary_attachment_style TEXT ('secure' | 'anxious' | 'avoidant' | 'disorganized' | 'unknown'),
    secondary_attachment_style TEXT,
    attachment_confidence_level FLOAT (0-1),
    communication_style JSONB,
    identified_growth_areas TEXT[],
    character_strengths TEXT[],
    relationship_goals TEXT[],
    completed_assessments JSONB,
    assessment_scores JSONB,
    profile_completion_percentage FLOAT (0-100)
)

-- Question Psychology Mapping
question_psychology_mapping (
    id UUID PRIMARY KEY,
    question_id UUID → question_bank(id),
    modality_id UUID → therapeutic_modalities(id),
    psychological_intent TEXT[],
    therapeutic_outcome TEXT,
    difficulty_level INTEGER,
    attachment_adaptations JSONB  -- {"anxious": "...", "avoidant": "...", "secure": "..."}
)

-- Relationship Psychology Metrics
relationship_psychology_metrics (
    id UUID PRIMARY KEY,
    relationship_id UUID,
    modality_id UUID → therapeutic_modalities(id),
    metric_type TEXT,  -- 'gottman_ratio', 'attachment_security', etc.
    baseline_score FLOAT,
    current_score FLOAT,
    trend_direction TEXT ('improving' | 'stable' | 'declining'),
    measurement_date TIMESTAMP
)

-- Psychology Interventions
psychology_interventions (
    id UUID PRIMARY KEY,
    relationship_id UUID,
    user_id UUID,
    modality_id UUID → therapeutic_modalities(id),
    intervention_type TEXT ('micro_moment' | 'daily_practice' | 'weekly_focus' | 'assessment' | 'education'),
    content JSONB,
    status TEXT ('active' | 'completed' | 'skipped'),
    effectiveness_score FLOAT
)

-- Relationship Health Weights
relationship_health_weights (
    modality_id UUID → therapeutic_modalities(id),
    metric_category TEXT,
    base_weight FLOAT,
    evidence_multiplier FLOAT,
    clinical_importance INTEGER
)
```

### Modality Seed Data Names
```
gottman_method, eft_approach, act_approach, cbt_approach,
positive_psychology, attachment_theory, ifs_approach,
mindfulness_approach, nvc_approach, somatic_approach,
narrative_therapy, influence_psychology
```

---

*This document is the psychology source of truth for Sparq Connection. All content, features, and AI behavior should align with these frameworks, rules, and personalization patterns.*
