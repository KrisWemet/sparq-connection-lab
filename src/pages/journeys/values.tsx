import JourneyTemplate from "./journey-template";
import {
  Compass,
  Target,
  Users,
  Heart,
  Scale,
  Handshake,
  AlertTriangle,
  Fingerprint,
  TreePine,
  Telescope,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Crown,
  BookOpen,
  Flame,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function ValuesJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "core-values-discovery",
          title: "Discovering Your Core Values",
          description: "Identifying the 5-7 principles that truly guide your life, beyond what you think you 'should' value",
          icon: <Compass className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Using a values card sort exercise, you each privately rank what matters most — then compare. One partner discovers 'creativity' ranks higher than 'security,' which explains why they resist rigid routines. The surprise is in what you assumed versus what's actually true.",
        },
        {
          id: "value-origins",
          title: "Where Your Values Come From",
          description: "Tracing how family, culture, and pivotal life experiences shaped what you hold dear",
          icon: <TreePine className="w-5 h-5 text-amber-600" />,
          color: "amber",
          example: "Through narrative exploration, you discover the stories behind your values. A partner who fiercely values independence may trace it to watching a parent lose themselves in a relationship. Understanding the origin story transforms a conflict point into compassion.",
        },
        {
          id: "values-vs-goals",
          title: "Values Are Not Goals",
          description: "Learning the crucial difference between a direction you walk (value) and a destination you reach (goal)",
          icon: <Target className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "'Buy a house' is a goal. 'Creating security and belonging' is the value beneath it. When couples fight about goals, they're often in violent agreement about values. Values are like compass directions — you never 'arrive' at west.",
        },
        {
          id: "lived-values-audit",
          title: "The Lived Values Audit",
          description: "Honestly examining whether your daily life reflects what you say matters most",
          icon: <Fingerprint className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "You track how you spend your time, energy, and money for a week, then compare it to your stated values. Someone who says 'family' is their top value but works 70 hours a week faces a powerful moment of truth. This isn't guilt — it's awareness.",
        },
        {
          id: "partner-value-exploration",
          title: "Exploring Your Partner's Values",
          description: "Moving beyond assumptions to genuinely understand what drives your partner's choices",
          icon: <Users className="w-5 h-5 text-teal-500" />,
          color: "teal",
          example: "You interview each other about peak moments — times you felt most alive and fulfilled. Your partner's eyes light up describing a spontaneous road trip, and you realize 'adventure' isn't frivolous to them — it's essential.",
        },
        {
          id: "finding-alignment",
          title: "Finding Natural Alignment",
          description: "Discovering the shared values that already form the invisible foundation of your relationship",
          icon: <Handshake className="w-5 h-5 text-green-500" />,
          color: "green",
          example: "Couples often share 60-80% of their core values without realizing it. By mapping values side by side, you discover that 'loyalty' and 'commitment' are both present, just expressed differently. Same value, different language.",
        },
        {
          id: "recognizing-tensions",
          title: "Recognizing Value Tensions",
          description: "Naming the places where your values genuinely diverge — without making either person wrong",
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "One partner values spontaneity; the other values planning. Rather than framing this as a flaw to fix, you ask: 'What does it say about our relationship that it can hold both of these?' Tension becomes richness.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "navigating-value-conflicts",
          title: "Navigating Value Conflicts",
          description: "Practical frameworks for when your values pull you in opposite directions on a real decision",
          icon: <Scale className="w-5 h-5 text-amber-600" />,
          color: "amber",
          example: "A job offer in another city activates one partner's value of 'growth' and the other's value of 'community.' Instead of debating who's right, you ask: 'What am I willing to be uncomfortable about so we can honor both values?'",
        },
        {
          id: "values-based-decisions",
          title: "Values-Based Decision Making",
          description: "Using your shared values as a compass for choices big and small",
          icon: <Compass className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Before making significant decisions, you ask: 'Which choice moves us closer to what we both value?' A couple who values 'presence' might decline a promotion that requires heavy travel — not because it's wrong, but because it doesn't align.",
        },
        {
          id: "living-values-daily",
          title: "Living Values in the Ordinary",
          description: "Translating abstract values into concrete daily behaviors your partner can see and feel",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "If you value 'connection,' what does that look like on a Tuesday evening? Maybe it's phones away during dinner, asking a real question, or 10 minutes of undistracted conversation before sleep. Small, repeatable behaviors that embody your values.",
        },
        {
          id: "shared-rituals",
          title: "Creating Rituals from Values",
          description: "Designing recurring practices that celebrate and reinforce what matters most to you both",
          icon: <Sparkles className="w-5 h-5 text-pink-500" />,
          color: "pink",
          example: "A couple who values 'adventure' creates a monthly mystery date. A couple who values 'gratitude' starts a Sunday evening practice of sharing three things they appreciated that week. Rituals are values made tangible.",
        },
        {
          id: "values-conversations",
          title: "Having Values Conversations",
          description: "Learning to talk about what matters without it becoming a lecture, argument, or guilt trip",
          icon: <MessageSquare className="w-5 h-5 text-violet-500" />,
          color: "violet",
          example: "Instead of 'You don't value family,' trying 'It feels like busyness has been pulling us away from the family time we both want.' The value isn't weaponized — it's a shared aspiration you're both reaching toward.",
        },
        {
          id: "flexibility-vs-nonnegotiables",
          title: "Flexibility vs. Non-Negotiables",
          description: "Distinguishing between values you can express flexibly and boundaries that protect your integrity",
          icon: <ShieldCheck className="w-5 h-5 text-slate-600" />,
          color: "slate",
          example: "'Honesty' is non-negotiable, but radical transparency about every passing thought isn't the only way to live it. The question becomes: 'Is this a core value I need to protect, or a preferred strategy I can adapt?'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "co-creating-vision",
          title: "Co-Creating a Relationship Vision",
          description: "Building a vivid, compelling picture of the future you're actively choosing together",
          icon: <Telescope className="w-5 h-5 text-blue-600" />,
          color: "blue",
          example: "You each write a detailed description of your ideal shared life in 5 years — not just circumstances, but how you feel, how you treat each other, what a typical day looks like. The overlaps become your shared vision. The differences become conversations.",
        },
        {
          id: "values-life-design",
          title: "Values-Based Life Design",
          description: "Structuring your finances, time, home, and social life to genuinely reflect your shared values",
          icon: <Fingerprint className="w-5 h-5 text-cyan-500" />,
          color: "cyan",
          example: "You audit your life — budget, calendar, home environment, friendships — against your shared values. A couple who values 'creativity' but spends every evening watching TV recognizes the gap and redesigns their evenings.",
        },
        {
          id: "evolving-values",
          title: "Evolving Values Together",
          description: "Embracing that values shift across life stages and learning to grow alongside each other",
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          color: "green",
          example: "The values that brought you together at 25 may not be identical at 40. A couple who once centered on 'achievement' finds 'peace' and 'meaning' rising after becoming parents. An annual values check-in lets you evolve together rather than growing apart.",
        },
        {
          id: "legacy-meaning",
          title: "Legacy and Meaning-Making",
          description: "Exploring the lasting impact your relationship creates — for each other, your family, and your world",
          icon: <BookOpen className="w-5 h-5 text-amber-700" />,
          color: "amber",
          example: "You ask: 'What will our relationship have contributed when we look back in 30 years?' A couple realizes their legacy isn't the house or career, but the model of love they're giving their children.",
        },
        {
          id: "values-under-pressure",
          title: "Values Under Pressure",
          description: "Maintaining alignment with your values during crisis, grief, stress, and life's hardest moments",
          icon: <Flame className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "During a health crisis, a partner who values 'patience' catches themselves snapping — and instead of shame, practices self-compassion and recommits. Couples develop shared language: 'I'm off my values right now and I need help getting back.'",
        },
        {
          id: "values-aligned-partners",
          title: "Becoming Values-Aligned Partners",
          description: "The ongoing practice of being partners who call each other toward your best selves",
          icon: <Crown className="w-5 h-5 text-yellow-600" />,
          color: "yellow",
          example: "Values-aligned partnership means gentle accountability. When one partner drifts from what they care about, the other notices and says, 'I know connection matters to you — how can I help you get back to that?' Partners sculpting each other toward who they truly want to be.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="values"
      title="Values & Vision Alignment"
      description="Discover your core values and build a shared vision for your relationship. Progress from self-discovery to co-creating your future."
      tiers={tiers}
    />
  );
}
