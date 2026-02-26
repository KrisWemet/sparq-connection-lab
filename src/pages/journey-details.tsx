import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Heart, MessageCircle, Shield, Flame, Target, Lightbulb, HeartHandshake, ArrowRight, Sparkles, Brain, Zap, PartyPopper, Check } from "lucide-react";
import { toast } from "sonner";
import { loadJourneyContent, type JourneyContent } from "@/services/journeyService";
import ReactMarkdown from 'react-markdown';

// This array matches the one in PathToTogether.tsx - in a real app, this would be fetched from an API
const journeys = [
  {
    id: "love-languages",
    title: "5 Love Languages",
    description: "Discover the primary ways you and your partner express and receive love",
    duration: "2 weeks",
    category: "Foundation",
    sequence: 1,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Love Languages Framework (Chapman)",
      "Attachment Theory",
      "Emotional Intelligence"
    ],
    benefits: [
      "Identify your primary love language",
      "Recognize your partner's love language",
      "Learn to express love effectively",
      "Reduce misunderstandings about affection"
    ],
    icon: <Heart className="w-5 h-5" />,
    phases: [
      {
        name: "Discover",
        days: "Days 1-5",
        description: "Learn about the five love languages and identify your own preferences",
        icon: "🔍"
      },
      {
        name: "Explore",
        days: "Days 6-10",
        description: "Deepen your understanding of how love languages affect your relationship",
        icon: "🌱"
      },
      {
        name: "Reflect",
        days: "Days 11-13",
        description: "Observe love languages in action and their emotional impact",
        icon: "💭"
      },
      {
        name: "Align",
        days: "Day 14",
        description: "Build your love languages roadmap for ongoing relationship growth",
        icon: "🤝"
      }
    ],
    overview: "This 14-day journey helps you discover which of the five love languages—Words of Affirmation, Quality Time, Acts of Service, Physical Touch, and Receiving Gifts—resonate most with you and your partner. You'll learn to speak each other's emotional language for a deeper connection."
  },
  {
    id: "communication",
    title: "Effective Communication",
    description: "Master the art of truly understanding each other through validated techniques",
    duration: "3 weeks",
    category: "Skills",
    sequence: 2,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Gottman Method",
      "Nonviolent Communication (Rosenberg)",
      "Active Listening Techniques"
    ],
    benefits: [
      "Reduce misunderstandings and conflicts",
      "Express needs clearly and compassionately",
      "Develop deeper understanding",
      "Create meaningful dialogue"
    ],
    icon: <MessageCircle className="w-5 h-5" />,
    phases: [
      {
        name: "Begin",
        days: "Days 1-5",
        description: "Getting to know how you communicate",
        icon: "🎯"
      },
      {
        name: "Share",
        days: "Days 6-11",
        description: "Talking openly together",
        icon: "🗣️"
      },
      {
        name: "Reflect",
        days: "Days 12-16",
        description: "Deepening your connection",
        icon: "🤔"
      },
      {
        name: "Align",
        days: "Days 17-21",
        description: "Building a shared plan for better communication",
        icon: "📝"
      }
    ],
    overview: "This 21-day journey is designed to help you and your partner talk and listen in a gentle, clear way. By following structured daily exercises, you'll develop skills to communicate effectively and resolve misunderstandings with compassion."
  },
  {
    id: "conflict",
    title: "Healthy Conflict Resolution",
    description: "Transform disagreements into opportunities for growth and understanding",
    duration: "4 weeks",
    category: "Skills",
    sequence: 3,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Gottman's Four Horsemen",
      "Fair Fighting Techniques",
      "Emotion-Focused Therapy Principles"
    ],
    benefits: [
      "Identify destructive conflict patterns",
      "Learn repair techniques",
      "Transform arguments into growth",
      "Develop collaborative problem-solving"
    ],
    icon: <Shield className="w-5 h-5" />,
    phases: [
      {
        name: "Observe",
        days: "Days 1-4",
        description: "Notice conflict patterns and triggers",
        icon: "👀"
      },
      {
        name: "Understand",
        days: "Days 5-8",
        description: "Explore perspectives and find positive aspects of conflict",
        icon: "🧠"
      },
      {
        name: "Practice",
        days: "Days 9-12",
        description: "Develop strategies for healthy conflict",
        icon: "🏋️"
      },
      {
        name: "Commit",
        days: "Days 13-14",
        description: "Create lasting conflict resolution habits",
        icon: "🤝"
      }
    ],
    overview: "This 14-day journey helps you and your partner work through disagreements in a healthy, supportive way. You'll learn to understand triggers, express feelings constructively, and develop practical tools to transform conflicts into opportunities for growth."
  },
  {
    id: "intimacy",
    title: "Deepening Intimacy",
    description: "Strengthen your emotional and physical connection through evidence-based approaches",
    duration: "5 weeks",
    category: "Connection",
    sequence: 4,
    image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Sternberg's Triangular Theory of Love",
      "Sensate Focus Techniques",
      "Emotional Vulnerability"
    ],
    benefits: [
      "Deepen emotional connection",
      "Enhance physical intimacy",
      "Build lasting passion",
      "Create meaningful rituals of connection"
    ],
    icon: <Flame className="w-5 h-5" />,
    phases: [
      {
        name: "Recognize",
        days: "Days 1-3",
        description: "Identify what makes you feel loved and connected",
        icon: "💖"
      },
      {
        name: "Share",
        days: "Days 4-7",
        description: "Express desires and memories of connection",
        icon: "🗣️"
      },
      {
        name: "Connect",
        days: "Days 8-10",
        description: "Create rituals and practice mindful presence",
        icon: "🤲"
      },
      {
        name: "Reflect",
        days: "Days 11-14",
        description: "Explore vulnerability and overcome barriers to intimacy",
        icon: "🪞"
      }
    ],
    overview: "This 14-day journey helps you and your partner explore and deepen your emotional and physical connection. Through daily exercises focused on presence, sharing, and creating meaningful rituals, you'll build a lasting bond that enriches your relationship."
  },
  {
    id: "values",
    title: "Values & Vision Alignment",
    description: "Create a shared vision for your future based on aligned core values",
    duration: "3 weeks",
    category: "Foundation",
    sequence: 5,
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Acceptance and Commitment Therapy",
      "Positive Psychology",
      "Goal-Setting Theory"
    ],
    benefits: [
      "Identify individual and shared values",
      "Create a compelling relationship vision",
      "Set meaningful goals together",
      "Build a roadmap for your future"
    ],
    icon: <Target className="w-5 h-5" />,
    phases: [
      {
        name: "Begin",
        days: "Days 1-7",
        description: "Discover your individual core values",
        icon: "🔍"
      },
      {
        name: "Share",
        days: "Days 8-14",
        description: "Connect through your values",
        icon: "🤝"
      },
      {
        name: "Reflect",
        days: "Days 15-21",
        description: "Deepen your connection through shared values",
        icon: "💭"
      },
      {
        name: "Align",
        days: "Days 22-28",
        description: "Commit to your shared future",
        icon: "🧭"
      }
    ],
    overview: "This 28-day program guides you and your partner in exploring your personal and shared core values. You'll discover what matters most to you both, create a unified vision for your future, and develop practical ways to align your daily lives with your deepest values."
  },
  {
    id: "appreciation",
    title: "Gratitude & Appreciation",
    description: "Cultivate a culture of appreciation and positivity in your relationship",
    duration: "2 weeks",
    category: "Connection",
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Positive Psychology",
      "Gottman's 5:1 Ratio",
      "Mindfulness Practices"
    ],
    benefits: [
      "Increase positive interactions",
      "Develop appreciation rituals",
      "Enhance relationship satisfaction",
      "Build emotional resilience"
    ],
    icon: <Sparkles className="w-5 h-5" />,
    phases: [
      {
        name: "Notice",
        days: "Days 1-3",
        description: "Begin to notice positive aspects of your partner and relationship",
        icon: "👁️"
      },
      {
        name: "Express",
        days: "Days 4-7",
        description: "Learn different ways to express appreciation authentically",
        icon: "💌"
      },
      {
        name: "Cultivate",
        days: "Days 8-11",
        description: "Develop daily habits of gratitude and appreciation",
        icon: "🌱"
      },
      {
        name: "Integrate",
        days: "Days 12-14",
        description: "Build lasting appreciation practices into your relationship",
        icon: "🔄"
      }
    ],
    overview: "This 14-day journey helps you and your partner develop the habit of noticing and expressing appreciation for each other. You'll learn how to create a positive cycle of gratitude that strengthens your bond and increases relationship satisfaction."
  },
  {
    id: "36-questions",
    title: "36 Questions to Fall in Love",
    description: "Foster intimacy through a scientifically-designed question sequence",
    duration: "3 sessions",
    category: "Connection",
    image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Self-Disclosure Theory",
      "Interpersonal Process Model",
      "Psychological Intimacy Research"
    ],
    benefits: [
      "Accelerate emotional intimacy",
      "Deepen mutual understanding",
      "Create lasting vulnerability",
      "Build empathetic connection"
    ],
    free: true,
    icon: <HeartHandshake className="w-5 h-5" />,
    badge: "Free Access",
    phases: [
      {
        name: "Set I",
        days: "Session 1",
        description: "Begin with lighter questions to build initial comfort and trust",
        icon: "🌱"
      },
      {
        name: "Set II",
        days: "Session 2",
        description: "Progress to more personal questions about dreams and relationships",
        icon: "🌿"
      },
      {
        name: "Set III",
        days: "Session 3",
        description: "Share deeply personal reflections and vulnerabilities",
        icon: "🌳"
      },
      {
        name: "Reflection",
        days: "Bonus",
        description: "Look into each other's eyes for 4 minutes to solidify your connection",
        icon: "✨"
      }
    ],
    overview: "Based on Dr. Arthur Aron's groundbreaking research, this journey guides you through 36 carefully sequenced questions designed to foster closeness between partners. By gradually increasing self-disclosure in a structured way, you create mutual vulnerability and intimacy that can deepen your connection in just a few hours."
  },
  {
    id: "playful-connection",
    title: "Playful Connection",
    description: "Strengthen your bond through fun, laughter and lighthearted activities",
    duration: "2 weeks",
    category: "Fun",
    image: "https://images.unsplash.com/photo-1488116908379-1208e281cc76?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Positive Psychology",
      "Play Therapy Concepts",
      "Humor in Relationships Research"
    ],
    benefits: [
      "Reduce relationship stress through play",
      "Create shared joy and positive memories",
      "Improve communication through laughter",
      "Deepen connection through shared experiences"
    ],
    free: true,
    icon: <PartyPopper className="w-5 h-5" />,
    badge: "New & Free",
    phases: [
      {
        name: "Laugh",
        days: "Days 1-3",
        description: "Rediscover the joy of laughter together through playful activities",
        icon: "😂"
      },
      {
        name: "Play",
        days: "Days 4-7",
        description: "Engage in structured play activities that foster connection",
        icon: "🎮"
      },
      {
        name: "Create",
        days: "Days 8-10",
        description: "Build something together and embrace your creative sides",
        icon: "🎨"
      },
      {
        name: "Adventure",
        days: "Days 11-14",
        description: "Step out of your comfort zones through shared mini-adventures",
        icon: "🚀"
      }
    ],
    overview: "This 14-day journey invites you and your partner to reconnect through the power of play and fun. Through structured activities designed to inspire laughter, creativity and adventure, you'll create a treasure trove of happy memories while strengthening your emotional bond. Relationships thrive when couples can be silly, spontaneous and joyful together!"
  },
  {
    id: "intimate-connection",
    title: "Intimate Connection",
    description: "Build deeper physical and emotional intimacy through mindful connection practices",
    duration: "2 weeks",
    category: "Connection",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Attachment Theory",
      "Sensate Focus Techniques",
      "Mindful Sexuality"
    ],
    benefits: [
      "Enhance physical connection",
      "Deepen emotional intimacy",
      "Improve communication about desires",
      "Build trust and safety"
    ],
    icon: <Flame className="w-5 h-5" />,
    phases: [
      {
        name: "Foundation",
        days: "Days 1-3",
        description: "Build safety and trust for deeper connection",
        icon: "🏠"
      },
      {
        name: "Presence",
        days: "Days 4-7",
        description: "Develop mindful awareness during intimate moments",
        icon: "🧘"
      },
      {
        name: "Expression",
        days: "Days 8-11",
        description: "Practice open communication about desires and boundaries",
        icon: "💬"
      },
      {
        name: "Integration",
        days: "Days 12-14",
        description: "Bring together emotional and physical intimacy",
        icon: "❤️"
      }
    ],
    overview: "This 14-day journey helps couples build a deeper physical and emotional connection through mindfulness practices, enhanced communication, and gradual exploration. Focusing on conventional intimacy approaches, this journey creates a foundation of trust and mutual understanding."
  },
  {
    id: "desire-exploration",
    title: "Desire Exploration",
    description: "Discover and communicate desires, fantasies, and preferences in a safe, supportive space",
    duration: "3 weeks",
    category: "Connection",
    image: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Erotic Intelligence Research",
      "Cognitive Flexibility",
      "Desire Mapping Techniques"
    ],
    benefits: [
      "Expand understanding of personal desires",
      "Improve communication about fantasies",
      "Reduce shame around sexual preferences",
      "Create space for playful exploration"
    ],
    icon: <Flame className="w-5 h-5" />,
    phases: [
      {
        name: "Self-Discovery",
        days: "Days 1-5",
        description: "Explore your own desires and boundaries",
        icon: "🔍"
      },
      {
        name: "Communication",
        days: "Days 6-10",
        description: "Learn to express desires and listen without judgment",
        icon: "🗣️"
      },
      {
        name: "Exploration",
        days: "Days 11-16",
        description: "Safely explore new dimensions of intimacy together",
        icon: "🚀"
      },
      {
        name: "Integration",
        days: "Days 17-21",
        description: "Incorporate discoveries into your relationship",
        icon: "🔄"
      }
    ],
    overview: "This 21-day journey guides couples through honest exploration of desires and fantasies. With a focus on communication, consent, and playfulness, you'll create a judgment-free space to express preferences and potentially discover new dimensions of your intimate connection."
  },
  {
    id: "boundaries-beyond",
    title: "Boundaries & Beyond",
    description: "Explore advanced intimate practices with clear communication, consent, and trust",
    duration: "4 weeks",
    category: "Connection",
    image: "https://images.unsplash.com/photo-1624523439904-d392af8c4354?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Consent Psychology",
      "Power Dynamics Research",
      "Transformative Experience Studies"
    ],
    benefits: [
      "Master consent communication",
      "Establish clear boundaries for exploration",
      "Deepen trust through vulnerability",
      "Experience new dimensions of connection"
    ],
    icon: <Flame className="w-5 h-5" />,
    phases: [
      {
        name: "Foundation",
        days: "Days 1-7",
        description: "Build advanced communication and consent skills",
        icon: "🛡️"
      },
      {
        name: "Understanding",
        days: "Days 8-14",
        description: "Explore psychology of desires and boundaries",
        icon: "🧠"
      },
      {
        name: "Exploration",
        days: "Days 15-21",
        description: "Guided practices for adventurous connection",
        icon: "🔥"
      },
      {
        name: "Integration",
        days: "Days 22-28",
        description: "Incorporate discoveries into your relationship",
        icon: "🌈"
      }
    ],
    overview: "This 28-day advanced journey is designed for couples interested in exploring more adventurous dimensions of their intimate relationship. With a strong emphasis on consent, communication, and emotional safety, you'll learn to navigate power dynamics, fantasies, and boundary exploration in ways that strengthen trust and deepen connection."
  }
];

