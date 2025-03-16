
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { OnboardingStepOne } from "@/components/onboarding/OnboardingStepOne";
import { OnboardingStepTwo } from "@/components/onboarding/OnboardingStepTwo";
import { OnboardingStepThree } from "@/components/onboarding/OnboardingStepThree";
import { OnboardingStepFour } from "@/components/onboarding/OnboardingStepFour";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { partnerService } from "@/services/supabaseService";
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
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
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
  
  const handleComplete = async () => {
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    try {
      // Save all the onboarding data directly to the profile
      if (user?.id) {
        console.log("Saving onboarding data for user:", user.id);
        
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

        if (error) {
          console.error("Error updating profile:", error);
          throw error;
        }
        
        console.log("Profile updated successfully");

        // If partner email was provided, send invitation
        if (partnerEmail && partnerEmail.trim() !== "") {
          try {
            await partnerService.sendInvitation(partnerEmail);
            toast.success("Invitation sent to your partner!");
          } catch (partnerError) {
            console.error("Error sending partner invitation:", partnerError);
            toast.error("Could not send invitation to your partner. You can try again later.");
            // Continue with redirect even if partner invitation fails
          }
        }
        
        toast.success("Onboarding completed successfully!");
        
        // Ensure we redirect regardless of the state of the partner invitation
        navigate("/dashboard");
      } else {
        throw new Error("User ID not available");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("There was an error completing your onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return null; // Don't render anything while redirecting
  }
  
  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStepOne
            fullName={fullName}
            setFullName={setFullName}
            partnerName={partnerName}
            setPartnerName={setPartnerName}
            partnerEmail={partnerEmail}
            setPartnerEmail={setPartnerEmail}
            anniversaryDate={anniversaryDate}
            setAnniversaryDate={setAnniversaryDate}
          />
        );
      case 2:
        return (
          <OnboardingStepTwo
            relationshipStatus={relationshipStatus}
            setRelationshipStatus={setRelationshipStatus}
            relationshipDuration={relationshipDuration}
            setRelationshipDuration={setRelationshipDuration}
          />
        );
      case 3:
        return (
          <OnboardingStepThree
            sexualOrientation={sexualOrientation}
            setSexualOrientation={setSexualOrientation}
            relationshipStructure={relationshipStructure}
            setRelationshipStructure={setRelationshipStructure}
            relationshipGoals={relationshipGoals}
            setRelationshipGoals={setRelationshipGoals}
          />
        );
      case 4:
        return <OnboardingStepFour />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={loading}
              >
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
            disabled={loading}
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}
