import { Question, WeekendActivity } from "@/types/quiz";

// ---------------------------------------------------------------------------
// FREE TIER — 10 questions (Mon–Fri, AM + PM)
//
// Design: Positive Psychology–led, self-reflective, approachable.
// No attachment-style knowledge required. Genuinely valuable on their own.
// They open the door — premium questions go through it.
// ---------------------------------------------------------------------------

const freeQuestions: Question[] = [
  // MONDAY
  {
    id: 101,
    tier: "free",
    category: "What's Going Well",
    text: "Think about your relationship right now. What's one thing that's actually working — even something small? What does it tell you about what you and your partner do well together?",
    timeSlot: "AM",
    dayOfWeek: "MON",
    intimacyLevel: 1,
    modality: "Positive Psychology",
    therapeuticIntent: "Gratitude + attribution of agency — noticing the positive and owning a role in it",
    explanation: "Couples who regularly notice what's going well show 25% higher satisfaction than those who only focus on what needs to improve.",
  },
  {
    id: 102,
    tier: "free",
    category: "Today's Small Win",
    text: "What's one small thing you did today — or could do before the day ends — that felt like a good relationship move? It doesn't have to be big. Just something kind, honest, or present.",
    timeSlot: "PM",
    dayOfWeek: "MON",
    intimacyLevel: 1,
    modality: "Positive Psychology",
    therapeuticIntent: "Agency reinforcement — building identity as an active shaper of the relationship",
    explanation: "Noticing the small things you do right makes you more likely to keep doing them. Your brain follows the story you tell about yourself.",
  },

  // TUESDAY
  {
    id: 103,
    tier: "free",
    category: "When You're at Your Best",
    text: "When you and your partner are at their best together — what does that actually look like? What are you both doing, and how does it feel to be around each other in those moments?",
    timeSlot: "AM",
    dayOfWeek: "TUE",
    intimacyLevel: 2,
    modality: "Positive Psychology",
    therapeuticIntent: "Best possible self / valued direction (Positive Psychology + ACT) — orienting toward what's possible, not what's broken",
    explanation: "Describing your best moments in detail creates a mental target your brain will start to move toward — even when things get hard.",
  },
  {
    id: 104,
    tier: "free",
    category: "You as a Partner",
    text: "What's one thing you genuinely like about yourself as a partner? Not what you're perfect at — what's something you bring to your relationship that you're quietly proud of?",
    timeSlot: "PM",
    dayOfWeek: "TUE",
    intimacyLevel: 2,
    modality: "Positive Psychology",
    therapeuticIntent: "Self-compassion + strengths awareness — building secure self-concept as foundation for secure relating",
    explanation: "Partners who can identify their own strengths show up with more security and less defensiveness. Knowing what you bring in lets you give it more intentionally.",
  },

  // WEDNESDAY
  {
    id: 105,
    tier: "free",
    category: "After a Disagreement",
    text: "What usually happens for you in the first few minutes after a disagreement — not during it, after it? Do you tend to replay it, pull away, reach out, or something else?",
    timeSlot: "AM",
    dayOfWeek: "WED",
    intimacyLevel: 2,
    modality: "Mindfulness",
    therapeuticIntent: "Post-conflict self-awareness — understanding personal recovery pattern without judgment",
    explanation: "How you handle the minutes after a conflict matters as much as the conflict itself. Noticing your pattern is the first step toward choosing it.",
  },
  {
    id: 106,
    tier: "free",
    category: "A Moment of Connection",
    text: "Think of a recent moment when you felt genuinely close to your partner — even briefly. What was happening? What made it feel like connection and not just being in the same room?",
    timeSlot: "PM",
    dayOfWeek: "WED",
    intimacyLevel: 3,
    modality: "Gottman Method",
    therapeuticIntent: "Fondness and admiration — noticing and naming moments of genuine connection",
    explanation: "Couples who can describe their connection moments in detail are better at creating more of them. Naming what works makes it repeatable.",
  },

  // THURSDAY
  {
    id: 107,
    tier: "free",
    category: "Unspoken Gratitude",
    text: "What's one thing your partner does — regularly or occasionally — that you appreciate but have probably never said out loud? What would it mean to them to hear it?",
    timeSlot: "AM",
    dayOfWeek: "THU",
    intimacyLevel: 2,
    modality: "Positive Psychology",
    therapeuticIntent: "Gratitude expression — converting private appreciation into relational fuel",
    explanation: "Unexpressed appreciation quietly disappears. Research shows couples who say it out loud — even imperfectly — feel closer within 24 hours.",
  },
  {
    id: 108,
    tier: "free",
    category: "Stress and Your Relationship",
    text: "When you're stressed or overwhelmed, how does it tend to show up between you and your partner? Do you pull closer, pull away, or something else — and does your partner usually know what you need?",
    timeSlot: "PM",
    dayOfWeek: "THU",
    intimacyLevel: 3,
    modality: "Attachment Theory",
    therapeuticIntent: "Stress-response self-awareness — beginning to map the link between personal stress and relationship behavior",
    explanation: "Most relationship friction isn't about the relationship — it's stress from outside spilling in. Knowing your pattern helps you catch it before it lands on your partner.",
  },

  // FRIDAY
  {
    id: 109,
    tier: "free",
    category: "One Thing to Build",
    text: "What's one small habit you want to build as a partner — something specific and doable this week? Not a resolution. Just one thing, done once, that would feel like the kind of partner you're becoming.",
    timeSlot: "AM",
    dayOfWeek: "FRI",
    intimacyLevel: 2,
    modality: "Positive Psychology",
    therapeuticIntent: "Values-based micro-commitment — identity reinforcement through action, not aspiration",
    explanation: "When we name a small, specific action, we're 3x more likely to follow through than when we set a broad intention. One real move is worth ten plans.",
  },
  {
    id: 110,
    tier: "free",
    category: "End of Week Reflection",
    text: "Looking back at this week with your partner: what's one moment you want to carry forward? It can be something good you want more of, or something you'd do differently — what did you learn?",
    timeSlot: "PM",
    dayOfWeek: "FRI",
    intimacyLevel: 3,
    modality: "Positive Psychology",
    therapeuticIntent: "Weekly integration — consolidating learning and reinforcing growth narrative",
    explanation: "Ending the week with a deliberate reflection — not just moving on — is how insight converts into lasting change.",
  },
];

