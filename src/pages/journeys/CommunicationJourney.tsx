import JourneyTemplate from "./JourneyTemplate";
import {
  Ear,
  MessageSquare,
  User,
  Users,
  Megaphone,
  Eye,
  CornerDownRight,
  Heart
} from "lucide-react";

export default function CommunicationJourney() {
  // Define all the core concepts for effective communication
  const communicationConcepts = [
    {
      id: "active-listening",
      title: "Active Listening",
      description: "Fully focusing on what your partner is saying rather than planning your response",
      icon: <Ear className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "When your partner shares a concern about work, putting away distractions, maintaining eye contact, and asking follow-up questions that show you're fully engaged with what they're saying."
    },
    {
      id: "nonverbal-communication",
      title: "Nonverbal Communication",
      description: "Understanding how body language, facial expressions, and tone convey meaning",
      icon: <Eye className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Noticing that when your partner crosses their arms and avoids eye contact during a conversation, they might be feeling defensive or uncomfortable, even if their words suggest otherwise."
    },
    {
      id: "clear-expression",
      title: "Clear Expression",
      description: "Stating your thoughts, feelings, and needs directly and specifically",
      icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Instead of saying 'You never help around here,' saying 'I'm feeling overwhelmed with household responsibilities. Could we create a more balanced system for managing chores?'"
    },
    {
      id: "timing-and-approach",
      title: "Timing & Approach",
      description: "Choosing the right moment and method to discuss sensitive topics",
      icon: <Users className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Rather than bringing up budget concerns when your partner just walked in from work, saying 'I'd like to talk about our finances. When would be a good time in the next couple of days?'"
    },
    {
      id: "expressing-appreciation",
      title: "Expressing Appreciation",
      description: "Regularly sharing specific, genuine appreciation for your partner",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Instead of a generic 'thanks,' saying 'I really appreciated how you listened and supported me during my difficult conversation with my boss yesterday. It helped me feel less alone.'"
    },
    {
      id: "repairing-miscommunication",
      title: "Repairing Miscommunication",
      description: "Addressing communication breakdowns and misunderstandings promptly",
      icon: <CornerDownRight className="w-5 h-5 text-sky-500" />,
      color: "sky",
      example: "When you notice confusion or hurt in your partner's expression, saying 'I think I may not have expressed that clearly. Can I try again?' rather than continuing with the conversation."
    },
    {
      id: "assertiveness",
      title: "Healthy Assertiveness",
      description: "Expressing your needs confidently while respecting your partner's perspective",
      icon: <Megaphone className="w-5 h-5 text-orange-500" />,
      color: "orange",
      example: "Instead of silently resenting extra work duties, saying 'I care about supporting the team, but I need to establish some boundaries around after-hours emails to protect our family time.'"
    },
    {
      id: "vulnerability",
      title: "Vulnerable Communication",
      description: "Sharing your deeper feelings, fears, and hopes with openness and trust",
      icon: <User className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Instead of just discussing practical aspects of a decision, sharing 'I'm feeling anxious about this move because my last major life change triggered a period of depression.'"
    }
  ];

  return (
    <JourneyTemplate
      journeyId="communication"
      title="Effective Communication Skills"
      totalDays={14}
      conceptItems={communicationConcepts}
      backPath="/path-to-together"
    />
  );
}
