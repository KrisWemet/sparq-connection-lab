import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Check, 
  X, 
  CreditCard, 
  Sparkles, 
  Heart, 
  Calendar, 
  MessageCircle, 
  Target, 
  Zap,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Pricing plans data
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic features to get started",
    features: [
      { name: "Daily relationship quiz (1 per day)", included: true },
      { name: "Basic conversation starters", included: true },
      { name: "Limited goal tracking (3 goals)", included: true },
      { name: "Basic messaging", included: true },
      { name: "5 date ideas per month", included: true },
      { name: "Basic relationship dashboard", included: true },
      { name: "Unlimited journeys access", included: false },
      { name: "Advanced relationship analytics", included: false },
      { name: "Unlimited goals & milestones", included: false },
      { name: "Premium conversation topics", included: false },
      { name: "Relationship timeline", included: false },
      { name: "Compatibility assessments", included: false },
    ],
    popular: false,
    buttonText: "Current Plan",
    disabled: true,
    testimonial: {
      quote: "We started with the free plan and saw immediate improvements in our communication.",
      author: "Jamie & Alex",
      relationship: "Dating 2 years"
    }
  },
  {
    id: "premium",
    name: "Premium",
    price: 4.99,
    yearlyPrice: 49.99,
    description: "Everything you need for a thriving relationship",
    features: [
      { name: "Daily relationship quiz (3 per day)", included: true },
      { name: "Premium conversation starters", included: true },
      { name: "Unlimited goal tracking", included: true },
      { name: "Advanced messaging features", included: true },
      { name: "Unlimited date ideas", included: true },
      { name: "Advanced relationship dashboard", included: true },
      { name: "3 free journeys included", included: true },
      { name: "Advanced relationship analytics", included: true },
      { name: "Unlimited goals & milestones", included: true },
      { name: "Premium conversation topics", included: true },
      { name: "Relationship timeline", included: true },
      { name: "Basic compatibility assessments", included: true },
      { name: "Guided visualizations", included: true, new: true },
      { name: "Hypnotic relationship stories", included: true, new: true },
    ],
    popular: true,
    buttonText: "Upgrade Now",
    disabled: false,
    testimonial: {
      quote: "Premium helped us discover parts of our relationship we never knew existed. We feel closer than ever.",
      author: "Taylor & Jordan",
      relationship: "Married 3 years",
      statistic: "90% of Premium users report deeper emotional connection within 30 days"
    },
    persuasiveText: "Experience how naturally your connection deepens with Premium features"
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 19.99,
    yearlyPrice: 199.99,
    description: "Complete relationship package for two partners with option to add more",
    features: [
      { name: "Unlimited daily quizzes for 2 users", included: true },
      { name: "All conversation starters", included: true },
      { name: "Advanced goal tracking & insights", included: true },
      { name: "Priority support", included: true },
      { name: "Custom date planning", included: true },
      { name: "Personalized relationship insights", included: true },
      { name: "All journeys included", included: true },
      { name: "Couples therapy resources", included: true },
      { name: "Advanced compatibility assessments", included: true },
      { name: "Intimacy enhancement modules", included: true },
      { name: "Conflict resolution tools", included: true },
      { name: "Early access to new features", included: true },
      { name: "AI Therapist access", included: true, new: true },
      { name: "Add additional partners ($9.99/mo each)", included: true, new: true },
      { name: "Dark mode", included: true },
      { name: "Advanced guided visualizations with audio", included: true, new: true },
      { name: "Future pacing exercises", included: true, new: true },
      { name: "Relationship metaphor animations", included: true, new: true },
    ],
    popular: false,
    buttonText: "Get Ultimate",
    disabled: false,
    testimonial: {
      quote: "Ultimate transformed our relationship. The guided visualizations and future pacing exercises helped us create a vision for our future that we're excited about every day.",
      author: "Sam & Riley",
      relationship: "Engaged after 1 year",
      statistic: "Ultimate users are 3.5x more likely to report 'extremely satisfied' with their relationship"
    },
    persuasiveText: "Feel the transformation in your relationship as you explore Ultimate features together"
  }
];

