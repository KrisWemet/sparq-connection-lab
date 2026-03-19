import JourneyTemplate from "./journey-template";
import {
  Ear,
  MessageSquare,
  User,
  Users,
  Megaphone,
  Eye,
  CornerDownRight,
  Heart,
  ShieldCheck,
  Layers,
  Waypoints,
  Sparkles,
  Brain,
  HandHeart,
  Mic,
  Scale,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function CommunicationJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "active-listening",
          title: "Active Listening",
          description: "Fully focusing on what your partner is saying rather than planning your response",
          icon: <Ear className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "When your partner shares a concern about work, putting away distractions, maintaining eye contact, and asking follow-up questions that show you're fully engaged with what they're saying.",
        },
        {
          id: "nonverbal-communication",
          title: "Nonverbal Communication",
          description: "Understanding how body language, facial expressions, and tone convey meaning",
          icon: <Eye className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Noticing that when your partner crosses their arms and avoids eye contact during a conversation, they might be feeling defensive or uncomfortable, even if their words suggest otherwise.",
        },
        {
          id: "clear-expression",
          title: "Clear Expression",
          description: "Stating your thoughts, feelings, and needs directly and specifically",
          icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of saying 'You never help around here,' saying 'I'm feeling overwhelmed with household responsibilities. Could we create a more balanced system for managing chores?'",
        },
        {
          id: "timing-and-approach",
          title: "Timing & Approach",
          description: "Choosing the right moment and method to discuss sensitive topics",
          icon: <Users className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Rather than bringing up budget concerns when your partner just walked in from work, saying 'I'd like to talk about our finances. When would be a good time in the next couple of days?'",
        },
        {
          id: "expressing-appreciation",
          title: "Expressing Appreciation",
          description: "Regularly sharing specific, genuine appreciation for your partner",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Instead of a generic 'thanks,' saying 'I really appreciated how you listened and supported me during my difficult conversation with my boss yesterday. It helped me feel less alone.'",
        },
        {
          id: "repairing-miscommunication",
          title: "Repairing Miscommunication",
          description: "Addressing communication breakdowns and misunderstandings promptly",
          icon: <CornerDownRight className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "When you notice confusion or hurt in your partner's expression, saying 'I think I may not have expressed that clearly. Can I try again?' rather than continuing with the conversation.",
        },
        {
          id: "assertiveness",
          title: "Healthy Assertiveness",
          description: "Expressing your needs confidently while respecting your partner's perspective",
          icon: <Megaphone className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "Instead of silently resenting extra work duties, saying 'I care about supporting the team, but I need to establish some boundaries around after-hours emails to protect our family time.'",
        },
        {
          id: "vulnerability",
          title: "Vulnerable Communication",
          description: "Sharing your deeper feelings, fears, and hopes with openness and trust",
          icon: <User className="w-5 h-5 text-brand-primary/80" />,
          color: "indigo",
          example: "Instead of just discussing practical aspects of a decision, sharing 'I'm feeling anxious about this move because my last major life change triggered a period of depression.'",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "emotional-validation",
          title: "Emotional Validation",
          description: "Acknowledging your partner's feelings as real and understandable before problem-solving",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "When your partner says they feel overwhelmed, responding with 'That makes complete sense given everything on your plate' before jumping to solutions or advice.",
        },
        {
          id: "soft-startup",
          title: "Soft Startup",
          description: "Beginning difficult conversations gently to prevent defensiveness",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of 'You forgot to call the plumber again,' starting with 'I know we've both been busy — I'd love to figure out together how we can stay on top of household tasks.'",
        },
        {
          id: "reflective-listening",
          title: "Reflective Listening",
          description: "Mirroring back what your partner said to confirm understanding before responding",
          icon: <Layers className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "After your partner shares a frustration, saying 'So what I'm hearing is that you felt unsupported when I didn't check in after your meeting. Is that right?' before giving your perspective.",
        },
        {
          id: "meta-communication",
          title: "Meta-Communication",
          description: "Talking about how you communicate — noticing and naming patterns in real time",
          icon: <Waypoints className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Pausing mid-disagreement to say 'I notice we're both getting louder and faster. Can we slow down? I want to actually hear what you're saying.'",
        },
        {
          id: "bids-for-connection",
          title: "Recognizing Bids",
          description: "Noticing and responding to your partner's small attempts to connect",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "When your partner says 'Look at this sunset,' recognizing it as a bid for shared experience and turning toward it rather than staying on your phone.",
        },
        {
          id: "repair-under-pressure",
          title: "Repair Under Pressure",
          description: "Making repair attempts during heated moments instead of waiting until you've calmed down",
          icon: <CornerDownRight className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "In the middle of a tense exchange, saying 'Wait — I don't like where this is going. You matter more to me than being right. Can we restart?'",
        },
        {
          id: "needs-behind-complaints",
          title: "Needs Behind Complaints",
          description: "Translating criticisms and complaints into the unmet needs they represent",
          icon: <Brain className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Hearing your partner say 'You're always on your phone' and recognizing the need underneath: 'I miss feeling like I have your full attention. I want to feel chosen.'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "generative-dialogue",
          title: "Generative Dialogue",
          description: "Having conversations that create new understanding neither partner had before",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "A conversation about weekend plans evolves into discovering that you both crave more spontaneity — something neither had articulated before — and co-creating a new ritual around it.",
        },
        {
          id: "holding-space",
          title: "Holding Space",
          description: "Being fully present with your partner's experience without needing to fix, advise, or redirect",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "When your partner is processing grief, sitting with them in silence, holding their hand, and resisting the urge to say 'It'll be okay' — just being present with what is.",
        },
        {
          id: "narrative-co-creation",
          title: "Shared Story-Making",
          description: "Consciously creating and telling the story of your relationship together",
          icon: <Mic className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Regularly revisiting how you met, what you've overcome, and where you're headed — weaving a shared narrative that gives meaning to your journey together.",
        },
        {
          id: "communicating-across-difference",
          title: "Bridging Differences",
          description: "Communicating effectively across fundamental differences in personality, values, or style",
          icon: <Scale className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "One partner processes externally, the other internally. Instead of clashing, saying 'I need to talk this through out loud — can you listen while I think? Then I'd love to hear what comes up for you after you've had a moment.'",
        },
        {
          id: "courageous-conversations",
          title: "Courageous Conversations",
          description: "Initiating and navigating the conversations you've been avoiding",
          icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Saying 'There's something I've been wanting to talk about but I've been nervous. It's about how we handle money decisions. Can we create space for that this weekend?'",
        },
        {
          id: "relational-attunement",
          title: "Relational Attunement",
          description: "Sensing what your partner needs before they ask — and checking rather than assuming",
          icon: <Ear className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Noticing your partner seems quieter than usual after a family dinner and gently asking 'You seem like something's on your mind. Want to talk, or would you rather just be together quietly?'",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="communication"
      title="Effective Communication"
      description="Master the art of truly understanding each other through validated techniques. Progress from awareness to deep relational fluency."
      tiers={tiers}
    />
  );
}
