import JourneyTemplate from "./JourneyTemplate";
import {
  MessageCircle,
  Shield,
  Handshake,
  Binary,
  AlertCircle,
  Ear,
  Brain,
  Heart,
  ArrowDown,
  CornerDownRight,
  CloudRain
} from "lucide-react";

export default function ConflictResolutionJourney() {
  // Define all the core concepts for conflict resolution
  const conflictConcepts = [
    {
      id: "active-listening",
      title: "Active Listening",
      description: "Fully concentrating, understanding, and responding thoughtfully to your partner",
      icon: <Ear className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "When your partner expresses frustration about their day, put away distractions, make eye contact, and ask follow-up questions that show you're truly engaged with what they're saying."
    },
    {
      id: "i-statements",
      title: "I-Statements",
      description: "Expressing feelings without blaming or criticizing your partner",
      icon: <MessageCircle className="w-5 h-5 text-violet-500" />,
      color: "violet",
      example: "Instead of saying 'You never help with the dishes,' try 'I feel overwhelmed when I'm handling all the household chores by myself.'"
    },
    {
      id: "emotional-awareness",
      title: "Emotional Awareness",
      description: "Recognizing your own emotions and how they affect communication",
      icon: <Brain className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Noticing when you're starting to feel defensive so you can take a short break before responding impulsively with words you might regret."
    },
    {
      id: "boundaries",
      title: "Healthy Boundaries",
      description: "Clearly communicating your needs and limits in a respectful way",
      icon: <Shield className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Saying 'I need an hour to decompress after work before discussing difficult topics' helps your partner understand your needs without feeling rejected."
    },
    {
      id: "compromise",
      title: "Fair Compromise",
      description: "Finding solutions that respect both partners' needs and values",
      icon: <Handshake className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "If one partner wants to spend holidays with extended family while the other prefers intimate time alone, you might agree to alternate between these options each year."
    },
    {
      id: "repair-attempts",
      title: "Repair Attempts",
      description: "Making gestures to reduce tension and reconnect during a disagreement",
      icon: <Heart className="w-5 h-5 text-red-500" />,
      color: "red",
      example: "Using humor, a soft touch, or a sincere apology during a heated moment can prevent the conversation from escalating into a damaging argument."
    },
    {
      id: "time-outs",
      title: "Constructive Time-Outs",
      description: "Taking breaks to calm down while committing to returning to the conversation",
      icon: <CloudRain className="w-5 h-5 text-sky-500" />,
      color: "sky",
      example: "Saying 'I'm getting too emotional to discuss this productively right now. Can we take 30 minutes to cool down and then continue the conversation?'"
    },
    {
      id: "assume-goodwill",
      title: "Assuming Goodwill",
      description: "Interpreting your partner's actions with the most generous possible motive",
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      color: "orange",
      example: "When your partner forgets an important date, assuming they were overwhelmed rather than they don't care about you or your relationship."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="conflict-resolution"
      title="Constructive Conflict Resolution"
      totalDays={14}
      conceptItems={conflictConcepts}
      backPath="/path-to-together"
    />
  );
}
