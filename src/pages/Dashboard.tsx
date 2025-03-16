
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Calendar, Activity, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Dashboard visited:", new Date().toISOString());
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500">
            {profile?.fullName || user?.email?.split('@')[0] || 'Partner'}
          </p>
        </div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Daily Connect Card */}
        <Card className="cursor-pointer" onClick={() => navigate("/quiz")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Daily Connect</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Answer today's question to strengthen your connection
            </p>
          </CardContent>
        </Card>

        {/* Relationship Insights Card */}
        <RelationshipInsightCard />
        
        {/* Date Ideas Card */}
        <Card className="cursor-pointer" onClick={() => navigate("/date-ideas")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Date Ideas</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Discover new activities to enjoy together
            </p>
          </CardContent>
        </Card>
        
        {/* Relationship Journeys Card */}
        <Card className="cursor-pointer" onClick={() => navigate("/journeys")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Relationship Journeys</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Start a guided journey to strengthen specific areas of your relationship
            </p>
          </CardContent>
        </Card>
        
        {/* Partner Connect Section */}
        {!profile?.partnerName ? (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Connect with your partner</h3>
                <p className="text-sm text-gray-500">Invite them to join you on this journey</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/partner-invite")}
              className="w-full"
            >
              Invite Partner
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Connected with {profile.partnerName}</h3>
                <p className="text-sm text-gray-500">View your partner's profile</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/partner-profile")}
              className="w-full"
            >
              View Partner
            </Button>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
