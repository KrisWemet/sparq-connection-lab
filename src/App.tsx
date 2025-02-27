import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Messaging from "./pages/Messaging";
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
import Admin from "./pages/Admin";
import TestPage from "./pages/TestPage";

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
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/auth" element={<Auth />} />
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
                        <Messaging />
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
                    
                    {/* Admin route */}
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly={true}>
                        <Admin />
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
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
