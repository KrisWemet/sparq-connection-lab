import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/lib/subscription-provider";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  LogOut,
  Shield,
  Trash2,
  Settings,
  HelpCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      try {
        const { buildAuthedHeaders } = await import('@/lib/api-auth');
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/profile/preferences', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.notifications_enabled !== undefined) setNotifications(data.notifications_enabled);
          if (data.reminder_time !== undefined && data.reminder_time !== null) {
            // Slice 'HH:MM:SS' back to 'HH:MM'
            setReminderTime(data.reminder_time.slice(0, 5));
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold mx-auto">Settings</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-primary" />
              <CardTitle>Account Settings</CardTitle>
            </div>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications to complete your Daily Loop
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                disabled={isLoading}
                onCheckedChange={handleNotificationsChange}
              />
            </div>

            <AnimatePresence>
              {notifications && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center justify-between pl-4 border-l-2 border-indigo-100 mt-2"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <p className="text-sm text-gray-500">
                      When should Peter nudge you?
                    </p>
                  </div>
                  <input
                    type="time"
                    id="reminder-time"
                    value={reminderTime}
                    disabled={isLoading}
                    onChange={handleTimeChange}
                    className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-updates">Email Updates</Label>
                <p className="text-sm text-gray-500">
                  Receive relationship tips and app updates via email
                </p>
              </div>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-primary" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>Manage your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info("Privacy policy will open in a new window")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info("Terms of service will open in a new window")}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Terms of Service
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/trust-center")}
            >
              <Lock className="w-4 h-4 mr-2" />
              Trust Center
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {subscription.name}</CardTitle>
            <CardDescription>
              {subscription.tier === "free"
                ? "Upgrade to unlock premium features"
                : `Your subscription expires on ${subscription.expiresAt?.toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/subscription")}
              variant={subscription.tier === "free" ? "default" : "outline"}
              className="w-full"
            >
              {subscription.tier === "free" ? "Upgrade Now" : "Manage Subscription"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account data and sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
          <CardFooter className="text-xs text-gray-400">
            Account deletion permanently removes all your data after a 30-day grace period.
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-gray-400 py-4">
          Sparq v1.0.0 · © 2026 Sparq Connection Lab
        </div>
      </main>
    </div>
  );
}