export default function JourneyDetails() {
  const navigate = useNavigate();
  const { journeyId } = useParams();
  const [journey, setJourney] = useState<JourneyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [activeJourneyDay, setActiveJourneyDay] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active journey in localStorage
    const checkActiveJourney = () => {
      if (journeyId) {
        const lastDay = localStorage.getItem(`${journeyId}_last_day`);
        if (lastDay) {
          setActiveJourney(journeyId);
          setActiveJourneyDay(lastDay);
        }
      }
    };

    checkActiveJourney();
  }, [journeyId]);

  useEffect(() => {
    async function fetchJourneyContent() {
      if (!journeyId) {
        setError('No journey ID provided');
        setLoading(false);
        return;
      }

      try {
        const content = await loadJourneyContent(journeyId);
        if (!content) {
          setError('Journey not found');
          setLoading(false);
          return;
        }
        setJourney(content);
      } catch (err) {
        setError('Failed to load journey content');
        console.error('Error loading journey:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJourneyContent();
  }, [journeyId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !journey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">{error || 'Journey not found'}</p>
        <Button onClick={() => navigate('/path-to-together')}>
          Return to Journeys
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/path-to-together')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Journeys
      </Button>

      {activeJourney && activeJourneyDay && (
        <div className="mb-6">
          <Card className="bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Continue your journey</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  You're on day {parseInt(activeJourneyDay) + 1} of this journey
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/journey/${journeyId}/start?day=${activeJourneyDay}`)}
              >
                Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">{journey.title}</h1>
        
        <div className="flex gap-2 mb-4">
          <Badge>{journey.metadata.category}</Badge>
          <Badge variant="outline">{journey.metadata.duration}</Badge>
        </div>

        <div className="prose max-w-none">
          <ReactMarkdown>{journey.content}</ReactMarkdown>
        </div>

        <div className="mt-8">
          <Button 
            className="w-full"
            onClick={() => {
              // If there's an active journey, continue from where they left off
              if (activeJourney && activeJourneyDay) {
                navigate(`/journey/${journeyId}/start?day=${activeJourneyDay}`);
              } else {
                // Otherwise start from day 1
                navigate(`/journey/${journeyId}/start?day=1`);
              }
            }}
          >
            {activeJourney ? 'Continue Journey' : 'Start Journey'}
          </Button>
        </div>
      </Card>

      <BottomNav />
    </div>
  );
} 