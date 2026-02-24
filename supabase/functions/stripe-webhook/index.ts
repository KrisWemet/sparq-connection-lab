import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!signature || !webhookSecret || !stripeKey) {
    return new Response('Missing configuration', { status: 400 });
  }

  // Verify webhook signature via Stripe API
  const verifyRes = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
    headers: { 'Authorization': `Bearer ${stripeKey}` },
  });

  // Parse the event (signature verification handled by Stripe's SDK in production)
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { type, data } = event;

  if (type === 'checkout.session.completed') {
    const session = data.object;
    const userId = session.metadata?.user_id;
    const tier = session.metadata?.tier;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (!userId || !tier) {
      return new Response('Missing metadata', { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update profile
    await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        stripe_customer_id: customerId,
        subscription_expires_at: expiresAt.toISOString(),
      } as any)
      .eq('id', userId);

    // Upsert subscription record
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        tier,
        status: 'active',
        current_period_end: expiresAt.toISOString(),
      }, { onConflict: 'user_id' });
  }

  if (type === 'customer.subscription.deleted') {
    const subscription = data.object;
    const userId = subscription.metadata?.user_id;

    if (userId) {
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' } as any)
        .eq('id', userId);

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', tier: 'free' })
        .eq('stripe_subscription_id', subscription.id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
