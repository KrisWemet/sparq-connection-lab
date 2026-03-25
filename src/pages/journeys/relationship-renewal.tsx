import JourneyTemplate from "./journey-template";
import {
  RefreshCw,
  Sparkles,
  Heart,
  Eye,
  Compass,
  Users,
  Star,
  Zap,
  MessageSquare,
  Clock,
  Lightbulb,
  Palette,
  TreePine,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function RelationshipRenewalJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "seeing-fresh",
          title: "Seeing Your Partner with Fresh Eyes",
          description: "Breaking through the familiarity filter to rediscover who your partner actually is right now",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Watching your partner at a party and noticing things you haven't seen in years — how they laugh, how they put others at ease, the way they tilt their head when listening. Familiarity creates blindness; intentional observation restores wonder.",
        },
        {
          id: "appreciation-revival",
          title: "Reviving Appreciation",
          description: "Rebuilding the habit of noticing and expressing what you love about your partner",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Gottman's research shows that thriving couples have a 5:1 ratio of positive to negative interactions. If yours has slipped, start with one specific appreciation per day: 'I noticed how patient you were with the kids tonight. That really meant something to me.'",
        },
        {
          id: "autopilot-awareness",
          title: "Recognizing Autopilot",
          description: "Noticing the routines and assumptions that have made your relationship feel predictable",
          icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Realizing that your evenings have become: dinner, screens, bed, repeat. Or that you haven't asked your partner a genuine question in weeks. Autopilot isn't a failure — it's human. But awareness is the first step to choosing differently.",
        },
        {
          id: "nostalgia-connection",
          title: "Reconnecting Through Your Story",
          description: "Revisiting the early days of your relationship to remember what drew you together",
          icon: <Star className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Looking at old photos together, revisiting the place you had your first date, or asking 'What was your first impression of me?' Gottman calls this 'nurturing your fondness and admiration system' — it strengthens the friendship that underlies romance.",
        },
        {
          id: "novelty-seeking",
          title: "Introducing Novelty",
          description: "Breaking routine with new shared experiences that create excitement and fresh memories",
          icon: <Zap className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "Aron's research on self-expansion theory shows that couples who do novel activities together feel more attracted to each other. Take a cooking class, explore a new neighborhood, try something neither of you has done before.",
        },
        {
          id: "curiosity-revival",
          title: "Reviving Curiosity",
          description: "Asking your partner questions you've never asked — or asking old questions again with genuine interest",
          icon: <Lightbulb className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "'What's something you've been wanting to try but haven't told me about?' 'If you could change one thing about our daily routine, what would it be?' Curiosity signals: 'I don't assume I know everything about you — and I want to learn more.'",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "breaking-patterns",
          title: "Breaking Routine Intentionally",
          description: "Deliberately disrupting the patterns that have made your relationship feel stale",
          icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Swap your usual Saturday routine. If you always stay home, go out. If you always go out, create something special at home. Sit in different spots at the dinner table. Drive a different route together. Small disruptions wake up your brain's attention systems.",
        },
        {
          id: "date-reinvention",
          title: "Reinventing Date Night",
          description: "Moving beyond dinner-and-a-movie to create dates that actually generate connection",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Taking turns planning surprise experiences. One partner plans 'the activity,' the other plans 'the meal' — but neither reveals their plan until the day arrives. Or: each partner writes 3 date ideas on slips of paper, you draw one blindly.",
        },
        {
          id: "micro-connections",
          title: "Building Micro-Connections",
          description: "Creating small, consistent moments of connection throughout the day",
          icon: <Clock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "A 6-second kiss when you say goodbye (research shows this is long enough to create genuine connection). A 2-minute check-in at lunch. A specific question at dinner: 'What was the best part of your day?' Micro-connections prevent drift.",
        },
        {
          id: "playfulness",
          title: "Rediscovering Playfulness",
          description: "Bringing humor, lightness, and fun back into your relationship",
          icon: <Palette className="w-5 h-5 text-pink-500" />,
          color: "pink",
          example: "Having a spontaneous dance in the kitchen. Leaving funny notes in unexpected places. Playing a board game instead of watching TV. Inside jokes. Playfulness signals safety — you can't play when you're in survival mode.",
        },
        {
          id: "growth-conversations",
          title: "Having Growth Conversations",
          description: "Talking about who you're becoming — not just who you are",
          icon: <MessageSquare className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "'What's something you want to learn this year?' 'How do you want to grow as a person?' 'What kind of old couple do you want us to be?' Growth conversations keep the relationship evolving instead of crystallizing.",
        },
        {
          id: "shared-projects",
          title: "Creating Shared Projects",
          description: "Working toward a goal together that requires collaboration and creates shared meaning",
          icon: <Users className="w-5 h-5 text-indigo-500" />,
          color: "indigo",
          example: "Planting a garden together. Training for a race. Renovating a room. Planning a trip to a place neither has been. Shared projects create the 'we' narrative that Gottman identifies as essential: 'We built that. We did that together.'",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "creating-rituals",
          title: "Creating Your Connection Rituals",
          description: "Designing recurring practices that sustain renewal long-term — not as obligations, but as gifts",
          icon: <Star className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "A weekly 'state of the union' conversation over coffee. A monthly adventure day. An annual relationship retreat — even if it's just a night at a hotel. Rituals prevent autopilot from returning by building renewal into the structure of your life.",
        },
        {
          id: "evolving-together",
          title: "Supporting Each Other's Evolution",
          description: "Encouraging individual growth as fuel for relationship growth, not a threat to it",
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          color: "green",
          example: "Your partner wants to take up painting or go back to school. Instead of feeling threatened by their growth, getting excited: 'Tell me about what you're learning.' Perel's research shows that eroticism thrives when partners have their own sources of vitality.",
        },
        {
          id: "renewed-commitment",
          title: "Renewing Your Commitment",
          description: "Choosing your partner again — not out of obligation, but from the deepest place of knowing",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Saying — in your own words, in your own time — 'I've seen all of you now. The beautiful parts and the hard parts. And I choose you. Not the you from 10 years ago. The you right now, right here.' This is the most powerful sentence in a long-term relationship.",
        },
        {
          id: "embracing-seasons",
          title: "Embracing Relationship Seasons",
          description: "Understanding that every relationship has seasons of closeness and distance — and both are normal",
          icon: <Compass className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Recognizing that the quiet period you're in isn't a sign of failure — it's winter. And winter is when roots grow deepest. Couples who thrive long-term learn to trust the seasons instead of panicking during the quiet ones.",
        },
        {
          id: "legacy-of-love",
          title: "Building Your Love Legacy",
          description: "Consciously creating the story of your relationship that will inspire others",
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          color: "purple",
          example: "Your relationship becomes something others learn from — not because it's perfect, but because it's real. Your children, friends, and community see two people who chose each other, did the work, and kept growing. That's a legacy worth building.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="relationship-renewal"
      title="Relationship Renewal"
      description="Reignite connection and rediscover your partner after years together. Progress from recognizing autopilot to building a vibrant, evolving partnership."
      tiers={tiers}
    />
  );
}
