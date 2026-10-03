import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ArrowRight,
  Lightbulb,
  Sparkles,
  HeartHandshake,
  Users,
  Zap,
  Flame,
  Shield
} from "lucide-react";

// Relationship type data
const relationshipTypes = {
  monogamous: {
    title: "Monogamous Relationships",
    description: "Resources and guidance for traditional one-on-one committed relationships",
    icon: <HeartHandshake className="w-8 h-8 text-connection" />,
    color: "from-connection-subtle to-connection-subtle",
    resources: [
      {
        id: "communication",
        title: "Communication Strategies",
        description: "Effective communication techniques specific to monogamous partnerships",
        icon: <MessageCircle className="w-5 h-5 text-brand-primary/80" />
      },
      {
        id: "boundaries",
        title: "Healthy Boundaries",
        description: "Setting and respecting boundaries in your exclusive relationship",
        icon: <Shield className="w-5 h-5 text-understand" />
      },
      {
        id: "growth",
        title: "Growing Together",
        description: "Balancing individual growth while nurturing your shared journey",
        icon: <Sparkles className="w-5 h-5 text-growth" />
      }
    ]
  },
  polyamorous: {
    title: "Polyamorous Relationships",
    description: "Support and guidance for ethical non-monogamy and multiple loving relationships",
    icon: <Users className="w-8 h-8 text-brand-primary" />,
    color: "from-brand-parchment to-brand-linen",
    resources: [
      {
        id: "agreements",
        title: "Relationship Agreements",
        description: "Creating and maintaining clear agreements between all partners",
        icon: <Shield className="w-5 h-5 text-understand" />
      },
      {
        id: "jealousy",
        title: "Managing Jealousy",
        description: "Healthy approaches to jealousy and compersion in polyamorous dynamics",
        icon: <Heart className="w-5 h-5 text-connection" />
      },
      {
        id: "scheduling",
        title: "Time Management",
        description: "Balancing time and energy across multiple relationships",
        icon: <Zap className="w-5 h-5 text-growth" />
      }
    ]
  },
  lgbtq: {
    title: "LGBTQ+ Relationships",
    description: "Specialized resources for LGBTQ+ couples and relationships",
    icon: <Heart className="w-8 h-8 text-brand-primary/80" />,
    color: "from-brand-primary/10 to-brand-linen",
    resources: [
      {
        id: "identity",
        title: "Identity Affirmation",
        description: "Supporting each other's identities within your relationship",
        icon: <HeartHandshake className="w-5 h-5 text-connection" />
      },
      {
        id: "community",
        title: "Community Connection",
        description: "Building supportive networks and community relationships",
        icon: <Users className="w-5 h-5 text-growth" />
      },
      {
        id: "challenges",
        title: "Navigating Challenges",
        description: "Addressing unique challenges faced by LGBTQ+ relationships",
        icon: <Shield className="w-5 h-5 text-understand" />
      }
    ]
  },
  "long-distance": {
    title: "Long Distance Relationships",
    description: "Tools and strategies to maintain strong connections across physical distance",
    icon: <Zap className="w-8 h-8 text-understand" />,
    color: "from-accent to-accent",
    resources: [
      {
        id: "communication",
        title: "Digital Connection",
        description: "Making the most of technology to stay emotionally connected",
        icon: <MessageCircle className="w-5 h-5 text-brand-primary/80" />
      },
      {
        id: "visits",
        title: "Quality Time",
        description: "Maximizing in-person visits and creating meaningful virtual experiences",
        icon: <HeartHandshake className="w-5 h-5 text-connection" />
      },
      {
        id: "trust",
        title: "Building Trust",
        description: "Maintaining trust and security despite the distance",
        icon: <Shield className="w-5 h-5 text-understand" />
      }
    ]
  }
};

export default function RelationshipType() {
  const router = useRouter();
  const { type } = router.query as { type: string };
  const [activeTab, setActiveTab] = useState("resources");
  
  // Get the relationship type data based on the URL parameter
  const typeData = type && relationshipTypes[type as keyof typeof relationshipTypes];
  
  // If type doesn't exist, redirect to dashboard
  useEffect(() => {
    if (!typeData) {
      router.push("/dashboard");
    }
  }, [typeData, router]);
  
  if (!typeData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-50 bg-popover border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-foreground mx-auto">
            {typeData.title}
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <div className={`bg-gradient-to-r ${typeData.color} rounded-lg p-6 mb-8 flex flex-col items-center text-center`}>
          <div className="bg-popover/80 p-4 rounded-full mb-4">
            {typeData.icon}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {typeData.title}
          </h2>
          <p className="text-foreground max-w-md">
            {typeData.description}
          </p>
        </div>

        <Tabs defaultValue="resources" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {typeData.resources.map((resource) => (
                <Card 
                  key={resource.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-popover p-3 rounded-full shadow-sm">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tailored Daily Questions</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Answer questions specifically designed for {typeData.title.toLowerCase()} to strengthen your connection.
                    </p>
                    <Button 
                      onClick={() => router.push("/daily-growth")}
                      className="w-full sm:w-auto"
                    >
                      Start Daily Questions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Relationship Questions</CardTitle>
                <CardDescription>
                  Questions tailored specifically for {typeData.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Our questions are designed to address the unique aspects of your relationship type, helping you build stronger connections and navigate challenges together.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Communication</h4>
                    <p className="text-sm text-foreground mb-2">
                      &quot;What communication practices have been most effective in your {type} relationship?&quot;
                    </p>
                    <Badge className="bg-accent text-understand">Level 1</Badge>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Boundaries</h4>
                    <p className="text-sm text-foreground mb-2">
                      &quot;How do you balance personal boundaries with relationship needs in your {type} dynamic?&quot;
                    </p>
                    <Badge className="bg-growth-subtle text-growth">Level 2</Badge>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Growth</h4>
                    <p className="text-sm text-foreground mb-2">
                      &quot;What aspects of your {type} relationship have contributed most to your personal growth?&quot;
                    </p>
                    <Badge className="bg-growth-subtle text-growth-emphasis">Level 3</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => router.push("/daily-growth")}
                >
                  Explore All Questions
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="community" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Community & Support</CardTitle>
                <CardDescription>
                  Connect with others in {typeData.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Join our supportive community of couples and individuals in {typeData.title.toLowerCase()} to share experiences, advice, and resources.
                </p>
                
                <div className="space-y-4">
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Discussion Forums</h4>
                    <p className="text-sm text-foreground mb-4">
                      Connect with others who understand your unique relationship journey.
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Expert Resources</h4>
                    <p className="text-sm text-foreground mb-4">
                      Articles, videos, and guides from relationship experts specializing in {typeData.title.toLowerCase()}.
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Events & Workshops</h4>
                    <p className="text-sm text-foreground mb-4">
                      Virtual and in-person events designed for {typeData.title.toLowerCase()}.
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Join Community (Coming Soon)
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
    </div>
  );
} 
