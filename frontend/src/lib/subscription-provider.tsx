import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type SubscriptionTier = "free" | "premium" | "ultimate";

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

const ultimateSubscription: SubscriptionPlan = {
  tier: "ultimate",
  name: "Ultimate",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  features: {
    dailyQuestions: Infinity,
    journeysIncluded: Infinity,
    unlimitedDateIdeas: true,
    darkMode: true,
    aiTherapist: true,
    premiumCategories: true,
    relationshipTimeline: true,
    advancedAnalytics: true,
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan>(() => {
    // Try to load from localStorage
    const savedSubscription = localStorage.getItem("subscription");
    if (savedSubscription) {
      try {
        const parsed = JSON.parse(savedSubscription);
        // Convert expiration string back to Date if it exists
        if (parsed.expiresAt) {
          parsed.expiresAt = new Date(parsed.expiresAt);
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse subscription from localStorage:", e);
      }
    }
    return defaultSubscription;
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
    setSubscription(ultimateSubscription);
    toast.success("Upgraded to Ultimate plan! Enjoy all premium features.");
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