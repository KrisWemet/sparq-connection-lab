import JourneyTemplate from "./journey-template";
import {
  Shield,
  Clock,
  Heart,
  Eye,
  MessageSquare,
  HandHeart,
  ShieldCheck,
  Lock,
  Compass,
  Sparkles,
  Users,
  BookOpen,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function TrustRebuildingJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "acknowledging-the-breach",
          title: "Acknowledging the Breach",
          description: "Facing what happened with honesty — without minimizing, defending, or rushing past the pain",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "The partner who broke trust saying: 'I lied about the money. There's no excuse, and I understand why you're hurt. I want to tell you the full truth, at whatever pace you need.' Acknowledgment without defensiveness is the first brick in rebuilding.",
        },
        {
          id: "understanding-impact",
          title: "Understanding the Full Impact",
          description: "Letting the hurt partner express the breadth of how the breach affected them — even the parts that are hard to hear",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The hurt partner needs to say: 'It's not just the lie. It's that I questioned my own judgment. I couldn't sleep. I wondered what else isn't real.' The other partner listens without defending. Impact must be fully witnessed before healing begins.",
        },
        {
          id: "types-of-trust",
          title: "Understanding Types of Trust",
          description: "Recognizing that trust operates on multiple dimensions — emotional, physical, financial, and more",
          icon: <Shield className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "A financial betrayal may not break physical trust — you still feel safe in their presence. But it shatters reliability trust and honesty trust. Understanding which dimensions are broken helps you rebuild with precision rather than treating everything as damaged.",
        },
        {
          id: "grief-and-anger",
          title: "Processing Grief and Anger",
          description: "Allowing the full range of emotions that come with broken trust without rushing to forgiveness",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "The hurt partner needs permission to be angry, sad, confused, and grief-stricken — sometimes all in the same hour. Premature forgiveness is dangerous. Authentic healing requires moving through the pain, not around it.",
        },
        {
          id: "transparency",
          title: "Building Radical Transparency",
          description: "The trust-breaker voluntarily offering information, access, and honesty without being asked",
          icon: <Lock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Proactively sharing your whereabouts, being open about conversations, and answering questions honestly — even when they're asked for the third time. Transparency isn't punishment; it's the active rebuilding of what was broken.",
        },
        {
          id: "patience-with-process",
          title: "Patience with the Process",
          description: "Understanding that trust rebuilding is not linear and both partners will have hard days",
          icon: <Clock className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Three months in, everything seems better — then a song triggers a memory and the hurt floods back. This isn't regression; it's the spiral nature of healing. Both partners learn: 'This wave will pass. We've survived them before.'",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "consistent-actions",
          title: "Consistent Trust-Building Actions",
          description: "Replacing words with reliable, repeated behaviors that demonstrate change",
          icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Saying 'I'll be home by 6' and being home by 6 — every time. Saying 'I'll call the therapist' and calling that day. Trust is rebuilt not through grand gestures but through small, boring, consistent follow-through over months.",
        },
        {
          id: "repair-conversations",
          title: "Having Repair Conversations",
          description: "Learning to revisit the breach productively when it resurfaces — without rehashing the same fight",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "The hurt partner says 'I'm having a hard day with this again.' Instead of 'I thought we were past this,' the other says 'Tell me what's coming up. I'm here to listen.' Each conversation processes a different layer.",
        },
        {
          id: "accountability-without-shame",
          title: "Accountability Without Shame",
          description: "Taking responsibility for the breach while maintaining enough self-worth to do the healing work",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The trust-breaker learning to say: 'What I did was wrong and I'm taking full responsibility for the hurt it caused. AND I am more than the worst thing I've done. I'm committed to becoming someone who deserves your trust.'",
        },
        {
          id: "boundaries-and-safety",
          title: "Setting Boundaries for Safety",
          description: "The hurt partner establishing what they need to feel safe, and both partners honoring those boundaries",
          icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "The hurt partner says: 'I need you to check in when you're going to be late. I need access to our shared accounts. I need honesty even when it's uncomfortable.' These aren't controlling — they're the scaffolding that holds trust while it's being rebuilt.",
        },
        {
          id: "understanding-why",
          title: "Understanding the 'Why'",
          description: "Exploring what led to the breach — not to excuse it, but to prevent it from happening again",
          icon: <Compass className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Discovering that the financial deception grew from shame about a childhood of poverty, or that the emotional affair filled a loneliness neither partner had addressed. Understanding 'why' isn't forgiveness — it's prevention.",
        },
        {
          id: "rebuilding-emotional-intimacy",
          title: "Rebuilding Emotional Intimacy",
          description: "Slowly reopening the emotional connection that the breach damaged",
          icon: <Heart className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Starting small: sharing a genuine laugh together. Making eye contact during conversation. Asking 'How was your day?' and truly listening. Emotional intimacy returns in inches, not leaps.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "forgiveness-process",
          title: "The Forgiveness Process",
          description: "Moving toward forgiveness as a choice that frees you — not as something owed or rushed",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Forgiveness isn't saying 'it's okay' — it's saying 'I choose to release the grip this has on me.' It may come gradually: first for small things, then deeper ones. Some parts may take years. Authentic forgiveness cannot be demanded or performed.",
        },
        {
          id: "new-relationship-agreement",
          title: "Creating a New Relationship Agreement",
          description: "Consciously defining the relationship you're building now — which is different from the one before",
          icon: <BookOpen className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Sitting down together and writing out: 'In our renewed relationship, we commit to complete honesty, even when it's uncomfortable. We will address concerns early rather than letting them grow. We will check in weekly.' This isn't the old relationship patched — it's a new one built on clearer ground.",
        },
        {
          id: "post-traumatic-growth",
          title: "Post-Traumatic Growth Together",
          description: "Discovering that the painful process of rebuilding has created strengths that didn't exist before",
          icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Couples who successfully rebuild trust often report: 'We communicate better now than we ever did before. We don't take each other for granted. We know we can survive hard things.' The growth doesn't justify the pain — but it's real.",
        },
        {
          id: "trust-as-practice",
          title: "Trust as Ongoing Practice",
          description: "Understanding that trust isn't a destination — it's a daily choice both partners make",
          icon: <RotateCcw className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Even years later, both partners actively choose trust: the trust-breaker through continued transparency, the hurt partner through continued openness to believing. This isn't fragility — it's intentionality. Trust maintained consciously is stronger than trust taken for granted.",
        },
        {
          id: "vulnerability-after-betrayal",
          title: "Choosing Vulnerability Again",
          description: "The courageous act of opening your heart to someone who has hurt it before",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The hurt partner saying: 'I'm scared, but I'm choosing to let you back in. Not because the fear is gone, but because what we're building is worth the risk.' This is one of the bravest things a human being can do.",
        },
        {
          id: "your-trust-story",
          title: "Writing Your Trust Story",
          description: "Creating a shared narrative of what happened, what you learned, and who you've become",
          icon: <Users className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Being able to tell the story together: 'We went through something that almost ended us. We chose to face it. We learned things about ourselves and each other that we couldn't have learned any other way. We're stronger now — not despite what happened, but because of how we handled it.'",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="trust-rebuilding"
      title="Trust Rebuilding"
      description="Heal and rebuild trust after a breach through structured, compassionate steps. Progress from acknowledgment to renewed partnership."
      tiers={tiers}
    />
  );
}
