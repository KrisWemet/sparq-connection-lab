import JourneyTemplate from "./JourneyTemplate";
import {
  Heart,
  Users,
  User,
  MessageSquare,
  Flame,
  BadgeCheck,
  ArrowRightLeft,
  Sparkles
} from "lucide-react";

export default function IntimacyJourney() {
  // Define all the core concepts for intimacy
  const intimacyConcepts = [
    {
      id: "emotional-intimacy",
      title: "Emotional Intimacy",
      description: "Creating deep emotional connection through vulnerability and understanding",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: "rose",
      example: "Sharing your fears, hopes, and dreams with your partner, and creating a safe space where both of you can be vulnerable without fear of judgment."
    },
    {
      id: "physical-intimacy",
      title: "Physical Intimacy",
      description: "Connecting through touch, physical affection, and sexual expression",
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Developing a rich language of physical connection that includes both sexual intimacy and everyday affectionate touches like holding hands, hugging, or gentle caresses."
    },
    {
      id: "intellectual-intimacy",
      title: "Intellectual Intimacy",
      description: "Sharing ideas, thoughts, and meaningful conversations",
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Having deep conversations about your values, interests, or perspectives on life, and feeling intellectually stimulated by your exchanges with your partner."
    },
    {
      id: "experiential-intimacy",
      title: "Experiential Intimacy",
      description: "Building connection through shared experiences and activities",
      icon: <Users className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Traveling together, trying new activities as a couple, or creating meaningful rituals and traditions that strengthen your bond through shared memories."
    },
    {
      id: "spiritual-intimacy",
      title: "Spiritual Intimacy",
      description: "Connecting through shared values, beliefs, and life purpose",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Discussing your core values, exploring existential questions together, or sharing spiritual practices that help you feel aligned on a deeper level."
    },
    {
      id: "self-intimacy",
      title: "Self-Intimacy",
      description: "Developing a deep relationship with yourself as a foundation for connection",
      icon: <User className="w-5 h-5 text-orange-500" />,
      color: "orange",
      example: "Practicing self-awareness and self-compassion, which allows you to bring your authentic self to your relationship rather than projecting needs or insecurities."
    },
    {
      id: "vulnerability",
      title: "Vulnerable Sharing",
      description: "Opening up about feelings, needs, and experiences that feel risky to share",
      icon: <BadgeCheck className="w-5 h-5 text-sky-500" />,
      color: "sky",
      example: "Sharing a personal insecurity with your partner, being honest about a mistake you've made, or expressing a need that you fear might be rejected."
    },
    {
      id: "reciprocity",
      title: "Balanced Reciprocity",
      description: "Creating mutual exchange of emotional giving and receiving",
      icon: <ArrowRightLeft className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      example: "Both partners having space to be vulnerable and supportive at different times, creating a dance of intimacy where both feel equally valued and understood."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="intimacy"
      title="Building Deep Intimacy"
      totalDays={14}
      conceptItems={intimacyConcepts}
      backPath="/path-to-together"
    />
  );
}
