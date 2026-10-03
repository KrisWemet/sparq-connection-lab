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
          story: "At a friend's party, Aiko watched Daniel from across the room. The way he tilted his head when someone talked. The way he made the shy guest laugh. She'd stopped noticing these things years ago. On the drive home, she told him. He went quiet, then grinned.",
        },
        {
          id: "appreciation-revival",
          title: "Reviving Appreciation",
          description: "Rebuilding the habit of noticing and expressing what you love about your partner",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "In Gottman's research, couples who did well had about five positive moments for every negative one during conflict. If yours has slipped, start with one specific appreciation per day: 'I noticed how patient you were with the kids tonight. That really meant something to me.'",
          story: "Rosa decided on one small thing: one specific thank-you to Ben every day. \"Thanks for warming up the car.\" \"I loved how you talked to our daughter just now.\" By the end of the week, Ben had started doing the same.",
        },
        {
          id: "autopilot-awareness",
          title: "Recognizing Autopilot",
          description: "Noticing the routines and assumptions that have made your relationship feel predictable",
          icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Realizing that your evenings have become: dinner, screens, bed, repeat. Or that you haven't asked your partner a genuine question in weeks. Autopilot isn't a failure — it's human. But awareness is the first step to choosing differently.",
          story: "One evening, Hannah noticed it: dinner, screens, bed, repeat. She couldn't remember the last real question she'd asked Raj. It wasn't a crisis. It was just autopilot. She turned off the TV. \"Hey. How are you, really?\"",
        },
        {
          id: "nostalgia-connection",
          title: "Reconnecting Through Your Story",
          description: "Revisiting the early days of your relationship to remember what drew you together",
          icon: <Star className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Looking at old photos together, revisiting the place you had your first date, or asking 'What was your first impression of me?' Gottman calls this 'nurturing your fondness and admiration system' — it strengthens the friendship that underlies romance.",
          story: "Grace and Luis dug out their old photos on a rainy Sunday. \"What did you think of me when we first met?\" Grace asked. Luis laughed. \"That you were way out of my league.\" They stayed up late, remembering why they started.",
        },
        {
          id: "novelty-seeking",
          title: "Introducing Novelty",
          description: "Breaking routine with new shared experiences that create excitement and fresh memories",
          icon: <Zap className="w-5 h-5 text-orange-500" />,
          color: "orange",
          example: "Aron's research on self-expansion theory shows that couples who do novel activities together feel more attracted to each other. Take a cooking class, explore a new neighborhood, try something neither of you has done before.",
          story: "Wei and Sophie had the same Friday for years. So they signed up for a dance class neither knew anything about. They stepped on each other's feet the whole time. Driving home, Sophie kept looking over at him, smiling like it was a first date.",
        },
        {
          id: "curiosity-revival",
          title: "Reviving Curiosity",
          description: "Asking your partner questions you've never asked — or asking old questions again with genuine interest",
          icon: <Lightbulb className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "'What's something you've been wanting to try but haven't told me about?' 'If you could change one thing about our daily routine, what would it be?' Curiosity signals: 'I don't assume I know everything about you — and I want to learn more.'",
          story: "\"What's something you've wanted to try but never told me?\" Isaac asked. Zoe hesitated. \"Rock climbing.\" He had no idea. Two weeks later, they were both clinging to a wall at the climbing gym, laughing.",
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
          story: "Every Saturday, Leah and Marcus stayed home. This Saturday, they drove a different road just to see where it went. They found a tiny bakery in a town they'd never heard of. Small change. Whole new day.",
        },
        {
          id: "date-reinvention",
          title: "Reinventing Date Night",
          description: "Moving beyond dinner-and-a-movie to create dates that actually generate connection",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Taking turns planning surprise experiences. One partner plans 'the activity,' the other plans 'the meal' — but neither reveals their plan until the day arrives. Or: each partner writes 3 date ideas on slips of paper, you draw one blindly.",
          story: "Jordan planned the activity. Priya planned the meal. Neither told the other until the night came. It turned out to be mini golf and a food truck. It was silly and perfect, and they both were already planning the next one.",
        },
        {
          id: "micro-connections",
          title: "Building Micro-Connections",
          description: "Creating small, consistent moments of connection throughout the day",
          icon: <Clock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "A 6-second kiss when you say goodbye (a Gottman suggestion — long enough to really notice each other). A 2-minute check-in at lunch. A specific question at dinner: 'What was the best part of your day?' Micro-connections prevent drift.",
          story: "Sam started kissing Theo goodbye for a full six seconds instead of a quick peck. It felt a bit dramatic the first time. They both laughed. But by the end of the week, those six seconds had become the best part of their mornings.",
        },
        {
          id: "playfulness",
          title: "Rediscovering Playfulness",
          description: "Bringing humor, lightness, and fun back into your relationship",
          icon: <Palette className="w-5 h-5 text-pink-500" />,
          color: "pink",
          example: "Having a spontaneous dance in the kitchen. Leaving funny notes in unexpected places. Playing a board game instead of watching TV. Inside jokes. Playfulness signals safety — you can't play when you're in survival mode.",
          story: "While doing dishes, Mateo put on an old song and pulled Clara into a clumsy dance. Soap bubbles went everywhere. The kids, home for the weekend, groaned. Clara couldn't stop laughing.",
        },
        {
          id: "growth-conversations",
          title: "Having Growth Conversations",
          description: "Talking about who you're becoming — not just who you are",
          icon: <MessageSquare className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "'What's something you want to learn this year?' 'How do you want to grow as a person?' 'What kind of old couple do you want us to be?' Growth conversations keep the relationship evolving instead of crystallizing.",
          story: "On a long drive, Nia asked, \"What kind of old couple do you want us to be?\" Omar thought for a mile. \"The kind that still holds hands at the grocery store.\" Nia smiled. \"Me too.\"",
        },
        {
          id: "shared-projects",
          title: "Creating Shared Projects",
          description: "Working toward a goal together that requires collaboration and creates shared meaning",
          icon: <Users className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Planting a garden together. Training for a race. Renovating a room. Planning a trip to a place neither has been. Shared projects create the 'we' narrative that Gottman identifies as essential: 'We built that. We did that together.'",
          story: "Ellie and Jo decided to plant a garden, though neither had ever grown anything. Half the seeds didn't come up. The tomatoes went wild. Every evening, they stood out there together, checking on what they'd made.",
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
          story: "Every Sunday morning, Kofi and Anna sit down with coffee for what they call \"state of us.\" What went well. What felt off. What they want next week. It takes fifteen minutes. It keeps them from drifting.",
        },
        {
          id: "evolving-together",
          title: "Supporting Each Other's Evolution",
          description: "Encouraging individual growth as fuel for relationship growth, not a threat to it",
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          color: "green",
          example: "Your partner wants to take up painting or go back to school. Instead of feeling threatened by their growth, getting excited: 'Tell me about what you're learning.' Esther Perel writes that desire often grows when each partner has their own sources of energy and interest.",
          story: "Dev decided to go back to school at thirty-two. Maya felt a small twist of worry — would he change? Then she chose curiosity instead. \"Tell me what you're learning,\" she said every night. And he did.",
        },
        {
          id: "renewed-commitment",
          title: "Renewing Your Commitment",
          description: "Choosing your partner again — not out of obligation, but from the deepest place of knowing",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Saying — in your own words, in your own time — 'I've seen all of you now. The beautiful parts and the hard parts. And I choose you. Not the you from 10 years ago. The you right now, right here.' This is the most powerful sentence in a long-term relationship.",
          story: "On an ordinary Tuesday, Ben said to Rosa, \"I've seen all of you now. The beautiful parts and the hard parts. And I choose you. Not the you from ten years ago. You, right now.\" Rosa didn't say anything. She didn't need to.",
        },
        {
          id: "embracing-seasons",
          title: "Embracing Relationship Seasons",
          description: "Understanding that every relationship has seasons of closeness and distance — and both are normal",
          icon: <Compass className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Recognizing that the quiet period you're in isn't a sign of failure — it's winter. And winter is when roots grow deepest. Couples who thrive long-term learn to trust the seasons instead of panicking during the quiet ones.",
          story: "The last few months had felt quiet between Aiko and Daniel. Not bad — just quiet. Aiko worried. Then she remembered: winter isn't death. It's when roots grow deep. They kept showing up. By spring, something new had started to bloom.",
        },
        {
          id: "legacy-of-love",
          title: "Building Your Love Legacy",
          description: "Consciously creating the story of your relationship that will inspire others",
          icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Your relationship becomes something others learn from — not because it's perfect, but because it's real. Your children, friends, and community see two people who chose each other, did the work, and kept growing. That's a legacy worth building.",
          story: "At their twentieth anniversary party, Mateo and Clara's daughter gave a toast. \"You two aren't perfect,\" she said. \"But I watched you choose each other every day. That's what I want.\" Clara reached for Mateo's hand.",
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
