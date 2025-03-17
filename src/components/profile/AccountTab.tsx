
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { LogOut, Heart, Award, Star, Camera } from "lucide-react";
import { toast } from "sonner";
import { ProfileFormData, UserBadge } from "@/types/profile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AchievementBadge } from "@/components/AchievementBadge";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { StreakIndicator } from "@/components/StreakIndicator";

interface AccountTabProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
}

export function AccountTab({ profile, setProfile }: AccountTabProps) {
  const [saving, setSaving] = useState(false);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [relationshipLevel, setRelationshipLevel] = useState("Bronze");
  const [relationshipPoints, setRelationshipPoints] = useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(100);
  const [loading, setLoading] = useState(true);
  const [partnerAvatarUrl, setPartnerAvatarUrl] = useState("");
  const [uploadingPartnerAvatar, setUploadingPartnerAvatar] = useState(false);
  
  const navigate = useNavigate();
  const { signOut, handleRefreshProfile, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUserBadges();
      fetchPartnerProfile();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('streak_count, relationship_level, relationship_points')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setStreakCount(data.streak_count || 0);
        setRelationshipLevel(data.relationship_level || 'Bronze');
        setRelationshipPoints(data.relationship_points || 0);
        
        // Calculate points needed for next level
        if (data.relationship_level === 'Bronze') {
          setPointsToNextLevel(100);
        } else if (data.relationship_level === 'Silver') {
          setPointsToNextLevel(300);
        } else if (data.relationship_level === 'Gold') {
          setPointsToNextLevel(500);
        } else {
          setPointsToNextLevel(500); // Max level
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('badge_level', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };

  const fetchPartnerProfile = async () => {
    try {
      if (!user || !profile.partner_name) return;
      
      // This is simplified - in a real app you'd have a proper partner_id relationship
      // For now, we'll just check if any profiles match the partner name
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .ilike('full_name', profile.partner_name)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.avatar_url) {
        setPartnerAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      console.log("Saving profile:", profile);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save your profile");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          partner_name: profile.partner_name,
          anniversary_date: profile.anniversary_date,
          sexual_orientation: profile.sexual_orientation,
          relationship_structure: profile.relationship_structure,
          avatar_url: profile.avatar_url,
          isOnboarded: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh profile data in auth context
      if (handleRefreshProfile) {
        await handleRefreshProfile();
        console.log("Profile refreshed successfully after save");
      }
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleViewPartner = () => {
    navigate("/partner-profile");
  };

  const handlePartnerAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user || !profile.partner_name) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `partner-${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      setUploadingPartnerAvatar(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (data) {
        setPartnerAvatarUrl(data.publicUrl);
        
        // In a real app, you would associate this with the partner's profile
        // For now, we'll just show it in the UI without saving it to the partner's profile
        toast.success("Partner avatar uploaded!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading partner avatar");
      console.error("Error uploading partner avatar:", error);
    } finally {
      setUploadingPartnerAvatar(false);
    }
  };

  const handleUpdateAvatar = (url: string) => {
    setProfile({ ...profile, avatar_url: url });
  };

  return (
    <div className="space-y-6 mt-0">
      {!loading && streakCount > 0 && (
        <StreakIndicator streak={streakCount} />
      )}
      
      {!loading && (
        <RelationshipProgress 
          level={relationshipLevel as any}
          pointsEarned={relationshipPoints}
          pointsNeeded={pointsToNextLevel}
        />
      )}
      
      {!loading && badges.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                badge.achieved && (
                  <AchievementBadge 
                    key={badge.id}
                    type={badge.badge_type as any}
                    achieved={badge.achieved}
                    level={badge.badge_level as any}
                  />
                )
              ))}
              
              {badges.filter(b => b.achieved).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Complete daily activities and quizzes to earn badges!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile.full_name} 
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={profile.email} 
              onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner_name">Partner's Name</Label>
            <Input 
              id="partner_name" 
              value={profile.partner_name || ''} 
              onChange={(e) => setProfile({ ...profile, partner_name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary">Anniversary Date</Label>
            <Input 
              id="anniversary" 
              type="date" 
              value={profile.anniversary_date || ''} 
              onChange={(e) => setProfile({ ...profile, anniversary_date: e.target.value })} 
            />
          </div>
          <Button 
            onClick={handleSaveProfile} 
            className="w-full"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <LoadingIndicator size="sm" className="mr-2" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
      
      {profile.partner_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partner Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={partnerAvatarUrl} />
                    <AvatarFallback>{profile.partner_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  
                  <label 
                    htmlFor="partner-avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
                    style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <input 
                      id="partner-avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePartnerAvatarUpload}
                      disabled={uploadingPartnerAvatar}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium">{profile.partner_name}</p>
                  {profile.anniversary_date && (
                    <p className="text-xs text-gray-500">
                      Connected since {new Date(profile.anniversary_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewPartner}>
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
