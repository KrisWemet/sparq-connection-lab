/**
 * Psychology Framework Configuration
 *
 * Central configuration for all evidence-based psychology techniques used
 * throughout Sparq Connection Lab. This config drives:
 *
 * 1. **Color psychology** — Phase-appropriate color schemes that support emotional states
 * 2. **Therapeutic language patterns** — Presuppositions, reframing, solution-focused language
 * 3. **Framework-specific techniques** — CBT, NVC, EFT, Gottman, Attachment, Narrative Therapy
 * 4. **Session design psychology** — Peak-end rule, priming, anchoring, progressive disclosure
 *
 * Philosophy: These techniques are TRANSPARENT and THERAPEUTIC — designed to help
 * users genuinely rewire patterns, NOT to manipulate behavior. The user is always
 * the agent of their own growth.
 */

import type { DiscoveryPhase } from "@/types/personality";
import type { IdentityArchetype } from "@/types/session";

// ─── Color Psychology ─────────────────────────────────────────────────────

/**
 * Color schemes tied to discovery phases.
 * Each phase uses colors that psychologically support the emotional work happening.
 *
 * Research basis:
 * - Warm colors (pink, coral) → Safety, approachability, emotional openness
 * - Purple → Introspection, wisdom, self-discovery
 * - Blue-teal → Trust, calm, stability (especially during conflict exploration)
 * - Amber-gold → Warmth, validation, celebration
 * - Deep purple-rose → Intimacy, vulnerability, depth
 */
export interface PhaseColorScheme {
  /** Primary accent for the phase */
  primary: string;
  /** Soft background gradient start */
  gradientFrom: string;
  /** Soft background gradient end */
  gradientTo: string;
  /** Text accent color */
  accent: string;
  /** Card/surface highlight */
  surface: string;
  /** The emotional intention behind this palette */
  intention: string;
}

export const PHASE_COLOR_SCHEMES: Record<DiscoveryPhase, PhaseColorScheme> = {
  rhythm: {
    primary: "#9B51E0",      // Sparq purple — familiar, welcoming
    gradientFrom: "#F3E8FF", // Soft lavender
    gradientTo: "#FFE4E4",   // Warm pink
    accent: "#9B51E0",
    surface: "#FAF5FF",
    intention: "Safety and welcome. Soft, warm tones signal 'this is a safe space' and reduce new-user anxiety.",
  },
  deepening: {
    primary: "#7C3AED",      // Deeper violet — going inward
    gradientFrom: "#EDE9FE", // Violet mist
    gradientTo: "#E0E7FF",   // Soft indigo
    accent: "#6D28D9",
    surface: "#F5F3FF",
    intention: "Emotional depth. Cooler violets invite introspection and signal it's safe to go deeper.",
  },
  navigating: {
    primary: "#0D9488",      // Teal — grounding, trust
    gradientFrom: "#CCFBF1", // Mint
    gradientTo: "#E0E7FF",   // Soft blue
    accent: "#0F766E",
    surface: "#F0FDFA",
    intention: "Stability during challenge. Teal/blue tones promote calm and trust when exploring conflict.",
  },
  layers: {
    primary: "#B45309",      // Warm amber — intimacy, warmth
    gradientFrom: "#FEF3C7", // Soft gold
    gradientTo: "#FDE68A",   // Warm amber
    accent: "#92400E",
    surface: "#FFFBEB",
    intention: "Warmth and vulnerability. Amber/gold tones create emotional warmth for intimate exploration.",
  },
  mirror: {
    primary: "#BE185D",      // Rose — celebration, love
    gradientFrom: "#FCE7F3", // Soft rose
    gradientTo: "#F3E8FF",   // Back to lavender — full circle
    accent: "#9D174D",
    surface: "#FFF1F2",
    intention: "Celebration and integration. Rose tones honor the journey and create a sense of arrival.",
  },
};

/**
 * Archetype-specific color accents that layer on top of phase colors.
 * Subtler than phase colors — used for micro-interactions and personal touches.
 */
