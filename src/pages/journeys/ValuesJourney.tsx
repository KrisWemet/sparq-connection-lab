import JourneyTemplate from "./JourneyTemplate";
import {
  Compass,
  Target,
  Users,
  Map,
  Lightbulb,
  Calendar,
  Activity,
  CheckCircle
} from "lucide-react";

export default function ValuesJourney() {
  // Define all the core concepts for values and vision alignment
  const valuesConcepts = [
    {
      id: "core-values",
      title: "Core Values",
      description: "Identifying what matters most to you individually",
      icon: <Compass className="w-5 h-5 text-blue-500" />,
      color: "blue",
      example: "Taking time to reflect on what principles guide your life decisions, such as honesty, family, growth, security, freedom, or connection, and understanding how these values influence your daily choices."
    },
    {
      id: "value-origins",
      title: "Value Origins",
      description: "Understanding how your values were formed and shaped",
      icon: <Map className="w-5 h-5 text-amber-500" />,
      color: "amber",
      example: "Exploring how your upbringing, cultural background, significant life experiences, and important relationships have influenced what you value most today."
    },
    {
      id: "value-alignment",
      title: "Value Alignment",
      description: "Finding common ground in what matters to both of you",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      color: "green",
      example: "Identifying where your values naturally overlap with your partner's, such as both prioritizing family connection, personal growth, or creating security."
    },
    {
      id: "value-differences",
      title: "Value Differences",
      description: "Navigating areas where your priorities differ",
      icon: <Activity className="w-5 h-5 text-red-500" />,
      color: "red",
      example: "Learning to respect and accommodate differences in values—like one partner valuing adventure while the other prioritizes stability—and finding ways to honor both sets of values in your relationship."
    },
    {
      id: "shared-vision",
      title: "Shared Vision",
      description: "Creating a compelling picture of your desired future together",
      icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
      color: "yellow",
      example: "Collaboratively imagining what you want your life together to look like in 1, 5, or 10 years, focusing on how you'll embody your values in your lifestyle, relationships, and contributions."
    },
    {
      id: "purpose",
      title: "Relationship Purpose",
      description: "Defining the unique contribution of your partnership",
      icon: <Target className="w-5 h-5 text-purple-500" />,
      color: "purple",
      example: "Exploring how your relationship serves not just each other but possibly your families, communities, or larger causes, and how your unique combination of strengths creates meaning beyond yourselves."
    },
    {
      id: "goals",
      title: "Aligned Goals",
      description: "Setting targets that move you toward your shared vision",
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      example: "Converting your vision into specific, achievable goals with timelines, such as saving for a home, starting a family by a certain year, or creating a lifestyle that allows for more travel or community involvement."
    },
    {
      id: "legacy",
      title: "Relationship Legacy",
      description: "Considering the lasting impact of your partnership",
      icon: <Users className="w-5 h-5 text-teal-500" />,
      color: "teal",
      example: "Reflecting on what lasting impact you hope your relationship will have—on each other, on any children you may have, on your communities, or on causes you care about."
    }
  ];

  return (
    <JourneyTemplate
      journeyId="values"
      title="Values & Vision Alignment"
      totalDays={21} // 3 weeks
      conceptItems={valuesConcepts}
      backPath="/path-to-together"
    />
  );
} 