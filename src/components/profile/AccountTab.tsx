
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { ProfileFormData } from "@/types/profile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface AccountTabProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
}

export function AccountTab({ profile, setProfile }: AccountTabProps) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { signOut, handleRefreshProfile } = useAuth();

  const handleSaveProfile = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    try {
      setSaving(true);
      console.log("Saving profile:", profile);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.data.user.id,
          user_id: user.data.user.id,
          updated_at: new Date().toISOString(),
          full_name: profile.full_name,
          email: profile.email,
          partner_name: profile.partner_name,
          anniversary_date: profile.anniversary_date,
          sexual_orientation: profile.sexual_orientation,
          relationship_structure: profile.relationship_structure,
          avatar_url: profile.avatar_url,
          isOnboarded: true
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

  return (
    <div className="space-y-6 mt-0">
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
              value={profile.partner_name} 
              onChange={(e) => setProfile({ ...profile, partner_name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary">Anniversary Date</Label>
            <Input 
              id="anniversary" 
              type="date" 
              value={profile.anniversary_date} 
              onChange={(e) => setProfile({ ...profile, anniversary_date: e.target.value })} 
            />
          </div>
          <Button 
            onClick={handleSaveProfile} 
            className="w-full"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
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
                <Avatar>
                  <AvatarFallback>{profile.partner_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.partner_name}</p>
                  {profile.anniversary_date && (
                    <p className="text-xs text-gray-500">
                      Connected since {new Date(profile.anniversary_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
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
