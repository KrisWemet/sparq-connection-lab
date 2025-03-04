import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Shield, 
  Flame, 
  Target, 
  Check, 
  ArrowRight, 
  HeartHandshake, 
  Bookmark,
  Send,
  Clock,
  PartyPopper
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { sexualityJourneyData } from "@/data/relationshipContent";
import { journeys } from "../data/journeys";

interface JourneyStep {
  title: string;
  description: string;
  steps: string[];
  quote: string;
}

interface JourneyActivity extends JourneyStep {
  video?: string;
  funActivity?: {
    title: string;
    instructions: string;
    examples: string[];
    reflection: string;
  };
  questions?: string[];
}

interface JourneyIntro {
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  intro: string;
  firstActivity: JourneyActivity;
}

interface StoredAnswer {
  answer: string;
  timestamp: string;
  author: 'You' | 'Partner';
}

// Helper functions for generating journey-specific activities
const generateLoveLanguagesActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Understanding Love Languages",
      description: "Discover the five different ways people express and receive love",
      steps: [
        "Learn about the five love languages",
        "Reflect on how you prefer to receive love",
        "Notice love language moments in your day",
        "Share your observations with your partner"
      ],
      quote: "Love is not one-size-fits-all. Understanding how we each experience love is the key to a deeper connection."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Exploring Love Languages`,
    description: phase?.description || "Discovering how you give and receive love",
    steps: [
      "Observe love languages in action",
      "Practice expressing love in your partner's language",
      "Reflect on your experiences",
      "Plan future expressions of love"
    ],
    quote: "Understanding your partner's love language is like finding the key to their heart."
  };
};

const generateCommunicationActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Active Listening Foundations",
      description: "Learn the basics of truly hearing and understanding your partner",
      steps: [
        "Practice focused attention without interrupting",
        "Use reflective listening techniques",
        "Notice non-verbal cues",
        "Share your experience of being heard"
      ],
      quote: "The biggest communication problem is we do not listen to understand. We listen to reply."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Building Communication Skills`,
    description: phase?.description || "Enhancing your connection through better communication",
    steps: [
      "Practice active listening",
      "Express feelings using 'I' statements",
      "Validate your partner's perspective",
      "Create shared understanding"
    ],
    quote: "Every conversation is an opportunity to deepen your connection."
  };
};

const generateConflictActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Understanding Conflict Patterns",
      description: "Identify your typical responses to disagreements",
      steps: [
        "Recognize your conflict triggers",
        "Notice your emotional responses",
        "Practice self-regulation techniques",
        "Share insights with your partner"
      ],
      quote: "Conflict is growth trying to happen."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Healthy Conflict Resolution`,
    description: phase?.description || "Transform conflicts into opportunities for growth",
    steps: [
      "Practice emotional awareness",
      "Use repair attempts during disagreements",
      "Focus on understanding, not winning",
      "Build solutions together"
    ],
    quote: "Behind every complaint is a deep personal longing."
  };
};

const generateIntimacyActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Building Emotional Safety",
      description: "Create a foundation of trust and vulnerability",
      steps: [
        "Share a meaningful memory",
        "Practice emotional presence",
        "Express appreciation",
        "Create a moment of connection"
      ],
      quote: "True intimacy is built on emotional safety and trust."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Deepening Your Connection`,
    description: phase?.description || "Strengthening your emotional and physical bond",
    steps: [
      "Practice emotional vulnerability",
      "Share feelings and needs",
      "Create intimate moments",
      "Celebrate your connection"
    ],
    quote: "Intimacy is the courage to show up and let ourselves be seen."
  };
};

const generateValuesActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Discovering Core Values",
      description: "Identify what matters most to you individually",
      steps: [
        "Reflect on your personal values",
        "Notice how values guide your choices",
        "Share your values with your partner",
        "Find common ground"
      ],
      quote: "When our actions align with our values, we create a life of meaning."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Aligning Values`,
    description: phase?.description || "Creating a shared vision based on your values",
    steps: [
      "Explore shared values",
      "Set value-aligned goals",
      "Make conscious choices",
      "Build your future together"
    ],
    quote: "Shared values are the foundation of a lasting partnership."
  };
};

const generateAppreciationActivity = (day: number, phase: any) => {
  const activities = {
    1: {
      title: "Cultivating Gratitude",
      description: "Develop the habit of noticing and expressing appreciation",
      steps: [
        "Notice positive moments",
        "Express specific appreciation",
        "Share the impact of kind actions",
        "Create gratitude rituals"
      ],
      quote: "Gratitude turns what we have into enough."
    }
  };

  return activities[day] || {
    title: `Day ${day}: Building Appreciation`,
    description: phase?.description || "Strengthening your bond through gratitude",
    steps: [
      "Practice daily appreciation",
      "Notice partner's contributions",
      "Share specific compliments",
      "Celebrate your growth"
    ],
    quote: "In daily life we must see that it is not happiness that makes us grateful, but gratefulness that makes us happy."
  };
};

// Add this function before it's used
const getDayActivity = (journeyId: string, day: number) => {
  // Get the journey data
  const journey = journeys.find(j => j.id === journeyId);
  if (!journey) {
    console.error('Journey not found:', journeyId);
    return null;
  }

  // Find which phase we're in based on the day number
  const phase = journey.phases?.find(p => {
    const dayRange = p.days.match(/Days (\d+)-(\d+)/);
    if (dayRange) {
      const [_, start, end] = dayRange;
      return day >= parseInt(start) && day <= parseInt(end);
    }
    return false;
  });

  // Generate activity based on journey type and day
  switch (journeyId) {
    case "love-languages":
      return generateLoveLanguagesActivity(day, phase);
    case "communication":
      return generateCommunicationActivity(day, phase);
    case "conflict":
      return generateConflictActivity(day, phase);
    case "intimacy":
      return generateIntimacyActivity(day, phase);
    case "values":
      return generateValuesActivity(day, phase);
    case "appreciation":
      return generateAppreciationActivity(day, phase);
    default:
      return {
        title: `Day ${day}: ${phase?.description || "Continuing Your Journey"}`,
        description: `Building on your progress from ${day === 1 ? "the beginning" : "day " + (day-1)}`,
        steps: [
          `Reflect on your learnings from ${day === 1 ? "previous experiences" : "day " + (day-1)}`,
          "Practice new skills with your partner",
          "Document your experiences and insights",
          "Plan how to apply these lessons going forward"
        ],
        quote: "Every day is a new opportunity to strengthen your connection."
      };
  }
};

// This would normally be fetched from an API based on the journeyId
const getJourneyIntro = (journeyId: string) => {
  switch (journeyId) {
    case 'love-languages':
      return {
        title: "5 Love Languages",
        description: "Discover the primary ways you and your partner express and receive love",
        icon: <Heart className="w-8 h-8 text-white" />,
        color: "bg-green-600",
        intro: "Welcome to the beginning of your 5 Love Languages journey! Over the next two weeks, you'll discover how you and your partner naturally give and receive love. This understanding will transform your ability to connect meaningfully with each other.",
        firstActivity: {
          title: "Understanding the 5 Love Languages",
          description: "The concept of the 5 Love Languages was developed by Dr. Gary Chapman after years of counseling couples. He noticed patterns in how partners expressed love and what made them feel loved.",
          steps: [
            "Reflect on how you typically express love to others",
            "Consider moments when you've felt most loved - what made them special?",
            "Journal your initial thoughts about which love language might be your primary one",
            "Share your reflections with your partner and listen to their perspective"
          ],
          quote: "When you express love to your partner in a language that they understand, the relationship flourishes. But when you miss their language, understanding and connection break down."
        }
      };
    case 'communication':
      return {
        title: "Effective Communication",
        description: "Master the art of truly understanding each other through validated techniques",
        icon: <MessageCircle className="w-8 h-8 text-white" />,
        color: "bg-indigo-600",
        intro: "Welcome to your Effective Communication journey! Over the next three weeks, you'll learn powerful techniques to express yourself clearly and listen deeply to your partner.",
        firstActivity: {
          title: "The Foundation of Communication",
          description: "Communication is more than just words. It involves listening, understanding, and creating a safe space for honest expression.",
          steps: [
            "Practice the 'speaker-listener' technique with a simple topic",
            "Reflect on your communication patterns in your journal",
            "Identify one communication habit you'd like to improve",
            "Share your insights with your partner and set a communication goal together"
          ],
          quote: "The biggest communication problem is we do not listen to understand. We listen to reply."
        }
      };
    case 'conflict':
      return {
        title: "Healthy Conflict Resolution",
        description: "Transform disagreements into opportunities for growth and understanding",
        icon: <Shield className="w-8 h-8 text-white" />,
        color: "bg-indigo-600",
        intro: "Welcome to your Healthy Conflict Resolution journey! Over the next four weeks, you'll learn how to navigate disagreements in ways that strengthen rather than damage your relationship.",
        firstActivity: {
          title: "Understanding Conflict Patterns",
          description: "Conflict is natural in any relationship. The key is not to avoid it, but to handle it in ways that build trust and understanding.",
          steps: [
            "Reflect on your typical response to conflict (e.g., avoid, confront, compromise)",
            "Identify one recent conflict and write about it from your partner's perspective",
            "Practice the pause technique when you feel triggered",
            "Create a plan with your partner for handling future conflicts"
          ],
          quote: "In the middle of difficulty lies opportunity. Conflict, when navigated skillfully, can be the pathway to deeper connection."
        }
      };
    case '36-questions':
      return {
        title: "36 Questions to Fall in Love",
        description: "Foster intimacy through a scientifically-designed question sequence",
        icon: <HeartHandshake className="w-8 h-8 text-white" />,
        color: "bg-rose-500",
        intro: "Welcome to the '36 Questions to Fall in Love' journey! Developed by psychologist Dr. Arthur Aron, these questions have been shown to foster closeness between two people, even strangers. The questions are designed to gradually increase self-disclosure and vulnerability, creating a foundation for deeper connection.",
        firstActivity: {
          title: "Set I: Getting to Know Each Other",
          description: "The first set of questions are relatively easy and help you warm up to the experience. Take turns asking each other these questions, and be sure to answer honestly and thoroughly.",
          steps: [
            "Find a quiet, comfortable space where you won't be interrupted",
            "Take turns asking and answering each question",
            "Listen actively without judgment when your partner responds",
            "Answer all questions from Set I before moving to Set II"
          ],
          video: "", // Empty until we have a real video
          quote: "Vulnerability sounds like truth and feels like courage. Truth and courage aren't always comfortable, but they're never weakness. — Brené Brown",
          questions: [
            "Given the choice of anyone in the world, whom would you want as a dinner guest?",
            "Would you like to be famous? In what way?",
            "Before making a telephone call, do you ever rehearse what you are going to say? Why?",
            "What would constitute a 'perfect' day for you?",
            "When did you last sing to yourself? To someone else?",
            "If you were able to live to the age of 90 and retain either the mind or body of a 30-year-old for the last 60 years of your life, which would you want?",
            "Do you have a secret hunch about how you will die?",
            "Name three things you and your partner appear to have in common.",
            "For what in your life do you feel most grateful?",
            "If you could change anything about the way you were raised, what would it be?",
            "Take four minutes and tell your partner your life story in as much detail as possible.",
            "If you could wake up tomorrow having gained any one quality or ability, what would it be?"
          ]
        }
      };
    case 'playful-connection':
      return {
        title: "Playful Connection",
        description: "Strengthen your bond through fun, laughter and lighthearted activities",
        icon: <PartyPopper className="w-8 h-8 text-white" />,
        color: "bg-cyan-500",
        intro: "Welcome to your Playful Connection journey! Over the next two weeks, you'll rediscover the joy of playing together, laughing together, and creating meaningful moments of fun. Relationships thrive when couples can be lighthearted and playful with each other!",
        firstActivity: {
          title: "Laughter Is The Best Medicine",
          description: "Humor and laughter bring couples closer together. Studies show that couples who laugh together report higher relationship satisfaction and feel more connected.",
          steps: [
            "Share the funniest memory you have of your time together",
            "Find a funny video or meme that made you laugh and share it",
            "Take turns telling jokes (they can be as corny as you want!)",
            "Try to make each other laugh with silly faces or impressions"
          ],
          video: "", // Empty until we have a real video
          quote: "A good laugh is sunshine in a house. — William Makepeace Thackeray",
          funActivity: {
            title: "Two Truths and a Lie: Ridiculous Edition",
            instructions: "Take turns sharing three statements about yourself - two true and one false. The catch? Make them all sound completely ridiculous or outlandish! Your partner has to guess which one is the lie.",
            examples: [
              "I once ate fourteen bananas in one sitting.",
              "When I was six, I was convinced I could talk to squirrels.",
              "I secretly practiced Spice Girls choreography for three months in high school."
            ],
            reflection: "What new or surprising thing did you learn about your partner? Did laughter make it easier to share something you might not have otherwise?"
          }
        }
      };
    case 'intimate-connection':
      return {
        title: "Intimate Connection",
        description: "Build deeper physical and emotional intimacy through mindful connection practices",
        icon: <Flame className="w-8 h-8 text-white" />,
        color: "bg-rose-500",
        intro: "Welcome to the Intimate Connection journey. Over the next two weeks, you'll develop a deeper, more fulfilling intimate connection with your partner through mindfulness, communication, and gentle exploration. This journey focuses on creating a strong foundation of trust and understanding in the most personal aspects of your relationship.",
        firstActivity: {
          title: "Creating Safety and Trust",
          description: "Physical and emotional intimacy flourish in an environment of safety and trust. Research shows that couples who establish clear boundaries and communication about intimacy report significantly higher relationship satisfaction.",
          steps: [
            "Find a quiet, comfortable space without distractions",
            "Face each other and maintain gentle eye contact",
            "Take turns sharing what helps you feel safe and secure with your partner",
            "Listen actively without interrupting or judging"
          ],
          video: "",
          quote: "Trust is the glue of life. It's the most essential ingredient in effective communication. It's the foundational principle that holds all relationships. — Stephen Covey",
          funActivity: {
            title: "Intimacy Temperature Check",
            instructions: "This playful activity helps you both understand your current comfort levels with different aspects of intimacy. Rate each prompt from 1-10 (1 being 'not comfortable at all' and 10 being 'completely comfortable'). Compare your answers and discuss any differences with curiosity, not judgment.",
            examples: [
              "Sharing my deepest fears with my partner",
              "Discussing my physical desires openly",
              "Being vulnerable about my insecurities",
              "Giving specific feedback about what I enjoy intimately",
              "Trying new experiences together in the bedroom"
            ],
            reflection: "What surprised you about your partner's responses? Which areas might you want to explore more deeply together?"
          }
        }
      };
    case 'desire-exploration':
      return {
        title: "Desire Exploration",
        description: "Discover and communicate desires, fantasies, and preferences in a safe, supportive space",
        icon: <Flame className="w-8 h-8 text-white" />,
        color: "bg-pink-500",
        intro: "Welcome to the Desire Exploration journey. Over the next three weeks, you and your partner will create a judgment-free space to discover and communicate your desires, fantasies, and preferences. This journey emphasizes open communication, consent, and playful exploration to enhance your intimate connection.",
        firstActivity: {
          title: "Desire Mapping",
          description: "Understanding and communicating your desires is the first step toward a more fulfilling intimate life. Research shows that couples who can openly discuss desires experience greater satisfaction and connection.",
          steps: [
            "Individually, reflect on what you find most fulfilling in your intimate life",
            "Consider what you're curious about but haven't yet explored",
            "Write down your thoughts privately in a journal",
            "Choose what you feel comfortable sharing with your partner"
          ],
          video: "",
          quote: "Desire is the starting point of all achievement, not a hope, not a wish, but a keen pulsating desire which transcends everything. — Napoleon Hill",
          funActivity: {
            title: "Fantasy Postcard",
            instructions: "This lighthearted activity helps you share fantasies in a playful, low-pressure way. Imagine you're sending a postcard from a fantasy scenario. Write a brief 'Wish you were here' message describing a scene or experience you find appealing. You can be as specific or vague as feels comfortable.",
            examples: [
              "Wish you were here... in a luxurious hotel room with soft music and no interruptions for 24 hours",
              "Wish you were here... trying that position we saw in that movie that made us both blush",
              "Wish you were here... exploring a new sensation together that we've been curious about",
              "Wish you were here... letting me take complete control of our evening together",
              "Wish you were here... surprising me with something you've always wanted to try"
            ],
            reflection: "How did it feel to share these 'postcards'? Was anything surprising about your partner's fantasy?"
          }
        }
      };
    case 'boundaries-beyond':
      return {
        title: "Boundaries & Beyond",
        description: "Explore advanced intimate practices with clear communication, consent, and trust",
        icon: <Flame className="w-8 h-8 text-white" />,
        color: "bg-purple-500",
        intro: "Welcome to the Boundaries & Beyond journey. This advanced four-week program is designed for couples who have established strong trust and communication and are ready to explore more adventurous dimensions of intimacy. You'll develop sophisticated consent practices, explore power dynamics safely, and discover new aspects of your connection.",
        firstActivity: {
          title: "Advanced Consent Communication",
          description: "At the foundation of any adventurous exploration is a sophisticated understanding of consent. Research shows that clear, ongoing consent communication not only prevents harm but significantly enhances pleasure and connection.",
          steps: [
            "Discuss your understanding of consent as ongoing and enthusiastic",
            "Create a personalized system for communicating boundaries in the moment",
            "Practice using verbal and non-verbal signals for yes, no, and pause",
            "Reflect on how enhanced consent communication feels for both of you"
          ],
          video: "",
          quote: "The essence of consent is respecting the other person's wants as much as you respect your own wants. — Charlie Glickman",
          funActivity: {
            title: "Green, Yellow, Red",
            instructions: "This activity helps establish a simple but effective communication system for any intimate exploration. Take turns suggesting scenarios or activities while your partner responds with 'Green' (enthusiastic yes), 'Yellow' (maybe, with conditions), or 'Red' (firm no). For 'Yellow' responses, discuss what modifications would make it a 'Green'.",
            examples: [
              "How would you feel about trying light restraints, like using a scarf?",
              "Would you be interested in exploring a dominant/submissive dynamic?",
              "Are you open to incorporating toys into our intimate play?",
              "How do you feel about trying a new location for intimacy?",
              "Would you enjoy creating and acting out a role-play scenario?"
            ],
            reflection: "What patterns did you notice in your responses? Were there any surprising 'Greens' or unexpected 'Reds'?"
          }
        }
      };
    default:
      return {
        title: "Your Journey",
        description: "Begin your path to relationship growth",
        icon: <Heart className="w-8 h-8 text-white" />,
        color: "bg-primary",
        intro: "Welcome to your relationship journey! We're excited to guide you through practices and insights that will strengthen your connection.",
        firstActivity: {
          title: "Getting Started",
          description: "This journey is designed to help you develop new skills and insights for your relationship.",
          steps: [
            "Set your intentions for this journey",
            "Reflect on what you hope to gain",
            "Share your goals with your partner",
            "Commit to regular practice"
          ],
          quote: "The quality of your relationships determines the quality of your life."
        }
      };
  }
};

// Mock function to simulate storing data - in a real app, this would connect to your backend
const storeAnswer = async (journeyId: string, questionIndex: number, answer: string, partner: string) => {
  // Simulate API call with a timeout
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store in localStorage for demo purposes
  const storageKey = `journey-${journeyId}-answers`;
  const existingAnswers = JSON.parse(localStorage.getItem(storageKey) || '{}');
  
  existingAnswers[questionIndex] = {
    answer,
    timestamp: new Date().toISOString(),
    author: partner === 'partner' ? 'Partner' : 'You'
  };
  
  localStorage.setItem(storageKey, JSON.stringify(existingAnswers));
  return true;
};

// Mock function to get stored answers
const getStoredAnswers = (journeyId: string) => {
  const storageKey = `journey-${journeyId}-answers`;
  return JSON.parse(localStorage.getItem(storageKey) || '{}');
};

// Mock function to notify partner
const notifyPartner = async (journeyId: string, questionIndex: number) => {
  // In a real app, this would send a push notification, in-app notification, etc.
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Notified partner about answer to question ${questionIndex + 1}`);
  return true;
};

