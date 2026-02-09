import type { MicroActionCategory, PersonalizedMicroAction } from "@/types/session";
import type { PersonalityDimension } from "@/types/personality";
import type { IdentityArchetype } from "@/types/session";

export interface MicroActionTemplate {
  id: string;
  text: string;
  category: MicroActionCategory;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  /** Version for solo users ("Notice how you...") */
  soloVersion: string;
  /** Version for partner users ("Tell {partner} that...") */
  partnerVersion: string;
  /** Optional archetype-specific wording overrides */
  archetypeVariants?: Partial<Record<IdentityArchetype, string>>;
  /** Whether AI should further personalize this */
  personalizable: boolean;
  /** What user details AI can fill in */
  personalizationSlots?: string[];
  /** Which personality dimensions this action relates to */
  targetDimensions: PersonalityDimension[];
  /** Day range when this is appropriate [min, max]. null = any day */
  dayRange: [number, number] | null;
}

// ============================================================================
// COMMUNICATION (15 templates)
// ============================================================================

const communicationTemplates: MicroActionTemplate[] = [
  {
    id: "comm-1",
    text: "Name one specific thing you appreciate about your partner and tell them why",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Write down one specific thing you appreciate about your partner and why it matters to you",
    partnerVersion: "Tell {partner} one specific thing you appreciate about them and why it matters to you",
    archetypeVariants: {
      "words-of-affirmation": "Tell {partner} one specific quality you admire in them and describe how it makes your life better",
      "steady-supporter": "Share with {partner} one thing they do that makes you feel safe and appreciated"
    },
    personalizable: true,
    personalizationSlots: ["partner_name", "recent_positive_moment"],
    targetDimensions: ["loveLanguage", "emotionalExpression"],
    dayRange: [1, 7]
  },
  {
    id: "comm-2",
    text: "When you notice a complaint forming in your mind, pause and reframe it as a specific request",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Notice when a complaint forms and write down how you'd reframe it as a specific, actionable request",
    partnerVersion: "When you notice a complaint about {partner} forming, pause and say it as a specific request instead",
    archetypeVariants: {
      "growth-seeker": "When frustration arises, transform it into a clear invitation for what you need to grow together",
      "calm-anchor": "When you feel critical, pause and ask yourself what you really need — then request it directly"
    },
    personalizable: true,
    personalizationSlots: ["common_complaint_area"],
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: null
  },
  {
    id: "comm-3",
    text: "Ask one genuinely curious question about something your partner cares about — and just listen",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 5,
    soloVersion: "Think of one thing your partner cares about that you could ask a curious question about",
    partnerVersion: "Ask {partner} one genuinely curious question about something they care about — and give them your full attention",
    archetypeVariants: {
      "curious-explorer": "Ask {partner} about something they're passionate about that you haven't explored together yet",
      "steady-supporter": "Ask {partner} about something meaningful to them and listen without trying to fix or solve"
    },
    personalizable: true,
    personalizationSlots: ["partner_interest", "partner_passion"],
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [1, 10]
  },
  {
    id: "comm-4",
    text: "Share one thing about your day that made you feel something — not just what happened, but how it felt",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Write down one thing from today that stirred an emotion in you — name both the event and the feeling",
    partnerVersion: "Tell {partner} about one moment today that made you feel something — describe both what happened and what you felt",
    archetypeVariants: {
      "vulnerable-heart": "Share with {partner} a moment today when you felt something deeply — let them see the real emotion",
      "calm-anchor": "Tell {partner} about a moment today that moved you, even if the feeling was subtle"
    },
    personalizable: true,
    personalizationSlots: ["recent_emotional_moment"],
    targetDimensions: ["emotionalExpression", "intimacy"],
    dayRange: [3, null]
  },
  {
    id: "comm-5",
    text: "Before responding to something your partner says, repeat back what you heard in your own words",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Practice reflecting back what someone says before responding — notice how it changes the conversation",
    partnerVersion: "When {partner} shares something important, repeat back what you heard before you respond",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [5, null]
  },
  {
    id: "comm-6",
    text: "Express one specific need you have clearly and without apology",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Identify one need you have right now and practice saying it out loud: 'I need...'",
    partnerVersion: "Tell {partner} one thing you need right now using the phrase 'I need...' — no explanations, no apologies",
    archetypeVariants: {
      "growth-seeker": "Name one thing you need from {partner} to feel more connected or understood",
      "steady-supporter": "Practice asking for something you need without minimizing it or putting their needs first"
    },
    personalizable: true,
    personalizationSlots: ["current_need"],
    targetDimensions: ["attachment", "emotionalExpression", "conflict"],
    dayRange: [6, null]
  },
  {
    id: "comm-7",
    text: "Use 'I feel [emotion] when [specific situation]' to share something that's been on your mind",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Write down one thing on your mind using this structure: 'I feel [emotion] when [specific situation]'",
    partnerVersion: "Share something that's been on your mind with {partner} using 'I feel [emotion] when [specific situation]'",
    personalizable: true,
    personalizationSlots: ["recent_emotion", "trigger_situation"],
    targetDimensions: ["emotionalExpression", "conflict"],
    dayRange: [4, null]
  },
  {
    id: "comm-8",
    text: "Offer five minutes of completely undivided attention — phone away, eye contact, presence",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 5,
    soloVersion: "Practice being fully present with someone for 5 minutes — no phone, no distractions, just listening",
    partnerVersion: "Give {partner} 5 minutes of your complete attention — put your phone in another room and just be present",
    archetypeVariants: {
      "words-of-affirmation": "Give {partner} 5 minutes where you're fully there — let them feel they're the only thing that matters",
      "calm-anchor": "Create a pocket of stillness and offer {partner} 5 minutes of your grounded, unhurried presence"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "intimacy", "attachment"],
    dayRange: [1, null]
  },
  {
    id: "comm-9",
    text: "Share one memory from your past that shaped who you are today",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 4,
    soloVersion: "Reflect on one formative memory from your past — what about it shaped who you are now?",
    partnerVersion: "Tell {partner} about one memory from your past that shaped who you are — help them understand your story",
    personalizable: true,
    personalizationSlots: ["formative_memory", "childhood_experience"],
    targetDimensions: ["intimacy", "relationalIdentity", "emotionalExpression"],
    dayRange: [7, null]
  },
  {
    id: "comm-10",
    text: "Ask your partner 'What do you need from me right now?' — and mean it",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Think about what you need from your partner right now — practice asking for it clearly",
    partnerVersion: "Ask {partner} 'What do you need from me right now?' — and really listen to their answer",
    archetypeVariants: {
      "steady-supporter": "Check in with {partner}: 'What do you need from me right now?' — resist the urge to anticipate",
      "growth-seeker": "Ask {partner} what they need from you in this moment — be open to the answer even if it surprises you"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "attachment", "conflict"],
    dayRange: [3, null]
  },
  {
    id: "comm-11",
    text: "Respond to your partner with validation before jumping to problem-solving",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice when you want to fix or solve — practice validating the feeling first instead",
    partnerVersion: "When {partner} shares a problem, validate how they feel before offering any solutions",
    personalizable: false,
    targetDimensions: ["emotionalExpression", "conflict", "loveLanguage"],
    dayRange: [5, null]
  },
  {
    id: "comm-12",
    text: "Replace 'but' with 'and' in one conversation today to honor both perspectives",
    category: "communication",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Notice when you use 'but' to dismiss — practice using 'and' to hold two truths at once",
    partnerVersion: "When talking with {partner}, catch yourself saying 'but' and replace it with 'and' — honor both truths",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [6, null]
  },
  {
    id: "comm-13",
    text: "Express gratitude for something your partner does that you usually take for granted",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Notice one thing your partner does regularly that you take for granted — write down why it matters",
    partnerVersion: "Thank {partner} for something they do regularly that you don't usually acknowledge",
    archetypeVariants: {
      "words-of-affirmation": "Name something {partner} does consistently and tell them how it makes your life better",
      "steady-supporter": "Appreciate {partner} out loud for one of the quiet, steady ways they show up for you"
    },
    personalizable: true,
    personalizationSlots: ["partner_routine_action"],
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [1, null]
  },
  {
    id: "comm-14",
    text: "Share one fear or hope you have for your relationship",
    category: "communication",
    difficulty: 3,
    estimatedMinutes: 4,
    soloVersion: "Write down one fear or hope you have for your relationship — what makes it feel vulnerable to name?",
    partnerVersion: "Share with {partner} one genuine fear or hope you have for your relationship together",
    archetypeVariants: {
      "vulnerable-heart": "Tell {partner} one thing you hope for in your relationship — let yourself want it out loud",
      "growth-seeker": "Share with {partner} one way you hope you'll both grow together — be brave about the vision"
    },
    personalizable: true,
    personalizationSlots: ["relationship_hope", "relationship_fear"],
    targetDimensions: ["intimacy", "emotionalExpression", "attachment", "values"],
    dayRange: [10, null]
  },
  {
    id: "comm-15",
    text: "Give a genuine compliment about their character, not their appearance",
    category: "communication",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Think of one character trait you admire in your partner — what does it reveal about who they are?",
    partnerVersion: "Compliment {partner} on a quality of their character — their kindness, courage, humor, integrity",
    personalizable: true,
    personalizationSlots: ["partner_character_trait"],
    targetDimensions: ["loveLanguage", "values", "relationalIdentity"],
    dayRange: [1, null]
  }
];

