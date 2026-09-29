import JourneyTemplate from "./journey-template";
import {
  Sparkles,
  MessageSquare,
  Shield,
  Heart,
  Eye,
  Palette,
  Lock,
  HandHeart,
  Users,
  Compass,
  Lightbulb,
  Brain,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function FantasyExplorationJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "normalizing-fantasy",
          title: "Normalizing Fantasy",
          description: "Understanding that having fantasies is a universal, healthy part of human sexuality",
          icon: <Brain className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Research shows that 97% of adults have sexual fantasies. Many people carry shame about theirs. The first step is understanding: having a fantasy doesn't mean you need to act on it, and it doesn't say anything negative about your relationship or your character.",
          story: "Wei had carried quiet shame about a daydream for years. One night he read that almost everyone has fantasies, and that having one says nothing bad about you. He let out a breath he didn't know he'd been holding.",
        },
        {
          id: "fantasy-vs-desire",
          title: "Fantasy vs. Desire vs. Intent",
          description: "Distinguishing between what you imagine, what you want, and what you'd actually do",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "A fantasy about a spontaneous encounter doesn't mean you want to be unfaithful. A fantasy about being dominant doesn't mean you want to control your partner. Fantasy is the mind's playground — it operates by different rules than reality. This distinction is liberating.",
          story: "Sophie worried a daydream meant something was wrong with their marriage. Then she learned that a fantasy is just imagination, not a plan and not a wish to leave. \"It's a story in my head,\" she realized. \"Not a map of what I want to do.\"",
        },
        {
          id: "building-safety-for-sharing",
          title: "Building Safety for Sharing",
          description: "Creating the conditions where both partners feel safe to reveal their inner world without judgment",
          icon: <Shield className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Establishing ground rules before sharing: 'Nothing shared here will be used against you later. No one is obligated to act on anything. Reactions will be curiosity, not judgment.' These agreements create the container that makes vulnerability possible.",
          story: "Before they shared anything, Ellie and Jo agreed on three rules: nothing shared gets used against each other later, nobody has to act on anything, and the only reaction allowed is curiosity. With those rules in place, it felt safe to begin.",
        },
        {
          id: "sharing-spectrum",
          title: "The Sharing Spectrum",
          description: "Understanding that vulnerability is graduated — you don't have to share everything at once",
          icon: <Compass className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Start with low-stakes sharing: 'I've always thought it would be fun to...' before progressing to deeper revelations. Each successful share builds trust for the next. There's no timeline — the pace is whatever feels safe for both partners.",
          story: "Dev started small: \"I've always thought it would be fun to go away for a weekend with no plans.\" Maya smiled and shared something small of her own. Each small share made the next one feel a little easier.",
        },
        {
          id: "receiving-disclosure",
          title: "Receiving Your Partner's Disclosure",
          description: "Responding to your partner's fantasy sharing with curiosity and warmth, even if it surprises you",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "When your partner shares something unexpected, resisting the urge to react with shock or dismissal. Instead: 'Thank you for telling me that. Tell me more about what appeals to you about it.' Your response in this moment determines whether they ever share again.",
          story: "When Priya shared something that surprised Jordan, their first instinct was to look shocked. They caught it. \"Thank you for trusting me with that,\" Jordan said. \"Tell me more about what draws you to it?\" Priya's whole body relaxed.",
        },
        {
          id: "consent-communication",
          title: "Consent-Centered Communication",
          description: "Building a vocabulary of enthusiastic consent that makes exploration feel safe",
          icon: <Lock className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Moving beyond 'Is this okay?' to richer consent language: 'What do you want?' 'How does this feel?' 'Do you want more or should we pause?' 'What would make this even better?' Consent isn't a single checkbox — it's an ongoing, enthusiastic conversation.",
          story: "Instead of a quick \"Is this okay?\", Kofi and Anna started asking richer questions: \"What do you want? How does this feel? More, or should we pause?\" Checking in stopped feeling like a speed bump and started feeling like care.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "exploring-themes",
          title: "Exploring Fantasy Themes",
          description: "Understanding the emotional needs behind common fantasy categories",
          icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "A fantasy about being desired may reflect a need to feel wanted. A fantasy about surrender may reflect a need to release control. Understanding the emotional core of a fantasy opens up many ways to meet that need — some sexual, some not.",
          story: "Leah noticed her daydreams were almost always about being chosen and wanted. When she and Marcus talked about it, they realized what she was really craving: to feel desired in everyday life. That was something he could give her every day.",
        },
        {
          id: "creative-incorporation",
          title: "Creative Incorporation",
          description: "Finding ways to bring elements of fantasies into your relationship that feel good for both partners",
          icon: <Palette className="w-5 h-5 text-pink-500" />,
          color: "pink",
          example: "If one partner fantasizes about spontaneity, you might plan a 'surprise' encounter at an unexpected time. If the theme is being desired, one partner might write a detailed description of what they find irresistible. Incorporation is creative, not literal.",
          story: "Theo's daydreams were all about spontaneity. So Sam planned a surprise night out, a little adventure with no warning. It wasn't about acting out anything exactly. It was about honoring what the daydream was pointing to.",
        },
        {
          id: "navigating-differences",
          title: "When Fantasies Don't Overlap",
          description: "Gracefully handling the gap between what one partner wants to explore and the other's comfort zone",
          icon: <Users className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "One partner's fantasy is the other's hard boundary. This is normal and doesn't have to be a source of rejection. 'I love that you shared that with me. That specific thing isn't something I'm comfortable with, but the part about feeling desired — let's explore that in a way we both enjoy.'",
          story: "When Isaac shared a daydream, Zoe knew it wasn't for her. She didn't recoil. \"I love that you told me,\" she said. \"That one's not for me. But I'm glad I know you better.\" Isaac felt accepted, not rejected.",
        },
        {
          id: "playfulness-and-humor",
          title: "Bringing Playfulness to Exploration",
          description: "Approaching sexual exploration with lightness, humor, and permission to laugh",
          icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Trying something new and it's awkward? Laughing together about it instead of being mortified. 'Well, that didn't go as planned!' Play is the opposite of performance. When exploration is playful, 'failure' doesn't exist — only discovery.",
          story: "Their first try at something new was so awkward that Grace burst out laughing, and then Luis did too. \"Well, that didn't go as planned,\" he said. They laughed until they cried. It was one of their best nights.",
        },
        {
          id: "boundaries-as-care",
          title: "Boundaries as Acts of Care",
          description: "Understanding that clear boundaries make deeper exploration possible, not limited",
          icon: <Shield className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "A clear boundary like 'I'm open to exploring with words and imagination, but not physically acting this out' isn't rejection — it's information that makes the exploration safer. The clearer the boundaries, the more freedom exists within them.",
          story: "\"I'm happy to explore this in words and imagination,\" Aiko told Daniel, \"but not to act it out.\" She worried it would sound like rejection. Instead, Daniel felt safer. Now he knew exactly where the edges were.",
        },
        {
          id: "building-erotic-imagination",
          title: "Building Erotic Imagination Together",
          description: "Developing a shared fantasy life that belongs to both of you",
          icon: <MessageSquare className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Writing a fantasy together — one paragraph at a time, passing it back and forth. Or verbally building a scenario together: 'What if we were...' 'And then you would...' 'And I'd feel...' The shared creation is as intimate as any physical act.",
          story: "Ellie and Jo started writing a story together, one line at a time, passing a notebook back and forth over a week. It got silly, then sweet, then surprising. The notebook lives in a drawer only they know about.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "fantasy-as-intimacy-tool",
          title: "Fantasy as an Intimacy Tool",
          description: "Using shared fantasy life to deepen emotional and physical connection",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "A shared fantasy becomes a private world that belongs only to you two — an intimacy accelerator. Referencing it with a look across a dinner table, a whispered word, a text. This private erotic world strengthens the couple bond in all its dimensions.",
          story: "Mateo and Clara have a private world now, a shared daydream that belongs only to them. Across a crowded dinner table, one look is enough to make Clara grin. Nobody else knows why.",
        },
        {
          id: "ongoing-disclosure",
          title: "Ongoing Disclosure Practice",
          description: "Making fantasy sharing a regular, natural part of your relationship conversation",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Fantasy sharing evolves from 'a big scary conversation' to a normal part of your intimate life. 'I had an interesting thought today...' becomes as natural as 'How was your day?' This ongoing openness prevents secrets and keeps curiosity alive.",
          story: "At first, sharing a daydream felt like a huge, scary moment for Rosa and Ben. Now it's easy: \"I had a fun thought today…\" They share it the same way they'd share a funny thing from work.",
        },
        {
          id: "integration-identity",
          title: "Integrating Fantasy into Identity",
          description: "Accepting your full erotic self without shame — and being fully accepted by your partner",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Being able to say 'This is part of who I am erotically' without shame, and hearing your partner say 'I love all of who you are — including this part.' Perel calls this 'erotic self-acceptance.' It's transformative for both individual and relational well-being.",
          story: "\"This is part of who I am,\" Nia said quietly, without shame for the first time. Omar held her gaze. \"I love all of who you are, including this.\" Something she had hidden for years finally felt welcome.",
        },
        {
          id: "creative-erotic-life",
          title: "Sustaining a Creative Erotic Life",
          description: "Building habits that keep your shared sexual imagination vibrant and evolving",
          icon: <Palette className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "A monthly 'erotic conversation' where you share new thoughts, revisit old fantasies, and explore what's evolving. Reading or watching something together and discussing it. The creative erotic life, like any creative practice, needs regular tending.",
          story: "Once a month, Hannah and Raj have a slow, playful conversation about what's new in their imaginations: old daydreams, new ones, what's changing. It keeps their intimate life alive and growing, not stuck.",
        },
        {
          id: "trust-through-vulnerability",
          title: "Deepened Trust Through Erotic Vulnerability",
          description: "Recognizing that sharing your most private inner world has built a bond that extends far beyond the bedroom",
          icon: <Lock className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "The trust you've built through fantasy sharing spills into everything. You're more honest in conflicts. More vulnerable in daily life. More confident in who you are. Erotic vulnerability, it turns out, is just vulnerability — and it transforms the whole relationship.",
          story: "The courage it took to share their inner worlds spilled over into everything else. Jordan and Priya now say hard things in fights more honestly. They ask for what they need more bravely. Being seen in one place made them braver everywhere.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="fantasy-exploration"
      title="Fantasy Exploration"
      description="Safely share and explore desires to deepen trust and playfulness. Progress from normalizing fantasy to building a vibrant shared erotic imagination."
      tiers={tiers}
    />
  );
}
