import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
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
import { profileService, UserProfile } from "@/services/supabaseService"; // Import service and type

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth(); // Get profile and user
  const [isSaving, setIsSaving] = useState(false);

  // Local state for form fields, initialized from profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sexualPreference, setSexualPreference] = useState("prefer-not-to-say");
  const [relationshipStructure, setRelationshipStructure] = useState("monogamous");

  // Partner info (assuming fetched separately or part of profile)
  const [partnerName, setPartnerName] = useState("Partner"); // Placeholder

  // Inside the Profile component, add this helper function at the top
  const extractName = (nameStr: string) => {
    // Check if the string is in JSON format
    if (nameStr && nameStr.includes('{') && nameStr.includes('}')) {
      try {
        const parsed = JSON.parse(nameStr);
        return parsed.fullName || '';
      } catch (e) {
        // If parsing fails, try to extract the name using regex
        const match = nameStr.match(/"fullName"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    // If not JSON or parsing failed, return the name as is
    return nameStr;
  };

  // Modify the useEffect to extract the name properly
  useEffect(() => {
    if (profile) {
      const displayName = extractName(profile.username || '');
      setName(displayName);
      setEmail(profile.email || '');
      // Set phone number if it exists
      setPhoneNumber(profile.phoneNumber || '');
      // Assuming 'gender' field stores sexual preference for now - needs verification
      setSexualPreference(profile.gender || "prefer-not-to-say");
      setRelationshipStructure(profile.relationshipType || "monogamous");
      // Set anniversary date if it exists
      setAnniversary(profile.anniversaryDate || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) {
      toast.error("Profile data not loaded yet.");
      return;
    }
    setIsSaving(true);
    try {
      // Update name, anniversary date, and phone number
      await profileService.updateProfile({
        name: name, // This will now be the clean name
        anniversary_date: anniversary || null,
        phone_number: phoneNumber || null
      });
      toast.success("Profile updated successfully!");
      
      // Force refresh the profile to see immediate changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsSaving(true); // Use saving state for logout as well
    try {
      await signOut();
      toast.success("Logged out successfully!");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Display loading indicator while auth/profile is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle case where user is not logged in (shouldn't happen if protected route)
  if (!user) {
     navigate("/auth"); // Redirect if not logged in
     return null;
  }

  // Modify getInitials to handle potential JSON format
  const getInitials = (nameStr: string) => {
    const cleanName = extractName(nameStr);
    return cleanName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">
            Profile
          </h1>
          {/* Placeholder for potential edit/save button in header */}
          <div className="w-8"></div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            {/* Use profile.avatarUrl if available */}
            <AvatarImage src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          {profile?.partnerId && <p className="text-gray-500">Connected with {partnerName}</p>}
          {/* Add logic to calculate years together based on anniversary */}
          {/* <div className="flex items-center gap-2 mt-2">
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Together for X years</span>
            </div>
          </div> */}
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account" disabled={isSaving}>Account</TabsTrigger>
            <TabsTrigger value="preferences" disabled={isSaving}>Preferences</TabsTrigger>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    // Email changes usually require verification, disable direct editing
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                   <p className="text-xs text-gray-500">Email cannot be changed here.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (for SMS messaging)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 123 456 7890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500">Add your phone number to receive messages via SMS.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anniversary">Anniversary Date</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    disabled={isSaving} // Enable once DB field confirmed
                  />
                   {/* <p className="text-xs text-gray-500">Anniversary saving not implemented yet.</p> */}
                </div>
                <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partner Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.partnerId ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {/* Fetch partner avatar */}
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=random`} />
                        <AvatarFallback>{getInitials(partnerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{partnerName}</p>
                        {/* Add connection date logic */}
                        {/* <p className="text-xs text-gray-500">Connected since X</p> */}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled={isSaving}>
                      View
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>You are not connected with a partner yet.</p>
                    {/* Add button/link to invite partner */}
                    <Button variant="link" className="mt-2" onClick={() => navigate('/settings')} disabled={isSaving}>Connect Partner</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
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
                  {/* Clarify if 'gender' field is used for sexual orientation */}
                  <Label htmlFor="sexual-preference">Sexual Orientation (Gender Field)</Label>
                  <Select
                    value={sexualPreference}
                    onValueChange={setSexualPreference}
                    disabled={isSaving}
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
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      {/* Add other relevant options if needed */}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us personalize your experience. (Note: Currently saved to 'gender' field).
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Relationship Structure</Label>
                  <RadioGroup
                    value={relationshipStructure}
                    onValueChange={setRelationshipStructure}
                    className="grid gap-3"
                    disabled={isSaving}
                  >
                    {/* Options remain the same */}
                     <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="monogamous" id="monogamous-structure" className="mt-1" disabled={isSaving}/>
                      <div>
                        <Label htmlFor="monogamous-structure" className={`font-medium flex items-center ${isSaving ? 'cursor-not-allowed' : ''}`}>
                          <HeartHandshake className="w-4 h-4 mr-2 text-rose-500" />
                          Monogamous
                        </Label>
                        <p className="text-sm text-gray-500">Traditional one-on-one committed relationship</p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="polyamorous" id="polyamorous-structure" className="mt-1" disabled={isSaving}/>
                      <div>
                        <Label htmlFor="polyamorous-structure" className={`font-medium flex items-center ${isSaving ? 'cursor-not-allowed' : ''}`}>
                          <Users className="w-4 h-4 mr-2 text-violet-500" />
                          Polyamorous
                        </Label>
                        <p className="text-sm text-gray-500">Ethical non-monogamy with multiple relationships</p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="open" id="open-structure" className="mt-1" disabled={isSaving}/>
                      <div>
                        <Label htmlFor="open-structure" className={`font-medium flex items-center ${isSaving ? 'cursor-not-allowed' : ''}`}>
                          <Heart className="w-4 h-4 mr-2 text-indigo-500" />
                          Open Relationship
                        </Label>
                        <p className="text-sm text-gray-500">Primary partnership with agreed-upon outside connections</p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer hover:border-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="long-distance" id="long-distance-structure" className="mt-1" disabled={isSaving}/>
                      <div>
                        <Label htmlFor="long-distance-structure" className={`font-medium flex items-center ${isSaving ? 'cursor-not-allowed' : ''}`}>
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

                <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
                   {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification and Privacy sections remain unchanged for now */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ... Notification toggles ... */}
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