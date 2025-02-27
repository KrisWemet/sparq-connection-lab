import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Plus, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lock,
  Trophy,
  Heart,
  Star,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

// Sample goal categories
const goalCategories = [
  { id: "communication", name: "Communication", icon: <MessageCircle className="w-5 h-5" /> },
  { id: "quality-time", name: "Quality Time", icon: <Calendar className="w-5 h-5" /> },
  { id: "intimacy", name: "Intimacy", icon: <Heart className="w-5 h-5" /> },
  { id: "growth", name: "Personal Growth", icon: <Sparkles className="w-5 h-5" /> },
  { id: "future", name: "Future Planning", icon: <Target className="w-5 h-5" /> },
];

// Sample goals data
const sampleGoals = [
  {
    id: "g1",
    title: "Weekly Date Night",
    description: "Have a dedicated date night every week to spend quality time together",
    category: "quality-time",
    progress: 60,
    milestones: [
      { id: "m1", title: "Plan first date night", completed: true },
      { id: "m2", title: "Create a list of date ideas", completed: true },
      { id: "m3", title: "Schedule recurring calendar event", completed: true },
      { id: "m4", title: "Complete 4 consecutive weeks", completed: false },
      { id: "m5", title: "Reflect on favorite dates", completed: false },
    ],
    dueDate: "2023-12-31",
    isPremium: false
  },
  {
    id: "g2",
    title: "Improve Communication",
    description: "Practice active listening and express feelings more clearly",
    category: "communication",
    progress: 40,
    milestones: [
      { id: "m1", title: "Read about active listening techniques", completed: true },
      { id: "m2", title: "Practice 'I' statements instead of 'You' statements", completed: true },
      { id: "m3", title: "Have a difficult conversation using new skills", completed: false },
      { id: "m4", title: "Check in weekly about communication progress", completed: false },
      { id: "m5", title: "Teach each other a new communication skill", completed: false },
    ],
    dueDate: "2023-11-30",
    isPremium: false
  },
  {
    id: "g3",
    title: "Create a Shared Vision Board",
    description: "Visualize our future together with a collaborative vision board",
    category: "future",
    progress: 20,
    milestones: [
      { id: "m1", title: "Discuss 5-year vision individually", completed: true },
      { id: "m2", title: "Gather materials for vision board", completed: false },
      { id: "m3", title: "Schedule time to create board together", completed: false },
      { id: "m4", title: "Create the vision board", completed: false },
      { id: "m5", title: "Display in a prominent place", completed: false },
    ],
    dueDate: "2023-10-15",
    isPremium: false
  },
  {
    id: "g4",
    title: "Intimacy Challenge",
    description: "Complete the 30-day intimacy challenge to deepen connection",
    category: "intimacy",
    progress: 10,
    milestones: [
      { id: "m1", title: "Research intimacy exercises", completed: true },
      { id: "m2", title: "Create a 30-day calendar", completed: false },
      { id: "m3", title: "Complete first week of challenges", completed: false },
      { id: "m4", title: "Complete second week of challenges", completed: false },
      { id: "m5", title: "Reflect on experience and continue favorites", completed: false },
    ],
    dueDate: "2023-12-15",
    isPremium: true
  },
];

// Sample goal templates
const goalTemplates = [
  {
    id: "t1",
    title: "Weekly Quality Time",
    description: "Dedicate time each week to focus solely on each other",
    category: "quality-time",
    isPremium: false
  },
  {
    id: "t2",
    title: "Monthly Relationship Check-in",
    description: "Regular check-ins to discuss relationship health and needs",
    category: "communication",
    isPremium: false
  },
  {
    id: "t3",
    title: "Learn Each Other's Love Language",
    description: "Discover and practice your partner's primary love language",
    category: "growth",
    isPremium: false
  },
  {
    id: "t4",
    title: "Intimacy Builder",
    description: "30-day program to enhance emotional and physical intimacy",
    category: "intimacy",
    isPremium: true
  },
  {
    id: "t5",
    title: "Financial Future Planning",
    description: "Create a shared vision for your financial future together",
    category: "future",
    isPremium: true
  },
];

// Import MessageCircle for the goal categories
import { MessageCircle } from "lucide-react";

