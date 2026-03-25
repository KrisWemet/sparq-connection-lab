import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type SubscriptionTier = "free" | "premium";
type LegacySubscriptionTier = SubscriptionTier | "ultimate";

export type SubscriptionPlan = {
  tier: SubscriptionTier;
  name: string;
  expiresAt: Date | null;
  features: {
    dailyQuestions: number; // Number of daily questions allowed
    journeysIncluded: number; // Number of free journeys included
    unlimitedDateIdeas: boolean;
    darkMode: boolean;
    aiTherapist: boolean;
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
};

const defaultSubscription: SubscriptionPlan = {
  tier: "free",
  name: "Free",
  expiresAt: null,
  features: {
    dailyQuestions: 2, // Changed to 2 (1 morning, 1 evening)
    journeysIncluded: 0,
    unlimitedDateIdeas: false,
    darkMode: true,
    aiTherapist: false,
    premiumCategories: false,
    relationshipTimeline: false,
    advancedAnalytics: false,
  },
};

const premiumSubscription: SubscriptionPlan = {
  tier: "premium",
  name: "Premium",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  features: {
    dailyQuestions: 4, // Changed to 4 (2 morning, 2 evening)
    journeysIncluded: 3,
    unlimitedDateIdeas: true,
    darkMode: true,
    aiTherapist: false,
    premiumCategories: true,
    relationshipTimeline: true,
    advancedAnalytics: true,
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function normalizeStoredSubscription(raw: unknown): SubscriptionPlan {
  if (!raw || typeof raw !== "object") {
    return defaultSubscription;
  }

  const parsed = raw as Omit<Partial<SubscriptionPlan>, "tier"> & {
    tier?: LegacySubscriptionTier;
    expiresAt?: string | Date | null;
  };
  if (parsed.tier === "premium" || parsed.tier === "ultimate") {
    return {
      ...premiumSubscription,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : premiumSubscription.expiresAt,
    };
  }

  return {
    ...defaultSubscription,
    expiresAt: null,
  };
}

function getPlanForTier(tier: SubscriptionTier): SubscriptionPlan {
  return tier === "premium"
    ? premiumSubscription
    : defaultSubscription;
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan>(() => {
    if (typeof window === 'undefined') return defaultSubscription;
    const savedSubscription = localStorage.getItem("subscription");
    if (savedSubscription) {
      try {
        return normalizeStoredSubscription(JSON.parse(savedSubscription));
      } catch (e) {
        console.error("Failed to parse subscription from localStorage:", e);
      }
    }
    return defaultSubscription;
  });

  const [remainingDailyQuestions, setRemainingDailyQuestions] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultSubscription.features.dailyQuestions;
    const saved = localStorage.getItem("remainingDailyQuestions");
    return saved ? parseInt(saved, 10) : defaultSubscription.features.dailyQuestions;
  });

  const [remainingMorningQuestions, setRemainingMorningQuestions] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem("remainingMorningQuestions");
    return saved ? parseInt(saved, 10) : Math.ceil(defaultSubscription.features.dailyQuestions / 2);
  });

  const [remainingEveningQuestions, setRemainingEveningQuestions] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem("remainingEveningQuestions");
    return saved ? parseInt(saved, 10) : Math.floor(defaultSubscription.features.dailyQuestions / 2);
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        const nextTier: SubscriptionTier = data?.tier === "premium" ? "premium" : "free";
        if (!isMounted || nextTier === subscription.tier) return;

        const nextPlan = getPlanForTier(nextTier);
        setSubscriptionState(nextPlan);
        setRemainingDailyQuestions(nextPlan.features.dailyQuestions);
        setRemainingMorningQuestions(Math.ceil(nextPlan.features.dailyQuestions / 2));
        setRemainingEveningQuestions(Math.floor(nextPlan.features.dailyQuestions / 2));
      } catch (error) {
        console.error("Failed to sync subscription from entitlements:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [subscription.tier]);

  // Check if a day has passed since the last reset
  useEffect(() => {
    const lastResetDate = localStorage.getItem("lastQuestionResetDate");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!lastResetDate || parseInt(lastResetDate, 10) < today) {
      // Reset daily limits
      resetDailyLimits();
      localStorage.setItem("lastQuestionResetDate", today.toString());
    }

    // Check for time of day to reset AM/PM questions if needed
    const currentHour = now.getHours();
    const lastPeriodReset = localStorage.getItem("lastPeriodReset") || "none";
    
    // Reset morning questions if it's morning and we haven't reset today
    if (currentHour >= 6 && currentHour < 12 && lastPeriodReset !== "morning") {
      setRemainingMorningQuestions(Math.ceil(subscription.features.dailyQuestions / 2));
      localStorage.setItem("lastPeriodReset", "morning");
      localStorage.setItem("remainingMorningQuestions", Math.ceil(subscription.features.dailyQuestions / 2).toString());
    }
    
    // Reset evening questions if it's evening and we haven't reset today
    if (currentHour >= 17 && currentHour < 23 && lastPeriodReset !== "evening") {
      setRemainingEveningQuestions(Math.floor(subscription.features.dailyQuestions / 2));
      localStorage.setItem("lastPeriodReset", "evening");
      localStorage.setItem("remainingEveningQuestions", Math.floor(subscription.features.dailyQuestions / 2).toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription.features.dailyQuestions]);

  // Save to localStorage when these values change
  useEffect(() => {
    localStorage.setItem("subscription", JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem("remainingDailyQuestions", remainingDailyQuestions.toString());
  }, [remainingDailyQuestions]);

  useEffect(() => {
    localStorage.setItem("remainingMorningQuestions", remainingMorningQuestions.toString());
  }, [remainingMorningQuestions]);

  useEffect(() => {
    localStorage.setItem("remainingEveningQuestions", remainingEveningQuestions.toString());
  }, [remainingEveningQuestions]);

  const resetDailyLimits = () => {
    setRemainingDailyQuestions(subscription.features.dailyQuestions);
    setRemainingMorningQuestions(Math.ceil(subscription.features.dailyQuestions / 2));
    setRemainingEveningQuestions(Math.floor(subscription.features.dailyQuestions / 2));
  };

  const setSubscription = (plan: SubscriptionPlan) => {
    setSubscriptionState(plan);
    setRemainingDailyQuestions(plan.features.dailyQuestions);
    setRemainingMorningQuestions(Math.ceil(plan.features.dailyQuestions / 2));
    setRemainingEveningQuestions(Math.floor(plan.features.dailyQuestions / 2));
  };

  const upgradeToUltimate = () => {
    setSubscription(premiumSubscription);
    toast.success("Upgraded to Premium plan.");
  };

  const upgradeToPremium = () => {
    setSubscription(premiumSubscription);
    toast.success("Upgraded to Premium plan!");
  };

  const downgradeToFree = () => {
    setSubscription(defaultSubscription);
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
        resetDailyLimits
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
