import { useState } from "react";
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
import { ChevronLeft, User, Heart, Calendar, Bell, Shield, LogOut, Users, HeartHandshake, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [name, setName] = useState("Chris Smith");
  const [email, setEmail] = useState("chris@example.com");
  const [partnerName, setPartnerName] = useState("Alex Johnson");
  const [anniversary, setAnniversary] = useState("2020-06-15");
  const [sexualPreference, setSexualPreference] = useState("straight");
  const [relationshipStructure, setRelationshipStructure] = useState("monogamous");
  
  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
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
            <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=256&h=256" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <p className="text-gray-500">Connected with {partnerName}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Together for 3 years</span>
            </div>
          </div>
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
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anniversary">Anniversary Date</Label>
                  <Input 
                    id="anniversary" 
                    type="date" 
                    value={anniversary} 
                    onChange={(e) => setAnniversary(e.target.value)} 
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partner Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" />
                      <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{partnerName}</p>
                      <p className="text-xs text-gray-500">Connected since June 2020</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
            
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
                    value={sexualPreference} 
                    onValueChange={setSexualPreference}
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
                    value={relationshipStructure} 
                    onValueChange={setRelationshipStructure}
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
                
                <Button onClick={handleSaveProfile} className="w-full">
                  Save Preferences
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