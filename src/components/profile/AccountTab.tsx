
import { useState, useEffect } from "react";
import { ProfileFormData, UserBadge } from "@/types/profile";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { StreakIndicator } from "@/components/StreakIndicator";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { PersonalInfoCard } from "./PersonalInfoCard";
import { AchievementsCard } from "./AchievementsCard";
import { PartnerConnectionCard } from "./PartnerConnectionCard";
import { LogoutCard } from "./LogoutCard";

interface AccountTabProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
}

export function AccountTab({ profile, setProfile }: AccountTabProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [relationshipLevel, setRelationshipLevel] = useState("Bronze");
  const [relationshipPoints, setRelationshipPoints] = useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(100);
  const [loading, setLoading] = useState(true);
  const [partnerAvatarUrl, setPartnerAvatarUrl] = useState("");
  
  const { user } = useAuth();

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
        <AchievementsCard badges={badges} />
      )}
      
      <PersonalInfoCard profile={profile} setProfile={setProfile} />
      
      {profile.partner_name && (
        <PartnerConnectionCard profile={profile} partnerAvatarUrl={partnerAvatarUrl} />
      )}
      
      <LogoutCard />
    </div>
  );
}
