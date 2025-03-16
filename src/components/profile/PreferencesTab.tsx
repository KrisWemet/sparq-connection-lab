
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Calendar, Heart, HeartHandshake, Shield, Users, Zap, Loader2 } from "lucide-react";
import { ProfileFormData } from "@/types/profile";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface PreferencesTabProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
}

export function PreferencesTab({ profile, setProfile }: PreferencesTabProps) {
  const [saving, setSaving] = useState(false);
  const { handleRefreshProfile } = useAuth();

  const handleSaveProfile = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    try {
      setSaving(true);
      console.log("Saving profile preferences:", profile);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.data.user.id,
          user_id: user.data.user.id,
          updated_at: new Date().toISOString(),
          sexual_orientation: profile.sexual_orientation,
          relationship_structure: profile.relationship_structure,
          isOnboarded: true
        });

      if (error) throw error;
      
      // Refresh profile data in auth context
      if (handleRefreshProfile) {
        await handleRefreshProfile();
        console.log("Profile preferences refreshed successfully after save");
      }
      
      toast.success("Preferences updated successfully!");
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relationship Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="sexual-preference">Sexual Orientation</Label>
            <Select 
              value={profile.sexual_orientation} 
              onValueChange={(value) => setProfile({ ...profile, sexual_orientation: value })}
            >
              <SelectTrigger id="sexual-preference">
                <SelectValue placeholder="Select your sexual orientation" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="gay">Gay</SelectItem>
                <SelectItem value="lesbian">Lesbian</SelectItem>
                <SelectItem value="bisexual">Bisexual</SelectItem>
                <SelectItem value="questioning">Questioning/not sure</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              This helps us personalize your experience and provide relevant content.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Relationship Structure</Label>
            <RadioGroup 
              value={profile.relationship_structure} 
              onValueChange={(value) => setProfile({ ...profile, relationship_structure: value })}
              className="grid gap-3"
            >
              <div className="flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="monogamous" id="monogamous-structure" className="mt-1" />
                <div>
                  <Label htmlFor="monogamous-structure" className="font-medium flex items-center">
                    <HeartHandshake className="w-4 h-4 mr-2 text-rose-500" />
                    Monogamous
                  </Label>
                  <p className="text-sm text-gray-500">Traditional one-on-one committed relationship</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="polyamorous" id="polyamorous-structure" className="mt-1" />
                <div>
                  <Label htmlFor="polyamorous-structure" className="font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-violet-500" />
                    Polyamorous
                  </Label>
                  <p className="text-sm text-gray-500">Ethical non-monogamy with multiple relationships</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="open" id="open-structure" className="mt-1" />
                <div>
                  <Label htmlFor="open-structure" className="font-medium flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-indigo-500" />
                    Open Relationship
                  </Label>
                  <p className="text-sm text-gray-500">Primary partnership with agreed-upon outside connections</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="long-distance" id="long-distance-structure" className="mt-1" />
                <div>
                  <Label htmlFor="long-distance-structure" className="font-medium flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-cyan-500" />
                    Long Distance
                  </Label>
                  <p className="text-sm text-gray-500">Maintaining connection across physical distance</p>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500 mt-1">
              You can update this as your relationship evolves.
            </p>
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
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Daily Reminders</p>
                <p className="text-sm text-gray-500">Get reminders for daily activities</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked id="toggle-1" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Special Dates</p>
                <p className="text-sm text-gray-500">Reminders for anniversaries and birthdays</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked id="toggle-2" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Partner Activity</p>
                <p className="text-sm text-gray-500">Get notified when your partner completes activities</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked id="toggle-3" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Data Sharing</p>
                <p className="text-sm text-gray-500">Share activity data with your partner</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked id="toggle-4" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
