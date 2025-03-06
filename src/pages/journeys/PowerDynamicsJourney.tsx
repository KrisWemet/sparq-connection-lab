import JourneyTemplate from "./JourneyTemplate";
import {
  Scale,
  MessageSquare,
  Heart,
  Shield,
  Sparkles,
  ArrowLeftRight,
  Lightbulb,
  Handshake
} from "lucide-react";

export default function PowerDynamicsJourney() {
  // Define all the core concepts for power dynamics
  const powerDynamicsConcepts = [
    {
      id: "power-awareness",
      title: "Power Awareness",
      description: "Understanding how power naturally exists in relationships",
      icon: <Scale className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Learning to recognize power dynamics in everyday interactions, from decision-making patterns to emotional influence, and understanding how these dynamics affect your relationship."
    },
    {
      id: "conscious-exchange",
      title: "Conscious Exchange",
      description: "Intentionally exploring power dynamics together",
      icon: <ArrowLeftRight className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Creating intentional exchanges of power that feel exciting and fulfilling for both partners, whether in everyday situations or intimate settings."
    },
    {
      id: "communication",
      title: "Power Communication",
      description: "Discussing desires and boundaries around power",
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Developing skills to talk openly about power dynamics, express desires for different kinds of power exchange, and negotiate boundaries that feel safe for both partners."
    },
    {
      id: "consent-safety",
      title: "Consent & Safety",
      description: "Creating secure foundations for power exploration",
      icon: <Shield className="w-5 h-5 text-red-500" />,
      color: "red",
      example: "Establishing clear consent practices, safety measures, and ongoing check-ins that allow both partners to feel secure while exploring power dynamics."
    },
    {
      id: "emotional-intimacy",
      title: "Emotional Connection",
      description: "Deepening intimacy through power exchange",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Understanding how conscious power dynamics can create deeper emotional connection, vulnerability, and trust between partners."
    },
    {
      id: "power-play",
      title: "Creative Expression",
      description: "Exploring varied expressions of power dynamics",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Discovering different ways to express and explore power dynamics, from playful role-playing to more structured power exchange scenarios."
    },
    {
      id: "self-awareness",
      title: "Personal Patterns",
      description: "Understanding your relationship with power",
      icon: <Lightbulb className="w-5 h-5 text-cyan-500" />,
      color: "cyan",
      example: "Exploring your personal history with power, including cultural influences, past experiences, and natural tendencies in power dynamics."
    },
    {
      id: "balance-flexibility",
      title: "Dynamic Balance",
      description: "Creating flexible, balanced power dynamics",
      icon: <Handshake className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Developing the ability to move fluidly between different power dynamics, ensuring both partners have opportunities to experience different roles and expressions of power."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="power-dynamics"
      title="Power Dynamics & Play"
      totalDays={28} // 4 weeks
      conceptItems={powerDynamicsConcepts}
      backPath="/path-to-together"
      headerImage="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70"
      cardImage="https://images.unsplash.com/photo-1516146544193-b54a65682f16"
      conceptSelectionPrompt="Which dynamics interest you to explore safely?"
      completionCriteria={{
        requireConceptSelection: true,
        requireReflection: true,
        minReflectionLength: 45,
        requireActivity: true
      }}
    />
  );
} 