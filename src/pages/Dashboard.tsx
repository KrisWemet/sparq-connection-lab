
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Calendar, Activity, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Dashboard visited:", new Date().toISOString());
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pb-24">
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container max-w-lg mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 animate-fade-in">
            Welcome back
          </h1>
          <p className="text-primary font-medium animate-slide-in">
            {profile?.fullName || user?.email?.split('@')[0] || 'Partner'}
          </p>
        </div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Daily Connect Card */}
        <Card 
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md border-2 border-primary/10 animate-fade-in" 
          onClick={() => navigate("/quiz")}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Daily Connect</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Answer today's question to strengthen your connection
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Relationship Insights Card */}
        <div className="animate-fade-in animate-delay-100">
          <RelationshipInsightCard />
        </div>
        
        {/* Date Ideas Card */}
        <Card 
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md border-2 border-primary/10 animate-fade-in animate-delay-200" 
          onClick={() => navigate("/date-ideas")}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Date Ideas</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Discover new activities to enjoy together
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        {/* Relationship Journeys Card */}
        <Card 
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md border-2 border-primary/10 animate-fade-in animate-delay-300" 
          onClick={() => navigate("/journeys")}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Relationship Journeys</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Start a guided journey to strengthen specific areas of your relationship
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        {/* Partner Connect Section */}
        {!profile?.partnerName ? (
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20 shadow-sm animate-fade-in animate-delay-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Heart className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Connect with your partner</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Invite them to join you on this journey
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/partner-invite")}
              className="w-full group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Invite Partner <Sparkles className="h-4 w-4" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20 shadow-sm animate-fade-in animate-delay-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Heart className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Connected with {profile.partnerName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  View your partner's profile
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/partner-profile")}
              className="w-full group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Partner Profile <Sparkles className="h-4 w-4" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
