import JourneyTemplate from "./JourneyTemplate";
import {
  Brain,
  Heart,
  Eye,
  RefreshCw,
  Gauge,
  Puzzle,
  BadgeCheck,
  FlaskConical,
  ShieldQuestion
} from "lucide-react";

export default function EmotionalIntelligenceJourney() {
  // Define all the core concepts for emotional intelligence
  const emotionalIntelligenceConcepts = [
    {
      id: "self-awareness",
      title: "Self-Awareness",
      description: "Recognizing your own emotions and understanding how they affect your thoughts and behavior",
      icon: <Eye className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Noticing that you feel tense and irritable when your partner is late, and recognizing that this might be connected to deeper feelings of not being valued or prioritized."
    },
    {
      id: "emotion-regulation",
      title: "Emotion Regulation",
      description: "Managing your emotional responses, especially in challenging situations",
      icon: <Gauge className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "When feeling overwhelmed by jealousy, taking a pause to breathe deeply and remind yourself of your partner's commitment before responding to the situation."
    },
    {
      id: "emotional-literacy",
      title: "Emotional Literacy",
      description: "Developing a rich vocabulary for emotions beyond 'good', 'bad', 'fine' or 'upset'",
      icon: <BadgeCheck className="w-5 h-5 text-teal-500" />,
      color: "teal",
      example: "Being able to differentiate between feeling disappointed, disrespected, or dismissed when your partner cancels plans, allowing for more precise communication."
    },
    {
      id: "empathy",
      title: "Empathy",
      description: "Understanding and feeling what another person is experiencing from their perspective",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "When your partner is stressed about work, being able to imagine how they might be feeling and responding with understanding rather than minimizing their concerns."
    },
    {
      id: "perspective-taking",
      title: "Perspective-Taking",
      description: "Actively considering situations from your partner's point of view",
      icon: <ShieldQuestion className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "During a disagreement about household chores, pausing to consider how your partner's upbringing or past experiences might influence their expectations."
    },
    {
      id: "emotional-validation",
      title: "Emotional Validation",
      description: "Acknowledging and accepting another person's emotional experience",
      icon: <FlaskConical className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "When your partner shares feeling anxious about meeting your friends, responding with 'That makes sense to feel nervous in this situation' rather than 'There's nothing to worry about.'"
    },
    {
      id: "emotional-attunement",
      title: "Emotional Attunement",
      description: "Being sensitively aware of and responsive to your partner's emotional state",
      icon: <Brain className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Noticing subtle changes in your partner's tone of voice or body language that indicate they might be upset, and gently checking in."
    },
    {
      id: "emotional-flexibility",
      title: "Emotional Flexibility",
      description: "Adapting your emotional responses to different situations appropriately",
      icon: <RefreshCw className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Being able to shift from a serious conversation about finances to enjoying a playful evening together, without emotional spillover."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="emotional-intelligence"
      title="Emotional Intelligence for Deeper Connection"
      totalDays={14}
      conceptItems={emotionalIntelligenceConcepts}
      backPath="/path-to-together"
    />
  );
}
