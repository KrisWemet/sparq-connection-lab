import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, User, Heart, Calendar, Bell, Shield, LogOut, Users, HeartHandshake, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, ProfileFormData } from "@/types/profile";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile: authProfile, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      console.log("Saving profile:", profile);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          updated_at: new Date().toISOString(),
          ...profile,
          isOnboarded: true
        });

      if (error) throw error;
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

  if ((loading && !authProfile) || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-500">Loading your profile...</p>
          <p className="text-xs text-gray-400 mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">
            Profile
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
          {profile.partner_name && (
            <p className="text-gray-500">Connected with {profile.partner_name}</p>
          )}
          {profile.anniversary_date && (
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Together since {new Date(profile.anniversary_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6 mt-0">
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
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6 mt-0">
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
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}