// ---------------------------------------------------------------------------
// PREMIUM TIER — 10 questions (Mon–Fri, AM + PM)
//
// Design: Therapeutically precise. Each question draws from a specific
// modality with a named clinical intent. Behaviorally anchored — they ask
// about a specific recent moment, not abstract concepts. These are the
// questions Paired cannot write because they don't have the framework.
// ---------------------------------------------------------------------------

const premiumQuestions: Question[] = [
  // MONDAY
  {
    id: 201,
    tier: "premium",
    category: "Bids for Connection",
    text: "Think about the last time your partner reached out to you — a comment, a look, a question, a touch, even a small bid for your attention. How did you respond in that moment? Did you turn toward it, or did something pull you away?",
    timeSlot: "AM",
    dayOfWeek: "MON",
    intimacyLevel: 2,
    modality: "Gottman Method",
    therapeuticIntent: "Bid recognition — building awareness of daily micro-moments of connection and how you respond to them",
    explanation: "Gottman research found that couples who turn toward each other's bids 86% of the time are still together after 6 years. Couples who turn toward only 33% of the time are not. Learning to notice bids is where it starts.",
  },
  {
    id: 202,
    tier: "premium",
    category: "What You Were Really Asking For",
    text: "Think about your last real disagreement. Behind the surface frustration — what were you actually asking for? Not what you wanted your partner to do differently. What did you need to feel from them — that you matter, that you're safe, that they're still there?",
    timeSlot: "PM",
    dayOfWeek: "MON",
    intimacyLevel: 3,
    modality: "Emotional Focused Therapy",
    therapeuticIntent: "Attachment need identification — accessing the primary emotion beneath the secondary complaint",
    explanation: "Most arguments aren't really about the dishes or the schedule. Underneath almost every relationship fight is a deeper question: am I important to you? When you can name the real need, the whole conversation shifts.",
  },

  // TUESDAY
  {
    id: 203,
    tier: "premium",
    category: "Your Pattern in Conflict",
    text: "When tension rises between you and your partner, do you tend to move closer — push to talk it out right away — or step back and need space before you can engage? What do you think happens for your partner when you do that?",
    timeSlot: "AM",
    dayOfWeek: "TUE",
    intimacyLevel: 3,
    modality: "Emotional Focused Therapy",
    therapeuticIntent: "Pursue-withdraw cycle awareness — each partner seeing their role in the pattern without blame",
    explanation: "Most couples have a pursue-withdraw dynamic in conflict — one person pushes for connection, one pulls back for space. Neither is wrong. But when both people can name their move, the pattern loses its grip.",
  },
  {
    id: 204,
    tier: "premium",
    category: "The Part That Showed Up",
    text: "Think about a recent moment when you reacted more strongly than the situation seemed to call for — got defensive, went quiet, felt something spike. What part of you showed up in that moment? What was that reaction actually trying to protect?",
    timeSlot: "PM",
    dayOfWeek: "TUE",
    intimacyLevel: 3,
    modality: "CBT",
    therapeuticIntent: "Reactive parts awareness — recognizing the protective function of emotional reactivity without being controlled by it",
    explanation: "When we react strongly, it's rarely about the moment itself. Something older is usually driving it. Asking 'what is this protecting?' turns a reactive moment into a window.",
  },

  // WEDNESDAY
  {
    id: 205,
    tier: "premium",
    category: "Holding a Thought at Arm's Length",
    text: "Notice a thought you keep having about your partner — something like 'they don't really get me' or 'they always put this last.' Now try adding 'I'm having the thought that...' in front of it. What happens to the thought when you hold it that way instead of living inside it?",
    timeSlot: "AM",
    dayOfWeek: "WED",
    intimacyLevel: 3,
    modality: "CBT",
    therapeuticIntent: "Cognitive defusion — creating psychological distance from sticky thoughts that drive reactive behavior",
    explanation: "We treat our thoughts as facts. The moment you notice 'I'm having the thought that they don't care' instead of 'they don't care,' you create space between the thought and your response — and in that space, choice lives.",
  },
  {
    id: 206,
    tier: "premium",
    category: "Observation, Feeling, Need",
    text: "Think of something your partner does that bothers you. Without judging it, describe just the facts — what literally happens, without interpretation. Then name the feeling underneath the frustration. Then go one layer deeper: what do you actually need in those moments?",
    timeSlot: "PM",
    dayOfWeek: "WED",
    intimacyLevel: 3,
    modality: "Nonviolent Communication",
    therapeuticIntent: "Separating observation from judgment, then accessing the underlying need — the full NVC sequence",
    explanation: "Most arguments are about strategies (what you want your partner to DO) rather than needs (what you actually NEED). When you can name the need, you have more options — not just the one your partner isn't providing.",
  },

  // THURSDAY
  {
    id: 207,
    tier: "premium",
    category: "Repair Attempts",
    text: "In your most recent disagreement, was there a moment — maybe small, easy to miss — where one of you tried to soften things? A different tone, a small touch, a joke, an apology that didn't quite land. What happened after that attempt?",
    timeSlot: "AM",
    dayOfWeek: "THU",
    intimacyLevel: 4,
    modality: "Gottman Method",
    therapeuticIntent: "Repair attempt recognition — building awareness of de-escalation bids during conflict",
    explanation: "The ability to repair after conflict is the #1 predictor of relationship health — more important than how often you fight or what you fight about. Most couples already make repair attempts. Learning to notice them is the skill.",
  },
  {
    id: 208,
    tier: "premium",
    category: "The Direction You're Growing Toward",
    text: "What kind of partner do you want to be — not perfect, just the direction you're moving toward? Now think about this week: was there one moment where you acted like that person, even briefly? What did that feel like from the inside?",
    timeSlot: "PM",
    dayOfWeek: "THU",
    intimacyLevel: 3,
    modality: "Attachment Theory",
    therapeuticIntent: "Values clarification + behavioral evidence — connecting identity aspiration to real actions already taken",
    explanation: "People who connect daily actions to personal values sustain change 3x longer than those following rules. Finding even one moment where you already lived your values tells your brain: this is who I am.",
  },

  // FRIDAY
  {
    id: 209,
    tier: "premium",
    category: "Naming the Pattern",
    text: "If you could name the repeating pattern between you and your partner during conflict — without blaming either person — what would you call it? Something like 'the spiral,' or 'the shutdown and pursuit.' When does it usually start? What's the first move?",
    timeSlot: "AM",
    dayOfWeek: "FRI",
    intimacyLevel: 4,
    modality: "Emotional Focused Therapy",
    therapeuticIntent: "Cycle externalization — making the pattern the problem, not the person",
    explanation: "When couples can see their conflict as a shared pattern — something that happens TO them both — blame drops and empathy rises. You can't fight the cycle while you're inside it as enemies. You fight it together.",
  },
  {
    id: 210,
    tier: "premium",
    category: "The Exception to the Story",
    text: "You might carry a quiet story about yourself as a partner — 'I always shut down,' 'I'm the one who has to push,' 'I'm not good at this.' Can you find one moment this week that doesn't fit that story? What does that exception tell you about who you're actually becoming?",
    timeSlot: "PM",
    dayOfWeek: "FRI",
    intimacyLevel: 4,
    modality: "Narrative Therapy",
    therapeuticIntent: "Unique outcomes — finding counter-narrative evidence that undermines the limiting self-story",
    explanation: "The stories we carry about ourselves filter what we notice. Finding one moment that contradicts the old story isn't denial — it's evidence. Evidence that you're already more than you think.",
  },
];

