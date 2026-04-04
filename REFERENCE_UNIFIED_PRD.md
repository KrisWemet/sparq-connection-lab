# Sparq Connection - Unified Vision + Product Requirements (Master Draft)

> "Stronger individuals create stronger relationships. Stronger relationships create stronger families. Stronger families create stronger communities."

## Document Control
- Version: 2.1 (Core Decisions Integrated)
- Date: February 26, 2026
- Status: Working Draft
- Source Inputs: `SPARQ_VISION.md` + `Sparq Connection PRD v1.0` + founder decision answers (v1)

## 1) Executive Summary
Sparq Connection is an AI-powered relationship growth platform built on an individual-first, relationship-centered model. Sparq starts solo by default, learns each user over time, and adapts daily guidance so users become steadier, kinder, and more effective partners.

Sparq's promise:
- Sparq helps you become a steadier, more connected partner through small daily actions and an AI coach that adapts to you without feeling like therapy.

## 2) Mission, Vision, and Positioning
### Mission
Help people build stronger, more fulfilling relationships through consistent connection, meaningful communication, and AI-guided growth.

### Vision
Become the most trusted daily AI companion for relationship growth across solo and partnered journeys.

### Positioning
- Not: a replacement for therapy
- Yes: a daily relationship fitness system with crisis-aware safety rails
- Product model: both solo and couple use cases, with solo-first onboarding and optional partner linking

## 3) Core Product Philosophy
1. Individual first: We coach the user's behavior and mindset first; we do not attempt to fix their partner.
2. Relationally adaptive: Guidance changes by attachment cues, conflict style, love language, and emotional state.
3. Non-clinical voice: Warm, simple, emotionally safe, approximately 4th-grade reading level.
4. Action over content: Daily micro-actions and reflection loops drive measurable behavior change.
5. Safety by design: Detect crisis risk, de-escalate, and route to professional/hotline support when appropriate.

## 4) User Outcomes and Early Behavior Change
### Top 3 outcomes
- Emotional regulation under stress (less escalation, more self-control)
- Clear, kind communication (better expression and listening)
- Repair ability (faster reconnection after conflict)

### First 30-day behavior targets
- Use a 60-120 second pause before replying when triggered
- Use one clean "I feel / I need" statement instead of blame
- Make one daily bid for connection (gratitude, appreciation, affection)
- Complete one repair attempt within 24 hours after conflict
- Ask one curious question before assuming intent

## 5) Product Experience Architecture
### Phase A: Trojan Horse Onboarding (Days 1-14)
No explicit clinical quizzes. AI silently profiles from natural journaling and interaction behavior.

Daily loop:
1. Morning Story (2-3 min): relatable scenario, no jargon
2. Daily Action (embedded in day, optional nudge 1-2 min)
3. Evening Reflection (3-5 min): review, adjustment, next-step plan

Target daily engagement time:
- 6-10 minutes/day

Outputs inferred by day 14:
- Likely attachment tendency
- Conflict/escalation pattern
- Love language preferences
- Tone sensitivity (reassurance vs accountability)
- Preferred prompt style and initial growth plan

### Phase B: Skill Tree (Day 15+)
Users unlock tracks and progress Basic -> Advanced -> Expert.

Core tracks:
- Communication
- Conflict Repair
- Emotional Intimacy
- Trust & Security
- Shared Vision & Rituals

Monetization moments are framed as growth milestones (next-step toolkits), not hard paywalls.

### Phase C: Couple Sync (Post-Launch: 30-60 days)
Launch is solo-first by design. Partner linking ships after MVP stabilization to protect trust and safety quality.

Initial couple sync scope:
- Partner invite
- Shared daily prompt (opt-in)
- No shared journaling by default
- Deeper shared quests and joint insights in later phases

## 6) Living Profile System
### Mandatory profile fields at launch
- Account login + consent (privacy, safety, data use)
- Timezone + notification preferences
- Relationship mode: solo or partnered (length optional)
- Initial goals selection (pick 1-3)

### Inferred profile fields over time
- Attachment tendency
- Conflict style and escalation pattern
- Love language preferences
- Tone sensitivity (needs reassurance vs accountability)
- Prompt format preference (short/long, question/action)

