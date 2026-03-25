import JourneyTemplate from "./journey-template";
import {
  Shield,
  AlertTriangle,
  Thermometer,
  Heart,
  RotateCcw,
  Pause,
  Brain,
  MessageSquare,
  Eye,
  HandHeart,
  Waypoints,
  Sparkles,
  Scale,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function ConflictResolutionJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "conflict-patterns",
          title: "Recognizing Conflict Patterns",
          description: "Identifying the recurring cycles you and your partner fall into during disagreements",
          icon: <Waypoints className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Noticing that most of your arguments follow the same script: one partner raises a concern, the other gets defensive, the first escalates, and both withdraw. Seeing the pattern is the first step to interrupting it.",
        },
        {
          id: "triggers",
          title: "Understanding Triggers",
          description: "Recognizing what activates your fight-or-flight response during disagreements",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Realizing that when your partner says 'you always...' you immediately shut down — not because of this argument, but because it echoes criticism from your childhood. The trigger isn't your partner; it's the echo.",
        },
        {
          id: "flooding",
          title: "Emotional Flooding",
          description: "Recognizing when your nervous system is overwhelmed and you can no longer think clearly",
          icon: <Thermometer className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "Your heart is pounding, your thoughts are racing, and everything your partner says sounds like an attack. This is flooding — your body has entered survival mode. Gottman research shows nothing productive happens once your heart rate exceeds 100 BPM.",
        },
        {
          id: "four-horsemen",
          title: "The Four Horsemen",
          description: "Recognizing criticism, contempt, defensiveness, and stonewalling before they erode connection",
          icon: <Shield className="w-5 h-5 text-slate-500" />,
          color: "slate",
          example: "Catching yourself rolling your eyes (contempt) or responding to a complaint with 'well, you do it too' (defensiveness). Gottman's research shows these four behaviors predict relationship failure with 93% accuracy — but only if left unchecked.",
        },
        {
          id: "repair-attempts",
          title: "Basic Repair Attempts",
          description: "Making small gestures during conflict that signal 'we're still on the same team'",
          icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "In the middle of a heated exchange, one partner says 'Wait, I don't want to fight. I love you and I want to figure this out together.' The repair attempt doesn't solve the problem — it keeps the relationship safe while you work on the problem.",
        },
        {
          id: "taking-breaks",
          title: "Taking Effective Breaks",
          description: "Learning to pause a conflict productively without abandoning your partner",
          icon: <Pause className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Instead of storming out, saying 'I'm getting flooded and I need 20 minutes to calm my nervous system. I'm not leaving this conversation — I'm taking care of myself so I can show up better. I'll come back at 8:30.'",
        },
        {
          id: "listening-in-conflict",
          title: "Listening During Disagreements",
          description: "Hearing your partner's perspective even when your body wants to defend or attack",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Your partner is upset about something you did. Instead of explaining or defending, you say 'Tell me more about how that affected you.' You listen not to respond, but to understand.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "soft-startup",
          title: "Soft Startup",
          description: "Beginning difficult conversations gently so your partner can hear you without becoming defensive",
          icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of 'You never help with the kids,' using Gottman's soft startup formula: 'I feel overwhelmed when I'm handling bedtime alone. I need us to share that responsibility. Could we talk about a plan?'",
        },
        {
          id: "antidotes",
          title: "Antidotes to the Four Horsemen",
          description: "Replacing destructive patterns with their research-backed counterparts",
          icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Catching yourself about to say 'You're so selfish' (criticism) and converting it to 'I felt hurt when my birthday wasn't acknowledged' (complaint about a specific behavior). The antidote isn't suppressing — it's translating.",
        },
        {
          id: "gridlocked-problems",
          title: "Managing Gridlocked Problems",
          description: "Navigating the perpetual problems that never fully resolve because they reflect fundamental differences",
          icon: <Waypoints className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Gottman found that 69% of couple conflicts are perpetual. The introvert-extrovert tension, different spending philosophies, different parenting styles. The goal shifts from resolution to dialogue: 'How do we live with this difference with humor and grace?'",
        },
        {
          id: "turning-toward",
          title: "Turning Toward During Conflict",
          description: "Choosing connection over self-protection in the heat of the moment",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Your partner says something hurtful. Everything in you wants to shut down. Instead, you take a breath and say 'That really stung. I know you're upset, but I need you to say that differently.'",
        },
        {
          id: "meta-conflict",
          title: "Talking About How You Fight",
          description: "Having calm conversations about your conflict patterns when you're not in conflict",
          icon: <Brain className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "On a peaceful Sunday morning, saying 'I've noticed that when we argue about money, we both get really activated. What if we set some ground rules for those conversations — like sitting side by side and using a timer?'",
        },
        {
          id: "repair-under-pressure",
          title: "Repair Under Pressure",
          description: "Making and accepting repair attempts during the most heated moments",
          icon: <RotateCcw className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Mid-argument, your partner reaches for your hand. Your instinct is to pull away, but you let them hold it. The ability to repair in real-time is the strongest predictor of relationship success.",
        },
        {
          id: "underneath-the-fight",
          title: "The Fight Underneath the Fight",
          description: "Identifying the deeper attachment needs driving surface-level disagreements",
          icon: <Eye className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "The argument about dirty dishes isn't about dishes. It's about feeling unseen. EFT teaches that most conflicts are really about: 'Do you see me? Am I important to you? Can I count on you?'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "generative-conflict",
          title: "Generative Conflict",
          description: "Using disagreement as a catalyst for deeper understanding and creative solutions",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "A disagreement about vacation planning becomes an honest conversation about what 'rest' means to each of you. The conflict generates a new understanding that neither partner had before — and a plan that honors both.",
        },
        {
          id: "conflict-as-intimacy",
          title: "Conflict as Intimacy Builder",
          description: "Understanding that well-navigated conflict deepens trust and connection",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "After a difficult but respectful argument about parenting, one partner says 'That was hard, but I feel closer to you now. I know we can disagree without losing each other.' Conflict handled well becomes proof of safety.",
        },
        {
          id: "custom-repair-rituals",
          title: "Creating Your Repair Rituals",
          description: "Developing personalized ways to reconnect after disagreements that reflect who you are as a couple",
          icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "One couple's repair ritual: after any argument, they sit on the porch together and one person says 'Tell me what I missed.' Another couple takes a walk. The ritual matters less than the consistency.",
        },
        {
          id: "perpetual-with-grace",
          title: "Dancing with Perpetual Problems",
          description: "Navigating your unresolvable differences with humor, acceptance, and genuine affection",
          icon: <Scale className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "After 15 years, you can laugh about the thermostat wars. 'Here we are again — the great temperature debate continues.' Gottman calls this 'dialogue with the perpetual problem.' Masters turn gridlock into an inside joke.",
        },
        {
          id: "teaching-repair",
          title: "Teaching Repair to Each Other",
          description: "Helping your partner learn what repair looks like for you, and learning what it looks like for them",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Saying 'When we're in conflict, the thing that helps me most is when you touch my arm and say something gentle. What helps you?' — and then actually doing it next time.",
        },
        {
          id: "conflict-resilience",
          title: "Conflict Resilience",
          description: "Building the capacity to recover faster and more completely after disagreements",
          icon: <Compass className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Early in your relationship, a big argument took days to recover from. Now, you can have a tough conversation at dinner and genuinely laugh together by bedtime — not because you're avoiding, but because your repair muscles are strong.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="conflict-resolution"
      title="Constructive Conflict Resolution"
      description="Turn disagreements into opportunities for deeper understanding. Progress from pattern recognition to masterful repair."
      tiers={tiers}
    />
  );
}
