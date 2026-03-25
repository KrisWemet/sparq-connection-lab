import JourneyTemplate from "./journey-template";
import {
  Brain,
  Heart,
  Eye,
  Thermometer,
  HandHeart,
  MessageSquare,
  Shield,
  Sparkles,
  Compass,
  Users,
  Layers,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function EmotionalIntelligenceJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "emotional-awareness",
          title: "Emotional Awareness",
          description: "Tuning into what you're feeling in any given moment instead of running on autopilot",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Pausing mid-conversation and noticing: 'My chest feels tight and my jaw is clenched. I think I'm feeling anxious, not angry.' Most people misidentify their emotions, which leads to mismatched responses.",
        },
        {
          id: "naming-emotions",
          title: "Naming Emotions with Precision",
          description: "Moving beyond 'fine' and 'stressed' to identify exactly what you're experiencing",
          icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of saying 'I'm upset,' distinguishing between disappointed, frustrated, hurt, or overwhelmed. Research shows that precisely labeling an emotion reduces its intensity by up to 50% — this is called 'affect labeling.'",
        },
        {
          id: "recognizing-triggers",
          title: "Recognizing Emotional Triggers",
          description: "Identifying the situations, words, or behaviors that reliably activate strong emotional responses",
          icon: <Thermometer className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Noticing that you feel a wave of shame whenever your partner mentions finances. The trigger isn't the topic itself — it's an old story about not being good enough. Recognizing the trigger gives you a choice point.",
        },
        {
          id: "basic-regulation",
          title: "Basic Emotion Regulation",
          description: "Developing tools to manage emotional intensity without suppressing or exploding",
          icon: <Shield className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "When you feel anger rising, using the 'STOP' technique: Stop what you're doing, Take three slow breaths, Observe what you're feeling in your body, Proceed with intention. This 30-second practice creates space between stimulus and response.",
        },
        {
          id: "empathy-foundations",
          title: "Empathy Foundations",
          description: "Building the ability to sense and understand what your partner is feeling",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Your partner comes home quiet and tense. Instead of asking 'What's wrong?' (which can feel like pressure), you say 'You seem like you're carrying something heavy today. I'm here if you want to talk, or just sit together.'",
        },
        {
          id: "self-compassion",
          title: "Self-Compassion",
          description: "Treating yourself with the same kindness you'd offer a good friend when emotions are hard",
          icon: <HandHeart className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "After snapping at your partner, instead of spiraling into self-criticism ('I'm a terrible partner'), saying to yourself: 'I'm having a hard time right now. Everyone struggles sometimes. What do I need to get back on track?'",
        },
        {
          id: "emotional-vocabulary",
          title: "Building Emotional Vocabulary",
          description: "Expanding the range of emotions you can identify and express",
          icon: <Brain className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Learning that what you've been calling 'anger' is actually a constellation: resentment, frustration, feeling unheard, or feeling controlled. Each word opens a different door to understanding and communication.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "co-regulation",
          title: "Co-Regulation with Your Partner",
          description: "Using each other's calm presence to regulate difficult emotions together",
          icon: <Users className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "When your partner is spiraling with anxiety, instead of trying to fix it with logic, you sit close, match their breathing, and say 'I'm right here. We're okay.' Your regulated nervous system helps calm theirs — this is the science of co-regulation.",
        },
        {
          id: "emotional-bids",
          title: "Emotional Bids & Turning Toward",
          description: "Recognizing and responding to your partner's small requests for emotional connection",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Your partner sighs heavily while reading something on their phone. That sigh is an emotional bid — a request for attention. Turning toward it ('What's going on?') builds trust. Ignoring it ('...' ) erodes connection. Gottman found that couples who 'turn toward' 86% of the time stay together.",
        },
        {
          id: "sitting-with-discomfort",
          title: "Sitting with Emotional Discomfort",
          description: "Building tolerance for difficult feelings without rushing to fix, numb, or escape them",
          icon: <Compass className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "When sadness arises after a difficult conversation, instead of immediately distracting yourself, sitting with it for five minutes. Noticing where it lives in your body. Breathing into it. Often, emotions that are allowed to exist fully pass through more quickly than emotions we resist.",
        },
        {
          id: "validating-without-fixing",
          title: "Validating Without Fixing",
          description: "Acknowledging your partner's emotions without jumping to solutions or silver linings",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Your partner says 'I feel like a failure at work.' Instead of 'No you're not! You got that promotion last year!' — saying 'That sounds really painful. Tell me more about what happened.' Validation means the feeling is heard before it's solved.",
        },
        {
          id: "managing-flooding",
          title: "Managing Emotional Flooding",
          description: "Recognizing when your emotional brain has hijacked your thinking brain — and what to do about it",
          icon: <Thermometer className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "Your heart rate spikes above 100 BPM and your partner's words sound like attacks even though they're speaking calmly. You recognize: 'I'm flooded right now.' You say: 'I need to take 20 minutes. I'm not leaving — I'll be back.' Then you self-soothe: walk, breathe, splash cold water.",
        },
        {
          id: "reading-subtext",
          title: "Reading Emotional Subtext",
          description: "Understanding what your partner is really feeling beneath what they're saying",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Your partner says 'I don't care, do whatever you want' in a flat voice. The words say indifference; the tone says hurt. Emotional subtext literacy means noticing the mismatch and gently saying 'I think you do care. Can you help me understand what's going on?'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "emotional-attunement",
          title: "Emotional Attunement",
          description: "Sensing your partner's emotional state and responding with precision — almost before they ask",
          icon: <Layers className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "You notice your partner's energy shift subtly during a family dinner — a slight withdrawal, a quieter voice. Later you say 'I noticed something shifted for you at dinner, around when your mom mentioned the house. Want to talk about it?' Attunement is empathy in real-time.",
        },
        {
          id: "creating-emotional-safety",
          title: "Creating Emotional Safety",
          description: "Building an environment where both partners feel safe to feel anything without judgment",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Your partner cries during a movie and instead of teasing or being uncomfortable, you move closer and hold their hand. Over time, these moments accumulate: 'I can feel anything here and it's okay.' This is the foundation of secure attachment.",
        },
        {
          id: "complex-emotions-together",
          title: "Navigating Complex Emotions Together",
          description: "Holding space when emotions are messy, contradictory, or hard to understand",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Your partner says 'I'm excited about the baby but also terrified and kind of grieving our life as just the two of us.' Instead of picking one emotion to validate, you hold all of them: 'That makes complete sense. All of those things can be true at once.'",
        },
        {
          id: "emotional-resilience",
          title: "Emotional Resilience as a Couple",
          description: "Bouncing back from emotional setbacks faster and stronger because you face them together",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "After a devastating disappointment — a failed adoption, a job loss, a health scare — you don't crumble separately. You sit together and say 'This is terrible. And we're going to get through it.' Resilience isn't about not feeling pain; it's about not feeling it alone.",
        },
        {
          id: "mentalization",
          title: "Mentalization",
          description: "Understanding your partner's inner world — their thoughts, feelings, and motivations — as separate from your own",
          icon: <Brain className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "When your partner is quiet after an argument, instead of assuming they're punishing you with silence, wondering: 'Maybe they're processing. Maybe they're hurt. Maybe they need space to figure out what they feel.' Mentalization replaces projection with genuine curiosity.",
        },
        {
          id: "emotional-leadership",
          title: "Emotional Leadership",
          description: "Setting the emotional tone for your relationship through your own regulated, intentional presence",
          icon: <Lightbulb className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "When family drama threatens to hijack your holiday, you model calm: 'I can feel the tension rising. Let's take a walk before we respond to that text.' Emotional leadership isn't controlling others' feelings — it's being the kind of regulated presence that invites others to regulate too.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="emotional-intelligence"
      title="Emotional Intelligence"
      description="Develop the emotional awareness and skills that transform relationships. Progress from recognition to relational mastery."
      tiers={tiers}
    />
  );
}
