
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ProfileFormData } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface PersonalInfoCardProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
}

export function PersonalInfoCard({ profile, setProfile }: PersonalInfoCardProps) {
  const [saving, setSaving] = useState(false);
  const { handleRefreshProfile } = useAuth();

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

  return (
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
  );
}
