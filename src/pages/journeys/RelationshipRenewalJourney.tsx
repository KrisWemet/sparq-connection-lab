import JourneyTemplate from "./JourneyTemplate";
import {
  RefreshCw,
  Sparkles,
  HeartPulse,
  Compass,
  Calendar,
  Lightbulb,
  BookOpen,
  Map
} from "lucide-react";

export default function RelationshipRenewalJourney() {
  // Define all the core concepts for relationship renewal
  const renewalConcepts = [
    {
      id: "novelty",
      title: "Novelty & Surprise",
      description: "Breaking routines and creating new shared experiences",
      icon: <Sparkles className="w-5 h-5 text-violet-500" />,
      color: "violet",
      example: "Introducing unexpected elements into your relationship, like trying completely new activities together, surprising each other with thoughtful gestures, or breaking out of established routines."
    },
    {
      id: "rediscovery",
      title: "Partner Rediscovery",
      description: "Seeing your partner with fresh eyes and ongoing curiosity",
      icon: <Compass className="w-5 h-5 text-cyan-500" />,
      color: "cyan",
      example: "Asking new questions to learn about your partner's evolving thoughts, dreams, and inner world, acknowledging that people continue to change and grow throughout their lives."
    },
    {
      id: "rituals",
      title: "Connection Rituals",
      description: "Creating meaningful practices that maintain your bond",
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Establishing consistent, intentional times for connection, such as weekly date nights, morning check-ins, or annual relationship retreats to reflect on your partnership."
    },
    {
      id: "growth",
      title: "Shared Growth",
      description: "Learning and evolving together through new challenges",
      icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Pursuing growth opportunities together, like taking a class, starting a project, or setting shared goals that allow you to develop new skills and aspects of yourselves as a team."
    },
    {
      id: "play",
      title: "Playfulness",
      description: "Bringing lightheartedness and joy into your interactions",
      icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Incorporating more play into your relationship through games, humor, lighthearted teasing, or activities that bring out your childlike sense of wonder and fun."
    },
    {
      id: "appreciation",
      title: "Active Appreciation",
      description: "Counteracting habituation through gratitude practices",
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Developing habits that help you notice and express appreciation for your partner, such as daily gratitude sharing or writing down things you love about each other."
    },
    {
      id: "desire",
      title: "Desire Cultivation",
      description: "Nurturing romantic and sexual connection through intentional practices",
      icon: <Lightbulb className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Creating conditions that support desire in long-term relationships, like maintaining some mystery, creating anticipation, and prioritizing your sexual connection."
    },
    {
      id: "adaptation",
      title: "Adaptive Partnership",
      description: "Evolving your relationship through life transitions",
      icon: <Map className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Intentionally redesigning aspects of your relationship as you move through major life changes, ensuring your partnership evolves to meet new circumstances and needs."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="relationship-renewal"
      title="Relationship Renewal"
      totalDays={35} // 5 weeks
      conceptItems={renewalConcepts}
      backPath="/path-to-together"
      headerImage="https://images.unsplash.com/photo-1522849789990-26252a8f8e62"
      cardImage="https://images.unsplash.com/photo-1494774157365-9e04c6720e47"
      conceptSelectionPrompt="Which areas of your relationship need renewal?"
      completionCriteria={{
        requireConceptSelection: true,
        requireReflection: true,
        minReflectionLength: 40,
        requireActivity: true
      }}
    />
  );
} 