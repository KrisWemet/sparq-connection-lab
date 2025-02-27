import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Brain,
  Target, 
  Sparkles,
  HeartHandshake,
  Lightbulb,
  Puzzle,
  Anchor,
  Flame,
  Shield,
  Zap,
  ArrowRight,
  RocketIcon,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { sexualityJourneyData } from "@/data/relationshipContent";

// Journey data with psychological foundations
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
    icon: <Heart className="w-5 h-5" />
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
    icon: <MessageCircle className="w-5 h-5" />
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
    icon: <Shield className="w-5 h-5" />
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
    icon: <Flame className="w-5 h-5" />
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
    icon: <Target className="w-5 h-5" />
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
    icon: <Sparkles className="w-5 h-5" />
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
    badge: "Free Access"
  },
  {
    id: "growth",
    title: "Individual & Relationship Growth",
    description: "Balance personal development with relationship nurturing",
    duration: "4 weeks",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Self-Determination Theory",
      "Differentiation in Relationships",
      "Growth Mindset (Dweck)"
    ],
    benefits: [
      "Support each other's personal growth",
      "Balance autonomy and togetherness",
      "Develop a growth mindset as a couple",
      "Create shared learning experiences"
    ],
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: "trust",
    title: "Trust Rebuilding",
    description: "Heal past wounds and rebuild trust through proven therapeutic approaches",
    duration: "6 weeks",
    category: "Healing",
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Trauma-Informed Approaches",
      "Forgiveness Research",
      "Attachment Repair"
    ],
    benefits: [
      "Process past hurts safely",
      "Rebuild trust systematically",
      "Develop new patterns of security",
      "Create a foundation for healing"
    ],
    icon: <HeartHandshake className="w-5 h-5" />
  },
  {
    id: "intimate-connection",
    title: "Intimate Connection",
    description: "Build deeper physical and emotional intimacy through mindful connection practices",
    duration: "2 weeks",
    category: "Intimacy",
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
    icon: <Flame className="w-5 h-5" />
  },
  {
    id: "desire-exploration",
    title: "Desire Exploration",
    description: "Discover and communicate desires, fantasies, and preferences in a safe, supportive space",
    duration: "3 weeks",
    category: "Intimacy",
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
    icon: <Flame className="w-5 h-5" />
  },
  {
    id: "boundaries-beyond",
    title: "Boundaries & Beyond",
    description: "Explore advanced intimate practices with clear communication, consent, and trust",
    duration: "4 weeks",
    category: "Intimacy",
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
    icon: <Flame className="w-5 h-5" />
  }
];

export default function PathToTogether() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const filteredJourneys = activeCategory === "all" 
    ? journeys 
    : journeys.filter(journey => journey.category.toLowerCase() === activeCategory.toLowerCase());

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
            Path to Together
          </h1>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-6 animate-slide-up">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg p-6 mb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Science-Based Relationship Journeys
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our relationship journeys are carefully crafted based on established psychological theories and evidence-based practices. Each journey combines insights from relationship science, attachment theory, positive psychology, and therapeutic approaches to help you build a stronger, more fulfilling connection.
            </p>
            
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <RocketIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Your Path to Together</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Our core program consists of five sequential journeys that build upon each other for maximum relationship growth. We recommend following them in order from Journey 1 to 5 for the most comprehensive experience.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    However, each journey is designed to stand on its own, so you can also start with the one that addresses your most pressing relationship needs right now. Every step you take brings you closer to a more connected partnership.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "The quality of our relationships determines the quality of our lives." — Esther Perel
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Journeys
          </button>
          <button
            onClick={() => setActiveCategory("foundation")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "foundation" 
                ? "bg-green-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Foundation
          </button>
          <button
            onClick={() => setActiveCategory("skills")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "skills" 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Skills
          </button>
          <button
            onClick={() => setActiveCategory("connection")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "connection" 
                ? "bg-rose-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Connection
          </button>
          <button
            onClick={() => setActiveCategory("intimacy")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "intimacy" 
                ? "bg-pink-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Intimacy
          </button>
        </div>

        {/* Recommended Sequence Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-amber-100 mb-1">Recommended Journey Sequence</h3>
              <p className="text-sm text-gray-700 dark:text-amber-200/70">
                For the best results, we recommend completing the first five journeys in sequence. Start with 5 Love Languages (1), then proceed to Effective Communication (2), Healthy Conflict Resolution (3), Deepening Intimacy (4), and finally Values & Vision Alignment (5).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredJourneys.map((journey) => (
            <div 
              key={journey.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => navigate(`/journey/${journey.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={journey.image} 
                  alt={journey.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 rounded text-xs font-medium">
                    {journey.duration}
                  </span>
                  {journey.sequence && (
                    <div className="px-2 py-1 bg-primary/90 text-white rounded text-xs font-medium flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      <span>Journey {journey.sequence}</span>
                    </div>
                  )}
                  {journey.free && (
                    <div className="px-2 py-1 bg-green-500/90 text-white rounded text-xs font-medium flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      <span>Free Access</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-white
                      ${journey.category === "Foundation" ? "bg-green-600" : 
                        journey.category === "Skills" ? "bg-indigo-600" : "bg-rose-500"}`}
                    >
                      {journey.icon}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{journey.category}</span>
                  </div>
                  {journey.badge && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {journey.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{journey.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{journey.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Psychological Foundation</h4>
                  <div className="flex flex-wrap gap-1">
                    {journey.psychology.map((item, i) => (
                      <span key={i} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  className="w-full py-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-medium text-sm group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    navigate(`/journey/${journey.id}`);
                  }}
                >
                  Explore Journey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Our Psychological Approach
            </h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">
              At Sparq Connect, we integrate multiple evidence-based psychological modalities to provide a comprehensive approach to relationship growth:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Anchor className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Attachment Theory</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Understanding how early attachment patterns influence adult relationships and building secure connection.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Gottman Method</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Research-based approach to strengthen relationships through improved communication and conflict resolution.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Emotionally Focused Therapy (EFT)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creating secure emotional bonds and addressing attachment needs in adult relationships.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Positive Psychology</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focusing on strengths, gratitude, and positive experiences to enhance relationship satisfaction.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cognitive Behavioral Techniques</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Identifying and changing negative thought patterns that impact relationship dynamics.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
} 