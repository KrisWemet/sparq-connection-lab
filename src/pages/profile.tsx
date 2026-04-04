import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { motion } from 'framer-motion';
import ProtectedRoute from '../components/ProtectedRoute';
import { ChevronLeft, Pencil, Flame, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TraitCard } from '@/components/profile/TraitCard';
import { PeterLoading } from '@/components/PeterLoading';

export default function ProfilePage() {
  const { user, profile, updateProfile, loading, logout } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
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
      partnerUpdates: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [traits, setTraits] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState('');

  const fetchTraits = useCallback(async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      setAccessToken(session.access_token);
      const res = await fetch('/api/profile/traits', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTraits(json.traits || []);
      }
    } catch {}
  }, [user]);

  useEffect(() => { fetchTraits(); }, [fetchTraits]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: (profile as any).name || '',
        bio: (profile as any).bio || '',
        partnerName: (profile as any).partner_name || '',
        relationshipGoals: (profile as any).relationship_goals || '',
        anniversaryDate: (profile as any).anniversary_date || '',
        preferredActivities: (profile as any).preferred_activities || ['communication', 'quality-time'],
        notificationPreferences: (profile as any).notification_preferences || {
          dailyReminders: true,
          weeklyRecap: true,
          achievementAlerts: true,
          partnerUpdates: false
        }
      });
    }
  }, [profile]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
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
        updated_at: new Date().toISOString()
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

  if (loading) {
    return <PeterLoading isLoading />;
  }

  // Derived display values
  const displayName = (profile as any)?.name || user?.email?.split('@')[0] || 'You';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const identityStatement = (profile as any)?.identity_statement || 'Still writing this story.';
  const streak = (profile as any)?.current_streak || 0;
  const daysCompleted = (profile as any)?.total_sessions || 0;
  const onboardingDay = (profile as any)?.onboarding_day || 1;
  const archetype = (profile as any)?.archetype || null;
  const archetypeDescription = (profile as any)?.archetype_description || null;
  const partnerName = (profile as any)?.partner_name || null;

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, delay: i * 0.07, ease: 'easeOut' }
    })
  };

  return (
    <ProtectedRoute>
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
            Profile
          </span>

          <button
            onClick={() => setEditMode(!editMode)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-primary/10 transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4 text-brand-primary" />
          </button>
        </div>

        <main className="max-w-lg mx-auto px-4 space-y-4">
          {/* SUCCESS TOAST */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-brand-growth/20 text-brand-taupe text-sm rounded-2xl px-4 py-3 border border-brand-growth/30"
            >
              {successMessage}
            </motion.div>
          )}

          {/* IDENTITY CARD */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm p-6 flex flex-col items-center text-center"
          >
            {/* Initials circle */}
            <div className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>

            {/* Name */}
            <h1 className="font-bold text-[#2E1065] text-xl mt-3">{displayName}</h1>

            {/* Identity statement */}
            <p className="font-serif italic text-[#5B4A86] text-[15px] mt-1 leading-relaxed">
              {identityStatement}
            </p>

            {/* Day pill */}
            <span className="mt-3 inline-flex items-center bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full px-3 py-1">
              Day {onboardingDay} of 14
            </span>

            {/* Edit form — inline when edit mode active */}
            {editMode && (
              <form
                id="profile-form"
                onSubmit={handleSubmit}
                className="w-full mt-5 space-y-3 text-left"
              >
                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-brand-primary block mb-1">
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
                  <label className="text-xs font-semibold tracking-widest uppercase text-brand-primary block mb-1">
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
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 border border-brand-primary text-brand-primary rounded-2xl py-3 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-brand-primary text-white rounded-2xl py-3 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
                  >
                    {isLoading ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* ARCHETYPE CARD */}
          {archetype && (
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="relative bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm p-5 overflow-hidden"
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-brand-growth rounded-full" />
              <div className="pl-4">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-1">
                  Your Archetype
                </p>
                <h2 className="font-bold text-[#2E1065] text-lg">{archetype}</h2>
                {archetypeDescription && (
                  <p className="text-[#5B4A86] text-sm mt-1 leading-relaxed">{archetypeDescription}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* STATS ROW */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm p-5 flex flex-col items-center">
              <Flame className="w-6 h-6 text-brand-sand mb-1" />
              <span className="text-2xl font-bold text-[#2E1065]">{streak}</span>
              <span className="text-xs text-[#5B4A86] mt-0.5">day streak</span>
            </div>
            <div className="bg-[#EDE9FE] rounded-3xl border border-brand-primary/10 shadow-sm p-5 flex flex-col items-center">
              <BookOpen className="w-6 h-6 text-brand-primary mb-1" />
              <span className="text-2xl font-bold text-[#2E1065]">{daysCompleted}</span>
              <span className="text-xs text-[#5B4A86] mt-0.5">days completed</span>
            </div>
          </motion.div>

          {/* PARTNER SECTION */}
          {partnerName && (
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#EDE9FE] rounded-2xl border border-brand-primary/10 shadow-sm p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm flex-shrink-0">
                {partnerName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2E1065] text-sm">{partnerName}</p>
                <p className="text-xs text-[#5B4A86]">Your partner</p>
              </div>
              <span className="inline-flex items-center bg-brand-growth/20 text-brand-growth text-xs font-medium rounded-full px-3 py-1 flex-shrink-0">
                Connected
              </span>
            </motion.div>
          )}

          {/* TRAIT INSIGHTS */}
          {traits.length > 0 && (
            <motion.div
              custom={4}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <TraitCard
                traits={traits}
                accessToken={accessToken}
                onUpdated={fetchTraits}
              />
            </motion.div>
          )}

          {/* VIEW JOURNAL */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={() => router.push('/journal')}
              className="w-full border border-brand-primary text-brand-primary rounded-2xl py-3 text-xs font-semibold tracking-widest uppercase hover:bg-brand-primary/5 transition-colors"
            >
              View Journal →
            </button>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