export const ARCHETYPE_COLOR_ACCENTS: Record<IdentityArchetype, { glow: string; badge: string }> = {
  "calm-anchor": { glow: "rgba(14, 165, 233, 0.15)", badge: "#0EA5E9" },       // Sky blue — calm
  "compassionate-listener": { glow: "rgba(236, 72, 153, 0.15)", badge: "#EC4899" }, // Pink — heart
  "growth-seeker": { glow: "rgba(34, 197, 94, 0.15)", badge: "#22C55E" },       // Green — growth
  "connection-builder": { glow: "rgba(168, 85, 247, 0.15)", badge: "#A855F7" },  // Purple — connection
};

// ─── Therapeutic Language Patterns ─────────────────────────────────────────

/**
 * Evidence-based language patterns used in AI prompts to support genuine
 * cognitive and behavioral change. These are NOT manipulative embedded commands —
 * they are transparent therapeutic communication techniques used by therapists.
 *
 * Sources: Solution-Focused Brief Therapy (SFBT), Motivational Interviewing (MI),
 * Cognitive Behavioral Therapy (CBT), Nonviolent Communication (NVC)
 */
export const THERAPEUTIC_LANGUAGE_PATTERNS = {
  /**
   * Presuppositions — language that assumes positive change is already happening.
   * Research: Presuppositions in SFBT have been shown to increase client self-efficacy.
   * Example: "When you notice yourself staying calm..." (presupposes they WILL notice)
   */
  presuppositions: [
    "When you notice {behavior}...",
    "As you continue to {behavior}...",
    "The next time you find yourself {behavior}...",
    "As this becomes more natural for you...",
    "Now that you're aware of {insight}...",
  ],

  /**
   * Reframing — helps users see challenges as opportunities.
   * Research: Cognitive reframing is a core CBT technique for reducing anxiety and building resilience.
   * Example: "That discomfort you felt? That's what growth actually feels like."
   */
  reframing: [
    "That {challenge} is actually a sign that {positive_interpretation}.",
    "What feels like {negative} is often the beginning of {positive}.",
    "The fact that you noticed {observation} shows real self-awareness.",
    "This isn't a setback — it's information about what matters to you.",
    "Feeling {emotion} about this means you care deeply. That's a strength.",
  ],

  /**
   * Solution-focused language — orients users toward what's working.
   * Research: Solution-Focused Brief Therapy. Shifting from "What's wrong?" to "What's working?"
   */
  solutionFocused: [
    "What would be different if this was just a little bit better?",
    "Tell me about a time when this DID work well.",
    "On a scale of 1-10, where are you now — and what would move you one point higher?",
    "What's one small thing that's already going right?",
    "If you woke up tomorrow and this was resolved, what would you notice first?",
  ],

  /**
   * Validation patterns — acknowledging emotions before inviting change.
   * Research: Validation is the #1 predictor of therapeutic alliance (Gottman, Linehan DBT).
   */
  validation: [
    "It makes complete sense that you'd feel {emotion} about this.",
    "That's a really natural response to {situation}.",
    "Most people in your position would feel exactly the same way.",
    "There's nothing wrong with feeling {emotion} — it's telling you something important.",
    "Your feelings about this are valid and worth paying attention to.",
  ],

  /**
   * Growth mindset language — framing abilities as developable.
   * Research: Carol Dweck's growth mindset research shows that framing traits as
   * learnable (vs. fixed) significantly increases effort and resilience.
   */
  growthMindset: [
    "This is something you're building, not something you either have or don't.",
    "Every time you practice this, the neural pathways get a little stronger.",
    "You're not starting from zero — you're building on everything you've already learned.",
    "This skill develops over time, and you're exactly where you need to be right now.",
    "Progress isn't always visible day-to-day, but it compounds.",
  ],
};

// ─── Framework-Specific Techniques ─────────────────────────────────────────

/**
 * Specific techniques from each psychology framework, ready to be injected
 * into AI prompts when generating session content.
 *
 * Each technique includes:
 * - A description for the AI to understand the technique
 * - A prompt instruction for how to apply it
 * - Which session phases/contexts it's most appropriate for
 */
