import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Heart, MessageCircle, Shield, Flame, Target, Lightbulb, HeartHandshake, ArrowRight, Sparkles, Brain, Zap, PartyPopper, Check } from "lucide-react";
import { toast } from "sonner";
import { sexualityJourneyData } from "@/data/relationshipContent";

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
  const [journey, setJourney] = useState<any>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [nextDay, setNextDay] = useState<number>(1);
  
  useEffect(() => {
    // Find the journey that matches the ID from the URL
    const foundJourney = journeys.find(j => j.id === journeyId);
    if (foundJourney) {
      setJourney(foundJourney);
      
      // Load completed days from local storage
      const completed = JSON.parse(localStorage.getItem(`${journeyId}_completed_days`) || '[]');
      setCompletedDays(completed);
      
      // Set the next day based on completed days
      setNextDay(completed.length + 1);
    } else {
      // If journey not found, redirect to journeys list
      navigate("/path-to-together");
      toast.error("Journey not found");
    }
  }, [journeyId, navigate]);
  
  const handleStartDay = (dayNumber: number) => {
    if (dayNumber === 1 || completedDays.includes(dayNumber - 1)) {
      navigate(`/journey/${journeyId}/start?day=${dayNumber}`);
    } else {
      toast.error("Please complete the previous day first!");
    }
  };

  const getButtonText = () => {
    if (completedDays.length === 0) {
      return (
        <>
          Begin This Journey
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      );
    } else {
      return (
        <>
          Continue Day {nextDay}
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      );
    }
  };

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
              Loading Journey...
            </h1>
          </div>
        </header>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const JourneyIcon = () => {
    switch (journeyId) {
      case 'love-languages':
        return <Heart className="w-8 h-8 text-white" />;
      case 'communication':
        return <MessageCircle className="w-8 h-8 text-white" />;
      case 'conflict':
        return <Shield className="w-8 h-8 text-white" />;
      case 'intimacy':
        return <Flame className="w-8 h-8 text-white" />;
      case 'values':
        return <Target className="w-8 h-8 text-white" />;
      default:
        return <HeartHandshake className="w-8 h-8 text-white" />;
    }
  };

  const getCategoryColor = () => {
    switch (journey.category) {
      case 'Foundation':
        return 'bg-green-600';
      case 'Skills':
        return 'bg-indigo-600';
      case 'Connection':
        return 'bg-rose-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
            {journey.title}
          </h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-6 animate-slide-up">
        {/* Hero section with image */}
        <div className="relative rounded-xl overflow-hidden mb-8 h-64 md:h-80">
          <img 
            src={journey.image} 
            alt={journey.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              {journey.sequence && (
                <Badge className="bg-white/20 text-white">Journey {journey.sequence} of 5</Badge>
              )}
              <Badge className="bg-white/20 text-white">{journey.duration}</Badge>
              <Badge className={`text-white ${getCategoryColor()}`}>{journey.category}</Badge>
              {journey.free && (
                <Badge className="bg-green-500 text-white">Free Access</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{journey.title}</h1>
            <p className="text-white/90 max-w-2xl">{journey.description}</p>
          </div>
        </div>

        {/* Journey Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${getCategoryColor()} flex-shrink-0`}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Journey Overview
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {journey.overview}
              </p>
              
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Psychological Foundations</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {journey.psychology.map((item: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300">
                    {item}
                  </Badge>
                ))}
              </div>
              
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">What You'll Gain</h3>
              <ul className="space-y-2 mb-6">
                {journey.benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <div className="mt-1 text-primary">✓</div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${getCategoryColor()} flex-shrink-0`}>
                  {JourneyIcon()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {journey.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedDays.length > 0 
                      ? `Day ${completedDays.length} completed`
                      : journey.duration}
                  </p>
                </div>
              </div>
              
              <Button 
                className={`w-full mb-4 py-6 ${getCategoryColor()}`}
                onClick={() => handleStartDay(nextDay)}
              >
                {getButtonText()}
              </Button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {completedDays.length > 0 
                  ? `You've completed ${completedDays.length} ${completedDays.length === 1 ? 'day' : 'days'} of your journey`
                  : journey.free 
                    ? "This journey is completely free! Begin anytime and progress at your own pace."
                    : "You can begin this journey at any time and progress at your own pace."}
              </p>
              
              {journey.free && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green-100 dark:bg-green-800/30 rounded-full mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">No Subscription Required</p>
                      <p className="text-xs text-green-700 dark:text-green-500">Experience this evidence-based journey completely free of charge.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </span>
                Did You Know?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                Couples who deliberately focus on improving specific aspects of their relationship report 3x more satisfaction compared to those who don't use structured approaches.
              </p>
            </div>
          </div>
        </div>
        
        {/* Journey Phases */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your {journey.duration} Path
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {journey.phases.map((phase: any, index: number) => (
              <Card key={index} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{phase.icon}</span>
                    <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {phase.days}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Phase {index + 1}: {phase.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {phase.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Start Journey CTA */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Begin your path to a deeper, more connected relationship. 
            Each day brings new insights and growth opportunities.
          </p>
          <Button 
            size="lg"
            className={`px-8 ${getCategoryColor()}`}
            onClick={() => handleStartDay(1)}
          >
            Begin Your {journey.title} Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 