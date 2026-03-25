import { LucideIcon, Heart, MessageCircle, Shield, Flame, Target, HeartHandshake, Sparkles, Brain, Users, BookOpen, Compass, Lock, Puzzle, Zap } from "lucide-react";

interface JourneyPhase {
  name: string;
  days: string;
  description: string;
  icon: string;
}

interface Journey {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  sequence: number;
  image: string;
  psychology: string[];
  benefits: string[];
  icon: LucideIcon;
  phases?: JourneyPhase[];
  overview: string;
  free?: boolean;
  badge?: string;
}

export const journeys: Journey[] = [
  {
    id: "love-languages",
    title: "5 Love Languages",
    description: "Notice how easy it is to see the quiet ways your partner loves you",
    duration: "2 weeks",
    category: "Foundation",
    sequence: 1,
    image: "/images/journeys/love-languages.png",
    psychology: [
      "Love Languages Framework (Chapman)",
      "Attachment Theory",
      "Emotional Intelligence"
    ],
    benefits: [
      "Notice what makes you feel most loved",
      "See exactly how your partner asks for love",
      "Share your heart in ways they can easily hear",
      "Feel closer simply by deeply understanding each other"
    ],
    icon: Heart,
    free: true,
    phases: [
      { name: "Discover", days: "Days 1-5", description: "Find out how your heart speaks", icon: "🔍" },
      { name: "Explore", days: "Days 6-10", description: "Look closer at how you both love", icon: "🌱" },
      { name: "Reflect", days: "Days 11-13", description: "Notice love happening right now", icon: "💭" },
      { name: "Align", days: "Day 14", description: "Choose to grow together every day", icon: "🎯" }
    ],
    overview: "Over the next 14 days, you will begin to notice all the quiet ways your partner says 'I love you.' As you practice speaking their language, watch how easily your connection grows."
  },
  {
    id: "communication",
    title: "Clear Connection",
    description: "Learn how to truly hear each other, so every word brings you closer",
    duration: "2 weeks",
    category: "Foundation",
    sequence: 2,
    image: "/images/journeys/communication.png",
    psychology: [
      "Gottman Method",
      "Nonviolent Communication (Rosenberg)",
      "Active Listening Techniques"
    ],
    benefits: [
      "Feel truly heard when it matters most",
      "Share your feelings safely and easily",
      "Understand each other without fighting",
      "Talk in ways that bring you together"
    ],
    icon: MessageCircle,
    free: true,
    phases: [
      { name: "Listen", days: "Days 1-4", description: "Notice what they are really saying", icon: "👂" },
      { name: "Express", days: "Days 5-8", description: "Ask for what you need with an open heart", icon: "🗣️" },
      { name: "Repair", days: "Days 9-11", description: "Gently fix small bumps in the road", icon: "🔧" },
      { name: "Connect", days: "Days 12-14", description: "Keep your connection strong every day", icon: "🤝" }
    ],
    overview: "As you walk through these 14 days, you will learn to listen with your whole heart. Notice how every honest, gentle conversation you have automatically builds a deeper, safer love."
  },
  {
    id: "conflict-resolution",
    title: "Growing Through Hard Moments",
    description: "Learn how to use small disagreements to build a stronger, deeper trust",
    duration: "2 weeks",
    category: "Foundation",
    sequence: 3,
    image: "/images/journeys/conflict-resolution.png",
    psychology: [
      "Gottman Method (Repair Attempts)",
      "Emotionally Focused Therapy",
      "Nonviolent Communication"
    ],
    benefits: [
      "Stay close even when you disagree",
      "Stop hard moments before they grow",
      "Easily fix hurt feelings and move forward",
      "Use hard moments to understand each other better"
    ],
    icon: Shield,
    free: true,
    phases: [
      { name: "Awareness", days: "Days 1-4", description: "Notice the dances you do when you argue", icon: "🔍" },
      { name: "Skills", days: "Days 5-8", description: "Find gentle ways to calm the storm", icon: "🛠️" },
      { name: "Practice", days: "Days 9-11", description: "Try a softer way when it matters", icon: "💪" },
      { name: "Integrate", days: "Days 12-14", description: "Choose to always stay on the same team", icon: "🎯" }
    ],
    overview: "Over the next 14 days, you will learn a beautiful truth: hard moments don't have to hurt your love. As you try these simple steps, notice how disagreements actually bring you closer."
  },
  {
    id: "intimacy",
    title: "Deepening Our Closeness",
    description: "Feel safer, closer, and more deeply connected in every way",
    duration: "2 weeks",
    category: "Growth",
    sequence: 4,
    image: "/images/journeys/intimacy.png",
    psychology: [
      "Attachment Theory (Bowlby/Johnson)",
      "Emotionally Focused Therapy",
      "Vulnerability Research (Brown)"
    ],
    benefits: [
      "Feel incredibly safe opening your heart",
      "Grow closer physically and emotionally",
      "Find beautiful new ways to connect",
      "Share your true self and feel loved for it"
    ],
    icon: Flame,
    phases: [
      { name: "Open", days: "Days 1-4", description: "Make a quiet space for just the two of you", icon: "💫" },
      { name: "Deepen", days: "Days 5-8", description: "Find new ways to feel close", icon: "🌊" },
      { name: "Vulnerability", days: "Days 9-11", description: "Bravely share what is in your heart", icon: "🦋" },
      { name: "Sustain", days: "Days 12-14", description: "Make closeness a part of your daily life", icon: "🔥" }
    ],
    overview: "This 14-day path helps you slowly open your heart. As you share these moments, you will find it surprisingly easy to feel deeply safe and connected."
  },
  {
    id: "emotional-intelligence",
    title: "Understanding Our Hearts",
    description: "Learn to read your own heart and your partner's, making every day easier",
    duration: "2 weeks",
    category: "Growth",
    sequence: 5,
    image: "/images/journeys/emotional-intelligence.png",
    psychology: [
      "Emotional Intelligence (Goleman)",
      "Internal Family Systems",
      "Mindfulness-Based Approaches"
    ],
    benefits: [
      "Easily name the feelings inside you",
      "Stay calm and grounded naturally when things get hot",
      "Quickly see exactly how your partner is feeling",
      "Hold their feelings gently without needing to fix them"
    ],
    icon: Brain,
    phases: [
      { name: "Awareness", days: "Days 1-4", description: "Notice the feelings moving inside you", icon: "🧭" },
      { name: "Regulation", days: "Days 5-8", description: "Learn to stay grounded and calm", icon: "⚖️" },
      { name: "Empathy", days: "Days 9-11", description: "See their heart with gentle eyes", icon: "💗" },
      { name: "Mastery", days: "Days 12-14", description: "Use your heart to guide your days", icon: "✨" }
    ],
    overview: "For the next 14 days, you will simply notice your feelings. As you understand your own heart better, notice how you automatically feel more connected to theirs."
  },
  {
    id: "values",
    title: "Values & Vision Alignment",
    description: "Discover your core values and build a shared vision for your relationship",
    duration: "3 weeks",
    category: "Growth",
    sequence: 6,
    image: "/images/journeys/values.png",
    psychology: [
      "Acceptance and Commitment Therapy (ACT)",
      "Positive Psychology (PERMA)",
      "Narrative Therapy"
    ],
    benefits: [
      "Identify your non-negotiable core values",
      "Understand where you and your partner align and diverge",
      "Create a shared relationship vision",
      "Navigate value differences with compassion"
    ],
    icon: Compass,
    phases: [
      { name: "Discover", days: "Days 1-7", description: "Uncover your individual values", icon: "🔍" },
      { name: "Compare", days: "Days 8-14", description: "Explore alignment and differences", icon: "🤲" },
      { name: "Vision", days: "Days 15-21", description: "Build a shared future together", icon: "🌟" }
    ],
    overview: "This 21-day journey guides you through identifying your deepest values, understanding your partner's, and co-creating a relationship vision that honors both."
  },
  {
    id: "attachment-healing",
    title: "Attachment Healing",
    description: "Understand and transform your attachment patterns for deeper security",
    duration: "6 weeks",
    category: "Advanced",
    sequence: 7,
    image: "/images/journeys/attachment-healing.png",
    psychology: [
      "Attachment Theory (Bowlby/Ainsworth)",
      "Emotionally Focused Therapy",
      "Interpersonal Neurobiology (Siegel)"
    ],
    benefits: [
      "Understand your attachment style and its origins",
      "Recognize attachment triggers before they escalate",
      "Develop earned security through intentional practice",
      "Create a more secure bond with your partner"
    ],
    icon: HeartHandshake,
    phases: [
      { name: "Understand", days: "Days 1-10", description: "Map your attachment patterns", icon: "🗺️" },
      { name: "Heal", days: "Days 11-21", description: "Process origins and triggers", icon: "🌿" },
      { name: "Rewire", days: "Days 22-35", description: "Build new neural pathways", icon: "🧠" },
      { name: "Secure", days: "Days 36-42", description: "Establish earned security", icon: "🏠" }
    ],
    overview: "This 42-day deep-dive journey helps you understand how early attachment experiences shape your relationship patterns, and guides you toward earned security through daily practices and partner exercises."
  },
  {
    id: "trust-rebuilding",
    title: "Trust Rebuilding",
    description: "Heal and rebuild trust after a breach through structured, compassionate steps",
    duration: "6 weeks",
    category: "Advanced",
    sequence: 8,
    image: "/images/journeys/trust-rebuilding.png",
    psychology: [
      "Gottman Trust Revival Method",
      "Emotionally Focused Therapy",
      "Narrative Therapy (Re-authoring)"
    ],
    benefits: [
      "Process betrayal pain in a structured, safe way",
      "Build transparency and accountability practices",
      "Develop a forgiveness process at your own pace",
      "Create a stronger foundation than before"
    ],
    icon: Shield,
    phases: [
      { name: "Acknowledge", days: "Days 1-10", description: "Face the breach with honesty", icon: "🪞" },
      { name: "Process", days: "Days 11-21", description: "Work through pain and anger", icon: "🌧️" },
      { name: "Rebuild", days: "Days 22-35", description: "Establish new trust behaviors", icon: "🧱" },
      { name: "Renew", days: "Days 36-42", description: "Create a new chapter together", icon: "🌅" }
    ],
    overview: "This 42-day journey provides a structured, compassionate framework for healing after trust has been broken — whether through dishonesty, infidelity, or other breaches."
  },
  {
    id: "relationship-renewal",
    title: "Relationship Renewal",
    description: "Reignite connection and rediscover your partner after years together",
    duration: "5 weeks",
    category: "Growth",
    sequence: 9,
    image: "/images/journeys/relationship-renewal.png",
    psychology: [
      "Positive Psychology (Fredrickson)",
      "Gottman Sound Relationship House",
      "Self-Expansion Theory (Aron)"
    ],
    benefits: [
      "Break out of autopilot in your relationship",
      "Rediscover qualities you fell in love with",
      "Build new rituals of connection",
      "Create shared novelty and excitement"
    ],
    icon: Sparkles,
    phases: [
      { name: "Rediscover", days: "Days 1-7", description: "See your partner with fresh eyes", icon: "👀" },
      { name: "Reinvent", days: "Days 8-14", description: "Break old routines together", icon: "🔄" },
      { name: "Reconnect", days: "Days 15-28", description: "Build new rituals and habits", icon: "💞" },
      { name: "Renew", days: "Days 29-35", description: "Commit to an evolving partnership", icon: "🌱" }
    ],
    overview: "This 35-day journey is designed for couples who love each other but feel stuck in routine. Rediscover the spark through novelty, appreciation, and intentional connection."
  },
  {
    id: "sexual-intimacy",
    title: "Sexual Intimacy & Desire",
    description: "Deepen sexual connection through communication, presence, and mutual exploration",
    duration: "4 weeks",
    category: "Intimacy",
    sequence: 10,
    image: "/images/journeys/sexual-intimacy.png",
    psychology: [
      "Sensate Focus (Masters & Johnson)",
      "Desire Discrepancy Research (Perel)",
      "Mindfulness-Based Sex Therapy"
    ],
    benefits: [
      "Understand the difference between responsive and spontaneous desire",
      "Communicate about sex with openness and safety",
      "Address desire differences without pressure",
      "Build a fulfilling sexual connection"
    ],
    icon: Flame,
    phases: [
      { name: "Understand", days: "Days 1-7", description: "Explore desire and connection", icon: "💡" },
      { name: "Communicate", days: "Days 8-14", description: "Build sexual communication skills", icon: "💬" },
      { name: "Explore", days: "Days 15-21", description: "Deepen physical connection", icon: "🌊" },
      { name: "Sustain", days: "Days 22-28", description: "Build lasting sexual wellness habits", icon: "🔥" }
    ],
    overview: "This 28-day journey helps you and your partner build a more fulfilling sexual connection through honest communication, mindful presence, and mutual exploration."
  },
  {
    id: "mindful-sexuality",
    title: "Mindful Sexuality",
    description: "Bring presence, awareness, and deeper connection to your physical intimacy",
    duration: "4 weeks",
    category: "Intimacy",
    sequence: 11,
    image: "/images/journeys/mindful-sexuality.png",
    psychology: [
      "Mindfulness-Based Stress Reduction (Kabat-Zinn)",
      "Sensate Focus Therapy",
      "Somatic Experiencing"
    ],
    benefits: [
      "Bring full presence to physical intimacy",
      "Reduce performance anxiety and mental chatter",
      "Deepen sensory awareness and pleasure",
      "Build emotional connection through physical presence"
    ],
    icon: Sparkles,
    phases: [
      { name: "Presence", days: "Days 1-7", description: "Cultivate mindful awareness", icon: "🧘" },
      { name: "Sensation", days: "Days 8-14", description: "Explore sensory connection", icon: "✋" },
      { name: "Connection", days: "Days 15-21", description: "Deepen emotional-physical bond", icon: "💫" },
      { name: "Integration", days: "Days 22-28", description: "Build a mindful intimacy practice", icon: "🌙" }
    ],
    overview: "This 28-day journey teaches you to bring mindful awareness to your physical connection, transforming intimacy from performance into presence."
  },
  {
    id: "fantasy-exploration",
    title: "Fantasy Exploration",
    description: "Safely share and explore desires to deepen trust and playfulness",
    duration: "3 weeks",
    category: "Intimacy",
    sequence: 12,
    image: "/images/journeys/fantasy-exploration.png",
    psychology: [
      "Erotic Intelligence (Perel)",
      "Attachment-Based Sex Therapy",
      "Consent-Centered Communication"
    ],
    benefits: [
      "Create safety for sharing fantasies without judgment",
      "Understand the difference between fantasy and desire",
      "Build playfulness and creativity in your connection",
      "Strengthen trust through vulnerable sharing"
    ],
    icon: Puzzle,
    phases: [
      { name: "Safety", days: "Days 1-7", description: "Build a container for sharing", icon: "🛡️" },
      { name: "Share", days: "Days 8-14", description: "Practice vulnerable disclosure", icon: "💌" },
      { name: "Explore", days: "Days 15-21", description: "Play and create together", icon: "🎨" }
    ],
    overview: "This 21-day journey creates a safe framework for sharing desires and fantasies with your partner, building trust and playfulness through graduated vulnerability."
  },
  {
    id: "power-dynamics",
    title: "Power Dynamics & Play",
    description: "Understand and consciously navigate power dynamics in your relationship",
    duration: "4 weeks",
    category: "Intimacy",
    sequence: 13,
    image: "/images/journeys/power-dynamics.png",
    psychology: [
      "Relational Power Theory",
      "Consent-Centered Communication",
      "Attachment-Based Approaches"
    ],
    benefits: [
      "Recognize unconscious power patterns in your relationship",
      "Navigate power dynamics with awareness and intention",
      "Build consent and communication skills for all contexts",
      "Create more balance and equity in your partnership"
    ],
    icon: Zap,
    phases: [
      { name: "Awareness", days: "Days 1-7", description: "Recognize power patterns", icon: "🔍" },
      { name: "Communication", days: "Days 8-14", description: "Build consent vocabulary", icon: "🗣️" },
      { name: "Exploration", days: "Days 15-21", description: "Consciously navigate dynamics", icon: "⚖️" },
      { name: "Balance", days: "Days 22-28", description: "Create equitable partnership", icon: "🤝" }
    ],
    overview: "This 28-day journey helps you understand how power flows in your relationship — in everyday decisions, emotional labor, finances, and intimacy — and build more conscious, equitable patterns."
  },
];
