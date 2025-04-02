import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Sparkles,
  MessageCircle,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { goalService } from "@/services/supabase/GoalService";
import { Goal, GoalCreateParams } from "@/services/supabase/types";

// Sample goal categories (Keep for now, could be fetched later)
const goalCategories = [
  { id: "communication", name: "Communication", icon: <MessageCircle className="w-5 h-5" /> },
  { id: "quality-time", name: "Quality Time", icon: <Calendar className="w-5 h-5" /> },
  { id: "intimacy", name: "Intimacy", icon: <Heart className="w-5 h-5" /> },
  { id: "growth", name: "Personal Growth", icon: <Sparkles className="w-5 h-5" /> },
  { id: "future", name: "Future Planning", icon: <Target className="w-5 h-5" /> },
];

// Sample goal templates (Keep for now, could be fetched later)
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


export default function Goals() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    isShared: false
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const fetchedGoals = await goalService.getUserGoals();
      // TODO: Fetch milestones for each goal if needed, as they are not included by default
      // Consider fetching milestones within getUserGoals or in a separate call if needed
      setGoals(fetchedGoals);
    } catch (error) {
      toast.error("Failed to fetch goals.");
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.category) {
      toast.error("Please fill in the Goal Title and select a Category.");
      return;
    }

    const goalData: GoalCreateParams = {
      title: newGoal.title,
      description: newGoal.description || undefined,
      category: newGoal.category,
      dueDate: newGoal.dueDate || undefined,
      isShared: newGoal.isShared
    };

    try {
      const createdGoal = await goalService.createGoal(goalData);
      if (createdGoal) {
        // Add the new goal to the beginning of the list
        setGoals(prevGoals => [createdGoal, ...prevGoals]);
        setNewGoal({ title: "", description: "", category: "", dueDate: "", isShared: false });
        setShowNewGoalForm(false);
        toast.success("Goal created successfully!");
      } else {
        toast.error("Failed to create goal.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the goal.");
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    const success = await goalService.updateGoalProgress(goalId, newProgress);
    if (success) {
      setGoals(goals.map(goal =>
        goal.id === goalId ? { ...goal, progress: newProgress, updatedAt: new Date() } : goal
      ));
      toast.success("Progress updated!");
    } else {
      toast.error("Failed to update progress.");
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const milestone = goal?.milestones?.find(m => m.id === milestoneId);

    if (!goal || !milestone) {
      toast.error("Milestone not found.");
      return;
    }

    const newCompletedState = !milestone.isCompleted;
    const success = await goalService.toggleMilestone(milestoneId, newCompletedState);

    if (success) {
      setGoals(goals.map(g => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones?.map(m =>
            m.id === milestoneId
              ? { ...m, isCompleted: newCompletedState }
              : m
          ) ?? [];

          const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
          const totalMilestones = updatedMilestones.length;
          const newProgress = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : g.progress;

          if (newProgress !== g.progress) {
             goalService.updateGoalProgress(goalId, newProgress);
          }

          return { ...g, milestones: updatedMilestones, progress: newProgress, updatedAt: new Date() };
        }
        return g;
      }));
      toast.success("Milestone updated!");
    } else {
      toast.error("Failed to update milestone.");
    }
  };

  const handleUseTemplate = (template: any) => {
    if (template.isPremium) { // Keep isPremium check for templates
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
      dueDate: "",
      isShared: false
    });
    setShowNewGoalForm(true);
    toast.info("Template applied! Customize as needed.");
  };

  // Use isCompleted from the Goal type now
  const currentGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

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
              Create meaningful goals to strengthen your relationship and track your progress together. Share goals with your partner!
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
                <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </Label>
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
                <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isShared"
                  checked={newGoal.isShared}
                  onCheckedChange={(checked) => setNewGoal({...newGoal, isShared: Boolean(checked)})}
                />
                <Label htmlFor="isShared" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Make this a shared goal? (Visible to partner)
                </Label>
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
                {isLoading ? (
                  <p>Loading goals...</p>
                ) : currentGoals.length === 0 ? (
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
                    {currentGoals.map(goal => (
                      // Removed isPremium check from Card className
                      <Card key={goal.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {goal.title}
                                {goal.isShared && ( // Corrected: && instead of &amp;&amp;
                                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    <Users className="w-3 h-3" />
                                    Shared
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{goal.description}</CardDescription>
                            </div>
                            {/* Removed isPremium Badge check for fetched goals */}
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

                          {/* Corrected: && instead of &amp;&amp; */}
                          {goal.milestones && goal.milestones.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Milestones</h4>
                              {goal.milestones.map(milestone => (
                                <div
                                  key={milestone.id}
                                  className="flex items-start cursor-pointer"
                                  onClick={() => handleToggleMilestone(goal.id, milestone.id)}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle2
                                      className={`w-5 h-5 ${
                                        milestone.isCompleted
                                          ? "text-green-500 fill-green-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </div>
                                  <span
                                    className={`ml-2 text-sm ${
                                      milestone.isCompleted
                                        ? "text-gray-500 line-through"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Corrected: && instead of &amp;&amp; */}
                          {goal.dueDate && (
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
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
                            Update Progress (Example)
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                 {isLoading ? (
                  <p>Loading goals...</p>
                ) : completedGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed goals yet</h3>
                    <p className="text-gray-500 mb-6">
                      Complete your goals to see them here. Keep up the good work!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {completedGoals.map(goal => (
                      <Card key={goal.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start gap-2">
                             <CardTitle className="text-lg flex items-center gap-2">
                                {goal.title}
                                {goal.isShared && ( // Corrected: && instead of &amp;&amp;
                                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    <Users className="w-3 h-3" />
                                    Shared
                                  </Badge>
                                )}
                              </CardTitle>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex-shrink-0">
                              Completed
                            </Badge>
                          </div>
                          <CardDescription>{goal.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm text-gray-500">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                            <span>Completed on {new Date(goal.updatedAt).toLocaleDateString()}</span>
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
                    <Card key={template.id} className={template.isPremium ? "border-primary/50" : ""}> {/* Keep isPremium for templates */}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          {/* Corrected: && instead of &amp;&amp; */}
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

        {/* Corrected: && instead of &amp;&amp; */}
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