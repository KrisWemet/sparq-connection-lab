import JourneyTemplate from "./journey-template";
import {
  Heart,
  Users,
  User,
  MessageSquare,
  Flame,
  BadgeCheck,
  ArrowRightLeft,
  Sparkles,
  Eye,
  Clock,
  Compass,
  ShieldCheck,
  Fingerprint,
  Layers,
  Puzzle,
  TreePine,
  HandHeart,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function IntimacyJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "emotional-intimacy",
          title: "Emotional Intimacy",
          description: "Creating deep emotional connection through vulnerability and understanding",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Sharing your fears, hopes, and dreams with your partner, and creating a safe space where both of you can be vulnerable without fear of judgment.",
        },
        {
          id: "physical-intimacy",
          title: "Physical Intimacy",
          description: "Connecting through touch, physical affection, and sexual expression",
          icon: <Flame className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Developing a rich language of physical connection that includes both sexual intimacy and everyday affectionate touches like holding hands, hugging, or gentle caresses.",
        },
        {
          id: "intellectual-intimacy",
          title: "Intellectual Intimacy",
          description: "Sharing ideas, thoughts, and meaningful conversations",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Having deep conversations about your values, interests, or perspectives on life, and feeling intellectually stimulated by your exchanges with your partner.",
        },
        {
          id: "experiential-intimacy",
          title: "Experiential Intimacy",
          description: "Building connection through shared experiences and activities",
          icon: <Users className="w-5 h-5 text-green-500" />,
          color: "green",
          example: "Traveling together, trying new activities as a couple, or creating meaningful rituals and traditions that strengthen your bond through shared memories.",
        },
        {
          id: "spiritual-intimacy",
          title: "Spiritual Intimacy",
          description: "Connecting through shared values, beliefs, and life purpose",
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Discussing your core values, exploring existential questions together, or sharing spiritual practices that help you feel aligned on a deeper level.",
        },
        {
          id: "self-intimacy",
          title: "Self-Intimacy",
          description: "Developing a deep relationship with yourself as a foundation for connection",
          icon: <User className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "Practicing self-awareness and self-compassion, which allows you to bring your authentic self to your relationship rather than projecting needs or insecurities.",
        },
        {
          id: "vulnerability",
          title: "Vulnerable Sharing",
          description: "Opening up about feelings, needs, and experiences that feel risky to share",
          icon: <BadgeCheck className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Sharing a personal insecurity with your partner, being honest about a mistake you've made, or expressing a need that you fear might be rejected.",
        },
        {
          id: "reciprocity",
          title: "Balanced Reciprocity",
          description: "Creating mutual exchange of emotional giving and receiving",
          icon: <ArrowRightLeft className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Both partners having space to be vulnerable and supportive at different times, creating a dance of intimacy where both feel equally valued and understood.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "initiating-vulnerability",
          title: "Initiating Vulnerability",
          description: "Choosing to go first in sharing something real, even when it feels risky",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of waiting for your partner to open up, saying 'I want to share something that's been on my mind. I've been feeling disconnected from us lately, and I think it's because I've been afraid to ask for more closeness.'",
        },
        {
          id: "deepening-physical-presence",
          title: "Deepening Physical Presence",
          description: "Bringing intentional, attuned awareness to physical touch beyond routine",
          icon: <Fingerprint className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "During a hug, instead of the quick pat-and-release, pausing to feel your partner's breathing, matching your rhythm to theirs, and staying for three extra breaths. Noticing how the quality of touch changes when you're truly present.",
        },
        {
          id: "creating-intimacy-rituals",
          title: "Creating Intimacy Rituals",
          description: "Building recurring practices that create reliable moments of closeness",
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Establishing a nightly 10-minute check-in where you each share one thing you appreciated about the other and one thing that's weighing on you. Over time this becomes a sacred space where intimacy deepens predictably.",
        },
        {
          id: "navigating-intimacy-mismatches",
          title: "Navigating Intimacy Mismatches",
          description: "Working through different needs for closeness without shame or withdrawal",
          icon: <Layers className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "When one partner wants to talk through emotions and the other needs quiet physical closeness, saying 'I can see we need different things right now. How about I hold you while I share what's on my mind — would that work for both of us?'",
        },
        {
          id: "curiosity-over-assumption",
          title: "Curiosity Over Assumption",
          description: "Staying genuinely curious about your partner's inner world instead of assuming you know it",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "After years together, asking 'What's something you've been thinking about lately that you haven't told me?' — and being genuinely surprised by the answer. Curiosity is the antidote to the intimacy-killing belief that you already know everything about your partner.",
        },
        {
          id: "emotional-risk-taking",
          title: "Emotional Risk-Taking",
          description: "Expanding your comfort zone by sharing desires, fears, or truths you've held back",
          icon: <Compass className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Telling your partner about a dream you've never shared because you feared they'd think it was silly, or admitting 'I sometimes worry I'm not enough for you' — and discovering that the risk creates more closeness, not less.",
        },
        {
          id: "repairing-after-withdrawal",
          title: "Repairing After Withdrawal",
          description: "Bridging the gap when one or both partners have pulled away emotionally",
          icon: <HandHeart className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "After a period of emotional distance, saying 'I notice we've been passing each other like roommates this week. I miss us. Can we find 20 minutes tonight to just be together — no screens, no agenda?'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "intimacy-through-transitions",
          title: "Intimacy Through Life Transitions",
          description: "Sustaining and deepening closeness during major life changes — parenthood, loss, career shifts",
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          color: "green",
          example: "New parents recognizing that their intimacy needs to evolve, not disappear. Creating new forms of connection — a 5-minute hand-hold after the baby sleeps, whispering 'I see how hard you're working' — that honor the season they're in.",
        },
        {
          id: "repairing-intimacy-ruptures",
          title: "Repairing Intimacy Ruptures",
          description: "Healing deeper wounds that have caused lasting distance between you",
          icon: <Puzzle className="w-5 h-5 text-amber-600" />,
          color: "amber",
          example: "After months of emotional distance following a betrayal, one partner says 'I know trust is still rebuilding. I want you to know I'm here for the long work. What would help you feel safer letting me close again?' This isn't a quick fix — it's sustained, patient re-engagement.",
        },
        {
          id: "creating-your-intimacy-language",
          title: "Creating Your Intimacy Language",
          description: "Developing a private vocabulary of closeness unique to your relationship",
          icon: <MessageSquare className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Over time, couples develop their own shorthand — a specific look that means 'I need you,' a code word for 'I'm feeling vulnerable right now,' a ritual touch that says 'we're okay.' These private symbols create a world that belongs only to you two.",
        },
        {
          id: "embodied-attunement",
          title: "Embodied Attunement",
          description: "Reading your partner's emotional and physical state through subtle cues and responding with care",
          icon: <Eye className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Noticing that your partner's shoulders are tight and their breathing is shallow, and instead of asking 'what's wrong,' placing a warm hand on their back and saying 'I'm here' — matching what they need before they have to articulate it.",
        },
        {
          id: "integrating-all-dimensions",
          title: "Integrating All Dimensions",
          description: "Weaving emotional, physical, intellectual, and spiritual intimacy into a unified experience",
          icon: <Layers className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "A single evening that naturally flows between deep conversation (intellectual), holding each other (physical), sharing gratitude (emotional), and reflecting on what your relationship means (spiritual) — not as separate activities, but as one seamless experience of connection.",
        },
        {
          id: "exploring-growing-edges",
          title: "Exploring Growing Edges Together",
          description: "Identifying the frontiers where deeper intimacy is still possible and choosing to go there",
          icon: <Compass className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Asking 'Where do we still hold back with each other?' and being willing to hear the answer. Maybe it's talking about money fears, or a sexual desire, or grief that hasn't been fully shared. The edge is where the next level of closeness lives.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="intimacy"
      title="Building Deep Intimacy"
      description="Deepen your emotional, physical, and intellectual connection with your partner. Progress from understanding to embodied closeness."
      tiers={tiers}
    />
  );
}
