import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
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
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // Get or create Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, name')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // TODO: This should call a Supabase Edge Function to create the checkout session
    // For now, we'll use client-side Stripe checkout (requires Stripe.js Payment Links or server endpoint)

    // TEMPORARY CLIENT-SIDE IMPLEMENTATION:
    // In production, replace this with a call to your Supabase Edge Function
    // that creates the checkout session server-side with proper security

    const successUrl = `${window.location.origin}/dashboard?checkout=success&tier=${tier}`;
    const cancelUrl = `${window.location.origin}/pricing?checkout=canceled`;

    // Note: This is a simplified approach. In production, you should:
    // 1. Create a Supabase Edge Function that calls Stripe's API to create a checkout session
    // 2. Pass the session ID back to the client
    // 3. Redirect to Stripe using the session ID

    // For now, log the intent and show a message
    console.log('Checkout session would be created with:', {
      priceId,
      userId,
      tier,
      customerEmail: profile.email,
      successUrl,
      cancelUrl,
    });

    // TODO: Replace with actual Edge Function call:
    /*
    const { data: session, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId,
        tier,
        successUrl,
        cancelUrl,
      },
    });

    if (error) throw error;

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (stripeError) throw stripeError;
    */

    // Temporary: Show alert for development
    alert(
      `Checkout would be created for ${tier} tier.\n\n` +
      `To complete integration:\n` +
      `1. Install @stripe/stripe-js: npm install @stripe/stripe-js\n` +
      `2. Add VITE_STRIPE_PUBLISHABLE_KEY to .env\n` +
      `3. Create Supabase Edge Function: create-checkout-session\n` +
      `4. Set up Stripe webhook handler`
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Creates a Stripe Customer Portal session for managing subscription
 * @param customerId - Stripe Customer ID
 * @returns Promise that resolves when redirect happens, or null on error
 */
export async function createPortalSession(customerId: string): Promise<void> {
  try {
    const returnUrl = `${window.location.origin}/settings`;

    // TODO: This should call a Supabase Edge Function to create the portal session
    // For now, log the intent
    console.log('Portal session would be created for customer:', customerId);

    // TODO: Replace with actual Edge Function call:
    /*
    const { data: session, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        customerId,
        returnUrl,
      },
    });

    if (error) throw error;

    window.location.href = session.url;
    */

    // Temporary: Show alert for development
    alert(
      `Billing portal would open for customer: ${customerId}\n\n` +
      `To complete integration, create Supabase Edge Function: create-portal-session`
    );

  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
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
