// src/lib/onboarding/questions.ts
import type { Question, QuestionOption } from './types';

const WRITE_MY_OWN: QuestionOption = {
  label: 'Write my own',
  isFreeText: true,
  bridge: "I appreciate you putting that into your own words.",
};

export const QUESTIONS: Question[] = [
  // ── Q1: Name ────────────────────────────────────────────────────────────────
  {
    index: 0,
    topic: 'Name',
    peterText: "Hi — I'm Peter. I'm going to be with you every step of the way. Let's start easy: what's your name?",
    inputType: 'text',
    options: [],
    captures: ['firstName'],
  },

  // ── Q2: Age + Pronouns ───────────────────────────────────────────────────────
  {
    index: 1,
    topic: 'Age + Pronouns',
    peterText: ({ firstName }) => `${firstName}, really good to meet you. Couple of quick ones—`,
    inputType: 'multi-part',
    captures: ['ageRange', 'pronouns'],
    options: [
      { label: 'Under 25', sets: { field: 'ageRange', value: 'under-25' }, bridge: "Good to know. Let's keep going." },
      { label: '25–34',    sets: { field: 'ageRange', value: '25-34'   }, bridge: "Good to know. Let's keep going." },
      { label: '35–44',    sets: { field: 'ageRange', value: '35-44'   }, bridge: "Good to know. Let's keep going." },
      { label: '45+',      sets: { field: 'ageRange', value: '45-plus' }, bridge: "Good to know. Let's keep going." },
      { label: 'She / Her',   sets: { field: 'pronouns', value: 'she/her'   }, bridge: "Good to know. Let's keep going." },
      { label: 'He / Him',    sets: { field: 'pronouns', value: 'he/him'    }, bridge: "Good to know. Let's keep going." },
      { label: 'They / Them', sets: { field: 'pronouns', value: 'they/them' }, bridge: "Good to know. Let's keep going." },
      { label: 'Something else', isFreeText: true, sets: { field: 'pronouns', value: '' }, bridge: "Good to know. Let's keep going." },
    ],
  },

  // ── Q3: Relationship Status + Partner Name ───────────────────────────────────
  {
    index: 2,
    topic: 'Relationship Status',
    peterText: "Tell me a little about your relationship right now.",
    inputType: 'quick-reply',
    captures: ['relationshipStatus', 'partnerName'],
    options: [
      { label: 'Married or long-term committed', sets: { field: 'relationshipStatus', value: 'committed' }, bridge: "That's a real foundation to build on." },
      { label: 'In a serious relationship',       sets: { field: 'relationshipStatus', value: 'serious'   }, bridge: "That's a real foundation to build on." },
      { label: "It's been a complicated stretch", sets: { field: 'relationshipStatus', value: 'complicated' }, scoreDeltas: { dysregulation: 1 }, bridge: "I hear you — complicated is honest. I respect that." },
    ],
  },

  // ── Q4: Relationship Length ─────────────────────────────────────────────────
  {
    index: 3,
    topic: 'Relationship Length',
    peterText: ({ partnerName }) =>
      partnerName
        ? `How long have you and ${partnerName} been together?`
        : "How long have you two been together?",
    inputType: 'quick-reply',
    captures: ['relationshipLength'],
    options: [
      { label: 'Less than a year', sets: { field: 'relationshipLength', value: 'under-1' }, bridge: "Still early — there's a lot of good ahead of you." },
      { label: '1 to 3 years',     sets: { field: 'relationshipLength', value: '1-3'     }, bridge: "You're right in the thick of building something real." },
      { label: '3 to 7 years',     sets: { field: 'relationshipLength', value: '3-7'     }, bridge: "A few years in — you've seen a few seasons together." },
      { label: 'More than 7 years',sets: { field: 'relationshipLength', value: '7-plus'  }, bridge: "That's a long time. A lot of history, a lot of growth." },
    ],
  },

  // ── Q5: Partner Joining ─────────────────────────────────────────────────────
  {
    index: 4,
    topic: 'Partner Joining',
    peterText: ({ partnerName }) =>
      partnerName
        ? `Is ${partnerName} joining you on Sparq too, or are you the one leading the charge?`
        : "Are you starting Sparq with your partner, or is this just yours for now?",
    inputType: 'quick-reply',
    captures: ['partnerUsing'],
    options: [
      { label: "We're doing this together",       sets: { field: 'partnerUsing', value: 'yes'    }, bridge: "I love that. Two people showing up — that matters." },
      { label: "I'm going first — hoping they join", sets: { field: 'partnerUsing', value: 'maybe' }, bridge: "That takes courage. Leading the way says a lot about you." },
      { label: "Just me for now",                 sets: { field: 'partnerUsing', value: 'no'    }, bridge: "That's completely okay. This is yours." },
    ],
  },

  // ── Q6: Emotional Speed ─────────────────────────────────────────────────────
  {
    index: 5,
    topic: 'Emotional Speed',
    peterText: "When something feels off between you — a short reply, a change in tone, a quiet night — how does it land for you?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "It hits me fast and hard — I feel it right away", scoreDeltas: { dysregulation: 3, anxious: 2 }, bridge: "Yeah — when you care, it's hard not to feel it. That makes sense." },
      { label: "I notice it, but I can usually breathe through it", scoreDeltas: { dysregulation: 1, secure: 1 }, bridge: "That's actually a real skill, even when it doesn't feel like one." },
      { label: "I tend to go quiet and not think about it much",   scoreDeltas: { avoidant: 2 }, bridge: "Stepping back to process — there's a kind of wisdom in that too." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q7: Recovery Time ───────────────────────────────────────────────────────
  {
    index: 6,
    topic: 'Recovery Time',
    peterText: "And after a tough moment between you — how long does it usually take you to feel like yourself again?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "I bounce back pretty fast",                          scoreDeltas: { secure: 1 },                   bridge: "That resilience is going to serve you well here." },
      { label: "A few hours — I need to process a bit",             scoreDeltas: { dysregulation: 1 },            bridge: "Processing takes what it takes. Nothing wrong with that." },
      { label: "It can take a day or more",                         scoreDeltas: { dysregulation: 3 },            bridge: "That's real — sometimes the feelings need somewhere to go first." },
      { label: "I shut down and it takes a long time to come back", scoreDeltas: { avoidant: 2, dysregulation: 2 }, bridge: "That kind of shutting down makes sense. We'll work with that gently." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q8: Abandonment Response ────────────────────────────────────────────────
  {
    index: 7,
    topic: 'Abandonment Response',
    peterText: ({ partnerName }) => {
      const name = partnerName ?? 'your partner';
      return `If ${name} went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?`;
    },
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "I'd start wondering if something's wrong between us", scoreDeltas: { abandonment: 3, anxious: 3 }, bridge: "That checking instinct — it comes from caring. I hear you." },
      { label: "I'd figure they're busy or tired",                    scoreDeltas: { secure: 2 },                  bridge: "That kind of trust is a quiet strength." },
      { label: "Honestly, I'd enjoy the space",                      scoreDeltas: { avoidant: 3 },                bridge: "Nothing wrong with needing room to breathe." },
      { label: "I'd notice it, but try not to make it mean something", scoreDeltas: { abandonment: 1, anxious: 1 }, bridge: "That awareness is already a step most people skip." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q9: Inner Voice ─────────────────────────────────────────────────────────
  {
    index: 8,
    topic: 'Inner Voice',
    peterText: "When things get rocky between you, what does the voice inside your head usually sound like?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "It says I'm probably the problem",              scoreDeltas: { selfWorth: 3 },               bridge: "That voice is lying to you more than you know. We're going to work on that." },
      { label: "It says we're both human and we'll figure it out", scoreDeltas: {},                           bridge: "That's a grounded place to come from. I like that." },
      { label: "It wonders if they're losing interest in me",   scoreDeltas: { selfWorth: 2, abandonment: 2 }, bridge: "That fear makes sense. It doesn't make it true." },
      { label: "It gets pretty loud and hard to quiet",         scoreDeltas: { selfWorth: 2, dysregulation: 1 }, bridge: "When the volume goes up like that, it's hard to hear anything else. I get it." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q10: Childhood Safety ───────────────────────────────────────────────────
  {
    index: 9,
    topic: 'Childhood Safety',
    peterText: "Growing up — was home a place that felt mostly safe and steady for you?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "Mostly yes",                    scoreDeltas: {},                              bridge: "That kind of foundation carries forward. Good to know." },
      { label: "It had its moments, but mostly okay", scoreDeltas: { trauma: 1 },            bridge: "Honest answer. Most people's childhoods had some of both." },
      { label: "It was complicated",            scoreDeltas: { trauma: 3 },                  bridge: "Thank you for trusting me with that. It helps me understand you better." },
      { label: "Not really — it was hard",      scoreDeltas: { trauma: 5, disorganized: 2 }, bridge: "That took courage to say. I'm glad you told me. We'll go gently." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q11: Conflict Style ─────────────────────────────────────────────────────
  {
    index: 10,
    topic: 'Conflict Style',
    peterText: ({ partnerName }) =>
      partnerName
        ? `When you and ${partnerName} hit a rough patch, which sounds most like you?`
        : "When you and your partner hit a rough patch, which sounds most like you?",
    inputType: 'quick-reply',
    captures: ['conflictStyle'],
    options: [
      { label: "I bring it up — even when it's uncomfortable", sets: { field: 'conflictStyle', value: 'volatile'   }, bridge: "That directness — when it's timed right — is actually a gift to a relationship." },
      { label: "I need space to cool down before I can talk",  sets: { field: 'conflictStyle', value: 'avoidant'   }, scoreDeltas: { avoidant: 1 }, bridge: "Taking space before you speak is smarter than most people realise." },
      { label: "I try to make sure we both feel heard",        sets: { field: 'conflictStyle', value: 'validating' }, scoreDeltas: { secure: 1  }, bridge: "That instinct to hold space for both of you — that's rare." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q12: Love Language ──────────────────────────────────────────────────────
  {
    index: 11,
    topic: 'Love Language',
    peterText: ({ partnerName }) =>
      partnerName
        ? `What makes you feel most loved by ${partnerName}? Like, what really lands?`
        : "What makes you feel most loved in a relationship? Like, what really lands?",
    inputType: 'quick-reply',
    captures: ['loveLanguage'],
    options: [
      { label: "When they say it out loud — words really matter to me", sets: { field: 'loveLanguage', value: 'words' }, bridge: "Words of love are powerful. The right ones at the right moment change everything." },
      { label: "When they do something thoughtful without being asked",  sets: { field: 'loveLanguage', value: 'acts'  }, bridge: "When someone shows you instead of tells you — that lands deep." },
      { label: "When we just spend real, present time together",         sets: { field: 'loveLanguage', value: 'time'  }, bridge: "Undivided presence is one of the rarest things someone can give." },
      { label: "Physical closeness — a hug, a touch",                   sets: { field: 'loveLanguage', value: 'touch' }, bridge: "Physical connection is its own language. Some people feel it more than anything else." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q13: Life Context ───────────────────────────────────────────────────────
  {
    index: 12,
    topic: 'Life Context',
    peterText: "Last check-in before we really get going. What's life feeling like right now, outside the relationship?",
    inputType: 'quick-reply',
    captures: ['lifeContext'],
    options: [
      { label: "Pretty steady — things are okay",               sets: { field: 'lifeContext', value: 'stable'     }, bridge: "Good. That gives us something solid to build on." },
      { label: "Busy and a bit stretched thin",                 sets: { field: 'lifeContext', value: 'stressed'   }, scoreDeltas: { dysregulation: 1 }, bridge: "Got it — we'll keep things light and practical." },
      { label: "We're going through a big change right now",    sets: { field: 'lifeContext', value: 'transition' }, scoreDeltas: { dysregulation: 1 }, bridge: "Change takes a lot out of you. We'll work with where you are." },
      { label: "It's been heavy — loss, grief, or something really hard", sets: { field: 'lifeContext', value: 'heavy' }, scoreDeltas: { trauma: 2, dysregulation: 1 }, bridge: "I'm sorry. We'll go gently, and we'll start where you have the most energy." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q14: Growth Goal + Check-in Frequency ───────────────────────────────────
  {
    index: 13,
    topic: 'Growth Goal + Check-in Frequency',
    peterText: "And what is it you're really hoping for — the thing you can't quite put words to yet, but you feel it?",
    inputType: 'multi-part',
    captures: ['growthGoal', 'checkInFrequency'],
    options: [
      { label: 'Every day',           sets: { field: 'checkInFrequency', value: 'daily'           }, bridge: "Got it." },
      { label: 'A few times a week',  sets: { field: 'checkInFrequency', value: 'few-times-week'  }, bridge: "Got it." },
      { label: 'Once a week',         sets: { field: 'checkInFrequency', value: 'weekly'           }, bridge: "Got it." },
    ],
  },
];
