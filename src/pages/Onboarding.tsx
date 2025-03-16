
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Heart, Sparkles, Brain, Users, ArrowRight, Check, ThumbsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileService, partnerService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState<Date | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState("dating");
  const [relationshipDuration, setRelationshipDuration] = useState("< 1 year");
  const [relationshipStructure, setRelationshipStructure] = useState("monogamous");
  const [sexualOrientation, setSexualOrientation] = useState("straight");
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>([]);
  
  // If user is not logged in, redirect to auth
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Populate fields with existing data if available
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPartnerName(profile.partnerName || "");
      setSexualOrientation(profile.sexualOrientation || "straight");
      setRelationshipStructure(profile.relationshipStructure || "monogamous");
      
      if (profile.anniversaryDate) {
        setAnniversaryDate(new Date(profile.anniversaryDate));
      }
    }
  }, [profile]);
  
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
      // Save all the onboarding data directly to the profile
      if (user?.id) {
        // Update the profile with onboarding data
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            partner_name: partnerName,
            sexual_orientation: sexualOrientation,
            relationship_structure: relationshipStructure,
            anniversary_date: anniversaryDate ? anniversaryDate.toISOString() : null,
            relationship_duration: relationshipDuration,
            relationship_goals: relationshipGoals,
            isOnboarded: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

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
      }
      
      toast.success("Onboarding completed successfully!");
      // Redirect to dashboard after completion
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
            <Label htmlFor="full-name">Your Full Name</Label>
            <div className="mt-1.5">
              <Input
                id="full-name"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="partner-name">Your Partner's Name (Optional)</Label>
            <div className="mt-1.5">
              <Input
                id="partner-name"
                type="text"
                placeholder="Partner's name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>
          </div>
          
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
          
          <div>
            <Label htmlFor="anniversary-date">Anniversary Date (Optional)</Label>
            <div className="mt-1.5">
              <DatePicker
                date={anniversaryDate}
                setDate={setAnniversaryDate}
                placeholder="Select date"
              />
            </div>
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
          <h2 className="text-2xl font-bold mb-2">More About You</h2>
          <p className="text-muted-foreground">
            These details will help personalize your experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="sexual-orientation">Sexual Orientation</Label>
            <Select 
              value={sexualOrientation}
              onValueChange={setSexualOrientation}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight/Heterosexual</SelectItem>
                <SelectItem value="gay">Gay/Homosexual</SelectItem>
                <SelectItem value="bisexual">Bisexual</SelectItem>
                <SelectItem value="pansexual">Pansexual</SelectItem>
                <SelectItem value="asexual">Asexual</SelectItem>
                <SelectItem value="queer">Queer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="relationship-structure">Relationship Structure</Label>
            <Select 
              value={relationshipStructure}
              onValueChange={setRelationshipStructure}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monogamous">Monogamous</SelectItem>
                <SelectItem value="polyamorous">Polyamorous</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="long-distance">Long Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Relationship Goals</Label>
            <p className="text-sm text-muted-foreground mb-2">
              What are you hoping to achieve with Sparq Connect? (Select all that apply)
            </p>
            <div className="space-y-3 mt-1.5">
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
              <p className="text-sm">Relationship journeys tailored to your goals</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Date ideas to keep things fun and exciting</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm">Take the relationship health quiz to establish a baseline</p>
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
