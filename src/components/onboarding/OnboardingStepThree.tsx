import { ArchetypeSelector } from "@/components/onboarding/ArchetypeSelector";
import type { IdentityArchetype } from "@/types/session";

interface OnboardingStepThreeProps {
  identityArchetype: IdentityArchetype | null;
  setIdentityArchetype: (archetype: IdentityArchetype) => void;
}

export function OnboardingStepThree({
  identityArchetype,
  setIdentityArchetype,
}: OnboardingStepThreeProps) {
  return (
    <ArchetypeSelector
      selected={identityArchetype}
      onSelect={setIdentityArchetype}
    />
  );
}
