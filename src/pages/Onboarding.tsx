
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingStepOne } from "@/components/onboarding/OnboardingStepOne";
import { OnboardingStepTwo } from "@/components/onboarding/OnboardingStepTwo";
import { OnboardingStepThree } from "@/components/onboarding/OnboardingStepThree";
import { OnboardingStepFour } from "@/components/onboarding/OnboardingStepFour";

export default function Onboarding() {
  const {
    user,
    step,
    totalSteps,
    loading,
    fullName,
    setFullName,
    partnerName,
    setPartnerName,
    partnerEmail,
    setPartnerEmail,
    anniversaryDate,
    setAnniversaryDate,
    relationshipStatus,
    setRelationshipStatus,
    relationshipDuration,
    setRelationshipDuration,
    relationshipStructure,
    setRelationshipStructure,
    sexualOrientation,
    setSexualOrientation,
    relationshipGoals,
    setRelationshipGoals,
    handleNext,
    handleBack,
    handleSkip,
    handleComplete
  } = useOnboarding();
  
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
    <OnboardingContainer
      step={step}
      totalSteps={totalSteps}
      loading={loading}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={handleComplete}
      onSkip={handleSkip}
    >
      {renderStepContent()}
    </OnboardingContainer>
  );
}
