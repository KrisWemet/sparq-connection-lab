import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Heart, Calendar, Star, Clock, Filter, Search, ThumbsUp, ThumbsDown, Share2, Bookmark, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIService } from "@/services/aiService";
import { AnimatedContainer, AnimatedList } from "@/components/ui/animated-container";
import { apiConfig } from "@/lib/api-config";

// Sample date ideas data
const dateIdeas = [
  {
    id: 1,
    title: "Stargazing Picnic",
    description: "Pack a cozy blanket, some snacks, and head to a spot with minimal light pollution for a romantic evening under the stars.",
    category: "Outdoor",
    duration: "2-3 hours",
    cost: "Low",
    rating: 4.8,
    saved: false,
    image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&h=500"
  },
  {
    id: 2,
    title: "Cooking Class for Two",
    description: "Learn to make a new cuisine together. Many cooking schools offer special couples classes that are both fun and educational.",
    category: "Indoor",
    duration: "3-4 hours",
    cost: "Medium",
    rating: 4.6,
    saved: true,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=500"
  },
  {
    id: 3,
    title: "Couple's Massage",
    description: "Book a relaxing couple's massage at a local spa for some quality relaxation time together.",
    category: "Wellness",
    duration: "1-2 hours",
    cost: "High",
    rating: 4.9,
    saved: false,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&h=500"
  },
  {
    id: 4,
    title: "Sunset Beach Walk",
    description: "Take a leisurely stroll along the beach at sunset, collecting shells and enjoying the peaceful atmosphere.",
    category: "Outdoor",
    duration: "1-2 hours",
    cost: "Free",
    rating: 4.7,
    saved: false,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=500"
  },
  {
    id: 5,
    title: "Board Game Night",
    description: "Stay in with some fun board games, snacks, and your favorite drinks for a cozy night of friendly competition.",
    category: "Indoor",
    duration: "2-3 hours",
    cost: "Low",
    rating: 4.5,
    saved: true,
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&h=500"
  }
];

// Sample intimate ideas data (more private/romantic suggestions)
const intimateIdeas = [
  {
    id: 101,
    title: "Love Letter Exchange",
    description: "Write heartfelt letters to each other expressing your feelings and read them together over a glass of wine.",
    category: "Romance",
    duration: "1 hour",
    cost: "Free",
    rating: 4.9,
    saved: false
  },
  {
    id: 102,
    title: "Couple's Bucket List Creation",
    description: "Spend an evening creating a shared bucket list of experiences you want to have together.",
    category: "Connection",
    duration: "1-2 hours",
    cost: "Free",
    rating: 4.7,
    saved: true
  },
  {
    id: 103,
    title: "Romantic Movie Marathon",
    description: "Select your favorite romantic movies and spend the day cuddled up watching them together.",
    category: "Indoor",
    duration: "4-6 hours",
    cost: "Low",
    rating: 4.6,
    saved: false
  },
  {
    id: 104,
    title: "Partner Appreciation Day",
    description: "Dedicate a day to showing appreciation for your partner through small gestures, compliments, and acts of service.",
    category: "Connection",
    duration: "All day",
    cost: "Varies",
    rating: 4.8,
    saved: false
  },
  {
    id: 105,
    title: "Dance Lesson at Home",
    description: "Follow an online dance tutorial together in your living room, learning a romantic dance style like salsa or waltz.",
    category: "Active",
    duration: "1-2 hours",
    cost: "Free",
    rating: 4.5,
    saved: true
  }
];

