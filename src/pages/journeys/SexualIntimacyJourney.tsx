import JourneyTemplate from "./JourneyTemplate";
import {
  Heart,
  MessageSquare,
  Brain,
  Sparkles,
  Flame,
  VolumeX,
  Laugh,
  Clock
} from "lucide-react";

export default function SexualIntimacyJourney() {
  // Define all the core concepts for sexual intimacy
  const sexualIntimacyConcepts = [
    {
      id: "desire-understanding",
      title: "Understanding Desire",
      description: "Recognizing how desire works and how it naturally ebbs and flows",
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Learning to differentiate between spontaneous and responsive desire, and understanding that fluctuations in desire are normal and don't indicate a problem with your relationship."
    },
    {
      id: "emotional-connection",
      title: "Emotional Connection",
      description: "Building the emotional safety that nurtures physical intimacy",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      color: "pink",
      example: "Creating a relationship foundation where both partners feel emotionally secure and connected, which research shows is strongly linked to sexual satisfaction."
    },
    {
      id: "mindful-presence",
      title: "Mindful Presence",
      description: "Being fully present during intimate moments rather than focused on performance",
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Practicing techniques to stay present with sensations in your body and emotional connection with your partner during intimate moments."
    },
    {
      id: "sexual-communication",
      title: "Sexual Communication",
      description: "Developing comfort and skill in talking about desires and boundaries",
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Learning to express preferences, desires, and boundaries in ways that feel comfortable and build connection rather than criticism."
    },
    {
      id: "pleasure-focus",
      title: "Pleasure Focus",
      description: "Shifting from goal-oriented sex to pleasure-oriented experiences",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Moving away from seeing sex as performance or focused primarily on orgasm, and instead emphasizing mutual pleasure and connection throughout the experience."
    },
    {
      id: "playfulness",
      title: "Playful Exploration",
      description: "Bringing curiosity, lightness and play into your intimate life",
      icon: <Laugh className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Approaching intimacy with curiosity and a willingness to try new things, keeping a sense of humor and playfulness that reduces pressure."
    },
    {
      id: "managing-differences",
      title: "Managing Differences",
      description: "Navigating different desires and needs with compassion",
      icon: <VolumeX className="w-5 h-5 text-orange-500" />,
      color: "orange",
      example: "Developing strategies to navigate differences in desire, preferences, or fantasies in ways that respect both partners' needs and boundaries."
    },
    {
      id: "dedicated-time",
      title: "Prioritizing Connection",
      description: "Making space and time for intimate connection",
      icon: <Clock className="w-5 h-5 text-sky-500" />,
      color: "sky",
      example: "Creating regular dedicated time for connection without distractions, whether that leads to sexual intimacy or other forms of closeness."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="sexual-intimacy"
      title="Sexual Intimacy & Desire"
      totalDays={28}
      conceptItems={sexualIntimacyConcepts}
      backPath="/path-to-together"
    />
  );
} 