const JourneyIcon = ({ journeyIntro }: { journeyIntro: any }) => {
  const Icon = journeyIntro?.icon;
  return Icon ? <Icon className="w-8 h-8 text-white" /> : null;
};

export default function JourneyStart() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const [journeyIntro, setJourneyIntro] = useState<JourneyIntro | null>(null);
  const [dayActivity, setDayActivity] = useState<JourneyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answeredBy, setAnsweredBy] = useState<'you' | 'partner'>('you');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedAnswers, setStoredAnswers] = useState<Record<number, StoredAnswer>>({});

  useEffect(() => {
    if (!journeyId) {
      setError('No journey ID provided');
      setLoading(false);
      return;
    }

    try {
      // Get the journey intro
      const intro = getJourneyIntro(journeyId);
      if (!intro) {
        setError('Journey not found');
        setLoading(false);
        return;
      }
      setJourneyIntro(intro);

      // Get the day parameter from URL
      const params = new URLSearchParams(window.location.search);
      const day = parseInt(params.get('day') || '1', 10);

      // Get the day's activity
      const activity = getDayActivity(journeyId, day);
      if (!activity) {
        setError('Activity not found');
        setLoading(false);
        return;
      }
      setDayActivity(activity);

      // Initialize completed steps array
      setCompleted(new Array(activity.steps.length).fill(false));
      
      // Load stored answers if they exist
      const storageKey = `journey-${journeyId}-answers`;
      const savedAnswers = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setStoredAnswers(savedAnswers);

      setLoading(false);
    } catch (err) {
      console.error('Error loading journey:', err);
      setError('Failed to load journey content');
      setLoading(false);
    }
  }, [journeyId]);

  // Update allCompleted when completed array changes
  useEffect(() => {
    if (completed.length > 0) {
      setAllCompleted(completed.every(Boolean));
    }
  }, [completed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/journeys')}>
            Return to Journeys
          </Button>
        </div>
      </div>
    );
  }

  if (!journeyIntro || !dayActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Journey Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't find the journey you're looking for.</p>
          <Button onClick={() => navigate('/journeys')}>
            Return to Journeys
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkComplete = (index: number) => {
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
    
    if (newCompleted[index]) {
      toast.success("Step marked as complete!");
    }
  };
  
  const handleContinue = async () => {
    if (!journeyId) return;
    
    const params = new URLSearchParams(window.location.search);
    const currentDay = parseInt(params.get('day') || '1', 10);
    
    // Save progress before continuing
    const progress = {
      completed,
      day: currentDay,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`journey-${journeyId}-progress`, JSON.stringify(progress));
    
    // Navigate to next day
    navigate(`/journey/${journeyId}/start?day=${currentDay + 1}`);
  };

  const handleAnswerSubmit = async () => {
    if (!journeyId || !answer.trim()) return;
    
    setIsSubmitting(true);
    try {
      await storeAnswer(journeyId, currentQuestionIndex, answer, answeredBy);
      
      // Update local state
      setStoredAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          answer,
          timestamp: new Date().toISOString(),
          author: answeredBy === 'partner' ? 'Partner' : 'You'
        }
      }));
      
      // Clear input and move to next question if available
      setAnswer('');
      if (journeyIntro?.firstActivity.questions && 
          currentQuestionIndex < journeyIntro.firstActivity.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        toast.success("All questions completed!");
      }
    } catch (error) {
      toast.error("Failed to save your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnsweredBy = () => {
    setAnsweredBy(prev => prev === 'you' ? 'partner' : 'you');
    toast.info(`Now answering as: ${answeredBy === 'you' ? 'Partner' : 'You'}`);
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
          <div className="text-center flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {journeyIntro.title} Journey
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Day {currentQuestionIndex + 1}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 pt-6 animate-slide-up">
        {/* Welcome Card */}
        <Card className="overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className={`p-6 ${journeyIntro.color} text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 rounded-full bg-white/20 flex-shrink-0">
                <JourneyIcon journeyIntro={journeyIntro} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{journeyIntro.title}</h2>
                <p className="text-white/90">{journeyIntro.description}</p>
              </div>
            </div>
            <p className="text-lg text-white/95">
              {currentQuestionIndex === 0 ? journeyIntro.intro : `Welcome back to Day ${currentQuestionIndex + 1} of your journey!`}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {dayActivity.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {dayActivity.description}
            </p>
            
            {/* Video section */}
            {journeyIntro.firstActivity.video && (
              <div className="rounded-lg overflow-hidden mb-6 aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={journeyIntro.firstActivity.video} 
                  title="Introduction Video"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}
            
            {/* Quote */}
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 dark:text-gray-400 mb-6">
              "{dayActivity.quote}"
            </blockquote>
            
            {/* Fun Activity section for the playful-connection journey */}
            {journeyIntro.firstActivity.funActivity && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <PartyPopper className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Fun Activity: {journeyIntro.firstActivity.funActivity.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                  {journeyIntro.firstActivity.funActivity.instructions}
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Examples:</h5>
                  <ul className="space-y-1">
                    {journeyIntro.firstActivity.funActivity.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{idx + 1}</span>
                        </div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Reflection:</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {journeyIntro.firstActivity.funActivity.reflection}
                  </p>
                </div>
              </div>
            )}
            
            {/* Questions chat interface for 36 Questions journey */}
            {journeyId === "36-questions" && journeyIntro.firstActivity.questions && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">36 Questions Discussion:</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(prev => prev - 1);
                        }
                      }}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (currentQuestionIndex < journeyIntro.firstActivity.questions.length - 1) {
                          setCurrentQuestionIndex(prev => prev + 1);
                        }
                      }}
                      disabled={currentQuestionIndex === journeyIntro.firstActivity.questions.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                
                {/* Current question card */}
                <Card className="p-4 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`${journeyIntro.color} text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium`}>
                      {currentQuestionIndex + 1}
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 text-lg">
                        {journeyIntro.firstActivity.questions[currentQuestionIndex]}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> 
                        Question {currentQuestionIndex + 1} of {journeyIntro.firstActivity.questions.length}
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Previous answers */}
                {storedAnswers[currentQuestionIndex] && (
                  <AnimatedContainer variant="slideUp" className="mb-4">
                    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="w-8 h-8 bg-primary">
                          {storedAnswers[currentQuestionIndex].author === 'You' ? 'Y' : 'P'}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {storedAnswers[currentQuestionIndex].author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(storedAnswers[currentQuestionIndex].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {storedAnswers[currentQuestionIndex].answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedContainer>
                )}
                
                {/* Answer input */}
                <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Answer
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleAnsweredBy}
                      className="text-xs"
                    >
                      Answering as: {answeredBy === 'you' ? 'You' : 'Partner'}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your answer here..."
                      className="min-h-24 resize-none"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Button 
                      onClick={handleAnswerSubmit}
                      disabled={isSubmitting || !answer.trim()}
                      className={journeyIntro.color}
                    >
                      {isSubmitting ? (
                        <>Saving...</>
                      ) : (
                        <>
                          Submit Answer
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Your answers are saved and can be revisited later. Your partner will be notified when you submit.
                  </p>
                </div>
              </div>
            )}
            
            {/* Steps - keep these for non-36-questions journeys or as general guidance */}
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Activity Steps:</h4>
            <div className="space-y-3 mb-6">
              {dayActivity.steps.map((step: string, index: number) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => handleMarkComplete(index)}
                >
                  <div className={`p-1 rounded-full ${completed[index] ? journeyIntro.color : 'bg-gray-200 dark:bg-gray-700'} flex-shrink-0`}>
                    <Check className={`w-4 h-4 ${completed[index] ? 'text-white' : 'text-gray-400 dark:text-gray-600'}`} />
                  </div>
                  <span className={`${completed[index] ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Continue button */}
            <Button 
              className={`w-full py-6 ${journeyIntro.color} ${!allCompleted && 'opacity-70'}`}
              onClick={handleContinue}
              disabled={!allCompleted}
            >
              Continue Your Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!allCompleted && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Complete all steps to continue
              </p>
            )}
            
            {/* Special buttons for 36 Questions journey */}
            {journeyId === "36-questions" && (
              <div className="mt-4 flex flex-col space-y-3">
                <Button 
                  variant="outline"
                  className="w-full border-gray-200 dark:border-gray-700"
                  onClick={() => {
                    toast.success("Your progress has been saved for later!");
                  }}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save for Later
                </Button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Take your time with these questions. You can always come back where you left off.
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
} 