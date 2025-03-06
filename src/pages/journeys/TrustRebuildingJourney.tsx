import JourneyTemplate from "./JourneyTemplate";
import {
  Shield,
  Clock,
  Heart,
  Eye,
  MessageSquare,
  Handshake,
  ArrowUp,
  Landmark
} from "lucide-react";

export default function TrustRebuildingJourney() {
  // Define all the core concepts for trust rebuilding
  const trustRebuildingConcepts = [
    {
      id: "accountability",
      title: "Accountability",
      description: "Taking responsibility for actions that damaged trust",
      icon: <Shield className="w-5 h-5 text-red-500" />,
      color: "red",
      example: "Fully acknowledging the impact of harmful actions without defensiveness or minimizing, and being willing to answer questions honestly to help your partner process what happened."
    },
    {
      id: "transparency",
      title: "Transparency",
      description: "Creating openness that helps rebuild confidence",
      icon: <Eye className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Proactively sharing information related to the breach of trust, such as providing access to accounts after financial dishonesty or sharing your whereabouts after infidelity."
    },
    {
      id: "consistency",
      title: "Consistency",
      description: "Building reliability through ongoing trustworthy actions",
      icon: <Clock className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Following through on commitments consistently over time, recognizing that trust is rebuilt through many small actions rather than grand gestures or promises."
    },
    {
      id: "empathy",
      title: "Empathic Understanding",
      description: "Compassionately connecting with your partner's pain",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Making space for the hurt partner's emotions without becoming defensive, and genuinely trying to understand the full impact of the breach from their perspective."
    },
    {
      id: "communication",
      title: "Healing Dialogue",
      description: "Creating space for processing pain and rebuilding connection",
      icon: <MessageSquare className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Having structured conversations about the breach and its impact, while also creating space to talk about other aspects of your relationship and future hopes."
    },
    {
      id: "boundaries",
      title: "Healthy Boundaries",
      description: "Creating clear agreements that support security",
      icon: <Landmark className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Establishing clear, respectful boundaries that help the hurt partner feel safe, such as agreements about communication, transparency, or specific behaviors related to the breach."
    },
    {
      id: "forgiveness",
      title: "Forgiveness Process",
      description: "Moving toward healing without erasing the past",
      icon: <ArrowUp className="w-5 h-5 text-cyan-500" />,
      color: "cyan",
      example: "Understanding that forgiveness is a process that happens gradually, not a single decision, and that it means releasing resentment rather than forgetting what happened."
    },
    {
      id: "renewal",
      title: "Relationship Renewal",
      description: "Creating a stronger relationship with deeper understanding",
      icon: <Handshake className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Using the healing process as an opportunity to build a more intentional relationship with stronger communication, clearer boundaries, and deeper intimacy than before."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="trust-rebuilding"
      title="Trust Rebuilding"
      totalDays={42} // 6 weeks
      conceptItems={trustRebuildingConcepts}
      backPath="/path-to-together"
    />
  );
} 