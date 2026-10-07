import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";
import { PeterAvatar } from "@/components/dashboard/PeterAvatar";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/subscription-provider";
import { getTrialDaysRemaining } from "@/lib/product";
import { PLANS, formatPrice, yearlyAsMonthly, yearlySavingsPercent, type Plan } from "@/lib/plans";
import { TONE } from "@/lib/moment-tone";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

// Together is a connect moment (coral); Solo is the everyday plum.
const PLAN_TONE: Record<Plan["id"], { card: string; eyebrow: string }> = {
  free: { card: "bg-card/70 border border-brand-border", eyebrow: "text-brand-text-secondary" },
  solo: { card: TONE.understand.card, eyebrow: TONE.understand.eyebrow },
  together: { card: TONE.connect.card, eyebrow: TONE.connect.eyebrow },
};

const FAQ = [
  {
    q: "What happens after my first 14 days?",
    a: "You keep Free. You can still practice 3 days a week, talk with Peter, and keep up to 2 journeys going. Nothing you wrote is lost.",
  },
  {
    q: "Does Peter forget me on Free?",
    a: "No. Peter keeps learning from what you share on every plan, so if you move up later, he already knows you.",
  },
  {
    q: "Does Together really cover both of us?",
    a: "Yes. One plan gives both partners everything in Solo, plus the things you do together. That's $7.50 each a month, less than two Solo plans.",
  },
  {
    q: "Is Conflict First Aid ever paid?",
    a: "Never. Conflict First Aid and crisis help are free for everyone, always.",
  },
];

export default function Subscription() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [billing, setBilling] = useState<Billing>("monthly");

  const trialDays = getTrialDaysRemaining(user?.created_at);
  // Trial users get premium entitlements too, but they haven't paid.
  const onPaidPlan = subscription.tier === "premium" && trialDays === 0;

  return (
    <div className="min-h-dvh bg-brand-linen pb-28">
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="bar-title">Plans</span>
          <div className="h-10 w-10" aria-hidden="true" />
        </div>

        {/* Where the user stands today */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto mb-8 flex max-w-lg items-start gap-3"
        >
          <PeterAvatar mood="afternoon" size={44} />
          <div className="flex-1 rounded-2xl rounded-tl-sm border border-brand-border bg-card p-4">
            <h1 className="font-serif text-xl text-brand-espresso">Pick what fits you</h1>
            <p className="mt-1 text-sm leading-relaxed text-brand-text-secondary">
              {onPaidPlan
                ? "You're on a paid plan. Thank you for growing with Sparq."
                : trialDays > 0
                  ? `You have everything in Solo free for ${trialDays} more ${trialDays === 1 ? "day" : "days"}. After that, Free is still yours.`
                  : "You're on Free. Each plan below adds to the one before it."}
            </p>
          </div>
        </motion.div>

        {/* Billing toggle */}
        <div className="mb-6 flex justify-center">
          <div role="tablist" aria-label="Billing" className="flex items-center rounded-full border border-brand-border bg-card/70 p-1">
            {(["monthly", "yearly"] as Billing[]).map((b) => (
              <button
                key={b}
                role="tab"
                aria-selected={billing === b}
                onClick={() => setBilling(b)}
                className={cn(
                  "press rounded-full px-4 py-2 text-sm font-medium",
                  billing === b ? "bg-brand-primary font-bold text-primary-foreground" : "text-brand-text-secondary",
                )}
              >
                {b === "monthly" ? "Monthly" : "Yearly · save 33%"}
              </button>
            ))}
          </div>
        </div>

        {/* Plans — each adds to the one before */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const prev = PLANS[i - 1];
            const tone = PLAN_TONE[plan.id];
            const price = billing === "yearly" ? plan.yearly : plan.monthly;
            return (
              <motion.section
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                className={cn(tone.card, "flex flex-col rounded-3xl p-6 shadow-sm")}
                aria-labelledby={`plan-${plan.id}`}
              >
                <div className="flex items-baseline justify-between">
                  <h2 id={`plan-${plan.id}`} className="font-serif text-2xl text-brand-espresso">{plan.name}</h2>
                  <span className={cn("font-serif text-base italic", tone.eyebrow)}>{plan.covers}</span>
                </div>
                <p className="mt-1 text-sm text-brand-text-secondary">{plan.tagline}</p>

                <div className="mt-4">
                  {plan.monthly === 0 ? (
                    <p className="text-3xl font-bold text-brand-espresso">$0</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-brand-espresso">
                        {formatPrice(price)}
                        <span className="text-base font-medium text-brand-text-secondary">{billing === "yearly" ? " / year" : " / month"}</span>
                      </p>
                      <p className="mt-1 text-xs text-brand-text-secondary">
                        {billing === "yearly"
                          ? `That's ${formatPrice(yearlyAsMonthly(plan))} a month. You save ${yearlySavingsPercent(plan)}%.`
                          : plan.id === "together"
                            ? `${formatPrice(plan.monthly / 2)} each for two people.`
                            : `Or ${formatPrice(plan.yearly)} a year.`}
                      </p>
                    </>
                  )}
                </div>

                <p className="mt-5 text-sm font-semibold text-brand-text-primary">
                  {prev ? `Everything in ${prev.name}, plus` : "Includes"}
                </p>
                <ul className="mt-2 flex-1 space-y-2.5">
                  {plan.adds.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-brand-espresso">
                      <Check className={cn("mt-0.5 h-4 w-4 flex-shrink-0", tone.eyebrow)} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.id === "free" ? (
                    <p className="rounded-2xl border border-brand-border bg-card/60 py-3 text-center text-sm font-medium text-brand-text-secondary">
                      {onPaidPlan ? "Always here if you need it" : "You have this"}
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className={cn(
                        "w-full rounded-2xl py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-80",
                        plan.id === "together" ? TONE.connect.button : TONE.understand.button,
                      )}
                    >
                      Opening soon
                    </button>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>

        <p className="mx-auto mt-5 max-w-lg text-center text-xs text-brand-text-secondary">
          Paid plans aren&apos;t open yet, so nothing will charge you. Prices are in US dollars.
        </p>

        {/* Questions */}
        <section className="mx-auto mt-10 max-w-2xl">
          <h2 className="mb-4 font-serif text-xl text-brand-espresso">Good questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-brand-border bg-card/70 p-4">
                <h3 className="text-sm font-semibold text-brand-espresso">{q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
