import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/lib/subscription-provider";
import { getTrialDaysRemaining } from "@/lib/product";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const { user, logout } = useAuth();
  const trialDays = getTrialDaysRemaining(user?.created_at);

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [trustSummary, setTrustSummary] = useState<{
    personalizationEnabled: boolean;
    memoryMode: string;
    hasConsent: boolean;
  }>({
    personalizationEnabled: true,
    memoryMode: 'rolling_90_days',
    hasConsent: false,
  });

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      try {
        const { buildAuthedHeaders } = await import('@/lib/api-auth');
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/profile/preferences', { headers });
        if (res.ok) {
          const data = await res.json();
          setTrustSummary({
            personalizationEnabled: data.preferences?.personalization_enabled ?? true,
            memoryMode: data.preferences?.ai_memory_mode ?? 'rolling_90_days',
            hasConsent: data.consent?.has_consented ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load pref:", err);
      }
    }
    loadPreferences();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    toast("Account deletion requested", {
      description: "We've sent a confirmation email with further instructions.",
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' }
    })
  };

  // Section label above a card
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover px-1 mb-2">
      {children}
    </p>
  );

  // Row inside a card
  const Row = ({
    label,
    secondary,
    right,
    onClick,
    border = true,
  }: {
    label: string;
    secondary?: React.ReactNode;
    right?: React.ReactNode;
    onClick?: () => void;
    border?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-5 min-h-[52px] ${
        border ? 'border-b border-brand-primary/10 last:border-b-0' : ''
      } ${onClick ? 'cursor-pointer hover:bg-brand-primary/5 transition-colors' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-brand-text-primary">{label}</p>
        {secondary && <p className="text-xs text-brand-text-secondary mt-0.5">{secondary}</p>}
      </div>
      {right && <div className="flex-shrink-0 ml-4">{right}</div>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-brand-linen pb-24">
      {/* TOP BAR */}
      <div className="max-w-lg mx-auto px-4 pt-6 flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-primary/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-brand-primary" />
        </button>
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-hover">
          Settings
        </span>
        {/* Spacer to center title */}
        <div className="w-9" />
      </div>

      <main className="max-w-lg mx-auto px-4 space-y-5">
        {/* ACCOUNT */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Account</SectionLabel>
          <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
            <Row
              label="Email"
              secondary={user?.email || '—'}
              right={
                <button className="text-brand-hover text-sm font-medium">
                  Change
                </button>
              }
            />
            <Row
              label="Password"
              secondary="••••••••"
              right={
                <button className="text-brand-hover text-sm font-medium">
                  Update
                </button>
              }
            />
          </div>
        </motion.div>

        {/* PRIVACY */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Privacy</SectionLabel>
          <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
            {/* Trust summary pill */}
            <div className="px-5 pt-4 pb-2">
              <div className="rounded-xl bg-brand-linen border border-brand-primary/10 px-3 py-2">
                <p className="text-xs font-medium text-brand-text-primary">
                  {trustSummary.hasConsent ? 'AI consent active' : 'AI consent needed'}
                </p>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  {trustSummary.personalizationEnabled ? 'Personalization on' : 'Personalization off'}
                  {' · '}
                  Memory {trustSummary.memoryMode === 'off' ? 'off' : trustSummary.memoryMode === 'indefinite' ? 'indefinite' : '90-day'}
                </p>
              </div>
            </div>
            <Row
              label="Memory settings"
              onClick={() => router.push('/trust-center')}
              right={<ChevronRight className="w-4 h-4 text-brand-text-secondary" />}
            />
            <Row
              label="Download my data"
              onClick={() => toast.info("We'll email you a copy of your data within 24 hours.")}
              right={<ChevronRight className="w-4 h-4 text-brand-text-secondary" />}
            />
            <Row
              label="Trust Center"
              onClick={() => router.push('/trust-center')}
              right={<ChevronRight className="w-4 h-4 text-brand-text-secondary" />}
            />
          </div>
        </motion.div>

        {/* SUBSCRIPTION */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Plan</SectionLabel>
          <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5">
            <p className="font-semibold text-brand-text-primary text-sm">
              {trialDays > 0 ? 'Free trial' : subscription.name}
            </p>
            <p className="text-xs text-brand-text-secondary mt-0.5 mb-4">
              {trialDays > 0
                ? `Everything in Solo for ${trialDays} more ${trialDays === 1 ? 'day' : 'days'}`
                : subscription.tier === "free"
                  ? "See what Solo and Together add"
                  : "Thank you for growing with Sparq"}
            </p>
            <button
              onClick={() => router.push("/subscription")}
              className={`press w-full rounded-2xl py-3 text-sm font-bold transition-colors ${
                subscription.tier === "free" || trialDays > 0
                  ? "bg-brand-primary text-white hover:bg-brand-hover"
                  : "border border-brand-primary text-brand-hover hover:bg-brand-primary/5"
              }`}
            >
              {subscription.tier === "free" || trialDays > 0 ? "See plans" : "Manage plan"}
            </button>
          </div>
        </motion.div>

        {/* ACCOUNT ACTIONS */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full border border-brand-primary text-brand-hover rounded-2xl py-3 text-sm font-medium hover:bg-brand-primary/5 transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full border border-destructive text-destructive-emphasis rounded-2xl py-3 text-sm font-medium hover:bg-destructive-subtle transition-colors"
            >
              Delete account
            </button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-brand-text-secondary py-2 pb-6">
          Sparq v1.0.0 · © 2026 Sparq Connection Lab
        </p>
      </main>
    </div>
  );
}