// Journey packages data
const journeys = [
  {
    id: "communication",
    title: "Effective Communication",
    description: "Master the art of truly understanding each other",
    price: 3.99,
    steps: 5,
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    popular: true
  },
  {
    id: "intimacy",
    title: "Deepening Intimacy",
    description: "Strengthen your emotional and physical connection",
    price: 4.99,
    steps: 7,
    image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&h=500",
    popular: false
  },
  {
    id: "trust",
    title: "Building Trust",
    description: "Create a foundation of security and reliability",
    price: 3.99,
    steps: 4,
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    popular: false
  },
  {
    id: "future",
    title: "Planning Your Future",
    description: "Align your visions and create shared goals",
    price: 4.99,
    steps: 6,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=500",
    popular: false
  },
  {
    id: "attachment",
    title: "Attachment Styles",
    description: "Understand your attachment patterns and build secure connections",
    price: 4.99,
    steps: 5,
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    popular: true,
    new: true
  },
  {
    id: "conflict",
    title: "Healthy Conflict Resolution",
    description: "Transform disagreements into opportunities for growth",
    price: 4.99,
    steps: 6,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=500",
    popular: false,
    new: true
  },
  {
    id: "bundle",
    title: "Complete Journey Bundle",
    description: "All current and future journeys at a discounted price",
    price: 14.99,
    steps: 33,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=500",
    popular: true,
    bestValue: true
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah & Michael",
    text: "Sparq Connect has transformed our relationship. The daily questions have helped us discover things about each other we never knew, even after 5 years together!",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200"
  },
  {
    id: 2,
    name: "Jessica & David",
    text: "The relationship journeys are worth every penny. We completed the Communication journey and it's like we finally speak the same language.",
    image: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=200&h=200"
  },
  {
    id: 3,
    name: "Alex & Jordan",
    text: "We started using Sparq when we first began dating, and now we're engaged! The compatibility assessments were eye-opening and helped us build a strong foundation.",
    image: "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?auto=format&fit=crop&w=200&h=200"
  }
];

