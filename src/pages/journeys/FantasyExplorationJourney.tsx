import JourneyTemplate from "./JourneyTemplate";
import {
  Sparkles,
  MessageSquare,
  Shield,
  Heart,
  Flame,
  Feather,
  Lightbulb,
  Compass
} from "lucide-react";

export default function FantasyExplorationJourney() {
  // Define all the core concepts for fantasy exploration
  const fantasyExplorationConcepts = [
    {
      id: "fantasy-understanding",
      title: "Fantasy Nature",
      description: "Understanding the role and value of sexual fantasies",
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Learning about the nature of fantasies, their psychological role, and how they can enhance your intimate life while recognizing that not all fantasies need to be acted upon."
    },
    {
      id: "safe-sharing",
      title: "Safe Sharing",
      description: "Creating safety for vulnerable fantasy disclosure",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Establishing a judgment-free space where both partners can share fantasies without fear of criticism, ensuring emotional safety during vulnerable disclosures."
    },
    {
      id: "communication-skills",
      title: "Fantasy Communication",
      description: "Developing skills to discuss desires and boundaries",
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Learning how to express fantasies clearly and listen without judgment, including how to discuss boundaries and comfort levels around exploration."
    },
    {
      id: "emotional-connection",
      title: "Intimate Bonding",
      description: "Deepening connection through fantasy sharing",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Understanding how sharing fantasies can create deeper intimacy and trust, using fantasy exploration as a tool for emotional connection."
    },
    {
      id: "exploration-skills",
      title: "Playful Exploration",
      description: "Learning ways to explore fantasies safely",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Discovering different methods for exploring fantasies, from dirty talk to role-play, while maintaining comfort and safety for both partners."
    },
    {
      id: "desire-mapping",
      title: "Desire Discovery",
      description: "Mapping your desires and turn-ons",
      icon: <Compass className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Creating a personal map of what excites you, understanding your triggers for arousal, and identifying which fantasies you might want to explore further."
    },
    {
      id: "gentle-approach",
      title: "Gradual Progress",
      description: "Taking a measured approach to exploration",
      icon: <Feather className="w-5 h-5 text-cyan-500" />,
      color: "cyan",
      example: "Learning to pace fantasy exploration, starting with smaller steps and gradually building comfort and trust before exploring more intense scenarios."
    },
    {
      id: "erotic-imagination",
      title: "Erotic Creativity",
      description: "Developing your erotic imagination",
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Expanding your capacity for erotic imagination, learning to create and share fantasy scenarios that excite both partners while respecting boundaries."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="fantasy-exploration"
      title="Fantasy Exploration"
      totalDays={21} // 3 weeks
      conceptItems={fantasyExplorationConcepts}
      backPath="/path-to-together"
      headerImage="https://images.unsplash.com/photo-1516146544193-b54a65682f16"
      cardImage="https://images.unsplash.com/photo-1515161318750-781d6122e367"
      conceptSelectionPrompt="Which aspects of fantasy would you like to understand better?"
      completionCriteria={{
        requireConceptSelection: true,
        requireReflection: true,
        minReflectionLength: 35,
        requireActivity: true
      }}
    />
  );
} 