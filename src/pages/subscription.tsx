import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    description: "Start with simple daily steps",
    features: [
      { name: "14-day journey with Peter 🦦", included: true },
      { name: "Daily morning story + action", included: true },
      { name: "Evening reflection check-ins", included: true },
      { name: "Quiet pattern tracking", included: true },
      { name: "Skill Tree: Basic levels (all 3 tracks)", included: true },
      { name: "Partner linking (optional)", included: true },
      { name: "Daily connection questions", included: true },
      { name: "Conflict First Aid, always free", included: true },
      { name: "Skill Tree: Advanced levels", included: false },
      { name: "Skill Tree: Expert levels", included: false },
      { name: "The Translator (unlimited)", included: false },
      { name: "Peter AI Coach sessions", included: false },
      { name: "Couples shared journey", included: false },
    ],
    popular: false,
    buttonText: "Current Plan",
    disabled: true
  },
  {
    id: "premium",
    name: "Premium",
    price: 4.99,
    yearlyPrice: 49.99,
    description: "Go deeper with more practice and more help",
    features: [
      { name: "Everything in Free", included: true },
      { name: "Skill Tree: Advanced levels (all 3 tracks)", included: true },
      { name: "The Translator (unlimited rephrases)", included: true },
      { name: "Personal insight report", included: true },
      { name: "Longer Peter coaching sessions", included: true },
      { name: "Daily questions (unlimited)", included: true },
      { name: "Pattern dashboard", included: true },
      { name: "Skill Tree: Expert levels", included: false },
      { name: "Peter AI Coach (deep sessions)", included: false },
      { name: "Couples shared journey", included: false },
    ],
    popular: true,
    buttonText: "Go deeper with Premium",
    disabled: false,
    persuasiveText: "Unlock the tools that help good habits stick"
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 19.99,
    yearlyPrice: 199.99,
    description: "Your deepest support plan",
    features: [
      { name: "Everything in Premium", included: true },
      { name: "Skill Tree: Expert levels (all 3 tracks)", included: true },
      { name: "Peter remembers your full story", included: true, new: true },
      { name: "Talk to Peter anytime", included: true, new: true },
      { name: "Weekly check-in from Peter", included: true, new: true },
      { name: "Shared fit view when both join", included: true },
      { name: "Repeat the 14-day journey with a better fit", included: true },
      { name: "Milestone celebrations from Peter", included: true },
    ],
    popular: false,
    buttonText: "Get Ultimate",
    disabled: false,
    persuasiveText: "Peter knows your story and helps you use it in real life"
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
    image: "/images/journeys/communication.png",
    popular: true
  },
  {
    id: "intimacy",
    title: "Deepening Intimacy",
    description: "Strengthen your emotional and physical connection",
    price: 4.99,
    steps: 7,
    image: "/images/journeys/intimacy.jpg",
    popular: false
  },
  {
    id: "trust",
    title: "Building Trust",
    description: "Create a foundation of security and reliability",
    price: 3.99,
    steps: 4,
    image: "/images/journeys/trust-rebuilding.jpg",
    popular: false
  },
  {
    id: "future",
    title: "Planning Your Future",
    description: "Align your visions and create shared goals",
    price: 4.99,
    steps: 6,
    image: "/images/journeys/values.png",
    popular: false
  },
  {
    id: "attachment",
    title: "Feeling Safe Together",
    description: "Understand your attachment patterns and build secure connections",
    price: 4.99,
    steps: 5,
    image: "/images/journeys/attachment-healing.png",
    popular: true,
    new: true
  },
  {
    id: "conflict",
    title: "Healthy Conflict Resolution",
    description: "Transform disagreements into opportunities for growth",
    price: 4.99,
    steps: 6,
    image: "/images/journeys/conflict-resolution.png",
    popular: false,
    new: true
  },
  {
    id: "bundle",
    title: "Complete Journey Bundle",
    description: "All current and future journeys at a discounted price",
    price: 14.99,
    steps: 33,
    image: "/images/journeys/relationship-renewal.png",
    popular: true,
    bestValue: true
  }
];


export default function Subscription() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
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
        : "You've upgraded to Ultimate! You now have deeper support for the hard moments and the good ones too.",
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
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
      </div>
      
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-full flex items-center">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly" 
                ? "bg-popover shadow text-primary-emphasis"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "yearly" 
                ? "bg-popover shadow text-primary-emphasis"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <span className="ml-1 text-xs font-bold text-success-emphasis">Save up to 17%</span>
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
                  : "border-border"
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary-hover text-white px-3 py-1 text-xs font-bold uppercase transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left shadow-sm">
                    Most Popular
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {plan.id === "premium" && <Sparkles className="h-5 w-5 mr-2 text-primary-emphasis" />}
                    {plan.id === "ultimate" && <Heart className="h-5 w-5 mr-2 text-connection-emphasis" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                    {billingCycle === "yearly" && plan.yearlyPrice && (
                      <Badge variant="outline" className="ml-2 bg-success-subtle text-success-emphasis border-success">
                        Save {yearlySavings}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Persuasive text for premium/ultimate plans */}
                  {plan.persuasiveText && (
                    <motion.p 
                      className="text-sm italic text-primary-emphasis font-medium"
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
                            ? "bg-accent -mx-4 px-4 py-1 rounded-md"
                            : ""
                        }`}
                        animate={
                          highlightFeature?.planId === plan.id && 
                          highlightFeature?.featureIndex === index
                            ? { 
                                backgroundColor: ["hsl(var(--growth)/0.12)", "hsl(var(--growth)/0.24)", "hsl(var(--growth)/0.12)"],
                              }
                            : {}
                        }
                        transition={{ duration: 2 }}
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-success-emphasis mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-brand-text-secondary mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-brand-text-secondary"}>
                          {feature.name}
                          {'new' in feature && feature.new && (
                            <Badge className="ml-2 bg-growth-subtle text-growth-emphasis border-growth/40">
                              New
                            </Badge>
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-hover"
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
      
      {/* Made-up testimonials removed — Sparq has no real user quotes yet (constitution §5A: no fabricated social proof). */}
      
      {/* Statistics section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-accent p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-emphasis mb-1">87%</h3>
          <p className="text-sm text-primary-emphasis">of couples report improved communication within 2 weeks</p>
        </div>
        <div className="bg-accent p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-emphasis mb-1">94%</h3>
          <p className="text-sm text-primary-emphasis">of Premium users would recommend Sparq to friends</p>
        </div>
        <div className="bg-accent p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-primary-emphasis mb-1">3x</h3>
          <p className="text-sm text-primary-emphasis">more Skill Tree completions for users who talk to Peter weekly</p>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-popover p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">Can I switch between plans?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! You can upgrade at any time. When you upgrade, you&apos;ll immediately gain access to all the features of your new plan.
            </p>
          </div>
          <div className="bg-popover p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">What does &quot;Peter remembers your history&quot; actually mean?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              In Ultimate, Peter has access to everything you&apos;ve shared during your 14-day journey and Skill Tree sessions — your reflections, patterns, and breakthroughs. When you chat with Peter, he builds on what he already knows about you instead of starting from scratch every time. It&apos;s what makes it feel like a real coaching relationship.
            </p>
          </div>
          <div className="bg-popover p-4 rounded-lg shadow-sm">
            <h3 className="font-medium">Is there a money-back guarantee?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Absolutely! We offer a 30-day satisfaction guarantee. If you&apos;re not completely satisfied, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>
      
      
    </div>
  );
} 
