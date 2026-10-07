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
          title: "Acknowledging the breach",
          description: "Facing what happened with honesty — without minimizing, defending, or rushing past the pain",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "The partner who broke trust saying: 'I lied about the money. There's no excuse, and I understand why you're hurt. I want to tell you the full truth, at whatever pace you need.' Acknowledgment without defensiveness is the first brick in rebuilding.",
          story: "Marco sat across from Elena, the credit card statements on the table between them. His first instinct was to explain. He didn't. \"I hid this debt from you. There's no excuse. I'll tell you everything, at whatever pace you need.\" Elena didn't answer for a long time. But she stayed at the table.",
        },
        {
          id: "understanding-impact",
          title: "Understanding the full impact",
          description: "Letting the hurt partner express the breadth of how the breach affected them — even the parts that are hard to hear",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The hurt partner needs to say: 'It's not just the lie. It's that I questioned my own judgment. I couldn't sleep. I wondered what else isn't real.' The other partner listens without defending. Impact must be fully witnessed before healing begins.",
          story: "\"It's not just the money,\" Elena said. \"I stopped trusting my own gut. I haven't slept in a week.\" Marco wanted to defend himself. He held still and listened instead, all the way to the end. \"Thank you for telling me,\" he said quietly.",
        },
        {
          id: "types-of-trust",
          title: "Understanding types of trust",
          description: "Recognizing that trust operates on multiple dimensions — emotional, physical, financial, and more",
          icon: <Shield className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "A financial betrayal may not break physical trust — you still feel safe in their presence. But it shatters reliability trust and honesty trust. Understanding which dimensions are broken helps you rebuild with precision rather than treating everything as damaged.",
          story: "Elena realized something strange. She still felt safe with Marco in the room. She still knew he'd take care of her if she got sick. What was broken was believing his words about money. Knowing exactly what broke made it feel less like everything broke.",
        },
        {
          id: "grief-and-anger",
          title: "Processing grief and anger",
          description: "Allowing the full range of emotions that come with broken trust without rushing to forgiveness",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "The hurt partner needs permission to be angry, sad, confused, and grief-stricken — sometimes all in the same hour. Premature forgiveness is dangerous. Authentic healing requires moving through the pain, not around it.",
          story: "Some days Elena was furious. Some days she just cried. Once, she did both before lunch. Marco didn't rush her toward \"okay.\" \"You get to feel all of it,\" he said. \"I'm not going anywhere.\"",
        },
        {
          id: "transparency",
          title: "Building radical transparency",
          description: "The trust-breaker voluntarily offering information, access, and honesty without being asked",
          icon: <Lock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Proactively sharing your whereabouts, being open about conversations, and answering questions honestly — even when they're asked for the third time. Transparency isn't punishment; it's the active rebuilding of what was broken.",
          story: "Marco started leaving the bank app open on the counter. When Elena asked about a charge for the third time, he answered as patiently as the first. It wasn't punishment. It was him handing back, piece by piece, what he'd taken.",
        },
        {
          id: "patience-with-process",
          title: "Patience with the process",
          description: "Understanding that trust rebuilding is not linear and both partners will have hard days",
          icon: <Clock className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Three months in, everything seems better — then a song triggers a memory and the hurt floods back. This isn't regression; it's the spiral nature of healing. Both partners learn: 'This wave will pass. We've survived them before.'",
          story: "Three months in, things felt almost normal. Then a car commercial about \"no hidden fees\" came on, and Elena's stomach dropped. The hurt came rushing back. \"It's a wave,\" Marco said, sitting beside her. \"We've gotten through waves before.\"",
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
          title: "Consistent trust-building actions",
          description: "Replacing words with reliable, repeated behaviors that demonstrate change",
          icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Saying 'I'll be home by 6' and being home by 6 — every time. Saying 'I'll call the therapist' and calling that day. Trust is rebuilt not through grand gestures but through small, boring, consistent follow-through over months.",
          story: "Marco said he'd be home by six. He was home by six. He said he'd send the statement Friday. He sent it Friday. Nothing about it was exciting. That was exactly the point.",
        },
        {
          id: "repair-conversations",
          title: "Having repair conversations",
          description: "Learning to revisit the breach productively when it resurfaces — without rehashing the same fight",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "The hurt partner says 'I'm having a hard day with this again.' Instead of 'I thought we were past this,' the other says 'Tell me what's coming up. I'm here to listen.' Each conversation processes a different layer.",
          story: "\"I'm having a hard day with it again,\" Elena said. Marco felt the old words coming: \"I thought we were past this.\" He let them go. \"Tell me what's coming up,\" he said. \"I'm here.\"",
        },
        {
          id: "accountability-without-shame",
          title: "Accountability without shame",
          description: "Taking responsibility for the breach while maintaining enough self-worth to do the healing work",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The trust-breaker learning to say: 'What I did was wrong and I'm taking full responsibility for the hurt it caused. AND I am more than the worst thing I've done. I'm committed to becoming someone who deserves your trust.'",
          story: "Marco sat on the edge of the bed. \"What I did was wrong, and I own every bit of the hurt,\" he told Elena. \"And I'm more than the worst thing I've done. I'm working to become someone you can trust.\" For the first time, he believed it too.",
        },
        {
          id: "boundaries-and-safety",
          title: "Setting boundaries for safety",
          description: "The hurt partner establishing what they need to feel safe, and both partners honoring those boundaries",
          icon: <ShieldCheck className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "The hurt partner says: 'I need you to check in when you're going to be late. I need access to our shared accounts. I need honesty even when it's uncomfortable.' These aren't controlling — they're the scaffolding that holds trust while it's being rebuilt.",
          story: "Elena wrote down what she needed: \"A text if you're late. Access to all our accounts. The truth, even when it's awkward.\" She worried it sounded controlling. Marco read it and nodded. \"This is how we rebuild. I'm in.\"",
        },
        {
          id: "understanding-why",
          title: "Understanding the 'why'",
          description: "Exploring what led to the breach — not to excuse it, but to prevent it from happening again",
          icon: <Compass className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Discovering that the financial deception grew from shame about a childhood of poverty, or that the emotional affair filled a loneliness neither partner had addressed. Understanding 'why' isn't forgiveness — it's prevention.",
          story: "Late one night, Marco told her about growing up with a dad who hid bills in a drawer. \"Being in debt felt like being him. So I hid it.\" Understanding didn't erase what happened. But it showed them both what to watch for.",
        },
        {
          id: "rebuilding-emotional-intimacy",
          title: "Rebuilding emotional intimacy",
          description: "Slowly reopening the emotional connection that the breach damaged",
          icon: <Heart className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Starting small: sharing a genuine laugh together. Making eye contact during conversation. Asking 'How was your day?' and truly listening. Emotional intimacy returns in inches, not leaps.",
          story: "It started small. A real laugh at a silly show. Eye contact over dinner. Elena asking \"How was your day?\" — and meaning it. Closeness came back in inches, not leaps. But it came back.",
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
          title: "The forgiveness process",
          description: "Moving toward forgiveness as a choice that frees you — not as something owed or rushed",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Forgiveness isn't saying 'it's okay' — it's saying 'I choose to release the grip this has on me.' It may come gradually: first for small things, then deeper ones. Some parts may take years. Authentic forgiveness cannot be demanded or performed.",
          story: "Elena didn't say \"it's okay.\" It wasn't. What she said, months later, was: \"I'm choosing to loosen the grip this has on me.\" Some parts she forgave that night. Some, she knew, would take longer. That was allowed.",
        },
        {
          id: "new-relationship-agreement",
          title: "Creating a new relationship agreement",
          description: "Consciously defining the relationship you're building now — which is different from the one before",
          icon: <BookOpen className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Sitting down together and writing out: 'In our renewed relationship, we commit to complete honesty, even when it's uncomfortable. We will address concerns early rather than letting them grow. We will check in weekly.' This isn't the old relationship patched — it's a new one built on clearer ground.",
          story: "On a quiet Sunday, Elena and Marco wrote it together: \"We tell the truth, even when it's uncomfortable. We raise worries early. We check in every week.\" They taped it inside a kitchen cabinet. It wasn't the old marriage. It was a new one.",
        },
        {
          id: "post-traumatic-growth",
          title: "Post-traumatic growth together",
          description: "Discovering that the painful process of rebuilding has created strengths that didn't exist before",
          icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Some couples who rebuild trust describe it this way: 'We communicate better now than we ever did before. We don't take each other for granted. We know we can survive hard things.' That isn't everyone's path, and the growth doesn't justify the pain — but it can be real.",
          story: "A year later, a friend asked how they were doing. Elena thought about it. \"Honestly? We talk better than we ever have. We don't take each other for granted anymore.\" She squeezed Marco's hand. \"I wouldn't wish it on anyone. But we grew.\"",
        },
        {
          id: "trust-as-practice",
          title: "Trust as ongoing practice",
          description: "Understanding that trust isn't a destination — it's a daily choice both partners make",
          icon: <RotateCcw className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Even years later, both partners actively choose trust: the trust-breaker through continued transparency, the hurt partner through continued openness to believing. This isn't fragility — it's intentionality. Trust maintained consciously is stronger than trust taken for granted.",
          story: "Years later, Marco still leaves the bank app open. Elena still chooses, again and again, to believe him. It's not fragile anymore. It's something they both keep doing on purpose.",
        },
        {
          id: "vulnerability-after-betrayal",
          title: "Choosing vulnerability again",
          description: "The courageous act of opening your heart to someone who has hurt it before",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The hurt partner saying: 'I'm scared, but I'm choosing to let you back in. Not because the fear is gone, but because what we're building is worth the risk.' This is one of the bravest things a human being can do.",
          story: "\"I'm still scared,\" Elena said. \"But I'm choosing to let you back in. Not because the fear is gone. Because what we're building is worth it.\" Marco couldn't speak. He just held her.",
        },
        {
          id: "your-trust-story",
          title: "Writing your trust story",
          description: "Creating a shared narrative of what happened, what you learned, and who you've become",
          icon: <Users className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Being able to tell the story together: 'We went through something that almost ended us. We chose to face it. We learned things about ourselves and each other that we couldn't have learned any other way. We're stronger now — not despite what happened, but because of how we handled it.'",
          story: "When their daughter was grown, she asked about that hard year. Elena and Marco told it together, finishing each other's sentences: what broke, how they faced it, what they learned. \"We almost didn't make it,\" Marco said. \"And we're stronger now.\"",
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
