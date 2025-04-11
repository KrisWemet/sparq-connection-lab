import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-provider";
import { supabase } from "@/integrations/supabase/client";

// Define schemas for the forms
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const signupSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  relationshipType: z.enum(["monogamous", "polyamorous", "open", "long-distance"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [error, setError] = useState<string>("");

  // Helper function to clear any existing session
  const clearExistingSession = async () => {
    console.log("Clearing any existing auth session");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error clearing session:", error);
      } else {
        console.log("Session cleared successfully");
      }
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  };

  // Set the active tab based on the URL path
  useEffect(() => {
    // If we're on /signup, activate the signup tab
    if (window.location.pathname === '/signup') {
      setActiveTab("signup");
    } else if (window.location.search.includes('mode=signup')) {
      setActiveTab("signup");
    } else if (window.location.search.includes('mode=login')) {
      setActiveTab("login");
    }
    console.log("Auth page loaded with tab:", window.location.pathname === '/signup' ? 'signup' : activeTab);
  }, []);
  
  // Check if user is already authenticated
  useEffect(() => {
    // Only redirect if both user and profile exist
    if (user && profile) {
      console.log("Auth useEffect: User and profile exist, redirecting to dashboard");
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      navigate(redirectUrl);
      sessionStorage.removeItem('redirectUrl');
    } else if (user) {
      console.log("Auth useEffect: User exists but no profile, staying on signup page");
      console.log("User exists in supabase auth but not in profiles table");
      setActiveTab("signup");
    }
  }, [user, profile, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "prefer-not-to-say",
      relationshipType: "monogamous",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      console.log("Beginning sign in...");
      await signIn(values.email, values.password);
      console.log("Sign in completed, current pathname:", window.location.pathname);
      
      // The auth provider will handle navigation if there's no profile
      // Only navigate programmatically if we have a profile
      if (window.location.pathname.includes('/auth') || window.location.pathname.includes('/login')) {
        console.log("Still on auth page, profile likely exists, redirecting...");
        const redirectTo = sessionStorage.getItem("redirectUrl") || "/dashboard";
        console.log("Redirecting to:", redirectTo);
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectTo);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct signup logic for better error handling
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    console.log("Starting direct signup with values:", values);
    setIsLoading(true);
    setError("");

    try {
      // Clear any existing session first
      // await clearExistingSession();
      
      // First check if we can find the email in the profiles table
      console.log("Checking if email exists in profiles table:", values.email);
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email);
        
      if (profileCheckError) {
        console.error("Error checking profiles:", profileCheckError);
      } else {
        console.log("Profile check results:", existingProfiles);
        if (existingProfiles && existingProfiles.length > 0) {
          console.log("Email found in profiles table");
        } else {
          console.log("Email NOT found in profiles table");
        }
      }
      
      console.log("Attempting direct signup with Supabase...");
      // Try signup first
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.log("Signup error:", error);
        // If user already exists, try to sign in instead
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          console.log("User already exists, trying to sign in instead...");
          
          // Save email for onboarding if needed
          localStorage.setItem('user_email', values.email);
          
          // EMERGENCY FIX: Force delete user if "force_new_account" flag is set
          const forceNewAccount = localStorage.getItem('force_new_account') === 'true';
          if (forceNewAccount) {
            console.log("EMERGENCY MODE: Attempting to bypass existing account");
            localStorage.removeItem('force_new_account');
            
            // Instead of deleting, try to sign in and force create a new profile
            try {
              // Try to sign in with provided credentials
              const { data: emergencySignIn, error: emergencySignInError } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
              });
              
              if (emergencySignInError) {
                console.error("Emergency sign-in failed:", emergencySignInError);
                toast.error("Could not sign in with provided credentials. Try a different password or contact support.");
                setIsLoading(false);
                return;
              }
              
              if (emergencySignIn?.user) {
                console.log("Emergency sign-in successful, creating/updating profile");
                
                // Ensure relationship_type is compatible with database schema
                let relationshipType = values.relationshipType;
                if (relationshipType === "open") {
                  relationshipType = "polyamorous";
                }
                
                // Force update or create profile
                const profileData = {
                  id: emergencySignIn.user.id,
                  email: values.email,
                  full_name: values.fullName,
                  name: values.fullName,
                  username: values.fullName.toLowerCase().replace(/\s+/g, '.'),
                  gender: values.gender,
                  relationship_type: relationshipType,
                  is_onboarded: false,
                  updated_at: new Date().toISOString()
                };
                
                // Try upsert - insert if not exists, update if exists
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert(profileData, { onConflict: 'id' });
                  
                if (upsertError) {
                  console.error("Failed to upsert profile:", upsertError);
                  toast.error("Failed to create profile. Please try again.");
                  setIsLoading(false);
                  return;
                } else {
                  console.log("Emergency profile upsert successful");
                }
                
                // Continue to onboarding
                localStorage.setItem('just_signed_up', 'true');
                localStorage.setItem('user_email', values.email);
                navigate("/onboarding");
                return;
              }
            } catch (emergencyError) {
              console.error("Emergency process failed:", emergencyError);
              toast.error("Emergency account creation failed. Please try again later.");
              setIsLoading(false);
              return;
            }
          }
          
          // Regular flow: Try to sign in directly
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

          if (signInError) {
            console.log("Sign in error:", signInError);
            toast.error("Invalid credentials. Please check your email and password.");
            setIsLoading(false);
            return;
          }

          // Sign in successful
          console.log("Sign in successful:", signInData);
          
          // Flag that this is a direct sign-in for onboarding component
          localStorage.setItem('just_signed_up', 'true');
          localStorage.setItem('user_email', values.email);
          
          // Check if profile exists before redirecting
          console.log("Checking if profile exists after sign-in...");
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            // Redirect to onboarding if profile fetch fails
            console.log("Redirecting to onboarding (profile fetch failed)...");
            navigate("/onboarding");
            return;
          }

          if (profileData) {
            // Redirect to dashboard if profile exists
            console.log("Profile exists, redirecting to dashboard...");
            navigate("/dashboard");
            return;
          } else {
            // Redirect to onboarding if profile does not exist
            console.log("Profile does not exist, redirecting to onboarding...");
            navigate("/onboarding");
            return;
          }
        }
        
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // New user created successfully
      console.log("Signup successful, new user created:", data);
      
      // For new users, let's create a profile immediately
      if (data.user) {
        console.log("Creating profile for new user:", data.user.id);
        
        // Ensure relationship_type is compatible with database schema
        let relationshipType = values.relationshipType;
        if (relationshipType === "open") {
          // Map "open" to a valid database type
          relationshipType = "polyamorous";
        }
        
        const newProfile = {
          id: data.user.id,
          email: values.email,
          full_name: values.fullName,
          name: values.fullName,
          username: values.fullName.toLowerCase().replace(/\s+/g, '.'),
          gender: values.gender,
          relationship_type: relationshipType,
          is_onboarded: false
        };
        
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (profileError) {
            console.error("Error creating profile for new user:", profileError);
            toast.error("Account created but profile setup failed. Please try continuing to onboarding.");
            // Continue anyway - we'll handle it in onboarding
          } else {
            console.log("Profile created successfully for new user");
            toast.success("Account created successfully!");
          }
        } catch (profileInsertError) {
          console.error("Exception during profile creation:", profileInsertError);
          toast.error("Account created but profile setup encountered an error.");
        }
      }
      
      localStorage.setItem('just_signed_up', 'true');
      localStorage.setItem('user_email', values.email);
      
      // Redirect to onboarding using React Router navigate instead of window.location
      console.log("Redirecting to onboarding page...");
      navigate("/onboarding");
      
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center px-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Sparq Connect</h1>
          <p className="text-muted-foreground mt-2">Strengthen your relationship with meaningful goals</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button disabled={isLoading} type="submit" className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" onClick={() => setActiveTab("signup")}>
                  Don't have an account? Sign up
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="relationshipType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monogamous">Monogamous</SelectItem>
                                <SelectItem value="polyamorous">Polyamorous</SelectItem>
                                <SelectItem value="open">Open Relationship</SelectItem>
                                <SelectItem value="long-distance">Long Distance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button disabled={isLoading} type="submit" className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" onClick={() => setActiveTab("login")}>
                  Already have an account? Login
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 