export interface PsychologyTechnique {
  id: string;
  framework: string;
  name: string;
  description: string;
  promptInstruction: string;
  /** Which discovery phases this technique is most appropriate for */
  bestPhases: DiscoveryPhase[];
  /** Which session step this applies to */
  appliesTo: ("learn" | "implement" | "reflect" | "insight")[];
}

export const PSYCHOLOGY_TECHNIQUES: PsychologyTechnique[] = [
  // ── CBT Techniques ──
  {
    id: "cbt-thought-record",
    framework: "CBT",
    name: "Thought Record Pattern",
    description: "Helps users notice the link between situations, thoughts, emotions, and behaviors.",
    promptInstruction: "Guide the user to notice: What happened (situation) → What you thought (automatic thought) → How you felt (emotion) → What you did (behavior). Frame it as curiosity, not analysis.",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["learn", "reflect"],
  },
  {
    id: "cbt-cognitive-reframe",
    framework: "CBT",
    name: "Cognitive Reframing",
    description: "Gently challenge unhelpful thought patterns by offering alternative perspectives.",
    promptInstruction: "After the user shares a thought pattern, offer a warm reframe: 'Another way to see this might be...' or 'What if this actually means...' Never invalidate — expand the perspective.",
    bestPhases: ["deepening", "navigating", "layers"],
    appliesTo: ["insight", "reflect"],
  },
  {
    id: "cbt-behavioral-experiment",
    framework: "CBT",
    name: "Behavioral Experiment",
    description: "Test assumptions through small, safe actions rather than just thinking about them.",
    promptInstruction: "Frame the micro-action as a gentle experiment: 'What if you tried X and just noticed what happens?' Emphasize observation over outcome.",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["implement"],
  },

  // ── NVC (Nonviolent Communication) Techniques ──
  {
    id: "nvc-ofnr",
    framework: "NVC",
    name: "Observation-Feeling-Need-Request",
    description: "The core NVC framework for expressing needs without blame or judgment.",
    promptInstruction: "Guide the user through: 'When I notice [observation without judgment], I feel [emotion], because I need [universal need]. Would you be willing to [concrete request]?' Keep it warm and conversational, not formulaic.",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["learn", "implement"],
  },
  {
    id: "nvc-empathic-listening",
    framework: "NVC",
    name: "Empathic Listening",
    description: "Listening to understand the feeling and need behind what someone is saying.",
    promptInstruction: "Frame the micro-action around listening for the emotion underneath the words: 'Today, when someone shares something, try to hear the feeling behind it before responding.'",
    bestPhases: ["deepening", "navigating"],
    appliesTo: ["implement", "reflect"],
  },

  // ── EFT (Emotionally Focused Therapy) Techniques ──
  {
    id: "eft-emotion-cycle",
    framework: "EFT",
    name: "Emotion Cycle Awareness",
    description: "Recognizing the pursue-withdraw cycle and the emotions underneath it.",
    promptInstruction: "Help the user notice their emotional cycle: 'When you feel [surface emotion], what's the deeper feeling underneath? Often anger covers hurt, and withdrawal covers fear of rejection.' Frame as self-discovery, not diagnosis.",
    bestPhases: ["deepening", "navigating", "layers"],
    appliesTo: ["learn", "insight"],
  },
  {
    id: "eft-attachment-need",
    framework: "EFT",
    name: "Attachment Need Expression",
    description: "Helping users identify and express their core attachment needs.",
    promptInstruction: "Guide toward naming the need: 'What I really need to feel safe/connected/valued is...' Normalize that everyone has attachment needs — they're not weakness, they're human.",
    bestPhases: ["deepening", "layers", "mirror"],
    appliesTo: ["learn", "reflect"],
  },

  // ── Gottman Method Techniques ──
  {
    id: "gottman-soft-startup",
    framework: "Gottman",
    name: "Soft Startup",
    description: "Starting difficult conversations gently increases the chance of resolution by 96%.",
    promptInstruction: "Teach soft startup: Start with 'I' not 'You', describe the situation neutrally, express your feeling, state a positive need. Example: 'I noticed the dishes are still in the sink. I feel overwhelmed. Could we figure out a system that works for both of us?'",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["learn", "implement"],
  },
  {
    id: "gottman-repair-attempt",
    framework: "Gottman",
    name: "Repair Attempt",
    description: "Small gestures during conflict that de-escalate tension. The #1 predictor of relationship success.",
    promptInstruction: "Suggest repair attempts: humor, physical touch, taking a break, saying 'I'm sorry, let me try that again.' Frame as: 'The goal isn't to avoid conflict — it's to repair quickly.'",
    bestPhases: ["navigating"],
    appliesTo: ["implement"],
  },
  {
    id: "gottman-positive-sentiment",
    framework: "Gottman",
    name: "Positive Sentiment Override",
    description: "Building a 5:1 ratio of positive to negative interactions.",
    promptInstruction: "Frame micro-actions around building the emotional bank account: 'Today, notice three things your partner does well and mention one of them.' Emphasize that positivity isn't about ignoring problems — it's about building a buffer.",
    bestPhases: ["rhythm", "deepening", "mirror"],
    appliesTo: ["implement", "reflect"],
  },

  // ── Attachment Theory Techniques ──
  {
    id: "attachment-safe-base",
    framework: "Attachment Theory",
    name: "Safe Base Exploration",
    description: "Understanding what makes someone feel secure enough to explore and grow.",
    promptInstruction: "Ask what makes them feel safe in relationships. Frame as: 'When you feel secure, what becomes possible for you?' Connect safety → exploration → growth.",
    bestPhases: ["rhythm", "deepening"],
    appliesTo: ["learn"],
  },
  {
    id: "attachment-protest-behavior",
    framework: "Attachment Theory",
    name: "Protest Behavior Awareness",
    description: "Recognizing anxious attachment behaviors as bids for connection.",
    promptInstruction: "Gently reframe: 'When you check your phone hoping for a reply, or feel the urge to test your partner — that's your attachment system asking for reassurance. It's not clingy, it's human.' Normalize without reinforcing.",
    bestPhases: ["deepening", "navigating"],
    appliesTo: ["insight", "reflect"],
  },

  // ── Narrative Therapy Techniques ──
  {
    id: "narrative-reauthoring",
    framework: "Narrative Therapy",
    name: "Story Re-authoring",
    description: "Helping users rewrite limiting relationship narratives with more empowering alternatives.",
    promptInstruction: "Invite the user to notice the story they tell about themselves in relationships. Then gently ask: 'Is there another version of this story? One where you're the hero, not the victim?' Use 'unique outcomes' — times the old story didn't hold true.",
    bestPhases: ["layers", "mirror"],
    appliesTo: ["learn", "reflect"],
  },
  {
    id: "narrative-externalization",
    framework: "Narrative Therapy",
    name: "Externalization",
    description: "Separating the person from the problem to reduce shame and increase agency.",
    promptInstruction: "Use externalizing language: 'When anxiety shows up in your relationship...' (not 'When you're anxious'). The problem is the problem, not the person.",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["insight", "learn"],
  },

  // ── Positive Psychology Techniques ──
  {
    id: "pospsych-gratitude-practice",
    framework: "Positive Psychology",
    name: "Targeted Gratitude",
    description: "Specific, detailed gratitude (not generic) rewires the brain's negativity bias.",
    promptInstruction: "Guide specific gratitude: Not 'I'm grateful for my partner' but 'I'm grateful for the way my partner always asks about my day with genuine curiosity.' Specificity is what creates the neurological shift.",
    bestPhases: ["rhythm", "deepening", "mirror"],
    appliesTo: ["implement", "reflect"],
  },
  {
    id: "pospsych-strengths-spotting",
    framework: "Positive Psychology",
    name: "Character Strengths Spotting",
    description: "Noticing and naming character strengths in self and partner.",
    promptInstruction: "Help users spot their own strengths: 'The fact that you [behavior] shows real [strength: courage, kindness, perseverance, etc.].' Also suggest spotting partner strengths: 'Today, notice one strength your partner shows and name it to them.'",
    bestPhases: ["rhythm", "mirror"],
    appliesTo: ["insight", "implement"],
  },

  // ── Mindfulness Techniques ──
  {
    id: "mindfulness-pause",
    framework: "Mindfulness",
    name: "Mindful Pause",
    description: "Creating space between stimulus and response to choose consciously.",
    promptInstruction: "Teach the pause: 'Before you respond, take one breath. In that breath, you create space to choose how you want to show up.' Frame as empowerment, not suppression.",
    bestPhases: ["navigating", "layers"],
    appliesTo: ["implement"],
  },
  {
    id: "mindfulness-body-awareness",
    framework: "Mindfulness",
    name: "Body-Based Emotion Awareness",
    description: "Noticing where emotions live in the body to increase emotional intelligence.",
    promptInstruction: "Guide body awareness: 'Where do you feel this emotion in your body? Chest? Stomach? Throat? Just notice it without trying to change it.' This builds the interoception needed for emotional regulation.",
    bestPhases: ["deepening", "layers"],
    appliesTo: ["learn", "reflect"],
  },
];