// ============================================================================
// CONFLICT (10 templates)
// ============================================================================

const conflictTemplates: MicroActionTemplate[] = [
  {
    id: "conf-1",
    text: "Take three slow breaths before responding when you feel tension rising",
    category: "conflict",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Notice when tension rises in your body — practice taking three slow breaths before reacting",
    partnerVersion: "When you feel tension with {partner}, pause for three slow breaths before you respond",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [1, null]
  },
  {
    id: "conf-2",
    text: "Practice saying 'I feel [emotion] when [situation]' instead of 'You always...'",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice when you think 'You always...' and rewrite it as 'I feel [emotion] when [situation]'",
    partnerVersion: "Catch yourself before saying 'You always...' to {partner} and use 'I feel [emotion] when [situation]' instead",
    archetypeVariants: {
      "growth-seeker": "Transform 'You always...' into 'I feel [emotion] when [situation]' — own your experience",
      "calm-anchor": "Replace blame with clarity — say 'I feel [emotion] when [situation]' instead of 'You always...'"
    },
    personalizable: true,
    personalizationSlots: ["common_conflict_pattern"],
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [4, null]
  },
  {
    id: "conf-3",
    text: "When you disagree, find one thing you can genuinely agree with first",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "In any disagreement today, look for the grain of truth in the other person's perspective",
    partnerVersion: "Before disagreeing with {partner}, find one thing in what they said that you can genuinely agree with",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [5, null]
  },
  {
    id: "conf-4",
    text: "Notice your body's first signal of frustration — tight jaw, clenched hands, shallow breathing",
    category: "conflict",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Pay attention to how frustration shows up in your body first — what's your earliest warning sign?",
    partnerVersion: "Notice the first physical sign of frustration during a tense moment with {partner} — name it to yourself",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [1, null]
  },
  {
    id: "conf-5",
    text: "After a tense moment, be the first to reach out with a repair attempt",
    category: "conflict",
    difficulty: 3,
    estimatedMinutes: 2,
    soloVersion: "Think about the last tense moment — what would a repair attempt have looked like?",
    partnerVersion: "After tension with {partner}, be the first to reach out — even a simple 'I don't want us to feel distant' counts",
    archetypeVariants: {
      "vulnerable-heart": "After conflict with {partner}, take the risk to reach out first — even something small like 'I miss feeling close'",
      "calm-anchor": "When things feel tense with {partner}, ground the space by reaching out first with care"
    },
    personalizable: false,
    targetDimensions: ["conflict", "attachment", "emotionalExpression"],
    dayRange: [8, null]
  },
  {
    id: "conf-6",
    text: "Accept influence from your partner — let them change your mind about something small",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Notice where you resist influence — what would it feel like to yield on something small?",
    partnerVersion: "Let {partner} influence you on something today — change your mind, try their way, yield gracefully",
    archetypeVariants: {
      "growth-seeker": "Choose curiosity over being right — let {partner} shift your perspective on something",
      "steady-supporter": "Notice where you hold firm out of habit — practice softening and accepting influence"
    },
    personalizable: false,
    targetDimensions: ["conflict", "values", "relationalIdentity"],
    dayRange: [7, null]
  },
  {
    id: "conf-7",
    text: "Ask 'Can you help me understand your side?' when you feel defensive",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "When you feel defensive, pause and ask yourself 'What am I not seeing from their side?'",
    partnerVersion: "When you feel defensive with {partner}, pause and ask 'Can you help me understand your side?'",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [6, null]
  },
  {
    id: "conf-8",
    text: "Take a 20-minute break if you feel flooded or overwhelmed in conflict",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 20,
    soloVersion: "Notice when you feel flooded in conflict — what would help you pause and regulate?",
    partnerVersion: "If conflict with {partner} feels overwhelming, ask for a 20-minute break — and come back",
    archetypeVariants: {
      "calm-anchor": "When overwhelmed, honor your need to pause — tell {partner} 'I need 20 minutes to regulate, then I'll come back'",
      "vulnerable-heart": "If you feel flooded, practice saying 'I need a break' without shutting down completely"
    },
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression", "attachment"],
    dayRange: [8, null]
  },
  {
    id: "conf-9",
    text: "Separate the problem from the person — name the issue as something you're facing together",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Think about a current issue — can you frame it as a challenge to solve together, not a character flaw?",
    partnerVersion: "Reframe a conflict with {partner} as 'us against the problem' instead of 'me against you'",
    personalizable: true,
    personalizationSlots: ["current_conflict_area"],
    targetDimensions: ["conflict", "relationalIdentity"],
    dayRange: [9, null]
  },
  {
    id: "conf-10",
    text: "Replace 'You should...' with 'What if we...' when you have an idea",
    category: "conflict",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Notice when you think 'You should...' and practice reframing as 'What if we...'",
    partnerVersion: "Catch yourself before saying 'You should...' to {partner} and try 'What if we...' instead",
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [5, null]
  }
];

