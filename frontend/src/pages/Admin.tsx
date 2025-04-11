import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Users, Database, Settings, Activity, Search } from "lucide-react";
import { isAdmin } from "@/lib/auth-utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [modifiedSettings, setModifiedSettings] = useState({
    enablePremiumFeatures: true,
    enableUserRegistration: true,
    enablePartnerInvites: true,
    maintenanceMode: false,
    debugMode: false
  });
  
  // Sample data for demonstration
  const sampleUsers = [
    { id: "user1", email: "john@example.com", name: "John Doe", role: "user", created: "2023-05-15" },
    { id: "user2", email: "jane@example.com", name: "Jane Smith", role: "user", created: "2023-06-22" },
    { id: "user3", email: "admin@example.com", name: "Admin User", role: "admin", created: "2023-04-10" },
    { id: "user4", email: "sara@example.com", name: "Sara Johnson", role: "user", created: "2023-07-03" },
    { id: "user5", email: "mike@example.com", name: "Mike Wilson", role: "user", created: "2023-08-17" },
  ];
  
  const sampleAnalytics = {
    totalUsers: 356,
    activeUsers: 127,
    premiumUsers: 42,
    averageDailyLogins: 78,
    popularFeatures: [
      { name: "Daily Questions", usage: 84 },
      { name: "Path to Together", usage: 67 },
      { name: "Date Ideas", usage: 53 },
      { name: "AI Therapist", usage: 41 },
      { name: "Goals", usage: 39 },
    ]
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        const adminStatus = await isAdmin();
        
        if (!adminStatus) {
          toast.error("You don't have permission to access the admin area");
          navigate("/dashboard");
          return;
        }
        
        setAuthorized(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Authentication error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [navigate]);
  
  const handleSaveSettings = () => {
    // This would save settings to the database in a real implementation
    toast.success("Settings saved successfully");
  };
  
  const filteredUsers = sampleUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading admin panel...</p>
      </div>
    );
  }
  
  if (!authorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 ml-2">
            Admin Dashboard
          </h1>
          <div className="ml-auto">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Admin Mode
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-3">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all users in the system
                </CardDescription>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b p-3 font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Created</div>
                  </div>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div key={user.id} className="grid grid-cols-4 p-3 border-b last:border-b-0 hover:bg-gray-50">
                        <div>{user.name}</div>
                        <div>{user.email}</div>
                        <div>
                          <Badge variant={user.role === "admin" ? "default" : "outline"}>
                            {user.role}
                          </Badge>
                        </div>
                        <div>{user.created}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No users found matching your search criteria
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Export User Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  User statistics and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sampleAnalytics.totalUsers}</div>
                      <div className="text-sm text-gray-500 mt-1">Total Users</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sampleAnalytics.activeUsers}</div>
                      <div className="text-sm text-gray-500 mt-1">Active Users</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sampleAnalytics.premiumUsers}</div>
                      <div className="text-sm text-gray-500 mt-1">Premium Users</div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>
                  Manage application data and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-6 text-gray-600">
                  Database management features would be implemented here in the production version.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure global application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="premium-features">Enable Premium Features</Label>
                    <p className="text-sm text-gray-500">Allow access to premium features for subscribers</p>
                  </div>
                  <Switch 
                    id="premium-features" 
                    checked={modifiedSettings.enablePremiumFeatures}
                    onCheckedChange={(checked) => setModifiedSettings({...modifiedSettings, enablePremiumFeatures: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="user-registration">Enable User Registration</Label>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <Switch 
                    id="user-registration" 
                    checked={modifiedSettings.enableUserRegistration}
                    onCheckedChange={(checked) => setModifiedSettings({...modifiedSettings, enableUserRegistration: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="partner-invites">Enable Partner Invites</Label>
                    <p className="text-sm text-gray-500">Allow users to invite partners</p>
                  </div>
                  <Switch 
                    id="partner-invites" 
                    checked={modifiedSettings.enablePartnerInvites}
                    onCheckedChange={(checked) => setModifiedSettings({...modifiedSettings, enablePartnerInvites: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={modifiedSettings.maintenanceMode}
                    onCheckedChange={(checked) => setModifiedSettings({...modifiedSettings, maintenanceMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable detailed error logging</p>
                  </div>
                  <Switch 
                    id="debug-mode" 
                    checked={modifiedSettings.debugMode}
                    onCheckedChange={(checked) => setModifiedSettings({...modifiedSettings, debugMode: checked})}
                  />
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="announcement">System Announcement</Label>
                  <Textarea 
                    id="announcement" 
                    placeholder="Enter a system-wide announcement message"
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Import Badge for the admin badge
import { Badge } from "@/components/ui/badge"; 