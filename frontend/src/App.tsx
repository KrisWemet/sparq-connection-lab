import React, { useEffect } from "react";
import { clearCache } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/lib/theme-provider";
import { SubscriptionProvider } from "@/lib/subscription-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedRoute } from "@/components/ui/protected-route";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Journeys from "./pages/Journeys";
import NotFound from "./pages/NotFound";
import DailyActivity from "./pages/DailyActivity";

// New page imports
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import DateIdeas from "./pages/DateIdeas";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import DailyQuestions from "./pages/DailyQuestions";
import RelationshipType from "./pages/RelationshipType";
import AITherapist from "./pages/AITherapist";
import PathToTogether from "./pages/PathToTogether";
import JourneyDetails from "./pages/JourneyDetails";
import JourneyStart from "./pages/JourneyStart";
import JourneyDay from "./pages/JourneyDay";
import JourneyComplete from "./pages/JourneyComplete";
import Admin from "./pages/Admin";
import TestPage from "./pages/TestPage";
import SharedPlanner from "./pages/SharedPlanner";
import PartnerInvite from "./pages/PartnerInvite"; // Import the partner invite page
import TestDailyQuestion from "./pages/TestDailyQuestion"; // Import our test page

console.log("App component loaded");

// Create a client outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  useEffect(() => {
    //clearCache();
  }, []);
  console.log("App component rendering");

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <SubscriptionProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/test" element={<TestPage />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/signup" element={<Auth />} />
                      <Route path="/onboarding" element={
                        <ProtectedRoute>
                          <Onboarding />
                        </ProtectedRoute>
                      } />

                      {/* Protected Routes */}
                      <Route path="/quiz" element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      } />
                      <Route path="/journeys" element={
                        <ProtectedRoute>
                          <Journeys />
                        </ProtectedRoute>
                      } />
                      <Route path="/daily-activity" element={
                        <ProtectedRoute>
                          <DailyActivity />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/messaging" element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } />
                      <Route path="/date-ideas" element={
                        <ProtectedRoute>
                          <DateIdeas />
                        </ProtectedRoute>
                      } />
                      <Route path="/goals" element={
                        <ProtectedRoute>
                          <Goals />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscription" element={
                        <ProtectedRoute>
                          <Subscription />
                        </ProtectedRoute>
                      } />
                      <Route path="/daily-questions" element={
                        <ProtectedRoute>
                          <DailyQuestions />
                        </ProtectedRoute>
                      } />
                      <Route path="/relationship-types/:type" element={
                        <ProtectedRoute>
                          <RelationshipType />
                        </ProtectedRoute>
                      } />
                      <Route path="/ai-therapist" element={
                        <ProtectedRoute>
                          <AITherapist />
                        </ProtectedRoute>
                      } />
                      <Route path="/path-to-together" element={
                        <ProtectedRoute>
                          <PathToTogether />
                        </ProtectedRoute>
                      } />

                      {/* Path to Together Journey routes */}
                      <Route path="/journey/:journeyId" element={
                        <ProtectedRoute>
                          <JourneyDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="/journey/:journeyId/start" element={
                        <ProtectedRoute>
                          <JourneyStart />
                        </ProtectedRoute>
                      } />
                      <Route path="/journey/:journeyId/day/:dayId" element={
                        <ProtectedRoute>
                          <JourneyDay />
                        </ProtectedRoute>
                      } />
                      <Route path="/journey/:journeyId/complete" element={
                        <ProtectedRoute>
                          <JourneyComplete />
                        </ProtectedRoute>
                      } />
                      <Route path="/shared-planner" element={ // Add the new route
                        <ProtectedRoute>
                          <SharedPlanner />
                        </ProtectedRoute>
                      } />

                      {/* Admin route */}
                      <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                          <Admin />
                        </ProtectedRoute>
                      } />

                      {/* Partner invite routes */}
                      <Route path="/partner-invite" element={
                        <ProtectedRoute>
                          <PartnerInvite />
                        </ProtectedRoute>
                      } />
                      <Route path="/accept-invite" element={
                        <ProtectedRoute>
                          <PartnerInvite />
                        </ProtectedRoute>
                      } />

                      {/* Test routes */}
                      <Route path="/test-daily-question" element={
                        <ProtectedRoute>
                          <TestDailyQuestion />
                        </ProtectedRoute>
                      } />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
              </TooltipProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
