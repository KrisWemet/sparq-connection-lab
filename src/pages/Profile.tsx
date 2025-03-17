
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileFormData } from "@/types/profile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { AccountTab } from "@/components/profile/AccountTab";
import { PreferencesTab } from "@/components/profile/PreferencesTab";
import { LoadingProfile } from "@/components/profile/LoadingProfile";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFormData>({
    full_name: "",
    email: "",
    partner_name: "",
    anniversary_date: "",
    sexual_orientation: "straight",
    relationship_structure: "monogamous",
    avatar_url: ""
  });

  useEffect(() => {
    console.log("Profile component received authProfile:", authProfile);
    if (authProfile) {
      setProfile({
        full_name: authProfile.fullName || "",
        email: authProfile.email || user?.email || "",
        partner_name: authProfile.partnerName || "",
        anniversary_date: authProfile.anniversaryDate || "",
        sexual_orientation: authProfile.sexualOrientation || "straight",
        relationship_structure: authProfile.relationshipStructure || "monogamous",
        avatar_url: authProfile.avatarUrl || ""
      });
      setLoading(false);
    }
  }, [authProfile, user]);

  useEffect(() => {
    if (user && !authProfile) {
      loadProfile();
    } else if (!user && !authLoading) {
      navigate("/auth");
    }
  }, [user, authLoading, authProfile]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Profile loading timeout reached, forcing state reset");
        setLoading(false);
      }
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, [loading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log("Loading profile data for user:", user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log("Profile data loaded:", data);
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user?.email || "",
          partner_name: data.partner_name || "",
          anniversary_date: data.anniversary_date || "",
          sexual_orientation: data.sexual_orientation || "straight",
          relationship_structure: data.relationship_structure || "monogamous",
          avatar_url: data.avatar_url || ""
        });
      } else {
        console.log("No profile data found, using defaults");
        if (user?.email) {
          setProfile(prev => ({
            ...prev,
            email: user.email || "",
            full_name: user.email.split('@')[0] || ""
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  if ((loading && !authProfile) || authLoading) {
    return <LoadingProfile />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ProfileHeader />

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <ProfileAvatar 
          profile={profile} 
          onAvatarUpdate={handleAvatarUpdate}
        />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <AccountTab profile={profile} setProfile={setProfile} />
          </TabsContent>
          
          <TabsContent value="preferences">
            <PreferencesTab profile={profile} setProfile={setProfile} />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}
