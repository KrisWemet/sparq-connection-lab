import JourneyTemplate from "./journey-template";
import {
  Scale,
  MessageSquare,
  Heart,
  Eye,
  Shield,
  Users,
  Brain,
  Compass,
  HandHeart,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Lightbulb,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function PowerDynamicsJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "recognizing-power",
          title: "Recognizing Power in Your Relationship",
          description: "Seeing the often-invisible ways power flows between you and your partner in daily life",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Who decides where to eat? Who manages the calendar? Who initiates sex? Who has the final word on finances? Power isn't always dramatic — it often lives in small, daily decisions. Noticing these patterns is the first step to choosing them consciously.",
        },
        {
          id: "types-of-power",
          title: "Understanding Types of Power",
          description: "Recognizing that power operates through money, emotion, information, sex, social connections, and more",
          icon: <Scale className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "One partner may earn more (financial power) while the other manages the social calendar (social power). One may be more emotionally expressive (emotional power) while the other controls information flow (informational power). Power is rarely one-directional.",
        },
        {
          id: "emotional-labor",
          title: "The Invisible Load: Emotional Labor",
          description: "Recognizing the unseen work of managing the household, family, and relationship emotional needs",
          icon: <Brain className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Remembering birthdays, scheduling appointments, noticing when the soap needs replacing, mediating family dynamics, managing the children's social lives. This invisible labor is a massive source of power imbalance in many relationships.",
        },
        {
          id: "demand-withdraw",
          title: "The Demand-Withdraw Pattern",
          description: "Understanding the power dynamic hidden in who pursues and who retreats during conflict",
          icon: <ArrowRightLeft className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "One partner demands attention or resolution; the other withdraws. The pursuer feels powerless ('They won't engage'); the withdrawer feels powerless ('They won't stop'). Both experience a lack of power — understanding this breaks the cycle.",
        },
        {
          id: "cultural-influences",
          title: "Cultural Power Scripts",
          description: "Recognizing how gender roles, cultural norms, and family patterns shape power expectations",
          icon: <Users className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Growing up seeing one parent make all financial decisions while the other deferred. Cultural messages about who should be 'in charge.' Gender expectations about emotional expression. These scripts run silently until you examine them.",
        },
        {
          id: "consent-as-power-sharing",
          title: "Consent as Power Sharing",
          description: "Understanding that genuine consent is the foundation of equitable power in all areas of relationship",
          icon: <Lock className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Consent isn't just about sex. It's about decisions: 'Are we both genuinely okay with this plan, or did one of us just give in?' Checking for real agreement rather than compliance is how power stays balanced.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "power-conversations",
          title: "Having Power Conversations",
          description: "Learning to talk about power directly without it becoming an accusation or a fight",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Using curious, non-blaming language: 'I've been noticing that I usually defer to you on financial decisions. I don't think that's intentional from either of us, but I'd like us to make those choices more equally. What do you think?'",
        },
        {
          id: "redistributing-labor",
          title: "Redistributing Invisible Labor",
          description: "Creating fair systems for sharing the mental and emotional load of running a life together",
          icon: <Scale className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Making the invisible visible: listing every task (mental, emotional, logistical) and jointly deciding who owns what. Not splitting 50/50 necessarily, but creating a system both partners feel is fair and sustainable. Reviewing monthly.",
        },
        {
          id: "using-power-well",
          title: "Using Power Responsibly",
          description: "When you hold more power in some area, using it to uplift your partner rather than maintain advantage",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The higher-earning partner proactively ensuring the other has equal voice in financial decisions. The more socially confident partner creating space for the quieter one. Responsible power use means actively working against your own advantage.",
        },
        {
          id: "reclaiming-voice",
          title: "Reclaiming Your Voice",
          description: "For the partner who tends to defer — learning to express opinions, needs, and disagreements directly",
          icon: <Compass className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Practicing 'I want' and 'I don't want' statements: 'I want to spend the holiday differently this year.' 'I don't want to take that on right now.' Starting small and building toward bigger assertions. Voice reclamation is a muscle that strengthens with use.",
        },
        {
          id: "making-space",
          title: "Making Space for Your Partner",
          description: "For the partner who tends to dominate — learning to pause, ask, and truly defer",
          icon: <Shield className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of stating your preference first (which often becomes the default), asking 'What do you think?' and sitting with silence while they formulate their answer. Not offering your opinion until they've fully expressed theirs.",
        },
        {
          id: "decision-making-models",
          title: "Shared Decision-Making Models",
          description: "Creating explicit systems for how you make decisions together — big and small",
          icon: <Lightbulb className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Establishing categories: Individual decisions (each partner has full autonomy), consultation decisions (one decides after hearing the other), and joint decisions (both must agree). This framework prevents both over-control and under-involvement.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "conscious-power-flow",
          title: "Conscious Power Flow",
          description: "Letting power shift naturally between partners depending on context, strength, and situation",
          icon: <ArrowRightLeft className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "In a healthy relationship, power flows like water — one partner leads on finances because they're skilled there; the other leads on social planning. During a health crisis, the well partner takes more. Fluidity, not rigidity, is the goal.",
        },
        {
          id: "power-in-intimacy",
          title: "Power Dynamics in Intimacy",
          description: "Consciously navigating who leads, who follows, and how power plays out in physical connection",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Noticing who always initiates, who decides the pace, who ends. Experimenting with conscious role shifts: the partner who usually leads learns to receive; the one who usually follows learns to direct. This requires trust and explicit communication.",
        },
        {
          id: "equitable-partnership",
          title: "Building an Equitable Partnership",
          description: "Creating a relationship where both partners feel they have genuine voice, choice, and agency",
          icon: <Scale className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Equity isn't identical roles — it's both partners feeling that the arrangement is fair. Regular check-ins: 'Do you feel heard in our relationship? Is there an area where you feel you have too much or too little say?' Equity is an ongoing conversation, not a fixed state.",
        },
        {
          id: "power-under-stress",
          title: "Power Dynamics Under Stress",
          description: "Maintaining equitable patterns when life gets hard and old defaults want to return",
          icon: <Shield className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "During a crisis, one partner may naturally take over. This can be helpful temporarily — but recognizing when crisis mode has become the permanent mode. Checking in: 'We've been in survival mode for a while. Are we still sharing power, or has one of us been carrying everything?'",
        },
        {
          id: "modeling-equity",
          title: "Modeling Equity for Others",
          description: "Recognizing that your equitable relationship becomes a model for your children, friends, and community",
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Your children watch how you make decisions together, divide labor, and handle disagreements about power. Without a single lecture, they're absorbing what an equitable relationship looks like. This is one of the most powerful gifts you can give the next generation.",
        },
        {
          id: "power-as-generativity",
          title: "Power as Generativity",
          description: "Using shared power to create something greater than either partner could alone",
          icon: <Users className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "When power is shared consciously, the relationship becomes a creative force. Joint projects, shared visions, co-created rituals. Two people who trust each other's power aren't diminished by sharing it — they're amplified.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="power-dynamics"
      title="Power Dynamics & Play"
      description="Understand and consciously navigate power dynamics in your relationship. Progress from pattern recognition to creating genuine equity."
      tiers={tiers}
    />
  );
}
