
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserBadge } from "@/types/profile";
import { useAuth } from "@/lib/auth";

export function useDashboardData() {
  const { user } = useAuth();
  const [showSocialProof, setShowSocialProof] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [relationshipLevel, setRelationshipLevel] = useState<"Bronze" | "Silver" | "Gold" | "Diamond">("Bronze");
  const [relationshipPoints, setRelationshipPoints] = useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(100);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Supabase - optimized with useCallback
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Perform parallel requests for better performance
      const [profileResponse, badgesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('streak_count, relationship_level, relationship_points')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('achieved', true)
      ]);
      
      if (profileResponse.error) throw profileResponse.error;
      if (badgesResponse.error) throw badgesResponse.error;
      
      const profileData = profileResponse.data;
      if (profileData) {
        setStreakCount(profileData.streak_count || 0);
        setRelationshipLevel(profileData.relationship_level as any || 'Bronze');
        setRelationshipPoints(profileData.relationship_points || 0);
        
        // Calculate points needed for next level
        if (profileData.relationship_level === 'Bronze') {
          setPointsToNextLevel(100);
        } else if (profileData.relationship_level === 'Silver') {
          setPointsToNextLevel(300);
        } else if (profileData.relationship_level === 'Gold') {
          setPointsToNextLevel(500);
        } else {
          setPointsToNextLevel(500); // Max level
        }
      }
      
      if (badgesResponse.data) {
        setBadges(badgesResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data effect
  useEffect(() => {
    fetchUserData();
    
    // Set a timeout to force-show dashboard if loading takes too long
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 1500); // Reduced from 3000ms to 1500ms
    
    return () => clearTimeout(timeout);
  }, [fetchUserData]);
  
  // Confetti effect
  useEffect(() => {
    if (badges.some(badge => badge.achieved)) {
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [badges]);

  // Weekend toast notification
  useEffect(() => {
    if (loading) return; // Don't show toast while loading
    
    const timer = setTimeout(() => {
      toast.success("Weekend activity unlocked! 🎉", {
        description: "A special activity to bring you closer has been unlocked! Don't miss it!",
        action: {
          label: "Let's go!",
          onClick: () => {}
        },
        icon: "✨"
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  return {
    loading,
    showSocialProof,
    showConfetti,
    streakCount,
    badges,
    relationshipLevel,
    relationshipPoints,
    pointsToNextLevel
  };
}
