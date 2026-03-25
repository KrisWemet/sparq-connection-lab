import JourneyTemplate from "./journey-template";
import {
  Heart,
  Shield,
  Anchor,
  Brain,
  Eye,
  Users,
  HandHeart,
  AlertTriangle,
  Compass,
  Layers,
  ShieldCheck,
  TreePine,
  Sparkles,
  Home,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function AttachmentHealingJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "attachment-styles",
          title: "Understanding Attachment Styles",
          description: "Learning the four attachment styles and how they shape your relationship patterns",
          icon: <Brain className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Discovering that your tendency to need constant reassurance isn't 'needy' — it's anxious attachment, formed in childhood when love felt unpredictable. Understanding the style removes the shame and opens the door to change.",
        },
        {
          id: "your-attachment-map",
          title: "Mapping Your Attachment Pattern",
          description: "Identifying your specific attachment tendencies and how they show up in your relationship",
          icon: <Compass className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Noticing that you withdraw when your partner gets emotionally intense (avoidant pattern), or that you escalate when they seem distant (anxious pattern). The map isn't a label — it's a guide for where healing is needed.",
        },
        {
          id: "attachment-origins",
          title: "Tracing Your Attachment Origins",
          description: "Understanding how early caregiving experiences created your attachment blueprint",
          icon: <TreePine className="w-5 h-5 text-amber-600" />,
          color: "amber",
          example: "Realizing that your difficulty trusting your partner's love connects to a parent who was emotionally available sometimes and absent others. The child learned: 'Love is unreliable. I must work hard to keep it.' Understanding the origin is the beginning of rewriting the story.",
        },
        {
          id: "attachment-triggers",
          title: "Recognizing Attachment Triggers",
          description: "Identifying the moments when old attachment wounds get activated in your current relationship",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "Your partner doesn't text back for a few hours and you spiral into anxiety, checking your phone repeatedly. The trigger isn't the delayed text — it's the old fear: 'They're going to leave me.' Recognizing the trigger separates past from present.",
        },
        {
          id: "protest-behaviors",
          title: "Understanding Protest Behaviors",
          description: "Recognizing the unconscious strategies you use when your attachment system is activated",
          icon: <Shield className="w-5 h-5 text-slate-500" />,
          color: "slate",
          example: "When you feel disconnected, you might pick a fight (protest), go silent (withdrawal), keep score (monitoring), or act indifferent (deactivating). These aren't character flaws — they're your attachment system's alarm bells.",
        },
        {
          id: "secure-base",
          title: "What Secure Attachment Looks Like",
          description: "Understanding the qualities of secure attachment so you know what you're building toward",
          icon: <Home className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Secure attachment isn't the absence of conflict or anxiety. It's the deep confidence that 'When I reach for you, you'll be there.' It's comfort with closeness AND independence. It's repairing quickly after ruptures.",
        },
        {
          id: "partner-attachment",
          title: "Understanding Your Partner's Attachment",
          description: "Seeing your partner's behaviors through the lens of their attachment needs rather than as personal attacks",
          icon: <Users className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "When your avoidant partner pulls away after an emotional conversation, understanding they're not rejecting you — they're overwhelmed and need to regulate alone. This reframe transforms frustration into compassion.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "earned-security",
          title: "Building Earned Security",
          description: "Developing secure attachment through intentional practice, even if it wasn't your starting point",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "You didn't grow up with secure attachment, but research shows you can earn it. Each time you reach for your partner when scared (instead of withdrawing) and they respond, you're literally rewiring your attachment circuitry.",
        },
        {
          id: "interrupting-cycles",
          title: "Interrupting the Anxious-Avoidant Cycle",
          description: "Recognizing and disrupting the pursue-withdraw pattern that keeps couples stuck",
          icon: <Layers className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "The anxious partner pursues ('We need to talk NOW'), the avoidant withdraws ('I need space'), which triggers more pursuit, which triggers more withdrawal. Breaking the cycle: the pursuer softens their approach, the withdrawer stays present for 5 more minutes.",
        },
        {
          id: "vulnerability-practice",
          title: "Practicing Vulnerable Reaching",
          description: "Learning to express attachment needs directly instead of through protest behaviors",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Instead of picking a fight when you feel disconnected (protest), saying: 'I'm feeling far from you today and it scares me. Can we spend some time together tonight?' This is the hardest and most transformative practice in attachment healing.",
        },
        {
          id: "holding-and-responding",
          title: "Holding and Responding",
          description: "Learning to be the secure base your partner needs — present, responsive, and emotionally available",
          icon: <Anchor className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "When your partner vulnerably shares a fear, resisting the urge to fix, minimize, or deflect. Instead: 'Thank you for telling me that. I'm here. You're not alone in this.' Holding creates the safety that heals.",
        },
        {
          id: "self-soothing",
          title: "Self-Soothing Without Shutting Down",
          description: "Regulating your attachment anxiety without disconnecting from your partner",
          icon: <Brain className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "When attachment anxiety surges, instead of texting your partner 10 times or going cold, using internal dialogue: 'My attachment system is activated. This feeling is old. My partner loves me. I can sit with this discomfort.'",
        },
        {
          id: "repairing-attachment-ruptures",
          title: "Repairing Attachment Ruptures",
          description: "Reconnecting after moments when the attachment bond felt threatened",
          icon: <Heart className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "After a fight where both partners felt abandoned, coming back together and saying: 'I know we scared each other. I'm here now. Are you okay?' EFT research shows that repair after rupture actually strengthens the bond — it's not just returning to baseline, it's building new trust.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "secure-functioning",
          title: "Secure Functioning as a Couple",
          description: "Operating as a team where both partners' nervous systems feel safe with each other",
          icon: <Home className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Walking into a stressful family event and instinctively reaching for each other — not from anxiety, but from the natural confidence that you're a unit. Secure functioning means your default is 'we,' not 'me vs. you.'",
        },
        {
          id: "attachment-under-stress",
          title: "Maintaining Security Under Stress",
          description: "Keeping your attachment bond strong when life throws its hardest challenges",
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "During a financial crisis, instead of retreating to old patterns (anxiety or avoidance), turning to each other: 'This is scary. But we've built something strong. Let's figure this out together.' Stress used to break your bond; now it deepens it.",
        },
        {
          id: "reparenting-together",
          title: "Co-Reparenting Each Other",
          description: "Providing each other the consistent, loving responses that may have been missing in childhood",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "When your partner regresses to a childlike state of fear — terrified of rejection, needing reassurance — instead of frustration, offering the steady presence of a secure caregiver: 'I see you. I'm not going anywhere. You're safe with me.'",
        },
        {
          id: "attachment-narrative",
          title: "Rewriting Your Attachment Narrative",
          description: "Creating a coherent story of your attachment journey that integrates past wounds with present growth",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Being able to say: 'I grew up with inconsistent love, so I learned to cling. In this relationship, I've learned that I can need someone without losing myself. My anxiety still visits, but it doesn't run the show anymore.'",
        },
        {
          id: "interdependence",
          title: "Healthy Interdependence",
          description: "Finding the sweet spot between independence and dependence — needing your partner without losing yourself",
          icon: <Eye className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Being able to spend a weekend apart without anxiety, and also being able to cry in your partner's arms without shame. Interdependence isn't the middle of a spectrum — it's the integration of both autonomy and connection.",
        },
        {
          id: "legacy-of-security",
          title: "Creating a Legacy of Security",
          description: "Building attachment security that ripples beyond your relationship into family and community",
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          color: "green",
          example: "Your children observe how you and your partner handle conflict, ask for help, and comfort each other. Without any lessons, they're absorbing secure attachment. The cycle of insecure attachment that may have lasted generations is ending with you.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="attachment-healing"
      title="Attachment Healing"
      description="Understand and transform your attachment patterns for deeper security. Progress from awareness to earned secure attachment."
      tiers={tiers}
    />
  );
}
