import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PersuasiveJourneyPrompt } from "../components/journey/PersuasiveJourneyPrompt";
import { MetaphorAnimation } from "../components/MetaphorAnimation";
import { FuturePacing } from "../components/FuturePacing";
import { hypnoticStories, futurePacingTimeframes, metaphorDescriptions } from "../data/persuasiveContent";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Sparkles, Heart, ArrowRight, Clock, BookOpen } from "lucide-react";

// Mock journey data
const journeys = [
  {
    id: "journey-communication-101",
    title: "Communication Breakthrough",
    description: "Discover how to truly hear and be heard by your partner, creating deeper understanding and connection.",
    isPremium: false,
    activities: [
      { id: "comm-1", title: "Active Listening Exercise", completed: true },
      { id: "comm-2", title: "Expression Without Blame", completed: true },
      { id: "comm-3", title: "Understanding Patterns", completed: false },
      { id: "comm-4", title: "Communication Styles", completed: false },
    ]
  },
  {
    id: "journey-intimacy-building",
    title: "Intimacy Evolution",
    description: "Rediscover and deepen the physical and emotional intimacy in your relationship.",
    isPremium: true,
    activities: [
      { id: "int-1", title: "Connection Inventory", completed: false },
      { id: "int-2", title: "Vulnerability Practice", completed: false },
      { id: "int-3", title: "Desire Mapping", completed: false },
      { id: "int-4", title: "Physical Connection", completed: false },
    ]
  },
  {
    id: "journey-trust-repair",
    title: "Trust Building",
    description: "Strengthen or rebuild trust to create a secure foundation for your relationship.",
    isPremium: true,
    activities: [
      { id: "trust-1", title: "Trust Assessment", completed: false },
      { id: "trust-2", title: "Reliability Practices", completed: false },
      { id: "trust-3", title: "Healing Past Hurts", completed: false },
      { id: "trust-4", title: "Building Security", completed: false },
    ]
  }
];

export default function JourneyStart() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMetaphor, setShowMetaphor] = useState(false);
  const [showFuturePacing, setShowFuturePacing] = useState(false);
  
  // Find the current journey
  const journey = journeys.find(j => j.id === journeyId) || journeys[0];
  
  // Calculate completion percentage (mock data)
  const completionPercentage = journey.activities.filter(a => a.completed).length / journey.activities.length * 100;
  
  // Select appropriate content based on journey type
  const getJourneyTypeKey = () => {
    if (journey.id.includes("communication")) return "communication";
    if (journey.id.includes("intimacy")) return "intimacy";
    if (journey.id.includes("trust")) return "trust";
    if (journey.id.includes("future")) return "future";
    if (journey.id.includes("attachment")) return "attachment";
    if (journey.id.includes("conflict")) return "conflict";
    return "communication"; // Default
  };
  
  const journeyType = getJourneyTypeKey();
  
  // Get appropriate story for this journey type
  const story = hypnoticStories.find(s => s.type === journeyType) || hypnoticStories[0];
  
  // Get appropriate future pacing for this journey type
  const futurePacing = futurePacingTimeframes.find(f => f.type === journeyType) || futurePacingTimeframes[0];
  
  // Get appropriate metaphor for this journey type
  const metaphor = metaphorDescriptions[journeyType] || metaphorDescriptions.bridge;
  
  // Handle continuation of the journey
  const handleContinueJourney = () => {
    // In a real app, this would navigate to the first incomplete activity
    navigate(`/activities/${journey.activities.find(a => !a.completed)?.id || journey.activities[0].id}`);
  };
  
  // Handle showing the metaphor animation
  const handleShowMetaphor = () => {
    setShowMetaphor(true);
  };
  
  // Handle completion of metaphor animation
  const handleMetaphorComplete = () => {
    setShowMetaphor(false);
  };
  
  // Handle showing future pacing
  const handleShowFuturePacing = () => {
    setShowFuturePacing(true);
  };
  
  // Handle completion of future pacing
  const handleFuturePacingComplete = () => {
    setShowFuturePacing(false);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Metaphor animation overlay */}
      {showMetaphor && (
        <MetaphorAnimation
          metaphorKey={metaphor.metaphorType}
          onComplete={handleMetaphorComplete}
        />
      )}
      
      {/* Future pacing overlay */}
      {showFuturePacing && (
        <FuturePacing
          title="Your Relationship Future"
          description="Envision how your consistent practice transforms your relationship over time"
          timeframes={futurePacing.timeframes}
          onComplete={handleFuturePacingComplete}
        />
      )}
      
      <div className="mb-8">
        <PersuasiveJourneyPrompt
          journeyId={journey.id}
          journeyTitle={journey.title}
          journeyDescription={journey.description}
          isPremiumJourney={journey.isPremium}
          completionPercentage={completionPercentage}
          onContinue={handleContinueJourney}
        />
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="text-sm">
            <span className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              Overview
            </span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-sm">
            <span className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Relationship Tools
            </span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-sm">
            <span className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Activities
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">{journey.title}</h2>
              <p className="text-gray-600 mb-4">{journey.description}</p>
              
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Your Progress</h3>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {completionPercentage.toFixed(0)}% Complete
                </p>
              </div>
              
              <Button 
                onClick={handleContinueJourney}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Continue Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Relationship Enhancement Tools</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="bg-indigo-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={handleShowMetaphor}
                >
                  <h3 className="font-medium text-indigo-700 mb-2">{metaphor.title}</h3>
                  <p className="text-sm text-gray-600">{metaphor.description}</p>
                  <p className="text-xs text-indigo-600 mt-2 font-medium">Click to experience the visualization</p>
                </div>
                
                <div 
                  className="bg-purple-50 p-4 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={handleShowFuturePacing}
                >
                  <h3 className="font-medium text-purple-700 mb-2">Future Vision Journey</h3>
                  <p className="text-sm text-gray-600">Envision the future of your relationship as you apply the skills from this journey.</p>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Click to experience the future pacing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Journey Activities</h2>
              
              <div className="space-y-4">
                {journey.activities.map((activity, index) => (
                  <div 
                    key={activity.id}
                    className={`p-4 rounded-lg border ${
                      activity.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        activity.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-xs text-gray-500">
                          {activity.completed ? 'Completed' : 'Not started'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 