export default function DateIdeas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIdeas, setSavedIdeas] = useState<number[]>([2, 5, 102, 105]);
  const [location, setLocation] = useState<string>("local area");
  const [aiDateIdeas, setAiDateIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("date-ideas");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [budget, setBudget] = useState<'Free' | 'Low' | 'Medium' | 'High' | undefined>(undefined);
  
  useEffect(() => {
    // Try to get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiConfig.apiKeys.google}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                // Get city and state from address components
                const addressComponents = data.results[0].address_components;
                const city = addressComponents.find((component: any) => 
                  component.types.includes("locality")
                )?.long_name;
                
                const state = addressComponents.find((component: any) => 
                  component.types.includes("administrative_area_level_1")
                )?.short_name;
                
                if (city && state) {
                  setLocation(`${city}, ${state}`);
                }
              }
            }
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
  }, []);
  
  useEffect(() => {
    // Load AI date ideas when component mounts
    generateDateIdeas();
  }, [location]);
  
  const generateDateIdeas = async () => {
    setIsLoading(true);
    try {
      const aiService = AIService.getInstance();
      const ideas = await aiService.generateDateIdeas({
        location,
        preferences,
        budget,
        maxResults: 5
      });
      
      setAiDateIdeas(ideas);
    } catch (error) {
      console.error("Error generating date ideas:", error);
      toast.error("Failed to generate date ideas. Using fallback suggestions.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveIdea = (id: number) => {
    setSavedIdeas(prev => {
      if (prev.includes(id)) {
        toast.info("Removed from saved ideas");
        return prev.filter(savedId => savedId !== id);
      } else {
        toast.success("Added to saved ideas");
        return [...prev, id];
      }
    });
  };
  
  const handleScheduleDate = (title: string) => {
    toast.success(`"${title}" added to your calendar`);
  };
  
  const handleShareIdea = (title: string) => {
    toast.success(`Shared "${title}" with your partner`);
  };
  
  const handleRefreshIdeas = () => {
    generateDateIdeas();
    toast.success("Generating new date ideas for you!");
  };
  
  // Filter ideas based on search query
  const filteredDateIdeas = aiDateIdeas.length > 0 
    ? aiDateIdeas.filter(idea => 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dateIdeas.filter(idea => 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  const filteredIntimateIdeas = intimateIdeas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const savedDateIdeas = [...dateIdeas, ...intimateIdeas, ...aiDateIdeas].filter(idea => 
    savedIdeas.includes(idea.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
            Date & Connection Ideas
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6">
        <AnimatedContainer variant="slideUp" className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing ideas for <span className="font-medium">{location}</span>
            </p>
          </div>
        </AnimatedContainer>
        
        <AnimatedContainer variant="fadeIn" className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search for date ideas..." 
            className="pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-3">
            <Filter className="h-4 w-4 text-gray-400" />
          </button>
        </AnimatedContainer>

        <Tabs defaultValue="date-ideas" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 dark:bg-gray-800">
            <TabsTrigger value="date-ideas" className="dark:data-[state=active]:bg-gray-700">Date Ideas</TabsTrigger>
            <TabsTrigger value="intimate" className="dark:data-[state=active]:bg-gray-700">Intimate</TabsTrigger>
            <TabsTrigger value="saved" className="dark:data-[state=active]:bg-gray-700">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="date-ideas" className="space-y-6 mt-0">
            {activeTab === "date-ideas" && (
              <>
                <AnimatedContainer variant="fadeIn" className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-semibold dark:text-white">AI-Powered Date Ideas</h2>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRefreshIdeas}
                    disabled={isLoading}
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    {isLoading ? "Generating..." : "Refresh Ideas"}
                  </Button>
                </AnimatedContainer>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AnimatedContainer variant="pulse" className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </AnimatedContainer>
                    <p className="text-gray-600 dark:text-gray-400">Generating personalized date ideas...</p>
                  </div>
                ) : (
                  <AnimatedList variant="slideUp" staggerDelay={0.1}>
                    {filteredDateIdeas.map((idea) => (
                      <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
                        <div className="relative h-48">
                          <img 
                            src={idea.image} 
                            alt={idea.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Badge className="bg-white/80 text-primary hover:bg-white/90 dark:bg-gray-800/80 dark:text-primary">
                              {idea.category}
                            </Badge>
                          </div>
                          {idea.location && (
                            <div className="absolute bottom-3 left-3">
                              <Badge className="bg-black/60 text-white hover:bg-black/70 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {idea.location}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{idea.title}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium dark:text-gray-300">{idea.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{idea.duration}</span>
                            </div>
                            <div>
                              <span>Cost: {idea.cost}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSaveIdea(idea.id)}
                                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-white ${savedIdeas.includes(idea.id) ? "text-primary border-primary dark:border-primary dark:text-primary" : ""}`}
                              >
                                <Bookmark className={`w-4 h-4 mr-1 ${savedIdeas.includes(idea.id) ? "fill-primary" : ""}`} />
                                {savedIdeas.includes(idea.id) ? "Saved" : "Save"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleShareIdea(idea.title)}
                                className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleScheduleDate(idea.title)}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AnimatedList>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="intimate" className="space-y-6 mt-0">
            {activeTab === "intimate" && (
              <AnimatedList variant="slideUp" staggerDelay={0.1}>
                {filteredIntimateIdeas.map((idea) => (
                  <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{idea.title}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium dark:text-gray-300">{idea.rating}</span>
                        </div>
                      </div>
                      <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
                        {idea.category}
                      </Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{idea.duration}</span>
                        </div>
                        <div>
                          <span>Cost: {idea.cost}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSaveIdea(idea.id)}
                            className={`dark:bg-gray-800 dark:border-gray-700 dark:text-white ${savedIdeas.includes(idea.id) ? "text-primary border-primary dark:border-primary dark:text-primary" : ""}`}
                          >
                            <Bookmark className={`w-4 h-4 mr-1 ${savedIdeas.includes(idea.id) ? "fill-primary" : ""}`} />
                            {savedIdeas.includes(idea.id) ? "Saved" : "Save"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareIdea(idea.title)}
                            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleScheduleDate(idea.title)}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </AnimatedList>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6 mt-0">
            {activeTab === "saved" && (
              <>
                {savedDateIdeas.length === 0 ? (
                  <AnimatedContainer variant="fadeIn" className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Bookmark className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved ideas yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Save your favorite date ideas to find them here</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("date-ideas")}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    >
                      Browse Date Ideas
                    </Button>
                  </AnimatedContainer>
                ) : (
                  <AnimatedList variant="slideUp" staggerDelay={0.1}>
                    {savedDateIdeas.map((idea) => (
                      <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
                        {idea.image && (
                          <div className="relative h-48">
                            <img 
                              src={idea.image} 
                              alt={idea.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Badge className="bg-white/80 text-primary hover:bg-white/90 dark:bg-gray-800/80 dark:text-primary">
                                {idea.category}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{idea.title}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium dark:text-gray-300">{idea.rating}</span>
                            </div>
                          </div>
                          {!idea.image && (
                            <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
                              {idea.category}
                            </Badge>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{idea.duration}</span>
                            </div>
                            <div>
                              <span>Cost: {idea.cost}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSaveIdea(idea.id)}
                              className="text-primary border-primary dark:border-primary dark:text-primary"
                            >
                              <Bookmark className="w-4 h-4 mr-1 fill-primary" />
                              Remove
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleScheduleDate(idea.title)}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AnimatedList>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
} 