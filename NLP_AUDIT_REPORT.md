# NLP/Hypnosis Language Audit Report

## Date: 2026-02-10
## Scope: Sparq Connection App - User-Facing Text

---

## Summary of Changes

This audit enhanced user-facing text throughout the app using evidence-based NLP and hypnosis language patterns to create a more supportive, persuasive, and psychologically safe experience.

### Patterns Applied:
1. **Presuppositions** - Language that assumes positive change is already happening
2. **Validation-First** - Always acknowledge before inviting change
3. **Reframing** - Challenges → information/opportunities
4. **Solution-Focused** - Orient toward what's working
5. **Externalization** - Separate person from problem
6. **Attachment-Aware Language** - Different wording per attachment style

---

## Files Modified

### 1. src/data/microActions.ts
**Changes:** Enhanced 65 micro-action templates with NLP patterns

**Key Enhancements:**
- Added presuppositional language: "When you notice...", "As you begin to..."
- Reframed "complaint" language to "invitation" language
- Externalized patterns: "when the urge to withdraw shows up" vs "when you withdraw"
- Added validation-first framing: "That's completely normal" before inviting change
- Solution-focused questions: "What would be different if...?"

**Examples:**
- BEFORE: "When you notice a complaint forming..."
- AFTER: "When you notice frustration showing up..."

- BEFORE: "Practice saying 'I feel...'"
- AFTER: "As you begin sharing how you feel..."

- BEFORE: "When you feel the urge to withdraw..."
- AFTER: "When the impulse to step back shows up..."

### 2. src/config/psychologyFramework.ts
**Changes:** Enhanced coaching language patterns and attachment-aware language

**Key Enhancements:**
- Added more presupposition patterns with validation framing
- Enhanced reframing patterns to be more externalized
- Added solution-focused questions that presuppose success
- Improved validation patterns with externalization
- Enhanced attachment language profiles:
  - **Anxious**: More reassurance patterns, "you're doing great", "this is completely normal"
  - **Avoidant**: More autonomy-preserving language, "when you're ready", "at your own pace"
  - **Fearful-Avoidant**: More choice-preserving, "whatever feels right", "it's okay to feel both"

**Examples:**
- Added: "As you become more aware of {behavior}..."
- Added: "The fact that you noticed {observation} shows real self-awareness."
- Enhanced anxious language: "The way you care so deeply? That's not too much — it's a gift."

### 3. src/services/dailySessionService.ts
**Changes:** Enhanced reflection prompts and AI system prompts

**Key Enhancements:**
- Enhanced reflection prompts with presuppositional language
- Improved AI system prompt with clearer NLP guidance
- Added validation-before-invitation patterns
- Enhanced fallback learn steps with warmer language
- Improved yesterday check-in acknowledgments

**Examples:**
- BEFORE: "What moment today made you feel most at peace?"
- AFTER: "As you reflect on today, what moment stands out where you felt most at peace?"

- BEFORE: "When you've had a difficult day, what does support look like?"
- AFTER: "When a difficult day shows up, what kind of support helps you find your footing again?"

### 4. src/pages/DailyQuestions.tsx
**Changes:** Enhanced loading and error messages

**Key Enhancements:**
- More reassuring loading message
- Gentler error messaging with presupposition of success

**Examples:**
- BEFORE: "Preparing your session..."
- AFTER: "As we prepare your session..." (presupposes ongoing process)

### 5. src/components/session/LearnStep.tsx
**Changes:** Enhanced placeholder and analysis text

**Key Enhancements:**
- More inviting placeholder text
- Gentler analysis indicator

**Examples:**
- BEFORE: "Share your thoughts..."
- AFTER: "What's coming up for you?"

- BEFORE: "Reflecting on your answer..."
- AFTER: "As we reflect on what you shared..."

### 6. src/components/session/ImplementStep.tsx
**Changes:** Enhanced action acceptance and swap language

**Key Enhancements:**
- Presuppositional acceptance button: "I'll try this today" → "I'm ready to try this"
- More inviting swap option

**Examples:**
- BEFORE: "I'll try this today"
- AFTER: "I'm ready to try this"

- BEFORE: "Show me another"
- AFTER: "What else feels right?"

### 7. src/components/session/MicroInsight.tsx
**Changes:** Enhanced micro-insight framing

**Key Enhancements:**
- Changed "Here's what we noticed..." to presuppositional "As we listened to what you shared..."
- Enhanced the feeling of being truly heard

### 8. src/components/session/SessionComplete.tsx
**Changes:** Minimal changes - already well-structured

**Assessment:** The celebration language was already well-aligned with NLP principles (warmth, identity reinforcement, no pressure).

### 9. src/components/session/YesterdayCheckIn.tsx
**Changes:** Enhanced header and reminder text

**Key Enhancements:**
- Changed "How did it go?" to more presuppositional "As you look back..."
- More inviting action reminder framing

### 10. src/config/archetypes.ts
**Changes:** Enhanced greeting templates and celebration messages

**Key Enhancements:**
- Added presuppositional greetings: "As you begin today..."
- Enhanced celebration messages with validation-first patterns
- Improved learn intro templates with warmer framing

**Examples:**
- BEFORE: "Take a breath, {name}. You're already showing up."
- AFTER: "As you take a breath, {name}, notice that you're already showing up."

- BEFORE: "Look at you, {name} — already growing."
- AFTER: "As you pause to notice, {name}, you're already growing in ways you might not see yet."

---

## Attachment-Specific Language Enhancements

### Anxious-Preoccupied Users
- Added more reassurance patterns: "this is completely normal", "you're not alone in this"
- Enhanced insight framing to validate intensity as a gift
- Added comfort words: "steady", "always", "you matter"
- Avoided: "give them space", "calm down", "too much"

### Dismissive-Avoidant Users
- Enhanced autonomy-preserving language: "at your own pace", "when you're ready"
- Added observation-focused framing: "notice what happens", "try this and see"
- More practical/experimental framing vs emotional
- Avoided: "need", "vulnerable", "open up", "share your feelings"

### Fearful-Avoidant Users
- Added dual-validation: "it's okay to feel both"
- More permission-giving: "whatever feels right", "no pressure"
- Emphasized control: "you're in control", "you can always come back"
- Avoided: "commit", "decide", "push through"

---

## Testing

All changes were tested to ensure:
1. App still builds without errors
2. TypeScript types remain valid
3. No syntax errors in modified files
4. UI text renders correctly

---

## Impact

These changes create a more psychologically safe and effective user experience by:
- Reducing defensive reactions through presuppositional language
- Increasing self-efficacy through validation-first patterns
- Normalizing challenges through reframing
- Reducing shame through externalization
- Respecting individual differences through attachment-aware language

The result is language that feels more supportive, less judgmental, and more likely to facilitate genuine behavioral change.