// ─── Session Design Psychology ──────────────────────────────────────────────

/**
 * Peak-End Rule configuration.
 * Research: Kahneman's peak-end rule shows that people judge experiences based on
 * the emotional peak and the ending, not the average.
 *
 * Application: We design sessions so that:
 * - The PEAK (micro-insight after Learn step) delivers the strongest emotional moment
 * - The END (celebration) leaves a warm, affirming feeling
 * - The beginning (greeting) sets a positive frame
 */
export const SESSION_DESIGN = {
  /** Greeting phase — sets the emotional frame */
  greeting: {
    psychology: "Priming effect. The greeting creates an emotional frame that colors the entire session.",
    duration: "3-5 seconds",
    technique: "Use the user's name + archetype-specific warmth to activate belonging and identity.",
  },

  /** Yesterday check-in — builds consistency identity */
  checkIn: {
    psychology: "Commitment-consistency principle (Cialdini). By checking in on yesterday's action, we reinforce the user's identity as someone who follows through. All responses are validated — even 'didn't try it' gets warmth.",
    duration: "15-30 seconds",
    technique: "Every response option is affirming. This prevents shame spirals and keeps the user coming back.",
  },

  /** Learn step — the educational moment */
  learn: {
    psychology: "Elaborative interrogation + self-reference effect. Questions that ask users to reflect on their own experience are processed more deeply than abstract information.",
    duration: "2-3 minutes",
    technique: "Questions feel like conversation, not assessment. MC options are designed as 'which resonates?' not 'which is correct?' Scale questions use anchoring (the labels prime the emotional range).",
  },

  /** Micro-insight — THE PEAK MOMENT */
  microInsight: {
    psychology: "Peak-end rule PEAK. This is the strongest emotional moment in the session. Combines surprise (unexpected insight) + validation (we see you) + growth (here's what this means).",
    duration: "10-20 seconds",
    technique: "Always frame insights as strengths. Never pathologize. Use presuppositional language: 'The way you [chose/described] X suggests you naturally...'",
  },

  /** Implement step — behavioral activation */
  implement: {
    psychology: "Implementation intentions (Gollwitzer). Simply deciding to do something increases follow-through by 2-3x. Giving a specific, small action removes the activation energy barrier.",
    duration: "30-60 seconds",
    technique: "Actions are micro (2-5 min), specific, and framed in the user's archetype voice. The 'swap' option preserves autonomy — autonomy support is key to intrinsic motivation (Self-Determination Theory).",
  },

  /** Celebration — THE END MOMENT */
  celebration: {
    psychology: "Peak-end rule END. The last emotional impression determines whether they come back tomorrow. Combines: identity reinforcement (archetype-specific message), progress visualization (streak), and warm closure.",
    duration: "5-10 seconds",
    technique: "Celebration is proportional — not over-the-top. Authentic warmth, not gamified hype. The streak is shown subtly, not as pressure.",
  },
};