### Confidence model and user correction
- Internal confidence score per inferred trait
- User-facing confidence language only: Likely / Possible / Not enough info yet
- Per-trait feedback control: Yes / Not really / Unsure
- "Not really" acts as strong correction signal and reduces model reliance on that inference

### Profile visibility and editability
- Users can view a plain-language Profile Snapshot
- Users can edit goals, notifications, sharing settings, and trait-fit corrections
- Users can hide headline labels with a simple toggle: Show my insights On/Off
- If insights are hidden, personalization can still run silently unless the user also disables personalization
- Deep model remains adaptive but respects user corrections, visibility choices, and personalization toggles

## 7) Personalization Rules
Personalization must change behavior at these moments:
- First signs of escalation: shift to de-escalation mode, shorter prompts, no growth-pushing
- Repeated avoidance: gentle accountability, smaller actions, easier wins
- Consistent completion streaks: increase challenge depth and reflection difficulty
- Attachment cues:
  - anxious: reassurance, clarity, predictability
  - avoidant: autonomy, lower intensity, shorter prompts
- Conflict style cues:
  - pursuer: downshift pace and intensity
  - withdrawer: low-pressure re-entry micro-steps
- Love language cues: tailor bids and action suggestions
- Time-of-day engagement patterns: adapt reminder timing and prompt length

## 8) AI Coach Voice and Conversation Policy
### Coach identity
- Peter the Otter is a warm, practical coach focused on growth through action.

### Tone policy
- Default: warm and encouraging
- Reassuring support triggers:
  - distress, shame, hopelessness language
  - recent conflict/flooding
  - inconsistency with emotional spiraling
- Gentle accountability triggers:
  - stable state + repeated avoidable mistake
  - heavy blame with low self-ownership
  - requests aimed at controlling partner outcomes

### Tough-love guardrails
- Never insulting
- Never diagnosing
- Short, direct, action-oriented
- End with one doable next step

### Off-limits language
Avoid terms such as:
- diagnosis, disorder, pathology, treatment plan, clinical, symptoms
- attachment wound, dysregulated, maladaptive, codependent
- narcissist, toxic, gaslighting (unless user introduces it; then carefully reframe)
- "you're doing it wrong", "you should"

Preferred phrasing:
- pattern, tendency, when you're stressed, what helps, a steadier move, a safer way to say it

## 9) Core Features
### 9.1 Daily Connection Engine
- Personalized prompts and actions
- Solo-first response flow with optional sharing
- Prompt categories include gratitude, intimacy, vulnerability, repair, values, logistics

### 9.2 Guided Quests
- 3-14 day guided experiences
- Solo reflection + partner interaction when enabled
- Adaptive pacing and depth

### 9.3 Skill Tree + Growth Dashboard
- Tracks skill acquisition (example: Active Listening L2)
- Tracks trends: completion, repair-time, regulation patterns
- Baseline comparisons are self-only, never social ranking

### 9.4 Conflict First Aid
- Panic button for real-time de-escalation
- 2-10 minute reset protocols
- Includes timeout scripts, repair starters, and next safe step
- Available on free and paid tiers

### 9.5 Translator (Phase 2)
- Rephrasing and message safety guardrails based on inferred partner style
- Includes "don't send this yet" pattern checks under escalation

### 9.6 Trust Center
- Plain-language controls for memory, personalization, sharing, export, and deletion
- Surfaces AI limits and safety policy in understandable language
- Data retention defaults:
  - Journals retained until user deletes
  - AI memory uses a 90-day rolling window by default
  - Users can opt in to indefinite AI memory
  - Safety logs keep minimal metadata for 30 days by default, with longer retention only if legally/security required

## 10) Privacy and Safety Requirements
### Non-negotiable privacy boundaries
- Journal entries are private by default
- No partner access unless user explicitly shares item-level content
- Shared space only includes opted-in shared responses and optional completion signals
- Profile labels are hidden from partner by default
- No cross-partner exposure of private AI conversations

