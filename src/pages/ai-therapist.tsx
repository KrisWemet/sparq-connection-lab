import { useState } from "react";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Sparkles, 
  Clock, 
  Crown, 
  MessageSquare, 
  Brain, 
  Heart, 
  Calendar,
  Lock,
  HeartHandshake,
  Bell
} from "lucide-react";
import { toast } from "sonner";

export default function AITherapist() {
  const router = useRouter();
  
  const handleSubscribe = () => {
    router.push("/subscription");
    toast.info("Redirecting to subscription plans");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center mx-auto">
            <HeartHandshake className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">
              Sparq Connect
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Solo Coaching, Used With Care</h2>
          <p className="text-gray-600 mt-2">
            This may become a deeper support tool for people who want more help between daily steps.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-indigo-50 rounded-lg p-6 mb-8 flex flex-col items-center text-center">
          <div className="bg-white/80 p-4 rounded-full mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Relationship Coach
          </h2>
          <p className="text-gray-700 max-w-md">
            Get calm support to help you think clearer, feel steadier, and show up better at home
          </p>
          <Badge className="mt-4 bg-purple-200 text-purple-800 hover:bg-purple-300">Coming Soon</Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ultimate Package Feature</CardTitle>
            <CardDescription>
              This coaching layer is planned for Ultimate when it feels safe, clear, and truly helpful
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Personalized Guidance</h4>
                <p className="text-sm text-gray-600">
                  Get help that fits your patterns, your goals, and the small steps you are already taking
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Limited Free Usage</h4>
                <p className="text-sm text-gray-600">
                  Free use will stay limited so the help stays clear and useful
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Heart className="w-6 h-6 text-rose-500 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Relationship Analysis</h4>
                <p className="text-sm text-gray-600">
                  Get simple insight from your reflections, your follow-through, and the loops you want to change
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Scheduled Sessions</h4>
                <p className="text-sm text-gray-600">
                  Set aside time for solo coaching first, with shared support later if you invite your partner
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubscribe} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              View Subscription Plans
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-dashed mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <Lock className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Coming Soon</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This feature is still being built. We are keeping it off until it feels safe, honest, and clearly different from therapy.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => toast.success("You'll be notified when AI Therapist launches!")}>
                    <Bell className="w-4 h-4 mr-2" />
                    Notify me when it launches
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleSubscribe}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get early access with subscription
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-center">How Sparq Connect Helps Couples</h3>
          <p className="text-gray-700 mb-4">
            Sparq helps a relationship by helping one person show up better first:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">Daily steps that build calmer talks and more honest reflection</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">Guided talk practice based on relationship science</span>
            </li>
            <li className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">Support you can use in real life when a hard moment shows up</span>
            </li>
            <li className="flex items-start gap-2">
              <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">AI insight that helps you spot and change your own patterns first</span>
            </li>
          </ul>
        </div>
      </main>
      
    </div>
  );
} 