// ─── Anchoring & Priming ──────────────────────────────────────────────────

/**
 * Priming messages shown briefly before the main question.
 * Research: Brief exposure to positive/growth-oriented concepts primes users
 * to respond more openly and constructively.
 *
 * These are shown for 2-3 seconds before the question appears.
 */
export const PHASE_PRIMING_MESSAGES: Record<DiscoveryPhase, string[]> = {
  rhythm: [
    "Today's about noticing what already works...",
    "Let's start with something that feels good...",
    "This one's about the moments that matter...",
  ],
  deepening: [
    "Let's go a little deeper today...",
    "Today's about understanding what's underneath...",
    "This one invites you to look inward...",
  ],
  navigating: [
    "Today's about building skills for the tough moments...",
    "Let's explore how you handle the real stuff...",
    "This one is about growth through challenge...",
  ],
  layers: [
    "Today's about the parts of you that matter most...",
    "Let's explore what lives beneath the surface...",
    "This one takes a bit of courage — and you have it...",
  ],
  mirror: [
    "Today's about seeing how far you've come...",
    "Let's celebrate what you've discovered...",
    "This one is about the whole picture of who you are...",
  ],
};

/**
 * Scale question anchoring labels.
 * Research: The labels on scale endpoints significantly influence responses.
 * We use labels that gently expand the user's self-concept rather than limiting it.
 *
 * Example: Instead of "Never/Always", use "Still exploring this/This comes naturally"
 * — this frames the low end as growth-in-progress, not failure.
 */
