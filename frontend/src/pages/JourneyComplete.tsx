import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Shield, Trophy, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample Path To Together journey data - in a real app would come from API
const mockPathToTogetherData = [ // Renamed mock data
  {
    id: "emotional-safety-secure-attachment",
    title: "Emotional Safety & Secure Attachment",
    description: "Build a foundation of emotional safety and secure, loving attachment through daily lessons and practices",
    duration: "3 weeks",
    category: "Foundation",
    image: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=800&h=500"
  }
];

export default function JourneyComplete() {
  const navigate = useNavigate();
  const { journeyId } = useParams();
  const [pathToTogether, setPathToTogether] = useState<any>(null); // Renamed state variable
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Find the Path To Together journey that matches the ID from the URL
    const foundJourney = mockPathToTogetherData.find(j => j.id === journeyId); // Use renamed mock data
    if (foundJourney) {
      setPathToTogether(foundJourney); // Use renamed state setter
    } else {
      // If Path To Together journey not found, redirect to list
      navigate("/path-to-together");
      toast.error("Path To Together journey not found");
    }
    setLoading(false);
    
    // Trigger confetti when the component mounts
    setTimeout(() => {
      triggerConfetti();
    }, 500);
  }, [journeyId, navigate]);
  
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      }));
    }, 250);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I completed the ${pathToTogether.title} Path To Together journey on Lovable!`, // Use renamed state variable
        text: 'I just completed a Path To Together journey and learned so much! Check out Lovable to strengthen your relationship too.',
        url: window.location.origin,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      toast.info("Sharing not supported on this browser");
    }
  };
  
  if (loading || !pathToTogether) { // Use renamed state variable
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
              Loading...
            </h1>
          </div>
        </header>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(`/journey/${journeyId}`)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Path To Together Complete!
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-6 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Congratulations!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg">
            You've completed the <span className="font-semibold">{pathToTogether.title}</span> Path To Together journey! // Use renamed state variable
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Achievement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              By completing this Path To Together journey, you've taken an important step in building a stronger, healthier relationship.
              You've gained valuable insights and practical tools that you can continue to use in your relationship.
            </p>
            
            <div className="flex items-start gap-3 mt-4">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Your Path To Together Statistics</h3>
                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Completed all lessons and activities</li>
                  <li>• Recorded thoughtful reflections</li>
                  <li>• Practiced new skills in your relationship</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={handleShare}
            className="flex items-center gap-2" 
            variant="outline"
            size="lg"
          >
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </Button>
          
          <Button 
            onClick={() => navigate("/path-to-together")}
            className="flex items-center gap-2"
            size="lg"
          >
            Explore More Path To Together Journeys
          </Button>
        </div>
        
        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            What's Next?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Continue to practice what you've learned and consider starting another Path To Together journey to further strengthen your relationship.
          </p>
          <Button 
            onClick={() => navigate("/path-to-together")}
            variant="secondary"
          >
            Return to Path To Together List
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 