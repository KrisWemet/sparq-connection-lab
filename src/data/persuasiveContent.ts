// Future-self imagery for the journey start screen.
//
// Episodic future thinking: picturing a concrete, believable future makes
// people more likely to act toward it today. Each vision is plain, sensory
// and honest (setbacks still happen). Each ends with one open reflection
// question that invites the user to fill the picture in themselves —
// autonomy support, never a hidden instruction. Fourth-grade reading level.

export interface FuturePacingTimeframe {
  label: string;
  vision: string;
  /** One open question that lets the user complete the picture themselves. */
  reflection: string;
}

export interface FuturePacingCategory {
  id: string;
  title: string;
  type: 'communication' | 'intimacy' | 'trust' | 'future' | 'conflict';
  timeframes: FuturePacingTimeframe[];
}

export const futurePacingTimeframes: FuturePacingCategory[] = [
  {
    id: "future-communication",
    title: "Being Heard",
    type: "communication",
    timeframes: [
      {
        label: "1 Month",
        vision: "It's a quiet evening, one month from now. Something small comes up — a plan, a worry. You say it plainly. Your partner turns toward you and listens all the way to the end. Nobody is waiting for their turn to talk.",
        reflection: "When your partner listens like that, what's the first thing you feel?"
      },
      {
        label: "6 Months",
        vision: "Six months from now, a hard talk starts to heat up. This time one of you slows it down: \"Wait — say that again. I want to get it right.\" You still don't agree on everything. But you both walk away feeling heard.",
        reflection: "In that moment, what do you hear yourself say?"
      },
      {
        label: "1 Year",
        vision: "A year from now, you have little phrases only the two of you use. A look that means \"later, not now.\" A word that means \"I'm hurting.\" Mix-ups still happen. They just don't last as long.",
        reflection: "What's one phrase you'd love the two of you to share?"
      }
    ]
  },
  {
    id: "future-intimacy",
    title: "Growing Closer",
    type: "intimacy",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, you pass each other in the hallway. A hand on the back. A look that lasts one second longer. Small moments start to feel like they mean something again.",
        reflection: "Which small touch would you notice first?"
      },
      {
        label: "6 Months",
        vision: "Six months from now, you stay up talking later than you meant to. You share something you used to keep to yourself. Your partner doesn't pull away. They lean in.",
        reflection: "What's one thing you'll feel safe enough to share by then?"
      },
      {
        label: "1 Year",
        vision: "A year from now, closeness isn't something you have to plan. It's in how you say good morning. It's in the way you both ask for what you want — and hear it with kindness.",
        reflection: "When closeness feels that easy, what's different about your mornings?"
      }
    ]
  },
  {
    id: "future-trust",
    title: "Solid Ground",
    type: "trust",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, your partner says they'll do something, and they do. You say you'll be home by six, and you are. Nothing big. Just a quiet feeling of \"I can count on you.\"",
        reflection: "What's one small promise you'll keep this week?"
      },
      {
        label: "6 Months",
        vision: "Six months from now, one of you makes a mistake. It stings. But you talk about it honestly, and you both come back to the table. The trust bends. It doesn't break.",
        reflection: "When a mistake happens, what helps you find your way back to each other?"
      },
      {
        label: "1 Year",
        vision: "A year from now, you feel safe being your whole self. You try new things and share big dreams, because you know your partner is in your corner.",
        reflection: "What dream will you share once you feel that safe?"
      }
    ]
  },
  {
    id: "future-goals",
    title: "Building Your Future",
    type: "future",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, you sit together and dream out loud. A trip. A garden. A slower Sunday. You notice you're both smiling at the same idea.",
        reflection: "Which shared dream comes to mind first?"
      },
      {
        label: "6 Months",
        vision: "Six months from now, a plan you made together is starting to happen. When something gets in the way, you figure it out side by side. Each small win belongs to both of you.",
        reflection: "What small win will you celebrate together?"
      },
      {
        label: "1 Year",
        vision: "A year from now, you look back at what you built. Some plans changed. New ones showed up. What stands out most is how you did it — together.",
        reflection: "What do you want to remember most about this year?"
      }
    ]
  },
  {
    id: "future-conflict",
    title: "Coming Back Together",
    type: "conflict",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, a disagreement starts. This time you both take a breath before you answer. You remember you're on the same team. The whole talk feels different.",
        reflection: "What helps you take that breath?"
      },
      {
        label: "6 Months",
        vision: "Six months from now, a fight that used to last all weekend is over by dinner. You catch the old pattern early and say, \"Let's try that again.\" Sometimes you even end up closer.",
        reflection: "What words will you use to start a repair?"
      },
      {
        label: "1 Year",
        vision: "A year from now, you still disagree sometimes. Every couple does. But it doesn't feel scary anymore. You get curious instead of defensive, and you make up quickly when you slip.",
        reflection: "When you slip, what does a quick repair look like for the two of you?"
      }
    ]
  }
];

// Metaphor descriptions for different relationship aspects
export interface MetaphorDescription {
  title: string;
  description: string;
  metaphorType: 'flower' | 'bridge' | 'tree' | 'river' | 'flame';
}

export const metaphorDescriptions: Record<string, MetaphorDescription> = {
  flower: {
    title: "The Blooming Relationship",
    description: "Flowers bloom with a little care every day. Love does too.",
    metaphorType: "flower"
  },
  bridge: {
    title: "The Bridge of Understanding",
    description: "Every honest talk adds one more plank to the bridge between you.",
    metaphorType: "bridge"
  },
  tree: {
    title: "Deep Roots, Strong Growth",
    description: "Trees grow strong from deep roots. Trust and time are yours.",
    metaphorType: "tree"
  },
  river: {
    title: "The Flowing Journey",
    description: "Some days the water is calm. Some days it rushes. Either way, you move forward together.",
    metaphorType: "river"
  },
  flame: {
    title: "The Enduring Flame",
    description: "A fire stays warm when you tend it. Small, steady care keeps your spark alive.",
    metaphorType: "flame"
  }
}; 