export const ANCHORING_LABELS = {
  growthOriented: ["Still growing into this", "This comes naturally to me"],
  comfortLevel: ["Just beginning to explore this", "Very comfortable with this"],
  frequency: ["Rarely, but working on it", "Often — it's part of who I am"],
  importance: ["Less central to my identity", "Core to who I am"],
  awareness: ["Just starting to notice", "Very aware of this in myself"],
};

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Get psychology techniques appropriate for the current session context.
 */
export function getTechniquesForPhase(
  phase: DiscoveryPhase,
  step: "learn" | "implement" | "reflect" | "insight"
): PsychologyTechnique[] {
  return PSYCHOLOGY_TECHNIQUES.filter(
    (t) => t.bestPhases.includes(phase) && t.appliesTo.includes(step)
  );
}

/**
 * Get the color scheme for the current discovery phase.
 */
export function getPhaseColors(phase: DiscoveryPhase): PhaseColorScheme {
  return PHASE_COLOR_SCHEMES[phase];
}

/**
 * Get a random priming message for the phase.
 */
export function getPrimingMessage(phase: DiscoveryPhase): string {
  const messages = PHASE_PRIMING_MESSAGES[phase];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Select the best technique for a given context.
 * Picks randomly from appropriate techniques to add variety.
 */
export function selectTechniqueForContext(
  phase: DiscoveryPhase,
  step: "learn" | "implement" | "reflect" | "insight",
  preferredFramework?: string
): PsychologyTechnique | null {
  let techniques = getTechniquesForPhase(phase, step);

  if (preferredFramework) {
    const preferred = techniques.filter(
      (t) => t.framework.toLowerCase() === preferredFramework.toLowerCase()
    );
    if (preferred.length > 0) {
      techniques = preferred;
    }
  }

  if (techniques.length === 0) return null;
  return techniques[Math.floor(Math.random() * techniques.length)];
}

/**
 * Build a therapeutic language snippet for AI prompts.
 * Combines a random pattern from the requested category.
 */
export function getTherapeuticPattern(
  category: keyof typeof THERAPEUTIC_LANGUAGE_PATTERNS
): string {
  const patterns = THERAPEUTIC_LANGUAGE_PATTERNS[category];
  return patterns[Math.floor(Math.random() * patterns.length)];
}
