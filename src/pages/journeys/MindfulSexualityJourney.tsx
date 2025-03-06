import JourneyTemplate from "./JourneyTemplate";
import {
  Brain,
  Heart,
  Eye,
  Sparkles,
  Feather,
  Compass,
  Flame,
  Leaf
} from "lucide-react";

export default function MindfulSexualityJourney() {
  // Define all the core concepts for mindful sexuality
  const mindfulSexualityConcepts = [
    {
      id: "presence",
      title: "Present Awareness",
      description: "Cultivating full attention in intimate moments",
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Learning to bring your full attention to the present moment during intimate experiences, noticing when your mind wanders and gently bringing it back to your body and your partner."
    },
    {
      id: "sensory-awareness",
      title: "Sensory Exploration",
      description: "Deepening awareness of physical sensations",
      icon: <Eye className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Developing greater awareness of subtle physical sensations, learning to track pleasure in your body, and staying connected to sensory experiences during intimacy."
    },
    {
      id: "non-judgment",
      title: "Non-Judgmental Presence",
      description: "Releasing evaluation and performance pressure",
      icon: <Feather className="w-5 h-5 text-sky-500" />,
      color: "sky",
      example: "Practicing acceptance of yourself, your partner, and your experiences without evaluation or criticism, allowing intimacy to unfold naturally without pressure."
    },
    {
      id: "emotional-attunement",
      title: "Emotional Connection",
      description: "Bringing awareness to emotional intimacy during physical connection",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Staying aware of and expressing emotional experiences during intimacy, deepening the connection between physical and emotional intimacy."
    },
    {
      id: "curiosity",
      title: "Mindful Curiosity",
      description: "Approaching intimacy with openness and wonder",
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Cultivating an attitude of exploration and discovery in your intimate experiences, being willing to notice new sensations and possibilities without attachment to specific outcomes."
    },
    {
      id: "energy-awareness",
      title: "Energy & Flow",
      description: "Noticing and working with sexual energy",
      icon: <Sparkles className="w-5 h-5 text-violet-500" />,
      color: "violet",
      example: "Developing awareness of sexual energy in your body, learning to cultivate and direct it, and creating flow between partners through mindful connection."
    },
    {
      id: "embodiment",
      title: "Full Embodiment",
      description: "Being fully present in your body during intimacy",
      icon: <Leaf className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Practicing techniques to feel more connected to and present in your body during intimate experiences, moving from mental activity to embodied presence."
    },
    {
      id: "sacred-sexuality",
      title: "Sacred Connection",
      description: "Bringing reverence and intention to sexual experiences",
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Creating sacred space for intimate connection through rituals, intention setting, and practices that honor the profound nature of sexual union."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="mindful-sexuality"
      title="Mindful Sexuality"
      totalDays={28} // 4 weeks
      conceptItems={mindfulSexualityConcepts}
      backPath="/path-to-together"
      headerImage="https://images.unsplash.com/photo-1515161318750-781d6122e367"
      cardImage="https://images.unsplash.com/photo-1519975258993-60b42d1c2ee2"
      conceptSelectionPrompt="Which areas would you like to explore today?"
      completionCriteria={{
        requireConceptSelection: true,
        requireReflection: true,
        minReflectionLength: 30,
        requireActivity: true
      }}
    />
  );
} 