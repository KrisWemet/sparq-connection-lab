import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Heart, Sparkles, Brain, Users, ArrowRight, Check, ThumbsUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { profileService, partnerService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";

// Import type for profile
type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  name?: string;
  username?: string;
  gender?: string;
  relationship_type?: string;
  is_onboarded?: boolean;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("dating");
  const [relationshipDuration, setRelationshipDuration] = useState("< 1 year");
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>([]);
  const [directSignup, setDirectSignup] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  // Check if user came directly from signup
  useEffect(() => {
    const justSignedUp = localStorage.getItem('just_signed_up');
    if (justSignedUp === 'true') {
      setDirectSignup(true);
      // Clear the flag
      localStorage.removeItem('just_signed_up');
    }
  }, []);

  // Force create profile if needed
  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (user && !profile && !creatingProfile) {
        console.log("No profile found for user, creating one now");
        setCreatingProfile(true);
        
        try {
          // Get email from local storage or user object
          const email = localStorage.getItem('user_email') || user.email;
          const fullName = localStorage.getItem('user_fullname') || user.user_metadata?.full_name || 'New User';
          
          // Create basic profile
          const newProfile = {
            id: user.id,
            email: email || '',  // Make email required by providing default empty string
            full_name: fullName || '',  // Make full_name required by providing default empty string
            name: fullName || '',
            username: (fullName || '').toLowerCase().replace(/\s+/g, '.'),
            is_onboarded: false
          };
          
          console.log("Creating basic profile:", newProfile);
          
          // Try to insert or update profile
          const { error } = await supabase
            .from('profiles')
            .upsert(newProfile, { onConflict: 'id' });
            
          if (error) {
            console.error("Error creating profile in onboarding:", error);
            toast.error("Failed to create your profile. Please try again.");
          } else {
            console.log("Successfully created profile in onboarding");
            toast.success("Profile created successfully");
          }
        } catch (err) {
          console.error("Error in profile creation:", err);
        } finally {
          setCreatingProfile(false);
        }
      } else if (profile) {
        console.log("Profile already exists:", profile);
      }
    };
    
    if (!authLoading) {
      createProfileIfNeeded();
    }
  }, [user, profile, authLoading, creatingProfile]);
  
  // Show loading state if auth is still loading
  if (authLoading || creatingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Setting up your profile...</p>
      </div>
    );
  }

  // Redirect if no user
  if (!user && !authLoading) {
    navigate("/login");
    return null;
  }
  
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleGoalToggle = (goal: string) => {
    if (relationshipGoals.includes(goal)) {
      setRelationshipGoals(relationshipGoals.filter(g => g !== goal));
    } else {
      setRelationshipGoals([...relationshipGoals, goal]);
    }
  };
  
  const handleComplete = async () => {
    setLoading(true);
    try {
      // If we have a profile, update it, otherwise try to create one
      if (profile) {
        // Update profile using the profileService method
        // Note: The method only takes a username parameter right now
        const username = profile.username || user?.user_metadata?.name?.toLowerCase().replace(/\s+/g, '.') || 'user';
        await profileService.updateProfile(username);
        
        // We'll handle the rest directly with Supabase since the service doesn't support it
        try {
          await supabase
            .from('profiles')
            .update({
              is_onboarded: true,
              relationship_type: relationshipStatus as any
            })
            .eq('id', profile.id);
        } catch (updateError) {
          console.error("Error updating profile fields:", updateError);
        }
      } else {
        // User has no profile yet (came from direct signup)
        try {
          // Create a minimal profile using any type to bypass type checking
          const newProfile: any = {
            // Add null checks for user object
            id: user?.id || '', // Provide default if user is null
            full_name: user?.user_metadata?.full_name || 'User',
            email: user?.email || localStorage.getItem('user_email') || '',
            username: (user?.user_metadata?.full_name || 'User').toLowerCase().replace(/\s+/g, '.'),
            gender: 'prefer-not-to-say',
            relationship_type: relationshipStatus,
            is_onboarded: true
          };
          
          // Try to create the profile directly
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (profileError) {
            console.error("Error creating profile during onboarding:", profileError);
            // Continue anyway - we'll try to update later
          }
        } catch (profileErr) {
          console.error("Error creating profile:", profileErr);
        }
      }

      // If partner email was provided, send invitation
      if (partnerEmail && partnerEmail.trim() !== "") {
        try {
          await partnerService.sendInvitation(partnerEmail);
          toast.success("Invitation sent to your partner!");
        } catch (partnerError) {
          console.error("Error sending partner invitation:", partnerError);
          toast.error("Could not send invitation to your partner. You can try again later.");
        }
      }
      
      toast.success("Onboarding completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("There was an error completing your onboarding.");
    } finally {
      setLoading(false);
    }
  };
  
  // Content for each step
  const stepContent = {
    1: (
      <div className="space-y-6">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Sparq Connect!</h2>
          <p className="text-muted-foreground">
            Let's set up your profile to make the most of your relationship journey.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="partner-email">Partner's Email Address (Optional)</Label>
            <div className="mt-1.5">
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              We'll send them an invitation to join you on your relationship journey.
            </p>
          </div>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-6">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Relationship</h2>
          <p className="text-muted-foreground">
            Tell us a bit about your current relationship status.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="relationship-status">Current Status</Label>
            <RadioGroup
              value={relationshipStatus}
              onValueChange={setRelationshipStatus}
              className="mt-2 grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dating" id="status-dating" />
                <Label htmlFor="status-dating">Dating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="engaged" id="status-engaged" />
                <Label htmlFor="status-engaged">Engaged</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="status-married" />
                <Label htmlFor="status-married">Married</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complicated" id="status-complicated" />
                <Label htmlFor="status-complicated">It's Complicated</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="relationship-duration">How Long Together</Label>
            <RadioGroup
              value={relationshipDuration}
              onValueChange={setRelationshipDuration}
              className="mt-2 grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="< 1 year" id="duration-1" />
                <Label htmlFor="duration-1">Less than 1 year</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-3 years" id="duration-2" />
                <Label htmlFor="duration-2">1-3 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-7 years" id="duration-3" />
                <Label htmlFor="duration-3">3-7 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7+ years" id="duration-4" />
                <Label htmlFor="duration-4">7+ years</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    ),
    3: (
      <div className="space-y-6">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Relationship Goals</h2>
          <p className="text-muted-foreground">
            What are you hoping to achieve with Sparq Connect? (Select all that apply)
          </p>
        </div>
        
        <div className="space-y-3">
          {[
            { id: "communication", label: "Improve Communication" },
            { id: "intimacy", label: "Enhance Intimacy" },
            { id: "fun", label: "Have More Fun Together" },
            { id: "growth", label: "Personal & Relationship Growth" },
            { id: "conflict", label: "Better Conflict Resolution" },
            { id: "connection", label: "Deepen Emotional Connection" }
          ].map((goal) => (
            <div
              key={goal.id}
              className={`
                p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors
                ${relationshipGoals.includes(goal.id) ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}
              `}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <span>{goal.label}</span>
              {relationshipGoals.includes(goal.id) && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    4: (
      <div className="space-y-6">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
          <p className="text-muted-foreground">
            Thanks for sharing your information. We've personalized your experience based on your answers.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Your profile is ready</p>
                <p className="text-sm text-green-700">
                  You can now start exploring all features of Sparq Connect and strengthen your relationship!
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Daily questions to strengthen your bond</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Path To Together journeys tailored to your goals</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Date ideas to keep things fun and exciting</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Connect with your partner in meaningful ways</p>
            </div>
          </div>
        </div>
      </div>
    )
  };
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            {stepContent[step as keyof typeof stepContent]}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {step < totalSteps && (
          <Button 
            variant="link" 
            className="w-full"
            onClick={() => {
              // Skip the rest of onboarding
              setStep(totalSteps);
              window.scrollTo(0, 0);
            }}
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
} 