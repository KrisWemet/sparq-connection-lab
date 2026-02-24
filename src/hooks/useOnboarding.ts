import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { IdentityArchetype } from "@/types/session";

export function useOnboarding() {
  const navigate = useNavigate();
  const { user, profile, handleRefreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Welcome
  const [fullName, setFullName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [relationshipMode, setRelationshipMode] = useState<"solo" | "partner">("solo");

  // Step 2: What brings you
  const [onboardingGoals, setOnboardingGoals] = useState<string[]>([]);
  const [preferredSessionTime, setPreferredSessionTime] = useState("8:00 AM");

  // Step 3: Identity archetype
  const [identityArchetype, setIdentityArchetype] = useState<IdentityArchetype | null>(null);

  const totalSteps = 3;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || profile.full_name || "");
      setPartnerName(profile.partnerName || profile.partner_name || "");
    }
  }, [profile]);

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

  const handleSkip = () => {
    setStep(totalSteps);
    window.scrollTo(0, 0);
  };

  const handleComplete = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (user?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            partner_name: relationshipMode === "partner" ? partnerName : null,
            relationship_mode: relationshipMode,
            onboarding_goals: onboardingGoals,
            preferred_session_time: preferredSessionTime,
            identity_archetype: identityArchetype,
            discovery_day: 1,
            trial_start_date: new Date().toISOString(),
            isonboarded: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating profile:", error);
          throw error;
        }

        await handleRefreshProfile();

        toast.success("You're all set! Let's begin.");
        navigate("/dashboard");
      } else {
        throw new Error("User ID not available");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return {
    user,
    step,
    totalSteps,
    loading,
    // Step 1
    fullName,
    setFullName,
    partnerName,
    setPartnerName,
    relationshipMode,
    setRelationshipMode,
    // Step 2
    onboardingGoals,
    setOnboardingGoals,
    preferredSessionTime,
    setPreferredSessionTime,
    // Step 3
    identityArchetype,
    setIdentityArchetype,
    // Navigation
    handleNext,
    handleBack,
    handleSkip,
    handleComplete,
  };
}
