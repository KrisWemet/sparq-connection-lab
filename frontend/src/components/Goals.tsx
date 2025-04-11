import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Target, 
  Trophy, 
  Heart, 
  UserRound, 
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { goalService } from '@/services/supabaseService';
import { formatDate } from '@/lib/utils';

// Types for goals
interface Milestone {
  id: string;
  title: string;
  is_completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  is_completed: boolean;
  due_date?: string;
  milestones: Milestone[];
}

// New goal form state
interface NewGoalForm {
  title: string;
  description: string;
  category: string;
  dueDate: Date | null;
  milestones: { title: string }[];
}

export default function Goals() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newMilestone, setNewMilestone] = useState('');
  
  // New goal form state
  const [newGoalForm, setNewGoalForm] = useState<NewGoalForm>({
    title: '',
    description: '',
    category: 'relationship',
    dueDate: null,
    milestones: []
  });

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const userGoals = await goalService.getUserGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoalForm.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    try {
      setIsLoading(true);
      
      // Format the date for the API
      const formattedDate = newGoalForm.dueDate 
        ? format(newGoalForm.dueDate, 'yyyy-MM-dd')
        : undefined;
      
      await goalService.createGoal({
        title: newGoalForm.title,
        description: newGoalForm.description,
        category: newGoalForm.category,
        dueDate: formattedDate,
        milestones: newGoalForm.milestones
      });
      
      // Reset form and close dialog
      setNewGoalForm({
        title: '',
        description: '',
        category: 'relationship',
        dueDate: null,
        milestones: []
      });
      setOpen(false);
      
      // Refresh goals
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    
    setNewGoalForm({
      ...newGoalForm,
      milestones: [...newGoalForm.milestones, { title: newMilestone }]
    });
    setNewMilestone('');
  };

  const handleRemoveMilestone = (index: number) => {
    const updatedMilestones = [...newGoalForm.milestones];
    updatedMilestones.splice(index, 1);
    setNewGoalForm({
      ...newGoalForm,
      milestones: updatedMilestones
    });
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string, isComplete: boolean) => {
    try {
      await goalService.toggleMilestone(milestoneId, !isComplete);
      
      // Update the UI optimistically
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            milestones: goal.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return { ...milestone, is_completed: !isComplete };
              }
              return milestone;
            })
          };
        }
        return goal;
      }));
    } catch (error) {
      console.error('Error toggling milestone:', error);
      toast.error('Failed to update milestone');
      
      // Revert the optimistic update on failure
      fetchGoals();
    }
  };

  // Filter goals based on active tab
  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'complete') return goal.is_completed;
    if (activeTab === 'incomplete') return !goal.is_completed;
    return goal.category === activeTab;
  });

  // Get category icon based on the category name
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'relationship':
        return <Heart className="h-4 w-4 text-rose-500" />;
      case 'personal':
        return <UserRound className="h-4 w-4 text-indigo-500" />;
      case 'shared':
        return <Target className="h-4 w-4 text-violet-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Goals</h1>
        <p className="text-muted-foreground">
          Set and track meaningful goals for your relationship
        </p>
      </div>

      {/* Goal actions */}
      <div className="flex justify-between items-center">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="relationship">Relationship</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="complete">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create a new goal</DialogTitle>
              <DialogDescription>
                Define a meaningful goal for your relationship or personal growth.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter your goal" 
                  value={newGoalForm.title}
                  onChange={(e) => setNewGoalForm({...newGoalForm, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your goal in more detail" 
                  value={newGoalForm.description}
                  onChange={(e) => setNewGoalForm({...newGoalForm, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    defaultValue={newGoalForm.category}
                    onValueChange={(value) => setNewGoalForm({...newGoalForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relationship">Relationship</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <DatePicker 
                    date={newGoalForm.dueDate} 
                    setDate={(date) => setNewGoalForm({...newGoalForm, dueDate: date})} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="milestones">Milestones</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="new-milestone" 
                    placeholder="Add a milestone" 
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddMilestone} variant="outline">Add</Button>
                </div>
                {newGoalForm.milestones.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {newGoalForm.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center">
                          <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{milestone.title}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveMilestone(index)}
                          className="h-7 w-7 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGoal} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals grid */}
      {isLoading && goals.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No goals found</h3>
          <p className="text-muted-foreground mt-1">
            {activeTab === 'all' 
              ? "You haven't created any goals yet. Create one to get started!"
              : activeTab === 'complete'
                ? "You haven't completed any goals yet. Keep going!"
                : `You don't have any ${activeTab} goals yet.`
            }
          </p>
          {activeTab !== 'all' && (
            <Button variant="outline" className="mt-4" onClick={() => setActiveTab('all')}>
              View all goals
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className={`overflow-hidden ${goal.is_completed ? 'border-green-200 bg-green-50/50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {getCategoryIcon(goal.category)}
                      <span className="capitalize">{goal.category}</span>
                    </Badge>
                    {goal.is_completed && (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">{goal.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {goal.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between mb-1 mt-2">
                  <div className="text-sm font-medium">Progress</div>
                  <div className="text-sm text-muted-foreground">{goal.progress}%</div>
                </div>
                <Progress value={goal.progress} className="h-2" />
                
                {goal.due_date && (
                  <div className="flex items-center text-sm text-muted-foreground mt-4">
                    <Clock className="h-4 w-4 mr-1" />
                    Due: {formatDate(new Date(goal.due_date))}
                  </div>
                )}
                
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Milestones</div>
                    <div className="space-y-1.5">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-start">
                          <div className="flex items-center h-5 mt-0.5">
                            <Checkbox 
                              id={milestone.id} 
                              checked={milestone.is_completed} 
                              onCheckedChange={() => 
                                handleToggleMilestone(goal.id, milestone.id, milestone.is_completed)
                              }
                            />
                          </div>
                          <label
                            htmlFor={milestone.id}
                            className={`ml-2 text-sm leading-tight ${
                              milestone.is_completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {milestone.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {}}>
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 