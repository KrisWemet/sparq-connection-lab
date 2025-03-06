import JourneyTemplate from "./JourneyTemplate";
import {
  Heart,
  ShieldAlert,
  Anchor,
  Brain,
  Cloudy,
  MountainSnow,
  RefreshCw,
  UserPlus
} from "lucide-react";

export default function AttachmentHealingJourney() {
  // Define all the core concepts for attachment healing
  const attachmentConcepts = [
    {
      id: "attachment-patterns",
      title: "Attachment Styles",
      description: "Understanding the four main attachment patterns and their origins",
      icon: <Anchor className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Learning to recognize secure, anxious, avoidant, and fearful-avoidant attachment patterns, and identifying which patterns you and your partner tend to exhibit in your relationship."
    },
    {
      id: "attachment-triggers",
      title: "Attachment Triggers",
      description: "Recognizing what activates your attachment system",
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      color: "red",
      example: "Identifying specific situations, words, or behaviors that trigger your attachment fears, such as a delayed response to a message triggering abandonment fears or perceived criticism triggering defensive withdrawal."
    },
    {
      id: "childhood-origins",
      title: "Developmental Origins",
      description: "Exploring how childhood experiences shaped your attachment style",
      icon: <MountainSnow className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Reflecting on your early relationships with caregivers and how those experiences created patterns that show up in your adult relationships, such as learning to suppress needs if they weren't consistently met in childhood."
    },
    {
      id: "brain-patterns",
      title: "Neural Pathways",
      description: "Understanding how attachment patterns become wired in the brain",
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Learning how repeated experiences create neural pathways that become automatic responses, and how new experiences can help rewire these patterns over time through neuroplasticity."
    },
    {
      id: "secure-functioning",
      title: "Secure Functioning",
      description: "Practicing the principles of secure attachment",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Developing relationship practices based on secure attachment principles, such as clear communication, emotional availability, and maintaining connection during conflict."
    },
    {
      id: "co-regulation",
      title: "Co-Regulation",
      description: "Learning to calm each other's nervous systems",
      icon: <Cloudy className="w-5 h-5 text-cyan-500" />,
      color: "cyan",
      example: "Developing skills to help soothe each other during stress or conflict, such as using a gentle tone, maintaining physical connection, or providing reassurance that directly addresses attachment fears."
    },
    {
      id: "relationship-repair",
      title: "Rupture & Repair",
      description: "Healing connection after attachment triggers and conflicts",
      icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Creating effective repair rituals after conflicts or disconnection, helping to rebuild trust and security rather than allowing ruptures to accumulate and damage the relationship."
    },
    {
      id: "earned-security",
      title: "Earned Security",
      description: "Building new, secure attachment patterns through consistent experiences",
      icon: <UserPlus className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Gradually developing more secure attachment through intentional practices and consistent emotional availability, recognizing that even deeply ingrained patterns can change over time."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="attachment-healing"
      title="Attachment Healing"
      totalDays={42} // 6 weeks
      conceptItems={attachmentConcepts}
      backPath="/path-to-together"
      headerImage="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b"
      cardImage="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c"
      conceptSelectionPrompt="Which attachment patterns do you recognize?"
      completionCriteria={{
        requireConceptSelection: true,
        requireReflection: true,
        minReflectionLength: 50, // Longer reflection for deeper processing
        requireActivity: true
      }}
    />
  );
} 