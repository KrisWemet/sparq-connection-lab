import { useState } from "react";
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
    disabled: true
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
    ],
    popular: true,
    buttonText: "Upgrade Now",
    disabled: false
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
    ],
    popular: false,
    buttonText: "Get Ultimate",
    disabled: false
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  const handleSubscribe = (planId: string) => {
    toast.success(`Subscribing to ${planId} plan`);
    // In a real app, this would redirect to a payment processor
  };
  
  const handlePurchaseJourney = (journeyId: string) => {
    toast.success(`Purchasing ${journeyId} journey`);
    // In a real app, this would redirect to a payment processor
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
            Upgrade Your Relationship
          </h1>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-6 animate-slide-up">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 mb-8 dark:from-primary/30 dark:to-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Invest in Your Relationship
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Unlock premium features designed to deepen your connection and strengthen your bond.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="default" 
                size="lg"
                onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop, behavior: 'smooth' })}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                See Plans
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.scrollTo({ top: document.getElementById('journeys')?.offsetTop, behavior: 'smooth' })}
                className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                Explore Journeys
              </Button>
            </div>
          </div>
        </div>

        <section id="pricing" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select the perfect plan to nurture and grow your relationship
            </p>
            
            <div className="flex items-center justify-center mt-6 mb-8">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    billingCycle === "monthly" 
                      ? "bg-white dark:bg-gray-700 shadow-sm" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    billingCycle === "yearly" 
                      ? "bg-white dark:bg-gray-700 shadow-sm" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setBillingCycle("yearly")}
                >
                  Yearly <span className="text-green-600 dark:text-green-400 font-medium">Save 2 months</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${
                  plan.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${billingCycle === "yearly" 
                        ? (plan.price * 10).toFixed(2) 
                        : plan.price.toFixed(2)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    )}
                    {billingCycle === "yearly" && plan.price > 0 && (
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                        2 months free
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.disabled}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.price > 0 && <CreditCard className="w-4 h-4 mr-2" />}
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section id="journeys" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Relationship Journeys</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Guided experiences designed to transform specific areas of your relationship
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <Card key={journey.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={journey.image} 
                    alt={journey.title} 
                    className="w-full h-full object-cover"
                  />
                  {journey.popular && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-white">Popular</Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-primary">{journey.steps} Steps</Badge>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-lg font-semibold mb-1">{journey.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{journey.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">${journey.price.toFixed(2)}</span>
                    <Button 
                      onClick={() => handlePurchaseJourney(journey.id)}
                      size="sm"
                    >
                      Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/journeys")}>
              View All Journeys
            </Button>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What Couples Are Saying</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of couples who have transformed their relationships with Sparq Connect
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-medium">{testimonial.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-primary/10 rounded-lg p-6 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Ready to Transform Your Relationship?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Join thousands of couples who are growing stronger together every day.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop, behavior: 'smooth' })}
            >
              Get Started Today
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's included in the free plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  The free plan includes basic features like daily relationship quizzes, basic conversation starters, limited goal tracking, and access to a few date ideas each month. It's a great way to get started and see how Sparq Connect can benefit your relationship.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I cancel my subscription anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What are Relationship Journeys?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Relationship Journeys are guided experiences designed to help you and your partner grow in specific areas of your relationship. Each journey consists of a series of activities, reflections, and conversations that build upon each other.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Is my data private and secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Absolutely. We take privacy very seriously. Your relationship data is encrypted and never shared with third parties. Only you and your partner have access to your shared content.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
} 