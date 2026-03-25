import JourneyTemplate from "./journey-template";
import {
  Heart,
  MessageSquare,
  Brain,
  Flame,
  Eye,
  Clock,
  Shield,
  Compass,
  Sparkles,
  HandHeart,
  Users,
  Lightbulb,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function SexualIntimacyJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "desire-types",
          title: "Understanding Desire",
          description: "Learning the difference between spontaneous and responsive desire — and why both are normal",
          icon: <Flame className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "One partner feels spontaneous desire (arousal appears seemingly from nowhere), while the other experiences responsive desire (arousal develops in response to stimulation and context). Neither is 'broken' — they're just different pathways to the same destination.",
        },
        {
          id: "sexual-communication",
          title: "Talking About Sex",
          description: "Building the vocabulary and safety to discuss sexual needs, desires, and boundaries openly",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Starting with lower-stakes conversations: 'What's something you've really enjoyed recently?' or 'Is there anything you'd like more of?' The goal isn't a perfect script — it's normalizing the conversation so sex becomes something you talk about, not just do.",
        },
        {
          id: "desire-discrepancy",
          title: "Navigating Desire Differences",
          description: "Understanding that mismatched libidos are the norm, not the exception — and learning to bridge the gap",
          icon: <Users className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Perel's research shows that desire discrepancy exists in nearly every relationship. The lower-desire partner isn't 'withholding' and the higher-desire partner isn't 'too much.' Naming this normalizes it and opens space for creative solutions.",
        },
        {
          id: "context-matters",
          title: "Creating the Right Context",
          description: "Understanding that desire depends heavily on context — stress, environment, emotional safety",
          icon: <Brain className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Emily Nagoski's research on 'brakes and accelerators' shows that desire isn't just about turning on the accelerator — it's about removing the brakes. Stress, body image concerns, unresolved conflict, and mental load all hit the brakes. Addressing context is foreplay.",
        },
        {
          id: "presence-in-intimacy",
          title: "Being Present During Intimacy",
          description: "Bringing your full attention to physical connection instead of performing or mentally checking out",
          icon: <Eye className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Noticing when your mind drifts to your to-do list or body worries during intimate moments, and gently returning your attention to sensation, connection, and your partner. Presence transforms the quality of physical intimacy more than any technique.",
        },
        {
          id: "emotional-foundation",
          title: "The Emotional Foundation of Sex",
          description: "Understanding that great sex is built on emotional safety, not just physical technique",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Sue Johnson's research shows that the most sexually satisfied couples are those with secure emotional bonds. When you feel safe enough to be vulnerable — to say what you want, to be seen without armor — physical intimacy deepens naturally.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "initiating-with-care",
          title: "Initiating with Care",
          description: "Learning to express sexual interest in ways that feel inviting rather than pressuring",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Instead of the ambiguous hand-on-the-leg-in-bed, being direct and warm: 'I'd love to be close tonight. How are you feeling?' This removes the guesswork and pressure, and creates space for an honest 'yes,' 'not tonight,' or 'let's start slow and see.'",
        },
        {
          id: "sensate-focus",
          title: "Sensate Focus Practice",
          description: "Using Masters and Johnson's technique of non-goal-oriented touch to rebuild physical connection",
          icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Taking turns touching each other's hands, arms, and back with no sexual goal — just noticing sensation. This removes performance pressure and rebuilds the foundation of physical connection. Many couples report more intimacy from sensate focus than from sex itself.",
        },
        {
          id: "accepting-no-gracefully",
          title: "Accepting 'No' Gracefully",
          description: "Responding to sexual rejection without punishment, withdrawal, or guilt — which paradoxically increases desire",
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "When your partner says 'Not tonight,' responding with 'That's okay. Can I just hold you?' instead of rolling over in silence. Research shows that when 'no' is safe, 'yes' becomes more genuine and frequent — because desire thrives without pressure.",
        },
        {
          id: "expanding-definition",
          title: "Expanding Your Definition of Intimacy",
          description: "Moving beyond intercourse as the only 'real' sex to embrace a full spectrum of physical connection",
          icon: <Compass className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Kissing deeply just for the sake of kissing. A long massage with no expected outcome. Showering together. Lying skin-to-skin and talking. When intimacy has many forms, the pressure around any single form decreases, and overall satisfaction increases.",
        },
        {
          id: "addressing-blocks",
          title: "Addressing Sexual Blocks",
          description: "Identifying and gently working through the mental and emotional barriers to sexual connection",
          icon: <Brain className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Naming the blocks honestly: body shame, past trauma, performance anxiety, resentment from unresolved conflict. Each block has a path through it, but the path starts with acknowledgment. Saying 'I think my body image is affecting our intimacy' opens a door that silence keeps locked.",
        },
        {
          id: "pleasure-mapping",
          title: "Pleasure Mapping",
          description: "Exploring what feels good for each partner with curiosity and without assumptions",
          icon: <Sparkles className="w-5 h-5 text-pink-500" />,
          color: "pink",
          example: "Taking turns guiding each other: 'I love it when you... Try a little softer here... That feels amazing.' Bodies change over time, and what felt great five years ago may be different now. Regular exploration prevents staleness and builds confidence.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "erotic-intelligence",
          title: "Developing Erotic Intelligence",
          description: "Cultivating the creative, playful, curious energy that keeps desire alive long-term",
          icon: <Flame className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Perel's concept of erotic intelligence: maintaining mystery and novelty within commitment. It's not about techniques — it's about approaching your partner with curiosity instead of familiarity. 'I think I know you completely' kills eroticism. 'There's always more to discover' fuels it.",
        },
        {
          id: "desire-as-practice",
          title: "Desire as an Ongoing Practice",
          description: "Understanding that long-term desire requires cultivation, not just chemistry",
          icon: <Clock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Scheduling intimacy isn't unromantic — it's realistic. Building anticipation through the day with a text, a look, a touch. Creating the conditions for desire rather than waiting for it to strike spontaneously. Desire in long-term relationships is tended, not found.",
        },
        {
          id: "vulnerability-in-bed",
          title: "Deep Vulnerability in Intimacy",
          description: "Bringing your full, unguarded self to physical connection — sharing desires, fears, and raw presence",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Being able to say 'I want to try something but I'm nervous' or 'I feel most connected when you look at me during' or 'Sometimes I worry I'm not enough for you sexually.' This level of vulnerability transforms sex from performance into genuine meeting.",
        },
        {
          id: "sexual-wellness-habits",
          title: "Building Sexual Wellness Habits",
          description: "Creating sustainable practices that keep your sexual connection vibrant through all of life's seasons",
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "A monthly check-in about your sexual relationship. A commitment to physical affection daily regardless of whether it leads to sex. An agreement to try something new together quarterly. Sexual wellness, like physical health, is maintained through consistent, intentional practice.",
        },
        {
          id: "integration-whole-relationship",
          title: "Integrating Sex into Your Whole Relationship",
          description: "Seeing sexual intimacy not as separate from but deeply woven into the fabric of your partnership",
          icon: <Users className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "The way you communicate, resolve conflict, express appreciation, and maintain emotional safety all directly affect your sexual connection. Couples who master this integration don't compartmentalize sex — it flows naturally from the quality of their daily relating.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="sexual-intimacy"
      title="Sexual Intimacy & Desire"
      description="Deepen sexual connection through communication, presence, and mutual exploration. Progress from understanding to vibrant sexual wellness."
      tiers={tiers}
    />
  );
}
