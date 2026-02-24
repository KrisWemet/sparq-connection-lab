import type { IdentityArchetype, MicroActionCategory } from "@/types/session";

/** Full configuration for an identity archetype */
export interface ArchetypeConfig {
  id: IdentityArchetype;
  label: string;
  tagline: string;
  description: string;
  icon: string; // Lucide icon name

  greetingTemplates: string[];

  contentFraming: {
    /** How to introduce today's topic */
    learnIntroTemplates: string[];
    /** AI directive for insight style */
    insightStyle: string;
    /** AI directive for question tone */
    questionTone: string;
  };

  microActionPreferences: {
    preferredCategories: MicroActionCategory[];
    framingStyle: string;
  };

  celebrationMessages: {
    sessionComplete: string[];
    streakMilestone: string[];
    dimensionRevealed: string[];
  };

  reflectionStyle: string;
}

export const ARCHETYPE_CONFIGS: Record<IdentityArchetype, ArchetypeConfig> = {
  "calm-anchor": {
    id: "calm-anchor",
    label: "The Calm Anchor",
    tagline: "I want to be the steady, grounding presence",
    description: "You believe that the best thing you can bring to your relationship is a sense of calm and stability. When things get hectic, you want to be the one who stays centered.",
    icon: "anchor",

    greetingTemplates: [
      "As you take a breath, {name}, notice that you're already showing up.",
      "Good morning, {name}. As you begin today, let's start grounded.",
      "Hey {name}. As you step into today, a few quiet minutes just for you.",
      "Morning, {name}. As you arrive, steady as always — let's begin.",
      "{name}, as you begin today, notice you're already being the calm in the storm.",
      "Welcome back, {name}. Your consistency matters more than you know."
    ],

    contentFraming: {
      learnIntroTemplates: [
        "Today we're exploring something that builds that steady foundation you value...",
        "Here's a quiet but powerful insight about how grounded partners show up...",
        "Let's look at what happens when you bring your calm presence to this...",
        "Something interesting about the stability you naturally bring...",
        "Today's insight is about the strength in stillness..."
      ],
      insightStyle: "Reflective and measured. Frame insights as foundations being strengthened. Use metaphors of roots, anchors, steady ground. Avoid urgency or pressure.",
      questionTone: "Calm, thoughtful, unhurried. Questions should invite reflection, not demand immediate reaction."
    },

    microActionPreferences: {
      preferredCategories: ["awareness", "behavior", "communication"],
      framingStyle: "Frame actions as grounding practices. 'Today, anchor yourself by...' or 'Practice your steadiness with...'"
    },

    celebrationMessages: {
      sessionComplete: [
        "Another layer of foundation laid. As you pause, notice your steady progress, {name}.",
        "You showed up again. That consistency is your superpower.",
        "Grounded and growing. That's the way.",
        "The calm you're building radiates further than you think.",
        "As you complete today, notice the steady steps you've taken. Well done."
      ],
      streakMilestone: [
        "{count} days of showing up. Your roots grow deeper every day.",
        "A {count}-day streak. That's what steady looks like.",
        "{count} days strong. Your partner feels this consistency, even if they can't name it."
      ],
      dimensionRevealed: [
        "We're starting to see the steady core of who you are.",
        "A new part of your foundation is becoming clear.",
        "Your natural steadiness shows up here too — and it's a strength."
      ]
    },

    reflectionStyle: "Invite gentle self-observation. 'As you wind down tonight, notice...' Frame as awareness, not homework."
  },

  "compassionate-listener": {
    id: "compassionate-listener",
    label: "The Compassionate Listener",
    tagline: "I want to truly hear and understand",
    description: "You believe that the deepest gift you can give is genuine attention. You want to create a space where your partner feels truly heard and understood.",
    icon: "heart-handshake",

    greetingTemplates: [
      "As you check in, how's your heart today, {name}?",
      "Good morning, {name}. As you begin, ready to tune in?",
      "{name}, your willingness to listen is already a gift.",
      "Hey {name}. As you start today, let's practice really hearing.",
      "Morning, {name}. The world needs more listeners like you.",
      "Welcome back, {name}. Your empathy is making a difference."
    ],

    contentFraming: {
      learnIntroTemplates: [
        "Today we're exploring something close to your heart — how understanding deepens connection...",
        "Here's an insight about the power of truly being heard...",
        "Let's look at what happens when someone feels genuinely understood...",
        "Something beautiful about the way empathy works in relationships...",
        "Today's insight is about listening — not just with your ears..."
      ],
      insightStyle: "Warm and empathetic. Frame insights as deepening understanding. Use metaphors of bridges, open doors, safe spaces. Center the emotional experience.",
      questionTone: "Gentle, feeling-oriented, emotionally attuned. Questions should feel like an invitation to share, not an interrogation."
    },

    microActionPreferences: {
      preferredCategories: ["communication", "connection", "awareness"],
      framingStyle: "Frame actions as empathy exercises. 'Today, practice hearing with...' or 'Create a moment of understanding by...'"
    },

    celebrationMessages: {
      sessionComplete: [
        "Your empathy is a gift, {name}. Thank you for sharing it.",
        "Every time you listen deeply, you build something beautiful.",
        "Understanding takes courage. You have plenty.",
        "You're becoming an even better listener. Your partner is lucky.",
        "Compassion practiced is compassion multiplied."
      ],
      streakMilestone: [
        "{count} days of showing up with your whole heart.",
        "A {count}-day streak of deepening your empathy. That's remarkable.",
        "{count} days. Your capacity for understanding keeps growing."
      ],
      dimensionRevealed: [
        "We're discovering the depth of your empathy — and it's beautiful.",
        "A new facet of your compassionate nature is emerging.",
        "The way you naturally attune to others is a real strength."
      ]
    },

    reflectionStyle: "Invite emotional check-in. 'Tonight, check in with how you're feeling about...' Frame as self-compassion, not analysis."
  },

  "growth-seeker": {
    id: "growth-seeker",
    label: "The Growth Seeker",
    tagline: "I want to keep evolving and learning",
    description: "You believe that the best relationships are ones where both people keep growing. You're excited by progress, new insights, and becoming a better version of yourself.",
    icon: "sprout",

    greetingTemplates: [
      "As you step into today, what will you discover about yourself, {name}?",
      "Good morning, {name}. Ready to see what's possible today?",
      "{name}, as you begin today, your curiosity is opening doors.",
      "Hey {name}. As you grow today, your relationship grows with you.",
      "Morning, {name}. As you begin, let's discover something new.",
      "Welcome back, {name}. Growth looks good on you."
    ],

    contentFraming: {
      learnIntroTemplates: [
        "Today's insight might challenge what you thought you knew...",
        "Here's something that could shift your perspective on how you show up...",
        "Ready for a growth edge? Today we're exploring...",
        "This is one of those insights that changes how you see things...",
        "Let's push into new territory today..."
      ],
      insightStyle: "Forward-looking and energizing. Frame insights as growth opportunities and progress markers. Use metaphors of paths, horizons, unlocking. Create excitement about learning.",
      questionTone: "Curious, slightly challenging, forward-looking. Questions should feel like an invitation to explore and push boundaries."
    },

    microActionPreferences: {
      preferredCategories: ["behavior", "communication", "conflict"],
      framingStyle: "Frame actions as experiments and challenges. 'Today, try this new approach...' or 'Here's your growth experiment for today...'"
    },

    celebrationMessages: {
      sessionComplete: [
        "As you pause to notice, {name}, you're already growing in ways you might not see yet.",
        "Another insight absorbed. As you reflect, you're building something incredible.",
        "Progress isn't always visible, but it's happening. Trust the journey.",
        "Your willingness to grow is rare. As you continue, you're becoming more you.",
        "Every session is a step forward. You're on your way."
      ],
      streakMilestone: [
        "{count} days of intentional growth. The compound effect is real.",
        "A {count}-day learning streak. Imagine where you'll be in a month.",
        "{count} days. You're not the same person who started — and that's the point."
      ],
      dimensionRevealed: [
        "We just uncovered a new growth edge. This is exciting.",
        "A new dimension of who you are is coming into focus.",
        "This discovery opens up new ways to grow. You're going to love this."
      ]
    },

    reflectionStyle: "Invite growth observation. 'Tonight, notice one thing that was different because of today's insight...' Frame as progress tracking, not self-judgment."
  },

  "connection-builder": {
    id: "connection-builder",
    label: "The Connection Builder",
    tagline: "I want to create deeper bonds",
    description: "You believe that the magic of a relationship lives in the moments of real connection. You want to build bridges, create shared experiences, and weave your lives more closely together.",
    icon: "link",

    greetingTemplates: [
      "As you begin today, ready to build some bridges, {name}?",
      "Good morning, {name}. As you start, let's create something together.",
      "{name}, your desire for connection is powerful.",
      "Hey {name}. As you step into today, it's about weaving closer bonds.",
      "Morning, {name}. Connection starts with intention — and you have plenty.",
      "Welcome back, {name}. Every thread you add strengthens the whole fabric."
    ],

    contentFraming: {
      learnIntroTemplates: [
        "Today we're exploring something that deepens the bonds you care about most...",
        "Here's an insight about what really creates lasting connection...",
        "Let's look at the invisible threads that hold relationships together...",
        "Something powerful about how shared moments become shared meaning...",
        "Today's insight is about turning ordinary moments into connection points..."
      ],
      insightStyle: "Warm and relational. Frame insights as bridges being built. Use metaphors of weaving, bridges, shared spaces, intertwining. Emphasize togetherness and shared experience.",
      questionTone: "Warm, relational, togetherness-oriented. Questions should feel like they're about building something together."
    },

    microActionPreferences: {
      preferredCategories: ["connection", "communication", "awareness"],
      framingStyle: "Frame actions as bridge-building. 'Today, create a moment of connection by...' or 'Build a bridge with...'"
    },

    celebrationMessages: {
      sessionComplete: [
        "You're weaving something beautiful, {name}.",
        "Another thread added to your connection. It gets stronger every day.",
        "The bonds you're building will hold through anything.",
        "Connection isn't luck — it's what you're creating right now.",
        "You just invested in the relationship that matters most."
      ],
      streakMilestone: [
        "{count} days of intentional connection. You're building something lasting.",
        "A {count}-day streak of bridge-building. Your relationship can feel it.",
        "{count} days. The connection you're creating is real and deepening."
      ],
      dimensionRevealed: [
        "We're starting to see how you naturally build connection — and it's beautiful.",
        "A new part of your relational self is emerging.",
        "The way you seek closeness is one of your greatest strengths."
      ]
    },

    reflectionStyle: "Invite relational observation. 'Tonight, notice one moment of connection you created or experienced...' Frame as appreciating the bonds."
  }
};

