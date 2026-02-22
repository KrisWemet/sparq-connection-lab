import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionTier } from '@/lib/subscription-provider';

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Price IDs for each subscription tier (user will replace these with actual Stripe price IDs)
export const STRIPE_PRICE_IDS = {
  premium_monthly: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
  ultimate_monthly: import.meta.env.VITE_STRIPE_ULTIMATE_PRICE_ID || 'price_ultimate_monthly',
} as const;

// Pricing information for display
export const PRICING = {
  free: {
    tier: 'free' as SubscriptionTier,
    name: 'Free',
    price: 0,
    priceId: null,
    interval: null,
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
    description: 'Get started with basic relationship coaching',
    highlights: [
      '2 daily sessions (1 morning, 1 evening)',
      'Basic journeys',
      'Generic AI content',
      'Progress tracking',
    ],
  },
  premium: {
    tier: 'premium' as SubscriptionTier,
    name: 'Premium',
    price: 9.99,
    priceId: STRIPE_PRICE_IDS.premium_monthly,
    interval: 'month',
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
    description: 'Unlock deeper insights and personalized coaching',
    highlights: [
      '4 daily sessions (2 morning, 2 evening)',
      'All journeys unlocked',
      'Personalized AI content',
      'Partner features',
      'Unlimited date ideas',
      'Advanced analytics',
    ],
  },
  ultimate: {
    tier: 'ultimate' as SubscriptionTier,
    name: 'Ultimate',
    price: 19.99,
    priceId: STRIPE_PRICE_IDS.ultimate_monthly,
    interval: 'month',
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
    description: 'Transform your relationship with unlimited access',
    highlights: [
      'Unlimited daily sessions',
      'All journeys unlocked',
      'AI relationship coach',
      'Priority support',
      'Advanced analytics',
      'Partner sync & sharing',
    ],
  },
} as const;

/**
 * Creates a Stripe Checkout session and redirects user to payment page
 * @param priceId - Stripe Price ID for the subscription
 * @param userId - User's Supabase auth ID
 * @param tier - Subscription tier (premium or ultimate)
 * @returns Promise that resolves when redirect happens, or null on error
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  tier: SubscriptionTier
): Promise<void> {
  const successUrl = `${window.location.origin}/dashboard?checkout=success&tier=${tier}`;
  const cancelUrl = `${window.location.origin}/subscription?checkout=canceled`;

  // Call the Supabase Edge Function to create a Stripe checkout session
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId, tier, successUrl, cancelUrl },
  });

  if (error) throw new Error(error.message || 'Failed to create checkout session');
  if (data?.error) throw new Error(data.error);

  // Redirect to Stripe-hosted checkout page
  if (data?.url) {
    window.location.href = data.url;
  } else if (data?.sessionId) {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe failed to initialize');
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
    if (stripeError) throw stripeError;
  } else {
    throw new Error('No checkout URL returned');
  }
}

/**
 * Creates a Stripe Customer Portal session for managing subscription
 * @param customerId - Stripe Customer ID
 * @returns Promise that resolves when redirect happens, or null on error
 */
export async function createPortalSession(customerId: string): Promise<void> {
  const returnUrl = `${window.location.origin}/settings`;

  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: { customerId, returnUrl },
  });

  if (error) throw new Error(error.message || 'Failed to open billing portal');
  if (data?.url) {
    window.location.href = data.url;
  }
}

/**
 * Gets the current subscription status from Supabase
 * @param userId - User's Supabase auth ID
 * @returns Subscription data or null
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return subscription;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
}

/**
 * Gets user profile with subscription info
 * @param userId - User's Supabase auth ID
 * @returns Profile data with subscription fields
 */
export async function getUserSubscriptionInfo(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, stripe_customer_id, trial_ends_at, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user subscription info:', error);
    return null;
  }
}

/**
 * Checks if user is currently in trial period
 * @param trialEndsAt - Trial end date from profile
 * @returns boolean indicating if trial is active
 */
export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

/**
 * Checks if subscription is active
 * @param subscriptionExpiresAt - Subscription expiry date
 * @param tier - Current subscription tier
 * @returns boolean indicating if subscription is active
 */
export function isSubscriptionActive(
  subscriptionExpiresAt: string | null,
  tier: string
): boolean {
  if (tier === 'free') return true;
  if (!subscriptionExpiresAt) return false;
  return new Date(subscriptionExpiresAt) > new Date();
}

/**
 * Updates local subscription state after successful checkout
 * This is called from the success URL
 * TODO: In production, this should be handled by Stripe webhooks updating Supabase
 * @param userId - User's Supabase auth ID
 * @param tier - New subscription tier
 */
export async function handleCheckoutSuccess(userId: string, tier: SubscriptionTier) {
  try {
    // Update profile with new tier and expiration
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 30 days from now

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error handling checkout success:', error);
    return false;
  }
}

export const stripeService = {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  getUserSubscriptionInfo,
  isTrialActive,
  isSubscriptionActive,
  handleCheckoutSuccess,
  PRICING,
  STRIPE_PRICE_IDS,
};

export default stripeService;
