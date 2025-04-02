import {
  Compass,
  Star,
  MessageCircle,
  Heart,
  Sparkles,
  Flame,
  Users,
  Zap,
  HeartHandshake,
  Leaf,
  Shield,
  Clock
} from "lucide-react";
import { Flame as FlameIcon, Sparkles as SparklesIcon, Users as UsersIcon } from "lucide-react";
import { LucideIcon } from 'lucide-react';

// Question categories based on GitHub repository
const questionCategories = [
  {
    id: "adventure",
    name: "Adventure & Fun",
    description: "Playful questions to spark joy and adventure in your relationship",
    icon: Compass as LucideIcon,
    color: "bg-blue-100 text-blue-800",
    theory: "Positive psychology suggests shared novel experiences strengthen bonds",
    benefits: "Couples who engage in novel activities together report 36% higher relationship satisfaction",
    goal: "Discover new activities and experiences that bring you joy as a couple",
    isPremium: false
  },
  {
    id: "appreciation",
    name: "Appreciation & Gratitude",
    description: "Express thankfulness and recognize each other's contributions",
    icon: Star as LucideIcon,
    color: "bg-yellow-100 text-yellow-800",
    theory: "Gratitude practice increases relationship satisfaction",
    benefits: "Daily gratitude practices can reduce relationship conflicts by up to 28%",
    goal: "Build a habit of noticing and expressing appreciation for your partner",
    isPremium: false
  },
  {
    id: "communication",
    name: "Communication & Conflict",
    description: "Improve how you communicate and resolve disagreements",
    icon: MessageCircle as LucideIcon,
    color: "bg-indigo-100 text-indigo-800",
    theory: "Gottman's research on communication patterns and conflict resolution",
    benefits: "Couples with strong communication skills are 70% more likely to report high relationship satisfaction",
    goal: "Develop healthier communication patterns and conflict resolution strategies",
    isPremium: false
  },
  {
    id: "emotional",
    name: "Emotional Intimacy",
    description: "Deepen your emotional connection and understanding",
    icon: Heart as LucideIcon,
    color: "bg-red-100 text-red-800",
    theory: "Attachment theory principles for secure emotional bonds",
    benefits: "Emotional intimacy is the #1 predictor of long-term relationship success",
    goal: "Create a deeper emotional connection through vulnerability and understanding",
    isPremium: false
  },
  {
    id: "hopes",
    name: "Hopes & Dreams",
    description: "Share aspirations and build a vision for your future together",
    icon: Sparkles as LucideIcon,
    color: "bg-purple-100 text-purple-800",
    theory: "Narrative therapy approach to co-creating relationship stories",
    benefits: "Couples who regularly discuss future goals are 31% more likely to stay together",
    goal: "Align your visions for the future and support each other's dreams",
    isPremium: false
  },
  {
    id: "physical",
    name: "Intimacy & Physical",
    description: "Explore physical connection and intimacy preferences",
    icon: FlameIcon as LucideIcon,
    color: "bg-rose-100 text-rose-800",
    theory: "Sensate focus techniques from sex therapy",
    benefits: "Physical intimacy releases oxytocin, strengthening your emotional bond",
    goal: "Enhance your physical connection and understand each other's needs better",
    isPremium: true
  },
  {
    id: "lgbt",
    name: "LGBTQ+ Relationships",
    description: "Questions specific to LGBTQ+ relationship experiences",
    icon: UsersIcon as LucideIcon,
    color: "bg-pink-100 text-pink-800",
    theory: "Minority stress theory and affirmative relationship approaches",
    benefits: "Addressing unique aspects of LGBTQ+ relationships can increase feelings of validation by 45%",
    goal: "Navigate the unique aspects of your relationship with understanding and pride",
    isPremium: true
  },
  {
    id: "distance",
    name: "Long Distance",
    description: "Maintain connection when physically apart",
    icon: Zap as LucideIcon,
    color: "bg-cyan-100 text-cyan-800",
    theory: "Interdependence theory applied to distance relationships",
    benefits: "Long-distance couples who communicate effectively report stronger trust than proximate couples",
    goal: "Build and maintain a strong connection despite physical distance",
    isPremium: true
  },
  {
    id: "love",
    name: "Love Languages & Affection",
    description: "Discover how you each express and receive love",
    icon: HeartHandshake as LucideIcon,
    color: "bg-emerald-100 text-emerald-800",
    theory: "Chapman's Five Love Languages framework",
    benefits: "Understanding your partner's love language can increase relationship satisfaction by 23%",
    goal: "Learn to express love in ways that resonate most with your partner",
    isPremium: true
  },
  {
    id: "growth",
    name: "Personal Growth",
    description: "Support each other's individual development",
    icon: Leaf as LucideIcon,
    color: "bg-green-100 text-green-800",
    theory: "Differentiation-based approaches to healthy interdependence",
    benefits: "Couples who support each other's personal growth are 34% less likely to break up",
    goal: "Balance individual growth with relationship growth for a healthier partnership",
    isPremium: true
  },
  {
    id: "sexual",
    name: "Sexual Connection",
    description: "Explore desires, preferences, and sexual communication",
    icon: FlameIcon as LucideIcon,
    color: "bg-orange-100 text-orange-800",
    theory: "Sex-positive therapy approaches to intimate communication",
    benefits: "Couples who communicate openly about sex report 62% higher sexual satisfaction",
    goal: "Develop a fulfilling sexual connection based on open communication and trust",
    isPremium: true
  },
  {
    id: "memories",
    name: "Shared Memories",
    description: "Reflect on your journey and special moments together",
    icon: Clock as LucideIcon,
    color: "bg-amber-100 text-amber-800",
    theory: "Reminiscence therapy principles for relationship bonding",
    benefits: "Regularly reminiscing about positive shared experiences strengthens relationship bonds",
    goal: "Celebrate your history together and use it as a foundation for future growth",
    isPremium: true
  },
  {
    id: "values",
    name: "Values & Beliefs",
    description: "Explore core principles that guide your lives",
    icon: Shield as LucideIcon,
    color: "bg-slate-100 text-slate-800",
    theory: "Acceptance and Commitment Therapy (ACT) values clarification",
    benefits: "Couples with aligned core values report 40% higher relationship satisfaction",
    goal: "Understand each other's values and create shared meaning in your relationship",
    isPremium: true
  },
  {
    id: "polyamory",
    name: "Polyamory & Open Relationships",
    description: "Navigate multiple loving relationships ethically",
    icon: UsersIcon as LucideIcon,
    color: "bg-violet-100 text-violet-800",
    theory: "Consensual non-monogamy research and ethical frameworks",
    benefits: "Clear agreements and communication in non-monogamous relationships reduce conflict by 47%",
    goal: "Build healthy, ethical connections with multiple partners based on trust and communication",
    isPremium: true
  },
  {
    id: "kink",
    name: "Kink & Alternative Sexuality",
    description: "Explore alternative expressions of intimacy and desire",
    icon: SparklesIcon as LucideIcon,
    color: "bg-fuchsia-100 text-fuchsia-800",
    theory: "Sex-positive and kink-aware therapeutic approaches",
    benefits: "Exploring kink with clear consent and communication can deepen trust and intimacy",
    goal: "Safely explore desires and fantasies to enhance your intimate connection",
    isPremium: true
  }
];

export default questionCategories;