/** Helper to get config for an archetype */
export function getArchetypeConfig(archetype: IdentityArchetype): ArchetypeConfig {
  return ARCHETYPE_CONFIGS[archetype];
}

/** Get a random greeting for the archetype */
export function getGreeting(archetype: IdentityArchetype, userName: string): string {
  const config = getArchetypeConfig(archetype);
  const template = config.greetingTemplates[Math.floor(Math.random() * config.greetingTemplates.length)];
  return template.replace("{name}", userName);
}

/** Get a random celebration for session completion */
export function getCelebration(archetype: IdentityArchetype, userName: string): string {
  const config = getArchetypeConfig(archetype);
  const template = config.celebrationMessages.sessionComplete[
    Math.floor(Math.random() * config.celebrationMessages.sessionComplete.length)
  ];
  return template.replace("{name}", userName);
}

/** Get a random streak milestone message */
export function getStreakMilestone(archetype: IdentityArchetype, count: number): string {
  const config = getArchetypeConfig(archetype);
  const template = config.celebrationMessages.streakMilestone[
    Math.floor(Math.random() * config.celebrationMessages.streakMilestone.length)
  ];
  return template.replace("{count}", count.toString());
}

/** Get a random dimension revealed message */
export function getDimensionRevealed(archetype: IdentityArchetype): string {
  const config = getArchetypeConfig(archetype);
  const template = config.celebrationMessages.dimensionRevealed[
    Math.floor(Math.random() * config.celebrationMessages.dimensionRevealed.length)
  ];
  return template;
}

/** Get a random learn intro for the archetype */
export function getLearnIntro(archetype: IdentityArchetype): string {
  const config = getArchetypeConfig(archetype);
  const template = config.contentFraming.learnIntroTemplates[
    Math.floor(Math.random() * config.contentFraming.learnIntroTemplates.length)
  ];
  return template;
}