// ============================================================================
// CONNECTION (15 templates)
// ============================================================================

const connectionTemplates: MicroActionTemplate[] = [
  {
    id: "conn-1",
    text: "Put your phone away during dinner and ask one question you're genuinely curious about",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 3,
    soloVersion: "During your next meal, put your phone in another room and notice what you become aware of",
    partnerVersion: "Put your phone away during dinner with {partner} and ask one question you're genuinely curious about",
    personalizable: false,
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [1, null]
  },
  {
    id: "conn-2",
    text: "Send an unexpected message in the middle of the day — just 'thinking of you'",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Think about what small gesture would make your partner smile in the middle of their day",
    partnerVersion: "Send {partner} an unexpected message today — simple as 'thinking of you' or 'can't wait to see you'",
    archetypeVariants: {
      "words-of-affirmation": "Send {partner} a text naming one specific thing you love about them — right in the middle of their day",
      "curious-explorer": "Send {partner} something that reminded you of them today — a photo, a memory, a moment"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "attachment"],
    dayRange: [1, null]
  },
  {
    id: "conn-3",
    text: "Share something that made you laugh today",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Notice what makes you laugh today — what about it was funny to you?",
    partnerVersion: "Tell {partner} about something that made you laugh today — share the joy",
    personalizable: false,
    targetDimensions: ["emotionalExpression", "intimacy"],
    dayRange: [1, null]
  },
  {
    id: "conn-4",
    text: "Create a two-minute ritual for when you first see each other after being apart",
    category: "connection",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Think about how you greet your partner when you reunite — what would make it more intentional?",
    partnerVersion: "When you first see {partner} today, create a small ritual — eye contact, hug for 6 seconds, asking about their day",
    archetypeVariants: {
      "steady-supporter": "Greet {partner} with full presence when you reunite — even 30 seconds of undivided attention",
      "vulnerable-heart": "When you see {partner}, practice really seeing them — make eye contact, touch, connect before moving on"
    },
    personalizable: false,
    targetDimensions: ["attachment", "loveLanguage", "intimacy"],
    dayRange: [3, null]
  },
  {
    id: "conn-5",
    text: "Tell your partner about a moment today when you thought of them",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Notice when you think of your partner during the day — what triggered the thought?",
    partnerVersion: "Tell {partner} about a moment today when something reminded you of them",
    personalizable: true,
    personalizationSlots: ["reminder_moment"],
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [1, null]
  },
  {
    id: "conn-6",
    text: "Hold eye contact for 30 seconds without talking — just be present",
    category: "connection",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Practice holding eye contact with someone for longer than feels comfortable — notice what arises",
    partnerVersion: "Look into {partner}'s eyes for 30 seconds without talking — just breathe and be present",
    archetypeVariants: {
      "vulnerable-heart": "Let {partner} see you — hold eye contact for 30 seconds and let yourself be witnessed",
      "calm-anchor": "Create a moment of stillness with {partner} — 30 seconds of eye contact, no words needed"
    },
    personalizable: false,
    targetDimensions: ["intimacy", "emotionalExpression", "attachment"],
    dayRange: [5, null]
  },
  {
    id: "conn-7",
    text: "Do one small act of service for your partner without being asked",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 3,
    soloVersion: "Notice one thing your partner usually does and do it for them today",
    partnerVersion: "Do one small thing for {partner} without being asked — make their coffee, handle a chore, lighten their load",
    archetypeVariants: {
      "steady-supporter": "Notice what {partner} needs before they ask — take one thing off their plate today",
      "words-of-affirmation": "Do something for {partner} and tell them why — 'I did this because I know you've been tired'"
    },
    personalizable: true,
    personalizationSlots: ["partner_chore", "partner_preference"],
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [1, null]
  },
  {
    id: "conn-8",
    text: "Plan a simple surprise — doesn't have to be big, just thoughtful",
    category: "connection",
    difficulty: 2,
    estimatedMinutes: 5,
    soloVersion: "Think about what small surprise would delight your partner — what shows you know them?",
    partnerVersion: "Plan one small surprise for {partner} — their favorite snack, a note, a plan for the weekend",
    personalizable: true,
    personalizationSlots: ["partner_favorite_thing", "partner_interest"],
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [4, null]
  },
  {
    id: "conn-9",
    text: "Share a dream or goal you have — something you haven't said out loud yet",
    category: "connection",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "What's one dream or goal you haven't shared yet? Write down why it feels vulnerable",
    partnerVersion: "Tell {partner} about a dream or goal you have — something you haven't put into words before",
    archetypeVariants: {
      "growth-seeker": "Share with {partner} one way you want to grow or evolve — invite them into your vision",
      "vulnerable-heart": "Tell {partner} about something you hope for — let yourself want it out loud"
    },
    personalizable: true,
    personalizationSlots: ["personal_dream"],
    targetDimensions: ["intimacy", "emotionalExpression", "values"],
    dayRange: [7, null]
  },
  {
    id: "conn-10",
    text: "Reminisce about a favorite shared memory — relive it together",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 4,
    soloVersion: "Think about a favorite memory with your partner — what made it special?",
    partnerVersion: "Ask {partner} to reminisce about one of your favorite memories together — add details, laugh, relive it",
    personalizable: true,
    personalizationSlots: ["shared_memory"],
    targetDimensions: ["intimacy", "relationalIdentity"],
    dayRange: [1, null]
  },
  {
    id: "conn-11",
    text: "Create a new inside joke or playful moment together",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Notice playful moments — what makes you and your partner laugh together?",
    partnerVersion: "Be playful with {partner} today — create a new inside joke, be silly, laugh together",
    personalizable: false,
    targetDimensions: ["intimacy", "relationalIdentity"],
    dayRange: [1, null]
  },
  {
    id: "conn-12",
    text: "Initiate physical affection that's not part of your routine",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Think about how you show affection — what's one way you could vary it?",
    partnerVersion: "Touch {partner} in a way that's not routine — hold their hand during a walk, kiss their forehead, rest your head on their shoulder",
    archetypeVariants: {
      "vulnerable-heart": "Reach for {partner} in a way that feels a little new — let your body express connection",
      "steady-supporter": "Show {partner} affection through touch — even a small gesture that says 'I'm here with you'"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [2, null]
  },
  {
    id: "conn-13",
    text: "Learn one new thing about your partner by asking a question you've never asked",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 3,
    soloVersion: "Think of one thing you've never asked your partner — what are you curious about?",
    partnerVersion: "Ask {partner} one question you've never asked — go beyond surface, discover something new",
    archetypeVariants: {
      "curious-explorer": "Ask {partner} a question you've been wondering about but never voiced — explore the unknown",
      "growth-seeker": "Discover something new about {partner} by asking a question that goes deeper than usual"
    },
    personalizable: false,
    targetDimensions: ["intimacy", "loveLanguage"],
    dayRange: [3, null]
  },
  {
    id: "conn-14",
    text: "Sit in comfortable silence together for five minutes — no phones, no agenda",
    category: "connection",
    difficulty: 2,
    estimatedMinutes: 5,
    soloVersion: "Practice being comfortable in silence — notice when you feel the need to fill it",
    partnerVersion: "Sit with {partner} in silence for 5 minutes — on the couch, outside, anywhere — just be together",
    archetypeVariants: {
      "calm-anchor": "Create a pocket of quiet with {partner} — 5 minutes of shared silence, no pressure to perform",
      "vulnerable-heart": "Practice just being with {partner} — 5 minutes of silence where you don't have to do anything but exist together"
    },
    personalizable: false,
    targetDimensions: ["intimacy", "attachment"],
    dayRange: [6, null]
  },
  {
    id: "conn-15",
    text: "End the day by saying one thing you're grateful for about them",
    category: "connection",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Before bed, think of one thing you're grateful for about your partner today",
    partnerVersion: "Before sleep, tell {partner} one thing you're grateful for about them from today",
    archetypeVariants: {
      "words-of-affirmation": "End the day by telling {partner} one specific thing they did today that you're grateful for",
      "steady-supporter": "Share with {partner} one quiet way they made your day better — let them know they're seen"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [1, null]
  }
];

// ============================================================================
// AWARENESS (12 templates)
// ============================================================================

const awarenessTemplates: MicroActionTemplate[] = [
  {
    id: "aware-1",
    text: "Notice your first emotional reaction when your partner walks in the room today",
    category: "awareness",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Pay attention to your first feeling when you see your partner — before thought, just sensation",
    partnerVersion: "When {partner} enters the room, notice your immediate emotional reaction — what do you feel first?",
    personalizable: false,
    targetDimensions: ["attachment", "emotionalExpression"],
    dayRange: [1, null]
  },
  {
    id: "aware-2",
    text: "Catch one moment where you defaulted to an old pattern — just notice it, no judgment",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice when you fall into a habitual pattern — withdrawal, people-pleasing, criticism — just observe",
    partnerVersion: "Catch yourself defaulting to an old pattern with {partner} — name it to yourself without judgment",
    archetypeVariants: {
      "growth-seeker": "Notice one moment where you fell back on autopilot — observe it with curiosity, not criticism",
      "calm-anchor": "Catch yourself repeating a familiar pattern — just witness it gently, no need to fix it immediately"
    },
    personalizable: false,
    targetDimensions: ["attachment", "conflict", "relationalIdentity"],
    dayRange: [4, null]
  },
  {
    id: "aware-3",
    text: "Pay attention to what you're feeling right before you check your phone around your partner",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Before reaching for your phone, pause — what are you feeling? Boredom, anxiety, avoidance?",
    partnerVersion: "When you reach for your phone around {partner}, pause and notice what you're feeling first",
    personalizable: false,
    targetDimensions: ["attachment", "intimacy", "emotionalExpression"],
    dayRange: [3, null]
  },
  {
    id: "aware-4",
    text: "Notice one thing your partner does today that you usually overlook",
    category: "awareness",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Pay attention to the small things your partner does that you don't usually register",
    partnerVersion: "Notice one thing {partner} does today that you normally wouldn't pay attention to — make it visible",
    personalizable: false,
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [1, null]
  },
  {
    id: "aware-5",
    text: "Track your emotional temperature three times today — morning, afternoon, evening",
    category: "awareness",
    difficulty: 1,
    estimatedMinutes: 3,
    soloVersion: "Check in with yourself three times: How am I feeling right now? No fixing, just naming",
    partnerVersion: "Check your emotional state three times today — notice what shifts and what stays constant",
    personalizable: false,
    targetDimensions: ["emotionalExpression"],
    dayRange: [1, null]
  },
  {
    id: "aware-6",
    text: "Notice when you make assumptions versus when you ask for clarity",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Catch yourself making an assumption about someone's thoughts or feelings — what story are you telling?",
    partnerVersion: "Notice when you assume you know what {partner} is thinking versus when you actually ask",
    archetypeVariants: {
      "growth-seeker": "Observe when you fill in blanks about {partner}'s intentions — what if you asked instead?",
      "calm-anchor": "Notice when you assume versus verify — what would it be like to stay curious instead of certain?"
    },
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression", "attachment"],
    dayRange: [5, null]
  },
  {
    id: "aware-7",
    text: "Observe your inner critic versus your inner ally — which voice is louder today?",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice the tone of your self-talk today — is it harsh or kind? Critical or supportive?",
    partnerVersion: "Pay attention to your inner dialogue — when it's critical, what would an inner ally say instead?",
    personalizable: false,
    targetDimensions: ["emotionalExpression", "values"],
    dayRange: [4, null]
  },
  {
    id: "aware-8",
    text: "Spot a moment where you chose comfort over connection",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Notice when you prioritize comfort (distraction, avoidance, routine) over connection — no judgment",
    partnerVersion: "Catch yourself choosing comfort over connection with {partner} — staying surface, avoiding depth, going solo",
    archetypeVariants: {
      "vulnerable-heart": "Notice when you choose safety over intimacy — what are you protecting yourself from?",
      "calm-anchor": "Observe when you choose ease over engagement — what does it cost in connection?"
    },
    personalizable: false,
    targetDimensions: ["attachment", "intimacy"],
    dayRange: [6, null]
  },
  {
    id: "aware-9",
    text: "Notice what you do when you feel vulnerable — do you open or close?",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "When vulnerability arises, notice your first instinct — share, hide, deflect, minimize?",
    partnerVersion: "Pay attention to what you do when you feel vulnerable with {partner} — do you move toward or away?",
    personalizable: false,
    targetDimensions: ["attachment", "emotionalExpression", "intimacy"],
    dayRange: [7, null]
  },
  {
    id: "aware-10",
    text: "Pay attention to how you respond to your partner's bids for attention",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice when someone reaches out for connection — do you turn toward, away, or against?",
    partnerVersion: "When {partner} bids for your attention, notice if you turn toward them, away, or against",
    archetypeVariants: {
      "growth-seeker": "Track how you respond to {partner}'s bids for connection — are you turning toward or dismissing?",
      "steady-supporter": "Notice if you're fully turning toward {partner}'s bids or just half-present"
    },
    personalizable: false,
    targetDimensions: ["attachment", "loveLanguage", "conflict"],
    dayRange: [6, null]
  },
  {
    id: "aware-11",
    text: "Observe the stories you tell yourself about your partner's intentions",
    category: "awareness",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "When your partner does something, notice the story you create about why — is it generous or suspicious?",
    partnerVersion: "Notice the narrative you create about {partner}'s behavior — are you assuming the best or the worst?",
    personalizable: false,
    targetDimensions: ["attachment", "conflict", "emotionalExpression"],
    dayRange: [8, null]
  },
  {
    id: "aware-12",
    text: "Notice when you feel most connected to your partner — what's happening in those moments?",
    category: "awareness",
    difficulty: 1,
    estimatedMinutes: 2,
    soloVersion: "Pay attention to moments when you feel close to your partner — what creates that feeling?",
    partnerVersion: "Notice when you feel most connected to {partner} — what are you doing, saying, or experiencing?",
    personalizable: false,
    targetDimensions: ["intimacy", "loveLanguage", "attachment"],
    dayRange: [1, null]
  }
];

// ============================================================================
// BEHAVIOR (13 templates)
// ============================================================================

const behaviorTemplates: MicroActionTemplate[] = [
  {
    id: "behav-1",
    text: "Replace one criticism with a specific, genuine appreciation today",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice when you feel critical — what would the opposite (appreciation) sound like?",
    partnerVersion: "Catch yourself before criticizing {partner} and replace it with a specific appreciation instead",
    archetypeVariants: {
      "growth-seeker": "Transform criticism into appreciation — name what {partner} is doing right instead of wrong",
      "calm-anchor": "When judgment arises, pause and find something to genuinely appreciate instead"
    },
    personalizable: false,
    targetDimensions: ["conflict", "loveLanguage"],
    dayRange: [5, null]
  },
  {
    id: "behav-2",
    text: "Practice active listening for a full five minutes — no advice, no fixing, just presence",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 5,
    soloVersion: "Practice listening without jumping to solutions — just be present with someone's experience",
    partnerVersion: "When {partner} talks, listen for 5 full minutes without offering advice — just reflect and be present",
    personalizable: false,
    targetDimensions: ["loveLanguage", "emotionalExpression", "conflict"],
    dayRange: [3, null]
  },
  {
    id: "behav-3",
    text: "Do one small thing for your partner that they normally do for themselves",
    category: "behavior",
    difficulty: 1,
    estimatedMinutes: 3,
    soloVersion: "Notice one thing your partner handles on their own — what if you did it for them today?",
    partnerVersion: "Do something for {partner} that they usually take care of — make their lunch, fill their water, fold their laundry",
    personalizable: true,
    personalizationSlots: ["partner_routine_task"],
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [1, null]
  },
  {
    id: "behav-4",
    text: "When you feel the urge to withdraw, stay present for 30 more seconds",
    category: "behavior",
    difficulty: 3,
    estimatedMinutes: 1,
    soloVersion: "Notice the impulse to shut down or leave — practice staying 30 seconds longer than feels comfortable",
    partnerVersion: "When you want to withdraw from {partner}, stay present for 30 more seconds — breathe and remain",
    archetypeVariants: {
      "vulnerable-heart": "When you want to retreat from {partner}, practice staying — even 30 seconds of presence counts",
      "calm-anchor": "Notice the urge to distance yourself — what if you stayed just a bit longer instead?"
    },
    personalizable: false,
    targetDimensions: ["attachment", "conflict", "intimacy"],
    dayRange: [8, null]
  },
  {
    id: "behav-5",
    text: "Choose vulnerability over deflection once today — share how you really feel",
    category: "behavior",
    difficulty: 3,
    estimatedMinutes: 2,
    soloVersion: "Notice when you deflect or minimize — what would it be like to share the real feeling instead?",
    partnerVersion: "When {partner} asks how you are, choose honesty over 'fine' — share what you're actually feeling",
    archetypeVariants: {
      "vulnerable-heart": "Let {partner} see how you really feel — resist the urge to hide or minimize",
      "growth-seeker": "Choose courage over comfort — tell {partner} one true thing you've been holding back"
    },
    personalizable: false,
    targetDimensions: ["emotionalExpression", "intimacy", "attachment"],
    dayRange: [9, null]
  },
  {
    id: "behav-6",
    text: "Turn toward a bid for connection instead of away",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "When someone reaches out, practice fully turning toward them instead of half-listening",
    partnerVersion: "When {partner} makes a bid for your attention, turn fully toward them — stop what you're doing and engage",
    personalizable: false,
    targetDimensions: ["attachment", "loveLanguage"],
    dayRange: [4, null]
  },
  {
    id: "behav-7",
    text: "Initiate physical affection first — don't wait for your partner",
    category: "behavior",
    difficulty: 1,
    estimatedMinutes: 1,
    soloVersion: "Notice who usually initiates touch — what if you went first today?",
    partnerVersion: "Be the first to reach for {partner} today — hold their hand, hug them, kiss them hello",
    archetypeVariants: {
      "vulnerable-heart": "Reach for {partner} first — let your body express what words sometimes can't",
      "steady-supporter": "Initiate affection with {partner} — show them through touch that they matter"
    },
    personalizable: false,
    targetDimensions: ["loveLanguage", "intimacy"],
    dayRange: [2, null]
  },
  {
    id: "behav-8",
    text: "Ask for help with something small instead of doing it all yourself",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice where you carry things alone — practice asking for help with one small thing",
    partnerVersion: "Ask {partner} for help with something small — let them support you instead of handling it alone",
    archetypeVariants: {
      "steady-supporter": "Practice letting {partner} carry something — ask for help instead of being the one who always supports",
      "vulnerable-heart": "Risk asking {partner} for help — let yourself be the one who needs something"
    },
    personalizable: false,
    targetDimensions: ["attachment", "relationalIdentity"],
    dayRange: [6, null]
  },
  {
    id: "behav-9",
    text: "Admit when you're wrong about something small — practice repair early",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Notice when you're wrong about something minor — practice saying 'You're right, I was wrong'",
    partnerVersion: "When you realize you're wrong about something with {partner}, say it out loud — 'You were right, I was wrong'",
    personalizable: false,
    targetDimensions: ["conflict", "relationalIdentity", "values"],
    dayRange: [5, null]
  },
  {
    id: "behav-10",
    text: "Choose patience in a moment when you'd normally rush or push",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 2,
    soloVersion: "Notice the impulse to hurry someone — practice slowing down and creating space instead",
    partnerVersion: "When you feel impatient with {partner}, pause and choose to slow down instead of pushing",
    archetypeVariants: {
      "calm-anchor": "When urgency arises, practice grounding yourself and offering {partner} patience",
      "growth-seeker": "Notice when you want to accelerate — what if you matched {partner}'s pace instead?"
    },
    personalizable: false,
    targetDimensions: ["conflict", "emotionalExpression"],
    dayRange: [7, null]
  },
  {
    id: "behav-11",
    text: "Practice the 5:1 ratio — give five positives for every negative interaction",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 4,
    soloVersion: "Track your ratio of positive to negative comments — aim for at least 5:1",
    partnerVersion: "Today, intentionally create five positive interactions with {partner} for every critical or negative one",
    personalizable: false,
    targetDimensions: ["conflict", "loveLanguage", "values"],
    dayRange: [6, null]
  },
  {
    id: "behav-12",
    text: "Do something that speaks your partner's love language, even if it's not yours",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 3,
    soloVersion: "Identify your partner's love language — what's one action that would speak to them?",
    partnerVersion: "Do something that speaks {partner}'s love language — words, touch, time, acts, or gifts",
    personalizable: true,
    personalizationSlots: ["partner_love_language"],
    targetDimensions: ["loveLanguage", "values"],
    dayRange: [4, null]
  },
  {
    id: "behav-13",
    text: "Let go of needing to be right about something small — choose connection over correctness",
    category: "behavior",
    difficulty: 2,
    estimatedMinutes: 1,
    soloVersion: "Notice when you feel the need to correct something minor — practice letting it go",
    partnerVersion: "When you want to correct {partner} about something small, choose to let it go — connection over being right",
    personalizable: false,
    targetDimensions: ["conflict", "relationalIdentity"],
    dayRange: [7, null]
  }
];

// ============================================================================
// COMBINED TEMPLATES ARRAY
// ============================================================================

export const MICRO_ACTION_TEMPLATES: MicroActionTemplate[] = [
  ...communicationTemplates,
  ...conflictTemplates,
  ...connectionTemplates,
  ...awarenessTemplates,
  ...behaviorTemplates
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates filtered by category, difficulty, and day
 */
export function getTemplatesForDay(
  day: number,
  categories?: MicroActionCategory[],
  maxDifficulty?: number
): MicroActionTemplate[] {
  return MICRO_ACTION_TEMPLATES.filter(template => {
    // Filter by category if specified
    if (categories && !categories.includes(template.category)) {
      return false;
    }

    // Filter by difficulty if specified
    if (maxDifficulty !== undefined && template.difficulty > maxDifficulty) {
      return false;
    }

    // Filter by day range
    if (template.dayRange) {
      const [minDay, maxDay] = template.dayRange;
      if (day < minDay) return false;
      if (maxDay !== null && day > maxDay) return false;
    }

    return true;
  });
}

/**
 * Get a random template appropriate for the given context
 */
export function selectTemplate(
  day: number,
  preferredCategories: MicroActionCategory[],
  excludeIds: string[],
  relationshipMode: "solo" | "partner"
): MicroActionTemplate | null {
  // First try to get from preferred categories
  let candidates = getTemplatesForDay(day, preferredCategories)
    .filter(t => !excludeIds.includes(t.id));

  // If no candidates, expand to all categories for this day
  if (candidates.length === 0) {
    candidates = getTemplatesForDay(day)
      .filter(t => !excludeIds.includes(t.id));
  }

  // If still no candidates, return null
  if (candidates.length === 0) {
    return null;
  }

  // Select random template from candidates
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Get templates by specific category
 */
export function getTemplatesByCategory(category: MicroActionCategory): MicroActionTemplate[] {
  return MICRO_ACTION_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): MicroActionTemplate | undefined {
  return MICRO_ACTION_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates that target specific personality dimensions
 */
export function getTemplatesByDimension(dimension: PersonalityDimension): MicroActionTemplate[] {
  return MICRO_ACTION_TEMPLATES.filter(t => t.targetDimensions.includes(dimension));
}

/**
 * Get personalizable templates (for AI enhancement)
 */
export function getPersonalizableTemplates(): MicroActionTemplate[] {
  return MICRO_ACTION_TEMPLATES.filter(t => t.personalizable);
}