### Crisis and harm detection scope
Must detect and route on:
- self-harm or suicide intent
- domestic violence, threats, coercive control
- child harm
- stalking or illegal surveillance intent
- acute panic/dissociation language

### Immediate crisis response behavior
- Switch to stabilize mode (grounding, slower prompts)
- Provide localized crisis resources and encourage real-human contact now
- Suspend normal relationship coaching in crisis moments
- Prioritize immediate safety planning in violence-risk contexts

### MVP crisis resource model
- Use static/manual country-based resource lists at launch (US, Canada, UK, Australia, New Zealand)
- Include clear "call local emergency services" language by country context
- Defer paid crisis-provider integration until post-launch usage justifies complexity

### Red lines (what Sparq must never do)
- Diagnose or claim clinical certainty
- Enable manipulation of partner behavior
- Act as judge/jury in partner conflict
- Advise staying in unsafe/abusive situations
- Present itself as therapy or therapist replacement

## 11) Business Model and Monetization
### Free tier
- 3 daily loops per week
- 10 coach messages/day hard cap
- 1-2 starter quests
- Conflict First Aid and crisis support always available

### Paid tier
- Full daily engine
- Full quest library
- Unlimited coach
- Skill tree progression and insight dashboard (including repair-time trend)

### Pricing
- Locked launch pricing: $14.99/month per couple
- Annual pricing: $119.99/year per couple
- Optional future package to test later: solo plan around $9.99/month or $79.99/year

## 12) Go-to-Market and Distribution
### Release strategy
- Private beta: validate activation, 14-day completion, and retention mechanics
- Public launch: activation -> 14-day completion -> conversion funnel
- Growth: lifecycle automation, referrals, creator/therapist channels

### Launch geography
- Launch markets: United States, Canada, United Kingdom, Australia, and New Zealand
- English-only at launch, with neutral copy (no US-only phrasing)
- Crisis resources and emergency language localized by country

### Packaging strategy
- Position as daily growth tool and relationship fitness companion
- Avoid therapy-replacement messaging in all channels

## 13) Success Metrics and KPIs
### North Star
- Active Couple Engagement (ACE): couples where both partners engage >=4x/week

### Top 5 Year-1 KPIs (by December 31, 2026)
- 2,500 active paying users
- Activation rate (primary): completed Day 3 + set >=1 goal
- 14-day completion rate (Trojan Horse onboarding)
- Day-30 retention >= 50% for activated cohorts
- ACE trend plus solo WAU/DAU tracking

### Activation diagnostics
- Secondary activation signal: completed Day 3 + completed at least 1 reflection

### Additional product quality metrics
- App rating >= 4.5
- Crisis response time and quality compliance
- Self-reported relationship improvement trend

## 14) Roadmap and Scope Boundaries
### MVP (launch-blocking)
- Auth, consent, Trust Center v1
- 14-day onboarding content engine
- Daily loop mechanics + notifications
- Peter text coach
- Basic skill tree tracking
- Conflict First Aid v1 + safety routing
- Payments + analytics instrumentation
- Solo-first launch (no partner linking at day-1 release)

### Phase 2
- Translator
- Partner invite and minimal couple sync (target: within 30-60 days post-launch)
- Deeper couple sync (shared quests, joint insights)
- Rituals/calendar integration
- Expanded resource library + recommendations
- Weekly summaries + advanced dashboards
- Therapist ecosystem features

### Phase 3+
- Voice mode
- Multilingual expansion (Spanish first)
- Advanced personalization, longitudinal outcomes reports

## 15) Strategic Advancements to Adopt Now
1. Relationship OS Score composed of communication quality, repair speed, emotional safety, and ritual consistency.
2. Repair-Time Metric as a primary behavioral outcome.
3. Outcome validation track with light pre/post measures for credibility.
4. External safety review cadence for prompts, escalation logic, and harmful-response audits.

## 16) Remaining Open Decisions
- Channel-level CAC targets by launch cohort
- Post-launch trigger thresholds for paid crisis-resource integration
- Timing and experiment design for optional solo pricing plan

---

This master draft now captures Sparq's core basis, tone, safety boundaries, living-profile mechanics, and MVP scope in one operating document.
