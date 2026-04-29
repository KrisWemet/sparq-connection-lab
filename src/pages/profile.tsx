import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { PeterLoading } from '@/components/PeterLoading';
import { useAuth } from '../lib/auth-context';

type ProfileFormState = {
  name: string;
  bio: string;
  partnerName: string;
  relationshipGoals: string;
  anniversaryDate: string;
  preferredActivities: string[];
  notificationPreferences: {
    dailyReminders: boolean;
    weeklyRecap: boolean;
    achievementAlerts: boolean;
    partnerUpdates: boolean;
  };
};

function SecondaryAccessRow({
  href,
  label,
  hint,
  icon: Icon,
}: {
  href: string;
  label: string;
  hint: string;
  icon: typeof Settings;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-brand-primary/10 bg-[#EDE9FE] px-4 py-4 transition-colors hover:bg-brand-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2E1065]">{label}</p>
          <p className="text-xs text-[#5B4A86]">{hint}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-brand-primary" />
    </Link>
  );
}

export default function ProfilePage() {
  const { user, profile, updateProfile, loading, logout } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<ProfileFormState>({
    name: '',
    bio: '',
    partnerName: '',
    relationshipGoals: '',
    anniversaryDate: '',
    preferredActivities: ['communication', 'quality-time'],
    notificationPreferences: {
      dailyReminders: true,
      weeklyRecap: true,
      achievementAlerts: true,
      partnerUpdates: false,
    },
  });

  useEffect(() => {
    if (!profile) return;

    setFormData({
      name: (profile as any).name || '',
      bio: (profile as any).bio || '',
      partnerName: (profile as any).partner_name || '',
      relationshipGoals: (profile as any).relationship_goals || '',
      anniversaryDate: (profile as any).anniversary_date || '',
      preferredActivities:
        (profile as any).preferred_activities || ['communication', 'quality-time'],
      notificationPreferences: (profile as any).notification_preferences || {
        dailyReminders: true,
        weeklyRecap: true,
        achievementAlerts: true,
        partnerUpdates: false,
      },
    });
  }, [profile]);

  if (loading) {
    return <PeterLoading isLoading />;
  }

  const displayName = (profile as any)?.name || user?.email?.split('@')[0] || 'You';
  const initials = displayName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const profileUpdate = {
        name: formData.name,
        bio: formData.bio,
        partner_name: formData.partnerName,
        relationship_goals: formData.relationshipGoals,
        anniversary_date: formData.anniversaryDate,
        preferred_activities: formData.preferredActivities,
        notification_preferences: formData.notificationPreferences,
        updated_at: new Date().toISOString(),
      };

      if (updateProfile) {
        await updateProfile(profileUpdate);
      }

      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, delay: index * 0.07, ease: 'easeOut' },
    }),
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-linen pb-24">
        <div className="mx-auto mb-6 flex max-w-lg items-center justify-between px-4 pt-6">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand-primary/10"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-brand-primary" />
          </button>

          <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            Profile
          </span>

          <button
            onClick={() => setEditMode((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand-primary/10"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4 text-brand-primary" />
          </button>
        </div>

        <main className="mx-auto max-w-lg space-y-4 px-4">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-brand-growth/30 bg-brand-growth/20 px-4 py-3 text-sm text-brand-taupe"
            >
              {successMessage}
            </motion.div>
          )}

          <motion.section
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-brand-primary/10 bg-[#EDE9FE] p-6 text-center shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-xl font-bold text-white">
              {initials}
            </div>

            <h1 className="mt-3 text-xl font-bold text-[#2E1065]">{displayName}</h1>
            <p className="mt-1 text-sm text-[#5B4A86]">
              {user?.email || 'Manage the account details tied to your practice.'}
            </p>

            {editMode && (
              <form
                id="profile-form"
                onSubmit={handleSubmit}
                className="mt-5 space-y-3 text-left"
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-brand-primary/20 bg-brand-linen px-3 py-2 text-sm text-[#2E1065] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    Partner&apos;s Name
                  </label>
                  <input
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    placeholder="Enter your partner's name"
                    className="w-full rounded-xl border border-brand-primary/20 bg-brand-linen px-3 py-2 text-sm text-[#2E1065] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Add a short note about yourself"
                    rows={3}
                    className="w-full rounded-xl border border-brand-primary/20 bg-brand-linen px-3 py-2 text-sm text-[#2E1065] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 rounded-2xl border border-brand-primary py-3 text-sm font-medium text-brand-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-2xl bg-brand-primary py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
                  >
                    {isLoading ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </motion.section>

          <motion.section
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <p className="px-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">
              Secondary Access
            </p>

            <SecondaryAccessRow
              href="/settings"
              label="Settings"
              hint="Adjust reminders, email, and account preferences."
              icon={Settings}
            />
            <SecondaryAccessRow
              href="/trust-center"
              label="Trust Center"
              hint="Review consent, privacy, and personalization controls."
              icon={ShieldCheck}
            />
            <SecondaryAccessRow
              href="/subscription"
              label="Billing & Subscription"
              hint="Manage your current plan and upgrade options."
              icon={CreditCard}
            />
          </motion.section>

          <motion.section
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-brand-primary/10 bg-[#EDE9FE] p-4 shadow-sm"
          >
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-left transition-colors hover:bg-brand-primary/5"
              aria-label="Logout"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2E1065]">Logout</p>
                  <p className="text-xs text-[#5B4A86]">Sign out and return to the login screen.</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-primary" />
            </button>
          </motion.section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
