import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Heart, Clock, Filter, Search, ThumbsUp, ThumbsDown, Share2, Bookmark, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIService } from "@/services/aiService";
import { AnimatedContainer, AnimatedList } from "@/components/ui/animated-container";

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
    image: "/images/dates/stargazing.jpg"
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
    image: "/images/dates/cooking.jpg"
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
    image: "/images/dates/wellness.jpg"
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
    image: "/images/dates/beach.jpg"
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
    image: "/images/dates/board-games.jpg"
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIdeas, setSavedIdeas] = useState<number[]>([]);
  const [location, setLocation] = useState<string>("local area");
  const [aiDateIdeas, setAiDateIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("date-ideas");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [budget, setBudget] = useState<'Free' | 'Low' | 'Medium' | 'High' | undefined>(undefined);
  
  useEffect(() => {
    // Simple location detection using the browser's timezone as a hint
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // "UTC" or "Etc/GMT+5" is not a place, so keep "local area".
      const city = tz.includes('/') && !tz.startsWith('Etc/') ? tz.split('/').pop()?.replace(/_/g, ' ') : undefined;
      if (city) setLocation(city);
    } catch {
      // keep default "local area"
    }
  }, []);
  
  useEffect(() => {
    // Load AI date ideas when component mounts
    generateDateIdeas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sparq.savedDateIdeas') || '[]');
      if (Array.isArray(saved)) setSavedIdeas(saved.filter((n: unknown) => typeof n === 'number'));
    } catch { /* storage blocked: start empty */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('sparq.savedDateIdeas', JSON.stringify(savedIdeas)); } catch { /* ignore */ }
  }, [savedIdeas]);

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
  
  // Nothing is sent from here: the idea is copied so the user can pass it on
  // however they like (privacy: sharing is always the user's own act).
  const handleShareIdea = async (title: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(description ? `${title} — ${description}` : title);
      toast.success("Copied. Send it to your partner however you like.");
    } catch {
      toast("Couldn't copy just now — the idea is right here on screen.");
    }
  };
  
  const handleRefreshIdeas = () => {
    generateDateIdeas();
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
    <div className="emotion-page min-h-dvh bg-background dark:bg-background pb-24">
      <header className="sticky top-0 z-50 bg-popover dark:bg-card border-b dark:border-border">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-muted dark:hover:bg-card rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground dark:text-white mx-auto">
            Date & connection ideas
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6">
        <div className="relative mb-5 overflow-hidden px-5 py-2">
          <SceneAccent kind="bridge" className="h-28 w-full" />
        </div>
        <AnimatedContainer variant="slideUp" className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Showing ideas for <span className="font-medium">{location}</span>
            </p>
          </div>
        </AnimatedContainer>
        
        <AnimatedContainer variant="fadeIn" className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-brand-text-secondary" />
          <Input 
            placeholder="Search for date ideas..." 
            className="pl-10 pr-10 dark:bg-card dark:border-border dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-3">
            <Filter className="h-4 w-4 text-brand-text-secondary" />
          </button>
        </AnimatedContainer>

        <Tabs defaultValue="date-ideas" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 dark:bg-card">
            <TabsTrigger value="date-ideas" className="dark:data-[state=active]:bg-card">Date Ideas</TabsTrigger>
            <TabsTrigger value="intimate" className="dark:data-[state=active]:bg-card">Intimate</TabsTrigger>
            <TabsTrigger value="saved" className="dark:data-[state=active]:bg-card">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="date-ideas" className="space-y-6 mt-0">
            {activeTab === "date-ideas" && (
              <>
                <AnimatedContainer variant="fadeIn" className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-semibold dark:text-white">AI-powered date ideas</h2>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRefreshIdeas}
                    disabled={isLoading}
                    className="dark:bg-card dark:text-white dark:border-border"
                  >
                    {isLoading ? "Generating..." : "Refresh ideas"}
                  </Button>
                </AnimatedContainer>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AnimatedContainer variant="pulse" className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </AnimatedContainer>
                    <p className="text-muted-foreground dark:text-muted-foreground">Generating personalized date ideas...</p>
                  </div>
                ) : (
                  <AnimatedList variant="slideUp" staggerDelay={0.1}>
                    {filteredDateIdeas.map((idea) => (
                      <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-card dark:border-border">
                        <div className="relative h-48">
                          <Image
                            src={idea.image}
                            alt={idea.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Badge className="bg-popover/80 text-brand-hover hover:bg-popover/90 dark:bg-card/80 dark:text-primary">
                              {idea.category}
                            </Badge>
                          </div>
                          {idea.location && (
                            <div className="absolute bottom-3 left-3">
                              <Badge className="bg-inverse/60 text-white hover:bg-inverse/70 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {idea.location}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground dark:text-white">{idea.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">{idea.description}</p>
                          <div className="flex items-center gap-4 text-xs text-brand-text-secondary dark:text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{idea.duration}</span>
                            </div>
                            <div>
                              <span>Cost: {idea.cost}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveIdea(idea.id)}
                              className={`min-h-[44px] flex-1 whitespace-nowrap dark:bg-card dark:border-border dark:text-white ${savedIdeas.includes(idea.id) ? "text-brand-hover border-primary dark:border-primary dark:text-primary" : ""}`}
                            >
                              <Bookmark className={`w-4 h-4 mr-1 shrink-0 ${savedIdeas.includes(idea.id) ? "fill-primary" : ""}`} />
                              {savedIdeas.includes(idea.id) ? "Saved" : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareIdea(idea.title, idea.description)}
                              className="min-h-[44px] flex-1 whitespace-nowrap dark:bg-card dark:text-white dark:border-border"
                            >
                              <Share2 className="w-4 h-4 mr-1 shrink-0" />
                              Copy
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
                  <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-card dark:border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground dark:text-white">{idea.title}</h3>
                      </div>
                      <Badge className="mb-3 bg-primary/10 text-brand-hover border-primary/30">
                        {idea.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">{idea.description}</p>
                      <div className="flex items-center gap-4 text-xs text-brand-text-secondary dark:text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{idea.duration}</span>
                        </div>
                        <div>
                          <span>Cost: {idea.cost}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveIdea(idea.id)}
                          className={`min-h-[44px] flex-1 whitespace-nowrap dark:bg-card dark:border-border dark:text-white ${savedIdeas.includes(idea.id) ? "text-brand-hover border-primary dark:border-primary dark:text-primary" : ""}`}
                        >
                          <Bookmark className={`w-4 h-4 mr-1 shrink-0 ${savedIdeas.includes(idea.id) ? "fill-primary" : ""}`} />
                          {savedIdeas.includes(idea.id) ? "Saved" : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareIdea(idea.title, idea.description)}
                          className="min-h-[44px] flex-1 whitespace-nowrap dark:bg-card dark:text-white dark:border-border"
                        >
                          <Share2 className="w-4 h-4 mr-1 shrink-0" />
                          Copy
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
                    <div className="w-16 h-16 mx-auto bg-muted dark:bg-card rounded-full flex items-center justify-center mb-4">
                      <Bookmark className="w-8 h-8 text-brand-text-secondary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No saved ideas yet</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground mb-6">Save your favorite date ideas to find them here</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("date-ideas")}
                      className="dark:bg-card dark:text-white dark:border-border"
                    >
                      Browse date ideas
                    </Button>
                  </AnimatedContainer>
                ) : (
                  <AnimatedList variant="slideUp" staggerDelay={0.1}>
                    {savedDateIdeas.map((idea) => (
                      <Card key={idea.id} className="overflow-hidden mb-6 dark:bg-card dark:border-border">
                        {idea.image && (
                          <div className="relative h-48">
                            <Image
                              src={idea.image}
                              alt={idea.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Badge className="bg-popover/80 text-brand-hover hover:bg-popover/90 dark:bg-card/80 dark:text-primary">
                                {idea.category}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground dark:text-white">{idea.title}</h3>
                          </div>
                          {!idea.image && (
                            <Badge className="mb-3 bg-primary/10 text-brand-hover border-primary/30">
                              {idea.category}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">{idea.description}</p>
                          <div className="flex items-center gap-4 text-xs text-brand-text-secondary dark:text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{idea.duration}</span>
                            </div>
                            <div>
                              <span>Cost: {idea.cost}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSaveIdea(idea.id)}
                              className="min-h-[44px] flex-1 whitespace-nowrap text-brand-hover border-primary dark:border-primary dark:text-primary"
                            >
                              <Bookmark className="w-4 h-4 mr-1 shrink-0 fill-primary" />
                              Remove
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
      
    </div>
  );
}