// All questions combined
export const weekdayQuestions: Question[] = [...freeQuestions, ...premiumQuestions];

// Returns the right question set for the user's tier
export function getQuestionsForTier(tier: "free" | "premium"): Question[] {
  // Premium users get the premium question bank
  // Free users get the free question bank
  return weekdayQuestions.filter((q) => q.tier === (tier === "premium" ? "premium" : "free"));
}

// ---------------------------------------------------------------------------
// WEEKEND ACTIVITIES — tiered
// ---------------------------------------------------------------------------

export const weekendActivities: WeekendActivity[] = [
  {
    id: 1,
    tier: "free",
    title: "The Appreciation Round",
    description:
      "Set a timer for 10 minutes. Take turns finishing this sentence: 'One thing I appreciate about you that I don't say enough is...' The only rule: the listener just receives it — no deflecting, no minimizing, no 'oh, you too.' Just let it land.",
    category: "Connection",
    modality: "Positive Psychology",
    explanation:
      "Unexpressed appreciation quietly disappears from relationships. This exercise creates a safe space to say the things that usually stay internal — and research shows even one session like this increases felt closeness for days.",
  },
  {
    id: 2,
    tier: "premium",
    title: "Name the Cycle Together",
    description:
      "Together, try to describe your most common conflict pattern as if you're both outside it, watching two other people. Give it a name. Describe what each person does. Then ask: 'What do you think each person in this pattern is actually afraid of?' The goal isn't to solve it — just to see it together without blame.",
    category: "Depth",
    modality: "Emotional Focused Therapy",
    explanation:
      "When couples externalize their cycle — treating it as something that happens TO them, not something one person does TO the other — they stop being enemies and start being teammates. Naming it together is the first move.",
  },
];