export default function Goals() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [goals, setGoals] = useState(sampleGoals);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: ""
  });
  
  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const goal = {
      id: `g${goals.length + 1}`,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      progress: 0,
      milestones: [],
      dueDate: newGoal.dueDate || "2023-12-31",
      isPremium: false
    };
    
    setGoals([...goals, goal]);
    setNewGoal({ title: "", description: "", category: "", dueDate: "" });
    setShowNewGoalForm(false);
    toast.success("Goal created successfully!");
  };
  
  const handleUpdateProgress = (goalId: string, newProgress: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, progress: newProgress } : goal
    ));
    toast.success("Progress updated!");
  };
  
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, completed: !milestone.completed } 
            : milestone
        );
        
        // Calculate new progress based on completed milestones
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
        
        return { ...goal, milestones: updatedMilestones, progress: newProgress };
      }
      return goal;
    }));
  };
  
  const handleUseTemplate = (template: any) => {
    if (template.isPremium) {
      toast.error("This is a premium template. Please upgrade to access it.", {
        action: {
          label: "Upgrade",
          onClick: () => navigate("/subscription")
        }
      });
      return;
    }
    
    setNewGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      dueDate: ""
    });
    setShowNewGoalForm(true);
    toast.success("Template applied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">
            Relationship Goals
          </h1>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-6 animate-slide-up">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 mb-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Set Goals, Grow Together
            </h2>
            <p className="text-gray-700 mb-6">
              Create meaningful goals to strengthen your relationship and track your progress together.
            </p>
            <Button 
              onClick={() => setShowNewGoalForm(true)}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
          </div>
        </div>

        {showNewGoalForm ? (
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
              <CardDescription>
                Set a meaningful goal to strengthen your relationship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <Input
                  id="title"
                  placeholder="Enter goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {goalCategories.map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={newGoal.category === category.id ? "default" : "outline"}
                      className="justify-start overflow-hidden"
                      onClick={() => setNewGoal({...newGoal, category: category.id})}
                    >
                      <div className="flex items-center w-full">
                        <span className="mr-2 flex-shrink-0">{category.icon}</span>
                        <span className="text-sm truncate">{category.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowNewGoalForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal}>
                Create Goal
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="current" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Current Goals</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-6">
                {goals.filter(goal => goal.progress < 100).length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active goals</h3>
                    <p className="text-gray-500 mb-6">
                      Create your first relationship goal to start tracking your progress together.
                    </p>
                    <Button onClick={() => setShowNewGoalForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {goals
                      .filter(goal => goal.progress < 100)
                      .map(goal => (
                        <Card key={goal.id} className={goal.isPremium ? "border-primary/50" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                <CardDescription>{goal.description}</CardDescription>
                              </div>
                              {goal.isPremium && (
                                <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Milestones</h4>
                              {goal.milestones.map(milestone => (
                                <div 
                                  key={milestone.id} 
                                  className="flex items-start"
                                  onClick={() => handleToggleMilestone(goal.id, milestone.id)}
                                >
                                  <div className="flex-shrink-0 mt-0.5 cursor-pointer">
                                    <CheckCircle2 
                                      className={`w-5 h-5 ${
                                        milestone.completed 
                                          ? "text-green-500 fill-green-500" 
                                          : "text-gray-300"
                                      }`} 
                                    />
                                  </div>
                                  <span 
                                    className={`ml-2 text-sm ${
                                      milestone.completed 
                                        ? "text-gray-500 line-through" 
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                const newProgress = Math.min(goal.progress + 20, 100);
                                handleUpdateProgress(goal.id, newProgress);
                              }}
                            >
                              Update Progress
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                {goals.filter(goal => goal.progress === 100).length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed goals yet</h3>
                    <p className="text-gray-500 mb-6">
                      Complete your goals to see them here. Keep up the good work!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {goals
                      .filter(goal => goal.progress === 100)
                      .map(goal => (
                        <Card key={goal.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{goal.title}</CardTitle>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Completed
                              </Badge>
                            </div>
                            <CardDescription>{goal.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center text-sm text-gray-500">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                              <span>Completed on {new Date().toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goalTemplates.map(template => (
                    <Card key={template.id} className={template.isPremium ? "border-primary/50" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          {template.isPremium && (
                            <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Badge variant="outline">
                          {goalCategories.find(c => c.id === template.category)?.name || template.category}
                        </Badge>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        {activeTab === "current" && !showNewGoalForm && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/subscription")}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Unlock Premium Goal Templates
            </Button>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
} 