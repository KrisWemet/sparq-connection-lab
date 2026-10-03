import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/lib/subscription-provider";
import { getTrialDaysRemaining } from "@/lib/product";
import {
  VAPID_PUBLIC_KEY,
  disablePushOnThisDevice,
  enablePushOnThisDevice,
  getPushSupport,
  isThisDeviceSubscribed,
  sendTestPush,
  type PushSupport,
} from "@/lib/push-client";
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

  // Each reminder channel stays hidden until it can really deliver
  // (docs/REMINDERS.md), so no one can turn on something that never arrives.
  const emailAvailable = process.env.NEXT_PUBLIC_EMAIL_REMINDERS_ENABLED === 'true';
  const pushAvailable = !!VAPID_PUBLIC_KEY;
  const [emailReminders, setEmailReminders] = useState(false);
  const [pushReminders, setPushReminders] = useState(false);
  const [pushSupport, setPushSupport] = useState<PushSupport>('unsupported');
  const [deviceOn, setDeviceOn] = useState(false);
  const [pushNote, setPushNote] = useState<string | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [savedTime, setSavedTime] = useState('09:00');
  const isValidTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
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
          setEmailReminders(data.preferences?.email_reminders_enabled === true);
          setPushReminders(data.preferences?.push_reminders_enabled === true);
          if (typeof data.preferences?.reminder_time === 'string') {
            setReminderTime(data.preferences.reminder_time.slice(0, 5));
            setSavedTime(data.preferences.reminder_time.slice(0, 5));
          }
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
  useEffect(() => {
    if (!pushAvailable) return;
    setPushSupport(getPushSupport());
    isThisDeviceSubscribed().then(setDeviceOn);
  }, [pushAvailable]);

  // Saves reminder choices along with the browser's timezone, so reminders
  // arrive at the chosen time where the user actually is.
  const savePrefs = async (patch: Record<string, unknown>): Promise<boolean> => {
    try {
      const { buildAuthedHeaders } = await import('@/lib/api-auth');
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/preferences', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...patch, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const toggleEmail = async () => {
    const next = !emailReminders;
    setEmailReminders(next);
    if (await savePrefs({ email_reminders_enabled: next, reminder_time: reminderTime })) {
      setSavedTime(reminderTime);
      toast.success(next ? `Peter will email you at ${reminderTime}` : 'Reminder emails are off');
    } else {
      setEmailReminders(!next);
      toast.error("We couldn't save that just now. Please try again.");
    }
  };

  const togglePush = async () => {
    setPushBusy(true);
    setPushNote(null);
    try {
      if (pushReminders && deviceOn) {
        await disablePushOnThisDevice();
        setDeviceOn(false);
        if (await savePrefs({ push_reminders_enabled: false })) {
          setPushReminders(false);
          toast.success('Phone reminders are off');
        }
        return;
      }
      const result = await enablePushOnThisDevice();
      if (!result.ok) {
        setPushNote(
          result.reason === 'denied'
            ? "Notifications are blocked for Sparq. You can allow them in your phone's settings, then try again."
            : "We couldn't turn them on just now. Please try again."
        );
        return;
      }
      setDeviceOn(true);
      if (await savePrefs({ push_reminders_enabled: true, reminder_time: reminderTime })) {
        setPushReminders(true);
        setSavedTime(reminderTime);
        toast.success(`Peter will nudge this phone at ${reminderTime}`);
      } else {
        toast.error("We couldn't save that just now. Please try again.");
      }
    } finally {
      setPushBusy(false);
    }
  };

  const saveTime = async (time: string) => {
    if (await savePrefs({ reminder_time: time })) {
      setSavedTime(time);
      toast.success(`Reminders moved to ${time}`);
    } else {
      setReminderTime(savedTime);
      toast.error("We couldn't save that just now. Please try again.");
    }
  };

  const testPush = async () => {
    toast(await sendTestPush() ? 'Sent. It should pop up in a moment.' : "We couldn't send a test just now.");
  };

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

        {/* REMINDERS */}
        {(emailAvailable || pushAvailable) && (
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <SectionLabel>Reminders</SectionLabel>
            <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
              {pushAvailable && (
                <div className="border-b border-brand-primary/10 last:border-b-0">
                  <Row
                    border={false}
                    label="Phone notification"
                    secondary={pushReminders && deviceOn ? `Every day at ${reminderTime}` : pushReminders ? 'On for another device' : 'Off'}
                    right={
                      pushSupport === 'supported' ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pushReminders && deviceOn}
                    aria-label="Phone notification"
                    onClick={togglePush} disabled={pushBusy}
                    className={`press relative inline-flex h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${pushReminders && deviceOn ? 'bg-brand-primary' : 'bg-brand-primary/20'}`}
                  >
                    <span className={`mt-[2px] inline-block h-5 w-5 rounded-full bg-popover shadow transition-transform ${pushReminders && deviceOn ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                  </button>
                      ) : undefined
                    }
                  />
                  {pushSupport === 'needs-install' && (
                    <p className="px-5 pb-4 text-xs leading-relaxed text-brand-text-secondary">
                      On iPhone, add Sparq to your Home Screen first: tap the Share button, then &ldquo;Add to Home Screen&rdquo;. Open Sparq from there and turn this on.
                    </p>
                  )}
                  {pushSupport === 'unsupported' && (
                    <p className="px-5 pb-4 text-xs leading-relaxed text-brand-text-secondary">
                      This browser can&apos;t show Sparq notifications. Try Chrome or Safari on your phone.
                    </p>
                  )}
                  {pushNote && <p className="px-5 pb-4 text-xs leading-relaxed text-brand-text-secondary" role="status">{pushNote}</p>}
                  {pushReminders && deviceOn && (
                    <button type="button" onClick={testPush} className="press px-5 pb-4 text-xs font-semibold text-brand-hover underline underline-offset-4">
                      Send a test
                    </button>
                  )}
                </div>
              )}
              {emailAvailable && (
                <Row
                  label="Daily reminder email"
                  secondary={emailReminders ? `Every day at ${reminderTime}` : 'Off'}
                  right={
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailReminders}
                    aria-label="Daily reminder email"
                    onClick={toggleEmail}
                    className={`press relative inline-flex h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${emailReminders ? 'bg-brand-primary' : 'bg-brand-primary/20'}`}
                  >
                    <span className={`mt-[2px] inline-block h-5 w-5 rounded-full bg-popover shadow transition-transform ${emailReminders ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                  </button>
                  }
                />
              )}
              {(emailReminders || pushReminders) && (
                // Plain markup, not <Row>: Row is redefined each render, which
                // would remount the input on every keystroke.
                <div className="flex items-center justify-between px-5 min-h-[52px]">
                  <label htmlFor="reminder-time" className="text-sm font-medium text-brand-text-primary">Time</label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    aria-label="Reminder time"
                    onChange={e => setReminderTime(e.target.value)}
                    onBlur={e => isValidTime(e.target.value) && e.target.value !== savedTime && saveTime(e.target.value)}
                    className="border border-input rounded-lg px-2 py-1 text-sm text-brand-text-primary bg-brand-linen focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

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
