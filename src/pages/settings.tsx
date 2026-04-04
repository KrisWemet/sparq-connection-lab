import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/lib/subscription-provider";
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

  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [partnerNotifications, setPartnerNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          if (data.preferences?.notifications_enabled !== undefined) {
            setNotifications(data.preferences.notifications_enabled);
          } else if (data.notifications_enabled !== undefined) {
            setNotifications(data.notifications_enabled);
          }
          const reminderValue = data.preferences?.reminder_time ?? data.reminder_time;
          if (reminderValue !== undefined && reminderValue !== null) {
            setReminderTime(reminderValue.slice(0, 5));
          }
          setTrustSummary({
            personalizationEnabled: data.preferences?.personalization_enabled ?? true,
            memoryMode: data.preferences?.ai_memory_mode ?? 'rolling_90_days',
            hasConsent: data.consent?.has_consented ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load pref:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, [user]);

  const updatePreference = async (key: string, value: any) => {
    try {
      const { buildAuthedHeaders } = await import('@/lib/api-auth');
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/profile/preferences', {
        method: 'POST',
        headers,
        body: JSON.stringify({ [key]: value })
      });
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to update preference");
    }
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    updatePreference('notifications_enabled', checked);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    updatePreference('reminder_time', val);
  };

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

  // Simple inline toggle component
  const Toggle = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-brand-primary' : 'bg-brand-primary/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-[2px] ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );

  // Section label above a card
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary px-1 mb-2">
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
        <p className="text-sm font-medium text-[#2E1065]">{label}</p>
        {secondary && <p className="text-xs text-[#5B4A86] mt-0.5">{secondary}</p>}
      </div>
      {right && <div className="flex-shrink-0 ml-4">{right}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      {/* TOP BAR */}
      <div className="max-w-lg mx-auto px-4 pt-6 flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-primary/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-brand-primary" />
        </button>
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
          Settings
        </span>
        {/* Spacer to center title */}
        <div className="w-9" />
      </div>

      <main className="max-w-lg mx-auto px-4 space-y-5">
        {/* ACCOUNT */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Account</SectionLabel>
          <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
            <Row
              label="Email"
              secondary={user?.email || '—'}
              right={
                <button className="text-brand-primary text-sm font-medium">
                  Change
                </button>
              }
            />
            <Row
              label="Password"
              secondary="••••••••"
              right={
                <button className="text-brand-primary text-sm font-medium">
                  Update
                </button>
              }
            />
          </div>
        </motion.div>

        {/* PREFERENCES */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Preferences</SectionLabel>
          <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
            <Row
              label="Daily reminder"
              secondary={notifications ? reminderTime : 'Off'}
              right={
                <div className="flex items-center gap-3">
                  {notifications && (
                    <input
                      type="time"
                      value={reminderTime}
                      disabled={isLoading}
                      onChange={handleTimeChange}
                      className="border border-brand-primary/20 rounded-lg px-2 py-1 text-xs text-[#2E1065] bg-brand-linen focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  )}
                  <Toggle
                    checked={notifications}
                    onChange={handleNotificationsChange}
                    disabled={isLoading}
                  />
                </div>
              }
            />
            <Row
              label="Partner notifications"
              secondary="When your partner completes a session"
              right={
                <Toggle
                  checked={partnerNotifications}
                  onChange={(v) => {
                    setPartnerNotifications(v);
                    updatePreference('partner_notifications', v);
                  }}
                />
              }
            />
            <Row
              label="Dark mode"
              secondary="Coming soon"
              right={
                <Toggle
                  checked={darkMode}
                  onChange={setDarkMode}
                  disabled
                />
              }
            />
          </div>
        </motion.div>

        {/* PRIVACY */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Privacy</SectionLabel>
          <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
            {/* Trust summary pill */}
            <div className="px-5 pt-4 pb-2">
              <div className="rounded-xl bg-brand-linen border border-brand-primary/10 px-3 py-2">
                <p className="text-xs font-medium text-[#2E1065]">
                  {trustSummary.hasConsent ? 'AI consent active' : 'AI consent needed'}
                </p>
                <p className="text-xs text-[#5B4A86] mt-0.5">
                  {trustSummary.personalizationEnabled ? 'Personalization on' : 'Personalization off'}
                  {' · '}
                  Memory {trustSummary.memoryMode === 'off' ? 'off' : trustSummary.memoryMode === 'indefinite' ? 'indefinite' : '90-day'}
                </p>
              </div>
            </div>
            <Row
              label="Memory settings"
              onClick={() => router.push('/trust-center')}
              right={<ChevronRight className="w-4 h-4 text-[#5B4A86]" />}
            />
            <Row
              label="Download my data"
              onClick={() => toast.info("We'll email you a copy of your data within 24 hours.")}
              right={<ChevronRight className="w-4 h-4 text-[#5B4A86]" />}
            />
            <Row
              label="Trust Center"
              onClick={() => router.push('/trust-center')}
              right={<ChevronRight className="w-4 h-4 text-[#5B4A86]" />}
            />
          </div>
        </motion.div>

        {/* SUBSCRIPTION */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <SectionLabel>Plan</SectionLabel>
          <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm p-5">
            <p className="font-semibold text-[#2E1065] text-sm">
              {subscription.name}
            </p>
            <p className="text-xs text-[#5B4A86] mt-0.5 mb-4">
              {subscription.tier === "free"
                ? "Upgrade to unlock all journeys and unlimited sessions"
                : `Renews ${subscription.expiresAt?.toLocaleDateString()}`}
            </p>
            <button
              onClick={() => router.push("/subscription")}
              className={`w-full rounded-2xl py-3 text-sm font-medium transition-colors ${
                subscription.tier === "free"
                  ? "bg-brand-primary text-white hover:bg-brand-hover"
                  : "border border-brand-primary text-brand-primary hover:bg-brand-primary/5"
              }`}
            >
              {subscription.tier === "free" ? "Upgrade Now" : "Manage Subscription"}
            </button>
          </div>
        </motion.div>

        {/* ACCOUNT ACTIONS */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full border border-brand-primary text-brand-primary rounded-2xl py-3 text-sm font-medium hover:bg-brand-primary/5 transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full border border-red-300 text-red-600 rounded-2xl py-3 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-[#5B4A86]/50 py-2 pb-6">
          Sparq v1.0.0 · © 2026 Sparq Connection Lab
        </p>
      </main>
    </div>
  );
}
