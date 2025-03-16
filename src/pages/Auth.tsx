
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/lib/auth";
import { debugSupabaseInfo } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";

// Define schema for the login form
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, user, isOnboarded, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Debug auth state on each render
  console.log("Auth page render - Debug Supabase info:", debugSupabaseInfo);
  console.log("Auth page render - Auth state:", { 
    user, 
    isOnboarded, 
    authLoading, 
    isLoading 
  });
  
  // Check Supabase session directly
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Direct session check result:", !!data.session);
        
        if (data.session?.user) {
          console.log("Session exists, redirecting");
          handleRedirect(data.session.user, isOnboarded);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, []);
  
  // Redirect if user is authenticated
  useEffect(() => {
    if (user) {
      console.log("User authenticated in useEffect, redirecting", user);
      handleRedirect(user, isOnboarded);
    }
  }, [user, isOnboarded, navigate]);
  
  // Function to handle redirect logic
  const handleRedirect = (user: any, onboarded: boolean) => {
    // Determine redirect path
    const redirectTo = !onboarded ? '/onboarding' : (sessionStorage.getItem('redirectUrl') || '/dashboard');
    console.log(`Redirecting to: ${redirectTo}`, { user, onboarded });
    
    // Clear redirect URL from storage
    sessionStorage.removeItem('redirectUrl');
    
    // Navigate to destination
    navigate(redirectTo, { replace: true });
  };

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (isLoading || authLoading) {
      console.log("Submit blocked - already loading");
      return; // Prevent multiple submissions
    }
    
    setIsLoading(true);
    setError("");
    
    console.log("Login attempt started with email:", values.email);
    
    try {
      await signIn(values.email, values.password);
      toast.success("Login successful!");
      
      // Check if we have a session immediately after signing in
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        console.log("Session available after login - redirecting", data.session.user);
        handleRedirect(data.session.user, isOnboarded);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
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
                {error && (
                  <div className="text-sm text-red-500 dark:text-red-400">
                    {error}
                  </div>
                )}
                <Button disabled={isLoading || authLoading} type="submit" className="w-full">
                  {isLoading || authLoading ? (
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
            <Button variant="link" onClick={() => navigate("/signup")}>
              Don't have an account? Sign up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