export default function Subscription() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showTestimonial, setShowTestimonial] = useState<string | null>(null);
  const [highlightFeature, setHighlightFeature] = useState<{planId: string, featureIndex: number} | null>(null);
  
  // Highlight a random premium feature every few seconds
  useEffect(() => {
    if (billingCycle === "yearly") {
      const premiumPlan = plans.find(p => p.id === "premium");
      const ultimatePlan = plans.find(p => p.id === "ultimate");
      
      if (premiumPlan && ultimatePlan) {
        const interval = setInterval(() => {
          const planId = Math.random() > 0.5 ? "premium" : "ultimate";
          const plan = planId === "premium" ? premiumPlan : ultimatePlan;
          const includedFeatures = plan.features
            .map((f, i) => ({ ...f, index: i }))
            .filter(f => f.included);
          
          if (includedFeatures.length > 0) {
            const randomFeature = includedFeatures[Math.floor(Math.random() * includedFeatures.length)];
            setHighlightFeature({ planId, featureIndex: randomFeature.index });
            
            // Reset highlight after 2 seconds
            setTimeout(() => setHighlightFeature(null), 2000);
          }
        }, 5000);
        
        return () => clearInterval(interval);
      }
    }
  }, [billingCycle]);

  const handleSubscribe = (planId: string) => {
    toast.success(
      planId === "premium" 
        ? "You've upgraded to Premium! Notice how your connection naturally deepens as you explore new features together."
        : "You've upgraded to Ultimate! Feel the transformation in your relationship as you access all premium features.",
      { duration: 5000 }
    );
  };
  
  // Calculate savings for yearly billing
  const calculateYearlySavings = (plan: any) => {
    if (!plan.yearlyPrice || !plan.price) return 0;
    const monthlyCost = plan.price * 12;
    return Math.round((monthlyCost - plan.yearlyPrice) / monthlyCost * 100);
  };
  
  // Format price with appropriate billing cycle
  const formatPrice = (plan: any) => {
    if (plan.price === 0) return "Free";
    
    const price = billingCycle === "yearly" && plan.yearlyPrice 
      ? plan.yearlyPrice 
      : plan.price;
      
    return `$${price}${billingCycle === "yearly" ? "/year" : "/month"}`;
  };
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
      </div>
      
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full flex items-center">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly" 
                ? "bg-white shadow text-primary-700" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "yearly" 
                ? "bg-white shadow text-primary-700" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <span className="ml-1 text-xs font-bold text-green-600">Save up to 17%</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const yearlySavings = calculateYearlySavings(plan);
          
          return (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: plans.indexOf(plan) * 0.1 }}
              whileHover={!plan.disabled ? { scale: 1.02 } : {}}
              className="relative"
            >
              <Card className={`h-full overflow-hidden ${
                plan.popular 
                  ? "border-primary-200 shadow-lg" 
                  : "border-gray-200"
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 text-xs font-bold uppercase transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left shadow-sm">
                    Most Popular
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {plan.id === "premium" && <Sparkles className="h-5 w-5 mr-2 text-primary-500" />}
                    {plan.id === "ultimate" && <Heart className="h-5 w-5 mr-2 text-red-500" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                    {billingCycle === "yearly" && plan.yearlyPrice && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        Save {yearlySavings}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Persuasive text for premium/ultimate plans */}
                  {plan.persuasiveText && (
                    <motion.p 
                      className="text-sm italic text-primary-600 font-medium"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {plan.persuasiveText}
                    </motion.p>
                  )}
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <motion.div 
                        key={index}
                        className={`flex items-start ${
                          highlightFeature?.planId === plan.id && 
                          highlightFeature?.featureIndex === index
                            ? "bg-primary-50 -mx-4 px-4 py-1 rounded-md"
                            : ""
                        }`}
                        animate={
                          highlightFeature?.planId === plan.id && 
                          highlightFeature?.featureIndex === index
                            ? { 
                                backgroundColor: ["rgba(236, 254, 255, 0.5)", "rgba(236, 254, 255, 1)", "rgba(236, 254, 255, 0.5)"],
                              }
                            : {}
                        }
                        transition={{ duration: 2 }}
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.name}
                          {feature.new && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                              New
                            </Badge>
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Testimonial preview */}
                  {plan.testimonial && (
                    <div 
                      className="mt-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setShowTestimonial(plan.id)}
                    >
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 italic line-clamp-1">"{plan.testimonial.quote.substring(0, 60)}..."</span>
                        <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs">
                          Read
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700" 
                        : ""
                    }`}
                    disabled={plan.disabled}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.id === "premium" && <Zap className="h-4 w-4 mr-1" />}
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Social proof section */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">What Our Users Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="italic text-gray-700 mb-2">
              "Premium helped us have conversations we'd been avoiding for years. Now we talk about everything!"
            </p>
            <p className="text-sm font-medium">- Chris & Pat, Together 7 years</p>
            <p className="text-xs text-primary-600 mt-1">Upgraded to Premium 3 months ago</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="italic text-gray-700 mb-2">
              "The guided visualizations in Ultimate helped us create a shared vision for our future. It's like couples therapy but more fun!"
            </p>
            <p className="text-sm font-medium">- Morgan & Jamie, Engaged</p>
            <p className="text-xs text-primary-600 mt-1">Ultimate users for 6 months</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="italic text-gray-700 mb-2">
              "We started with Free, then quickly upgraded to Premium. The difference was night and day. Worth every penny!"
            </p>
            <p className="text-sm font-medium">- Alex & Jordan, Dating 1 year</p>
            <p className="text-xs text-primary-600 mt-1">Upgraded from Free to Premium</p>
          </div>
        </div>
      </div>
      
      {/* Statistics section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-700 mb-1">87%</h3>
          <p className="text-sm text-primary-600">of couples report improved communication within 2 weeks</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-700 mb-1">94%</h3>
          <p className="text-sm text-primary-600">of Premium users would recommend Sparq to friends</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-700 mb-1">3.5x</h3>
          <p className="text-sm text-primary-600">higher relationship satisfaction for Ultimate users</p>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">Can I switch between plans?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Yes! You can upgrade at any time. When you upgrade, you'll immediately gain access to all the features of your new plan.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">How do the guided visualizations work?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Our guided visualizations use proven techniques to help you and your partner imagine and create your ideal relationship future together. They're available in Premium and Ultimate tiers.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">Is there a money-back guarantee?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Absolutely! We offer a 30-day satisfaction guarantee. If you're not completely satisfied, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>
      
      {/* Testimonial modal */}
      {showTestimonial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTestimonial(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {plans.find(p => p.id === showTestimonial)?.testimonial && (
              <>
                <div className="mb-4">
                  <p className="text-lg italic text-gray-700 mb-3">
                    "{plans.find(p => p.id === showTestimonial)?.testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {plans.find(p => p.id === showTestimonial)?.testimonial.author.split(' ')[0][0]}
                      {plans.find(p => p.id === showTestimonial)?.testimonial.author.split(' ')[2] ? 
                        plans.find(p => p.id === showTestimonial)?.testimonial.author.split(' ')[2][0] : 
                        plans.find(p => p.id === showTestimonial)?.testimonial.author.split(' ')[1][0]}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{plans.find(p => p.id === showTestimonial)?.testimonial.author}</p>
                      <p className="text-sm text-gray-500">{plans.find(p => p.id === showTestimonial)?.testimonial.relationship}</p>
                    </div>
                  </div>
                </div>
                
                {plans.find(p => p.id === showTestimonial)?.testimonial.statistic && (
                  <div className="bg-primary-50 p-3 rounded-lg text-sm text-primary-700 font-medium mb-4">
                    {plans.find(p => p.id === showTestimonial)?.testimonial.statistic}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTestimonial(null)}
                    className="mr-2"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowTestimonial(null);
                      handleSubscribe(showTestimonial);
                    }}
                  >
                    {showTestimonial === "premium" ? "Get Premium" : "Get Ultimate"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      
      <BottomNav />
    </div>
  );
} 