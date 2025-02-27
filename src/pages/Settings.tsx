import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { useSubscription } from "@/lib/subscription-provider";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  Trash2, 
  Settings,
  HelpCircle,
  Languages,
  Vibrate,
  Fingerprint
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { colorThemes } from "@/pages/Dashboard";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { subscription, isFeatureAvailable } = useSubscription();
  const { signOut } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [userTheme, setUserTheme] = useState("azure");
  const [colors, setColors] = useState({
    background: "#ffffff",
    foreground: "#000000",
    primary: "#007bff",
    secondary: "#6c757d",
    accent: "#6c757d",
    accentForeground: "#ffffff",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    popover: "#ffffff",
    popoverForeground: "#000000",
    card: "#ffffff",
    cardForeground: "#000000",
    border: "#e5e7eb",
    input: "#ffffff",
    inputForeground: "#000000",
    ring: "#007bff",
    radius: "0.5rem"
  });
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };
  
  const handleDeleteAccount = () => {
    toast("Account deletion requested", {
      description: "We've sent a confirmation email with further instructions.",
    });
  };
  
  const handleLanguageChange = () => {
    toast("Language settings", {
      description: "This feature will be available in the next update.",
    });
  };
  
  const toggleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
    setDarkMode(!darkMode);
  };
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold mx-auto">
            Settings
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your account preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about activity and updates
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive relationship tips and app updates via email
                  </p>
                </div>
                <Switch 
                  id="email-updates" 
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="biometric">Biometric Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Use Face ID or fingerprint to secure your account
                  </p>
                </div>
                <Switch 
                  id="biometric" 
                  checked={biometricAuth}
                  onCheckedChange={setBiometricAuth}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="haptic">Haptic Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable vibration feedback for interactions
                  </p>
                </div>
                <Switch 
                  id="haptic" 
                  checked={hapticFeedback}
                  onCheckedChange={setHapticFeedback}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Change the display language
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLanguageChange}>
                  {language} <ChevronLeft className="w-4 h-4 ml-2 rotate-270" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <h3 className="text-base font-medium">Appearance</h3>
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Color Theme</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color theme</p>
                    </div>
                    <Select 
                      value={userTheme} 
                      onValueChange={(value) => {
                        setUserTheme(value);
                        toast.success(`Switched to ${value} color theme. Changes will fully apply on restart.`);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="azure">Azure (Blue)</SelectItem>
                        <SelectItem value="rose">Rose (Pink)</SelectItem>
                        <SelectItem value="indigo">Indigo (Purple)</SelectItem>
                        <SelectItem value="rainbow">Rainbow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Privacy & Security</CardTitle>
              </div>
              <CardDescription>
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info("Privacy policy will open in a new window")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info("Terms of service will open in a new window")}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </CardContent>
          </Card>
          
          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan: {subscription.name}</CardTitle>
              <CardDescription>
                {subscription.tier === "free" 
                  ? "Upgrade to unlock premium features" 
                  : `Your subscription expires on ${subscription.expiresAt?.toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/subscription")} 
                variant={subscription.tier === "free" ? "default" : "outline"}
                className="w-full"
              >
                {subscription.tier === "free" ? "Upgrade Now" : "Manage Subscription"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account data and sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Account deletion will permanently remove all your data after a 30-day grace period.
            </CardFooter>
          </Card>
          
          <div className="text-center text-xs text-muted-foreground py-4">
            Sparq Connect v1.0.0
            <br />
            © 2023 Sparq Connect. All rights reserved.
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 