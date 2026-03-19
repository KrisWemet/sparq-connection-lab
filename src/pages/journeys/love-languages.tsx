import JourneyTemplate from "./journey-template";
import {
  MessageCircle,
  Calendar,
  Gift,
  Handshake,
  Hand,
  Heart,
  Ear,
  Eye,
  Brain,
  Repeat,
  Sparkles,
  ShieldCheck,
  Compass,
  Users,
  BookOpen,
  Lightbulb,
  Flame,
  Palette,
  Scale,
  Waypoints,
  HeartHandshake,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function LoveLanguagesJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "words-of-affirmation",
          title: "Words of Affirmation",
          description: "Verbal expressions of love — compliments, encouragement, and spoken appreciation that make your partner feel seen and valued",
          icon: <MessageCircle className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Instead of a quick 'love you' on the way out, pausing to say 'I really admire how patient you were with the kids last night. You make our family feel so safe.' Specific, heartfelt words carry ten times the weight of generic ones.",
        },
        {
          id: "quality-time",
          title: "Quality Time",
          description: "Giving your partner undivided, fully present attention — not just being in the same room, but being genuinely together",
          icon: <Calendar className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Putting your phone in another room during dinner and asking 'What was the most interesting part of your day?' — then listening without checking the clock. For quality time speakers, presence without distraction is the purest form of love.",
        },
        {
          id: "acts-of-service",
          title: "Acts of Service",
          description: "Demonstrating love through thoughtful actions — easing your partner's burden and showing care through what you do, not just what you say",
          icon: <Handshake className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Noticing your partner has a stressful week ahead and quietly handling the grocery shopping, meal prep, and school pickups without being asked. For service speakers, actions don't just speak louder than words — they are the words.",
        },
        {
          id: "physical-touch",
          title: "Physical Touch",
          description: "Communicating love through physical closeness — from gentle touches to embraces that create a felt sense of connection and safety",
          icon: <Hand className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Reaching for your partner's hand while walking through a parking lot, resting your hand on their back while they cook, or pulling them into a long hug when they seem stressed. For touch speakers, these moments say 'You are not alone.'",
        },
        {
          id: "receiving-gifts",
          title: "Receiving Gifts",
          description: "The language of visual, tangible symbols of love — thoughtful tokens that show your partner was on your mind",
          icon: <Gift className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Bringing home their favorite tea because you noticed they ran out, or keeping a small stone from a beach you visited together. For gift speakers, it's never about the price — it's the proof that someone thought of them when they didn't have to.",
        },
        {
          id: "discovering-your-language",
          title: "Discovering Your Language",
          description: "Identifying which love language resonates most deeply with you — the one that fills your emotional tank fastest",
          icon: <Compass className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Reflecting on what hurts most when it's missing: Do you ache when your partner doesn't say kind things (Words)? When they're distracted around you (Time)? When they don't help (Service)? When they pull away physically (Touch)? When they forget occasions (Gifts)? The deepest wound often reveals the deepest need.",
        },
        {
          id: "mapping-your-partner",
          title: "Mapping Your Partner's Language",
          description: "Learning to recognize which love language your partner speaks — often different from your own",
          icon: <Eye className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Noticing that your partner lights up when you leave a note in their bag (Words) but seems unmoved by the expensive gift you stressed over. Or that they keep offering to fix things around the house (Service) — that's how they're saying 'I love you' in their native tongue.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "speaking-their-language",
          title: "Speaking Their Language Daily",
          description: "Deliberately expressing love in your partner's primary language, even when it doesn't come naturally to you",
          icon: <Repeat className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Your language is Acts of Service, but your partner's is Words of Affirmation. You start leaving short voice memos during the day: 'Just thinking about you and how lucky I am.' It feels awkward at first — like speaking a foreign language — but you see your partner's whole demeanor shift.",
        },
        {
          id: "love-language-under-stress",
          title: "Love Languages Under Stress",
          description: "Understanding how stress amplifies love language needs — and how unmet needs show up as conflict",
          icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "During a high-pressure month, your Quality Time partner becomes withdrawn and irritable. Instead of taking it personally, recognizing that stress has emptied their love tank. Carving out 20 minutes of phone-free connection each evening begins to restore equilibrium.",
        },
        {
          id: "love-language-dialects",
          title: "Love Language Dialects",
          description: "Discovering the specific sub-expressions within each language that resonate most with your partner",
          icon: <Ear className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Your partner's language is Physical Touch, but not all touch lands the same. You discover that a hand on their lower back in public makes them feel claimed and proud, while holding hands during a hard conversation makes them feel safe. Each dialect carries different emotional meaning.",
        },
        {
          id: "recognizing-language-shifts",
          title: "When Your Language Shifts",
          description: "Understanding that love languages can evolve over time — through life stages, healing, and growth",
          icon: <Waypoints className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "After becoming a new parent, you notice that Acts of Service suddenly matters far more than it used to. Or after a period of emotional distance, Quality Time jumps to the top. Checking in periodically — 'What makes you feel most loved right now?' — prevents you from speaking yesterday's language.",
        },
        {
          id: "filling-the-tank",
          title: "The Emotional Tank",
          description: "Learning to read and respond to your partner's emotional fullness — proactively filling before it runs empty",
          icon: <Heart className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Rather than waiting until your partner feels neglected, building daily micro-deposits: a compliment at breakfast, a two-minute check-in call, a spontaneous hug in the kitchen. Small, consistent deposits prevent the kind of emotional bankruptcy that leads to resentment.",
        },
        {
          id: "receiving-gracefully",
          title: "Receiving Love Gracefully",
          description: "Learning to accept love in your partner's language — even when it's not how you'd naturally give it",
          icon: <HeartHandshake className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Your partner keeps buying you small gifts, and you've been dismissing them because gifts aren't your language. Recognizing that each gift is their heart saying 'I love you' — and responding with genuine gratitude rather than 'You didn't need to do that.'",
        },
        {
          id: "love-language-requests",
          title: "Making Clear Requests",
          description: "Asking for what you need in love language terms — specific, actionable, and without blame",
          icon: <Lightbulb className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "Instead of 'You never pay attention to me,' saying 'My love tank is running low. Would you be willing to put your phone away during dinner this week? That's the kind of quality time that fills me up.' Framing needs as invitations rather than indictments.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "bilingual-love",
          title: "Becoming Bilingual in Love",
          description: "Achieving fluency in both your own and your partner's love language — switching naturally between them",
          icon: <Users className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "You've practiced so consistently that speaking your partner's language no longer feels effortful. You naturally reach for their hand (their language) while also verbalizing what you appreciate about them (your language). Love becomes a bilingual conversation that satisfies you both.",
        },
        {
          id: "custom-rituals",
          title: "Creating Love Language Rituals",
          description: "Designing recurring practices that honor both partners' love languages and become the rhythm of your relationship",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Building a Sunday morning ritual: coffee together without phones (Quality Time), reading each other one thing you appreciated that week (Words), followed by making breakfast together (Acts of Service). A single ritual can speak multiple languages simultaneously.",
        },
        {
          id: "navigating-conflicts",
          title: "Love Languages in Conflict",
          description: "Using love language awareness to de-escalate disagreements and repair connection faster",
          icon: <Scale className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "During a disagreement, recognizing that your partner's anger is amplified because their love tank is empty. Pausing the argument to say 'Before we solve this, I want you to know I love you and I'm on your side' (Words) while reaching for their hand (Touch). Repair in their language lands faster.",
        },
        {
          id: "teaching-others",
          title: "Teaching Love Languages",
          description: "Sharing your understanding with children, friends, or family — extending the framework beyond your partnership",
          icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Helping your child understand why their sibling needs a hug after a hard day while they need words of encouragement. Or explaining to a friend why their partner keeps 'nagging' about helping around the house — it's their way of asking to be loved.",
        },
        {
          id: "creative-expression",
          title: "Creative Love Expression",
          description: "Inventing entirely new ways to speak your partner's language that are unique to your relationship",
          icon: <Palette className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "For a Words of Affirmation partner: recording a 'reasons I love you' playlist with voice notes between songs. For a Quality Time partner: creating an annual 'adventure jar' with date ideas you draw at random. The most meaningful expressions are ones no book could have suggested.",
        },
        {
          id: "love-language-legacy",
          title: "Your Love Language Legacy",
          description: "Understanding how your love language was shaped by your family of origin — and consciously choosing what you pass forward",
          icon: <Brain className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Recognizing that your need for Acts of Service comes from a childhood where love was shown through sacrifice, not words. Choosing to break the pattern by both serving and speaking — giving your children a richer vocabulary of love than you received.",
        },
        {
          id: "integrated-love",
          title: "Integrated Love Practice",
          description: "Moving beyond the framework itself — love languages become invisible because love has become your fluent, natural state",
          icon: <Flame className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "You stop thinking in categories. You simply notice what your partner needs in each moment and respond — a touch here, a word there, a quiet act of care. The five languages dissolve into one seamless practice: attentive, responsive love that adapts in real time.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="love-languages"
      title="5 Love Languages"
      description="Discover the primary ways you and your partner express and receive love. Progress from discovery to fluent expression."
      tiers={tiers}
    />
  );
}
