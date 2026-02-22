
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingStepOne } from "@/components/onboarding/OnboardingStepOne";
import { OnboardingStepTwo } from "@/components/onboarding/OnboardingStepTwo";
import { OnboardingStepThree } from "@/components/onboarding/OnboardingStepThree";

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
    relationshipMode,
    setRelationshipMode,
    onboardingGoals,
    setOnboardingGoals,
    preferredSessionTime,
    setPreferredSessionTime,
    identityArchetype,
    setIdentityArchetype,
    handleNext,
    handleBack,
    handleSkip,
    handleComplete,
  } = useOnboarding();

  if (!user) {
    return null;
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStepOne
            fullName={fullName}
            setFullName={setFullName}
            partnerName={partnerName}
            setPartnerName={setPartnerName}
            relationshipMode={relationshipMode}
            setRelationshipMode={setRelationshipMode}
          />
        );
      case 2:
        return (
          <OnboardingStepTwo
            onboardingGoals={onboardingGoals}
            setOnboardingGoals={setOnboardingGoals}
            preferredSessionTime={preferredSessionTime}
            setPreferredSessionTime={setPreferredSessionTime}
          />
        );
      case 3:
        return (
          <OnboardingStepThree
            identityArchetype={identityArchetype}
            setIdentityArchetype={setIdentityArchetype}
          />
        );
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
