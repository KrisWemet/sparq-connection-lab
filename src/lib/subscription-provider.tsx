import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { PRICING, createCheckoutSession } from "@/services/stripeService";

export type SubscriptionTier = "free" | "premium" | "ultimate";

export type SubscriptionPlan = {
  tier: SubscriptionTier;
  name: string;
  expiresAt: Date | null;
  features: {
    dailyQuestions: number;
    journeysIncluded: number;
    unlimitedDateIdeas: boolean;
    darkMode: boolean;
    aiCoach: boolean;
    premiumCategories: boolean;
    relationshipTimeline: boolean;
    advancedAnalytics: boolean;
  };
};

type SubscriptionContextType = {
  subscription: SubscriptionPlan;
  setSubscription: (plan: SubscriptionPlan) => void;
  upgradeToUltimate: () => void;
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
  isFeatureAvailable: (feature: keyof SubscriptionPlan["features"]) => boolean;
  remainingDailyQuestions: number;
  setRemainingDailyQuestions: (count: number) => void;
  remainingMorningQuestions: number;
  remainingEveningQuestions: number;
  setRemainingMorningQuestions: (count: number) => void;
  setRemainingEveningQuestions: (count: number) => void;
  resetDailyLimits: () => void;
  loading: boolean;
};

// Feature definitions per tier
const TIER_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: "free",
    name: "Free",
    expiresAt: null,
    features: {
      dailyQuestions: 2,
      journeysIncluded: 0,
      unlimitedDateIdeas: false,
      darkMode: true,
      aiCoach: false,
      premiumCategories: false,
      relationshipTimeline: false,
      advancedAnalytics: false,
    },
  },
  premium: {
    tier: "premium",
    name: "Premium",
    expiresAt: null,
    features: {
      dailyQuestions: 4,
      journeysIncluded: 3,
      unlimitedDateIdeas: true,
      darkMode: true,
      aiCoach: false,
      premiumCategories: true,
      relationshipTimeline: true,
      advancedAnalytics: true,
    },
  },
  ultimate: {
    tier: "ultimate",
    name: "Ultimate",
    expiresAt: null,
    features: {
      dailyQuestions: Infinity,
      journeysIncluded: Infinity,
      unlimitedDateIdeas: true,
      darkMode: true,
      aiCoach: true,
      premiumCategories: true,
      relationshipTimeline: true,
      advancedAnalytics: true,
    },
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [subscription, setSubscriptionState] = useState<SubscriptionPlan>(() => {
    // Fast initial load from localStorage cache
    const cached = localStorage.getItem("subscription_tier");
    if (cached && (cached === "free" || cached === "premium" || cached === "ultimate")) {
      return TIER_PLANS[cached as SubscriptionTier];
    }
    return TIER_PLANS.free;
  });

  const [remainingDailyQuestions, setRemainingDailyQuestions] = useState<number>(() => {
    const saved = localStorage.getItem("remainingDailyQuestions");
    return saved ? parseInt(saved, 10) : subscription.features.dailyQuestions;
  });

  const [remainingMorningQuestions, setRemainingMorningQuestions] = useState<number>(() => {
    const saved = localStorage.getItem("remainingMorningQuestions");
    return saved ? parseInt(saved, 10) : Math.ceil(subscription.features.dailyQuestions / 2);
  });

  const [remainingEveningQuestions, setRemainingEveningQuestions] = useState<number>(() => {
    const saved = localStorage.getItem("remainingEveningQuestions");
    return saved ? parseInt(saved, 10) : Math.floor(subscription.features.dailyQuestions / 2);
  });

  // Load subscription from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setSubscriptionState(TIER_PLANS.free);
      localStorage.removeItem("subscription_tier");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSubscription = async () => {
      try {
        // Check profile for subscription_tier (set by Stripe webhook)
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_tier, subscription_expires_at, trial_ends_at")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        if (error) {
          console.error("Error loading subscription:", error);
          setLoading(false);
          return;
        }

        const tier = (profile?.subscription_tier as SubscriptionTier) || "free";
        const expiresAt = profile?.subscription_expires_at
          ? new Date(profile.subscription_expires_at)
          : null;
        const trialEndsAt = profile?.trial_ends_at
          ? new Date(profile.trial_ends_at)
          : null;

        // Check if subscription is still active
        const now = new Date();
        let effectiveTier: SubscriptionTier = tier;

        if (tier !== "free" && expiresAt && expiresAt < now) {
          // Subscription expired — check trial
          if (trialEndsAt && trialEndsAt > now) {
            effectiveTier = tier; // Still in trial
          } else {
            effectiveTier = "free"; // Expired, downgrade
          }
        }

        const plan = {
          ...TIER_PLANS[effectiveTier],
          expiresAt,
        };

        setSubscriptionState(plan);
        localStorage.setItem("subscription_tier", effectiveTier);

        // Update daily limits to match new tier
        const dailyQ = plan.features.dailyQuestions;
        setRemainingDailyQuestions(dailyQ);
        setRemainingMorningQuestions(Math.ceil(dailyQ / 2));
        setRemainingEveningQuestions(Math.floor(dailyQ / 2));
      } catch (err) {
        console.error("Error loading subscription:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSubscription();

    return () => { cancelled = true; };
  }, [user]);

  // Check if daily limits should reset
  useEffect(() => {
    const lastResetDate = localStorage.getItem("lastQuestionResetDate");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!lastResetDate || parseInt(lastResetDate, 10) < today) {
      resetDailyLimits();
      localStorage.setItem("lastQuestionResetDate", today.toString());
    }
  }, [subscription.features.dailyQuestions]);

  // Persist daily limits to localStorage
  useEffect(() => {
    localStorage.setItem("remainingDailyQuestions", remainingDailyQuestions.toString());
  }, [remainingDailyQuestions]);

  useEffect(() => {
    localStorage.setItem("remainingMorningQuestions", remainingMorningQuestions.toString());
  }, [remainingMorningQuestions]);

  useEffect(() => {
    localStorage.setItem("remainingEveningQuestions", remainingEveningQuestions.toString());
  }, [remainingEveningQuestions]);

  const resetDailyLimits = useCallback(() => {
    const dailyQ = subscription.features.dailyQuestions;
    setRemainingDailyQuestions(dailyQ);
    setRemainingMorningQuestions(Math.ceil(dailyQ / 2));
    setRemainingEveningQuestions(Math.floor(dailyQ / 2));
  }, [subscription.features.dailyQuestions]);

  const setSubscription = (plan: SubscriptionPlan) => {
    setSubscriptionState(plan);
    localStorage.setItem("subscription_tier", plan.tier);
    setRemainingDailyQuestions(plan.features.dailyQuestions);
    setRemainingMorningQuestions(Math.ceil(plan.features.dailyQuestions / 2));
    setRemainingEveningQuestions(Math.floor(plan.features.dailyQuestions / 2));
  };

  const upgradeToUltimate = async () => {
    if (!user) return;
    const priceId = PRICING.ultimate.priceId;
    if (!priceId) {
      toast.error("Stripe is not configured yet.");
      return;
    }
    try {
      await createCheckoutSession(priceId, user.id, "ultimate");
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    const priceId = PRICING.premium.priceId;
    if (!priceId) {
      toast.error("Stripe is not configured yet.");
      return;
    }
    try {
      await createCheckoutSession(priceId, user.id, "premium");
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
    }
  };

  const downgradeToFree = () => {
    setSubscription(TIER_PLANS.free);
    toast.info("Downgraded to Free plan.");
  };

  const isFeatureAvailable = (feature: keyof SubscriptionPlan["features"]) => {
    return !!subscription.features[feature];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        setSubscription,
        upgradeToUltimate,
        upgradeToPremium,
        downgradeToFree,
        isFeatureAvailable,
        remainingDailyQuestions,
        setRemainingDailyQuestions,
        remainingMorningQuestions,
        remainingEveningQuestions,
        setRemainingMorningQuestions,
        setRemainingEveningQuestions,
        resetDailyLimits,
        loading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
